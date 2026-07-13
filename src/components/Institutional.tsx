import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initCardGlow, initMagnetic } from '../lib/hover';

const Institutional = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let cleanupCard = () => {};
    let cleanupBtn = () => {};

    if (cardRef.current) cleanupCard = initCardGlow(cardRef.current);
    if (btnRef.current) cleanupBtn = initMagnetic(btnRef.current);

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!containerRef.current) return;
      
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 28, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          }
        }
      );
    });

    return () => {
      mm.revert();
      cleanupCard();
      cleanupBtn();
    };
  }, []);

  return (
    <section id="universities" className="relative w-full bg-[#05070d] py-24 md:py-32 px-6 flex justify-center overflow-hidden">
      <div
        className="absolute left-0 bottom-0 w-[600px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 20% 80%, rgba(135,200,245,0.05), transparent 65%)' }}
      />
      <div ref={containerRef} className="w-full max-w-3xl relative">
        <div ref={cardRef} className="liquid-glass rounded-2xl p-10 md:p-14 text-center">
          <p className="font-inter text-white/40 text-xs tracking-[0.3em] uppercase">
            For universities
          </p>
          <h2 className="font-instrument text-white text-3xl md:text-[42px] mt-4 leading-tight">
            A live Europe intelligence lab for your{' '}
            <span className="italic">IR and security-studies</span> students
          </h2>
          <p className="font-inter text-white/60 text-sm md:text-base leading-relaxed mt-6 max-w-xl mx-auto">
            Departments and libraries get live Europe monitoring plus a teaching tool: real briefs, a forward events calendar, and a transparent methodology students can study and challenge. Semester pilots are available for a single program or cohort.
          </p>
          <a
            ref={btnRef}
            href="mailto:hello@windroseintelligence.com?subject=University%20pilot%20inquiry"
            className="inline-block mt-8 bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow font-inter"
          >
            Start a pilot conversation
          </a>
          <p className="font-inter text-white/35 text-xs mt-5">
            We reply personally: this path is a conversation, not a checkout.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Institutional;
