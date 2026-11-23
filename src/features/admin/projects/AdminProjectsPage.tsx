import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { SPECIALIZATIONS } from '@/data';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import { ProjectEditorForm } from './ProjectEditorForm';
import type { Project } from '@/types/portfolio';

function createEmptyProject(nextOrder: number): Project {
  return {
    id: `proj-${Date.now()}`,
    slug: '',
    code: `PRJ-NEW-0${nextOrder}`,
    kind: 'engineering',
    kindLabel: { en: 'Engineering Project', ar: 'مشروع هندسي' },
    title: { en: '', ar: '' },
    shortDescription: { en: '', ar: '' },
    overview: { en: '', ar: '' },
    category: 'hvac-refrigeration',
    categoryLabel: { en: 'HVAC & Refrigeration', ar: 'التكييف والتبريد' },
    coverVariant: 'hvac',
    technologies: [],
    deliverables: [],
    statusLabel: { en: 'Session Draft', ar: 'مسودة جلسة' },
    featured: false,
    dataSource: 'cms',
    isEditable: true,
    displayOrder: nextOrder,
  };
}

export function AdminProjectsPage() {
  const { t } = useTranslation(['admin', 'pages']);
  const { pick } = useLanguage();
  useDocumentTitle(t('projects.pageTitle'));

  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, companies, saveProject, deleteProject } = useAdminData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'order' | 'title'>('order');
  const [editing, setEditing] = useState<{ project: Project; isNew: boolean } | null>(() =>
    searchParams.get('new') === '1'
      ? { project: createEmptyProject(projects.length + 1), isNew: true }
      : null
  );
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (typeFilter !== 'all' && p.kind !== typeFilter) return false;
      if (!q) return true;
      return [p.code, p.title.en, p.title.ar, ...p.technologies]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
    return sortBy === 'title'
      ? [...list].sort((a, b) => pick(a.title).localeCompare(pick(b.title)))
      : [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [projects, search, categoryFilter, typeFilter, sortBy, pick]);

  const startCreate = () => {
    setEditing({ project: createEmptyProject(projects.length + 1), isNew: true });
    if (searchParams.has('new')) setSearchParams({}, { replace: true });
  };

  const handleSave = (project: Project) => {
    saveProject(project);
    setEditing(null);
    setFeedback(t('prototype.savedInMemory'));
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    setFeedback(t('prototype.deletedInMemory'));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        actions={
          !editing && (
            <Button variant="primary" size="md" onClick={startCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t('projects.addButton')}</span>
            </Button>
          )
        }
      />

      <PrototypeBanner compact />

      {feedback && (
        <div role="status" className="rounded-xl border border-success/30 bg-success-subtle px-4 py-2.5 text-xs font-medium text-success">
          {feedback}
        </div>
      )}

      {editing ? (
        <ProjectEditorForm
          initial={editing.project}
          isNew={editing.isNew}
          companies={companies}
          allProjects={projects}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          {/* Filters Toolbar */}
          <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary ps-9 pe-3 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <select
              aria-label={t('projects.filterCategory')}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary lg:col-span-3"
            >
              <option value="all">{t('common.all')}</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {pick(spec.title)}
                </option>
              ))}
            </select>

            <select
              aria-label={t('projects.filterType')}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary lg:col-span-2"
            >
              <option value="all">{t('common.all')}</option>
              <option value="graduation">{t('pages:portfolio.kindGraduation')}</option>
              <option value="engineering">{t('pages:portfolio.kindEngineering')}</option>
              <option value="industrial">{t('pages:portfolio.kindIndustrial')}</option>
            </select>

            <select
              aria-label={t('projects.sortLabel')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'order' | 'title')}
              className="h-10 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary lg:col-span-2"
            >
              <option value="order">{t('projects.sortOrder')}</option>
              <option value="title">{t('projects.sortTitle')}</option>
            </select>
          </Card>

          {filtered.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-base font-semibold text-text-primary">
                {t('common.emptyTitle')}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {t('common.emptyDescription')}
              </p>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <Card className="hidden overflow-x-auto md:block">
                <table className="w-full text-start text-sm">
                  <thead className="border-b border-border-default bg-bg-elevated/60 font-mono text-[11px] uppercase text-text-secondary">
                    <tr>
                      <th className="px-4 py-3 text-start">{t('projects.columns.project')}</th>
                      <th className="px-4 py-3 text-start">{t('projects.columns.code')}</th>
                      <th className="px-4 py-3 text-start">{t('projects.columns.category')}</th>
                      <th className="px-4 py-3 text-start">{t('projects.columns.type')}</th>
                      <th className="px-4 py-3 text-start">{t('projects.columns.source')}</th>
                      <th className="px-4 py-3 text-start">{t('projects.columns.updated')}</th>
                      <th className="px-4 py-3 text-end">{t('projects.columns.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {filtered.map((project) => (
                      <tr key={project.id} className="hover:bg-bg-elevated/35">
                        <td className="max-w-xs px-4 py-3.5 font-medium text-text-primary">
                          <span className="line-clamp-1">{pick(project.title)}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">
                          {project.code}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-text-secondary">
                          {pick(project.categoryLabel)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="muted">{pick(project.kindLabel)}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={project.dataSource === 'cms' ? 'success' : 'accent'}
                            mono
                          >
                            {project.dataSource}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">
                          {project.updatedAt ?? t('projects.notAvailable')}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1">
                            <Link
                              to={`/portfolio/${project.slug}`}
                              aria-label={t('common.viewPublic')}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-accent"
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setEditing({ project, isNew: false })}
                              aria-label={t('common.edit')}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-accent cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(project)}
                              aria-label={t('common.delete')}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-error-subtle hover:text-error cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Mobile Card List */}
              <div className="space-y-3 md:hidden">
                {filtered.map((project) => (
                  <Card key={project.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] text-accent">{project.code}</p>
                        <h3 className="text-sm font-semibold text-text-primary">
                          {pick(project.title)}
                        </h3>
                      </div>
                      <Badge variant="muted" mono className="shrink-0">
                        {project.dataSource}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs text-text-secondary">
                      <span>{pick(project.categoryLabel)}</span>
                      <span>·</span>
                      <span>{pick(project.kindLabel)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t border-border-default pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditing({ project, isNew: false })}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('common.edit')}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(project)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('common.delete')}</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget ? pick(deleteTarget.title) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
