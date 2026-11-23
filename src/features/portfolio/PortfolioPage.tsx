import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PROJECTS, SPECIALIZATIONS } from '@/data';
import type { ProjectKind } from '@/types/portfolio';
import { ProjectCard } from './components/ProjectCard';
import { cn } from '@/utils/cn';

const KIND_LABELS: Record<ProjectKind, string> = {
  graduation: 'pages:portfolio.kindGraduation',
  engineering: 'pages:portfolio.kindEngineering',
  industrial: 'pages:portfolio.kindIndustrial',
};

export function PortfolioPage() {
  const { t } = useTranslation(['pages', 'home', 'common']);
  const { pick } = useLanguage();
  useDocumentTitle(t('pages:portfolio.pageTitle'));

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const activeType = searchParams.get('type') || 'all';
  const urlQuery = searchParams.get('q') || '';

  // Local controlled input state prevents dropped characters during rapid typing
  // while React Router commits search-param transitions asynchronously.
  const [searchInput, setSearchInput] = useState(urlQuery);

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  const availableKinds = useMemo(() => {
    const kinds = new Set<ProjectKind>();
    PROJECTS.forEach((p) => kinds.add(p.kind));
    return Array.from(kinds);
  }, []);

  const updateParam = (key: 'category' | 'type' | 'q', value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value || (key !== 'q' && value === 'all') || (key === 'q' && !value.trim())) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
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

    return PROJECTS.filter((project) => {
      if (activeCategory !== 'all' && project.category !== activeCategory) {
        return false;
      }
      if (activeType !== 'all' && project.kind !== activeType) {
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
        project.kindLabel.en,
        project.kindLabel.ar,
        ...project.technologies,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, activeType, searchInput]);

  const hasActiveFilters =
    activeCategory !== 'all' || activeType !== 'all' || searchInput.trim().length > 0;

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
          {/* Search & Project Type Controls */}
          <div className="mb-6 grid gap-3 sm:grid-cols-12">
            <div className="relative sm:col-span-7 lg:col-span-8">
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
                  className="absolute top-1/2 end-2.5 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="sm:col-span-5 lg:col-span-4">
              <label htmlFor="portfolio-kind-filter" className="sr-only">
                {t('pages:portfolio.kindFilterLabel')}
              </label>
              <select
                id="portfolio-kind-filter"
                value={activeType}
                onChange={(e) => updateParam('type', e.target.value)}
                className="h-11 w-full rounded-[10px] border border-border-default bg-bg-secondary px-3.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none cursor-pointer"
              >
                <option value="all">{t('pages:portfolio.allKinds')}</option>
                {availableKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {t(KIND_LABELS[kind])}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Discipline Filter Tabs */}
          <div
            role="tablist"
            aria-label={t('pages:portfolio.title')}
            className="mb-8 flex flex-wrap gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => updateParam('category', 'all')}
              className={cn(
                'rounded-[10px] border px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                activeCategory === 'all'
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary'
              )}
            >
              {t('pages:portfolio.allCategories')}
            </button>

            {SPECIALIZATIONS.map((spec) => {
              const isSelected = activeCategory === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => updateParam('category', spec.id)}
                  className={cn(
                    'rounded-[10px] border px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                    isSelected
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary'
                  )}
                >
                  {pick(spec.title)}
                </button>
              );
            })}
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
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
