import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'accent' | 'muted' | 'success' | 'outline';

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-bg-elevated text-text-primary border border-border-default',
  accent: 'bg-accent-subtle text-accent border border-accent-border',
  muted: 'bg-bg-primary text-text-secondary border border-border-default',
  success: 'bg-success-subtle text-success border border-success/30',
  outline: 'bg-transparent text-text-secondary border border-border-default',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  mono?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  mono = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium leading-none',
        mono && 'font-mono tracking-tight',
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
