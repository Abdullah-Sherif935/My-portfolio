import type {
  Certification,
  Company,
  CompanyRelationshipCategory,
  DataSource,
  EducationItem,
  ExperienceItem,
  ExperienceKind,
  LocalizedText,
  ProfileData,
  Project,
  ProjectCaseStudy,
  ProjectGalleryImage,
  ProjectKind,
  SkillGroup,
  Specialization,
  SpecializationIcon,
  SpecializationId,
} from '@/types/portfolio';
import type {
  AdminActivityItem,
  AdminSiteSettings,
  CvSectionConfig,
  CvTemplateId,
  CvWorkspaceConfig,
  HomeSectionsConfig,
  MediaAsset,
  MediaCategory,
} from '@/types/admin';
import { DEFAULT_HOME_SECTIONS_CONFIG } from '@/data/adminMock';

const DEFAULT_CV_SECTION_ORDER: CvSectionConfig[] = [
  { key: 'summary', visible: true },
  { key: 'experience', visible: true },
  { key: 'projects', visible: true },
  { key: 'skills', visible: true },
  { key: 'education', visible: true },
  { key: 'certifications', visible: true },
];

// ============================================================================
// Raw PostgreSQL Row Shapes (snake_case)
// ============================================================================

export interface ProfileRow {
  id: string;
  full_name: LocalizedText;
  short_name: LocalizedText;
  headline: LocalizedText;
  summary: LocalizedText;
  location: LocalizedText;
  avatar_url: string | null;
  avatar_alt: LocalizedText | null;
  contact: ProfileData['contact'];
  languages: ProfileData['languages'];
  core_competencies: LocalizedText[];
  data_source: DataSource;
  is_editable: boolean;
  is_published: boolean;
  updated_at?: string;
}

export interface CompanyRow {
  id: string;
  slug: string;
  name: LocalizedText;
  monogram: string;
  logo_url: string | null;
  overview: LocalizedText | null;
  industry: LocalizedText;
  relationship_category: CompanyRelationshipCategory;
  relationship_type: LocalizedText;
  services_provided: LocalizedText[];
  related_project_slugs: string[];
  data_source: DataSource;
  is_editable: boolean;
  display_order: number;
  is_published: boolean;
  updated_at?: string;
}

export interface ProjectRow {
  id: string;
  slug: string;
  code: string;
  kind: ProjectKind;
  kind_label: LocalizedText;
  title: LocalizedText;
  short_description: LocalizedText;
  overview: LocalizedText;
  category: SpecializationId;
  category_label: LocalizedText;
  cover_variant: Project['coverVariant'];
  cover_image_url: string | null;
  cover_image_alt: LocalizedText | null;
  gallery: ProjectGalleryImage[] | null;
  case_study: ProjectCaseStudy | null;
  technologies: string[];
  deliverables: LocalizedText[];
  company_id: string | null;
  related_project_slugs: string[];
  status_label: LocalizedText;
  featured: boolean;
  data_source: DataSource;
  is_editable: boolean;
  display_order: number;
  is_published: boolean;
  matching_tags?: string[] | null;
  cv_priority?: number | null;
  show_in_cv?: boolean | null;
  updated_at?: string;
}

export interface ExperienceRow {
  id: string;
  kind: ExperienceKind;
  kind_label: LocalizedText;
  role: LocalizedText;
  company: LocalizedText;
  company_id: string | null;
  period: LocalizedText;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  location: LocalizedText | null;
  summary: LocalizedText | null;
  responsibilities: LocalizedText[];
  related_project_slugs: string[];
  data_source: DataSource;
  is_editable: boolean;
  display_order: number;
  is_published: boolean;
  matching_tags?: string[] | null;
  cv_priority?: number | null;
  show_in_cv?: boolean | null;
  updated_at?: string;
}

export interface EducationRow {
  id: string;
  degree: LocalizedText;
  field_of_study: LocalizedText | null;
  institution: LocalizedText;
  period: LocalizedText;
  start_year: string | null;
  graduation_year: string;
  grade: LocalizedText;
  classification: LocalizedText | null;
  graduation_project_slug: string | null;
  coursework: LocalizedText[];
  data_source: DataSource;
  is_editable: boolean;
  display_order: number;
  is_published: boolean;
  updated_at?: string;
}

export interface SkillGroupRow {
  id: string;
  code: string;
  title: LocalizedText;
  description: LocalizedText;
  skills: LocalizedText[];
  is_visible: boolean;
  data_source: DataSource;
  is_editable: boolean;
  display_order: number;
  is_published: boolean;
  matching_tags?: string[] | null;
  cv_priority?: number | null;
  show_in_cv?: boolean | null;
  updated_at?: string;
}

