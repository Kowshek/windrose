# PROJECT_ANALYSIS.md

Snapshot at commit `07de09f` (pre-redesign). Windrose pre-launch landing page: React 18.3 + TypeScript 5.2 + Vite 8 SPA, Tailwind 3.4, GSAP 3.12 + ScrollTrigger, Lenis 1.1 smooth scroll, `motion` v12 (`motion/react`), react-router-dom 6. Two routes (`/`, `/pledge`). No tests, no CI. `dist/` build output is committed to git. `DESIGN.md` (design system, governs all visual rules) and `PRODUCT.md` (product brief) live at the root.

---

## 1. Folder structure

```
landingpage/
├── index.html                 HTML shell: fonts, inline #boot overlay + its CSS animation
├── DESIGN.md                  Design system (colors, type, liquid-glass, motion rules)
├── PRODUCT.md                 Product brief / positioning
├── vite.config.ts             Stock Vite + React plugin, nothing custom
├── tailwind.config.js         Fonts only (Instrument Serif, Inter)
├── public/                    EMPTY — Hero references /hero-poster.jpg which 404s
├── dist/                      Committed build output
└── src/
    ├── main.tsx               StrictMode + BrowserRouter bootstrap
    ├── App.tsx                Routes + boot-overlay dismissal logic
    ├── index.css              Tailwind + liquid-glass/glow utilities + ticker marquee
    ├── lib/
    │   ├── scroll.ts          Lenis singleton + ScrollTrigger wiring + scrollToTarget
    │   └── hover.ts           initCardGlow (tilt+glow), initMagnetic (cursor pull)
    ├── pages/
    │   ├── Landing.tsx        Section stack, calls initSmoothScroll()
    │   └── Pledge.tsx         Standalone page, no GSAP/Lenis of its own
    └── components/
        ├── Hero.tsx           Nav + fullscreen video + headline choreography
        ├── RadarTicker.tsx    Pure-CSS marquee strip
        ├── ThreeBeats.tsx     #beats — heading scrub + SeeAheadPanel + 2 BeatCards
        ├── BriefPreview.tsx   #preview — sample brief card, rail + block scrubs
        ├── QuoteSection.tsx   #method — parallax glows + word-reveal scrub
        ├── Waitlist.tsx       #waitlist — form, one-shot entrance
        ├── Institutional.tsx  #universities — pilot CTA card, one-shot entrance
        ├── Footer.tsx         Disclaimer + WindroseMark (cursor-tracking needle)
        ├── ScrollProgress.tsx Fixed hairline progress bar (motion useScroll)
        ├── Cursor.tsx         Global custom cursor (dot + trailing ring)
        └── visuals/
            ├── WindroseMark.tsx      Self-drawing compass mark
            ├── EuropeSignalMap.tsx   Dot-matrix Europe + radar pins
            ├── europe-dots.ts        GENERATED map data — do not hand-edit
            ├── TriageVisual.tsx      Feed-collapses-into-brief micro-illustration
            └── MethodVisual.tsx      Sources-converge micro-illustration
```

## 2. Component tree

```
main.tsx (StrictMode → BrowserRouter)
└── App ──────────────── boot dismissal: 'hero-video-loaded' event OR 1200ms → fade #boot,
    │                    then dispatch 'boot-dismissed'
    ├── Cursor ────────── global; always-on rAF; hidden on coarse pointer / reduced motion
    └── Routes
        ├── "/" → Landing ─ initSmoothScroll() once; renders the section stack
        │   ├── ScrollProgress   fixed z-70, motion useScroll+useSpring scaleX
        │   ├── Hero             <section> h-screen; fixed nav (z-60) + mobile panel (z-55)
        │   │   └── WindroseMark (nav logo)
        │   ├── RadarTicker      CSS-only marquee, border-y strip
        │   ├── ThreeBeats       id=beats
        │   │   ├── SeeAheadPanel → EuropeSignalMap (uses europe-dots CITIES/DOTS)
        │   │   └── BeatCard ×2   → TriageVisual, MethodVisual  (initCardGlow each)
        │   ├── BriefPreview     id=preview   (initCardGlow on article)
        │   ├── QuoteSection     id=method    (own rAF parallax rig)
        │   ├── Waitlist         id=waitlist  (initMagnetic on submit)
        │   ├── Institutional    id=universities (initCardGlow + initMagnetic)
        │   └── Footer           WindroseMark trackCursor (rAF needle while in view)
        └── "/pledge" → Pledge   standalone dark page; initCardGlow + initMagnetic only
```

