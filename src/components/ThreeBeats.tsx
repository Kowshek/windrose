import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initCardGlow } from '../lib/hover';
import EuropeSignalMap, { SignalEvent } from './visuals/EuropeSignalMap';
import { CITIES, MAP_W, MAP_H } from './visuals/europe-dots';
import TriageVisual from './visuals/TriageVisual';
import MethodVisual from './visuals/MethodVisual';

const EVENTS: SignalEvent[] = [
  { city: 'warsaw', title: 'Belarus border checks expanded', date: 'Live', level: 'elevated' },
  { city: 'brussels', title: 'EU Council · instrumentalization language', date: '24 Jul', level: 'watch' },
  { city: 'minsk', title: 'Customs retaliation window', date: '7–10 d', level: 'watch' },
  { city: 'belgrade', title: 'Protest cycle · accession talks', date: 'Ongoing', level: 'watch' },
  { city: 'istanbul', title: 'Black Sea corridor review', date: 'Sep', level: 'elevated' },
];

const cardReveal = (reduced: boolean) => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
});

/** Wide panel: the forward map with live signal list. */
const SeeAheadPanel = () => {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { amount: 0.35 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused || reduced) return;
    const id = setInterval(() => setActive((i) => (i + 1) % EVENTS.length), 3800);
    return () => clearInterval(id);
  }, [inView, paused, reduced]);

  return (
    <motion.div
      ref={panelRef}
      variants={cardReveal(!!reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="liquid-glass rounded-2xl p-8 md:p-10 w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-8 lg:gap-12 items-center">
        <div>
          <h3 className="font-instrument text-white text-2xl md:text-3xl">
            See <span className="italic">ahead</span>
          </h3>
          <p className="font-inter text-white/60 text-sm leading-relaxed mt-3 max-w-md">
            The events calendar and risk map show what is coming, not just what broke: summits,
            elections, deadlines, flashpoints.
          </p>

          <div
            className="mt-6 flex flex-col"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {EVENTS.map((ev, i) => {
              const isActive = i === active;
              return (
                <button
                  key={ev.city}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`flex flex-wrap sm:flex-nowrap items-center gap-x-3 text-left w-full rounded-xl px-3 py-2.5 -mx-3 transition-colors duration-300 ${
                    isActive ? 'bg-white/[0.05]' : 'bg-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="order-1 font-inter text-[11px] tabular-nums text-white/40 w-14 shrink-0">
                    {ev.date}
                  </span>
                  <span
                    className={`order-3 w-full mt-1 sm:order-2 sm:w-auto sm:mt-0 sm:flex-1 min-w-0 font-inter text-sm leading-snug break-words transition-colors duration-300 ${
                      isActive ? 'text-white/95' : 'text-white/60'
                    }`}
                  >
                    {ev.title}
                  </span>
                  <span
                    className={`order-2 ml-auto sm:order-3 sm:ml-0 font-inter text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border shrink-0 ${
                      ev.level === 'elevated'
                        ? 'border-white/30 text-white/80'
                        : 'border-white/12 text-white/45'
                    }`}
                  >
                    {ev.level}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="order-first lg:order-last flex justify-center">
          <div className="relative w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px]">
            <EuropeSignalMap events={EVENTS} active={active} live={inView} className="w-full" />
            {/* floating label pinned to the active signal (desktop) */}
            <AnimatePresence mode="wait">
              {(() => {
                const pos = CITIES[EVENTS[active].city];
                if (!pos) return null;
                const flip = pos[0] > MAP_W * 0.55;
                return (
                  <motion.div
                    key={active}
                    className="hidden lg:block absolute pointer-events-none"
                    style={{
                      left: `${(pos[0] / MAP_W) * 100}%`,
                      top: `${(pos[1] / MAP_H) * 100}%`,
                    }}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
                    transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="whitespace-nowrap rounded-full border border-white/15 bg-[#05070d]/85 backdrop-blur-sm px-3 py-1 font-inter text-[11px] text-white/80"
                      style={{
                        transform: flip
                          ? 'translate(calc(-100% - 14px), -50%)'
                          : 'translate(14px, -50%)',
                      }}
                    >
                      {EVENTS[active].title}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BeatCard = ({
  title,
  titleItalic,
  body,
  children,
}: {
  title: string;
  titleItalic: string;
  body: string;
  children: React.ReactNode;
}) => {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) return initCardGlow(cardRef.current);
  }, []);

  return (
    <motion.div
      variants={cardReveal(!!reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div ref={cardRef} className="liquid-glass rounded-2xl p-8 h-full flex flex-col gap-5">
        {children}
        <h3 className="font-instrument text-white text-2xl md:text-[28px] mt-auto">
          {title} <span className="italic">{titleItalic}</span>
        </h3>
        <p className="font-inter text-white/60 text-sm leading-relaxed">{body}</p>
      </div>
    </motion.div>
  );
};

const ThreeBeats = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!headingRef.current) return;
      const words = headingRef.current.querySelectorAll('.word');
      gsap.fromTo(
        words,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            end: 'bottom 60%',
            scrub: true,
          },
        }
      );
    });

    return () => mm.revert();
  }, []);

  const headingWords = ['Built', 'for', 'people', 'who', 'read', 'the', 'world', 'for', 'a', 'living'];

  return (
    <section id="beats" className="relative w-full bg-[#05070d] py-24 md:py-32 px-6 flex justify-center overflow-hidden">
      {/* Atmosphere echo from the hero's earth glow */}
      <div
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(120,185,230,0.07), transparent 60%)' }}
      />
      <div className="w-full max-w-6xl flex flex-col items-center relative">
        <h2
          ref={headingRef}
          className="font-instrument text-3xl md:text-5xl text-center text-white mb-16 max-w-3xl flex flex-wrap justify-center gap-x-[0.25em]"
        >
          {headingWords.map((w, i) => (
            <span key={i} className="word inline-block">
              {w}
            </span>
          ))}
          <span className="word inline-block italic">or want to.</span>
        </h2>

        <div className="w-full flex flex-col gap-6">
          <SeeAheadPanel />
          <div className="grid md:grid-cols-2 gap-6">
            <BeatCard
              title="Stop drowning in"
              titleItalic="headlines"
              body="5–8 items a day, each with what happened, why it matters, and what to watch. The triage is done before you open it."
            >
              <TriageVisual />
            </BeatCard>
            <BeatCard
              title="Learn the"
              titleItalic="craft"
              body="Every brief shows its sourcing and method, teaching the same tradecraft the profession uses as you read."
            >
              <MethodVisual />
            </BeatCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeBeats;
