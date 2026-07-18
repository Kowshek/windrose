import { useContext, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initCardGlow, initMagnetic } from '../lib/hover';
import { StoryContext } from '../lib/scroll';

const Institutional = () => {
  const story = useContext(StoryContext);
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

      if (story) {
        // Story entrance (the finale): the card settles in from a slight
        // scale, then its content cascades. Targets the card and its children
        // — never the wrapper, which Landing's parallax and fit-scale own.
        if (!cardRef.current) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            containerAnimation: story,
            start: "left 80%",
          },
        });
        tl.fromTo(cardRef.current,
          { opacity: 0, y: 48, scale: 0.95, clipPath: 'inset(0% 100% 0% 0% round 16px)' },
          { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.05, ease: "expo.out" }
        ).fromTo(
          // Semantic children only — initCardGlow appends a hover-glow overlay
          // div whose opacity must stay under the hover rig's control.
          cardRef.current.querySelectorAll(':scope > p, :scope > h2, :scope > a'),
          { opacity: 0, y: 20, filter: 'blur(5px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: "power2.out", stagger: 0.07 },
          0.18
        );
        return;
      }

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
  }, [story]);

  return (
    <section id="universities" className="relative w-full pt-28 pb-36 md:pt-36 md:pb-44 px-6 flex justify-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 60% at 50% 55%, rgba(135,200,245,0.08), transparent 70%)' }}
      />
      <div ref={containerRef} className="w-full max-w-4xl relative">
        <div ref={cardRef} className="liquid-glass rounded-2xl p-10 md:p-14 text-left">
          <p data-story-fg className="font-inter text-white/40 text-sm tracking-[0.3em] uppercase">
            For universities
          </p>
          <h2 className="font-instrument text-white text-3xl md:text-[42px] mt-4 leading-tight">
            A live Europe intelligence lab for your{' '}
            <span className="italic">IR and security-studies</span> students
          </h2>
          <p className="font-inter text-white/60 text-sm md:text-base leading-relaxed mt-6 max-w-xl">
            Departments and libraries get live Europe monitoring plus a teaching tool: real briefs, a forward events calendar, and a transparent methodology students can study and challenge. Semester pilots are available for a single program or cohort.
          </p>
          <a
            ref={btnRef}
            href="mailto:hello@windroseintelligence.com?subject=University%20pilot%20inquiry"
            className="inline-block mt-8 bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 active:scale-[0.98] transition-all duration-300 button-glow font-inter"
          >
            Start a pilot conversation
          </a>
          <p className="font-inter text-white/35 text-sm mt-5">
            We reply personally: this path is a conversation, not a checkout.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Institutional;
