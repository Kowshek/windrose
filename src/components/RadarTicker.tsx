import { useEffect, useState } from 'react';
import SignalDot from './visuals/SignalDot';

const ITEMS = [
  'Belarus border crossings — elevated',
  'EU Council · 24 Jul',
  'EU–Belarus transit talks · Aug',
  'Black Sea corridor review · Sep',
  'Serbia protest cycle',
  'Moldova election season',
  'French budget vote',
  'NATO northern-flank exercises',
];

const TickerRow = ({ hidden = false }: { hidden?: boolean }) => (
  <span className="flex items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
    {ITEMS.map((item) => (
      <span key={item} className="flex items-center gap-10 whitespace-nowrap">
        <span className="font-inter text-sm text-white/55">{item}</span>
        <span className="text-white/20 text-sm" aria-hidden="true">·</span>
      </span>
    ))}
  </span>
);

/**
 * Wire-service strip: what Windrose is watching right now. Pure CSS marquee
 * (transform-only), pauses on hover, static single line under reduced motion.
 */
const RadarTicker = () => {
  // real clock, not simulation — the desk is on UTC
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const utc = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  return (
  <section
    aria-label="Currently monitoring"
    className="group wr-radar relative w-full border-y border-white/5 flex items-stretch overflow-hidden"
  >
    <div className="shrink-0 flex items-center gap-2.5 pl-6 md:pl-12 pr-5 py-4 border-r border-white/5 bg-[#05070d] relative z-10">
      <SignalDot className="w-2 h-2" />
      <span className="font-inter text-[13px] uppercase tracking-[0.25em] text-white/45 whitespace-nowrap">
        On the radar
      </span>
      <span className="font-inter text-[11px] text-white/30 tabular-nums whitespace-nowrap">
        {utc} UTC
      </span>
    </div>
    <div className="relative flex-1 overflow-hidden wr-ticker-mask">
      <div className="wr-ticker flex items-center py-4">
        <TickerRow />
        <TickerRow hidden />
      </div>
    </div>
  </section>
  );
};

export default RadarTicker;
