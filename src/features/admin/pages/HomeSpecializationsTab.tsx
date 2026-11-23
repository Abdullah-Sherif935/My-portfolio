import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Cog,
  Cpu,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
  Trash2,
  Wind,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import type { HomeSpecializationsSectionConfig } from '@/types/admin';
import type {
  Specialization,
  SpecializationIcon,
  SpecializationId,
} from '@/types/portfolio';

const ICON_OPTIONS: { value: SpecializationIcon; label: string; Icon: typeof Wind }[] = [
  { value: 'wind', label: 'Wind / HVAC', Icon: Wind },
  { value: 'cpu', label: 'CPU / Mechatronics', Icon: Cpu },
  { value: 'wrench', label: 'Wrench / Mechanical', Icon: Wrench },
  { value: 'cog', label: 'Cog / Manufacturing', Icon: Cog },
  { value: 'layers', label: 'Layers / Automation', Icon: Layers },
  { value: 'bot', label: 'Bot / Robotics', Icon: Bot },
];

const CATEGORY_OPTIONS: SpecializationId[] = [
  'hvac-refrigeration',
  'plc-automation',
  'industrial-maintenance',
  'mechanical-design',
  'sheet-metal-design',
  'robotics-mechatronics',
];

const ICON_MAP: Record<SpecializationIcon, typeof Wind> = {
  wind: Wind,
  cpu: Cpu,
  wrench: Wrench,
  cog: Cog,
  layers: Layers,
  bot: Bot,
};

