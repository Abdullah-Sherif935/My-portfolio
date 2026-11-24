import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Award,
  Briefcase,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  Pencil,
  Plus,
  Search,
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
import { ProfessionalExperienceEditor } from './ProfessionalExperienceEditor';
import { AcademicExperienceEditor } from './AcademicExperienceEditor';
import { CourseDevelopmentEditor } from './CourseDevelopmentEditor';
import type {
  Certification,
  EducationItem,
  ExperienceItem,
} from '@/types/portfolio';
import { cn } from '@/utils/cn';

type ExperienceSectionTab = 'professional' | 'academic' | 'courses';
type PublishFilter = 'all' | 'published' | 'draft';

interface AdminExperiencePageProps {
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
}

function createEmptyExperience(order: number): ExperienceItem {
  return {
    id: `exp-${Date.now()}`,
    kind: 'employment',
    kindLabel: { en: 'Professional Role', ar: 'خبرة مهنية' },
    employmentType: 'full-time',
    workMode: 'on-site',
    role: { en: '', ar: '' },
    company: { en: '', ar: '' },
    period: { en: '', ar: '' },
    startDate: '',
    endDate: '',
    isCurrent: false,
    highlights: [],
    responsibilities: [],
    skills: [],
    relatedProjectSlugs: [],
    isPublished: true,
    dataSource: 'cms',
    isEditable: true,
    displayOrder: order,
  };
}

function createEmptyEducation(order: number): EducationItem {
  return {
    id: `edu-${Date.now()}`,
    degree: { en: '', ar: '' },
    fieldOfStudy: { en: '', ar: '' },
    institution: { en: '', ar: '' },
    period: { en: '', ar: '' },
    startYear: '',
    graduationYear: '',
    isCurrent: false,
    grade: { en: '', ar: '' },
    activities: [],
    relatedProjectSlugs: [],
    coursework: [],
    isPublished: true,
    dataSource: 'cms',
    isEditable: true,
    displayOrder: order,
  };
}

function createEmptyCourse(order: number): Certification {
  return {
    id: `course-${Date.now()}`,
    title: { en: '', ar: '' },
    issuer: { en: '', ar: '' },
    courseType: 'course',
    issueDate: { en: '', ar: '' },
    credentialId: '',
    credentialUrl: null,
    category: { en: 'Professional Course', ar: 'دورة مهنية' },
    skills: [],
    learningOutcomes: [],
    mediaUrl: null,
    isPublished: true,
    dataSource: 'cms',
    isEditable: true,
    displayOrder: order,
  };
}

