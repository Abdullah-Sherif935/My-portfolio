import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import { resolvePortfolioCategories } from '@/utils/specializationHelpers';
import { ProjectEditorForm } from './ProjectEditorForm';
import type { Project, SpecializationId } from '@/types/portfolio';

interface AdminProjectsPageProps {
  onSaved?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

function createEmptyProject(
  nextOrder: number,
  defaultCategoryId: string,
  defaultCategoryLabel: { en: string; ar: string }
): Project {
  return {
    id: `proj-${Date.now().toString(36)}`,
    slug: '',
    code: `PRJ-NEW-${String(nextOrder).padStart(2, '0')}`,
    kind: 'industrial',
    kindLabel: { en: 'Professional Project', ar: 'مشروع مهني' },
    projectGroup: 'professional',
    title: { en: '', ar: '' },
    shortDescription: { en: '', ar: '' },
    overview: { en: '', ar: '' },
    category: (defaultCategoryId as SpecializationId) || 'mechanical-design',
    categoryLabel: defaultCategoryLabel,
    categoryIds: [defaultCategoryId || 'mechanical-design'],
    startDate: null,
    completionDate: null,
    coverVariant: 'mechanical',
    technologies: [],
    deliverables: [],
    contributions: [],
    attachments: [],
    viewerConfig: null,
    seoMeta: null,
    statusLabel: { en: 'Completed', ar: 'مكتمل' },
    featured: false,
    isPublished: true,
    dataSource: 'cms',
    isEditable: true,
    displayOrder: nextOrder,
  };
}

export function AdminProjectsPage({
  onSaved,
  onDirtyChange,
}: AdminProjectsPageProps = {}) {
  const { t } = useTranslation(['admin', 'pages']);
  const { pick } = useLanguage();
  useDocumentTitle(t('projects.pageTitle'));

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    projects,
    companies,
    specializations,
    saveProject,
    deleteProject,
    reorderProject,
    toggleProjectPublished,
    duplicateProject,
    isSaving,
  } = useAdminData();

  const dynamicCategories = useMemo(
    () => resolvePortfolioCategories(specializations, projects),
    [specializations, projects]
  );

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'title'>('order');
  const [editing, setEditing] = useState<{ project: Project; isNew: boolean } | null>(() =>
    searchParams.get('new') === '1'
      ? {
          project: createEmptyProject(
            projects.length + 1,
            dynamicCategories[0]?.id ?? 'mechanical-design',
            dynamicCategories[0]?.label ?? { en: 'Mechanical Design', ar: 'التصميم الميكانيكي' }
          ),
          isNew: true,
        }
      : null
  );
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (categoryFilter !== 'all') {
        const cats = p.categoryIds?.length ? p.categoryIds : [p.category];
        if (!cats.includes(categoryFilter) && p.category !== categoryFilter) {
          return false;
        }
      }
      if (groupFilter !== 'all' && (p.projectGroup ?? 'academic') !== groupFilter) {
        return false;
      }
      if (statusFilter === 'published' && p.isPublished === false) return false;
      if (statusFilter === 'draft' && p.isPublished !== false) return false;
      if (!q) return true;
      return [p.code, p.slug, p.title.en, p.title.ar, ...p.technologies]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
    return sortBy === 'title'
      ? [...list].sort((a, b) => pick(a.title).localeCompare(pick(b.title)))
      : [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [projects, search, categoryFilter, groupFilter, statusFilter, sortBy, pick]);

  const startCreate = () => {
    const firstCat = dynamicCategories[0];
    setEditing({
      project: createEmptyProject(
        projects.length + 1,
        firstCat?.id ?? 'mechanical-design',
        firstCat?.label ?? { en: 'Mechanical Design', ar: 'التصميم الميكانيكي' }
      ),
      isNew: true,
    });
    if (searchParams.has('new')) setSearchParams({}, { replace: true });
  };

  const handleSave = async (project: Project) => {
    try {
      await saveProject(project);
      setEditing(null);
      setFeedback(t('prototype.savedInMemory'));
      onSaved?.();
    } catch {
      // Error displayed by PrototypeBanner
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback(t('prototype.deletedInMemory'));
      onSaved?.();
    } catch {
      setDeleteTarget(null);
    }
  };

