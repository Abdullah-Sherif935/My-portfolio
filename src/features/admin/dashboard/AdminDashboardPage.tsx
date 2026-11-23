import { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  FolderKanban,
  Plus,
  Sliders,
  UserRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
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
    activities,
    reloadWorkspace,
  } = useAdminData();

  const [resetMessage, setResetMessage] = useState(false);

  // Calculated strictly from actual in-memory records
  const readiness = useMemo(() => {
    const checks = [
      Boolean(profile.fullName.en && profile.fullName.ar),
      Boolean(profile.headline.en && profile.headline.ar),
      Boolean(profile.summary.en && profile.summary.ar),
      Boolean(profile.avatarUrl),
      Boolean(profile.contact.email),
      education.length > 0,
      experience.length > 0,
      projects.length > 0,
      skills.length > 0,
      certifications.length > 0,
    ];
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
  }, [profile, education, experience, projects, skills, certifications]);

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
      cvInitial: allRecords.filter((r) => r.dataSource === 'cv-initial').length,
      placeholder: allRecords.filter((r) => r.dataSource === 'placeholder').length,
      cms: allRecords.filter((r) => r.dataSource === 'cms').length,
      total: allRecords.length,
    };
  }, [projects, companies, experience, education, skills, certifications]);

  const stats = [
    {
      label: t('dashboard.stats.projects'),
      value: String(projects.length),
      icon: FolderKanban,
      to: '/admin/projects',
    },
    {
      label: t('dashboard.stats.companies'),
      value: String(companies.length),
      icon: Building2,
      to: '/admin/companies',
    },
    {
      label: t('dashboard.stats.experience'),
      value: String(experience.length),
      icon: Briefcase,
      to: '/admin/experience',
    },
    {
      label: t('dashboard.stats.skills'),
      value: String(skills.length),
      icon: Sliders,
      to: '/admin/skills',
    },
    {
      label: t('dashboard.stats.certifications'),
      value: String(certifications.length),
      icon: Award,
      to: '/admin/certifications',
    },
    {
      label: t('dashboard.stats.readiness'),
      value: `${readiness}%`,
      icon: CheckCircle2,
      to: '/admin/profile',
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-text-secondary">
                    {stat.label}
                  </p>
                  <p className="font-mono text-2xl font-bold text-text-primary sm:text-3xl">
                    {stat.value}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-text-secondary">{t('dashboard.readinessHint')}</p>

      {/* Quick Actions + Content Data-Source Breakdown */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="space-y-4 p-5 sm:p-6 lg:col-span-5">
          <h2 className="text-base font-semibold text-text-primary">
            {t('dashboard.quickActionsHeading')}
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            <ButtonLink to="/admin/projects?new=1" variant="primary" size="md" className="justify-start">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t('dashboard.quickActions.addProject')}</span>
            </ButtonLink>
            <ButtonLink to="/admin/companies?new=1" variant="secondary" size="md" className="justify-start">
              <Building2 className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{t('dashboard.quickActions.addCompany')}</span>
            </ButtonLink>
            <ButtonLink to="/admin/experience?new=1" variant="secondary" size="md" className="justify-start">
              <Briefcase className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{t('dashboard.quickActions.addExperience')}</span>
            </ButtonLink>
            <ButtonLink to="/admin/profile" variant="outline" size="md" className="justify-start">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span>{t('dashboard.quickActions.editProfile')}</span>
            </ButtonLink>
          </div>
        </Card>

        <Card className="space-y-4 p-5 sm:p-6 lg:col-span-7">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              {t('dashboard.contentOverviewHeading')}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {t('dashboard.contentOverviewNote')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border-default bg-bg-primary p-4">
              <p className="font-mono text-[11px] uppercase text-text-secondary">
                {t('common.sourceCvInitial')}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-text-primary">
                {sourceBreakdown.cvInitial}
              </p>
            </div>
            <div className="rounded-xl border border-border-default bg-bg-primary p-4">
              <p className="font-mono text-[11px] uppercase text-text-secondary">
                {t('common.sourcePlaceholder')}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-accent">
                {sourceBreakdown.placeholder}
              </p>
            </div>
            <div className="rounded-xl border border-border-default bg-bg-primary p-4">
              <p className="font-mono text-[11px] uppercase text-text-secondary">
                {t('common.sourceCms')}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-success">
                {sourceBreakdown.cms}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity (Explicitly Labeled Sample vs Session Entries) */}
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
        </div>

        <ul className="divide-y divide-border-default">
          {activities.map((item) => (
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
          ))}
        </ul>
      </Card>
    </div>
  );
}
