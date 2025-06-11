'use client';

import { LanguageProvider } from '@/lib/i18n/refactored-context';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Templates from '@/components/landing/Templates';
import Pricing from '@/components/landing/Pricing';
import SocialProof from '@/components/landing/SocialProof';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import BackToTopButton from '@/components/BackToTopButton';

export default function HomePage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Header />
        <main>
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
      </div>
    </LanguageProvider>
  );
}
