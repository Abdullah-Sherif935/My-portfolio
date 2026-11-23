import { requireSupabase, supabase } from '@/lib/supabase';
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
  mapActivityFromRow,
  mapCertificationFromRow,
  mapCertificationToRow,
  mapCompanyFromRow,
  mapCompanyToRow,
  mapCvConfigFromRow,
  mapCvConfigToRow,
  mapEducationFromRow,
  mapEducationToRow,
  mapExperienceFromRow,
  mapExperienceToRow,
  mapMediaFromRow,
  mapProfileFromRow,
  mapProfileToRow,
  mapProjectFromRow,
  mapProjectToRow,
  mapSiteSettingsFromRow,
  mapSiteSettingsToRow,
  mapSkillGroupFromRow,
  mapSkillGroupToRow,
  type ActivityLogRow,
  type CertificationRow,
  type CompanyRow,
  type CvWorkspaceConfigRow,
  type EducationRow,
  type ExperienceRow,
  type MediaAssetRow,
  type ProfileRow,
  type ProjectRow,
  type SiteSettingsRow,
  type SkillGroupRow,
} from './mappers';

export interface PublicPortfolioBundle {
  profile: ProfileData | null;
  education: EducationItem[];
  projects: Project[];
  companies: Company[];
  experience: ExperienceItem[];
  skills: SkillGroup[];
  certifications: Certification[];
  siteSettings: AdminSiteSettings | null;
}

export interface AdminWorkspaceBundle extends PublicPortfolioBundle {
  media: MediaAsset[];
  cvConfig: CvWorkspaceConfig | null;
  activities: AdminActivityItem[];
}

/**
 * Fetches all published public portfolio content in parallel.
 * Uses anon/authenticated RLS policies automatically.
 */
export async function fetchPublicPortfolioBundle(): Promise<PublicPortfolioBundle | null> {
  if (!supabase) return null;

  const [
    profileRes,
    educationRes,
    projectsRes,
    companiesRes,
    experienceRes,
    skillsRes,
    certificationsRes,
    settingsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('is_published', true).limit(1).maybeSingle(),
    supabase.from('education').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('projects').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('companies').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('experience').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('skill_groups').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('certifications').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
  ]);

  const firstError =
    profileRes.error ||
    educationRes.error ||
    projectsRes.error ||
    companiesRes.error ||
    experienceRes.error ||
    skillsRes.error ||
    certificationsRes.error ||
    settingsRes.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    profile: profileRes.data ? mapProfileFromRow(profileRes.data as ProfileRow) : null,
    education: ((educationRes.data ?? []) as EducationRow[]).map(mapEducationFromRow),
    projects: ((projectsRes.data ?? []) as ProjectRow[]).map(mapProjectFromRow),
    companies: ((companiesRes.data ?? []) as CompanyRow[]).map(mapCompanyFromRow),
    experience: ((experienceRes.data ?? []) as ExperienceRow[]).map(mapExperienceFromRow),
    skills: ((skillsRes.data ?? []) as SkillGroupRow[]).map(mapSkillGroupFromRow),
    certifications: ((certificationsRes.data ?? []) as CertificationRow[]).map(
      mapCertificationFromRow
    ),
    siteSettings: settingsRes.data
      ? mapSiteSettingsFromRow(settingsRes.data as SiteSettingsRow)
      : null,
  };
}

/**
 * Fetches full admin CMS workspace state (requires authenticated admin session).
 */
export async function fetchAdminWorkspaceBundle(): Promise<AdminWorkspaceBundle> {
  const client = requireSupabase();

  const [
    profileRes,
    educationRes,
    projectsRes,
    companiesRes,
    experienceRes,
    skillsRes,
    certificationsRes,
    settingsRes,
    mediaRes,
    cvRes,
    activityRes,
  ] = await Promise.all([
    client.from('profiles').select('*').limit(1).maybeSingle(),
    client.from('education').select('*').order('display_order', { ascending: true }),
    client.from('projects').select('*').order('display_order', { ascending: true }),
    client.from('companies').select('*').order('display_order', { ascending: true }),
    client.from('experience').select('*').order('display_order', { ascending: true }),
    client.from('skill_groups').select('*').order('display_order', { ascending: true }),
    client.from('certifications').select('*').order('display_order', { ascending: true }),
    client.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
    client.from('media_assets').select('*').order('created_at', { ascending: false }),
    client.from('cv_workspace_config').select('*').eq('id', 'default').maybeSingle(),
    client
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const firstError =
    profileRes.error ||
    educationRes.error ||
    projectsRes.error ||
    companiesRes.error ||
    experienceRes.error ||
    skillsRes.error ||
    certificationsRes.error ||
    settingsRes.error ||
    mediaRes.error ||
    cvRes.error ||
    activityRes.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    profile: profileRes.data ? mapProfileFromRow(profileRes.data as ProfileRow) : null,
    education: ((educationRes.data ?? []) as EducationRow[]).map(mapEducationFromRow),
    projects: ((projectsRes.data ?? []) as ProjectRow[]).map(mapProjectFromRow),
    companies: ((companiesRes.data ?? []) as CompanyRow[]).map(mapCompanyFromRow),
    experience: ((experienceRes.data ?? []) as ExperienceRow[]).map(mapExperienceFromRow),
    skills: ((skillsRes.data ?? []) as SkillGroupRow[]).map(mapSkillGroupFromRow),
    certifications: ((certificationsRes.data ?? []) as CertificationRow[]).map(
      mapCertificationFromRow
    ),
    siteSettings: settingsRes.data
      ? mapSiteSettingsFromRow(settingsRes.data as SiteSettingsRow)
      : null,
    media: ((mediaRes.data ?? []) as MediaAssetRow[]).map(mapMediaFromRow),
    cvConfig: cvRes.data ? mapCvConfigFromRow(cvRes.data as CvWorkspaceConfigRow) : null,
    activities: ((activityRes.data ?? []) as ActivityLogRow[]).map(mapActivityFromRow),
  };
}

// ============================================================================
// Admin CRUD Mutations
// ============================================================================

export async function recordAdminActivity(
  section: string,
  action: LocalizedText,
  target: LocalizedText
): Promise<AdminActivityItem> {
  const client = requireSupabase();
  const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await client
    .from('admin_activity_log')
    .insert({ id, section, action, target })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to log activity.');
  }
  return mapActivityFromRow(data as ActivityLogRow);
}

