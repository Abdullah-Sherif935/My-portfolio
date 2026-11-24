import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { ExperienceTimeline } from './components/ExperienceTimeline';

export function ExperiencePage() {
  const { t } = useTranslation(['pages', 'common']);
  const { pick } = useLanguage();
  const { experience, education, certifications, projects, siteSettings } =
    usePortfolioData();
  const [certLightbox, setCertLightbox] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useDocumentTitle(t('pages:experience.pageTitle'));

  const publishedExperience = experience
    .filter((item) => item.isPublished !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const publishedEducation = education
    .filter((item) => item.isPublished !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const publishedCourses =
    siteSettings.showCoursesSection !== false
      ? certifications
          .filter((item) => item.isPublished !== false)
          .sort((a, b) => a.displayOrder - b.displayOrder)
      : [];

  return (
    <>
      <PageHeader
        eyebrow={t('pages:experience.eyebrow')}
        title={t('pages:experience.title')}
        subtitle={t('pages:experience.subtitle')}
      />

      <Section>
        <Container className="space-y-14">
          {/* Section A: Professional Experience */}
          {publishedExperience.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 border-b border-border-default pb-3">
                <Briefcase className="h-5 w-5 text-accent" aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
                    {t('pages:experience.professionalHeading')}
                  </h2>
                  <p className="text-xs text-text-secondary sm:text-sm">
                    {t('pages:experience.professionalSubtitle')}
                  </p>
                </div>
              </div>
              <ExperienceTimeline items={publishedExperience} />
            </div>
          )}

          {/* Section B: Academic Experience */}
          {publishedEducation.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 border-b border-border-default pb-3">
                <GraduationCap className="h-5 w-5 text-accent" aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
                    {t('pages:experience.academicHeading')}
                  </h2>
                  <p className="text-xs text-text-secondary sm:text-sm">
                    {t('pages:experience.academicSubtitle')}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {publishedEducation.map((edu) => {
                  const slugs =
                    edu.relatedProjectSlugs && edu.relatedProjectSlugs.length > 0
                      ? edu.relatedProjectSlugs
                      : edu.graduationProjectSlug
                        ? [edu.graduationProjectSlug]
                        : [];
                  const linkedProjects = slugs
                    .map((s) =>
                      projects.find((p) => p.slug === s && p.isPublished !== false)
                    )
                    .filter((p): p is NonNullable<typeof p> => Boolean(p));
                  const activities = edu.activities ?? [];
                  const statusText = edu.academicStatus
                    ? pick(edu.academicStatus).trim()
                    : edu.classification
                      ? pick(edu.classification).trim()
                      : '';

                  return (
                    <Card key={edu.id} className="space-y-4 p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {pick(edu.grade).trim() && (
                              <Badge variant="accent" mono>
                                {pick(edu.grade)}
                              </Badge>
                            )}
                            {statusText && (
                              <Badge variant="outline">{statusText}</Badge>
                            )}
                            {edu.isCurrent && (
                              <Badge variant="accent">
                                {t('pages:experience.currentlyStudyingBadge')}
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-text-primary sm:text-xl">
                            {pick(edu.degree)}
                          </h3>

                          {edu.fieldOfStudy && pick(edu.fieldOfStudy).trim() && (
                            <p className="text-xs font-medium text-accent sm:text-sm">
                              {pick(edu.fieldOfStudy)}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary sm:text-sm">
                            <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                              <GraduationCap
                                className="h-3.5 w-3.5 text-accent"
                                aria-hidden="true"
                              />
                              {pick(edu.institution)}
                            </span>
                            {edu.location && pick(edu.location).trim() && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                {pick(edu.location)}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-border-default bg-bg-primary px-3 py-1.5 font-mono text-xs text-text-secondary">
                          <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                          {pick(edu.period)}
                        </span>
                      </div>

                      {edu.summary && pick(edu.summary).trim() && (
                        <p className="text-xs leading-relaxed text-text-secondary sm:text-[15px]">
                          {pick(edu.summary)}
                        </p>
                      )}

                      {edu.detailedDescription &&
                        pick(edu.detailedDescription).trim() && (
                          <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
                            {pick(edu.detailedDescription)}
                          </p>
                        )}

                      {/* Academic Activities & Achievements */}
                      {activities.length > 0 && (
                        <div className="space-y-2.5">
                          <p className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                            {t('pages:experience.academicActivitiesHeading')}
                          </p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {activities.map((act) => (
                              <div
                                key={act.id}
                                className="rounded-xl border border-border-default bg-bg-primary p-3"
                              >
                                <div className="mb-1 flex items-center gap-2">
                                  <Badge variant="muted">
                                    {t(
                                      `pages:experience.academicCategories.${act.category}`
                                    )}
                                  </Badge>
                                  <span className="text-xs font-semibold text-text-primary">
                                    {pick(act.title)}
                                  </span>
                                </div>
                                {pick(act.description).trim() && (
                                  <p className="text-xs leading-relaxed text-text-secondary">
                                    {pick(act.description)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Coursework */}
                      {edu.coursework.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                            {t('pages:experience.courseworkHeading')}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {edu.coursework.map((cw, idx) => (
                              <Badge key={idx} variant="muted">
                                {pick(cw)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Academic Projects */}
                      {linkedProjects.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-border-default pt-3 sm:pt-4">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                            {t('common:actions.relatedProjects')}:
                          </span>
                          {linkedProjects.map((project) => (
                            <Link
                              key={project.id}
                              to={`/portfolio/${project.slug}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-xs font-medium text-text-primary transition-colors hover:border-accent-border hover:text-accent"
                            >
                              {project.coverImageUrl && (
                                <img
                                  src={project.coverImageUrl}
                                  alt=""
                                  className="h-5 w-7 rounded object-cover"
                                />
                              )}
                              <span>{pick(project.title)}</span>
                              <ArrowUpRight
                                className="h-3 w-3 rtl:-scale-x-100"
                                aria-hidden="true"
                              />
                            </Link>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section C: Courses & Professional Development */}
          {publishedCourses.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 border-b border-border-default pb-3">
                <Award className="h-5 w-5 text-accent" aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
                    {t('pages:experience.coursesHeading')}
                  </h2>
                  <p className="text-xs text-text-secondary sm:text-sm">
                    {t('pages:experience.coursesSubtitle')}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {publishedCourses.map((course) => {
                  const isPdf =
                    course.certificateMimeType === 'application/pdf' ||
                    Boolean(course.mediaUrl?.toLowerCase().endsWith('.pdf'));
                  const skills = course.skills ?? [];
                  const outcomes = course.learningOutcomes ?? [];
                  const dateLabel =
                    pick(course.issueDate).trim() ||
                    [course.startDate, course.completionDate]
                      .filter(Boolean)
                      .join(' – ');

                  return (
                    <Card
                      key={course.id}
                      className="flex flex-col justify-between space-y-4 p-5"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <Badge variant="accent">
                            {course.courseType
                              ? t(`pages:experience.courseTypes.${course.courseType}`)
                              : pick(course.category)}
                          </Badge>
                          {dateLabel && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-border-default bg-bg-primary px-2 py-0.5 font-mono text-[11px] text-text-secondary">
                              <Calendar className="h-3 w-3 text-accent" />
                              {dateLabel}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-text-primary sm:text-lg">
                            {pick(course.title)}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                            <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                              <BookOpen className="h-3.5 w-3.5 text-accent" />
                              {pick(course.issuer)}
                            </span>
                            {course.duration && pick(course.duration).trim() && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {pick(course.duration)}
                              </span>
                            )}
                            {course.location && pick(course.location).trim() && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {pick(course.location)}
                              </span>
                            )}
                          </div>
                        </div>

                        {course.description && pick(course.description).trim() && (
                          <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
                            {pick(course.description)}
                          </p>
                        )}

                        {course.detailedDescription &&
                          pick(course.detailedDescription).trim() && (
                            <p className="text-xs leading-relaxed text-text-secondary">
                              {pick(course.detailedDescription)}
                            </p>
                          )}

                        {outcomes.length > 0 && (
                          <ul className="space-y-1 text-xs text-text-secondary">
                            {outcomes.map((o, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                                <span>{pick(o)}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((s) => (
                              <Badge key={s} variant="muted" mono>
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Certificate Preview / Credential Actions */}
                      {(course.mediaUrl ||
                        course.credentialUrl ||
                        course.credentialId.trim()) && (
                        <div className="space-y-2.5 border-t border-border-default pt-3">
                          {course.mediaUrl && !isPdf && (
                            <button
                              type="button"
                              onClick={() =>
                                setCertLightbox({
                                  url: course.mediaUrl!,
                                  title: pick(course.title),
                                })
                              }
                              className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border-default bg-bg-primary"
                            >
                              <img
                                src={course.mediaUrl}
                                alt={pick(course.title)}
                                loading="lazy"
                                className="max-h-40 w-full object-contain p-1.5 transition-transform hover:scale-[1.02]"
                              />
                            </button>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {course.credentialId.trim() && (
                              <span className="font-mono text-[11px] text-text-secondary">
                                ID: {course.credentialId}
                              </span>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              {course.mediaUrl && isPdf && (
                                <a
                                  href={course.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-xs font-medium text-accent hover:border-accent"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>{t('pages:experience.viewCertificatePdf')}</span>
                                </a>
                              )}
                              {course.credentialUrl && (
                                <a
                                  href={course.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-xs font-medium text-text-primary hover:border-accent hover:text-accent"
                                >
                                  <span>{t('pages:experience.verifyCredential')}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* Certificate Image Lightbox */}
      {certLightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setCertLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-border-default bg-bg-secondary p-3"
          >
            <button
              type="button"
              onClick={() => setCertLightbox(null)}
              aria-label={t('common:actions.close')}
              className="absolute end-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-bg-primary/90 text-text-primary hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={certLightbox.url}
              alt={certLightbox.title}
              className="max-h-[82vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
