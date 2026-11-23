import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { ExperienceTimeline } from './components/ExperienceTimeline';

export function ExperiencePage() {
  const { t } = useTranslation('pages');
  const { experience } = usePortfolioData();
  useDocumentTitle(t('experience.pageTitle'));

  return (
    <>
      <PageHeader
        eyebrow={t('experience.eyebrow')}
        title={t('experience.title')}
        subtitle={t('experience.subtitle')}
      />

      <Section>
        <Container>
          <ExperienceTimeline items={experience} />
        </Container>
      </Section>
    </>
  );
}
