import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SectionMappingBadgeProps {
  location: string;
  sharedWith?: string[];
}

export function SectionMappingBadge({
  location,
  sharedWith,
}: SectionMappingBadgeProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border-default bg-bg-primary/70 px-3 py-1.5 text-[11px] text-text-secondary">
      <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
        <MapPin className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
        <span>{t('pageShell.appearsOn')}:</span>
        <span className="text-accent">{location}</span>
      </span>
      {sharedWith && sharedWith.length > 0 && (
        <span className="text-text-secondary">
          ({t('pageShell.alsoUsedOn')}: {sharedWith.join(', ')})
        </span>
      )}
    </div>
  );
}
