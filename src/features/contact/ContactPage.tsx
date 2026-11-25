import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  Loader2,
  Mail,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { supabase } from '@/lib/supabase';
import {
  validateContactForm,
  type ContactFormErrors,
  type ContactFormValues,
} from '@/lib/validation';

const WEB3FORMS_ACCESS_KEY =
  (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim() ||
  '96abb217-1824-4dd4-af88-254e702be491';

const INITIAL_VALUES: ContactFormValues = {
  name: '',
  email: '',
  organization: '',
  subject: '',
  message: '',
};

export function ContactPage() {
  const { t } = useTranslation(['pages', 'home', 'common']);
  const { pick } = useLanguage();
  const { profile, siteSettings } = usePortfolioData();
  useDocumentTitle(t('pages:contact.pageTitle'));
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [botcheck, setBotcheck] = useState('');
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFieldChange = (field: keyof ContactFormValues, nextValue: string) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (submitError) setSubmitError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (botcheck.trim()) return; // Honeypot anti-spam trap

    const result = validateContactForm(values);
    if (!result.isValid) {
      setErrors(result.errors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    const trimmedName = values.name.trim();
    const trimmedEmail = values.email.trim();
    const trimmedOrg = values.organization.trim();
    const trimmedSubject = values.subject.trim();
    const trimmedMessage = values.message.trim();

    let emailDelivered = false;
    let savedToDb = false;

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          from_name: 'Abdullah Sherif Portfolio',
          subject: `[Portfolio Inquiry] ${trimmedSubject}`,
          name: trimmedName,
          email: trimmedEmail,
          replyto: trimmedEmail,
          organization: trimmedOrg || 'Not specified',
          message: trimmedMessage,
          botcheck: '',
        }),
      });
      const json = (await response.json()) as { success?: boolean };
      if (response.ok && json.success) {
        emailDelivered = true;
      }
    } catch {
      // Fallback to Supabase backup below
    }

    // Save backup copy in Supabase contact_messages for Admin Inbox
    if (supabase) {
      try {
        const { error: dbError } = await supabase.from('contact_messages').insert({
          sender_name: trimmedName,
          sender_email: trimmedEmail,
          organization: trimmedOrg || null,
          subject: trimmedSubject,
          message: trimmedMessage,
          email_delivered: emailDelivered,
        });
        if (!dbError) {
          savedToDb = true;
        }
      } catch {
        // Ignore DB error if email succeeded
      }
    }

    setIsSubmitting(false);

    if (emailDelivered || savedToDb) {
      setSubmitted(true);
    } else {
      setSubmitError(t('pages:contact.sendError'));
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
  };

  return (
    <>
      <PageHeader
        eyebrow={t('pages:contact.eyebrow')}
        title={t('pages:contact.title')}
        subtitle={t('pages:contact.subtitle')}
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Live Contact Form (Web3Forms Email + Supabase Inbox Backup) */}
            <Card className="p-6 sm:p-8 lg:col-span-7">
              <h2 className="mb-5 text-xl font-semibold text-text-primary">
                {t('pages:contact.formHeading')}
              </h2>

              {submitError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-xs leading-relaxed text-error"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitted ? (
                <div className="space-y-4 rounded-xl border border-success/30 bg-success-subtle p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-text-primary">
                        {t('pages:contact.successTitle')}
                      </h3>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {t('pages:contact.successDescription')}
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleReset}>
                    {t('pages:contact.sendAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-5">
                  {/* Invisible honeypot anti-spam field */}
                  <input
                    type="text"
                    name="botcheck"
                    value={botcheck}
                    onChange={(e) => setBotcheck(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={100}
                      label={t('pages:contact.nameLabel')}
                      placeholder={t('pages:contact.namePlaceholder')}
                      value={values.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      error={errors.name ? t(`common:${errors.name}`) : undefined}
                    />
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={160}
                      label={t('pages:contact.emailLabel')}
                      placeholder={t('pages:contact.emailPlaceholder')}
                      value={values.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      error={errors.email ? t(`common:${errors.email}`) : undefined}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="contact-organization"
                      name="organization"
                      autoComplete="organization"
                      maxLength={120}
                      label={t('pages:contact.organizationLabel')}
                      placeholder={t('pages:contact.organizationPlaceholder')}
                      value={values.organization}
                      onChange={(e) => handleFieldChange('organization', e.target.value)}
                      error={
                        errors.organization
                          ? t(`common:${errors.organization}`)
                          : undefined
                      }
                    />
                    <Input
                      id="contact-subject"
                      name="subject"
                      required
                      maxLength={150}
                      label={t('pages:contact.subjectLabel')}
                      placeholder={t('pages:contact.subjectPlaceholder')}
                      value={values.subject}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      error={errors.subject ? t(`common:${errors.subject}`) : undefined}
                    />
                  </div>

                  <Textarea
                    id="contact-message"
                    name="message"
                    required
                    maxLength={2000}
                    label={t('pages:contact.messageLabel')}
                    placeholder={t('pages:contact.messagePlaceholder')}
                    value={values.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    error={errors.message ? t(`common:${errors.message}`) : undefined}
                  />

                  <div className="pt-1">
                    <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          <span>{t('pages:contact.sendingButton')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden="true" />
                          <span>{t('pages:contact.submitButton')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            {/* Direct Channels Column */}
            <div className="space-y-4 lg:col-span-5">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('pages:contact.channelsHeading')}
              </h2>

                {
                  siteSettings.showContactEmail && profile.contact.email && (
                    <Card className="flex items-start gap-4 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                        <Mail className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-sm font-semibold text-text-primary">
                          {t('home:contact.emailTitle')}
                        </h3>
                        <a
                          href={`mailto:${profile.contact.email}`}
                          dir="ltr"
                          className="block truncate font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                        >
                          {profile.contact.email}
                        </a>
                        <p className="text-xs text-text-secondary">{t('home:contact.emailNote')}</p>
                      </div>
                    </Card>
                  )
                }

                {
                  profile.contact.phone?.trim() && (
                    <Card className="flex items-start gap-4 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                        <Phone className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-sm font-semibold text-text-primary">
                          {t('home:contact.phoneTitle')}
                        </h3>
                        <a
                          href={`tel:${profile.contact.phone.replace(/[^+\d]/g, '')}`}
                          dir="ltr"
                          className="block truncate font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                        >
                          {profile.contact.phone.trim()}
                        </a>
                        <p className="text-xs text-text-secondary">{t('home:contact.phoneNote')}</p>
                      </div>
                    </Card>
                  )
                }

              {siteSettings.showLinkedinLink && profile.contact.linkedinUrl && (
                <Card className="flex items-start gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                    <Linkedin className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {t('home:contact.linkedinTitle')}
                    </h3>
                    <a
                      href={profile.contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="inline-flex max-w-full items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                    >
                      <span className="truncate">{profile.contact.linkedinDisplay}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="text-xs text-text-secondary">{t('home:contact.linkedinNote')}</p>
                  </div>
                </Card>
              )}

              {profile.contact.youtubeUrl?.trim() && (
                <Card className="flex items-start gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                    <Youtube className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {t('home:contact.youtubeTitle')}
                    </h3>
                    <a
                      href={profile.contact.youtubeUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="inline-flex max-w-full items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                    >
                      <span className="truncate">
                        {profile.contact.youtubeUrl.trim().match(/@[^/?]+/)?.[0] ??
                          profile.contact.youtubeUrl.trim().replace(/^https?:\/\/(www\.)?/, '').split('?')[0]}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="text-xs text-text-secondary">{t('home:contact.youtubeNote')}</p>
                  </div>
                </Card>
              )}

              <Card className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                  <Github className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {t('home:contact.githubTitle')}
                  </h3>
                    {
                      profile.contact.githubUrl?.trim() ? (
                        <a
                          href={profile.contact.githubUrl.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          className="inline-flex max-w-full items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                        >
                          <span className="truncate">
                            {(
                              profile.contact.githubUrl
                                .trim()
                                .replace(/^https?:\/\/(www\.)?/, '')
                                .split('?')[0] ?? profile.contact.githubUrl.trim()
                            ).replace(/\/$/, '')}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        </a>
                      ) : (
                        <p className="truncate font-mono text-xs text-text-secondary sm:text-sm">
                          {pick(profile.contact.githubDisplay)}
                        </p>
                      )
                    }
                    < p className="text-xs text-text-secondary">{t('home:contact.githubNote')}</p>
            </div>
          </Card>
        </div>
      </div>
    </Container >
      </Section >
    </>
  );
}
