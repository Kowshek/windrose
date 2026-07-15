import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initSmoothScroll } from '../lib/scroll';
import Hero from '../components/Hero';
import RadarTicker from '../components/RadarTicker';
import ThreeBeats from '../components/ThreeBeats';
import BriefPreview from '../components/BriefPreview';
import QuoteSection from '../components/QuoteSection';
import Waitlist from '../components/Waitlist';
import Institutional from '../components/Institutional';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';

const Landing = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    initSmoothScroll();
  }, []);

  return (
    <div className="bg-[#05070d] min-h-screen flex flex-col relative">
      <ScrollProgress />
      <Hero />
      <RadarTicker />
      <ThreeBeats />
      <BriefPreview />
      <QuoteSection />
      <Waitlist />
      <Institutional />
      <Footer />
    </div>
  );
};

export default Landing;