export interface CertificationRow {
  id: string;
  title: LocalizedText;
  issuer: LocalizedText;
  issue_date: LocalizedText;
  credential_id: string;
  credential_url: string | null;
  category: LocalizedText;
  description: LocalizedText | null;
  media_url: string | null;
  data_source: DataSource;
  is_editable: boolean;
  display_order: number;
  is_published: boolean;
  matching_tags?: string[] | null;
  show_in_cv?: boolean | null;
  updated_at?: string;
}

export interface MediaAssetRow {
  id: string;
  file_name: string;
  storage_path: string | null;
  bucket_name: string | null;
  url: string;
  mime_type: string;
  size_bytes: number | null;
  size_label: string;
  dimensions: string | null;
  category: MediaCategory;
  alt: LocalizedText;
  is_local_asset: boolean;
  created_at?: string;
}

export interface CvWorkspaceConfigRow {
  id: string;
  target_role: LocalizedText;
  custom_summary: LocalizedText;
  use_profile_summary: boolean;
  selected_education_ids: string[];
  selected_experience_ids: string[];
  selected_project_ids: string[];
  selected_skill_group_ids: string[];
  selected_certification_ids: string[];
  sections: CvSectionConfig[];
}

export interface SiteSettingsRow {
  id: string;
  site_name: LocalizedText;
  seo_title: LocalizedText;
  seo_description: LocalizedText;
  show_graduation_portrait: boolean;
  show_contact_email: boolean;
  show_linkedin_link: boolean;
  show_courses_section: boolean;
  recruiter_mode_enabled?: boolean | null;
  default_cv_template?: CvTemplateId | null;
  cv_section_order?: CvSectionConfig[] | null;
  home_sections_config?: Partial<HomeSectionsConfig> | null;
}

export interface SpecializationRow {
  id: string;
  code: string;
  icon: SpecializationIcon;
  icon_type?: 'library' | 'image' | null;
  custom_icon_url?: string | null;
  custom_icon_path?: string | null;
  title: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  filter_category: string;
  project_relation_mode?: 'category' | 'manual' | null;
  display_order: number;
  is_published: boolean;
  updated_at?: string;
}

export interface SpecializationProjectLinkRow {
  specialization_id: string;
  project_id: string;
  display_order: number;
}

export interface ActivityLogRow {
  id: string;
  action: LocalizedText;
  target: LocalizedText;
  section: string;
  created_at: string;
}

// ============================================================================
// Row -> Domain Mappers
// ============================================================================

export function mapProfileFromRow(row: ProfileRow): ProfileData {
  return {
    id: row.id,
    fullName: row.full_name,
    shortName: row.short_name,
    headline: row.headline,
    summary: row.summary,
    location: row.location,
    avatarUrl: row.avatar_url,
    avatarAlt: row.avatar_alt ?? undefined,
    contact: row.contact,
    languages: row.languages ?? [],
    coreCompetencies: row.core_competencies ?? [],
    dataSource: row.data_source,
    isEditable: row.is_editable,
  };
}

export function mapProfileToRow(data: ProfileData): ProfileRow {
  return {
    id: data.id || 'owner-profile',
    full_name: data.fullName,
    short_name: data.shortName,
    headline: data.headline,
    summary: data.summary,
    location: data.location,
    avatar_url: data.avatarUrl ?? null,
    avatar_alt: data.avatarAlt ?? null,
    contact: data.contact,
    languages: data.languages,
    core_competencies: data.coreCompetencies,
    data_source: data.dataSource,
    is_editable: data.isEditable,
    is_published: true,
  };
}

export function mapCompanyFromRow(row: CompanyRow): Company {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    monogram: row.monogram,
    logoUrl: row.logo_url,
    overview: row.overview ?? undefined,
    industry: row.industry,
    relationshipCategory: row.relationship_category,
    relationshipType: row.relationship_type,
    servicesProvided: row.services_provided ?? [],
    relatedProjectSlugs: row.related_project_slugs ?? [],
    dataSource: row.data_source,
    isEditable: row.is_editable,
    displayOrder: row.display_order,
  };
}

