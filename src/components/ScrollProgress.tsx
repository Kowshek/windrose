import { motion, useScroll, useSpring } from 'motion/react';

/** Hairline reading-progress indicator pinned above the nav. */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[70] origin-left pointer-events-none"
      style={{
        scaleX,
        background:
          'linear-gradient(90deg, rgba(135,200,245,0) 0%, rgba(135,200,245,0.35) 40%, rgba(255,255,255,0.55) 100%)',
      }}
    />
  );
};

export default ScrollProgress;
