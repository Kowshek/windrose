import { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import { DOTS, CITIES, MAP_W, MAP_H } from './europe-dots';

export type SignalEvent = {
  city: keyof typeof CITIES | string;
  title: string;
  date: string;
  level: 'watch' | 'elevated';
};

const DOT_R = 0.52;

/** Cities the ambient layer can flare at — the ones not pinned by EVENTS. */
const AMBIENT = [
  'kyiv', 'berlin', 'paris', 'london', 'rome',
  'madrid', 'stockholm', 'vienna', 'helsinki', 'chisinau',
] as const;

/** All land dots as one path element: keeps the DOM at a handful of nodes. */
const buildDotsPath = () =>
  DOTS.map(
    ([x, y]) =>
      `M${(x - DOT_R).toFixed(1)},${y}a${DOT_R},${DOT_R} 0 1,0 ${DOT_R * 2},0a${DOT_R},${DOT_R} 0 1,0 ${-DOT_R * 2},0`
  ).join('');

type Props = {
  events: SignalEvent[];
  active: number;
  /** When false (section offscreen), continuous animations idle to save main-thread work. */
  live?: boolean;
  className?: string;
};

/**
 * Dot-matrix Europe (rasterized from world-atlas 110m) with live signal pins.
 * The active pin gets crosshairs and expanding radar rings; a soft satellite
 * sweep pans the map. Dawn Signal appears only as glow, per the design system.
 */
const EuropeSignalMap = ({ events, active, live = true, className = '' }: Props) => {
  const reduced = useReducedMotion();
  const dotsPath = useMemo(buildDotsPath, []);
  const activeEvent = events[active];
  const activePos = activeEvent ? CITIES[activeEvent.city] : undefined;
  const ambientRef = useRef<SVGGElement>(null);
  const sweepRef = useRef<SVGRectElement>(null);

  // Living intelligence layer: transient signals flare across the map, the
  // sweep uncovers new ones as it passes, and corroboration lines briefly
  // link concurrent signals. Pooled nodes + GSAP, all gated on live/reduced.
  useEffect(() => {
    const g = ambientRef.current;
    const sw = sweepRef.current;
    if (reduced || !live || !g || !sw) return;

    const R = gsap.utils.random;
    const circles = Array.from(g.querySelectorAll('circle'));
    const line = g.querySelector('line');
    type M = { el: Element; alive: boolean; x: number; y: number; tl?: gsap.core.Timeline };
    const ms: M[] = circles.map((el) => ({ el, alive: false, x: 0, y: 0 }));
    let running = true;
    let sweepTl: gsap.core.Timeline | undefined;
    let lineTl: gsap.core.Timeline | undefined;
    let lineCall: gsap.core.Tween | undefined;

    // soft breathing on every pooled marker; invisible while opacity is 0
    const pulse = gsap.to(circles, {
      attr: { r: 0.85 },
      duration: () => R(0.9, 1.5),
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: 0.3,
    });

    const spot = () => {
      const [bx, by] = CITIES[AMBIENT[Math.floor(R(0, AMBIENT.length))]];
      return [bx + R(-2.5, 2.5), by + R(-2.5, 2.5)] as const;
    };

    // one transient signal: appear at a jittered city, hold, fade out
    const appear = (m: M, delay: number, p = spot(), onDone?: () => void) => {
      m.x = p[0];
      m.y = p[1];
      const hold = R(2, 4.5);
      m.tl = gsap
        .timeline({ delay, onComplete: () => { if (running) onDone?.(); } })
        .set(m.el, { attr: { cx: m.x, cy: m.y } })
        .call(() => { m.alive = true; })
        .to(m.el, { opacity: R(0.28, 0.5), duration: 0.7, ease: 'power1.out' })
        .call(() => { m.alive = false; }, [], 0.7 + hold)
        .to(m.el, { opacity: 0, duration: 0.9, ease: 'power1.in' }, 0.7 + hold);
    };

    // markers 0–3 cycle on their own clocks
    const cycle = (m: M) => appear(m, R(0.5, 6), spot(), () => cycle(m));
    ms.slice(0, 4).forEach(cycle);

    // markers 4–5 are sweep-revealed: they light up as the band crosses them
    const sweepPass = (first: boolean) => {
      const lead = first ? 1 : 3;
      sweepTl = gsap
        .timeline({ delay: lead, onComplete: () => { if (running) sweepPass(false); } })
        .fromTo(sw, { attr: { y: -16 } }, { attr: { y: MAP_H + 4 }, duration: 8.5, ease: 'none' });
      ms.slice(4).forEach((m) => {
        if (m.alive || Math.random() < 0.4) return;
        const p = spot();
        appear(m, lead + ((p[1] + 16) / (MAP_H + 20)) * 8.5, p);
      });
    };
    sweepPass(true);

    // occasionally, two concurrent signals corroborate
    const lineLoop = () => {
      if (!running || !line) return;
      const alive = ms.filter((m) => m.alive);
      if (alive.length >= 2 && Math.random() < 0.75) {
        const i = Math.floor(R(0, alive.length));
        let j = Math.floor(R(0, alive.length - 1));
        if (j >= i) j += 1;
        const a = alive[i];
        const b = alive[j];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        lineTl = gsap
          .timeline()
          .set(line, {
            attr: { x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'stroke-dasharray': len, 'stroke-dashoffset': len },
            opacity: 0,
          })
          .to(line, { opacity: 0.2, duration: 0.4 })
          .to(line, { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power1.inOut' }, 0)
          .to(line, { opacity: 0, duration: 0.7 }, '+=1.4');
      }
      lineCall = gsap.delayedCall(R(6, 12), lineLoop);
    };
    lineCall = gsap.delayedCall(R(4, 8), lineLoop);

    return () => {
      running = false;
      pulse.kill();
      sweepTl?.kill();
      lineTl?.kill();
      lineCall?.kill();
      ms.forEach((m) => m.tl?.kill());
      gsap.set([...circles, line, sw], { clearProps: 'all' });
      gsap.set(sw, { attr: { y: -16 } });
    };
  }, [reduced, live]);

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className={className}
      role="img"
      aria-label="Dot-matrix map of Europe showing locations Windrose is currently monitoring"
    >
      <defs>
        <radialGradient id="wr-map-fade" cx="46%" cy="52%" r="68%">
          <stop offset="55%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="wr-map-mask">
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#wr-map-fade)" />
        </mask>
        <linearGradient id="wr-sweep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87c8f5" stopOpacity="0" />
          <stop offset="50%" stopColor="#87c8f5" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#87c8f5" stopOpacity="0" />
        </linearGradient>
        <filter id="wr-pin-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g mask="url(#wr-map-mask)">
        {/* faint graticule */}
        <g stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.25" strokeDasharray="0.8 2.4">
          <line x1="0" y1="30" x2={MAP_W} y2="30" />
          <line x1="0" y1="62" x2={MAP_W} y2="62" />
          <line x1="0" y1="94" x2={MAP_W} y2="94" />
          <line x1="26" y1="0" x2="26" y2={MAP_H} />
          <line x1="58" y1="0" x2="58" y2={MAP_H} />
        </g>

        {/* the continent */}
        <path d={dotsPath} fill="#ffffff" fillOpacity="0.16" />

        {/* living layer: pooled transient signals + corroboration line (GSAP) */}
        <g ref={ambientRef} aria-hidden="true">
          <line stroke="#c8e6ff" strokeWidth="0.3" opacity="0" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} r="0.55" cx="-5" cy="-5" fill="#ffffff" opacity="0" />
          ))}
        </g>

        {/* satellite sweep (GSAP-driven so reveals can sync to the band) */}
        <rect ref={sweepRef} x="0" y="-16" width={MAP_W} height="16" fill="url(#wr-sweep)" />
      </g>

      {/* crosshairs on the active signal */}
      {activePos && (
        <motion.g
          key={`xh-${active}`}
          stroke="#ffffff"
          strokeOpacity="0.14"
          strokeWidth="0.3"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <line x1={activePos[0] - 9} y1={activePos[1]} x2={activePos[0] - 3} y2={activePos[1]} />
          <line x1={activePos[0] + 3} y1={activePos[1]} x2={activePos[0] + 9} y2={activePos[1]} />
          <line x1={activePos[0]} y1={activePos[1] - 9} x2={activePos[0]} y2={activePos[1] - 3} />
          <line x1={activePos[0]} y1={activePos[1] + 3} x2={activePos[0]} y2={activePos[1] + 9} />
        </motion.g>
      )}

      {/* signal pins */}
      {events.map((ev, i) => {
        const pos = CITIES[ev.city];
        if (!pos) return null;
        const isActive = i === active;
        return (
          <g key={ev.city}>
            {isActive && !reduced && live && (
              <>
                <motion.circle
                  key={`ring-a-${active}`}
                  cx={pos[0]}
                  cy={pos[1]}
                  fill="none"
                  stroke="#87c8f5"
                  strokeWidth="0.35"
                  initial={{ r: 1.4, opacity: 0.55 }}
                  animate={{ r: 7.5, opacity: 0 }}
                  transition={{ duration: 2.6, ease: 'easeOut', repeat: Infinity }}
                />
                <motion.circle
                  key={`ring-b-${active}`}
                  cx={pos[0]}
                  cy={pos[1]}
                  fill="none"
                  stroke="#87c8f5"
                  strokeWidth="0.35"
                  initial={{ r: 1.4, opacity: 0.55 }}
                  animate={{ r: 7.5, opacity: 0 }}
                  transition={{ duration: 2.6, ease: 'easeOut', repeat: Infinity, delay: 1.3 }}
                />
              </>
            )}
            <motion.circle
              className={isActive ? undefined : 'wr-pin'}
              style={isActive ? undefined : { animationDelay: `${i * 0.9}s` }}
              cx={pos[0]}
              cy={pos[1]}
              r={isActive ? 1.3 : 0.85}
              fill={isActive ? '#c8e6ff' : '#ffffff'}
              fillOpacity={isActive ? 0.95 : 0.4}
              filter={isActive ? 'url(#wr-pin-glow)' : undefined}
              animate={{ r: isActive ? 1.3 : 0.85, fillOpacity: isActive ? 0.95 : 0.4 }}
              transition={{ duration: 0.35 }}
            >
              <title>{ev.title}</title>
            </motion.circle>
          </g>
        );
      })}
    </svg>
  );
};

export default EuropeSignalMap;
