import { useEffect, useRef } from "react";
export default function useIdleTimer({ timeout, onIdle, onActive, enabled = true }) {
  const timer = useRef(null);
  const lastActivity = useRef(Date.now());
  const lastActiveCallRef = useRef(0);
  // Throttle onActive calls to prevent excessive API calls - only call once every 2 minutes
  const ACTIVE_CALL_THROTTLE = 2 * 60 * 1000; // 2 minutes

  const resetTimer = () => {
    if (!enabled) return;

    const now = Date.now();
    const inactiveTime = now - lastActivity.current;

    if (inactiveTime > timeout) {
      onIdle && onIdle();
    } else {
      // Only call onActive if enough time has passed since last call (throttling)
      // This prevents excessive API calls on every mouse movement/click
      if (onActive && (now - lastActiveCallRef.current) >= ACTIVE_CALL_THROTTLE) {
        lastActiveCallRef.current = now;
        onActive();
      }
    }

    lastActivity.current = now;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (enabled) {
        onIdle && onIdle();
      }
    }, timeout);
  };

  useEffect(() => {
    if (!enabled) {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      return;
    }

    const events = ["click", "mousemove", "keypress", "scroll", "touchstart"];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, timeout]);

  return null;
}