import type {
  Certification,
  EducationItem,
  ExperienceItem,
  Language,
  LocalizedText,
  Project,
  SkillGroup,
} from '@/types/portfolio';
import type {
  MatchTier,
  RankedItem,
  RecruiterMatchInput,
  RecruiterPositionId,
  RecruiterPositionOption,
  RecruiterSkillFilterOption,
  TailoredProfileResult,
} from '@/types/recruiter';

export const RECRUITER_POSITIONS: RecruiterPositionOption[] = [
  {
    id: 'hvac-design',
    label: {
      en: 'HVAC Design Engineer',
      ar: 'مهندس تصميم التكييف والتبريد (HVAC)',
    },
    shortLabel: {
      en: 'HVAC Design',
      ar: 'تصميم التكييف والتبريد',
    },
    description: {
      en: 'Highlights industrial chillers (60–240 TR), cold rooms, central AC design, SolidWorks sheet metal, and refrigeration troubleshooting.',
      ar: 'يُبرز تصميم التشيلرات الصناعية (60–240 طن تبريد)، غرف التبريد، وحدات التكييف المركزي، تصميم الصاج بـ SolidWorks، وتشخيص دوائر التبريد.',
    },
    filenameSlug: 'HVAC_Design_Engineer',
    primaryTags: [
      'hvac',
      'refrigeration',
      'chillers',
      'cooling-capacity',
      'cold-rooms',
      'sheet-metal',
      'solidworks',
    ],
    secondaryTags: [
      'autocad',
      'cad',
      'manufacturing',
      'cnc',
      'bending',
      'classic-control',
      'maintenance',
      'mechanical-design',
    ],
    preferredCategories: ['hvac-refrigeration', 'sheet-metal-design', 'mechanical-design'],
    keywords: [
      'hvac',
      'refrigeration',
      'chiller',
      'chillers',
      'cold room',
      'cold rooms',
      'central air',
      'central ac',
      'cooling',
      'solidworks',
      'sheet metal',
      'autocad',
      'manufacturing',
      'تكييف',
      'تبريد',
      'تشيلر',
      'صاج',
    ],
  },
  {
    id: 'mechanical-design',
    label: {
      en: 'Mechanical Design Engineer',
      ar: 'مهندس تصميم ميكانيكي',
    },
    shortLabel: {
      en: 'Mechanical Design',
      ar: 'التصميم الميكانيكي',
    },
    description: {
      en: 'Prioritizes 3D CAD modeling (SolidWorks, Inventor, AutoCAD), sheet metal assemblies, mechanical systems, and design-for-manufacturing.',
      ar: 'يُرتّب النمذجة الهندسية ثلاثية الأبعاد (SolidWorks و Inventor و AutoCAD)، تجميعات الصاج، الأنظمة الميكانيكية، والتصميم للتصنيع.',
    },
    filenameSlug: 'Mechanical_Design_Engineer',
    primaryTags: [
      'mechanical-design',
      'solidworks',
      'sheet-metal',
      'cad',
      'autocad',
      'mechanical-systems',
      'fluid-mechanics',
    ],
    secondaryTags: [
      'manufacturing',
      'cnc',
      'bending',
      'industrial-inspection',
      'hvac',
    ],
    preferredCategories: ['mechanical-design', 'sheet-metal-design', 'hvac-refrigeration'],
    keywords: [
      'mechanical design',
      'solidworks',
      'sheet metal',
      'cad',
      'autocad',
      'inventor',
      'turbine',
      'fluid',
      'manufacturing',
      'cnc',
      'bending',
      'forming',
      'ميكانيك',
      'تصميم',
      'صاج',
    ],
  },
  {
    id: 'automation-control',
    label: {
      en: 'Automation & Control Engineer',
      ar: 'مهندس أتمتة وتحكم صناعي',
    },
    shortLabel: {
      en: 'Automation & Control',
      ar: 'الأتمتة والتحكم',
    },
    description: {
      en: 'Focuses on PLC programming, classic relay-based control panels, control system modeling, sensors, and industrial equipment.',
      ar: 'يركّز على برمجة PLC، لوحات التحكم الكلاسيكي (الريليهات)، نمذجة أنظمة التحكم، الحساسات، والأنظمة الصناعية.',
    },
    filenameSlug: 'Automation_and_Control_Engineer',
    primaryTags: [
      'plc',
      'classic-control',
      'automation',
      'control-systems',
      'electronics',
      'sensors',
      'matlab',
    ],
    secondaryTags: [
      'modeling',
      'embedded',
      'esp32',
      'maintenance',
      'production',
      'industrial-operations',
    ],
    preferredCategories: ['plc-automation', 'industrial-maintenance', 'robotics-mechatronics'],
    keywords: [
      'plc',
      'classic control',
      'relay',
      'control panel',
      'control system',
      'control systems',
      'automation',
      'sensor',
      'sensors',
      'electrical',
      'matlab',
      'simulink',
      'dc motor',
      'parameter estimation',
      'تحكم',
      'أتمتة',
      'لوحات',
    ],
  },
  {
    id: 'robotics-mechatronics',
    label: {
      en: 'Robotics & Mechatronics Engineer',
      ar: 'مهندس روبوتات وميكاترونكس',
    },
    shortLabel: {
      en: 'Robotics & Mechatronics',
      ar: 'الروبوتات والميكاترونكس',
    },
    description: {
      en: 'Highlights ROS 2, MoveIt 2, TF/TF2, 6-DOF manipulators, ESP32-S3 embedded control, YOLOv8 machine vision, and autonomous mobile robots.',
      ar: 'يُبرز ROS 2 و MoveIt 2 و TF/TF2 والأذرع الروبوتية 6-DOF والتحكم المدمج بـ ESP32-S3 والرؤية الحاسوبية YOLOv8 والروبوتات المتنقلة ذاتية الحركة.',
    },
    filenameSlug: 'Robotics_and_Mechatronics_Engineer',
    primaryTags: [
      'robotics',
      'mechatronics',
      'ros2',
      'moveit2',
      'esp32',
      'embedded',
      'machine-vision',
      'autonomous-mobile-robots',
      'manipulators',
    ],
    secondaryTags: [
      'control-systems',
      'sensors',
      'electronics',
      'mechanical-design',
      'cad',
      'matlab',
    ],
    preferredCategories: ['robotics-mechatronics', 'plc-automation', 'mechanical-design'],
    keywords: [
      'ros 2',
      'ros2',
      'moveit',
      'tf2',
      'robotics',
      'robotic',
      'robot',
      'mechatronics',
      'esp32',
      'embedded',
      'yolov8',
      'roboflow',
      'machine vision',
      'computer vision',
      'autonomous',
      '6-dof',
      'manipulator',
      'kinematics',
      'odometry',
      'روبوت',
      'ميكاترونكس',
    ],
  },
  {
    id: 'manufacturing',
    label: {
      en: 'Manufacturing Engineer',
      ar: 'مهندس تصنيع وإنتاج',
    },
    shortLabel: {
      en: 'Manufacturing',
      ar: 'التصنيع والإنتاج',
    },
    description: {
      en: 'Emphasizes CNC fiber laser cutting & nesting, sheet metal bending/forming, production line workflows, and industrial maintenance.',
      ar: 'يركّز على تشغيل ليزر الفايبر CNC وتفريد الأجزاء، ثني وتشكيل الصاج، خطوط الإنتاج، والصيانة والعمليات الصناعية.',
    },
    filenameSlug: 'Manufacturing_Engineer',
    primaryTags: [
      'manufacturing',
      'cnc',
      'fiber-laser',
      'sheet-metal',
      'bending',
      'production',
      'industrial-operations',
      'process-engineering',
    ],
    secondaryTags: [
      'maintenance',
      'solidworks',
      'classic-control',
      'plc',
      'hvac',
      'industrial-inspection',
    ],
    preferredCategories: ['sheet-metal-design', 'industrial-maintenance', 'hvac-refrigeration'],
    keywords: [
      'cnc',
      'fiber laser',
      'nesting',
      'bending',
      'forming',
      'sheet metal',
      'production',
      'manufacturing',
      'industrial operations',
      'maintenance',
      'process',
      'تصنيع',
      'إنتاج',
      'ليزر',
      'ثني',
      'صيانة',
    ],
  },
  {
    id: 'general-engineering',
    label: {
      en: 'General Engineering Profile',
      ar: 'الملف الهندسي العام',
    },
    shortLabel: {
      en: 'General Engineering',
      ar: 'ملف هندسي عام',
    },
    description: {
      en: 'Balanced overview spanning HVAC & Refrigeration, Mechanical & Sheet Metal Design, CNC Manufacturing, Industrial Control, and Robotics.',
      ar: 'عرض متوازن يشمل التكييف والتبريد، التصميم الميكانيكي وتشكيل الصاج، التصنيع بـ CNC، التحكم الصناعي، والروبوتات.',
    },
    filenameSlug: 'Engineering_Profile',
    primaryTags: [
      'hvac',
      'mechanical-design',
      'sheet-metal',
      'robotics',
      'plc',
      'manufacturing',
    ],
    secondaryTags: [
      'solidworks',
      'cnc',
      'classic-control',
      'ros2',
      'control-systems',
      'maintenance',
    ],
    preferredCategories: [
      'hvac-refrigeration',
      'robotics-mechatronics',
      'mechanical-design',
      'plc-automation',
      'sheet-metal-design',
      'industrial-maintenance',
    ],
    keywords: [],
  },
  {
    id: 'custom',
    label: {
      en: 'Other / Custom Position',
      ar: 'مسمى وظيفي مخصص',
    },
    shortLabel: {
      en: 'Custom Role',
      ar: 'وظيفة مخصصة',
    },
    description: {
      en: 'Enter any target job title to prioritize the closest verified records from this portfolio using deterministic keyword matching.',
      ar: 'أدخل أي مسمى وظيفي مستهدف لترتيب أقرب السجلات الموثّقة في هذا الملف باستخدام مطابقة الكلمات المفتاحية دون اختلاق أي بيانات.',
    },
    filenameSlug: 'Custom_Position',
    primaryTags: [],
    secondaryTags: [],
    preferredCategories: [],
    keywords: [],
  },
];

