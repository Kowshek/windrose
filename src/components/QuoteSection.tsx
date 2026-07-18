import { useContext, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { StoryContext } from '../lib/scroll';

const clamp = (min: number, max: number, val: number) => Math.max(min, Math.min(max, val));
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

/**
 * Methodology section — parallax quote. Dark gradient only (no light blue),
 * CSS-only glow layers driven by the original rAF + lerp rig.
 */
const QuoteSection = () => {
  const story = useContext(StoryContext);
  const sectionRef = useRef<HTMLDivElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);
  const leftGlowRef = useRef<HTMLDivElement>(null);
  const rightGlowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const authorRef = useRef<HTMLParagraphElement>(null);

  const current = useRef({
    horizonY: 120,
    leftX: -200,
    leftY: 0,
    leftOpacity: 0,
    rightX: 200,
    rightY: 0,
    rightOpacity: 0
  });

  useEffect(() => {
    let animationFrameId = 0;
    let rigRunning = false;
    // Inside the horizontal story the section crosses the viewport on the x
    // axis, so the glow rig reads progress from rect.left instead of rect.top.
    const horizontal = !!story;

    const animate = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const progress = horizontal
        ? clamp(0, 1, (window.innerWidth - rect.left) / (window.innerWidth + rect.width))
        : clamp(0, 1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height));

      const targetHorizonY = 120 - progress * 280;

      const inView = progress > 0.12 && progress < 0.92;
      const targetLeftX = inView ? 0 : -200;
      const targetRightX = inView ? 0 : 200;
      const targetOpacity = inView ? 1 : 0;
      const targetY = progress * -50;

      const c = current.current;
      c.horizonY = lerp(c.horizonY, targetHorizonY, 0.06);
      c.leftX = lerp(c.leftX, targetLeftX, 0.04);
      c.leftY = lerp(c.leftY, targetY, 0.04);
      c.leftOpacity = lerp(c.leftOpacity, targetOpacity, 0.04);
      c.rightX = lerp(c.rightX, targetRightX, 0.04);
      c.rightY = lerp(c.rightY, targetY, 0.04);
      c.rightOpacity = lerp(c.rightOpacity, targetOpacity, 0.04);

      if (horizonRef.current) {
        horizonRef.current.style.transform = `translate3d(0, ${c.horizonY}px, 0)`;
      }
      if (leftGlowRef.current) {
        leftGlowRef.current.style.transform = `translate3d(${c.leftX}px, ${c.leftY}px, 0)`;
        leftGlowRef.current.style.opacity = c.leftOpacity.toString();
      }
      if (rightGlowRef.current) {
        rightGlowRef.current.style.transform = `translate3d(${c.rightX}px, ${c.rightY}px, 0)`;
        rightGlowRef.current.style.opacity = c.rightOpacity.toString();
      }

      if (rigRunning) animationFrameId = requestAnimationFrame(animate);
    };

    // The rig (and its per-frame rect read) only runs while the section is
    // near the viewport, and not at all under reduced motion — the glows then
    // simply hold their resting state.
    const rigReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rigObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !rigRunning) {
          rigRunning = true;
          animationFrameId = requestAnimationFrame(animate);
        } else if (!entry.isIntersecting && rigRunning) {
          rigRunning = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { rootMargin: '25%' }
    );
    if (!rigReduced && sectionRef.current) rigObserver.observe(sectionRef.current);

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!sectionRef.current || !textRef.current || !authorRef.current) return;

      // Story-only entrance: a focus pull — the whole quote settles from a
      // soft blur and slight overscale as the panel slides in. The per-word
      // opacity stagger below runs on the spans, so the two never touch the
      // same property.
      if (story) {
        gsap.fromTo(textRef.current,
          { y: 48, scale: 1.035, filter: 'blur(9px)' },
          {
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            ease: 'power1.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              containerAnimation: story,
              start: 'left 98%',
              end: 'left 40%',
              scrub: 1,
            },
          }
        );
      }

      const words = textRef.current.querySelectorAll('.quote-word');

      const tl = gsap.timeline({
        scrollTrigger: story
          ? {
            trigger: sectionRef.current,
            containerAnimation: story,
            start: 'left 85%',
            end: 'left 12%',
            scrub: 1,
          }
          : {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "bottom 60%",
            scrub: true,
          }
      });

      gsap.set(words, { opacity: 0.15 });

      tl.to(words, {
        opacity: 1,
        stagger: 0.1,
        ease: 'none'
      })
        .fromTo(authorRef.current,
          story
            ? { opacity: 0, y: 12, clipPath: 'inset(0% 100% 0% 0%)' }
            : { opacity: 0 },
          story
            ? { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }
            : { opacity: 1, ease: 'none' },
          ">"
        );
    });

    return () => {
      rigObserver.disconnect();
      rigRunning = false;
      cancelAnimationFrame(animationFrameId);
      mm.revert();
    };
  }, [story]);

  const quoteText = "Every item shows its sourcing, its confidence, and the indicators behind the call: a transparent scoring system with published criteria. The method is the product. No black box";
  const quoteWords = quoteText.split(' ');

  return (
    <section
      id="method"
      ref={sectionRef}
      className="relative w-full overflow-hidden flex items-center justify-center px-6 py-32 md:py-48"
      style={{
        background: 'linear-gradient(to right, rgba(5,7,13,0) 0%, #04182B 25%, #0A2E4A 50%, #04182B 75%, rgba(5,7,13,0) 100%)'
      }}
    >
      {/* Horizon glow (parallax, replaces the old rainbow image) */}
      <div
        ref={horizonRef}
        className="absolute inset-x-0 top-0 h-[40vh] z-30 pointer-events-none will-change-transform"
        style={{
          transform: 'translate3d(0, 120px, 0)',
          background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(135,200,245,0.14) 0%, rgba(135,200,245,0.05) 45%, transparent 75%)'
        }}
      />

      {/* Left glow */}
      <div
        ref={leftGlowRef}
        className="hidden sm:block absolute left-0 bottom-[10%] z-10 w-[500px] md:w-[650px] h-[260px] pointer-events-none will-change-transform"
        style={{
          marginLeft: '-20%',
          opacity: 0,
          transform: 'translate3d(-200px, 0, 0)',
          background: 'radial-gradient(ellipse 70% 55% at 40% 60%, rgba(200,230,255,0.10) 0%, transparent 70%)',
          filter: 'blur(20px)'
        }}
      />

      {/* Right glow */}
      <div
        ref={rightGlowRef}
        className="hidden sm:block absolute right-0 bottom-[15%] z-10 w-[500px] md:w-[650px] h-[260px] pointer-events-none will-change-transform"
        style={{
          marginRight: '-20%',
          opacity: 0,
          transform: 'translate3d(200px, 0, 0)',
          background: 'radial-gradient(ellipse 70% 55% at 60% 60%, rgba(200,230,255,0.10) 0%, transparent 70%)',
          filter: 'blur(20px)'
        }}
      />

      {/* Quote Content */}
      <div className="relative z-20 max-w-4xl text-center">
        <p ref={textRef} className="font-instrument text-white text-xl sm:text-2xl md:text-4xl lg:text-[42px] leading-[1.45] md:leading-[1.5] flex flex-wrap justify-center gap-y-2">
          <span className="quote-word inline-block mr-[0.25em]">&ldquo;</span>
          {quoteWords.map((word, i) => (
            <span key={i} className="quote-word inline-block mr-[0.25em]">{word}</span>
          ))}
          <span className="quote-word inline-block">&rdquo;</span>
        </p>
        <p ref={authorRef} data-story-fg className="font-inter mt-6 md:mt-8 text-white/80 text-sm md:text-base tracking-wide">
          The Windrose method: published, scored, and open to challenge
        </p>
      </div>
    </section>
  );
};

export default QuoteSection;
