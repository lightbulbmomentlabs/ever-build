import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { Solution } from '@/components/landing/Solution';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { WhoItsFor } from '@/components/landing/WhoItsFor';
import { Comparison } from '@/components/landing/Comparison';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <Pricing />
      <WhoItsFor />
      <Comparison />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