export const RECRUITER_SKILL_FILTERS: RecruiterSkillFilterOption[] = [
  {
    id: 'hvac-chillers',
    label: { en: 'HVAC & Chillers', ar: 'التكييف والتشيلرات' },
    tags: ['hvac', 'refrigeration', 'chillers', 'cooling-capacity', 'cold-rooms'],
  },
  {
    id: 'solidworks-cad',
    label: { en: 'SolidWorks & CAD', ar: 'SolidWorks والتصميم الهندسي' },
    tags: ['solidworks', 'cad', 'autocad', 'mechanical-design'],
  },
  {
    id: 'sheet-metal-cnc',
    label: { en: 'Sheet Metal & CNC Laser', ar: 'الصاج والقطع بليزر CNC' },
    tags: ['sheet-metal', 'cnc', 'fiber-laser', 'bending', 'manufacturing'],
  },
  {
    id: 'plc-control',
    label: { en: 'PLC & Classic Control', ar: 'PLC والتحكم الكلاسيكي' },
    tags: ['plc', 'classic-control', 'automation', 'control-systems'],
  },
  {
    id: 'ros2-robotics',
    label: { en: 'ROS 2 & Robotics', ar: 'ROS 2 والروبوتات' },
    tags: ['robotics', 'mechatronics', 'ros2', 'moveit2', 'manipulators', 'autonomous-mobile-robots'],
  },
  {
    id: 'embedded-vision',
    label: { en: 'ESP32 & Machine Vision', ar: 'ESP32 والرؤية الحاسوبية' },
    tags: ['esp32', 'embedded', 'machine-vision', 'sensors', 'electronics'],
  },
  {
    id: 'maintenance-ops',
    label: { en: 'Industrial Maintenance', ar: 'الصيانة والعمليات الصناعية' },
    tags: ['maintenance', 'production', 'industrial-operations'],
  },
];

