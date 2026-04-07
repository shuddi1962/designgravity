import { useEffect, useRef, useCallback } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options?: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    preventDefault?: boolean;
  }
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (options?.ctrlKey && !e.ctrlKey) return;
      if (options?.metaKey && !e.metaKey) return;
      if (options?.shiftKey && !e.shiftKey) return;
      if (options?.altKey && !e.altKey) return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (options?.preventDefault) {
        e.preventDefault();
      }

      callbackRef.current(e);
    },
    [key, options]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
