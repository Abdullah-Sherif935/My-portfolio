import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden border-b border-border-default bg-bg-secondary">
      <div
        aria-hidden="true"
        className="engineering-grid pointer-events-none absolute inset-0 opacity-70"
      />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-medium tracking-wider text-accent uppercase">
                {eyebrow}
              </span>
              {badge}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
              {title}
            </h1>
            <p className="text-[15px] leading-relaxed text-text-secondary sm:text-[17px]">
              {subtitle}
            </p>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </Container>
    </div>
  );
}
