import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SignalDot from './visuals/SignalDot';

/** Media where the noise→signal cinema pins and plays. Must stay in lockstep
 *  with the .sf-cinema/.sf-stage block in index.css. */
const SIGNAL_MEDIA = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';

/** The five rows the noise resolves into — same world as EVENTS/RadarTicker. */
const SIGNALS = [
  { title: 'Belarus border checks expanded', level: 'Elevated', proof: '3 sources', live: true },
  { title: 'EU Council · instrumentalization language', level: 'Watch', proof: '24 Jul', live: false },
  { title: 'Black Sea corridor review', level: 'Elevated', proof: '2 sources', live: true },
  { title: 'Moldova election · interference tempo', level: 'Watch', proof: '4 sources', live: false },
  { title: 'Serbia protest cycle · accession talks', level: 'Watch', proof: 'Ongoing', live: false },
];

const NOISE = [
  'Poland expands checks at two Belarus crossings',
  'Minsk warns of proportionate response',
  'EU Council drafts instrumentalization language',
  'Freight delays reach 14 hours at Terespol',
  'Warsaw summons Belarus chargé d’affaires',
  'Belarus state TV airs new border footage',
  'Moldova reports fresh disinformation wave',
  'Chișinău tightens campaign finance rules',
  'Serbia protest organizers call eighth march',
  'Belgrade accession talks stall on media law',
  'Black Sea grain transit volumes dip 9%',
  'Ankara signals September corridor review',
  'NATO northern-flank exercise adds two brigades',
  'Finland closes two more eastern crossings',
  'French budget vote pushed to Thursday',
  'German coalition splits on export rule',
  'Baltic cable operator reports anomaly',
  'Estonia expels two diplomats',
  'Hungary blocks council statement',
  'Slovak truckers plan border protest',
  'Frontex logs 40% rise on eastern route',
  'Kaliningrad transit talks to resume',
  'Vilnius airport suspends morning flights',
  'Latvia extends border emergency',
  'EU envoys meet on visa suspension',
  'Kosovo licence-plate dispute flares again',
  'Greece–Turkey exploratory talks resume',
  'Drone sighting closes regional airport',
  'Cyber incident hits municipal services',
  'Farmers block motorway near border',
  'UPDATE 2: Poland tightens border regime',
  'RPT: Minsk warns of response to border moves',
  'Poland border: what we know so far',
  'Explainer: why the Belarus border matters',
  'Opinion: Europe’s border theater returns',
  'Live blog: EU Council, day two',
  'Analysis: what the council draft really says',
  'Border story trends on social platforms',
  'Fact check: viral border video is from 2021',
  'In photos: queues at the Terespol crossing',
  'Podcast: the new eastern frontier',
  'Newsletter: five stories to start your day',
  'Futures edge higher ahead of CPI print',
  'Oil slips as inventories build',
  'Zloty firms against euro in early trade',
  'Tech giant beats on cloud revenue',
  'Chip stocks rally for third session',
  'Bitcoin holds above key level',
  'Airline cancels 200 flights on strike day',
  'Heat wave grips southern Europe',
  'Storm front moves across the Baltics',
  'Champions League draw announced',
  'Transfer window: striker linked with move',
  'Seed advances in straight sets',
  'Box office: sequel tops the weekend',
  'Streaming platform raises prices again',
  'Celebrity couple announces split',
  'Viral recipe divides the internet',
  'Flagship phone leaks in hands-on video',
  'Automaker recalls 300,000 vehicles',
  'Retailer warns on holiday quarter',
  'Rate decision looms for central bank',
  'Poll: coalition support slips two points',
  'Minister denies leadership challenge',
  'Rail strike enters second day',
  'Energy prices tick up on cold snap',
];

const WIRES = ['PAP', 'Reuters', 'AFP', 'dpa', 'AP', 'ANSA', 'EFE', 'Interfax', 'BNS', 'MTI'];

/** Deterministic pseudo-random — layout is stable across renders and refreshes. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Field cells whose text is a real signal: they survive the collapse. */
const KEEPERS: Partial<Record<number, number>> = { 27: 0, 41: 1, 66: 2, 80: 3, 99: 4 };

/** Duplicate coverage: noise cells that converge into (are absorbed by) a keeper. */
const MERGES: ReadonlyArray<readonly [number, number[]]> = [
  [27, [3, 15, 50, 74]],
  [66, [30, 58, 90, 112]],
  [99, [8, 44, 83, 107]],
];

