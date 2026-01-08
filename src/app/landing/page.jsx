'use client';

import {
  Navbar,
  Hero,
  Features,
  HowItWorks,
  Stats,
  About,
  CTA,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-deep-black">
      {/* Background Effects */}
      <div className="nebula-bg">
        <div className="nebula-orb nebula-orb-1" />
        <div className="nebula-orb nebula-orb-2" />
        <div className="nebula-orb nebula-orb-3" />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Sections */}
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <About />
      <CTA />
      <Footer />
    </main>
  );
}
