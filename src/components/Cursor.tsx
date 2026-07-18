import { useEffect, useRef } from 'react';

const Cursor = () => {
  const cursorRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const isPointer = window.matchMedia('(pointer: fine)').matches;
    
    if (!isPointer) {
      if (cursorRef.current) cursorRef.current.style.display = 'none';
      return;
    }

    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
      input, textarea, [contenteditable] { cursor: text !important; }
    `;
    document.head.appendChild(style);

    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true, capture: true });

    return () => {
      // @ts-ignore
      window.removeEventListener('mousemove', onMouseMove, { capture: true });
      document.head.removeChild(style);
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <img 
      ref={cursorRef}
      src="/cursor.png?v=7" 
      alt="cursor"
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999]"
      style={{ 
        willChange: 'transform',
        filter: 'brightness(0) invert(1) drop-shadow(0px 0px 2px rgba(0,0,0,0.5))'
      }}
    />
  );
};

export default Cursor;