export function mapCompanyToRow(data: Company): CompanyRow {
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    monogram: data.monogram,
    logo_url: data.logoUrl ?? null,
    overview: data.overview ?? null,
    industry: data.industry,
    relationship_category: data.relationshipCategory ?? 'unconfirmed',
    relationship_type: data.relationshipType,
    services_provided: data.servicesProvided,
    related_project_slugs: data.relatedProjectSlugs,
    data_source: data.dataSource,
    is_editable: data.isEditable,
    display_order: data.displayOrder,
    is_published: true,
  };
}

export function mapProjectFromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    code: row.code,
    kind: row.kind,
    kindLabel: row.kind_label,
    title: row.title,
    shortDescription: row.short_description,
    overview: row.overview,
    category: row.category,
    categoryLabel: row.category_label,
    coverVariant: row.cover_variant,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt ?? undefined,
    gallery: row.gallery && row.gallery.length > 0 ? row.gallery : undefined,
    caseStudy: row.case_study ?? undefined,
    technologies: row.technologies ?? [],
    deliverables: row.deliverables ?? [],
    companyId: row.company_id ?? undefined,
    relatedProjectSlugs:
      row.related_project_slugs && row.related_project_slugs.length > 0
        ? row.related_project_slugs
        : undefined,
    statusLabel: row.status_label,
    featured: row.featured,
    isPublished: row.is_published,
    dataSource: row.data_source,
    isEditable: row.is_editable,
    displayOrder: row.display_order,
    updatedAt: row.updated_at ? row.updated_at.slice(0, 10) : undefined,
    matchingTags: row.matching_tags ?? [],
    cvPriority: row.cv_priority ?? 50,
    showInCv: row.show_in_cv ?? true,
  };
}

export function mapProjectToRow(data: Project): ProjectRow {
  return {
    id: data.id,
    slug: data.slug,
    code: data.code,
    kind: data.kind,
    kind_label: data.kindLabel,
    title: data.title,
    short_description: data.shortDescription,
    overview: data.overview,
    category: data.category,
    category_label: data.categoryLabel,
    cover_variant: data.coverVariant,
    cover_image_url: data.coverImageUrl ?? null,
    cover_image_alt: data.coverImageAlt ?? null,
    gallery: data.gallery ?? [],
    case_study: data.caseStudy ?? null,
    technologies: data.technologies,
    deliverables: data.deliverables,
    company_id: data.companyId ?? null,
    related_project_slugs: data.relatedProjectSlugs ?? [],
    status_label: data.statusLabel,
    featured: data.featured,
    data_source: data.dataSource,
    is_editable: data.isEditable,
    display_order: data.displayOrder,
    is_published: data.isPublished !== false,
    matching_tags: data.matchingTags ?? [],
    cv_priority: Math.min(100, Math.max(1, data.cvPriority ?? 50)),
    show_in_cv: data.showInCv !== false,
  };
}

export function mapExperienceFromRow(row: ExperienceRow): ExperienceItem {
  return {
    id: row.id,
    kind: row.kind,
    kindLabel: row.kind_label,
    role: row.role,
    company: row.company,
    companyId: row.company_id ?? undefined,
    period: row.period,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    isCurrent: row.is_current,
    location: row.location ?? undefined,
    summary: row.summary ?? undefined,
    responsibilities: row.responsibilities ?? [],
    relatedProjectSlugs: row.related_project_slugs ?? [],
    dataSource: row.data_source,
    isEditable: row.is_editable,
    displayOrder: row.display_order,
    matchingTags: row.matching_tags ?? [],
    cvPriority: row.cv_priority ?? 50,
    showInCv: row.show_in_cv ?? true,
  };
}

export function mapExperienceToRow(data: ExperienceItem): ExperienceRow {
  return {
    id: data.id,
    kind: data.kind,
    kind_label: data.kindLabel,
    role: data.role,
    company: data.company,
    company_id: data.companyId ?? null,
    period: data.period,
    start_date: data.startDate ?? null,
    end_date: data.endDate ?? null,
    is_current: Boolean(data.isCurrent),
    location: data.location ?? null,
    summary: data.summary ?? null,
    responsibilities: data.responsibilities,
    related_project_slugs: data.relatedProjectSlugs,
    data_source: data.dataSource,
    is_editable: data.isEditable,
    display_order: data.displayOrder,
    is_published: true,
    matching_tags: data.matchingTags ?? [],
    cv_priority: Math.min(100, Math.max(1, data.cvPriority ?? 50)),
    show_in_cv: data.showInCv !== false,
  };
}

