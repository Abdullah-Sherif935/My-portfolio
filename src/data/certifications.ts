import type { Certification } from '@/types/portfolio';

/**
 * Initial courses seeded from the existing CV.
 * Issuing organizations, dates, and credential URLs are kept clearly editable
 * without fabricating unstated details.
 */
export const CERTIFICATIONS: Certification[] = [
  {
    id: 'course-solidworks-sheet-metal',
    title: {
      en: 'SolidWorks Sheet Metal Design',
      ar: 'تصميم الصاج باستخدام SolidWorks (SolidWorks Sheet Metal Design)',
    },
    issuer: {
      en: 'Issuing Organization — To Be Added',
      ar: 'الجهة المانحة — تُضاف لاحقاً',
    },
    issueDate: {
      en: 'Date — To Be Added',
      ar: 'التاريخ — يُضاف لاحقاً',
    },
    credentialId: 'CRS-CAD-01',
    credentialUrl: null,
    category: {
      en: 'CAD & Sheet Metal',
      ar: 'التصميم الهندسي والصاج',
    },
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 1,
  },
  {
    id: 'course-classic-control',
    title: {
      en: 'Classic Control',
      ar: 'التحكم الكلاسيكي (Classic Control)',
    },
    issuer: {
      en: 'Issuing Organization — To Be Added',
      ar: 'الجهة المانحة — تُضاف لاحقاً',
    },
    issueDate: {
      en: 'Date — To Be Added',
      ar: 'التاريخ — يُضاف لاحقاً',
    },
    credentialId: 'CRS-ELC-02',
    credentialUrl: null,
    category: {
      en: 'Electrical Control Panels',
      ar: 'لوحات التحكم الكهربائية',
    },
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 2,
  },
  {
    id: 'course-ai-tools',
    title: {
      en: 'AI Tools & Applications',
      ar: 'أدوات وتطبيقات الذكاء الاصطناعي (AI Tools & Applications)',
    },
    issuer: {
      en: 'Issuing Organization — To Be Added',
      ar: 'الجهة المانحة — تُضاف لاحقاً',
    },
    issueDate: {
      en: 'Date — To Be Added',
      ar: 'التاريخ — يُضاف لاحقاً',
    },
    credentialId: 'CRS-AI-03',
    credentialUrl: null,
    category: {
      en: 'Productivity & AI',
      ar: 'الإنتاجية والذكاء الاصطناعي',
    },
    dataSource: 'cv-initial',
    isEditable: true,
    displayOrder: 3,
  },
];
