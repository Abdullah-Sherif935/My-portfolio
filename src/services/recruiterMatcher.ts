import type {
  Certification,
  EducationItem,
  ExperienceItem,
  Language,
  LocalizedText,
  Project,
  SkillGroup,
  SpecializationId,
} from '@/types/portfolio';
import type {
  CompatibilityAssessment,
  CompatibilityDimension,
  MatchTier,
  ProfileMatchingWeights,
  RankedItem,
  RecruiterMatchInput,
  RecruiterPositionId,
  RecruiterPositionOption,
  RecruiterProfileOverrides,
  RecruiterSkillFilterOption,
  SkillEvaluation,
  SkillRequirement,
  TailoredProfileResult,
} from '@/types/recruiter';

// ============================================================================
// 1. Canonical Bilingual Engineering Competency Catalog (Deduplicated Concepts)
// ============================================================================

export const COMPETENCY_CATALOG: SkillRequirement[] = [
  {
    id: 'solidworks',
    label: { en: 'SolidWorks 3D CAD', ar: 'التصميم ثلاثي الأبعاد بـ SolidWorks' },
    aliases: ['solidworks', 'solid works', 'sw cad'],
    partialAliases: ['3d cad', 'cad modeling', 'autodesk inventor', 'inventor'],
  },
  {
    id: 'sheet-metal',
    label: { en: 'Sheet Metal Design & Enclosures', ar: 'تصميم الصاج والأغلفة المعدنية' },
    aliases: ['sheet metal', 'sheet-metal', 'enclosure', 'enclosures', 'chassis', 'flat pattern', 'صاج', 'أغلفة الصاج'],
    partialAliases: ['fabrication', 'metalwork', 'bending', 'forming'],
  },
  {
    id: 'dxf-manufacturing-drawings',
    label: { en: 'DXF & Manufacturing Drawings', ar: 'ملفات DXF والرسومات التصنيعية' },
    aliases: ['dxf', 'manufacturing drawing', 'manufacturing drawings', 'manufacturing preparation', 'flat pattern', 'flat patterns', 'dimensional tolerance', 'ملفات التصنيع', 'رسومات تصنيعية'],
    partialAliases: ['autocad', '2d drafting', 'cad'],
  },
  {
    id: 'autocad',
    label: { en: 'AutoCAD 2D Drafting', ar: 'الرسم الهندسي بـ AutoCAD' },
    aliases: ['autocad', 'auto cad', '2d drafting'],
    partialAliases: ['cad', 'solidworks'],
  },
  {
    id: 'inventor',
    label: { en: 'Autodesk Inventor', ar: 'Autodesk Inventor' },
    aliases: ['autodesk inventor', 'inventor'],
    partialAliases: ['solidworks', '3d cad'],
  },
  {
    id: 'mechanical-design',
    label: { en: 'Mechanical & Structural Design', ar: 'التصميم الميكانيكي والهيكلي' },
    aliases: ['mechanical design', 'mechanical-design', 'structural design', 'structural assemblies', 'mechanical assemblies', 'التصميم الميكانيكي', 'هياكل'],
    partialAliases: ['cad', 'solidworks', 'mechanical systems'],
  },
  {
    id: 'hvac-equipment',
    label: { en: 'HVAC & Refrigeration Equipment', ar: 'معدات التبريد والتكييف الصناعية' },
    aliases: ['hvac', 'refrigeration', 'chiller', 'chillers', 'cold room', 'cold rooms', 'central ac', 'central air', 'air conditioning', 'تكييف', 'تبريد', 'تشيلر', 'غرف التبريد'],
    partialAliases: ['cooling', 'thermal', 'fluid mechanics'],
  },
  {
    id: 'cnc-fiber-laser',
    label: { en: 'CNC Fiber Laser & Nesting', ar: 'القطع بليزر الفايبر CNC وتفريد الأجزاء' },
    aliases: ['cnc', 'fiber laser', 'fiber-laser', 'laser cutting', 'nesting', 'part nesting', 'ليزر', 'تفريد الأجزاء'],
    partialAliases: ['sheet metal', 'manufacturing', 'production'],
  },
  {
    id: 'sheet-metal-bending',
    label: { en: 'Sheet Metal Bending & Forming', ar: 'ثني وتشكيل الصاج' },
    aliases: ['bending', 'forming', 'press brake', 'ثني', 'تشكيل الصاج'],
    partialAliases: ['sheet metal', 'fabrication', 'manufacturing'],
  },
  {
    id: 'production-manufacturing',
    label: { en: 'Production & Manufacturing Follow-Up', ar: 'متابعة الإنتاج وعمليات التصنيع' },
    aliases: ['production line', 'production lines', 'manufacturing', 'mechanical assembly', 'production follow-up', 'industrial operations', 'تصنيع', 'خطوط الإنتاج', 'إنتاج'],
    partialAliases: ['process', 'maintenance', 'operations'],
  },
  {
    id: 'plc-programming',
    label: { en: 'PLC Programming', ar: 'برمجة وحدات التحكم المنطقي PLC' },
    aliases: ['plc', 'plc programming', 'ladder logic', 'برمجة plc'],
    partialAliases: ['classic control', 'control panel', 'automation', 'control systems'],
  },
  {
    id: 'classic-control',
    label: { en: 'Classic (Relay-Based) Control Panels', ar: 'لوحات التحكم الكلاسيكي (الريليهات)' },
    aliases: ['classic control', 'classic-control', 'relay-based', 'relay control', 'control panel', 'control panels', 'electrical control panel', 'التحكم الكلاسيكي', 'لوحات التحكم'],
    partialAliases: ['electrical wiring', 'plc', 'automation'],
  },
  {
    id: 'electrical-wiring',
    label: { en: 'Electrical Wiring & Panel Assembly', ar: 'التمديدات الكهربائية وتجميع اللوحات' },
    aliases: ['electrical wiring', 'wiring', 'electrical circuits', 'electrical design', 'تمديدات', 'الدوائر الكهربائية'],
    partialAliases: ['control panel', 'electronics', 'classic control'],
  },
  {
    id: 'sensors-instrumentation',
    label: { en: 'Sensors & Instrumentation', ar: 'الحساسات وأجهزة القياس' },
    aliases: ['sensor', 'sensors', 'instrumentation', 'encoder', 'odometry', 'حساسات'],
    partialAliases: ['control panel', 'embedded', 'electronics'],
  },
  {
    id: 'control-systems-matlab',
    label: { en: 'Control Systems & MATLAB / Simulink', ar: 'أنظمة التحكم و MATLAB / Simulink' },
    aliases: ['control system', 'control systems', 'control-systems', 'matlab', 'simulink', 'parameter estimation', 'dc motor', 'أنظمة التحكم'],
    partialAliases: ['modeling', 'automation', 'plc'],
  },
  {
    id: 'ros2-robotics',
    label: { en: 'ROS 2 & Autonomous Robotics', ar: 'ROS 2 والروبوتات ذاتية الحركة' },
    aliases: ['ros 2', 'ros2', 'autonomous mobile robot', 'autonomous mobile robots', 'mobile manipulator', 'robotics', 'روبوت', 'روبوتات'],
    partialAliases: ['mechatronics', 'embedded', 'autonomous'],
  },
  {
    id: 'moveit2-kinematics',
    label: { en: 'MoveIt 2, TF/TF2 & 6-DOF Kinematics', ar: 'كينماتيكا الأذرع 6-DOF و MoveIt 2 و TF2' },
    aliases: ['moveit', 'moveit2', 'moveit 2', 'tf2', 'tf / tf2', '6-dof', 'manipulator', 'robotic arm', 'kinematics', 'ذراع', 'كينماتيكا'],
    partialAliases: ['robotics', 'ros2', 'mechanical design'],
  },
  {
    id: 'embedded-esp32',
    label: { en: 'Embedded Systems (ESP32-S3)', ar: 'الأنظمة المدمجة (ESP32-S3)' },
    aliases: ['esp32', 'esp32-s3', 'embedded', 'embedded systems', 'microcontroller', 'motor control', 'الأنظمة المدمجة'],
    partialAliases: ['electronics', 'sensors', 'arduino'],
  },
  {
    id: 'machine-vision',
    label: { en: 'Machine Vision (YOLOv8 / Roboflow)', ar: 'الرؤية الحاسوبية (YOLOv8 / Roboflow)' },
    aliases: ['yolov8', 'yolo', 'roboflow', 'machine vision', 'computer vision', 'vision-guided', 'الرؤية الحاسوبية'],
    partialAliases: ['ai', 'robotics', 'camera'],
  },
  {
    id: 'industrial-maintenance',
    label: { en: 'Industrial & Routine Equipment Maintenance', ar: 'الصيانة الدورية والصناعية للمعدات' },
    aliases: ['maintenance', 'equipment maintenance', 'electro-mechanical', 'troubleshooting', 'صيانة'],
    partialAliases: ['production', 'industrial operations', 'classic control'],
  },
  {
    id: 'fluid-mechanics',
    label: { en: 'Fluid Mechanics & Thermal Systems', ar: 'ميكانيكا الموائع والأنظمة الحرارية' },
    aliases: ['fluid mechanics', 'fluid-mechanics', 'turbine', 'water turbine', 'ميكانيكا الموائع', 'توربينة'],
    partialAliases: ['hvac', 'cooling', 'refrigeration'],
  },
  {
    id: 'mechatronics-degree',
    label: { en: 'Mechatronics Engineering Foundation', ar: 'أساس هندسة الميكاترونكس' },
    aliases: ['mechatronics', 'ain shams', 'bachelor of engineering', 'ميكاترونكس'],
    partialAliases: ['mechanical', 'electrical', 'control'],
  },
  // Common external industry competencies (detected honestly as missing unless added to verified portfolio)
  {
    id: 'fea-ansys',
    label: { en: 'FEA / ANSYS Simulation', ar: 'تحليل العناصر المحدودة FEA / ANSYS' },
    aliases: ['ansys', 'fea', 'finite element', 'abaqus', 'solidworks simulation', 'cfd'],
  },
  {
    id: 'scada-hmi',
    label: { en: 'SCADA / HMI Systems', ar: 'أنظمة SCADA و HMI' },
    aliases: ['scada', 'hmi', 'wincc', 'tia portal', 'siemens s7', 'modbus', 'profinet'],
    partialAliases: ['plc', 'automation'],
  },
  {
    id: 'revit-bim-hvac',
    label: { en: 'Revit MEP / BIM & HAP Load Calc', ar: 'Revit MEP / BIM وحساب الأحمال HAP' },
    aliases: ['revit', 'bim', 'hap', 'hourly analysis program', 'ashrae', 'duct sizing', 'psychrometric'],
    partialAliases: ['hvac', 'autocad'],
  },
  {
    id: 'hydraulics-pneumatics',
    label: { en: 'Hydraulics & Pneumatics', ar: 'الهيدروليك والنيوماتيك' },
    aliases: ['hydraulic', 'hydraulics', 'pneumatic', 'pneumatics', 'هيدروليك', 'نيوماتيك'],
  },
  {
    id: 'gdt-iso-quality',
    label: { en: 'GD&T & ISO Quality Standards', ar: 'التفاوتات الهندسية GD&T ومعايير الجودة ISO' },
    aliases: ['gd&t', 'gdt', 'iso 9001', 'six sigma', 'lean manufacturing', 'kaizen', 'quality control'],
    partialAliases: ['dimensional tolerance', 'inspection', 'manufacturing'],
  },
  {
    id: 'python-cpp',
    label: { en: 'Python / C++ Programming', ar: 'البرمجة بـ Python / C++' },
    aliases: ['python', 'c++', 'cpp', 'embedded c'],
    partialAliases: ['ros 2', 'esp32', 'matlab'],
  },
];

