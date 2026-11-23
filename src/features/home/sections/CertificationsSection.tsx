import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/animations/Reveal';
import { CertificationCard } from '@/features/certifications/components/CertificationCard';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function CertificationsSection() {
  const { t } = useTranslation(['home', 'common']);
  const { certifications, siteSettings } = usePortfolioData();

  if (!siteSettings.showCoursesSection) {
    return null;
  }

  return (
    <Section id="certifications" surface="secondary">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('home:certifications.eyebrow')}
            title={t('home:certifications.title')}
            subtitle={t('home:certifications.subtitle')}
            action={
              <ButtonLink to="/certifications" variant="outline" size="sm" className="sm:h-11 sm:px-5 sm:text-sm">
                <span>{t('common:actions.viewCertifications')}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </ButtonLink>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {certifications.map((cert) => (
              <CertificationCard key={cert.id} certification={cert} />
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
