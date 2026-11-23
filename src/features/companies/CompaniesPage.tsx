import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { PlaceholderNotice } from '@/components/common/PlaceholderNotice';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { COMPANIES } from '@/data';
import { CompanyCard } from './components/CompanyCard';

export function CompaniesPage() {
  const { t } = useTranslation(['pages', 'common']);
  useDocumentTitle(t('pages:companies.pageTitle'));

  return (
    <>
      <PageHeader
        eyebrow={t('pages:companies.eyebrow')}
        title={t('pages:companies.title')}
        subtitle={t('pages:companies.subtitle')}
      />

      <Section>
        <Container>
          <PlaceholderNotice text={t('pages:companies.placeholderBanner')} />

          <div className="grid gap-6 md:grid-cols-2">
            {COMPANIES.map((company) => (
              <CompanyCard key={company.id} company={company} detailed />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
