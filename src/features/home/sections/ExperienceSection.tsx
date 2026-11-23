import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/animations/Reveal';
import { ExperienceTimeline } from '@/features/experience/components/ExperienceTimeline';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function ExperienceSection() {
  const { t } = useTranslation(['home', 'common']);
  const { experience } = usePortfolioData();

  return (
    <Section id="experience" surface="primary">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('home:experience.eyebrow')}
            title={t('home:experience.title')}
            subtitle={t('home:experience.subtitle')}
            action={
              <ButtonLink to="/experience" variant="outline" size="sm" className="sm:h-11 sm:px-5 sm:text-sm">
                <span>{t('common:actions.viewExperience')}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </ButtonLink>
            }
          />

          <ExperienceTimeline items={experience} />
        </Reveal>
      </Container>
    </Section>
  );
}
