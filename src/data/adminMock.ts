import type {
  AdminActivityItem,
  AdminSiteSettings,
  CvWorkspaceConfig,
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
    en: 'Mechatronics Engineer | HVAC & Refrigeration Design',
    ar: 'مهندس ميكاترونكس | تصميم التكييف والتبريد',
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

export const INITIAL_SITE_SETTINGS: AdminSiteSettings = {
  siteName: {
    en: 'Abdullah Sherif Abdulraouf — Engineering Portfolio',
    ar: 'عبدالله شريف عبدالرؤوف — الملف الهندسي',
  },
  seoTitle: {
    en: 'Abdullah Sherif Abdulraouf — Mechatronics & HVAC Design Engineer',
    ar: 'عبدالله شريف عبدالرؤوف — مهندس ميكاترونكس وتصميم التكييف والتبريد',
  },
  seoDescription: {
    en: 'Engineering portfolio covering HVAC & refrigeration design, sheet metal & CNC production, classic/PLC control panels, industrial maintenance, and robotics.',
    ar: 'ملف هندسي يشمل تصميم التكييف والتبريد، الصاج و CNC، لوحات التحكم الكلاسيكي و PLC، الصيانة الصناعية، والروبوتات.',
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
};
