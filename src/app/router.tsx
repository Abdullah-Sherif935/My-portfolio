import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { ModulePlaceholderLayout } from './layouts/ModulePlaceholderLayout';
import { HomePage } from '@/features/home/HomePage';
import { AboutPage } from '@/features/about/AboutPage';
import { PortfolioPage } from '@/features/portfolio/PortfolioPage';
import { ProjectDetailPage } from '@/features/portfolio/ProjectDetailPage';
import { CompaniesPage } from '@/features/companies/CompaniesPage';
import { CompanyDetailPage } from '@/features/companies/CompanyDetailPage';
import { ExperiencePage } from '@/features/experience/ExperiencePage';
import { SkillsPage } from '@/features/skills/SkillsPage';
import { CertificationsPage } from '@/features/certifications/CertificationsPage';
import { ContactPage } from '@/features/contact/ContactPage';
import { FutureModulePlaceholderPage } from '@/features/future/FutureModulePlaceholderPage';
import { NotFoundPage } from '@/features/future/NotFoundPage';

// Lazy-loaded Phase 05 Recruiter Mode & Smart CV Builder Modules
const RecruiterEntryPage = lazy(() =>
  import('@/features/recruiter/RecruiterEntryPage').then((m) => ({
    default: m.RecruiterEntryPage,
  }))
);
const RecruiterResultsPage = lazy(() =>
  import('@/features/recruiter/RecruiterResultsPage').then((m) => ({
    default: m.RecruiterResultsPage,
  }))
);
const CvBuilderPage = lazy(() =>
  import('@/features/cv/CvBuilderPage').then((m) => ({
    default: m.CvBuilderPage,
  }))
);

