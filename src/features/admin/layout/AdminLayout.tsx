import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Award,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  Compass,
  ExternalLink,
  FileText,
  FolderKanban,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
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
import { AdminProtectedRoute } from '@/features/admin/auth/AdminProtectedRoute';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import { cn } from '@/utils/cn';

interface NavGroup {
  groupKey: string;
  items: Array<{
    to: string;
    labelKey: string;
    icon: typeof LayoutDashboard;
    end?: boolean;
    publicHint?: string;
  }>;
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'nav.groupMain',
    items: [
      { to: '/admin', labelKey: 'nav.overview', icon: LayoutDashboard, end: true },
    ],
  },
  {
    groupKey: 'nav.groupPages',
    items: [
      { to: '/admin/pages/home', labelKey: 'nav.pageHome', icon: Home, publicHint: '/' },
      { to: '/admin/pages/about', labelKey: 'nav.pageAbout', icon: UserRound, publicHint: '/about' },
      { to: '/admin/pages/experience', labelKey: 'nav.pageExperience', icon: Briefcase, publicHint: '/experience' },
      { to: '/admin/pages/portfolio', labelKey: 'nav.pagePortfolio', icon: FolderKanban, publicHint: '/portfolio' },
      { to: '/admin/pages/clients', labelKey: 'nav.pageClients', icon: Building2, publicHint: '/companies' },
      { to: '/admin/pages/skills', labelKey: 'nav.pageSkills', icon: Sliders, publicHint: '/skills' },
      { to: '/admin/pages/certifications', labelKey: 'nav.pageCertifications', icon: Award, publicHint: '/certifications' },
      { to: '/admin/pages/contact', labelKey: 'nav.pageContact', icon: Mail, publicHint: '/contact' },
    ],
  },
  {
    groupKey: 'nav.groupFeatures',
    items: [
      { to: '/admin/features/recruiter', labelKey: 'nav.featureRecruiter', icon: BriefcaseBusiness, publicHint: '/recruiter' },
      { to: '/admin/features/cv-builder', labelKey: 'nav.featureCvBuilder', icon: FileText, publicHint: '/career/cv-builder' },
    ],
  },
  {
    groupKey: 'nav.groupSystem',
    items: [
      { to: '/admin/system/settings', labelKey: 'nav.globalSettings', icon: Settings },
      { to: '/admin/system/navigation', labelKey: 'nav.navigationMgmt', icon: Compass },
      { to: '/admin/system/media', labelKey: 'nav.media', icon: ImageIcon },
    ],
  },
];

  const ROUTE_BREADCRUMB_MAP: Record<string, { groupKey ?: string; labelKey: string }> = {
    '/admin': { labelKey: 'nav.overview' },
    '/admin/pages/home': { groupKey: 'nav.groupPages', labelKey: 'nav.pageHome' },
    '/admin/pages/about': { groupKey: 'nav.groupPages', labelKey: 'nav.pageAbout' },
    '/admin/pages/experience': { groupKey: 'nav.groupPages', labelKey: 'nav.pageExperience' },
    '/admin/pages/portfolio': { groupKey: 'nav.groupPages', labelKey: 'nav.pagePortfolio' },
    '/admin/pages/clients': { groupKey: 'nav.groupPages', labelKey: 'nav.pageClients' },
    '/admin/pages/skills': { groupKey: 'nav.groupPages', labelKey: 'nav.pageSkills' },
    '/admin/pages/certifications': { groupKey: 'nav.groupPages', labelKey: 'nav.pageCertifications' },
    '/admin/pages/contact': { groupKey: 'nav.groupPages', labelKey: 'nav.pageContact' },
    '/admin/features/recruiter': { groupKey: 'nav.groupFeatures', labelKey: 'nav.featureRecruiter' },
    '/admin/features/cv-builder': { groupKey: 'nav.groupFeatures', labelKey: 'nav.featureCvBuilder' },
    '/admin/system/settings': { groupKey: 'nav.groupSystem', labelKey: 'nav.globalSettings' },
    '/admin/system/navigation': { groupKey: 'nav.groupSystem', labelKey: 'nav.navigationMgmt' },
    '/admin/system/media': { groupKey: 'nav.groupSystem', labelKey: 'nav.media' },
  };

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { user, signOut } = useAdminAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      onNavigate?.();
      navigate('/admin/login', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

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

      {/* Page-Oriented Navigation Groups */}
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
                      'flex items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                          ? 'border border-accent-border bg-accent-subtle text-accent'
                          : 'border border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                    )
                  }
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </span>
                  {item.publicHint && (
                    <span
                      dir="ltr"
                      className="hidden shrink-0 font-mono text-[10px] opacity-60 xl:inline"
                    >
                      {item.publicHint}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Utility Links & Sign Out */}
      <div className="space-y-2 border-t border-border-default p-3">
        {user?.email && (
          <p
            dir="ltr"
            className="truncate px-3 font-mono text-[11px] text-text-secondary"
            title={user.email}
          >
            {user.email}
          </p>
        )}
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-[10px] border border-border-default bg-bg-primary px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{t('nav.viewPublicSite')}</span>
        </Link>
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-error-subtle disabled:opacity-50 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{t('nav.signOut')}</span>
        </button>
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

  const crumb = ROUTE_BREADCRUMB_MAP[pathname] ?? { labelKey: 'nav.overview' };
  const isHome = pathname === '/admin';

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      {/* Persistent Desktop Sidebar */}
        <aside className="hidden w-68 shrink-0 border-e border-border-default lg:block">
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

              {/* Hierarchical Breadcrumbs */}
              <nav aria-label={t('nav.breadcrumbLabel')} className="flex min-w-0 items-center gap-1.5 text-sm">
                <Link
                  to="/admin"
                  className="truncate font-medium text-text-secondary hover:text-accent"
                >
                  {t('brand.console')}
                </Link>
                {!isHome && crumb.groupKey && (
                  <>
                    <ChevronRight
                      className="hidden h-4 w-4 shrink-0 text-text-secondary sm:block rtl:rotate-180"
                      aria-hidden="true"
                    />
                    <span className="hidden truncate text-text-secondary sm:inline">
                      {t(crumb.groupKey)}
                    </span>
                  </>
                )}
                {!isHome && (
                  <>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-text-secondary rtl:rotate-180"
                      aria-hidden="true"
                    />
                    <span className="truncate font-semibold text-text-primary">
                      {t(crumb.labelKey)}
                    </span>
                  </>
                )}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="success" mono className="hidden md:inline-flex">
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
    <AdminProtectedRoute>
      <AdminDataProvider>
        <AdminLayoutShell />
      </AdminDataProvider>
    </AdminProtectedRoute>
  );
}
