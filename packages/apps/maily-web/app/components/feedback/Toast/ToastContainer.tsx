import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from './useToast';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
          >
            <Toast {...toast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}; 