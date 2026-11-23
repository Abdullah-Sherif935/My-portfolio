import { Link } from 'react-router-dom';
import { ArrowUpRight, GraduationCap, Languages, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { SpecializationIconBadge } from '@/components/common/SpecializationIconBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function AboutPage() {
  const { t } = useTranslation(['pages', 'common', 'home']);
  const { pick } = useLanguage();
  const { profile, education, projects, specializations } = usePortfolioData();
  useDocumentTitle(t('pages:about.pageTitle'));

  return (
    <>
      <PageHeader
        eyebrow={t('pages:about.eyebrow')}
        title={t('pages:about.title')}
        subtitle={t('pages:about.subtitle')}
      />

      <Section>
        <Container className="space-y-10 sm:space-y-12">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
            {/* Bio & Education Column */}
            <div className="space-y-6 lg:col-span-7">
              <Card className="space-y-4 p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">
                    {t('pages:about.bioHeading')}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {pick(profile.location)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  {pick(profile.summary)}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <ButtonLink to="/portfolio" variant="primary" size="md">
                    {t('common:actions.exploreProjects')}
                  </ButtonLink>
                  <ButtonLink to="/experience" variant="outline" size="md">
                    {t('common:actions.viewExperience')}
                  </ButtonLink>
                </div>
              </Card>

              {/* Education Records */}
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
                  <GraduationCap className="h-5 w-5 text-accent" aria-hidden="true" />
                  <span>{t('pages:about.educationHeading')}</span>
                </h2>
                {education.map((edu) => (
                  <Card key={edu.id} className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-text-primary sm:text-lg">
                          {pick(edu.degree)}
                        </h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          {pick(edu.institution)} · {pick(edu.grade)}
                        </p>
                      </div>
                      <Badge variant="accent" mono>
                        {pick(edu.period)}
                      </Badge>
                    </div>

                    <div>
                      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                        {t('pages:about.courseworkLabel')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {edu.coursework.map((course, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-border-default bg-bg-primary px-3 py-1 text-xs font-medium text-text-primary"
                          >
                            {pick(course)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {edu.graduationProjectSlug &&
                      (() => {
                        const gradProject = projects.find(
                          (item) => item.slug === edu.graduationProjectSlug
                        );
                        if (!gradProject) return null;
                        return (
                          <div className="border-t border-border-default pt-3">
                            <Link
                              to={`/portfolio/${gradProject.slug}`}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
                            >
                              <span>
                                {t('home:intro.graduationProjectLink')}:{' '}
                                {pick(gradProject.title)}
                              </span>
                              <ArrowUpRight className="h-4 w-4 shrink-0 rtl:-scale-x-100" aria-hidden="true" />
                            </Link>
                          </div>
                        );
                      })()}
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar: Languages & Core Competencies */}
            <div className="space-y-6 lg:col-span-5">
              <Card elevated className="space-y-4 p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <Languages className="h-5 w-5 text-accent" aria-hidden="true" />
                  <span>{t('pages:about.languagesHeading')}</span>
                </h2>
                <ul className="space-y-3">
                  {profile.languages.map((lang, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-border-default bg-bg-primary px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-text-primary">{pick(lang.name)}</span>
                      <Badge variant="muted">{pick(lang.proficiency)}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="space-y-4 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  {t('pages:about.competenciesHeading')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.coreCompetencies.map((comp, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-border-default bg-bg-primary px-3 py-1.5 text-xs font-medium text-text-primary"
                    >
                      {pick(comp)}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">
              {t('pages:about.disciplinesHeading')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {
                  specializations
                .filter((spec) => spec.isPublished !== false)
                    .map((spec) => (
                      <Card key={spec.id} className="p-4 sm:p-5">
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <SpecializationIconBadge specialization={spec} size="sm" />
                          <p className="font-mono text-xs text-accent">{spec.code}</p>
                        </div>
                        <h3 className="mb-1.5 text-base font-semibold text-text-primary sm:mb-2">
                          {pick(spec.title)}
                        </h3>
                        <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
                          {pick(spec.description)}
                        </p>
                      </Card>
                    ))
                }
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
