import { useTranslation } from 'react-i18next';
import type { LocalizedText } from '@/types/portfolio';
import { cn } from '@/utils/cn';

interface LocalizedFieldGroupProps {
  idPrefix: string;
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholderEn?: string;
  placeholderAr?: string;
}

const controlClass =
  'w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary placeholder:text-text-secondary/70 transition-colors focus:border-accent focus:outline-none';

export function LocalizedFieldGroup({
  idPrefix,
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  required = false,
  placeholderEn,
  placeholderAr,
}: LocalizedFieldGroupProps) {
  const { t } = useTranslation('admin');

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ms-1 text-accent">*</span>}
      </legend>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor={`${idPrefix}-en`}
            className="block font-mono text-[11px] text-text-secondary"
          >
            {t('common.englishLabel')}
          </label>
          {multiline ? (
            <textarea
              id={`${idPrefix}-en`}
              dir="ltr"
              rows={rows}
              required={required}
              value={value.en}
              placeholder={placeholderEn}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              className={cn(controlClass, 'py-2.5 resize-y')}
            />
          ) : (
            <input
              id={`${idPrefix}-en`}
              dir="ltr"
              required={required}
              value={value.en}
              placeholder={placeholderEn}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              className={cn(controlClass, 'h-10')}
            />
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor={`${idPrefix}-ar`}
            className="block font-mono text-[11px] text-text-secondary"
          >
            {t('common.arabicLabel')}
          </label>
          {multiline ? (
            <textarea
              id={`${idPrefix}-ar`}
              dir="rtl"
              rows={rows}
              required={required}
              value={value.ar}
              placeholder={placeholderAr}
              onChange={(e) => onChange({ ...value, ar: e.target.value })}
              className={cn(controlClass, 'py-2.5 resize-y')}
            />
          ) : (
            <input
              id={`${idPrefix}-ar`}
              dir="rtl"
              required={required}
              value={value.ar}
              placeholder={placeholderAr}
              onChange={(e) => onChange({ ...value, ar: e.target.value })}
              className={cn(controlClass, 'h-10')}
            />
          )}
        </div>
      </div>
    </fieldset>
  );
}
