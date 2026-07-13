import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initCardGlow } from '../lib/hover';

const ThreeBeats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Heading words animation
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll('.word');
        gsap.fromTo(words, 
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              end: "bottom 60%",
              scrub: true,
            }
          }
        );
      }

      // Parallax for cards (-4 / 0 / -8 yPercent)
      const rates = [-4, 0, -8];
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.to(card, {
          yPercent: rates[i % 3],
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });
    });

    const cleanups = cardsRef.current.map(card => card ? initCardGlow(card) : () => {});

    return () => {
      observer.disconnect();
      mm.revert();
      cleanups.forEach(cleanup => cleanup());
    };
  }, []);

  const beats = [
    {
      num: '01',
      title: 'Stop drowning in headlines',
      body: '5–8 items a day, each with what happened, why it matters, and what to watch. The triage is done before you open it.',
    },
    {
      num: '02',
      title: 'See ahead',
      body: 'The events calendar and risk map show what is coming, not just what broke: summits, elections, deadlines, flashpoints.',
    },
    {
      num: '03',
      title: 'Learn the craft',
      body: 'Every brief shows its sourcing and method, teaching the same tradecraft the profession uses as you read.',
    },
  ];

  return (
    <section id="beats" className="relative w-full bg-[#05070d] py-24 md:py-32 px-6 flex justify-center overflow-hidden">
      {/* Atmosphere echo from the hero's earth glow */}
      <div
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(120,185,230,0.07), transparent 60%)' }}
      />
      <div className="w-full max-w-6xl flex flex-col items-center relative">
        <h2 ref={headingRef} className="font-instrument text-3xl md:text-5xl text-center text-white mb-16 max-w-3xl flex flex-wrap justify-center gap-x-[0.25em]">
          <span className="word inline-block">Built</span>
          <span className="word inline-block">for</span>
          <span className="word inline-block">people</span>
          <span className="word inline-block">who</span>
          <span className="word inline-block">read</span>
          <span className="word inline-block">the</span>
          <span className="word inline-block">world</span>
          <span className="word inline-block">for</span>
          <span className="word inline-block">a</span>
          <span className="word inline-block">living</span>
          <span className="word inline-block italic">or want to.</span>
        </h2>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
          {beats.map((beat, index) => (
            <div
              key={beat.num}
              ref={(el) => { cardsRef.current[index] = el; }}
              className={`liquid-glass rounded-2xl p-8 flex flex-col gap-4 text-left transition-all duration-[900ms] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[28px]'
              }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                transitionDelay: `${index * 140}ms`
              }}
            >
              <div className="text-white/30 text-xs tracking-[0.3em] font-inter">
                {beat.num}
              </div>
              <h3 className="font-instrument text-2xl md:text-3xl text-white">
                {beat.title}
              </h3>
              <p className="font-inter text-white/60 text-sm leading-relaxed">
                {beat.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreeBeats;