export function mapEducationFromRow(row: EducationRow): EducationItem {
  return {
    id: row.id,
    degree: row.degree,
    fieldOfStudy: row.field_of_study ?? undefined,
    institution: row.institution,
    period: row.period,
    startYear: row.start_year ?? undefined,
    graduationYear: row.graduation_year,
    grade: row.grade,
    classification: row.classification ?? undefined,
    graduationProjectSlug: row.graduation_project_slug ?? undefined,
    coursework: row.coursework ?? [],
    dataSource: row.data_source,
    isEditable: row.is_editable,
    displayOrder: row.display_order,
  };
}

export function mapEducationToRow(data: EducationItem): EducationRow {
  return {
    id: data.id,
    degree: data.degree,
    field_of_study: data.fieldOfStudy ?? null,
    institution: data.institution,
    period: data.period,
    start_year: data.startYear ?? null,
    graduation_year: data.graduationYear,
    grade: data.grade,
    classification: data.classification ?? null,
    graduation_project_slug: data.graduationProjectSlug ?? null,
    coursework: data.coursework,
    data_source: data.dataSource,
    is_editable: data.isEditable,
    display_order: data.displayOrder,
    is_published: true,
  };
}

export function mapSkillGroupFromRow(row: SkillGroupRow): SkillGroup {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    skills: row.skills ?? [],
    isVisible: row.is_visible,
    dataSource: row.data_source,
    isEditable: row.is_editable,
    displayOrder: row.display_order,
    matchingTags: row.matching_tags ?? [],
    cvPriority: row.cv_priority ?? 50,
    showInCv: row.show_in_cv ?? true,
  };
}

export function mapSkillGroupToRow(data: SkillGroup): SkillGroupRow {
  return {
    id: data.id,
    code: data.code,
    title: data.title,
    description: data.description,
    skills: data.skills,
    is_visible: data.isVisible !== false,
    data_source: data.dataSource,
    is_editable: data.isEditable,
    display_order: data.displayOrder,
    is_published: true,
    matching_tags: data.matchingTags ?? [],
    cv_priority: Math.min(100, Math.max(1, data.cvPriority ?? 50)),
    show_in_cv: data.showInCv !== false,
  };
}

export function mapCertificationFromRow(row: CertificationRow): Certification {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    issueDate: row.issue_date,
    credentialId: row.credential_id,
    credentialUrl: row.credential_url,
    category: row.category,
    description: row.description ?? undefined,
    mediaUrl: row.media_url,
    dataSource: row.data_source,
    isEditable: row.is_editable,
    displayOrder: row.display_order,
    matchingTags: row.matching_tags ?? [],
    showInCv: row.show_in_cv ?? true,
  };
}

export function mapCertificationToRow(data: Certification): CertificationRow {
  return {
    id: data.id,
    title: data.title,
    issuer: data.issuer,
    issue_date: data.issueDate,
    credential_id: data.credentialId,
    credential_url: data.credentialUrl ?? null,
    category: data.category,
    description: data.description ?? null,
    media_url: data.mediaUrl ?? null,
    data_source: data.dataSource,
    is_editable: data.isEditable,
    display_order: data.displayOrder,
    is_published: true,
    matching_tags: data.matchingTags ?? [],
    show_in_cv: data.showInCv !== false,
  };
}

export function mapMediaFromRow(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    fileName: row.file_name,
    url: row.url,
    mimeType: row.mime_type,
    sizeLabel: row.size_label,
    dimensions: row.dimensions ?? undefined,
    category: row.category,
    alt: row.alt,
    isLocalAsset: row.is_local_asset,
    isSample: false,
    storagePath: row.storage_path ?? undefined,
  };
}

export function mapCvConfigFromRow(row: CvWorkspaceConfigRow): CvWorkspaceConfig {
  return {
    targetRole: row.target_role,
    customSummary: row.custom_summary,
    useProfileSummary: row.use_profile_summary,
    selectedEducationIds: row.selected_education_ids ?? [],
    selectedExperienceIds: row.selected_experience_ids ?? [],
    selectedProjectIds: row.selected_project_ids ?? [],
    selectedSkillGroupIds: row.selected_skill_group_ids ?? [],
    selectedCertificationIds: row.selected_certification_ids ?? [],
    sections: row.sections ?? [],
  };
}

export function mapCvConfigToRow(data: CvWorkspaceConfig): CvWorkspaceConfigRow {
  return {
    id: 'default',
    target_role: data.targetRole,
    custom_summary: data.customSummary,
    use_profile_summary: data.useProfileSummary,
    selected_education_ids: data.selectedEducationIds,
    selected_experience_ids: data.selectedExperienceIds,
    selected_project_ids: data.selectedProjectIds,
    selected_skill_group_ids: data.selectedSkillGroupIds,
    selected_certification_ids: data.selectedCertificationIds,
    sections: data.sections,
  };
}

