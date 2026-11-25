import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
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
  const { siteSettings } = usePortfolioData();
  const vis = siteSettings.homeSections.visibility;

  const showIntro =
    vis?.intro !== false && siteSettings.homeSections.intro.visible !== false;
  const showSpecializations =
    vis?.specializations !== false &&
    siteSettings.homeSections.specializations.visible !== false;
  const showFeatured = vis?.featuredProjects !== false;
  const showExperience = vis?.experience !== false;
  const showCompanies = vis?.companies !== false;
  const showSkills = vis?.skills !== false;
  const showCertifications =
    vis?.certifications !== false && siteSettings.showCoursesSection !== false;
  const showContact = vis?.contact !== false;

  return (
    <>
      <HeroSection />
      {showIntro && <IntroSection />}
      {showSpecializations && <SpecializationsSection />}
      {showFeatured && <FeaturedProjectsSection />}
      {showExperience && <ExperienceSection />}
      {showCompanies && <CompaniesSection />}
      {showSkills && <SkillsSection />}
      {showCertifications && <CertificationsSection />}
      {showContact && <ContactSection />}
    </>
  );
}
