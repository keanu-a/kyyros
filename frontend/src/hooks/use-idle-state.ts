import { useRef, useState } from 'react';

export function useIdleState() {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const resetIdleTimer = (skipSchedule = false) => {
    setIsIdle(false);
    clearTimeout(idleTimeoutRef.current);
    if (skipSchedule) return;
    idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 3000);
  };

  return {
    isIdle,
    setIsIdle,
    resetIdleTimer,
  };
}