const TAG_DISPLAY_LABELS: Record<string, string> = {
  hvac: 'HVAC',
  refrigeration: 'Refrigeration',
  chillers: 'Chillers (60–240 TR)',
  'cooling-capacity': 'Cooling Capacity',
  'cold-rooms': 'Cold Rooms',
  solidworks: 'SolidWorks',
  'sheet-metal': 'Sheet Metal',
  autocad: 'AutoCAD',
  cad: 'CAD',
  'mechanical-design': 'Mechanical Design',
  'mechanical-systems': 'Mechanical Systems',
  'fluid-mechanics': 'Fluid Mechanics',
  'renewable-energy': 'Renewable Energy',
  cnc: 'CNC',
  'fiber-laser': 'Fiber Laser',
  bending: 'Sheet Metal Bending',
  manufacturing: 'Manufacturing',
  production: 'Production Line',
  'industrial-operations': 'Industrial Operations',
  'process-engineering': 'Process Operations',
  maintenance: 'Equipment Maintenance',
  plc: 'PLC',
  'classic-control': 'Classic Control',
  automation: 'Automation',
  'control-systems': 'Control Systems',
  matlab: 'MATLAB / Simulink',
  modeling: 'System Modeling',
  electronics: 'Electronics',
  sensors: 'Sensors',
  robotics: 'Robotics',
  mechatronics: 'Mechatronics',
  ros2: 'ROS 2',
  moveit2: 'MoveIt 2',
  esp32: 'ESP32-S3',
  embedded: 'Embedded Systems',
  'machine-vision': 'Machine Vision (YOLOv8)',
  'autonomous-mobile-robots': 'Autonomous Mobile Robots',
  manipulators: '6-DOF Manipulator',
  'industrial-inspection': 'Industrial Inspection',
};

