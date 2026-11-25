import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import type { Project } from '@/types/portfolio';
import { ProjectThumbnail } from './ProjectThumbnail';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useTranslation('common');
  const { pick } = useLanguage();
  const { isLoading, isLive } = usePortfolioData();
  const showImageSkeleton = isLoading && !isLive && !project.coverImageUrl;

  return (
    <Card interactive className="group flex h-full flex-col overflow-hidden">
      <Link
        to={`/portfolio/${project.slug}`}
        className="block focus-visible:outline-none"
        aria-label={pick(project.title)}
      >
        {showImageSkeleton ? (
          <div className="aspect-[16/10] w-full animate-pulse border-b border-border-default bg-bg-secondary" />
        ) : (
          <ProjectThumbnail
            variant={project.coverVariant}
            code={project.code}
            imageUrl={project.coverImageUrl}
            imageAlt={
              project.coverImageAlt ? pick(project.coverImageAlt) : pick(project.title)
            }
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
          <Badge variant="accent">{pick(project.categoryLabel)}</Badge>
          <Badge variant="muted" mono>
            {pick(project.kindLabel)}
          </Badge>
        </div>

        <h3 className="mb-2 text-base font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent sm:mb-2.5 sm:text-[19px]">
          <Link to={`/portfolio/${project.slug}`}>{pick(project.title)}</Link>
        </h3>

        <p className="mb-4 flex-1 text-xs leading-relaxed text-text-secondary sm:mb-5 sm:text-sm">
          {pick(project.shortDescription)}
        </p>

        <div className="border-t border-border-default pt-3 sm:pt-4">
          <Link
            to={`/portfolio/${project.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover sm:text-sm"
          >
            <span>{t('actions.viewProject')}</span>
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
