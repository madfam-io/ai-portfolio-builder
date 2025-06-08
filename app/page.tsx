import BaseLayout from '@/components/layouts/BaseLayout';
import InteractiveScript from '@/components/InteractiveScript';
import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Templates from '@/components/landing/Templates';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import LanguageStatus from '@/components/LanguageStatus';

export default function HomePage() {
  return (
    <BaseLayout>
      <main id="main-content" className="focus:outline-none" tabIndex={-1}>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Templates />
        <Pricing />
        <CTA />
      </main>
      <InteractiveScript />
      <LanguageStatus />
    </BaseLayout>
  );
}
