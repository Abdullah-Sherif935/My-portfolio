import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FieldBaseProps {
  id: string;
  label: string;
  error?: string;
}

const fieldControlClasses =
  'w-full rounded-[10px] border border-border-default bg-bg-primary px-4 text-[15px] text-text-primary placeholder:text-text-secondary/70 transition-colors duration-200 focus:border-accent focus:outline-none';

export interface InputProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {}

export function Input({ id, label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          fieldControlClasses,
          'h-11',
          error && 'border-error focus:border-error',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export interface TextareaProps
  extends FieldBaseProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {}

export function Textarea({
  id,
  label,
  error,
  className,
  rows = 5,
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-text-primary">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          fieldControlClasses,
          'py-3 resize-y',
          error && 'border-error focus:border-error',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
