import {
  useCallback,
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
  INITIAL_SAMPLE_ACTIVITIES,
  INITIAL_SITE_SETTINGS,
  PROFILE,
  PROJECTS,
  SKILL_GROUPS,
} from '@/data';
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
} from '@/types/admin';
import {
  AdminDataContext,
  type AdminDataContextValue,
} from './useAdminData';

function cloneInitialState() {
  return {
    profile: structuredClone(PROFILE),
    education: structuredClone(EDUCATION_ITEMS),
    projects: structuredClone(PROJECTS),
    companies: structuredClone(COMPANIES),
    experience: structuredClone(EXPERIENCE_ITEMS),
    skills: structuredClone(SKILL_GROUPS),
    certifications: structuredClone(CERTIFICATIONS),
    media: structuredClone(INITIAL_MEDIA_ASSETS),
    activities: structuredClone(INITIAL_SAMPLE_ACTIVITIES),
    cvConfig: structuredClone(INITIAL_CV_CONFIG),
    siteSettings: structuredClone(INITIAL_SITE_SETTINGS),
  };
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(cloneInitialState);

  const [profile, setProfile] = useState<ProfileData>(initial.profile);
  const [education, setEducation] = useState<EducationItem[]>(initial.education);
  const [projects, setProjects] = useState<Project[]>(initial.projects);
  const [companies, setCompanies] = useState<Company[]>(initial.companies);
  const [experience, setExperience] = useState<ExperienceItem[]>(initial.experience);
  const [skills, setSkills] = useState<SkillGroup[]>(initial.skills);
  const [certifications, setCertifications] = useState<Certification[]>(initial.certifications);
  const [media, setMedia] = useState<MediaAsset[]>(initial.media);
  const [activities, setActivities] = useState<AdminActivityItem[]>(initial.activities);
  const [cvConfig, setCvConfig] = useState<CvWorkspaceConfig>(initial.cvConfig);
  const [siteSettings, setSiteSettings] = useState<AdminSiteSettings>(initial.siteSettings);

  const logSessionActivity = useCallback(
    (section: string, action: LocalizedText, target: LocalizedText) => {
      const entry: AdminActivityItem = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        action,
        target,
        section,
        timestampLabel: {
          en: 'In-memory session change',
          ar: 'تعديل داخل الجلسة الحالية',
        },
        isSample: false,
      };
      setActivities((prev) => [entry, ...prev].slice(0, 12));
    },
    []
  );

  const updateProfile = useCallback(
    (next: ProfileData) => {
      setProfile(next);
      logSessionActivity(
        'profile',
        { en: 'Updated profile record', ar: 'تم تحديث بيانات الملف الشخصي' },
        next.fullName
      );
    },
    [logSessionActivity]
  );

  const saveProject = useCallback(
    (project: Project) => {
      const stamped: Project = {
        ...project,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === stamped.id);
        return exists
          ? prev.map((p) => (p.id === stamped.id ? stamped : p))
          : [...prev, stamped];
      });
      logSessionActivity(
        'projects',
        { en: 'Saved project record', ar: 'تم حفظ سجل المشروع' },
        stamped.title
      );
    },
    [logSessionActivity]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const target = prev.find((p) => p.id === id);
        if (target) {
          logSessionActivity(
            'projects',
            { en: 'Removed project record', ar: 'تم حذف سجل المشروع' },
            target.title
          );
        }
        return prev.filter((p) => p.id !== id);
      });
      setCvConfig((prev) => ({
        ...prev,
        selectedProjectIds: prev.selectedProjectIds.filter((pid) => pid !== id),
      }));
    },
    [logSessionActivity]
  );

  const saveCompany = useCallback(
    (company: Company, linkedExperienceIds?: string[]) => {
      setCompanies((prev) => {
        const exists = prev.some((c) => c.id === company.id);
        return exists
          ? prev.map((c) => (c.id === company.id ? company : c))
          : [...prev, company];
      });
      if (linkedExperienceIds) {
        setExperience((prev) =>
          prev.map((exp) => {
            if (linkedExperienceIds.includes(exp.id)) {
              return { ...exp, companyId: company.id };
            }
            if (exp.companyId === company.id) {
              const copy = { ...exp };
              delete copy.companyId;
              return copy;
            }
            return exp;
          })
        );
      }
      logSessionActivity(
        'companies',
        { en: 'Saved company record', ar: 'تم حفظ سجل الشركة' },
        company.name
      );
    },
    [logSessionActivity]
  );

  const deleteCompany = useCallback(
    (id: string) => {
      setCompanies((prev) => {
        const target = prev.find((c) => c.id === id);
        if (target) {
          logSessionActivity(
            'companies',
            { en: 'Removed company record', ar: 'تم حذف سجل الشركة' },
            target.name
          );
        }
        return prev.filter((c) => c.id !== id);
      });
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
    },
    [logSessionActivity]
  );

  const saveExperience = useCallback(
    (item: ExperienceItem) => {
      setExperience((prev) => {
        const exists = prev.some((e) => e.id === item.id);
        const updated = exists
          ? prev.map((e) => (e.id === item.id ? item : e))
          : [...prev, item];
        return updated.sort((a, b) => a.displayOrder - b.displayOrder);
      });
      logSessionActivity(
        'experience',
        { en: 'Saved experience entry', ar: 'تم حفظ سجل الخبرة' },
        item.role
      );
    },
    [logSessionActivity]
  );

  const deleteExperience = useCallback(
    (id: string) => {
      setExperience((prev) => {
        const target = prev.find((e) => e.id === id);
        if (target) {
          logSessionActivity(
            'experience',
            { en: 'Removed experience entry', ar: 'تم حذف سجل الخبرة' },
            target.role
          );
        }
        return prev.filter((e) => e.id !== id);
      });
      setCvConfig((prev) => ({
        ...prev,
        selectedExperienceIds: prev.selectedExperienceIds.filter((eid) => eid !== id),
      }));
    },
    [logSessionActivity]
  );

  const reorderExperience = useCallback((id: string, direction: 'up' | 'down') => {
    setExperience((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex((item) => item.id === id);
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return prev;
      const a = sorted[index]!;
      const b = sorted[swapIndex]!;
      sorted[index] = b;
      sorted[swapIndex] = a;
      return sorted.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    });
  }, []);

  const saveEducation = useCallback(
    (item: EducationItem) => {
      setEducation((prev) => {
        const exists = prev.some((e) => e.id === item.id);
        return exists
          ? prev.map((e) => (e.id === item.id ? item : e))
          : [...prev, item];
      });
      logSessionActivity(
        'education',
        { en: 'Saved education record', ar: 'تم حفظ سجل التعليم' },
        item.degree
      );
    },
    [logSessionActivity]
  );

  const deleteEducation = useCallback(
    (id: string) => {
      setEducation((prev) => {
        const target = prev.find((e) => e.id === id);
        if (target) {
          logSessionActivity(
            'education',
            { en: 'Removed education record', ar: 'تم حذف سجل التعليم' },
            target.degree
          );
        }
        return prev.filter((e) => e.id !== id);
      });
      setCvConfig((prev) => ({
        ...prev,
        selectedEducationIds: prev.selectedEducationIds.filter((eid) => eid !== id),
      }));
    },
    [logSessionActivity]
  );

  const saveSkillGroup = useCallback(
    (group: SkillGroup) => {
      setSkills((prev) => {
        const exists = prev.some((s) => s.id === group.id);
        const updated = exists
          ? prev.map((s) => (s.id === group.id ? group : s))
          : [...prev, group];
        return updated.sort((a, b) => a.displayOrder - b.displayOrder);
      });
      logSessionActivity(
        'skills',
        { en: 'Saved skill group', ar: 'تم حفظ مجموعة المهارات' },
        group.title
      );
    },
    [logSessionActivity]
  );

  const deleteSkillGroup = useCallback(
    (id: string) => {
      setSkills((prev) => {
        const target = prev.find((s) => s.id === id);
        if (target) {
          logSessionActivity(
            'skills',
            { en: 'Removed skill group', ar: 'تم حذف مجموعة المهارات' },
            target.title
          );
        }
        return prev.filter((s) => s.id !== id);
      });
      setCvConfig((prev) => ({
        ...prev,
        selectedSkillGroupIds: prev.selectedSkillGroupIds.filter((sid) => sid !== id),
      }));
    },
    [logSessionActivity]
  );

  const reorderSkillGroup = useCallback((id: string, direction: 'up' | 'down') => {
    setSkills((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex((item) => item.id === id);
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return prev;
      const a = sorted[index]!;
      const b = sorted[swapIndex]!;
      sorted[index] = b;
      sorted[swapIndex] = a;
      return sorted.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    });
  }, []);

  const toggleSkillGroupVisibility = useCallback((id: string) => {
    setSkills((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isVisible: item.isVisible === false } : item
      )
    );
  }, []);

  const saveCertification = useCallback(
    (cert: Certification) => {
      setCertifications((prev) => {
        const exists = prev.some((c) => c.id === cert.id);
        return exists
          ? prev.map((c) => (c.id === cert.id ? cert : c))
          : [...prev, cert];
      });
      logSessionActivity(
        'certifications',
        { en: 'Saved certification record', ar: 'تم حفظ سجل الشهادة' },
        cert.title
      );
    },
    [logSessionActivity]
  );

  const deleteCertification = useCallback(
    (id: string) => {
      setCertifications((prev) => {
        const target = prev.find((c) => c.id === id);
        if (target) {
          logSessionActivity(
            'certifications',
            { en: 'Removed certification record', ar: 'تم حذف سجل الشهادة' },
            target.title
          );
        }
        return prev.filter((c) => c.id !== id);
      });
      setCvConfig((prev) => ({
        ...prev,
        selectedCertificationIds: prev.selectedCertificationIds.filter(
          (cid) => cid !== id
        ),
      }));
    },
    [logSessionActivity]
  );

  const addPreviewMedia = useCallback(
    (asset: MediaAsset) => {
      setMedia((prev) => [asset, ...prev]);
      logSessionActivity(
        'media',
        { en: 'Previewed local media file (in-memory)', ar: 'تمت معاينة ملف وسائط محلي (في الذاكرة)' },
        { en: asset.fileName, ar: asset.fileName }
      );
    },
    [logSessionActivity]
  );

  const deleteMedia = useCallback((id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateCvConfig = useCallback(
    (next: CvWorkspaceConfig) => {
      setCvConfig(next);
      logSessionActivity(
        'cv',
        { en: 'Updated CV workspace structure', ar: 'تم تحديث هيكل السيرة الذاتية' },
        next.targetRole
      );
    },
    [logSessionActivity]
  );

  const updateSiteSettings = useCallback(
    (next: AdminSiteSettings) => {
      setSiteSettings(next);
      logSessionActivity(
        'settings',
        { en: 'Updated prototype site settings', ar: 'تم تحديث إعدادات الموقع التوضيحية' },
        next.siteName
      );
    },
    [logSessionActivity]
  );

  const resetAllToInitial = useCallback(() => {
    const fresh = cloneInitialState();
    setProfile(fresh.profile);
    setEducation(fresh.education);
    setProjects(fresh.projects);
    setCompanies(fresh.companies);
    setExperience(fresh.experience);
    setSkills(fresh.skills);
    setCertifications(fresh.certifications);
    setMedia(fresh.media);
    setActivities(fresh.activities);
    setCvConfig(fresh.cvConfig);
    setSiteSettings(fresh.siteSettings);
  }, []);

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
      addPreviewMedia,
      deleteMedia,
      updateCvConfig,
      updateSiteSettings,
      resetAllToInitial,
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
      addPreviewMedia,
      deleteMedia,
      updateCvConfig,
      updateSiteSettings,
      resetAllToInitial,
    ]
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}
