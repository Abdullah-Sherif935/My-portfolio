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
      en: 'HVAC Equipment & Sheet Metal Design Engineer',
      ar: 'مهندس تصميم معدات التبريد والتكييف وتصميم الصاج',
    },
    company: {
      en: 'Sccoder — HVAC & Refrigeration',
      ar: 'Sccoder — أنظمة التكييف والتبريد',
    },
    period: {
      en: 'April 2026 – Present',
      ar: 'أبريل 2026 – حتى الآن',
    },
    summary: {
      en: 'Mechanical design of industrial HVAC and refrigeration equipment, specializing in sheet metal enclosures, structural assemblies, electrical control panel design, and manufacturing preparation. Experienced in SolidWorks, DXF generation, CNC fiber laser cutting, bending, and production follow-up.',
      ar: 'التصميم الميكانيكي لمعدات التبريد والتكييف الصناعية، مع التركيز على تصميم الهياكل الخارجية وأغلفة الصاج والتجميعات الميكانيكية، وتصميم لوحات التحكم الكهربائية وتجهيز ملفات التصنيع. خبرة في استخدام SolidWorks وإعداد ملفات DXF وتجهيز أعمال القطع بالليزر CNC ومتابعة عمليات الثني والتصنيع والتجميع.',
    },
    responsibilities: [
      {
        en: 'Mechanical structural and enclosure design for industrial HVAC and refrigeration equipment—including chillers (60–240 TR), cold rooms, and central air-conditioning units—carried through manufacturing preparation.',
        ar: 'التصميم الميكانيكي الهيكلي وتصميم الأغلفة لمعدات التبريد والتكييف الصناعية — بما في ذلك التشيلرات (60–240 طن تبريد) وغرف التبريد ووحدات التكييف المركزي — حتى مرحلة تجهيز التصنيع.',
      },
      {
        en: 'Design sheet metal enclosures, chassis, and mechanical structural assemblies in SolidWorks, generating production-ready DXF flat patterns with accurate dimensional tolerances.',
        ar: 'تصميم أغلفة وهياكل الصاج والتجميعات الميكانيكية باستخدام SolidWorks وإعداد ملفات DXF الجاهزة للتصنيع بدقة أبعاد عالية.',
      },
      {
        en: 'Prepare CNC fiber laser cutting workflows (part nesting to cutting) and follow up across bending, painting, and mechanical assembly on the production line.',
        ar: 'تجهيز أعمال القطع بليزر الفايبر CNC (من توزيع وتفريد الأجزاء Nesting حتى القطع) ومتابعة عمليات الثني والدهان والتجميع الميكانيكي على خط الإنتاج.',
      },
      {
        en: 'Support electrical control panel design, electrical wiring, sensor integration, classic (relay-based) control panels, and PLC-related tasks for production lines.',
        ar: 'دعم تصميم لوحات التحكم الكهربائية والتمديدات ودمج الحساسات، بالإضافة إلى أعمال لوحات التحكم الكلاسيكي (الريليهات) والمهام المرتبطة بـ PLC لخطوط الإنتاج.',
      },
      {
        en: 'Perform routine equipment maintenance and electro-mechanical production support.',
        ar: 'تنفيذ الصيانة الدورية للمعدات وتقديم الدعم الكهروميكانيكي لخطوط الإنتاج.',
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
