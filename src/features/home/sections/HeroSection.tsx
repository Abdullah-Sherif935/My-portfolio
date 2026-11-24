import { ArrowRight, BriefcaseBusiness, Download, Mail, MapPin, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function HeroSection() {
  const { t } = useTranslation(['home', 'common']);
  const { pick } = useLanguage();
  const { profile, education, siteSettings } = usePortfolioData();
  const prefersReducedMotion = useReducedMotion();

  const primaryEducation = education[0];
  const heroCards = siteSettings.homeSections.heroCards;
  const visibleHeroCards = [
    heroCards?.currentRole,
    heroCards?.coreFocus,
  ].filter((card): card is NonNullable<typeof card> => Boolean(card && card.visible));
  const rawHeadline = pick(profile.headline);
  const headlineParts = rawHeadline
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
  const primaryIdentity = headlineParts[0] ?? rawHeadline;
  const specializationSubtitle =
    headlineParts.length > 1 ? headlineParts.slice(1).join(' | ') : null;

  return (
    <section className="relative overflow-hidden border-b border-border-default bg-bg-primary">
      {/* Subtle Technical Blueprint Grid & Ambient Accent Glow */}
      <div
        aria-hidden="true"
        className="engineering-grid pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 end-0 h-[420px] w-[420px] rounded-full bg-accent/10 blur-[120px]"
      />

      <Container className="relative py-8 sm:py-16 lg:py-24">
        <div className="grid items-center gap-7 sm:gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Primary Text Column */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 sm:space-y-6 lg:col-span-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" mono className="text-[11px] sm:text-xs">
                {t('home:hero.eyebrow')}
              </Badge>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-[30px] font-bold leading-[1.12] tracking-tight text-text-primary sm:text-5xl lg:text-[56px] lg:leading-[1.08]">
                {pick(profile.fullName)}
              </h1>
              <div className="space-y-1">
                <p className="text-base font-semibold leading-snug text-accent sm:text-xl lg:text-2xl">
                  {primaryIdentity}
                </p>
                {specializationSubtitle && (
                  <p className="text-sm font-medium leading-snug text-text-primary/90 sm:text-base lg:text-lg">
                    {specializationSubtitle}
                  </p>
                )}
              </div>
              <p className="inline-flex items-center gap-1.5 text-xs text-text-secondary sm:text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" aria-hidden="true" />
                <span>{pick(profile.location)}</span>
              </p>
            </div>

            {/* Concise 2-3 line summary on mobile; full summary preserved on tablet/desktop */}
            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:hidden">
              {t('home:hero.mobileSummary')}
            </p>
            <p className="hidden max-w-2xl text-base leading-relaxed text-text-secondary sm:block lg:text-[17px]">
              {pick(profile.summary)}
            </p>

            {/* CTA Group: Primary & Secondary prominent on mobile; Download CV understated below on mobile */}
            <div className="space-y-2.5 pt-1 sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:space-y-0 sm:pt-2">
              <div className="grid grid-cols-2 gap-2.5 sm:contents">
                <ButtonLink
                  to="/portfolio"
                  variant="primary"
                  size="md"
                  className="w-full px-3 text-xs sm:h-12 sm:w-auto sm:px-6 sm:text-[15px]"
                >
                  <span>{t('common:actions.exploreProjects')}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 rtl:rotate-180" aria-hidden="true" />
                </ButtonLink>

                <ButtonLink
                  to="/contact"
                  variant="secondary"
                  size="md"
                  className="w-full px-3 text-xs sm:h-12 sm:w-auto sm:px-6 sm:text-[15px]"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" aria-hidden="true" />
                  <span>{t('common:actions.contactMe')}</span>
                </ButtonLink>
              </div>

              <div className="flex items-center justify-center gap-2 sm:hidden">
                <ButtonLink
                  to="/career/cv-builder"
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-center text-xs text-text-secondary hover:text-accent"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('common:nav.downloadCv')}</span>
                </ButtonLink>
                {siteSettings.recruiterModeEnabled && (
                  <ButtonLink
                    to="/recruiter"
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-center text-xs text-accent"
                  >
                    <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('common:nav.recruiterMode')}</span>
                  </ButtonLink>
                )}
              </div>

              <div className="hidden sm:inline-flex">
                <ButtonLink
                  to="/career/cv-builder"
                  variant="outline"
                  size="lg"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>{t('common:nav.downloadCv')}</span>
                </ButtonLink>
              </div>
            </div>
          </motion.div>

          {/* Technical Portrait Frame: Compact on mobile, full size preserved on desktop */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-[300px] rounded-2xl border border-border-default bg-bg-secondary p-3 shadow-card sm:max-w-[400px] sm:p-5 lg:max-w-[420px]">
              {/* Precision Corner Registration Brackets */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 start-2 h-3.5 w-3.5 border-t-2 border-s-2 border-accent sm:h-4 sm:w-4"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 end-2 h-3.5 w-3.5 border-t-2 border-e-2 border-accent sm:h-4 sm:w-4"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 start-2 h-3.5 w-3.5 border-b-2 border-s-2 border-accent sm:h-4 sm:w-4"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 end-2 h-3.5 w-3.5 border-b-2 border-e-2 border-accent sm:h-4 sm:w-4"
              />

              {/* Top Technical Header */}
              <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-text-secondary sm:mb-3 sm:text-[11px]">
                <span>{t('home:hero.profileFrameLabel')}</span>
                <span className="inline-flex items-center gap-1.5 text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {t('home:hero.degreeTag', {
                    year: primaryEducation?.graduationYear ?? '',
                  })}
                </span>
              </div>

              {/* Engineer Portrait Area */}
              {siteSettings.showGraduationPortrait && profile.avatarUrl ? (
                <div className="group relative aspect-[4/3.85] overflow-hidden rounded-xl border border-border-strong bg-bg-primary sm:aspect-[4/4.2]">
                  <img
                    src={profile.avatarUrl}
                    alt={
                      profile.avatarAlt
                        ? pick(profile.avatarAlt)
                        : pick(profile.fullName)
                    }
                    className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-bg-primary/45 to-transparent sm:h-16"
                  />
                </div>
              ) : (
                <div className="relative flex aspect-[4/3.85] flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-bg-primary p-5 text-center sm:aspect-[4/4.2] sm:p-6">
                  <div
                    aria-hidden="true"
                    className="engineering-grid pointer-events-none absolute inset-0 opacity-60"
                  />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-border bg-accent-subtle text-accent sm:h-20 sm:w-20">
                      <UserRound className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text-primary">
                        {t('home:hero.profilePlaceholderTitle')}
                      </p>
                      <p className="font-mono text-xs text-text-secondary">
                        {t('home:hero.profilePlaceholderSubtitle')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Technical Coordinate Footer */}
              <div className="mt-2.5 grid grid-cols-2 gap-2 font-mono text-[10px] sm:mt-3 sm:text-[11px]">
                <div className="rounded-lg border border-border-default bg-bg-primary px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <span className="block text-text-secondary">
                    {t('home:hero.universityTagLabel')}
                  </span>
                  <span className="font-medium text-text-primary">
                    {t('home:hero.universityTagValue')}
                  </span>
                </div>
                <div className="rounded-lg border border-border-default bg-bg-primary px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <span className="block text-text-secondary">
                    {t('home:hero.localeTagLabel')}
                  </span>
                  <span className="font-medium text-text-primary">
                    {t('home:hero.localeTagValue')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Public Engineering Specification Strip (2 Editable Cards: Current Role & Core Focus) */}
        {visibleHeroCards.length > 0 && (
          <div
            className={
              visibleHeroCards.length === 1
                ? 'mt-7 grid gap-2.5 border-t border-border-default pt-5 sm:mt-12 sm:grid-cols-1 sm:gap-4 sm:pt-8'
                : 'mt-7 grid gap-2.5 border-t border-border-default pt-5 sm:mt-12 sm:grid-cols-2 sm:gap-4 sm:pt-8'
            }
          >
            {visibleHeroCards.map((card, idx) => {
              const subtextValue = pick(card.subtext).trim();
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border-default bg-bg-secondary/80 px-3.5 py-3 sm:px-4 sm:py-3.5"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary sm:text-[11px]">
                    {pick(card.label)}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-text-primary sm:mt-1 sm:text-sm">
                    {pick(card.value)}
                  </p>
                  {subtextValue && (
                    <p className="mt-0.5 text-[11px] text-text-secondary sm:text-xs">
                      {subtextValue}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Container >
    </section >
  );
}