const COMPETENCY_BY_ID = new Map(COMPETENCY_CATALOG.map((c) => [c.id, c]));

function req(ids: string[]): SkillRequirement[] {
  return ids
    .map((id) => COMPETENCY_BY_ID.get(id))
    .filter((item): item is SkillRequirement => Boolean(item));
}

const DEFAULT_WEIGHTS: ProfileMatchingWeights = {
  requiredSkills: 35,
  preferredSkills: 15,
  experience: 20,
  projects: 15,
  toolsAndTech: 10,
  educationAndCerts: 5,
};

// ============================================================================
// 2. Seven Independent Job Profiles
// ============================================================================

export const RECRUITER_POSITIONS: RecruiterPositionOption[] = [
  {
    id: 'hvac-design',
    label: {
      en: 'HVAC Equipment & Sheet Metal Design Engineer',
      ar: 'مهندس تصميم معدات التبريد والتكييف وتصميم الصاج',
    },
    shortLabel: {
      en: 'HVAC Design',
      ar: 'تصميم التكييف والتبريد',
    },
    cvHeadline: {
      en: 'HVAC Equipment & Sheet Metal Design Engineer | Mechatronics Engineer',
      ar: 'مهندس تصميم معدات التبريد والتكييف وتصميم الصاج | مهندس ميكاترونكس',
    },
    description: {
      en: 'Prioritizes verified industrial HVAC & refrigeration equipment design (chillers, cold rooms, central AC), sheet metal enclosures, SolidWorks DXF & CNC laser production, and electrical control panels.',
      ar: 'يُبرز التصميم الميكانيكي الهيكلي لمعدات التبريد والتكييف الصناعية (التشيلرات وغرف التبريد والتكييف المركزي) وأغلفة الصاج وملفات DXF والقطع بالليزر CNC ولوحات التحكم.',
    },
    filenameSlug: 'HVAC_Equipment_and_Sheet_Metal_Design_Engineer',
    requiredSkills: req([
      'hvac-equipment',
      'sheet-metal',
      'solidworks',
      'dxf-manufacturing-drawings',
      'mechanical-design',
    ]),
    preferredSkills: req([
      'cnc-fiber-laser',
      'sheet-metal-bending',
      'classic-control',
      'electrical-wiring',
      'autocad',
      'industrial-maintenance',
    ]),
    primaryTags: ['hvac', 'refrigeration', 'chillers', 'cold-rooms', 'sheet-metal', 'solidworks'],
    secondaryTags: ['autocad', 'cad', 'manufacturing', 'cnc', 'bending', 'classic-control', 'maintenance', 'mechanical-design'],
    preferredCategories: ['hvac-refrigeration', 'sheet-metal-design'],
    keywords: ['hvac', 'refrigeration', 'chiller', 'cold room', 'central ac', 'sheet metal', 'solidworks', 'dxf'],
    weights: {
      requiredSkills: 35,
      preferredSkills: 15,
      experience: 22,
      projects: 13,
      toolsAndTech: 10,
      educationAndCerts: 5,
    },
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
    cvHeadline: {
      en: 'Mechanical Design Engineer | SolidWorks 3D CAD, Sheet Metal & DFM',
      ar: 'مهندس تصميم ميكانيكي | SolidWorks وتصميم الصاج والتجهيز للتصنيع',
    },
    description: {
      en: 'Prioritizes SolidWorks 3D CAD, mechanical & structural assemblies, sheet metal enclosures, DXF manufacturing drawings, CAD tools (AutoCAD, Inventor), and design-for-manufacturing.',
      ar: 'يُرتّب النمذجة الهندسية بـ SolidWorks والتصميم الميكانيكي والهيكلي وتجميعات الصاج وملفات التصنيع DXF وبرامج AutoCAD و Inventor والتصميم للتصنيع.',
    },
    filenameSlug: 'Mechanical_Design_Engineer',
    requiredSkills: req([
      'mechanical-design',
      'solidworks',
      'sheet-metal',
      'dxf-manufacturing-drawings',
      'autocad',
    ]),
    preferredSkills: req([
      'inventor',
      'cnc-fiber-laser',
      'sheet-metal-bending',
      'production-manufacturing',
      'fluid-mechanics',
      'fea-ansys',
    ]),
    primaryTags: ['mechanical-design', 'solidworks', 'sheet-metal', 'cad', 'autocad', 'mechanical-systems', 'fluid-mechanics'],
    secondaryTags: ['manufacturing', 'cnc', 'bending', 'industrial-inspection'],
    preferredCategories: ['mechanical-design', 'sheet-metal-design'],
    keywords: ['mechanical design', 'solidworks', 'sheet metal', 'dxf', 'autocad', 'inventor', 'cad', 'structural', 'turbine'],
    weights: {
      requiredSkills: 35,
      preferredSkills: 15,
      experience: 20,
      projects: 15,
      toolsAndTech: 10,
      educationAndCerts: 5,
    },
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
    cvHeadline: {
      en: 'Automation & Control Engineer | PLC, Classic Control Panels & Systems Modeling',
      ar: 'مهندس أتمتة وتحكم صناعي | PLC ولوحات التحكم الكلاسيكي ونمذجة الأنظمة',
    },
    description: {
      en: 'Focuses on PLC programming, classic relay-based control panels, electrical wiring, sensors, MATLAB/Simulink control modeling, and verified control engineering projects.',
      ar: 'يركّز على برمجة PLC ولوحات التحكم الكلاسيكي (الريليهات) والتمديدات الكهربائية والحساسات ونمذجة أنظمة التحكم بـ MATLAB/Simulink ومشاريع التحكم الموثّقة.',
    },
    filenameSlug: 'Automation_and_Control_Engineer',
    requiredSkills: req([
      'plc-programming',
      'classic-control',
      'electrical-wiring',
      'control-systems-matlab',
      'sensors-instrumentation',
    ]),
    preferredSkills: req([
      'embedded-esp32',
      'industrial-maintenance',
      'production-manufacturing',
      'scada-hmi',
      'mechatronics-degree',
    ]),
    primaryTags: ['plc', 'classic-control', 'automation', 'control-systems', 'electronics', 'sensors', 'matlab'],
    secondaryTags: ['modeling', 'embedded', 'esp32', 'maintenance', 'production', 'industrial-operations'],
    preferredCategories: ['plc-automation'],
    keywords: ['plc', 'classic control', 'relay', 'control panel', 'wiring', 'sensor', 'matlab', 'simulink', 'dc motor'],
    weights: {
      requiredSkills: 36,
      preferredSkills: 14,
      experience: 18,
      projects: 16,
      toolsAndTech: 10,
      educationAndCerts: 6,
    },
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
    cvHeadline: {
      en: 'Robotics & Mechatronics Engineer | ROS 2, MoveIt 2, Embedded ESP32 & 6-DOF Systems',
      ar: 'مهندس روبوتات وميكاترونكس | ROS 2 و MoveIt 2 والأنظمة المدمجة ESP32 والأذرع الروبوتية',
    },
    description: {
      en: 'Highlights Flex Bot mobile manipulator, 6-DOF robotic arms, ROS 2, MoveIt 2, TF/TF2, ESP32-S3 embedded motor control, YOLOv8 machine vision, and mechatronics systems.',
      ar: 'يُبرز مشروع الروبوت الطبي المتنقل Flex Bot والأذرع الروبوتية 6-DOF و ROS 2 و MoveIt 2 و TF/TF2 والتحكم المدمج بـ ESP32-S3 والرؤية الحاسوبية YOLOv8.',
    },
    filenameSlug: 'Robotics_and_Mechatronics_Engineer',
    requiredSkills: req([
      'ros2-robotics',
      'moveit2-kinematics',
      'embedded-esp32',
      'sensors-instrumentation',
      'control-systems-matlab',
    ]),
    preferredSkills: req([
      'machine-vision',
      'mechatronics-degree',
      'python-cpp',
      'solidworks',
    ]),
    primaryTags: ['robotics', 'mechatronics', 'ros2', 'moveit2', 'esp32', 'embedded', 'machine-vision', 'autonomous-mobile-robots', 'manipulators'],
    secondaryTags: ['control-systems', 'sensors', 'electronics', 'cad', 'matlab'],
    preferredCategories: ['robotics-mechatronics'],
    keywords: ['ros 2', 'ros2', 'moveit', 'tf2', 'robotics', 'robotic', '6-dof', 'esp32', 'yolov8', 'roboflow', 'odometry', 'autonomous'],
    weights: {
      requiredSkills: 34,
      preferredSkills: 14,
      experience: 12,
      projects: 24,
      toolsAndTech: 10,
      educationAndCerts: 6,
    },
  },
  {
    id: 'manufacturing',
    label: {
      en: 'Manufacturing & Production Engineer',
      ar: 'مهندس تصنيع وإنتاج',
    },
    shortLabel: {
      en: 'Manufacturing',
      ar: 'التصنيع والإنتاج',
    },
    cvHeadline: {
      en: 'Manufacturing & Production Engineer | CNC Fiber Laser, Sheet Metal Fabrication & Assembly',
      ar: 'مهندس تصنيع وإنتاج | القطع بالليزر CNC وتشكيل الصاج وخطوط الإنتاج',
    },
    description: {
      en: 'Emphasizes production preparation, DXF nesting, CNC fiber laser cutting, sheet metal bending & forming, mechanical assembly follow-up, and routine industrial maintenance.',
      ar: 'يركّز على تجهيز التصنيع وتفريد الأجزاء DXF والقطع بليزر الفايبر CNC وثني وتشكيل الصاج ومتابعة التجميع على خطوط الإنتاج والصيانة الصناعية.',
    },
    filenameSlug: 'Manufacturing_Engineer',
    requiredSkills: req([
      'cnc-fiber-laser',
      'sheet-metal-bending',
      'production-manufacturing',
      'dxf-manufacturing-drawings',
      'sheet-metal',
    ]),
    preferredSkills: req([
      'industrial-maintenance',
      'solidworks',
      'classic-control',
      'plc-programming',
      'gdt-iso-quality',
    ]),
    primaryTags: ['manufacturing', 'cnc', 'fiber-laser', 'sheet-metal', 'bending', 'production', 'industrial-operations', 'process-engineering'],
    secondaryTags: ['maintenance', 'solidworks', 'classic-control', 'plc', 'industrial-inspection'],
    preferredCategories: ['sheet-metal-design', 'industrial-maintenance', 'mechanical-design'],
    keywords: ['cnc', 'fiber laser', 'nesting', 'bending', 'forming', 'production', 'manufacturing', 'assembly', 'maintenance'],
    weights: {
      requiredSkills: 35,
      preferredSkills: 15,
      experience: 24,
      projects: 11,
      toolsAndTech: 10,
      educationAndCerts: 5,
    },
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
    cvHeadline: {
      en: 'Mechatronics Engineer | Mechanical Design, Industrial Systems & Robotics',
      ar: 'مهندس ميكاترونكس | التصميم الميكانيكي والأنظمة الصناعية والروبوتات',
    },
    description: {
      en: 'Balanced presentation of the verified Mechatronics Engineering degree, mechanical & sheet metal CAD design, CNC production, industrial control, and robotics builds.',
      ar: 'عرض متوازن للمؤهل الأكاديمي في هندسة الميكاترونكس والخبرة العملية في التصميم الميكانيكي والصاج والتصنيع CNC والتحكم الصناعي ومشاريع الروبوتات.',
    },
    filenameSlug: 'Engineering_Profile',
    requiredSkills: req([
      'mechatronics-degree',
      'mechanical-design',
      'solidworks',
      'production-manufacturing',
      'control-systems-matlab',
    ]),
    preferredSkills: req([
      'hvac-equipment',
      'sheet-metal',
      'plc-programming',
      'ros2-robotics',
      'embedded-esp32',
    ]),
    primaryTags: ['mechanical-design', 'sheet-metal', 'robotics', 'plc', 'manufacturing', 'hvac'],
    secondaryTags: ['solidworks', 'cnc', 'classic-control', 'ros2', 'control-systems', 'maintenance'],
    preferredCategories: ['mechanical-design', 'robotics-mechatronics', 'hvac-refrigeration', 'plc-automation', 'sheet-metal-design', 'industrial-maintenance'],
    keywords: [],
    weights: DEFAULT_WEIGHTS,
  },
  {
    id: 'custom',
    label: {
      en: 'Other / Custom Role & Job Description',
      ar: 'وظيفة مخصصة / وصف وظيفي',
    },
    shortLabel: {
      en: 'Custom Role',
      ar: 'وظيفة مخصصة',
    },
    cvHeadline: {
      en: 'Mechatronics Engineer | Verified Multidisciplinary Engineering Profile',
      ar: 'مهندس ميكاترونكس | ملف هندسي متعدد التخصصات موثّق',
    },
    description: {
      en: 'Enter any target job title and optionally paste a job description to extract requirements, identify verified matches and gaps, and tailor the CV — 100% deterministically with no paid AI.',
      ar: 'أدخل أي مسمى وظيفي والصق الوصف الوظيفي اختيارياً لاستخراج المتطلبات ومطابقتها بشفافية مع السجلات الموثّقة وتوضيح نقاط التطابق والفجوات دون أي ذكاء اصطناعي خارجي.',
    },
    filenameSlug: 'Custom_Position',
    requiredSkills: [],
    preferredSkills: [],
    primaryTags: [],
    secondaryTags: [],
    preferredCategories: [],
    keywords: [],
    weights: DEFAULT_WEIGHTS,
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

// ============================================================================
// 3. Helpers & Normalization
// ============================================================================

export function getRecruiterPosition(id?: string | null): RecruiterPositionOption {
  const found = RECRUITER_POSITIONS.find((p) => p.id === id);
  return found ?? RECRUITER_POSITIONS[0]!;
}

export function getEffectivePosition(
  id: RecruiterPositionId,
  overrides?: RecruiterProfileOverrides
): RecruiterPositionOption {
  const base = getRecruiterPosition(id);
  const override = overrides?.[id];
  if (!override) return base;

  const extraReq = (override.extraRequiredTerms ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((term): SkillRequirement => ({
      id: `custom-req-${term.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')}`,
      label: { en: term, ar: term },
      aliases: [term.toLowerCase()],
    }));

  const extraPref = (override.extraPreferredTerms ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((term): SkillRequirement => ({
      id: `custom-pref-${term.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')}`,
      label: { en: term, ar: term },
      aliases: [term.toLowerCase()],
    }));

  const requiredSkills = [
    ...(override.requiredSkillIds ? req(override.requiredSkillIds) : base.requiredSkills),
    ...extraReq,
  ];
  const preferredSkills = [
    ...(override.preferredSkillIds ? req(override.preferredSkillIds) : base.preferredSkills),
    ...extraPref,
  ];

  const weights: ProfileMatchingWeights = {
    ...base.weights,
    ...(override.weights ?? {}),
  };

  return {
    ...base,
    requiredSkills,
    preferredSkills,
    weights,
  };
}

export function isValidPositionId(value?: string | null): value is RecruiterPositionId {
  return RECRUITER_POSITIONS.some((p) => p.id === value);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[^a-z0-9\u0600-\u06ff+#&/\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesAlias(normalizedCorpus: string, alias: string): boolean {
  const cleanAlias = normalizeText(alias);
  if (!cleanAlias) return false;
  if (cleanAlias.length <= 3 && /^[a-z0-9+#]+$/.test(cleanAlias)) {
    const pattern = new RegExp(`(?:^|[\\s/,-])${escapeRegex(cleanAlias)}(?:$|[\\s/,-])`, 'i');
    return pattern.test(normalizedCorpus);
  }
  return normalizedCorpus.includes(cleanAlias);
}

function matchesRequirement(
  normalizedCorpus: string,
  tagSet: Set<string>,
  requirement: SkillRequirement
): 'direct' | 'partial' | 'none' {
  if (tagSet.has(requirement.id)) return 'direct';
  for (const alias of requirement.aliases) {
    if (tagSet.has(alias.toLowerCase()) || matchesAlias(normalizedCorpus, alias)) {
      return 'direct';
    }
  }
  if (requirement.partialAliases) {
    for (const pAlias of requirement.partialAliases) {
      if (tagSet.has(pAlias.toLowerCase()) || matchesAlias(normalizedCorpus, pAlias)) {
        return 'partial';
      }
    }
  }
  return 'none';
}

// ============================================================================
// 4. Deterministic Custom Job Description Requirement Extractor (Zero AI)
// ============================================================================

const UNCATALOGED_TECH_TERMS: Array<{ id: string; label: LocalizedText; aliases: string[] }> = [
  { id: 'catia', label: { en: 'CATIA', ar: 'CATIA' }, aliases: ['catia'] },
  { id: 'creo', label: { en: 'PTC Creo / Pro-E', ar: 'PTC Creo' }, aliases: ['creo', 'pro/engineer', 'pro-e'] },
  { id: 'siemens-nx', label: { en: 'Siemens NX', ar: 'Siemens NX' }, aliases: ['siemens nx', 'ug nx'] },
  { id: 'labview', label: { en: 'LabVIEW', ar: 'LabVIEW' }, aliases: ['labview'] },
  { id: 'dcs', label: { en: 'DCS Systems', ar: 'أنظمة DCS' }, aliases: ['dcs', 'distributed control'] },
  { id: 'bms', label: { en: 'Building Management Systems (BMS)', ar: 'أنظمة إدارة المباني BMS' }, aliases: ['bms', 'building management'] },
  { id: 'firefighting-plumbing', label: { en: 'Firefighting & Plumbing MEP', ar: 'مكافحة الحريق والسباكة MEP' }, aliases: ['firefighting', 'fire fighting', 'nfpa', 'plumbing', 'sprinkler'] },
  { id: 'welding', label: { en: 'Welding & Heavy Steel Fabrication', ar: 'اللحام وتصنيع الهياكل الثقيلة' }, aliases: ['welding', 'mig', 'tig', 'aws d1', 'لحام'] },
  { id: 'sap-erp', label: { en: 'SAP / ERP Systems', ar: 'أنظمة SAP / ERP' }, aliases: ['sap', 'erp', 'oracle erp'] },
  { id: 'docker-linux', label: { en: 'Linux / Docker', ar: 'Linux / Docker' }, aliases: ['docker', 'kubernetes', 'ubuntu', 'linux'] },
  { id: 'stm32-arm', label: { en: 'STM32 / ARM Microcontrollers', ar: 'متحكمات STM32 / ARM' }, aliases: ['stm32', 'arm cortex', 'rtos', 'freertos'] },
  { id: 'can-bus', label: { en: 'CAN Bus / Industrial Networking', ar: 'شبكات CAN Bus الصناعية' }, aliases: ['can bus', 'canbus', 'ethercat', 'opc ua', 'bacnet'] },
];

function extractCustomRequirements(
  customTitle: string,
  customDescription: string
): { required: SkillRequirement[]; preferred: SkillRequirement[]; preferredCategories: SpecializationId[] } {
  const titleNorm = normalizeText(customTitle);
  const descLines = customDescription
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let mode: 'required' | 'preferred' = 'required';
  const requiredTextParts: string[] = [titleNorm];
  const preferredTextParts: string[] = [];

  for (const line of descLines) {
    const lower = normalizeText(line);
    if (/(preferred|nice to have|bonus|plus|desirable|يفضل|ميزة إضافية|إضافي)/i.test(lower)) {
      mode = 'preferred';
    } else if (/(required|requirements|must have|qualifications|responsibilities|مطلوب|المتطلبات|المؤهلات|المسؤوليات)/i.test(lower)) {
      mode = 'required';
    }
    if (mode === 'preferred') {
      preferredTextParts.push(lower);
    } else {
      requiredTextParts.push(lower);
    }
  }

  const reqCorpus = requiredTextParts.join(' ');
  const prefCorpus = preferredTextParts.join(' ');
  const fullCorpus = `${reqCorpus} ${prefCorpus}`.trim();

  const required: SkillRequirement[] = [];
  const preferred: SkillRequirement[] = [];
  const seen = new Set<string>();

  const allCandidates: SkillRequirement[] = [
    ...COMPETENCY_CATALOG,
    ...UNCATALOGED_TECH_TERMS.map((t) => ({ id: t.id, label: t.label, aliases: t.aliases })),
  ];

  for (const comp of allCandidates) {
    const inReq = comp.aliases.some((a) => matchesAlias(reqCorpus, a));
    const inPref = comp.aliases.some((a) => matchesAlias(prefCorpus, a));
    if (inReq && !seen.has(comp.id)) {
      required.push(comp);
      seen.add(comp.id);
    } else if (inPref && !seen.has(comp.id)) {
      preferred.push(comp);
      seen.add(comp.id);
    }
  }

  // Infer preferred categories from extracted requirements
  const catSet = new Set<SpecializationId>();
  if (seen.has('hvac-equipment') || seen.has('revit-bim-hvac')) catSet.add('hvac-refrigeration');
  if (seen.has('mechanical-design') || seen.has('solidworks') || seen.has('autocad') || seen.has('inventor')) catSet.add('mechanical-design');
  if (seen.has('sheet-metal') || seen.has('cnc-fiber-laser') || seen.has('sheet-metal-bending')) catSet.add('sheet-metal-design');
  if (seen.has('plc-programming') || seen.has('classic-control') || seen.has('control-systems-matlab') || seen.has('scada-hmi')) catSet.add('plc-automation');
  if (seen.has('ros2-robotics') || seen.has('moveit2-kinematics') || seen.has('embedded-esp32') || seen.has('machine-vision')) catSet.add('robotics-mechatronics');
  if (seen.has('industrial-maintenance') || seen.has('production-manufacturing')) catSet.add('industrial-maintenance');

  // If JD had very few structured hits, split long required list cleanly so top 6 are required & rest preferred
  if (required.length > 7 && preferred.length === 0) {
    const overflow = required.splice(6);
    preferred.push(...overflow);
  }

  // Fallback if user entered a custom title without catalog keywords: keep empty so honest "no direct overlap" notice shows
  if (required.length === 0 && preferred.length === 0 && fullCorpus.length > 0) {
    // Check if there are meaningful non-stopword tokens to show as an unverified requirement
    const cleanTitle = customTitle.trim();
    if (cleanTitle.length >= 3) {
      required.push({
        id: 'custom-role-term',
        label: { en: cleanTitle, ar: cleanTitle },
        aliases: [normalizeText(cleanTitle)],
      });
    }
  }

  return {
    required,
    preferred,
    preferredCategories: Array.from(catSet),
  };
}

// ============================================================================
// 5. Evidence Evaluation Across All Verified Portfolio Records
// ============================================================================

interface IndexedRecord {
  kind: 'skill' | 'experience' | 'project' | 'education' | 'certification';
  label: LocalizedText;
  corpus: string;
  tags: Set<string>;
}

function buildEvidenceIndex(data: {
  experience: ExperienceItem[];
  projects: Project[];
  skills: SkillGroup[];
  education: EducationItem[];
  certifications: Certification[];
}): IndexedRecord[] {
  const records: IndexedRecord[] = [];

  for (const exp of data.experience) {
    const corpus = normalizeText(
      [
        exp.role.en,
        exp.role.ar,
        exp.company.en,
        exp.company.ar,
        exp.summary?.en ?? '',
        exp.summary?.ar ?? '',
        ...exp.responsibilities.flatMap((r) => [r.en, r.ar]),
      ].join(' ')
    );
    records.push({
      kind: 'experience',
      label: {
        en: `Experience: ${exp.company.en}`,
        ar: `الخبرة: ${exp.company.ar}`,
      },
      corpus,
      tags: new Set((exp.matchingTags ?? []).map((t) => t.toLowerCase())),
    });
  }

  for (const proj of data.projects) {
    const corpus = normalizeText(
      [
        proj.title.en,
        proj.title.ar,
        proj.shortDescription.en,
        proj.shortDescription.ar,
        proj.overview.en,
        proj.overview.ar,
        proj.category,
        ...(proj.categoryIds ?? []),
        proj.categoryLabel.en,
        proj.categoryLabel.ar,
        ...proj.technologies,
        ...proj.deliverables.flatMap((d) => [d.en, d.ar]),
        ...(proj.contributions ?? []).flatMap((c) => [
          c.title.en,
          c.title.ar,
          c.description.en,
          c.description.ar,
        ]),
      ].join(' ')
    );
    records.push({
      kind: 'project',
      label: {
        en: `Project: ${proj.title.en}`,
        ar: `مشروع: ${proj.title.ar}`,
      },
      corpus,
      tags: new Set((proj.matchingTags ?? []).map((t) => t.toLowerCase())),
    });
  }

  for (const group of data.skills.filter((g) => g.isVisible !== false)) {
    const corpus = normalizeText(
      [
        group.title.en,
        group.title.ar,
        group.description.en,
        group.description.ar,
        ...group.skills.flatMap((s) => [s.en, s.ar]),
      ].join(' ')
    );
    records.push({
      kind: 'skill',
      label: {
        en: `Skills: ${group.title.en}`,
        ar: `المهارات: ${group.title.ar}`,
      },
      corpus,
      tags: new Set((group.matchingTags ?? []).map((t) => t.toLowerCase())),
    });
  }

  for (const edu of data.education) {
    const corpus = normalizeText(
      [
        edu.degree.en,
        edu.degree.ar,
        edu.institution.en,
        edu.institution.ar,
        ...edu.coursework.flatMap((c) => [c.en, c.ar]),
      ].join(' ')
    );
    records.push({
      kind: 'education',
      label: {
        en: `Education: ${edu.degree.en}`,
        ar: `التعليم: ${edu.degree.ar}`,
      },
      corpus,
      tags: new Set<string>(),
    });
  }

  for (const cert of data.certifications) {
    const corpus = normalizeText(
      [
        cert.title.en,
        cert.title.ar,
        cert.category.en,
        cert.category.ar,
        cert.description?.en ?? '',
        cert.description?.ar ?? '',
      ].join(' ')
    );
    records.push({
      kind: 'certification',
      label: {
        en: `Course: ${cert.title.en}`,
        ar: `دورة: ${cert.title.ar}`,
      },
      corpus,
      tags: new Set((cert.matchingTags ?? []).map((t) => t.toLowerCase())),
    });
  }

  return records;
}

function evaluateCompetency(
  requirement: SkillRequirement,
  importance: 'required' | 'preferred',
  evidenceIndex: IndexedRecord[]
): SkillEvaluation {
  const directSources: LocalizedText[] = [];
  const partialSources: LocalizedText[] = [];
  let hasNonEducationDirect = false;

  for (const rec of evidenceIndex) {
    const hit = matchesRequirement(rec.corpus, rec.tags, requirement);
    if (hit === 'direct') {
      directSources.push(rec.label);
      if (rec.kind !== 'education') {
        hasNonEducationDirect = true;
      }
    } else if (hit === 'partial') {
      partialSources.push(rec.label);
    }
  }

  if (directSources.length > 0 && (hasNonEducationDirect || requirement.id === 'mechatronics-degree')) {
    return {
      id: requirement.id,
      label: requirement.label,
      importance,
      status: 'matched',
      evidenceSources: directSources.slice(0, 3),
      explanation: {
        en: `Verified directly across ${directSources.length} portfolio record${directSources.length > 1 ? 's' : ''}.`,
        ar: `موثّق بشكل مباشر في ${directSources.length} من سجلات الملف الهندسي.`,
      },
    };
  }

  if (directSources.length > 0 || partialSources.length > 0) {
    const combined = [...directSources, ...partialSources].slice(0, 2);
    return {
      id: requirement.id,
      label: requirement.label,
      importance,
      status: 'partial',
      evidenceSources: combined,
      explanation: {
        en:
          directSources.length > 0
            ? 'Supported through academic coursework; no dedicated industrial project logged yet.'
            : 'Adjacent or related capability verified, though this specific tool/domain is not explicitly listed.',
        ar:
          directSources.length > 0
            ? 'مدعوم ضمن المقررات الأكاديمية دون مشروع صناعي مستقل موثّق حتى الآن.'
            : 'توجد خبرة مجاورة ذات صلة، لكن هذه الأداة أو المهارة غير مدرجة صراحةً في السجلات.',
      },
    };
  }

  return {
    id: requirement.id,
    label: requirement.label,
    importance,
    status: 'missing',
    evidenceSources: [],
    explanation: {
      en: 'Not currently verified in published portfolio records.',
      ar: 'غير موثّق حالياً في سجلات الملف الهندسي المنشورة.',
    },
  };
}

// ============================================================================
// 6. Deduplicated Per-Item Ranking & Explainable Reasons
// ============================================================================

function evaluateItemAgainstProfile(params: {
  corpus: string;
  tags: string[];
  requiredSkills: SkillRequirement[];
  preferredSkills: SkillRequirement[];
  filterTags: string[];
  categoryMatch: boolean;
  isGeneral: boolean;
  cvPriority: number;
  featuredBonus?: number;
}): {
  score: number;
  directHits: number;
  matchedKeywords: string[];
  matchReasons: LocalizedText[];
} {
  const {
    corpus,
    tags,
    requiredSkills,
    preferredSkills,
    filterTags,
    categoryMatch,
    isGeneral,
    cvPriority,
    featuredBonus = 0,
  } = params;

  const normCorpus = normalizeText(corpus);
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  const matchedReqLabels: LocalizedText[] = [];
  const matchedPrefLabels: LocalizedText[] = [];
  const partialLabels: LocalizedText[] = [];
  const matchedConceptIds = new Set<string>();

  let score = 0;
  let directHits = 0;

  // Deduplicated concept scoring: each requirement ID is scored at most ONCE per item
  for (const reqSkill of requiredSkills) {
    if (matchedConceptIds.has(reqSkill.id)) continue;
    const hit = matchesRequirement(normCorpus, tagSet, reqSkill);
    if (hit === 'direct') {
      matchedConceptIds.add(reqSkill.id);
      score += isGeneral ? 5 : 10;
      directHits += 1;
      matchedReqLabels.push(reqSkill.label);
    } else if (hit === 'partial') {
      matchedConceptIds.add(reqSkill.id);
      score += isGeneral ? 2 : 3;
      partialLabels.push(reqSkill.label);
    }
  }

  for (const prefSkill of preferredSkills) {
    if (matchedConceptIds.has(prefSkill.id)) continue;
    const hit = matchesRequirement(normCorpus, tagSet, prefSkill);
    if (hit === 'direct') {
      matchedConceptIds.add(prefSkill.id);
      score += isGeneral ? 3 : 5;
      directHits += 1;
      matchedPrefLabels.push(prefSkill.label);
    } else if (hit === 'partial') {
      matchedConceptIds.add(prefSkill.id);
      score += 1;
    }
  }

  // Optional HR skill filter chips (deduplicated)
  let filterHits = 0;
  for (const ft of filterTags) {
    if (tagSet.has(ft) || matchesAlias(normCorpus, ft.replace(/-/g, ' '))) {
      filterHits += 1;
    }
  }
  if (filterHits > 0) {
    score += Math.min(filterHits * 6, 18);
    directHits += 1;
  }

  if (categoryMatch && !isGeneral) {
    score += 7;
    directHits += 1;
  }

  const reasons: LocalizedText[] = [];
  if (matchedReqLabels.length > 0) {
    reasons.push({
      en: `Matches required skills: ${matchedReqLabels.slice(0, 3).map((l) => l.en).join(', ')}`,
      ar: `يطابق مهارات أساسية: ${matchedReqLabels.slice(0, 3).map((l) => l.ar).join('، ')}`,
    });
  }
  if (matchedPrefLabels.length > 0) {
    reasons.push({
      en: `Covers preferred skills: ${matchedPrefLabels.slice(0, 3).map((l) => l.en).join(', ')}`,
      ar: `يغطي مهارات مفضّلة: ${matchedPrefLabels.slice(0, 3).map((l) => l.ar).join('، ')}`,
    });
  }
  if (categoryMatch && !isGeneral) {
    reasons.push({
      en: 'Aligned with target engineering discipline category.',
      ar: 'متوافق مع التخصص الهندسي المستهدف.',
    });
  }
  if (reasons.length === 0 && partialLabels.length > 0) {
    reasons.push({
      en: `Adjacent background related to ${partialLabels.slice(0, 2).map((l) => l.en).join(', ')}.`,
      ar: `خلفية مساندة ذات صلة بـ ${partialLabels.slice(0, 2).map((l) => l.ar).join('، ')}.`,
    });
  }

  const matchedKeywords = [
    ...matchedReqLabels.map((l) => l.en),
    ...matchedPrefLabels.map((l) => l.en),
  ].slice(0, 6);

  // Deterministic tie-breaker from verified cvPriority + featuredBonus
  const finalScore = score + Math.round(cvPriority / 25) + featuredBonus;

  return {
    score: finalScore,
    directHits,
    matchedKeywords,
    matchReasons: reasons,
  };
}

function classifyTier(
  score: number,
  directHits: number,
  isGeneral: boolean,
  cvPriority: number
): MatchTier {
  if (isGeneral) {
    if (cvPriority >= 85 || score >= 18) return 'strong';
    if (cvPriority >= 70 || score >= 10) return 'relevant';
    return 'supporting';
  }
  if (!directHits) return 'supporting';
  if (score >= 18 || directHits >= 2) return 'strong';
  if (score >= 12) return 'relevant';
  return 'supporting';
}

// ============================================================================
// 7. Main Public Entry: buildTailoredProfile
// ============================================================================

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
  const basePosition = getEffectivePosition(input.positionId, input.profileOverrides);
  const customTitle = (input.customTitle ?? '').trim();
  const customDescription = (input.customDescription ?? '').trim();
  const isCustomRole = basePosition.id === 'custom';
  const isGeneral = basePosition.id === 'general-engineering';
  const selectedSkillIds = input.selectedSkillIds ?? [];
  const preferredCvLanguage: Language = input.preferredCvLanguage === 'ar' ? 'ar' : 'en';

  // Resolve active required/preferred skills & preferred categories
  const customExtracted = isCustomRole
    ? extractCustomRequirements(customTitle, customDescription)
    : null;

  const activeRequiredSkills = isCustomRole
    ? (customExtracted?.required ?? [])
    : basePosition.requiredSkills;

  const activePreferredSkills = isCustomRole
    ? (customExtracted?.preferred ?? [])
    : basePosition.preferredSkills;

  const activePreferredCategories = isCustomRole
    ? (customExtracted?.preferredCategories ?? [])
    : basePosition.preferredCategories;

  const position: RecruiterPositionOption = {
    ...basePosition,
    requiredSkills: activeRequiredSkills,
    preferredSkills: activePreferredSkills,
    preferredCategories: activePreferredCategories,
  };

  const filterTags = RECRUITER_SKILL_FILTERS.filter((f) => selectedSkillIds.includes(f.id)).flatMap(
    (f) => f.tags
  );

  const displayPositionTitle: LocalizedText =
    isCustomRole && customTitle
      ? { en: customTitle, ar: customTitle }
      : position.label;

  // Build traceable evidence index across all verified records
  const evidenceIndex = buildEvidenceIndex(data);

  // Evaluate all Required & Preferred competencies
  const skillEvaluations: SkillEvaluation[] = [
    ...activeRequiredSkills.map((r) => evaluateCompetency(r, 'required', evidenceIndex)),
    ...activePreferredSkills.map((p) => evaluateCompetency(p, 'preferred', evidenceIndex)),
  ];

  const matchedSkills = skillEvaluations.filter((s) => s.status === 'matched');
  const partialSkills = skillEvaluations.filter((s) => s.status === 'partial');
  const missingSkills = skillEvaluations.filter((s) => s.status === 'missing');

  let anyDirectHit = isGeneral || matchedSkills.length > 0;

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

      const res = evaluateItemAgainstProfile({
        corpus,
        tags: exp.matchingTags ?? [],
        requiredSkills: activeRequiredSkills,
        preferredSkills: activePreferredSkills,
        filterTags,
        categoryMatch: false,
        isGeneral,
        cvPriority: exp.cvPriority ?? 50,
        featuredBonus: exp.kind === 'employment' ? 3 : 0,
      });

      if (res.directHits > 0) anyDirectHit = true;

      return {
        item: exp,
        tier: classifyTier(res.score, res.directHits, isGeneral, exp.cvPriority ?? 50),
        score: res.score,
        matchedKeywords: res.matchedKeywords,
        matchReasons: res.matchReasons,
      };
    })
    .sort((a, b) => b.score - a.score || a.item.displayOrder - b.item.displayOrder);

  // 2. Rank Projects (includes multi-categories & verified contributions!)
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
        ...(project.categoryIds ?? []),
        project.categoryLabel.en,
        project.categoryLabel.ar,
        ...project.technologies,
        ...project.deliverables.flatMap((d) => [d.en, d.ar]),
        ...(project.contributions ?? []).flatMap((c) => [
          c.title.en,
          c.title.ar,
          c.description.en,
          c.description.ar,
        ]),
      ].join(' ');

      const projectCategories = [project.category, ...(project.categoryIds ?? [])];
      const categoryMatch = projectCategories.some((c) =>
        activePreferredCategories.includes(c as SpecializationId)
      );

      const res = evaluateItemAgainstProfile({
        corpus,
        tags: project.matchingTags ?? [],
        requiredSkills: activeRequiredSkills,
        preferredSkills: activePreferredSkills,
        filterTags,
        categoryMatch,
        isGeneral,
        cvPriority: project.cvPriority ?? 50,
        featuredBonus: project.featured ? 2 : 0,
      });

      if (res.directHits > 0) anyDirectHit = true;

      return {
        item: project,
        tier: classifyTier(res.score, res.directHits, isGeneral, project.cvPriority ?? 50),
        score: res.score,
        matchedKeywords: res.matchedKeywords,
        matchReasons: res.matchReasons,
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

      const res = evaluateItemAgainstProfile({
        corpus,
        tags: group.matchingTags ?? [],
        requiredSkills: activeRequiredSkills,
        preferredSkills: activePreferredSkills,
        filterTags,
        categoryMatch: false,
        isGeneral,
        cvPriority: group.cvPriority ?? 50,
      });

      if (res.directHits > 0) anyDirectHit = true;

      return {
        item: group,
        tier: classifyTier(res.score, res.directHits, isGeneral, group.cvPriority ?? 50),
        score: res.score,
        matchedKeywords: res.matchedKeywords,
        matchReasons: res.matchReasons,
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

      const res = evaluateItemAgainstProfile({
        corpus,
        tags: cert.matchingTags ?? [],
        requiredSkills: activeRequiredSkills,
        preferredSkills: activePreferredSkills,
        filterTags,
        categoryMatch: false,
        isGeneral,
        cvPriority: 60,
      });

      if (res.directHits > 0) anyDirectHit = true;

      return {
        item: cert,
        tier: classifyTier(res.score, res.directHits, isGeneral, 60),
        score: res.score,
        matchedKeywords: res.matchedKeywords,
        matchReasons: res.matchReasons,
      };
    })
    .sort((a, b) => b.score - a.score || a.item.displayOrder - b.item.displayOrder);

  // 5. Compute Weighted Deterministic Compatibility Assessment
  const reqEvals = skillEvaluations.filter((s) => s.importance === 'required');
  const prefEvals = skillEvaluations.filter((s) => s.importance === 'preferred');

  const reqScore =
    reqEvals.length > 0
      ? Math.round(
          (reqEvals.reduce(
            (sum, e) => sum + (e.status === 'matched' ? 1 : e.status === 'partial' ? 0.45 : 0),
            0
          ) /
            reqEvals.length) *
            100
        )
      : isGeneral
        ? 85
        : 0;

  const prefScore =
    prefEvals.length > 0
      ? Math.round(
          (prefEvals.reduce(
            (sum, e) => sum + (e.status === 'matched' ? 1 : e.status === 'partial' ? 0.45 : 0),
            0
          ) /
            prefEvals.length) *
            100
        )
      : reqScore;

  const strongExpCount = rankedExperience.filter((e) => e.tier === 'strong').length;
  const relExpCount = rankedExperience.filter((e) => e.tier === 'relevant').length;
  const expScore = Math.min(100, strongExpCount * 65 + relExpCount * 30);

  const strongProjCount = rankedProjects.filter((p) => p.tier === 'strong').length;
  const relProjCount = rankedProjects.filter((p) => p.tier === 'relevant').length;
  const projScore = Math.min(100, strongProjCount * 45 + relProjCount * 22);

  const strongSkillGrpCount = rankedSkills.filter((s) => s.tier === 'strong').length;
  const relSkillGrpCount = rankedSkills.filter((s) => s.tier === 'relevant').length;
  const toolsScore = Math.min(100, strongSkillGrpCount * 45 + relSkillGrpCount * 25);

  const relevantCertsCount = rankedCertifications.filter(
    (c) => c.tier === 'strong' || c.tier === 'relevant'
  ).length;
  const eduCertScore = Math.min(
    100,
    (data.education.length > 0 ? 55 : 0) + relevantCertsCount * 25
  );

  const w = position.weights;
  const weightSum =
    w.requiredSkills +
    w.preferredSkills +
    w.experience +
    w.projects +
    w.toolsAndTech +
    w.educationAndCerts || 100;

  const breakdown: CompatibilityDimension[] = [
    {
      key: 'requiredSkills',
      label: { en: 'Required Skills', ar: 'المهارات الأساسية المطلوبة' },
      score: reqScore,
      weight: w.requiredSkills,
      weightedContribution: Math.round((reqScore * w.requiredSkills) / weightSum),
      evidenceSummary: {
        en: `${reqEvals.filter((e) => e.status === 'matched').length}/${reqEvals.length} required verified`,
        ar: `تطابق ${reqEvals.filter((e) => e.status === 'matched').length} من ${reqEvals.length} مهارات أساسية`,
      },
    },
    {
      key: 'preferredSkills',
      label: { en: 'Preferred Skills', ar: 'المهارات المفضّلة' },
      score: prefScore,
      weight: w.preferredSkills,
      weightedContribution: Math.round((prefScore * w.preferredSkills) / weightSum),
      evidenceSummary: {
        en: `${prefEvals.filter((e) => e.status === 'matched').length}/${prefEvals.length} preferred verified`,
        ar: `تطابق ${prefEvals.filter((e) => e.status === 'matched').length} من ${prefEvals.length} مهارات مفضّلة`,
      },
    },
    {
      key: 'experience',
      label: { en: 'Work Experience', ar: 'الخبرة العملية والتدريب' },
      score: expScore,
      weight: w.experience,
      weightedContribution: Math.round((expScore * w.experience) / weightSum),
      evidenceSummary: {
        en: `${strongExpCount} strong · ${relExpCount} relevant records`,
        ar: `${strongExpCount} تطابق قوي · ${relExpCount} ذو صلة`,
      },
    },
    {
      key: 'projects',
      label: { en: 'Relevant Projects', ar: 'المشاريع الهندسية ذات الصلة' },
      score: projScore,
      weight: w.projects,
      weightedContribution: Math.round((projScore * w.projects) / weightSum),
      evidenceSummary: {
        en: `${strongProjCount} strong · ${relProjCount} relevant projects`,
        ar: `${strongProjCount} مشاريع قوية · ${relProjCount} ذات صلة`,
      },
    },
    {
      key: 'toolsAndTech',
      label: { en: 'Engineering Tools', ar: 'الأدوات والتقنيات الهندسية' },
      score: toolsScore,
      weight: w.toolsAndTech,
      weightedContribution: Math.round((toolsScore * w.toolsAndTech) / weightSum),
      evidenceSummary: {
        en: `${strongSkillGrpCount + relSkillGrpCount} aligned skill groups`,
        ar: `${strongSkillGrpCount + relSkillGrpCount} مجموعات مهارات متوافقة`,
      },
    },
    {
      key: 'educationAndCerts',
      label: { en: 'Education & Courses', ar: 'التعليم والدورات التقنية' },
      score: eduCertScore,
      weight: w.educationAndCerts,
      weightedContribution: Math.round((eduCertScore * w.educationAndCerts) / weightSum),
      evidenceSummary: {
        en: `${data.education.length} degree · ${relevantCertsCount} aligned courses`,
        ar: `${data.education.length} مؤهل أكاديمي · ${relevantCertsCount} دورات متوافقة`,
      },
    },
  ];

  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        breakdown.reduce((acc, dim) => acc + (dim.score * dim.weight) / weightSum, 0)
      )
    )
  );

  const level: CompatibilityAssessment['level'] =
    overallScore >= 72 ? 'high' : overallScore >= 45 ? 'moderate' : 'exploratory';

  const compatibility: CompatibilityAssessment = {
    overallScore,
    level,
    summary: {
      en:
        level === 'high'
          ? `Strong verified alignment (${overallScore}/100) across ${matchedSkills.length} required/preferred skills, ${strongExpCount + relExpCount} experience records, and ${strongProjCount + relProjCount} projects.`
          : level === 'moderate'
            ? `Moderate verified alignment (${overallScore}/100): ${matchedSkills.length} matching skills verified, with ${missingSkills.length} unverified requirement(s) noted transparently below.`
            : `Exploratory alignment (${overallScore}/100): limited direct overlap in current verified records. Review matched and missing requirements below.`,
      ar:
        level === 'high'
          ? `توافق موثّق قوي (${overallScore}/100) عبر ${matchedSkills.length} مهارة متطابقة، و${strongExpCount + relExpCount} سجلات خبرة، و${strongProjCount + relProjCount} مشاريع ذات صلة.`
          : level === 'moderate'
            ? `توافق موثّق متوسط (${overallScore}/100): تم التحقق من ${matchedSkills.length} مهارة متطابقة مع توضيح ${missingSkills.length} متطلبات غير موثّقة أدناه بشفافية.`
            : `توافق استكشافي (${overallScore}/100): التداخل المباشر محدود في السجلات الحالية الموثّقة. راجع المهارات المتطابقة والمفقودة أدناه.`,
    },
    breakdown,
    matchedSkills,
    partialSkills,
    missingSkills,
  };

  const matchedFocusAreas: LocalizedText[] = rankedSkills
    .filter((s) => s.tier === 'strong' || s.tier === 'relevant')
    .slice(0, 3)
    .map((s) => s.item.title);

  return {
    position,
    displayPositionTitle,
    isCustomRole,
    customTitle,
    customDescription,
    selectedSkillIds,
    preferredCvLanguage,
    hasDirectMatches: anyDirectHit,
    matchedFocusAreas,
    compatibility,
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
  const cleanName =
    params.fullNameEn
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
