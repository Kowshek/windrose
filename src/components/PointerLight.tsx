import { useEffect, useRef } from 'react';

/**
 * Environmental light: one pre-painted radial glow that trails the pointer.
 * Lives inside the fixed .wr-world atmosphere layer, under all content, so it
 * deepens the scene without touching readability. Transform-only (GPU); the
 * rAF parks itself when settled; inert on touch and under reduced motion.
 */
const PointerLight = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 3;
    let cx = tx;
    let cy = ty;
    let raf = 0;
    let running = false;

    const render = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(tx - cx) < 0.3 && Math.abs(ty - cy) < 0.3) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(render);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = '1';
      if (!running) {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        width: '90vmax',
        height: '90vmax',
        left: '-45vmax',
        top: '-45vmax',
        background: 'radial-gradient(circle, rgba(200,230,255,0.05) 0%, transparent 55%)',
        willChange: 'transform',
        opacity: 0,
        transition: 'opacity 600ms ease',
      }}
    />
  );
};

export default PointerLight;
