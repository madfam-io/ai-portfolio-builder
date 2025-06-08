import InteractiveScript from '@/components/InteractiveScript';
import NavigationEnhancer from '@/components/NavigationEnhancer';
import BackToTopButton from '@/components/BackToTopButton';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Templates from '@/components/landing/Templates';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import LanguageStatus from '@/components/LanguageStatus';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <NavigationEnhancer />
      <Header />
      <main id="main-content" className="focus:outline-none" tabIndex={-1}>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Templates />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <BackToTopButton />
      <InteractiveScript />
      <LanguageStatus />
    </div>
  );
}
