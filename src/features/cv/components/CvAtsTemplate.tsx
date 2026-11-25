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
}: CvTemplateProps) {
  const isRtl = cvLanguage === 'ar';
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

  const renderSection = (sectionKey: CvSectionConfig['key']) => {
    switch (sectionKey) {
      case 'summary':
        return (
          <section key="summary" className="cv-section space-y-1.5">
            <h2 className="cv-section-heading border-b border-slate-400 pb-1 text-[10.5pt] font-bold tracking-wide text-slate-950 uppercase">
              {labels.summary}
            </h2>
            <p className="cv-entry-block text-[9.3pt] leading-[1.52] text-slate-800">
              {summaryText}
            </p>
            {tailored.isCustomRole && tailored.customTitle && (
              <p className="text-[8.3pt] text-slate-600 italic">
                {labels.customNote} {tailored.customTitle}
              </p>
            )}
          </section>
        );

      case 'experience':
        if (visibleExperience.length === 0) return null;
        return (
          <section key="experience" className="cv-section space-y-2">
            <h2 className="cv-section-heading border-b border-slate-400 pb-1 text-[10.5pt] font-bold tracking-wide text-slate-950 uppercase">
              {labels.experience}
            </h2>
            <div className="space-y-2.5">
              {visibleExperience.map(({ item: exp }) => {
                const orderedResponsibilities = rankExperienceResponsibilities(
                  exp,
                  tailored.position,
                  tailored.selectedSkillIds
                );
                return (
                  <article key={exp.id} className="cv-entry-block space-y-1">
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
                        {orderedResponsibilities.map((resp, idx) => (
                          <li key={idx}>{pickCvText(resp, cvLanguage)}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );

      case 'projects':
        if (visibleProjects.length === 0) return null;
        return (
          <section key="projects" className="cv-section space-y-2">
            <h2 className="cv-section-heading border-b border-slate-400 pb-1 text-[10.5pt] font-bold tracking-wide text-slate-950 uppercase">
              {labels.projects}
            </h2>
            <div className="space-y-2.5">
              {visibleProjects.map(({ item: project, tier }) => {
                const shortDesc = pickCvText(project.shortDescription, cvLanguage);
                const distinctDeliverables = getDistinctProjectDeliverables(
                  project,
                  cvLanguage,
                  tier === 'supporting' ? 1 : 3
                );
                const isCompactSupporting =
                  tailored.position.id !== 'general-engineering' &&
                  tier === 'supporting';

                if (isCompactSupporting) {
                  return (
                    <article
                      key={project.id}
                      className="cv-entry-block text-[8.9pt] leading-[1.46] text-slate-700"
                    >
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
                  );
                }

                return (
                  <article key={project.id} className="cv-entry-block space-y-1">
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
                        {distinctDeliverables.map((delivText, idx) => (
                          <li key={idx}>{delivText}</li>
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
                );
              })}
            </div>
          </section>
        );

      case 'skills': {
        if (visibleSkills.length === 0) return null;
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

        if (renderedGroups.length === 0 && profile.languages.length === 0) return null;

        return (
          <section key="skills" className="cv-section space-y-1.5">
            <h2 className="cv-section-heading border-b border-slate-400 pb-1 text-[10.5pt] font-bold tracking-wide text-slate-950 uppercase">
              {labels.skills}
            </h2>
            <div className="space-y-1.5">
              {renderedGroups.map(({ group, orderedSkills }) => (
                <p
                  key={group.id}
                  className="cv-entry-block text-[9pt] leading-[1.46] text-slate-800"
                >
                  <span className="font-bold text-slate-950">
                    {pickCvText(group.title, cvLanguage)}:
                  </span>{' '}
                  {orderedSkills.map((s, idx) => (
                    <span key={idx}>
                      {idx > 0 ? ' · ' : ''}
                      <bdi>{pickCvText(s, cvLanguage)}</bdi>
                    </span>
                  ))}
                </p>
              ))}
              {profile.languages.length > 0 && (
                <p className="cv-entry-block text-[9pt] leading-[1.46] text-slate-800">
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
              )}
            </div>
          </section>
        );
      }

      case 'education':
        if (tailored.education.length === 0) return null;
        return (
          <section key="education" className="cv-section space-y-1.5">
            <h2 className="cv-section-heading border-b border-slate-400 pb-1 text-[10.5pt] font-bold tracking-wide text-slate-950 uppercase">
              {labels.education}
            </h2>
            <div className="space-y-1.5">
              {tailored.education.map((edu) => {
                const gradeDisplay = edu.grade
                  ? formatCvGrade(pickCvText(edu.grade, cvLanguage), labels.grade)
                  : '';
                return (
                  <article key={edu.id} className="cv-entry-block space-y-0.5">
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
                );
              })}
            </div>
          </section>
        );

      case 'certifications':
        if (visibleCerts.length === 0) return null;
        return (
          <section key="certifications" className="cv-section space-y-1.5">
            <h2 className="cv-section-heading border-b border-slate-400 pb-1 text-[10.5pt] font-bold tracking-wide text-slate-950 uppercase">
              {labels.certifications}
            </h2>
            <ul className="space-y-1 text-[9pt] leading-[1.45] text-slate-800">
              {visibleCerts.map(({ item: cert }) => {
                const issuerText = pickCvText(cert.issuer, cvLanguage);
                const dateText = pickCvText(cert.issueDate, cvLanguage);
                const metaParts: string[] = [
                  pickCvText(cert.category, cvLanguage),
                ];
                if (issuerText && !isCvPlaceholderText(issuerText)) {
                  metaParts.push(issuerText);
                }
                if (dateText && !isCvPlaceholderText(dateText)) {
                  metaParts.push(dateText);
                }
                return (
                  <li key={cert.id} className="cv-entry-block">
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
                  </li>
                );
              })}
            </ul>
          </section>
        );
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={cvLanguage}
      style={{
        fontFamily: isRtl ? 'var(--font-sans-ar)' : 'var(--font-sans-en)',
      }}
      className="cv-print-sheet mx-auto w-full max-w-[210mm] rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-lg sm:p-9 print:max-w-none print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none"
    >
      {/* ATS Single-Column Header */}
      <header className="mb-4 border-b-2 border-slate-900 pb-3 text-center print:mb-3.5 print:pb-2.5">
        <h1 className="text-[18pt] font-bold leading-tight text-slate-950">
          {pickCvText(profile.fullName, cvLanguage)}
        </h1>
        <p className="mt-1 text-[9.8pt] font-semibold text-slate-700">
          {headlineText}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-[8.5pt] text-slate-700">
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

      {/* Ordered CV Body Sections */}
      <div className="space-y-3.5 print:space-y-3">
        {sections
          .filter((sec) => sec.visible)
          .map((sec) => renderSection(sec.key))}
      </div>
    </div>
  );
}
