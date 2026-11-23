import { Award, Calendar, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import type { Certification } from '@/types/portfolio';

interface CertificationCardProps {
  certification: Certification;
}

export function CertificationCard({ certification }: CertificationCardProps) {
  const { t } = useTranslation(['home', 'common']);
  const { pick } = useLanguage();

  return (
    <Card interactive className="flex h-full flex-col p-4 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent sm:h-11 sm:w-11">
          <Award className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </div>
        <Badge variant="muted" mono>
          {certification.credentialId}
        </Badge>
      </div>

      <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-accent sm:mb-1.5">
        {pick(certification.category)}
      </p>

      <h3 className="mb-3 flex-1 text-base font-semibold leading-snug text-text-primary sm:mb-4 sm:text-[17px]">
        {pick(certification.title)}
      </h3>

      <dl className="mb-4 space-y-1.5 text-xs text-text-secondary sm:mb-5 sm:space-y-2 sm:text-sm">
        <div>
          <dt className="sr-only">{t('home:certifications.issuerLabel')}</dt>
          <dd className="font-medium text-text-primary">{pick(certification.issuer)}</dd>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <dt className="sr-only">{t('home:certifications.dateLabel')}</dt>
          <dd>{pick(certification.issueDate)}</dd>
        </div>
      </dl>

      <div className="border-t border-border-default pt-3 sm:pt-4">
        {certification.credentialUrl ? (
          <a
            href={certification.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover"
          >
            <span>{t('common:actions.credentialPlaceholder')}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary">
            <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            <span>{t('common:actions.credentialPlaceholder')}</span>
          </span>
        )}
      </div>
    </Card>
  );
}
