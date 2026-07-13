export function initCardGlow(el: HTMLElement) {
  const isPointer = window.matchMedia('(pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isPointer || isReducedMotion) return () => {};

  const overlay = document.createElement('div');
  overlay.className = 'pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0';
  overlay.style.background = 'radial-gradient(300px circle at 50% 50%, rgba(255,255,255,0.06), transparent)';
  overlay.style.borderRadius = 'inherit';
  
  if (getComputedStyle(el).position === 'static') {
    el.style.position = 'relative';
  }
  el.appendChild(overlay);

  let mouseX = 0;
  let mouseY = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let isHovering = false;
  let animationFrameId: number;

  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX = x;
    mouseY = y;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    targetRotateX = ((y - centerY) / centerY) * -5;
    targetRotateY = ((x - centerX) / centerX) * 5;
  };

  const onMouseEnter = () => {
    isHovering = true;
    overlay.style.opacity = '1';
    el.style.transition = 'transform 0s';
  };

  const onMouseLeave = () => {
    isHovering = false;
    targetRotateX = 0;
    targetRotateY = 0;
    overlay.style.opacity = '0';
    el.style.transition = 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1)';
    el.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg)`;
  };

  el.addEventListener('mousemove', onMouseMove);
  el.addEventListener('mouseenter', onMouseEnter);
  el.addEventListener('mouseleave', onMouseLeave);

  const render = () => {
    if (isHovering) {
      currentRotateX += (targetRotateX - currentRotateX) * 0.1;
      currentRotateY += (targetRotateY - currentRotateY) * 0.1;
      
      el.style.transform = `perspective(800px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
      overlay.style.background = `radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent)`;
    }
    animationFrameId = requestAnimationFrame(render);
  };
  render();

  return () => {
    el.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseenter', onMouseEnter);
    el.removeEventListener('mouseleave', onMouseLeave);
    cancelAnimationFrame(animationFrameId);
    if (el.contains(overlay)) el.removeChild(overlay);
  };
}

export function initMagnetic(el: HTMLElement) {
  const isPointer = window.matchMedia('(pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isPointer || isReducedMotion) return () => {};

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovering = false;
  let animationFrameId: number;

  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < 60) {
      isHovering = true;
      targetX = (distX / distance) * Math.min(distance, 5);
      targetY = (distY / distance) * Math.min(distance, 5);
      el.style.transition = 'transform 0s';
    } else {
      isHovering = false;
      targetX = 0;
      targetY = 0;
    }
  };

  const onMouseLeave = () => {
    isHovering = false;
    targetX = 0;
    targetY = 0;
  };

  window.addEventListener('mousemove', onMouseMove);
  el.addEventListener('mouseleave', onMouseLeave);

  const render = () => {
    if (isHovering || Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      
      if (!isHovering && Math.abs(currentX) < 0.05 && Math.abs(currentY) < 0.05) {
        currentX = 0;
        currentY = 0;
        el.style.transition = 'transform 400ms cubic-bezier(0.23, 1, 0.32, 1)';
      }
      
      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
    animationFrameId = requestAnimationFrame(render);
  };
  render();

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseleave', onMouseLeave);
    cancelAnimationFrame(animationFrameId);
    el.style.transform = '';
  };
}
