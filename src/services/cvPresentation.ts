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
  // English common & action filler words
  'a',
  'an',
  'the',
  'and',
  'or',
  'of',
  'for',
  'to',
  'in',
  'on',
  'at',
  'by',
  'with',
  'from',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'that',
  'this',
  'its',
  'such',
  'eg',
  'e',
  'g',
  'use',
  'used',
  'using',
  'aimed',
  'capable',
  'tailored',
  'designed',
  'design',
  'built',
  'build',
  'estimated',
  'estimation',
  'system',
  'systems',
  'key',
  'project',
  // Arabic common filler words
  'في',
  'من',
  'على',
  'إلى',
  'الى',
  'عن',
  'مع',
  'أو',
  'او',
  'و',
  'التي',
  'الذي',
  'هذا',
  'هذه',
  'ذلك',
  'مثل',
  'بهدف',
  'تهدف',
  'يهدف',
  'تخصيص',
  'مخصصة',
  'لاستخدامها',
  'قادرة',
  'بناء',
  'تنفيذ',
  'تصميم',
  'تقدير',
  'منظومة',
  'نظام',
  'أنظمة',
  'مشروع',
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
  // Strip common Arabic proclitics & definite article for paraphrase matching only
  let t = token
    .replace(/[\u064b-\u065f\u0670]/g, '') // remove diacritics
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
 * Returns only project deliverables that add distinct technical detail beyond
 * the project's shortDescription (never repeating near-identical single bullets).
 */
