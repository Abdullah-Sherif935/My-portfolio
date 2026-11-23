import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BriefcaseBusiness, Download, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { BrandMark } from '@/components/common/BrandMark';
import { ButtonLink } from '@/components/ui/Button';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/utils/cn';

const PRIMARY_NAV_ITEMS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/about', key: 'nav.about', end: false },
  { to: '/portfolio', key: 'nav.portfolio', end: false },
  { to: '/companies', key: 'nav.companies', end: false },
  { to: '/experience', key: 'nav.experience', end: false },
  { to: '/contact', key: 'nav.contact', end: false },
] as const;

export function Navbar() {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const { siteSettings } = usePortfolioData();
  const prefersReducedMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll while mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-foreground"
      >
        {t('nav.skipToContent')}
      </a>

      <header className="no-print sticky top-0 z-40 border-b border-border-default bg-nav-bg backdrop-blur-md">
        <Container>
          <div className="flex h-[72px] items-center justify-between gap-3 xl:gap-4">
            <BrandMark />

            {/* Desktop Primary Navigation */}
            <nav
              aria-label={t('nav.primaryLabel')}
              className="hidden items-center gap-0.5 lg:flex xl:gap-1"
            >
              {PRIMARY_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'relative whitespace-nowrap rounded-[10px] px-2.5 py-2 text-sm font-medium transition-colors duration-200 xl:px-3.5',
                      isActive
                        ? 'bg-accent-subtle text-accent'
                        : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                    )
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>

            {/* Right-side Controls */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex xl:gap-2.5">
              {siteSettings.recruiterModeEnabled && (
                <NavLink
                  to="/recruiter"
                  className={({ isActive }) =>
                    cn(
                      'inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-[10px] border px-3 text-xs font-semibold transition-colors xl:text-sm',
                      isActive
                        ? 'border-accent bg-accent-subtle text-accent'
                        : 'border-border-default bg-bg-secondary text-text-primary hover:border-accent hover:text-accent'
                    )
                  }
                >
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span>{t('nav.recruiterMode')}</span>
                </NavLink>
              )}
              <LanguageSwitcher />
              <ThemeToggle />
              <ButtonLink
                to="/career/cv-builder"
                variant="primary"
                size="sm"
                className="h-10 px-3.5 xl:px-4"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>{t('nav.downloadCv')}</span>
              </ButtonLink>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                aria-label={mobileMenuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-default bg-bg-secondary text-text-primary transition-colors hover:border-accent hover:text-accent cursor-pointer"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-navigation-drawer"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-border-default bg-bg-secondary lg:hidden"
            >
              <Container className="py-4">
                <nav aria-label={t('nav.mobileLabel')} className="flex flex-col gap-1">
                  {PRIMARY_NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between rounded-[10px] px-4 py-3 text-[15px] font-medium transition-colors',
                          isActive
                            ? 'bg-accent-subtle text-accent'
                            : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                        )
                      }
                    >
                      {t(item.key)}
                    </NavLink>
                  ))}
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border-default pt-3">
                    <NavLink
                      to="/skills"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'rounded-[10px] border border-border-default px-3 py-2.5 text-center text-sm font-medium transition-colors',
                          isActive
                            ? 'border-accent-border bg-accent-subtle text-accent'
                            : 'text-text-secondary hover:text-text-primary'
                        )
                      }
                    >
                      {t('nav.skills')}
                    </NavLink>
                    <NavLink
                      to="/certifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'rounded-[10px] border border-border-default px-3 py-2.5 text-center text-sm font-medium transition-colors',
                          isActive
                            ? 'border-accent-border bg-accent-subtle text-accent'
                            : 'text-text-secondary hover:text-text-primary'
                        )
                      }
                    >
                      {t('nav.certifications')}
                    </NavLink>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 pt-1">
                    {siteSettings.recruiterModeEnabled && (
                      <ButtonLink
                        to="/recruiter"
                        variant="secondary"
                        size="md"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full"
                      >
                        <BriefcaseBusiness className="h-4 w-4 text-accent" aria-hidden="true" />
                        <span>{t('nav.recruiterMode')}</span>
                      </ButtonLink>
                    )}
                    <ButtonLink
                      to="/career/cv-builder"
                      variant="primary"
                      size="md"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>{t('nav.downloadCv')}</span>
                    </ButtonLink>
                  </div>
                </nav>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
