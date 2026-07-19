import { useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

/**
 * The Windrose compass mark. Draws itself on first view: ring sweeps in,
 * intercardinal rays fade, the north needle rises last. With `trackCursor`,
 * the needle swings toward the pointer while the mark is on screen.
 */
const WindroseMark = ({
  className = '',
  trackCursor = false,
}: {
  className?: string;
  trackCursor?: boolean;
}) => {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const inView = useInView(svgRef, { amount: 0.2 });

  useEffect(() => {
    if (!trackCursor || reduced || !inView) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let target = 0;
    let current = 0;
    let frame: number;

    const onMove = (e: MouseEvent) => {
      const el = svgRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      target = (Math.atan2(dx, -dy) * 180) / Math.PI;
    };

    const tick = () => {
      // shortest-arc lerp so the needle never spins the long way round
      const delta = ((target - current + 540) % 360) - 180;
      current += delta * 0.08;
      if (needleRef.current) {
        needleRef.current.style.transform = `rotate(${current.toFixed(2)}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    const needle = needleRef.current;
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(frame);
      if (needle) needle.style.transform = '';
    };
  }, [trackCursor, reduced, inView]);

  const ring = {
    hidden: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] as const },
    },
  };
  const ray = (delay: number) => ({
    hidden: { opacity: reduced ? 1 : 0 },
    show: {
      opacity: 1,
      transition: { duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay },
    },
  });
  const needle = {
    hidden: reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.circle
        cx="24" cy="24" r="20.5"
        stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.4"
        variants={ring}
      />
      {/* intercardinal rays */}
      <motion.g stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" variants={ray(0.45)}>
        <line x1="10.9" y1="10.9" x2="16.6" y2="16.6" />
        <line x1="37.1" y1="10.9" x2="31.4" y2="16.6" />
        <line x1="10.9" y1="37.1" x2="16.6" y2="31.4" />
        <line x1="37.1" y1="37.1" x2="31.4" y2="31.4" />
      </motion.g>
      {/* E / S / W points */}
      <motion.g stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" variants={ray(0.55)}>
        <path d="M44 24 L28.5 24" />
        <path d="M24 44 L24 28.5" />
        <path d="M4 24 L19.5 24" />
      </motion.g>
      {/* north needle (wrapped so cursor-tracking rotates around the hub) */}
      <g
        ref={needleRef}
        style={{ transformBox: 'view-box', transformOrigin: '50% 50%' }}
      >
        <motion.path
          d="M24 4.5 L26.4 21.6 L24 24 L21.6 21.6 Z"
          fill="currentColor"
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
          variants={needle}
        />
      </g>
      <circle cx="24" cy="24" r="1.6" fill="currentColor" fillOpacity="0.9" />
    </motion.svg>
  );
};

export default WindroseMark;
