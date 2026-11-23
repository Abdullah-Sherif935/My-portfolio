import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-react';
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
import type { SkillGroup } from '@/types/portfolio';

function createEmptySkillGroup(order: number): SkillGroup {
  return {
    id: `skl-${Date.now()}`,
    code: `SKL-0${order}`,
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    skills: [],
    isVisible: true,
    dataSource: 'cms',
    isEditable: true,
    displayOrder: order,
  };
}

export function AdminSkillsPage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('skills.pageTitle'));

  const {
    skills,
    saveSkillGroup,
    deleteSkillGroup,
    reorderSkillGroup,
    toggleSkillGroupVisibility,
  } = useAdminData();

  const [editing, setEditing] = useState<{ group: SkillGroup; isNew: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SkillGroup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ordered = [...skills].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { group } = editing;
    if (!group.title.en.trim() || !group.title.ar.trim() || !group.code.trim()) {
      setError(t('common.validationRequired'));
      return;
    }
    try {
      await saveSkillGroup(group);
      setEditing(null);
      setFeedback(t('prototype.savedInMemory'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('skills.title')}
        subtitle={t('skills.subtitle')}
        actions={
          !editing && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditing({ group: createEmptySkillGroup(skills.length + 1), isNew: true });
                setError(null);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t('skills.addButton')}</span>
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
              {editing.isNew ? t('skills.createHeading') : t('skills.editHeading')}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="skl-code" className="block text-xs font-medium text-text-primary">
                  {t('skills.fields.code')} *
                </label>
                <input
                  id="skl-code"
                  dir="ltr"
                  value={editing.group.code}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, group: { ...p.group, code: e.target.value } } : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.group.isVisible !== false}
                    onChange={(e) =>
                      setEditing((p) =>
                        p ? { ...p, group: { ...p.group, isVisible: e.target.checked } } : null
                      )
                    }
                    className="h-4 w-4 rounded accent-accent"
                  />
                  <span>{t('skills.fields.isVisible')}</span>
                </label>
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="skl-title"
              label={t('skills.fields.title')}
              required
              value={editing.group.title}
              onChange={(title) =>
                setEditing((p) => (p ? { ...p, group: { ...p.group, title } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="skl-desc"
              label={t('skills.fields.description')}
              multiline
              rows={2}
              value={editing.group.description}
              onChange={(description) =>
                setEditing((p) => (p ? { ...p, group: { ...p.group, description } } : null))
              }
            />

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {t('skills.fields.skills')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            group: {
                              ...p.group,
                              skills: [...p.group.skills, { en: '', ar: '' }],
                            },
                          }
                        : null
                    )
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('skills.fields.addSkill')}</span>
                </Button>
              </div>
              {editing.group.skills.map((skill, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-12">
                  <input
                    dir="ltr"
                    value={skill.en}
                    placeholder="EN"
                    onChange={(e) => {
                      const list = [...editing.group.skills];
                      list[idx] = { ...skill, en: e.target.value };
                      setEditing((p) =>
                        p ? { ...p, group: { ...p.group, skills: list } } : null
                      );
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <input
                    dir="rtl"
                    value={skill.ar}
                    placeholder="AR"
                    onChange={(e) => {
                      const list = [...editing.group.skills];
                      list[idx] = { ...skill, ar: e.target.value };
                      setEditing((p) =>
                        p ? { ...p, group: { ...p.group, skills: list } } : null
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
                              group: {
                                ...p.group,
                                skills: p.group.skills.filter((_, i) => i !== idx),
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
          {ordered.map((group, idx) => {
            const visible = group.isVisible !== false;
            return (
              <Card key={group.id} className="space-y-3 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent" mono>
                        {group.code}
                      </Badge>
                      <Badge variant={visible ? 'success' : 'muted'}>
                        {visible ? t('common.visible') : t('common.hidden')}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      {pick(group.title)}
                    </h3>
                    <p className="text-xs text-text-secondary">{pick(group.description)}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => reorderSkillGroup(group.id, 'up')}
                      aria-label={t('common.moveUp')}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === ordered.length - 1}
                      onClick={() => reorderSkillGroup(group.id, 'down')}
                      aria-label={t('common.moveDown')}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSkillGroupVisibility(group.id)}
                      aria-label={visible ? t('common.hidden') : t('common.visible')}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent cursor-pointer"
                    >
                      {visible ? (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing({ group: structuredClone(group), isNew: false })}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t('common.edit')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t('common.delete')}
                      onClick={() => setDeleteTarget(group)}
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-border-default pt-3">
                  {group.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-xs text-text-primary"
                    >
                      {pick(skill)}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget ? pick(deleteTarget.title) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          void deleteSkillGroup(deleteTarget.id).then(() => {
            setDeleteTarget(null);
            setFeedback(t('prototype.deletedInMemory'));
          }).catch(() => setDeleteTarget(null));
        }}
      />
    </div>
  );
}
