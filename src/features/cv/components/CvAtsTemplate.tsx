import { useMemo } from 'react';
import type { CvSectionConfig } from '@/types/admin';
import type { Language, ProfileData } from '@/types/portfolio';
import type { TailoredProfileResult } from '@/types/recruiter';
import {
  buildTailoredCvHeadline,
  buildTailoredCvSummary,
  formatCvGrade,
  formatCvPhoneHref,
  getDistinctProjectDeliverables,
  isCvPlaceholderText,
  pickCvText,
  rankExperienceResponsibilities,
  rankSkillsWithinGroup,
} from '@/services/cvPresentation';
import {
  CvA4PaginatedPreview,
  type CvFlowBlock,
} from './CvA4PaginatedPreview';

export interface CvDocumentLabels {
  targetFocus: string;
  summary: string;
  experience: string;
  projects: string;
  skills: string;
  education: string;
  certifications: string;
  languages: string;
  technologies: string;
  grade: string;
  portfolio: string;
  linkedin: string;
  github: string;
  email: string;
  phone?: string;
  location: string;
  credentialId: string;
  customNote: string;
}

export interface CvTemplateCustomizations {
  customSummary?: string | null;
  excludedExperienceIds?: string[];
  excludedProjectIds?: string[];
  excludedSkillGroupIds?: string[];
  excludedSkillKeys?: string[];
}

export interface CvTemplateProps {
  profile: ProfileData;
  tailored: TailoredProfileResult;
  cvLanguage: Language;
  sections: CvSectionConfig[];
  labels: CvDocumentLabels;
  showContactEmail: boolean;
  showLinkedinLink: boolean;
  showCoursesSection: boolean;
  customizations?: CvTemplateCustomizations;
  onPageCountChange?: (count: number) => void;
}