export async function saveProfileRecord(profile: ProfileData): Promise<ProfileData> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .upsert(mapProfileToRow(profile), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save profile.');
  return mapProfileFromRow(data as ProfileRow);
}

export async function saveProjectRecord(project: Project): Promise<Project> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('projects')
    .upsert(mapProjectToRow(project), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save project.');
  return mapProjectFromRow(data as ProjectRow);
}

export async function deleteProjectRecord(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function saveCompanyRecord(
  company: Company,
  linkedExperienceIds?: string[]
): Promise<Company> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('companies')
    .upsert(mapCompanyToRow(company), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save company.');

  if (linkedExperienceIds) {
    // Clear previous links to this company, then apply the selected links
    const { error: clearErr } = await client
      .from('experience')
      .update({ company_id: null })
      .eq('company_id', company.id);
    if (clearErr) throw new Error(clearErr.message);

    if (linkedExperienceIds.length > 0) {
      const { error: linkErr } = await client
        .from('experience')
        .update({ company_id: company.id })
        .in('id', linkedExperienceIds);
      if (linkErr) throw new Error(linkErr.message);
    }
  }

  return mapCompanyFromRow(data as CompanyRow);
}

export async function deleteCompanyRecord(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('companies').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function saveExperienceRecord(item: ExperienceItem): Promise<ExperienceItem> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('experience')
    .upsert(mapExperienceToRow(item), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save experience.');
  return mapExperienceFromRow(data as ExperienceRow);
}

export async function deleteExperienceRecord(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('experience').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function persistExperienceOrder(items: ExperienceItem[]): Promise<void> {
  const client = requireSupabase();
  await Promise.all(
    items.map(async (item) => {
      const { error } = await client
        .from('experience')
        .update({ display_order: item.displayOrder })
        .eq('id', item.id);
      if (error) throw new Error(error.message);
    })
  );
}

export async function saveEducationRecord(item: EducationItem): Promise<EducationItem> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('education')
    .upsert(mapEducationToRow(item), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save education.');
  return mapEducationFromRow(data as EducationRow);
}

export async function deleteEducationRecord(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('education').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function saveSkillGroupRecord(group: SkillGroup): Promise<SkillGroup> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('skill_groups')
    .upsert(mapSkillGroupToRow(group), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save skill group.');
  return mapSkillGroupFromRow(data as SkillGroupRow);
}

export async function deleteSkillGroupRecord(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('skill_groups').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function persistSkillGroupOrder(items: SkillGroup[]): Promise<void> {
  const client = requireSupabase();
  await Promise.all(
    items.map(async (item) => {
      const { error } = await client
        .from('skill_groups')
        .update({ display_order: item.displayOrder })
        .eq('id', item.id);
      if (error) throw new Error(error.message);
    })
  );
}

export async function saveCertificationRecord(cert: Certification): Promise<Certification> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('certifications')
    .upsert(mapCertificationToRow(cert), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save certification.');
  return mapCertificationFromRow(data as CertificationRow);
}

export async function deleteCertificationRecord(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('certifications').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function saveCvConfigRecord(
  config: CvWorkspaceConfig
): Promise<CvWorkspaceConfig> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('cv_workspace_config')
    .upsert(mapCvConfigToRow(config), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save CV configuration.');
  return mapCvConfigFromRow(data as CvWorkspaceConfigRow);
}

export async function saveSiteSettingsRecord(
  settings: AdminSiteSettings
): Promise<AdminSiteSettings> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('site_settings')
    .upsert(mapSiteSettingsToRow(settings), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Failed to save site settings.');
  return mapSiteSettingsFromRow(data as SiteSettingsRow);
}
