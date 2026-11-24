import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
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
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import { CompanyEditorForm } from './CompanyEditorForm';
import type { Company } from '@/types/portfolio';
import { cn } from '@/utils/cn';

type PublishFilter = 'all' | 'published' | 'draft';

interface AdminCompaniesPageProps {
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
}

function createEmptyCompany(order: number): Company {
  return {
    id: `comp-${Date.now()}`,
    slug: '',
    name: { en: '', ar: '' },
    monogram: 'CO',
    logoUrl: null,
    logoStoragePath: null,
    coverImageUrl: null,
    coverStoragePath: null,
    industry: { en: '', ar: '' },
    relationshipCategory: 'client',
    relationshipType: { en: 'Client', ar: 'عميل' },
    featured: false,
    isPublished: true,
    servicesProvided: [],
    relatedProjectSlugs: [],
    dataSource: 'cms',
    isEditable: true,
    displayOrder: order,
  };
}

export function AdminCompaniesPage({
  onDirtyChange,
  onSaved,
}: AdminCompaniesPageProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('companies.pageTitle'));

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    companies,
    projects,
    isSaving,
    saveCompany,
    deleteCompany,
    reorderCompany,
    toggleCompanyPublished,
    duplicateCompany,
  } = useAdminData();

  const [search, setSearch] = useState('');
  const [relFilter, setRelFilter] = useState<string>('all');
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all');

  const [editing, setEditing] = useState<{
    company: Company;
    linkedProjectIds: string[];
    isNew: boolean;
  } | null>(() =>
    searchParams.get('new') === '1'
      ? {
          company: createEmptyCompany(companies.length + 1),
          linkedProjectIds: [],
          isNew: true,
        }
      : null
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    company: Company;
    linkedProjectCount: number;
  } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const notifySaved = (msg?: string) => {
    setFeedback(msg ?? t('prototype.savedInMemory'));
    onDirtyChange?.(false);
    onSaved?.();
  };

  const getCompanyProjects = (company: Company) =>
    projects.filter(
      (p) =>
        p.companyId === company.id ||
        company.relatedProjectSlugs.includes(p.slug)
    );

  const ordered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...companies]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .filter((c) => {
        if (publishFilter === 'published' && c.isPublished === false) return false;
        if (publishFilter === 'draft' && c.isPublished !== false) return false;
        const cat = c.relationshipCategory ?? 'unconfirmed';
        if (relFilter !== 'all' && cat !== relFilter) return false;
        if (!q) return true;
        return `${c.name.en} ${c.name.ar} ${c.industry.en} ${c.industry.ar} ${c.slug}`
          .toLowerCase()
          .includes(q);
      });
  }, [companies, search, relFilter, publishFilter]);

  const startCreate = () => {
    setFeedback(null);
    if (searchParams.has('new')) setSearchParams({}, { replace: true });
    setEditing({
      company: createEmptyCompany(companies.length + 1),
      linkedProjectIds: [],
      isNew: true,
    });
  };

  const startEdit = (company: Company) => {
    setFeedback(null);
    const linkedIds = getCompanyProjects(company).map((p) => p.id);
    setEditing({
      company: structuredClone(company),
      linkedProjectIds: linkedIds,
      isNew: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCompany(deleteTarget.company.id);
    setDeleteTarget(null);
    notifySaved(t('common.deletedFeedback'));
  };

  return (
    <div className="space-y-5">
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
        <CompanyEditorForm
          initial={editing.company}
          initialProjectIds={editing.linkedProjectIds}
          isNew={editing.isNew}
          onDirtyChange={onDirtyChange}
          onCancel={() => {
            setEditing(null);
            onDirtyChange?.(false);
          }}
          onSave={async (saved, linkedProjectIds) => {
            await saveCompany(saved, undefined, linkedProjectIds);
            setEditing(null);
            notifySaved();
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary"
                  aria-hidden="true"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('common.searchPlaceholder')}
                  className="h-9 w-full rounded-[10px] border border-border-default bg-bg-secondary ps-9 pe-3 text-xs text-text-primary"
                />
              </div>

              <select
                value={relFilter}
                onChange={(e) => setRelFilter(e.target.value)}
                aria-label={t('companies.filterRelationship')}
                className="h-9 rounded-[10px] border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
              >
                <option value="all">{t('common.all')}</option>
                <option value="client">{t('companiesCms.relationships.client')}</option>
                <option value="project-client">
                  {t('companiesCms.relationships.project-client')}
                </option>
                <option value="industrial-partner">
                  {t('companiesCms.relationships.industrial-partner')}
                </option>
                <option value="partner">{t('companiesCms.relationships.partner')}</option>
                <option value="contractor">
                  {t('companiesCms.relationships.contractor')}
                </option>
                <option value="other">{t('companiesCms.relationships.other')}</option>
                <option value="unconfirmed">
                  {t('companiesCms.relationships.unconfirmed')}
                </option>
              </select>

              <div className="flex items-center gap-1">
                {(['all', 'published', 'draft'] as PublishFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setPublishFilter(f)}
                    className={cn(
                      'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                      publishFilter === f
                        ? 'border-accent bg-accent-subtle text-accent'
                        : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {t(`experienceCms.filters.${f}`)}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="primary" size="sm" onClick={startCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t('companies.addButton')}</span>
            </Button>
          </div>

          {ordered.length === 0 ? (
            <Card className="p-8 text-center text-xs text-text-secondary">
              {t('common.emptyTitle')}
            </Card>
          ) : (
            <div className="space-y-3">
              {ordered.map((company, idx) => {
                const linked = getCompanyProjects(company);
                return (
                  <Card
                    key={company.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={pick(company.name)}
                          className="h-12 w-12 shrink-0 rounded-xl border border-border-default bg-bg-primary object-contain p-1.5"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-bg-elevated font-mono text-sm font-semibold text-accent">
                          {company.monogram}
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="muted" mono>
                            #{company.displayOrder}
                          </Badge>
                          <Badge
                            variant={
                              company.isPublished !== false ? 'accent' : 'default'
                            }
                          >
                            {company.isPublished !== false
                              ? t('common.visible')
                              : t('projects.draftBadge')}
                          </Badge>
                          {company.featured && (
                            <Badge variant="accent">
                              <Star className="me-1 inline h-3 w-3" />
                              {t('companiesCms.featuredBadge')}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {pick(company.relationshipType)}
                          </Badge>
                        </div>

                        <h3 className="truncate text-sm font-semibold text-text-primary sm:text-base">
                          {pick(company.name)}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-secondary">
                          {pick(company.industry).trim() && (
                            <span>{pick(company.industry)}</span>
                          )}
                          <span className="inline-flex items-center gap-1 text-accent">
                            <FolderKanban className="h-3 w-3" />
                            {linked.length} {t('companies.fields.linkedProjects')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0 || isSaving}
                        onClick={() => void reorderCompany(company.id, 'up')}
                        aria-label={t('common.moveUp')}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === ordered.length - 1 || isSaving}
                        onClick={() => void reorderCompany(company.id, 'down')}
                        aria-label={t('common.moveDown')}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSaving}
                        onClick={async () => {
                          await toggleCompanyPublished(company.id);
                          notifySaved();
                        }}
                        aria-label={
                          company.isPublished !== false
                            ? t('projects.unpublishAction')
                            : t('projects.publishAction')
                        }
                      >
                        {company.isPublished !== false ? (
                          <Eye className="h-3.5 w-3.5 text-accent" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-text-secondary" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSaving}
                        onClick={async () => {
                          await duplicateCompany(company.id);
                          notifySaved();
                        }}
                        aria-label={t('projects.duplicateAction')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {company.isPublished !== false && (
                        <a
                          href={`/companies/${company.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t('common.viewPublic')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-accent"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(company)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>{t('common.edit')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteTarget({
                            company,
                            linkedProjectCount: linked.length,
                          })
                        }
                        aria-label={t('common.delete')}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={
          deleteTarget
            ? deleteTarget.linkedProjectCount > 0
              ? `${pick(deleteTarget.company.name)} (${deleteTarget.linkedProjectCount} linked projects will be safely unlinked)`
              : pick(deleteTarget.company.name)
            : ''
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
