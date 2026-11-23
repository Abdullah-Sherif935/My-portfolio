import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Award,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  FolderKanban,
  Home,
  Mail,
  ShieldCheck,
  Sliders,
  UserRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';

export function AdminDashboardPage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('dashboard.pageTitle'));

  const {
    profile,
    education,
    projects,
    companies,
    experience,
    skills,
    certifications,
    media,
    siteSettings,
    activities,
    reloadWorkspace,
  } = useAdminData();

  const [resetMessage, setResetMessage] = useState(false);

  const sourceBreakdown = useMemo(() => {
    const allRecords = [
      ...projects,
      ...companies,
      ...experience,
      ...education,
      ...skills,
      ...certifications,
    ];
    return {
      published: allRecords.length,
      cvInitial: allRecords.filter((r) => r.dataSource === 'cv-initial').length,
      placeholder: allRecords.filter((r) => r.dataSource === 'placeholder').length,
      cms: allRecords.filter((r) => r.dataSource === 'cms').length,
    };
  }, [projects, companies, experience, education, skills, certifications]);

  const featuredCount = useMemo(
    () => projects.filter((p) => p.featured).length,
    [projects]
  );
  const visibleSkillGroupsCount = useMemo(
    () => skills.filter((s) => s.isVisible !== false).length,
    [skills]
  );

  const pageCards = [
    {
      title: t('nav.pageHome'),
      route: '/',
      adminTo: '/admin/pages/home',
      icon: Home,
      summary: t('dashboard.pageCards.home', {
        featured: featuredCount,
        total: projects.length,
      }),
    },
    {
      title: t('nav.pageAbout'),
      route: '/about',
      adminTo: '/admin/pages/about',
      icon: UserRound,
      summary: t('dashboard.pageCards.about', {
        education: education.length,
        languages: profile.languages.length,
      }),
    },
    {
      title: t('nav.pageExperience'),
      route: '/experience',
      adminTo: '/admin/pages/experience',
      icon: Briefcase,
      summary: t('dashboard.pageCards.experience', { count: experience.length }),
    },
    {
      title: t('nav.pagePortfolio'),
      route: '/portfolio',
      adminTo: '/admin/pages/portfolio',
      icon: FolderKanban,
      summary: t('dashboard.pageCards.portfolio', {
        count: projects.length,
        featured: featuredCount,
      }),
    },
    {
      title: t('nav.pageClients'),
      route: '/companies',
      adminTo: '/admin/pages/clients',
      icon: Building2,
      summary: t('dashboard.pageCards.clients', { count: companies.length }),
    },
    {
      title: t('nav.pageSkills'),
      route: '/skills',
      adminTo: '/admin/pages/skills',
      icon: Sliders,
      summary: t('dashboard.pageCards.skills', {
        visible: visibleSkillGroupsCount,
        total: skills.length,
      }),
    },
    {
      title: t('nav.pageCertifications'),
      route: '/certifications',
      adminTo: '/admin/pages/certifications',
      icon: Award,
      summary: t('dashboard.pageCards.certifications', {
        count: certifications.length,
      }),
    },
    {
      title: t('nav.pageContact'),
      route: '/contact',
      adminTo: '/admin/pages/contact',
      icon: Mail,
      summary: t('dashboard.pageCards.contact', {
        emailStatus: siteSettings.showContactEmail
          ? t('common.visible')
          : t('common.hidden'),
      }),
    },
  ];

  const handleReset = async () => {
    await reloadWorkspace();
    setResetMessage(true);
    window.setTimeout(() => setResetMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
      />

      <PrototypeBanner onReset={() => void handleReset()} />

      {resetMessage && (
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success-subtle px-4 py-3 text-xs font-medium text-success"
        >
          {t('prototype.resetConfirm')}
        </div>
      )}

      {/* Real Database Content & System Status Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase text-text-secondary">
            {t('dashboard.publishedRecords')}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-text-primary">
            {sourceBreakdown.published}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {t('common.sourceCms')}: {sourceBreakdown.cms} · {t('common.sourceCvInitial')}: {sourceBreakdown.cvInitial}
          </p>
        </Card>

        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase text-text-secondary">
            {t('dashboard.pendingPlaceholders')}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-accent">
            {sourceBreakdown.placeholder}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {t('dashboard.placeholderHint')}
          </p>
        </Card>

              <Card className="p-4">
                <p className="font-mono text-[11px] uppercase text-text-secondary">
                  {t('nav.featureRecruiter')}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant={siteSettings.recruiterModeEnabled ? 'success' : 'muted'}>
                    {siteSettings.recruiterModeEnabled
                      ? t('dashboard.statusActive')
                      : t('dashboard.statusPaused')}
                  </Badge>
                  <span className="font-mono text-xs text-text-secondary">
                    CV: {siteSettings.defaultCvTemplate.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-text-secondary">
                  {t('nav.media')}: {media.length}
                </p>
              </Card>

                <Card className="p-4">
                  <p className="font-mono text-[11px] uppercase text-text-secondary">
                    {t('dashboard.systemStatus')}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-success">
                    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t('dashboard.rlsActive')}</span>
                  </div>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-text-secondary">
                    <Database className="h-3 w-3 text-accent" aria-hidden="true" />
                    <span>Supabase PostgreSQL & Storage</span>
                  </p>
                </Card>
            </div>

            {/* Page-Oriented Quick Navigation Grid */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    {t('dashboard.managePagesHeading')}
                  </h2>
                    <p className="text-xs text-text-secondary">
                      {t('dashboard.managePagesSubtitle')}
                    </p>
                </div>
              </div>

                  <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    {pageCards.map((card) => {
                      const Icon = card.icon;
                      return (
                        <Link
                          key={card.adminTo}
                          to={card.adminTo}
                          className="group block"
                        >
                          <Card className="flex h-full flex-col justify-between gap-3 p-4 transition-colors group-hover:border-accent">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </div>
                              <span
                                dir="ltr"
                                className="rounded bg-bg-primary px-2 py-0.5 font-mono text-[10px] text-text-secondary"
                              >
                                {card.route}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <h3 className="flex items-center justify-between text-sm font-semibold text-text-primary group-hover:text-accent">
                                <span>{card.title}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                              </h3>
                              <p className="text-xs text-text-secondary">{card.summary}</p>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Specialized Features Row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Link to="/admin/features/recruiter" className="group block">
                    <Card className="flex items-center justify-between gap-4 p-5 transition-colors group-hover:border-accent">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                          <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent">
                            {t('nav.featureRecruiter')}
                          </h3>
                          <p className="text-xs text-text-secondary">
                            {t('dashboard.recruiterCardDesc')}
                          </p>
                        </div>
                      </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-text-secondary group-hover:text-accent" aria-hidden="true" />
                    </Card>
                  </Link>

                  <Link to="/admin/features/cv-builder" className="group block">
                    <Card className="flex items-center justify-between gap-4 p-5 transition-colors group-hover:border-accent">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                          <FileText className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent">
                            {t('nav.featureCvBuilder')}
                          </h3>
                          <p className="text-xs text-text-secondary">
                            {t('dashboard.cvCardDesc')}
                          </p>
                        </div>
                      </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-text-secondary group-hover:text-accent" aria-hidden="true" />
                </Card>
              </Link>
            </div>

            {/* Recent Activity Log */}
            <Card className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                    <Activity className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span>{t('dashboard.recentActivityHeading')}</span>
                  </h2>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('dashboard.recentActivityNote')}
                  </p>
                </div>
                <Badge variant="success" mono>
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span>{activities.length}</span>
                </Badge>
              </div>

              <ul className="divide-y divide-border-default">
                  {
                    activities.slice(0, 8).map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-medium text-text-primary">
                            {pick(item.action)}
                          </p>
                          <p className="truncate text-xs text-text-secondary">
                            {pick(item.target)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={item.isSample ? 'muted' : 'success'} mono>
                            {item.isSample
                              ? t('dashboard.sampleTag')
                              : t('dashboard.sessionTag')}
                          </Badge>
                          <span className="font-mono text-[11px] text-text-secondary">
                            {pick(item.timestampLabel)}
                          </span>
                        </div>
                      </li>
                    ))
                  }
        </ul>
            </Card>
        </div>
        );
}
