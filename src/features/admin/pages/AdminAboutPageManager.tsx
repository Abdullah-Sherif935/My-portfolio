import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Trash2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { PageEditorShell } from '@/features/admin/components/PageEditorShell';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { AdminEducationPage } from '@/features/admin/education/AdminEducationPage';
import type { ProfileData } from '@/types/portfolio';
import { cn } from '@/utils/cn';

type AboutSubTab = 'summary' | 'education' | 'languages' | 'media';

const VALID_TABS: AboutSubTab[] = ['summary', 'education', 'languages', 'media'];

export function AdminAboutPageManager() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(`${t('nav.pageAbout')} — ${t('brand.console')}`);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as AboutSubTab | null;
  const [activeTab, setActiveTab] = useState<AboutSubTab>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : 'summary'
  );

  const { profile, siteSettings, updateProfile, updateSiteSettings, isSaving } =
    useAdminData();

  const [form, setForm] = useState<ProfileData>(() => structuredClone(profile));
  const [showPortrait, setShowPortrait] = useState(
    siteSettings.showGraduationPortrait
  );
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  useEffect(() => {
    setForm(structuredClone(profile));
  }, [profile]);

  useEffect(() => {
    setShowPortrait(siteSettings.showGraduationPortrait);
  }, [siteSettings.showGraduationPortrait]);

  const isDirty = useMemo(() => {
    return (
      JSON.stringify({
        fullName: form.fullName,
        shortName: form.shortName,
        headline: form.headline,
        location: form.location,
        summary: form.summary,
        languages: form.languages,
        coreCompetencies: form.coreCompetencies,
        avatarUrl: form.avatarUrl ?? null,
        showPortrait,
      }) !==
      JSON.stringify({
        fullName: profile.fullName,
        shortName: profile.shortName,
        headline: profile.headline,
        location: profile.location,
        summary: profile.summary,
        languages: profile.languages,
        coreCompetencies: profile.coreCompetencies,
        avatarUrl: profile.avatarUrl ?? null,
        showPortrait: siteSettings.showGraduationPortrait,
      })
    );
  }, [form, showPortrait, profile, siteSettings.showGraduationPortrait]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const switchTab = (next: AboutSubTab) => {
    setActiveTab(next);
    setSearchParams({ tab: next }, { replace: true });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName.en.trim() || !form.fullName.ar.trim()) {
      setError(t('common.validationRequired'));
      return;
    }
    setError(null);
    try {
      await updateProfile({ ...form, dataSource: 'cms' });
      if (showPortrait !== siteSettings.showGraduationPortrait) {
        await updateSiteSettings({
          ...siteSettings,
          showGraduationPortrait: showPortrait,
        });
      }
      setLastSaved(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setPreviewRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  return (
    <PageEditorShell
      title={t('aboutMgr.title')}
      subtitle={t('aboutMgr.subtitle')}
      publicRoute="/about"
      mappingPath={t('aboutMgr.mappingPath')}
      sharedPages={[t('nav.pageHome'), t('nav.featureRecruiter'), t('nav.featureCvBuilder')]}
      hasUnsavedChanges={isDirty}
      lastSavedLabel={lastSaved}
      previewRefreshKey={previewRefreshKey}
    >
      {/* Internal Sub-Tabs */}
      <div role="tablist" className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ['summary', t('aboutMgr.tabs.summary')],
            ['education', t('aboutMgr.tabs.education')],
            ['languages', t('aboutMgr.tabs.languages')],
            ['media', t('aboutMgr.tabs.media')],
          ] as const
        ).map(([tabId, label]) => (
          <button
            key={tabId}
            type="button"
            role="tab"
            aria-selected={activeTab === tabId}
            onClick={() => switchTab(tabId)}
            className={cn(
              'rounded-[10px] border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm cursor-pointer',
              activeTab === tabId
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-xs text-error">
          {error}
        </div>
      )}

      {/* Sub-Tab 1: Personal Introduction & Summary */}
      {activeTab === 'summary' && (
        <form onSubmit={(e) => void handleSave(e)} className="space-y-5">
          <Card className="space-y-5 p-5 sm:p-6">
            <SectionMappingBadge
              location={t('aboutMgr.mapSummary')}
              sharedWith={[t('nav.pageHome'), t('nav.featureCvBuilder')]}
            />
            <LocalizedFieldGroup
              idPrefix="about-fullname"
              label={t('profile.fullName')}
              required
              value={form.fullName}
              onChange={(fullName) => setForm((p) => ({ ...p, fullName }))}
            />
            <LocalizedFieldGroup
              idPrefix="about-shortname"
              label={t('profile.shortName')}
              required
              value={form.shortName}
              onChange={(shortName) => setForm((p) => ({ ...p, shortName }))}
            />
            <LocalizedFieldGroup
              idPrefix="about-headline"
              label={t('profile.headline')}
              required
              value={form.headline}
              onChange={(headline) => setForm((p) => ({ ...p, headline }))}
            />
            <LocalizedFieldGroup
              idPrefix="about-location"
              label={t('profile.location')}
              value={form.location}
              onChange={(location) => setForm((p) => ({ ...p, location }))}
            />
            <LocalizedFieldGroup
              idPrefix="about-summary"
              label={t('profile.summary')}
              multiline
              rows={5}
              value={form.summary}
              onChange={(summary) => setForm((p) => ({ ...p, summary }))}
            />
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={!isDirty}
              onClick={() => setForm(structuredClone(profile))}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSaving || !isDirty}>
              {isSaving ? t('prototype.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      )}

      {/* Sub-Tab 2: Education (Reuses full existing AdminEducationPage) */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <SectionMappingBadge
            location={t('aboutMgr.mapEducation')}
            sharedWith={[t('nav.pageHome'), t('nav.featureCvBuilder')]}
          />
          <AdminEducationPage />
        </div>
      )}

      {/* Sub-Tab 3: Languages & Core Competencies */}
      {activeTab === 'languages' && (
        <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
          <Card className="space-y-4 p-5 sm:p-6">
            <SectionMappingBadge
              location={t('aboutMgr.mapLanguages')}
              sharedWith={[t('nav.featureCvBuilder')]}
            />
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text-primary">
                {t('profile.languagesSection')}
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    languages: [
                      ...p.languages,
                      { name: { en: '', ar: '' }, proficiency: { en: '', ar: '' } },
                    ],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('profile.addLanguage')}</span>
              </Button>
            </div>
            <div className="space-y-3">
              {form.languages.map((lang, idx) => (
                <div
                  key={idx}
                  className="grid gap-2.5 rounded-xl border border-border-default bg-bg-primary p-3 sm:grid-cols-2 lg:grid-cols-5"
                >
                  <input
                    dir="ltr"
                    value={lang.name.en}
                    placeholder={`${t('profile.languageName')} (EN)`}
                    onChange={(e) => {
                      const next = [...form.languages];
                      next[idx] = { ...lang, name: { ...lang.name, en: e.target.value } };
                      setForm((p) => ({ ...p, languages: next }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                  />
                  <input
                    dir="rtl"
                    value={lang.name.ar}
                    placeholder={`${t('profile.languageName')} (AR)`}
                    onChange={(e) => {
                      const next = [...form.languages];
                      next[idx] = { ...lang, name: { ...lang.name, ar: e.target.value } };
                      setForm((p) => ({ ...p, languages: next }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                  />
                  <input
                    dir="ltr"
                    value={lang.proficiency.en}
                    placeholder={`${t('profile.languageLevel')} (EN)`}
                    onChange={(e) => {
                      const next = [...form.languages];
                      next[idx] = {
                        ...lang,
                        proficiency: { ...lang.proficiency, en: e.target.value },
                      };
                      setForm((p) => ({ ...p, languages: next }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                  />
                  <input
                    dir="rtl"
                    value={lang.proficiency.ar}
                    placeholder={`${t('profile.languageLevel')} (AR)`}
                    onChange={(e) => {
                      const next = [...form.languages];
                      next[idx] = {
                        ...lang,
                        proficiency: { ...lang.proficiency, ar: e.target.value },
                      };
                      setForm((p) => ({ ...p, languages: next }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        languages: p.languages.filter((_, i) => i !== idx),
                      }))
                    }
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('common.delete')}</span>
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-5 sm:p-6">
            <SectionMappingBadge
              location={t('aboutMgr.mapCompetencies')}
              sharedWith={[t('nav.pageHome')]}
            />
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text-primary">
                {t('profile.competenciesSection')}
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    coreCompetencies: [...p.coreCompetencies, { en: '', ar: '' }],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('profile.addCompetency')}</span>
              </Button>
            </div>
            <div className="space-y-2.5">
              {form.coreCompetencies.map((comp, idx) => (
                <div key={idx} className="grid gap-2.5 sm:grid-cols-12">
                  <input
                    dir="ltr"
                    value={comp.en}
                    placeholder="EN"
                    onChange={(e) => {
                      const next = [...form.coreCompetencies];
                      next[idx] = { ...comp, en: e.target.value };
                      setForm((p) => ({ ...p, coreCompetencies: next }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <input
                    dir="rtl"
                    value={comp.ar}
                    placeholder="AR"
                    onChange={(e) => {
                      const next = [...form.coreCompetencies];
                      next[idx] = { ...comp, ar: e.target.value };
                      setForm((p) => ({ ...p, coreCompetencies: next }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        coreCompetencies: p.coreCompetencies.filter((_, i) => i !== idx),
                      }))
                    }
                    className="text-error hover:text-error sm:col-span-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={!isDirty}
              onClick={() => setForm(structuredClone(profile))}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSaving || !isDirty}>
              {isSaving ? t('prototype.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      )}

      {/* Sub-Tab 4: Profile Media */}
      {activeTab === 'media' && (
        <form onSubmit={(e) => void handleSave(e)} className="space-y-5">
          <Card className="space-y-5 p-5 sm:p-6">
            <SectionMappingBadge
              location={t('aboutMgr.mapMedia')}
              sharedWith={[t('nav.pageHome')]}
            />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={pick(form.fullName)}
                  className="h-24 w-24 shrink-0 rounded-2xl border border-border-strong object-cover object-top"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-border-strong bg-bg-primary text-accent">
                  <UserRound className="h-10 w-10" aria-hidden="true" />
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="about-avatar" className="block text-xs font-medium text-text-primary">
                    {t('profile.avatarUrl')}
                  </label>
                  <input
                    id="about-avatar"
                    dir="ltr"
                    value={form.avatarUrl ?? ''}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        avatarUrl: e.target.value.trim() ? e.target.value : null,
                      }))
                    }
                    className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                  />
                </div>
                <label className="inline-flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPortrait}
                    onChange={(e) => setShowPortrait(e.target.checked)}
                    className="h-4 w-4 rounded accent-accent"
                  />
                  <span>{t('settings.showGraduationPortrait')}</span>
                </label>
                <div>
                  <Link
                    to="/admin/system/media"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    <span>{t('aboutMgr.openMediaLibrary')}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={!isDirty}
              onClick={() => {
                setForm(structuredClone(profile));
                setShowPortrait(siteSettings.showGraduationPortrait);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSaving || !isDirty}>
              {isSaving ? t('prototype.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      )}
    </PageEditorShell>
  );
}
