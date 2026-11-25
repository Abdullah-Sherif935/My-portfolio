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

export type SkillMatchStatus = 'matched' | 'partial' | 'missing';

export interface SkillRequirement {
  id: string;
  label: LocalizedText;
  aliases: string[];
  /** Optional broader terms that indicate partial / adjacent familiarity */
  partialAliases?: string[];
}

export interface ProfileMatchingWeights {
  requiredSkills: number;
  preferredSkills: number;
  experience: number;
  projects: number;
  toolsAndTech: number;
  educationAndCerts: number;
}

export interface RecruiterPositionOption {
  id: RecruiterPositionId;
  label: LocalizedText;
  shortLabel: LocalizedText;
  cvHeadline: LocalizedText;
  description: LocalizedText;
  filenameSlug: string;
  requiredSkills: SkillRequirement[];
  preferredSkills: SkillRequirement[];
  primaryTags: string[];
  secondaryTags: string[];
  preferredCategories: SpecializationId[];
  keywords: string[];
  weights: ProfileMatchingWeights;
}

export interface RecruiterProfileOverride {
  requiredSkillIds?: string[];
  preferredSkillIds?: string[];
  extraRequiredTerms?: string[];
  extraPreferredTerms?: string[];
  weights?: Partial<ProfileMatchingWeights>;
}

export type RecruiterProfileOverrides = Partial<
  Record<RecruiterPositionId, RecruiterProfileOverride>
>;

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
  matchReasons: LocalizedText[];
}

export interface SkillEvaluation {
  id: string;
  label: LocalizedText;
  importance: 'required' | 'preferred';
  status: SkillMatchStatus;
  evidenceSources: LocalizedText[];
  explanation: LocalizedText;
}

export interface CompatibilityDimension {
  key: keyof ProfileMatchingWeights;
  label: LocalizedText;
  score: number; // 0..100
  weight: number; // percentage weight
  weightedContribution: number;
  evidenceSummary: LocalizedText;
}

export interface CompatibilityAssessment {
  overallScore: number; // 0..100 deterministic alignment index (NOT hiring probability)
  level: 'high' | 'moderate' | 'exploratory';
  summary: LocalizedText;
  breakdown: CompatibilityDimension[];
  matchedSkills: SkillEvaluation[];
  partialSkills: SkillEvaluation[];
  missingSkills: SkillEvaluation[];
}

export interface RecruiterMatchInput {
  positionId: RecruiterPositionId;
  customTitle?: string;
  customDescription?: string;
  selectedSkillIds?: string[];
  preferredCvLanguage?: Language;
  profileOverrides?: RecruiterProfileOverrides;
}

export interface TailoredProfileResult {
  position: RecruiterPositionOption;
  displayPositionTitle: LocalizedText;
  isCustomRole: boolean;
  customTitle: string;
  customDescription: string;
  selectedSkillIds: string[];
  preferredCvLanguage: Language;
  hasDirectMatches: boolean;
  matchedFocusAreas: LocalizedText[];
  compatibility: CompatibilityAssessment;
  experience: RankedItem<ExperienceItem>[];
  projects: RankedItem<Project>[];
  skills: RankedItem<SkillGroup>[];
  education: EducationItem[];
  certifications: RankedItem<Certification>[];
}
