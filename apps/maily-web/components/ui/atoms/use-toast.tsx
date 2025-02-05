import { useState } from 'react';

// Existing hook for toast notifications
export function useToast() {
  const [toasts, setToasts] = useState<string[]>([]);

  const addToast = (message: string) => {
    setToasts((prev) => [...prev, message]);
  };

  const removeToast = (index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index));
  };

  return { toasts, addToast, removeToast };
}

// Stub function for toast notifications
export function toast(message: string) {
  console.log('Toast:', message);
} 