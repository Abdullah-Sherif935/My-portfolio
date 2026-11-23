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
import type { AdminSiteSettings } from '@/types/admin';

export interface PortfolioDataContextValue {
  profile: ProfileData;
  education: EducationItem[];
  projects: Project[];
  companies: Company[];
  experience: ExperienceItem[];
  skills: SkillGroup[];
  certifications: Certification[];
  siteSettings: AdminSiteSettings;
  isLoading: boolean;
  isLive: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
}

export const PortfolioDataContext =
  createContext<PortfolioDataContextValue | null>(null);

export function usePortfolioData(): PortfolioDataContextValue {
  const ctx = useContext(PortfolioDataContext);
  if (!ctx) {
    throw new Error('usePortfolioData must be used inside PortfolioDataProvider');
  }
  return ctx;
}
