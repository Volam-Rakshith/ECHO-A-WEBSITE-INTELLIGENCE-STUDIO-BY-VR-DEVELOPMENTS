import React from 'react';
import { RetrievalStatus, ResourceKind } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'yellow' | 'cyan' | 'violet' | 'green' | 'red' | 'slate' | 'default';
  status?: RetrievalStatus;
  kind?: ResourceKind;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  kind,
  size = 'sm',
  className = '',
}) => {
  let computedVariant = variant || 'default';

  if (status) {
    switch (status) {
      case 'RETRIEVED':
        computedVariant = 'yellow';
        break;
      case 'USER_PROVIDED':
        computedVariant = 'cyan';
        break;
      case 'DISCOVERED_ONLY':
        computedVariant = 'slate';
        break;
      case 'INFERRED':
        computedVariant = 'violet';
        break;
      case 'UNAVAILABLE':
      case 'FAILED':
        computedVariant = 'red';
        break;
    }
  }

  if (kind) {
    switch (kind) {
      case 'html':
        computedVariant = 'yellow';
        break;
      case 'stylesheet':
        computedVariant = 'cyan';
        break;
      case 'script':
        computedVariant = 'yellow';
        break;
      case 'image':
        computedVariant = 'violet';
        break;
      case 'manifest':
        computedVariant = 'green';
        break;
      default:
        computedVariant = 'slate';
    }
  }

  const variantStyles = {
    yellow: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    violet: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    red: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    default: 'bg-white/5 text-slate-300 border-white/10',
  }[computedVariant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border tracking-wide uppercase transition-colors shrink-0 ${variantStyles} ${sizeStyles} ${className}`}
    >
      {status || kind || children}
    </span>
  );
};
