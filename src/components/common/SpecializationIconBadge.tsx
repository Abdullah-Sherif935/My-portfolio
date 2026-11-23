import { useState } from 'react';
import type { Specialization } from '@/types/portfolio';
import { getSpecializationLucideIcon } from '@/utils/specializationHelpers';
import { cn } from '@/utils/cn';

interface SpecializationIconBadgeProps {
  specialization: Pick<
    Specialization,
    'icon' | 'iconType' | 'customIconUrl'
  >;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Displays a specialization icon using strict priority:
 * 1. Uploaded custom image (when iconType === 'image' and customIconUrl loads cleanly)
 * 2. Selected library icon
 * 3. Default fallback icon (Cog)
 */
export function SpecializationIconBadge({
  specialization,
  size = 'md',
  className,
}: SpecializationIconBadgeProps) {
  const [imageErrorUrl, setImageErrorUrl] = useState<string | null>(null);
  const Icon = getSpecializationLucideIcon(specialization.icon);

  const customUrl = specialization.customIconUrl?.trim() || null;
  const shouldShowImage =
    specialization.iconType === 'image' &&
    Boolean(customUrl) &&
    imageErrorUrl !== customUrl;

  const containerSize =
    size === 'sm'
      ? 'h-10 w-10 p-2'
      : size === 'lg'
        ? 'h-14 w-14 p-2.5'
        : 'h-10 w-10 p-2 sm:h-12 sm:w-12 sm:p-2.5';

  const iconSize =
    size === 'sm'
      ? 'h-4 w-4'
      : size === 'lg'
        ? 'h-6 w-6'
        : 'h-4 w-4 sm:h-5 sm:w-5';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-accent-border bg-accent-subtle text-accent',
        containerSize,
        className
      )}
    >
      {shouldShowImage && customUrl ? (
        <img
          src={customUrl}
          alt=""
          aria-hidden="true"
          onError={() => setImageErrorUrl(customUrl)}
          className="h-full w-full object-contain"
        />
      ) : (
        <Icon className={iconSize} aria-hidden="true" />
      )}
    </div>
  );
}
