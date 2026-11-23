import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AdminLoginPage() {
  const { t } = useTranslation('admin');
  useDocumentTitle(t('login.pageTitle'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPrototype, setRememberPrototype] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prototypeBlocked, setPrototypeBlocked] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};

    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = t('login.emailError');
    }
    if (password.length < 8) {
      nextErrors.password = t('login.passwordError');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setPrototypeBlocked(false);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setPrototypeBlocked(true);
    }, 350);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-bg-primary text-text-primary">
      <div
        aria-hidden="true"
        className="engineering-grid pointer-events-none absolute inset-0 opacity-70"
      />

      {/* Minimal Top Bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-border-default bg-nav-bg px-4 py-3 backdrop-blur-md sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          <span>{t('login.backToPortfolio')}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md space-y-6 p-6 shadow-elevated sm:p-8">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-border bg-accent-subtle text-accent">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <Badge variant="accent" mono>
              {t('login.eyebrow')}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {t('login.title')}
            </h1>
            <p className="text-sm leading-relaxed text-text-secondary">
              {t('login.subtitle')}
            </p>
          </div>

          <div className="rounded-xl border border-accent-border bg-accent-subtle p-3.5 text-xs leading-relaxed">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-semibold text-text-primary">
                  {t('login.prototypeAlertTitle')}
                </p>
                <p className="text-text-secondary">{t('login.prototypeAlertBody')}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-text-primary"
              >
                {t('login.emailLabel')}
              </label>
              <input
                id="admin-email"
                type="email"
                dir="ltr"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder={t('login.emailPlaceholder')}
                aria-invalid={Boolean(errors.email)}
                className="h-11 w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-accent focus:outline-none"
              />
              {errors.email && (
                <p role="alert" className="text-xs text-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-text-primary"
              >
                {t('login.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((p) => ({ ...p, password: undefined }));
                    }
                  }}
                  placeholder={t('login.passwordPlaceholder')}
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 w-full rounded-[10px] border border-border-default bg-bg-primary ps-3.5 pe-11 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? t('login.hidePassword') : t('login.showPassword')
                  }
                  className="absolute top-1/2 end-2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="text-xs text-error">
                  {errors.password}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={rememberPrototype}
                onChange={(e) => setRememberPrototype(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border-default accent-accent"
              />
              <span>{t('login.rememberLabel')}</span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? t('login.submitting') : t('login.submitButton')}
            </Button>
          </form>

          {prototypeBlocked && (
            <div
              role="status"
              className="space-y-3 rounded-xl border border-border-strong bg-bg-elevated p-4 text-xs leading-relaxed"
            >
              <p className="font-semibold text-text-primary">
                {t('login.prototypeResponseTitle')}
              </p>
              <p className="text-text-secondary">
                {t('login.prototypeResponseBody')}
              </p>
              <ButtonLink to="/admin" variant="secondary" size="sm" className="w-full">
                <span>{t('login.openPrototypeDashboard')}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </ButtonLink>
            </div>
          )}

          {!prototypeBlocked && (
            <div className="border-t border-border-default pt-4 text-center">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover"
              >
                <span>{t('login.openPrototypeDashboard')}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
