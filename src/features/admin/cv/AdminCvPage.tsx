import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import type { CvSectionKey, CvWorkspaceConfig } from '@/types/admin';

export function AdminCvPage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('cv.pageTitle'));

  const {
    profile,
    education,
    experience,
    projects,
    skills,
    certifications,
    cvConfig,
    updateCvConfig,
  } = useAdminData();

  const [draft, setDraft] = useState<CvWorkspaceConfig>(() => structuredClone(cvConfig));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(structuredClone(cvConfig));
  }, [cvConfig]);

  const toggleId = (
    field:
      | 'selectedEducationIds'
      | 'selectedExperienceIds'
      | 'selectedProjectIds'
      | 'selectedSkillGroupIds'
      | 'selectedCertificationIds',
    id: string
  ) => {
    setDraft((prev) => {
      const current = prev[field];
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return { ...prev, [field]: next };
    });
  };

  const moveSection = (key: CvSectionKey, dir: 'up' | 'down') => {
    setDraft((prev) => {
      const list = [...prev.sections];
      const idx = list.findIndex((s) => s.key === key);
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (idx < 0 || swap < 0 || swap >= list.length) return prev;
      const a = list[idx]!;
      const b = list[swap]!;
      list[idx] = b;
      list[swap] = a;
      return { ...prev, sections: list };
    });
  };

  const toggleSectionVisibility = (key: CvSectionKey) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.key === key ? { ...s, visible: !s.visible } : s
      ),
    }));
  };

  const handleSave = async () => {
    try {
      await updateCvConfig(draft);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      // Error surfaced via PrototypeBanner
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('cv.title')}
        subtitle={t('cv.subtitle')}
        actions={
          <Button variant="primary" size="md" onClick={() => void handleSave()}>
            {t('common.save')}
          </Button>
        }
      />

      <PrototypeBanner compact />

      {saved && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-subtle px-4 py-2.5 text-xs font-medium text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('prototype.savedInMemory')}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left Controls */}
        <div className="space-y-6 xl:col-span-7">
          {/* Target Role & Summary */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-semibold text-text-primary">
              {t('cv.profileSection')}
            </h2>

            <LocalizedFieldGroup
              idPrefix="cv-target"
              label={t('cv.targetRole')}
              value={draft.targetRole}
              onChange={(targetRole) => setDraft((p) => ({ ...p, targetRole }))}
            />

            <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={draft.useProfileSummary}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, useProfileSummary: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-accent"
              />
              <span>{t('cv.useProfileSummary')}</span>
            </label>

            {!draft.useProfileSummary && (
              <LocalizedFieldGroup
                idPrefix="cv-summary"
                label={t('cv.customSummary')}
                multiline
                rows={3}
                value={draft.customSummary}
                onChange={(customSummary) => setDraft((p) => ({ ...p, customSummary }))}
              />
            )}
          </Card>

          {/* Section Order & Visibility */}
          <Card className="space-y-3 p-5">
            <h2 className="text-base font-semibold text-text-primary">
              {t('cv.sectionOrderHeading')}
            </h2>
            <div className="space-y-2">
              {draft.sections.map((section, idx) => (
                <div
                  key={section.key}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border-default bg-bg-primary px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-accent">0{idx + 1}</span>
                    <span className="text-sm font-medium text-text-primary">
                      {t(`cv.sections.${section.key}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(section.key, 'up')}
                      aria-label={t('common.moveUp')}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === draft.sections.length - 1}
                      onClick={() => moveSection(section.key, 'down')}
                      aria-label={t('common.moveDown')}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(section.key)}
                      aria-label={section.visible ? t('common.hidden') : t('common.visible')}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-default text-text-secondary hover:border-accent hover:text-accent cursor-pointer"
                    >
                      {section.visible ? (
                        <Eye className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Content Selection */}
          <Card className="space-y-5 p-5">
            <h2 className="text-base font-semibold text-text-primary">
              {t('cv.selectionHeading')}
            </h2>

            {/* Experience Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">
                  {t('cv.sections.experience')}
                </span>
                <span className="font-mono text-text-secondary">
                  {t('cv.selectedCount', {
                    selected: draft.selectedExperienceIds.length,
                    total: experience.length,
                  })}
                </span>
              </div>
              {experience.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 rounded-lg border border-border-default bg-bg-primary p-2.5 text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={draft.selectedExperienceIds.includes(item.id)}
                    onChange={() => toggleId('selectedExperienceIds', item.id)}
                    className="mt-0.5 h-4 w-4 rounded accent-accent"
                  />
                  <span>
                    <span className="font-medium text-text-primary">{pick(item.role)}</span>
                    <span className="block text-text-secondary">{pick(item.company)}</span>
                  </span>
                </label>
              ))}
            </div>

            {/* Projects Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">
                  {t('cv.sections.projects')}
                </span>
                <span className="font-mono text-text-secondary">
                  {t('cv.selectedCount', {
                    selected: draft.selectedProjectIds.length,
                    total: projects.length,
                  })}
                </span>
              </div>
              {projects.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 rounded-lg border border-border-default bg-bg-primary p-2.5 text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={draft.selectedProjectIds.includes(item.id)}
                    onChange={() => toggleId('selectedProjectIds', item.id)}
                    className="mt-0.5 h-4 w-4 rounded accent-accent"
                  />
                  <span className="font-medium text-text-primary">{pick(item.title)}</span>
                </label>
              ))}
            </div>

            {/* Education, Skills, Certifications */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-text-primary">
                  {t('cv.sections.education')}
                </p>
                {education.map((edu) => (
                  <label key={edu.id} className="flex items-start gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.selectedEducationIds.includes(edu.id)}
                      onChange={() => toggleId('selectedEducationIds', edu.id)}
                      className="mt-0.5 h-3.5 w-3.5 accent-accent"
                    />
                    <span className="text-text-secondary">{pick(edu.degree)}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-text-primary">
                  {t('cv.sections.skills')}
                </p>
                {skills.map((skl) => (
                  <label key={skl.id} className="flex items-start gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.selectedSkillGroupIds.includes(skl.id)}
                      onChange={() => toggleId('selectedSkillGroupIds', skl.id)}
                      className="mt-0.5 h-3.5 w-3.5 accent-accent"
                    />
                    <span className="text-text-secondary">{pick(skl.title)}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-text-primary">
                  {t('cv.sections.certifications')}
                </p>
                {certifications.map((cert) => (
                  <label key={cert.id} className="flex items-start gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.selectedCertificationIds.includes(cert.id)}
                      onChange={() => toggleId('selectedCertificationIds', cert.id)}
                      className="mt-0.5 h-3.5 w-3.5 accent-accent"
                    />
                    <span className="text-text-secondary">{pick(cert.title)}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Live Structured CV Outline Preview */}
        <aside className="xl:col-span-5">
          <Card elevated className="sticky top-24 space-y-4 p-5">
            <div className="flex items-center justify-between gap-2 border-b border-border-default pb-3">
              <h2 className="text-sm font-semibold text-text-primary">
                {t('cv.previewHeading')}
              </h2>
              <Badge variant="muted" mono>
                {t('cv.structureOnly')}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-lg font-bold text-text-primary">
                {pick(profile.fullName)}
              </p>
              <p className="text-xs font-medium text-accent">
                {pick(draft.targetRole)}
              </p>
              <p className="font-mono text-[11px] text-text-secondary">
                {profile.contact.email} · {pick(profile.location)}
              </p>
            </div>

            <div className="space-y-3 border-t border-border-default pt-3">
              {draft.sections
                .filter((s) => s.visible)
                .map((section) => (
                  <div
                    key={section.key}
                    className="rounded-xl border border-border-default bg-bg-primary p-3 text-xs"
                  >
                    <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase text-accent">
                      {t(`cv.sections.${section.key}`)}
                    </p>
                    {section.key === 'summary' && (
                      <p className="leading-relaxed text-text-secondary">
                        {pick(
                          draft.useProfileSummary ? profile.summary : draft.customSummary
                        )}
                      </p>
                    )}
                    {section.key === 'experience' && (
                      <ul className="space-y-1 text-text-secondary">
                        {experience
                          .filter((e) => draft.selectedExperienceIds.includes(e.id))
                          .map((e) => (
                            <li key={e.id}>
                              • {pick(e.role)} — {pick(e.company)}
                            </li>
                          ))}
                      </ul>
                    )}
                    {section.key === 'education' && (
                      <ul className="space-y-1 text-text-secondary">
                        {education
                          .filter((e) => draft.selectedEducationIds.includes(e.id))
                          .map((e) => (
                            <li key={e.id}>
                              • {pick(e.degree)} ({e.graduationYear})
                            </li>
                          ))}
                      </ul>
                    )}
                    {section.key === 'projects' && (
                      <ul className="space-y-1 text-text-secondary">
                        {projects
                          .filter((p) => draft.selectedProjectIds.includes(p.id))
                          .map((p) => (
                            <li key={p.id}>• {pick(p.title)}</li>
                          ))}
                      </ul>
                    )}
                    {section.key === 'skills' && (
                      <ul className="space-y-1 text-text-secondary">
                        {skills
                          .filter((s) => draft.selectedSkillGroupIds.includes(s.id))
                          .map((s) => (
                            <li key={s.id}>• {pick(s.title)}</li>
                          ))}
                      </ul>
                    )}
                    {section.key === 'certifications' && (
                      <ul className="space-y-1 text-text-secondary">
                        {certifications
                          .filter((c) => draft.selectedCertificationIds.includes(c.id))
                          .map((c) => (
                            <li key={c.id}>• {pick(c.title)}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
