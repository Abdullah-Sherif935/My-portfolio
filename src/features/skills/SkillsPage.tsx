import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { SKILL_GROUPS } from '@/data';
import { SkillGroupCard } from './components/SkillGroupCard';

export function SkillsPage() {
  const { t } = useTranslation('pages');
  useDocumentTitle(t('skills.pageTitle'));

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
            {SKILL_GROUPS.map((group) => (
              <SkillGroupCard key={group.id} group={group} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
