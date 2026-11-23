import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  elevated?: boolean;
}

export function Card({
  children,
  interactive = false,
  elevated = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-default transition-all duration-200',
        elevated ? 'bg-bg-elevated' : 'bg-bg-secondary',
        interactive &&
          'hover:-translate-y-0.5 hover:border-accent-border hover:shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
