import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initSmoothScroll } from '../lib/scroll';
import Hero from '../components/Hero';
import ThreeBeats from '../components/ThreeBeats';
import BriefPreview from '../components/BriefPreview';
import QuoteSection from '../components/QuoteSection';
import Waitlist from '../components/Waitlist';
import Institutional from '../components/Institutional';
import Footer from '../components/Footer';

const Landing = () => {
  useEffect(() => {
    initSmoothScroll();
    
    // Scroll progress hairline
    gsap.to('#scroll-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
      }
    });
  }, []);

  return (
    <div className="bg-[#0a0608] min-h-screen flex flex-col relative">
      <div 
        id="scroll-progress" 
        className="fixed top-0 left-0 h-[1px] bg-white/40 z-[60] origin-left"
        style={{ width: '100%', transform: 'scaleX(0)' }}
      />
      <Hero />
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
