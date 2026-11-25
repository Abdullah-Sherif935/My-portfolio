import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { PageEditorShell } from '@/features/admin/components/PageEditorShell';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { HomeIntroAcademicTab } from './HomeIntroAcademicTab';
import { HomeSpecializationsTab } from './HomeSpecializationsTab';
import { DEFAULT_HOME_SECTIONS_CONFIG } from '@/data/adminMock';
import type { HomeHeroCardsConfig, HomeSectionsVisibility } from '@/types/admin';
import type { ProfileData } from '@/types/portfolio';
import { cn } from '@/utils/cn';

type HomeSubTab =
  | 'hero'
  | 'profile-academic'
  | 'specializations'
  | 'featured'
  | 'sections';

const VALID_TABS: HomeSubTab[] = [
  'hero',
  'profile-academic',
  'specializations',
  'featured',
  'sections',
];

export function AdminHomePageManager() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(`${t('nav.pageHome')} — ${t('brand.console')}`);

  const {
    profile,
    projects,
    siteSettings,
    updateProfile,
    saveProject,
    updateSiteSettings,
    isSaving,
  } = useAdminData();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = searchParams.get('tab') as HomeSubTab | null;
  const [activeTab, setActiveTab] = useState<HomeSubTab>(
    initialTabParam && VALID_TABS.includes(initialTabParam) ? initialTabParam : 'hero'
  );
  const [subTabDirty, setSubTabDirty] = useState(false);
  const initialHeroCards = useMemo<HomeHeroCardsConfig>(
    () =>
      structuredClone(
        siteSettings.homeSections.heroCards ?? DEFAULT_HOME_SECTIONS_CONFIG.heroCards!
      ),
    [siteSettings.homeSections.heroCards]
  );

  const [heroForm, setHeroForm] = useState<ProfileData>(() => structuredClone(profile));
  const [showPortrait, setShowPortrait] = useState<boolean>(
    siteSettings.showGraduationPortrait
  );
  const [heroCardsForm, setHeroCardsForm] = useState<HomeHeroCardsConfig>(
    () => initialHeroCards
  );
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  const handleSelectTab = (tabId: HomeSubTab) => {
    setActiveTab(tabId);
    setSubTabDirty(false);
    setSearchParams(tabId === 'hero' ? {} : { tab: tabId }, { replace: true });
  };

  useEffect(() => {
    setHeroForm(structuredClone(profile));
  }, [profile]);

  useEffect(() => {
    setShowPortrait(siteSettings.showGraduationPortrait);
  }, [siteSettings.showGraduationPortrait]);

  useEffect(() => {
    setHeroCardsForm(structuredClone(initialHeroCards));
  }, [initialHeroCards]);

  const heroDirty = useMemo(() => {
    return (
      JSON.stringify({
        fullName: heroForm.fullName,
        headline: heroForm.headline,
        location: heroForm.location,
        summary: heroForm.summary,
        avatarUrl: heroForm.avatarUrl ?? null,
        showPortrait,
        heroCards: heroCardsForm,
      }) !==
      JSON.stringify({
        fullName: profile.fullName,
        headline: profile.headline,
        location: profile.location,
        summary: profile.summary,
        avatarUrl: profile.avatarUrl ?? null,
        showPortrait: siteSettings.showGraduationPortrait,
        heroCards: initialHeroCards,
      })
    );
  }, [
    heroForm,
    showPortrait,
    heroCardsForm,
    profile,
    siteSettings.showGraduationPortrait,
    initialHeroCards,
  ]);

  const isDirty = heroDirty || subTabDirty;

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const stampSaved = useCallback(() => {
    setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setPreviewRefreshKey((k) => k + 1);
  }, []);

  const handleSaveHero = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !heroForm.fullName.en.trim() ||
      !heroForm.fullName.ar.trim() ||
      !heroForm.headline.en.trim() ||
      !heroForm.headline.ar.trim()
    ) {
      setError(t('common.validationRequired'));
      return;
    }
    setError(null);
    try {
      await updateProfile({ ...heroForm, dataSource: 'cms' });
        const cardsChanged =
          JSON.stringify(heroCardsForm) !== JSON.stringify(initialHeroCards);
        if (showPortrait !== siteSettings.showGraduationPortrait || cardsChanged) {
          await updateSiteSettings({
            ...siteSettings,
            showGraduationPortrait: showPortrait,
            homeSections: {
              ...siteSettings.homeSections,
              heroCards: heroCardsForm,
            },
          });
        }
        stampSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('prototype.syncError'));
      }
    };

    const handleToggleFeatured = async (projectId: string) => {
      const target = projects.find((p) => p.id === projectId);
      if (!target) return;
      try {
        await saveProject({ ...target, featured: !target.featured });
        stampSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('prototype.syncError'));
      }
    };

    const vis = siteSettings.homeSections.visibility;
    const sectionVisibility: HomeSectionsVisibility = {
      intro:
        vis?.intro !== false && siteSettings.homeSections.intro.visible !== false,
      specializations:
        vis?.specializations !== false &&
        siteSettings.homeSections.specializations.visible !== false,
      featuredProjects: vis?.featuredProjects !== false,
      experience: vis?.experience !== false,
      companies: vis?.companies !== false,
      skills: vis?.skills !== false,
      certifications:
        vis?.certifications !== false && siteSettings.showCoursesSection !== false,
      contact: vis?.contact !== false,
    };

    const handleToggleSectionVisibility = async (
      key: keyof HomeSectionsVisibility,
      checked: boolean
    ) => {
      try {
        setError(null);
        const nextVisibility: HomeSectionsVisibility = {
          ...sectionVisibility,
          [key]: checked,
        };
        await updateSiteSettings({
          ...siteSettings,
          showCoursesSection:
            key === 'certifications' ? checked : siteSettings.showCoursesSection,
          homeSections: {
            ...siteSettings.homeSections,
            visibility: nextVisibility,
            intro:
              key === 'intro'
                ? { ...siteSettings.homeSections.intro, visible: checked }
                : siteSettings.homeSections.intro,
            specializations:
              key === 'specializations'
                ? { ...siteSettings.homeSections.specializations, visible: checked }
                : siteSettings.homeSections.specializations,
          },
        });
        stampSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('prototype.syncError'));
      }
    };

    const homeSectionsList: Array<{
      key: keyof HomeSectionsVisibility;
      code: string;
      name: string;
      route: string;
      to?: string;
      tab?: HomeSubTab;
    }> = [
      {
        key: 'intro',
        code: '01',
        name: t('homeMgr.tabs.profileAcademic'),
        route: '/#intro',
        tab: 'profile-academic',
      },
      {
        key: 'specializations',
        code: '02',
        name: t('homeMgr.tabs.specializations'),
        route: '/#specializations',
        tab: 'specializations',
      },
      {
        key: 'featuredProjects',
        code: '03',
        name: t('homeMgr.tabs.featured'),
        route: '/portfolio',
        tab: 'featured',
      },
      {
        key: 'experience',
        code: '04',
        name: t('homeMgr.sections.experience'),
        route: '/experience',
        to: '/admin/pages/experience',
      },
      {
        key: 'companies',
        code: '05',
        name: t('homeMgr.sections.companies'),
        route: '/companies',
        to: '/admin/pages/companies',
      },
      {
        key: 'skills',
        code: '06',
        name: t('homeMgr.sections.skills'),
        route: '/skills',
        to: '/admin/pages/skills',
      },
      {
        key: 'certifications',
        code: '07',
        name: t('homeMgr.sections.certifications'),
        route: '/certifications',
        to: '/admin/pages/certifications',
      },
      {
        key: 'contact',
        code: '08',
        name: t('homeMgr.sections.contact'),
        route: '/contact',
        to: '/admin/pages/contact',
      },
    ];

    return (
      <PageEditorShell
        title={t('homeMgr.title')}
        subtitle={t('homeMgr.subtitle')}
        publicRoute="/"
        mappingPath={t('homeMgr.mappingPath')}
        sharedPages={[t('nav.pageAbout'), t('nav.featureRecruiter'), t('nav.featureCvBuilder')]}
        hasUnsavedChanges={isDirty}
        lastSavedLabel={lastSaved}
        previewRefreshKey={previewRefreshKey}
      >
        {/* Internal Sub-Tabs */}
        <div role="tablist" className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ['hero', t('homeMgr.tabs.hero')],
              ['profile-academic', t('homeMgr.tabs.profileAcademic')],
              ['specializations', t('homeMgr.tabs.specializations')],
              ['featured', t('homeMgr.tabs.featured')],
              ['sections', t('homeMgr.tabs.sections')],
            ] as const
          ).map(([tabId, label]) => (
            <button
              key={tabId}
              type="button"
              role="tab"
              aria-selected={activeTab === tabId}
              onClick={() => handleSelectTab(tabId)}
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

        {/* Sub-Tab 1: Hero & Introduction */}
        {activeTab === 'hero' && (
          <form onSubmit={(e) => void handleSaveHero(e)} className="space-y-5">
            <Card className="space-y-5 p-5 sm:p-6">
              <SectionMappingBadge
                location={t('homeMgr.mapHero')}
                sharedWith={[t('nav.pageAbout'), t('nav.featureCvBuilder')]}
              />

              <LocalizedFieldGroup
                idPrefix="home-fullname"
                label={t('profile.fullName')}
                required
                value={heroForm.fullName}
                onChange={(fullName) => setHeroForm((p) => ({ ...p, fullName }))}
              />

              <LocalizedFieldGroup
                idPrefix="home-headline"
                label={t('profile.headline')}
                required
                value={heroForm.headline}
                onChange={(headline) => setHeroForm((p) => ({ ...p, headline }))}
              />

              <LocalizedFieldGroup
                idPrefix="home-location"
                label={t('profile.location')}
                value={heroForm.location}
                onChange={(location) => setHeroForm((p) => ({ ...p, location }))}
              />

              <LocalizedFieldGroup
                idPrefix="home-summary"
                label={t('profile.summary')}
                multiline
                rows={4}
                value={heroForm.summary}
                onChange={(summary) => setHeroForm((p) => ({ ...p, summary }))}
              />

              <div className="grid gap-4 border-t border-border-default pt-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="home-avatar" className="block text-xs font-medium text-text-primary">
                    {t('profile.avatarUrl')}
                  </label>
                  <input
                    id="home-avatar"
                    dir="ltr"
                    value={heroForm.avatarUrl ?? ''}
                    onChange={(e) =>
                      setHeroForm((p) => ({
                        ...p,
                        avatarUrl: e.target.value.trim() ? e.target.value : null,
                      }))
                    }
                    className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-end pb-1">
                  <label className="inline-flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPortrait}
                      onChange={(e) => setShowPortrait(e.target.checked)}
                      className="h-4 w-4 rounded accent-accent"
                    />
                    <span>{t('settings.showGraduationPortrait')}</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Hero Bottom Highlight Cards (Current Role & Core Focus) */}
            <Card className="space-y-5 p-5 sm:p-6">
              <SectionMappingBadge location={t('homeMgr.mapHeroCards')} />
              <p className="text-xs text-text-secondary">
                {t('homeMgr.heroCardsDescription')}
              </p>

              {/* Card 1: Current Role / Company */}
              <div className="space-y-4 rounded-xl border border-border-default bg-bg-primary/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {t('homeMgr.heroCardCurrentRole')}
                  </h3>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                    <input
                      type="checkbox"
                      checked={heroCardsForm.currentRole.visible}
                      onChange={(e) =>
                        setHeroCardsForm((prev) => ({
                          ...prev,
                          currentRole: { ...prev.currentRole, visible: e.target.checked },
                        }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                    <span>{t('common.visible')}</span>
                  </label>
                </div>

                <LocalizedFieldGroup
                  idPrefix="hero-card-role-label"
                  label={t('homeMgr.heroCardLabelField')}
                  value={heroCardsForm.currentRole.label}
                  onChange={(label) =>
                    setHeroCardsForm((prev) => ({
                      ...prev,
                      currentRole: { ...prev.currentRole, label },
                    }))
                  }
                />

                <LocalizedFieldGroup
                  idPrefix="hero-card-role-value"
                  label={t('homeMgr.heroCardCompanyField')}
                  value={heroCardsForm.currentRole.value}
                  onChange={(value) =>
                    setHeroCardsForm((prev) => ({
                      ...prev,
                      currentRole: { ...prev.currentRole, value },
                    }))
                  }
                />

                <LocalizedFieldGroup
                  idPrefix="hero-card-role-subtext"
                  label={t('homeMgr.heroCardPeriodField')}
                  value={heroCardsForm.currentRole.subtext}
                  onChange={(subtext) =>
                    setHeroCardsForm((prev) => ({
                      ...prev,
                      currentRole: { ...prev.currentRole, subtext },
                    }))
                  }
                />
              </div>

              {/* Card 2: Core Focus */}
              <div className="space-y-4 rounded-xl border border-border-default bg-bg-primary/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {t('homeMgr.heroCardCoreFocus')}
                  </h3>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                    <input
                      type="checkbox"
                      checked={heroCardsForm.coreFocus.visible}
                      onChange={(e) =>
                        setHeroCardsForm((prev) => ({
                          ...prev,
                          coreFocus: { ...prev.coreFocus, visible: e.target.checked },
                        }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                    <span>{t('common.visible')}</span>
                  </label>
                </div>

                <LocalizedFieldGroup
                  idPrefix="hero-card-focus-label"
                  label={t('homeMgr.heroCardLabelField')}
                  value={heroCardsForm.coreFocus.label}
                  onChange={(label) =>
                    setHeroCardsForm((prev) => ({
                      ...prev,
                      coreFocus: { ...prev.coreFocus, label },
                    }))
                  }
                />

                <LocalizedFieldGroup
                  idPrefix="hero-card-focus-value"
                  label={t('homeMgr.heroCardFocusField')}
                  value={heroCardsForm.coreFocus.value}
                  onChange={(value) =>
                    setHeroCardsForm((prev) => ({
                      ...prev,
                      coreFocus: { ...prev.coreFocus, value },
                    }))
                  }
                />

                <LocalizedFieldGroup
                  idPrefix="hero-card-focus-subtext"
                  label={t('homeMgr.heroCardSubtextOptionalField')}
                  value={heroCardsForm.coreFocus.subtext}
                  onChange={(subtext) =>
                    setHeroCardsForm((prev) => ({
                      ...prev,
                      coreFocus: { ...prev.coreFocus, subtext },
                    }))
                  }
                />
              </div>
            </Card>

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={!heroDirty}
                onClick={() => {
                  setHeroForm(structuredClone(profile));
                  setShowPortrait(siteSettings.showGraduationPortrait);
                  setHeroCardsForm(structuredClone(initialHeroCards));
                  setError(null);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={isSaving || !heroDirty}>
                {isSaving ? t('prototype.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        )}

        {/* Sub-Tab 2: Engineering Profile & Academic Foundation */}
        {activeTab === 'profile-academic' && (
          <HomeIntroAcademicTab
            onSaved={stampSaved}
            onDirtyChange={setSubTabDirty}
          />
        )}

        {/* Sub-Tab 3: Core Specializations */}
        {activeTab === 'specializations' && (
          <HomeSpecializationsTab
            onSaved={stampSaved}
            onDirtyChange={setSubTabDirty}
          />
        )}

        {/* Sub-Tab 4: Featured Projects */}
        {activeTab === 'featured' && (
          <Card className="space-y-4 p-5 sm:p-6">
            <SectionMappingBadge
              location={t('homeMgr.mapFeatured')}
              sharedWith={[t('nav.pagePortfolio')]}
            />
            <p className="text-xs text-text-secondary">
              {t('homeMgr.featuredDescription')}
            </p>

            <div className="divide-y divide-border-default">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted" mono>
                        {project.code}
                      </Badge>
                      <Badge variant={project.featured ? 'accent' : 'default'}>
                        {project.featured
                          ? t('homeMgr.featuredActive')
                          : t('homeMgr.featuredInactive')}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">
                      {pick(project.title)}
                    </p>
                    <p className="truncate text-xs text-text-secondary">
                      {pick(project.categoryLabel)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant={project.featured ? 'primary' : 'secondary'}
                      size="sm"
                      disabled={isSaving}
                      onClick={() => void handleToggleFeatured(project.id)}
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {project.featured
                          ? t('homeMgr.removeFeatured')
                          : t('homeMgr.markFeatured')}
                      </span>
                    </Button>
                    <Link
                      to="/admin/pages/portfolio"
                      className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-border-default px-3 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent"
                    >
                      <span>{t('common.edit')}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Sub-Tab 3: Homepage Sections Visibility & Quick Links (01–08) */}
        {activeTab === 'sections' && (
          <Card className="space-y-4 p-5 sm:p-6">
            <SectionMappingBadge location={t('homeMgr.mapSections')} />
            <p className="text-xs text-text-secondary">
              {t('homeMgr.sectionsDescription')}
            </p>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-error/40 bg-error-subtle px-4 py-2.5 text-xs text-error"
              >
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {homeSectionsList.map((sec) => {
                const visible = sectionVisibility[sec.key];
                return (
                  <div
                    key={sec.key}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors',
                      visible
                        ? 'border-border-default bg-bg-primary'
                        : 'border-border-default/60 bg-bg-primary/50 opacity-75'
                    )}
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={visible}
                        disabled={isSaving}
                        onChange={(e) =>
                          void handleToggleSectionVisibility(sec.key, e.target.checked)
                        }
                        className="mt-1 h-4 w-4 shrink-0 rounded accent-accent"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="muted" mono>
                            {sec.code}
                          </Badge>
                          <Badge variant={visible ? 'accent' : 'default'}>
                            {visible ? t('common.visible') : t('common.hidden')}
                          </Badge>
                        </div>
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {sec.name}
                        </p>
                        <p
                          className="font-mono text-[11px] text-text-secondary"
                          dir="ltr"
                        >
                          {sec.route}
                        </p>
                      </div>
                    </label>

                    {sec.to ? (
                      <Link
                        to={sec.to}
                        className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-border-default bg-bg-secondary px-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
                      >
                        <span>{t('common.edit')}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sec.tab && handleSelectTab(sec.tab)}
                        className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-border-default bg-bg-secondary px-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
                      >
                        <span>{t('common.edit')}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </PageEditorShell>
    );
  }