Nav anchors: `#beats`, `#preview`, `#method`, `#universities` (links) + `#waitlist` (CTAs) — all routed through `scrollToTarget()` in `src/lib/scroll.ts`.

## 3. Scroll flow

```
wheel/touch ─→ Lenis (lerp 0.1, raf driven by gsap.ticker) ─→ native window scroll
                                                                    │
        ┌───────────────────────────┬───────────────────────────────┤
        ▼                           ▼                               ▼
  ScrollTrigger.update        window 'scroll' listener        motion useScroll
  (all GSAP scrubs/toggles)   (Hero nav isScrolled >40px)     (ScrollProgress bar)
        ▼
  IntersectionObserver consumers are independent of all of this:
  motion whileInView/useInView (cards, visuals, map) + BriefPreview's IO reveal
```

Key properties:

- **Lenis is a module-level singleton** (`scroll.ts:7`), created on first Landing mount, **never destroyed**. It smooth-scrolls the whole app afterward (including `/pledge`). Under `prefers-reduced-motion` it is never created and everything falls back to native scrolling.
- **The native scrollbar is real** — Lenis animates actual `window` scroll, so `window.scrollY`, IO, and `useScroll` all keep working. This is the property the redesign must preserve.
- **Anchor scrolling** goes through `scrollToTarget()` → `lenis.scrollTo(el)` (or `scrollIntoView` fallback).
- **ScrollTrigger hygiene**: every component registers its triggers inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` and reverts on unmount. Consistent and StrictMode-safe.
- **One outlier**: QuoteSection ignores ScrollTrigger and derives progress manually per frame from `getBoundingClientRect()` (see §8).

## 4. Animation flow

Three animation systems coexist, with a clean division of labor:

| System | Used for | Where |
|---|---|---|
| GSAP + ScrollTrigger | Scroll-scrubbed storytelling + one-shot section entrances | Hero, ThreeBeats, BriefPreview, QuoteSection, Waitlist, Institutional |
| motion (`motion/react`) | In-view reveals, SVG draw-on, AnimatePresence swaps, springs | Hero headline, all visuals, BeatCards, Waitlist form/success, ScrollProgress |
| Hand-rolled rAF + lerp | Cursor, hover physics (tilt/magnetic), QuoteSection glow parallax, compass needle | Cursor.tsx, lib/hover.ts, QuoteSection.tsx, WindroseMark.tsx |

**Boot choreography** (cross-file contract): `index.html` renders `#boot` (CSS-only pulse + fill bar) → Hero's video fires `hero-video-loaded` (`Hero.tsx:90`) or App's 1200ms timer wins → App fades and removes `#boot`, dispatches `boot-dismissed` (`App.tsx:16-26`) → Hero flips `isBootDismissed`, which starts the motion headline word-cascade and the CSS transition-delay staggered reveal of subcopy/CTAs/nav (`Hero.tsx:296-338`).

**Reduced-motion strategy** (four layers, applied consistently): Lenis skipped; `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` around every trigger; `useReducedMotion()` variants in every motion component; `motion-reduce:` utilities + a CSS media query for the ticker. Exception: QuoteSection's rAF glow rig is **not** gated (§8).

**IO-based animations are scroll-architecture-agnostic**: IntersectionObserver accounts for CSS transforms, so every `whileInView`/`useInView` reveal keeps working inside a transformed horizontal track. Only the GSAP triggers with vertical `start`/`end` positions care how scrolling works.

## 5. Existing GSAP timelines and tweens

All scroll-driven GSAP work, with exact configs (pre-redesign line refs):

| File | Target | Animation | Trigger config |
|---|---|---|---|
| Hero.tsx:101 | center content | `y:-80, opacity:0` | trigger section, `top top → bottom 40%`, scrub |
| Hero.tsx:113 | video wrapper | `scale:1.06` | trigger section, `top top → bottom top`, scrub |
| ThreeBeats.tsx:192 | heading `.word` spans | `y:20→0, opacity`, stagger 0.04 | trigger heading, `top 85% → bottom 60%`, scrub |
| BriefPreview.tsx:37 | indicator chip | `opacity` pulse, 1.5s yoyo `repeat:-1` | time-based, not scroll |
| BriefPreview.tsx:48 | margin rail | `scaleY:0→1` | trigger blocks wrap, `top 80% → bottom 55%`, scrub |
| BriefPreview.tsx:69 | ×3 timelines | label `letterSpacing 0.5em→0.25em` + body `y/opacity` at `"<0.2"` | trigger each block, `top 80% → top 60%`, scrub |
| QuoteSection.tsx:82 | timeline | words `opacity 0.15→1` stagger 0.1 → author fade at `">"` | trigger section, `top 75% → bottom 60%`, scrub |
| Waitlist.tsx:35 | container | `opacity/y/scale` entrance, 0.9s power2.out | trigger container, `top 85%`, one-shot |
| Institutional.tsx:24 | container | identical one-shot entrance | trigger container, `top 85%`, one-shot |

