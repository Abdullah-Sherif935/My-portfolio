import { AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useAdminData } from '@/features/admin/context/useAdminData';

interface PrototypeBannerProps {
  onReset?: () => void;
  compact?: boolean;
}

export function PrototypeBanner({ onReset, compact = false }: PrototypeBannerProps) {
  const { t } = useTranslation('admin');
  const { isLoading, isSaving, lastError, clearError } = useAdminData();

  return (
    <div className="mb-6 space-y-3">
      {lastError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-xs text-error"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">{t('prototype.syncError')}</p>
              <p className="mt-0.5 opacity-90">{lastError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-xs underline hover:opacity-80 cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      )}

      {!compact && (
        <div className="flex flex-col gap-3 rounded-xl border border-success/30 bg-success-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <div className="space-y-0.5 text-xs sm:text-sm">
              <p className="font-semibold text-text-primary">
                {isSaving
                  ? t('prototype.saving')
                  : isLoading
                    ? t('prototype.loadingWorkspace')
                    : t('prototype.bannerTitle')}
              </p>
              <p className="leading-relaxed text-text-secondary">
                {t('prototype.bannerBody')}
              </p>
            </div>
          </div>
          {onReset && (
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading || isSaving}
              onClick={onReset}
              className="shrink-0 self-start sm:self-center"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{t('prototype.resetData')}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