interface HomeSpecializationsTabProps {
  onSaved: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

function createEmptySpecialization(nextOrder: number): Specialization {
  const codeNum = String(nextOrder).padStart(2, '0');
  return {
    id: `spec-${Date.now().toString(36)}`,
    code: `DISC-${codeNum}`,
    icon: 'cog',
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    highlights: [{ en: '', ar: '' }],
    filterCategory: 'mechanical-design',
    displayOrder: nextOrder,
    isPublished: true,
  };
}

export function HomeSpecializationsTab({
  onSaved,
  onDirtyChange,
}: HomeSpecializationsTabProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  const {
    siteSettings,
    specializations,
    updateSiteSettings,
    saveSpecialization,
    deleteSpecialization,
    reorderSpecialization,
    toggleSpecializationPublished,
    isSaving,
  } = useAdminData();

  const [headerForm, setHeaderForm] = useState<HomeSpecializationsSectionConfig>(
    () => structuredClone(siteSettings.homeSections.specializations)
  );
  const [editingSpec, setEditingSpec] = useState<Specialization | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Specialization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHeaderForm(structuredClone(siteSettings.homeSections.specializations));
  }, [siteSettings.homeSections.specializations]);

  const headerDirty = useMemo(
    () =>
      JSON.stringify(headerForm) !==
      JSON.stringify(siteSettings.homeSections.specializations),
    [headerForm, siteSettings.homeSections.specializations]
  );

  const isDirty = headerDirty || editingSpec !== null;

  useEffect(() => {
    onDirtyChange(isDirty);
    return () => onDirtyChange(false);
  }, [isDirty, onDirtyChange]);

  const sortedSpecs = useMemo(
    () =>
      [...specializations].sort(
        (a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99)
      ),
    [specializations]
  );

  const handleSaveHeader = async (e: FormEvent) => {
    e.preventDefault();
    if (!headerForm.title.en.trim() || !headerForm.title.ar.trim()) {
      setError(t('common.validationRequired'));
      return;
    }
    setError(null);
    try {
      await updateSiteSettings({
        ...siteSettings,
        homeSections: {
          ...siteSettings.homeSections,
          specializations: headerForm,
        },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const handleStartCreate = () => {
    setError(null);
    setIsCreating(true);
    setEditingSpec(createEmptySpecialization(sortedSpecs.length + 1));
  };

  const handleStartEdit = (spec: Specialization) => {
    setError(null);
    setIsCreating(false);
    setEditingSpec(structuredClone(spec));
  };

  const handleSaveSpec = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSpec) return;

    if (
      !editingSpec.code.trim() ||
      !editingSpec.title.en.trim() ||
      !editingSpec.title.ar.trim() ||
      !editingSpec.description.en.trim() ||
      !editingSpec.description.ar.trim()
    ) {
      setError(t('common.validationRequired'));
      return;
    }

    const cleanedHighlights = editingSpec.highlights.filter(
      (h) => h.en.trim() || h.ar.trim()
    );

    setError(null);
    try {
      await saveSpecialization({
        ...editingSpec,
        code: editingSpec.code.trim(),
        highlights: cleanedHighlights,
      });
      setEditingSpec(null);
      setIsCreating(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteSpecialization(deleteTarget.id);
      if (editingSpec?.id === deleteTarget.id) {
        setEditingSpec(null);
        setIsCreating(false);
      }
      setDeleteTarget(null);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    setError(null);
    try {
      await reorderSpecialization(id, direction);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const handleTogglePublished = async (id: string) => {
    setError(null);
    try {
      await toggleSpecializationPublished(id);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-xs text-error"
        >
          {error}
        </div>
      )}

      {/* Card 1: Section Header & Visibility */}
      <form onSubmit={(e) => void handleSaveHeader(e)}>
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionMappingBadge location={t('homeMgr.mapSpecsHeader')} />
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
              <input
                type="checkbox"
                checked={headerForm.visible}
                onChange={(e) =>
                  setHeaderForm((prev) => ({
                    ...prev,
                    visible: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded accent-accent"
              />
              <span>{t('homeMgr.specs.sectionVisible')}</span>
            </label>
          </div>

          <LocalizedFieldGroup
            idPrefix="home-specs-eyebrow"
            label={t('homeMgr.specs.eyebrow')}
            value={headerForm.eyebrow}
            onChange={(eyebrow) =>
              setHeaderForm((prev) => ({ ...prev, eyebrow }))
            }
          />

          <LocalizedFieldGroup
            idPrefix="home-specs-title"
            label={t('homeMgr.specs.heading')}
            required
            value={headerForm.title}
            onChange={(title) => setHeaderForm((prev) => ({ ...prev, title }))}
          />

          <LocalizedFieldGroup
            idPrefix="home-specs-subtitle"
            label={t('homeMgr.specs.subtitle')}
            multiline
            rows={2}
            value={headerForm.subtitle}
            onChange={(subtitle) =>
              setHeaderForm((prev) => ({ ...prev, subtitle }))
            }
          />

          <div className="flex flex-wrap justify-end gap-3 border-t border-border-default pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!headerDirty}
              onClick={() => {
                setHeaderForm(
                  structuredClone(siteSettings.homeSections.specializations)
                );
                setError(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving || !headerDirty}
            >
              {isSaving ? t('prototype.saving') : t('common.save')}
            </Button>
          </div>
        </Card>
      </form>

      {/* Card 2: Specialization Editor Form (Add / Edit) */}
      {editingSpec && (
        <form onSubmit={(e) => void handleSaveSpec(e)}>
          <Card className="space-y-5 border-accent/50 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-text-primary">
                {isCreating
                  ? t('homeMgr.specs.createHeading')
                  : t('homeMgr.specs.editHeading')}
              </h3>
              <Badge variant="accent" mono>
                {editingSpec.code || 'NEW'}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="spec-code"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('homeMgr.specs.code')} *
                </label>
                <input
                  id="spec-code"
                  dir="ltr"
                  value={editingSpec.code}
                  onChange={(e) =>
                    setEditingSpec((prev) =>
                      prev ? { ...prev, code: e.target.value } : prev
                    )
                  }
                  placeholder="DISC-07"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="spec-icon"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('homeMgr.specs.icon')}
                </label>
                <select
                  id="spec-icon"
                  value={editingSpec.icon}
                  onChange={(e) =>
                    setEditingSpec((prev) =>
                      prev
                        ? {
                            ...prev,
                            icon: e.target.value as SpecializationIcon,
                          }
                        : prev
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="spec-category"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('homeMgr.specs.filterCategory')}
                </label>
                <select
                  id="spec-category"
                  value={editingSpec.filterCategory}
                  onChange={(e) =>
                    setEditingSpec((prev) =>
                      prev
                        ? {
                            ...prev,
                            filterCategory: e.target.value as SpecializationId,
                          }
                        : prev
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="spec-title"
              label={t('homeMgr.specs.itemTitle')}
              required
              value={editingSpec.title}
              onChange={(title) =>
                setEditingSpec((prev) => (prev ? { ...prev, title } : prev))
              }
            />

            <LocalizedFieldGroup
              idPrefix="spec-desc"
              label={t('homeMgr.specs.itemDescription')}
              required
              multiline
              rows={3}
              value={editingSpec.description}
              onChange={(description) =>
                setEditingSpec((prev) =>
                  prev ? { ...prev, description } : prev
                )
              }
            />

            {/* Highlights List */}
            <div className="space-y-3 border-t border-border-default pt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-primary">
                  {t('homeMgr.specs.highlights')}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setEditingSpec((prev) =>
                      prev
                        ? {
                            ...prev,
                            highlights: [...prev.highlights, { en: '', ar: '' }],
                          }
                        : prev
                    )
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('homeMgr.specs.addHighlight')}</span>
                </Button>
              </div>

              {editingSpec.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-xl border border-border-default bg-bg-primary p-3"
                >
                  <div className="flex-1">
                    <LocalizedFieldGroup
                      idPrefix={`spec-highlight-${idx}`}
                      label={`${t('homeMgr.specs.highlightItem')} #${idx + 1}`}
                      value={item}
                      onChange={(updated) =>
                        setEditingSpec((prev) => {
                          if (!prev) return prev;
                          const next = [...prev.highlights];
                          next[idx] = updated;
                          return { ...prev, highlights: next };
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingSpec((prev) =>
                        prev
                          ? {
                              ...prev,
                              highlights: prev.highlights.filter(
                                (_, i) => i !== idx
                              ),
                            }
                          : prev
                      )
                    }
                    aria-label={t('common.delete')}
                    className="mt-6 text-error hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={editingSpec.isPublished !== false}
                  onChange={(e) =>
                    setEditingSpec((prev) =>
                      prev ? { ...prev, isPublished: e.target.checked } : prev
                    )
                  }
                  className="h-4 w-4 rounded accent-accent"
                />
                <span>{t('homeMgr.specs.publishedToggle')}</span>
              </label>

              <div className="flex flex-wrap gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingSpec(null);
                    setIsCreating(false);
                    setError(null);
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                >
                  {isSaving
                    ? t('prototype.saving')
                    : isCreating
                      ? t('common.create')
                      : t('common.save')}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      )}

      {/* Card 3: Specializations CRUD List */}
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionMappingBadge
            location={t('homeMgr.mapSpecsGrid')}
            sharedWith={[t('nav.pageAbout')]}
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleStartCreate}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{t('homeMgr.specs.addButton')}</span>
          </Button>
        </div>

        <p className="text-xs text-text-secondary">
          {t('homeMgr.specs.listDescription')}
        </p>

        <div className="divide-y divide-border-default">
          {sortedSpecs.map((spec, idx) => {
            const Icon = ICON_MAP[spec.icon] ?? Cog;
            const published = spec.isPublished !== false;
            return (
              <div
                key={spec.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="muted" mono>
                        {spec.code}
                      </Badge>
                      <Badge variant={published ? 'accent' : 'default'}>
                        {published ? t('common.visible') : t('common.hidden')}
                      </Badge>
                      <Badge variant="muted" mono>
                        {spec.filterCategory}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">
                      {pick(spec.title)}
                    </p>
                    <p className="line-clamp-2 text-xs text-text-secondary">
                      {pick(spec.description)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSaving || idx === 0}
                    onClick={() => void handleReorder(spec.id, 'up')}
                    aria-label={t('common.moveUp')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSaving || idx === sortedSpecs.length - 1}
                    onClick={() => void handleReorder(spec.id, 'down')}
                    aria-label={t('common.moveDown')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isSaving}
                    onClick={() => void handleTogglePublished(spec.id)}
                    aria-label={
                      published
                        ? t('homeMgr.specs.unpublish')
                        : t('homeMgr.specs.publish')
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
                    onClick={() => handleStartEdit(spec)}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('common.edit')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSaving}
                    onClick={() => setDeleteTarget(spec)}
                    aria-label={t('common.delete')}
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        itemName={deleteTarget ? pick(deleteTarget.title) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
