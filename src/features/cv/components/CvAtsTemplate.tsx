import type { CvSectionConfig } from '@/types/admin';
import type { Language, LocalizedText, ProfileData } from '@/types/portfolio';
import type { TailoredProfileResult } from '@/types/recruiter';

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
  location: string;
  credentialId: string;
  customNote: string;
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
}

function pickLang(text: LocalizedText | undefined, lang: Language): string {
  if (!text) return '';
  return text[lang] || text.en || text.ar || '';
}

function isPlaceholderText(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes('to be added') ||
    lower.includes('تُضاف لاحقاً') ||
    lower.includes('يُضاف لاحقاً') ||
    lower.includes('coming soon') ||
    lower.includes('قريباً')
  );
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
}: CvTemplateProps) {
  const isRtl = cvLanguage === 'ar';
  const visibleExperience = tailored.experience.filter(
    (e) => e.item.showInCv !== false
  );
  const visibleProjects = tailored.projects.filter(
    (p) => p.item.showInCv !== false
  );
  const visibleSkills = tailored.skills.filter(
    (s) => s.item.showInCv !== false
  );
  const visibleCerts = showCoursesSection
    ? tailored.certifications.filter((c) => c.item.showInCv !== false)
    : [];

  const portfolioHref = profile.contact.websiteDisplay.startsWith('http')
    ? profile.contact.websiteDisplay
    : `https://${profile.contact.websiteDisplay}`;

  const renderSection = (sectionKey: CvSectionConfig['key']) => {
    switch (sectionKey) {
      case 'summary':
        return (
          <section key="summary" className="cv-section space-y-1.5">
            <h2 className="cv-section-heading border-b border-slate-300 pb-1 text-[11pt] font-bold tracking-wide text-slate-900 uppercase">
              {labels.summary}
            </h2>
            <p className="text-[9.5pt] leading-[1.55] text-slate-800">
              {pickLang(profile.summary, cvLanguage)}
            </p>
            {tailored.isCustomRole && tailored.customTitle && (
              <p className="text-[8.5pt] text-slate-600 italic">
                {labels.customNote} {tailored.customTitle}
              </p>
            )}
          </section>
        );

      case 'experience':
        if (visibleExperience.length === 0) return null;
        return (
          <section key="experience" className="cv-section space-y-2.5">
            <h2 className="cv-section-heading border-b border-slate-300 pb-1 text-[11pt] font-bold tracking-wide text-slate-900 uppercase">
              {labels.experience}
            </h2>
            <div className="space-y-3">
              {visibleExperience.map(({ item: exp }) => (
                <article key={exp.id} className="cv-entry-block space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[10pt] font-bold text-slate-900">
                      {pickLang(exp.role, cvLanguage)}
                    </h3>
                    <span className="text-[8.5pt] font-medium text-slate-600">
                      {pickLang(exp.period, cvLanguage)}
                    </span>
                  </div>
                  <p className="text-[9.2pt] font-semibold text-slate-700">
                    {pickLang(exp.company, cvLanguage)}
                    {exp.location ? ` · ${pickLang(exp.location, cvLanguage)}` : ''}
                  </p>
                  {exp.responsibilities.length > 0 && (
                    <ul className="list-disc space-y-1 ps-4 text-[9pt] leading-[1.5] text-slate-800">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{pickLang(resp, cvLanguage)}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (visibleProjects.length === 0) return null;
        return (
          <section key="projects" className="cv-section space-y-2.5">
            <h2 className="cv-section-heading border-b border-slate-300 pb-1 text-[11pt] font-bold tracking-wide text-slate-900 uppercase">
              {labels.projects}
            </h2>
            <div className="space-y-2.5">
              {visibleProjects.map(({ item: project }) => (
                <article key={project.id} className="cv-entry-block space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[9.8pt] font-bold text-slate-900">
                      {pickLang(project.title, cvLanguage)}
                    </h3>
                    <span className="text-[8.5pt] text-slate-600">
                      {pickLang(project.kindLabel, cvLanguage)}
                    </span>
                  </div>
                  <p className="text-[9pt] leading-[1.48] text-slate-800">
                    {pickLang(project.shortDescription, cvLanguage)}
                  </p>
                  {project.deliverables.length > 0 && (
                    <ul className="list-disc space-y-0.5 ps-4 text-[8.8pt] leading-[1.45] text-slate-700">
                      {project.deliverables.slice(0, 3).map((deliv, idx) => (
                        <li key={idx}>{pickLang(deliv, cvLanguage)}</li>
                      ))}
                    </ul>
                  )}
                  {project.technologies.length > 0 && (
                    <p className="text-[8.5pt] text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {labels.technologies}:
                      </span>{' '}
                      {project.technologies.join(', ')}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );

      case 'skills':
        if (visibleSkills.length === 0) return null;
        return (
          <section key="skills" className="cv-section space-y-2">
            <h2 className="cv-section-heading border-b border-slate-300 pb-1 text-[11pt] font-bold tracking-wide text-slate-900 uppercase">
              {labels.skills}
            </h2>
            <div className="space-y-1.5">
              {visibleSkills.map(({ item: group }) => (
                <p
                  key={group.id}
                  className="cv-entry-block text-[9pt] leading-[1.5] text-slate-800"
                >
                  <span className="font-bold text-slate-900">
                    {pickLang(group.title, cvLanguage)}:
                  </span>{' '}
                  {group.skills.map((s) => pickLang(s, cvLanguage)).join(' · ')}
                </p>
              ))}
              {profile.languages.length > 0 && (
                <p className="cv-entry-block text-[9pt] leading-[1.5] text-slate-800">
                  <span className="font-bold text-slate-900">
                    {labels.languages}:
                  </span>{' '}
                  {profile.languages
                    .map(
                      (l) =>
                        `${pickLang(l.name, cvLanguage)} (${pickLang(l.proficiency, cvLanguage)})`
                    )
                    .join(' · ')}
                </p>
              )}
            </div>
          </section>
        );

      case 'education':
        if (tailored.education.length === 0) return null;
        return (
          <section key="education" className="cv-section space-y-2">
            <h2 className="cv-section-heading border-b border-slate-300 pb-1 text-[11pt] font-bold tracking-wide text-slate-900 uppercase">
              {labels.education}
            </h2>
            <div className="space-y-2">
              {tailored.education.map((edu) => (
                <article key={edu.id} className="cv-entry-block space-y-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[9.8pt] font-bold text-slate-900">
                      {pickLang(edu.degree, cvLanguage)}
                    </h3>
                    <span className="text-[8.5pt] font-medium text-slate-600">
                      {pickLang(edu.period, cvLanguage)}
                    </span>
                  </div>
                  <p className="text-[9pt] text-slate-700">
                    {pickLang(edu.institution, cvLanguage)}
                    {edu.grade ? ` · ${labels.grade}: ${pickLang(edu.grade, cvLanguage)}` : ''}
                  </p>
                </article>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (visibleCerts.length === 0) return null;
        return (
          <section key="certifications" className="cv-section space-y-2">
            <h2 className="cv-section-heading border-b border-slate-300 pb-1 text-[11pt] font-bold tracking-wide text-slate-900 uppercase">
              {labels.certifications}
            </h2>
            <ul className="space-y-1 text-[9pt] leading-[1.48] text-slate-800">
              {visibleCerts.map(({ item: cert }) => {
                const issuerText = pickLang(cert.issuer, cvLanguage);
                const dateText = pickLang(cert.issueDate, cvLanguage);
                const metaParts: string[] = [pickLang(cert.category, cvLanguage)];
                if (issuerText && !isPlaceholderText(issuerText)) {
                  metaParts.push(issuerText);
                }
                if (dateText && !isPlaceholderText(dateText)) {
                  metaParts.push(dateText);
                }
                return (
                  <li key={cert.id} className="cv-entry-block">
                    <span className="font-semibold text-slate-900">
                      {pickLang(cert.title, cvLanguage)}
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
                        className="ms-1.5 text-[8.5pt] text-slate-700 underline"
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
      className="cv-print-sheet mx-auto w-full max-w-[210mm] rounded-lg border border-slate-200 bg-white p-7 text-slate-900 shadow-lg sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
    >
      {/* ATS Single-Column Header */}
      <header className="mb-5 border-b-2 border-slate-900 pb-3.5 text-center">
        <h1 className="text-[19pt] font-bold leading-tight text-slate-950">
          {pickLang(profile.fullName, cvLanguage)}
        </h1>
        <p className="mt-1 text-[10.5pt] font-semibold text-slate-700">
          {pickLang(profile.headline, cvLanguage)}
        </p>
        {tailored.position.id !== 'general-engineering' && (
          <p className="mt-0.5 text-[9pt] font-medium text-slate-600">
            {labels.targetFocus}: {pickLang(tailored.displayPositionTitle, cvLanguage)}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[8.8pt] text-slate-700">
          <span>{pickLang(profile.location, cvLanguage)}</span>
          {showContactEmail && profile.contact.email && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href={`mailto:${profile.contact.email}`}
                className="text-slate-800 underline decoration-slate-400"
              >
                {profile.contact.email}
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
                className="text-slate-800 underline decoration-slate-400"
              >
                {labels.linkedin}: {profile.contact.linkedinDisplay}
              </a>
            </>
          )}
          {profile.contact.githubUrl && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href={profile.contact.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-800 underline decoration-slate-400"
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
                className="text-slate-800 underline decoration-slate-400"
              >
                {profile.contact.websiteDisplay}
              </a>
            </>
          )}
        </div>
      </header>

      {/* Ordered CV Body Sections */}
      <div className="space-y-4">
        {sections
          .filter((sec) => sec.visible)
          .map((sec) => renderSection(sec.key))}
      </div>
    </div>
  );
}
