import { useEffect, useState } from 'react';

/* Handset when the device has a coarse pointer (touch-first) or the viewport
   is narrower than the lg breakpoint — same rule the adaptive-os plan set. */
export function usePrefersHandset(): boolean {
  const [handset, setHandset] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024)
  );

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setHandset(mq.matches || window.innerWidth < 1024);
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return handset;
}
