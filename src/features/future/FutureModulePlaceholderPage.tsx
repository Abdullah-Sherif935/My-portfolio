import { ShieldAlert, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { FUTURE_MODULES } from '@/data';

interface FutureModulePlaceholderPageProps {
  routePath: string;
}

export function FutureModulePlaceholderPage({
  routePath,
}: FutureModulePlaceholderPageProps) {
  const { t } = useTranslation(['pages', 'common']);
  const { pick } = useLanguage();
  const spec = FUTURE_MODULES[routePath];

  useDocumentTitle(spec ? pick(spec.title) : undefined);

  if (!spec) {
    return null;
  }

  return (
    <Section>
      <Container className="max-w-3xl">
        <Card className="space-y-6 p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-accent">
              {spec.area === 'admin'
                ? t('pages:future.adminEyebrow')
                : t('pages:future.careerEyebrow')}
            </p>
            <Badge variant="muted" mono>
              {t('common:badges.futureModule')}
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              {pick(spec.title)}
            </h1>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              {pick(spec.description)}
            </p>
          </div>

          <div className="rounded-xl border border-border-default bg-bg-primary px-4 py-3 font-mono text-xs text-text-secondary">
            <span className="text-text-secondary">{t('pages:future.routeLabel')}: </span>
            <span className="font-semibold text-accent">{spec.route}</span>
          </div>

          <div className="rounded-xl border border-accent-border bg-accent-subtle p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-text-primary">
                  {t('pages:future.securityNoticeTitle')}
                </h2>
                <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
                  {t('pages:future.securityNoticeBody')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <Layers className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{t('pages:future.plannedCapabilitiesHeading')}</span>
            </h2>
            <ul className="space-y-2 text-sm text-text-secondary">
              {spec.plannedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{pick(item)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border-default pt-4">
            <ButtonLink to="/" variant="primary" size="md">
              {t('common:actions.backToHome')}
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
