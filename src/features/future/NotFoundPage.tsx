import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  const { t } = useTranslation('common');
  useDocumentTitle(t('notFound.title'));

  return (
    <Section>
      <Container className="max-w-xl text-center">
        <Card className="space-y-4 p-10">
          <p className="font-mono text-xs font-semibold tracking-wider text-accent">
            {t('notFound.code')}
          </p>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('notFound.title')}
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            {t('notFound.description')}
          </p>
          <div className="pt-2">
            <ButtonLink to="/" variant="primary" size="md">
              {t('actions.backToHome')}
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
