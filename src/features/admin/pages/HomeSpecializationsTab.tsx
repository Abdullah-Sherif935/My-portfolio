import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  FolderKanban,
  Image as ImageIcon,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SpecializationIconBadge } from '@/components/common/SpecializationIconBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import {
  deleteSpecializationIconAsset,
  uploadSpecializationIcon,
} from '@/services/portfolioService';
import {
  SPECIALIZATION_ICON_LIBRARY,
  resolvePortfolioCategories,
  resolveSpecializationProjects,
} from '@/utils/specializationHelpers';
import type { HomeSpecializationsSectionConfig } from '@/types/admin';
import type {
  Specialization,
  SpecializationIcon,
  SpecializationIconType,
  SpecializationProjectMode,
} from '@/types/portfolio';
import { cn } from '@/utils/cn';

const ICON_GROUPS: Array<{
  id: 'thermal-mechanical' | 'automation-electrical' | 'robotics-industrial';
  labelKey: string;
}> = [
  { id: 'thermal-mechanical', labelKey: 'homeMgr.specs.iconGroupThermal' },
  { id: 'automation-electrical', labelKey: 'homeMgr.specs.iconGroupAutomation' },
  { id: 'robotics-industrial', labelKey: 'homeMgr.specs.iconGroupRobotics' },
];

const ALLOWED_ICON_ACCEPT = '.svg,.png,.webp,image/svg+xml,image/png,image/webp';
const ALLOWED_ICON_MIMES = new Set(['image/svg+xml', 'image/png', 'image/webp']);
const MAX_ICON_BYTES = 2 * 1024 * 1024;

