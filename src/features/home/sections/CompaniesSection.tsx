import { ArrowRight, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/animations/Reveal';
import { CompanyCard } from '@/features/companies/components/CompanyCard';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function CompaniesSection() {
  const { t } = useTranslation(['home', 'common']);
  const { companies } = usePortfolioData();

  // Display detailed cards on the public Home page only for verified company records.
  // Editable unverified records remain accessible via the Companies directory for CMS curation.
  const verifiedCompanies = companies.filter(
    (company) => company.dataSource !== 'placeholder'
  );

  return (
    <Section id="companies" surface="secondary">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('home:companies.eyebrow')}
            title={t('home:companies.title')}
            subtitle={t('home:companies.subtitle')}
            action={
              <ButtonLink to="/companies" variant="outline" size="sm" className="sm:h-11 sm:px-5 sm:text-sm">
                <span>{t('common:actions.viewAllCompanies')}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </ButtonLink>
            }
          />

          {verifiedCompanies.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {verifiedCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <Card elevated className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent sm:h-11 sm:w-11">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-text-primary">
                      {t('home:companies.compactHeading')}
                    </h3>
                    <p className="max-w-2xl text-xs leading-relaxed text-text-secondary sm:text-sm">
                      {t('home:companies.compactDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Reveal>
      </Container>
    </Section>
  );
}
