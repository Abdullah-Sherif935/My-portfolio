import type {
  EducationItem,
  ExperienceItem,
  Language,
  LocalizedText,
  ProfileData,
  Project,
  SkillGroup,
} from '@/types/portfolio';
import type {
  RecruiterPositionOption,
  TailoredProfileResult,
} from '@/types/recruiter';
import { RECRUITER_SKILL_FILTERS } from './recruiterMatcher';

const DEDUP_STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'at', 'by', 'with',
  'from', 'as', 'is', 'are', 'was', 'were', 'be', 'that', 'this', 'its', 'such',
  'eg', 'e', 'g', 'use', 'used', 'using', 'aimed', 'capable', 'tailored', 'designed',
  'design', 'built', 'build', 'estimated', 'estimation', 'system', 'systems', 'key', 'project',
  'في', 'من', 'على', 'إلى', 'الى', 'عن', 'مع', 'أو', 'او', 'و', 'التي', 'الذي',
  'هذا', 'هذه', 'ذلك', 'مثل', 'بهدف', 'تهدف', 'يهدف', 'تخصيص', 'مخصصة',
  'لاستخدامها', 'قادرة', 'بناء', 'تنفيذ', 'تصميم', 'تقدير', 'منظومة', 'نظام', 'أنظمة', 'مشروع',
]);

export function pickCvText(
  text: LocalizedText | undefined,
  lang: Language
): string {
  if (!text) return '';
  return (text[lang] || text.en || text.ar || '').trim();
}

export function isCvPlaceholderText(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes('to be added') ||
    lower.includes('تُضاف لاحقاً') ||
    lower.includes('يُضاف لاحقاً') ||
    lower.includes('coming soon') ||
    lower.includes('قريباً')
  );
}

function normalizeArabicToken(token: string): string {
  let t = token
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة$/g, 'ه')
    .replace(/ى$/g, 'ي');
  if (t.length > 4 && t.startsWith('وال')) t = t.slice(3);
  else if (t.length > 4 && (t.startsWith('بال') || t.startsWith('كال') || t.startsWith('فال'))) t = t.slice(3);
  else if (t.length > 3 && (t.startsWith('ال') || t.startsWith('لل'))) t = t.slice(2);
  else if (t.length > 3 && (t.startsWith('و') || t.startsWith('ل') || t.startsWith('ب'))) t = t.slice(1);
  return t;
}

function tokenizeForSimilarity(text: string): Set<string> {
  const cleaned = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = new Set<string>();
  for (const raw of cleaned.split(/[\s-]+/)) {
    const token = raw.trim();
    if (token.length < 2) continue;
    if (DEDUP_STOP_WORDS.has(token)) continue;
    let normalized = token;
    if (/[\u0600-\u06ff]/.test(token)) {
      normalized = normalizeArabicToken(token);
      if (normalized.length < 2 || DEDUP_STOP_WORDS.has(normalized)) continue;
    } else if (/^[a-z]{4,}s$/.test(token) && !token.endsWith('ss')) {
      normalized = token.slice(0, -1);
    }
    tokens.add(normalized);
  }
  return tokens;
}

export function formatCvGrade(gradeText: string, gradeLabel: string): string {
  const clean = gradeText.trim();
  if (!clean) return '';
  if (/^(gpa|grade|المعدل|التقدير)/i.test(clean)) {
    return clean;
  }
  return `${gradeLabel}: ${clean}`;
}

function computeContainmentOverlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) {
    if (b.has(token)) shared += 1;
  }
  return shared / Math.min(a.size, b.size);
}

/**
 * Returns only project bullets (from deliverables + verified contributions)
 * that add distinct technical detail beyond the project's shortDescription
 * (never repeating near-identical bullets or duplicating across sections).
 */
export function getDistinctProjectDeliverables(
  project: Project,
  lang: Language,
  maxItems = 3
): string[] {
  if (maxItems <= 0) return [];
  const shortDesc = pickCvText(project.shortDescription, lang);
  const descTokens = tokenizeForSimilarity(shortDesc);
  const accepted: Array<{ text: string; tokens: Set<string> }> = [];

  // Combine verified deliverables and verified contributions without duplication
  const candidateItems: LocalizedText[] = [
    ...(project.deliverables ?? []),
    ...(project.contributions ?? []).map((c) => ({
      en: c.description.en || c.title.en,
      ar: c.description.ar || c.title.ar,
    })),
  ];
  const totalCount = candidateItems.length;

  for (const item of candidateItems) {
    const text = pickCvText(item, lang);
    if (!text) continue;

    if (shortDesc) {
      const normText = text.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').trim();
      const normDesc = shortDesc.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').trim();
      if (normText === normDesc || normDesc.includes(normText) || normText.includes(normDesc)) {
        continue;
      }
    }

    const tokens = tokenizeForSimilarity(text);
    if (shortDesc) {
      const overlapWithDesc = computeContainmentOverlap(tokens, descTokens);
      const threshold = totalCount === 1 ? 0.42 : 0.55;
      if (overlapWithDesc >= threshold) {
        continue;
      }
    }

    const duplicatesPrior = accepted.some(
      (entry) => computeContainmentOverlap(tokens, entry.tokens) >= 0.62
    );
    if (duplicatesPrior) continue;

    accepted.push({ text, tokens });
    if (accepted.length >= maxItems) break;
  }

  return accepted.map((entry) => entry.text);
}

