import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from 'lucide-react';
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
import type { ExperienceItem, ExperienceKind } from '@/types/portfolio';

function createEmptyExperience(order: number): ExperienceItem {
  return {
    id: `exp-${Date.now()}`,
    kind: 'employment',
    kindLabel: { en: 'Professional Role', ar: 'خبرة مهنية' },
    role: { en: '', ar: '' },
    company: { en: '', ar: '' },
    period: { en: '', ar: '' },
    startDate: '',
    endDate: '',
    isCurrent: false,
    responsibilities: [],
    relatedProjectSlugs: [],
    dataSource: 'cms',
    isEditable: true,
    displayOrder: order,
  };
}

export function AdminExperiencePage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('experience.pageTitle'));

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    experience,
    companies,
    projects,
    saveExperience,
    deleteExperience,
    reorderExperience,
  } = useAdminData();

  const [editing, setEditing] = useState<{ item: ExperienceItem; isNew: boolean } | null>(() =>
    searchParams.get('new') === '1'
      ? { item: createEmptyExperience(experience.length + 1), isNew: true }
      : null
  );
  const [deleteTarget, setDeleteTarget] = useState<ExperienceItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ordered = [...experience].sort((a, b) => a.displayOrder - b.displayOrder);

  const startCreate = () => {
    setEditing({ item: createEmptyExperience(experience.length + 1), isNew: true });
    setError(null);
    if (searchParams.has('new')) setSearchParams({}, { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { item } = editing;
    if (!item.role.en.trim() || !item.role.ar.trim() || !item.company.en.trim()) {
      setError(t('common.validationRequired'));
      return;
    }
    try {
      await saveExperience(item);
      setEditing(null);
      setFeedback(t('prototype.savedInMemory'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('experience.title')}
        subtitle={t('experience.subtitle')}
        actions={
          !editing && (
            <Button variant="primary" size="md" onClick={startCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t('experience.addButton')}</span>
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
              {editing.isNew ? t('experience.createHeading') : t('experience.editHeading')}
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
              idPrefix="exp-role"
              label={t('experience.fields.role')}
              required
              value={editing.item.role}
              onChange={(role) =>
                setEditing((p) => (p ? { ...p, item: { ...p.item, role } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="exp-company"
              label={t('experience.fields.company')}
              required
              value={editing.item.company}
              onChange={(company) =>
                setEditing((p) => (p ? { ...p, item: { ...p.item, company } } : null))
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="exp-kind" className="block text-xs font-medium text-text-primary">
                  {t('experience.fields.kind')}
                </label>
                <select
                  id="exp-kind"
                  value={editing.item.kind}
                  onChange={(e) => {
                    const kind = e.target.value as ExperienceKind;
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            item: {
                              ...p.item,
                              kind,
                              kindLabel:
                                kind === 'employment'
                                  ? { en: 'Professional Role', ar: 'خبرة مهنية' }
                                  : { en: 'Industrial Training', ar: 'تدريب صناعي' },
                            },
                          }
                        : null
                    );
                  }}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  <option value="employment">{t('experience.fields.kindEmployment')}</option>
                  <option value="training">{t('experience.fields.kindTraining')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="exp-comp-id" className="block text-xs font-medium text-text-primary">
                  {t('experience.fields.companyAssociation')}
                </label>
                <select
                  id="exp-comp-id"
                  value={editing.item.companyId ?? ''}
                  onChange={(e) =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            item: { ...p.item, companyId: e.target.value || undefined },
                          }
                        : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  <option value="">{t('experience.fields.noCompanyLink')}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {pick(c.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="exp-order" className="block text-xs font-medium text-text-primary">
                  {t('experience.fields.displayOrder')}
                </label>
                <input
                  id="exp-order"
                  type="number"
                  min={1}
                  value={editing.item.displayOrder}
                  onChange={(e) =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            item: {
                              ...p.item,
                              displayOrder: Math.max(1, Number(e.target.value) || 1),
                            },
                          }
                        : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="exp-start" className="block text-xs font-medium text-text-primary">
                  {t('experience.fields.startDate')}
                </label>
                <input
                  id="exp-start"
                  dir="ltr"
                  value={editing.item.startDate ?? ''}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, item: { ...p.item, startDate: e.target.value } } : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="exp-end" className="block text-xs font-medium text-text-primary">
                  {t('experience.fields.endDate')}
                </label>
                <input
                  id="exp-end"
                  dir="ltr"
                  disabled={Boolean(editing.item.isCurrent)}
                  value={editing.item.isCurrent ? '' : (editing.item.endDate ?? '')}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, item: { ...p.item, endDate: e.target.value } } : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary disabled:opacity-50"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.item.isCurrent)}
                    onChange={(e) =>
                      setEditing((p) =>
                        p
                          ? {
                              ...p,
                              item: {
                                ...p.item,
                                isCurrent: e.target.checked,
                                endDate: e.target.checked ? '' : p.item.endDate,
                              },
                            }
                          : null
                      )
                    }
                    className="h-4 w-4 rounded accent-accent"
                  />
                  <span>{t('experience.fields.isCurrent')}</span>
                </label>
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="exp-period"
              label={t('experience.fields.period')}
              value={editing.item.period}
              onChange={(period) =>
                setEditing((p) => (p ? { ...p, item: { ...p.item, period } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="exp-summary"
              label={t('experience.fields.summary')}
              multiline
              rows={2}
              value={editing.item.summary ?? { en: '', ar: '' }}
              onChange={(summary) =>
                setEditing((p) =>
                  p
                    ? {
                        ...p,
                        item: {
                          ...p.item,
                          summary: summary.en.trim() || summary.ar.trim() ? summary : undefined,
                        },
                      }
                    : null
                )
              }
            />

            {/* Responsibilities */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {t('experience.fields.responsibilities')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            item: {
                              ...p.item,
                              responsibilities: [
                                ...p.item.responsibilities,
                                { en: '', ar: '' },
                              ],
                            },
                          }
                        : null
                    )
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('experience.fields.addResponsibility')}</span>
                </Button>
              </div>
              {editing.item.responsibilities.map((resp, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-12">
                  <input
                    dir="ltr"
                    value={resp.en}
                    placeholder="EN"
                    onChange={(e) => {
                      const list = [...editing.item.responsibilities];
                      list[idx] = { ...resp, en: e.target.value };
                      setEditing((p) =>
                        p ? { ...p, item: { ...p.item, responsibilities: list } } : null
                      );
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <input
                    dir="rtl"
                    value={resp.ar}
                    placeholder="AR"
                    onChange={(e) => {
                      const list = [...editing.item.responsibilities];
                      list[idx] = { ...resp, ar: e.target.value };
                      setEditing((p) =>
                        p ? { ...p, item: { ...p.item, responsibilities: list } } : null
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
                              item: {
                                ...p.item,
                                responsibilities: p.item.responsibilities.filter(
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

            {/* Related Projects */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                {t('experience.fields.relatedProjects')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {projects.map((prj) => {
                  const checked = editing.item.relatedProjectSlugs.includes(prj.slug);
                  return (
                    <label
                      key={prj.id}
                      className="flex items-start gap-2 rounded-xl border border-border-default bg-bg-primary p-3 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const cur = editing.item.relatedProjectSlugs;
                          const next = e.target.checked
                            ? [...cur, prj.slug]
                            : cur.filter((s) => s !== prj.slug);
                          setEditing((p) =>
                            p ? { ...p, item: { ...p.item, relatedProjectSlugs: next } } : null
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
        <div className="space-y-4">
          {ordered.map((item, idx) => (
            <Card key={item.id} className="space-y-3 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.kind === 'employment' ? 'accent' : 'default'}>
                      {pick(item.kindLabel)}
                    </Badge>
                    <Badge variant="muted" mono>
                      #{item.displayOrder}
                    </Badge>
                    <span className="font-mono text-xs text-text-secondary">
                      {pick(item.period)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {pick(item.role)}
                  </h3>
                  <p className="text-sm text-text-secondary">{pick(item.company)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => reorderExperience(item.id, 'up')}
                    aria-label={t('common.moveUp')}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === ordered.length - 1}
                    onClick={() => reorderExperience(item.id, 'down')}
                    aria-label={t('common.moveDown')}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing({ item: structuredClone(item), isNew: false })}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('common.edit')}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('common.delete')}
                    onClick={() => setDeleteTarget(item)}
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {item.responsibilities.length > 0 && (
                <ul className="space-y-1 border-t border-border-default pt-3 text-xs text-text-secondary">
                  {item.responsibilities.map((r, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{pick(r)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget ? pick(deleteTarget.role) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          void deleteExperience(deleteTarget.id).then(() => {
            setDeleteTarget(null);
            setFeedback(t('prototype.deletedInMemory'));
          }).catch(() => setDeleteTarget(null));
        }}
      />
    </div>
  );
}
