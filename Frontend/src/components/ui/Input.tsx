import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'glass-input rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
            error &&
              'border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.2)]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-400 mt-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
