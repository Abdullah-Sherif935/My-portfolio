import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { SpecializationIconBadge } from '@/components/common/SpecializationIconBadge';
import { Reveal } from '@/components/animations/Reveal';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { getSpecializationProjectsHref } from '@/utils/specializationHelpers';

export function SpecializationsSection() {
  const { t } = useTranslation('common');
  const { pick } = useLanguage();
  const { specializations, projects, siteSettings } = usePortfolioData();
  const sectionConfig = siteSettings.homeSections.specializations;

  const visibleSpecs = specializations
    .filter((spec) => spec.isPublished !== false)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));

  if (!sectionConfig.visible || visibleSpecs.length === 0) {
    return null;
  }

  return (
    <Section id="specializations" surface="primary">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={pick(sectionConfig.eyebrow)}
            title={pick(sectionConfig.title)}
            subtitle={pick(sectionConfig.subtitle)}
          />

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {visibleSpecs.map((spec) => {
              const filterHref = getSpecializationProjectsHref(spec, projects);
              return (
                <Card key={spec.id} interactive className="flex h-full flex-col p-4 sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5">
                    <SpecializationIconBadge specialization={spec} size="md" />
                    <span className="font-mono text-[11px] text-text-secondary sm:text-xs">
                      {spec.code}
                    </span>
                  </div>

                  <h3 className="mb-1.5 text-base font-semibold text-text-primary sm:mb-2.5 sm:text-[19px]">
                    {pick(spec.title)}
                  </h3>

                  <p className="mb-3 flex-1 text-xs leading-relaxed text-text-secondary sm:mb-5 sm:text-sm">
                    {pick(spec.description)}
                  </p>

                  {spec.highlights.length > 0 && (
                    <ul className="mb-5 hidden space-y-1.5 border-t border-border-default pt-4 text-xs text-text-secondary sm:block">
                      {spec.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                          <span>{pick(item)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {filterHref && (
                    <Link
                      to={filterHref}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover sm:text-sm"
                    >
                      <span>{t('actions.relatedProjects')}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 rtl:-scale-x-100" aria-hidden="true" />
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
