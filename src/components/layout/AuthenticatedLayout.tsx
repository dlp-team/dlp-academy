// src/components/layout/AuthenticatedLayout.tsx
import React from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';

interface LayoutContext {
  user: any;
}

/**
 * Shared layout for all authenticated routes.
 *
 * The Header lives *outside* AnimatePresence so it persists across route
 * changes without fading.  Only the page content (Outlet) transitions.
 */
const AuthenticatedLayout: React.FC<{ user: any }> = ({ user }) => {
  const location = useLocation();

  return (
    <>
      <Header user={user} />
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} context={{ user } satisfies LayoutContext} />
      </AnimatePresence>
    </>
  );
};

/** Hook for child routes to access the layout context (user). */
export function useLayoutUser() {
  return useOutletContext<LayoutContext>();
}

export default AuthenticatedLayout;
