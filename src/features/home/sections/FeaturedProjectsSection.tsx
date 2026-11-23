import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/animations/Reveal';
import { ProjectCard } from '@/features/portfolio/components/ProjectCard';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function FeaturedProjectsSection() {
  const { t } = useTranslation(['home', 'common']);
  const { projects } = usePortfolioData();
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <Section id="featured-projects" surface="secondary">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('home:projects.eyebrow')}
            title={t('home:projects.title')}
            subtitle={t('home:projects.subtitle')}
            action={
              <ButtonLink to="/portfolio" variant="outline" size="sm" className="sm:h-11 sm:px-5 sm:text-sm">
                <span>{t('common:actions.viewAllProjects')}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </ButtonLink>
            }
          />

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
