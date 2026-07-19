import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initSmoothScroll, setStory, StoryContext } from '../lib/scroll';
import Hero from '../components/Hero';
import RadarTicker from '../components/RadarTicker';
import NoiseToSignal from '../components/NoiseToSignal';
import ThreeBeats from '../components/ThreeBeats';
import BriefPreview from '../components/BriefPreview';
import QuoteSection from '../components/QuoteSection';
import Waitlist from '../components/Waitlist';
import Institutional from '../components/Institutional';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import PointerLight from '../components/PointerLight';

/** Media where the story pins and scrolls horizontally.
 *  Must stay in lockstep with the .story-track/.story-panel block in index.css. */
const STORY_MEDIA = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
/** Section ids inside the track, in panel order (drives anchor navigation). */
const PANEL_IDS = ['beats', 'preview', 'method', 'waitlist', 'universities'];

const Landing = () => {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [storyTween, setStoryTween] = useState<gsap.core.Tween | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    initSmoothScroll();
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    const mm = gsap.matchMedia();

    mm.add(STORY_MEDIA, () => {
      const track = trackRef.current;
      if (!pinRef.current || !track) return;

      const panels = Array.from(track.children) as HTMLElement[];
      // Per-panel content wrapper (the section's last child): the decorative
      // glow layers are absolute siblings and stay full-bleed while the
      // content wrapper parallaxes and scales.
      const contents = panels.map(
        (p) => (p.firstElementChild?.lastElementChild ?? null) as HTMLElement | null
      );

      // Panels are 100vh; sections were laid out for vertical flow and can be
      // taller. Scale content down to fit rather than clip it.
      // ponytail: interim guard until sections get a horizontal-format layout pass
      // 200px reserve: content is centered in the full 100vh panel, so half of
      // this clears the fixed nav at the top plus breathing room at the bottom.
      // Batched write → read → write so it forces a single reflow, not one per
      // panel.
      const fit = () => {
        contents.forEach((c) => c && gsap.set(c, { scale: 1 }));
        const avail = window.innerHeight - 200;
        const heights = contents.map((c) => (c ? c.offsetHeight : 0));
        contents.forEach((c, i) => {
          if (!c) return;
          const s = avail / heights[i];
          if (s < 1) gsap.set(c, { scale: Math.max(s, 0.6) });
        });
      };
      fit();
      ScrollTrigger.addEventListener('refreshInit', fit);

      // Static xPercent (self-relative) rather than a function-based x:
      // containerAnimation children can't map positions against a tween whose
      // values are flushed by invalidateOnRefresh, and -80% of the track is
      // always -(panels-1) viewport widths regardless of resize.
      const distance = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        // Ratio of travel to track width; all vw-based, so it holds on resize
        // (and stays correct with the panels' unequal overlaps).
        xPercent: (-100 * distance()) / track.scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: pinRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          // 1.3× travel: the story reads statelier than plain 1:1 px mapping.
          end: () => `+=${distance() * 1.3}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Dock fraction per panel from real geometry — overlaps are unequal by
      // design (film pacing), so equal spacing math would mis-dock.
      const dockFrac = (i: number) => panels[i].offsetLeft / distance();

      // Two-layer parallax for depth. Content eases into dock (power1.out) and
      // accelerates out (power1.in) — the track itself must stay linear for
      // containerAnimation, so all non-linearity lives in these child tweens.
      // The decorative glow layers (every section child except the content
      // wrapper) drift slower behind. First/last panels clamp to 0 at their
      // docked edge so the vertical handoffs into and out of the pin stay
      // seamless.
      // One timeline (one trigger) per panel spanning its full traversal:
      // enter segment in the first half, exit in the second, dock exactly at
      // the boundary. QuoteSection's (panel 2) glows are excluded — its own
      // rAF rig moves them.
      panels.forEach((panel, i) => {
        const c = contents[i];
        if (!c) return;
        const first = i === 0;
        const last = i === panels.length - 1;
        const decor = i === 2
          ? []
          : (Array.from(panel.firstElementChild?.children ?? []) as HTMLElement[]).slice(0, -1);
        // Third depth layer: tagged accents ride inside the content wrapper,
        // so their own offset adds to its 96px — they travel fastest.
        const fg = panel.querySelectorAll('[data-story-fg]');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tween,
            start: first ? 'left left' : 'left right',
            end: last ? 'left left' : 'right left',
            scrub: 1,
          },
        });
        if (!first) {
          tl.fromTo(c, { x: 96 }, { x: 0, duration: 1, ease: 'power1.out' }, 0);
          if (decor.length) tl.fromTo(decor, { x: 40 }, { x: 0, duration: 1, ease: 'none' }, 0);
          if (fg.length) tl.fromTo(fg, { x: 54 }, { x: 0, duration: 1, ease: 'power1.out' }, 0);
        }
        if (!last) {
          const at = first ? 0 : 1;
          tl.fromTo(c, { x: 0 }, { x: -96, duration: 1, ease: 'power1.in', immediateRender: false }, at);
          if (decor.length) tl.fromTo(decor, { x: 0 }, { x: -40, duration: 1, ease: 'none', immediateRender: false }, at);
          if (fg.length) tl.fromTo(fg, { x: 0 }, { x: -54, duration: 1, ease: 'power1.in', immediateRender: false }, at);
        }
      });

      // Vertical→horizontal blend: as the story approaches, panel 1 content
      // decelerates into place (moves slower than the page), then carries a
      // soft overshoot-and-settle through the first slice of the pin so the
      // switch to horizontal motion has no perceptible seam. Durations map
      // 1 unit = one viewport height of scroll (the approach is exactly 1vh).
      if (contents[0]) {
        gsap.timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top bottom',
            end: () => `+=${window.innerHeight * 1.6}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
          .fromTo(contents[0], { y: 72 }, { y: 0, duration: 1, ease: 'power1.out' })
          .to(contents[0], { y: -26, duration: 0.25, ease: 'power1.out' })
          .to(contents[0], { y: 0, duration: 0.35, ease: 'sine.inOut' });
      }

      // Keyboard focus into an undocked panel glides it into place
      // (overflow-x-clip on the wrapper stops the browser's own scroll fixup).
      const onFocusIn = (e: FocusEvent) => {
        const panel = (e.target as HTMLElement).closest('.story-panel');
        if (!panel) return;
        const i = panels.indexOf(panel as HTMLElement);
        const st = tween.scrollTrigger;
        if (i < 0 || !st) return;
        if (Math.abs(st.progress - dockFrac(i)) < 0.02) return;
        initSmoothScroll()?.scrollTo(st.start + (st.end - st.start) * dockFrac(i));
      };
      track.addEventListener('focusin', onFocusIn);

      setStory({
        trigger: tween.scrollTrigger!,
        panelIds: PANEL_IDS,
        dockFracs: panels.map((_, i) => dockFrac(i)),
      });
      setStoryTween(tween);

      return () => {
        track.removeEventListener('focusin', onFocusIn);
        ScrollTrigger.removeEventListener('refreshInit', fit);
        contents.forEach((c) => c && gsap.set(c, { clearProps: 'scale' }));
        setStory(null);
        setStoryTween(null);
      };
    });

    return () => mm.revert();
  }, []);

  // No flex on this wrapper: ScrollTrigger disables pinSpacing when the
  // pinned element's parent is display:flex.
  return (
    <div className="bg-[#05070d] min-h-screen relative">
      {/* Shared world background: fixed base glows every section sits over */}
      <div className="wr-world" aria-hidden="true">
        <div className="wr-world-glow wr-world-glow-a" />
        <div className="wr-world-glow wr-world-glow-b" />
        <PointerLight />
      </div>
      <ScrollProgress />
      <Hero />
      <RadarTicker />
      {/* Signature moment: own vertical pin, independent of the story's
          containerAnimation; sits between the feed (ticker) and the story. */}
      <NoiseToSignal />
      <StoryContext.Provider value={storyTween}>
        <div ref={pinRef} className="relative overflow-x-clip">
          <div ref={trackRef} className="story-track">
            <div className="story-panel">
              <ThreeBeats />
            </div>
            <div className="story-panel">
              <BriefPreview />
            </div>
            <div className="story-panel">
              <QuoteSection />
            </div>
            <div className="story-panel">
              <Waitlist />
            </div>
            <div className="story-panel">
              <Institutional />
            </div>
          </div>
        </div>
      </StoryContext.Provider>
      <Footer />
    </div>
  );
};

export default Landing;
