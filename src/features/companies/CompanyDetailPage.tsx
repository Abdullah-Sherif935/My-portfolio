import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  FolderKanban,
  Globe,
  Layers,
  MapPin,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { ProjectCard } from '@/features/portfolio/components/ProjectCard';
import { ExperienceTimeline } from '@/features/experience/components/ExperienceTimeline';

export function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation(['pages', 'home', 'common']);
  const { pick } = useLanguage();
  const { companies, experience, projects, isLoading, isLive } = usePortfolioData();

  const company = companies.find(
    (item) => item.slug === slug && item.isPublished !== false
  );

  const customSeoTitle = company?.seoMeta?.title
    ? pick(company.seoMeta.title).trim()
    : '';
  useDocumentTitle(
    company
      ? customSeoTitle || pick(company.name)
      : t('pages:companyDetail.notFoundTitle')
  );

  if (isLoading && !isLive) {
    return (
      <Section>
        <Container className="space-y-6">
          <div className="h-5 w-32 animate-pulse rounded bg-bg-secondary" />
          <div className="h-32 animate-pulse rounded-2xl border border-border-default bg-bg-secondary" />
          <div className="h-48 animate-pulse rounded-2xl border border-border-default bg-bg-secondary" />
        </Container>
      </Section>
    );
  }

  if (!company) {
    return (
      <Section>
        <Container className="max-w-2xl text-center">
          <Card className="space-y-4 p-10">
            <p className="font-mono text-xs text-accent">
              {t('pages:companyDetail.notFoundCode')}
            </p>
            <h1 className="text-2xl font-bold text-text-primary">
              {t('pages:companyDetail.notFoundTitle')}
            </h1>
            <p className="text-sm text-text-secondary">
              {t('pages:companyDetail.notFoundDescription')}
            </p>
            <div className="pt-2">
              <ButtonLink to="/companies" variant="primary" size="md">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                <span>{t('common:actions.backToCompanies')}</span>
              </ButtonLink>
            </div>
          </Card>
        </Container>
      </Section>
    );
  }

  const relatedProjects = projects.filter(
    (project) =>
      project.isPublished !== false &&
      (project.companyId === company.id ||
        company.relatedProjectSlugs.includes(project.slug))
  );

  const relatedExperience = experience.filter(
    (exp) => exp.isPublished !== false && exp.companyId === company.id
  );

  const locationText = [
    company.location ? pick(company.location).trim() : '',
    company.country ? pick(company.country).trim() : '',
  ]
    .filter(Boolean)
    .join(', ');

  const dateRange = [company.startDate, company.endDate].filter(Boolean).join(' – ');
  const shortDesc = company.shortDescription
    ? pick(company.shortDescription).trim()
    : '';
  const overviewText = company.overview ? pick(company.overview).trim() : '';
  const industryText = pick(company.industry).trim();
  const relationshipText = pick(company.relationshipType).trim();
  const hasServices = company.servicesProvided.some((s) => pick(s).trim());

  return (
    <Section className="py-8 sm:py-10 lg:py-12">
      <Container className="space-y-8">
        <div>
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t('common:actions.backToCompanies')}</span>
          </Link>
        </div>

        {/* Optional Cover Banner */}
        {company.coverImageUrl && (
          <Card className="overflow-hidden">
            <img
              src={company.coverImageUrl}
              alt={pick(company.name)}
              className="aspect-[21/7] max-h-[260px] w-full object-cover"
            />
          </Card>
        )}

        {/* Company Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={pick(company.name)}
                className="h-16 w-16 shrink-0 rounded-2xl border border-border-default bg-bg-secondary object-contain p-2"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border-strong bg-bg-elevated font-mono text-lg font-semibold tracking-wider text-accent"
              >
                {company.monogram}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {relationshipText && (
                  <Badge variant="accent">{relationshipText}</Badge>
                )}
                {dateRange && (
                  <Badge variant="muted" mono>
                    <Calendar className="me-1 inline h-3 w-3" aria-hidden="true" />
                    {dateRange}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
                {pick(company.name)}
              </h1>
              {shortDesc && (
                <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                  {shortDesc}
                </p>
              )}
            </div>
          </div>

          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-xl border border-border-default bg-bg-secondary px-4 text-xs font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent sm:self-center"
            >
              <Globe className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{t('pages:companyDetail.visitWebsite')}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Main Content + Metadata Sidebar (Zero Empty Sections) */}
        <div className="grid gap-8 lg:grid-cols-12">
          {(overviewText || hasServices) && (
            <div className="space-y-6 lg:col-span-8">
              {overviewText && (
                <Card className="space-y-3 p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                    <Building2 className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span>{t('pages:companyDetail.overviewHeading')}</span>
                  </h2>
                  <p className="text-[15px] leading-relaxed text-text-secondary sm:text-base">
                    {overviewText}
                  </p>
                </Card>
              )}

              {hasServices && (
                <Card className="space-y-4 p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                    <Layers className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span>{t('pages:companyDetail.servicesHeading')}</span>
                  </h2>
                  <ul className="space-y-2.5 text-sm text-text-secondary sm:text-[15px]">
                    {company.servicesProvided
                      .filter((s) => pick(s).trim())
                      .map((service, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                          <span>{pick(service)}</span>
                        </li>
                      ))}
                  </ul>
                </Card>
              )}
            </div>
          )}

          <aside
            className={
              overviewText || hasServices ? 'lg:col-span-4' : 'lg:col-span-12'
            }
          >
            <Card elevated className="space-y-4 p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                {t('pages:companyDetail.metadataHeading')}
              </h2>
              <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
                {industryText && (
                  <div className="border-b border-border-default pb-3">
                    <dt className="font-mono text-[11px] uppercase text-text-secondary">
                      {t('pages:companyDetail.industryLabel')}
                    </dt>
                    <dd className="mt-1 text-text-primary">{industryText}</dd>
                  </div>
                )}
                {relationshipText && (
                  <div className="border-b border-border-default pb-3">
                    <dt className="font-mono text-[11px] uppercase text-text-secondary">
                      {t('pages:companyDetail.relationshipLabel')}
                    </dt>
                    <dd className="mt-1 text-text-primary">{relationshipText}</dd>
                  </div>
                )}
                {locationText && (
                  <div className="border-b border-border-default pb-3">
                    <dt className="font-mono text-[11px] uppercase text-text-secondary">
                      {t('pages:companyDetail.locationLabel')}
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-1.5 text-text-primary">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      <span>{locationText}</span>
                    </dd>
                  </div>
                )}
                {dateRange && (
                  <div>
                    <dt className="font-mono text-[11px] uppercase text-text-secondary">
                      {t('pages:projectDetail.timelineLabel')}
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-text-primary">
                      {dateRange}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </aside>
        </div>

        {/* Published Related Projects (ONLY when > 0 — hidden otherwise) */}
        {relatedProjects.length > 0 && (
          <div className="space-y-4 border-t border-border-default pt-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary sm:text-2xl">
              <FolderKanban className="h-5 w-5 text-accent" aria-hidden="true" />
              <span>{t('pages:companyDetail.relatedProjectsHeading')}</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Related Experience (ONLY when actually linked — hidden otherwise) */}
        {relatedExperience.length > 0 && (
          <div className="space-y-4 border-t border-border-default pt-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary sm:text-2xl">
              <Briefcase className="h-5 w-5 text-accent" aria-hidden="true" />
              <span>{t('pages:companyDetail.relatedExperienceHeading')}</span>
            </h2>
            <ExperienceTimeline items={relatedExperience} />
          </div>
        )}
      </Container>
    </Section>
  );
}
