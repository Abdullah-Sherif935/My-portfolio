import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/hooks/useLanguage';
import type { SkillGroup } from '@/types/portfolio';

interface SkillGroupCardProps {
  group: SkillGroup;
}

export function SkillGroupCard({ group }: SkillGroupCardProps) {
  const { pick } = useLanguage();

  return (
    <Card className="flex h-full flex-col p-4 sm:p-6">
      <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3">
        <span className="font-mono text-xs font-medium text-accent">{group.code}</span>
        <span className="font-mono text-[11px] text-text-secondary">
          {group.skills.length}
        </span>
      </div>

      <h3 className="mb-1.5 text-base font-semibold text-text-primary sm:mb-2 sm:text-lg">
        {pick(group.title)}
      </h3>

      <p className="mb-4 text-xs leading-relaxed text-text-secondary sm:mb-5 sm:text-sm">
        {pick(group.description)}
      </p>

      <ul className="mt-auto flex flex-wrap gap-1.5 sm:gap-2">
        {group.skills.map((skill, index) => (
          <li
            key={index}
            className="rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-xs font-medium text-text-primary sm:px-3 sm:py-1.5"
          >
            {pick(skill)}
          </li>
        ))}
      </ul>
    </Card>
  );
}
