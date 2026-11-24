import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Building2,
  FolderKanban,
  MapPin,
} from 'lucide-react';
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
  const { t } = useTranslation(['home', 'pages', 'common']);
  const { pick } = useLanguage();
  const { projects } = usePortfolioData();

  const linkedProjects = projects.filter(
    (project) =>
      project.isPublished !== false &&
      (project.companyId === company.id ||
        company.relatedProjectSlugs.includes(project.slug))
  );

  const locationText = [
    company.location ? pick(company.location).trim() : '',
    company.country ? pick(company.country).trim() : '',
  ]
    .filter(Boolean)
    .join(', ');

  const shortDesc = company.shortDescription
    ? pick(company.shortDescription).trim()
    : '';
  const industryText = pick(company.industry).trim();
  const relationshipText = pick(company.relationshipType).trim();

  return (
    <Card interactive className="flex h-full flex-col p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={pick(company.name)}
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-xl border border-border-default bg-bg-primary object-contain p-1.5"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-bg-elevated font-mono text-sm font-semibold tracking-wider text-accent"
            >
              {company.monogram}
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <h3 className="truncate text-base font-semibold tracking-tight text-text-primary sm:text-lg">
              <Link
                to={`/companies/${company.slug}`}
                className="transition-colors hover:text-accent"
              >
                {pick(company.name)}
              </Link>
            </h3>
            {industryText && (
              <p className="inline-flex items-center gap-1 text-xs text-text-secondary">
                <Building2 className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
                <span className="truncate">{industryText}</span>
              </p>
            )}
          </div>
        </div>

        {relationshipText && (
          <Badge variant="accent" className="shrink-0 whitespace-nowrap">
            {relationshipText}
          </Badge>
        )}
      </div>

      {/* Location (when available) */}
      {locationText && (
        <p className="mb-3 inline-flex items-center gap-1.5 text-xs text-text-secondary">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
          <span>{locationText}</span>
        </p>
      )}

      {/* Short Description (when available) */}
      {shortDesc && (
        <p className="mb-4 flex-1 text-xs leading-relaxed text-text-secondary sm:text-sm">
          {shortDesc}
        </p>
      )}

      {/* Published Related Projects (ONLY when > 0) */}
      {linkedProjects.length > 0 && (
        <div className="mb-4 space-y-2 border-t border-border-default pt-3.5">
          <div className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>{t('common:actions.relatedProjects')}</span>
            </span>
            <Badge variant="muted" mono>
              {linkedProjects.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-1.5">
            {linkedProjects
              .slice(0, detailed ? 3 : 1)
              .map((project) => (
                <Link
                  key={project.id}
                  to={`/portfolio/${project.slug}`}
                  className="group/link inline-flex items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-primary px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-accent-border hover:text-accent"
                >
                  <span className="truncate">{pick(project.title)}</span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-text-secondary transition-colors group-hover/link:text-accent rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-auto border-t border-border-default pt-3">
        <Link
          to={`/companies/${company.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition-colors hover:text-accent-hover sm:text-sm"
        >
          <span>{t('common:actions.viewCompany')}</span>
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
