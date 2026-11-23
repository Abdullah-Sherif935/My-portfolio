import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface BrandMarkProps {
  className?: string;
  showRole?: boolean;
}

export function BrandMark({ className, showRole = false }: BrandMarkProps) {
  const { t } = useTranslation('common');

  return (
    <Link
      to="/"
      className={cn(
        'group inline-flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle font-mono text-sm font-semibold text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-foreground"
      >
        AS
        <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="flex flex-col leading-tight whitespace-nowrap">
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          {t('brand.name')}
        </span>
        <span className="font-mono text-[11px] tracking-wide text-text-secondary">
          {showRole ? t('brand.role') : t('brand.shortCode')}
        </span>
      </span>
    </Link>
  );
}
