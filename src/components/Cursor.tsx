import { useEffect, useRef } from 'react';

const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isPointer = window.matchMedia('(pointer: fine)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isPointer || isReducedMotion) {
      if (dotRef.current) dotRef.current.style.display = 'none';
      if (ringRef.current) ringRef.current.style.display = 'none';
      return;
    }

    document.documentElement.style.cursor = 'none';
    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
      input, textarea, [contenteditable] { cursor: text !important; }
    `;
    document.head.appendChild(style);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let targetRingScale = 1;
    let currentRingScale = 1;
    let targetDotScale = 1;
    let currentDotScale = 1;
    
    let isHoveringInteractive = false;
    let isHoveringText = false;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement;
      
      const interactiveSelector = 'a, button, input, select, [data-cursor]';
      const textSelector = 'p, h1, h2, h3, h4, h5, h6, span.word, span.quote-word';
      
      const isInteractive = !!target.closest(interactiveSelector);
      const isText = !isInteractive && !!target.closest(textSelector);
      
      if (isInteractive !== isHoveringInteractive || isText !== isHoveringText) {
        isHoveringInteractive = isInteractive;
        isHoveringText = isText;
        
        if (ringRef.current) {
          if (isHoveringInteractive) {
            targetRingScale = 2;
            targetDotScale = 0.5;
            ringRef.current.style.borderColor = 'rgba(255,255,255,0.2)';
          } else if (isHoveringText) {
            targetRingScale = 1;
            targetDotScale = 1;
            ringRef.current.style.borderColor = 'rgba(255,255,255,0.15)';
          } else {
            targetRingScale = 1;
            targetDotScale = 1;
            ringRef.current.style.borderColor = 'rgba(255,255,255,0.4)';
          }
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const render = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      currentRingScale += (targetRingScale - currentRingScale) * 0.15;
      currentDotScale += (targetDotScale - currentDotScale) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${currentDotScale})`;
      }
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${currentRingScale})`;
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      document.head.removeChild(style);
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <>
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 border border-white/40 rounded-full pointer-events-none z-[100]"
        style={{ transition: 'border-color 0.2s', willChange: 'transform' }} 
      />
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-white rounded-full pointer-events-none z-[100]"
        style={{ willChange: 'transform' }}
      />
    </>
  );
};

export default Cursor;
