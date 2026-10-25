import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warn' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => {
        const icon = {
          success: <CheckCircle2 className="w-4 h-4 text-[#FEE75C] shrink-0" />,
          warn: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-[#00F0FF] shrink-0" />,
        }[toast.type];

        const borderColor = {
          success: 'border-[#FEE75C]/40',
          warn: 'border-amber-400/40',
          error: 'border-rose-400/40',
          info: 'border-[#00F0FF]/40',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#141720]/95 backdrop-blur border ${borderColor} rounded-lg p-3 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-150`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