Plus the infrastructure tween source: `gsap.ticker.add(t => lenis.raf(t*1000))` + `lagSmoothing(0)` in `scroll.ts:16-19`.

## 6. Components safe to modify (for a scrolling redesign)

- **`src/pages/Landing.tsx`** — the composition root; the natural home for a pin wrapper/track and any orchestration. Currently trivial (mount effect + stack).
- **`src/lib/scroll.ts`** — the single scroll authority. Anchor mapping, story registries, refresh logic belong here.
- **`src/index.css`** — layout-mode utilities (media-gated track/panel rules) belong here.
- **The ScrollTrigger wiring inside** ThreeBeats / BriefPreview / QuoteSection / Waitlist / Institutional `useEffect`s — this *is* scrolling architecture. Their JSX/DOM and visual styling should not change.
- **Waitlist's seam gradient** (`Waitlist.tsx:68-71`) — exists purely to stitch it below QuoteSection in vertical flow; it is legitimate to suppress/adjust when the sections sit side-by-side.

## 7. Components that should remain untouched

- **The boot contract** — `index.html` `#boot` + `App.tsx` dismissal + Hero's event listeners. Three-file CustomEvent choreography; fragile to partial edits, unrelated to scroll.
- **`visuals/europe-dots.ts`** — generated data (header says regenerate via script).
- **All four visuals** (`WindroseMark`, `EuropeSignalMap`, `TriageVisual`, `MethodVisual`) — self-contained, IO-driven, scroll-agnostic by construction.
- **`Cursor.tsx` and `lib/hover.ts`** — global interaction layer, shared with `/pledge`; orthogonal to scroll.
- **`RadarTicker.tsx`** — pure CSS marquee, no scroll coupling.
- **`Hero.tsx` internals** — its two scrubs are self-contained against its own section and unaffected by anything downstream. (Its nav `isScrolled` and `scrollToTarget` calls only require that native scroll and anchor mapping keep working.)
- **`Pledge.tsx`, `Footer.tsx`, `ScrollProgress.tsx`** — no scroll-position dependencies that a pin breaks (ScrollProgress measures total document height, which simply grows with the pin distance).

## 8. Potential performance bottlenecks

1. **~11 concurrent always-on rAF loops** on the landing page (desktop, fine pointer): Cursor (1) + `initCardGlow` per glass card (4: article, 2 beat cards, institutional) + `initMagnetic` per button (~5) + QuoteSection's parallax rig (1) — on top of the gsap ticker and motion's ticker. Each is individually cheap but they all run every frame forever; `initMagnetic` also adds **one `window` mousemove listener per button**.
2. **QuoteSection's rAF rig** (`QuoteSection.tsx:33-72`): calls `getBoundingClientRect()` every frame, never idles when offscreen, and is **not gated behind reduced motion** — the only motion in the codebase that ignores the preference.
3. **Leaked magnetic handler in Hero** (`Hero.tsx:329`): `ref={(el) => { if (el) initMagnetic(el); }}` discards the cleanup function — the rAF loop + window listener survive unmount (and double under StrictMode in dev). The other call sites capture and run cleanup correctly.
4. **`backdrop-filter: blur(12px)`** on every liquid-glass card plus the fixed nav — the single most expensive compositing feature in play; acceptable now, but each *simultaneously visible* glass surface adds GPU cost, which matters when multiple panels are composited during a pinned horizontal transition.
5. **Font-load vs. trigger measurement**: Google Fonts load after first layout and no `ScrollTrigger.refresh()` is issued on `document.fonts.ready`, so scrubbed trigger positions are measured against fallback-font layout. Tolerable today (tall sections), but pinning makes exact start/end positions matter.
6. **Hero video**: full-screen Cloudinary MP4 with `preload="auto"` + a `poster="/hero-poster.jpg"` that 404s (public/ is empty). Network weight, not runtime cost.
7. Housekeeping, not perf: `dist/` is committed and will churn on every build.

## 9. Recommended implementation strategy for the horizontal storytelling redesign

