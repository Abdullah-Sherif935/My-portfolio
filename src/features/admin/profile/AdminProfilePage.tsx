import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, MapPin, Plus, Trash2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import type { ProfileData } from '@/types/portfolio';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AdminProfilePage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('profile.pageTitle'));

  const { profile, updateProfile, isSaving } = useAdminData();
  const [form, setForm] = useState<ProfileData>(() => structuredClone(profile));
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setForm(structuredClone(profile));
  }, [profile]);

  const handleCancel = () => {
    setForm(structuredClone(profile));
    setError(null);
    setSavedNotice(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !form.fullName.en.trim() ||
      !form.fullName.ar.trim() ||
      !form.headline.en.trim() ||
      !form.headline.ar.trim() ||
      !EMAIL_PATTERN.test(form.contact.email.trim())
    ) {
      setError(t('common.validationRequired'));
      setSavedNotice(false);
      return;
    }
    setError(null);
    try {
      await updateProfile({ ...form, dataSource: 'cms' });
      setSavedNotice(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
      setSavedNotice(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
      />

      <PrototypeBanner compact />

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Editable Profile Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 xl:col-span-8">
          {error && (
            <div role="alert" className="rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
          {savedNotice && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-subtle px-4 py-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t('prototype.savedInMemory')}</span>
            </div>
          )}

          {/* Identity Section */}
          <Card className="space-y-5 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-text-primary">
              {t('profile.identitySection')}
            </h2>

            <LocalizedFieldGroup
              idPrefix="profile-fullname"
              label={t('profile.fullName')}
              required
              value={form.fullName}
              onChange={(fullName) => setForm((p) => ({ ...p, fullName }))}
            />

            <LocalizedFieldGroup
              idPrefix="profile-shortname"
              label={t('profile.shortName')}
              required
              value={form.shortName}
              onChange={(shortName) => setForm((p) => ({ ...p, shortName }))}
            />

            <LocalizedFieldGroup
              idPrefix="profile-headline"
              label={t('profile.headline')}
              required
              value={form.headline}
              onChange={(headline) => setForm((p) => ({ ...p, headline }))}
            />

            <LocalizedFieldGroup
              idPrefix="profile-location"
              label={t('profile.location')}
              value={form.location}
              onChange={(location) => setForm((p) => ({ ...p, location }))}
            />

            <LocalizedFieldGroup
              idPrefix="profile-summary"
              label={t('profile.summary')}
              multiline
              rows={4}
              value={form.summary}
              onChange={(summary) => setForm((p) => ({ ...p, summary }))}
            />
          </Card>

          {/* Contact & Media */}
          <Card className="space-y-4 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-text-primary">
              {t('profile.contactSection')}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="prof-email" className="block text-sm font-medium text-text-primary">
                  {t('profile.email')} *
                </label>
                <input
                  id="prof-email"
                  type="email"
                  dir="ltr"
                  value={form.contact.email}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      contact: { ...p.contact, email: e.target.value },
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prof-website" className="block text-sm font-medium text-text-primary">
                  {t('profile.websiteDisplay')}
                </label>
                <input
                  id="prof-website"
                  dir="ltr"
                  value={form.contact.websiteDisplay}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      contact: { ...p.contact, websiteDisplay: e.target.value },
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prof-linkedin-url" className="block text-sm font-medium text-text-primary">
                  {t('profile.linkedinUrl')}
                </label>
                <input
                  id="prof-linkedin-url"
                  dir="ltr"
                  value={form.contact.linkedinUrl}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      contact: { ...p.contact, linkedinUrl: e.target.value },
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prof-github" className="block text-sm font-medium text-text-primary">
                  {t('profile.githubUrl')}
                </label>
                <input
                  id="prof-github"
                  dir="ltr"
                  value={form.contact.githubUrl ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      contact: {
                        ...p.contact,
                        githubUrl: e.target.value.trim() ? e.target.value : null,
                      },
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="prof-avatar" className="block text-sm font-medium text-text-primary">
                  {t('profile.avatarUrl')}
                </label>
                <input
                  id="prof-avatar"
                  dir="ltr"
                  value={form.avatarUrl ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      avatarUrl: e.target.value.trim() ? e.target.value : null,
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Languages */}
          <Card className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text-primary">
                {t('profile.languagesSection')}
              </h2>
              <Button
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
                  className="grid gap-3 rounded-xl border border-border-default bg-bg-primary p-3.5 sm:grid-cols-2 lg:grid-cols-5"
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
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
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
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
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
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
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
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                  <Button
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

          {/* Core Competencies */}
          <Card className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text-primary">
                {t('profile.competenciesSection')}
              </h2>
              <Button
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
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5 focus:border-accent focus:outline-none"
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
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5 focus:border-accent focus:outline-none"
                  />
                  <Button
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

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" size="md" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSaving}>
              {isSaving ? t('prototype.saving') : t('common.save')}
            </Button>
          </div>
        </form>

        {/* Live Public Preview Sidebar */}
        <aside className="xl:col-span-4">
          <Card elevated className="sticky top-24 space-y-4 p-5">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {t('profile.previewHeading')}
              </h2>
              <p className="text-xs text-text-secondary">{t('profile.previewHint')}</p>
            </div>

            <div className="flex items-center gap-3.5">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={pick(form.fullName)}
                  className="h-16 w-16 shrink-0 rounded-xl border border-border-strong object-cover object-top"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-bg-primary text-accent">
                  <UserRound className="h-7 w-7" aria-hidden="true" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-text-primary">
                  {pick(form.fullName)}
                </p>
                <p className="text-xs font-medium text-accent">
                  {pick(form.headline)}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-text-secondary">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{pick(form.location)}</span>
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-text-secondary">
              {pick(form.summary)}
            </p>

            <div className="flex flex-wrap gap-1.5 border-t border-border-default pt-3">
              {form.languages.map((lang, idx) => (
                <Badge key={idx} variant="muted">
                  {pick(lang.name)} · {pick(lang.proficiency)}
                </Badge>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
