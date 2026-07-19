import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
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

// Chapter pacing: each element enters on its own beat instead of the whole
// block at once. Text leads, data rows follow one by one, visuals resolve last.
const fadeUp = (reduced: boolean, delay = 0) => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    ...(reduced ? {} : { filter: 'blur(0px)' }),
    transition: { duration: reduced ? 0 : 0.85, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  },
});

// Delayed visual: settles out of a blur after the copy has landed.
const visualReveal = (reduced: boolean, delay = 0.45) => ({
  hidden: reduced ? { opacity: 1 } : { opacity: 0, scale: 0.97, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    ...(reduced ? {} : { scale: 1, filter: 'blur(0px)' }),
    transition: { duration: reduced ? 0 : 1.1, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  },
});

/** Orchestrator wrapper: carries whileInView, children own their variants. */
const chapter = { hidden: {}, show: {} };

// Watchlist semantics: an event row is a log entry appended to the feed —
// it slides in from the margin, no blur, like a line being written.
const logEntry = (reduced: boolean, delay = 0) => ({
  hidden: reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: reduced ? 0 : 0.6, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  },
});

// Classification stamp: the level badge lands after its row exists — the
// entry is logged first, then triaged.
const stamp = (reduced: boolean, delay = 0) => ({
  hidden: reduced ? { opacity: 1 } : { opacity: 0, scale: 1.3 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: reduced ? 0 : 0.35, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  },
});