/** Corroboration web drawn between the five keepers before the collapse. */
const LINKS: ReadonlyArray<readonly [number, number]> = [
  [27, 41], [41, 66], [66, 80], [80, 99], [27, 66],
];

/** 120 headlines on a jittered 12×10 grid; %-coordinates of the field. */
const FIELD = Array.from({ length: 120 }, (_, i) => {
  const col = i % 12;
  const row = (i / 12) | 0;
  const keep = KEEPERS[i];
  const tier = rand(i, 3);
  let text = keep !== undefined ? SIGNALS[keep].title : NOISE[(i * 7) % NOISE.length];
  if (keep === undefined && rand(i, 4) > 0.72) text = `${WIRES[(i * 3) % WIRES.length]}: ${text}`;
  return {
    text,
    x: ((col + 0.5) / 12) * 100 + (rand(i, 1) - 0.5) * 6,
    y: ((row + 0.5) / 10) * 100 + (rand(i, 2) - 0.5) * 7,
    size: keep !== undefined ? 12.5 : tier < 0.4 ? 10 : tier < 0.8 ? 11 : 12.5,
    o: keep !== undefined ? 0.5 : tier < 0.4 ? 0.2 : tier < 0.8 ? 0.3 : 0.42,
    keep,
  };
});

/**
 * Signature moment: the wire firehose floods the screen, then collapses into
 * the five verified signals of the brief — the triage, performed. Own vertical
 * pin between RadarTicker and the horizontal story; nothing here touches the
 * story's containerAnimation machinery. Transform/opacity only.
 */
