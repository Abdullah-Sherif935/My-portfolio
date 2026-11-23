import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { SkillGroupCard } from './components/SkillGroupCard';

export function SkillsPage() {
  const { t } = useTranslation('pages');
  const { skills } = usePortfolioData();
  useDocumentTitle(t('skills.pageTitle'));

  const visibleSkills = skills.filter((group) => group.isVisible !== false);

  return (
    <>
      <PageHeader
        eyebrow={t('skills.eyebrow')}
        title={t('skills.title')}
        subtitle={t('skills.subtitle')}
      />

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleSkills.map((group) => (
              <SkillGroupCard key={group.id} group={group} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
