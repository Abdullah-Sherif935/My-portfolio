import type { LocalizedText } from '@/types/portfolio';

export interface FutureModuleSpec {
  route: string;
  area: 'admin' | 'career';
  title: LocalizedText;
  description: LocalizedText;
  plannedItems: LocalizedText[];
}

export const FUTURE_MODULES: Record<string, FutureModuleSpec> = {
  '/admin/login': {
    route: '/admin/login',
    area: 'admin',
    title: { en: 'Admin Sign-In (Planned)', ar: 'تسجيل دخول لوحة التحكم (قادم)' },
    description: {
      en: 'Reserved entry point for owner-only authentication powered by Supabase Auth in a later phase.',
      ar: 'نقطة دخول محجوزة لمصادقة مالك المنصة فقط عبر Supabase Auth في مرحلة قادمة.',
    },
    plannedItems: [
      { en: 'Supabase Auth email/password or MFA sign-in', ar: 'مصادقة Supabase Auth بالبريد أو التحقق الثنائي' },
      { en: 'Server-verified session and RLS enforcement', ar: 'التحقق الخادمي من الجلسة وتطبيق RLS' },
    ],
  },
  '/admin': {
    route: '/admin',
    area: 'admin',
    title: { en: 'Admin Dashboard Overview (Planned)', ar: 'لوحة التحكم الخاصة (قادم)' },
    description: {
      en: 'Private management console for overseeing portfolio content, media, and platform settings.',
      ar: 'لوحة إدارة خاصة للتحكم بمحتوى الملف الهندسي والوسائط وإعدادات المنصة.',
    },
    plannedItems: [
      { en: 'Content status summary across projects, companies, and CV sections', ar: 'ملخص حالة المحتوى للمشاريع والشركات والسيرة الذاتية' },
      { en: 'Protected by server-side authorization & Supabase RLS', ar: 'محمية بتفويض خادمي وسياسات Supabase RLS' },
    ],
  },
  '/admin/projects': {
    route: '/admin/projects',
    area: 'admin',
    title: { en: 'Projects CMS (Planned)', ar: 'إدارة المشاريع CMS (قادم)' },
    description: {
      en: 'Create, edit, publish, and categorize bilingual engineering project case studies.',
      ar: 'إنشاء وتعديل ونشر وتصنيف دراسات الحالة الهندسية ثنائية اللغة.',
    },
    plannedItems: [
      { en: 'Bilingual EN/AR editor for project specs and deliverables', ar: 'محرر ثنائي اللغة لمواصفات المشاريع ومخرجاتها' },
      { en: 'Project cover image & schematic gallery management', ar: 'إدارة صور الغلاف ومعرض المخططات الفنية' },
    ],
  },
  '/admin/companies': {
    route: '/admin/companies',
    area: 'admin',
    title: { en: 'Companies & Clients CMS (Planned)', ar: 'إدارة الشركات والعملاء (قادم)' },
    description: {
      en: 'Manage verified company profiles, official logo assets, relationship types, and linked projects.',
      ar: 'إدارة ملفات الشركات الموثّقة والشعارات الرسمية وطبيعة التعامل والمشاريع المرتبطة.',
    },
    plannedItems: [
      { en: 'Verified logo uploads via Supabase Storage', ar: 'رفع الشعارات الرسمية عبر Supabase Storage' },
      { en: 'Relational linking between companies and portfolio projects', ar: 'ربط علائقي بين الشركات ومشاريع المعرض' },
    ],
  },
  '/admin/experience': {
    route: '/admin/experience',
    area: 'admin',
    title: { en: 'Experience Manager (Planned)', ar: 'إدارة الخبرات المهنية (قادم)' },
    description: {
      en: 'Maintain verified engineering roles, dates, responsibilities, and related project references.',
      ar: 'إدارة المناصب الهندسية الموثّقة والتواريخ والمسؤوليات وروابط المشاريع.',
    },
    plannedItems: [
      { en: 'Ordered timeline management synced with public portfolio & CV builder', ar: 'إدارة الخط الزمني المتزامن مع الموقع ومنشئ السيرة الذاتية' },
    ],
  },
  '/admin/skills': {
    route: '/admin/skills',
    area: 'admin',
    title: { en: 'Skills & Certifications Manager (Planned)', ar: 'إدارة المهارات والشهادات (قادم)' },
    description: {
      en: 'Organize engineering skill categories, tooling tags, and verified certification links.',
      ar: 'تنظيم مجموعات المهارات الهندسية والأدوات وروابط الشهادات الموثّقة.',
    },
    plannedItems: [
      { en: 'Structured skill groups and credential verification records', ar: 'مجموعات مهارات منظمة وسجلات تحقق الشهادات' },
    ],
  },
  '/admin/media': {
    route: '/admin/media',
    area: 'admin',
    title: { en: 'Media Library (Planned)', ar: 'مكتبة الوسائط (قادم)' },
    description: {
      en: 'Centralized asset library backed by Supabase Storage for project photos, CAD renders, and PDFs.',
      ar: 'مكتبة مركزية مدعومة بـ Supabase Storage لصور المشاريع ورسومات CAD وملفات PDF.',
    },
    plannedItems: [
      { en: 'Validated uploads with MIME-type checks and signed/public bucket rules', ar: 'رفع موثّق مع فحص أنواع الملفات وسياسات التخزين الآمنة' },
    ],
  },
  '/admin/settings': {
    route: '/admin/settings',
    area: 'admin',
    title: { en: 'Platform Settings (Planned)', ar: 'إعدادات المنصة (قادم)' },
    description: {
      en: 'Configure profile metadata, public contact endpoints, and site-wide bilingual copy.',
      ar: 'إعداد بيانات الملف الشخصي وقنوات التواصل العامة والنصوص ثنائية اللغة.',
    },
    plannedItems: [
      { en: 'Owner profile fields, social URLs, and SEO metadata controls', ar: 'إدارة بيانات المالك وروابط التواصل وإعدادات محركات البحث' },
    ],
  },
  '/career': {
    route: '/career',
    area: 'career',
    title: { en: 'Career Platform Workspace (Planned)', ar: 'مساحة المسار المهني (قادم)' },
    description: {
      en: 'Private hub uniting the Smart CV Builder, AI Career Assistant, job discovery, and application tracker.',
      ar: 'مركز خاص يجمع منشئ السيرة الذاتية الذكي ومساعد المسار المهني واستكشاف الوظائف وتتبع التقديمات.',
    },
    plannedItems: [
      { en: 'Unified overview of CV versions and active job applications', ar: 'نظرة شاملة على نسخ السيرة الذاتية وطلبات التوظيف النشطة' },
    ],
  },
  '/career/cv-builder': {
    route: '/career/cv-builder',
    area: 'career',
    title: { en: 'Smart CV Builder & PDF Export (Planned)', ar: 'منشئ السيرة الذاتية الذكي وتصدير PDF (قادم)' },
    description: {
      en: 'Generate tailored, ATS-friendly engineering CVs directly from structured portfolio records with client-side PDF export.',
      ar: 'إنشاء سير ذاتية هندسية مخصصة ومتوافقة مع أنظمة ATS مباشرة من بيانات المنصة مع تصدير PDF.',
    },
    plannedItems: [
      { en: 'Role-tailored project and skill selection', ar: 'اختيار المشاريع والمهارات المناسبة لكل وظيفة' },
      { en: 'Client-side PDF rendering in English and Arabic', ar: 'تصدير PDF من جهة العميل باللغتين العربية والإنجليزية' },
    ],
  },
  '/career/jobs': {
    route: '/career/jobs',
    area: 'career',
    title: { en: 'Job Discovery & Matching (Planned)', ar: 'استكشاف ومطابقة الوظائف (قادم)' },
    description: {
      en: 'Track and evaluate industrial engineering, HVAC, PLC automation, and mechanical design opportunities.',
      ar: 'متابعة وتقييم فرص العمل في الهندسة الصناعية والتكييف والأتمتة والتصميم الميكانيكي.',
    },
    plannedItems: [
      { en: 'Structured role criteria & optional AI-assisted gap analysis', ar: 'معايير منظمة للوظائف وتحليل اختياري للفجوات بالذكاء الاصطناعي' },
    ],
  },
  '/career/applications': {
    route: '/career/applications',
    area: 'career',
    title: { en: 'Application Tracker (Planned)', ar: 'متابعة طلبات التوظيف (قادم)' },
    description: {
      en: 'Track submitted applications, attached CV versions, interview stages, and follow-up reminders.',
      ar: 'تتبع الطلبات المقدمة ونسخ السيرة الذاتية المرفقة ومراحل المقابلات وتذكيرات المتابعة.',
    },
    plannedItems: [
      { en: 'Status pipeline from saved opportunity through offer stage', ar: 'مسار حالة منظم من حفظ الفرصة حتى مرحلة العرض' },
    ],
  },
};
