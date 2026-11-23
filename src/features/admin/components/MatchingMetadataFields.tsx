import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MatchingMetadataFieldsProps {
  idPrefix: string;
  matchingTags: string[];
  onTagsChange: (tags: string[]) => void;
  cvPriority?: number;
  onPriorityChange?: (priority: number) => void;
  showPriority?: boolean;
  showInCv: boolean;
  onShowInCvChange: (show: boolean) => void;
}

export function MatchingMetadataFields({
  idPrefix,
  matchingTags,
  onTagsChange,
  cvPriority = 50,
  onPriorityChange,
  showPriority = true,
  showInCv,
  onShowInCvChange,
}: MatchingMetadataFieldsProps) {
  const { t } = useTranslation('admin');
  const [tagDraft, setTagDraft] = useState('');

  const addTagsFromDraft = () => {
    const parsed = tagDraft
      .split(',')
      .map((s) => s.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter((s) => s.length > 0 && !matchingTags.includes(s));
    if (parsed.length === 0) return;
    onTagsChange([...matchingTags, ...parsed]);
    setTagDraft('');
  };

  return (
    <div className="space-y-4 rounded-xl border border-border-default bg-bg-primary/60 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-text-primary">
          {t('matching.heading')}
        </h3>
      </div>
      <p className="text-xs text-text-secondary">{t('matching.description')}</p>

      {/* Matching Tags */}
      <div className="space-y-2">
        <label
          htmlFor={`${idPrefix}-tags`}
          className="block text-xs font-medium text-text-primary"
        >
          {t('matching.tagsLabel')}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={`${idPrefix}-tags`}
            dir="ltr"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTagsFromDraft();
              }
            }}
            placeholder={t('matching.tagsPlaceholder')}
            className="h-9 flex-1 rounded-lg border border-border-default bg-bg-secondary px-3 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={addTagsFromDraft}
            className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent cursor-pointer"
          >
            {t('matching.addTag')}
          </button>
        </div>

        {matchingTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {matchingTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-bg-secondary px-2 py-1 font-mono text-[11px] text-text-primary"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() =>
                    onTagsChange(matchingTags.filter((item) => item !== tag))
                  }
                  aria-label={`${t('common.delete')} ${tag}`}
                  className="text-text-secondary hover:text-error cursor-pointer"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Priority & CV Visibility */}
      <div className="grid gap-4 sm:grid-cols-2">
        {showPriority && onPriorityChange && (
          <div className="space-y-1.5">
            <label
              htmlFor={`${idPrefix}-priority`}
              className="block text-xs font-medium text-text-primary"
            >
              {t('matching.cvPriorityLabel')}
            </label>
            <input
              id={`${idPrefix}-priority`}
              type="number"
              min={1}
              max={100}
              value={cvPriority}
              onChange={(e) =>
                onPriorityChange(
                  Math.min(100, Math.max(1, Number(e.target.value) || 50))
                )
              }
              className="h-9 w-full rounded-lg border border-border-default bg-bg-secondary px-3 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-end pb-1">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={showInCv}
              onChange={(e) => onShowInCvChange(e.target.checked)}
              className="h-4 w-4 rounded accent-accent"
            />
            <span>{t('matching.showInCvLabel')}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
