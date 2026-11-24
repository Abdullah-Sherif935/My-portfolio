import type { LocalizedText } from './portfolio';

export type MediaCategory = 'portrait' | 'branding' | 'project' | 'certificate' | 'document';

export interface MediaAsset {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeLabel: string;
  dimensions?: string;
  category: MediaCategory;
  alt: LocalizedText;
  isLocalAsset: boolean;
  isSample: boolean;
  storagePath?: string;
}

export interface AdminActivityItem {
  id: string;
  action: LocalizedText;
  target: LocalizedText;
  section: string;
  timestampLabel: LocalizedText;
  isSample: boolean;
}

export type CvSectionKey =
  | 'summary'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'certifications';

export interface CvSectionConfig {
  key: CvSectionKey;
  visible: boolean;
}

export interface CvWorkspaceConfig {
  targetRole: LocalizedText;
  customSummary: LocalizedText;
  useProfileSummary: boolean;
  selectedEducationIds: string[];
  selectedExperienceIds: string[];
  selectedProjectIds: string[];
  selectedSkillGroupIds: string[];
  selectedCertificationIds: string[];
  sections: CvSectionConfig[];
}

export type CvTemplateId = 'ats' | 'modern';

export interface HomeIntroPillar {
  code: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface HomeIntroSectionConfig {
  visible: boolean;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  educationLabel: LocalizedText;
  graduationProjectLabel: LocalizedText;
  ctaLabel: LocalizedText;
  showEducationCard: boolean;
  showGpa: boolean;
  showGraduationProject: boolean;
  showPillars: boolean;
  pillarsTitle: LocalizedText;
  pillars: HomeIntroPillar[];
}

export interface HomeSpecializationsSectionConfig {
  visible: boolean;
  eyebrow: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
}

export interface HomeHeroHighlightCard {
  visible: boolean;
  label: LocalizedText;
  value: LocalizedText;
  subtext: LocalizedText;
}

export interface HomeHeroCardsConfig {
  currentRole: HomeHeroHighlightCard;
  coreFocus: HomeHeroHighlightCard;
}

export interface HomeSectionsConfig {
  heroCards?: HomeHeroCardsConfig;
  intro: HomeIntroSectionConfig;
  specializations: HomeSpecializationsSectionConfig;
}

export interface AdminSiteSettings {
  siteName: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  showGraduationPortrait: boolean;
  showContactEmail: boolean;
  showLinkedinLink: boolean;
  showCoursesSection: boolean;
  recruiterModeEnabled: boolean;
  defaultCvTemplate: CvTemplateId;
  cvSectionOrder: CvSectionConfig[];
  homeSections: HomeSectionsConfig;
}
