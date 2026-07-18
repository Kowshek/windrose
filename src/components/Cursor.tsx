import { useEffect, useRef } from 'react';

const Cursor = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticRef = useRef<HTMLImageElement>(null);
  const animatedRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const isPointer = window.matchMedia('(pointer: fine)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isPointer || isReducedMotion) {
      if (containerRef.current) containerRef.current.style.display = 'none';
      return;
    }

    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
      input, textarea, [contenteditable] { cursor: text !important; }
    `;
    document.head.appendChild(style);

    const onMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    let spinTimeout: ReturnType<typeof setTimeout>;

    const onMouseDown = () => {
      if (staticRef.current && animatedRef.current) {
        // Force the GIF to restart from frame 1 by appending a unique timestamp
        animatedRef.current.src = `/cursor.gif?t=${Date.now()}`;
        
        staticRef.current.style.opacity = '0';
        animatedRef.current.style.opacity = '1';
        
        clearTimeout(spinTimeout);
        
        // Spin for roughly one rotation (Icons8 globes typically take ~850ms to complete a loop)
        spinTimeout = setTimeout(() => {
          if (staticRef.current && animatedRef.current) {
            staticRef.current.style.opacity = '1';
            animatedRef.current.style.opacity = '0';
          }
        }, 850);
      }
    };

    // Use capture: true so we intercept the event even if another element calls stopPropagation()
    window.addEventListener('mousemove', onMouseMove, { passive: true, capture: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true, capture: true });

    return () => {
      // @ts-ignore
      window.removeEventListener('mousemove', onMouseMove, { capture: true });
      // @ts-ignore
      window.removeEventListener('mousedown', onMouseDown, { capture: true });
      clearTimeout(spinTimeout);
      document.head.removeChild(style);
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999]"
      style={{ 
        willChange: 'transform',
        filter: 'invert(1)',
        mixBlendMode: 'screen'
      }}
    >
      <img 
        ref={staticRef}
        src="/cursor_static.png" 
        alt="static cursor"
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 1, willChange: 'opacity' }}
      />
      <img 
        ref={animatedRef}
        src="/cursor.gif" 
        alt="animated cursor"
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0, willChange: 'opacity' }}
      />
    </div>
  );
};

export default Cursor;