const STOP_WORDS = new Set([
  'engineer',
  'engineering',
  'senior',
  'junior',
  'entry',
  'level',
  'specialist',
  'technician',
  'manager',
  'lead',
  'intern',
  'trainee',
  'and',
  'for',
  'the',
  'with',
  'مهندس',
  'هندسة',
  'أول',
  'حديث',
  'تخرج',
  'في',
  'من',
  'على',
]);

export function getRecruiterPosition(id?: string | null): RecruiterPositionOption {
  const found = RECRUITER_POSITIONS.find((p) => p.id === id);
  return found ?? RECRUITER_POSITIONS[0]!;
}

export function isValidPositionId(value?: string | null): value is RecruiterPositionId {
  return RECRUITER_POSITIONS.some((p) => p.id === value);
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenizeCustomRole(rawTitle: string): string[] {
  const normalized = normalizeText(rawTitle);
  if (!normalized) return [];
  const tokens = normalized
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
  // Expand common Arabic/English engineering synonyms strictly for search matching
  const expanded = new Set(tokens);
  const synonymMap: Record<string, string[]> = {
    hvac: ['refrigeration', 'chiller', 'cooling', 'air'],
    تكييف: ['hvac', 'refrigeration', 'chiller', 'sheet-metal'],
    تبريد: ['hvac', 'refrigeration', 'chiller', 'cold-rooms'],
    ميكانيكا: ['mechanical', 'solidworks', 'cad', 'sheet-metal'],
    ميكانيكي: ['mechanical', 'solidworks', 'cad', 'sheet-metal'],
    صاج: ['sheet-metal', 'solidworks', 'cnc', 'bending'],
    تحكم: ['plc', 'classic-control', 'control-systems', 'automation'],
    أتمتة: ['plc', 'automation', 'control-systems'],
    روبوت: ['robotics', 'ros2', 'moveit2', 'mechatronics'],
    روبوتات: ['robotics', 'ros2', 'moveit2', 'mechatronics'],
    ميكاترونكس: ['mechatronics', 'robotics', 'embedded', 'control-systems'],
    تصنيع: ['manufacturing', 'cnc', 'production', 'sheet-metal'],
    إنتاج: ['production', 'manufacturing', 'cnc', 'maintenance'],
    صيانة: ['maintenance', 'industrial-operations', 'classic-control'],
    cad: ['solidworks', 'autocad', 'mechanical-design'],
    ros: ['ros2', 'robotics', 'moveit2'],
    embedded: ['esp32', 'robotics', 'electronics'],
    automation: ['plc', 'classic-control', 'control-systems'],
    mechatronics: ['robotics', 'embedded', 'control-systems'],
  };
  for (const token of tokens) {
    const extras = synonymMap[token];
    if (extras) {
      for (const ex of extras) expanded.add(ex);
    }
  }
  return Array.from(expanded);
}

function formatKeywordLabel(tagOrKeyword: string): string {
  if (TAG_DISPLAY_LABELS[tagOrKeyword]) return TAG_DISPLAY_LABELS[tagOrKeyword];
  return tagOrKeyword
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) =>
      part.length <= 3
        ? part.toUpperCase()
        : (part.charAt(0).toUpperCase() + part.slice(1))
    )
    .join(' ');
}

