import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Award,
  Calendar,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { MatchingMetadataFields } from '@/features/admin/components/MatchingMetadataFields';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminData } from '@/features/admin/context/useAdminData';
import {
  deleteCertificateFileAsset,
  uploadCertificateFile,
} from '@/services/portfolioService';
import type { Certification, CourseType } from '@/types/portfolio';
import { cn } from '@/utils/cn';

type SubTab = 'basic' | 'skills-outcomes' | 'certificate';

const COURSE_TYPES: CourseType[] = [
  'course',
  'technical-training',
  'workshop',
  'certification',
  'internship',
  'other',
];

const CERT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf';

interface CourseDevelopmentEditorProps {
  initial: Certification;
  isNew: boolean;
  onSave: (item: Certification) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function CourseDevelopmentEditor({
  initial,
  isNew,
  onSave,
  onCancel,
  onDirtyChange,
}: CourseDevelopmentEditorProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  const { skills: skillGroups, isSaving } = useAdminData();

  const [subTab, setSubTab] = useState<SubTab>('basic');
  const [form, setForm] = useState<Certification>(() => ({
    ...structuredClone(initial),
    courseType: initial.courseType ?? 'course',
    skills: [...(initial.skills ?? [])],
    learningOutcomes: structuredClone(initial.learningOutcomes ?? []),
    isPublished: initial.isPublished !== false,
  }));
  const [skillInput, setSkillInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialSnap = useMemo(() => JSON.stringify(initial), [initial]);
  const isDirty = useMemo(
    () => isNew || JSON.stringify(form) !== initialSnap,
    [form, initialSnap, isNew]
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const globalSkillSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const grp of skillGroups) {
      for (const s of grp.skills) {
        if (s.en.trim()) set.add(s.en.trim());
      }
    }
    return Array.from(set);
  }, [skillGroups]);

  const addSkillTag = (value?: string) => {
    const clean = (value ?? skillInput).trim();
    if (!clean) return;
    setForm((p) => {
      const current = p.skills ?? [];
      if (current.includes(clean)) return p;
      return { ...p, skills: [...current, clean] };
    });
    if (!value) setSkillInput('');
  };

