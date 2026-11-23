import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Award,
  Briefcase,
  Building2,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LogIn,
  Menu,
  Settings,
  Sliders,
  UserRound,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { PageTransition } from '@/components/animations/PageTransition';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useLanguage } from '@/hooks/useLanguage';
import { AdminDataProvider } from '@/features/admin/context/AdminDataContext';
import { cn } from '@/utils/cn';

interface NavGroup {
  groupKey: string;
  items: Array<{
    to: string;
    labelKey: string;
    icon: typeof LayoutDashboard;
    end?: boolean;
  }>;
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'nav.groupOverview',
    items: [
      { to: '/admin', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    groupKey: 'nav.groupContent',
    items: [
      { to: '/admin/profile', labelKey: 'nav.profile', icon: UserRound },
      { to: '/admin/projects', labelKey: 'nav.projects', icon: FolderKanban },
      { to: '/admin/companies', labelKey: 'nav.companies', icon: Building2 },
      { to: '/admin/experience', labelKey: 'nav.experience', icon: Briefcase },
      { to: '/admin/education', labelKey: 'nav.education', icon: GraduationCap },
      { to: '/admin/skills', labelKey: 'nav.skills', icon: Sliders },
      { to: '/admin/certifications', labelKey: 'nav.certifications', icon: Award },
    ],
  },
  {
    groupKey: 'nav.groupAssets',
    items: [
      { to: '/admin/media', labelKey: 'nav.media', icon: ImageIcon },
      { to: '/admin/cv', labelKey: 'nav.cv', icon: FileText },
    ],
  },
  {
    groupKey: 'nav.groupSystem',
    items: [
      { to: '/admin/settings', labelKey: 'nav.settings', icon: Settings },
    ],
  },
];

const ROUTE_LABEL_MAP: Record<string, string> = {
  '/admin': 'nav.dashboard',
  '/admin/profile': 'nav.profile',
  '/admin/projects': 'nav.projects',
  '/admin/companies': 'nav.companies',
  '/admin/experience': 'nav.experience',
  '/admin/education': 'nav.education',
  '/admin/skills': 'nav.skills',
  '/admin/certifications': 'nav.certifications',
  '/admin/media': 'nav.media',
  '/admin/cv': 'nav.cv',
  '/admin/settings': 'nav.settings',
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation('admin');

  return (
    <div className="flex h-full flex-col bg-bg-secondary">
      {/* Console Brand Header */}
      <div className="flex h-16 items-center justify-between gap-3 border-b border-border-default px-4">
        <Link
          to="/admin"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle font-mono text-xs font-bold text-accent"
          >
            AS
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-text-primary">
              {t('brand.console')}
            </span>
            <span className="block truncate font-mono text-[10px] text-text-secondary">
              {t('brand.workspaceLabel')}
            </span>
          </span>
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label={t('nav.closeSidebar')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary lg:hidden cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav
        aria-label={t('nav.sidebarLabel')}
        className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
      >
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.groupKey} className="space-y-1">
            <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              {t(group.groupKey)}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent-subtle text-accent border border-accent-border'
                        : 'border border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t(item.labelKey)}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Utility Links */}
      <div className="space-y-1.5 border-t border-border-default p-3">
        <Link
          to="/admin/login"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
        >
          <LogIn className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="truncate">{t('nav.loginPreview')}</span>
        </Link>
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-[10px] border border-border-default bg-bg-primary px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{t('nav.viewPublicSite')}</span>
        </Link>
      </div>
    </div>
  );
}

function AdminLayoutShell() {
  const { pathname } = useLocation();
  const { t } = useTranslation('admin');
  const { isRtl } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useScrollToTop();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const currentLabelKey = ROUTE_LABEL_MAP[pathname] || 'nav.dashboard';
  const isHome = pathname === '/admin';

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      {/* Persistent Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-e border-border-default lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Collapsible Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={prefersReducedMotion ? false : { x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: isRtl ? '100%' : '-100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 h-full w-72 max-w-[85vw] border-e border-border-default shadow-elevated"
            >
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Shell */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Admin Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border-default bg-nav-bg px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('nav.openSidebar')}
              aria-expanded={drawerOpen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-border-default bg-bg-secondary text-text-primary hover:border-accent hover:text-accent lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Breadcrumbs */}
            <nav aria-label={t('nav.breadcrumbLabel')} className="flex min-w-0 items-center gap-1.5 text-sm">
              <Link
                to="/admin"
                className="truncate font-medium text-text-secondary hover:text-accent"
              >
                {t('brand.console')}
              </Link>
              {!isHome && (
                <>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-text-secondary rtl:rotate-180"
                    aria-hidden="true"
                  />
                  <span className="truncate font-semibold text-text-primary">
                    {t(currentLabelKey)}
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="accent" mono className="hidden md:inline-flex">
              {t('prototype.badge')}
            </Badge>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Scrollable Content Area */}
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <PageTransition key={pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminDataProvider>
      <AdminLayoutShell />
    </AdminDataProvider>
  );
}
