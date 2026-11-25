import { useMemo } from 'react';
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
import {
  CvA4PaginatedPreview,
  type CvFlowBlock,
} from './CvA4PaginatedPreview';

function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
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

    // Modern Navy + Orange Engineering Header
    list.push({
      id: 'mod-header',
      kind: 'header',
      marginTopPx: 0,
      node: (
        <header className="cv-modern-header rounded-md bg-[#0B1120] px-5 py-4 text-white">
          <div className="flex flex-row items-end justify-between gap-3">
            <div className="space-y-0.5">
              <h1 className="text-[18pt] font-bold leading-tight text-white">
                {pickCvText(profile.fullName, cvLanguage)}
              </h1>
              <p className="text-[9.6pt] font-semibold text-[#FB923C]">
                {headlineText}
              </p>
            </div>
            {tailored.position.id !== 'general-engineering' && (
              <span className="inline-block shrink-0 rounded border border-[#F97316]/50 bg-[#F97316]/15 px-2.5 py-0.5 text-[8pt] font-semibold text-[#FDBA74]">
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
      ),
    });

    const pushHeading = (key: string, title: string) => {
      list.push({
        id: `mod-heading-${key}`,
        kind: 'heading',
        marginTopPx: 14,
        node: (
          <h2 className="flex items-center gap-2 text-[10pt] font-bold tracking-wide text-[#0B1120] uppercase">
            <span
              aria-hidden="true"
              className="inline-block h-3.5 w-1 shrink-0 rounded-full bg-[#F97316]"
            />
            <span>{title}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
          </h2>
        ),
      });
    };

    for (const sec of sections.filter((s) => s.visible)) {
      switch (sec.key) {
        case 'summary':
          pushHeading('summary', labels.summary);
          list.push({
            id: 'mod-summary-body',
            kind: 'entry',
            marginTopPx: 6,
            node: (
              <div className="space-y-1.5">
                <p className="text-[9pt] leading-[1.5] text-slate-700">
                  {summaryText}
                </p>
                {tailored.isCustomRole && tailored.customTitle && (
                  <p className="rounded bg-orange-50 px-2.5 py-1 text-[8.1pt] text-slate-700">
                    {labels.customNote}{' '}
                    <strong className="text-[#0B1120]">
                      {tailored.customTitle}
                    </strong>
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
              id: `mod-exp-${exp.id}`,
              kind: 'entry',
              marginTopPx: idx === 0 ? 7 : 10,
              node: (
                <article className="space-y-0.5 border-s-2 border-slate-200 ps-3">
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
              id: `mod-proj-${project.id}`,
              kind: 'entry',
              marginTopPx: idx === 0 ? 7 : 8,
              node: isCompactSupporting ? (
                <article className="rounded border border-slate-200/80 bg-white px-2.5 py-1.5 text-[8.5pt] leading-[1.4] text-slate-700">
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
              ) : (
                <article className="space-y-1 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2">
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
                      {distinctDeliverables.map((delivText, dIdx) => (
                        <li key={dIdx}>{delivText}</li>
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

          chunkPairs(renderedGroups).forEach((pair, pIdx) => {
            list.push({
              id: `mod-skills-row-${pIdx}`,
              kind: 'entry',
              marginTopPx: pIdx === 0 ? 7 : 6,
              node: (
                <div className="grid grid-cols-2 gap-1.5">
                  {pair.map(({ group, orderedSkills }) => (
                    <div
                      key={group.id}
                      className="space-y-0.5 rounded-md border border-slate-200 px-2.5 py-1.5"
                    >
                      <h3 className="text-[8.8pt] font-bold text-[#0B1120]">
                        {pickCvText(group.title, cvLanguage)}
                      </h3>
                      <p className="text-[8.3pt] leading-[1.42] text-slate-700">
                        {orderedSkills.map((s, sIdx) => (
                          <span key={sIdx}>
                            {sIdx > 0 ? ' · ' : ''}
                            <bdi>{pickCvText(s, cvLanguage)}</bdi>
                          </span>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>
              ),
            });
          });

          if (profile.languages.length > 0) {
            list.push({
              id: 'mod-languages',
              kind: 'entry',
              marginTopPx: 6,
              node: (
                <p className="text-[8.6pt] text-slate-700">
                  <strong className="text-[#0B1120]">{labels.languages}:</strong>{' '}
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
              id: `mod-edu-${edu.id}`,
              kind: 'entry',
              marginTopPx: idx === 0 ? 7 : 6,
              node: (
                <article className="flex items-baseline justify-between gap-3 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2">
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
              ),
            });
          });
          break;

        case 'certifications':
          if (visibleCerts.length === 0) break;
          pushHeading('certifications', labels.certifications);
          chunkPairs(visibleCerts).forEach((pair, pIdx) => {
            list.push({
              id: `mod-certs-row-${pIdx}`,
              kind: 'entry',
              marginTopPx: pIdx === 0 ? 7 : 6,
              node: (
                <div className="grid grid-cols-2 gap-1.5">
                  {pair.map(({ item: cert }) => {
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
                        className="rounded border border-slate-200 px-2.5 py-1.5"
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

  const layoutKey = `mod-${cvLanguage}-${tailored.position.id}-${sections.map((s) => `${s.key}:${s.visible}`).join(',')}-${customizations?.customSummary?.length ?? 0}-${customizations?.excludedExperienceIds?.length ?? 0}-${customizations?.excludedProjectIds?.length ?? 0}-${customizations?.excludedSkillGroupIds?.length ?? 0}-${customizations?.excludedSkillKeys?.length ?? 0}`;

  return (
    <CvA4PaginatedPreview
      blocks={blocks}
      cvLanguage={cvLanguage}
      layoutKey={layoutKey}
      onPageCountChange={onPageCountChange}
    />
  );
}
