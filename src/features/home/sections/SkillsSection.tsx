import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/animations/Reveal';
import { SkillGroupCard } from '@/features/skills/components/SkillGroupCard';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function SkillsSection() {
  const { t } = useTranslation(['home', 'common']);
  const { skills } = usePortfolioData();
  const visibleSkills = skills.filter((group) => group.isVisible !== false);

  return (
    <Section id="skills" surface="primary">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('home:skills.eyebrow')}
            title={t('home:skills.title')}
            subtitle={t('home:skills.subtitle')}
            action={
              <ButtonLink to="/skills" variant="outline" size="sm" className="sm:h-11 sm:px-5 sm:text-sm">
                <span>{t('common:actions.viewSkills')}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </ButtonLink>
            }
          />

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleSkills.map((group) => (
              <SkillGroupCard key={group.id} group={group} />
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
