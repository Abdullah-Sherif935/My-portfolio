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
  INITIAL_CV_CONFIG,
  INITIAL_MEDIA_ASSETS,
  INITIAL_SITE_SETTINGS,
  PROFILE,
  PROJECTS,
  SKILL_GROUPS,
} from '@/data';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import {
  deleteCertificationRecord,
  deleteCompanyRecord,
  deleteEducationRecord,
  deleteExperienceRecord,
  deleteProjectRecord,
  deleteSkillGroupRecord,
  fetchAdminWorkspaceBundle,
  persistExperienceOrder,
  persistSkillGroupOrder,
  recordAdminActivity,
  saveCertificationRecord,
  saveCompanyRecord,
  saveCvConfigRecord,
  saveEducationRecord,
  saveExperienceRecord,
  saveProfileRecord,
  saveProjectRecord,
  saveSiteSettingsRecord,
  saveSkillGroupRecord,
} from '@/services/portfolioService';
import { deleteMediaAsset, uploadMediaFile } from '@/services/storageService';
import type {
  Certification,
  Company,
  EducationItem,
  ExperienceItem,
  LocalizedText,
  ProfileData,
  Project,
  SkillGroup,
} from '@/types/portfolio';
import type {
  AdminActivityItem,
  AdminSiteSettings,
  CvWorkspaceConfig,
  MediaAsset,
  MediaCategory,
} from '@/types/admin';
import {
  AdminDataContext,
  type AdminDataContextValue,
} from './useAdminData';

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { refreshPortfolio } = usePortfolioData();

  const [profile, setProfile] = useState<ProfileData>(PROFILE);
  const [education, setEducation] = useState<EducationItem[]>(EDUCATION_ITEMS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [experience, setExperience] = useState<ExperienceItem[]>(EXPERIENCE_ITEMS);
  const [skills, setSkills] = useState<SkillGroup[]>(SKILL_GROUPS);
  const [certifications, setCertifications] =
    useState<Certification[]>(CERTIFICATIONS);
  const [media, setMedia] = useState<MediaAsset[]>(INITIAL_MEDIA_ASSETS);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [cvConfig, setCvConfig] = useState<CvWorkspaceConfig>(INITIAL_CV_CONFIG);
  const [siteSettings, setSiteSettings] =
    useState<AdminSiteSettings>(INITIAL_SITE_SETTINGS);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const clearError = useCallback(() => setLastError(null), []);

  const reloadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setLastError(null);
    try {
      const bundle = await fetchAdminWorkspaceBundle();
      if (bundle.profile) setProfile(bundle.profile);
      setEducation(bundle.education);
      setProjects(bundle.projects);
      setCompanies(bundle.companies);
      setExperience(bundle.experience);
      setSkills(bundle.skills);
      setCertifications(bundle.certifications);
      setMedia(bundle.media);
      setActivities(bundle.activities);
      if (bundle.cvConfig) setCvConfig(bundle.cvConfig);
      if (bundle.siteSettings) setSiteSettings(bundle.siteSettings);
    } catch (err) {
      setLastError(
        err instanceof Error ? err.message : 'Failed to load workspace data.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadWorkspace();
  }, [reloadWorkspace]);

  const appendActivity = useCallback(
    async (section: string, action: LocalizedText, target: LocalizedText) => {
      try {
        const entry = await recordAdminActivity(section, action, target);
        setActivities((prev) => [entry, ...prev].slice(0, 20));
      } catch {
        // Non-blocking audit log failure
      }
    },
    []
  );

  const runMutation = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setIsSaving(true);
      setLastError(null);
      try {
        const result = await fn();
        void refreshPortfolio();
        return result;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Database operation failed.';
        setLastError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshPortfolio]
  );

  const updateProfile = useCallback(
    async (next: ProfileData) => {
      await runMutation(async () => {
        const saved = await saveProfileRecord(next);
        setProfile(saved);
        await appendActivity(
          'profile',
          { en: 'Updated profile record', ar: 'تم تحديث بيانات الملف الشخصي' },
          saved.fullName
        );
      });
    },
    [runMutation, appendActivity]
  );

  const saveProject = useCallback(
    async (project: Project) => {
      await runMutation(async () => {
        const saved = await saveProjectRecord(project);
        setProjects((prev) => {
          const exists = prev.some((p) => p.id === saved.id);
          const list = exists
            ? prev.map((p) => (p.id === saved.id ? saved : p))
            : [...prev, saved];
          return list.sort((a, b) => a.displayOrder - b.displayOrder);
        });
        await appendActivity(
          'projects',
          { en: 'Saved project record', ar: 'تم حفظ سجل المشروع' },
          saved.title
        );
      });
    },
    [runMutation, appendActivity]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        const target = projects.find((p) => p.id === id);
        await deleteProjectRecord(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        const nextCv: CvWorkspaceConfig = {
          ...cvConfig,
          selectedProjectIds: cvConfig.selectedProjectIds.filter((pid) => pid !== id),
        };
        if (nextCv.selectedProjectIds.length !== cvConfig.selectedProjectIds.length) {
          const savedCv = await saveCvConfigRecord(nextCv);
          setCvConfig(savedCv);
        }
        if (target) {
          await appendActivity(
            'projects',
            { en: 'Deleted project record', ar: 'تم حذف سجل المشروع' },
            target.title
          );
        }
      });
    },
    [runMutation, appendActivity, projects, cvConfig]
  );

  const saveCompany = useCallback(
    async (company: Company, linkedExperienceIds?: string[]) => {
      await runMutation(async () => {
        const saved = await saveCompanyRecord(company, linkedExperienceIds);
        setCompanies((prev) => {
          const exists = prev.some((c) => c.id === saved.id);
          const list = exists
            ? prev.map((c) => (c.id === saved.id ? saved : c))
            : [...prev, saved];
          return list.sort((a, b) => a.displayOrder - b.displayOrder);
        });
        if (linkedExperienceIds) {
          setExperience((prev) =>
            prev.map((exp) => {
              if (linkedExperienceIds.includes(exp.id)) {
                return { ...exp, companyId: saved.id };
              }
              if (exp.companyId === saved.id) {
                const copy = { ...exp };
                delete copy.companyId;
                return copy;
              }
              return exp;
            })
          );
        }
        await appendActivity(
          'companies',
          { en: 'Saved company record', ar: 'تم حفظ سجل الشركة' },
          saved.name
        );
      });
    },
    [runMutation, appendActivity]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        const target = companies.find((c) => c.id === id);
        await deleteCompanyRecord(id);
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        setProjects((prev) =>
          prev.map((p) => {
            if (p.companyId !== id) return p;
            const copy = { ...p };
            delete copy.companyId;
            return copy;
          })
        );
        setExperience((prev) =>
          prev.map((e) => {
            if (e.companyId !== id) return e;
            const copy = { ...e };
            delete copy.companyId;
            return copy;
          })
        );
        if (target) {
          await appendActivity(
            'companies',
            { en: 'Deleted company record', ar: 'تم حذف سجل الشركة' },
            target.name
          );
        }
      });
    },
    [runMutation, appendActivity, companies]
  );

  const saveExperience = useCallback(
    async (item: ExperienceItem) => {
      await runMutation(async () => {
        const saved = await saveExperienceRecord(item);
        setExperience((prev) => {
          const exists = prev.some((e) => e.id === saved.id);
          const updated = exists
            ? prev.map((e) => (e.id === saved.id ? saved : e))
            : [...prev, saved];
          return updated.sort((a, b) => a.displayOrder - b.displayOrder);
        });
        await appendActivity(
          'experience',
          { en: 'Saved experience entry', ar: 'تم حفظ سجل الخبرة' },
          saved.role
        );
      });
    },
    [runMutation, appendActivity]
  );

  const deleteExperience = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        const target = experience.find((e) => e.id === id);
        await deleteExperienceRecord(id);
        setExperience((prev) => prev.filter((e) => e.id !== id));
        const nextCv: CvWorkspaceConfig = {
          ...cvConfig,
          selectedExperienceIds: cvConfig.selectedExperienceIds.filter(
            (eid) => eid !== id
          ),
        };
        if (
          nextCv.selectedExperienceIds.length !==
          cvConfig.selectedExperienceIds.length
        ) {
          const savedCv = await saveCvConfigRecord(nextCv);
          setCvConfig(savedCv);
        }
        if (target) {
          await appendActivity(
            'experience',
            { en: 'Deleted experience entry', ar: 'تم حذف سجل الخبرة' },
            target.role
          );
        }
      });
    },
    [runMutation, appendActivity, experience, cvConfig]
  );

  const reorderExperience = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const sorted = [...experience].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex((item) => item.id === id);
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;
      const a = sorted[index]!;
      const b = sorted[swapIndex]!;
      sorted[index] = b;
      sorted[swapIndex] = a;
      const reindexed = sorted.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1,
      }));
      setExperience(reindexed);
      await runMutation(async () => {
        await persistExperienceOrder(reindexed);
      });
    },
    [experience, runMutation]
  );

  const saveEducation = useCallback(
    async (item: EducationItem) => {
      await runMutation(async () => {
        const saved = await saveEducationRecord(item);
        setEducation((prev) => {
          const exists = prev.some((e) => e.id === saved.id);
          const list = exists
            ? prev.map((e) => (e.id === saved.id ? saved : e))
            : [...prev, saved];
          return list.sort((a, b) => a.displayOrder - b.displayOrder);
        });
        await appendActivity(
          'education',
          { en: 'Saved education record', ar: 'تم حفظ سجل التعليم' },
          saved.degree
        );
      });
    },
    [runMutation, appendActivity]
  );

  const deleteEducation = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        const target = education.find((e) => e.id === id);
        await deleteEducationRecord(id);
        setEducation((prev) => prev.filter((e) => e.id !== id));
        const nextCv: CvWorkspaceConfig = {
          ...cvConfig,
          selectedEducationIds: cvConfig.selectedEducationIds.filter(
            (eid) => eid !== id
          ),
        };
        if (
          nextCv.selectedEducationIds.length !==
          cvConfig.selectedEducationIds.length
        ) {
          const savedCv = await saveCvConfigRecord(nextCv);
          setCvConfig(savedCv);
        }
        if (target) {
          await appendActivity(
            'education',
            { en: 'Deleted education record', ar: 'تم حذف سجل التعليم' },
            target.degree
          );
        }
      });
    },
    [runMutation, appendActivity, education, cvConfig]
  );

  const saveSkillGroup = useCallback(
    async (group: SkillGroup) => {
      await runMutation(async () => {
        const saved = await saveSkillGroupRecord(group);
        setSkills((prev) => {
          const exists = prev.some((s) => s.id === saved.id);
          const updated = exists
            ? prev.map((s) => (s.id === saved.id ? saved : s))
            : [...prev, saved];
          return updated.sort((a, b) => a.displayOrder - b.displayOrder);
        });
        await appendActivity(
          'skills',
          { en: 'Saved skill group', ar: 'تم حفظ مجموعة المهارات' },
          saved.title
        );
      });
    },
    [runMutation, appendActivity]
  );

  const deleteSkillGroup = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        const target = skills.find((s) => s.id === id);
        await deleteSkillGroupRecord(id);
        setSkills((prev) => prev.filter((s) => s.id !== id));
        const nextCv: CvWorkspaceConfig = {
          ...cvConfig,
          selectedSkillGroupIds: cvConfig.selectedSkillGroupIds.filter(
            (sid) => sid !== id
          ),
        };
        if (
          nextCv.selectedSkillGroupIds.length !==
          cvConfig.selectedSkillGroupIds.length
        ) {
          const savedCv = await saveCvConfigRecord(nextCv);
          setCvConfig(savedCv);
        }
        if (target) {
          await appendActivity(
            'skills',
            { en: 'Deleted skill group', ar: 'تم حذف مجموعة المهارات' },
            target.title
          );
        }
      });
    },
    [runMutation, appendActivity, skills, cvConfig]
  );

  const reorderSkillGroup = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const sorted = [...skills].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex((item) => item.id === id);
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;
      const a = sorted[index]!;
      const b = sorted[swapIndex]!;
      sorted[index] = b;
      sorted[swapIndex] = a;
      const reindexed = sorted.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1,
      }));
      setSkills(reindexed);
      await runMutation(async () => {
        await persistSkillGroupOrder(reindexed);
      });
    },
    [skills, runMutation]
  );

  const toggleSkillGroupVisibility = useCallback(
    async (id: string) => {
      const target = skills.find((item) => item.id === id);
      if (!target) return;
      const next: SkillGroup = {
        ...target,
        isVisible: target.isVisible === false,
      };
      setSkills((prev) => prev.map((item) => (item.id === id ? next : item)));
      await runMutation(async () => {
        await saveSkillGroupRecord(next);
      });
    },
    [skills, runMutation]
  );

  const saveCertification = useCallback(
    async (cert: Certification) => {
      await runMutation(async () => {
        const saved = await saveCertificationRecord(cert);
        setCertifications((prev) => {
          const exists = prev.some((c) => c.id === saved.id);
          const list = exists
            ? prev.map((c) => (c.id === saved.id ? saved : c))
            : [...prev, saved];
          return list.sort((a, b) => a.displayOrder - b.displayOrder);
        });
        await appendActivity(
          'certifications',
          { en: 'Saved certification record', ar: 'تم حفظ سجل الشهادة' },
          saved.title
        );
      });
    },
    [runMutation, appendActivity]
  );

  const deleteCertification = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        const target = certifications.find((c) => c.id === id);
        await deleteCertificationRecord(id);
        setCertifications((prev) => prev.filter((c) => c.id !== id));
        const nextCv: CvWorkspaceConfig = {
          ...cvConfig,
          selectedCertificationIds: cvConfig.selectedCertificationIds.filter(
            (cid) => cid !== id
          ),
        };
        if (
          nextCv.selectedCertificationIds.length !==
          cvConfig.selectedCertificationIds.length
        ) {
          const savedCv = await saveCvConfigRecord(nextCv);
          setCvConfig(savedCv);
        }
        if (target) {
          await appendActivity(
            'certifications',
            { en: 'Deleted certification record', ar: 'تم حذف سجل الشهادة' },
            target.title
          );
        }
      });
    },
    [runMutation, appendActivity, certifications, cvConfig]
  );

  const uploadMedia = useCallback(
    async (file: File, category: MediaCategory): Promise<MediaAsset> => {
      return runMutation(async () => {
        const asset = await uploadMediaFile(file, category);
        setMedia((prev) => [asset, ...prev]);
        await appendActivity(
          'media',
          { en: 'Uploaded media asset to Storage', ar: 'تم رفع ملف وسائط إلى التخزين السحابي' },
          { en: asset.fileName, ar: asset.fileName }
        );
        return asset;
      });
    },
    [runMutation, appendActivity]
  );

  const deleteMedia = useCallback(
    async (id: string) => {
      const target = media.find((m) => m.id === id);
      if (!target) return;
      await runMutation(async () => {
        await deleteMediaAsset(target);
        setMedia((prev) => prev.filter((m) => m.id !== id));
        await appendActivity(
          'media',
          { en: 'Deleted media asset', ar: 'تم حذف ملف الوسائط' },
          { en: target.fileName, ar: target.fileName }
        );
      });
    },
    [media, runMutation, appendActivity]
  );

  const updateCvConfig = useCallback(
    async (next: CvWorkspaceConfig) => {
      await runMutation(async () => {
        const saved = await saveCvConfigRecord(next);
        setCvConfig(saved);
        await appendActivity(
          'cv',
          { en: 'Saved CV workspace structure', ar: 'تم حفظ هيكل السيرة الذاتية' },
          saved.targetRole
        );
      });
    },
    [runMutation, appendActivity]
  );

  const updateSiteSettings = useCallback(
    async (next: AdminSiteSettings) => {
      await runMutation(async () => {
        const saved = await saveSiteSettingsRecord(next);
        setSiteSettings(saved);
        await appendActivity(
          'settings',
          { en: 'Updated site settings', ar: 'تم تحديث إعدادات الموقع' },
          saved.siteName
        );
      });
    },
    [runMutation, appendActivity]
  );

  const value = useMemo<AdminDataContextValue>(
    () => ({
      profile,
      education,
      projects,
      companies,
      experience,
      skills,
      certifications,
      media,
      activities,
      cvConfig,
      siteSettings,
      isLoading,
      isSaving,
      lastError,
      clearError,
      updateProfile,
      saveProject,
      deleteProject,
      saveCompany,
      deleteCompany,
      saveExperience,
      deleteExperience,
      reorderExperience,
      saveEducation,
      deleteEducation,
      saveSkillGroup,
      deleteSkillGroup,
      reorderSkillGroup,
      toggleSkillGroupVisibility,
      saveCertification,
      deleteCertification,
      uploadMedia,
      deleteMedia,
      updateCvConfig,
      updateSiteSettings,
      reloadWorkspace,
    }),
    [
      profile,
      education,
      projects,
      companies,
      experience,
      skills,
      certifications,
      media,
      activities,
      cvConfig,
      siteSettings,
      isLoading,
      isSaving,
      lastError,
      clearError,
      updateProfile,
      saveProject,
      deleteProject,
      saveCompany,
      deleteCompany,
      saveExperience,
      deleteExperience,
      reorderExperience,
      saveEducation,
      deleteEducation,
      saveSkillGroup,
      deleteSkillGroup,
      reorderSkillGroup,
      toggleSkillGroupVisibility,
      saveCertification,
      deleteCertification,
      uploadMedia,
      deleteMedia,
      updateCvConfig,
      updateSiteSettings,
      reloadWorkspace,
    ]
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}
