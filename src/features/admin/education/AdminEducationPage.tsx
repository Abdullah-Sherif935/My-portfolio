import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
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
import type { EducationItem } from '@/types/portfolio';

function createEmptyEducation(order: number): EducationItem {
  return {
    id: `edu-${Date.now()}`,
    degree: { en: '', ar: '' },
    fieldOfStudy: { en: '', ar: '' },
    institution: { en: '', ar: '' },
    startYear: '',
    graduationYear: '',
    period: { en: '', ar: '' },
    grade: { en: '', ar: '' },
    classification: { en: '', ar: '' },
    coursework: [],
    dataSource: 'cms',
    isEditable: true,
    displayOrder: order,
  };
}

export function AdminEducationPage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('education.pageTitle'));

  const { education, projects, saveEducation, deleteEducation } = useAdminData();
  const [editing, setEditing] = useState<{ item: EducationItem; isNew: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EducationItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { item } = editing;
    if (!item.degree.en.trim() || !item.degree.ar.trim() || !item.institution.en.trim()) {
      setError(t('common.validationRequired'));
      return;
    }
    try {
      await saveEducation(item);
      setEditing(null);
      setFeedback(t('prototype.savedInMemory'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('education.title')}
        subtitle={t('education.subtitle')}
        actions={
          !editing && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditing({ item: createEmptyEducation(education.length + 1), isNew: true });
                setError(null);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t('education.addButton')}</span>
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
              {editing.isNew ? t('education.createHeading') : t('education.editHeading')}
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
              idPrefix="edu-degree"
              label={t('education.fields.degree')}
              required
              value={editing.item.degree}
              onChange={(degree) =>
                setEditing((p) => (p ? { ...p, item: { ...p.item, degree } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="edu-field"
              label={t('education.fields.fieldOfStudy')}
              value={editing.item.fieldOfStudy ?? { en: '', ar: '' }}
              onChange={(fieldOfStudy) =>
                setEditing((p) =>
                  p
                    ? {
                        ...p,
                        item: {
                          ...p.item,
                          fieldOfStudy:
                            fieldOfStudy.en.trim() || fieldOfStudy.ar.trim()
                              ? fieldOfStudy
                              : undefined,
                        },
                      }
                    : null
                )
              }
            />

            <LocalizedFieldGroup
              idPrefix="edu-inst"
              label={t('education.fields.institution')}
              required
              value={editing.item.institution}
              onChange={(institution) =>
                setEditing((p) => (p ? { ...p, item: { ...p.item, institution } } : null))
              }
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="edu-start" className="block text-xs font-medium text-text-primary">
                  {t('education.fields.startYear')}
                </label>
                <input
                  id="edu-start"
                  dir="ltr"
                  value={editing.item.startYear ?? ''}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, item: { ...p.item, startYear: e.target.value } } : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edu-grad" className="block text-xs font-medium text-text-primary">
                  {t('education.fields.graduationYear')}
                </label>
                <input
                  id="edu-grad"
                  dir="ltr"
                  value={editing.item.graduationYear}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, item: { ...p.item, graduationYear: e.target.value } } : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edu-proj" className="block text-xs font-medium text-text-primary">
                  {t('education.fields.graduationProject')}
                </label>
                <select
                  id="edu-proj"
                  value={editing.item.graduationProjectSlug ?? ''}
                  onChange={(e) =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            item: {
                              ...p.item,
                              graduationProjectSlug: e.target.value || undefined,
                            },
                          }
                        : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  <option value="">{t('education.fields.noGraduationProject')}</option>
                  {projects.map((prj) => (
                    <option key={prj.id} value={prj.slug}>
                      {pick(prj.title)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="edu-period"
              label={t('education.fields.period')}
              value={editing.item.period}
              onChange={(period) =>
                setEditing((p) => (p ? { ...p, item: { ...p.item, period } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="edu-grade"
              label={t('education.fields.grade')}
              value={editing.item.grade}
              onChange={(grade) =>
                setEditing((p) => (p ? { ...p, item: { ...p.item, grade } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="edu-class"
              label={t('education.fields.classification')}
              value={editing.item.classification ?? { en: '', ar: '' }}
              onChange={(classification) =>
                setEditing((p) =>
                  p
                    ? {
                        ...p,
                        item: {
                          ...p.item,
                          classification:
                            classification.en.trim() || classification.ar.trim()
                              ? classification
                              : undefined,
                        },
                      }
                    : null
                )
              }
            />

            {/* Coursework */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {t('education.fields.coursework')}
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
                              coursework: [...p.item.coursework, { en: '', ar: '' }],
                            },
                          }
                        : null
                    )
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('education.fields.addCoursework')}</span>
                </Button>
              </div>

              {editing.item.coursework.map((cw, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-12">
                  <input
                    dir="ltr"
                    value={cw.en}
                    placeholder="EN"
                    onChange={(e) => {
                      const list = [...editing.item.coursework];
                      list[idx] = { ...cw, en: e.target.value };
                      setEditing((p) =>
                        p ? { ...p, item: { ...p.item, coursework: list } } : null
                      );
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <input
                    dir="rtl"
                    value={cw.ar}
                    placeholder="AR"
                    onChange={(e) => {
                      const list = [...editing.item.coursework];
                      list[idx] = { ...cw, ar: e.target.value };
                      setEditing((p) =>
                        p ? { ...p, item: { ...p.item, coursework: list } } : null
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
                                coursework: p.item.coursework.filter((_, i) => i !== idx),
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
          {education.map((item) => (
            <Card key={item.id} className="space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent" mono>
                      {pick(item.period)}
                    </Badge>
                    <Badge variant="muted">{pick(item.grade)}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {pick(item.degree)}
                  </h3>
                  <p className="text-sm text-text-secondary">{pick(item.institution)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
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

              <div className="flex flex-wrap gap-1.5">
                {item.coursework.map((cw, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-xs text-text-primary"
                  >
                    {pick(cw)}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget ? pick(deleteTarget.degree) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          void deleteEducation(deleteTarget.id).then(() => {
            setDeleteTarget(null);
            setFeedback(t('prototype.deletedInMemory'));
          }).catch(() => setDeleteTarget(null));
        }}
      />
    </div>
  );
}
