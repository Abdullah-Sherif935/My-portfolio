import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BriefcaseBusiness } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { PageEditorShell } from '@/features/admin/components/PageEditorShell';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { RECRUITER_POSITIONS } from '@/services/recruiterMatcher';

export function AdminRecruiterFeaturePage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
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

        {/* Supported Deterministic Positions */}
        <Card className="space-y-4 p-5 sm:p-6">
          <SectionMappingBadge location={t('recruiterMgr.mapPositions')} />
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-base font-semibold text-text-primary">
              {t('recruiterMgr.positionsHeading')}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RECRUITER_POSITIONS.map((pos) => (
              <div
                key={pos.id}
                className="space-y-2 rounded-xl border border-border-default bg-bg-primary p-3.5"
              >
                <p className="text-sm font-semibold text-text-primary">
                  {pick(pos.label)}
                </p>
                {pos.primaryTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {pos.primaryTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-border-default bg-bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary">
                    {t('recruiterMgr.dynamicCustomHint')}
                  </p>
                )}
              </div>
            ))}
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
