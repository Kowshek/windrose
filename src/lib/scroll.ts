import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createContext } from 'react';

gsap.registerPlugin(ScrollTrigger);
// Mobile URL-bar show/hide fires resize; skipping those refreshes avoids
// full trigger re-measure storms mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis: Lenis | null = null;

/** Lenis smooth scroll wired into GSAP ScrollTrigger. No-op under reduced motion. */
export function initSmoothScroll(): Lenis | null {
  if (lenis) return lenis;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/**
 * Horizontal story registry. Landing sets this while the pinned horizontal
 * section is active so anchor navigation can map a panel's section id to the
 * scroll position that docks that panel.
 */
let story: { trigger: ScrollTrigger; panelIds: string[] } | null = null;

export function setStory(s: typeof story) {
  story = s;
}

/**
 * Container tween of the pinned horizontal story. Components inside the track
 * hang their scrubs off it via ScrollTrigger's containerAnimation; null means
 * normal vertical flow (mobile / reduced motion) and they keep their vertical
 * trigger configs.
 */
export const StoryContext = createContext<gsap.core.Tween | null>(null);

/** Scroll position that docks the story panel whose section has `id`, if any. */
export function storyPositionFor(id: string): number | null {
  if (!story) return null;
  const i = story.panelIds.indexOf(id);
  if (i < 0) return null;
  const st = story.trigger;
  return st.start + ((st.end - st.start) * i) / (story.panelIds.length - 1);
}

/** Anchor scrolling routed through Lenis when active; story-aware while pinned. */
export function scrollToTarget(selector: string) {
  const pos = storyPositionFor(selector.slice(1));
  if (pos !== null) {
    if (lenis) lenis.scrollTo(pos);
    else window.scrollTo({ top: pos });
    return;
  }
  const el = document.querySelector(selector);
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement);
  else el.scrollIntoView({ behavior: 'smooth' });
}
