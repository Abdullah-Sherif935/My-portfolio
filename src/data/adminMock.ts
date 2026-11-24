import type {
  AdminActivityItem,
  AdminSiteSettings,
  CvWorkspaceConfig,
  HomeSectionsConfig,
  MediaAsset,
} from '@/types/admin';
import { CERTIFICATIONS } from './certifications';
import { EDUCATION_ITEMS, PROFILE } from './profile';
import { EXPERIENCE_ITEMS } from './experience';
import { PROJECTS } from './projects';
import { SKILL_GROUPS } from './skills';

/**
 * Phase 03 Admin Prototype Mock Data.
 * Clearly marks sample records and avoids fabricated cloud storage or history.
 */
export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-portrait-01',
    fileName: 'abdullah-portrait.jpg',
    url: '/images/abdullah-portrait.jpg',
    mimeType: 'image/jpeg',
    sizeLabel: 'Local asset (~115 KB)',
    dimensions: '800 × 840',
    category: 'portrait',
    alt: {
      en: 'Portrait of Abdullah Sherif Abdulraouf, Mechatronics Engineer',
      ar: 'الصورة الشخصية للمهندس عبدالله شريف عبدالرؤوف — مهندس ميكاترونكس',
    },
    isLocalAsset: true,
    isSample: false,
  },
  {
    id: 'media-favicon-01',
    fileName: 'favicon.svg',
    url: '/favicon.svg',
    mimeType: 'image/svg+xml',
    sizeLabel: 'Local asset (~0.4 KB)',
    dimensions: '64 × 64 (Vector)',
    category: 'branding',
    alt: {
      en: 'Abdullah Sherif AS brand monogram icon',
      ar: 'أيقونة الشعار الهندسي AS للمهندس عبدالله شريف',
    },
    isLocalAsset: true,
    isSample: false,
  },
];

export const INITIAL_SAMPLE_ACTIVITIES: AdminActivityItem[] = [
  {
    id: 'act-sample-01',
    action: {
      en: 'Sample prototype entry — Seeded initial CV records',
      ar: 'سجل توضيحي — تهيئة البيانات الأولية من السيرة الذاتية',
    },
    target: {
      en: 'Profile, Education, Experience & 5 Projects',
      ar: 'الملف الشخصي، التعليم، الخبرات و 5 مشاريع',
    },
    section: 'profile',
    timestampLabel: {
      en: 'Sample data (not a live log)',
      ar: 'بيان تجريبي (ليس سجلاً فعلياً)',
    },
    isSample: true,
  },
  {
    id: 'act-sample-02',
    action: {
      en: 'Sample prototype entry — Verified portrait asset linked',
      ar: 'سجل توضيحي — ربط الصورة الشخصية الموثّقة',
    },
    target: {
      en: '/images/abdullah-portrait.jpg',
      ar: '/images/abdullah-portrait.jpg',
    },
    section: 'media',
    timestampLabel: {
      en: 'Sample data (not a live log)',
      ar: 'بيان تجريبي (ليس سجلاً فعلياً)',
    },
    isSample: true,
  },
  {
    id: 'act-sample-03',
    action: {
      en: 'Sample prototype entry — Industrial company records awaiting confirmation',
      ar: 'سجل توضيحي — سجلات الشركات الصناعية بانتظار التأكيد',
    },
    target: {
      en: '4 placeholder company records',
      ar: '4 سجلات شركات قيد التوثيق',
    },
    section: 'companies',
    timestampLabel: {
      en: 'Sample data (not a live log)',
      ar: 'بيان تجريبي (ليس سجلاً فعلياً)',
    },
    isSample: true,
  },
];

export const INITIAL_CV_CONFIG: CvWorkspaceConfig = {
  targetRole: {
    en: 'Mechatronics Engineer | HVAC Equipment & Sheet Metal Design Engineer',
    ar: 'مهندس ميكاترونكس | مهندس تصميم معدات التبريد والتكييف وتصميم الصاج',
  },
  customSummary: { ...PROFILE.summary },
  useProfileSummary: true,
  selectedEducationIds: EDUCATION_ITEMS.map((item) => item.id),
  selectedExperienceIds: EXPERIENCE_ITEMS.map((item) => item.id),
  selectedProjectIds: PROJECTS.map((item) => item.id),
  selectedSkillGroupIds: SKILL_GROUPS.map((item) => item.id),
  selectedCertificationIds: CERTIFICATIONS.map((item) => item.id),
  sections: [
    { key: 'summary', visible: true },
    { key: 'experience', visible: true },
    { key: 'education', visible: true },
    { key: 'projects', visible: true },
    { key: 'skills', visible: true },
    { key: 'certifications', visible: true },
  ],
};

