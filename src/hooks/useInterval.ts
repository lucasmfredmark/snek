import { useEffect, useRef } from 'react';

const noop = () => {};

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(noop);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null) return;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
};