export function getDistinctProjectDeliverables(
  project: Project,
  lang: Language,
  maxItems = 3
): string[] {
  const shortDesc = pickCvText(project.shortDescription, lang);
  const descTokens = tokenizeForSimilarity(shortDesc);
  const accepted: Array<{ text: string; tokens: Set<string> }> = [];
  const totalCount = project.deliverables.length;

  for (const deliverable of project.deliverables) {
    const text = pickCvText(deliverable, lang);
    if (!text) continue;

    // Exact or substring duplicate check
    const normText = text.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').trim();
    const normDesc = shortDesc.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').trim();
    if (normText === normDesc || normDesc.includes(normText) || normText.includes(normDesc)) {
      continue;
    }

    const tokens = tokenizeForSimilarity(text);
    const overlapWithDesc = computeContainmentOverlap(tokens, descTokens);

    // Single-bullet summaries that paraphrase shortDescription are omitted
    const threshold = totalCount === 1 ? 0.42 : 0.55;
    if (overlapWithDesc >= threshold) {
      continue;
    }

    // Also avoid duplicating another already-accepted deliverable
    const duplicatesPrior = accepted.some(
      (item) => computeContainmentOverlap(tokens, item.tokens) >= 0.62
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
  let score = 0;

  for (const tag of position.primaryTags) {
    const phrase = tag.replace(/-/g, ' ');
    const spacedNum = phrase.replace(/([a-z])(\d)/g, '$1 $2');
    if (
      normalized.includes(phrase) ||
      normalized.includes(tag) ||
      normalized.includes(spacedNum)
    ) {
      score += 8;
    }
  }
  for (const tag of position.secondaryTags) {
    const phrase = tag.replace(/-/g, ' ');
    if (normalized.includes(phrase) || normalized.includes(tag)) {
      score += 2;
    }
  }
  for (const kw of position.keywords) {
    if (normalized.includes(kw.toLowerCase())) {
      score += 3;
    }
  }

  const extraTags = RECRUITER_SKILL_FILTERS.filter((f) =>
    selectedSkillIds.includes(f.id)
  ).flatMap((f) => f.tags);

  for (const tag of extraTags) {
    const phrase = tag.replace(/-/g, ' ');
    if (normalized.includes(phrase) || normalized.includes(tag)) {
      score += 7;
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
 * Dynamically derives a role-tailored professional summary strictly from the
 * verified live portfolio records (profile, education, ranked experience,
 * ranked projects, and ranked skills). Never invents facts or metrics.
 */
export function buildTailoredCvSummary(
  profile: ProfileData,
  tailored: TailoredProfileResult,
  lang: Language
): string {
  const baseSummary = pickCvText(profile.summary, lang);
  const posId = tailored.position.id;

  if (posId === 'general-engineering' || posId === 'custom') {
    return baseSummary;
  }

  const eduSnippet = getPrimaryEducationSnippet(tailored.education, lang);
  const topEmployment = tailored.experience.find(
    (e) => e.item.kind === 'employment'
  )?.item;
  const employerName = topEmployment
    ? pickCvText(topEmployment.company, lang)
    : '';

  // Top matched verified skills (pulling actual live skill strings, keeping top 3 from #1 group + 2 from #2 group)
  const topSkillGroups = tailored.skills.filter(
    (s) =>
      s.item.showInCv !== false &&
      (s.tier === 'strong' || s.tier === 'relevant')
  );
  const topSkillNames = topSkillGroups
    .slice(0, 2)
    .flatMap((s, gIdx) =>
      rankSkillsWithinGroup(
        s.item,
        tailored.position,
        tailored.selectedSkillIds
      )
        .slice(0, gIdx === 0 ? 4 : 2)
        .map((sk) => pickCvText(sk, lang))
    )
    .slice(0, 5);

  const topProjects = tailored.projects
    .filter((p) => p.item.showInCv !== false && (p.tier === 'strong' || p.tier === 'relevant'))
    .slice(0, 2)
    .map((p) => pickCvText(p.item.title, lang));

  const skillsStr = listNatural(topSkillNames, lang);
  const projectsStr = listNatural(topProjects, lang);

  if (!eduSnippet || !skillsStr) {
    return baseSummary;
  }

  if (lang === 'ar') {
    switch (posId) {
      case 'mechanical-design':
        return `${eduSnippet} مع خبرة عملية في التصميم الميكانيكي وتصميم تجميعات الصاج القابلة للتصنيع${employerName ? ` لدى ${employerName}` : ''}. تشمل الكفاءات الموثّقة ${skillsStr}، مع تطبيق عملي من التصميم الهندسي حتى القطع بليزر CNC والثني${projectsStr ? `، إضافة إلى مشاريع هندسية مثل ${projectsStr}` : ''}.`;
      case 'hvac-design':
        return `${eduSnippet} يعمل حالياً كمهندس تصميم معدات التبريد والتكييف وتصميم الصاج${employerName ? ` لدى ${employerName}` : ''}، مع تركيز على التصميم الميكانيكي الهيكلي وأغلفة الصاج والتجميعات الميكانيكية ولوحات التحكم الكهربائية وتجهيز ملفات DXF والقطع بالليزر CNC. تشمل الكفاءات الموثّقة ${skillsStr}.`;
      case 'automation-control':
        return `${eduSnippet} بخبرة عملية في التحكم الصناعي والأتمتة، تشمل ${skillsStr}${employerName ? ` ودعم أعمال لوحات التحكم الكلاسيكي والمهام المرتبطة بـ PLC لخطوط الإنتاج لدى ${employerName}` : ''}${projectsStr ? `، إلى جانب مشاريع تقنية في النمذجة والتحكم مثل ${projectsStr}` : ''}.`;
      case 'robotics-mechatronics':
        return `${eduSnippet} متخصص في تكامل الأنظمة الميكانيكية والكهربائية والمدمجة للروبوتات الذكية. تشمل المهارات الموثّقة ${skillsStr}${projectsStr ? `، مُطبَّقة في مشاريع هندسية منها ${projectsStr}` : ''}، إلى جانب خبرة صناعية في التصميم الميكانيكي والتحكم.`;
      case 'manufacturing':
        return `${eduSnippet} مع خبرة مباشرة على خطوط الإنتاج والتصنيع الصناعي${employerName ? ` لدى ${employerName}` : ''} وتدريب صناعي عملي. تتركز المهارات الموثّقة حول ${skillsStr}، بدءاً من تفريد الصاج والتصميم للتصنيع حتى القطع بالليزر والثني والصيانة الدورية.`;
      default:
        return baseSummary;
    }
  }

  switch (posId) {
    case 'mechanical-design':
      return `${eduSnippet} with hands-on mechanical and sheet metal CAD design experience${employerName ? ` at ${employerName}` : ''}, taking industrial equipment designs through manufacturability, CNC fiber laser cutting, and forming. Core verified capabilities span ${skillsStr}${projectsStr ? `, supported by engineering design work including ${projectsStr}` : ''}.`;
    case 'hvac-design':
      return `${eduSnippet} currently specializing as an HVAC Equipment & Sheet Metal Design Engineer${employerName ? ` at ${employerName}` : ''}, focused on mechanical structural design of industrial HVAC and refrigeration equipment, sheet metal enclosures, structural assemblies, electrical control panels, DXF generation, CNC fiber laser cutting, and bending follow-up. Verified capabilities include ${skillsStr}.`;
    case 'automation-control':
      return `${eduSnippet} with practical experience in industrial control and automation spanning ${skillsStr}${employerName ? `, including classic relay-based control panel work and PLC-related production-line support at ${employerName}` : ''}${projectsStr ? `, complemented by control modeling and embedded engineering projects such as ${projectsStr}` : ''}.`;
    case 'robotics-mechatronics':
      return `${eduSnippet} focused on autonomous robotics, kinematics, computer vision, and embedded mechatronic integration. Verified technical capabilities include ${skillsStr}${projectsStr ? `, applied across projects including ${projectsStr}` : ''}, paired with industrial mechanical and control experience.`;
    case 'manufacturing':
      return `${eduSnippet} with hands-on production-line experience${employerName ? ` at ${employerName}` : ''} and industrial plant training. Verified capabilities focus on ${skillsStr}, covering sheet metal design-for-manufacturing, nesting, cutting, forming, and routine industrial equipment maintenance.`;
    default:
      return baseSummary;
  }
}
