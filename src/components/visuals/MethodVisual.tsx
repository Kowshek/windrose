import { motion, useReducedMotion } from 'motion/react';

const SOURCES = ['PAP', 'MSWiA', 'Belta'];
const CHECKS = ['Criteria published', 'Open to challenge'];

/**
 * The method, drawn: named sources converge into a single assessment node,
 * corroboration fills a scored track, the published-criteria checks land last.
 */
const MethodVisual = () => {
  const reduced = useReducedMotion();

  const drawPath = (delay: number) => ({
    hidden: { pathLength: reduced ? 1 : 0, opacity: reduced ? 0.3 : 0 },
    show: {
      pathLength: 1,
      opacity: 0.3,
      transition: { duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
    },
  });
  const drawCheck = (delay: number) => ({
    hidden: { pathLength: reduced ? 1 : 0 },
    show: {
      pathLength: 1,
      transition: { duration: reduced ? 0 : 0.35, delay: reduced ? 0 : delay, ease: 'easeOut' as const },
    },
  });
  const fade = (delay: number, y = 0) => ({
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
    },
  });

  return (
    <motion.div
      aria-hidden="true"
      className="select-none h-36 flex items-center gap-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {/* named sources */}
      <div className="flex flex-col gap-2.5 shrink-0">
        {SOURCES.map((s, i) => (
          <motion.span
            key={s}
            variants={fade(i * 0.12, 6)}
            className="font-inter text-[12px] tracking-[0.12em] text-white/60 border border-white/15 rounded-full px-2.5 py-1 text-center"
          >
            {s}
          </motion.span>
        ))}
      </div>

      {/* convergence */}
      <svg viewBox="0 0 56 96" className="h-24 w-12 shrink-0" fill="none">
        <motion.path d="M0 14 C 34 14, 30 48, 56 48" stroke="#fff" strokeWidth="1" variants={drawPath(0.35)} />
        <motion.path d="M0 48 L 56 48" stroke="#fff" strokeWidth="1" variants={drawPath(0.45)} />
        <motion.path d="M0 82 C 34 82, 30 48, 56 48" stroke="#fff" strokeWidth="1" variants={drawPath(0.55)} />
        <motion.circle
          cx="56"
          cy="48"
          r="2.6"
          fill="#fff"
          fillOpacity="0.9"
          variants={fade(1.0)}
          style={{ filter: 'drop-shadow(0 0 5px rgba(200,230,255,0.6))' }}
        />
      </svg>

      {/* the score */}
      <div className="flex-1 min-w-0">
        <motion.div variants={fade(1.05)} className="font-inter text-[12px] uppercase tracking-[0.2em] text-white/45">
          Corroboration
        </motion.div>
        <div className="h-[3px] rounded-full bg-white/10 mt-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-white/75"
            style={{ originX: 0, boxShadow: '0 0 10px rgba(255,255,255,0.35)' }}
            variants={{
              hidden: { scaleX: reduced ? 0.72 : 0 },
              show: {
                scaleX: 0.72,
                transition: { duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          />
        </div>
        <motion.div variants={fade(1.25)} className="font-inter text-[13px] text-white/55 mt-1.5">
          two independent · one state
        </motion.div>

        <div className="flex flex-col gap-1.5 mt-4">
          {CHECKS.map((c, i) => (
            <motion.div key={c} variants={fade(1.4 + i * 0.15, 4)} className="flex items-center gap-2">
              <svg viewBox="0 0 12 12" className="w-3 h-3 shrink-0" fill="none">
                <motion.path
                  d="M2 6.2 L4.8 9 L10 3.2"
                  stroke="#fff"
                  strokeOpacity="0.8"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={drawCheck(1.5 + i * 0.15)}
                />
              </svg>
              <span className="font-inter text-[13px] text-white/60">{c}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MethodVisual;
