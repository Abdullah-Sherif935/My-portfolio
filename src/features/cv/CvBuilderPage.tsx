import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BriefcaseBusiness,
  Check,
  Eye,
  FileDown,
  FileText,
  Globe,
  Info,
  LayoutTemplate,
  Lock,
  Printer,
  RotateCcw,
  SlidersHorizontal,
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
  buildCvDocumentTitle,
  buildTailoredProfile,
  isValidPositionId,
} from '@/services/recruiterMatcher';
import {
  buildTailoredCvSummary,
  pickCvText,
} from '@/services/cvPresentation';
import type { CvSectionConfig, CvSectionKey, CvTemplateId } from '@/types/admin';
import type { Language } from '@/types/portfolio';
import type { RecruiterPositionId } from '@/types/recruiter';
import { cn } from '@/utils/cn';
import { CUSTOM_JD_STORAGE_KEY } from '@/features/recruiter/RecruiterEntryPage';
import {
  CvAtsTemplate,
  type CvDocumentLabels,
  type CvTemplateCustomizations,
} from './components/CvAtsTemplate';
import { CvModernTemplate } from './components/CvModernTemplate';

type SidebarTab = 'setup' | 'content';

export function CvBuilderPage() {
  const { t } = useTranslation(['recruiter', 'common']);
  const { pick, language } = useLanguage();
  const {
    profile,
    education,
    experience,
    projects,
    skills,
    certifications,
    siteSettings,
  } = usePortfolioData();
  const [searchParams, setSearchParams] = useSearchParams();

  useDocumentTitle(t('recruiter:meta.cvBuilderTitle'));

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('setup');
  const [pageCount, setPageCount] = useState<number>(1);

  const initialRoleParam = searchParams.get('role');
  const [positionId, setPositionId] = useState<RecruiterPositionId>(
    isValidPositionId(initialRoleParam) ? initialRoleParam : 'hvac-design'
  );
  const [customTitle, setCustomTitle] = useState<string>(
    searchParams.get('custom') ?? ''
  );
  const [customDescription, setCustomDescription] = useState<string>(() => {
    const fromUrl = searchParams.get('jd');
    if (fromUrl) return fromUrl;
    try {
      return window.sessionStorage.getItem(CUSTOM_JD_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [cvLanguage, setCvLanguage] = useState<Language>(
    searchParams.get('lang') === 'ar'
      ? 'ar'
      : searchParams.get('lang') === 'en'
        ? 'en'
        : language
  );

  const urlTemplate = searchParams.get('template');
  const [template, setTemplate] = useState<CvTemplateId>(
    urlTemplate === 'modern' || urlTemplate === 'ats'
      ? urlTemplate
      : siteSettings.defaultCvTemplate
  );

  useEffect(() => {
    if (!urlTemplate) {
      setTemplate(siteSettings.defaultCvTemplate);
    }
  }, [siteSettings.defaultCvTemplate, urlTemplate]);

  // Preview-only section visibility & ordering initialized from siteSettings.cvSectionOrder
  const [sections, setSections] = useState<CvSectionConfig[]>(
    siteSettings.cvSectionOrder
  );
  const [userReorderedSections, setUserReorderedSections] = useState(false);
  const [focusMode, setFocusMode] = useState<'focused' | 'all'>('focused');

  useEffect(() => {
    if (!userReorderedSections) {
      setSections(siteSettings.cvSectionOrder);
    }
  }, [siteSettings.cvSectionOrder, userReorderedSections]);

  // Interactive Content Customizations (preview/export only — never mutates Supabase)
  const [customSummaryDraft, setCustomSummaryDraft] = useState<string | null>(null);
  const [excludedExperienceIds, setExcludedExperienceIds] = useState<string[]>([]);
  const [excludedProjectIds, setExcludedProjectIds] = useState<string[]>([]);
  const [excludedSkillGroupIds, setExcludedSkillGroupIds] = useState<string[]>([]);
  const [excludedSkillKeys, setExcludedSkillKeys] = useState<string[]>([]);

  // Reset custom summary override when switching role or language so new role strategy applies immediately
  useEffect(() => {
    setCustomSummaryDraft(null);
  }, [positionId, cvLanguage]);

  const selectedSkillIds = useMemo(() => {
    const raw = searchParams.get('skills');
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((id) => RECRUITER_SKILL_FILTERS.some((opt) => opt.id === id));
  }, [searchParams]);

  const syncUrlParams = (updates: {
    role?: RecruiterPositionId;
    custom?: string;
    lang?: Language;
    template?: CvTemplateId;
  }) => {
    const next = new URLSearchParams(searchParams);
    const nextRole = updates.role ?? positionId;
    const nextCustom = updates.custom !== undefined ? updates.custom : customTitle;
    const nextLang = updates.lang ?? cvLanguage;
    const nextTemplate = updates.template ?? template;

    next.set('role', nextRole);
    if (nextRole === 'custom' && nextCustom.trim()) {
      next.set('custom', nextCustom.trim());
    } else {
      next.delete('custom');
    }
    next.set('lang', nextLang);
    next.set('template', nextTemplate);
    setSearchParams(next, { replace: true });
  };

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
          customDescription: positionId === 'custom' ? customDescription : '',
          selectedSkillIds,
          preferredCvLanguage: cvLanguage,
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
      cvLanguage,
      siteSettings.recruiterProfiles,
    ]
  );

  const autoGeneratedSummary = useMemo(
    () => buildTailoredCvSummary(profile, tailored, cvLanguage),
    [profile, tailored, cvLanguage]
  );

  // Automatically focus projects, skill groups & section priority when switching target role
  useEffect(() => {
    const eligibleProj = tailored.projects.filter((p) => p.item.showInCv !== false);
    const eligibleSkills = tailored.skills.filter((s) => s.item.showInCv !== false);

    if (focusMode === 'focused' && positionId !== 'general-engineering') {
      const relevantProjs = eligibleProj.filter(
        (p) => p.tier === 'strong' || p.tier === 'relevant'
      );
      if (relevantProjs.length > 0) {
        setExcludedProjectIds(
          eligibleProj
            .filter((p) => p.tier === 'supporting')
            .map((p) => p.item.id)
        );
      } else {
        setExcludedProjectIds([]);
      }

      const relevantSkills = eligibleSkills.filter(
        (s) => s.tier === 'strong' || s.tier === 'relevant'
      );
      if (relevantSkills.length > 0) {
        setExcludedSkillGroupIds(
          eligibleSkills
            .filter((s) => s.tier === 'supporting')
            .map((s) => s.item.id)
        );
      } else {
        setExcludedSkillGroupIds([]);
      }
    } else {
      setExcludedProjectIds([]);
      setExcludedSkillGroupIds([]);
    }

    // For Robotics & Mechatronics, elevate Engineering Projects ahead of Work Experience automatically
    if (!userReorderedSections) {
      const baseOrder = structuredClone(siteSettings.cvSectionOrder);
      if (positionId === 'robotics-mechatronics') {
        const expIdx = baseOrder.findIndex((s) => s.key === 'experience');
        const projIdx = baseOrder.findIndex((s) => s.key === 'projects');
        if (expIdx !== -1 && projIdx !== -1 && projIdx > expIdx) {
          const [projSec] = baseOrder.splice(projIdx, 1);
          if (projSec) baseOrder.splice(expIdx, 0, projSec);
        }
      }
      setSections(baseOrder);
    }
  }, [
    positionId,
    focusMode,
    tailored.projects,
    tailored.skills,
    siteSettings.cvSectionOrder,
    userReorderedSections,
  ]);

  const customizations: CvTemplateCustomizations = useMemo(
    () => ({
      customSummary: customSummaryDraft,
      excludedExperienceIds,
      excludedProjectIds,
      excludedSkillGroupIds,
      excludedSkillKeys,
    }),
    [
      customSummaryDraft,
      excludedExperienceIds,
      excludedProjectIds,
      excludedSkillGroupIds,
      excludedSkillKeys,
    ]
  );

  const suggestedFilenameBase = useMemo(
    () =>
      buildCvDocumentTitle({
        fullNameEn: profile.fullName.en,
        positionId,
        customTitle,
        cvLanguage,
      }),
    [profile.fullName.en, positionId, customTitle, cvLanguage]
  );

  const documentLabels = useMemo(
    () =>
      t(`recruiter:cv.documentLabels.${cvLanguage}`, {
        returnObjects: true,
      }) as CvDocumentLabels,
    [t, cvLanguage]
  );

  const toggleSectionVisibility = (key: CvSectionKey) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.key === key ? { ...sec, visible: !sec.visible } : sec
      )
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const currentItem = next[index];
    const targetItem = next[target];
    if (!currentItem || !targetItem) return;
    next[index] = targetItem;
    next[target] = currentItem;
    setUserReorderedSections(true);
    setSections(next);
  };

  const toggleIdInList = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePrintPdf = () => {
    const previousTitle = document.title;
    document.title = suggestedFilenameBase;

    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };

    window.addEventListener('afterprint', restoreTitle);
    window.print();
    window.setTimeout(restoreTitle, 1500);
  };

  const recruiterBackQuery = useMemo(() => {
    const p = new URLSearchParams();
    p.set('role', positionId);
    if (positionId === 'custom' && customTitle.trim()) {
      p.set('custom', customTitle.trim());
    }
    if (selectedSkillIds.length > 0) {
      p.set('skills', selectedSkillIds.join(','));
    }
    p.set('lang', cvLanguage);
    return p.toString();
  }, [positionId, customTitle, selectedSkillIds, cvLanguage]);

  const cvEligibleExperience = tailored.experience.filter((e) => e.item.showInCv !== false);
  const cvEligibleProjects = tailored.projects.filter((p) => p.item.showInCv !== false);
  const cvEligibleSkills = tailored.skills.filter((s) => s.item.showInCv !== false);

  return (
    <>
      {/* Top Header (Hidden when printing) */}
      <section className="no-print relative overflow-hidden border-b border-border-default bg-bg-primary">
        <div
          aria-hidden="true"
          className="engineering-grid pointer-events-none absolute inset-0 opacity-60"
        />
        <Container className="relative py-8 sm:py-12">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl space-y-3">
              <Badge variant="accent" mono>
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('recruiter:cv.eyebrow')}</span>
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
                {t('recruiter:cv.title')}
              </h1>
              <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                {t('recruiter:cv.subtitle')}
              </p>
              <p className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary">
                <Lock className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{t('recruiter:cv.readOnlyNotice')}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {siteSettings.recruiterModeEnabled && (
                <ButtonLink
                  to={`/recruiter/results?${recruiterBackQuery}`}
                  variant="secondary"
                  size="sm"
                >
                  <BriefcaseBusiness className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>{t('recruiter:cv.backToRecruiter')}</span>
                </ButtonLink>
              )}
              <ButtonLink to="/portfolio" variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                <span>{t('recruiter:cv.backToPortfolio')}</span>
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Split Workspace */}
      <section className="py-8 sm:py-12 print:bg-white print:py-0">
        <Container className="print:max-w-none print:bg-white print:px-0">
          <div className="grid gap-6 lg:grid-cols-12 print:block">
            {/* Left Configuration & Content Customization Panel (Hidden when printing) */}
            <aside className="no-print space-y-5 lg:col-span-4">
              <Card className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <h2 className="text-base font-bold text-text-primary">
                    {t('recruiter:cv.controlsHeading')}
                  </h2>
                  <Badge variant="muted" mono>
                    A4 PDF
                  </Badge>
                </div>

                {/* Sidebar Mode Tabs: Setup vs Customize Content */}
                <div role="tablist" className="grid grid-cols-2 gap-1.5 rounded-xl border border-border-default bg-bg-primary p-1">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sidebarTab === 'setup'}
                    onClick={() => setSidebarTab('setup')}
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                      sidebarTab === 'setup'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <LayoutTemplate className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('recruiter:cv.tabs.setup')}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sidebarTab === 'content'}
                    onClick={() => setSidebarTab('content')}
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                      sidebarTab === 'content'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('recruiter:cv.tabs.content')}</span>
                  </button>
                </div>

                {sidebarTab === 'setup' && (
                  <div className="space-y-5">
                    {/* Target Position Selector */}
                    <div className="space-y-2">
                      <label
                        htmlFor="cv-role-select"
                        className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                      >
                        {t('recruiter:cv.roleLabel')}
                      </label>
                      <select
                        id="cv-role-select"
                        value={positionId}
                        onChange={(e) => {
                          const nextRole = e.target.value as RecruiterPositionId;
                          setPositionId(nextRole);
                          syncUrlParams({ role: nextRole });
                        }}
                        className="w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                      >
                        {RECRUITER_POSITIONS.map((pos) => (
                          <option key={pos.id} value={pos.id}>
                            {pick(pos.label)}
                          </option>
                        ))}
                      </select>

                      {positionId === 'custom' && (
                        <div className="space-y-2.5 pt-1.5">
                          <div>
                            <label
                              htmlFor="cv-custom-role"
                              className="mb-1 block text-xs font-medium text-text-secondary"
                            >
                              {t('recruiter:cv.customRoleLabel')}
                            </label>
                            <input
                              id="cv-custom-role"
                              type="text"
                              value={customTitle}
                              onChange={(e) => {
                                setCustomTitle(e.target.value);
                                syncUrlParams({ custom: e.target.value });
                              }}
                              placeholder={t('recruiter:cv.customRolePlaceholder')}
                              maxLength={90}
                              className="w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="cv-custom-jd"
                              className="mb-1 block text-xs font-medium text-text-secondary"
                            >
                              {t('recruiter:entry.stepCustomJdLabel')}
                            </label>
                            <textarea
                              id="cv-custom-jd"
                              rows={3}
                              value={customDescription}
                              onChange={(e) => {
                                setCustomDescription(e.target.value);
                                try {
                                  window.sessionStorage.setItem(CUSTOM_JD_STORAGE_KEY, e.target.value);
                                } catch {
                                  // ignore
                                }
                              }}
                              placeholder={t('recruiter:entry.stepCustomJdPlaceholder')}
                              maxLength={4000}
                              className="w-full rounded-[10px] border border-border-default bg-bg-primary px-3 py-2 text-xs leading-relaxed text-text-primary focus:border-accent focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Role-Focused vs Full Profile Filter Toggle */}
                    {positionId !== 'general-engineering' && (
                      <div className="space-y-2 rounded-xl border border-border-default bg-bg-primary p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                            {language === 'ar' ? 'نطاق محتوى السيرة' : 'CV Content Scope'}
                          </span>
                          <span className="font-mono text-[10px] text-accent">
                            {language === 'ar'
                              ? `${cvEligibleProjects.length - excludedProjectIds.length}/${cvEligibleProjects.length} مشاريع`
                              : `${cvEligibleProjects.length - excludedProjectIds.length}/${cvEligibleProjects.length} projects`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFocusMode('focused')}
                            aria-pressed={focusMode === 'focused'}
                            className={cn(
                              'rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer',
                              focusMode === 'focused'
                                ? 'border-accent bg-accent-subtle text-accent'
                                : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                            )}
                          >
                            {language === 'ar' ? 'مخصّص للوظيفة فقط' : 'Role-Focused'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFocusMode('all')}
                            aria-pressed={focusMode === 'all'}
                            className={cn(
                              'rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer',
                              focusMode === 'all'
                                ? 'border-accent bg-accent-subtle text-accent'
                                : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                            )}
                          >
                            {language === 'ar' ? 'كل السجلات' : 'Full Profile'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CV Language Selector */}
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        <Globe className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                        {t('recruiter:cv.languageLabel')}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {(['en', 'ar'] as const).map((langOpt) => (
                          <button
                            key={langOpt}
                            type="button"
                            onClick={() => {
                              setCvLanguage(langOpt);
                              syncUrlParams({ lang: langOpt });
                            }}
                            aria-pressed={cvLanguage === langOpt}
                            className={cn(
                              'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer sm:text-sm',
                              cvLanguage === langOpt
                                ? 'border-accent bg-accent-subtle text-accent'
                                : 'border-border-default bg-bg-primary text-text-secondary hover:text-text-primary'
                            )}
                          >
                            {langOpt === 'en'
                              ? t('recruiter:entry.langEn')
                              : t('recruiter:entry.langAr')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Template Selector */}
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        <LayoutTemplate className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                        {t('recruiter:cv.templateLabel')}
                      </span>
                      <div className="space-y-2">
                        {(['ats', 'modern'] as const).map((tpl) => {
                          const active = template === tpl;
                          return (
                            <button
                              key={tpl}
                              type="button"
                              onClick={() => {
                                setTemplate(tpl);
                                syncUrlParams({ template: tpl });
                              }}
                              aria-pressed={active}
                              className={cn(
                                'flex w-full items-start justify-between gap-2.5 rounded-xl border p-3 text-start transition-colors cursor-pointer',
                                active
                                  ? 'border-accent bg-accent-subtle/50'
                                  : 'border-border-default bg-bg-primary hover:border-border-strong'
                              )}
                            >
                              <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-text-primary">
                                  {t(`recruiter:cv.templates.${tpl}.name`)}
                                </p>
                                <p className="text-xs leading-relaxed text-text-secondary">
                                  {t(`recruiter:cv.templates.${tpl}.desc`)}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                  active
                                    ? 'border-accent bg-accent text-accent-foreground'
                                    : 'border-border-strong'
                                )}
                              >
                                {active && <Check className="h-3 w-3" aria-hidden="true" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preview-only Section Visibility & Ordering */}
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        <Eye className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                        {t('recruiter:cv.sectionsLabel')}
                      </span>
                      <div className="space-y-1.5">
                        {sections.map((sec, idx) => (
                          <div
                            key={sec.key}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1.5"
                          >
                            <button
                              type="button"
                              onClick={() => toggleSectionVisibility(sec.key)}
                              aria-pressed={sec.visible}
                              className={cn(
                                'flex min-w-0 flex-1 items-center gap-2 text-start text-xs font-medium cursor-pointer',
                                sec.visible
                                  ? 'text-text-primary'
                                  : 'text-text-secondary/60 line-through'
                              )}
                            >
                              <Check
                                className={cn(
                                  'h-3.5 w-3.5 shrink-0',
                                  sec.visible ? 'text-accent' : 'opacity-20'
                                )}
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {t(`recruiter:cv.sectionNames.${sec.key}`)}
                              </span>
                            </button>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSection(idx, 'up')}
                                aria-label="Move section up"
                                className="inline-flex h-6 w-6 items-center justify-center rounded border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="h-3 w-3" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === sections.length - 1}
                                onClick={() => moveSection(idx, 'down')}
                                aria-label="Move section down"
                                className="inline-flex h-6 w-6 items-center justify-center rounded border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {sidebarTab === 'content' && (
                  <div className="space-y-5">
                    {/* 1. Editable Professional Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="cv-summary-editor"
                          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
                        >
                          {t('recruiter:cv.editor.summaryLabel')}
                        </label>
                        {customSummaryDraft !== null && (
                          <button
                            type="button"
                            onClick={() => setCustomSummaryDraft(null)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                            <span>{t('recruiter:cv.editor.resetSummary')}</span>
                          </button>
                        )}
                      </div>
                      <textarea
                        id="cv-summary-editor"
                        rows={5}
                        dir={cvLanguage === 'ar' ? 'rtl' : 'ltr'}
                        value={customSummaryDraft ?? autoGeneratedSummary}
                        onChange={(e) => setCustomSummaryDraft(e.target.value)}
                        className="w-full rounded-[10px] border border-border-default bg-bg-primary p-3 text-xs leading-relaxed text-text-primary focus:border-accent focus:outline-none"
                      />
                    </div>

                    {/* 2. Experience Selection */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        {t('recruiter:cv.editor.experienceLabel')}
                      </p>
                      <div className="space-y-1.5">
                        {cvEligibleExperience.map(({ item: exp }) => {
                          const included = !excludedExperienceIds.includes(exp.id);
                          return (
                            <label
                              key={exp.id}
                              className="flex items-start gap-2.5 rounded-lg border border-border-default bg-bg-primary px-3 py-2 text-xs cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={included}
                                onChange={() =>
                                  toggleIdInList(exp.id, setExcludedExperienceIds)
                                }
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-accent"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold text-text-primary">
                                  {pickCvText(exp.role, cvLanguage)}
                                </span>
                                <span className="block truncate text-[11px] text-text-secondary">
                                  {pickCvText(exp.company, cvLanguage)}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Projects Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                          {t('recruiter:cv.editor.projectsLabel')}
                        </p>
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              setExcludedProjectIds(
                                cvEligibleProjects
                                  .filter((p) => p.tier === 'supporting')
                                  .map((p) => p.item.id)
                              )
                            }
                            className="font-medium text-accent hover:underline cursor-pointer"
                          >
                            {t('recruiter:cv.editor.relevantOnly')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setExcludedProjectIds([])}
                            className="font-medium text-text-secondary hover:text-text-primary cursor-pointer"
                          >
                            {t('recruiter:cv.editor.selectAll')}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {cvEligibleProjects.map(({ item: proj, tier }) => {
                          const included = !excludedProjectIds.includes(proj.id);
                          return (
                            <label
                              key={proj.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-primary px-3 py-2 text-xs cursor-pointer"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={included}
                                  onChange={() =>
                                    toggleIdInList(proj.id, setExcludedProjectIds)
                                  }
                                  className="h-3.5 w-3.5 shrink-0 rounded accent-accent"
                                />
                                <span className="truncate font-medium text-text-primary">
                                  {pickCvText(proj.title, cvLanguage)}
                                </span>
                              </span>
                              <span className="shrink-0 rounded bg-bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                                {t(`recruiter:tiers.${tier}`)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Skills Selection (Groups & Individual Skills) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                          {t('recruiter:cv.editor.skillsLabel')}
                        </p>
                        {(excludedSkillGroupIds.length > 0 || excludedSkillKeys.length > 0) && (
                          <button
                            type="button"
                            onClick={() => {
                              setExcludedSkillGroupIds([]);
                              setExcludedSkillKeys([]);
                            }}
                            className="text-[11px] font-medium text-accent hover:underline cursor-pointer"
                          >
                            {t('recruiter:cv.editor.selectAll')}
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {cvEligibleSkills.map(({ item: group }) => {
                          const groupIncluded = !excludedSkillGroupIds.includes(group.id);
                          return (
                            <div
                              key={group.id}
                              className="space-y-2 rounded-lg border border-border-default bg-bg-primary p-2.5"
                            >
                              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={groupIncluded}
                                  onChange={() =>
                                    toggleIdInList(group.id, setExcludedSkillGroupIds)
                                  }
                                  className="h-3.5 w-3.5 shrink-0 rounded accent-accent"
                                />
                                <span className="truncate">
                                  {pickCvText(group.title, cvLanguage)}
                                </span>
                              </label>
                              {groupIncluded && (
                                <div className="flex flex-wrap gap-1 ps-5">
                                  {group.skills.map((sk) => {
                                    const skKey = `${group.id}::${sk.en}`;
                                    const active = !excludedSkillKeys.includes(skKey);
                                    return (
                                      <button
                                        key={skKey}
                                        type="button"
                                        onClick={() =>
                                          toggleIdInList(skKey, setExcludedSkillKeys)
                                        }
                                        className={cn(
                                          'rounded border px-2 py-0.5 text-[11px] transition-colors cursor-pointer',
                                          active
                                            ? 'border-accent-border bg-accent-subtle/40 text-text-primary'
                                            : 'border-border-default bg-bg-secondary text-text-secondary/50 line-through'
                                        )}
                                      >
                                        {pickCvText(sk, cvLanguage)}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Filename & Export CTA */}
                <div className="space-y-3 border-t border-border-default pt-4">
                  <div className="rounded-lg border border-border-default bg-bg-primary px-3 py-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                      {t('recruiter:cv.filenameLabel')}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-text-primary" dir="ltr">
                      {suggestedFilenameBase}.pdf
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handlePrintPdf}
                    className="w-full"
                  >
                    <FileDown className="h-4 w-4" aria-hidden="true" />
                    <span>{t('recruiter:cv.downloadPdf')}</span>
                  </Button>

                  <p className="flex items-start gap-2 text-[11px] leading-relaxed text-text-secondary">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                    <span>{t('recruiter:cv.printHint')}</span>
                  </p>
                </div>
              </Card>
            </aside>

            {/* Right Live A4 Preview & Print Target */}
            <div className="space-y-3 lg:col-span-8 print:col-span-12">
              <div className="no-print flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-secondary">
                  <Printer className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {t('recruiter:cv.previewHeading')}
                </span>
                <span className="font-mono text-xs text-text-secondary" dir="ltr">
                  210 × 297 mm · A4 · {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                </span>
              </div>

                <div className="overflow-hidden rounded-2xl border border-border-default bg-bg-secondary/60 p-3 sm:p-6 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0">
                  {template === 'modern' ? (
                    <CvModernTemplate
                      profile={profile}
                      tailored={tailored}
                      cvLanguage={cvLanguage}
                      sections={sections}
                      labels={documentLabels}
                      showContactEmail={siteSettings.showContactEmail}
                      showLinkedinLink={siteSettings.showLinkedinLink}
                      showCoursesSection={siteSettings.showCoursesSection}
                      customizations={customizations}
                      onPageCountChange={setPageCount}
                    />
                  ) : (
                    <CvAtsTemplate
                      profile={profile}
                      tailored={tailored}
                      cvLanguage={cvLanguage}
                      sections={sections}
                      labels={documentLabels}
                      showContactEmail={siteSettings.showContactEmail}
                      showLinkedinLink={siteSettings.showLinkedinLink}
                      showCoursesSection={siteSettings.showCoursesSection}
                      customizations={customizations}
                      onPageCountChange={setPageCount}
                    />
                  )}
                </div>
              </div>
            </div>
        </Container>
      </section>
    </>
  );
}
