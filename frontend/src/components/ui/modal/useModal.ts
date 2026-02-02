'use client';

import { useState, useCallback } from 'react';

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook for managing modal open/close state
 */
export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Hook for managing modal with data
 */
export function useModalWithData<T = unknown>(
  initialState = false
): UseModalReturn & {
  data: T | null;
  openWithData: (data: T) => void;
} {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    // Clear data after close animation
    setTimeout(() => setData(null), 200);
  }, []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const openWithData = useCallback((newData: T) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    data,
    openWithData,
  };
}
