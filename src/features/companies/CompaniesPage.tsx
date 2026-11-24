import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { CompanyCard } from './components/CompanyCard';
import { cn } from '@/utils/cn';

export function CompaniesPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { pick } = useLanguage();
  const { companies, isLoading, isLive, error } = usePortfolioData();
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  useDocumentTitle(t('pages:companies.pageTitle'));

  const publishedCompanies = useMemo(
    () =>
      companies
        .filter((c) => c.isPublished !== false)
        .sort((a, b) => {
          if (Boolean(b.featured) !== Boolean(a.featured)) {
            return b.featured ? 1 : -1;
          }
          return a.displayOrder - b.displayOrder;
        }),
    [companies]
  );

  const industries = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of publishedCompanies) {
      const label = pick(c.industry).trim();
      if (label && !label.toLowerCase().includes('to be')) {
        map.set(label.toLowerCase(), label);
      }
    }
    return Array.from(map.values());
  }, [publishedCompanies, pick]);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publishedCompanies.filter((c) => {
      if (
        selectedIndustry !== 'all' &&
        pick(c.industry).trim().toLowerCase() !== selectedIndustry.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      return [
        c.name.en,
        c.name.ar,
        c.industry.en,
        c.industry.ar,
        c.shortDescription?.en ?? '',
        c.shortDescription?.ar ?? '',
        c.location?.en ?? '',
        c.location?.ar ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [publishedCompanies, search, selectedIndustry, pick]);

  return (
    <>
      <PageHeader
        eyebrow={t('pages:companies.eyebrow')}
        title={t('pages:companies.title')}
        subtitle={t('pages:companies.subtitle')}
      />

      <Section>
        <Container className="space-y-6">
          {/* Search & Dynamic Industry Filters */}
          {publishedCompanies.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
                  aria-hidden="true"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('pages:companies.searchPlaceholder')}
                  className="h-10 w-full rounded-xl border border-border-default bg-bg-secondary ps-9 pe-8 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label={t('common:actions.close')}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-text-secondary hover:text-text-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {industries.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIndustry('all')}
                    className={cn(
                      'cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                      selectedIndustry === 'all'
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {t('pages:companies.filterAll')}
                  </button>
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setSelectedIndustry(ind)}
                      className={cn(
                        'cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                        selectedIndustry === ind
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                      )}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <Card className="border-error/40 bg-error-subtle p-4 text-xs text-error">
              {error}
            </Card>
          )}

          {isLoading && !isLive ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-52 animate-pulse rounded-2xl border border-border-default bg-bg-secondary"
                />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <Card className="p-8 text-center text-sm text-text-secondary">
              {t('pages:companies.emptyState')}
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} detailed />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
