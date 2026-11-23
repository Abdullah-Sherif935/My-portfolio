import type { ExperienceItem } from '@/types/portfolio';

/**
 * Initial experience & industrial training records seeded from the existing CV.
 * Exact terminology and dates are preserved without inventing extra claims.
 * Structured as editable records ready for additional post-graduation roles
 * and future Supabase migration.
 */
export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: 'exp-sccoder',
    kind: 'employment',
    kindLabel: {
      en: 'Professional Role',
      ar: 'خبرة مهنية',
    },
    role: {
      en: 'HVAC & Refrigeration Design Engineer (Sheet Metal Design, CNC Operation & Classic Control)',
      ar: 'مهندس تصميم التكييف والتبريد (تصميم الصاج، تشغيل CNC، والتحكم الكلاسيكي)',
    },
    company: {
      en: 'Sccoder — HVAC & Refrigeration',
      ar: 'Sccoder — أنظمة التكييف والتبريد',
    },
    period: {
      en: 'April 2026 – Present',
      ar: 'أبريل 2026 – حتى الآن',
    },
    responsibilities: [
      {
        en: 'Design industrial chiller units ranging from 60 to 240 tons of refrigeration, along with cold rooms and central air-conditioning units, with designs carried through to actual industrial manufacturing.',
        ar: 'تصميم وحدات التشيلرات الصناعية بقدرات من 60 إلى 240 طن تبريد، إلى جانب غرف التبريد ووحدات التكييف المركزي، ومتابعة تنفيذ التصميمات حتى التصنيع الصناعي الفعلي.',
      },
      {
        en: 'Design sheet metal parts and assemblies for HVAC and refrigeration equipment using SolidWorks, ensuring manufacturability and dimensional accuracy.',
        ar: 'تصميم أجزاء وتجميعات الصاج لمعدات التكييف والتبريد باستخدام SolidWorks مع ضمان قابلية التصنيع ودقة الأبعاد.',
      },
      {
        en: 'Work across the production line, from CNC fiber laser cutting (part nesting to final cutting) through to sheet metal bending/forming.',
        ar: 'العمل عبر خط الإنتاج بدءاً من القطع بليزر الفايبر CNC (من تفريد وتوزيع الأجزاء Nesting حتى القطع النهائي) وصولاً إلى ثني وتشكيل الصاج.',
      },
      {
        en: 'Apply practical knowledge of refrigeration circuits and common HVAC/refrigeration faults to support troubleshooting during production and testing.',
        ar: 'تطبيق المعرفة العملية بدوائر التبريد والأعطال الشائعة لأنظمة التكييف والتبريد لدعم تشخيص الأعطال أثناء الإنتاج والاختبار.',
      },
      {
        en: 'Perform routine equipment maintenance and support classic (relay-based) control panel work and PLC-related tasks for production lines.',
        ar: 'تنفيذ الصيانة الدورية للمعدات ودعم أعمال لوحات التحكم الكلاسيكي (القائمة على الريليهات) والمهام المرتبطة بـ PLC لخطوط الإنتاج.',
      },
    ],
    relatedProjectSlugs: [],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 1,
  },
  {
    id: 'exp-ceramica-cleopatra',
    kind: 'training',
    kindLabel: {
      en: 'Industrial Training',
      ar: 'تدريب صناعي',
    },
    role: {
      en: 'Mechanical & Electrical Trainee',
      ar: 'متدرب هندسة ميكانيكية وكهربائية',
    },
    company: {
      en: 'Ceramica Cleopatra',
      ar: 'سيراميكا كليوباترا (Ceramica Cleopatra)',
    },
    period: {
      en: 'July – August 2025',
      ar: 'يوليو – أغسطس 2025',
    },
    responsibilities: [
      {
        en: 'Gained hands-on exposure to mechanical and electrical systems within an industrial production environment.',
        ar: 'اكتساب خبرة عملية مباشرة في الأنظمة الميكانيكية والكهربائية داخل بيئة إنتاج صناعية.',
      },
    ],
    relatedProjectSlugs: [],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 2,
  },
  {
    id: 'exp-farma-swede-masr',
    kind: 'training',
    kindLabel: {
      en: 'Industrial Training',
      ar: 'تدريب صناعي',
    },
    role: {
      en: 'Trainee',
      ar: 'متدرب هندسي',
    },
    company: {
      en: 'Farma Swede Masr',
      ar: 'فارما سويد مصر (Farma Swede Masr)',
    },
    period: {
      en: 'July – August 2024',
      ar: 'يوليو – أغسطس 2024',
    },
    responsibilities: [
      {
        en: 'Assisted in real-world industrial operations and observed maintenance and production processes.',
        ar: 'المساعدة في العمليات الصناعية الفعلية ومتابعة إجراءات الصيانة وخطوط الإنتاج.',
      },
    ],
    relatedProjectSlugs: [],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 3,
  },
];