function evaluateCorpusMatch(params: {
  itemTags: string[];
  corpusText: string;
  position: RecruiterPositionOption;
  customTokens: string[];
  filterTags: string[];
  categoryBonus?: number;
  cvPriority?: number;
  featuredBonus?: number;
}): { score: number; matchedKeywords: string[]; hasDirectHit: boolean } {
  const {
    itemTags,
    corpusText,
    position,
    customTokens,
    filterTags,
    categoryBonus = 0,
    cvPriority = 50,
    featuredBonus = 0,
  } = params;

  const normalizedCorpus = normalizeText(corpusText);
  const tagSet = new Set(itemTags.map((t) => t.toLowerCase()));
  const matchedLabels = new Set<string>();
  let score = 0;

  if (position.id === 'general-engineering') {
    for (const tag of position.primaryTags) {
      if (tagSet.has(tag)) {
        score += 4;
        matchedLabels.add(formatKeywordLabel(tag));
      }
    }
    for (const tag of position.secondaryTags) {
      if (tagSet.has(tag)) {
        score += 2;
        matchedLabels.add(formatKeywordLabel(tag));
      }
    }
  } else if (position.id === 'custom') {
    for (const token of customTokens) {
      const hitTag = Array.from(tagSet).find(
        (t) => t === token || t.includes(token) || token.includes(t)
      );
      if (hitTag) {
        score += 7;
        matchedLabels.add(formatKeywordLabel(hitTag));
      } else if (normalizedCorpus.includes(token)) {
        score += 5;
        matchedLabels.add(formatKeywordLabel(token));
      }
    }
  } else {
    for (const tag of position.primaryTags) {
      if (tagSet.has(tag) || normalizedCorpus.includes(tag.replace(/-/g, ' '))) {
        score += 7;
        matchedLabels.add(formatKeywordLabel(tag));
      }
    }
    for (const tag of position.secondaryTags) {
      if (tagSet.has(tag) || normalizedCorpus.includes(tag.replace(/-/g, ' '))) {
        score += 3;
        matchedLabels.add(formatKeywordLabel(tag));
      }
    }
    for (const kw of position.keywords) {
      if (normalizedCorpus.includes(kw.toLowerCase())) {
        score += 2;
        if (matchedLabels.size < 6) {
          matchedLabels.add(formatKeywordLabel(kw));
        }
      }
    }
    score += categoryBonus;
  }

  // Optional HR skill filters boost
  for (const filterTag of filterTags) {
    if (tagSet.has(filterTag) || normalizedCorpus.includes(filterTag.replace(/-/g, ' '))) {
      score += 8;
      matchedLabels.add(formatKeywordLabel(filterTag));
    }
  }

  const hasDirectHit = score > 0;
  // Tie-breaker based strictly on verified cvPriority & featured flag
  const finalScore = score + Math.round(cvPriority / 25) + featuredBonus;

  return {
    score: finalScore,
    matchedKeywords: Array.from(matchedLabels).slice(0, 6),
    hasDirectHit,
  };
}

