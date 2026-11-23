import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import type { AdminSiteSettings } from '@/types/admin';

export function AdminSettingsPage() {
  const { t } = useTranslation('admin');
  useDocumentTitle(t('settings.pageTitle'));

  const { user } = useAdminAuth();
  const { siteSettings, updateSiteSettings, isSaving } = useAdminData();
  const [form, setForm] = useState<AdminSiteSettings>(() =>
    structuredClone(siteSettings)
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(structuredClone(siteSettings));
  }, [siteSettings]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateSiteSettings(form);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      // Error surfaced via PrototypeBanner
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      {/* Persisted Local Preferences */}
      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-text-primary">
          {t('settings.preferencesHeading')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-border-default bg-bg-primary px-4 py-3">
            <span className="text-sm font-medium text-text-primary">
              {t('settings.languageLabel')}
            </span>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border-default bg-bg-primary px-4 py-3">
            <span className="text-sm font-medium text-text-primary">
              {t('settings.themeLabel')}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </Card>

      <PrototypeBanner compact />

      {saved && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-subtle px-4 py-2.5 text-xs font-medium text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('prototype.savedInMemory')}</span>
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <Card className="space-y-5 p-5 sm:p-6">
          <SectionMappingBadge location={t('settings.mapGlobalSeo')} />
          <h2 className="text-base font-semibold text-text-primary">
            {t('settings.identityHeading')}
          </h2>

          <LocalizedFieldGroup
            idPrefix="set-sitename"
            label={t('settings.siteName')}
            value={form.siteName}
            onChange={(siteName) => setForm((p) => ({ ...p, siteName }))}
          />

          <LocalizedFieldGroup
            idPrefix="set-seotitle"
            label={t('settings.seoTitle')}
            value={form.seoTitle}
            onChange={(seoTitle) => setForm((p) => ({ ...p, seoTitle }))}
          />

          <LocalizedFieldGroup
            idPrefix="set-seodesc"
            label={t('settings.seoDescription')}
            multiline
            rows={3}
            value={form.seoDescription}
            onChange={(seoDescription) => setForm((p) => ({ ...p, seoDescription }))}
          />
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setForm(structuredClone(siteSettings))}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isSaving}>
            {isSaving ? t('prototype.saving') : t('common.save')}
          </Button>
        </div>
      </form>

      {/* Single-Admin Authorization Status & Page-Specific Settings Shortcuts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-text-primary">
              {t('settings.authModelTitle')}
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            {t('settings.authModelDesc')}
          </p>
          {user?.email && (
            <p dir="ltr" className="font-mono text-xs text-accent">
              {user.email}
            </p>
          )}
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold text-text-primary">
            {t('settings.pageSettingsShortcutsTitle')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { to: '/admin/pages/home', label: t('nav.pageHome') },
              { to: '/admin/pages/contact', label: t('nav.pageContact') },
              { to: '/admin/features/recruiter', label: t('nav.featureRecruiter') },
              { to: '/admin/features/cv-builder', label: t('nav.featureCvBuilder') },
              { to: '/admin/system/navigation', label: t('nav.navigationMgmt') },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-primary px-3 py-1.5 text-xs font-medium text-text-primary hover:border-accent hover:text-accent"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
