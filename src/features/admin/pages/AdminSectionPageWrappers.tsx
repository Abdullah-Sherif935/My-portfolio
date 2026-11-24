import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { PageEditorShell } from '@/features/admin/components/PageEditorShell';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { AdminExperiencePage } from '@/features/admin/experience/AdminExperiencePage';
import { AdminProjectsPage } from '@/features/admin/projects/AdminProjectsPage';
import { AdminCompaniesPage } from '@/features/admin/companies/AdminCompaniesPage';
import { AdminSkillsPage } from '@/features/admin/skills/AdminSkillsPage';
import { AdminCertificationsPage } from '@/features/admin/certifications/AdminCertificationsPage';

export function AdminExperiencePageManager() {
  const { t } = useTranslation('admin');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  return (
    <PageEditorShell
      title={t('nav.pageExperience')}
      subtitle={t('experience.subtitle')}
      publicRoute="/experience"
      mappingPath={t('pageWrappers.experienceMap')}
      sharedPages={[
        t('nav.pageHome'),
        t('nav.pageAbout'),
        t('nav.featureRecruiter'),
        t('nav.featureCvBuilder'),
      ]}
      hasUnsavedChanges={hasUnsavedChanges}
      lastSavedLabel={lastSaved}
      previewRefreshKey={previewRefreshKey}
    >
      <AdminExperiencePage
        onDirtyChange={setHasUnsavedChanges}
        onSaved={() => {
          setLastSaved(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
          setPreviewRefreshKey((k) => k + 1);
        }}
      />
    </PageEditorShell>
  );
}

export function AdminPortfolioPageManager() {
  const { t } = useTranslation('admin');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  return (
    <PageEditorShell
      title={t('nav.pagePortfolio')}
      subtitle={t('projects.subtitle')}
      publicRoute="/portfolio"
      mappingPath={t('pageWrappers.portfolioMap')}
      sharedPages={[t('nav.pageHome'), t('nav.featureRecruiter'), t('nav.featureCvBuilder')]}
      hasUnsavedChanges={hasUnsavedChanges}
      lastSavedLabel={lastSaved}
      previewRefreshKey={previewRefreshKey}
    >
      <AdminProjectsPage
        onDirtyChange={setHasUnsavedChanges}
        onSaved={() => {
          setLastSaved(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
          setPreviewRefreshKey((k) => k + 1);
        }}
      />
    </PageEditorShell>
  );
}

export function AdminClientsPageManager() {
  const { t } = useTranslation('admin');
  return (
    <PageEditorShell
      title={t('nav.pageClients')}
      subtitle={t('companies.subtitle')}
      publicRoute="/companies"
      mappingPath={t('pageWrappers.clientsMap')}
      sharedPages={[t('nav.pageHome'), t('nav.pagePortfolio')]}
    >
      <AdminCompaniesPage />
    </PageEditorShell>
  );
}

export function AdminSkillsPageManager() {
  const { t } = useTranslation('admin');
  return (
    <PageEditorShell
      title={t('nav.pageSkills')}
      subtitle={t('skills.subtitle')}
      publicRoute="/skills"
      mappingPath={t('pageWrappers.skillsMap')}
      sharedPages={[t('nav.pageHome'), t('nav.featureRecruiter'), t('nav.featureCvBuilder')]}
    >
      <AdminSkillsPage />
    </PageEditorShell>
  );
}

export function AdminCertificationsPageManager() {
  const { t } = useTranslation('admin');
  const { siteSettings, updateSiteSettings, isSaving } = useAdminData();
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  const toggleCoursesSection = async (checked: boolean) => {
    await updateSiteSettings({
      ...siteSettings,
      showCoursesSection: checked,
    });
    setLastSaved(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    setPreviewRefreshKey((k) => k + 1);
  };

  return (
    <PageEditorShell
      title={t('nav.pageCertifications')}
      subtitle={t('certifications.subtitle')}
      publicRoute="/certifications"
      mappingPath={t('pageWrappers.certificationsMap')}
      sharedPages={[t('nav.pageHome'), t('nav.featureRecruiter'), t('nav.featureCvBuilder')]}
      lastSavedLabel={lastSaved}
      previewRefreshKey={previewRefreshKey}
    >
      <div className="space-y-6">
        <Card className="space-y-3 p-4 sm:p-5">
          <SectionMappingBadge
            location={t('pageWrappers.certificationsVisMap')}
            sharedWith={[t('nav.pageHome'), t('nav.featureCvBuilder')]}
          />
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-text-primary cursor-pointer">
            <span>{t('settings.showCoursesSection')}</span>
            <input
              type="checkbox"
              disabled={isSaving}
              checked={siteSettings.showCoursesSection}
              onChange={(e) => void toggleCoursesSection(e.target.checked)}
              className="h-4 w-4 rounded accent-accent"
            />
          </label>
        </Card>

        <AdminCertificationsPage />
      </div>
    </PageEditorShell>
  );
}
