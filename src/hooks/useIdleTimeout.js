// src/hooks/useIdleTimeout.js
import { useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

/**
 * Automatically logs out the user after a set period of inactivity.
 * @param {number} timeoutMinutes - How many minutes until auto-logout (Default: 15)
 */
export const useIdleTimeout = (timeoutMinutes = 15) => {
  const auth = getAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const logoutUser = async () => {
      if (auth.currentUser) {
        console.log('Sesión expirada por inactividad.');
        await signOut(auth);
        navigate('/login'); // Redirect to your login page
      }
    };

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Convert minutes to milliseconds
      timeoutRef.current = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
    };

    // Events that indicate the user is active
    const activeEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    // Start the timer when the hook loads
    resetTimer();

    // Attach listeners to reset the timer on activity
    const handleActivity = () => resetTimer();
    activeEvents.forEach(event => window.addEventListener(event, handleActivity));

    // Cleanup listeners when the component unmounts
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activeEvents.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [timeoutMinutes, navigate, auth]);
};