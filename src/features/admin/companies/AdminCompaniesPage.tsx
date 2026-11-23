import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
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
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import type {
  Company,
  CompanyRelationshipCategory,
  DataSource,
} from '@/types/portfolio';

const RELATIONSHIP_CATEGORIES: CompanyRelationshipCategory[] = [
  'employer',
  'client',
  'contractor',
  'training',
  'partner',
  'unconfirmed',
];

function createEmptyCompany(order: number): Company {
  return {
    id: `comp-${Date.now()}`,
    slug: '',
    name: { en: '', ar: '' },
    monogram: 'CO',
    logoUrl: null,
    industry: { en: '', ar: '' },
    relationshipCategory: 'unconfirmed',
    relationshipType: { en: 'Unconfirmed Relationship', ar: 'علاقة غير مؤكدة' },
    servicesProvided: [],
    relatedProjectSlugs: [],
    dataSource: 'placeholder',
    isEditable: true,
    displayOrder: order,
  };
}

export function AdminCompaniesPage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('companies.pageTitle'));

  const [searchParams, setSearchParams] = useSearchParams();
  const { companies, projects, experience, saveCompany, deleteCompany } = useAdminData();

  const [search, setSearch] = useState('');
  const [relFilter, setRelFilter] = useState<string>('all');
  const [editing, setEditing] = useState<{
    company: Company;
    linkedExpIds: string[];
    isNew: boolean;
  } | null>(() =>
    searchParams.get('new') === '1'
      ? { company: createEmptyCompany(companies.length + 1), linkedExpIds: [], isNew: true }
      : null
  );
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      const cat = c.relationshipCategory ?? 'unconfirmed';
      if (relFilter !== 'all' && cat !== relFilter) return false;
      if (!q) return true;
      return [c.name.en, c.name.ar, c.industry.en, c.industry.ar]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [companies, search, relFilter]);

  const startEdit = (company: Company) => {
    const linkedExpIds = experience
      .filter((e) => e.companyId === company.id)
      .map((e) => e.id);
    setEditing({ company: structuredClone(company), linkedExpIds, isNew: false });
    setError(null);
  };

  const startCreate = () => {
    setEditing({
      company: createEmptyCompany(companies.length + 1),
      linkedExpIds: [],
      isNew: true,
    });
    setError(null);
    if (searchParams.has('new')) setSearchParams({}, { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { company, linkedExpIds } = editing;
    if (!company.name.en.trim() || !company.name.ar.trim() || !company.slug.trim()) {
      setError(t('common.validationRequired'));
      return;
    }
    try {
      await saveCompany(
        {
          ...company,
          slug: company.slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-'),
        },
        linkedExpIds
      );
      setEditing(null);
      setFeedback(t('prototype.savedInMemory'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('companies.title')}
        subtitle={t('companies.subtitle')}
        actions={
          !editing && (
            <Button variant="primary" size="md" onClick={startCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t('companies.addButton')}</span>
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
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {editing.isNew ? t('companies.createHeading') : t('companies.editHeading')}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label={t('common.close')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-error/40 bg-error-subtle px-4 py-2.5 text-xs text-error">
              {error}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <LocalizedFieldGroup
              idPrefix="comp-name"
              label={t('companies.fields.name')}
              required
              value={editing.company.name}
              onChange={(name) =>
                setEditing((p) => (p ? { ...p, company: { ...p.company, name } } : null))
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label htmlFor="comp-slug" className="block text-xs font-medium text-text-primary">
                  {t('companies.fields.slug')} *
                </label>
                <input
                  id="comp-slug"
                  dir="ltr"
                  value={editing.company.slug}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, company: { ...p.company, slug: e.target.value } } : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="comp-mono" className="block text-xs font-medium text-text-primary">
                  {t('companies.fields.monogram')}
                </label>
                <input
                  id="comp-mono"
                  dir="ltr"
                  maxLength={3}
                  value={editing.company.monogram}
                  onChange={(e) =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            company: { ...p.company, monogram: e.target.value.toUpperCase() },
                          }
                        : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="comp-rel-cat" className="block text-xs font-medium text-text-primary">
                  {t('companies.fields.relationshipCategory')}
                </label>
                <select
                  id="comp-rel-cat"
                  value={editing.company.relationshipCategory ?? 'unconfirmed'}
                  onChange={(e) =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            company: {
                              ...p.company,
                              relationshipCategory: e.target
                                .value as CompanyRelationshipCategory,
                            },
                          }
                        : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  {RELATIONSHIP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`companies.relationships.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="comp-source" className="block text-xs font-medium text-text-primary">
                  {t('companies.fields.dataSource')}
                </label>
                <select
                  id="comp-source"
                  value={editing.company.dataSource}
                  onChange={(e) =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            company: {
                              ...p.company,
                              dataSource: e.target.value as DataSource,
                            },
                          }
                        : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  <option value="placeholder">{t('common.sourcePlaceholder')}</option>
                  <option value="cv-initial">{t('common.sourceCvInitial')}</option>
                  <option value="cms">{t('common.sourceCms')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="comp-logo" className="block text-xs font-medium text-text-primary">
                {t('companies.fields.logoUrl')}
              </label>
              <input
                id="comp-logo"
                dir="ltr"
                value={editing.company.logoUrl ?? ''}
                onChange={(e) =>
                  setEditing((p) =>
                    p
                      ? {
                          ...p,
                          company: {
                            ...p.company,
                            logoUrl: e.target.value.trim() ? e.target.value : null,
                          },
                        }
                      : null
                  )
                }
                className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
              />
            </div>

            <LocalizedFieldGroup
              idPrefix="comp-industry"
              label={t('companies.fields.industry')}
              value={editing.company.industry}
              onChange={(industry) =>
                setEditing((p) => (p ? { ...p, company: { ...p.company, industry } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="comp-rel-label"
              label={t('companies.fields.relationshipType')}
              value={editing.company.relationshipType}
              onChange={(relationshipType) =>
                setEditing((p) =>
                  p ? { ...p, company: { ...p.company, relationshipType } } : null
                )
              }
            />

            <LocalizedFieldGroup
              idPrefix="comp-overview"
              label={t('companies.fields.overview')}
              multiline
              rows={3}
              value={editing.company.overview ?? { en: '', ar: '' }}
              onChange={(overview) =>
                setEditing((p) =>
                  p
                    ? {
                        ...p,
                        company: {
                          ...p.company,
                          overview:
                            overview.en.trim() || overview.ar.trim() ? overview : undefined,
                        },
                      }
                    : null
                )
              }
            />

            {/* Services */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {t('companies.fields.services')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            company: {
                              ...p.company,
                              servicesProvided: [
                                ...p.company.servicesProvided,
                                { en: '', ar: '' },
                              ],
                            },
                          }
                        : null
                    )
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('companies.fields.addService')}</span>
                </Button>
              </div>
              {editing.company.servicesProvided.map((srv, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-12">
                  <input
                    dir="ltr"
                    value={srv.en}
                    placeholder="EN"
                    onChange={(e) => {
                      const list = [...editing.company.servicesProvided];
                      list[idx] = { ...srv, en: e.target.value };
                      setEditing((p) =>
                        p ? { ...p, company: { ...p.company, servicesProvided: list } } : null
                      );
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <input
                    dir="rtl"
                    value={srv.ar}
                    placeholder="AR"
                    onChange={(e) => {
                      const list = [...editing.company.servicesProvided];
                      list[idx] = { ...srv, ar: e.target.value };
                      setEditing((p) =>
                        p ? { ...p, company: { ...p.company, servicesProvided: list } } : null
                      );
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditing((p) =>
                        p
                          ? {
                              ...p,
                              company: {
                                ...p.company,
                                servicesProvided: p.company.servicesProvided.filter(
                                  (_, i) => i !== idx
                                ),
                              },
                            }
                          : null
                      )
                    }
                    className="text-error hover:text-error sm:col-span-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Linked Projects */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                {t('companies.fields.linkedProjects')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {projects.map((prj) => {
                  const checked = editing.company.relatedProjectSlugs.includes(prj.slug);
                  return (
                    <label
                      key={prj.id}
                      className="flex items-start gap-2 rounded-xl border border-border-default bg-bg-primary p-3 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const cur = editing.company.relatedProjectSlugs;
                          const next = e.target.checked
                            ? [...cur, prj.slug]
                            : cur.filter((s) => s !== prj.slug);
                          setEditing((p) =>
                            p ? { ...p, company: { ...p.company, relatedProjectSlugs: next } } : null
                          );
                        }}
                        className="mt-0.5 h-4 w-4 rounded accent-accent"
                      />
                      <span className="text-text-primary">{pick(prj.title)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Linked Experience */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                {t('companies.fields.linkedExperience')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {experience.map((exp) => {
                  const checked = editing.linkedExpIds.includes(exp.id);
                  return (
                    <label
                      key={exp.id}
                      className="flex items-start gap-2 rounded-xl border border-border-default bg-bg-primary p-3 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...editing.linkedExpIds, exp.id]
                            : editing.linkedExpIds.filter((id) => id !== exp.id);
                          setEditing((p) => (p ? { ...p, linkedExpIds: next } : null));
                        }}
                        className="mt-0.5 h-4 w-4 rounded accent-accent"
                      />
                      <span>
                        <span className="block font-medium text-text-primary">
                          {pick(exp.role)}
                        </span>
                        <span className="text-text-secondary">{pick(exp.company)}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border-default pt-4">
              <Button variant="secondary" size="md" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" size="md">
                {editing.isNew ? t('common.create') : t('common.save')}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <>
          <Card className="grid gap-3 p-4 sm:grid-cols-12">
            <div className="relative sm:col-span-7">
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
              aria-label={t('companies.filterRelationship')}
              value={relFilter}
              onChange={(e) => setRelFilter(e.target.value)}
              className="h-10 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
            >
              <option value="all">{t('common.all')}</option>
              {RELATIONSHIP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`companies.relationships.${cat}`)}
                </option>
              ))}
            </select>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((company) => {
              const relCat = company.relationshipCategory ?? 'unconfirmed';
              return (
                <Card key={company.id} className="flex flex-col justify-between gap-4 p-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-bg-elevated font-mono text-xs font-bold text-accent">
                          {company.monogram}
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-text-primary">
                            {pick(company.name)}
                          </h3>
                          <p className="text-xs text-text-secondary">
                            {pick(company.industry)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="muted" mono>
                        {company.dataSource}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={relCat === 'unconfirmed' ? 'outline' : 'accent'}>
                        {t(`companies.relationships.${relCat}`)}
                      </Badge>
                      <Badge variant="muted">
                        {t('companies.fields.linkedProjects')}: {company.relatedProjectSlugs.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-default pt-3">
                    <Link
                      to={`/companies/${company.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t('common.viewPublic')}</span>
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(company)}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('common.edit')}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('common.delete')}
                        onClick={() => setDeleteTarget(company)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget ? pick(deleteTarget.name) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          void deleteCompany(deleteTarget.id).then(() => {
            setDeleteTarget(null);
            setFeedback(t('prototype.deletedInMemory'));
          }).catch(() => setDeleteTarget(null));
        }}
      />
    </div>
  );
}