Target experience: Hero and RadarTicker scroll vertically as today; from ThreeBeats the viewport pins and scroll drives a right-to-left horizontal track of five 100vw panels (ThreeBeats → BriefPreview → QuoteSection → Waitlist → Institutional); after Institutional docks, the pin releases into normal vertical scroll to Footer.

**Architecture (implemented in the pass following this report):**

1. **Keep the existing scroll authority exactly as-is.** Lenis → native scroll → ScrollTrigger. The horizontal section is one pinned ScrollTrigger with `scrub: 1` driving a single `ease:'none'` x-tween on a flex track (`x: -(track.scrollWidth - innerWidth)`, `end: '+=' + distance`, `anticipatePin: 1`, `invalidateOnRefresh`). Scroll distance maps 1:1 to horizontal distance, the wheel keeps controlling progress, and the real scrollbar simply grows by the pin distance — no fake scrollbar, no scroll hijacking. `scrub: 1` on top of Lenis' lerp supplies the "slight easing / premium" glide.
2. **One media contract for the whole feature**: `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`, expressed twice in lockstep — a CSS media block in `index.css` that turns `.story-track/.story-panel` into the flex layout, and the same string in `gsap.matchMedia()` in Landing. Below 1024px and under reduced motion, both are inert: the DOM renders as the exact vertical stack that exists today, and every component keeps its current behavior. This is what "don't break responsiveness/accessibility/reduced-motion" costs in practice: the horizontal cinema is a desktop, motion-allowed enhancement, not a replacement.
3. **Rewire in-track scrubs with `containerAnimation`** — the GSAP API built for this. Inside a pinned track, every panel shares the same document Y, so the existing vertical triggers of BriefPreview, QuoteSection, Waitlist, and Institutional would all fire simultaneously at pin start. Each of these components now receives the container tween via React context (`StoryContext` from `scroll.ts`, provided by Landing) and branches its trigger config: horizontal `left X%` positions + `containerAnimation` when the story is active, the untouched vertical config otherwise. ThreeBeats needs **no change**: it is panel 1, arrives vertically, and its heading scrub completes as the panel docks.
4. **Anchor navigation must be remapped, not left to break.** Panel *i* docks at pin progress `i/(n-1)`. `scrollToTarget()` now asks a story registry (set by Landing while the pin is active) for the scroll position of a panel id before falling back to element scrolling — nav links and CTAs keep working in both modes.
5. **Keyboard access**: the pin wrapper uses `overflow-x: clip` so browser focus-scrolling can't desync the transform, and a `focusin` listener on the track glides the focused panel into dock via Lenis. Tabbing through the page remains coherent.
6. **Parallax** comes in two layers: a generic per-panel content drift (content wrapper slides +90→0→−90px against the track, so it moves slower than the frame; first/last panels clamp to 0 at their docked edge so the vertical handoffs are seamless), and QuoteSection's existing glow rig re-pointed at the horizontal axis (`rect.left` instead of `rect.top`) so its horizon/side-glow choreography plays as the panel crosses the viewport.
7. **Panel height reality**: ThreeBeats' natural content (~1100px tall at desktop widths) cannot fit a 100vh panel. Until the deferred "component redesign" pass gives sections horizontal-format layouts, a measure-and-scale guard (content wrapper scaled to fit `innerHeight`, recomputed on `refreshInit`) keeps everything visible instead of clipped. This is the one deliberate interim compromise.
8. **Correctness details**: `ScrollTrigger.refresh()` on `document.fonts.ready`; child scrubs use `scrub: 1` to match the container's smoothing profile; Waitlist/Institutional keep their one-shot entrances (toggle triggers work under `containerAnimation`) minus the `scale` prop, which would fight the fit-scale; Waitlist's vertical-only seam gradient is hidden in story mode via scoped CSS. Two gotchas verified in-browser: ScrollTrigger silently disables `pinSpacing` when the pinned element's parent is `display: flex` (Landing's wrapper dropped its unnecessary `flex flex-col`), and the container tween uses a static `xPercent` rather than a function-based `x` — self-relative percentages stay resize-proof without `invalidateOnRefresh` having to flush the tween's values. Note when debugging: `containerAnimation` child triggers store `start`/`end` in container-tween *time* units (0–duration), not scroll pixels.

**Deferred follow-ups** (intentionally out of scope for the scroll-architecture pass): horizontal-format layouts for the panel content (removes the fit-scale guard, esp. ThreeBeats), a designed color handoff between QuoteSection's gradient panel and its neighbors, optional soft `snap` to panel docks, and the §8 hygiene items (Hero's leaked magnetic ref, QuoteSection reduced-motion gating).
