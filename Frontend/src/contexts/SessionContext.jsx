import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { logout, selectCurrentToken } from '../features/auth/authSlice';
import { useRefreshTokenMutation, useUpdateActivityMutation, useLogoutMutation } from '../features/auth/authApiSlice';

const SessionContext = createContext(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isUIFrozen, setIsUIFrozen] = useState(false);
  const [refreshToken] = useRefreshTokenMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [logoutMutation] = useLogoutMutation();

  // Handle session expiration
  const handleSessionExpired = useCallback(async () => {
    if (isSessionExpired) return; // Prevent multiple calls

    setIsSessionExpired(true);
    setIsUIFrozen(true);

    // Dispatch logout to clear Redux state
    dispatch(logout());
  }, [dispatch, isSessionExpired]);

  // Track last activity update time to avoid unnecessary session checks
  const lastActivityUpdateRef = useRef(Date.now());

  // Handle user becoming active again
  const handleActive = useCallback(async () => {
    if (!token) return;

    // Update activity timestamp immediately (optimistic update)
    lastActivityUpdateRef.current = Date.now();

    // Update activity on backend
    try {
      await updateActivity().unwrap();
      // Update timestamp again after successful API call
      lastActivityUpdateRef.current = Date.now();
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }, [token, updateActivity]);

  // Idle timer hook
  useIdleTimer({
    timeout: 15 * 60 * 1000, // 15 minutes
    onIdle: handleSessionExpired,
    onActive: handleActive,
    enabled: !!token && !isSessionExpired // Only enabled when logged in and session not expired
  });

  // Auto-refresh access token before it expires
  useEffect(() => {
    if (!token || isSessionExpired) return;

    // Refresh token every 4 minutes (before 5-minute expiry)
    const refreshInterval = setInterval(async () => {
      try {
        // CRITICAL: Update activity BEFORE refreshing token
        // This ensures backend sees recent activity (required for 10-second check)
        await updateActivity().catch(() => {
          // If activity update fails, still try to refresh
        });
        
        const result = await refreshToken().unwrap();
        if (result?.data?.accessToken) {
          // Update token in Redux store
          dispatch({
            type: 'auth/setCredentials',
            payload: {
              user: JSON.parse(localStorage.getItem('user')),
              token: result.data.accessToken
            }
          });
        }
      } catch (error) {
        // If refresh fails, session expired
        if (error?.data?.code === 'SESSION_EXPIRED') {
          handleSessionExpired();
        }
      }
    }, 4 * 60 * 1000); // Every 4 minutes

    return () => clearInterval(refreshInterval);
  }, [token, isSessionExpired, refreshToken, updateActivity, dispatch, handleSessionExpired]);

  // Update activity on mount and when token changes
  useEffect(() => {
    if (token && !isSessionExpired) {
      // Update activity and reset timestamp
      lastActivityUpdateRef.current = Date.now();
      updateActivity().catch(console.error);
    }
  }, [token, isSessionExpired, updateActivity]);

  // CRITICAL: Check session status every 12 seconds by attempting token refresh
  // This will fail if user has been idle for 10+ seconds (backend enforces 10-second limit)
  // This is the primary mechanism to detect and expire idle sessions
  useEffect(() => {
    if (!token || isSessionExpired) return;

    // Check session status every 12 seconds
    // If user has been idle for 10+ seconds, refresh will fail and session will expire
    const sessionCheckInterval = setInterval(async () => {
      // Only check if at least 10 seconds have passed since last activity update
      const timeSinceLastActivity = Date.now() - lastActivityUpdateRef.current;
      
      // If activity was updated recently (within last 8 seconds), skip the check
      // This prevents unnecessary checks when user is actively using the app
      if (timeSinceLastActivity < 8 * 1000) {
        return; // User is active, skip check
      }

      try {
        // Attempt to refresh token - this will fail if inactivity > 10 seconds
        const result = await refreshToken().unwrap();
        if (result?.data?.accessToken) {
          // Update token if refresh succeeds (user was active within 10 seconds)
          dispatch({
            type: 'auth/setCredentials',
            payload: {
              user: JSON.parse(localStorage.getItem('user')),
              token: result.data.accessToken
            }
          });
          // Update activity timestamp since refresh succeeded
          lastActivityUpdateRef.current = Date.now();
        }
      } catch (error) {
        // If refresh fails with SESSION_EXPIRED, user has been idle for 10+ seconds
        console.log('Token refresh failed:', error?.data?.message || error?.message);
        if (error?.data?.code === 'SESSION_EXPIRED' || 
            error?.data?.message?.includes('Session expired')) {
          console.log('Session expired due to inactivity (10+ seconds)');
          handleSessionExpired();
        }
      }
    }, 12 * 1000); // Check every 12 seconds

    return () => clearInterval(sessionCheckInterval);
  }, [token, isSessionExpired, refreshToken, dispatch, handleSessionExpired]);


  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      setIsSessionExpired(false);
      setIsUIFrozen(false);
    }
  }, [logoutMutation, dispatch]);

  // Restore session state after login (no longer using encryption)
  const restoreSessionState = useCallback(async () => {
    // State restoration removed - no longer saving encrypted state
    return null;
  }, []);

  const value = {
    isSessionExpired,
    isUIFrozen,
    setIsUIFrozen,
    handleLogout,
    restoreSessionState
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

