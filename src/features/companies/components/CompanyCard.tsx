import { Link } from 'react-router-dom';
import { ArrowUpRight, Building2, FolderKanban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import type { Company } from '@/types/portfolio';

interface CompanyCardProps {
  company: Company;
  detailed?: boolean;
}

export function CompanyCard({ company, detailed = false }: CompanyCardProps) {
  const { t } = useTranslation(['home', 'common']);
  const { pick } = useLanguage();
  const { projects } = usePortfolioData();

  const linkedProjects = projects.filter(
    (project) =>
      project.companyId === company.id ||
      company.relatedProjectSlugs.includes(project.slug)
  );

  return (
    <Card interactive className="flex h-full flex-col p-6">
      {/* Header: Responsive layout prevents badge wrapping on narrow screens */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={pick(company.name)}
              className="h-12 w-12 shrink-0 rounded-xl border border-border-default object-contain p-1.5"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-bg-elevated font-mono text-sm font-semibold tracking-wider text-accent"
            >
              {company.monogram}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-text-primary">
              <Link
                to={`/companies/${company.slug}`}
                className="transition-colors hover:text-accent"
              >
                {pick(company.name)}
              </Link>
            </h3>
            <p className="font-mono text-[11px] text-text-secondary">
              {t('home:companies.logoPlaceholder')}
            </p>
          </div>
        </div>
        <Badge variant="muted" mono className="shrink-0 whitespace-nowrap">
          {company.dataSource === 'cv-initial'
            ? t('common:badges.cvInitial')
            : t('common:badges.placeholder')}
        </Badge>
      </div>

      {/* Structured Metadata */}
      <dl className="mb-5 space-y-3 text-sm">
        <div className="rounded-xl border border-border-default bg-bg-primary p-3">
          <dt className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
            <Building2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{t('home:companies.industryLabel')}</span>
          </dt>
          <dd className="text-text-primary">{pick(company.industry)}</dd>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-primary p-3">
          <dt className="mb-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
            {t('home:companies.relationshipLabel')}
          </dt>
          <dd className="text-text-secondary">{pick(company.relationshipType)}</dd>
        </div>
      </dl>

      {/* Services Provided */}
      <div className="mb-5 flex-1">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
          {t('home:companies.servicesLabel')}
        </p>
        <ul className="space-y-1.5 text-sm text-text-secondary">
          {company.servicesProvided.map((service, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              />
              <span>{pick(service)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Related Projects */}
      <div className="space-y-3 border-t border-border-default pt-4">
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
          <FolderKanban className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>{t('common:actions.relatedProjects')}</span>
        </div>

        {linkedProjects.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {linkedProjects
              .slice(0, detailed ? linkedProjects.length : 1)
              .map((project) => (
                <Link
                  key={project.id}
                  to={`/portfolio/${project.slug}`}
                  className="group/link inline-flex items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-primary px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:border-accent-border hover:text-accent"
                >
                  <span className="truncate">{pick(project.title)}</span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-text-secondary transition-colors group-hover/link:text-accent rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                </Link>
              ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border-default bg-bg-primary px-3 py-2 text-xs text-text-secondary">
            {t('common:actions.noLinkedProjects')}
          </p>
        )}

        <div className="pt-1">
          <Link
            to={`/companies/${company.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            <span>{t('common:actions.viewCompany')}</span>
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