const NoiseToSignal = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const keepsRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const capARef = useRef<HTMLSpanElement>(null);
  const capBRef = useRef<HTMLSpanElement>(null);
  const linesRef = useRef<SVGGElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(SIGNAL_MEDIA, () => {
      const section = sectionRef.current;
      const fieldEl = fieldRef.current;
      const keepsEl = keepsRef.current;
      const finalEl = finalRef.current;
      const numEl = numRef.current;
      if (!section || !fieldEl || !keepsEl || !finalEl || !numEl) return;

      const noise = Array.from(fieldEl.children) as HTMLElement[];
      const keeps = Array.from(keepsEl.children) as HTMLElement[];
      const head = finalEl.querySelectorAll('.sf-head');
      const rule = finalEl.querySelector('.sf-rule') as HTMLElement;
      const rows = finalEl.querySelectorAll('.sf-row');
      const proofs = finalEl.querySelectorAll('.sf-proof');
      const fi = (el: HTMLElement) => FIELD[Number(el.dataset.i)];

      // Initial states live here, not in CSS, so mobile / reduced motion / no-JS
      // all render the readable resolved composition untouched.
      gsap.set([...noise, ...keeps], { xPercent: -50, yPercent: -50, opacity: 0 });
      gsap.set([line1Ref.current, line2Ref.current], { yPercent: -50, opacity: 0 });
      gsap.set([counterRef.current, capBRef.current], { opacity: 0 });
      gsap.set(head, { opacity: 0, y: 28, filter: 'blur(6px)' });
      gsap.set(rule, { scaleX: 0 });
      gsap.set(rows, { opacity: 0, y: 24 });
      gsap.set(proofs, { opacity: 0 });

      // corroboration web: dash-prepped so each link can draw point-to-point
      const lineEls = Array.from(linesRef.current?.children ?? []) as SVGLineElement[];
      lineEls.forEach((el, idx) => {
        const [a, b] = LINKS[idx];
        const len = Math.hypot(FIELD[b].x - FIELD[a].x, FIELD[b].y - FIELD[a].y);
        gsap.set(el, { attr: { 'stroke-dasharray': len, 'stroke-dashoffset': len }, opacity: 0 });
      });

      const counter = { n: 0 };
      const fmt = () => {
        numEl.textContent = Math.round(counter.n).toLocaleString('en-US');
      };
      fmt();

      // % of field → px offsets; function-based so invalidateOnRefresh re-measures.
      const toX = (f: number) => (_: number, el: HTMLElement) =>
        ((50 - fi(el).x) / 100) * fieldEl.offsetWidth * f;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: '+=380%',
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1 · the feed floods in
      tl.fromTo(
        noise,
        { y: 18 },
        {
          y: 0,
          opacity: (_: number, el: HTMLElement) => fi(el).o,
          duration: 0.6,
          ease: 'power1.out',
          stagger: { each: 0.012, from: 'random' },
        },
        0
      )
        .fromTo(
          keeps,
          { y: 18 },
          { y: 0, opacity: 0.5, duration: 0.6, ease: 'power1.out', stagger: 0.15 },
          0.6
        )
        .fromTo(fieldEl, { y: 0 }, { y: -30, duration: 7.8, ease: 'none' }, 0)
        .to(counterRef.current, { opacity: 1, duration: 0.4 }, 0.3)
        .to(counter, { n: 14203, duration: 2, ease: 'power1.inOut', onUpdate: fmt }, 0.35)
        .fromTo(
          line1Ref.current,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          1.3
        )
        .to(line1Ref.current, { y: -26, opacity: 0, duration: 0.5, ease: 'power1.in' }, 3.0);

      // 2 · dedup — duplicate coverage converges into its keeper and is absorbed
      MERGES.forEach(([k, group], gi) => {
        const els = group
          .map((i) => fieldEl.querySelector(`[data-i="${i}"]`))
          .filter(Boolean) as HTMLElement[];
        tl.to(
          els,
          {
            x: (_: number, el: HTMLElement) =>
              ((FIELD[k].x - fi(el).x) / 100) * fieldEl.offsetWidth,
            y: (_: number, el: HTMLElement) =>
              ((FIELD[k].y - fi(el).y) / 100) * fieldEl.offsetHeight,
            opacity: 0,
            scale: 0.85,
            duration: 0.8,
            ease: 'power2.in',
            stagger: 0.06,
          },
          3.2 + gi * 0.15
        );
      });
      // the absorbing keepers strengthen; the funnel counter drops
      tl.to(keeps, { opacity: 0.75, duration: 0.4, stagger: 0.08 }, 3.95)
        .to(counter, { n: 8400, duration: 0.8, ease: 'power1.inOut', onUpdate: fmt }, 3.3)
        // 3 · filtering — the weak tier dims out of consideration
        .to(
          noise.filter((el) => fi(el).o <= 0.2),
          { opacity: 0.04, duration: 0.7, ease: 'power1.in', stagger: { each: 0.006, from: 'random' } },
          4.35
        )
        .to(counter, { n: 2900, duration: 0.7, ease: 'power1.inOut', onUpdate: fmt }, 4.45)
        // 4 · the refusal
        .fromTo(
          line2Ref.current,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          5.0
        )
        .to(line2Ref.current, { y: -26, opacity: 0, duration: 0.5, ease: 'power1.in' }, 6.2)
        // 5 · corroboration — the surviving signals connect
        .to(lineEls, { attr: { 'stroke-dashoffset': 0 }, opacity: 1, duration: 0.6, ease: 'power1.inOut', stagger: 0.08 }, 5.35)
        .to(lineEls, { opacity: 0, duration: 0.3, ease: 'none' }, 6.45)
        // 6 · the collapse — remaining noise dies inward, the five signals converge
        .to(
          noise,
          {
            x: toX(0.85),
            y: (_: number, el: HTMLElement) =>
              ((52 - fi(el).y) / 100) * fieldEl.offsetHeight * 0.85,
            opacity: 0,
            scale: 0.9,
            duration: 1.1,
            ease: 'power2.in',
            stagger: { each: 0.008, from: 'random' },
          },
          6.5
        )
        .to(
          keeps,
          {
            x: toX(1),
            y: (_: number, el: HTMLElement) =>
              ((44 + (fi(el).keep ?? 0) * 4.5 - fi(el).y) / 100) * fieldEl.offsetHeight,
            opacity: 0.95,
            duration: 1,
            ease: 'power2.inOut',
            stagger: 0.05,
          },
          6.55
        )
        .to(counter, { n: 5, duration: 1.5, ease: 'power2.out', onUpdate: fmt }, 6.7)
        .to(capARef.current, { opacity: 0, duration: 0.35 }, 7.25)
        .to(capBRef.current, { opacity: 1, duration: 0.35 }, 7.3)
        // 7 · the brief resolves
        .to(head, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out', stagger: 0.1 }, 7.2)
        .to(rule, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 7.55)
        .to(keeps, { opacity: 0, duration: 0.3, ease: 'power1.in', stagger: 0.04 }, 7.65)
        .to(rows, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.14 }, 7.7)
        .to(proofs, { opacity: 1, duration: 0.4, ease: 'none', stagger: 0.08 }, 8.25)
        // long linger — the resolved brief holds while the reader takes it in
        .to({}, { duration: 2.8 }, 9.4);
    });

    // Below the cinema breakpoint the composition still reads as a chapter:
    // headline, rule, then the five rows surface one by one on scroll.
    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      const finalEl = finalRef.current;
      if (!finalEl) return;
      gsap.fromTo(
        finalEl.querySelectorAll('.sf-head, .sf-rule, .sf-row'),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: { trigger: finalEl, start: 'top 80%' },
        }
      );
    });

    return () => mm.revert();
  }, []);

  const fieldSpan = (f: (typeof FIELD)[number], i: number) => (
    <span
      key={i}
      data-i={i}
      className="absolute font-inter text-white whitespace-nowrap leading-none"
      style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: f.size, opacity: 0 }}
    >
      {f.text}
    </span>
  );

  return (
    <section id="signal" ref={sectionRef} className="sf-stage relative w-full overflow-hidden py-20 md:py-32">
      {/* Cinema layers — pure narrative theater, hidden from AT and touch/reduced */}
      <div className="sf-cinema pointer-events-none" aria-hidden="true">
        <div ref={fieldRef} className="absolute inset-0 will-change-transform">
          {FIELD.map((f, i) => (f.keep === undefined ? fieldSpan(f, i) : null))}
        </div>
        {/* vignette keeps the serif lines readable over the field */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(5,7,13,0.9), rgba(5,7,13,0.35) 55%, transparent 78%)',
          }}
        />
        {/* corroboration web: draws between the keepers just before the collapse */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <g ref={linesRef} stroke="#c8e6ff" strokeOpacity="0.16" strokeWidth="1" fill="none">
            {LINKS.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={FIELD[a].x}
                y1={FIELD[a].y}
                x2={FIELD[b].x}
                y2={FIELD[b].y}
                opacity="0"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </svg>
        {/* the five real signals ride above the vignette — visible in the noise all along */}
        <div ref={keepsRef} className="absolute inset-0">
          {FIELD.map((f, i) => (f.keep !== undefined ? fieldSpan(f, i) : null))}
        </div>
        <p
          ref={line1Ref}
          className="absolute inset-x-0 top-1/2 text-center px-6 font-instrument text-white text-3xl md:text-6xl tracking-tight"
        >
          The world produces <span className="italic">thousands</span> of headlines.
        </p>
        <p
          ref={line2Ref}
          className="absolute inset-x-0 top-1/2 text-center px-6 font-instrument text-white text-3xl md:text-6xl tracking-tight"
        >
          Analysts don&rsquo;t need <span className="italic">more headlines.</span>
        </p>
        <div ref={counterRef} className="absolute inset-x-0 bottom-10 flex justify-center items-baseline gap-3 font-inter">
          <span ref={numRef} className="text-white/70 text-sm tabular-nums text-right min-w-[6ch]">
            0
          </span>
          <span className="relative text-white/35 text-[12px] uppercase tracking-[0.22em]">
            <span ref={capARef}>headlines · last 24 hours</span>
            <span ref={capBRef} className="absolute left-0 top-0 whitespace-nowrap">
              signals in tomorrow&rsquo;s brief
            </span>
          </span>
        </div>
      </div>

      {/* The resolved brief — the real content; renders statically outside the cinema */}
      <div ref={finalRef} className="relative z-20 w-full max-w-2xl mx-auto px-6">
        {/* Mobile-only setup: the cinema's two serif lines don't exist <768px,
            so "They" needs its antecedent spoken here. */}
        <p className="sf-head md:hidden font-inter text-white/60 text-[15px] leading-[1.7] mb-4 max-w-[40ch]">
          The world produces thousands of headlines a day. Analysts don&rsquo;t need more headlines.
        </p>
        <h2 className="sf-head font-instrument text-white text-4xl md:text-[72px] leading-[1.05] tracking-tight">
          They need <span className="italic">signals.</span>
        </h2>
        <div className="sf-rule origin-left h-px bg-white/15 mt-10" aria-hidden="true" />
        <ul className="mt-2">
          {SIGNALS.map((s) => (
            <li key={s.title} className="sf-row flex items-center gap-3 sm:gap-4 py-4 border-b border-white/5 last:border-0">
              <SignalDot live={s.live} className="w-1.5 h-1.5" />
              <span className="font-inter text-[15px] text-white/85 flex-1 min-w-0">{s.title}</span>
              <span className="sf-proof font-inter text-[13px] text-white/35 tabular-nums whitespace-nowrap">
                {s.proof}
              </span>
              <span
                className={`sf-proof wr-level ${
                  s.level === 'Elevated' ? 'border-white/30 text-white/80' : 'border-white/12 text-white/45'
                }`}
              >
                {s.level}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default NoiseToSignal;
