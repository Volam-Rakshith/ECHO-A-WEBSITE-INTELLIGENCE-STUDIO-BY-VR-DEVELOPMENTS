import React from 'react';
import { soundEffects } from '../../services/audioEffects';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cyan' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundEffects.playClick();
    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shrink-0';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#FEE75C] text-[#0A0B0E] font-semibold hover:bg-[#ffe600] active:scale-[0.98] shadow-[0_0_15px_rgba(254,231,92,0.25)] border border-[#FEE75C]',
    cyan: 'bg-[#00F0FF] text-[#0A0B0E] font-semibold hover:bg-[#38bdf8] active:scale-[0.98] shadow-[0_0_15px_rgba(0,240,255,0.25)] border border-[#00F0FF]',
    secondary:
      'bg-[#161922] text-slate-200 hover:bg-[#202532] hover:text-white border border-white/10 active:scale-[0.98]',
    outline:
      'bg-transparent text-slate-300 hover:text-white border border-white/20 hover:border-white/40 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 active:scale-[0.98]',
    danger:
      'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 active:scale-[0.98]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
