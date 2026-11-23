import { useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Info,
  Monitor,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface PageEditorShellProps {
  title: string;
  subtitle: string;
  publicRoute: string;
  mappingPath: string;
  sharedPages?: string[];
  hasUnsavedChanges?: boolean;
  lastSavedLabel?: string | null;
  previewRefreshKey?: number;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function PageEditorShell({
  title,
  subtitle,
  publicRoute,
  mappingPath,
  sharedPages,
  hasUnsavedChanges = false,
  lastSavedLabel,
  previewRefreshKey = 0,
  headerActions,
  children,
}: PageEditorShellProps) {
  const { t } = useTranslation('admin');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [manualReload, setManualReload] = useState(0);

  const iframeKey = `${publicRoute}-${previewRefreshKey}-${manualReload}`;

  return (
    <div className="space-y-6">
      {/* Page-Oriented Header */}
      <div className="flex flex-col gap-4 border-b border-border-default pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" mono>
              <Globe className="h-3 w-3" aria-hidden="true" />
              <span dir="ltr">{publicRoute}</span>
            </Badge>
            <span className="text-xs font-medium text-text-secondary">
              {mappingPath}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-[28px]">
            {title}
          </h1>
          <p className="max-w-3xl text-sm text-text-secondary">{subtitle}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {headerActions}
          <Button
            type="button"
            variant={previewOpen ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPreviewOpen((prev) => !prev)}
          >
            {previewOpen ? (
              <>
                <EyeOff className="h-4 w-4" aria-hidden="true" />
                <span>{t('pageShell.hidePreview')}</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>{t('pageShell.livePreview')}</span>
              </>
            )}
          </Button>
          <a
            href={publicRoute}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border-default bg-bg-secondary px-3 text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('pageShell.openPublicPage')}</span>
          </a>
        </div>
      </div>

      {/* Status Row: Unsaved Warning / Last Saved / Shared Impact */}
      <div className="space-y-2.5">
        {hasUnsavedChanges && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl border border-accent-border bg-accent-subtle/60 px-4 py-2.5 text-xs font-medium text-text-primary"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{t('pageShell.unsavedWarning')}</span>
          </div>
        )}

        {lastSavedLabel && !hasUnsavedChanges && (
          <div
            role="status"
            className="flex items-center justify-between gap-2 rounded-xl border border-success/30 bg-success-subtle px-4 py-2 text-xs font-medium text-success"
          >
            <span>{t('pageShell.savedPublished', { time: lastSavedLabel })}</span>
          </div>
        )}

        {sharedPages && sharedPages.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-border-default bg-bg-secondary px-4 py-2.5 text-xs text-text-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-medium text-text-primary">
                {t('pageShell.sharedContentTitle')}
              </p>
              <p>
                {t('pageShell.sharedContentBody')}{' '}
                <span className="font-semibold text-accent">
                  {sharedPages.join(' · ')}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Real Embedded Live Public Page Preview */}
      {previewOpen && (
        <Card className="overflow-hidden border-accent-border p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default bg-bg-secondary px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Badge variant="success" mono>
                {t('pageShell.livePreviewBadge')}
              </Badge>
              <span className="font-mono text-xs text-text-secondary" dir="ltr">
                {publicRoute}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                aria-pressed={previewMode === 'desktop'}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors cursor-pointer',
                  previewMode === 'desktop'
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-border-default bg-bg-primary text-text-secondary hover:text-text-primary'
                )}
              >
                <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('pageShell.desktopView')}</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                aria-pressed={previewMode === 'mobile'}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors cursor-pointer',
                  previewMode === 'mobile'
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-border-default bg-bg-primary text-text-secondary hover:text-text-primary'
                )}
              >
                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('pageShell.mobileView')}</span>
              </button>
              <button
                type="button"
                onClick={() => setManualReload((n) => n + 1)}
                aria-label={t('pageShell.refreshPreview')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-primary text-text-secondary hover:border-accent hover:text-accent cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex justify-center bg-bg-primary/80 p-3 sm:p-4">
            <iframe
              key={iframeKey}
              src={publicRoute}
              title={`${title} — Live Preview`}
              className={cn(
                'h-[540px] rounded-xl border border-border-default bg-bg-primary shadow-card transition-all',
                previewMode === 'mobile' ? 'w-[390px] max-w-full' : 'w-full'
              )}
            />
          </div>
          <p className="border-t border-border-default bg-bg-secondary px-4 py-2 text-[11px] text-text-secondary">
            {t('pageShell.livePreviewHint')}
          </p>
        </Card>
      )}

      {/* Main Page Content */}
      <div>{children}</div>
    </div>
  );
}
