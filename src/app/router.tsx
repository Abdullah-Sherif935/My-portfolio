import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
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

// Lazy-loaded Phase 03 Admin Dashboard Modules (keeps public bundle lean)
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
const AdminProfilePage = lazy(() =>
  import('@/features/admin/profile/AdminProfilePage').then((m) => ({
    default: m.AdminProfilePage,
  }))
);
const AdminProjectsPage = lazy(() =>
  import('@/features/admin/projects/AdminProjectsPage').then((m) => ({
    default: m.AdminProjectsPage,
  }))
);
const AdminCompaniesPage = lazy(() =>
  import('@/features/admin/companies/AdminCompaniesPage').then((m) => ({
    default: m.AdminCompaniesPage,
  }))
);
const AdminExperiencePage = lazy(() =>
  import('@/features/admin/experience/AdminExperiencePage').then((m) => ({
    default: m.AdminExperiencePage,
  }))
);
const AdminEducationPage = lazy(() =>
  import('@/features/admin/education/AdminEducationPage').then((m) => ({
    default: m.AdminEducationPage,
  }))
);
const AdminSkillsPage = lazy(() =>
  import('@/features/admin/skills/AdminSkillsPage').then((m) => ({
    default: m.AdminSkillsPage,
  }))
);
const AdminCertificationsPage = lazy(() =>
  import('@/features/admin/certifications/AdminCertificationsPage').then((m) => ({
    default: m.AdminCertificationsPage,
  }))
);
const AdminMediaPage = lazy(() =>
  import('@/features/admin/media/AdminMediaPage').then((m) => ({
    default: m.AdminMediaPage,
  }))
);
const AdminCvPage = lazy(() =>
  import('@/features/admin/cv/AdminCvPage').then((m) => ({ default: m.AdminCvPage }))
);
const AdminSettingsPage = lazy(() =>
  import('@/features/admin/settings/AdminSettingsPage').then((m) => ({
    default: m.AdminSettingsPage,
  }))
);

function withSuspense(node: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center bg-bg-primary p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-default border-t-accent" />
        </div>
      }
    >
      {node}
    </Suspense>
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
  // Dedicated Nested Admin Dashboard Layout (Phase 03 UI Prototype)
  {
    path: '/admin',
    element: withSuspense(<AdminLayout />),
    children: [
      { index: true, element: withSuspense(<AdminDashboardPage />) },
      { path: 'profile', element: withSuspense(<AdminProfilePage />) },
      { path: 'projects', element: withSuspense(<AdminProjectsPage />) },
      { path: 'companies', element: withSuspense(<AdminCompaniesPage />) },
      { path: 'experience', element: withSuspense(<AdminExperiencePage />) },
      { path: 'education', element: withSuspense(<AdminEducationPage />) },
      { path: 'skills', element: withSuspense(<AdminSkillsPage />) },
      { path: 'certifications', element: withSuspense(<AdminCertificationsPage />) },
      { path: 'media', element: withSuspense(<AdminMediaPage />) },
      { path: 'cv', element: withSuspense(<AdminCvPage />) },
      { path: 'settings', element: withSuspense(<AdminSettingsPage />) },
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