  const handleUploadCertificate = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const prevPath = form.certificateStoragePath;
      const res = await uploadCertificateFile(file, form.id);
      if (prevPath) {
        void deleteCertificateFileAsset(prevPath).catch(() => undefined);
      }
      setForm((p) => ({
        ...p,
        mediaUrl: res.url,
        certificateStoragePath: res.storagePath,
        certificateMimeType: res.mimeType,
        certificateFileName: res.fileName,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCertificate = () => {
    if (form.certificateStoragePath) {
      void deleteCertificateFileAsset(form.certificateStoragePath).catch(
        () => undefined
      );
    }
    setForm((p) => ({
      ...p,
      mediaUrl: null,
      certificateStoragePath: null,
      certificateMimeType: null,
      certificateFileName: null,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.en.trim() || !form.title.ar.trim() || !form.issuer.en.trim()) {
      setError(t('common.validationRequired'));
      setSubTab('basic');
      return;
    }

    const cleanOutcomes = (form.learningOutcomes ?? []).filter(
      (o) => o.en.trim() || o.ar.trim()
    );
    const issueEn =
      form.issueDate.en.trim() || form.completionDate || form.startDate || '';
    const issueAr =
      form.issueDate.ar.trim() || form.completionDate || form.startDate || '';

    setError(null);
    try {
      await onSave({
        ...form,
        issuer: {
          en: form.issuer.en.trim(),
          ar: form.issuer.ar.trim() || form.issuer.en.trim(),
        },
        category: {
          en:
            form.category.en.trim() ||
            t(`experienceCms.courseTypes.${form.courseType ?? 'course'}`),
          ar:
            form.category.ar.trim() ||
            form.category.en.trim() ||
            t(`experienceCms.courseTypes.${form.courseType ?? 'course'}`),
        },
        issueDate: { en: issueEn, ar: issueAr },
        credentialId: form.credentialId.trim(),
        credentialUrl: form.credentialUrl?.trim() ? form.credentialUrl.trim() : null,
        learningOutcomes: cleanOutcomes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const isPdf =
    form.certificateMimeType === 'application/pdf' ||
    Boolean(form.mediaUrl?.toLowerCase().endsWith('.pdf'));

  const tabs: Array<{ id: SubTab; label: string }> = [
    { id: 'basic', label: t('experienceCms.courses.subTabBasic') },
    {
      id: 'skills-outcomes',
      label: `${t('experienceCms.courses.subTabSkills')} (${
        (form.skills?.length ?? 0) + (form.learningOutcomes?.length ?? 0)
      })`,
    },
    { id: 'certificate', label: t('experienceCms.courses.subTabCertificate') },
  ];

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">
              {isNew
                ? t('experienceCms.courses.createHeading')
                : t('experienceCms.courses.editHeading')}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={form.isPublished !== false ? 'accent' : 'default'}>
                {form.isPublished !== false
                  ? t('common.visible')
                  : t('projects.draftBadge')}
              </Badge>
              {isDirty && <Badge variant="muted">{t('projects.unsavedTag')}</Badge>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving || uploading}>
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-error/40 bg-error-subtle px-4 py-2.5 text-xs text-error"
          >
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-border-default pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={cn(
                'cursor-pointer rounded-[10px] border px-3 py-1.5 text-xs font-medium transition-colors',
                subTab === tab.id
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border-default bg-bg-primary text-text-secondary hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SUB-TAB 1: Basic & Description */}
        {subTab === 'basic' && (
          <div className="space-y-5">
            <SectionMappingBadge
              location={t('experienceCms.mapCourses')}
              sharedWith={[t('nav.pageCertifications'), t('nav.featureCvBuilder')]}
            />

            <LocalizedFieldGroup
              idPrefix="course-title"
              label={t('experienceCms.courses.title')}
              required
              value={form.title}
              onChange={(title) => setForm((p) => ({ ...p, title }))}
            />

            <LocalizedFieldGroup
              idPrefix="course-issuer"
              label={t('experienceCms.courses.provider')}
              required
              value={form.issuer}
              onChange={(issuer) => setForm((p) => ({ ...p, issuer }))}
            />

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="course-type"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experienceCms.courses.courseType')}
                </label>
                <select
                  id="course-type"
                  value={form.courseType ?? 'course'}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      courseType: e.target.value as CourseType,
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  {COURSE_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {t(`experienceCms.courseTypes.${ct}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="course-start"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.startDate')}
                </label>
                <input
                  id="course-start"
                  dir="ltr"
                  value={form.startDate ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value || null }))
                  }
                  placeholder="2025-06"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="course-end"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('projects.fields.completionDate')}
                </label>
                <input
                  id="course-end"
                  dir="ltr"
                  value={form.completionDate ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      completionDate: e.target.value || null,
                    }))
                  }
                  placeholder="2025-08"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="course-order"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.displayOrder')}
                </label>
                <input
                  id="course-order"
                  type="number"
                  min={1}
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      displayOrder: Math.max(1, Number(e.target.value) || 1),
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LocalizedFieldGroup
                idPrefix="course-duration"
                label={t('experienceCms.courses.duration')}
                value={form.duration ?? { en: '', ar: '' }}
                onChange={(duration) =>
                  setForm((p) => ({
                    ...p,
                    duration:
                      duration.en.trim() || duration.ar.trim() ? duration : undefined,
                  }))
                }
              />
              <LocalizedFieldGroup
                idPrefix="course-location"
                label={t('experience.fields.location')}
                value={form.location ?? { en: '', ar: '' }}
                onChange={(location) =>
                  setForm((p) => ({
                    ...p,
                    location:
                      location.en.trim() || location.ar.trim() ? location : undefined,
                  }))
                }
              />
            </div>

            <LocalizedFieldGroup
              idPrefix="course-desc"
              label={t('projects.fields.shortDescription')}
              multiline
              rows={2}
              value={form.description ?? { en: '', ar: '' }}
              onChange={(description) =>
                setForm((p) => ({
                  ...p,
                  description:
                    description.en.trim() || description.ar.trim()
                      ? description
                      : undefined,
                }))
              }
            />

            <LocalizedFieldGroup
              idPrefix="course-detailed"
              label={t('experienceCms.fields.detailedDescription')}
              multiline
              rows={3}
              value={form.detailedDescription ?? { en: '', ar: '' }}
              onChange={(detailedDescription) =>
                setForm((p) => ({
                  ...p,
                  detailedDescription:
                    detailedDescription.en.trim() || detailedDescription.ar.trim()
                      ? detailedDescription
                      : undefined,
                }))
              }
            />

            <div className="border-t border-border-default pt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={form.isPublished !== false}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isPublished: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-accent"
                />
                <span>{t('experienceCms.fields.published')}</span>
              </label>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: Skills & Learning Outcomes */}
        {subTab === 'skills-outcomes' && (
          <div className="space-y-6">
            <SectionMappingBadge location={t('experienceCms.mapCoursesSkills')} />

            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-primary">
                {t('experienceCms.courses.skillsCovered')} ({(form.skills ?? []).length})
              </p>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkillTag();
                    }
                  }}
                  placeholder={t('projects.fields.addTechPlaceholder')}
                  className="h-9 flex-1 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addSkillTag()}
                >
                  {t('projects.fields.addTech')}
                </Button>
              </div>

              {(form.skills ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(form.skills ?? []).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-subtle px-2.5 py-1 text-xs font-medium text-accent"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            skills: (p.skills ?? []).filter((s) => s !== skill),
                          }))
                        }
                        className="cursor-pointer hover:text-error"
                        aria-label={t('common.delete')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {globalSkillSuggestions.length > 0 && (
                <div className="space-y-1.5 rounded-xl border border-border-default bg-bg-primary p-3">
                  <p className="text-[11px] font-medium text-text-secondary">
                    {t('projects.toolsMgr.pickFromSkills')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {globalSkillSuggestions.map((s) => {
                      const active = (form.skills ?? []).includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            active
                              ? setForm((p) => ({
                                  ...p,
                                  skills: (p.skills ?? []).filter((x) => x !== s),
                                }))
                              : addSkillTag(s)
                          }
                          className={cn(
                            'cursor-pointer rounded-md border px-2 py-1 text-[11px] transition-colors',
                            active
                              ? 'border-accent bg-accent text-accent-foreground'
                              : 'border-border-default bg-bg-secondary text-text-secondary hover:border-accent hover:text-text-primary'
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Learning Outcomes */}
            <div className="space-y-3 border-t border-border-default pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-primary">
                  {t('experienceCms.courses.outcomesHeading')} (
                  {(form.learningOutcomes ?? []).length})
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      learningOutcomes: [
                        ...(p.learningOutcomes ?? []),
                        { en: '', ar: '' },
                      ],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('experienceCms.courses.addOutcome')}</span>
                </Button>
              </div>
              {(form.learningOutcomes ?? []).map((out, idx) => (
                <div
                  key={`outcome-${idx}`}
                  className="flex items-start gap-2 rounded-xl border border-border-default bg-bg-primary p-3"
                >
                  <div className="flex-1">
                    <LocalizedFieldGroup
                      idPrefix={`course-outcome-${idx}`}
                      label={`#${idx + 1}`}
                      value={out}
                      onChange={(val) =>
                        setForm((p) => ({
                          ...p,
                          learningOutcomes: (p.learningOutcomes ?? []).map(
                            (o, i) => (i === idx ? val : o)
                          ),
                        }))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        learningOutcomes: (p.learningOutcomes ?? []).filter(
                          (_, i) => i !== idx
                        ),
                      }))
                    }
                    className="mt-6 text-error hover:text-error"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: Certificate & Credentials */}
        {subTab === 'certificate' && (
          <div className="space-y-5">
            <SectionMappingBadge location={t('experienceCms.mapCoursesCert')} />

            {/* Certificate Upload & Preview */}
            <div className="space-y-3 rounded-xl border border-border-default bg-bg-primary p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {t('experienceCms.courses.certificateUploadHeading')}
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {t('experienceCms.courses.certificateUploadHint')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id="course-cert-upload"
                    type="file"
                    accept={CERT_ACCEPT}
                    onChange={(e) => void handleUploadCertificate(e)}
                    className="sr-only"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {uploading
                        ? t('media.uploading')
                        : form.mediaUrl
                          ? t('experienceCms.courses.replaceCertificate')
                          : t('experienceCms.courses.uploadCertificate')}
                    </span>
                  </Button>
                  {form.mediaUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCertificate}
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t('common.delete')}</span>
                    </Button>
                  )}
                </div>
              </div>

              {form.mediaUrl && (
                <div className="rounded-lg border border-border-default bg-bg-secondary p-3">
                  {isPdf ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
                        <FileText className="h-4 w-4 text-accent" />
                        <span>{form.certificateFileName || 'Certificate.pdf'}</span>
                      </div>
                      <a
                        href={form.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                      >
                        <span>{t('experienceCms.courses.previewPdf')}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <img
                      src={form.mediaUrl}
                      alt={pick(form.title)}
                      className="max-h-56 w-auto rounded-lg border border-border-default object-contain"
                    />
                  )}
                </div>
              )}
            </div>

            <LocalizedFieldGroup
              idPrefix="course-issue-date"
              label={t('experienceCms.courses.issueDate')}
              value={form.issueDate}
              onChange={(issueDate) => setForm((p) => ({ ...p, issueDate }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="course-cred-id"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experienceCms.courses.credentialId')}
                </label>
                <input
                  id="course-cred-id"
                  dir="ltr"
                  value={form.credentialId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, credentialId: e.target.value }))
                  }
                  placeholder="CERT-2025-XXXX"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="course-cred-url"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experienceCms.courses.credentialUrl')}
                </label>
                <input
                  id="course-cred-url"
                  dir="ltr"
                  value={form.credentialUrl ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      credentialUrl: e.target.value.trim() ? e.target.value : null,
                    }))
                  }
                  placeholder="https://..."
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
            </div>

            <MatchingMetadataFields
              idPrefix="course-match"
              matchingTags={form.matchingTags ?? []}
              onTagsChange={(matchingTags) => setForm((p) => ({ ...p, matchingTags }))}
              showPriority={false}
              showInCv={form.showInCv !== false}
              onShowInCvChange={(showInCv) => setForm((p) => ({ ...p, showInCv }))}
            />
          </div>
        )}
      </Card>

      {/* Live Unsaved Preview */}
      <Card className="space-y-3 border-accent/30 bg-bg-secondary/60 p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
          {t('experienceCms.livePreviewHeading')}
        </p>
        <div className="rounded-xl border border-border-default bg-bg-primary p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <Badge variant="accent">
                {t(`experienceCms.courseTypes.${form.courseType ?? 'course'}`)}
              </Badge>
              <h3 className="text-base font-semibold text-text-primary">
                {pick(form.title) || '—'}
              </h3>
              <p className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Award className="h-3.5 w-3.5 text-accent" />
                <span>{pick(form.issuer) || '—'}</span>
              </p>
            </div>
            {(pick(form.issueDate).trim() || form.completionDate) && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-secondary px-2.5 py-1 font-mono text-[11px] text-text-secondary">
                <Calendar className="h-3 w-3 text-accent" />
                {pick(form.issueDate) || form.completionDate}
              </span>
            )}
          </div>
          {form.description && pick(form.description).trim() && (
            <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
              {pick(form.description)}
            </p>
          )}
        </div>
      </Card>
    </form>
  );
}
