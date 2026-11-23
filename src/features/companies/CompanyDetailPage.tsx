import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building2, FolderKanban, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { PlaceholderNotice } from '@/components/common/PlaceholderNotice';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { ProjectCard } from '@/features/portfolio/components/ProjectCard';
import { ExperienceTimeline } from '@/features/experience/components/ExperienceTimeline';

export function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation(['pages', 'home', 'common']);
  const { pick } = useLanguage();
  const { companies, experience, projects } = usePortfolioData();

  const company = companies.find((item) => item.slug === slug);

  useDocumentTitle(
    company ? pick(company.name) : t('pages:companyDetail.notFoundTitle')
  );

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
      project.companyId === company.id ||
      company.relatedProjectSlugs.includes(project.slug)
  );

  const relatedExperience = experience.filter(
    (exp) => exp.companyId === company.id
  );

  return (
    <Section>
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
                <Badge variant="muted" mono className="whitespace-nowrap">
                  {company.dataSource === 'cv-initial'
                    ? t('common:badges.cvInitial')
                    : t('common:badges.placeholder')}
                </Badge>
                {!company.logoUrl && (
                  <span className="font-mono text-xs text-text-secondary">
                    {t('home:companies.logoPlaceholder')}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                {pick(company.name)}
              </h1>
            </div>
          </div>
        </div>

        {company.dataSource === 'placeholder' && (
          <PlaceholderNotice text={t('pages:companyDetail.placeholderNotice')} />
        )}

        {/* Main Content + Metadata Sidebar */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* Company Overview */}
            <Card className="space-y-3 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                <Building2 className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>{t('pages:companyDetail.overviewHeading')}</span>
              </h2>
              {company.overview ? (
                <p className="text-[15px] leading-relaxed text-text-secondary sm:text-base">
                  {pick(company.overview)}
                </p>
              ) : (
                <p className="rounded-xl border border-dashed border-border-default bg-bg-primary p-4 text-sm leading-relaxed text-text-secondary">
                  {t('pages:companyDetail.overviewEmpty')}
                </p>
              )}
            </Card>

            {/* Services Scope */}
            <Card className="space-y-4 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                <Layers className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>{t('pages:companyDetail.servicesHeading')}</span>
              </h2>
              <ul className="space-y-2.5 text-sm text-text-secondary sm:text-[15px]">
                {company.servicesProvided.map((service, idx) => (
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
          </div>

          <aside className="lg:col-span-4">
            <Card elevated className="space-y-4 p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                {t('pages:companyDetail.metadataHeading')}
              </h2>
              <dl className="space-y-3.5 text-sm">
                <div className="border-b border-border-default pb-3">
                  <dt className="font-mono text-[11px] uppercase text-text-secondary">
                    {t('pages:companyDetail.industryLabel')}
                  </dt>
                  <dd className="mt-1 text-text-primary">{pick(company.industry)}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase text-text-secondary">
                    {t('pages:companyDetail.relationshipLabel')}
                  </dt>
                  <dd className="mt-1 text-text-secondary">
                    {pick(company.relationshipType)}
                  </dd>
                </div>
              </dl>
            </Card>
          </aside>
        </div>

        {/* Related Projects Section */}
        <div className="space-y-4 pt-2">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary sm:text-2xl">
            <FolderKanban className="h-5 w-5 text-accent" aria-hidden="true" />
            <span>{t('pages:companyDetail.relatedProjectsHeading')}</span>
          </h2>
          {relatedProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed p-6">
              <p className="text-sm text-text-secondary">
                {t('pages:companyDetail.relatedProjectsEmpty')}
              </p>
            </Card>
          )}
        </div>

        {/* Related Professional Experience Section */}
        <div className="space-y-4 pt-2">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary sm:text-2xl">
            <Briefcase className="h-5 w-5 text-accent" aria-hidden="true" />
            <span>{t('pages:companyDetail.relatedExperienceHeading')}</span>
          </h2>
          {relatedExperience.length > 0 ? (
            <ExperienceTimeline items={relatedExperience} />
          ) : (
            <Card className="border-dashed p-6">
              <p className="text-sm text-text-secondary">
                {t('pages:companyDetail.relatedExperienceEmpty')}
              </p>
            </Card>
          )}
        </div>
      </Container>
    </Section>
  );
}