  const handleTogglePublished = async (id: string) => {
    try {
      await toggleProjectPublished(id);
      setFeedback(t('prototype.savedInMemory'));
      onSaved?.();
    } catch {
      // handled
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProject(id);
      setFeedback(t('projects.duplicatedFeedback'));
      onSaved?.();
    } catch {
      // handled
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      await reorderProject(id, direction);
      onSaved?.();
    } catch {
      // handled
    }
  };

  const groupLabelKey = (group?: Project['projectGroup']) => {
    if (group === 'professional') return 'projects.groups.professional';
    if (group === 'personal') return 'projects.groups.personal';
    return 'projects.groups.academic';
  };

  return (
    <div className="space-y-5">
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
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success-subtle px-4 py-2.5 text-xs font-medium text-success"
        >
          {feedback}
        </div>
      )}

      {editing ? (
        <ProjectEditorForm
          initial={editing.project}
          isNew={editing.isNew}
          companies={companies}
          allProjects={projects}
          onSave={(project) => void handleSave(project)}
          onCancel={() => setEditing(null)}
          onDirtyChange={onDirtyChange}
        />
      ) : (
        <>
          {/* Filters Toolbar */}
          <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-12">
            <div className="relative lg:col-span-4">
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
              {dynamicCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {pick(cat.label)}
                </option>
              ))}
            </select>

            <select
              aria-label={t('projects.filterType')}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="h-10 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary lg:col-span-2"
            >
              <option value="all">{t('common.all')}</option>
              <option value="professional">{t('projects.groups.professional')}</option>
              <option value="academic">{t('projects.groups.academic')}</option>
              <option value="personal">{t('projects.groups.personal')}</option>
            </select>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'published' | 'draft')
              }
              className="h-10 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary lg:col-span-2"
            >
              <option value="all">{t('common.all')}</option>
              <option value="published">{t('common.visible')}</option>
              <option value="draft">{t('projects.draftBadge')}</option>
            </select>

            <select
              aria-label={t('projects.sortLabel')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'order' | 'title')}
              className="h-10 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary lg:col-span-1"
            >
              <option value="order">#</option>
              <option value="title">A–Z</option>
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
            <Card className="divide-y divide-border-default">
              {filtered.map((project, idx) => {
                const published = project.isPublished !== false;
                const assignedCatIds =
                  project.categoryIds && project.categoryIds.length > 0
                    ? project.categoryIds
                    : [project.category];
                return (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      {project.coverImageUrl ? (
                        <img
                          src={project.coverImageUrl}
                          alt=""
                          className="h-14 w-20 shrink-0 rounded-lg border border-border-default object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-primary font-mono text-[11px] text-text-secondary">
                          {project.code}
                        </div>
                      )}
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="muted" mono>
                            {project.code}
                          </Badge>
                          <Badge variant={published ? 'accent' : 'default'}>
                            {published ? t('common.visible') : t('projects.draftBadge')}
                          </Badge>
                          <Badge variant="muted">
                            {t(groupLabelKey(project.projectGroup))}
                          </Badge>
                          {project.featured && (
                            <Badge variant="accent">
                              <Star className="me-1 inline h-3 w-3" aria-hidden="true" />
                              {t('homeMgr.featuredActive')}
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {pick(project.title)}
                        </p>
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-text-secondary">
                          {assignedCatIds.map((catId) => {
                            const cat = dynamicCategories.find((c) => c.id === catId);
                            return (
                              <span
                                key={catId}
                                className="rounded bg-bg-primary px-1.5 py-0.5 border border-border-default"
                              >
                                {cat ? pick(cat.label) : catId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {sortBy === 'order' && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSaving || idx === 0}
                            onClick={() => void handleReorder(project.id, 'up')}
                            aria-label={t('common.moveUp')}
                          >
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSaving || idx === filtered.length - 1}
                            onClick={() => void handleReorder(project.id, 'down')}
                            aria-label={t('common.moveDown')}
                          >
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </>
                      )}

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => void handleTogglePublished(project.id)}
                        aria-label={
                          published
                            ? t('projects.unpublishAction')
                            : t('projects.publishAction')
                        }
                      >
                        {published ? (
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => void handleDuplicate(project.id)}
                        aria-label={t('projects.duplicateAction')}
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => setEditing({ project, isNew: false })}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('common.edit')}</span>
                      </Button>

                      {published && (
                        <a
                          href={`/portfolio/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent"
                          aria-label={t('common.viewPublic')}
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => setDeleteTarget(project)}
                        aria-label={t('common.delete')}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        itemName={deleteTarget ? pick(deleteTarget.title) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
