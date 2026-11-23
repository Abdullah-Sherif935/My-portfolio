import type { Project } from '@/types/portfolio';

/**
 * Initial engineering projects seeded from the existing CV.
 * Preserves verified titles and technical scope from the CV without fabricating
 * unverified outcomes or external company links. Designed so additional
 * post-graduation HVAC, control panel, maintenance, and industrial projects
 * can be added seamlessly via CMS / Supabase later.
 */
export const PROJECTS: Project[] = [
  {
    id: 'proj-flex-bot',
    slug: 'flex-bot-autonomous-hospital-mobile-manipulator',
    code: 'PRJ-GRAD-01',
    kind: 'graduation',
    kindLabel: {
      en: 'Graduation Project (2026)',
      ar: 'مشروع التخرج (2026)',
    },
    title: {
      en: 'Flex Bot — Autonomous Hospital Mobile Manipulator',
      ar: 'Flex Bot — روبوت متنقل ذاتي الحركة بذراع آلية للمستشفيات',
    },
    shortDescription: {
      en: 'Autonomous Mobile Robot with a 6-DOF Robotic Arm built on ROS 2, designed to navigate hospital environments, operate elevators and doors, and handle secure medical supply delivery.',
      ar: 'روبوت متنقل ذاتي الحركة مزوّد بذراع آلية سداسية المحاور (6-DOF) مبني على ROS 2، مصمم للتنقل داخل المستشفيات وتشغيل المصاعد والأبواب وتوصيل الإمدادات الطبية بأمان.',
    },
    overview: {
      en: 'Graduation project for the Bachelor of Engineering in Mechatronics Engineering at Ain Shams University (2026). Integrates autonomous mobile navigation, low-level embedded motor control, computer vision for elevator buttons and door handles, and vision-guided 6-DOF manipulation on ROS 2.',
      ar: 'مشروع التخرج لدرجة بكالوريوس هندسة الميكاترونكس بجامعة عين شمس (2026). يجمع بين الملاحة الذاتية للقاعدة المتنقلة، التحكم المدمج منخفض المستوى بالمحركات، الرؤية الحاسوبية للتعرف على أزرار المصاعد ومقابض الأبواب، والتحكم بالذراع الآلية 6-DOF الموجهة بالرؤية عبر ROS 2.',
    },
    category: 'robotics-mechatronics',
    categoryLabel: {
      en: 'Robotics & Mechatronics',
      ar: 'الروبوتات والميكاترونكس',
    },
    coverVariant: 'robotics',
    technologies: [
      'ROS 2',
      'MoveIt 2',
      'TF / TF2',
      'ESP32-S3',
      'YOLOv8',
      'Roboflow',
      '6-DOF Manipulator',
    ],
    deliverables: [
      {
        en: 'Full mechanical and electrical design of the mobile base and 6-DOF manipulator.',
        ar: 'التصميم الميكانيكي والكهربائي الكامل للقاعدة المتنقلة والذراع الآلية 6-DOF.',
      },
      {
        en: 'Low-level motor control of the mobile base using ESP32-S3 with encoder-based odometry.',
        ar: 'التحكم منخفض المستوى بمحركات القاعدة المتنقلة باستخدام ESP32-S3 وقياس المسافة بالإنكودر (Odometry).',
      },
      {
        en: 'Machine vision model training and deployment using YOLOv8 and Roboflow for elevator-button and door-handle detection.',
        ar: 'تدريب ونشر نموذج رؤية حاسوبية باستخدام YOLOv8 و Roboflow للتعرف على أزرار المصاعد ومقابض الأبواب.',
      },
      {
        en: 'Forward and inverse kinematics configuration for the 6-DOF arm using MoveIt 2, with arm-to-camera coordinate frame linking via TF/TF2 for vision-guided manipulation.',
        ar: 'إعداد الكينماتيكا الأمامية والعكسية للذراع 6-DOF عبر MoveIt 2، وربط الإطار الإحداثي للذراع بإطار الكاميرا عبر TF/TF2 للمناولة الموجهة بالرؤية.',
      },
    ],
    statusLabel: {
      en: 'Initial CV Record (Editable)',
      ar: 'سجل أولي من السيرة الذاتية (قابل للتعديل)',
    },
    featured: true,
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 1,
  },
  {
    id: 'proj-6dof-inspection',
    slug: '6-dof-inspection-robot-arm',
    code: 'PRJ-ROB-02',
    kind: 'engineering',
    kindLabel: {
      en: 'Engineering Project',
      ar: 'مشروع هندسي',
    },
    title: {
      en: '6-DOF Inspection Robot Arm',
      ar: 'ذراع روبوتية سداسية المحاور للفحص الصناعي (6-DOF Inspection Robot Arm)',
    },
    shortDescription: {
      en: 'Designed a 6-DOF robotic arm to increase inspection accuracy for industrial parts such as automotive chassis.',
      ar: 'تصميم ذراع روبوتية سداسية المحاور (6-DOF) لرفع دقة الفحص للأجزاء الصناعية مثل شاسيهات السيارات.',
    },
    overview: {
      en: 'Engineering design of a 6-DOF robotic arm focused on improving inspection accuracy for industrial components such as automotive chassis. Detailed drawings, renderings, and technical specifications can be appended by the owner through future CMS updates.',
      ar: 'تصميم هندسي لذراع روبوتية سداسية المحاور (6-DOF) يهدف إلى رفع دقة فحص الأجزاء الصناعية مثل شاسيهات السيارات. يمكن إضافة الرسومات التفصيلية والصور والمواصفات الفنية لاحقاً عبر نظام إدارة المحتوى.',
    },
    category: 'robotics-mechatronics',
    categoryLabel: {
      en: 'Robotics & Mechatronics',
      ar: 'الروبوتات والميكاترونكس',
    },
    coverVariant: 'robotics',
    technologies: ['6-DOF Robotic Arm', 'Mechanical Design', 'Industrial Inspection', 'CAD'],
    deliverables: [
      {
        en: '6-DOF robotic arm design tailored for industrial part inspection (e.g., automotive chassis).',
        ar: 'تصميم ذراع روبوتية 6-DOF مخصصة لفحص الأجزاء الصناعية مثل شاسيهات السيارات.',
      },
    ],
    statusLabel: {
      en: 'Initial CV Record (Editable)',
      ar: 'سجل أولي من السيرة الذاتية (قابل للتعديل)',
    },
    featured: true,
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 2,
  },
  {
    id: 'proj-water-turbine',
    slug: 'water-turbine',
    code: 'PRJ-MEC-03',
    kind: 'engineering',
    kindLabel: {
      en: 'Engineering Project',
      ar: 'مشروع هندسي',
    },
    title: {
      en: 'Water Turbine',
      ar: 'تصميم توربينة مياه (Water Turbine)',
    },
    shortDescription: {
      en: 'Designed a water turbine system aimed at generating clean, renewable energy.',
      ar: 'تصميم منظومة توربينة مياه تهدف إلى توليد طاقة نظيفة ومتجددة.',
    },
    overview: {
      en: 'Mechanical engineering project centered on designing a water turbine system for clean, renewable energy generation. Additional CAD visuals, calculations, and test documentation can be attached as records expand.',
      ar: 'مشروع تصميم ميكانيكي يركز على تصميم منظومة توربينة مياه لتوليد طاقة نظيفة ومتجددة. يمكن إرفاق صور CAD والحسابات الهندسية لاحقاً عند التوسع في المحتوى.',
    },
    category: 'mechanical-design',
    categoryLabel: {
      en: 'Mechanical Design',
      ar: 'التصميم الميكانيكي',
    },
    coverVariant: 'mechanical',
    technologies: ['Mechanical Design', 'Fluid Mechanics', 'Renewable Energy', 'CAD'],
    deliverables: [
      {
        en: 'Water turbine system design for clean, renewable energy generation.',
        ar: 'تصميم منظومة توربينة مياه لتوليد الطاقة النظيفة والمتجددة.',
      },
    ],
    statusLabel: {
      en: 'Initial CV Record (Editable)',
      ar: 'سجل أولي من السيرة الذاتية (قابل للتعديل)',
    },
    featured: true,
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 3,
  },
  {
    id: 'proj-rc-car',
    slug: 'line-following-obstacle-avoiding-rc-car',
    code: 'PRJ-MCT-04',
    kind: 'engineering',
    kindLabel: {
      en: 'Engineering Project',
      ar: 'مشروع هندسي',
    },
    title: {
      en: 'Line-Following & Obstacle-Avoiding RC Car',
      ar: 'سيارة RC لتتبع المسار وتجنب العوائق (Line-Following & Obstacle-Avoiding RC Car)',
    },
    shortDescription: {
      en: 'Built an RC car capable of autonomous line tracking and obstacle avoidance.',
      ar: 'بناء سيارة تحكم قادرة على تتبع المسار ذاتياً وتجنب العوائق.',
    },
    overview: {
      en: 'Hands-on mechatronics project implementing autonomous line tracking and obstacle avoidance in an RC car platform. Media, schematics, and firmware details can be added later without modifying frontend code.',
      ar: 'مشروع ميكاترونكس عملي لتنفيذ تتبع المسار الذاتي وتجنب العوائق في سيارة RC. يمكن إضافة الصور والمخططات وتفاصيل البرمجة لاحقاً دون تعديل الواجهة الأمامية.',
    },
    category: 'robotics-mechatronics',
    categoryLabel: {
      en: 'Robotics & Mechatronics',
      ar: 'الروبوتات والميكاترونكس',
    },
    coverVariant: 'robotics',
    technologies: ['Embedded Systems', 'Autonomous Line Tracking', 'Obstacle Avoidance', 'Mechatronics'],
    deliverables: [
      {
        en: 'Autonomous line-tracking and obstacle-avoidance RC car build.',
        ar: 'بناء وتنفيذ سيارة RC قادرة على تتبع المسار وتجنب العوائق ذاتياً.',
      },
    ],
    statusLabel: {
      en: 'Initial CV Record (Editable)',
      ar: 'سجل أولي من السيرة الذاتية (قابل للتعديل)',
    },
    featured: true,
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 4,
  },
  {
    id: 'proj-dc-motor-estimation',
    slug: 'dc-motor-parameter-estimation',
    code: 'PRJ-CTL-05',
    kind: 'engineering',
    kindLabel: {
      en: 'Engineering Project',
      ar: 'مشروع هندسي',
    },
    title: {
      en: 'DC Motor Parameter Estimation',
      ar: 'تقدير معاملات محرك التيار المستمر (DC Motor Parameter Estimation)',
    },
    shortDescription: {
      en: 'Estimated key electrical and mechanical parameters of a DC motor for use in control system modeling.',
      ar: 'تقدير المعاملات الكهربائية والميكانيكية الرئيسية لمحرك تيار مستمر لاستخدامها في نمذجة أنظمة التحكم.',
    },
    overview: {
      en: 'Control engineering project estimating key electrical and mechanical parameters of a DC motor to support accurate control system modeling. Prepared to hold full mathematical models and plots in future updates.',
      ar: 'مشروع هندسة تحكم يهدف إلى تقدير المعاملات الكهربائية والميكانيكية الأساسية لمحرك تيار مستمر لاستخدامها في نمذجة أنظمة التحكم بدقة.',
    },
    category: 'plc-automation',
    categoryLabel: {
      en: 'Control & Automation',
      ar: 'التحكم والأتمتة',
    },
    coverVariant: 'plc',
    technologies: ['Control Systems', 'DC Motor Modeling', 'Parameter Estimation', 'MATLAB / Simulink'],
    deliverables: [
      {
        en: 'Electrical and mechanical DC motor parameter estimation for control system modeling.',
        ar: 'تقدير المعاملات الكهربائية والميكانيكية لمحرك DC لنمذجة أنظمة التحكم.',
      },
    ],
    statusLabel: {
      en: 'Initial CV Record (Editable)',
      ar: 'سجل أولي من السيرة الذاتية (قابل للتعديل)',
    },
    featured: false,
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 5,
  },
];
