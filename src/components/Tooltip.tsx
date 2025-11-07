'use client';
import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  message: string;
  children: ReactNode;
}

export function Tooltip({ message, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useRef(`tooltip-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

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
          className="
            absolute top-0 mt-1 left-1/2 transform -translate-x-1/2
            bg-gray-800 text-white text-sm px-2 py-1 rounded-md shadow-lg
            max-w-xs whitespace-normal text-center
            transition-opacity duration-150 opacity-100 z-50
          "
        >
          {message}
        </div>
      )}
    </div>
  );
}