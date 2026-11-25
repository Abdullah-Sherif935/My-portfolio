import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
  Sliders,
  Target,
  X,
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
import { resolvePortfolioCategories } from '@/utils/specializationHelpers';
import { resolveProjectViewerUrl } from '@/services/portfolioService';
import { ProjectThumbnail } from './components/ProjectThumbnail';
import { ProjectCard } from './components/ProjectCard';
import { ProjectMediaGallery } from './components/ProjectMediaGallery';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation(['pages', 'common']);
  const { pick } = useLanguage();
  const { projects, companies, specializations, isLoading, isLive } =
    usePortfolioData();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [viewerFailed, setViewerFailed] = useState(false);
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const nativeFullscreenActiveRef = useRef(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsEl =
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element | null })
          .webkitFullscreenElement;
      if (fsEl && fsEl === viewerContainerRef.current) {
        nativeFullscreenActiveRef.current = true;
        setIsViewerFullscreen(true);
      } else if (nativeFullscreenActiveRef.current) {
        nativeFullscreenActiveRef.current = false;
        setIsViewerFullscreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isViewerFullscreen) {
        setIsViewerFullscreen(false);
        if (document.fullscreenElement) {
          void document.exitFullscreen().catch(() => undefined);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isViewerFullscreen]);

  useEffect(() => {
    if (!isViewerFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isViewerFullscreen]);

  const orderedProjects = projects
    .filter((p) => p.isPublished !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const currentIndex = orderedProjects.findIndex((item) => item.slug === slug);
  const project = currentIndex >= 0 ? orderedProjects[currentIndex] : undefined;

  const customSeoTitle = project?.seoMeta?.title
    ? pick(project.seoMeta.title).trim()
    : '';
  useDocumentTitle(
    project
      ? customSeoTitle || pick(project.title)
      : t('pages:projectDetail.notFoundTitle')
  );

  // Avoid flashing stale static fallback SVG/category on cold load while Supabase fetches live data
  if (isLoading && !isLive) {
    return (
      <Section className="py-8 sm:py-10 lg:py-12">
        <Container className="space-y-8">
          <div className="h-5 w-32 animate-pulse rounded bg-bg-secondary" />
          <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-4 lg:col-span-7">
              <div className="flex gap-2">
                <div className="h-6 w-28 animate-pulse rounded-full bg-bg-secondary" />
                <div className="h-6 w-32 animate-pulse rounded-full bg-bg-secondary" />
              </div>
              <div className="h-10 w-5/6 animate-pulse rounded-lg bg-bg-secondary" />
              <div className="h-16 w-full animate-pulse rounded-lg bg-bg-secondary" />
            </div>
            <div className="lg:col-span-5">
              <div className="aspect-[16/10] max-h-[290px] w-full animate-pulse rounded-2xl border border-border-default bg-bg-secondary" />
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <div className="h-44 animate-pulse rounded-2xl border border-border-default bg-bg-secondary" />
              <div className="h-56 animate-pulse rounded-2xl border border-border-default bg-bg-secondary" />
            </div>
            <div className="space-y-6 lg:col-span-4">
              <div className="h-36 animate-pulse rounded-2xl border border-border-default bg-bg-secondary" />
            </div>
          </div>
        </Container>
      </Section>
    );
  }

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

  const allCategories = resolvePortfolioCategories(specializations, orderedProjects);
  const assignedCatIds =
    project.categoryIds && project.categoryIds.length > 0
      ? project.categoryIds
      : [project.category];
  const assignedCategories = assignedCatIds.map((catId) => {
    const found = allCategories.find((c) => c.id === catId);
    return {
      id: catId,
      label: found ? pick(found.label) : pick(project.categoryLabel),
    };
  });

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
    const myCats = new Set(assignedCatIds);
    const sameCategory = orderedProjects.filter((item) => {
      if (item.slug === project.slug) return false;
      const itemCats = item.categoryIds?.length ? item.categoryIds : [item.category];
      return itemCats.some((c) => myCats.has(c));
    });
    return sameCategory.slice(0, 3);
  })();

  const caseStudy = project.caseStudy;
  const gallery = (project.gallery ?? []).filter(
    (item) => Boolean(item.url?.trim()) && item.url !== project.coverImageUrl
  );
  const contributions = project.contributions ?? [];
  const attachments = project.attachments ?? [];
  const hasOverview = Boolean(pick(project.overview).trim());
  const hasChallenge = Boolean(caseStudy?.challenge && pick(caseStudy.challenge).trim());
  const hasSolution = Boolean(caseStudy?.solution && pick(caseStudy.solution).trim());
  const hasSpecs = Boolean(caseStudy?.specifications && caseStudy.specifications.length > 0);
  const hasOutcomes = Boolean(caseStudy?.outcomes && caseStudy.outcomes.length > 0);
  const hasEngineeringProcess = hasChallenge || hasSolution || hasSpecs || hasOutcomes;

  const viewer = project.viewerConfig;
  const resolvedViewerUrl = resolveProjectViewerUrl(viewer);
  const hasValidViewer = Boolean(resolvedViewerUrl);

  const handleEnterFullscreen = () => {
    const el = viewerContainerRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void })
      | null;
    setIsViewerFullscreen(true);
    if (!el) return;
    if (el.requestFullscreen) {
      void el.requestFullscreen().catch(() => {
        // Fallback: CSS full-viewport overlay remains active (e.g. iOS Safari)
      });
    } else if (el.webkitRequestFullscreen) {
      try {
        void el.webkitRequestFullscreen();
      } catch {
        // Fallback: CSS full-viewport overlay remains active
      }
    }
  };

  const handleExitFullscreen = () => {
    nativeFullscreenActiveRef.current = false;
    setIsViewerFullscreen(false);
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    if (doc.fullscreenElement && doc.exitFullscreen) {
      void doc.exitFullscreen().catch(() => undefined);
    } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
      try {
        void doc.webkitExitFullscreen();
      } catch {
        // ignore
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (isViewerFullscreen) {
      handleExitFullscreen();
    } else {
      handleEnterFullscreen();
    }
  };

  const dateRange = [project.startDate, project.completionDate]
    .filter(Boolean)
    .join(' – ');

  return (
    <Section className="py-8 sm:py-10 lg:py-12">
      <Container className="space-y-8">
        <div>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t('common:actions.backToPortfolio')}</span>
          </Link>
        </div>

        {/* Split Hero: Title & Summary alongside compact clickable Cover Card */}
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              {assignedCategories.map((cat) => (
                <Link key={cat.id} to={`/portfolio?category=${encodeURIComponent(cat.id)}`}>
                  <Badge variant="accent">{cat.label}</Badge>
                </Link>
              ))}
              <Badge variant="outline" mono>
                {pick(project.kindLabel)}
              </Badge>
              {dateRange && (
                <Badge variant="muted" mono>
                  <Calendar className="me-1 inline h-3 w-3" aria-hidden="true" />
                  {dateRange}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-[38px] lg:leading-[1.15]">
              {pick(project.title)}
            </h1>
            {pick(project.shortDescription).trim() && (
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                {pick(project.shortDescription)}
              </p>
            )}
          </div>

          <div className="lg:col-span-5">
            <Card className="overflow-hidden">
              {project.coverImageUrl ? (
                <button
                  type="button"
                  onClick={() => setLightboxUrl(project.coverImageUrl ?? null)}
                  aria-label={
                    project.coverImageAlt
                      ? pick(project.coverImageAlt)
                      : pick(project.title)
                  }
                  className="group relative block w-full cursor-zoom-in bg-bg-primary"
                >
                  <img
                    src={project.coverImageUrl}
                    alt={
                      project.coverImageAlt
                        ? pick(project.coverImageAlt)
                        : pick(project.title)
                    }
                    className="aspect-[16/10] max-h-[290px] w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <span className="pointer-events-none absolute end-3 bottom-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-secondary/90 text-text-secondary opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              ) : (
                <ProjectThumbnail
                  variant={project.coverVariant}
                  code={project.code}
                  imageUrl={null}
                  imageAlt={pick(project.title)}
                  className="aspect-[16/10] max-h-[290px] border-b-0"
                />
              )}
            </Card>
          </div>
        </div>

        {/* Main Content + Sidebar (Zero Empty Sections) */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* 1. Overview */}
            {hasOverview && (
              <Card className="space-y-3 p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-text-primary">
                  {t('pages:projectDetail.overviewHeading')}
                </h2>
                <p className="text-[15px] leading-relaxed text-text-secondary sm:text-base">
                  {pick(project.overview)}
                </p>
              </Card>
            )}

            {/* 4. My Role & Contributions (Structured contributions OR legacy deliverables) */}
            {(contributions.length > 0 || project.deliverables.length > 0) && (
              <Card className="space-y-4 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                  <ClipboardList className="h-5 w-5 text-accent" aria-hidden="true" />
                  <span>{t('pages:projectDetail.deliverablesHeading')}</span>
                </h2>

                {contributions.length > 0 && (
                  <div className="space-y-3">
                    {contributions.map((contrib) => (
                      <div
                        key={contrib.id}
                        className="rounded-xl border border-border-default bg-bg-primary p-4"
                      >
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary sm:text-base">
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-accent"
                            aria-hidden="true"
                          />
                          <span>{pick(contrib.title)}</span>
                        </h3>
                        {pick(contrib.description).trim() && (
                          <p className="mt-1.5 ps-6 text-xs leading-relaxed text-text-secondary sm:text-sm">
                            {pick(contrib.description)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {project.deliverables.length > 0 && (
                  <ul className="space-y-2.5">
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
                )}
              </Card>
            )}

            {/* 5. Engineering Process (ONLY if content exists) */}
            {hasEngineeringProcess && (
              <Card className="space-y-5 p-6 sm:p-8">
                {hasChallenge && caseStudy?.challenge && (
                  <div className="space-y-2">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                      <Target className="h-5 w-5 text-accent" aria-hidden="true" />
                      <span>{t('pages:projectDetail.challengeHeading')}</span>
                    </h2>
                    <p className="text-[15px] leading-relaxed text-text-secondary">
                      {pick(caseStudy.challenge)}
                    </p>
                  </div>
                )}

                {hasSolution && caseStudy?.solution && (
                  <div className="space-y-2">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                      <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
                      <span>{t('pages:projectDetail.solutionHeading')}</span>
                    </h2>
                    <p className="text-[15px] leading-relaxed text-text-secondary">
                      {pick(caseStudy.solution)}
                    </p>
                  </div>
                )}

                {hasSpecs && caseStudy?.specifications && (
                  <div className="space-y-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                      <Sliders className="h-5 w-5 text-accent" aria-hidden="true" />
                      <span>{t('pages:projectDetail.specsHeading')}</span>
                    </h2>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {caseStudy.specifications.map((spec, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-border-default bg-bg-primary p-3.5"
                        >
                          <dt className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                            {pick(spec.label)}
                          </dt>
                          <dd className="mt-1 text-sm font-semibold text-text-primary">
                            {pick(spec.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {hasOutcomes && caseStudy?.outcomes && (
                  <div className="space-y-2.5">
                    <h2 className="text-lg font-semibold text-text-primary">
                      {t('pages:projectDetail.outcomesHeading')}
                    </h2>
                    <ul className="space-y-2">
                      {caseStudy.outcomes.map((outcome, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-text-secondary"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                            aria-hidden="true"
                          />
                          <span>{pick(outcome)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {/* 7. Interactive Project Media & Technical Gallery (hidden when empty) */}
            {gallery.length > 0 && (
              <ProjectMediaGallery
                images={gallery}
                projectTitle={pick(project.title)}
              />
            )}

            {/* 8. Interactive 3D / eDrawings Viewer (ONLY if enabled & valid isolated/HTTPS URL) */}
            {hasValidViewer && viewer && resolvedViewerUrl && (
              <Card className="space-y-4 p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                    <Box className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span>
                      {viewer.title && pick(viewer.title).trim()
                        ? pick(viewer.title)
                        : t('pages:projectDetail.viewerHeading')}
                    </span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleFullscreen}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t('pages:projectDetail.fullscreenViewer')}</span>
                    </button>
                    <a
                      href={resolvedViewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1.5 text-xs font-medium text-accent transition-colors hover:border-accent"
                    >
                      <span>{t('pages:projectDetail.openViewerExternal')}</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {viewerFailed ? (
                  <div className="rounded-xl border border-border-default bg-bg-primary p-6 text-center text-sm text-text-secondary">
                    {viewer.fallbackMessage && pick(viewer.fallbackMessage).trim()
                      ? pick(viewer.fallbackMessage)
                      : t('pages:projectDetail.viewerFallback')}
                  </div>
                ) : (
                  <div
                    ref={viewerContainerRef}
                    className={
                      isViewerFullscreen
                        ? 'fixed inset-0 z-[9999] flex h-[100dvh] w-full flex-col overflow-hidden bg-bg-primary'
                        : 'overflow-hidden rounded-xl border border-border-default bg-bg-primary'
                    }
                  >
                    {isViewerFullscreen && (
                      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-default bg-bg-secondary/95 px-3 py-2.5 backdrop-blur sm:px-5">
                        <div className="flex min-w-0 items-center gap-2">
                          <Box
                            className="h-4 w-4 shrink-0 text-accent"
                            aria-hidden="true"
                          />
                          <span className="truncate text-xs font-semibold text-text-primary sm:text-sm">
                            {viewer.title && pick(viewer.title).trim()
                              ? pick(viewer.title)
                              : pick(project.title)}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <a
                            href={resolvedViewerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden items-center gap-1 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent sm:inline-flex"
                          >
                            <span>{t('pages:projectDetail.openViewerExternal')}</span>
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                          <button
                            type="button"
                            onClick={handleExitFullscreen}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90"
                          >
                            <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t('pages:projectDetail.exitFullscreenViewer')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                    <iframe
                      title={
                        viewer.title && pick(viewer.title).trim()
                          ? pick(viewer.title)
                          : pick(project.title)
                      }
                      src={resolvedViewerUrl}
                      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-downloads"
                      allow="fullscreen; xr-spatial-tracking"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() => setViewerFailed(true)}
                      style={
                        isViewerFullscreen
                          ? undefined
                          : { height: `${viewer.heightPx ?? 540}px` }
                      }
                      className={
                        isViewerFullscreen
                          ? 'min-h-0 h-full w-full flex-1 border-0'
                          : 'w-full border-0'
                      }
                    />
                  </div>
                )}
              </Card>
            )}

            {/* 9. Project Attachments (ONLY if available) */}
            {attachments.length > 0 && (
              <Card className="space-y-4 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                  <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                  <span>{t('pages:projectDetail.attachmentsHeading')}</span>
                </h2>
                <div className="divide-y divide-border-default">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-text-primary">
                          {pick(att.title)}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="accent" mono>
                            {att.fileType}
                          </Badge>
                          {att.fileSizeLabel && (
                            <Badge variant="muted" mono>
                              {att.fileSizeLabel}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {att.downloadable !== false && (
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-accent/40 bg-accent-subtle px-3.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{t('pages:projectDetail.downloadAttachment')}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Client Information (when applicable) */}
            {company && (
              <Card elevated className="space-y-3 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  {t('pages:projectDetail.companyLabel')}
                </h2>
                <Link
                  to={`/companies/${company.slug}`}
                  className="block rounded-xl border border-border-default bg-bg-primary p-4 transition-colors hover:border-accent"
                >
                  <p className="text-base font-semibold text-text-primary">
                    {pick(company.name)}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {pick(company.industry)}
                  </p>
                </Link>
              </Card>
            )}

            {/* Tools & Technologies */}
            {project.technologies.length > 0 && (
              <Card elevated className="space-y-3 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
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
            )}

            {/* Metadata */}
            <Card className="space-y-3 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                {t('pages:projectDetail.metadataHeading')}
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-mono text-[11px] uppercase text-text-secondary">
                    {t('pages:projectDetail.categoryLabel')}
                  </dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {assignedCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/portfolio?category=${encodeURIComponent(cat.id)}`}
                        className="rounded-md border border-border-default bg-bg-primary px-2 py-0.5 text-xs font-medium text-text-primary hover:border-accent hover:text-accent"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </dd>
                </div>
                {dateRange && (
                  <div>
                    <dt className="font-mono text-[11px] uppercase text-text-secondary">
                      {t('pages:projectDetail.timelineLabel')}
                    </dt>
                    <dd className="font-mono text-xs font-medium text-text-primary">
                      {dateRange}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </aside>
        </div>

        {/* 10. Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="space-y-5 border-t border-border-default pt-10">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('pages:projectDetail.relatedHeading')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((rel) => (
                <ProjectCard key={rel.id} project={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Previous / Next Navigation */}
        {(previousProject || nextProject) && (
          <nav
            aria-label={t('pages:projectDetail.navigationLabel')}
            className="grid gap-4 border-t border-border-default pt-8 sm:grid-cols-2"
          >
            <div>
              {previousProject && (
                <Link
                  to={`/portfolio/${previousProject.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-border-default bg-bg-secondary p-4 transition-colors hover:border-accent"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0 text-accent rtl:rotate-180" />
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase text-text-secondary">
                      {t('common:actions.previousProject')}
                    </p>
                    <p className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
                      {pick(previousProject.title)}
                    </p>
                  </div>
                </Link>
              )}
            </div>
            <div>
              {nextProject && (
                <Link
                  to={`/portfolio/${nextProject.slug}`}
                  className="group flex items-center justify-end gap-3 rounded-xl border border-border-default bg-bg-secondary p-4 text-end transition-colors hover:border-accent"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase text-text-secondary">
                      {t('common:actions.nextProject')}
                    </p>
                    <p className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
                      {pick(nextProject.title)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-accent rtl:rotate-180" />
                </Link>
              )}
            </div>
          </nav>
        )}
      </Container>

      {/* Lightbox Modal for Gallery Images */}
      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label={t('common:actions.close')}
            className="absolute top-4 end-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <img
            src={lightboxUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain"
          />
        </div>
      )}
    </Section>
  );
}
