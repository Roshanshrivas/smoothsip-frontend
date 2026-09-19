// src/hooks/useBodyScrollLock.js
import { useEffect } from 'react';


export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return;

    const body = document.body;
    const html = document.documentElement;

    // Save existing styles
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // Compensate for removed scrollbar so layout doesn't jump
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    // 🔑 Defer the lock one frame — lets the drawer's transform animation start
    //    BEFORE any layout change happens. This is the key to smooth open.
    const raf = requestAnimationFrame(() => {
      body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [isLocked]);
};