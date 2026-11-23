import { createContext, useContext } from 'react';
import type {
  Certification,
  Company,
  EducationItem,
  ExperienceItem,
  ProfileData,
  Project,
  SkillGroup,
} from '@/types/portfolio';
import type {
  AdminActivityItem,
  AdminSiteSettings,
  CvWorkspaceConfig,
  MediaAsset,
} from '@/types/admin';

export interface AdminDataContextValue {
  profile: ProfileData;
  education: EducationItem[];
  projects: Project[];
  companies: Company[];
  experience: ExperienceItem[];
  skills: SkillGroup[];
  certifications: Certification[];
  media: MediaAsset[];
  activities: AdminActivityItem[];
  cvConfig: CvWorkspaceConfig;
  siteSettings: AdminSiteSettings;

  updateProfile: (next: ProfileData) => void;

  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;

  saveCompany: (company: Company, linkedExperienceIds?: string[]) => void;
  deleteCompany: (id: string) => void;

  saveExperience: (item: ExperienceItem) => void;
  deleteExperience: (id: string) => void;
  reorderExperience: (id: string, direction: 'up' | 'down') => void;

  saveEducation: (item: EducationItem) => void;
  deleteEducation: (id: string) => void;

  saveSkillGroup: (group: SkillGroup) => void;
  deleteSkillGroup: (id: string) => void;
  reorderSkillGroup: (id: string, direction: 'up' | 'down') => void;
  toggleSkillGroupVisibility: (id: string) => void;

  saveCertification: (cert: Certification) => void;
  deleteCertification: (id: string) => void;

  addPreviewMedia: (asset: MediaAsset) => void;
  deleteMedia: (id: string) => void;

  updateCvConfig: (next: CvWorkspaceConfig) => void;
  updateSiteSettings: (next: AdminSiteSettings) => void;
  resetAllToInitial: () => void;
}

export const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error('useAdminData must be used inside AdminDataProvider');
  }
  return ctx;
}
