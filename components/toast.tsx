'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { X } from 'lucide-react';

type Toast = { id: number; message: string; kind: 'success' | 'error' | 'info' };
type ToastContextValue = { showToast: (message: string, kind?: Toast['kind']) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current, { id, message, kind }]);
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 5000);
  }, []);
  const value = useMemo(() => ({ showToast }), [showToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border p-3 text-sm shadow-lg ${toast.kind === 'error' ? 'border-red-200 bg-red-50 text-red-800' : toast.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-800'}`}>
            <span>{toast.message}</span>
            <button aria-label="Dismiss notification" onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))}><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
