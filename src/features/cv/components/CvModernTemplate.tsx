import type { CvSectionConfig } from '@/types/admin';
import type { CvTemplateProps } from './CvAtsTemplate';
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

export function CvModernTemplate({
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

  const renderHeading = (title: string) => (
    <h2 className="cv-section-heading flex items-center gap-2 text-[10pt] font-bold tracking-wide text-[#0B1120] uppercase">
      <span
        aria-hidden="true"
        className="inline-block h-3.5 w-1 shrink-0 rounded-full bg-[#F97316]"
      />
      <span>{title}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
    </h2>
  );

  const renderSection = (sectionKey: CvSectionConfig['key']) => {
    switch (sectionKey) {
      case 'summary':
        return (
          <section key="summary" className="cv-section space-y-1.5">
            {renderHeading(labels.summary)}
            <p className="cv-entry-block text-[9pt] leading-[1.5] text-slate-700">
              {summaryText}
            </p>
            {tailored.isCustomRole && tailored.customTitle && (
              <p className="rounded bg-orange-50 px-2.5 py-1 text-[8.1pt] text-slate-700">
                {labels.customNote}{' '}
                <strong className="text-[#0B1120]">{tailored.customTitle}</strong>
              </p>
            )}
          </section>
        );

      case 'experience':
        if (visibleExperience.length === 0) return null;
        return (
          <section key="experience" className="cv-section space-y-2">
            {renderHeading(labels.experience)}
            <div className="space-y-2.5">
              {visibleExperience.map(({ item: exp }) => {
                const orderedResponsibilities = rankExperienceResponsibilities(
                  exp,
                  tailored.position,
                  tailored.selectedSkillIds
                );
                return (
                  <article
                    key={exp.id}
                    className="cv-entry-block space-y-0.5 border-s-2 border-slate-200 ps-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[9.5pt] font-bold text-[#0B1120]">
                        {pickCvText(exp.role, cvLanguage)}
                      </h3>
                      <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[8pt] font-semibold text-slate-700">
                        {pickCvText(exp.period, cvLanguage)}
                      </span>
                    </div>
                    <p className="text-[8.8pt] font-semibold text-[#C2410C]">
                      {pickCvText(exp.company, cvLanguage)}
                      {exp.location
                        ? ` · ${pickCvText(exp.location, cvLanguage)}`
                        : ''}
                    </p>
                    {orderedResponsibilities.length > 0 && (
                      <ul className="list-disc space-y-0.5 ps-4 text-[8.7pt] leading-[1.44] text-slate-700">
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
            {renderHeading(labels.projects)}
            <div className="space-y-2">
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
                      className="cv-entry-block rounded border border-slate-200/80 bg-white px-2.5 py-1.5 text-[8.5pt] leading-[1.4] text-slate-700"
                    >
                      <span className="font-bold text-[#0B1120]">
                        <bdi>{pickCvText(project.title, cvLanguage)}</bdi>
                      </span>
                      {shortDesc ? ` — ${shortDesc}` : ''}
                      {project.technologies.length > 0 && (
                        <span className="text-[7.9pt] text-slate-500">
                          {' '}
                          (<bdi>{project.technologies.join(', ')}</bdi>)
                        </span>
                      )}
                    </article>
                  );
                }

                return (
                  <article
                    key={project.id}
                    className="cv-entry-block space-y-1 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[9.4pt] font-bold text-[#0B1120]">
                        <bdi>{pickCvText(project.title, cvLanguage)}</bdi>
                      </h3>
                      <span className="shrink-0 text-[8pt] font-semibold text-[#C2410C]">
                        {pickCvText(project.categoryLabel, cvLanguage)}
                      </span>
                    </div>
                    {shortDesc && (
                      <p className="text-[8.7pt] leading-[1.42] text-slate-700">
                        {shortDesc}
                      </p>
                    )}
                    {distinctDeliverables.length > 0 && (
                      <ul className="list-disc space-y-0.5 ps-4 text-[8.4pt] leading-[1.4] text-slate-700">
                        {distinctDeliverables.map((delivText, idx) => (
                          <li key={idx}>{delivText}</li>
                        ))}
                      </ul>
                    )}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[7.6pt] font-medium text-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
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
          <section key="skills" className="cv-section space-y-2">
            {renderHeading(labels.skills)}
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 print:grid-cols-2">
              {renderedGroups.map(({ group, orderedSkills }) => (
                <div
                  key={group.id}
                  className="cv-entry-block space-y-0.5 rounded-md border border-slate-200 px-2.5 py-1.5"
                >
                  <h3 className="text-[8.8pt] font-bold text-[#0B1120]">
                    {pickCvText(group.title, cvLanguage)}
                  </h3>
                  <p className="text-[8.3pt] leading-[1.42] text-slate-700">
                    {orderedSkills.map((s, idx) => (
                      <span key={idx}>
                        {idx > 0 ? ' · ' : ''}
                        <bdi>{pickCvText(s, cvLanguage)}</bdi>
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
            {profile.languages.length > 0 && (
              <p className="cv-entry-block pt-0.5 text-[8.6pt] text-slate-700">
                <strong className="text-[#0B1120]">{labels.languages}:</strong>{' '}
                {profile.languages
                  .map(
                    (l) =>
                      `${pickCvText(l.name, cvLanguage)} (${pickCvText(l.proficiency, cvLanguage)})`
                  )
                  .join(' · ')}
              </p>
            )}
          </section>
        );
      }

      case 'education':
        if (tailored.education.length === 0) return null;
        return (
          <section key="education" className="cv-section space-y-1.5">
            {renderHeading(labels.education)}
            <div className="space-y-1.5">
              {tailored.education.map((edu) => {
                const gradeDisplay = edu.grade
                  ? formatCvGrade(pickCvText(edu.grade, cvLanguage), labels.grade)
                  : '';
                return (
                  <article
                    key={edu.id}
                    className="cv-entry-block flex items-baseline justify-between gap-3 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2"
                  >
                    <div>
                      <h3 className="text-[9.3pt] font-bold text-[#0B1120]">
                        {pickCvText(edu.degree, cvLanguage)}
                      </h3>
                      <p className="text-[8.6pt] text-slate-700">
                        {pickCvText(edu.institution, cvLanguage)}
                        {gradeDisplay ? ` · ${gradeDisplay}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 rounded bg-[#0B1120] px-2 py-0.5 text-[8pt] font-semibold text-white">
                      {pickCvText(edu.period, cvLanguage)}
                    </span>
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
            {renderHeading(labels.certifications)}
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 print:grid-cols-2">
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
                  <div
                    key={cert.id}
                    className="cv-entry-block rounded border border-slate-200 px-2.5 py-1.5"
                  >
                    <p className="text-[8.5pt] font-semibold text-[#0B1120]">
                      <bdi>{pickCvText(cert.title, cvLanguage)}</bdi>
                    </p>
                    <p className="text-[7.9pt] text-slate-600">
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
      className="cv-print-sheet mx-auto w-full max-w-[210mm] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-lg print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none"
    >
      {/* Modern Navy + Orange Engineering Header */}
      <header className="cv-modern-header bg-[#0B1120] px-6 py-4.5 text-white sm:px-8 print:rounded-md print:px-5 print:py-3.5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div className="space-y-0.5">
            <h1 className="text-[18pt] font-bold leading-tight text-white">
              {pickCvText(profile.fullName, cvLanguage)}
            </h1>
            <p className="text-[9.6pt] font-semibold text-[#FB923C]">
              {headlineText}
            </p>
          </div>
          {tailored.position.id !== 'general-engineering' && (
            <span className="inline-block self-start rounded border border-[#F97316]/50 bg-[#F97316]/15 px-2.5 py-0.5 text-[8pt] font-semibold text-[#FDBA74] sm:self-auto">
              {labels.targetFocus}:{' '}
              {pickCvText(tailored.displayPositionTitle, cvLanguage)}
            </span>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-0.5 border-t border-white/15 pt-2 text-[8.3pt] text-slate-200">
          <span>{pickCvText(profile.location, cvLanguage)}</span>
          {showContactEmail && profile.contact.email && (
            <a
              href={`mailto:${profile.contact.email}`}
              className="text-white underline decoration-[#F97316]/70"
            >
              <bdi>{profile.contact.email}</bdi>
            </a>
          )}
          {profile.contact.phone?.trim() && (
            <a
              href={formatCvPhoneHref(profile.contact.phone)}
              className="text-white underline decoration-[#F97316]/70"
            >
              <bdi>{profile.contact.phone.trim()}</bdi>
            </a>
          )}
          {showLinkedinLink && profile.contact.linkedinUrl && (
            <a
              href={profile.contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-[#F97316]/70"
            >
              <bdi>{profile.contact.linkedinDisplay}</bdi>
            </a>
          )}
          {profile.contact.githubUrl?.trim() && (
            <a
              href={profile.contact.githubUrl.trim()}
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
              <bdi>{profile.contact.websiteDisplay}</bdi>
            </a>
          )}
        </div>
      </header>

      {/* Main Modern Body */}
      <div className="space-y-3.5 px-6 py-5 sm:px-8 sm:py-6 print:space-y-3 print:px-0 print:py-3.5">
        {sections
          .filter((sec) => sec.visible)
          .map((sec) => renderSection(sec.key))}
      </div>
    </div>
  );
}
