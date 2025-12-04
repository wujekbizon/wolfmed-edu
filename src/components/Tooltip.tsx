'use client';
import { ReactNode, useState, useEffect, useId } from 'react';

interface TooltipProps {
  message: string;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function Tooltip({ message, children, position = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = `tooltip-${useId()}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    'top-left': 'bottom-full right-0 mb-2',
    'top-right': 'bottom-full left-0 mb-2',
    'bottom-left': 'top-full right-0 mt-2',
    'bottom-right': 'top-full left-0 mt-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={id}
    >
      {children}
      {open && (
        <div
          id={id}
          role="tooltip"
          className={`
            absolute ${positionClasses[position]}
            bg-linear-to-r from-[#f58a8a] to-[#ffc5c5] text-zinc-900
            text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg
            backdrop-blur-sm border border-red-200/40
            whitespace-nowrap
            transition-all duration-200 opacity-100 z-[100]
          `}
        >
          {message}
        </div>
      )}
    </div>
  );
}