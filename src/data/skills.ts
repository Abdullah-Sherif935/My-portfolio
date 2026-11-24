import type { SkillGroup } from '@/types/portfolio';

/**
 * Initial categorized technical skills seeded from the existing CV.
 * Editable and structured to expand with additional field & industrial tooling.
 */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'hvac-refrigeration',
    code: 'SKL-01',
    title: {
      en: 'HVAC Equipment & Sheet Metal Design',
      ar: 'تصميم معدات التبريد والتكييف والصاج',
    },
    description: {
      en: 'Mechanical structural design and manufacturing preparation for industrial HVAC and refrigeration equipment, sheet metal enclosures, and electrical control panels.',
      ar: 'التصميم الميكانيكي الهيكلي وتجهيز التصنيع لمعدات التبريد والتكييف الصناعية، وأغلفة الصاج، ولوحات التحكم الكهربائية.',
    },
    skills: [
      { en: 'Industrial HVAC Equipment Structural Design (Chillers, Cold Rooms, Central AC)', ar: 'التصميم الميكانيكي الهيكلي لمعدات التبريد والتكييف (التشيلرات، غرف التبريد، التكييف المركزي)' },
      { en: 'Sheet Metal Enclosures & Chassis Design', ar: 'تصميم أغلفة وهياكل الصاج الصناعية' },
      { en: 'DXF Generation & Manufacturing Preparation', ar: 'إعداد ملفات DXF وتجهيز ملفات التصنيع' },
      { en: 'Electrical Control Panel Design & Wiring', ar: 'تصميم لوحات التحكم الكهربائية والتمديدات' },
    ],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 1,
  },
  {
    id: 'cad-simulation',
    code: 'SKL-02',
    title: {
      en: 'CAD & Simulation',
      ar: 'التصميم الهندسي والمحاكاة CAD',
    },
    description: {
      en: '3D mechanical modeling, sheet metal assemblies, 2D drafting, and control system simulation tools.',
      ar: 'النمذجة الميكانيكية ثلاثية الأبعاد، تجميعات الصاج، الرسم الهندسي ثنائي الأبعاد، وأدوات محاكاة أنظمة التحكم.',
    },
    skills: [
      { en: 'SolidWorks (incl. Sheet Metal Design)', ar: 'SolidWorks (شامل تصميم الصاج)' },
      { en: 'AutoCAD', ar: 'AutoCAD' },
      { en: 'Autodesk Inventor', ar: 'Autodesk Inventor' },
      { en: 'MATLAB / Simulink', ar: 'MATLAB / Simulink' },
    ],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 2,
  },
  {
    id: 'manufacturing-control',
    code: 'SKL-03',
    title: {
      en: 'Manufacturing, Control & Maintenance',
      ar: 'التصنيع وأنظمة التحكم والصيانة',
    },
    description: {
      en: 'Sheet metal fabrication workflows, CNC fiber laser cutting, industrial control panels, and equipment maintenance.',
      ar: 'عمليات تصنيع وتشكيل الصاج، القطع بليزر الفايبر CNC، لوحات التحكم الكهربائية و PLC، والصيانة الدورية.',
    },
    skills: [
      { en: 'CNC Operation (Fiber Laser & Part Nesting)', ar: 'تشغيل ماكينات القطع بالليزر CNC وتوزيع الأجزاء' },
      { en: 'Sheet Metal Bending / Forming', ar: 'ثني وتشكيل الصاج' },
      { en: 'PLC Programming', ar: 'برمجة PLC' },
      { en: 'Classic (Relay-Based) Control', ar: 'التحكم الكلاسيكي (الريليهات واللوحات)' },
      { en: 'Routine Equipment Maintenance', ar: 'الصيانة الدورية للمعدات' },
    ],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 3,
  },
  {
    id: 'robotics-software',
    code: 'SKL-04',
    title: {
      en: 'Robotics, Vision & Embedded Systems',
      ar: 'الروبوتات والرؤية الحاسوبية والأنظمة المدمجة',
    },
    description: {
      en: 'Autonomous mobile manipulation, kinematics, computer vision deployment, and embedded motor control.',
      ar: 'الروبوتات المتنقلة ذاتية الحركة، الكينماتيكا، نشر نماذج الرؤية الحاسوبية، والتحكم المدمج بالمحركات.',
    },
    skills: [
      { en: 'ROS 2', ar: 'ROS 2' },
      { en: 'MoveIt 2 & TF / TF2', ar: 'MoveIt 2 و TF / TF2' },
      { en: 'Machine Vision (YOLOv8, Roboflow)', ar: 'الرؤية الحاسوبية (YOLOv8, Roboflow)' },
      { en: 'Embedded Systems (ESP32 / ESP32-S3)', ar: 'الأنظمة المدمجة (ESP32 / ESP32-S3)' },
    ],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 4,
  },
  {
    id: 'productivity-ai',
    code: 'SKL-05',
    title: {
      en: 'Productivity & AI Tools',
      ar: 'أدوات الإنتاجية والذكاء الاصطناعي',
    },
    description: {
      en: 'Engineering documentation suites and modern AI workflow tools.',
      ar: 'أدوات التوثيق والإنتاجية الهندسية وأدوات الذكاء الاصطناعي الحديثة.',
    },
    skills: [
      { en: 'Microsoft Office', ar: 'Microsoft Office' },
      { en: 'Google Workspace', ar: 'Google Workspace' },
      { en: 'Claude', ar: 'Claude' },
      { en: 'ChatGPT', ar: 'ChatGPT' },
      { en: 'Gemini', ar: 'Gemini' },
    ],
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 5,
  },
];
