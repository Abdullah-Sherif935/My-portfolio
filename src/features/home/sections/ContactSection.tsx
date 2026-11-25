import { ArrowRight, ExternalLink, Github, Linkedin, Mail, Phone, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/animations/Reveal';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolioData } from '@/hooks/usePortfolioData';

function formatYoutubeLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const handleMatch = parsed.pathname.match(/@[^/]+/);
    if (handleMatch) return handleMatch[0];
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname.replace(/\/$/, '')}`;
  } catch {
    return (url.replace(/^https?:\/\/(www\.)?/, '').split('?')[0] ?? url);
  }
}

function formatSocialDisplay(url: string): string {
  const withoutQuery = url.replace(/^https?:\/\/(www\.)?/, '').split('?')[0] ?? url;
  return withoutQuery.replace(/\/$/, '');
}

export function ContactSection() {
  const { t } = useTranslation('home');
  const { pick } = useLanguage();
  const { profile, siteSettings } = usePortfolioData();

  return (
    <Section id="contact" surface="primary">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('contact.eyebrow')}
            title={t('contact.title')}
            subtitle={t('contact.subtitle')}
          />

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-12">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-7">
              {/* Email Channel */}
              {siteSettings.showContactEmail && profile.contact.email && (
                <Card className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent sm:h-11 sm:w-11">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-0.5 sm:space-y-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {t('contact.emailTitle')}
                    </h3>
                    <a
                      href={`mailto:${profile.contact.email}`}
                      dir="ltr"
                      className="block truncate font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                    >
                      {profile.contact.email}
                    </a>
                    <p className="text-xs text-text-secondary">{t('contact.emailNote')}</p>
                  </div>
                </Card>
              )}

              {/* Phone Channel (shown when configured) */}
              {profile.contact.phone?.trim() && (
                <Card className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent sm:h-11 sm:w-11">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-0.5 sm:space-y-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {t('contact.phoneTitle')}
                    </h3>
                    <a
                      href={`tel:${profile.contact.phone.replace(/[^+\d]/g, '')}`}
                      dir="ltr"
                      className="block truncate font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                    >
                      {profile.contact.phone.trim()}
                    </a>
                    <p className="text-xs text-text-secondary">{t('contact.phoneNote')}</p>
                  </div>
                </Card>
              )}

              {/* LinkedIn Channel */}
              {siteSettings.showLinkedinLink && profile.contact.linkedinUrl && (
                <Card className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent sm:h-11 sm:w-11">
                    <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-0.5 sm:space-y-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {t('contact.linkedinTitle')}
                    </h3>
                    <a
                      href={profile.contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="inline-flex max-w-full items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                    >
                      <span className="truncate">
                        {profile.contact.linkedinDisplay || formatSocialDisplay(profile.contact.linkedinUrl)}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="text-xs text-text-secondary">{t('contact.linkedinNote')}</p>
                  </div>
                </Card>
              )}

              {/* YouTube Channel */}
              {profile.contact.youtubeUrl?.trim() && (
                <Card className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent sm:h-11 sm:w-11">
                    <Youtube className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-0.5 sm:space-y-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {t('contact.youtubeTitle')}
                    </h3>
                    <a
                      href={profile.contact.youtubeUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="inline-flex max-w-full items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                    >
                      <span className="truncate">
                        {formatYoutubeLabel(profile.contact.youtubeUrl.trim())}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="text-xs text-text-secondary">{t('contact.youtubeNote')}</p>
                  </div>
                </Card>
              )}

              {/* GitHub Channel */}
              <Card className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent sm:h-11 sm:w-11">
                  <Github className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-0.5 sm:space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {t('contact.githubTitle')}
                  </h3>
                  {profile.contact.githubUrl?.trim() ? (
                    <a
                      href={profile.contact.githubUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="inline-flex max-w-full items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-hover sm:text-sm"
                    >
                      <span className="truncate">
                        {formatSocialDisplay(profile.contact.githubUrl.trim())}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="truncate font-mono text-xs text-text-secondary sm:text-sm">
                      {pick(profile.contact.githubDisplay)}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary">{t('contact.githubNote')}</p>
                </div>
              </Card>
            </div>

            <Card
              elevated
              className="flex flex-col justify-between p-5 sm:p-8 lg:col-span-5"
            >
              <div className="space-y-2.5 sm:space-y-3">
                <p className="font-mono text-xs font-medium uppercase tracking-wider text-accent">
                  {t('contact.ctaEyebrow')}
                </p>
                <h3 className="text-lg font-semibold text-text-primary sm:text-2xl">
                  {t('contact.ctaTitle')}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-[15px]">
                  {t('contact.ctaDescription')}
                </p>
              </div>

              <div className="mt-6 sm:mt-8">
                <ButtonLink to="/contact" variant="primary" size="md" className="w-full sm:h-12 sm:w-auto sm:px-6 sm:text-[15px]">
                  <span>{t('contact.ctaButton')}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </ButtonLink>
              </div>
            </Card>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