// Lazy-loaded Page-Oriented Admin Dashboard Modules (keeps public bundle lean)
const AdminLayout = lazy(() =>
  import('@/features/admin/layout/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminLoginPage = lazy(() =>
  import('@/features/admin/auth/AdminLoginPage').then((m) => ({
    default: m.AdminLoginPage,
  }))
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/dashboard/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
    const AdminHomePageManager = lazy(() =>
      import('@/features/admin/pages/AdminHomePageManager').then((m) => ({
        default: m.AdminHomePageManager,
      }))
    );
        const AdminAboutPageManager = lazy(() =>
          import('@/features/admin/pages/AdminAboutPageManager').then((m) => ({
            default: m.AdminAboutPageManager,
          }))
        );
            const AdminContactPageManager = lazy(() =>
              import('@/features/admin/pages/AdminContactPageManager').then((m) => ({
                default: m.AdminContactPageManager,
              }))
            );
                const AdminExperiencePageManager = lazy(() =>
                  import('@/features/admin/pages/AdminSectionPageWrappers').then((m) => ({
                    default: m.AdminExperiencePageManager,
                  }))
                );
                    const AdminPortfolioPageManager = lazy(() =>
                      import('@/features/admin/pages/AdminSectionPageWrappers').then((m) => ({
                        default: m.AdminPortfolioPageManager,
                      }))
                    );
                        const AdminClientsPageManager = lazy(() =>
                          import('@/features/admin/pages/AdminSectionPageWrappers').then((m) => ({
                            default: m.AdminClientsPageManager,
                          }))
                        );
                            const AdminSkillsPageManager = lazy(() =>
                              import('@/features/admin/pages/AdminSectionPageWrappers').then((m) => ({
                                default: m.AdminSkillsPageManager,
                              }))
                            );
                            const AdminCertificationsPageManager = lazy(() =>
                              import('@/features/admin/pages/AdminSectionPageWrappers').then((m) => ({
                                default: m.AdminCertificationsPageManager,
                              }))
                            );
                            const AdminRecruiterFeaturePage = lazy(() =>
                              import('@/features/admin/features/AdminRecruiterFeaturePage').then((m) => ({
                                default: m.AdminRecruiterFeaturePage,
                              }))
                            );
                            const AdminCvBuilderFeaturePage = lazy(() =>
                              import('@/features/admin/features/AdminCvBuilderFeaturePage').then((m) => ({
                                default: m.AdminCvBuilderFeaturePage,
                              }))
                            );
                            const AdminMediaPage = lazy(() =>
                              import('@/features/admin/media/AdminMediaPage').then((m) => ({
                                default: m.AdminMediaPage,
                              }))
                            );
                            const AdminSettingsPage = lazy(() =>
                              import('@/features/admin/settings/AdminSettingsPage').then((m) => ({
                                default: m.AdminSettingsPage,
                              }))
                            );
                            const AdminNavigationPage = lazy(() =>
                              import('@/features/admin/system/AdminNavigationPage').then((m) => ({
                                default: m.AdminNavigationPage,
                              }))
                            );

                            function withSuspense(node: ReactNode) {
                            return(
    <Suspense
      fallback = {
        < div className = "flex min-h-[40vh] items-center justify-center bg-bg-primary p-8" >
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-default border-t-accent" />
        </div >
      }
    >
  { node }
    </Suspense >
  );
}

const FUTURE_CAREER_ROUTES = [
  '/career',
  '/career/jobs',
  '/career/applications',
] as const;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'portfolio/:slug', element: <ProjectDetailPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'companies/:slug', element: <CompanyDetailPage /> },
      { path: 'experience', element: <ExperiencePage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'certifications', element: <CertificationsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'recruiter', element: withSuspense(<RecruiterEntryPage />) },
      { path: 'recruiter/results', element: withSuspense(<RecruiterResultsPage />) },
      { path: 'career/cv-builder', element: withSuspense(<CvBuilderPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Standalone Admin Login UI Prototype (Phase 04 Supabase Auth pending)
  {
    path: '/admin/login',
    element: withSuspense(<AdminLoginPage />),
  },
  // Dedicated Nested Page-Oriented Admin Dashboard Layout
  {
    path: '/admin',
    element: withSuspense(<AdminLayout />),
    children: [
      { index: true, element: withSuspense(<AdminDashboardPage />) },
      // Website Pages Group
      { path: 'pages/home', element: withSuspense(<AdminHomePageManager />) },
      { path: 'pages/about', element: withSuspense(<AdminAboutPageManager />) },
      { path: 'pages/experience', element: withSuspense(<AdminExperiencePageManager />) },
      { path: 'pages/portfolio', element: withSuspense(<AdminPortfolioPageManager />) },
      { path: 'pages/companies', element: withSuspense(<AdminClientsPageManager />) },
      { path: 'pages/clients', element: withSuspense(<AdminClientsPageManager />) },
      { path: 'pages/skills', element: withSuspense(<AdminSkillsPageManager />) },
      { path: 'pages/certifications', element: withSuspense(<AdminCertificationsPageManager />) },
      { path: 'pages/contact', element: withSuspense(<AdminContactPageManager />) },
      // Specialized Features Group
      { path: 'features/recruiter', element: withSuspense(<AdminRecruiterFeaturePage />) },
      { path: 'features/cv-builder', element: withSuspense(<AdminCvBuilderFeaturePage />) },
      // System Management Group
      { path: 'system/settings', element: withSuspense(<AdminSettingsPage />) },
      { path: 'system/navigation', element: withSuspense(<AdminNavigationPage />) },
      { path: 'system/media', element: withSuspense(<AdminMediaPage />) },
      // Backwards-compatible legacy Admin route redirects (zero broken links/bookmarks)
      { path: 'profile', element: <Navigate to="/admin/pages/about" replace /> },
      { path: 'education', element: <Navigate to="/admin/pages/about?tab=education" replace /> },
      { path: 'projects', element: <Navigate to="/admin/pages/portfolio" replace /> },
      { path: 'companies', element: <Navigate to="/admin/pages/companies" replace /> },
      { path: 'experience', element: <Navigate to="/admin/pages/experience" replace /> },
      { path: 'skills', element: <Navigate to="/admin/pages/skills" replace /> },
      { path: 'certifications', element: <Navigate to="/admin/pages/certifications" replace /> },
      { path: 'cv', element: <Navigate to="/admin/features/cv-builder" replace /> },
      { path: 'media', element: <Navigate to="/admin/system/media" replace /> },
      { path: 'settings', element: <Navigate to="/admin/system/settings" replace /> },
    ],
  },
  // Reserved Future Career Platform Routes
  {
    element: <ModulePlaceholderLayout />,
    children: FUTURE_CAREER_ROUTES.map((routePath) => ({
      path: routePath,
      element: <FutureModulePlaceholderPage routePath={routePath} />,
    })),
  },
]);
