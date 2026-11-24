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
  SPECIALIZATIONS,
} from '@/data';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import {
  deleteCertificationRecord,
  deleteCertificateFileAsset,
  deleteCompanyRecord,
  deleteEducationRecord,
  deleteExperienceRecord,
  deleteProjectRecord,
  deleteSkillGroupRecord,
  deleteSpecializationRecord,
  fetchAdminWorkspaceBundle,
  persistCertificationOrder,
  persistEducationOrder,
  persistExperienceOrder,
  persistProjectOrder,
  persistSkillGroupOrder,
  persistSpecializationOrder,
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
  saveSpecializationRecord,
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
  Specialization,
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
  const [specializations, setSpecializations] =
    useState<Specialization[]>(SPECIALIZATIONS);
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
      setSpecializations(bundle.specializations);
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

  const reorderProject = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const sorted = [...projects].sort((a, b) => a.displayOrder - b.displayOrder);
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
      setProjects(reindexed);
      await runMutation(async () => {
        await persistProjectOrder(reindexed);
      });
    },
    [projects, runMutation]
  );

  const toggleProjectPublished = useCallback(
    async (id: string) => {
      const target = projects.find((p) => p.id === id);
      if (!target) return;
      const updated: Project = {
        ...target,
        isPublished: target.isPublished === false,
      };
      await runMutation(async () => {
        const saved = await saveProjectRecord(updated);
        setProjects((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        await appendActivity(
          'projects',
          saved.isPublished !== false
            ? { en: 'Published project', ar: 'تم نشر المشروع' }
            : { en: 'Unpublished project (Draft)', ar: 'تم إخفاء المشروع (مسودة)' },
          saved.title
        );
      });
    },
    [projects, runMutation, appendActivity]
  );

  const duplicateProject = useCallback(
    async (id: string) => {
      const target = projects.find((p) => p.id === id);
      if (!target) return;
      const stamp = Date.now().toString(36);
      const copy: Project = {
        ...structuredClone(target),
        id: `proj-${stamp}`,
        slug: `${target.slug}-copy-${stamp.slice(-4)}`,
        code: `${target.code}-CPY`,
        title: {
          en: `${target.title.en} (Copy)`,
          ar: `${target.title.ar} (نسخة)`,
        },
        featured: false,
        isPublished: false,
        displayOrder: projects.length + 1,
        dataSource: 'cms',
        contributions: (target.contributions ?? []).map((c, idx) => ({
          ...c,
          id: `contrib-${stamp}-${idx + 1}`,
        })),
        attachments: (target.attachments ?? []).map((a, idx) => ({
          ...a,
          id: `att-${stamp}-${idx + 1}`,
          storagePath: null,
        })),
      };
      await runMutation(async () => {
        const saved = await saveProjectRecord(copy);
        setProjects((prev) =>
          [...prev, saved].sort((a, b) => a.displayOrder - b.displayOrder)
        );
        await appendActivity(
          'projects',
          { en: 'Duplicated project as draft', ar: 'تم نسخ المشروع كمسودة' },
          saved.title
        );
      });
    },
    [projects, runMutation, appendActivity]
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

  const toggleExperiencePublished = useCallback(
    async (id: string) => {
      const target = experience.find((item) => item.id === id);
      if (!target) return;
      const next: ExperienceItem = {
        ...target,
        isPublished: target.isPublished === false,
      };
      await runMutation(async () => {
        const saved = await saveExperienceRecord(next);
        setExperience((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
        await appendActivity(
          'experience',
          saved.isPublished !== false
            ? { en: 'Published experience entry', ar: 'تم نشر سجل الخبرة' }
            : { en: 'Unpublished experience entry (draft)', ar: 'تم تحويل سجل الخبرة لمسودة' },
          saved.role
        );
      });
    },
    [experience, runMutation, appendActivity]
  );

  const duplicateExperience = useCallback(
    async (id: string) => {
      const target = experience.find((item) => item.id === id);
      if (!target) return;
      const copy: ExperienceItem = {
        ...structuredClone(target),
        id: `exp-${Date.now()}`,
        role: {
          en: `${target.role.en} (Copy)`,
          ar: `${target.role.ar} (نسخة)`,
        },
        isPublished: false,
        dataSource: 'cms',
        displayOrder: experience.length + 1,
      };
      await runMutation(async () => {
        const saved = await saveExperienceRecord(copy);
        setExperience((prev) =>
          [...prev, saved].sort((a, b) => a.displayOrder - b.displayOrder)
        );
        await appendActivity(
          'experience',
          { en: 'Duplicated experience as draft', ar: 'تم نسخ سجل الخبرة كمسودة' },
          saved.role
        );
      });
    },
    [experience, runMutation, appendActivity]
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

  const reorderEducation = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const sorted = [...education].sort((a, b) => a.displayOrder - b.displayOrder);
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
      setEducation(reindexed);
      await runMutation(async () => {
        await persistEducationOrder(reindexed);
      });
    },
    [education, runMutation]
  );

  const toggleEducationPublished = useCallback(
    async (id: string) => {
      const target = education.find((item) => item.id === id);
      if (!target) return;
      const next: EducationItem = {
        ...target,
        isPublished: target.isPublished === false,
      };
      await runMutation(async () => {
        const saved = await saveEducationRecord(next);
        setEducation((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
        await appendActivity(
          'education',
          saved.isPublished !== false
            ? { en: 'Published academic record', ar: 'تم نشر السجل الأكاديمي' }
            : { en: 'Unpublished academic record (draft)', ar: 'تم تحويل السجل الأكاديمي لمسودة' },
          saved.degree
        );
      });
    },
    [education, runMutation, appendActivity]
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
        if (target?.certificateStoragePath) {
          await deleteCertificateFileAsset(target.certificateStoragePath).catch(
            () => undefined
          );
        }
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

  const reorderCertification = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const sorted = [...certifications].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
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
      setCertifications(reindexed);
      await runMutation(async () => {
        await persistCertificationOrder(reindexed);
      });
    },
    [certifications, runMutation]
  );

  const toggleCertificationPublished = useCallback(
    async (id: string) => {
      const target = certifications.find((item) => item.id === id);
      if (!target) return;
      const next: Certification = {
        ...target,
        isPublished: target.isPublished === false,
      };
      await runMutation(async () => {
        const saved = await saveCertificationRecord(next);
        setCertifications((prev) =>
          prev.map((c) => (c.id === saved.id ? saved : c))
        );
        await appendActivity(
          'certifications',
          saved.isPublished !== false
            ? { en: 'Published course / certificate', ar: 'تم نشر الدورة / الشهادة' }
            : { en: 'Unpublished course / certificate', ar: 'تم تحويل الدورة / الشهادة لمسودة' },
          saved.title
        );
      });
    },
    [certifications, runMutation, appendActivity]
  );

  const duplicateCertification = useCallback(
    async (id: string) => {
      const target = certifications.find((item) => item.id === id);
      if (!target) return;
      const copy: Certification = {
        ...structuredClone(target),
        id: `course-${Date.now()}`,
        title: {
          en: `${target.title.en} (Copy)`,
          ar: `${target.title.ar} (نسخة)`,
        },
        certificateStoragePath: null,
        isPublished: false,
        dataSource: 'cms',
        displayOrder: certifications.length + 1,
      };
      await runMutation(async () => {
        const saved = await saveCertificationRecord(copy);
        setCertifications((prev) =>
          [...prev, saved].sort((a, b) => a.displayOrder - b.displayOrder)
        );
        await appendActivity(
          'certifications',
          { en: 'Duplicated course as draft', ar: 'تم نسخ الدورة كمسودة' },
          saved.title
        );
      });
    },
    [certifications, runMutation, appendActivity]
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

  const saveSpecialization = useCallback(
    async (spec: Specialization) => {
      await runMutation(async () => {
        const saved = await saveSpecializationRecord(spec);
        setSpecializations((prev) => {
          const exists = prev.some((s) => s.id === saved.id);
          const list = exists
            ? prev.map((s) => (s.id === saved.id ? saved : s))
            : [...prev, saved];
          return list.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
        });
        await appendActivity(
          'specializations',
          { en: 'Saved specialization', ar: 'تم حفظ التخصص الهندسي' },
          saved.title
        );
      });
    },
    [runMutation, appendActivity]
  );

  const deleteSpecialization = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        const target = specializations.find((s) => s.id === id);
        await deleteSpecializationRecord(id);
        setSpecializations((prev) => prev.filter((s) => s.id !== id));
        if (target) {
          await appendActivity(
            'specializations',
            { en: 'Deleted specialization', ar: 'تم حذف التخصص الهندسي' },
            target.title
          );
        }
      });
    },
    [runMutation, appendActivity, specializations]
  );

  const reorderSpecialization = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const sorted = [...specializations].sort(
        (a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99)
      );
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
      setSpecializations(reindexed);
      await runMutation(async () => {
        await persistSpecializationOrder(reindexed);
      });
    },
    [specializations, runMutation]
  );

  const toggleSpecializationPublished = useCallback(
    async (id: string) => {
      const target = specializations.find((item) => item.id === id);
      if (!target) return;
      const next: Specialization = {
        ...target,
        isPublished: target.isPublished === false,
      };
      setSpecializations((prev) =>
        prev.map((item) => (item.id === id ? next : item))
      );
      await runMutation(async () => {
        await saveSpecializationRecord(next);
      });
    },
    [specializations, runMutation]
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
      specializations,
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
      reorderProject,
      toggleProjectPublished,
      duplicateProject,
      saveCompany,
      deleteCompany,
      saveExperience,
      deleteExperience,
      reorderExperience,
      toggleExperiencePublished,
      duplicateExperience,
      saveEducation,
      deleteEducation,
      reorderEducation,
      toggleEducationPublished,
      saveSkillGroup,
      deleteSkillGroup,
      reorderSkillGroup,
      toggleSkillGroupVisibility,
      saveCertification,
      deleteCertification,
      reorderCertification,
      toggleCertificationPublished,
      duplicateCertification,
      saveSpecialization,
      deleteSpecialization,
      reorderSpecialization,
      toggleSpecializationPublished,
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
      specializations,
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
      reorderProject,
      toggleProjectPublished,
      duplicateProject,
      saveCompany,
      deleteCompany,
      saveExperience,
      deleteExperience,
      reorderExperience,
      toggleExperiencePublished,
      duplicateExperience,
      saveEducation,
      deleteEducation,
      reorderEducation,
      toggleEducationPublished,
      saveSkillGroup,
      deleteSkillGroup,
      reorderSkillGroup,
      toggleSkillGroupVisibility,
      saveCertification,
      deleteCertification,
      reorderCertification,
      toggleCertificationPublished,
      duplicateCertification,
      saveSpecialization,
      deleteSpecialization,
      reorderSpecialization,
      toggleSpecializationPublished,
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
