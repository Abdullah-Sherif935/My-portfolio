import { Link } from 'react-router-dom';
import { ArrowUp, Github, Linkedin, Mail, Phone, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { BrandMark } from '@/components/common/BrandMark';
import { usePortfolioData } from '@/hooks/usePortfolioData';

const FOOTER_LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/about', key: 'nav.about' },
  { to: '/portfolio', key: 'nav.portfolio' },
  { to: '/companies', key: 'nav.companies' },
  { to: '/experience', key: 'nav.experience' },
  { to: '/skills', key: 'nav.skills' },
  { to: '/certifications', key: 'nav.certifications' },
  { to: '/contact', key: 'nav.contact' },
] as const;

export function Footer() {
  const { t } = useTranslation('common');
  const { profile, siteSettings } = usePortfolioData();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
      <footer className="no-print border-t border-border-default bg-bg-secondary">
        <Container className="py-12 sm:py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
            {/* Branding Column */}
            <div className="space-y-4 lg:col-span-5">
              <BrandMark showRole />
              <p className="max-w-md text-sm leading-relaxed text-text-secondary">
                {t('footer.tagline')}
              </p>
              <p className="font-mono text-xs text-text-secondary">
                {t('footer.phaseNote')}
              </p>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4 lg:col-span-4">
              <h2 className="font-mono text-xs font-semibold tracking-wider text-text-primary uppercase">
                {t('footer.navigationHeading')}
              </h2>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                {FOOTER_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-text-secondary transition-colors hover:text-accent"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
                {siteSettings.recruiterModeEnabled && (
                  <li>
                    <Link
                      to="/recruiter"
                      className="font-medium text-accent transition-colors hover:underline"
                    >
                      {t('nav.recruiterMode')}
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/career/cv-builder"
                    className="text-text-secondary transition-colors hover:text-accent"
                  >
                    {t('nav.cvBuilder')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div className="space-y-4 lg:col-span-3">
              <h2 className="font-mono text-xs font-semibold tracking-wider text-text-primary uppercase">
                {t('footer.connectHeading')}
              </h2>
              <ul className="space-y-3 text-sm text-text-secondary">
                {siteSettings.showContactEmail && profile.contact.email && (
                  <li>
                    <a
                      href={`mailto:${profile.contact.email}`}
                      className="inline-flex max-w-full items-center gap-2.5 transition-colors hover:text-accent"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate font-mono text-xs" dir="ltr">
                        {profile.contact.email}
                      </span>
                    </a>
                  </li>
                )}
                {profile.contact.phone?.trim() && (
                  <li>
                    <a
                      href={`tel:${profile.contact.phone.replace(/[^+\d]/g, '')}`}
                      className="inline-flex max-w-full items-center gap-2.5 transition-colors hover:text-accent"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate font-mono text-xs" dir="ltr">
                        {profile.contact.phone.trim()}
                      </span>
                    </a>
                  </li>
                )}
                {siteSettings.showLinkedinLink && profile.contact.linkedinUrl && (
                  <li>
                    <a
                      href={profile.contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 transition-colors hover:text-accent"
                    >
                      <Linkedin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{t('footer.linkedinLabel')}</span>
                    </a>
                  </li>
                )}
                {profile.contact.youtubeUrl?.trim() && (
                  <li>
                    <a
                      href={profile.contact.youtubeUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 transition-colors hover:text-accent"
                    >
                      <Youtube className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{t('footer.youtubeLabel')}</span>
                    </a>
                  </li>
                )}
                <li>
                  {profile.contact.githubUrl?.trim() ? (
                    <a
                      href={profile.contact.githubUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 transition-colors hover:text-accent"
                    >
                      <Github className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{t('footer.githubActiveLabel')}</span>
                    </a>
                  ) : (
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2.5 transition-colors hover:text-accent"
                    >
                      <Github className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{t('footer.githubLabel')}</span>
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border-default pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-text-secondary">
              &copy; {currentYear} {t('footer.copyright')}
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 rounded-[10px] border border-border-default bg-bg-primary px-3.5 py-2 text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent cursor-pointer"
            >
              <span>{t('actions.backToTop')}</span>
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </Container>
      </footer>
      );
}
