import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import type { AdminSiteSettings, CvTemplateId } from '@/types/admin';

export function AdminSettingsPage() {
  const { t } = useTranslation('admin');
  useDocumentTitle(t('settings.pageTitle'));

  const { siteSettings, updateSiteSettings, isSaving } = useAdminData();
  const [form, setForm] = useState<AdminSiteSettings>(() =>
    structuredClone(siteSettings)
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(structuredClone(siteSettings));
  }, [siteSettings]);

  const moveCvSection = (index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.cvSectionOrder.length) return prev;
      const next = [...prev.cvSectionOrder];
      const currentItem = next[index];
      const targetItem = next[target];
      if (!currentItem || !targetItem) return prev;
      next[index] = targetItem;
      next[target] = currentItem;
      return { ...prev, cvSectionOrder: next };
    });
  };

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

      <p className="text-xs text-text-secondary">
        {t('settings.prototypeSectionNotice')}
      </p>

      {saved && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-subtle px-4 py-2.5 text-xs font-medium text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('prototype.savedInMemory')}</span>
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <Card className="space-y-5 p-5 sm:p-6">
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

        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-text-primary">
            {t('settings.visibilityHeading')}
          </h2>
          <div className="space-y-3">
            {(
              [
                ['showGraduationPortrait', 'settings.showGraduationPortrait'],
                ['showContactEmail', 'settings.showContactEmail'],
                ['showLinkedinLink', 'settings.showLinkedinLink'],
                ['showCoursesSection', 'settings.showCoursesSection'],
                ['recruiterModeEnabled', 'settings.recruiterModeEnabled'],
              ] as const
            ).map(([field, labelKey]) => (
              <label
                key={field}
                className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary px-4 py-3 text-sm text-text-primary cursor-pointer"
              >
                <span>{t(labelKey)}</span>
                <input
                  type="checkbox"
                  checked={form[field]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [field]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-accent"
                />
              </label>
            ))}
          </div>
        </Card>

        {/* Smart CV Public Defaults & Section Order */}
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-text-primary">
              {t('settings.recruiterCvHeading')}
            </h2>
            <p className="text-xs text-text-secondary">
              {t('settings.recruiterCvDescription')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="set-cv-template"
              className="block text-xs font-medium text-text-primary"
            >
              {t('settings.defaultCvTemplate')}
            </label>
            <select
              id="set-cv-template"
              value={form.defaultCvTemplate}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  defaultCvTemplate: e.target.value as CvTemplateId,
                }))
              }
              className="h-10 w-full max-w-sm rounded-[10px] border border-border-default bg-bg-primary px-3 text-sm text-text-primary"
            >
              <option value="ats">{t('settings.templateAts')}</option>
              <option value="modern">{t('settings.templateModern')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-text-primary">
              {t('settings.cvSectionOrderLabel')}
            </p>
            <div className="space-y-2">
              {form.cvSectionOrder.map((sec, idx) => (
                <div
                  key={sec.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary px-3.5 py-2.5"
                >
                  <label className="inline-flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sec.visible}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          cvSectionOrder: p.cvSectionOrder.map((item) =>
                            item.key === sec.key
                              ? { ...item, visible: e.target.checked }
                              : item
                          ),
                        }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                    <span>{t(`cv.sections.${sec.key}`)}</span>
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveCvSection(idx, 'up')}
                      aria-label={t('common.moveUp')}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === form.cvSectionOrder.length - 1}
                      onClick={() => moveCvSection(idx, 'down')}
                      aria-label={t('common.moveDown')}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
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
    </div>
  );
}
