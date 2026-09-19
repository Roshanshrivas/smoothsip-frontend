// src/components/ScrollToTop.jsx
import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType(); // 'PUSH' | 'POP' | 'REPLACE'
  const scrollPositions = useRef(new Map());   // pathname → scrollY
  const prevKey = useRef(null);

  // Save scroll position of the page we're leaving
  useLayoutEffect(() => {
    const handleBeforeUnloadOrNav = () => {
      if (prevKey.current) {
        scrollPositions.current.set(prevKey.current, window.scrollY);
      }
    };

    // Save on every render cycle for the current page
    handleBeforeUnloadOrNav();

    return () => {
      // On unmount, save the position of the page we're leaving
      if (prevKey.current) {
        scrollPositions.current.set(prevKey.current, window.scrollY);
      }
    };
  }, [location.key]);

  // Perform the scroll behavior for the new page
  useLayoutEffect(() => {
    // Build a stable key for this route (pathname only, ignore query if you want)
    const routeKey = location.pathname;

    // Track the previous page
    prevKey.current = routeKey;

    // ── Case 1: Hash anchor → scroll to element ──
    if (location.hash) {
      const id = location.hash.slice(1);
      // Wait a tick so the target element has time to render
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      });
      return;
    }

    // ── Case 2: Back / Forward button → restore saved position ──
    if (navigationType === 'POP') {
      const saved = scrollPositions.current.get(routeKey);
      if (typeof saved === 'number') {
        // Delay a frame so content renders before scroll
        requestAnimationFrame(() => {
          window.scrollTo({ top: saved, left: 0, behavior: 'instant' });
        });
        return;
      }
      // No saved position → fall through to top
    }

    // ── Case 3: Fresh navigation → top of page ──
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Also reset documentElement and body for iOS Safari quirks
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.hash, location.key, navigationType]);

  return null;
};

export default ScrollToTop;