export function CvAtsTemplate({
  profile,
  tailored,
  cvLanguage,
  sections,
  labels,
  showContactEmail,
  showLinkedinLink,
  showCoursesSection,
  customizations,
  onPageCountChange,
}: CvTemplateProps) {
  const blocks = useMemo<CvFlowBlock[]>(() => {
    const excludedExp = new Set(customizations?.excludedExperienceIds ?? []);
    const excludedProj = new Set(customizations?.excludedProjectIds ?? []);
    const excludedSkillGroups = new Set(customizations?.excludedSkillGroupIds ?? []);
    const excludedSkillKeys = new Set(customizations?.excludedSkillKeys ?? []);

    const visibleExperience = tailored.experience.filter(
      (e) => e.item.showInCv !== false && !excludedExp.has(e.item.id)
    );
    const visibleProjects = tailored.projects.filter(
      (p) => p.item.showInCv !== false && !excludedProj.has(p.item.id)
    );
    const visibleSkills = tailored.skills.filter(
      (s) => s.item.showInCv !== false && !excludedSkillGroups.has(s.item.id)
    );
    const visibleCerts = showCoursesSection
      ? tailored.certifications.filter((c) => c.item.showInCv !== false)
      : [];

    const headlineText = buildTailoredCvHeadline(profile, tailored, cvLanguage);
    const summaryText =
      customizations?.customSummary?.trim() ||
      buildTailoredCvSummary(profile, tailored, cvLanguage);

    const portfolioHref = profile.contact.websiteDisplay.startsWith('http')
      ? profile.contact.websiteDisplay
      : `https://${profile.contact.websiteDisplay}`;

    const list: CvFlowBlock[] = [];

    // Header Block
    list.push({
      id: 'ats-header',
      kind: 'header',
      marginTopPx: 0,
      node: (
        <header className="border-b-2 border-slate-900 pb-2.5 text-center">
          <h1 className="text-[18pt] font-bold leading-tight text-slate-950">
            {pickCvText(profile.fullName, cvLanguage)}
          </h1>
          <p className="mt-1 text-[9.8pt] font-semibold text-slate-700">
            {headlineText}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-[8.5pt] text-slate-700">
            <span>{pickCvText(profile.location, cvLanguage)}</span>
            {showContactEmail && profile.contact.email && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={`mailto:${profile.contact.email}`}
                  className="text-slate-900 underline decoration-slate-400"
                >
                  <bdi>{profile.contact.email}</bdi>
                </a>
              </>
            )}
            {profile.contact.phone?.trim() && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={formatCvPhoneHref(profile.contact.phone)}
                  className="text-slate-900 underline decoration-slate-400"
                >
                  <bdi>{profile.contact.phone.trim()}</bdi>
                </a>
              </>
            )}
            {showLinkedinLink && profile.contact.linkedinUrl && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={profile.contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 underline decoration-slate-400"
                >
                  {labels.linkedin}: <bdi>{profile.contact.linkedinDisplay}</bdi>
                </a>
              </>
            )}
            {profile.contact.githubUrl?.trim() && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={profile.contact.githubUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 underline decoration-slate-400"
                >
                  {labels.github}
                </a>
              </>
            )}
            {profile.contact.websiteDisplay && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={portfolioHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 underline decoration-slate-400"
                >
                  <bdi>{profile.contact.websiteDisplay}</bdi>
                </a>
              </>
            )}
          </div>
        </header>
      ),
    });

    const pushHeading = (key: string, title: string) => {
      list.push({
        id: `ats-heading-${key}`,
        kind: 'heading',
        marginTopPx: 14,
        node: (
          <h2 className="border-b border-slate-400 pb-1 text-[10.5pt] font-bold tracking-wide text-slate-950 uppercase">
            {title}
          </h2>
        ),
      });
    };

    for (const sec of sections.filter((s) => s.visible)) {
      switch (sec.key) {
        case 'summary':
          pushHeading('summary', labels.summary);
          list.push({
            id: 'ats-summary-body',
            kind: 'entry',
            marginTopPx: 6,
            node: (
              <div className="space-y-1">
                <p className="text-[9.3pt] leading-[1.52] text-slate-800">
                  {summaryText}
                </p>
                {tailored.isCustomRole && tailored.customTitle && (
                  <p className="text-[8.3pt] text-slate-600 italic">
                    {labels.customNote} {tailored.customTitle}
                  </p>
                )}
              </div>
            ),
          });
          break;

        case 'experience':
          if (visibleExperience.length === 0) break;
          pushHeading('experience', labels.experience);
          visibleExperience.forEach(({ item: exp }, idx) => {
            const orderedResponsibilities = rankExperienceResponsibilities(
              exp,
              tailored.position,
              tailored.selectedSkillIds
            );
            list.push({
              id: `ats-exp-${exp.id}`,
              kind: 'entry',
              marginTopPx: idx === 0 ? 7 : 10,
              node: (
                <article className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[9.8pt] font-bold text-slate-950">
                      {pickCvText(exp.role, cvLanguage)}
                    </h3>
                    <span className="shrink-0 text-[8.5pt] font-medium text-slate-600">
                      {pickCvText(exp.period, cvLanguage)}
                    </span>
                  </div>
                  <p className="text-[9.1pt] font-semibold text-slate-700">
                    {pickCvText(exp.company, cvLanguage)}
                    {exp.location
                      ? ` · ${pickCvText(exp.location, cvLanguage)}`
                      : ''}
                  </p>
                  {orderedResponsibilities.length > 0 && (
                    <ul className="list-disc space-y-0.5 ps-4 text-[9pt] leading-[1.46] text-slate-800">
                      {orderedResponsibilities.map((resp, rIdx) => (
                        <li key={rIdx}>{pickCvText(resp, cvLanguage)}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ),
            });
          });
          break;

        case 'projects':
          if (visibleProjects.length === 0) break;
          pushHeading('projects', labels.projects);
          visibleProjects.forEach(({ item: project, tier }, idx) => {
            const shortDesc = pickCvText(project.shortDescription, cvLanguage);
            const distinctDeliverables = getDistinctProjectDeliverables(
              project,
              cvLanguage,
              tier === 'supporting' ? 1 : 3
            );
            const isCompactSupporting =
              tailored.position.id !== 'general-engineering' &&
              tier === 'supporting';

            list.push({
              id: `ats-proj-${project.id}`,
              kind: 'entry',
              marginTopPx: idx === 0 ? 7 : 9,
              node: isCompactSupporting ? (
                <article className="text-[8.9pt] leading-[1.46] text-slate-700">
                  <span className="font-bold text-slate-950">
                    <bdi>{pickCvText(project.title, cvLanguage)}</bdi>
                  </span>
                  {shortDesc ? ` — ${shortDesc}` : ''}
                  {project.technologies.length > 0 && (
                    <span className="text-[8.3pt] text-slate-600">
                      {' '}
                      (<bdi>{project.technologies.join(', ')}</bdi>)
                    </span>
                  )}
                </article>
              ) : (
                <article className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[9.7pt] font-bold text-slate-950">
                      <bdi>{pickCvText(project.title, cvLanguage)}</bdi>
                    </h3>
                    <span className="shrink-0 text-[8.4pt] text-slate-600">
                      {pickCvText(project.kindLabel, cvLanguage)}
                    </span>
                  </div>
                  {shortDesc && (
                    <p className="text-[9pt] leading-[1.45] text-slate-800">
                      {shortDesc}
                    </p>
                  )}
                  {distinctDeliverables.length > 0 && (
                    <ul className="list-disc space-y-0.5 ps-4 text-[8.8pt] leading-[1.43] text-slate-700">
                      {distinctDeliverables.map((delivText, dIdx) => (
                        <li key={dIdx}>{delivText}</li>
                      ))}
                    </ul>
                  )}
                  {project.technologies.length > 0 && (
                    <p className="text-[8.4pt] text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {labels.technologies}:
                      </span>{' '}
                      <bdi>{project.technologies.join(', ')}</bdi>
                    </p>
                  )}
                </article>
              ),
            });
          });
          break;

        case 'skills': {
          const renderedGroups = visibleSkills
            .map(({ item: group }) => {
              const orderedSkills = rankSkillsWithinGroup(
                group,
                tailored.position,
                tailored.selectedSkillIds
              ).filter((sk) => !excludedSkillKeys.has(`${group.id}::${sk.en}`));
              return { group, orderedSkills };
            })
            .filter((entry) => entry.orderedSkills.length > 0);

          if (renderedGroups.length === 0 && profile.languages.length === 0) break;
          pushHeading('skills', labels.skills);

          renderedGroups.forEach(({ group, orderedSkills }, idx) => {
            list.push({
              id: `ats-skill-${group.id}`,
              kind: 'entry',
              marginTopPx: idx === 0 ? 6 : 5,
              node: (
                <p className="text-[9pt] leading-[1.46] text-slate-800">
                  <span className="font-bold text-slate-950">
                    {pickCvText(group.title, cvLanguage)}:
                  </span>{' '}
                  {orderedSkills.map((s, sIdx) => (
                    <span key={sIdx}>
                      {sIdx > 0 ? ' · ' : ''}
                      <bdi>{pickCvText(s, cvLanguage)}</bdi>
                    </span>
                  ))}
                </p>
              ),
            });
          });

          if (profile.languages.length > 0) {
            list.push({
              id: 'ats-languages',
              kind: 'entry',
              marginTopPx: 5,
              node: (
                <p className="text-[9pt] leading-[1.46] text-slate-800">
                  <span className="font-bold text-slate-950">
                    {labels.languages}:
                  </span>{' '}
                  {profile.languages
                    .map(
                      (l) =>
                        `${pickCvText(l.name, cvLanguage)} (${pickCvText(l.proficiency, cvLanguage)})`
                    )
                    .join(' · ')}
                </p>
              ),
            });
          }
          break;
        }

        case 'education':
          if (tailored.education.length === 0) break;
          pushHeading('education', labels.education);
          tailored.education.forEach((edu, idx) => {
            const gradeDisplay = edu.grade
              ? formatCvGrade(pickCvText(edu.grade, cvLanguage), labels.grade)
              : '';
            list.push({
              id: `ats-edu-${edu.id}`,
              kind: 'entry',
              marginTopPx: idx === 0 ? 6 : 6,
              node: (
                <article className="space-y-0.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[9.7pt] font-bold text-slate-950">
                      {pickCvText(edu.degree, cvLanguage)}
                    </h3>
                    <span className="shrink-0 text-[8.5pt] font-medium text-slate-600">
                      {pickCvText(edu.period, cvLanguage)}
                    </span>
                  </div>
                  <p className="text-[9pt] text-slate-700">
                    {pickCvText(edu.institution, cvLanguage)}
                    {gradeDisplay ? ` · ${gradeDisplay}` : ''}
                  </p>
                </article>
              ),
            });
          });
          break;

        case 'certifications':
          if (visibleCerts.length === 0) break;
          pushHeading('certifications', labels.certifications);
          visibleCerts.forEach(({ item: cert }, idx) => {
            const issuerText = pickCvText(cert.issuer, cvLanguage);
            const dateText = pickCvText(cert.issueDate, cvLanguage);
            const metaParts: string[] = [pickCvText(cert.category, cvLanguage)];
            if (issuerText && !isCvPlaceholderText(issuerText)) {
              metaParts.push(issuerText);
            }
            if (dateText && !isCvPlaceholderText(dateText)) {
              metaParts.push(dateText);
            }
            list.push({
              id: `ats-cert-${cert.id}`,
              kind: 'entry',
              marginTopPx: idx === 0 ? 6 : 4,
              node: (
                <p className="text-[9pt] leading-[1.45] text-slate-800">
                  <span className="font-semibold text-slate-950">
                    <bdi>{pickCvText(cert.title, cvLanguage)}</bdi>
                  </span>
                  {metaParts.length > 0 && (
                    <span className="text-slate-600">
                      {' '}
                      — {metaParts.join(' · ')}
                    </span>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ms-1.5 text-[8.4pt] text-slate-700 underline"
                    >
                      [{cert.credentialId}]
                    </a>
                  )}
                </p>
              ),
            });
          });
          break;
      }
    }

    return list;
  }, [
    profile,
    tailored,
    cvLanguage,
    sections,
    labels,
    showContactEmail,
    showLinkedinLink,
    showCoursesSection,
    customizations,
  ]);

  const layoutKey = `ats-${cvLanguage}-${tailored.position.id}-${sections.map((s) => `${s.key}:${s.visible}`).join(',')}-${customizations?.customSummary?.length ?? 0}-${customizations?.excludedExperienceIds?.length ?? 0}-${customizations?.excludedProjectIds?.length ?? 0}-${customizations?.excludedSkillGroupIds?.length ?? 0}-${customizations?.excludedSkillKeys?.length ?? 0}`;

  return (
    <CvA4PaginatedPreview
      blocks={blocks}
      cvLanguage={cvLanguage}
      layoutKey={layoutKey}
      onPageCountChange={onPageCountChange}
    />
  );
}
