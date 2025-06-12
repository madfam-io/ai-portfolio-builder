'use client';

import React from 'react';

import BackToTopButton from '@/components/BackToTopButton';
import CTA from '@/components/landing/CTA';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import SocialProof from '@/components/landing/SocialProof';
import Templates from '@/components/landing/Templates';
import { LanguageProvider } from '@/lib/i18n/refactored-context';

export default function HomePage(): React.ReactElement {
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
