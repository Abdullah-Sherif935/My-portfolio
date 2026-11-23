import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CERTIFICATIONS } from '@/data';
import { CertificationCard } from './components/CertificationCard';

export function CertificationsPage() {
  const { t } = useTranslation('pages');
  useDocumentTitle(t('certifications.pageTitle'));

  return (
    <>
      <PageHeader
        eyebrow={t('certifications.eyebrow')}
        title={t('certifications.title')}
        subtitle={t('certifications.subtitle')}
      />

      <Section>
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {CERTIFICATIONS.map((cert) => (
              <CertificationCard key={cert.id} certification={cert} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
