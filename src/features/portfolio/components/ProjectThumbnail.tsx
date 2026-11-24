import type { Project } from '@/types/portfolio';
import { cn } from '@/utils/cn';

interface ProjectThumbnailProps {
  variant: Project['coverVariant'];
  code: string;
  imageUrl?: string | null;
  imageAlt?: string;
  className?: string;
}

export function ProjectThumbnail({
  variant,
  code,
  imageUrl,
  imageAlt,
  className,
}: ProjectThumbnailProps) {
  return (
    <div
      className={cn(
        'relative aspect-[16/10] w-full overflow-hidden border-b border-border-default bg-bg-primary',
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt || code}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <>
          {/* Subtle Blueprint Grid */}
          <div
            aria-hidden="true"
            className="engineering-grid absolute inset-0 opacity-90 transition-transform duration-500 group-hover:scale-105"
          />

          {/* Technical Schematic SVG */}
          <svg
            viewBox="0 0 400 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          >
            {/* Outer Technical Frame & Registration Ticks */}
            <rect
              x="16"
              y="16"
              width="368"
              height="218"
              rx="8"
              stroke="var(--border-strong)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <path
              d="M16 32V16H32M368 16H384V32M384 218V234H368M32 234H16V218"
              stroke="var(--accent)"
              strokeWidth="1.5"
            />

            {variant === 'hvac' && (
              <g>
                <rect
                  x="56"
                  y="72"
                  width="104"
                  height="96"
                  rx="6"
                  fill="var(--bg-secondary)"
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                />
                <circle cx="108" cy="120" r="28" stroke="var(--accent)" strokeWidth="1.5" />
                <path
                  d="M108 92V148M80 120H136M88 100L128 140M128 100L88 140"
                  stroke="var(--accent)"
                  strokeWidth="1.2"
                  strokeOpacity="0.65"
                />
                <path
                  d="M160 98H248V82H334"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M160 142H248V158H334"
                  stroke="var(--text-secondary)"
                  strokeWidth="1.8"
                  strokeDasharray="6 4"
                />
                <rect
                  x="252"
                  y="102"
                  width="82"
                  height="38"
                  rx="5"
                  fill="var(--bg-secondary)"
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                />
                <path d="M266 114H320M266 126H306" stroke="var(--text-secondary)" strokeWidth="1.5" />
                <circle cx="212" cy="98" r="6" fill="var(--bg-primary)" stroke="var(--accent)" strokeWidth="1.5" />
                <circle cx="212" cy="142" r="6" fill="var(--bg-primary)" stroke="var(--text-secondary)" strokeWidth="1.5" />
              </g>
            )}

            {variant === 'plc' && (
              <g>
                <line x1="62" y1="54" x2="62" y2="196" stroke="var(--accent)" strokeWidth="2" />
                <line x1="338" y1="54" x2="338" y2="196" stroke="var(--accent)" strokeWidth="2" />
                <path d="M62 86H122M138 86H210M226 86H278M298 86H338" stroke="var(--text-secondary)" strokeWidth="1.6" />
                <path d="M122 76V96M138 76V96M210 76V96M226 76V96" stroke="var(--accent)" strokeWidth="1.8" />
                <circle cx="288" cy="86" r="10" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="1.8" />
                <path d="M62 134H150M166 134H278M298 134H338" stroke="var(--text-secondary)" strokeWidth="1.6" />
                <path d="M150 124V144M166 124V144M152 142L164 126" stroke="var(--accent)" strokeWidth="1.8" />
                <rect x="272" y="122" width="32" height="24" rx="4" fill="var(--bg-secondary)" stroke="var(--border-strong)" strokeWidth="1.5" />
                <path d="M62 176H196M252 176H338" stroke="var(--text-secondary)" strokeWidth="1.6" />
                <rect x="196" y="162" width="56" height="28" rx="4" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="1.5" />
              </g>
            )}

            {variant === 'sheet-metal' && (
              <g>
                <rect
                  x="128"
                  y="72"
                  width="144"
                  height="106"
                  fill="var(--bg-secondary)"
                  stroke="var(--text-secondary)"
                  strokeWidth="1.5"
                />
                <rect
                  x="128"
                  y="40"
                  width="144"
                  height="32"
                  fill="var(--bg-secondary)"
                  stroke="var(--border-strong)"
                  strokeWidth="1.4"
                />
                <rect
                  x="128"
                  y="178"
                  width="144"
                  height="32"
                  fill="var(--bg-secondary)"
                  stroke="var(--border-strong)"
                  strokeWidth="1.4"
                />
                <rect
                  x="82"
                  y="72"
                  width="46"
                  height="106"
                  fill="var(--bg-secondary)"
                  stroke="var(--border-strong)"
                  strokeWidth="1.4"
                />
                <rect
                  x="272"
                  y="72"
                  width="46"
                  height="106"
                  fill="var(--bg-secondary)"
                  stroke="var(--border-strong)"
                  strokeWidth="1.4"
                />
                <path
                  d="M128 72H272M128 178H272M128 72V178M272 72V178"
                  stroke="var(--accent)"
                  strokeWidth="1.8"
                  strokeDasharray="5 3"
                />
                <rect x="152" y="96" width="96" height="8" rx="2" fill="var(--bg-primary)" stroke="var(--border-strong)" />
                <rect x="152" y="114" width="96" height="8" rx="2" fill="var(--bg-primary)" stroke="var(--border-strong)" />
                <circle cx="164" cy="148" r="8" fill="var(--bg-primary)" stroke="var(--accent)" strokeWidth="1.4" />
                <circle cx="236" cy="148" r="8" fill="var(--bg-primary)" stroke="var(--accent)" strokeWidth="1.4" />
              </g>
            )}

            {variant === 'maintenance' && (
              <g>
                <rect
                  x="56"
                  y="56"
                  width="288"
                  height="138"
                  rx="8"
                  fill="var(--bg-secondary)"
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                />
                <path
                  d="M78 142H118L134 102L152 162L174 86L194 148L212 124H258L272 106L288 142H322"
                  stroke="var(--accent)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="174" cy="86" r="5" fill="var(--accent)" />
                <circle cx="272" cy="106" r="4" fill="var(--success)" />
                <line x1="78" y1="168" x2="322" y2="168" stroke="var(--border-strong)" strokeWidth="1" />
                <rect x="78" y="72" width="44" height="10" rx="2" fill="var(--bg-elevated)" />
                <rect x="278" y="72" width="44" height="10" rx="2" fill="var(--accent-subtle)" stroke="var(--accent-border)" />
              </g>
            )}

            {variant === 'mechanical' && (
              <g>
                <circle cx="160" cy="125" r="54" fill="var(--bg-secondary)" stroke="var(--border-strong)" strokeWidth="1.6" />
                <circle cx="160" cy="125" r="36" stroke="var(--accent)" strokeWidth="1.8" strokeDasharray="8 5" />
                <circle cx="160" cy="125" r="16" fill="var(--bg-primary)" stroke="var(--text-secondary)" strokeWidth="1.6" />
                <circle cx="258" cy="125" r="36" fill="var(--bg-secondary)" stroke="var(--border-strong)" strokeWidth="1.6" />
                <circle cx="258" cy="125" r="20" stroke="var(--accent)" strokeWidth="1.6" />
                <circle cx="258" cy="125" r="8" fill="var(--bg-primary)" stroke="var(--text-secondary)" strokeWidth="1.4" />
                <line x1="88" y1="125" x2="316" y2="125" stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="160" y1="54" x2="160" y2="196" stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="258" y1="74" x2="258" y2="176" stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="4 4" />
              </g>
            )}

            {variant === 'robotics' && (
              <g>
                <rect x="72" y="176" width="84" height="22" rx="4" fill="var(--bg-secondary)" stroke="var(--border-strong)" strokeWidth="1.5" />
                <path
                  d="M114 176L158 104L244 84L296 132"
                  stroke="var(--text-secondary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="114" cy="176" r="10" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="2" />
                <circle cx="158" cy="104" r="10" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="2" />
                <circle cx="244" cy="84" r="9" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="2" />
                <path d="M288 136L310 128M292 146L312 150" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M158 104C198 62 264 60 306 106"
                  stroke="var(--accent)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              </g>
            )}
          </svg>
        </>
      )}

    </div>
  );
}
