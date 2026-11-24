import { requireSupabase, supabase } from '@/lib/supabase';
import type {
  Certification,
  Company,
  EducationItem,
  ExperienceItem,
  LocalizedText,
  ProfileData,
  Project,
  ProjectAttachment,
  ProjectContribution,
  ProjectViewerConfig,
  SkillGroup,
  Specialization,
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
  mapSpecializationFromRow,
  mapSpecializationToRow,
  type ActivityLogRow,
  type CertificationRow,
  type CompanyRow,
  type CvWorkspaceConfigRow,
  type EducationRow,
  type ExperienceRow,
  type MediaAssetRow,
  type ProfileRow,
  type ProjectAttachmentRow,
  type ProjectCategoryLinkRow,
  type ProjectContributionRow,
  type ProjectRow,
  type SiteSettingsRow,
  type SkillGroupRow,
  type SpecializationProjectLinkRow,
  type SpecializationRow,
} from './mappers';

function groupProjectLinksBySpecialization(
  rows: SpecializationProjectLinkRow[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.specialization_id) ?? [];
    list.push(row.project_id);
    map.set(row.specialization_id, list);
  }
  return map;
}

function groupCategoryIdsByProject(
  rows: ProjectCategoryLinkRow[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.project_id) ?? [];
    list.push(row.category_id);
    map.set(row.project_id, list);
  }
  return map;
}

function groupContributionsByProject(
  rows: ProjectContributionRow[]
): Map<string, ProjectContribution[]> {
  const map = new Map<string, ProjectContribution[]>();
  for (const row of rows) {
    const list = map.get(row.project_id) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      description: row.description,
      displayOrder: row.display_order,
    });
    map.set(row.project_id, list);
  }
  return map;
}

function groupAttachmentsByProject(
  rows: ProjectAttachmentRow[]
): Map<string, ProjectAttachment[]> {
  const map = new Map<string, ProjectAttachment[]>();
  for (const row of rows) {
    const list = map.get(row.project_id) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      fileType: row.file_type,
      fileUrl: row.file_url,
      storagePath: row.storage_path,
      fileSizeLabel: row.file_size_label,
      downloadable: row.downloadable,
      displayOrder: row.display_order,
    });
    map.set(row.project_id, list);
  }
  return map;
}