interface HomeSpecializationsTabProps {
  onSaved: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

function createEmptySpecialization(
  nextOrder: number,
  defaultCategory: string
): Specialization {
  const codeNum = String(nextOrder).padStart(2, '0');
  return {
    id: `spec-${Date.now().toString(36)}`,
    code: `DISC-${codeNum}`,
    icon: 'cog',
    iconType: 'library',
    customIconUrl: null,
    customIconPath: null,
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    highlights: [{ en: '', ar: '' }],
    filterCategory: defaultCategory,
    projectRelationMode: 'category',
    relatedProjectIds: [],
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
    projects,
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
  const [projectSearch, setProjectSearch] = useState('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [iconUploadError, setIconUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const dynamicCategories = useMemo(
    () => resolvePortfolioCategories(specializations, projects),
    [specializations, projects]
  );

  const projectsById = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  const filteredProjectCandidates = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) => {
      const hay = [
        project.code,
        project.title.en,
        project.title.ar,
        project.category,
        project.categoryLabel.en,
        project.categoryLabel.ar,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, projectSearch]);

  const autoMatchedProjects = useMemo(() => {
    if (!editingSpec) return [];
    return resolveSpecializationProjects(
      { ...editingSpec, projectRelationMode: 'category' },
      projects
    );
  }, [editingSpec, projects]);

  const selectedManualProjects = useMemo(() => {
    if (!editingSpec) return [];
    return (editingSpec.relatedProjectIds ?? [])
      .map((id) => projectsById.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [editingSpec, projectsById]);

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
    setIconUploadError(null);
    setProjectSearch('');
    setIsCreating(true);
    setEditingSpec(
      createEmptySpecialization(
        sortedSpecs.length + 1,
        dynamicCategories[0]?.id ?? 'mechanical-design'
      )
    );
  };

  const handleStartEdit = (spec: Specialization) => {
    setError(null);
    setIconUploadError(null);
    setProjectSearch('');
    setIsCreating(false);
    setEditingSpec({
      ...structuredClone(spec),
      iconType: spec.iconType === 'image' && spec.customIconUrl ? 'image' : 'library',
      projectRelationMode: spec.projectRelationMode === 'manual' ? 'manual' : 'category',
      relatedProjectIds: [...(spec.relatedProjectIds ?? [])],
    });
  };

  const handleIconFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editingSpec) return;

    setIconUploadError(null);
    if (!ALLOWED_ICON_MIMES.has(file.type)) {
      setIconUploadError(t('homeMgr.specs.iconInvalidType'));
      return;
    }
    if (file.size > MAX_ICON_BYTES) {
      setIconUploadError(t('homeMgr.specs.iconTooLarge'));
      return;
    }

    setIsUploadingIcon(true);
    try {
      const previousPath = editingSpec.customIconPath;
      const uploaded = await uploadSpecializationIcon(file, editingSpec.id);
      if (previousPath && previousPath !== uploaded.storagePath) {
        void deleteSpecializationIconAsset(previousPath).catch(() => undefined);
      }
      setEditingSpec((prev) =>
        prev
          ? {
              ...prev,
              iconType: 'image',
              customIconUrl: uploaded.url,
              customIconPath: uploaded.storagePath,
            }
          : prev
      );
    } catch (err) {
      setIconUploadError(
        err instanceof Error ? err.message : t('prototype.syncError')
      );
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleRemoveCustomIcon = async () => {
    if (!editingSpec) return;
    setIconUploadError(null);
    const oldPath = editingSpec.customIconPath;
    setEditingSpec((prev) =>
      prev
        ? {
            ...prev,
            iconType: 'library',
            customIconUrl: null,
            customIconPath: null,
          }
        : prev
    );
    if (oldPath) {
      void deleteSpecializationIconAsset(oldPath).catch(() => undefined);
    }
  };

  const handleToggleProjectSelection = (projectId: string) => {
    setEditingSpec((prev) => {
      if (!prev) return prev;
      const current = prev.relatedProjectIds ?? [];
      const next = current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId];
      return { ...prev, relatedProjectIds: next };
    });
  };

  const handleMoveSelectedProject = (index: number, direction: 'up' | 'down') => {
    setEditingSpec((prev) => {
      if (!prev) return prev;
      const current = [...(prev.relatedProjectIds ?? [])];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return prev;
      const [moved] = current.splice(index, 1);
      if (!moved) return prev;
      current.splice(target, 0, moved);
      return { ...prev, relatedProjectIds: current };
    });
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

    const normalizedIconType: SpecializationIconType =
      editingSpec.iconType === 'image' && editingSpec.customIconUrl
        ? 'image'
        : 'library';

    setError(null);
    try {
      await saveSpecialization({
        ...editingSpec,
        code: editingSpec.code.trim(),
        iconType: normalizedIconType,
        highlights: cleanedHighlights,
        projectRelationMode:
          editingSpec.projectRelationMode === 'manual' ? 'manual' : 'category',
        relatedProjectIds: editingSpec.relatedProjectIds ?? [],
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
      if (deleteTarget.customIconPath) {
        void deleteSpecializationIconAsset(deleteTarget.customIconPath).catch(
          () => undefined
        );
      }
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

      {/* Card 2: Specialization Editor (6 Clearly Separated Sections) */}
      {editingSpec && (
        <form onSubmit={(e) => void handleSaveSpec(e)}>
          <Card className="space-y-6 border-accent/50 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-4">
              <div className="flex items-center gap-3">
                <SpecializationIconBadge specialization={editingSpec} size="sm" />
                <div>
                  <h3 className="text-sm font-semibold text-text-primary sm:text-base">
                    {isCreating
                      ? t('homeMgr.specs.createHeading')
                      : t('homeMgr.specs.editHeading')}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {pick(editingSpec.title) || editingSpec.code}
                  </p>
                </div>
              </div>
              <Badge variant="accent" mono>
                {editingSpec.code || 'NEW'}
              </Badge>
            </div>

            {/* Section 1: Basic Information */}
            <section className="space-y-4 rounded-xl border border-border-default bg-bg-primary/60 p-4 sm:p-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">
                  1. {t('homeMgr.specs.sectionBasic')}
                </h4>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {t('homeMgr.specs.sectionBasicHint')}
                </p>
              </div>

              <div className="max-w-xs space-y-1.5">
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
            </section>

            {/* Section 2: Icon & Appearance */}
            <section className="space-y-4 rounded-xl border border-border-default bg-bg-primary/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">
                    2. {t('homeMgr.specs.sectionIcon')}
                  </h4>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {t('homeMgr.specs.sectionIconHint')}
                  </p>
                </div>

                {/* Live Icon Preview */}
                <div className="flex items-center gap-3 rounded-xl border border-border-default bg-bg-secondary px-3.5 py-2.5">
                  <SpecializationIconBadge specialization={editingSpec} size="lg" />
                  <div className="text-xs">
                    <p className="font-semibold text-text-primary">
                      {t('homeMgr.specs.iconPreviewLabel')}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {editingSpec.iconType === 'image' && editingSpec.customIconUrl
                        ? t('homeMgr.specs.iconModeImage')
                        : `${t('homeMgr.specs.iconModeLibrary')} · ${editingSpec.icon}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Icon Mode Toggle */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditingSpec((prev) =>
                      prev ? { ...prev, iconType: 'library' } : prev
                    )
                  }
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 py-2 text-xs font-semibold transition-colors',
                    editingSpec.iconType !== 'image'
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('homeMgr.specs.iconModeLibrary')}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingSpec((prev) =>
                      prev ? { ...prev, iconType: 'image' } : prev
                    )
                  }
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 py-2 text-xs font-semibold transition-colors',
                    editingSpec.iconType === 'image'
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
                  )}
                >
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('homeMgr.specs.iconModeImage')}</span>
                </button>
              </div>

              {/* Option B: Custom Image Upload */}
              {editingSpec.iconType === 'image' && (
                <div className="space-y-3 rounded-xl border border-border-default bg-bg-secondary p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-text-primary">
                        {t('homeMgr.specs.customIconUploadTitle')}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {t('homeMgr.specs.customIconUploadHint')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_ICON_ACCEPT}
                        onChange={(e) => void handleIconFileChange(e)}
                        className="sr-only"
                        id="spec-custom-icon-input"
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isUploadingIcon}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {isUploadingIcon
                            ? t('media.uploading')
                            : editingSpec.customIconUrl
                              ? t('homeMgr.specs.replaceCustomIcon')
                              : t('homeMgr.specs.uploadCustomIcon')}
                        </span>
                      </Button>

                      {editingSpec.customIconUrl && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isUploadingIcon}
                          onClick={() => void handleRemoveCustomIcon()}
                          className="text-error hover:text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{t('homeMgr.specs.removeCustomIcon')}</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {iconUploadError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-error/40 bg-error-subtle px-3 py-2 text-xs text-error"
                    >
                      {iconUploadError}
                    </div>
                  )}

                  {editingSpec.customIconUrl && (
                    <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-primary p-3">
                      <img
                        src={editingSpec.customIconUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg border border-border-default bg-bg-secondary object-contain p-1.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[11px] text-text-primary" dir="ltr">
                          {editingSpec.customIconPath || editingSpec.customIconUrl}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {t('homeMgr.specs.fallbackIconPreserved', {
                            icon: editingSpec.icon,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Option A: Curated Icon Library (Always accessible as primary or fallback) */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-text-primary">
                  {editingSpec.iconType === 'image'
                    ? t('homeMgr.specs.fallbackLibraryHeading')
                    : t('homeMgr.specs.libraryHeading')}
                </p>

                <div className="space-y-3">
                  {ICON_GROUPS.map((group) => {
                    const groupIcons = SPECIALIZATION_ICON_LIBRARY.filter(
                      (opt) => opt.group === group.id
                    );
                    return (
                      <div key={group.id} className="space-y-1.5">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                          {t(group.labelKey)}
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                          {groupIcons.map((opt) => {
                            const IconComp = opt.Icon;
                            const isSelected = editingSpec.icon === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                  setEditingSpec((prev) =>
                                    prev
                                      ? { ...prev, icon: opt.value as SpecializationIcon }
                                      : prev
                                  )
                                }
                                className={cn(
                                  'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors',
                                  isSelected
                                    ? 'border-accent bg-accent-subtle text-accent'
                                    : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary'
                                )}
                              >
                                <IconComp className="h-4 w-4" aria-hidden="true" />
                                <span className="line-clamp-1 text-[11px] font-medium">
                                  {pick(opt.label)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Section 3: Portfolio Category */}
            <section className="space-y-3 rounded-xl border border-border-default bg-bg-primary/60 p-4 sm:p-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">
                  3. {t('homeMgr.specs.sectionCategory')}
                </h4>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {t('homeMgr.specs.sectionCategoryHint')}
                </p>
              </div>

              <div className="max-w-lg space-y-1.5">
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
                      prev ? { ...prev, filterCategory: e.target.value } : prev
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="">{t('homeMgr.specs.noCategoryOption')}</option>
                  {dynamicCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {pick(cat.label)} ({cat.id}) — {cat.publishedProjectCount}{' '}
                      {t('homeMgr.specs.publishedCountShort')}
                    </option>
                  ))}
                  {editingSpec.filterCategory &&
                    !dynamicCategories.some(
                      (c) => c.id === editingSpec.filterCategory
                    ) && (
                      <option value={editingSpec.filterCategory}>
                        {editingSpec.filterCategory}
                      </option>
                    )}
                </select>
              </div>
            </section>

            {/* Section 4: Related Portfolio Projects */}
            <section className="space-y-4 rounded-xl border border-border-default bg-bg-primary/60 p-4 sm:p-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">
                  4. {t('homeMgr.specs.sectionRelatedProjects')}
                </h4>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {t('homeMgr.specs.sectionRelatedProjectsHint')}
                </p>
              </div>

              {/* Relationship Mode Selector */}
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    [
                      'category',
                      t('homeMgr.specs.modeCategoryTitle'),
                      t('homeMgr.specs.modeCategoryDesc'),
                    ],
                    [
                      'manual',
                      t('homeMgr.specs.modeManualTitle'),
                      t('homeMgr.specs.modeManualDesc'),
                    ],
                  ] as Array<[SpecializationProjectMode, string, string]>
                ).map(([mode, modeTitle, modeDesc]) => {
                  const active =
                    (editingSpec.projectRelationMode ?? 'category') === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setEditingSpec((prev) =>
                          prev ? { ...prev, projectRelationMode: mode } : prev
                        )
                      }
                      className={cn(
                        'flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3.5 text-start transition-colors',
                        active
                          ? 'border-accent bg-accent-subtle'
                          : 'border-border-default bg-bg-secondary hover:border-border-strong'
                      )}
                    >
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-text-primary">
                        <FolderKanban
                          className={cn(
                            'h-3.5 w-3.5',
                            active ? 'text-accent' : 'text-text-secondary'
                          )}
                          aria-hidden="true"
                        />
                        {modeTitle}
                      </span>
                      <span className="text-[11px] leading-relaxed text-text-secondary">
                        {modeDesc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mode B: Automatic Category Matching Preview */}
              {(editingSpec.projectRelationMode ?? 'category') === 'category' ? (
                <div className="space-y-2.5 rounded-xl border border-border-default bg-bg-secondary p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-text-primary">
                      {t('homeMgr.specs.autoMatchedHeading')}
                    </p>
                    <Badge
                      variant={autoMatchedProjects.length > 0 ? 'accent' : 'default'}
                      mono
                    >
                      {autoMatchedProjects.length}{' '}
                      {t('homeMgr.specs.publishedCountShort')}
                    </Badge>
                  </div>

                  {autoMatchedProjects.length > 0 ? (
                    <ul className="space-y-2">
                      {autoMatchedProjects.map((project) => (
                        <li
                          key={project.id}
                          className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-primary p-2.5"
                        >
                          {project.coverImageUrl ? (
                            <img
                              src={project.coverImageUrl}
                              alt=""
                              className="h-9 w-12 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded border border-border-default bg-bg-secondary font-mono text-[10px] text-text-secondary">
                              {project.code.slice(-2)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-text-primary">
                              {pick(project.title)}
                            </p>
                            <p className="font-mono text-[11px] text-text-secondary">
                              {project.code} · {pick(project.categoryLabel)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs leading-relaxed text-text-secondary">
                      {t('homeMgr.specs.autoMatchedEmpty')}
                    </p>
                  )}
                </div>
              ) : (
                /* Mode A: Manual Project Selection */
                <div className="space-y-4 rounded-xl border border-border-default bg-bg-secondary p-4">
                  {/* Selected Projects Ordered List */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-text-primary">
                        {t('homeMgr.specs.selectedProjectsHeading')}
                      </p>
                      <Badge variant="accent" mono>
                        {selectedManualProjects.length}
                      </Badge>
                    </div>

                    {selectedManualProjects.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedManualProjects.map((project, idx) => (
                          <li
                            key={project.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/30 bg-bg-primary p-2.5"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {project.coverImageUrl ? (
                                <img
                                  src={project.coverImageUrl}
                                  alt=""
                                  className="h-9 w-12 shrink-0 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded border border-border-default bg-bg-secondary font-mono text-[10px] text-text-secondary">
                                  {project.code.slice(-2)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-text-primary">
                                  {pick(project.title)}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-mono text-[11px] text-text-secondary">
                                    {project.code}
                                  </span>
                                  {project.isPublished === false && (
                                    <Badge variant="default">
                                      {t('common.hidden')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={idx === 0}
                                onClick={() => handleMoveSelectedProject(idx, 'up')}
                                aria-label={t('common.moveUp')}
                              >
                                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={idx === selectedManualProjects.length - 1}
                                onClick={() => handleMoveSelectedProject(idx, 'down')}
                                aria-label={t('common.moveDown')}
                              >
                                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleProjectSelection(project.id)}
                                aria-label={t('homeMgr.specs.removeSelectedProject')}
                                className="text-error hover:text-error"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-text-secondary">
                        {t('homeMgr.specs.manualSelectedEmpty')}
                      </p>
                    )}
                  </div>

                  {/* Searchable Multi-Select Project Picker */}
                  <div className="space-y-2.5 border-t border-border-default pt-3">
                    <label
                      htmlFor="spec-project-search"
                      className="block text-xs font-medium text-text-primary"
                    >
                      {t('homeMgr.specs.searchProjectsLabel')}
                    </label>
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute top-1/2 start-3 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary"
                        aria-hidden="true"
                      />
                      <input
                        id="spec-project-search"
                        type="search"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        placeholder={t('homeMgr.specs.searchProjectsPlaceholder')}
                        className="h-9 w-full rounded-[10px] border border-border-default bg-bg-primary ps-9 pe-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div className="max-h-56 space-y-1.5 overflow-y-auto pe-1">
                      {filteredProjectCandidates.map((project) => {
                        const selected = (
                          editingSpec.relatedProjectIds ?? []
                        ).includes(project.id);
                        return (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleToggleProjectSelection(project.id)}
                            className={cn(
                              'flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border p-2.5 text-start transition-colors',
                              selected
                                ? 'border-accent bg-accent-subtle'
                                : 'border-border-default bg-bg-primary hover:border-border-strong'
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {project.coverImageUrl ? (
                                <img
                                  src={project.coverImageUrl}
                                  alt=""
                                  className="h-8 w-11 shrink-0 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-11 shrink-0 items-center justify-center rounded border border-border-default bg-bg-secondary font-mono text-[10px] text-text-secondary">
                                  {project.code.slice(-2)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-text-primary">
                                  {pick(project.title)}
                                </p>
                                <p className="truncate font-mono text-[11px] text-text-secondary">
                                  {project.code} · {pick(project.categoryLabel)}
                                </p>
                              </div>
                            </div>

                            <span
                              className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                                selected
                                  ? 'border-accent bg-accent text-accent-foreground'
                                  : 'border-border-default bg-bg-secondary'
                              )}
                            >
                              {selected && (
                                <Check className="h-3 w-3" aria-hidden="true" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 5: Key Technical Highlights */}
            <section className="space-y-3 rounded-xl border border-border-default bg-bg-primary/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">
                    5. {t('homeMgr.specs.highlights')}
                  </h4>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {t('homeMgr.specs.highlightsHint')}
                  </p>
                </div>
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
            </section>

            {/* Section 6: Publication & Display Settings */}
            <section className="space-y-4 rounded-xl border border-border-default bg-bg-primary/60 p-4 sm:p-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">
                  6. {t('homeMgr.specs.sectionPublication')}
                </h4>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {t('homeMgr.specs.sectionPublicationHint')}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
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
                      setIconUploadError(null);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSaving || isUploadingIcon}
                  >
                    {isSaving
                      ? t('prototype.saving')
                      : isCreating
                        ? t('common.create')
                        : t('common.save')}
                  </Button>
                </div>
              </div>
            </section>
          </Card>
        </form>
      )}

      {/* Card 3: Specializations CRUD List */}
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionMappingBadge
            location={t('homeMgr.mapSpecsGrid')}
            sharedWith={[t('nav.pageAbout'), t('nav.pagePortfolio')]}
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
            const published = spec.isPublished !== false;
            const resolvedProjects = resolveSpecializationProjects(spec, projects);
            const relationLabel =
              spec.projectRelationMode === 'manual'
                ? `${t('homeMgr.specs.badgeManual')} (${resolvedProjects.length})`
                : `${t('homeMgr.specs.badgeAuto')} (${resolvedProjects.length})`;

            return (
              <div
                key={spec.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <SpecializationIconBadge specialization={spec} size="sm" />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="muted" mono>
                        {spec.code}
                      </Badge>
                      <Badge variant={published ? 'accent' : 'default'}>
                        {published ? t('common.visible') : t('common.hidden')}
                      </Badge>
                      <Badge variant="muted" mono>
                        <Layers className="me-1 inline h-3 w-3" aria-hidden="true" />
                        {relationLabel}
                      </Badge>
                      {spec.iconType === 'image' && spec.customIconUrl && (
                        <Badge variant="muted">
                          {t('homeMgr.specs.badgeCustomIcon')}
                        </Badge>
                      )}
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
