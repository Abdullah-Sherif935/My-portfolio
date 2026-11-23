/**
 * Centralized initial data repository barrel.
 * Keeps all mock/CV-seeded records cleanly decoupled from UI components
 * so Phase 02+ can swap reads/writes to Supabase PostgreSQL without UI rewrites.
 */
export { PROFILE, EDUCATION_ITEMS } from './profile';
export { SPECIALIZATIONS } from './specializations';
export { COMPANIES } from './companies';
export { PROJECTS } from './projects';
export { EXPERIENCE_ITEMS } from './experience';
export { SKILL_GROUPS } from './skills';
export { CERTIFICATIONS } from './certifications';
export { FUTURE_MODULES } from './futureModules';
export {
  INITIAL_MEDIA_ASSETS,
  INITIAL_SAMPLE_ACTIVITIES,
  INITIAL_CV_CONFIG,
  INITIAL_SITE_SETTINGS,
} from './adminMock';