export interface PublicPortfolioBundle {
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
    projectCatsRes,
    projectContribsRes,
    projectAttachRes,
    companiesRes,
    experienceRes,
    skillsRes,
    certificationsRes,
    specializationsRes,
    specLinksRes,
    settingsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('is_published', true).limit(1).maybeSingle(),
    supabase.from('education').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('projects').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('project_categories').select('*').order('display_order', { ascending: true }),
    supabase.from('project_contributions').select('*').order('display_order', { ascending: true }),
    supabase.from('project_attachments').select('*').order('display_order', { ascending: true }),
    supabase.from('companies').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('experience').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('skill_groups').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('certifications').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('specializations').select('*').eq('is_published', true).order('display_order', { ascending: true }),
    supabase.from('specialization_projects').select('*').order('display_order', { ascending: true }),
    supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
  ]);

  const firstError =
    profileRes.error ||
    educationRes.error ||
    projectsRes.error ||
    projectCatsRes.error ||
    projectContribsRes.error ||
    projectAttachRes.error ||
    companiesRes.error ||
    experienceRes.error ||
    skillsRes.error ||
    certificationsRes.error ||
    specializationsRes.error ||
    specLinksRes.error ||
    settingsRes.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const linkMap = groupProjectLinksBySpecialization(
    (specLinksRes.data ?? []) as SpecializationProjectLinkRow[]
  );
  const projCatMap = groupCategoryIdsByProject(
    (projectCatsRes.data ?? []) as ProjectCategoryLinkRow[]
  );
  const projContribMap = groupContributionsByProject(
    (projectContribsRes.data ?? []) as ProjectContributionRow[]
  );
  const projAttachMap = groupAttachmentsByProject(
    (projectAttachRes.data ?? []) as ProjectAttachmentRow[]
  );

  return {
    profile: profileRes.data ? mapProfileFromRow(profileRes.data as ProfileRow) : null,
    education: ((educationRes.data ?? []) as EducationRow[]).map(mapEducationFromRow),
    projects: ((projectsRes.data ?? []) as ProjectRow[]).map((row) =>
      mapProjectFromRow(row, {
        categoryIds: projCatMap.get(row.id) ?? [],
        contributions: projContribMap.get(row.id) ?? [],
        attachments: projAttachMap.get(row.id) ?? [],
      })
    ),
    companies: ((companiesRes.data ?? []) as CompanyRow[]).map(mapCompanyFromRow),
    experience: ((experienceRes.data ?? []) as ExperienceRow[]).map(mapExperienceFromRow),
    skills: ((skillsRes.data ?? []) as SkillGroupRow[]).map(mapSkillGroupFromRow),
    certifications: ((certificationsRes.data ?? []) as CertificationRow[]).map(
      mapCertificationFromRow
    ),
    specializations: ((specializationsRes.data ?? []) as SpecializationRow[]).map(
      (row) => mapSpecializationFromRow(row, linkMap.get(row.id) ?? [])
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
    projectCatsRes,
    projectContribsRes,
    projectAttachRes,
    companiesRes,
    experienceRes,
    skillsRes,
    certificationsRes,
    specializationsRes,
    specLinksRes,
    settingsRes,
    mediaRes,
    cvRes,
    activityRes,
  ] = await Promise.all([
    client.from('profiles').select('*').limit(1).maybeSingle(),
    client.from('education').select('*').order('display_order', { ascending: true }),
    client.from('projects').select('*').order('display_order', { ascending: true }),
    client.from('project_categories').select('*').order('display_order', { ascending: true }),
    client.from('project_contributions').select('*').order('display_order', { ascending: true }),
    client.from('project_attachments').select('*').order('display_order', { ascending: true }),
    client.from('companies').select('*').order('display_order', { ascending: true }),
    client.from('experience').select('*').order('display_order', { ascending: true }),
    client.from('skill_groups').select('*').order('display_order', { ascending: true }),
    client.from('certifications').select('*').order('display_order', { ascending: true }),
    client.from('specializations').select('*').order('display_order', { ascending: true }),
    client.from('specialization_projects').select('*').order('display_order', { ascending: true }),
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
    projectCatsRes.error ||
    projectContribsRes.error ||
    projectAttachRes.error ||
    companiesRes.error ||
    experienceRes.error ||
    skillsRes.error ||
    certificationsRes.error ||
    specializationsRes.error ||
    specLinksRes.error ||
    settingsRes.error ||
    mediaRes.error ||
    cvRes.error ||
    activityRes.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const linkMap = groupProjectLinksBySpecialization(
    (specLinksRes.data ?? []) as SpecializationProjectLinkRow[]
  );
  const projCatMap = groupCategoryIdsByProject(
    (projectCatsRes.data ?? []) as ProjectCategoryLinkRow[]
  );
  const projContribMap = groupContributionsByProject(
    (projectContribsRes.data ?? []) as ProjectContributionRow[]
  );
  const projAttachMap = groupAttachmentsByProject(
    (projectAttachRes.data ?? []) as ProjectAttachmentRow[]
  );

  return {
    profile: profileRes.data ? mapProfileFromRow(profileRes.data as ProfileRow) : null,
    education: ((educationRes.data ?? []) as EducationRow[]).map(mapEducationFromRow),
    projects: ((projectsRes.data ?? []) as ProjectRow[]).map((row) =>
      mapProjectFromRow(row, {
        categoryIds: projCatMap.get(row.id) ?? [],
        contributions: projContribMap.get(row.id) ?? [],
        attachments: projAttachMap.get(row.id) ?? [],
      })
    ),
    companies: ((companiesRes.data ?? []) as CompanyRow[]).map(mapCompanyFromRow),
    experience: ((experienceRes.data ?? []) as ExperienceRow[]).map(mapExperienceFromRow),
    skills: ((skillsRes.data ?? []) as SkillGroupRow[]).map(mapSkillGroupFromRow),
    certifications: ((certificationsRes.data ?? []) as CertificationRow[]).map(
      mapCertificationFromRow
    ),
    specializations: ((specializationsRes.data ?? []) as SpecializationRow[]).map(
      (row) => mapSpecializationFromRow(row, linkMap.get(row.id) ?? [])
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

  // 1. Sync multi-category assignments
  const dedupedCatIds = Array.from(
    new Set(
      (project.categoryIds && project.categoryIds.length > 0
        ? project.categoryIds
        : project.category
          ? [project.category]
          : []
      ).filter(Boolean)
    )
  );
  const { error: delCatsErr } = await client
    .from('project_categories')
    .delete()
    .eq('project_id', project.id);
  if (delCatsErr) throw new Error(delCatsErr.message);

  if (dedupedCatIds.length > 0) {
    const catRows: ProjectCategoryLinkRow[] = dedupedCatIds.map((catId, idx) => ({
      project_id: project.id,
      category_id: catId,
      display_order: idx + 1,
    }));
    const { error: insCatsErr } = await client
      .from('project_categories')
      .insert(catRows);
    if (insCatsErr) throw new Error(insCatsErr.message);
  }

  // 2. Sync structured contributions
  const contributions = (project.contributions ?? []).map((item, idx) => ({
    ...item,
    id: item.id || `contrib-${project.id}-${idx + 1}-${Date.now().toString(36)}`,
    displayOrder: idx + 1,
  }));
  const { error: delContribErr } = await client
    .from('project_contributions')
    .delete()
    .eq('project_id', project.id);
  if (delContribErr) throw new Error(delContribErr.message);

  if (contributions.length > 0) {
    const contribRows: ProjectContributionRow[] = contributions.map((c) => ({
      id: c.id,
      project_id: project.id,
      title: c.title,
      description: c.description,
      display_order: c.displayOrder,
    }));
    const { error: insContribErr } = await client
      .from('project_contributions')
      .insert(contribRows);
    if (insContribErr) throw new Error(insContribErr.message);
  }

  // 3. Sync attachments
  const attachments = (project.attachments ?? []).map((item, idx) => ({
    ...item,
    id: item.id || `att-${project.id}-${idx + 1}-${Date.now().toString(36)}`,
    displayOrder: idx + 1,
  }));
  const { error: delAttachErr } = await client
    .from('project_attachments')
    .delete()
    .eq('project_id', project.id);
  if (delAttachErr) throw new Error(delAttachErr.message);

  if (attachments.length > 0) {
    const attachRows: ProjectAttachmentRow[] = attachments.map((a) => ({
      id: a.id,
      project_id: project.id,
      title: a.title,
      file_type: a.fileType,
      file_url: a.fileUrl,
      storage_path: a.storagePath ?? null,
      file_size_label: a.fileSizeLabel ?? null,
      downloadable: a.downloadable !== false,
      display_order: a.displayOrder,
    }));
    const { error: insAttachErr } = await client
      .from('project_attachments')
      .insert(attachRows);
    if (insAttachErr) throw new Error(insAttachErr.message);
  }

  return mapProjectFromRow(data as ProjectRow, {
    categoryIds: dedupedCatIds,
    contributions,
    attachments,
  });
}

export async function persistProjectOrder(items: Project[]): Promise<void> {
  const client = requireSupabase();
  await Promise.all(
    items.map(async (item, idx) => {
      const { error } = await client
        .from('projects')
        .update({ display_order: item.displayOrder ?? idx + 1 })
        .eq('id', item.id);
      if (error) throw new Error(error.message);
    })
  );
}

const ALLOWED_GALLERY_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);
const MAX_GALLERY_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadProjectGalleryImage(
  file: File,
  projectId: string
): Promise<{ url: string; storagePath: string }> {
  if (!ALLOWED_GALLERY_MIMES.has(file.type)) {
    throw new Error('Only JPG, PNG, WebP, and SVG images are supported.');
  }
  if (file.size > MAX_GALLERY_BYTES) {
    throw new Error('Image size must be 5 MB or smaller.');
  }
  const client = requireSupabase();
  const ext =
    file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const safeId = projectId.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  const storagePath = `projects/${safeId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

  const { error } = await client.storage
    .from('portfolio-media')
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data } = client.storage.from('portfolio-media').getPublicUrl(storagePath);
  return { url: data.publicUrl, storagePath };
}

export async function deleteProjectGalleryAsset(storagePath: string): Promise<void> {
  if (!storagePath.trim()) return;
  const client = requireSupabase();
  const { error } = await client.storage
    .from('portfolio-media')
    .remove([storagePath]);
  if (error) throw new Error(error.message);
}

const ALLOWED_ATTACHMENT_EXTS = new Set([
  'pdf',
  'dxf',
  'dwg',
  'step',
  'stp',
  'iges',
  'igs',
  'zip',
  'docx',
  'xlsx',
  'txt',
]);
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25 MB

function formatBytesLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function uploadProjectAttachment(
  file: File,
  projectId: string
): Promise<{
  url: string;
  storagePath: string;
  fileType: string;
  fileSizeLabel: string;
}> {
  const ext =
    file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
  if (!ALLOWED_ATTACHMENT_EXTS.has(ext)) {
    throw new Error(
      'Supported attachment formats: PDF, DXF, DWG, STEP/STP, IGES, ZIP, DOCX, XLSX, TXT.'
    );
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error('Attachment size must be 25 MB or smaller.');
  }

  const client = requireSupabase();
  const safeId = projectId.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  const storagePath = `projects/${safeId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const contentType =
    ext === 'pdf'
      ? 'application/pdf'
      : ext === 'dxf'
        ? 'application/dxf'
        : ext === 'txt'
          ? 'text/plain'
          : ext === 'zip'
            ? 'application/zip'
            : file.type || 'application/octet-stream';

  const { error } = await client.storage
    .from('portfolio-attachments')
    .upload(storagePath, file, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data } = client.storage
    .from('portfolio-attachments')
    .getPublicUrl(storagePath);

  return {
    url: data.publicUrl,
    storagePath,
    fileType: ext.toUpperCase(),
    fileSizeLabel: formatBytesLabel(file.size),
  };
}

export async function deleteProjectAttachmentAsset(
  storagePath: string
): Promise<void> {
  if (!storagePath.trim()) return;
  const client = requireSupabase();
  const { error } = await client.storage
    .from('portfolio-attachments')
    .remove([storagePath]);
  if (error) throw new Error(error.message);
}

const DEFAULT_ISOLATED_VIEWER_ORIGIN =
  'https://abdullah-sherif-portfolio.vercel.app';
const MAX_VIEWER_HTML_BYTES = 50 * 1024 * 1024; // 50 MB

export function getIsolatedViewerBaseOrigin(): string {
  const configured = (import.meta.env.VITE_VIEWER_ORIGIN as string | undefined)?.trim();
  if (
    configured &&
    /^https:\/\/[^\s/]+$/i.test(configured) &&
    !configured.toLowerCase().includes('portfolio.eng-abdullah.work')
  ) {
    return configured.replace(/\/$/, '');
  }
  return DEFAULT_ISOLATED_VIEWER_ORIGIN;
}

export function buildIsolatedViewerUrl(storagePath: string): string {
  return `${getIsolatedViewerBaseOrigin()}/api/viewer?path=${encodeURIComponent(
    storagePath.trim()
  )}`;
}

export function resolveProjectViewerUrl(
  viewer?: ProjectViewerConfig | null
): string | null {
  if (!viewer || !viewer.enabled) return null;
  const mode =
    viewer.sourceMode ?? (viewer.storagePath ? 'upload' : 'external-url');
  if (mode === 'upload') {
    if (!viewer.storagePath?.trim()) return null;
    return buildIsolatedViewerUrl(viewer.storagePath);
  }
  const url = viewer.embedUrl?.trim() || '';
  return /^https:\/\/[^\s]+$/i.test(url) ? url : null;
}

export async function uploadProjectViewerHtml(
  file: File,
  projectId: string
): Promise<{
  storagePath: string;
  hostedUrl: string;
  fileName: string;
  fileSizeLabel: string;
}> {
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.html') && !lowerName.endsWith('.htm')) {
    throw new Error('Please upload a standalone .html eDrawings export file.');
  }
  if (file.size > MAX_VIEWER_HTML_BYTES) {
    throw new Error('Standalone HTML viewer file must be 50 MB or smaller.');
  }

  const client = requireSupabase();
  const safeId = projectId.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  const storagePath = `projects/${safeId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}.html`;

  const { error } = await client.storage
    .from('portfolio-3d-viewers')
    .upload(storagePath, file, {
      contentType: 'text/html',
      cacheControl: '3600',
      upsert: false,
    });
  if (error) throw new Error(error.message);

  return {
    storagePath,
    hostedUrl: buildIsolatedViewerUrl(storagePath),
    fileName: file.name,
    fileSizeLabel: formatBytesLabel(file.size),
  };
}

export async function deleteProjectViewerHtml(
  storagePath: string
): Promise<void> {
  if (!storagePath.trim()) return;
  const client = requireSupabase();
  const { error } = await client.storage
    .from('portfolio-3d-viewers')
    .remove([storagePath]);
  if (error) throw new Error(error.message);
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

export async function saveSpecializationRecord(
  spec: Specialization
): Promise<Specialization> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('specializations')
    .upsert(mapSpecializationToRow(spec), { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) {
    throw new Error(error?.message || 'Failed to save specialization.');
  }

  const dedupedIds = Array.from(new Set(spec.relatedProjectIds ?? []));
  const { error: deleteLinksError } = await client
    .from('specialization_projects')
    .delete()
    .eq('specialization_id', spec.id);
  if (deleteLinksError) {
    throw new Error(deleteLinksError.message);
  }

  if (dedupedIds.length > 0) {
    const linkRows: SpecializationProjectLinkRow[] = dedupedIds.map(
      (projectId, idx) => ({
        specialization_id: spec.id,
        project_id: projectId,
        display_order: idx + 1,
      })
    );
    const { error: insertLinksError } = await client
      .from('specialization_projects')
      .insert(linkRows);
    if (insertLinksError) {
      throw new Error(insertLinksError.message);
    }
  }

  return mapSpecializationFromRow(data as SpecializationRow, dedupedIds);
}

const ALLOWED_ICON_MIME_TYPES = new Set([
  'image/svg+xml',
  'image/png',
  'image/webp',
]);
const MAX_ICON_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function uploadSpecializationIcon(
  file: File,
  specializationId: string
): Promise<{ url: string; storagePath: string }> {
  if (!ALLOWED_ICON_MIME_TYPES.has(file.type)) {
    throw new Error('Only SVG, PNG, and WebP icon files are supported.');
  }
  if (file.size > MAX_ICON_SIZE_BYTES) {
    throw new Error('Icon file size must be 2 MB or smaller.');
  }

  const client = requireSupabase();
  const ext =
    file.type === 'image/svg+xml'
      ? 'svg'
      : file.type === 'image/webp'
        ? 'webp'
        : 'png';
  const safeId = specializationId.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  const storagePath = `specializations/${safeId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await client.storage
    .from('portfolio-media')
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = client.storage
    .from('portfolio-media')
    .getPublicUrl(storagePath);

  return {
    url: publicUrlData.publicUrl,
    storagePath,
  };
}

export async function deleteSpecializationIconAsset(
  storagePath: string
): Promise<void> {
  if (!storagePath.trim()) return;
  const client = requireSupabase();
  const { error } = await client.storage
    .from('portfolio-media')
    .remove([storagePath]);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteSpecializationRecord(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('specializations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function persistSpecializationOrder(
  items: Specialization[]
): Promise<void> {
  const client = requireSupabase();
  await Promise.all(
    items.map(async (item, idx) => {
      const { error } = await client
        .from('specializations')
        .update({ display_order: item.displayOrder ?? idx + 1 })
        .eq('id', item.id);
      if (error) throw new Error(error.message);
    })
  );
}
