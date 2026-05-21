/**
 * TerminalCard - Reusable brutalist container component
 * Professional glassmorphism with high-contrast borders and deep shadows
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * @typedef {object} TerminalCardProps
 * @property {React.ReactNode} children - Card content
 * @property {string} [title] - Optional header title
 * @property {React.ReactNode} [icon] - Optional header icon
 * @property {React.ReactNode} [action] - Optional header action button
 * @property {string} [className] - Additional classes
 * @property {'default' | 'elevated' | 'inset'} [variant] - Card style variant
 * @property {boolean} [noPadding] - Remove default padding
 */

export default function TerminalCard({
  children,
  title,
  icon,
  action,
  className,
  variant = 'default',
  noPadding = false
}) {
  const variantStyles = {
    default: 'bg-[#0A0A0A]/80 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]',
    elevated: 'bg-[#0A0A0A]/90 backdrop-blur-2xl border-white/15 shadow-[0_12px_48px_rgba(0,0,0,0.8)]',
    inset: 'bg-black/60 backdrop-blur-sm border-white/5 shadow-inner'
  };

  return (
    <div
      className={clsx(
        'border rounded-2xl overflow-hidden transition-all duration-300',
        variantStyles[variant],
        className
      )}
    >
      {/* Header */}
      {(title || icon || action) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-zinc-950/50">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-neonBlue">
                {icon}
              </span>
            )}
            {title && (
              <span className="text-[10px] uppercase font-mono font-black text-white tracking-wider">
                {title}
              </span>
            )}
          </div>
          {action && (
            <div className="flex items-center gap-2">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={clsx(!noPadding && 'p-5')}>
        {children}
      </div>
    </div>
  );
}

/**
 * TerminalCardGrid - Grid layout for multiple cards
 */
export function TerminalCardGrid({ children, columns = 4, className }) {
  return (
    <div
      className={clsx(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * TerminalCardStat - Stat display inside a card
 */
export function TerminalCardStat({ label, value, subtext, icon, trend }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">
          {label}
        </span>
        {icon && (
          <span className="text-zinc-600">
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-xl font-black text-white font-mono">
          {value}
        </span>
        {trend && (
          <span className={clsx(
            'text-[10px] font-bold uppercase',
            trend === 'up' && 'text-emerald-400',
            trend === 'down' && 'text-red-400',
            trend === 'stable' && 'text-zinc-500'
          )}>
            {trend === 'up' && '+'}
            {trend === 'down' && '-'}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-[8px] text-zinc-400 uppercase tracking-wide">
          {subtext}
        </p>
      )}
    </div>
  );
}
