import { useState, useEffect, useRef, useContext } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initCardGlow } from '../lib/hover';
import { StoryContext } from '../lib/scroll';

const BriefPreview = () => {
  const story = useContext(StoryContext);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const blocksRef = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const blocksWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanupCard = () => {};
    if (articleRef.current) {
      cleanupCard = initCardGlow(articleRef.current);
    }

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
      if (indicatorRef.current) {
        gsap.to(indicatorRef.current, {
          opacity: 1,
          duration: 1.5,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut"
        });
      }

      // analyst's rail: draws down the margin as the blocks are read.
      // Inside the horizontal story the same scrub is driven by the container
      // tween via horizontal trigger positions.
      if (railRef.current && blocksWrapRef.current) {
        gsap.fromTo(
          railRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: story
              ? {
                  trigger: blocksWrapRef.current,
                  containerAnimation: story,
                  start: 'left 85%',
                  end: 'left 30%',
                  scrub: 1,
                }
              : {
                  trigger: blocksWrapRef.current,
                  start: 'top 80%',
                  end: 'bottom 55%',
                  scrub: true,
                },
          }
        );
      }

      blocksRef.current.forEach((block, index) => {
        if (!block) return;
        const label = block.querySelector('.block-label');
        const body = block.querySelector('.block-body');

        // Blocks share one horizontal position, so the story mode staggers
        // them by offsetting each trigger window.
        const tl = gsap.timeline({
          scrollTrigger: story
            ? {
                trigger: block,
                containerAnimation: story,
                start: `left ${88 - index * 12}%`,
                end: `left ${64 - index * 12}%`,
                scrub: 1,
              }
            : {
                trigger: block,
                start: "top 80%",
                end: "top 60%",
                scrub: true,
              }
        });

        // scaleX in place of letterSpacing: same tightening read, but
        // transform-only — animating letter-spacing relayouts every frame.
        tl.fromTo(label,
          { scaleX: 1.12, opacity: 0, transformOrigin: '0% 50%' },
          { scaleX: 1, opacity: 1, ease: 'none', duration: 0.5 }
        ).fromTo(body,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, ease: 'none', duration: 0.5 },
          "<0.2"
        );
      });

      // Story-only entrance: the intro copy rises out of a slight blur as the
      // panel slides in, and the article headline settles just after. The card
      // itself keeps its IntersectionObserver fade (transform/opacity/filter
      // only — cheap, composited).
      if (story && ref.current) {
        const intro = ref.current.querySelectorAll('.bp-intro');
        gsap.fromTo(intro,
          { opacity: 0, y: 26, filter: 'blur(6px)', clipPath: 'inset(0% 0% 100% 0%)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            clipPath: 'inset(0% 0% 0% 0%)',
            stagger: 0.08,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: ref.current,
              containerAnimation: story,
              start: 'left 95%',
              end: 'left 45%',
              scrub: 1,
            },
          }
        );

        // Card unmasks bottom-up with a slight scale; inline transition:none
        // stops the class-based CSS transition from fighting the scrub.
        if (articleRef.current) {
          gsap.set(articleRef.current, { transition: 'none' });
          gsap.fromTo(articleRef.current,
            { clipPath: 'inset(0% 0% 100% 0% round 16px)', scale: 0.96, y: 30, rotation: 2.2 },
            {
              rotation: 0,
              clipPath: 'inset(0% 0% 0% 0% round 16px)',
              scale: 1,
              y: 0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ref.current,
                containerAnimation: story,
                start: 'left 90%',
                end: 'left 35%',
                scrub: 1,
              },
            }
          );
        }

        const title = articleRef.current?.querySelector('h3');
        if (title) {
          gsap.fromTo(title,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: ref.current,
                containerAnimation: story,
                start: 'left 82%',
                end: 'left 40%',
                scrub: 1,
              },
            }
          );
        }
      }
    });

    return () => {
      observer.disconnect();
      mm.revert();
      cleanupCard();
    };
  }, [story]);

  const blocks = [
    {
      label: 'What happened',
      body: 'Warsaw announced expanded checks at the two remaining Belarus crossings on 12 July, citing renewed instrumentalized-migration activity. Freight transit continues, with reported delays of 9–14 hours.',
    },
    {
      label: 'Why it matters',
      body: 'The move narrows one of the last land corridors for EU–Belarus trade and raises the cost of escalation for Minsk before the August transit talks. Retaliation against Polish hauliers would be consistent with past responses.',
    },
    {
      label: 'Watch next',
      body: 'A Belarusian customs response within 7–10 days; EU Council language on border instrumentalization at the 24 July session.',
    },
  ];

  return (
    <section id="preview" className="relative w-full lg:min-h-screen py-16 md:py-20 px-6 lg:px-12 flex items-center justify-center overflow-hidden">
      <div
        className="absolute right-0 top-1/4 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 50%, rgba(135,200,245,0.05), transparent 65%)' }}
      />
      {/* Editorial split: oversized headline left, the artifact right, offset
          off-center for a keynote read. */}
      {/* Mirrored spread: card leads on the left, headline rides right. */}
      <div ref={ref} className="w-full max-w-[1480px] relative lg:grid lg:grid-cols-[62fr_38fr] lg:gap-x-12 xl:gap-x-16 lg:items-center">
        <div className="mb-12 lg:mb-0 lg:-mt-10 lg:order-2 lg:text-right">
          <p className="bp-intro font-inter text-white/40 text-xs tracking-[0.3em] uppercase">
            Product preview
          </p>
          <h2 className="bp-intro font-instrument text-4xl md:text-5xl xl:text-[56px] leading-[1.08] tracking-tight text-white mt-6 max-w-xl lg:ml-auto">
            One item from the <span className="italic">Daily Brief</span>
          </h2>
          <p className="bp-intro font-inter text-white/50 text-sm mt-6">
            Sample item, shown in the real format.
          </p>
        </div>

        <div className="relative lg:mt-12 lg:order-1">
          {/* backlight: the card sits in its own pool of light */}
          <div
            aria-hidden="true"
            className="absolute -inset-10 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(135,200,245,0.07), transparent 70%)' }}
          />
        <article
          ref={articleRef}
          className={`relative liquid-glass rounded-2xl p-10 md:p-14 w-full transition-all duration-[900ms] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[28px]'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            transitionDelay: '150ms',
            boxShadow:
              '0 40px 90px -25px rgba(0,0,0,0.6), 0 0 50px rgba(135,200,245,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-inter text-white/40 text-sm tracking-wide">Daily Brief · 12 July 2026</span>
            <span ref={indicatorRef} data-story-fg className="font-inter text-[13px] tracking-wide text-white/70 border border-white/15 rounded-full px-3 py-1 opacity-70">
              Indicator: border friction (elevated)
            </span>
          </div>

          <h3 className="font-instrument text-white text-2xl md:text-[34px] leading-snug mt-6">
            Poland tightens Belarus border regime ahead of transit talks
          </h3>

          <div ref={blocksWrapRef} className="mt-8 space-y-7 relative pl-5">
            <div
              ref={railRef}
              aria-hidden="true"
              className="absolute left-0 top-1 bottom-1 w-px bg-white/15 origin-top motion-reduce:hidden"
              style={{ transform: 'scaleY(0)' }}
            />
            {blocks.map((b, index) => (
              <div key={b.label} ref={(el) => { blocksRef.current[index] = el; }}>
                <div className="block-label font-inter text-white/40 text-[13px] font-semibold uppercase">
                  {b.label}
                </div>
                <p className="block-body font-inter text-white/75 text-sm leading-relaxed mt-2">{b.body}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-8 pt-5">
            <p className="font-inter text-white/35 text-sm leading-relaxed">
              Sources: PAP · Polish MSWiA statement · Belta (state media); corroboration: two independent, one state.
            </p>
          </div>
        </article>
        </div>
      </div>
    </section>
  );
};

export default BriefPreview;
