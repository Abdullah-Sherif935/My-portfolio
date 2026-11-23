import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';

export function AdminNavigationPage() {
  const { t } = useTranslation('admin');
  useDocumentTitle(`${t('nav.navigationMgmt')} — ${t('brand.console')}`);

  const { siteSettings, updateSiteSettings, isSaving } = useAdminData();
  const [savedTime, setSavedTime] = useState<string | null>(null);

  const toggleFlag = async (
    field: 'recruiterModeEnabled' | 'showCoursesSection' | 'showLinkedinLink',
    value: boolean
  ) => {
    await updateSiteSettings({ ...siteSettings, [field]: value });
    setSavedTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const publicRoutes = [
    { label: t('nav.pageHome'), path: '/', adminTo: '/admin/pages/home', area: 'Header & Footer' },
    { label: t('nav.pageAbout'), path: '/about', adminTo: '/admin/pages/about', area: 'Header & Footer' },
    { label: t('nav.pagePortfolio'), path: '/portfolio', adminTo: '/admin/pages/portfolio', area: 'Header & Footer' },
    { label: t('nav.pageClients'), path: '/companies', adminTo: '/admin/pages/clients', area: 'Header & Footer' },
    { label: t('nav.pageExperience'), path: '/experience', adminTo: '/admin/pages/experience', area: 'Header & Footer' },
    { label: t('nav.pageSkills'), path: '/skills', adminTo: '/admin/pages/skills', area: 'Mobile & Footer' },
    { label: t('nav.pageCertifications'), path: '/certifications', adminTo: '/admin/pages/certifications', area: 'Mobile & Footer' },
    { label: t('nav.pageContact'), path: '/contact', adminTo: '/admin/pages/contact', area: 'Header & Footer' },
    { label: t('nav.featureRecruiter'), path: '/recruiter', adminTo: '/admin/features/recruiter', area: 'Header CTA & Footer' },
    { label: t('nav.featureCvBuilder'), path: '/career/cv-builder', adminTo: '/admin/features/cv-builder', area: 'Header CTA & Footer' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('navigationMgr.title')}
        subtitle={t('navigationMgr.subtitle')}
      />

      {savedTime && (
        <div role="status" className="rounded-xl border border-success/30 bg-success-subtle px-4 py-2 text-xs font-medium text-success">
          {t('pageShell.savedPublished', { time: savedTime })}
        </div>
      )}

      {/* Navigation Visibility Switches */}
      <Card className="space-y-4 p-5 sm:p-6">
        <SectionMappingBadge location={t('navigationMgr.mapControls')} />
        <div className="space-y-3">
          {(
            [
              ['recruiterModeEnabled', 'settings.recruiterModeEnabled'],
              ['showCoursesSection', 'settings.showCoursesSection'],
              ['showLinkedinLink', 'settings.showLinkedinLink'],
            ] as const
          ).map(([field, labelKey]) => (
            <label
              key={field}
              className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary px-4 py-3 text-sm text-text-primary cursor-pointer"
            >
              <span>{t(labelKey)}</span>
              <input
                type="checkbox"
                disabled={isSaving}
                checked={siteSettings[field]}
                onChange={(e) => void toggleFlag(field, e.target.checked)}
                className="h-4 w-4 rounded accent-accent"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* Public Route Inventory */}
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text-primary">
            {t('navigationMgr.inventoryHeading')}
          </h2>
        </div>
        <div className="divide-y divide-border-default">
          {publicRoutes.map((item) => (
            <div
              key={item.path}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-semibold text-text-primary">{item.label}</span>
                <Badge variant="muted" mono>
                  <span dir="ltr">{item.path}</span>
                </Badge>
                <span className="text-xs text-text-secondary">{item.area}</span>
              </div>
              <Link
                to={item.adminTo}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <span>{t('navigationMgr.managePage')}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