/** First beat: the forward map with live signal list — open editorial block. */
const SeeAheadPanel = () => {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { amount: 0.35 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [events, setEvents] = useState<SignalEvent[]>([...EVENTS]);
  const [flashed, setFlashed] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || paused || reduced) return;
    const id = setInterval(() => setActive((i) => (i + 1) % events.length), 3800);
    return () => clearInterval(id);
  }, [inView, paused, reduced, events.length]);

  // Scripted intel updates — deterministic and one-shot, not random: the desk
  // raises a level, narrows a window, then a new indicator surfaces (and its
  // pin appears on the map). Runs once per visit, starting when first seen.
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const flash = (i: number) => {
      setFlashed(i);
      timers.push(setTimeout(() => setFlashed(null), 1600));
    };
    const patch = (i: number, p: Partial<SignalEvent>) => {
      setEvents((e) => e.map((ev, j) => (j === i ? { ...ev, ...p } : ev)));
      flash(i);
    };
    timers.push(
      setTimeout(() => patch(2, { level: 'elevated' }), 9000),
      setTimeout(() => patch(2, { date: '6–9 d' }), 21000),
      setTimeout(() => {
        setEvents((e) => [
          ...e,
          { city: 'chisinau', title: 'Campaign finance rules tightened', date: 'New', level: 'watch' },
        ]);
        flash(5);
      }, 32000)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <motion.div
      ref={panelRef}
      variants={chapter}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-16 items-center">
        <div>
          <motion.h3 variants={fadeUp(!!reduced)} className="font-instrument text-white text-3xl md:text-4xl">
            See <span className="italic">ahead</span>
          </motion.h3>
          <motion.p variants={fadeUp(!!reduced, 0.15)} className="font-inter text-white/60 text-[15px] leading-[1.7] mt-5 max-w-md">
            The events calendar and risk map show what is coming, not just what broke: summits,
            elections, deadlines, flashpoints.
          </motion.p>

          <div
            className="mt-8 flex flex-col"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {events.map((ev, i) => {
              const isActive = i === active;
              return (
                <motion.button
                  key={ev.city}
                  variants={logEntry(!!reduced, 0.3 + i * 0.09)}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex flex-wrap sm:flex-nowrap items-center gap-x-3 text-left w-full rounded-xl px-3 py-3 sm:py-2.5 -mx-3 transition-colors duration-300 ${
                    isActive ? 'bg-white/[0.05]' : 'bg-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`order-1 font-inter text-[13px] tabular-nums w-14 shrink-0 transition-colors duration-700 ${
                      flashed === i ? 'text-white/90' : 'text-white/40'
                    }`}
                  >
                    {ev.date}
                  </span>
                  <span
                    className={`order-3 w-full mt-1 sm:order-2 sm:w-auto sm:mt-0 sm:flex-1 min-w-0 font-inter text-sm leading-snug break-words transition-colors duration-300 ${
                      isActive ? 'text-white/95' : 'text-white/60'
                    }`}
                  >
                    {ev.title}
                  </span>
                  <motion.span
                    variants={stamp(!!reduced, 0.62 + i * 0.09)}
                    className={`order-2 ml-auto sm:order-3 sm:ml-0 wr-level transition-colors duration-700 ${
                      flashed === i
                        ? 'border-white/60 text-white'
                        : ev.level === 'elevated'
                        ? 'border-white/30 text-white/80'
                        : 'border-white/12 text-white/45'
                    }`}
                  >
                    {ev.level}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="order-first lg:order-last flex justify-center">
          <motion.div
            variants={visualReveal(!!reduced, 0.55)}
            className="relative w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[440px]"
          >
            <EuropeSignalMap events={events} active={active} live={inView} className="w-full" />
            {/* floating label pinned to the active signal (desktop) */}
            <AnimatePresence mode="wait">
              {(() => {
                const pos = CITIES[events[active].city];
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
                      className="wr-chip backdrop-blur-sm px-3 py-1 text-[13px] text-white/80"
                      style={{
                        transform: flip
                          ? 'translate(calc(-100% - 14px), -50%)'
                          : 'translate(14px, -50%)',
                      }}
                    >
                      {events[active].title}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

/** Open editorial beat: visual, serif title, short body. No box, no border. */
const Beat = ({
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

  return (
    <motion.div
      variants={chapter}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="flex flex-col h-full"
    >
      {/* the visual resolves after the words have made the claim */}
      <motion.div variants={visualReveal(!!reduced)} className="min-h-[180px]">
        {children}
      </motion.div>
      <motion.h3 variants={fadeUp(!!reduced)} className="font-instrument text-white text-2xl md:text-[32px] pt-6">
        {title} <span className="italic">{titleItalic}</span>
      </motion.h3>
      <motion.p variants={fadeUp(!!reduced, 0.15)} className="font-inter text-white/60 text-[15px] leading-[1.7] mt-4 max-w-md">
        {body}
      </motion.p>
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
    <section id="beats" className="relative w-full pt-20 pb-28 md:pt-36 md:pb-48 px-6 lg:px-12 flex justify-center overflow-hidden">
      {/* Atmosphere echo from the hero's earth glow */}
      <div
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(120,185,230,0.07), transparent 60%)' }}
      />
      {/* Editorial split: sticky heading rail left, the three beats right. */}
      <div className="w-full max-w-[1400px] relative lg:grid lg:grid-cols-[35fr_65fr] lg:gap-x-20 xl:gap-x-28 lg:items-start">
        <div className="lg:sticky lg:top-32 lg:self-start mb-12 lg:mb-0">
          <h2
            data-story-fg
            ref={headingRef}
            className="font-instrument text-4xl md:text-5xl xl:text-[64px] leading-[1.05] tracking-tight text-white flex flex-wrap gap-x-[0.25em]"
          >
            {headingWords.map((w, i) => (
              <span key={i} className="word inline-block">
                {w}
              </span>
            ))}
            <span className="word inline-block italic">or want to.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-16 md:gap-24">
          <SeeAheadPanel />
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
            <Beat
              title="Stop drowning in"
              titleItalic="headlines"
              body="5–8 items a day, each with what happened, why it matters, and what to watch. The triage is done before you open it."
            >
              <TriageVisual />
            </Beat>
            <Beat
              title="Learn the"
              titleItalic="craft"
              body="Every brief shows its sourcing and method, teaching the same tradecraft the profession uses as you read."
            >
              <MethodVisual />
            </Beat>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeBeats;
