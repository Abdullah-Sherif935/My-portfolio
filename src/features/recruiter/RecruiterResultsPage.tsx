import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileDown,
  FolderKanban,
  Github,
  GraduationCap,
  Info,
  Linkedin,
  Mail,
  MapPin,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import {
  RECRUITER_POSITIONS,
  RECRUITER_SKILL_FILTERS,
  buildTailoredProfile,
  isValidPositionId,
} from '@/services/recruiterMatcher';
import type { Language } from '@/types/portfolio';
import type { MatchTier, RecruiterPositionId } from '@/types/recruiter';
import { cn } from '@/utils/cn';

function TierBadge({ tier }: { tier: MatchTier }) {
  const { t } = useTranslation('recruiter');
  if (tier === 'strong') {
    return <Badge variant="accent">{t('tiers.strong')}</Badge>;
  }
  if (tier === 'relevant') {
    return <Badge variant="success">{t('tiers.relevant')}</Badge>;
  }
  return <Badge variant="muted">{t('tiers.supporting')}</Badge>;
}

export function RecruiterResultsPage() {
  const { t } = useTranslation(['recruiter', 'common']);
  const { pick, language } = useLanguage();
  const {
    profile,
    education,
    experience,
    projects,
    companies,
    skills,
    certifications,
    siteSettings,
  } = usePortfolioData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSupportingProjects, setShowSupportingProjects] = useState(false);

  const rawRole = searchParams.get('role');
  const positionId: RecruiterPositionId = isValidPositionId(rawRole)
    ? rawRole
    : 'hvac-design';
  const customTitle = searchParams.get('custom') ?? '';
  const selectedSkillIds = useMemo(() => {
    const raw = searchParams.get('skills');
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((id) => RECRUITER_SKILL_FILTERS.some((opt) => opt.id === id));
  }, [searchParams]);
  const preferredCvLanguage: Language =
    searchParams.get('lang') === 'ar'
      ? 'ar'
      : searchParams.get('lang') === 'en'
        ? 'en'
        : language;

  const tailored = useMemo(
    () =>
      buildTailoredProfile(
        {
          experience,
          projects,
          skills,
          education,
          certifications,
        },
        {
          positionId,
          customTitle,
          selectedSkillIds,
          preferredCvLanguage,
        }
      ),
    [
      experience,
      projects,
      skills,
      education,
      certifications,
      positionId,
      customTitle,
      selectedSkillIds,
      preferredCvLanguage,
    ]
  );

  useDocumentTitle(
    `${pick(tailored.displayPositionTitle)} — ${t('recruiter:results.eyebrow')}`
  );

  const companyById = useMemo(
    () => new Map(companies.map((c) => [c.id, c])),
    [companies]
  );

  const primaryProjects = useMemo(
    () =>
      tailored.projects.filter(
        (p) => p.tier === 'strong' || p.tier === 'relevant'
      ),
    [tailored.projects]
  );
  const supportingProjects = useMemo(
    () => tailored.projects.filter((p) => p.tier === 'supporting'),
    [tailored.projects]
  );

  const displayedPrimaryProjects =
    primaryProjects.length > 0 ? primaryProjects : tailored.projects;
  const displayedSupportingProjects =
    primaryProjects.length > 0 ? supportingProjects : [];

  const currentQueryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set('role', positionId);
    if (positionId === 'custom' && customTitle.trim()) {
      p.set('custom', customTitle.trim());
    }
    if (selectedSkillIds.length > 0) {
      p.set('skills', selectedSkillIds.join(','));
    }
    p.set('lang', preferredCvLanguage);
    return p.toString();
  }, [positionId, customTitle, selectedSkillIds, preferredCvLanguage]);

  const handleQuickRoleSwitch = (nextRole: RecruiterPositionId) => {
    const next = new URLSearchParams(searchParams);
    next.set('role', nextRole);
    if (nextRole !== 'custom') {
      next.delete('custom');
    }
    setSearchParams(next);
  };

  return (
    <>
      {/* Top Tailored Summary Banner */}
      <section className="relative overflow-hidden border-b border-border-default bg-bg-primary">
        <div
          aria-hidden="true"
          className="engineering-grid pointer-events-none absolute inset-0 opacity-60"
        />
        <Container className="relative py-10 sm:py-14">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/recruiter?${currentQueryString}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                <span>{t('recruiter:results.changeRole')}</span>
              </Link>
              <Badge variant="accent" mono>
                {t('recruiter:results.eyebrow')}
              </Badge>
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="space-y-2.5">
                <p className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                  {t('recruiter:results.targetRoleLabel')}
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  {pick(profile.fullName)} —{' '}
                  <span className="text-accent">
                    {pick(tailored.displayPositionTitle)}
                  </span>
                </h1>
                <p className="text-sm font-medium text-text-secondary sm:text-base">
                  {pick(profile.headline)} · {pick(profile.location)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink
                  to={`/career/cv-builder?${currentQueryString}`}
                  variant="primary"
                  size="md"
                >
                  <FileDown className="h-4 w-4" aria-hidden="true" />
                  <span>{t('recruiter:results.generateCv')}</span>
                </ButtonLink>
                <ButtonLink to="/portfolio" variant="secondary" size="md">
                  <span>{t('recruiter:results.viewFullPortfolio')}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>

            {/* Quick Role Switcher */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border-default pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <SlidersHorizontal className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {t('recruiter:results.quickSwitchLabel')}
              </span>
              {RECRUITER_POSITIONS.filter((p) => p.id !== 'custom').map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => handleQuickRoleSwitch(pos.id)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
                    positionId === pos.id
                      ? 'border-accent bg-accent-subtle text-accent'
                      : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary'
                  )}
                >
                  {pick(pos.shortLabel)}
                </button>
              ))}
            </div>

            {/* Transparent Matching & Custom Notices */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 rounded-xl border border-border-default bg-bg-secondary/90 px-4 py-3 text-xs leading-relaxed text-text-secondary">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{t('recruiter:results.transparencyNote')}</span>
              </div>

              {tailored.isCustomRole && tailored.customTitle && (
                <div className="flex items-start gap-2.5 rounded-xl border border-accent-border bg-accent-subtle/40 px-4 py-3 text-xs leading-relaxed text-text-primary">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>
                    {t('recruiter:results.customRoleNotice', {
                      role: tailored.customTitle,
                    })}
                  </span>
                </div>
              )}

              {!tailored.hasDirectMatches && (
                <div className="flex items-start gap-2.5 rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-xs leading-relaxed text-text-secondary">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>{t('recruiter:results.insufficientMatchNotice')}</span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Tailored Content Sections */}
      <section className="py-10 sm:py-14">
        <Container className="space-y-10">
          {/* 1. Professional Summary */}
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-bold text-text-primary sm:text-xl">
              {t('recruiter:results.sections.summary')}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-[15px]">
              {pick(profile.summary)}
            </p>
            {tailored.matchedFocusAreas.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border-default pt-4">
                <span className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                  {t('recruiter:results.sections.focusAreas')}:
                </span>
                {tailored.matchedFocusAreas.map((area, idx) => (
                  <Badge key={idx} variant="accent">
                    {pick(area)}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* 2. Relevant Skills */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Wrench className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold text-text-primary">
                {t('recruiter:results.sections.skills')}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {tailored.skills.map(({ item: group, tier, matchedKeywords }) => (
                <Card
                  key={group.id}
                  className={cn(
                    'flex flex-col justify-between gap-4 p-5',
                    tier === 'strong' && 'border-accent-border'
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[11px] text-text-secondary">
                          {group.code}
                        </p>
                        <h3 className="text-base font-semibold text-text-primary">
                          {pick(group.title)}
                        </h3>
                      </div>
                      <TierBadge tier={tier} />
                    </div>
                    <p className="text-xs leading-relaxed text-text-secondary">
                      {pick(group.description)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-border-default bg-bg-primary px-2.5 py-1 text-xs text-text-primary"
                        >
                          {pick(skill)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {matchedKeywords.length > 0 && (
                    <p className="border-t border-border-default pt-2.5 font-mono text-[11px] text-text-secondary">
                      <span className="text-accent">
                        {t('recruiter:results.matchedKeywordsLabel')}:
                      </span>{' '}
                      {matchedKeywords.join(' · ')}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* 3. Relevant Work Experience */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Briefcase className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold text-text-primary">
                {t('recruiter:results.sections.experience')}
              </h2>
            </div>

            <div className="space-y-4">
              {tailored.experience.map(({ item: exp, tier, matchedKeywords }) => {
                const linkedCompany = exp.companyId
                  ? companyById.get(exp.companyId)
                  : undefined;

                return (
                  <Card
                    key={exp.id}
                    className={cn(
                      'space-y-4 p-5 sm:p-6',
                      tier === 'strong' && 'border-accent-border'
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="default">{pick(exp.kindLabel)}</Badge>
                          <TierBadge tier={tier} />
                        </div>
                        <h3 className="text-base font-bold text-text-primary sm:text-lg">
                          {pick(exp.role)}
                        </h3>
                        <p className="text-sm font-medium text-accent">
                          {pick(exp.company)}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span className="font-mono text-xs text-text-secondary">
                          {pick(exp.period)}
                        </span>
                        {linkedCompany && (
                          <Link
                            to={`/companies/${linkedCompany.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                          >
                            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t('recruiter:results.openCompany')}</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{pick(resp)}</span>
                        </li>
                      ))}
                    </ul>

                    {matchedKeywords.length > 0 && (
                      <p className="border-t border-border-default pt-3 font-mono text-[11px] text-text-secondary">
                        <span className="text-accent">
                          {t('recruiter:results.matchedKeywordsLabel')}:
                        </span>{' '}
                        {matchedKeywords.join(' · ')}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 4. Relevant Engineering Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="text-xl font-bold text-text-primary">
                  {t('recruiter:results.sections.projects')}
                </h2>
              </div>
              <Link
                to="/portfolio"
                className="text-xs font-medium text-accent hover:underline sm:text-sm"
              >
                {t('common:actions.viewAllProjects')}
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {displayedPrimaryProjects.map(({ item: project, tier, matchedKeywords }) => (
                <Card
                  key={project.id}
                  className={cn(
                    'flex flex-col justify-between gap-4 p-5 transition-colors hover:border-border-strong',
                    tier === 'strong' && 'border-accent-border'
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs text-text-secondary">
                        {project.code} · {pick(project.categoryLabel)}
                      </span>
                      <TierBadge tier={tier} />
                    </div>
                    <h3 className="text-base font-bold text-text-primary sm:text-lg">
                      {pick(project.title)}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {pick(project.shortDescription)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 6).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-border-default bg-bg-primary px-2 py-0.5 font-mono text-[11px] text-text-secondary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 border-t border-border-default pt-3">
                    {matchedKeywords.length > 0 && (
                      <p className="font-mono text-[11px] text-text-secondary">
                        <span className="text-accent">
                          {t('recruiter:results.matchedKeywordsLabel')}:
                        </span>{' '}
                        {matchedKeywords.join(' · ')}
                      </p>
                    )}
                    <Link
                      to={`/portfolio/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                    >
                      <span>{t('recruiter:results.openProject')}</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Supporting projects remain accessible */}
            {displayedSupportingProjects.length > 0 && (
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSupportingProjects((prev) => !prev)}
                >
                  {showSupportingProjects ? (
                    <>
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      <span>{t('recruiter:results.sections.hideSupporting')}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {t('recruiter:results.sections.showSupporting', {
                          count: displayedSupportingProjects.length,
                        })}
                      </span>
                    </>
                  )}
                </Button>

                {showSupportingProjects && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {displayedSupportingProjects.map(({ item: project, tier }) => (
                      <Card
                        key={project.id}
                        className="flex flex-col justify-between gap-3 p-5"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-text-secondary">
                              {project.code} · {pick(project.categoryLabel)}
                            </span>
                            <TierBadge tier={tier} />
                          </div>
                          <h3 className="text-base font-semibold text-text-primary">
                            {pick(project.title)}
                          </h3>
                          <p className="text-xs leading-relaxed text-text-secondary">
                            {pick(project.shortDescription)}
                          </p>
                        </div>
                        <Link
                          to={`/portfolio/${project.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                        >
                          <span>{t('recruiter:results.openProject')}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Education & 6. Certifications Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Education */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="text-xl font-bold text-text-primary">
                  {t('recruiter:results.sections.education')}
                </h2>
              </div>
              <div className="space-y-3">
                {tailored.education.map((edu) => (
                  <Card key={edu.id} className="space-y-2.5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-text-primary">
                        {pick(edu.degree)}
                      </h3>
                      <Badge variant="accent" mono>
                        {edu.graduationYear}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-text-secondary">
                      {pick(edu.institution)} · {pick(edu.period)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {pick(edu.grade)}
                    </p>
                    {edu.graduationProjectSlug && (
                      <Link
                        to={`/portfolio/${edu.graduationProjectSlug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                      >
                        <span>{t('recruiter:results.openProject')}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {siteSettings.showCoursesSection && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <Award className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-text-primary">
                    {t('recruiter:results.sections.certifications')}
                  </h2>
                </div>
                <div className="space-y-3">
                  {tailored.certifications.map(({ item: cert, tier }) => (
                    <Card key={cert.id} className="space-y-2 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-text-primary">
                          {pick(cert.title)}
                        </h3>
                        <TierBadge tier={tier} />
                      </div>
                      <p className="text-xs text-text-secondary">
                        {pick(cert.category)} · {pick(cert.issuer)}
                      </p>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          <span>{cert.credentialId}</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. Contact & Bottom Actions */}
          <Card className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-text-primary">
                {t('recruiter:results.sections.contact')}
              </h2>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>{pick(profile.location)}</span>
                </span>
                {siteSettings.showContactEmail && (
                  <a
                    href={`mailto:${profile.contact.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-accent"
                  >
                    <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span className="font-mono text-xs">{profile.contact.email}</span>
                  </a>
                )}
                {siteSettings.showLinkedinLink && (
                  <a
                    href={profile.contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-accent"
                  >
                    <Linkedin className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span>{t('common:footer.linkedinLabel')}</span>
                  </a>
                )}
                {profile.contact.githubUrl && (
                  <a
                    href={profile.contact.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-accent"
                  >
                    <Github className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink
                to={`/career/cv-builder?${currentQueryString}`}
                variant="primary"
                size="md"
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
                <span>{t('recruiter:results.generateCv')}</span>
              </ButtonLink>
              <ButtonLink to="/contact" variant="secondary" size="md">
                {t('recruiter:results.openContactPage')}
              </ButtonLink>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
