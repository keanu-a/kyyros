'use client';

import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px) and (orientation: portrait)`;
    const mql = window.matchMedia(query);

    const update = () => setIsMobile(mql.matches);
    update();

    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
}
