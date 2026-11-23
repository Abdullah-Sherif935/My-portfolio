import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  Image as ImageIcon,
  Sliders,
  Target,
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
import { ProjectThumbnail } from './components/ProjectThumbnail';
import { ProjectCard } from './components/ProjectCard';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation(['pages', 'common']);
  const { pick } = useLanguage();
  const { projects, companies } = usePortfolioData();

  const orderedProjects = [...projects].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const currentIndex = orderedProjects.findIndex((item) => item.slug === slug);
  const project = currentIndex >= 0 ? orderedProjects[currentIndex] : undefined;

  useDocumentTitle(
    project ? pick(project.title) : t('pages:projectDetail.notFoundTitle')
  );

  if (!project) {
    return (
      <Section>
        <Container className="max-w-2xl text-center">
          <Card className="space-y-4 p-10">
            <p className="font-mono text-xs text-accent">
              {t('pages:projectDetail.notFoundCode')}
            </p>
            <h1 className="text-2xl font-bold text-text-primary">
              {t('pages:projectDetail.notFoundTitle')}
            </h1>
            <p className="text-sm text-text-secondary">
              {t('pages:projectDetail.notFoundDescription')}
            </p>
            <div className="pt-2">
              <ButtonLink to="/portfolio" variant="primary" size="md">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                <span>{t('common:actions.backToPortfolio')}</span>
              </ButtonLink>
            </div>
          </Card>
        </Container>
      </Section>
    );
  }

  const company = project.companyId
    ? companies.find((item) => item.id === project.companyId)
    : undefined;

  const previousProject =
    currentIndex > 0 ? orderedProjects[currentIndex - 1] : undefined;
  const nextProject =
    currentIndex < orderedProjects.length - 1
      ? orderedProjects[currentIndex + 1]
      : undefined;

  const relatedProjects = (() => {
    if (project.relatedProjectSlugs && project.relatedProjectSlugs.length > 0) {
      return orderedProjects.filter(
        (item) =>
          item.slug !== project.slug &&
          project.relatedProjectSlugs?.includes(item.slug)
      );
    }
    const sameCategory = orderedProjects.filter(
      (item) => item.slug !== project.slug && item.category === project.category
    );
    const others = orderedProjects.filter(
      (item) => item.slug !== project.slug && item.category !== project.category
    );
    return [...sameCategory, ...others].slice(0, 3);
  })();

  const caseStudy = project.caseStudy;
  const gallery = project.gallery ?? [];

  return (
    <Section>
      <Container className="space-y-10">
        <div>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t('common:actions.backToPortfolio')}</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="accent">{pick(project.categoryLabel)}</Badge>
            <Badge variant="muted" mono>
              {project.code}
            </Badge>
            <Badge variant="outline" mono>
              {pick(project.kindLabel)}
            </Badge>
          </div>
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
            {pick(project.title)}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {pick(project.shortDescription)}
          </p>
        </div>

        {/* Cover Image / Technical Schematic */}
        <Card className="overflow-hidden">
          <ProjectThumbnail
            variant={project.coverVariant}
            code={project.code}
            imageUrl={project.coverImageUrl}
            imageAlt={
              project.coverImageAlt
                ? pick(project.coverImageAlt)
                : pick(project.title)
            }
            className="aspect-[16/7] border-b-0"
          />
        </Card>

        {/* Structured Engineering Case Study + Metadata Sidebar */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* Overview */}
            <Card className="space-y-3 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-text-primary">
                {t('pages:projectDetail.overviewHeading')}
              </h2>
              <p className="text-[15px] leading-relaxed text-text-secondary sm:text-base">
                {pick(project.overview)}
              </p>
            </Card>

            {/* Challenge / Problem Statement */}
            <Card className="space-y-3 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                <Target className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>{t('pages:projectDetail.challengeHeading')}</span>
              </h2>
              {caseStudy?.challenge ? (
                <p className="text-[15px] leading-relaxed text-text-secondary sm:text-base">
                  {pick(caseStudy.challenge)}
                </p>
              ) : (
                <p className="rounded-xl border border-dashed border-border-default bg-bg-primary p-4 text-sm leading-relaxed text-text-secondary">
                  {t('pages:projectDetail.challengeEmpty')}
                </p>
              )}
            </Card>

            {/* Engineering Approach / Solution */}
            <Card className="space-y-3 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>{t('pages:projectDetail.solutionHeading')}</span>
              </h2>
              {caseStudy?.solution ? (
                <p className="text-[15px] leading-relaxed text-text-secondary sm:text-base">
                  {pick(caseStudy.solution)}
                </p>
              ) : (
                <p className="rounded-xl border border-dashed border-border-default bg-bg-primary p-4 text-sm leading-relaxed text-text-secondary">
                  {t('pages:projectDetail.solutionEmpty')}
                </p>
              )}
            </Card>

            {/* Verified Scope & Contributions */}
            {project.deliverables.length > 0 && (
              <Card className="space-y-4 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                  <ClipboardList className="h-5 w-5 text-accent" aria-hidden="true" />
                  <span>{t('pages:projectDetail.deliverablesHeading')}</span>
                </h2>
                <ul className="space-y-3">
                  {project.deliverables.map((deliverable, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-text-secondary sm:text-[15px]"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <span>{pick(deliverable)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Key Specifications */}
            <Card className="space-y-4 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                <Sliders className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>{t('pages:projectDetail.specsHeading')}</span>
              </h2>
              {caseStudy?.specifications && caseStudy.specifications.length > 0 ? (
                <dl className="grid gap-3 sm:grid-cols-2">
                  {caseStudy.specifications.map((spec, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border-default bg-bg-primary p-4"
                    >
                      <dt className="font-mono text-xs text-text-secondary">
                        {pick(spec.label)}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-text-primary">
                        {pick(spec.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="rounded-xl border border-dashed border-border-default bg-bg-primary p-4 text-sm leading-relaxed text-text-secondary">
                  {t('pages:projectDetail.specsEmpty')}
                </p>
              )}
            </Card>

            {/* Results / Outcomes */}
            <Card className="space-y-4 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-text-primary">
                {t('pages:projectDetail.outcomesHeading')}
              </h2>
              {caseStudy?.outcomes && caseStudy.outcomes.length > 0 ? (
                <ul className="space-y-3">
                  {caseStudy.outcomes.map((outcome, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-text-secondary sm:text-[15px]"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      <span>{pick(outcome)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-border-default bg-bg-primary p-4 text-sm leading-relaxed text-text-secondary">
                  {t('pages:projectDetail.outcomesEmpty')}
                </p>
              )}
            </Card>

            {/* Project Media & Gallery */}
            <Card className="space-y-4 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                <ImageIcon className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>{t('pages:projectDetail.galleryHeading')}</span>
              </h2>
              {gallery.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map((item, idx) => (
                    <figure
                      key={idx}
                      className="overflow-hidden rounded-xl border border-border-default bg-bg-primary"
                    >
                      <img
                        src={item.url}
                        alt={pick(item.alt)}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover"
                      />
                      {item.caption && (
                        <figcaption className="px-3.5 py-2.5 text-xs text-text-secondary">
                          {pick(item.caption)}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-border-default bg-bg-primary p-4 text-sm leading-relaxed text-text-secondary">
                  {t('pages:projectDetail.galleryEmpty')}
                </p>
              )}
            </Card>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <Card elevated className="space-y-4 p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                {t('pages:projectDetail.metadataHeading')}
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="border-b border-border-default pb-3">
                  <dt className="font-mono text-[11px] uppercase text-text-secondary">
                    {t('pages:projectDetail.codeLabel')}
                  </dt>
                  <dd className="mt-1 font-mono text-text-primary">{project.code}</dd>
                </div>
                <div className="border-b border-border-default pb-3">
                  <dt className="font-mono text-[11px] uppercase text-text-secondary">
                    {t('pages:projectDetail.typeLabel')}
                  </dt>
                  <dd className="mt-1 text-text-primary">{pick(project.kindLabel)}</dd>
                </div>
                <div className={company ? 'border-b border-border-default pb-3' : ''}>
                  <dt className="font-mono text-[11px] uppercase text-text-secondary">
                    {t('pages:projectDetail.categoryLabel')}
                  </dt>
                  <dd className="mt-1 text-text-primary">{pick(project.categoryLabel)}</dd>
                </div>
                {company && (
                  <div>
                    <dt className="font-mono text-[11px] uppercase text-text-secondary">
                      {t('pages:projectDetail.companyLabel')}
                    </dt>
                    <dd className="mt-1">
                      <Link
                        to={`/companies/${company.slug}`}
                        className="font-medium text-accent hover:text-accent-hover"
                      >
                        {pick(company.name)}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card className="space-y-4 p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t('pages:projectDetail.technologiesHeading')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-border-default bg-bg-primary px-3 py-1.5 font-mono text-xs text-text-primary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          </aside>
        </div>

        {/* Previous / Next Project Navigation */}
        {(previousProject || nextProject) && (
          <nav
            aria-label={t('pages:projectDetail.navigationLabel')}
            className="grid gap-4 border-t border-border-default pt-8 sm:grid-cols-2"
          >
            <div>
              {previousProject && (
                <Link
                  to={`/portfolio/${previousProject.slug}`}
                  className="group flex h-full flex-col justify-between gap-2 rounded-2xl border border-border-default bg-bg-secondary p-5 transition-colors hover:border-accent-border"
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary">
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                    <span>{t('common:actions.previousProject')}</span>
                  </span>
                  <span className="text-sm font-semibold text-text-primary transition-colors group-hover:text-accent sm:text-base">
                    {pick(previousProject.title)}
                  </span>
                </Link>
              )}
            </div>

            <div>
              {nextProject && (
                <Link
                  to={`/portfolio/${nextProject.slug}`}
                  className="group flex h-full flex-col items-end justify-between gap-2 rounded-2xl border border-border-default bg-bg-secondary p-5 text-end transition-colors hover:border-accent-border"
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary">
                    <span>{t('common:actions.nextProject')}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-text-primary transition-colors group-hover:text-accent sm:text-base">
                    {pick(nextProject.title)}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="space-y-5 border-t border-border-default pt-8">
            <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">
              {t('pages:projectDetail.relatedHeading')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((related) => (
                <ProjectCard key={related.id} project={related} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
