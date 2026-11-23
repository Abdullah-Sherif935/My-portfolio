import type { CvSectionConfig } from '@/types/admin';
import type { Language, LocalizedText } from '@/types/portfolio';
import type { CvTemplateProps } from './CvAtsTemplate';

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

export function CvModernTemplate({
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

  const renderHeading = (title: string) => (
    <h2 className="cv-section-heading flex items-center gap-2 text-[10.5pt] font-bold tracking-wide text-[#0B1120] uppercase">
      <span
        aria-hidden="true"
        className="inline-block h-3.5 w-1 shrink-0 rounded-full bg-[#F97316]"
      />
      <span>{title}</span>
      <span
        aria-hidden="true"
        className="h-px flex-1 bg-slate-200"
      />
    </h2>
  );

  const renderSection = (sectionKey: CvSectionConfig['key']) => {
    switch (sectionKey) {
      case 'summary':
        return (
          <section key="summary" className="cv-section space-y-2">
            {renderHeading(labels.summary)}
            <p className="text-[9.4pt] leading-[1.6] text-slate-700">
              {pickLang(profile.summary, cvLanguage)}
            </p>
            {tailored.isCustomRole && tailored.customTitle && (
              <p className="rounded bg-orange-50 px-2.5 py-1 text-[8.4pt] text-slate-700">
                {labels.customNote}{' '}
                <strong className="text-[#0B1120]">{tailored.customTitle}</strong>
              </p>
            )}
          </section>
        );

      case 'experience':
        if (visibleExperience.length === 0) return null;
        return (
          <section key="experience" className="cv-section space-y-2.5">
            {renderHeading(labels.experience)}
            <div className="space-y-3.5">
              {visibleExperience.map(({ item: exp }) => (
                <article
                  key={exp.id}
                  className="cv-entry-block border-s-2 border-slate-200 ps-3.5 space-y-1"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[10pt] font-bold text-[#0B1120]">
                      {pickLang(exp.role, cvLanguage)}
                    </h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[8.2pt] font-semibold text-slate-700">
                      {pickLang(exp.period, cvLanguage)}
                    </span>
                  </div>
                  <p className="text-[9.2pt] font-semibold text-[#C2410C]">
                    {pickLang(exp.company, cvLanguage)}
                    {exp.location ? ` · ${pickLang(exp.location, cvLanguage)}` : ''}
                  </p>
                  {exp.responsibilities.length > 0 && (
                    <ul className="list-disc space-y-1 ps-4 text-[8.9pt] leading-[1.52] text-slate-700">
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
            {renderHeading(labels.projects)}
            <div className="space-y-2.5">
              {visibleProjects.map(({ item: project }) => (
                <article
                  key={project.id}
                  className="cv-entry-block rounded-md border border-slate-200 bg-slate-50/60 p-3 space-y-1"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[9.8pt] font-bold text-[#0B1120]">
                      {pickLang(project.title, cvLanguage)}
                    </h3>
                    <span className="text-[8.2pt] font-semibold text-[#C2410C]">
                      {pickLang(project.categoryLabel, cvLanguage)}
                    </span>
                  </div>
                  <p className="text-[8.9pt] leading-[1.48] text-slate-700">
                    {pickLang(project.shortDescription, cvLanguage)}
                  </p>
                  {project.deliverables.length > 0 && (
                    <ul className="list-disc space-y-0.5 ps-4 text-[8.6pt] leading-[1.45] text-slate-700">
                      {project.deliverables.slice(0, 3).map((deliv, idx) => (
                        <li key={idx}>{pickLang(deliv, cvLanguage)}</li>
                      ))}
                    </ul>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[7.8pt] font-medium text-slate-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
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
            {renderHeading(labels.skills)}
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleSkills.map(({ item: group }) => (
                <div
                  key={group.id}
                  className="cv-entry-block rounded-md border border-slate-200 p-2.5 space-y-1"
                >
                  <h3 className="text-[9pt] font-bold text-[#0B1120]">
                    {pickLang(group.title, cvLanguage)}
                  </h3>
                  <p className="text-[8.5pt] leading-[1.48] text-slate-700">
                    {group.skills.map((s) => pickLang(s, cvLanguage)).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
            {profile.languages.length > 0 && (
              <p className="cv-entry-block pt-0.5 text-[8.8pt] text-slate-700">
                <strong className="text-[#0B1120]">{labels.languages}:</strong>{' '}
                {profile.languages
                  .map(
                    (l) =>
                      `${pickLang(l.name, cvLanguage)} (${pickLang(l.proficiency, cvLanguage)})`
                  )
                  .join(' · ')}
              </p>
            )}
          </section>
        );

      case 'education':
        if (tailored.education.length === 0) return null;
        return (
          <section key="education" className="cv-section space-y-2">
            {renderHeading(labels.education)}
            <div className="space-y-2">
              {tailored.education.map((edu) => (
                <article
                  key={edu.id}
                  className="cv-entry-block flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2"
                >
                  <div>
                    <h3 className="text-[9.6pt] font-bold text-[#0B1120]">
                      {pickLang(edu.degree, cvLanguage)}
                    </h3>
                    <p className="text-[8.8pt] text-slate-700">
                      {pickLang(edu.institution, cvLanguage)}
                      {edu.grade
                        ? ` · ${labels.grade}: ${pickLang(edu.grade, cvLanguage)}`
                        : ''}
                    </p>
                  </div>
                  <span className="rounded bg-[#0B1120] px-2 py-0.5 text-[8pt] font-semibold text-white">
                    {pickLang(edu.period, cvLanguage)}
                  </span>
                </article>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (visibleCerts.length === 0) return null;
        return (
          <section key="certifications" className="cv-section space-y-2">
            {renderHeading(labels.certifications)}
            <div className="grid gap-1.5 sm:grid-cols-2">
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
                  <div
                    key={cert.id}
                    className="cv-entry-block rounded border border-slate-200 px-2.5 py-1.5"
                  >
                    <p className="text-[8.9pt] font-semibold text-[#0B1120]">
                      {pickLang(cert.title, cvLanguage)}
                    </p>
                    <p className="text-[8.1pt] text-slate-600">
                      {metaParts.join(' · ')}
                    </p>
                  </div>
                );
              })}
            </div>
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
      className="cv-print-sheet mx-auto w-full max-w-[210mm] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-lg print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none"
    >
      {/* Modern Navy + Orange Engineering Header */}
      <header className="bg-[#0B1120] px-7 py-6 text-white sm:px-9 print:px-6 print:py-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <h1 className="text-[19pt] font-bold leading-tight text-white">
              {pickLang(profile.fullName, cvLanguage)}
            </h1>
            <p className="text-[10.2pt] font-semibold text-[#FB923C]">
              {pickLang(profile.headline, cvLanguage)}
            </p>
          </div>
          {tailored.position.id !== 'general-engineering' && (
            <span className="inline-block self-start rounded border border-[#F97316]/50 bg-[#F97316]/15 px-2.5 py-1 text-[8.4pt] font-semibold text-[#FDBA74] sm:self-auto">
              {labels.targetFocus}:{' '}
              {pickLang(tailored.displayPositionTitle, cvLanguage)}
            </span>
          )}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/15 pt-3 text-[8.5pt] text-slate-200">
          <span>{pickLang(profile.location, cvLanguage)}</span>
          {showContactEmail && profile.contact.email && (
            <a
              href={`mailto:${profile.contact.email}`}
              className="text-white underline decoration-[#F97316]/70"
            >
              {profile.contact.email}
            </a>
          )}
          {showLinkedinLink && profile.contact.linkedinUrl && (
            <a
              href={profile.contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-[#F97316]/70"
            >
              {profile.contact.linkedinDisplay}
            </a>
          )}
          {profile.contact.githubUrl && (
            <a
              href={profile.contact.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-[#F97316]/70"
            >
              {labels.github}
            </a>
          )}
          {profile.contact.websiteDisplay && (
            <a
              href={portfolioHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-[#F97316]/70"
            >
              {profile.contact.websiteDisplay}
            </a>
          )}
        </div>
      </header>

      {/* Main Modern Body */}
      <div className="space-y-4.5 px-7 py-6 sm:px-9 sm:py-7 print:px-0 print:py-5">
        {sections
          .filter((sec) => sec.visible)
          .map((sec) => renderSection(sec.key))}
      </div>
    </div>
  );
}
