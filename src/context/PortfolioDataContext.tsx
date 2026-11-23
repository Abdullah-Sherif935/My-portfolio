import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  CERTIFICATIONS,
  COMPANIES,
  EDUCATION_ITEMS,
  EXPERIENCE_ITEMS,
  INITIAL_SITE_SETTINGS,
  PROFILE,
  PROJECTS,
  SKILL_GROUPS,
} from '@/data';
import { isSupabaseReady } from '@/lib/supabase';
import { fetchPublicPortfolioBundle } from '@/services/portfolioService';
import {
  PortfolioDataContext,
  type PortfolioDataContextValue,
} from '@/hooks/usePortfolioData';
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

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(PROFILE);
  const [education, setEducation] = useState<EducationItem[]>(EDUCATION_ITEMS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [experience, setExperience] = useState<ExperienceItem[]>(EXPERIENCE_ITEMS);
  const [skills, setSkills] = useState<SkillGroup[]>(SKILL_GROUPS);
  const [certifications, setCertifications] =
    useState<Certification[]>(CERTIFICATIONS);
  const [siteSettings, setSiteSettings] =
    useState<AdminSiteSettings>(INITIAL_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseReady);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPortfolio = useCallback(async () => {
    if (!isSupabaseReady) {
      setIsLoading(false);
      setIsLive(false);
      return;
    }

    try {
      setError(null);
      const bundle = await fetchPublicPortfolioBundle();
      if (!bundle) {
        setIsLive(false);
        return;
      }

      if (bundle.profile) setProfile(bundle.profile);
      setEducation(bundle.education);
      setProjects(bundle.projects);
      setCompanies(bundle.companies);
      setExperience(bundle.experience);
      setSkills(bundle.skills);
      setCertifications(bundle.certifications);
      if (bundle.siteSettings) setSiteSettings(bundle.siteSettings);
      setIsLive(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load portfolio data.'
      );
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPortfolio();
  }, [refreshPortfolio]);

  const value = useMemo<PortfolioDataContextValue>(
    () => ({
      profile,
      education,
      projects,
      companies,
      experience,
      skills,
      certifications,
      siteSettings,
      isLoading,
      isLive,
      error,
      refreshPortfolio,
    }),
    [
      profile,
      education,
      projects,
      companies,
      experience,
      skills,
      certifications,
      siteSettings,
      isLoading,
      isLive,
      error,
      refreshPortfolio,
    ]
  );

  return (
    <PortfolioDataContext.Provider value={value}>
      {children}
    </PortfolioDataContext.Provider>
  );
}
