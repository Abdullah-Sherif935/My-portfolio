import type { EducationItem, ProfileData } from '@/types/portfolio';

/**
 * Initial structured profile & education records seeded from the existing CV.
 * All fields are editable and structured for future Supabase migration.
 * Does NOT represent the final or complete career history.
 */
export const PROFILE: ProfileData = {
  id: 'owner-profile',
  fullName: {
    en: 'Abdullah Sherif Abdulraouf',
    ar: 'عبدالله شريف عبدالرؤوف',
  },
  shortName: {
    en: 'Abdullah Sherif',
    ar: 'عبدالله شريف',
  },
  headline: {
    en: 'Mechatronics Engineer | HVAC Equipment & Sheet Metal Design Engineer',
    ar: 'مهندس ميكاترونكس | مهندس تصميم معدات التبريد والتكييف وتصميم الصاج',
  },
  summary: {
    en: 'Mechatronics Engineering graduate (2026) from Ain Shams University. Mechanical design of industrial HVAC and refrigeration equipment, specializing in sheet metal enclosures, structural assemblies, electrical control panel design, and manufacturing preparation. Experienced in SolidWorks, DXF generation, CNC fiber laser cutting, bending, and production follow-up, alongside a strong foundation in automation, control systems, and robotics.',
    ar: 'خريج هندسة الميكاترونكس (2026) من جامعة عين شمس. التصميم الميكانيكي لمعدات التبريد والتكييف الصناعية، مع التركيز على تصميم الهياكل الخارجية وأغلفة الصاج والتجميعات الميكانيكية، وتصميم لوحات التحكم الكهربائية وتجهيز ملفات التصنيع. خبرة في استخدام SolidWorks وإعداد ملفات DXF وتجهيز أعمال القطع بالليزر CNC ومتابعة عمليات الثني والتصنيع والتجميع، إلى جانب أساس قوي في الأتمتة وأنظمة التحكم والروبوتات.',
  },
  location: {
    en: '10th of Ramadan City, Sharqia, Egypt',
    ar: 'مدينة العاشر من رمضان، الشرقية، مصر',
  },
  avatarUrl: '/images/abdullah-portrait.jpg',
  avatarAlt: {
    en: 'Portrait of Abdullah Sherif Abdulraouf, Mechatronics Engineer',
    ar: 'الصورة الشخصية للمهندس عبدالله شريف عبدالرؤوف — مهندس ميكاترونكس',
  },
  contact: {
    email: 'eng.abdullah.sheif@gmail.com',
    phone: null,
    linkedinUrl: 'https://www.linkedin.com/in/abdullah-sherif-abdulraouf',
    linkedinDisplay: 'linkedin.com/in/abdullah-sherif-abdulraouf',
    websiteDisplay: 'eng-abdullah.work',
    githubUrl: null,
    githubDisplay: {
      en: 'GitHub profile — To be added',
      ar: 'حساب GitHub — يُضاف لاحقاً',
    },
    youtubeUrl: 'https://youtube.com/@engabdullah-sherif?si=y_QbLbm5jIRLBRUp',
  },
  languages: [
    {
      name: { en: 'Arabic', ar: 'العربية' },
      proficiency: { en: 'Native', ar: 'اللغة الأم' },
    },
    {
      name: { en: 'English', ar: 'الإنجليزية' },
      proficiency: { en: 'Intermediate', ar: 'متوسط' },
    },
  ],
  coreCompetencies: [
    { en: 'Problem Solving', ar: 'حل المشكلات' },
    { en: 'Critical Thinking', ar: 'التفكير النقدي' },
    { en: 'Teamwork & Collaboration', ar: 'العمل الجماعي والتعاون' },
    { en: 'Adaptability', ar: 'المرونة والتكيف' },
    { en: 'Time Management', ar: 'إدارة الوقت' },
    { en: 'Effective Communication', ar: 'التواصل الفعال' },
    { en: 'Leadership', ar: 'القيادة' },
  ],
  dataSource: 'cv-initial',
  isEditable: true,
};

export const EDUCATION_ITEMS: EducationItem[] = [
  {
    id: 'edu-ain-shams-mechatronics',
    degree: {
      en: 'Bachelor of Engineering in Mechatronics Engineering',
      ar: 'بكالوريوس الهندسة — هندسة الميكاترونكس',
    },
    institution: {
      en: 'Ain Shams University, Faculty of Engineering',
      ar: 'كلية الهندسة — جامعة عين شمس',
    },
    period: {
      en: '2021 – 2026',
      ar: '2021 – 2026',
    },
    graduationYear: '2026',
    grade: {
      en: 'GPA: 2.94 (Very Good)',
      ar: 'المعدل التراكمي: 2.94 (جيد جداً)',
    },
    graduationProjectSlug: 'flex-bot-autonomous-hospital-mobile-manipulator',
    coursework: [
      { en: 'Control Systems', ar: 'أنظمة التحكم' },
      { en: 'Robotics', ar: 'الروبوتات' },
      { en: 'Embedded Systems', ar: 'الأنظمة المدمجة' },
      { en: 'PLC Programming', ar: 'برمجة PLC' },
      { en: 'CAD Design', ar: 'التصميم بمساعدة الحاسوب CAD' },
      { en: 'Electrical Circuits', ar: 'الدوائر الكهربائية' },
      { en: 'Fluid Mechanics', ar: 'ميكانيكا الموائع' },
    ],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 1,
  },
];
