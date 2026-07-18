import { motion, useReducedMotion } from 'motion/react';

// Skeleton widths are deterministic so the brief reads as real, not random.
const BLOCKS = [
  { label: 'What happened', widths: [92, 78] },
  { label: 'Why it matters', widths: [88, 64] },
  { label: 'Watch next', widths: [70] },
];

/**
 * Tomorrow's brief, arriving: the Daily Brief assembles block by block with a
 * soft arrival pulse behind it. Supports the waitlist ask — join now, this is
 * what lands at launch.
 */
const BriefArrival = ({ live = true }: { live?: boolean }) => {
  const reduced = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.14, delayChildren: reduced ? 0 : 0.2 } },
  };
  const item = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14, filter: 'blur(4px)' },
    show: {
      opacity: 1,
      y: 0,
      ...(reduced ? {} : { filter: 'blur(0px)' }),
      transition: { duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div aria-hidden="true" className="relative w-full max-w-[460px] select-none">
      {/* soft arrival pulse behind the card */}
      {!reduced && live && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(135,200,245,0.10) 0%, transparent 60%)' }}
          animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
        />
      )}

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative liquid-glass rounded-2xl p-8 md:p-10"
      >
        <motion.div variants={item} className="flex items-center justify-between">
          <span className="font-instrument italic text-white/85 text-xl">Windrose</span>
          <span className="flex items-center gap-2 font-inter text-[12px] tracking-wide text-white/45">
            <span className="relative flex w-1.5 h-1.5">
              {!reduced && live && (
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#c8e6ff]/70 animate-ping" />
              )}
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-white/80" />
            </span>
            Tomorrow · 06:00
          </span>
        </motion.div>

        {/* headline, still being written */}
        <motion.div variants={item} className="mt-8 space-y-2.5">
          <div className="h-[10px] w-[85%] rounded-full bg-white/25" />
          <div className="h-[10px] w-[55%] rounded-full bg-white/25" />
        </motion.div>

        {BLOCKS.map((b) => (
          <motion.div key={b.label} variants={item} className="mt-7">
            <div className="font-inter text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
              {b.label}
            </div>
            <div className="mt-3 space-y-2">
              {b.widths.map((w, i) => (
                <div key={i} className="h-[6px] rounded-full bg-white/15" style={{ width: `${w}%` }} />
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div variants={item} className="border-t border-white/10 mt-8 pt-5">
          <p className="font-inter text-white/35 text-[12px] tracking-wide">
            Delivered daily from launch · sourcing shown on every item
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BriefArrival;
