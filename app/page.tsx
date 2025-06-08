import BasicClickTest from '@/components/BasicClickTest';
import DirectLanguageToggle from '@/components/DirectLanguageToggle';
import InteractiveScript from '@/components/InteractiveScript';
import LanguageDebug from '@/components/LanguageDebug';
import SimpleLanguageTest from '@/components/SimpleLanguageTest';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Templates from '@/components/landing/Templates';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <BasicClickTest />
      <DirectLanguageToggle />
      <Header />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Templates />
      <Pricing />
      <CTA />
      <Footer />
      <InteractiveScript />
      <LanguageDebug />
      <SimpleLanguageTest />
    </div>
  );
}
