import type {
  Certification,
  EducationItem,
  ExperienceItem,
  Language,
  LocalizedText,
  Project,
  SkillGroup,
  SpecializationId,
} from './portfolio';

export type RecruiterPositionId =
  | 'hvac-design'
  | 'mechanical-design'
  | 'automation-control'
  | 'robotics-mechatronics'
  | 'manufacturing'
  | 'general-engineering'
  | 'custom';

export type MatchTier = 'strong' | 'relevant' | 'supporting';

export interface RecruiterPositionOption {
  id: RecruiterPositionId;
  label: LocalizedText;
  shortLabel: LocalizedText;
  description: LocalizedText;
  filenameSlug: string;
  primaryTags: string[];
  secondaryTags: string[];
  preferredCategories: SpecializationId[];
  keywords: string[];
}

export interface RecruiterSkillFilterOption {
  id: string;
  label: LocalizedText;
  tags: string[];
}

export interface RankedItem<T> {
  item: T;
  tier: MatchTier;
  score: number;
  matchedKeywords: string[];
}

export interface RecruiterMatchInput {
  positionId: RecruiterPositionId;
  customTitle?: string;
  selectedSkillIds?: string[];
  preferredCvLanguage?: Language;
}

export interface TailoredProfileResult {
  position: RecruiterPositionOption;
  displayPositionTitle: LocalizedText;
  isCustomRole: boolean;
  customTitle: string;
  selectedSkillIds: string[];
  preferredCvLanguage: Language;
  hasDirectMatches: boolean;
  matchedFocusAreas: LocalizedText[];
  experience: RankedItem<ExperienceItem>[];
  projects: RankedItem<Project>[];
  skills: RankedItem<SkillGroup>[];
  education: EducationItem[];
  certifications: RankedItem<Certification>[];
}
