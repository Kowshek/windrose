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

  // restored verbatim on leave so cards with their own inline shadow keep it
  const inlineShadow = el.style.boxShadow;

  let mouseX = 0;
  let mouseY = 0;
  let tRX = 0, tRY = 0, cRX = 0, cRY = 0; // tilt
  let tTX = 0, tTY = 0, cTX = 0, cTY = 0; // magnetic drift
  let tS = 1, cS = 1;                     // hover scale
  let animationFrameId = 0;
  let running = false;

  // rAF runs only while hovering; the spring-back on leave is CSS.
  const render = () => {
    cRX += (tRX - cRX) * 0.1;
    cRY += (tRY - cRY) * 0.1;
    cTX += (tTX - cTX) * 0.1;
    cTY += (tTY - cTY) * 0.1;
    cS += (tS - cS) * 0.1;
    el.style.transform =
      `perspective(800px) translate3d(${cTX.toFixed(2)}px, ${cTY.toFixed(2)}px, 0) ` +
      `rotateX(${cRX.toFixed(2)}deg) rotateY(${cRY.toFixed(2)}deg) scale(${cS.toFixed(4)})`;
    // dynamic shadow: light rides with the pointer, shadow falls away from it
    el.style.boxShadow =
      `${(-cRY * 1.8).toFixed(1)}px ${(8 + cRX * 1.8).toFixed(1)}px 36px rgba(0,0,0,0.38), ` +
      'inset 0 1px 0 rgba(255,255,255,0.06)';
    glow.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    if (running) animationFrameId = requestAnimationFrame(render);
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    const nx = (mouseX - rect.width / 2) / (rect.width / 2);
    const ny = (mouseY - rect.height / 2) / (rect.height / 2);
    tRX = ny * -5;
    tRY = nx * 5;
    tTX = nx * 3;
    tTY = ny * 3;
  };

  const onMouseEnter = () => {
    overlay.style.opacity = '1';
    tS = 1.012;
    el.style.transition = 'transform 0s, box-shadow 0s';
    if (!running) {
      running = true;
      animationFrameId = requestAnimationFrame(render);
    }
  };

  const onMouseLeave = () => {
    running = false;
    cancelAnimationFrame(animationFrameId);
    tRX = tRY = cRX = cRY = 0;
    tTX = tTY = cTX = cTY = 0;
    tS = cS = 1;
    overlay.style.opacity = '0';
    el.style.transition =
      'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 600ms cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform =
      'perspective(800px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.boxShadow = inlineShadow;
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
    el.style.transform = '';
    el.style.boxShadow = inlineShadow;
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
  // press scale lives here too: the inline magnetic transform overrides any
  // CSS active: scale, so the press must be part of the same transform.
  let targetS = 1;
  let currentS = 1;
  let isHovering = false;
  let animationFrameId = 0;
  let running = false;

  // rAF parks itself once settled; mousemove wakes it near the element.
  const render = () => {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    currentS += (targetS - currentS) * 0.22;

    if (
      !isHovering &&
      Math.abs(currentX) < 0.05 &&
      Math.abs(currentY) < 0.05 &&
      Math.abs(currentS - 1) < 0.002
    ) {
      currentX = 0;
      currentY = 0;
      currentS = 1;
      el.style.transition = 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
      running = false;
      return;
    }

    el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentS.toFixed(4)})`;
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

  // tiny press, smooth spring release
  const onDown = () => {
    targetS = 0.965;
    el.style.transition = 'transform 0s';
    wake();
  };
  const onUp = () => {
    if (targetS !== 1) {
      targetS = 1;
      wake();
    }
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  el.addEventListener('mouseleave', onMouseLeave);
  el.addEventListener('mousedown', onDown);
  window.addEventListener('mouseup', onUp);

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseleave', onMouseLeave);
    el.removeEventListener('mousedown', onDown);
    window.removeEventListener('mouseup', onUp);
    running = false;
    cancelAnimationFrame(animationFrameId);
    el.style.transform = '';
  };
}
