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

export type AcademicActivityCategory =
  | 'project'
  | 'activity'
  | 'achievement'
  | 'research';

export interface AcademicActivity {
  id: string;
  category: AcademicActivityCategory;
  title: LocalizedText;
  description: LocalizedText;
  displayOrder: number;
}

export interface EducationItem extends EditableRecord {
  degree: LocalizedText;
  fieldOfStudy?: LocalizedText;
  institution: LocalizedText;
  location?: LocalizedText;
  period: LocalizedText;
  startYear?: string;
  graduationYear: string;
  isCurrent?: boolean;
  grade: LocalizedText;
  classification?: LocalizedText;
  academicStatus?: LocalizedText;
  summary?: LocalizedText;
  detailedDescription?: LocalizedText;
  activities?: AcademicActivity[];
  graduationProjectSlug?: string;
  relatedProjectSlugs?: string[];
  coursework: LocalizedText[];
  isPublished?: boolean;
}

export type SpecializationId =
  | 'hvac-refrigeration'
  | 'plc-automation'
  | 'industrial-maintenance'
  | 'mechanical-design'
  | 'sheet-metal-design'
  | 'robotics-mechatronics';

export type SpecializationIcon =
  | 'wind'
  | 'cpu'
  | 'wrench'
  | 'cog'
  | 'layers'
  | 'bot'
  | 'thermometer'
  | 'gauge'
  | 'zap'
  | 'activity'
  | 'shield'
  | 'settings'
  | 'box'
  | 'circuit-board'
  | 'factory'
  | 'flame'
  | 'sliders'
  | 'compass';

export type SpecializationIconType = 'library' | 'image';

export type SpecializationProjectMode = 'category' | 'manual';

export interface Specialization {
  id: string;
  code: string;
  icon: SpecializationIcon;
  iconType?: SpecializationIconType;
  customIconUrl?: string | null;
  customIconPath?: string | null;
  title: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  filterCategory: string;
  projectRelationMode?: SpecializationProjectMode;
  relatedProjectIds?: string[];
  displayOrder?: number;
  isPublished?: boolean;
}

export type CompanyRelationshipCategory =
  | 'client'
  | 'project-client'
  | 'industrial-partner'
  | 'partner'
  | 'contractor'
  | 'employer'
  | 'training'
  | 'other'
  | 'unconfirmed';

export interface Company extends EditableRecord {
  slug: string;
  name: LocalizedText;
  monogram: string;
  logoUrl: string | null;
  logoStoragePath?: string | null;
  coverImageUrl?: string | null;
  coverStoragePath?: string | null;
  shortDescription?: LocalizedText;
  overview?: LocalizedText;
  websiteUrl?: string | null;
  industry: LocalizedText;
  location?: LocalizedText;
  country?: LocalizedText;
  relationshipCategory?: CompanyRelationshipCategory;
  relationshipType: LocalizedText;
  startDate?: string | null;
  endDate?: string | null;
  featured?: boolean;
  isPublished?: boolean;
  seoMeta?: ProjectSeoMeta;
  servicesProvided: LocalizedText[];
  relatedProjectSlugs: string[];
}

export type ProjectKind = 'graduation' | 'engineering' | 'industrial';

export type ProjectGroup = 'professional' | 'academic' | 'personal';

export interface ProjectGalleryImage {
  url: string;
  alt: LocalizedText;
  caption?: LocalizedText;
  storagePath?: string | null;
}

export interface ProjectContribution {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  displayOrder: number;
}

export interface ProjectAttachment {
  id: string;
  title: LocalizedText;
  fileType: string;
  fileUrl: string;
  storagePath?: string | null;
  fileSizeLabel?: string | null;
  downloadable: boolean;
  displayOrder: number;
}

export interface ProjectViewerConfig {
  enabled: boolean;
  sourceMode?: 'upload' | 'external-url';
  storagePath?: string | null;
  fileName?: string | null;
  fileSizeLabel?: string | null;
  embedUrl: string;
  title?: LocalizedText;
  fallbackMessage?: LocalizedText;
  heightPx?: number;
}

export interface ProjectSeoMeta {
  title?: LocalizedText;
  description?: LocalizedText;
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
  projectGroup?: ProjectGroup;
  title: LocalizedText;
  shortDescription: LocalizedText;
  overview: LocalizedText;
  category: SpecializationId;
  categoryLabel: LocalizedText;
  categoryIds?: string[];
  startDate?: string | null;
  completionDate?: string | null;
  coverVariant: 'hvac' | 'plc' | 'maintenance' | 'mechanical' | 'sheet-metal' | 'robotics';
  coverImageUrl?: string | null;
  coverImageAlt?: LocalizedText;
  gallery?: ProjectGalleryImage[];
  caseStudy?: ProjectCaseStudy;
  technologies: string[];
  deliverables: LocalizedText[];
  contributions?: ProjectContribution[];
  attachments?: ProjectAttachment[];
  viewerConfig?: ProjectViewerConfig | null;
  seoMeta?: ProjectSeoMeta | null;
  companyId?: string;
  relatedProjectSlugs?: string[];
  statusLabel: LocalizedText;
  featured: boolean;
  isPublished?: boolean;
  updatedAt?: string;
  matchingTags?: string[];
  cvPriority?: number;
  showInCv?: boolean;
}

export type ExperienceKind = 'employment' | 'training';

export type EmploymentType =
  | 'full-time'
  | 'part-time'
  | 'internship'
  | 'contract'
  | 'freelance'
  | 'other';

export type WorkMode = 'on-site' | 'hybrid' | 'remote';

export type ExperienceHighlightType = 'responsibility' | 'achievement';

export interface ExperienceHighlight {
  id: string;
  type: ExperienceHighlightType;
  title: LocalizedText;
  description: LocalizedText;
  displayOrder: number;
}

export interface ExperienceItem extends EditableRecord {
  kind: ExperienceKind;
  kindLabel: LocalizedText;
  employmentType?: EmploymentType;
  workMode?: WorkMode | null;
  role: LocalizedText;
  company: LocalizedText;
  companyId?: string;
  period: LocalizedText;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: LocalizedText;
  summary?: LocalizedText;
  detailedDescription?: LocalizedText;
  highlights?: ExperienceHighlight[];
  responsibilities: LocalizedText[];
  skills?: string[];
  relatedProjectSlugs: string[];
  isPublished?: boolean;
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

export type CourseType =
  | 'course'
  | 'technical-training'
  | 'workshop'
  | 'certification'
  | 'internship'
  | 'other';

export interface Certification extends EditableRecord {
  title: LocalizedText;
  issuer: LocalizedText;
  courseType?: CourseType;
  startDate?: string | null;
  completionDate?: string | null;
  duration?: LocalizedText;
  location?: LocalizedText;
  issueDate: LocalizedText;
  credentialId: string;
  credentialUrl: string | null;
  category: LocalizedText;
  description?: LocalizedText;
  detailedDescription?: LocalizedText;
  skills?: string[];
  learningOutcomes?: LocalizedText[];
  mediaUrl?: string | null;
  certificateStoragePath?: string | null;
  certificateMimeType?: string | null;
  certificateFileName?: string | null;
  isPublished?: boolean;
  matchingTags?: string[];
  showInCv?: boolean;
}
