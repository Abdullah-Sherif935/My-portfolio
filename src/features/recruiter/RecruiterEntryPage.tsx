import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileText,
  Globe,
  Info,
  Layers,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import {
  RECRUITER_POSITIONS,
  RECRUITER_SKILL_FILTERS,
  isValidPositionId,
} from '@/services/recruiterMatcher';
import type { Language } from '@/types/portfolio';
import type { RecruiterPositionId } from '@/types/recruiter';
import { cn } from '@/utils/cn';

export const CUSTOM_JD_STORAGE_KEY = 'recruiter_custom_jd_v1';

function readStoredCustomJd(urlJd: string | null): string {
  if (urlJd) return urlJd;
  try {
    return window.sessionStorage.getItem(CUSTOM_JD_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function RecruiterEntryPage() {
  const { t } = useTranslation(['recruiter', 'common']);
  const { pick, language } = useLanguage();
  const { siteSettings } = usePortfolioData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useDocumentTitle(t('recruiter:meta.entryTitle'));

  const initialRoleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<RecruiterPositionId>(
    isValidPositionId(initialRoleParam) ? initialRoleParam : 'hvac-design'
  );
  const [customTitle, setCustomTitle] = useState<string>(
    searchParams.get('custom') ?? ''
  );
  const [customDescription, setCustomDescription] = useState<string>(() =>
    readStoredCustomJd(searchParams.get('jd'))
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    const raw = searchParams.get('skills');
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((id) => RECRUITER_SKILL_FILTERS.some((opt) => opt.id === id));
  });
  const [cvLang, setCvLang] = useState<Language>(
    searchParams.get('lang') === 'ar'
      ? 'ar'
      : searchParams.get('lang') === 'en'
        ? 'en'
        : language
  );

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const persistCustomJd = (jd: string) => {
    try {
      if (jd.trim()) {
        window.sessionStorage.setItem(CUSTOM_JD_STORAGE_KEY, jd.trim());
      } else {
        window.sessionStorage.removeItem(CUSTOM_JD_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set('role', selectedRole);
    if (selectedRole === 'custom' && customTitle.trim()) {
      params.set('custom', customTitle.trim());
    }
    if (selectedRole === 'custom' && customDescription.trim()) {
      persistCustomJd(customDescription);
      if (customDescription.trim().length <= 400) {
        params.set('jd', customDescription.trim());
      }
    }
    if (selectedSkills.length > 0) {
      params.set('skills', selectedSkills.join(','));
    }
    params.set('lang', cvLang);
    return params.toString();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'custom') {
      persistCustomJd(customDescription);
    }
    navigate(`/recruiter/results?${buildQueryString()}`);
  };

  if (!siteSettings.recruiterModeEnabled) {
    return (
      <section className="py-16 sm:py-24">
        <Container className="max-w-2xl">
          <Card className="space-y-5 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
              <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t('recruiter:entry.disabledTitle')}
            </h1>
            <p className="text-sm leading-relaxed text-text-secondary">
              {t('recruiter:entry.disabledDescription')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <ButtonLink to="/portfolio" variant="primary" size="md">
                {t('recruiter:entry.fullPortfolioCta')}
              </ButtonLink>
              <ButtonLink to="/" variant="secondary" size="md">
                {t('common:actions.backToHome')}
              </ButtonLink>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  return (
    <>
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-border-default bg-bg-primary">
        <div
          aria-hidden="true"
          className="engineering-grid pointer-events-none absolute inset-0 opacity-70"
        />
        <Container className="relative py-12 sm:py-16">
          <div className="max-w-3xl space-y-4">
            <Badge variant="accent" mono>
              <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('recruiter:badge')}</span>
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-[42px]">
              {t('recruiter:entry.title')}
            </h1>
            <p className="text-base leading-relaxed text-text-secondary sm:text-lg">
              {t('recruiter:entry.subtitle')}
            </p>
            <p className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-secondary/90 px-3.5 py-2 text-xs text-text-secondary">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{t('recruiter:entry.noAccountNote')}</span>
            </p>
          </div>
        </Container>
      </section>

      {/* Main Selection Flow */}
      <section className="py-10 sm:py-14">
        <Container>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Target Position */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
                  {t('recruiter:entry.stepRole')}
                </h2>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {RECRUITER_POSITIONS.map((position) => {
                  const isSelected = selectedRole === position.id;
                  return (
                    <button
                      key={position.id}
                      type="button"
                      onClick={() => setSelectedRole(position.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        'group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-start transition-all duration-200 cursor-pointer',
                        isSelected
                          ? 'border-accent bg-accent-subtle/60 shadow-card ring-1 ring-accent'
                          : 'border-border-default bg-bg-secondary hover:border-border-strong hover:bg-bg-elevated'
                      )}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <span className="text-[15px] font-semibold text-text-primary">
                          {pick(position.label)}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                            isSelected
                              ? 'border-accent bg-accent text-accent-foreground'
                              : 'border-border-strong bg-bg-primary'
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" aria-hidden="true" />}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-text-secondary">
                        {pick(position.description)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Role & Job Description Input */}
              {selectedRole === 'custom' && (
                <Card className="space-y-4 border-accent-border bg-bg-secondary p-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="recruiter-custom-title"
                      className="block text-sm font-semibold text-text-primary"
                    >
                      {t('recruiter:entry.stepCustomLabel')}
                    </label>
                    <input
                      id="recruiter-custom-title"
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder={t('recruiter:entry.stepCustomPlaceholder')}
                      maxLength={90}
                      className="w-full rounded-[10px] border border-border-default bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="recruiter-custom-jd"
                      className="block text-sm font-semibold text-text-primary"
                    >
                      {t('recruiter:entry.stepCustomJdLabel')}
                    </label>
                    <textarea
                      id="recruiter-custom-jd"
                      rows={5}
                      value={customDescription}
                      onChange={(e) => {
                        setCustomDescription(e.target.value);
                        persistCustomJd(e.target.value);
                      }}
                      placeholder={t('recruiter:entry.stepCustomJdPlaceholder')}
                      maxLength={4000}
                      className="w-full rounded-[10px] border border-border-default bg-bg-primary px-4 py-2.5 text-sm leading-relaxed text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none"
                    />
                  </div>

                  <p className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                    <span>{t('recruiter:entry.stepCustomHint')}</span>
                  </p>
                </Card>
              )}
            </div>

            {/* Step 2 & Step 3 Grid */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Optional Technical Focus Areas */}
              <Card className="space-y-4 p-5 sm:p-6 lg:col-span-7">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-accent" aria-hidden="true" />
                    <h2 className="text-base font-semibold text-text-primary sm:text-lg">
                      {t('recruiter:entry.stepSkills')}
                    </h2>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {t('recruiter:entry.stepSkillsHint')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {RECRUITER_SKILL_FILTERS.map((skill) => {
                    const active = selectedSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        aria-pressed={active}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer sm:text-sm',
                          active
                            ? 'border-accent bg-accent-subtle text-accent'
                            : 'border-border-default bg-bg-primary text-text-secondary hover:border-border-strong hover:text-text-primary'
                        )}
                      >
                        {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                        <span>{pick(skill.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Preferred CV Language */}
              <Card className="space-y-4 p-5 sm:p-6 lg:col-span-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-accent" aria-hidden="true" />
                    <h2 className="text-base font-semibold text-text-primary sm:text-lg">
                      {t('recruiter:entry.stepLanguage')}
                    </h2>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {t('recruiter:entry.langNote')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {(['en', 'ar'] as const).map((langOption) => {
                    const active = cvLang === langOption;
                    return (
                      <button
                        key={langOption}
                        type="button"
                        onClick={() => setCvLang(langOption)}
                        aria-pressed={active}
                        className={cn(
                          'rounded-xl border px-3.5 py-3 text-center text-sm font-semibold transition-colors cursor-pointer',
                          active
                            ? 'border-accent bg-accent-subtle text-accent'
                            : 'border-border-default bg-bg-primary text-text-secondary hover:border-border-strong hover:text-text-primary'
                        )}
                      >
                        {langOption === 'en'
                          ? t('recruiter:entry.langEn')
                          : t('recruiter:entry.langAr')}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-default bg-bg-secondary p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" variant="primary" size="lg">
                  <span>{t('recruiter:entry.analyzeCta')}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Button>
                <ButtonLink
                  to={`/career/cv-builder?${buildQueryString()}`}
                  variant="secondary"
                  size="lg"
                >
                  <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>{t('recruiter:entry.directCvCta')}</span>
                </ButtonLink>
              </div>

              <ButtonLink to="/portfolio" variant="ghost" size="md">
                {t('recruiter:entry.fullPortfolioCta')}
              </ButtonLink>
            </div>
          </form>
        </Container>
      </section>
    </>
  );
}