export const DEFAULT_HOME_SECTIONS_CONFIG: HomeSectionsConfig = {
  intro: {
    visible: true,
    eyebrow: { en: '01 // ENGINEERING PROFILE', ar: '01 // التعريف الهندسي' },
    title: {
      en: 'Engineering Profile & Academic Foundation',
      ar: 'الملف الهندسي والأساس الأكاديمي',
    },
    description: {
      en: 'Bridging Mechatronics Engineering fundamentals with hands-on mechanical design of industrial HVAC and refrigeration equipment, sheet metal enclosures, structural assemblies, electrical control panels, SolidWorks DXF & CNC fiber laser manufacturing, and robotics.',
      ar: 'الربط بين أسس هندسة الميكاترونكس والتصميم الميكانيكي العملي لمعدات التبريد والتكييف الصناعية، وأغلفة الصاج والتجميعات الميكانيكية، ولوحات التحكم الكهربائية، وتجهيز ملفات DXF والقطع بالليزر CNC بـ SolidWorks، والروبوتات.',
    },
    educationLabel: { en: 'Academic Education', ar: 'التعليم الأكاديمي' },
    graduationProjectLabel: { en: 'Graduation Project', ar: 'مشروع التخرج' },
    ctaLabel: { en: 'Full Profile & Education', ar: 'الملف الكامل والتعليم' },
    showEducationCard: true,
    showGpa: true,
    showGraduationProject: true,
    showPillars: true,
    pillarsTitle: { en: 'Core Engineering Approach', ar: 'ركائز العمل الهندسي' },
    pillars: [
      {
        code: 'SYS-01',
        title: {
          en: 'Design-to-Manufacturing Execution',
          ar: 'من التصميم إلى التصنيع الفعلي',
        },
        description: {
          en: 'Developing chillers, cold rooms, and SolidWorks sheet metal assemblies ready for CNC laser cutting and forming.',
          ar: 'تطوير التشيلرات وغرف التبريد وتجميعات الصاج بـ SolidWorks جاهزة للقطع بالليزر CNC والثني.',
        },
      },
      {
        code: 'SYS-02',
        title: {
          en: 'Control & Industrial Reliability',
          ar: 'التحكم وموثوقية التشغيل الصناعي',
        },
        description: {
          en: 'Supporting relay-based control panels, PLC tasks, refrigeration troubleshooting, and routine equipment maintenance.',
          ar: 'دعم لوحات التحكم الكلاسيكي ومهام PLC وتشخيص أعطال التبريد والصيانة الدورية للمعدات.',
        },
      },
      {
        code: 'SYS-03',
        title: {
          en: 'Robotics & Embedded Integration',
          ar: 'الروبوتات والأنظمة المدمجة',
        },
        description: {
          en: 'Integrating mechanical design, ESP32-S3 motor control, ROS 2 / MoveIt 2 kinematics, and machine vision.',
          ar: 'دمج التصميم الميكانيكي والتحكم بـ ESP32-S3 وكينماتيكا ROS 2 / MoveIt 2 والرؤية الحاسوبية.',
        },
      },
    ],
  },
  specializations: {
    visible: true,
    eyebrow: { en: '02 // CORE SPECIALIZATIONS', ar: '02 // التخصصات الأساسية' },
    title: { en: 'Core Engineering Expertise', ar: 'مجالات الخبرة الهندسية' },
    subtitle: {
      en: 'Six integrated disciplines across HVAC equipment structural design, industrial automation, maintenance, mechanical CAD, sheet metal, and robotics & mechatronics.',
      ar: 'ستة مجالات مترابطة تغطي تصميم معدات التبريد والتكييف، الأتمتة الصناعية، الصيانة، التصميم الميكانيكي، تصميم الصاج، والروبوتات والميكاترونكس.',
    },
  },
};

export const INITIAL_SITE_SETTINGS: AdminSiteSettings = {
  siteName: {
    en: 'Abdullah Sherif Abdulraouf — Engineering Portfolio',
    ar: 'عبدالله شريف عبدالرؤوف — الملف الهندسي',
  },
  seoTitle: {
    en: 'Abdullah Sherif Abdulraouf — Mechatronics Engineer | HVAC Equipment & Sheet Metal Design',
    ar: 'عبدالله شريف عبدالرؤوف — مهندس ميكاترونكس | تصميم معدات التبريد والتكييف والصاج',
  },
  seoDescription: {
    en: 'Mechatronics Engineer specializing in mechanical design of industrial HVAC & refrigeration equipment, sheet metal enclosures, SolidWorks CAD, DXF & CNC laser production, electrical control panels, and robotics.',
    ar: 'مهندس ميكاترونكس متخصص في التصميم الميكانيكي لمعدات التبريد والتكييف الصناعية، وأغلفة الصاج، و SolidWorks، وتجهيز ملفات DXF والقطع بالليزر CNC، ولوحات التحكم الكهربائية، والروبوتات.',
  },
  showGraduationPortrait: true,
  showContactEmail: true,
  showLinkedinLink: true,
  showCoursesSection: true,
  recruiterModeEnabled: true,
  defaultCvTemplate: 'ats',
  cvSectionOrder: [
    { key: 'summary', visible: true },
    { key: 'experience', visible: true },
    { key: 'projects', visible: true },
    { key: 'skills', visible: true },
    { key: 'education', visible: true },
    { key: 'certifications', visible: true },
  ],
  homeSections: DEFAULT_HOME_SECTIONS_CONFIG,
};
