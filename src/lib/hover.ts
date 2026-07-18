export function initCardGlow(el: HTMLElement) {
  const isPointer = window.matchMedia('(pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isPointer || isReducedMotion) return () => {};

  // The glow gradient is painted once and moved with translate3d — no
  // per-frame background repaints. The overlay clips it and owns the fade.
  const overlay = document.createElement('div');
  overlay.className =
    'pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-300 opacity-0';
  overlay.style.borderRadius = 'inherit';
  const glow = document.createElement('div');
  glow.style.cssText =
    'position:absolute;width:600px;height:600px;left:-300px;top:-300px;' +
    'background:radial-gradient(300px circle at center, rgba(255,255,255,0.06), transparent);' +
    'will-change:transform;transform:translate3d(-9999px,0,0);';
  overlay.appendChild(glow);

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
  let animationFrameId = 0;
  let running = false;

  // rAF runs only while hovering; the spring-back on leave is CSS.
  const render = () => {
    currentRotateX += (targetRotateX - currentRotateX) * 0.1;
    currentRotateY += (targetRotateY - currentRotateY) * 0.1;
    el.style.transform = `perspective(800px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
    glow.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    if (running) animationFrameId = requestAnimationFrame(render);
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    targetRotateX = ((mouseY - rect.height / 2) / (rect.height / 2)) * -5;
    targetRotateY = ((mouseX - rect.width / 2) / (rect.width / 2)) * 5;
  };

  const onMouseEnter = () => {
    overlay.style.opacity = '1';
    el.style.transition = 'transform 0s';
    if (!running) {
      running = true;
      animationFrameId = requestAnimationFrame(render);
    }
  };

  const onMouseLeave = () => {
    running = false;
    cancelAnimationFrame(animationFrameId);
    targetRotateX = 0;
    targetRotateY = 0;
    currentRotateX = 0;
    currentRotateY = 0;
    overlay.style.opacity = '0';
    el.style.transition = 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1)';
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  };

  el.addEventListener('mousemove', onMouseMove);
  el.addEventListener('mouseenter', onMouseEnter);
  el.addEventListener('mouseleave', onMouseLeave);

  return () => {
    el.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseenter', onMouseEnter);
    el.removeEventListener('mouseleave', onMouseLeave);
    running = false;
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
  let animationFrameId = 0;
  let running = false;

  // rAF parks itself once settled; mousemove wakes it near the element.
  const render = () => {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;

    if (!isHovering && Math.abs(currentX) < 0.05 && Math.abs(currentY) < 0.05) {
      currentX = 0;
      currentY = 0;
      el.style.transition = 'transform 400ms cubic-bezier(0.23, 1, 0.32, 1)';
      el.style.transform = 'translate3d(0px, 0px, 0)';
      running = false;
      return;
    }

    el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    animationFrameId = requestAnimationFrame(render);
  };

  const wake = () => {
    if (!running) {
      running = true;
      animationFrameId = requestAnimationFrame(render);
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const distX = e.clientX - (rect.left + rect.width / 2);
    const distY = e.clientY - (rect.top + rect.height / 2);
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance > 0 && distance < 60) {
      isHovering = true;
      targetX = (distX / distance) * Math.min(distance, 5);
      targetY = (distY / distance) * Math.min(distance, 5);
      el.style.transition = 'transform 0s';
      wake();
    } else if (isHovering) {
      isHovering = false;
      targetX = 0;
      targetY = 0;
      wake();
    }
  };

  const onMouseLeave = () => {
    if (isHovering || running) {
      isHovering = false;
      targetX = 0;
      targetY = 0;
      wake();
    }
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  el.addEventListener('mouseleave', onMouseLeave);

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseleave', onMouseLeave);
    running = false;
    cancelAnimationFrame(animationFrameId);
    el.style.transform = '';
  };
}
