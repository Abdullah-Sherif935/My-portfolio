import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HeroSection } from './sections/HeroSection';
import { IntroSection } from './sections/IntroSection';
import { SpecializationsSection } from './sections/SpecializationsSection';
import { FeaturedProjectsSection } from './sections/FeaturedProjectsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { CompaniesSection } from './sections/CompaniesSection';
import { SkillsSection } from './sections/SkillsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { ContactSection } from './sections/ContactSection';

export function HomePage() {
  useDocumentTitle();

  return (
    <>
      <HeroSection />
      <IntroSection />
      <SpecializationsSection />
      <FeaturedProjectsSection />
      <ExperienceSection />
      <CompaniesSection />
      <SkillsSection />
      <CertificationsSection />
      <ContactSection />
    </>
  );
}
