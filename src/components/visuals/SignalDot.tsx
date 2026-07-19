/**
 * Live-signal marker — the one dot grammar for "this is being monitored".
 * live: pinging Dawn-Signal core (detection). quiet: static 35% white (logged).
 * Size via className (w-2 h-2 in the ticker, w-1.5 h-1.5 in brief rows).
 */
const SignalDot = ({ live = true, className = 'w-2 h-2' }: { live?: boolean; className?: string }) => (
  <span className={`relative flex shrink-0 ${className}`} aria-hidden="true">
    {live && (
      <span
        className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping motion-reduce:animate-none"
        style={{ background: 'radial-gradient(circle, rgba(200,230,255,0.9), rgba(135,200,245,0.4))' }}
      />
    )}
    <span
      className="relative inline-flex w-full h-full rounded-full"
      style={
        live
          ? {
              background: 'radial-gradient(circle, #ffffff 20%, rgba(200,230,255,0.8))',
              boxShadow: '0 0 8px rgba(135,200,245,0.6)',
            }
          : { background: 'rgba(255,255,255,0.35)' }
      }
    />
  </span>
);

export default SignalDot;
