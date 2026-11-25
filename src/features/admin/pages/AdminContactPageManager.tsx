import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, Inbox, Info, Mail, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { PageEditorShell } from '@/features/admin/components/PageEditorShell';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { supabase } from '@/lib/supabase';
import type { ProfileData } from '@/types/portfolio';

interface ContactMessageRow {
  id: string;
  sender_name: string;
  sender_email: string;
  organization: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  email_delivered: boolean;
  created_at: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AdminContactPageManager() {
  const { t } = useTranslation('admin');
  const { language } = useLanguage();
  useDocumentTitle(`${t('nav.pageContact')} — ${t('brand.console')}`);

  const { profile, siteSettings, updateProfile, updateSiteSettings, isSaving } =
    useAdminData();

  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);

  const fetchInbox = useCallback(async () => {
    if (!supabase) return;
    setLoadingInbox(true);
    try {
      const { data } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (Array.isArray(data)) {
        setMessages(data as ContactMessageRow[]);
      }
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  useEffect(() => {
    void fetchInbox();
  }, [fetchInbox]);

  const toggleMessageRead = async (msg: ContactMessageRow) => {
    if (!supabase) return;
    const nextRead = !msg.is_read;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_read: nextRead } : m))
    );
    await supabase
      .from('contact_messages')
      .update({ is_read: nextRead })
      .eq('id', msg.id);
  };

  const deleteMessage = async (id: string) => {
    if (!supabase) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await supabase.from('contact_messages').delete().eq('id', id);
  };

  const [form, setForm] = useState<ProfileData>(() => structuredClone(profile));
  const [showEmail, setShowEmail] = useState(siteSettings.showContactEmail);
  const [showLinkedin, setShowLinkedin] = useState(siteSettings.showLinkedinLink);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  useEffect(() => {
    setForm(structuredClone(profile));
  }, [profile]);

  useEffect(() => {
    setShowEmail(siteSettings.showContactEmail);
    setShowLinkedin(siteSettings.showLinkedinLink);
  }, [siteSettings.showContactEmail, siteSettings.showLinkedinLink]);

  const isDirty = useMemo(() => {
    return (
      JSON.stringify({
        contact: form.contact,
        location: form.location,
        showEmail,
        showLinkedin,
      }) !==
      JSON.stringify({
        contact: profile.contact,
        location: profile.location,
        showEmail: siteSettings.showContactEmail,
        showLinkedin: siteSettings.showLinkedinLink,
      })
    );
  }, [form, showEmail, showLinkedin, profile, siteSettings]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(form.contact.email.trim())) {
      setError(t('common.validationRequired'));
      return;
    }
    setError(null);
    try {
      await updateProfile({ ...form, dataSource: 'cms' });
      if (
        showEmail !== siteSettings.showContactEmail ||
        showLinkedin !== siteSettings.showLinkedinLink
      ) {
        await updateSiteSettings({
          ...siteSettings,
          showContactEmail: showEmail,
          showLinkedinLink: showLinkedin,
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
      title={t('contactMgr.title')}
      subtitle={t('contactMgr.subtitle')}
      publicRoute="/contact"
      mappingPath={t('contactMgr.mappingPath')}
      sharedPages={[t('nav.pageHome'), t('nav.featureRecruiter'), t('nav.featureCvBuilder')]}
      hasUnsavedChanges={isDirty}
      lastSavedLabel={lastSaved}
      previewRefreshKey={previewRefreshKey}
    >
      {/* Received Client Messages (Inbox Backup) */}
      <Card className="mb-6 space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-base font-semibold text-text-primary">
              {language === 'ar' ? 'الرسائل الواردة من العملاء (Inbox)' : 'Received Client Messages (Inbox)'}
            </h2>
            {messages.filter((m) => !m.is_read).length > 0 && (
              <Badge variant="accent">
                {messages.filter((m) => !m.is_read).length}{' '}
                {language === 'ar' ? 'جديد' : 'new'}
              </Badge>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void fetchInbox()}
            disabled={loadingInbox}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingInbox ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </Button>
        </div>

        {messages.length === 0 ? (
          <p className="rounded-xl border border-border-default bg-bg-primary px-4 py-4 text-xs text-text-secondary">
            {language === 'ar'
              ? 'لا توجد رسائل واردة بعد. أي رسالة يرسلها عميل من صفحة التواصل ستصل إلى إيميلك وتُحفظ نسخة منها هنا تلقائياً.'
              : 'No client messages yet. Any inquiry submitted on /contact is emailed to you via Web3Forms and backed up here automatically.'}
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`space-y-2.5 rounded-xl border p-4 ${
                  msg.is_read
                    ? 'border-border-default bg-bg-primary/60'
                    : 'border-accent-border bg-bg-primary'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {msg.subject}
                      </span>
                      {!msg.is_read && (
                        <Badge variant="accent">
                          {language === 'ar' ? 'جديد' : 'New'}
                        </Badge>
                      )}
                      {msg.email_delivered && (
                        <Badge variant="success">
                          {language === 'ar' ? 'أُرسل للبريد' : 'Emailed'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">
                      <strong className="text-text-primary">{msg.sender_name}</strong>
                      {msg.organization ? ` (${msg.organization})` : ''} ·{' '}
                      <span dir="ltr" className="font-mono text-accent">
                        {msg.sender_email}
                      </span>
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-text-secondary">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-xs leading-relaxed text-text-secondary">
                  {msg.message}
                </p>

                <div className="flex flex-wrap items-center gap-2 border-t border-border-default pt-2.5">
                  <a
                    href={`mailto:${msg.sender_email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent-border bg-accent-subtle px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{language === 'ar' ? 'رد بالبريد' : 'Reply via Email'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => void toggleMessageRead(msg)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {msg.is_read
                        ? language === 'ar'
                          ? 'تحديد كغير مقروء'
                          : 'Mark Unread'
                        : language === 'ar'
                          ? 'تحديد كمقروء'
                          : 'Mark Read'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteMessage(msg.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-secondary px-2.5 py-1 text-xs font-medium text-error hover:border-error/50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {error && (
          <div role="alert" className="rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-xs text-error">
            {error}
          </div>
        )}

        {/* Direct Contact Channels & Social Links */}
        <Card className="space-y-5 p-5 sm:p-6">
          <SectionMappingBadge
            location={t('contactMgr.mapChannels')}
            sharedWith={[t('nav.pageHome'), t('nav.featureCvBuilder')]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="cnt-email" className="block text-sm font-medium text-text-primary">
                {t('profile.email')} *
              </label>
              <input
                id="cnt-email"
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
              <label htmlFor="cnt-web" className="block text-sm font-medium text-text-primary">
                {t('profile.websiteDisplay')}
              </label>
              <input
                id="cnt-web"
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
              <label htmlFor="cnt-li-url" className="block text-sm font-medium text-text-primary">
                {t('profile.linkedinUrl')}
              </label>
              <input
                id="cnt-li-url"
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
              <label htmlFor="cnt-li-disp" className="block text-sm font-medium text-text-primary">
                {t('profile.linkedinDisplay')}
              </label>
              <input
                id="cnt-li-disp"
                dir="ltr"
                value={form.contact.linkedinDisplay}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    contact: { ...p.contact, linkedinDisplay: e.target.value },
                  }))
                }
                className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

              <div className="space-y-1.5">
                <label htmlFor="cnt-phone" className="block text-sm font-medium text-text-primary">
                  {t('profile.phone')}
                </label>
                <input
                  id="cnt-phone"
                  type="tel"
                  dir="ltr"
                  placeholder={t('settings.phonePlaceholder')}
                  value={form.contact.phone ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      contact: {
                        ...p.contact,
                        phone: e.target.value.trim() ? e.target.value : null,
                      },
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cnt-gh" className="block text-sm font-medium text-text-primary">
                  {t('profile.githubUrl')}
                </label>
                <input
                  id="cnt-gh"
                  type="url"
                  dir="ltr"
                  placeholder={t('settings.githubPlaceholder')}
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
                <label htmlFor="cnt-yt" className="block text-sm font-medium text-text-primary">
                  {t('profile.youtubeUrl')}
                </label>
                <input
                  id="cnt-yt"
                  type="url"
                  dir="ltr"
                  placeholder={t('settings.youtubePlaceholder')}
                  value={form.contact.youtubeUrl ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      contact: {
                        ...p.contact,
                        youtubeUrl: e.target.value.trim() ? e.target.value : null,
                      },
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="cnt-loc"
              label={t('profile.location')}
              value={form.location}
              onChange={(location) => setForm((p) => ({ ...p, location }))}
            />
        </Card>

        {/* Visibility Settings */}
        <Card className="space-y-4 p-5 sm:p-6">
          <SectionMappingBadge
            location={t('contactMgr.mapVisibility')}
            sharedWith={[t('nav.pageHome'), t('nav.featureCvBuilder')]}
          />
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary px-4 py-3 text-sm text-text-primary cursor-pointer">
              <span>{t('settings.showContactEmail')}</span>
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="h-4 w-4 rounded accent-accent"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary px-4 py-3 text-sm text-text-primary cursor-pointer">
              <span>{t('settings.showLinkedinLink')}</span>
              <input
                type="checkbox"
                checked={showLinkedin}
                onChange={(e) => setShowLinkedin(e.target.checked)}
                className="h-4 w-4 rounded accent-accent"
              />
            </label>
          </div>
        </Card>

        {/* Contact Form Info */}
        <Card className="flex items-start gap-3 p-5 text-xs leading-relaxed text-text-secondary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-text-primary">
              {t('contactMgr.formStatusTitle')}
            </p>
            <p>{t('contactMgr.formStatusDesc')}</p>
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
              setShowEmail(siteSettings.showContactEmail);
              setShowLinkedin(siteSettings.showLinkedinLink);
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
    </PageEditorShell>
  );
}
