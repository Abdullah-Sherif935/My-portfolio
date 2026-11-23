import {
  Activity,
  Bot,
  Box,
  CircuitBoard,
  Cog,
  Compass,
  Cpu,
  Factory,
  Flame,
  Gauge,
  Layers,
  Settings,
  Shield,
  Sliders,
  Thermometer,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type {
  LocalizedText,
  Project,
  Specialization,
  SpecializationIcon,
} from '@/types/portfolio';

export interface SpecializationIconOption {
  value: SpecializationIcon;
  label: LocalizedText;
  group: 'thermal-mechanical' | 'automation-electrical' | 'robotics-industrial';
  Icon: LucideIcon;
}

export const SPECIALIZATION_ICON_LIBRARY: SpecializationIconOption[] = [
  // Group 1: Thermal & Mechanical
  {
    value: 'wind',
    label: { en: 'Wind / HVAC', ar: 'هواء / تكييف' },
    group: 'thermal-mechanical',
    Icon: Wind,
  },
  {
    value: 'thermometer',
    label: { en: 'Thermometer / Thermal', ar: 'حرارة / تبريد' },
    group: 'thermal-mechanical',
    Icon: Thermometer,
  },
  {
    value: 'flame',
    label: { en: 'Flame / Energy', ar: 'طاقة حرارية' },
    group: 'thermal-mechanical',
    Icon: Flame,
  },
  {
    value: 'cog',
    label: { en: 'Cog / Mechanical', ar: 'ترس / ميكانيكا' },
    group: 'thermal-mechanical',
    Icon: Cog,
  },
  {
    value: 'wrench',
    label: { en: 'Wrench / Maintenance', ar: 'مفتاح / صيانة' },
    group: 'thermal-mechanical',
    Icon: Wrench,
  },
  {
    value: 'layers',
    label: { en: 'Layers / Sheet Metal', ar: 'طبقات / صاج' },
    group: 'thermal-mechanical',
    Icon: Layers,
  },

  // Group 2: Automation & Electrical
  {
    value: 'cpu',
    label: { en: 'CPU / PLC Control', ar: 'معالج / PLC' },
    group: 'automation-electrical',
    Icon: Cpu,
  },
  {
    value: 'circuit-board',
    label: { en: 'Circuit Board / Embedded', ar: 'دائرة / أنظمة مدمجة' },
    group: 'automation-electrical',
    Icon: CircuitBoard,
  },
  {
    value: 'zap',
    label: { en: 'Zap / Power & Drives', ar: 'طاقة / محركات' },
    group: 'automation-electrical',
    Icon: Zap,
  },
  {
    value: 'sliders',
    label: { en: 'Sliders / Instrumentation', ar: 'ضبط / أجهزة قياس' },
    group: 'automation-electrical',
    Icon: Sliders,
  },
  {
    value: 'gauge',
    label: { en: 'Gauge / Diagnostics', ar: 'مقياس / تشخيص' },
    group: 'automation-electrical',
    Icon: Gauge,
  },
  {
    value: 'activity',
    label: { en: 'Activity / Telemetry', ar: 'إشارة / مراقبة' },
    group: 'automation-electrical',
    Icon: Activity,
  },

  // Group 3: Robotics & Industrial
  {
    value: 'bot',
    label: { en: 'Bot / Robotics', ar: 'روبوتات' },
    group: 'robotics-industrial',
    Icon: Bot,
  },
  {
    value: 'factory',
    label: { en: 'Factory / Manufacturing', ar: 'مصنع / تصنيع' },
    group: 'robotics-industrial',
    Icon: Factory,
  },
  {
    value: 'settings',
    label: { en: 'Settings / Systems', ar: 'أنظمة صناعية' },
    group: 'robotics-industrial',
    Icon: Settings,
  },
  {
    value: 'shield',
    label: { en: 'Shield / Reliability', ar: 'أمان / موثوقية' },
    group: 'robotics-industrial',
    Icon: Shield,
  },
  {
    value: 'box',
    label: { en: 'Box / Enclosures & CAD', ar: 'حاويات / CAD' },
    group: 'robotics-industrial',
    Icon: Box,
  },
  {
    value: 'compass',
    label: { en: 'Compass / Engineering', ar: 'بوصلة / تصميم هندسي' },
    group: 'robotics-industrial',
    Icon: Compass,
  },
];

export const SPECIALIZATION_ICON_MAP: Record<SpecializationIcon, LucideIcon> =
  SPECIALIZATION_ICON_LIBRARY.reduce(
    (acc, item) => {
      acc[item.value] = item.Icon;
      return acc;
    },
    {} as Record<SpecializationIcon, LucideIcon>
  );

export function getSpecializationLucideIcon(
  icon?: string | null
): LucideIcon {
  if (icon && icon in SPECIALIZATION_ICON_MAP) {
    return SPECIALIZATION_ICON_MAP[icon as SpecializationIcon];
  }
  return Cog;
}

export interface DynamicPortfolioCategory {
  id: string;
  label: LocalizedText;
  publishedProjectCount: number;
  totalProjectCount: number;
}

/**
 * Single dynamic category source built from live specializations + actual
 * Portfolio project categories (preserving stable slugs and readable bilingual labels).
 */
export function resolvePortfolioCategories(
  specializations: Specialization[],
  projects: Project[]
): DynamicPortfolioCategory[] {
  const map = new Map<string, DynamicPortfolioCategory>();

  for (const spec of specializations) {
    const slug = (spec.filterCategory || spec.id).trim();
    if (!slug) continue;
    if (!map.has(slug)) {
      map.set(slug, {
        id: slug,
        label: spec.title,
        publishedProjectCount: 0,
        totalProjectCount: 0,
      });
    }
  }

  for (const project of projects) {
    const slug = (project.category || '').trim();
    if (!slug) continue;
    const existing = map.get(slug);
    const isPub = project.isPublished !== false;
    if (existing) {
      existing.totalProjectCount += 1;
      if (isPub) existing.publishedProjectCount += 1;
    } else {
      map.set(slug, {
        id: slug,
        label: project.categoryLabel,
        publishedProjectCount: isPub ? 1 : 0,
        totalProjectCount: 1,
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Resolves the published Portfolio projects linked to a specialization
 * according to its configured relationship mode:
 * - 'manual': strictly the manually selected published projects in exact order
 * - 'category' (default): published projects matching spec.filterCategory
 */
export function resolveSpecializationProjects(
  spec: Specialization,
  projects: Project[]
): Project[] {
  const publishedProjects = projects.filter((p) => p.isPublished !== false);
  const mode = spec.projectRelationMode === 'manual' ? 'manual' : 'category';

  if (mode === 'manual') {
    const ids = spec.relatedProjectIds ?? [];
    if (ids.length === 0) return [];
    const byId = new Map(publishedProjects.map((p) => [p.id, p]));
    return ids
      .map((id) => byId.get(id))
      .filter((p): p is Project => Boolean(p));
  }

  const category = (spec.filterCategory || '').trim();
  if (!category) return [];
  return publishedProjects.filter((p) => p.category === category);
}

/**
 * Returns the public Portfolio URL for a specialization's Related Projects link,
 * or null if zero published projects match (so no empty/broken links appear).
 */
export function getSpecializationProjectsHref(
  spec: Specialization,
  projects: Project[]
): string | null {
  const matched = resolveSpecializationProjects(spec, projects);
  if (matched.length === 0) {
    return null;
  }

  if (spec.projectRelationMode === 'manual') {
    return `/portfolio?specialization=${encodeURIComponent(spec.id)}`;
  }

  return `/portfolio?category=${encodeURIComponent(spec.filterCategory)}`;
}