function classifyTier(
  rawMatchScore: number,
  hasDirectHit: boolean,
  isGeneral: boolean,
  cvPriority: number
): MatchTier {
  if (isGeneral) {
    if (cvPriority >= 85 || rawMatchScore >= 12) return 'strong';
    if (cvPriority >= 70 || rawMatchScore >= 6) return 'relevant';
    return 'supporting';
  }
  if (!hasDirectHit) return 'supporting';
  if (rawMatchScore >= 14) return 'strong';
  if (rawMatchScore >= 6) return 'relevant';
  return 'supporting';
}

export function buildTailoredProfile(
  data: {
    experience: ExperienceItem[];
    projects: Project[];
    skills: SkillGroup[];
    education: EducationItem[];
    certifications: Certification[];
  },
  input: RecruiterMatchInput
): TailoredProfileResult {
  const position = getRecruiterPosition(input.positionId);
  const customTitle = (input.customTitle ?? '').trim();
  const isCustomRole = position.id === 'custom';
  const selectedSkillIds = input.selectedSkillIds ?? [];
  const preferredCvLanguage: Language = input.preferredCvLanguage === 'ar' ? 'ar' : 'en';

  const filterTags = RECRUITER_SKILL_FILTERS.filter((f) => selectedSkillIds.includes(f.id)).flatMap(
    (f) => f.tags
  );
  const customTokens = isCustomRole ? tokenizeCustomRole(customTitle) : [];

  const displayPositionTitle: LocalizedText =
    isCustomRole && customTitle
      ? { en: customTitle, ar: customTitle }
      : position.label;

  let anyDirectHit = position.id === 'general-engineering';

  // 1. Rank Experience
  const rankedExperience: RankedItem<ExperienceItem>[] = data.experience
    .map((exp) => {
      const corpus = [
        exp.role.en,
        exp.role.ar,
        exp.company.en,
        exp.company.ar,
        exp.summary?.en ?? '',
        exp.summary?.ar ?? '',
        ...exp.responsibilities.flatMap((r) => [r.en, r.ar]),
      ].join(' ');

      const res = evaluateCorpusMatch({
        itemTags: exp.matchingTags ?? [],
        corpusText: corpus,
        position,
        customTokens,
        filterTags,
        cvPriority: exp.cvPriority ?? 50,
        featuredBonus: exp.kind === 'employment' ? 3 : 0,
      });

      if (res.hasDirectHit) anyDirectHit = true;

      return {
        item: exp,
        tier: classifyTier(
          res.score,
          res.hasDirectHit,
          position.id === 'general-engineering',
          exp.cvPriority ?? 50
        ),
        score: res.score,
        matchedKeywords: res.matchedKeywords,
      };
    })
    .sort((a, b) => b.score - a.score || a.item.displayOrder - b.item.displayOrder);

  // 2. Rank Projects
  const rankedProjects: RankedItem<Project>[] = data.projects
    .map((project) => {
      const corpus = [
        project.title.en,
        project.title.ar,
        project.shortDescription.en,
        project.shortDescription.ar,
        project.overview.en,
        project.overview.ar,
        project.category,
        project.categoryLabel.en,
        project.categoryLabel.ar,
        ...project.technologies,
        ...project.deliverables.flatMap((d) => [d.en, d.ar]),
      ].join(' ');

      const categoryBonus = position.preferredCategories.includes(project.category) ? 6 : 0;

      const res = evaluateCorpusMatch({
        itemTags: project.matchingTags ?? [],
        corpusText: corpus,
        position,
        customTokens,
        filterTags,
        categoryBonus,
        cvPriority: project.cvPriority ?? 50,
        featuredBonus: project.featured ? 2 : 0,
      });

      if (res.hasDirectHit) anyDirectHit = true;

      return {
        item: project,
        tier: classifyTier(
          res.score,
          res.hasDirectHit,
          position.id === 'general-engineering',
          project.cvPriority ?? 50
        ),
        score: res.score,
        matchedKeywords: res.matchedKeywords,
      };
    })
    .sort((a, b) => b.score - a.score || a.item.displayOrder - b.item.displayOrder);

  // 3. Rank Skills (respecting public visibility)
  const rankedSkills: RankedItem<SkillGroup>[] = data.skills
    .filter((group) => group.isVisible !== false)
    .map((group) => {
      const corpus = [
        group.title.en,
        group.title.ar,
        group.description.en,
        group.description.ar,
        ...group.skills.flatMap((s) => [s.en, s.ar]),
      ].join(' ');

      const res = evaluateCorpusMatch({
        itemTags: group.matchingTags ?? [],
        corpusText: corpus,
        position,
        customTokens,
        filterTags,
        cvPriority: group.cvPriority ?? 50,
      });

      if (res.hasDirectHit) anyDirectHit = true;

      return {
        item: group,
        tier: classifyTier(
          res.score,
          res.hasDirectHit,
          position.id === 'general-engineering',
          group.cvPriority ?? 50
        ),
        score: res.score,
        matchedKeywords: res.matchedKeywords,
      };
    })
    .sort((a, b) => b.score - a.score || a.item.displayOrder - b.item.displayOrder);

  // 4. Rank Certifications
  const rankedCertifications: RankedItem<Certification>[] = data.certifications
    .map((cert) => {
      const corpus = [
        cert.title.en,
        cert.title.ar,
        cert.category.en,
        cert.category.ar,
        cert.description?.en ?? '',
        cert.description?.ar ?? '',
      ].join(' ');

      const res = evaluateCorpusMatch({
        itemTags: cert.matchingTags ?? [],
        corpusText: corpus,
        position,
        customTokens,
        filterTags,
        cvPriority: 60,
      });

      if (res.hasDirectHit) anyDirectHit = true;

      return {
        item: cert,
        tier: classifyTier(
          res.score,
          res.hasDirectHit,
          position.id === 'general-engineering',
          60
        ),
        score: res.score,
        matchedKeywords: res.matchedKeywords,
      };
    })
    .sort((a, b) => b.score - a.score || a.item.displayOrder - b.item.displayOrder);

  // Collect top verified focus areas (strictly from matched skill group titles)
  const matchedFocusAreas: LocalizedText[] = rankedSkills
    .filter((s) => s.tier === 'strong' || s.tier === 'relevant')
    .slice(0, 3)
    .map((s) => s.item.title);

  return {
    position,
    displayPositionTitle,
    isCustomRole,
    customTitle,
    selectedSkillIds,
    preferredCvLanguage,
    hasDirectMatches: anyDirectHit,
    matchedFocusAreas,
    experience: rankedExperience,
    projects: rankedProjects,
    skills: rankedSkills,
    education: [...data.education].sort((a, b) => a.displayOrder - b.displayOrder),
    certifications: rankedCertifications,
  };
}

export function buildCvDocumentTitle(params: {
  fullNameEn: string;
  positionId: RecruiterPositionId;
  customTitle?: string;
  cvLanguage: Language;
}): string {
  const cleanName = params.fullNameEn
    .split(/\s+/)
    .slice(0, 2)
    .join('_')
    .replace(/[^A-Za-z0-9_]/g, '') || 'Abdullah_Sherif';

  const position = getRecruiterPosition(params.positionId);
  let roleSlug = position.filenameSlug;
  if (params.positionId === 'custom' && params.customTitle?.trim()) {
    const sanitized = params.customTitle
      .trim()
      .replace(/[^A-Za-z0-9\s]+/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 42);
    if (sanitized) roleSlug = sanitized;
  }

  const langSuffix = params.cvLanguage === 'ar' ? '_AR' : '';
  return `${cleanName}_${roleSlug}_CV${langSuffix}`;
}
