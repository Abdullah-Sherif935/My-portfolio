import type { Specialization } from '@/types/portfolio';

export const SPECIALIZATIONS: Specialization[] = [
  {
    id: 'hvac-refrigeration',
    code: 'DISC-01',
    icon: 'wind',
    title: {
      en: 'HVAC & Refrigeration',
      ar: 'التكييف والتبريد',
    },
    description: {
      en: 'Thermal load evaluation, chilled water and DX systems, refrigeration circuits, airflow distribution, and equipment commissioning.',
      ar: 'تقييم الأحمال الحرارية، أنظمة المياه المثلجة و DX، دوائر التبريد، توزيع الهواء، وتشغيل واختبار المعدات.',
    },
    highlights: [
      { en: 'Chillers & Air Handling Units', ar: 'التشيلرات ووحدات مناولة الهواء' },
      { en: 'Refrigeration Diagnostics', ar: 'تشخيص دوائر التبريد' },
      { en: 'Ducting & Hydronic Piping', ar: 'مجاري الهواء وشبكات المواسير' },
    ],
    filterCategory: 'hvac-refrigeration',
  },
  {
    id: 'plc-automation',
    code: 'DISC-02',
    icon: 'cpu',
    title: {
      en: 'PLC & Industrial Automation',
      ar: 'الأتمتة الصناعية و PLC',
    },
    description: {
      en: 'Structured PLC logic, HMI interfaces, VFD motor control, field instrumentation, and electrical control panel integration.',
      ar: 'برمجة منطق PLC، واجهات HMI، التحكم بالمحركات عبر VFD، أجهزة القياس الميدانية، وتكامل لوحات التحكم الكهربائية.',
    },
    highlights: [
      { en: 'Ladder Logic & Structured Control', ar: 'برمجة السلم والمنطق الصناعي' },
      { en: 'Electrical Control Panels', ar: 'لوحات التحكم الكهربائية' },
      { en: 'Sensors, Actuators & VFDs', ar: 'الحساسات والمشغلات ومغيرات السرعة' },
    ],
    filterCategory: 'plc-automation',
  },
  {
    id: 'industrial-maintenance',
    code: 'DISC-03',
    icon: 'wrench',
    title: {
      en: 'Maintenance & Troubleshooting',
      ar: 'الصيانة وتشخيص الأعطال',
    },
    description: {
      en: 'Preventive maintenance planning, electro-mechanical root cause fault finding, industrial equipment reliability, and safety compliance.',
      ar: 'تخطيط الصيانة الوقائية، تشخيص الأعطال الكهروميكانيكية من الجذور، موثوقية المعدات الصناعية، والالتزام بالسلامة.',
    },
    highlights: [
      { en: 'Preventive & Corrective Plans', ar: 'خطط الصيانة الوقائية والعلاجية' },
      { en: 'Electro-Mechanical Fault Finding', ar: 'تشخيص الأعطال الكهروميكانيكية' },
      { en: 'Equipment Documentation', ar: 'توثيق المعدات وجداول الفحص' },
    ],
    filterCategory: 'industrial-maintenance',
  },
  {
    id: 'mechanical-design',
    code: 'DISC-04',
    icon: 'cog',
    title: {
      en: 'Mechanical Design',
      ar: 'التصميم الميكانيكي',
    },
    description: {
      en: '3D CAD parametric assemblies, mechanism design, tolerance stack-ups, BOM preparation, and workshop production drawings.',
      ar: 'النماذج ثلاثية الأبعاد CAD، تصميم الآليات الميكانيكية، التفاوتات الهندسية، قوائم الخامات BOM، والرسومات التنفيذية.',
    },
    highlights: [
      { en: '3D CAD Assemblies', ar: 'التجميعات ثلاثية الأبعاد CAD' },
      { en: 'Fabrication Drawings & BOMs', ar: 'رسومات التصنيع وقوائم الخامات' },
      { en: 'Design for Assembly', ar: 'التصميم لسهولة التجميع والصيانة' },
    ],
    filterCategory: 'mechanical-design',
  },
  {
    id: 'sheet-metal-design',
    code: 'DISC-05',
    icon: 'layers',
    title: {
      en: 'Sheet Metal Design',
      ar: 'تصميم وتشكيل الصاج',
    },
    description: {
      en: 'Industrial enclosures, electrical panel cabinets, flat-pattern DXF generation, bend allowances, and laser-cut nesting readiness.',
      ar: 'تصميم الحاويات الصناعية ولوحات التحكم المعدنية، إفراد الصاج بصيغة DXF، حسابات الثني، والجاهزية للقطع بالليزر.',
    },
    highlights: [
      { en: 'Control Panel Enclosures', ar: 'حاويات لوحات التحكم المعدنية' },
      { en: 'Flat Patterns & Bend Tables', ar: 'الإفراد وجداول الثني' },
      { en: 'CNC Laser & Press Brake Ready', ar: 'جاهزية القطع بالليزر والثني CNC' },
    ],
    filterCategory: 'sheet-metal-design',
  },
  {
    id: 'robotics-mechatronics',
    code: 'DISC-06',
    icon: 'bot',
    title: {
      en: 'Robotics & Mechatronics',
      ar: 'الروبوتات والميكاترونكس',
    },
    description: {
      en: 'Embedded control prototyping, motion systems, actuator integration, sensor feedback loops, and electromechanical automation.',
      ar: 'النماذج الأولية للتحكم المدمج، أنظمة الحركة، دمج المشغلات، حلقات التغذية الراجعة للحساسات، والأتمتة الميكاترونية.',
    },
    highlights: [
      { en: 'Embedded Microcontrollers', ar: 'المتحكمات الدقيقة والأنظمة المدمجة' },
      { en: 'Motion & Actuator Control', ar: 'التحكم بالحركة والمشغلات' },
      { en: 'Mechatronic Prototyping', ar: 'النماذج الأولية الميكاترونية' },
    ],
    filterCategory: 'robotics-mechatronics',
  },
];
