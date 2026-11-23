import { Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PlaceholderNoticeProps {
  text: string;
  className?: string;
}

export function PlaceholderNotice({ text, className }: PlaceholderNoticeProps) {
  return (
    <div
      className={cn(
        'mb-8 flex items-start gap-3 rounded-xl border border-accent-border bg-accent-subtle px-4 py-3 text-sm text-text-primary',
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <p className="leading-relaxed text-text-secondary">
        <span className="font-medium text-text-primary">{text}</span>
      </p>
    </div>
  );
}
