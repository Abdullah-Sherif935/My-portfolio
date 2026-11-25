import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleMinus,
  ExternalLink,
  FileDown,
  FolderKanban,
  Gauge,
  Github,
  GraduationCap,
  Info,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  SlidersHorizontal,
  Wrench,
  Youtube,
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
import {
  buildTailoredCvHeadline,
  buildTailoredCvSummary,
} from '@/services/cvPresentation';
import type { Language } from '@/types/portfolio';
import type { MatchTier, RecruiterPositionId } from '@/types/recruiter';
import { cn } from '@/utils/cn';
import { CUSTOM_JD_STORAGE_KEY } from './RecruiterEntryPage';

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
  const customDescription = useMemo(() => {
    if (positionId !== 'custom') return '';
    const fromUrl = searchParams.get('jd');
    if (fromUrl) return fromUrl;
    try {
      return window.sessionStorage.getItem(CUSTOM_JD_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  }, [positionId, searchParams]);

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
          customDescription,
          selectedSkillIds,
          preferredCvLanguage,
          profileOverrides: siteSettings.recruiterProfiles,
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
      customDescription,
      selectedSkillIds,
      preferredCvLanguage,
      siteSettings.recruiterProfiles,
    ]
  );

  useDocumentTitle(
    `${pick(tailored.displayPositionTitle)} — ${t('recruiter:results.eyebrow')}`
  );

  const tailoredHeadline = useMemo(
    () => buildTailoredCvHeadline(profile, tailored, language),
    [profile, tailored, language]
  );

  const tailoredSummary = useMemo(
    () => buildTailoredCvSummary(profile, tailored, language),
    [profile, tailored, language]
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
    if (positionId === 'custom' && customDescription.trim().length > 0 && customDescription.trim().length <= 400) {
      p.set('jd', customDescription.trim());
    }
    if (selectedSkillIds.length > 0) {
      p.set('skills', selectedSkillIds.join(','));
    }
    p.set('lang', preferredCvLanguage);
    return p.toString();
  }, [positionId, customTitle, customDescription, selectedSkillIds, preferredCvLanguage]);

  const handleQuickRoleSwitch = (nextRole: RecruiterPositionId) => {
    const next = new URLSearchParams(searchParams);
    next.set('role', nextRole);
    if (nextRole !== 'custom') {
      next.delete('custom');
      next.delete('jd');
    }
    setSearchParams(next);
  };

  const { compatibility } = tailored;

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
                  {tailoredHeadline} · {pick(profile.location)}
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

              {tailored.isCustomRole && (tailored.customTitle || tailored.customDescription) && (
                <div className="flex items-start gap-2.5 rounded-xl border border-accent-border bg-accent-subtle/40 px-4 py-3 text-xs leading-relaxed text-text-primary">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>
                    {t('recruiter:results.customRoleNotice', {
                      role: tailored.customTitle || t('recruiter:results.customJdFallback'),
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
          {/* 0. Deterministic Compatibility Assessment & Explainable Breakdown */}
          <Card className="space-y-6 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Gauge className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-text-primary sm:text-xl">
                    {t('recruiter:results.compatibility.heading')}
                  </h2>
                  <Badge
                    variant={
                      compatibility.level === 'high'
                        ? 'success'
                        : compatibility.level === 'moderate'
                          ? 'accent'
                          : 'muted'
                    }
                  >
                    {t(`recruiter:results.compatibility.levels.${compatibility.level}`)}
                  </Badge>
                </div>
                <p className="max-w-3xl text-sm leading-relaxed text-text-secondary">
                  {pick(compatibility.summary)}
                </p>
                <p className="text-xs text-text-secondary/80">
                  {t('recruiter:results.compatibility.disclaimer')}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-accent-border bg-bg-primary px-5 py-4">
                <div className="text-center">
                  <div className="font-mono text-3xl font-bold text-accent sm:text-4xl">
                    {compatibility.overallScore}
                    <span className="text-base font-normal text-text-secondary">/100</span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                    {t('recruiter:results.compatibility.indexLabel')}
                  </p>
                </div>
              </div>
            </div>

            {/* 6-Dimension Weighted Breakdown */}
            <div className="grid gap-3 border-t border-border-default pt-5 sm:grid-cols-2 lg:grid-cols-3">
              {compatibility.breakdown.map((dim) => (
                <div
                  key={dim.key}
                  className="space-y-1.5 rounded-xl border border-border-default bg-bg-primary p-3.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-text-primary">
                      {pick(dim.label)}
                    </span>
                    <span className="font-mono text-text-secondary">
                      {dim.score}% · {t('recruiter:results.compatibility.weightShort', { w: dim.weight })}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    {pick(dim.evidenceSummary)}
                  </p>
                </div>
              ))}
            </div>

            {/* Skills Gap & Traceable Evidence Matrix */}
            {(compatibility.matchedSkills.length > 0 ||
              compatibility.partialSkills.length > 0 ||
              compatibility.missingSkills.length > 0) && (
              <div className="grid gap-4 border-t border-border-default pt-5 lg:grid-cols-3">
                {/* Verified Matching Skills */}
                <div className="space-y-2.5 rounded-xl border border-success/30 bg-success-subtle/30 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-success">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t('recruiter:results.compatibility.matchedHeading')} (
                      {compatibility.matchedSkills.length})
                    </span>
                  </div>
                  {compatibility.matchedSkills.length > 0 ? (
                    <ul className="space-y-2">
                      {compatibility.matchedSkills.map((skill) => (
                        <li
                          key={skill.id}
                          className="rounded-lg border border-border-default bg-bg-primary/90 p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-text-primary">
                              {pick(skill.label)}
                            </span>
                            <span className="rounded bg-bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                              {t(`recruiter:results.compatibility.importance.${skill.importance}`)}
                            </span>
                          </div>
                          {skill.evidenceSources.length > 0 && (
                            <p className="mt-1 text-[11px] text-text-secondary">
                              {skill.evidenceSources.map((src) => pick(src)).join(' · ')}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      {t('recruiter:results.compatibility.noneFound')}
                    </p>
                  )}
                </div>

                {/* Partially Matching Skills */}
                <div className="space-y-2.5 rounded-xl border border-accent-border bg-accent-subtle/20 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                    <CircleMinus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t('recruiter:results.compatibility.partialHeading')} (
                      {compatibility.partialSkills.length})
                    </span>
                  </div>
                  {compatibility.partialSkills.length > 0 ? (
                    <ul className="space-y-2">
                      {compatibility.partialSkills.map((skill) => (
                        <li
                          key={skill.id}
                          className="rounded-lg border border-border-default bg-bg-primary/90 p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-text-primary">
                              {pick(skill.label)}
                            </span>
                            <span className="rounded bg-bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                              {t(`recruiter:results.compatibility.importance.${skill.importance}`)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-text-secondary">
                            {pick(skill.explanation)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      {t('recruiter:results.compatibility.nonePartial')}
                    </p>
                  )}
                </div>

                {/* Missing / Unverified Requirements */}
                <div className="space-y-2.5 rounded-xl border border-border-default bg-bg-primary p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    <AlertCircle className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
                    <span>
                      {t('recruiter:results.compatibility.missingHeading')} (
                      {compatibility.missingSkills.length})
                    </span>
                  </div>
                  {compatibility.missingSkills.length > 0 ? (
                    <ul className="space-y-2">
                      {compatibility.missingSkills.map((skill) => (
                        <li
                          key={skill.id}
                          className="rounded-lg border border-border-default bg-bg-secondary/60 p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-text-primary">
                              {pick(skill.label)}
                            </span>
                            <span className="rounded bg-bg-primary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                              {t(`recruiter:results.compatibility.importance.${skill.importance}`)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-text-secondary">
                            {pick(skill.explanation)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      {t('recruiter:results.compatibility.noneMissing')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* 1. Role-Tailored Professional Summary */}
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-bold text-text-primary sm:text-xl">
              {t('recruiter:results.sections.summary')}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-[15px]">
              {tailoredSummary}
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
              {tailored.skills.map(({ item: group, tier, matchReasons }) => (
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
                  {matchReasons.length > 0 && (
                    <p className="border-t border-border-default pt-2.5 text-xs text-text-secondary">
                      <span className="font-semibold text-accent">
                        {t('recruiter:results.whyMatchedLabel')}:
                      </span>{' '}
                      {matchReasons.map((r) => pick(r)).join(' · ')}
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
              {tailored.experience.map(({ item: exp, tier, matchReasons }) => {
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

                    {matchReasons.length > 0 && (
                      <p className="border-t border-border-default pt-3 text-xs text-text-secondary">
                        <span className="font-semibold text-accent">
                          {t('recruiter:results.whyMatchedLabel')}:
                        </span>{' '}
                        {matchReasons.map((r) => pick(r)).join(' · ')}
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
              {displayedPrimaryProjects.map(({ item: project, tier, matchReasons }) => (
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
                        {pick(project.categoryLabel)}
                      </span>
                      <TierBadge tier={tier} />
                    </div>
                    <h3 className="text-base font-bold text-text-primary sm:text-lg">
                      {pick(project.title)}
                    </h3>
                    {pick(project.shortDescription) && (
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {pick(project.shortDescription)}
                      </p>
                    )}
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
                    {matchReasons.length > 0 && (
                      <p className="text-xs text-text-secondary">
                        <span className="font-semibold text-accent">
                          {t('recruiter:results.whyMatchedLabel')}:
                        </span>{' '}
                        {matchReasons.map((r) => pick(r)).join(' · ')}
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
                              {pick(project.categoryLabel)}
                            </span>
                            <TierBadge tier={tier} />
                          </div>
                          <h3 className="text-base font-semibold text-text-primary">
                            {pick(project.title)}
                          </h3>
                          {pick(project.shortDescription) && (
                            <p className="text-xs leading-relaxed text-text-secondary">
                              {pick(project.shortDescription)}
                            </p>
                          )}
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
                  {tailored.certifications.map(({ item: cert, tier, matchReasons }) => (
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
                      {matchReasons.length > 0 && (
                        <p className="text-[11px] text-text-secondary">
                          <span className="font-semibold text-accent">
                            {t('recruiter:results.whyMatchedLabel')}:
                          </span>{' '}
                          {matchReasons.map((r) => pick(r)).join(' · ')}
                        </p>
                      )}
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
                {siteSettings.showContactEmail && profile.contact.email && (
                  <a
                    href={`mailto:${profile.contact.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-accent"
                  >
                    <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span className="font-mono text-xs" dir="ltr">
                      {profile.contact.email}
                    </span>
                  </a>
                )}
                {profile.contact.phone?.trim() && (
                  <a
                    href={`tel:${profile.contact.phone.replace(/[^+\d]/g, '')}`}
                    className="inline-flex items-center gap-1.5 hover:text-accent"
                  >
                    <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span className="font-mono text-xs" dir="ltr">
                      {profile.contact.phone.trim()}
                    </span>
                  </a>
                )}
                {siteSettings.showLinkedinLink && profile.contact.linkedinUrl && (
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
                {profile.contact.youtubeUrl?.trim() && (
                  <a
                    href={profile.contact.youtubeUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-accent"
                  >
                    <Youtube className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span>{t('common:footer.youtubeLabel')}</span>
                  </a>
                )}
                {profile.contact.githubUrl?.trim() && (
                  <a
                    href={profile.contact.githubUrl.trim()}
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
