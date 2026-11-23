import { Info, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface PrototypeBannerProps {
  onReset?: () => void;
  compact?: boolean;
}

export function PrototypeBanner({ onReset, compact = false }: PrototypeBannerProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-accent-border bg-accent-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <div className="space-y-0.5 text-xs sm:text-sm">
          <p className="font-semibold text-text-primary">
            {t('prototype.bannerTitle')}
          </p>
          {!compact && (
            <p className="leading-relaxed text-text-secondary">
              {t('prototype.bannerBody')}
            </p>
          )}
        </div>
      </div>
      {onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="shrink-0 self-start sm:self-center"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t('prototype.resetData')}</span>
        </Button>
      )}
    </div>
  );
}
