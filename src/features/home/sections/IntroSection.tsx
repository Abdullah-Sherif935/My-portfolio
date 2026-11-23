import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, GraduationCap } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/animations/Reveal';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function IntroSection() {
  const { pick } = useLanguage();
  const { education: educationList, projects, siteSettings } = usePortfolioData();
  const intro = siteSettings.homeSections.intro;

  if (!intro.visible) {
    return null;
  }

  const education = educationList[0];
  const graduationProject = education?.graduationProjectSlug
    ? projects.find((project) => project.slug === education.graduationProjectSlug)
    : undefined;

  return (
    <Section id="introduction" surface="secondary">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={pick(intro.eyebrow)}
            title={pick(intro.title)}
          />

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Start Column: Consolidated Summary + Education Card */}
              <div
                className={
                  intro.showPillars
                    ? 'space-y-4 sm:space-y-6 lg:col-span-6'
                    : 'space-y-4 sm:space-y-6 lg:col-span-12'
                }
              >
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  {pick(intro.description)}
                </p>

                  {
                    intro.showEducationCard && education && (
                      <Card elevated className="p-4 sm:p-5">
                        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
                          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-accent sm:text-xs">
                            <GraduationCap className="h-4 w-4" aria-hidden="true" />
                            {pick(intro.educationLabel)}
                          </span>
                          <Badge variant="muted" mono>
                            {pick(education.period)}
                          </Badge>
                        </div>
                        <h3 className="text-[15px] font-semibold text-text-primary sm:text-lg">
                          {pick(education.degree)}
                        </h3>
                        <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                          {pick(education.institution)}
                          {intro.showGpa && education.grade
                            ? ` · ${pick(education.grade)}`
                            : ''}
                        </p>
                          {
                            intro.showGraduationProject && graduationProject && (
                              <div className="mt-3 border-t border-border-default pt-2.5 sm:mt-4 sm:pt-3">
                                <Link
                                  to={`/portfolio/${graduationProject.slug}`}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
                                >
                                  <span>
                                    {pick(intro.graduationProjectLabel)}:{' '}
                                    {pick(graduationProject.title)}
                                  </span>
                                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" aria-hidden="true" />
                                </Link>
                              </div>
                            )
                          }
                </Card>
                    )
                  }

                  < div className="pt-0.5">
                <ButtonLink to="/about" variant="outline" size="sm" className="sm:h-11 sm:px-5 sm:text-sm">
                  <span>{pick(intro.ctaLabel)}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>

            {/* End Column: Compact Core Engineering Pillars */}
            {intro.showPillars && intro.pillars.length > 0 && (
              <div className="space-y-3 sm:space-y-4 lg:col-span-6">
                <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-secondary sm:text-xs">
                  {pick(intro.pillarsTitle)}
                </p>
                {intro.pillars.map((pillar, idx) => (
                  <Card key={`${pillar.code}-${idx}`} elevated className="p-4 sm:p-5">
                    <div className="mb-1 flex items-center gap-2.5 sm:mb-1.5 sm:gap-3">
                      <span className="font-mono text-[11px] font-semibold text-accent sm:text-xs">
                        {pillar.code}
                      </span>
                      <h3 className="text-[15px] font-semibold text-text-primary sm:text-base">
                        {pick(pillar.title)}
                      </h3>
                    </div>
                    <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
                      {pick(pillar.description)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
