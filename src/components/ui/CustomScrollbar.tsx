// src/components/ui/CustomScrollbar.tsx
import React, { useEffect } from 'react';

/**
 * CustomScrollbar applies a global elegant scrollbar style to the entire app.
 * It adds a class to html/body on mount and removes it on unmount.
 * Legacy helper: app-level scrollbar is now managed by OverlayScrollbars in App.tsx.
 */
const CustomScrollbar = () => {
  useEffect(() => {
    const modeClassName = 'custom-scrollbar-stable';

    document.documentElement.classList.add('custom-scrollbar-active');
    document.body.classList.add('custom-scrollbar-active');
    document.documentElement.classList.add(modeClassName);
    document.body.classList.add(modeClassName);

    return () => {
      document.documentElement.classList.remove('custom-scrollbar-active');
      document.body.classList.remove('custom-scrollbar-active');
      document.documentElement.classList.remove(modeClassName);
      document.body.classList.remove(modeClassName);
    };
  }, []);
  return null;
};

export default CustomScrollbar;
