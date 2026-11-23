import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
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
import type { ProfileData } from '@/types/portfolio';
import { cn } from '@/utils/cn';

type HomeSubTab = 'hero' | 'featured' | 'sections';

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

  const [activeTab, setActiveTab] = useState<HomeSubTab>('hero');
  const [heroForm, setHeroForm] = useState<ProfileData>(() => structuredClone(profile));
  const [showPortrait, setShowPortrait] = useState<boolean>(
    siteSettings.showGraduationPortrait
  );
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  useEffect(() => {
    setHeroForm(structuredClone(profile));
  }, [profile]);

  useEffect(() => {
    setShowPortrait(siteSettings.showGraduationPortrait);
  }, [siteSettings.showGraduationPortrait]);

  const isDirty = useMemo(() => {
    return (
      JSON.stringify({
        fullName: heroForm.fullName,
        headline: heroForm.headline,
        location: heroForm.location,
        summary: heroForm.summary,
        avatarUrl: heroForm.avatarUrl ?? null,
        showPortrait,
      }) !==
      JSON.stringify({
        fullName: profile.fullName,
        headline: profile.headline,
        location: profile.location,
        summary: profile.summary,
        avatarUrl: profile.avatarUrl ?? null,
        showPortrait: siteSettings.showGraduationPortrait,
      })
    );
  }, [heroForm, showPortrait, profile, siteSettings.showGraduationPortrait]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const stampSaved = () => {
    setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setPreviewRefreshKey((k) => k + 1);
  };

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
      if (showPortrait !== siteSettings.showGraduationPortrait) {
        await updateSiteSettings({
          ...siteSettings,
          showGraduationPortrait: showPortrait,
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

  const homeSectionLinks = [
    { name: t('homeMgr.sections.experience'), to: '/admin/pages/experience', route: '/experience' },
    { name: t('homeMgr.sections.companies'), to: '/admin/pages/clients', route: '/companies' },
    { name: t('homeMgr.sections.skills'), to: '/admin/pages/skills', route: '/skills' },
    { name: t('homeMgr.sections.certifications'), to: '/admin/pages/certifications', route: '/certifications' },
    { name: t('homeMgr.sections.contact'), to: '/admin/pages/contact', route: '/contact' },
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
            ['featured', t('homeMgr.tabs.featured')],
            ['sections', t('homeMgr.tabs.sections')],
          ] as const
        ).map(([tabId, label]) => (
          <button
            key={tabId}
            type="button"
            role="tab"
            aria-selected={activeTab === tabId}
            onClick={() => setActiveTab(tabId)}
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

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={!isDirty}
              onClick={() => {
                setHeroForm(structuredClone(profile));
                setShowPortrait(siteSettings.showGraduationPortrait);
                setError(null);
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

      {/* Sub-Tab 2: Featured Projects */}
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

      {/* Sub-Tab 3: Homepage Sections Overview */}
      {activeTab === 'sections' && (
        <Card className="space-y-4 p-5 sm:p-6">
          <SectionMappingBadge location={t('homeMgr.mapSections')} />
          <p className="text-xs text-text-secondary">
            {t('homeMgr.sectionsDescription')}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {homeSectionLinks.map((sec) => (
              <Link key={sec.to} to={sec.to} className="group block">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary p-4 transition-colors group-hover:border-accent">
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:text-accent">
                      {sec.name}
                    </p>
                    <p className="font-mono text-[11px] text-text-secondary" dir="ltr">
                      {sec.route}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-text-secondary group-hover:text-accent" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </PageEditorShell>
  );
}
