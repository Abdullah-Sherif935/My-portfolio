import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  id?: string;
  children: ReactNode;
  surface?: 'primary' | 'secondary';
  className?: string;
}

export function Section({
  id,
  children,
  surface = 'primary',
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-10 sm:py-16 lg:py-24',
        surface === 'secondary' &&
          'border-y border-border-default bg-bg-secondary',
        className
      )}
    >
      {children}
    </section>
  );
}
