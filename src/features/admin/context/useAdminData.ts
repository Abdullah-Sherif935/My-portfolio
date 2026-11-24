import { createContext, useContext } from 'react';
import type {
  Certification,
  Company,
  EducationItem,
  ExperienceItem,
  ProfileData,
  Project,
  SkillGroup,
  Specialization,
} from '@/types/portfolio';
import type {
  AdminActivityItem,
  AdminSiteSettings,
  CvWorkspaceConfig,
  MediaAsset,
  MediaCategory,
} from '@/types/admin';

export interface AdminDataContextValue {
  profile: ProfileData;
  education: EducationItem[];
  projects: Project[];
  companies: Company[];
  experience: ExperienceItem[];
  skills: SkillGroup[];
  certifications: Certification[];
  specializations: Specialization[];
  media: MediaAsset[];
  activities: AdminActivityItem[];
  cvConfig: CvWorkspaceConfig;
  siteSettings: AdminSiteSettings;

  isLoading: boolean;
  isSaving: boolean;
  lastError: string | null;
  clearError: () => void;

  updateProfile: (next: ProfileData) => Promise<void>;

  saveProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProject: (id: string, direction: 'up' | 'down') => Promise<void>;
  toggleProjectPublished: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;

  saveCompany: (company: Company, linkedExperienceIds?: string[]) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;

  saveExperience: (item: ExperienceItem) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  reorderExperience: (id: string, direction: 'up' | 'down') => Promise<void>;
  toggleExperiencePublished: (id: string) => Promise<void>;
  duplicateExperience: (id: string) => Promise<void>;

  saveEducation: (item: EducationItem) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  reorderEducation: (id: string, direction: 'up' | 'down') => Promise<void>;
  toggleEducationPublished: (id: string) => Promise<void>;

  saveSkillGroup: (group: SkillGroup) => Promise<void>;
  deleteSkillGroup: (id: string) => Promise<void>;
  reorderSkillGroup: (id: string, direction: 'up' | 'down') => Promise<void>;
  toggleSkillGroupVisibility: (id: string) => Promise<void>;

  saveCertification: (cert: Certification) => Promise<void>;
  deleteCertification: (id: string) => Promise<void>;
  reorderCertification: (id: string, direction: 'up' | 'down') => Promise<void>;
  toggleCertificationPublished: (id: string) => Promise<void>;
  duplicateCertification: (id: string) => Promise<void>;

  saveSpecialization: (spec: Specialization) => Promise<void>;
  deleteSpecialization: (id: string) => Promise<void>;
  reorderSpecialization: (id: string, direction: 'up' | 'down') => Promise<void>;
  toggleSpecializationPublished: (id: string) => Promise<void>;

  uploadMedia: (file: File, category: MediaCategory) => Promise<MediaAsset>;
  deleteMedia: (id: string) => Promise<void>;

  updateCvConfig: (next: CvWorkspaceConfig) => Promise<void>;
  updateSiteSettings: (next: AdminSiteSettings) => Promise<void>;
  reloadWorkspace: () => Promise<void>;
}

export const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error('useAdminData must be used inside AdminDataProvider');
  }
  return ctx;
}
