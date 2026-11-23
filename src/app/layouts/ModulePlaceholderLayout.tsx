import { Outlet, useLocation } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { BrandMark } from '@/components/common/BrandMark';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';
import { ButtonLink } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

/**
 * Isolated layout shell for future private Admin and Career modules.
 * Intentionally separated from PublicLayout so Phase 02+ authentication
 * and server-verified guards remain cleanly decoupled.
 */
export function ModulePlaceholderLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation('common');
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-primary">
      <header className="border-b border-border-default bg-bg-secondary">
        <Container className="flex h-[72px] items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <ButtonLink to="/" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              <span className="hidden sm:inline">{t('actions.backToHome')}</span>
            </ButtonLink>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <PageTransition key={pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
