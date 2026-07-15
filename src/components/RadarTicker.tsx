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
        <span className="font-inter text-xs text-white/55">{item}</span>
        <span className="text-white/20 text-xs" aria-hidden="true">·</span>
      </span>
    ))}
  </span>
);

/**
 * Wire-service strip: what Windrose is watching right now. Pure CSS marquee
 * (transform-only), pauses on hover, static single line under reduced motion.
 */
const RadarTicker = () => (
  <section
    aria-label="Currently monitoring"
    className="group relative w-full bg-[#05070d] border-y border-white/5 flex items-stretch overflow-hidden"
  >
    <div className="shrink-0 flex items-center gap-2.5 pl-6 md:pl-12 pr-5 py-3 border-r border-white/5 bg-[#05070d] relative z-10">
      <span className="relative flex w-2 h-2" aria-hidden="true">
        <span
          className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping motion-reduce:animate-none"
          style={{ background: 'radial-gradient(circle, rgba(200,230,255,0.9), rgba(135,200,245,0.4))' }}
        />
        <span
          className="relative inline-flex w-2 h-2 rounded-full"
          style={{
            background: 'radial-gradient(circle, #ffffff 20%, rgba(200,230,255,0.8))',
            boxShadow: '0 0 8px rgba(135,200,245,0.6)',
          }}
        />
      </span>
      <span className="font-inter text-[11px] uppercase tracking-[0.25em] text-white/45 whitespace-nowrap">
        On the radar
      </span>
    </div>
    <div className="relative flex-1 overflow-hidden wr-ticker-mask">
      <div className="wr-ticker flex items-center py-3">
        <TickerRow />
        <TickerRow hidden />
      </div>
    </div>
  </section>
);

export default RadarTicker;
