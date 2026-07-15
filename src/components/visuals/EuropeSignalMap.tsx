import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { DOTS, CITIES, MAP_W, MAP_H } from './europe-dots';

export type SignalEvent = {
  city: keyof typeof CITIES | string;
  title: string;
  date: string;
  level: 'watch' | 'elevated';
};

const DOT_R = 0.52;

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

        {/* satellite sweep */}
        {!reduced && live && (
          <motion.rect
            x="0"
            width={MAP_W}
            height="16"
            fill="url(#wr-sweep)"
            initial={{ y: -16 }}
            animate={{ y: MAP_H + 4 }}
            transition={{ duration: 8.5, ease: 'linear', repeat: Infinity, repeatDelay: 2.5 }}
          />
        )}
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
