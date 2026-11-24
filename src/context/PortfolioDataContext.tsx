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
  SPECIALIZATIONS,
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
  Specialization,
} from '@/types/portfolio';
import type { AdminSiteSettings } from '@/types/admin';

const LIVE_CACHE_KEY = 'portfolio_live_cache_v1';

interface CachedPortfolioBundle {
  profile: ProfileData | null;
  education: EducationItem[];
  projects: Project[];
  companies: Company[];
  experience: ExperienceItem[];
  skills: SkillGroup[];
  certifications: Certification[];
  specializations: Specialization[];
  siteSettings: AdminSiteSettings | null;
}

function readCachedBundle(): CachedPortfolioBundle | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LIVE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedPortfolioBundle>;
    if (!parsed || !Array.isArray(parsed.projects)) return null;
    return {
      profile: parsed.profile ?? null,
      education: Array.isArray(parsed.education) ? parsed.education : EDUCATION_ITEMS,
      projects: parsed.projects,
      companies: Array.isArray(parsed.companies) ? parsed.companies : COMPANIES,
      experience: Array.isArray(parsed.experience) ? parsed.experience : EXPERIENCE_ITEMS,
      skills: Array.isArray(parsed.skills) ? parsed.skills : SKILL_GROUPS,
      certifications: Array.isArray(parsed.certifications)
        ? parsed.certifications
        : CERTIFICATIONS,
      specializations: Array.isArray(parsed.specializations)
        ? parsed.specializations
        : SPECIALIZATIONS,
      siteSettings: parsed.siteSettings ?? null,
    };
  } catch {
    return null;
  }
}

function writeCachedBundle(bundle: CachedPortfolioBundle): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(bundle));
  } catch {
    // ignore storage quota errors
  }
}

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const cached = useMemo(() => readCachedBundle(), []);

  const [profile, setProfile] = useState<ProfileData>(cached?.profile ?? PROFILE);
  const [education, setEducation] = useState<EducationItem[]>(
    cached?.education ?? EDUCATION_ITEMS
  );
  const [projects, setProjects] = useState<Project[]>(cached?.projects ?? PROJECTS);
  const [companies, setCompanies] = useState<Company[]>(cached?.companies ?? COMPANIES);
  const [experience, setExperience] = useState<ExperienceItem[]>(
    cached?.experience ?? EXPERIENCE_ITEMS
  );
  const [skills, setSkills] = useState<SkillGroup[]>(cached?.skills ?? SKILL_GROUPS);
  const [certifications, setCertifications] = useState<Certification[]>(
    cached?.certifications ?? CERTIFICATIONS
  );
  const [specializations, setSpecializations] = useState<Specialization[]>(
    cached?.specializations ?? SPECIALIZATIONS
  );
  const [siteSettings, setSiteSettings] = useState<AdminSiteSettings>(
    cached?.siteSettings ?? INITIAL_SITE_SETTINGS
  );
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseReady && !cached);
  const [isLive, setIsLive] = useState<boolean>(Boolean(cached));
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
      setSpecializations(bundle.specializations);
      if (bundle.siteSettings) setSiteSettings(bundle.siteSettings);
      setIsLive(true);
      writeCachedBundle({
        profile: bundle.profile ?? null,
        education: bundle.education,
        projects: bundle.projects,
        companies: bundle.companies,
        experience: bundle.experience,
        skills: bundle.skills,
        certifications: bundle.certifications,
        specializations: bundle.specializations,
        siteSettings: bundle.siteSettings ?? null,
      });
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
      specializations,
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
      specializations,
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
