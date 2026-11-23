import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 sm:mb-10 sm:gap-4 md:flex-row md:items-end md:justify-between lg:mb-12',
        className
      )}
    >
      <div className="max-w-2xl space-y-2 sm:space-y-3">
        <p className="font-mono text-[11px] font-medium tracking-wider text-accent uppercase sm:text-xs">
          {eyebrow}
        </p>
        <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-text-primary sm:text-3xl lg:text-[38px] lg:leading-[1.18]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