export function AdminExperiencePage({
  onDirtyChange,
  onSaved,
}: AdminExperiencePageProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('experience.pageTitle'));

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    experience,
    education,
    certifications,
    isSaving,
    saveExperience,
    deleteExperience,
    reorderExperience,
    toggleExperiencePublished,
    duplicateExperience,
    saveEducation,
    deleteEducation,
    reorderEducation,
    toggleEducationPublished,
    saveCertification,
    deleteCertification,
    reorderCertification,
    toggleCertificationPublished,
    duplicateCertification,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<ExperienceSectionTab>('professional');
  const [searchQuery, setSearchQuery] = useState('');
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all');

  const [editingExp, setEditingExp] = useState<{
    item: ExperienceItem;
    isNew: boolean;
  } | null>(() =>
    searchParams.get('new') === '1'
      ? { item: createEmptyExperience(experience.length + 1), isNew: true }
      : null
  );
  const [editingEdu, setEditingEdu] = useState<{
    item: EducationItem;
    isNew: boolean;
  } | null>(null);
  const [editingCourse, setEditingCourse] = useState<{
    item: Certification;
    isNew: boolean;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    kind: ExperienceSectionTab;
    id: string;
    label: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isEditingAny = Boolean(editingExp || editingEdu || editingCourse);

  const notifySaved = (msg?: string) => {
    setFeedback(msg ?? t('prototype.savedInMemory'));
    onDirtyChange?.(false);
    onSaved?.();
  };

  const orderedExperience = useMemo(
    () =>
      [...experience]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((item) => {
          if (publishFilter === 'published' && item.isPublished === false) return false;
          if (publishFilter === 'draft' && item.isPublished !== false) return false;
          const q = searchQuery.trim().toLowerCase();
          if (!q) return true;
          return `${item.role.en} ${item.role.ar} ${item.company.en} ${item.company.ar}`
            .toLowerCase()
            .includes(q);
        }),
    [experience, publishFilter, searchQuery]
  );

  const orderedEducation = useMemo(
    () =>
      [...education]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((item) => {
          if (publishFilter === 'published' && item.isPublished === false) return false;
          if (publishFilter === 'draft' && item.isPublished !== false) return false;
          const q = searchQuery.trim().toLowerCase();
          if (!q) return true;
          return `${item.degree.en} ${item.degree.ar} ${item.institution.en} ${item.institution.ar}`
            .toLowerCase()
            .includes(q);
        }),
    [education, publishFilter, searchQuery]
  );

  const orderedCourses = useMemo(
    () =>
      [...certifications]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((item) => {
          if (publishFilter === 'published' && item.isPublished === false) return false;
          if (publishFilter === 'draft' && item.isPublished !== false) return false;
          const q = searchQuery.trim().toLowerCase();
          if (!q) return true;
          return `${item.title.en} ${item.title.ar} ${item.issuer.en} ${item.issuer.ar}`
            .toLowerCase()
            .includes(q);
        }),
    [certifications, publishFilter, searchQuery]
  );

  const handleAddNew = () => {
    setFeedback(null);
    if (searchParams.has('new')) setSearchParams({}, { replace: true });
    if (activeTab === 'professional') {
      setEditingExp({
        item: createEmptyExperience(experience.length + 1),
        isNew: true,
      });
    } else if (activeTab === 'academic') {
      setEditingEdu({
        item: createEmptyEducation(education.length + 1),
        isNew: true,
      });
    } else {
      setEditingCourse({
        item: createEmptyCourse(certifications.length + 1),
        isNew: true,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'professional') {
      await deleteExperience(deleteTarget.id);
    } else if (deleteTarget.kind === 'academic') {
      await deleteEducation(deleteTarget.id);
    } else {
      await deleteCertification(deleteTarget.id);
    }
    setDeleteTarget(null);
    notifySaved(t('common.deletedFeedback'));
  };

  const mainTabs: Array<{
    id: ExperienceSectionTab;
    label: string;
    count: number;
    icon: typeof Briefcase;
  }> = [
    {
      id: 'professional',
      label: t('experienceCms.tabs.professional'),
      count: experience.length,
      icon: Briefcase,
    },
    {
      id: 'academic',
      label: t('experienceCms.tabs.academic'),
      count: education.length,
      icon: GraduationCap,
    },
    {
      id: 'courses',
      label: t('experienceCms.tabs.courses'),
      count: certifications.length,
      icon: Award,
    },
  ];

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

      {/* 3 Main Experience CMS Tabs */}
      {!isEditingAny && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                    setPublishFilter('all');
                  }}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors',
                    active
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border-default bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text-primary'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 font-mono text-[10px]',
                      active
                        ? 'bg-accent-foreground/20 text-accent-foreground'
                        : 'bg-bg-primary text-text-secondary'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <Button variant="primary" size="sm" onClick={handleAddNew}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>
              {activeTab === 'professional'
                ? t('experience.addButton')
                : activeTab === 'academic'
                  ? t('experienceCms.academic.addButton')
                  : t('experienceCms.courses.addButton')}
            </span>
          </Button>
        </div>
      )}

      {/* Active Editors */}
      {editingExp && (
        <ProfessionalExperienceEditor
          initial={editingExp.item}
          isNew={editingExp.isNew}
          onDirtyChange={onDirtyChange}
          onCancel={() => {
            setEditingExp(null);
            onDirtyChange?.(false);
          }}
          onSave={async (saved) => {
            await saveExperience(saved);
            setEditingExp(null);
            notifySaved();
          }}
        />
      )}

      {editingEdu && (
        <AcademicExperienceEditor
          initial={editingEdu.item}
          isNew={editingEdu.isNew}
          onDirtyChange={onDirtyChange}
          onCancel={() => {
            setEditingEdu(null);
            onDirtyChange?.(false);
          }}
          onSave={async (saved) => {
            await saveEducation(saved);
            setEditingEdu(null);
            notifySaved();
          }}
        />
      )}

      {editingCourse && (
        <CourseDevelopmentEditor
          initial={editingCourse.item}
          isNew={editingCourse.isNew}
          onDirtyChange={onDirtyChange}
          onCancel={() => {
            setEditingCourse(null);
            onDirtyChange?.(false);
          }}
          onSave={async (saved) => {
            await saveCertification(saved);
            setEditingCourse(null);
            notifySaved();
          }}
        />
      )}

      {/* Search & Filter Bar + Records List */}
      {!isEditingAny && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary"
                aria-hidden="true"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="h-9 w-full rounded-[10px] border border-border-default bg-bg-secondary ps-9 pe-3 text-xs text-text-primary"
              />
            </div>

            <div className="flex items-center gap-1.5">
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

          {/* TAB 1 LIST: Professional Experience */}
          {activeTab === 'professional' && (
            <div className="space-y-3">
              {orderedExperience.length === 0 ? (
                <Card className="p-8 text-center text-xs text-text-secondary">
                  {t('experienceCms.emptyProfessional')}
                </Card>
              ) : (
                orderedExperience.map((item, idx) => (
                  <Card
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="muted" mono>
                          #{item.displayOrder}
                        </Badge>
                        <Badge
                          variant={item.isPublished !== false ? 'accent' : 'default'}
                        >
                          {item.isPublished !== false
                            ? t('common.visible')
                            : t('projects.draftBadge')}
                        </Badge>
                        <Badge variant="outline">
                          {t(
                            `experienceCms.employmentTypes.${
                              item.employmentType ?? 'full-time'
                            }`
                          )}
                        </Badge>
                        {item.isCurrent && (
                          <Badge variant="accent">
                            {t('experience.fields.isCurrent')}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary sm:text-base">
                        {pick(item.role)}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        {pick(item.company)} · {pick(item.period)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0 || isSaving}
                        onClick={() => void reorderExperience(item.id, 'up')}
                        aria-label={t('common.moveUp')}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === orderedExperience.length - 1 || isSaving}
                        onClick={() => void reorderExperience(item.id, 'down')}
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
                          await toggleExperiencePublished(item.id);
                          notifySaved();
                        }}
                        aria-label={
                          item.isPublished !== false
                            ? t('projects.unpublishAction')
                            : t('projects.publishAction')
                        }
                      >
                        {item.isPublished !== false ? (
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
                          await duplicateExperience(item.id);
                          notifySaved();
                        }}
                        aria-label={t('projects.duplicateAction')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingExp({ item, isNew: false })}
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
                            kind: 'professional',
                            id: item.id,
                            label: pick(item.role),
                          })
                        }
                        aria-label={t('common.delete')}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 2 LIST: Academic Experience */}
          {activeTab === 'academic' && (
            <div className="space-y-3">
              {orderedEducation.length === 0 ? (
                <Card className="p-8 text-center text-xs text-text-secondary">
                  {t('experienceCms.emptyAcademic')}
                </Card>
              ) : (
                orderedEducation.map((item, idx) => (
                  <Card
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="muted" mono>
                          #{item.displayOrder}
                        </Badge>
                        <Badge
                          variant={item.isPublished !== false ? 'accent' : 'default'}
                        >
                          {item.isPublished !== false
                            ? t('common.visible')
                            : t('projects.draftBadge')}
                        </Badge>
                        {pick(item.grade).trim() && (
                          <Badge variant="outline" mono>
                            {pick(item.grade)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary sm:text-base">
                        {pick(item.degree)}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        {pick(item.institution)} · {pick(item.period)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0 || isSaving}
                        onClick={() => void reorderEducation(item.id, 'up')}
                        aria-label={t('common.moveUp')}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === orderedEducation.length - 1 || isSaving}
                        onClick={() => void reorderEducation(item.id, 'down')}
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
                          await toggleEducationPublished(item.id);
                          notifySaved();
                        }}
                        aria-label={
                          item.isPublished !== false
                            ? t('projects.unpublishAction')
                            : t('projects.publishAction')
                        }
                      >
                        {item.isPublished !== false ? (
                          <Eye className="h-3.5 w-3.5 text-accent" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-text-secondary" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingEdu({ item, isNew: false })}
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
                            kind: 'academic',
                            id: item.id,
                            label: pick(item.degree),
                          })
                        }
                        aria-label={t('common.delete')}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 3 LIST: Courses & Professional Development */}
          {activeTab === 'courses' && (
            <div className="space-y-3">
              {orderedCourses.length === 0 ? (
                <Card className="p-8 text-center text-xs text-text-secondary">
                  {t('experienceCms.emptyCourses')}
                </Card>
              ) : (
                orderedCourses.map((item, idx) => (
                  <Card
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="muted" mono>
                          #{item.displayOrder}
                        </Badge>
                        <Badge
                          variant={item.isPublished !== false ? 'accent' : 'default'}
                        >
                          {item.isPublished !== false
                            ? t('common.visible')
                            : t('projects.draftBadge')}
                        </Badge>
                        <Badge variant="outline">
                          {t(
                            `experienceCms.courseTypes.${
                              item.courseType ?? 'course'
                            }`
                          )}
                        </Badge>
                        {item.mediaUrl && (
                          <Badge variant="accent">
                            {t('experienceCms.courses.hasCertificate')}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary sm:text-base">
                        {pick(item.title)}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        {pick(item.issuer)}
                        {pick(item.issueDate).trim()
                          ? ` · ${pick(item.issueDate)}`
                          : ''}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0 || isSaving}
                        onClick={() => void reorderCertification(item.id, 'up')}
                        aria-label={t('common.moveUp')}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === orderedCourses.length - 1 || isSaving}
                        onClick={() => void reorderCertification(item.id, 'down')}
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
                          await toggleCertificationPublished(item.id);
                          notifySaved();
                        }}
                        aria-label={
                          item.isPublished !== false
                            ? t('projects.unpublishAction')
                            : t('projects.publishAction')
                        }
                      >
                        {item.isPublished !== false ? (
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
                          await duplicateCertification(item.id);
                          notifySaved();
                        }}
                        aria-label={t('projects.duplicateAction')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingCourse({ item, isNew: false })}
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
                            kind: 'courses',
                            id: item.id,
                            label: pick(item.title),
                          })
                        }
                        aria-label={t('common.delete')}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget?.label ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
