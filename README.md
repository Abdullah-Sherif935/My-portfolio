# Abdullah Sherif — Personal Engineering Portfolio & Career Platform

Frontend foundation (**Phase 01**) for a modern, bilingual (English / Arabic with full RTL support), themeable engineering portfolio and long-term personal career platform.

## Engineering Disciplines Covered

- HVAC & Refrigeration
- PLC & Industrial Automation
- Electrical Control Panels
- Industrial Maintenance & Troubleshooting
- Mechanical Design
- Sheet Metal Design
- Robotics & Mechatronics

## Technology Stack

- **React 19** + **TypeScript (strict mode)**
- **Vite 6**
- **Tailwind CSS v4** (centralized semantic CSS custom properties)
- **React Router v7**
- **Motion for React** (`motion/react`)
- **Lucide React**
- **i18next** + **react-i18next**

## Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

### Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Create local environment file from example
cp .env.example .env.local

# 3. Start development server
npm run dev
```

### Quality & Build Scripts

```bash
npm run typecheck   # Strict TypeScript verification
npm run lint        # ESLint code quality check
npm run build       # TypeScript compile check + Vite production bundle
npm run preview     # Preview production build locally
```

## Architecture Overview

```text
src/
  app/
    layouts/          # PublicLayout & isolated ModulePlaceholderLayout
    providers.tsx     # ThemeProvider + MotionConfig (reduced-motion aware)
    router.tsx        # Public routes + reserved /admin/* and /career/* shells
  components/
    animations/       # Reveal & PageTransition wrappers
    common/           # BrandMark, PageHeader, PlaceholderNotice
    layout/           # Container (1280px max), Section
    navigation/       # Navbar, Footer, ThemeToggle, LanguageSwitcher
    ui/               # Button, Card, Badge, Input, SectionHeading, Modal
  data/               # Separated editable mock data (companies, projects, skills, etc.)
  features/           # Feature modules (home, about, portfolio, companies, experience, skills, certifications, contact, future)
  hooks/              # useTheme, useLanguage, useScrollToTop
  i18n/               # i18next setup + EN / AR locale JSON files
  lib/                # Public env helper & strict client-side input validation
  styles/             # Centralized semantic tokens.css + index.css
  types/              # Shared TypeScript interfaces
  utils/              # Classname helper
supabase/
  migrations/         # Reserved for Phase 02+ database migrations
```

## Phase 01 Scope & Data Honesty

- **No backend or database** is connected in Phase 01.
- **No personal achievements, employment dates, client logos, or endorsements** have been fabricated. All sample projects, career timeline items, certifications, contact details, and initial company entries (`Elsewedy`, `ARMA`, `Al Dar Engineering`, `Abdel Maboud`) are clearly labeled as editable placeholders.
- Reserved `/admin/*` and `/career/*` routes render transparent Phase 01 placeholders without fake authentication. Server-side authorization and Supabase Row Level Security (RLS) will be implemented in later phases.

## Security Notes

- Never commit `.env` or `.env.local` files containing private keys.
- Never place Supabase `service_role` keys or private API secrets in `VITE_*` variables.
- External links use `rel="noopener noreferrer"` and no `dangerouslySetInnerHTML` is used anywhere in the application.
