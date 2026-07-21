import { useEffect, useState } from 'react';

export function useElementSize<T extends Element>() {
  const [el, setEl] = useState<T | null>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.target.getBoundingClientRect().height);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [el]);

  return { setEl, height };

  return {
    setEl,
    height,
  };
}
