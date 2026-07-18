import { motion, useReducedMotion } from 'motion/react';

// Deterministic widths so the "feed" reads as organic without Math.random()
const NOISE_WIDTHS = [
  82, 58, 91, 66, 74, 49, 88, 61,
  70, 95, 54, 79, 63, 86, 57, 72,
  90, 52, 77, 68, 84, 59, 73, 65,
];
const BRIEF_WIDTHS = [92, 74, 86, 68, 80];

/**
 * The morning feed collapses into the brief: a wall of faint headline ticks
 * flickers in on the left, five bright items resolve on the right.
 */
const TriageVisual = () => {
  const reduced = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.022 } },
  };
  const noiseLine = {
    hidden: { opacity: reduced ? 0.22 : 0 },
    show: {
      opacity: reduced ? 0.22 : [0, 0.85, 0.22],
      transition: { duration: reduced ? 0 : 0.55 },
    },
  };
  const briefList = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.13, delayChildren: reduced ? 0 : 0.55 } },
  };
  const briefLine = {
    hidden: reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div aria-hidden="true" className="select-none">
      <div className="flex items-stretch gap-5 h-36">
        {/* the feed */}
        <motion.div
          className="flex-1 grid grid-cols-3 gap-x-3 content-center gap-y-[7px]"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          {NOISE_WIDTHS.map((w, i) => (
            <motion.div
              key={i}
              variants={noiseLine}
              className="h-[2px] rounded-full bg-white"
              style={{ width: `${w}%` }}
            />
          ))}
        </motion.div>

        {/* divider with pass-through gap */}
        <div className="relative w-px bg-white/10 my-2">
          <div className="absolute top-1/2 -translate-y-1/2 -left-[3px] w-[7px] h-8 bg-transparent border-y border-white/25" />
        </div>

        {/* the brief */}
        <motion.div
          className="w-[42%] flex flex-col justify-center gap-[13px]"
          variants={briefList}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          {BRIEF_WIDTHS.map((w, i) => (
            <motion.div key={i} variants={briefLine} className="flex items-center gap-2.5">
              <span className="w-[5px] h-[5px] rounded-full bg-white/85 shrink-0" />
              <span
                className="h-[2px] rounded-full bg-white/75"
                style={{ width: `${w}%`, boxShadow: '0 0 8px rgba(255,255,255,0.25)' }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="flex justify-between font-inter text-[13px] text-white/45 mt-3 tracking-wide">
        <span>the morning&rsquo;s feed</span>
        <span>your brief · 5–8 items</span>
      </div>
    </div>
  );
};

export default TriageVisual;
