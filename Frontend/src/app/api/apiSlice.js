/**
 * PGIMER EMRS - API Slice Configuration
 * 
 * This is the base RTK Query API slice that:
 * 1. Connects to the Microservices Gateway (Port 5000)
 * 2. Handles automatic token refresh on 401 errors
 * 3. Manages cache tags for all microservices
 * 
 * Backend Architecture:
 * - Gateway Server: Port 5000 (http://localhost:5000)
 * - user: Port 3001
 * - out-patients-card-and-out-patient-record: Port 3002
 * - adult-walk-in-clinical-performa: Port 3003
 * - out-patient-intake-record: Port 3004
 * - prescription: Port 3005
 * 
 * All API calls go through the gateway which proxies to the appropriate service.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Base Query Configuration
 * 
 * Gateway URL: http://localhost:5000/api
 * All requests are routed through the gateway which handles:
 * - Authentication token validation
 * - Request routing to appropriate microservice
 * - Response aggregation
 */
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  credentials: 'include', // Include cookies for refresh tokens
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * Base Query with Automatic Token Refresh
 * 
 * Handles 401 Unauthorized errors by automatically refreshing the access token.
 * 
 * Flow:
 * 1. If request returns 401, check if it's a session expiration or login endpoint
 * 2. If not, attempt to refresh token using refresh token from cookie
 * 3. If refresh succeeds, retry original request with new access token
 * 4. If refresh fails, logout user
 * 
 * Note: Activity is NOT updated during automatic refresh to prevent:
 * - Sessions from never expiring
 * - Excessive API calls
 * - Backend checks inactivity on refresh and expires if idle for 2+ minutes
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If access token expired, try to refresh it
  if (result?.error?.status === 401) {
    // Check if it's a token expiration error
    const errorMessage = result?.error?.data?.message || '';
    
    // Don't try to refresh if it's a session expired error or login endpoint
    if (
      errorMessage.includes('Session expired') ||
      errorMessage.includes('SESSION_EXPIRED') ||
      args.url?.includes('/login') ||
      args.url?.includes('/sessions/refresh') ||
      args.url?.includes('/session/refresh') // Legacy route
    ) {
      // Session expired or refresh failed, logout user
      api.dispatch({ type: 'auth/logout' });
      return result;
    }

    // DO NOT update activity here - activity should only be updated when user actually interacts
    // Updating activity here would prevent sessions from expiring and cause excessive API calls
    // The backend will check inactivity on token refresh and expire if user has been idle for 2+ minutes

    // Try to refresh the token
    // Gateway Route: /api/session/refresh → user (Port 3001)
    // User-service endpoint: POST /api/session/refresh
    const refreshResult = await baseQuery(
      { url: '/session/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult?.data?.success && refreshResult?.data?.data?.accessToken) {
      // Store the new token - use updateToken to avoid unnecessary re-renders
      // This prevents form data from being cleared during automatic token refresh
      const newToken = refreshResult.data.data.accessToken;
      const state = api.getState();
      
      // Only update if token actually changed
      if (state.auth.token !== newToken) {
        api.dispatch({
          type: 'auth/updateToken',
          payload: newToken
        });
      }

      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

/**
 * RTK Query API Slice
 * 
 * This is the base API slice that all service-specific slices extend.
 * Endpoints are injected by service slices in features/services/
 * 
 * Gateway Routes (matching Backend-Microservices/server.js):
 * - /api/users → user (Port 3001)
 * - /api/sessions → user (Port 3001) - Patient visit sessions
 * - /api/session → user (Port 3001) - Auth sessions (refresh, logout, activity, info)
 * - /api/patients → out-patients-card-and-out-patient-record (Port 3002)
 * - /api/patient-cards → out-patients-card-and-out-patient-record (Port 3002)
 * - /api/patient-files → out-patients-card-and-out-patient-record (Port 3002)
 * - /api/out-patient-records → out-patients-card-and-out-patient-record (Port 3002)
 * - /api/clinical-proformas → adult-walk-in-clinical-performa (Port 3003)
 * - /api/clinical-options → adult-walk-in-clinical-performa (Port 3003)
 * - /api/outpatient-intake-records → out-patient-intake-record (Port 3004)
 * - /api/prescriptions → prescription (Port 3005)
 */
export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    // ============================================
    // User Service (user - Port 3001)
    // Gateway Routes: /api/users, /api/sessions, /api/session
    // ============================================
    'User',              // User management (CRUD operations) - user table
    'PatientVisit',      // Patient visit sessions - session management
    
    // ============================================
    // Patient Card and Record Service (out-patients-card-and-out-patient-record - Port 3002)
    // Gateway Routes: /api/patients, /api/patient-cards, /api/patient-files, /api/out-patient-records
    // ============================================
    'PatientCard',       // Patient cards - out_patients_card table
    'PatientRecord',     // Patient records - out_patient_record table
    'PatientFile',       // Patient file uploads - file_uploads table
    
    // ============================================
    // Clinical Performa Service (adult-walk-in-clinical-performa - Port 3003)
    // Gateway Routes: /api/clinical-proformas, /api/clinical-options
    // ============================================
    'Clinical',          // Clinical proformas - adult_walk_in_clinical_performa table
    'ClinicalOptions',   // Clinical options/dropdowns - dynamic options for forms
    
    // ============================================
    // Intake Record Service (out-patient-intake-record - Port 3004)
    // Gateway Routes: /api/outpatient-intake-records
    // ============================================
    'IntakeRecord',     // Intake records - out_patient_intake_record table
    
    // ============================================
    // Prescription Service (prescription - Port 3005)
    // Gateway Routes: /api/prescriptions
    // ============================================
    'Prescription',      // Prescriptions - prescription table
    
    // ============================================
    // Shared Tags (used across multiple services)
    // ============================================
    'Stats',             // Statistics and analytics (dashboard stats, file stats, etc.)
  ],
  // eslint-disable-next-line no-unused-vars
  endpoints: (builder) => ({}), // Endpoints are injected by service slices in features/services/
});