export function mapSpecializationFromRow(
  row: SpecializationRow,
  relatedProjectIds: string[] = []
): Specialization {
  return {
    id: row.id,
    code: row.code,
    icon: row.icon ?? 'cog',
    iconType: row.icon_type === 'image' ? 'image' : 'library',
    customIconUrl: row.custom_icon_url ?? null,
    customIconPath: row.custom_icon_path ?? null,
    title: row.title,
    description: row.description,
    highlights: row.highlights ?? [],
    filterCategory: row.filter_category ?? '',
    projectRelationMode:
      row.project_relation_mode === 'manual' ? 'manual' : 'category',
    relatedProjectIds,
    displayOrder: row.display_order ?? 1,
    isPublished: row.is_published !== false,
  };
}

export function mapSpecializationToRow(data: Specialization): SpecializationRow {
  return {
    id: data.id,
    code: data.code,
    icon: data.icon ?? 'cog',
    icon_type: data.iconType === 'image' && data.customIconUrl ? 'image' : 'library',
    custom_icon_url: data.customIconUrl ?? null,
    custom_icon_path: data.customIconPath ?? null,
    title: data.title,
    description: data.description,
    highlights: data.highlights ?? [],
    filter_category: data.filterCategory ?? '',
    project_relation_mode:
      data.projectRelationMode === 'manual' ? 'manual' : 'category',
    display_order: data.displayOrder ?? 1,
    is_published: data.isPublished !== false,
  };
}

export function mapSiteSettingsFromRow(row: SiteSettingsRow): AdminSiteSettings {
  const rawHome = row.home_sections_config;
  const homeSections: HomeSectionsConfig = {
    intro: {
      ...DEFAULT_HOME_SECTIONS_CONFIG.intro,
      ...(rawHome?.intro ?? {}),
      pillars:
        Array.isArray(rawHome?.intro?.pillars) && rawHome.intro.pillars.length > 0
          ? rawHome.intro.pillars
          : DEFAULT_HOME_SECTIONS_CONFIG.intro.pillars,
    },
    specializations: {
      ...DEFAULT_HOME_SECTIONS_CONFIG.specializations,
      ...(rawHome?.specializations ?? {}),
    },
  };

  return {
    siteName: row.site_name,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    showGraduationPortrait: row.show_graduation_portrait,
    showContactEmail: row.show_contact_email,
    showLinkedinLink: row.show_linkedin_link,
    showCoursesSection: row.show_courses_section,
    recruiterModeEnabled: row.recruiter_mode_enabled ?? true,
    defaultCvTemplate:
      row.default_cv_template === 'modern' ? 'modern' : 'ats',
    cvSectionOrder:
      Array.isArray(row.cv_section_order) && row.cv_section_order.length > 0
        ? row.cv_section_order
        : DEFAULT_CV_SECTION_ORDER,
    homeSections,
  };
}

export function mapSiteSettingsToRow(data: AdminSiteSettings): SiteSettingsRow {
  return {
    id: 'default',
    site_name: data.siteName,
    seo_title: data.seoTitle,
    seo_description: data.seoDescription,
    show_graduation_portrait: data.showGraduationPortrait,
    show_contact_email: data.showContactEmail,
    show_linkedin_link: data.showLinkedinLink,
    show_courses_section: data.showCoursesSection,
    recruiter_mode_enabled: data.recruiterModeEnabled !== false,
    default_cv_template:
      data.defaultCvTemplate === 'modern' ? 'modern' : 'ats',
    cv_section_order:
      Array.isArray(data.cvSectionOrder) && data.cvSectionOrder.length > 0
        ? data.cvSectionOrder
        : DEFAULT_CV_SECTION_ORDER,
    home_sections_config: data.homeSections ?? DEFAULT_HOME_SECTIONS_CONFIG,
  };
}

export function mapActivityFromRow(row: ActivityLogRow): AdminActivityItem {
  const date = new Date(row.created_at);
  const formattedEn = Number.isNaN(date.getTime())
    ? row.created_at
    : date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
  const formattedAr = Number.isNaN(date.getTime())
    ? row.created_at
    : date.toLocaleString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  return {
    id: row.id,
    action: row.action,
    target: row.target,
    section: row.section,
    timestampLabel: {
      en: formattedEn,
      ar: formattedAr,
    },
    isSample: false,
  };
}
