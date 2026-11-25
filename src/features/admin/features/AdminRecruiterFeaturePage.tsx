import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { PageEditorShell } from '@/features/admin/components/PageEditorShell';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import {
  COMPETENCY_CATALOG,
  RECRUITER_POSITIONS,
  getEffectivePosition,
} from '@/services/recruiterMatcher';
import type {
  ProfileMatchingWeights,
  RecruiterPositionId,
  RecruiterProfileOverrides,
} from '@/types/recruiter';
import { cn } from '@/utils/cn';

const WEIGHT_FIELDS: Array<{ key: keyof ProfileMatchingWeights; en: string; ar: string }> = [
  { key: 'requiredSkills', en: 'Required Skills', ar: 'المهارات الأساسية' },
  { key: 'preferredSkills', en: 'Preferred Skills', ar: 'المهارات المفضّلة' },
  { key: 'experience', en: 'Experience', ar: 'الخبرة العملية' },
  { key: 'projects', en: 'Projects', ar: 'المشاريع' },
  { key: 'toolsAndTech', en: 'Tools & Tech', ar: 'الأدوات والتقنيات' },
  { key: 'educationAndCerts', en: 'Education & Certs', ar: 'التعليم والدورات' },
];

export function AdminRecruiterFeaturePage() {
  const { t } = useTranslation('admin');
  const { pick, language } = useLanguage();
  useDocumentTitle(`${t('nav.featureRecruiter')} — ${t('brand.console')}`);

  const {
    projects,
    experience,
    skills,
    certifications,
    siteSettings,
    updateSiteSettings,
    isSaving,
  } = useAdminData();

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [expandedRole, setExpandedRole] = useState<RecruiterPositionId | null>(null);
  const [overridesDraft, setOverridesDraft] = useState<RecruiterProfileOverrides>(
    () => structuredClone(siteSettings.recruiterProfiles ?? {})
  );

  useEffect(() => {
    setOverridesDraft(structuredClone(siteSettings.recruiterProfiles ?? {}));
  }, [siteSettings.recruiterProfiles]);

  const toggleRecruiterMode = async (enabled: boolean) => {
    await updateSiteSettings({
      ...siteSettings,
      recruiterModeEnabled: enabled,
    });
    setLastSaved(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    setPreviewRefreshKey((k) => k + 1);
  };

  const toggleCompetencyForRole = (
    roleId: RecruiterPositionId,
    field: 'requiredSkillIds' | 'preferredSkillIds',
    compId: string
  ) => {
    const eff = getEffectivePosition(roleId, overridesDraft);
    const currentReq = eff.requiredSkills.map((s) => s.id);
    const currentPref = eff.preferredSkills.map((s) => s.id);
    const sourceList = field === 'requiredSkillIds' ? currentReq : currentPref;
    const otherList = field === 'requiredSkillIds' ? currentPref : currentReq;

    const nextList = sourceList.includes(compId)
      ? sourceList.filter((id) => id !== compId)
      : [...sourceList, compId];

    // Prevent same competency from appearing in both required & preferred simultaneously
    const cleanedOther = nextList.includes(compId)
      ? otherList.filter((id) => id !== compId)
      : otherList;

    setOverridesDraft((prev) => ({
      ...prev,
      [roleId]: {
        ...(prev[roleId] ?? {}),
        requiredSkillIds: field === 'requiredSkillIds' ? nextList : cleanedOther,
        preferredSkillIds: field === 'preferredSkillIds' ? nextList : cleanedOther,
      },
    }));
  };

  const updateWeightForRole = (
    roleId: RecruiterPositionId,
    weightKey: keyof ProfileMatchingWeights,
    value: number
  ) => {
    const eff = getEffectivePosition(roleId, overridesDraft);
    const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
    setOverridesDraft((prev) => ({
      ...prev,
      [roleId]: {
        ...(prev[roleId] ?? {}),
        weights: {
          ...eff.weights,
          [weightKey]: clamped,
        },
      },
    }));
  };

  const resetRoleOverride = (roleId: RecruiterPositionId) => {
    setOverridesDraft((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
  };

  const saveRecruiterRules = async () => {
    const hasOverrides = Object.keys(overridesDraft).length > 0;
    await updateSiteSettings({
      ...siteSettings,
      recruiterProfiles: hasOverrides ? overridesDraft : undefined,
    });
    setLastSaved(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    setPreviewRefreshKey((k) => k + 1);
  };

  const isRulesDirty =
    JSON.stringify(overridesDraft) !==
    JSON.stringify(siteSettings.recruiterProfiles ?? {});

  const taggedGroups = [
    {
      label: t('nav.pagePortfolio'),
      editTo: '/admin/pages/portfolio',
      rows: projects.map((p) => ({
        id: p.id,
        title: pick(p.title),
        tags: p.matchingTags ?? [],
        priority: p.cvPriority ?? 50,
        showInCv: p.showInCv !== false,
      })),
    },
    {
      label: t('nav.pageExperience'),
      editTo: '/admin/pages/experience',
      rows: experience.map((e) => ({
        id: e.id,
        title: `${pick(e.role)} — ${pick(e.company)}`,
        tags: e.matchingTags ?? [],
        priority: e.cvPriority ?? 50,
        showInCv: e.showInCv !== false,
      })),
    },
    {
      label: t('nav.pageSkills'),
      editTo: '/admin/pages/skills',
      rows: skills.map((s) => ({
        id: s.id,
        title: pick(s.title),
        tags: s.matchingTags ?? [],
        priority: s.cvPriority ?? 50,
        showInCv: s.showInCv !== false,
      })),
    },
    {
      label: t('nav.pageCertifications'),
      editTo: '/admin/pages/certifications',
      rows: certifications.map((c) => ({
        id: c.id,
        title: pick(c.title),
        tags: c.matchingTags ?? [],
        priority: null as number | null,
        showInCv: c.showInCv !== false,
      })),
    },
  ];

  return (
    <PageEditorShell
      title={t('recruiterMgr.title')}
      subtitle={t('recruiterMgr.subtitle')}
      publicRoute="/recruiter"
      mappingPath={t('recruiterMgr.mappingPath')}
      sharedPages={[t('nav.pageHome'), t('nav.featureCvBuilder')]}
      hasUnsavedChanges={isRulesDirty}
      lastSavedLabel={lastSaved}
      previewRefreshKey={previewRefreshKey}
    >
      <div className="space-y-6">
        {/* Visibility Control */}
        <Card className="space-y-4 p-5 sm:p-6">
          <SectionMappingBadge
            location={t('recruiterMgr.mapVisibility')}
            sharedWith={[t('nav.navigationMgmt')]}
          />
          <label className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary px-4 py-3.5 text-sm font-medium text-text-primary cursor-pointer">
            <span>{t('settings.recruiterModeEnabled')}</span>
            <input
              type="checkbox"
              disabled={isSaving}
              checked={siteSettings.recruiterModeEnabled}
              onChange={(e) => void toggleRecruiterMode(e.target.checked)}
              className="h-4 w-4 rounded accent-accent"
            />
          </label>
        </Card>

        {/* Editable Job Profile Matching Rules */}
        <Card className="space-y-4 p-5 sm:p-6">
          <SectionMappingBadge
            location={t('recruiterMgr.mapPositions')}
            sharedWith={[t('nav.featureCvBuilder')]}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-base font-semibold text-text-primary">
                {t('recruiterMgr.positionsHeading')}
              </h2>
            </div>
            {isRulesDirty && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => void saveRecruiterRules()}
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isSaving ? t('prototype.saving') : t('common.save')}</span>
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {RECRUITER_POSITIONS.map((basePos) => {
              const eff = getEffectivePosition(basePos.id, overridesDraft);
              const isCustom = basePos.id === 'custom';
              const isExpanded = expandedRole === basePos.id;
              const hasCustomOverride = Boolean(overridesDraft[basePos.id]);

              return (
                <div
                  key={basePos.id}
                  className="rounded-xl border border-border-default bg-bg-primary p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary">
                          {pick(eff.label)}
                        </p>
                        {hasCustomOverride && (
                          <Badge variant="accent">
                            {language === 'ar' ? 'مخصّص' : 'Customized'}
                          </Badge>
                        )}
                      </div>
                      {!isCustom ? (
                        <p className="text-xs text-text-secondary">
                          {language === 'ar'
                            ? `${eff.requiredSkills.length} مهارات أساسية · ${eff.preferredSkills.length} مهارات مفضّلة`
                            : `${eff.requiredSkills.length} required skills · ${eff.preferredSkills.length} preferred skills`}
                        </p>
                      ) : (
                        <p className="text-xs text-text-secondary">
                          {t('recruiterMgr.dynamicCustomHint')}
                        </p>
                      )}
                    </div>

                    {!isCustom && (
                      <div className="flex items-center gap-2">
                        {hasCustomOverride && (
                          <button
                            type="button"
                            onClick={() => resetRoleOverride(basePos.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border-default px-2.5 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                            <span>{language === 'ar' ? 'افتراضي' : 'Reset'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedRole(isExpanded ? null : basePos.id)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text-primary hover:border-accent hover:text-accent cursor-pointer"
                        >
                          <span>
                            {isExpanded
                              ? language === 'ar'
                                ? 'إغلاق القواعد'
                                : 'Close Rules'
                              : language === 'ar'
                                ? 'تعديل القواعد'
                                : 'Edit Rules'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isCustom && isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-border-default pt-4">
                      {/* Required Skills Selector */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-text-primary">
                          {language === 'ar'
                            ? 'المهارات الأساسية المطلوبة (Required Skills)'
                            : 'Required Skills'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {COMPETENCY_CATALOG.map((comp) => {
                            const active = eff.requiredSkills.some(
                              (s) => s.id === comp.id
                            );
                            return (
                              <button
                                key={comp.id}
                                type="button"
                                onClick={() =>
                                  toggleCompetencyForRole(
                                    basePos.id,
                                    'requiredSkillIds',
                                    comp.id
                                  )
                                }
                                className={cn(
                                  'rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                                  active
                                    ? 'border-accent bg-accent-subtle text-accent'
                                    : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                                )}
                              >
                                {pick(comp.label)}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Preferred Skills Selector */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-text-primary">
                          {language === 'ar'
                            ? 'المهارات المفضّلة (Preferred Skills)'
                            : 'Preferred Skills'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {COMPETENCY_CATALOG.map((comp) => {
                            const active = eff.preferredSkills.some(
                              (s) => s.id === comp.id
                            );
                            return (
                              <button
                                key={comp.id}
                                type="button"
                                onClick={() =>
                                  toggleCompetencyForRole(
                                    basePos.id,
                                    'preferredSkillIds',
                                    comp.id
                                  )
                                }
                                className={cn(
                                  'rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                                  active
                                    ? 'border-success/50 bg-success-subtle text-success'
                                    : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                                )}
                              >
                                {pick(comp.label)}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Weights Grid */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-text-primary">
                          {language === 'ar'
                            ? 'أوزان التقييم النسبي (Weights)'
                            : 'Scoring Weights'}
                        </p>
                        <div className="grid gap-2.5 sm:grid-cols-3">
                          {WEIGHT_FIELDS.map((wf) => (
                            <label
                              key={wf.key}
                              className="flex items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-xs"
                            >
                              <span className="text-text-secondary">
                                {language === 'ar' ? wf.ar : wf.en}
                              </span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={eff.weights[wf.key]}
                                onChange={(e) =>
                                  updateWeightForRole(
                                    basePos.id,
                                    wf.key,
                                    Number(e.target.value)
                                  )
                                }
                                className="w-16 rounded border border-border-default bg-bg-primary px-2 py-1 text-center font-mono text-xs text-text-primary"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Matching Tags & Priority Audit Matrix */}
        <Card className="space-y-5 p-5 sm:p-6">
          <SectionMappingBadge
            location={t('recruiterMgr.mapMatrix')}
            sharedWith={[t('nav.featureCvBuilder')]}
          />
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              {t('recruiterMgr.matrixHeading')}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {t('recruiterMgr.matrixSubtitle')}
            </p>
          </div>

          <div className="space-y-5">
            {taggedGroups.map((grp) => (
              <div key={grp.label} className="space-y-2">
                <div className="flex items-center justify-between border-b border-border-default pb-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    {grp.label}
                  </h3>
                  <Link
                    to={grp.editTo}
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                  >
                    <span>{t('recruiterMgr.editInTab')}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {grp.rows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col gap-2 rounded-xl border border-border-default bg-bg-primary p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {row.title}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {row.tags.length > 0 ? (
                            row.tags.slice(0, 8).map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-text-secondary">
                              {t('recruiterMgr.noTags')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {row.priority !== null && (
                          <Badge variant="muted" mono>
                            P:{row.priority}
                          </Badge>
                        )}
                        <Badge variant={row.showInCv ? 'success' : 'muted'}>
                          {row.showInCv ? 'CV' : t('common.hidden')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageEditorShell>
  );
}
