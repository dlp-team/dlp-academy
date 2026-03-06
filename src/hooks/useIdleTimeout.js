// src/hooks/useIdleTimeout.js
import { useCallback, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';

/**
 * Automatically logs out the user after a set period of inactivity.
 * @param {number} timeoutMinutes - How many minutes until auto-logout (Default: 15)
 */
export const useIdleTimeout = (timeoutMinutes = 15) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const logoutUser = useCallback(async () => {
    if (!auth.currentUser) return;

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out after inactivity:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
  }, [logoutUser, timeoutMinutes]);

  useEffect(() => {
    const activeEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    resetTimer();

    activeEvents.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      activeEvents.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [resetTimer]);
};