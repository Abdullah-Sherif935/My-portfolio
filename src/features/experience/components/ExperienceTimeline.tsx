import { Link } from 'react-router-dom';
import { ArrowUpRight, Briefcase, Calendar, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import type { ExperienceItem } from '@/types/portfolio';

interface ExperienceTimelineProps {
  items: ExperienceItem[];
}

export function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  const { t } = useTranslation(['home', 'common']);
  const { pick } = useLanguage();
  const { projects } = usePortfolioData();

  return (
    <ol className="relative space-y-4 border-s-2 border-border-default ps-5 sm:space-y-6 sm:ps-8">
      {items.map((item) => {
        const linkedProjects = projects.filter((project) =>
          item.relatedProjectSlugs.includes(project.slug)
        );

        return (
          <li key={item.id} className="relative">
            {/* Timeline Node */}
            <span
              aria-hidden="true"
              className="absolute -start-[29px] top-6 flex h-4 w-4 items-center justify-center rounded-full border-2 border-accent bg-bg-primary sm:-start-[41px] sm:top-7"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>

            <Card className="p-4 sm:p-6">
              <div className="mb-3 flex flex-col gap-2.5 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.kind === 'employment' ? 'accent' : 'default'}>
                      {pick(item.kindLabel)}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary sm:text-xl">
                    {pick(item.role)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary sm:text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                      <Briefcase className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      {pick(item.company)}
                    </span>
                    {item.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-text-secondary" aria-hidden="true" />
                        {pick(item.location)}
                      </span>
                    )}
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 font-mono text-[11px] text-text-secondary sm:px-3 sm:py-1.5 sm:text-xs">
                  <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {pick(item.period)}
                </span>
              </div>

              {item.summary && (
                <p className="mb-3 text-xs leading-relaxed text-text-secondary sm:mb-4 sm:text-[15px]">
                  {pick(item.summary)}
                </p>
              )}

              {item.responsibilities.length > 0 && (
                <div className={linkedProjects.length > 0 ? 'mb-4 sm:mb-5' : ''}>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-text-secondary sm:mb-2.5">
                    {t('home:experience.responsibilitiesLabel')}
                  </p>
                  <ul className="space-y-1.5 text-xs text-text-secondary sm:space-y-2 sm:text-sm">
                    {item.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent sm:mt-2"
                        />
                        <span className="leading-relaxed">{pick(resp)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {linkedProjects.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border-default pt-3 sm:pt-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                    {t('common:actions.relatedProjects')}:
                  </span>
                  {linkedProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/portfolio/${project.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-xs font-medium text-text-primary transition-colors hover:border-accent-border hover:text-accent"
                    >
                      <span>{pick(project.title)}</span>
                      <ArrowUpRight className="h-3 w-3 rtl:-scale-x-100" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
