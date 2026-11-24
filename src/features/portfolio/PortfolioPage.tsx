import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import {
  resolvePortfolioCategories,
  resolveSpecializationProjects,
} from '@/utils/specializationHelpers';
import type { Project, ProjectGroup } from '@/types/portfolio';
import { ProjectCard } from './components/ProjectCard';
import { cn } from '@/utils/cn';

const PROJECT_GROUPS: Array<{
  id: ProjectGroup;
  headingKey: string;
  descKey: string;
}> = [
  {
    id: 'professional',
    headingKey: 'pages:portfolio.groupProfessional',
    descKey: 'pages:portfolio.groupProfessionalDesc',
  },
  {
    id: 'academic',
    headingKey: 'pages:portfolio.groupAcademic',
    descKey: 'pages:portfolio.groupAcademicDesc',
  },
  {
    id: 'personal',
    headingKey: 'pages:portfolio.groupPersonal',
    descKey: 'pages:portfolio.groupPersonalDesc',
  },
];

export function PortfolioPage() {
  const { t } = useTranslation(['pages', 'home', 'common']);
  const { pick } = useLanguage();
  const { projects, specializations } = usePortfolioData();
  useDocumentTitle(t('pages:portfolio.pageTitle'));

  const [searchParams, setSearchParams] = useSearchParams();
  const activeSpecializationId = searchParams.get('specialization') || '';
  const activeCategory = searchParams.get('category') || 'all';
  const activeGroup = (searchParams.get('group') || 'all') as 'all' | ProjectGroup;
  const featuredOnly = searchParams.get('featured') === '1';
  const urlQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(urlQuery);

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  const publishedProjects = useMemo(
    () =>
      projects
        .filter((p) => p.isPublished !== false)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [projects]
  );

  const publishedSpecializations = useMemo(
    () =>
      specializations
        .filter((s) => s.isPublished !== false)
        .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99)),
    [specializations]
  );

  // Dynamic category filters derived strictly from categories assigned to published projects
  const dynamicCategories = useMemo(
    () =>
      resolvePortfolioCategories(publishedSpecializations, publishedProjects).filter(
        (cat) => cat.publishedProjectCount > 0 || cat.id === activeCategory
      ),
    [publishedSpecializations, publishedProjects, activeCategory]
  );

  const activeSpecialization = useMemo(
    () =>
      activeSpecializationId
        ? publishedSpecializations.find((s) => s.id === activeSpecializationId) ?? null
        : null,
    [activeSpecializationId, publishedSpecializations]
  );

  const updateParam = (
    key: 'category' | 'group' | 'featured' | 'q',
    value: string
  ) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (key === 'category') {
          next.delete('specialization');
        }
        if (
          !value ||
          (key !== 'q' && (value === 'all' || value === '0')) ||
          (key === 'q' && !value.trim())
        ) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true }
    );
  };

  const clearSpecializationParam = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('specialization');
        return next;
      },
      { replace: true }
    );
  };

  const handleSearchChange = (nextValue: string) => {
    setSearchInput(nextValue);
    updateParam('q', nextValue);
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchInput.trim().toLowerCase();
    const baseProjects = activeSpecialization
      ? resolveSpecializationProjects(activeSpecialization, publishedProjects)
      : publishedProjects;

    return baseProjects.filter((project) => {
      if (!activeSpecialization && activeCategory !== 'all') {
        const cats =
          project.categoryIds && project.categoryIds.length > 0
            ? project.categoryIds
            : [project.category];
        if (!cats.includes(activeCategory) && project.category !== activeCategory) {
          return false;
        }
      }
      if (
        activeGroup !== 'all' &&
        (project.projectGroup ?? 'academic') !== activeGroup
      ) {
        return false;
      }
      if (featuredOnly && !project.featured) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        project.code,
        project.title.en,
        project.title.ar,
        project.shortDescription.en,
        project.shortDescription.ar,
        project.overview.en,
        project.overview.ar,
        project.categoryLabel.en,
        project.categoryLabel.ar,
        ...project.technologies,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [
    publishedProjects,
    activeSpecialization,
    activeCategory,
    activeGroup,
    featuredOnly,
    searchInput,
  ]);

  const groupedProjects = useMemo(() => {
    const map: Record<ProjectGroup, Project[]> = {
      professional: [],
      academic: [],
      personal: [],
    };
    for (const proj of filteredProjects) {
      const grp: ProjectGroup = proj.projectGroup ?? 'academic';
      map[grp].push(proj);
    }
    return map;
  }, [filteredProjects]);

  const hasActiveFilters =
    Boolean(activeSpecialization) ||
    activeCategory !== 'all' ||
    activeGroup !== 'all' ||
    featuredOnly ||
    searchInput.trim().length > 0;

  const countText =
    filteredProjects.length === 1
      ? t('pages:portfolio.countSingle')
      : t('pages:portfolio.countLabel', { count: filteredProjects.length });

  return (
    <>
      <PageHeader
        eyebrow={t('pages:portfolio.eyebrow')}
        title={t('pages:portfolio.title')}
        subtitle={t('pages:portfolio.subtitle')}
        badge={
          <Badge variant="muted" mono>
            {countText}
          </Badge>
        }
      />

      <Section>
        <Container>
          {/* Search, Project Type Group & Featured Controls */}
          <div className="mb-5 grid gap-3 sm:grid-cols-12">
            <div className="relative sm:col-span-6 lg:col-span-6">
              <label htmlFor="portfolio-search" className="sr-only">
                {t('pages:portfolio.searchLabel')}
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-text-secondary"
              />
              <input
                id="portfolio-search"
                type="search"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('pages:portfolio.searchPlaceholder')}
                className="h-11 w-full rounded-[10px] border border-border-default bg-bg-secondary ps-10 pe-10 text-sm text-text-primary placeholder:text-text-secondary/75 transition-colors focus:border-accent focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  aria-label={t('common:actions.clearSearch')}
                  className="absolute top-1/2 end-2.5 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="sm:col-span-4 lg:col-span-4">
              <label htmlFor="portfolio-group-filter" className="sr-only">
                {t('pages:portfolio.kindFilterLabel')}
              </label>
              <select
                id="portfolio-group-filter"
                value={activeGroup}
                onChange={(e) => updateParam('group', e.target.value)}
                className="h-11 w-full cursor-pointer rounded-[10px] border border-border-default bg-bg-secondary px-3.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none"
              >
                <option value="all">{t('pages:portfolio.allKinds')}</option>
                <option value="professional">
                  {t('pages:portfolio.groupProfessional')}
                </option>
                <option value="academic">
                  {t('pages:portfolio.groupAcademic')}
                </option>
                <option value="personal">
                  {t('pages:portfolio.groupPersonal')}
                </option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <button
                type="button"
                aria-pressed={featuredOnly}
                onClick={() => updateParam('featured', featuredOnly ? '0' : '1')}
                className={cn(
                  'inline-flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-3 text-xs font-semibold transition-colors sm:text-sm',
                  featuredOnly
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary'
                )}
              >
                <Star className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('pages:portfolio.featuredFilter')}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Category Filter Tabs */}
          <div
            role="tablist"
            aria-label={t('pages:portfolio.title')}
            className="mb-8 flex flex-wrap gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!activeSpecialization && activeCategory === 'all'}
              onClick={() => updateParam('category', 'all')}
              className={cn(
                'cursor-pointer rounded-[10px] border px-4 py-2 text-sm font-medium transition-colors',
                !activeSpecialization && activeCategory === 'all'
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary'
              )}
            >
              {t('pages:portfolio.allCategories')}
            </button>

            {dynamicCategories.map((cat) => {
              const isSelected = !activeSpecialization && activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => updateParam('category', cat.id)}
                  className={cn(
                    'cursor-pointer rounded-[10px] border px-4 py-2 text-sm font-medium transition-colors',
                    isSelected
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary'
                  )}
                >
                  {pick(cat.label)}
                </button>
              );
            })}
          </div>

          {activeSpecialization && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent-subtle px-4 py-3 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" mono>
                  {activeSpecialization.code}
                </Badge>
                <span className="font-medium text-text-primary">
                  {t('pages:portfolio.filteredBySpecialization', {
                    name: pick(activeSpecialization.title),
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={clearSpecializationParam}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('common:actions.resetFilters')}</span>
              </button>
            </div>
          )}

          {filteredProjects.length > 0 ? (
            <div className="space-y-12">
              {PROJECT_GROUPS.map((group) => {
                const items = groupedProjects[group.id];
                if (items.length === 0) return null;
                return (
                  <div key={group.id} className="space-y-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-default pb-3">
                      <div>
                        <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">
                          {t(group.headingKey)}
                        </h2>
                        <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                          {t(group.descKey)}
                        </p>
                      </div>
                      <Badge variant="muted" mono>
                        {items.length}
                      </Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="space-y-4 p-10 text-center">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('pages:portfolio.emptyTitle')}
              </h2>
              <p className="mx-auto max-w-md text-sm text-text-secondary">
                {t('pages:portfolio.emptyDescription')}
              </p>
              {hasActiveFilters && (
                <div className="pt-1">
                  <Button variant="outline" size="sm" onClick={resetAllFilters}>
                    {t('common:actions.resetFilters')}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </Container>
      </Section>
    </>
  );
}
