export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light';

/**
 * Distinguishes records seeded from the initial CV, editable placeholders,
 * and future records managed via Supabase CMS.
 */
export type DataSource = 'cv-initial' | 'placeholder' | 'cms';

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface EditableRecord {
  id: string;
  dataSource: DataSource;
  isEditable: boolean;
  displayOrder: number;
}

export interface ProfileData {
  id: string;
  fullName: LocalizedText;
  shortName: LocalizedText;
  headline: LocalizedText;
  summary: LocalizedText;
  location: LocalizedText;
  avatarUrl?: string | null;
  avatarAlt?: LocalizedText;
  contact: {
    email: string;
    linkedinUrl: string;
    linkedinDisplay: string;
    websiteDisplay: string;
    githubUrl: string | null;
    githubDisplay: LocalizedText;
  };
  languages: Array<{
    name: LocalizedText;
    proficiency: LocalizedText;
  }>;
  coreCompetencies: LocalizedText[];
  dataSource: DataSource;
  isEditable: boolean;
}

export interface EducationItem extends EditableRecord {
  degree: LocalizedText;
  fieldOfStudy?: LocalizedText;
  institution: LocalizedText;
  period: LocalizedText;
  startYear?: string;
  graduationYear: string;
  grade: LocalizedText;
  classification?: LocalizedText;
  graduationProjectSlug?: string;
  coursework: LocalizedText[];
}

export type SpecializationId =
  | 'hvac-refrigeration'
  | 'plc-automation'
  | 'industrial-maintenance'
  | 'mechanical-design'
  | 'sheet-metal-design'
  | 'robotics-mechatronics';

export type SpecializationIcon = 'wind' | 'cpu' | 'wrench' | 'cog' | 'layers' | 'bot';

export interface Specialization {
  id: string;
  code: string;
  icon: SpecializationIcon;
  title: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  filterCategory: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export type CompanyRelationshipCategory =
  | 'employer'
  | 'client'
  | 'contractor'
  | 'training'
  | 'partner'
  | 'unconfirmed';

export interface Company extends EditableRecord {
  slug: string;
  name: LocalizedText;
  monogram: string;
  logoUrl: string | null;
  overview?: LocalizedText;
  industry: LocalizedText;
  relationshipCategory?: CompanyRelationshipCategory;
  relationshipType: LocalizedText;
  servicesProvided: LocalizedText[];
  relatedProjectSlugs: string[];
}

export type ProjectKind = 'graduation' | 'engineering' | 'industrial';

export interface ProjectGalleryImage {
  url: string;
  alt: LocalizedText;
  caption?: LocalizedText;
}

export interface ProjectSpecification {
  label: LocalizedText;
  value: LocalizedText;
}

export interface ProjectCaseStudy {
  challenge?: LocalizedText;
  solution?: LocalizedText;
  specifications?: ProjectSpecification[];
  outcomes?: LocalizedText[];
}

export interface Project extends EditableRecord {
  slug: string;
  code: string;
  kind: ProjectKind;
  kindLabel: LocalizedText;
  title: LocalizedText;
  shortDescription: LocalizedText;
  overview: LocalizedText;
  category: SpecializationId;
  categoryLabel: LocalizedText;
  coverVariant: 'hvac' | 'plc' | 'maintenance' | 'mechanical' | 'sheet-metal' | 'robotics';
  coverImageUrl?: string | null;
  coverImageAlt?: LocalizedText;
  gallery?: ProjectGalleryImage[];
  caseStudy?: ProjectCaseStudy;
  technologies: string[];
  deliverables: LocalizedText[];
  companyId?: string;
  relatedProjectSlugs?: string[];
  statusLabel: LocalizedText;
  featured: boolean;
  updatedAt?: string;
  matchingTags?: string[];
  cvPriority?: number;
  showInCv?: boolean;
}

export type ExperienceKind = 'employment' | 'training';

export interface ExperienceItem extends EditableRecord {
  kind: ExperienceKind;
  kindLabel: LocalizedText;
  role: LocalizedText;
  company: LocalizedText;
  companyId?: string;
  period: LocalizedText;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: LocalizedText;
  summary?: LocalizedText;
  responsibilities: LocalizedText[];
  relatedProjectSlugs: string[];
  matchingTags?: string[];
  cvPriority?: number;
  showInCv?: boolean;
}

export interface SkillGroup extends EditableRecord {
  code: string;
  title: LocalizedText;
  description: LocalizedText;
  skills: LocalizedText[];
  isVisible?: boolean;
  matchingTags?: string[];
  cvPriority?: number;
  showInCv?: boolean;
}

export interface Certification extends EditableRecord {
  title: LocalizedText;
  issuer: LocalizedText;
  issueDate: LocalizedText;
  credentialId: string;
  credentialUrl: string | null;
  category: LocalizedText;
  description?: LocalizedText;
  mediaUrl?: string | null;
  matchingTags?: string[];
  showInCv?: boolean;
}
