// src/components/ui/CustomScrollbar.tsx
import React, { useEffect } from 'react';

/**
 * CustomScrollbar applies a global elegant scrollbar style to the entire app.
 * It adds a class to html/body on mount and removes it on unmount.
 * Usage: Place <CustomScrollbar /> at the root of App.tsx.
 */
const CustomScrollbar = () => {
  useEffect(() => {
    document.documentElement.classList.add('custom-scrollbar-active');
    document.body.classList.add('custom-scrollbar-active');
    return () => {
      document.documentElement.classList.remove('custom-scrollbar-active');
      document.body.classList.remove('custom-scrollbar-active');
    };
  }, []);
  return null;
};

export default CustomScrollbar;