function scoreTextForRole(
  text: string,
  position: RecruiterPositionOption,
  selectedSkillIds: string[]
): number {
  const normalized = text.toLowerCase();
  const matchedIds = new Set<string>();
  let score = 0;

  for (const req of position.requiredSkills) {
    if (matchedIds.has(req.id)) continue;
    if (req.aliases.some((a) => normalized.includes(a.toLowerCase()))) {
      matchedIds.add(req.id);
      score += 10;
    }
  }
  for (const pref of position.preferredSkills) {
    if (matchedIds.has(pref.id)) continue;
    if (pref.aliases.some((a) => normalized.includes(a.toLowerCase()))) {
      matchedIds.add(pref.id);
      score += 5;
    }
  }

  const extraTags = RECRUITER_SKILL_FILTERS.filter((f) =>
    selectedSkillIds.includes(f.id)
  ).flatMap((f) => f.tags);

  for (const tag of extraTags) {
    const phrase = tag.replace(/-/g, ' ');
    if (normalized.includes(phrase) || normalized.includes(tag)) {
      score += 6;
    }
  }

  return score;
}

/**
 * Reorders an experience entry's verified responsibilities so the most relevant
 * bullets for the target job position appear first (without dropping or editing facts).
 */
export function rankExperienceResponsibilities(
  exp: ExperienceItem,
  position: RecruiterPositionOption,
  selectedSkillIds: string[]
): LocalizedText[] {
  if (
    position.id === 'general-engineering' ||
    exp.responsibilities.length <= 1
  ) {
    return exp.responsibilities;
  }

  return exp.responsibilities
    .map((resp, idx) => ({
      resp,
      idx,
      score: scoreTextForRole(
        `${resp.en} ${resp.ar}`,
        position,
        selectedSkillIds
      ),
    }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map((entry) => entry.resp);
}

/**
 * Reorders verified skills within a SkillGroup so role-priority skills appear first.
 */
export function rankSkillsWithinGroup(
  group: SkillGroup,
  position: RecruiterPositionOption,
  selectedSkillIds: string[]
): LocalizedText[] {
  if (position.id === 'general-engineering' || group.skills.length <= 1) {
    return group.skills;
  }

  return group.skills
    .map((skill, idx) => ({
      skill,
      idx,
      score: scoreTextForRole(
        `${skill.en} ${skill.ar}`,
        position,
        selectedSkillIds
      ),
    }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map((entry) => entry.skill);
}

function listNatural(items: string[], lang: Language): string {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean[0] ?? '';
  if (clean.length === 2) {
    return lang === 'ar'
      ? `${clean[0]} و${clean[1]}`
      : `${clean[0]} and ${clean[1]}`;
  }
  const head = clean.slice(0, -1).join(lang === 'ar' ? '، ' : ', ');
  const tail = clean[clean.length - 1] ?? '';
  return lang === 'ar' ? `${head}، و${tail}` : `${head}, and ${tail}`;
}

function getPrimaryEducationSnippet(
  education: EducationItem[],
  lang: Language
): string {
  const primary = education[0];
  if (!primary) return '';
  const degree = pickCvText(primary.degree, lang);
  const inst = pickCvText(primary.institution, lang);
  const year = primary.graduationYear;
  if (!degree || !inst) return '';
  return lang === 'ar'
    ? `${degree} من ${inst}${year ? ` (${year})` : ''}`
    : `${degree} graduate from ${inst}${year ? ` (${year})` : ''}`;
}

/**
 * Returns a genuinely role-tailored, factually accurate professional headline
 * for the CV header (never forcing an HVAC-only headline onto Mechanical,
 * Robotics, Automation, Manufacturing, or General Engineering CVs).
 */
export function buildTailoredCvHeadline(
  profile: ProfileData,
  tailored: TailoredProfileResult,
  lang: Language
): string {
  if (tailored.isCustomRole && tailored.customTitle.trim()) {
    return lang === 'ar'
      ? `مهندس ميكاترونكس | ${tailored.customTitle.trim()}`
      : `Mechatronics Engineer | ${tailored.customTitle.trim()}`;
  }
  const roleHeadline = pickCvText(tailored.position.cvHeadline, lang);
  return roleHeadline || pickCvText(profile.headline, lang);
}

/**
 * Dynamically derives a role-tailored professional summary strictly from the
 * verified live portfolio records (education, ranked experience, ranked projects,
 * and matched competencies). Never uses HVAC-focused summaries for unrelated roles
 * and never invents responsibilities, achievements, tools, or dates.
 */
export function buildTailoredCvSummary(
  profile: ProfileData,
  tailored: TailoredProfileResult,
  lang: Language
): string {
  const posId = tailored.position.id;
  const eduSnippet = getPrimaryEducationSnippet(tailored.education, lang);
  const topEmployment = tailored.experience.find(
    (e) => e.item.kind === 'employment'
  )?.item;
  const employerName = topEmployment
    ? pickCvText(topEmployment.company, lang)
    : '';

  // Pull verified matched competency labels first (guaranteed aligned to target role, zero HVAC bleed!)
  const verifiedMatchedCompetencies = tailored.compatibility.matchedSkills
    .filter((s) => posId === 'hvac-design' || s.id !== 'hvac-equipment')
    .slice(0, 5)
    .map((s) => pickCvText(s.label, lang));

  // Fallback to top ranked skills if matchedSkills is empty (e.g. niche custom role)
  const fallbackSkills = tailored.skills
    .filter((s) => s.item.showInCv !== false)
    .slice(0, 2)
    .flatMap((s) =>
      rankSkillsWithinGroup(s.item, tailored.position, tailored.selectedSkillIds)
        .slice(0, 2)
        .map((sk) => pickCvText(sk, lang))
    )
    .slice(0, 4);

  const chosenSkills =
    verifiedMatchedCompetencies.length > 0
      ? verifiedMatchedCompetencies
      : fallbackSkills;

  const topProjects = tailored.projects
    .filter(
      (p) =>
        p.item.showInCv !== false &&
        (p.tier === 'strong' || p.tier === 'relevant')
    )
    .slice(0, 2)
    .map((p) => pickCvText(p.item.title, lang))
    .filter(Boolean);

  const skillsStr = listNatural(chosenSkills, lang);
  const projectsStr = listNatural(topProjects, lang);

  if (!eduSnippet) {
    return pickCvText(profile.summary, lang);
  }

  if (lang === 'ar') {
    switch (posId) {
      case 'mechanical-design':
        return `${eduSnippet} بخبرة عملية في التصميم الميكانيكي والنمذجة ثلاثية الأبعاد وتصميم الصاج والرسومات التصنيعية DXF${employerName ? ` لدى ${employerName}` : ''}. تشمل الكفاءات الموثّقة ${skillsStr}، مع متابعة التحويل من التصميم الهندسي إلى التصنيع الفعلي بالقطع بالليزر CNC والثني والتجميع${projectsStr ? `، إلى جانب مشاريع تصميم هندسي منها ${projectsStr}` : ''}.`;
      case 'hvac-design':
        return `${eduSnippet} يعمل كمهندس تصميم معدات التبريد والتكييف وتصميم الصاج${employerName ? ` لدى ${employerName}` : ''}، مع تركيز على التصميم الميكانيكي الهيكلي للتشيلرات وغرف التبريد ووحدات التكييف المركزي، وأغلفة الصاج، ولوحات التحكم الكهربائية، وتجهيز ملفات DXF والقطع بالليزر CNC. تشمل الكفاءات الموثّقة ${skillsStr}.`;
      case 'automation-control':
        return `${eduSnippet} بخبرة عملية في التحكم الصناعي والأتمتة، تشمل ${skillsStr}${employerName ? ` ودعم تصميم لوحات التحكم الكلاسيكي والتمديدات الكهربائية ودمج الحساسات والمهام المرتبطة بـ PLC لخطوط الإنتاج لدى ${employerName}` : ''}${projectsStr ? `، إضافة إلى مشاريع موثّقة في النمذجة والتحكم مثل ${projectsStr}` : ''}.`;
      case 'robotics-mechatronics':
        return `${eduSnippet} متخصص في تكامل الأنظمة الميكانيكية والكهربائية والمدمجة للروبوتات الذاتية. تشمل الكفاءات الموثّقة ${skillsStr}${projectsStr ? `، مُطبَّقة عملياً في مشاريع هندسية منها ${projectsStr}` : ''}، مدعومة بخبرة صناعية في التصميم الميكانيكي والتحكم.`;
      case 'manufacturing':
        return `${eduSnippet} بخبرة مباشرة في تجهيز التصنيع وخطوط الإنتاج${employerName ? ` لدى ${employerName}` : ''} وتدريب صناعي عملي في المصانع. تتركز الكفاءات الموثّقة حول ${skillsStr}، بدءاً من إعداد ملفات DXF وتفريد الأجزاء للقطع بالليزر CNC حتى الثني والدهان والتجميع الميكانيكي والصيانة الدورية.`;
      case 'general-engineering':
        return `${eduSnippet} يجمع بين التصميم الميكانيكي وتصميم الصاج، والتصنيع الصناعي بـ CNC، ولوحات التحكم والأتمتة، ومشاريع الروبوتات والأنظمة المدمجة${employerName ? `، مع خبرة عملية حالية لدى ${employerName}` : ''}. تشمل الكفاءات الموثّقة ${skillsStr}.`;
      case 'custom': {
        const roleLabel = tailored.customTitle.trim();
        return `${eduSnippet} بخبرة هندسية موثّقة تشمل ${skillsStr}${employerName ? `، وخبرة عملية لدى ${employerName}` : ''}${projectsStr ? `، ومشاريع هندسية منها ${projectsStr}` : ''}${roleLabel ? `، مع ترتيب السجل لإبراز أقرب الخبرات الموثّقة لدور «${roleLabel}»` : ''}.`;
      }
      default:
        return pickCvText(profile.summary, lang);
    }
  }

  switch (posId) {
    case 'mechanical-design':
      return `${eduSnippet} with hands-on mechanical CAD, structural assembly, and sheet metal design experience${employerName ? ` at ${employerName}` : ''}, carrying 3D SolidWorks models through production-ready DXF drawings, CNC laser cutting, bending, and assembly follow-up. Verified capabilities include ${skillsStr}${projectsStr ? `, supported by engineering builds such as ${projectsStr}` : ''}.`;
    case 'hvac-design':
      return `${eduSnippet} specializing as an HVAC Equipment & Sheet Metal Design Engineer${employerName ? ` at ${employerName}` : ''}, focused on mechanical structural design for chillers (60–240 TR), cold rooms, and central AC units, alongside sheet metal enclosures, electrical control panels, DXF generation, CNC fiber laser cutting, and production follow-up. Verified capabilities include ${skillsStr}.`;
    case 'automation-control':
      return `${eduSnippet} with practical industrial control and automation experience covering ${skillsStr}${employerName ? `, including electrical control panel design, wiring, sensor integration, classic relay-based panels, and PLC-related production-line support at ${employerName}` : ''}${projectsStr ? `, complemented by verified control and systems projects such as ${projectsStr}` : ''}.`;
    case 'robotics-mechatronics':
      return `${eduSnippet} focused on autonomous mobile manipulation, 6-DOF robotic arms, ROS 2, MoveIt 2, embedded motor control, and machine vision. Verified technical capabilities span ${skillsStr}${projectsStr ? `, applied across projects including ${projectsStr}` : ''}, paired with hands-on mechanical and control engineering experience.`;
    case 'manufacturing':
      return `${eduSnippet} with direct production-preparation and shop-floor manufacturing experience${employerName ? ` at ${employerName}` : ''} plus industrial plant training. Verified capabilities focus on ${skillsStr}, spanning DXF part nesting, CNC fiber laser cutting, sheet metal bending, mechanical assembly follow-up, and routine equipment maintenance.`;
    case 'general-engineering':
      return `${eduSnippet} bridging mechanical & sheet metal CAD design, CNC production workflows, industrial control systems, and autonomous robotics${employerName ? `, with hands-on industry experience at ${employerName}` : ''}. Core verified capabilities include ${skillsStr}.`;
    case 'custom': {
      const roleLabel = tailored.customTitle.trim();
      return `${eduSnippet} with verified engineering experience across ${skillsStr}${employerName ? ` at ${employerName}` : ''}${projectsStr ? `, supported by projects including ${projectsStr}` : ''}${roleLabel ? ` — prioritized strictly from verified records for ${roleLabel}` : ''}.`;
    }
    default:
      return pickCvText(profile.summary, lang);
  }
}

export function formatCvPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}

export function formatCvYoutubeDisplay(url: string): string {
  const match = url.match(/@[^/?]+/);
  if (match) return `youtube.com/${match[0]}`;
  return (url.replace(/^https?:\/\/(www\.)?/, '').split('?')[0] ?? url).replace(/\/$/, '');
}
