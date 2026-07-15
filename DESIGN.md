---
name: Windrose
description: Analyst-grade monitoring of Europe, triaged and sourced by a published methodology, at a price a student can pay.
colors:
  void-navy: "#05070d"
  void-footer: "#03050a"
  void-pledge: "#010a17"
  dawn-signal: "#87c8f5"
  dawn-signal-pale: "#c8e6ff"
  atmosphere-dusk: "#0b2740"
  atmosphere-deep: "#0e3350"
  ink: "#ffffff"
  ink-on-light: "#000000"
  ink-70: "#ffffffb3"
  ink-60: "#ffffff99"
  ink-40: "#ffffff66"
  ink-30: "#ffffff4d"
  ink-20: "#ffffff33"
  glass-surface: "#ffffff05"
  surface-faint: "#ffffff0d"
  field-border: "#ffffff26"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 8vw, 6.875rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(1.875rem, 5vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.3em"
rounded:
  pill: "9999px"
  card: "16px"
spacing:
  section-y-mobile: "96px"
  section-y-desktop: "128px"
  card-p-mobile: "32px"
  card-p-desktop: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-on-light}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "#ffffffe6"
    textColor: "{colors.ink-on-light}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-glass:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-glass-hover:
    backgroundColor: "#ffffff1a"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  card-glass:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "32px"
  field:
    backgroundColor: "{colors.surface-faint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
---

# Design System: Windrose

## 1. Overview

**Creative North Star: "The Horizon Briefing"**

Windrose reads as a briefing delivered after dark, with the horizon already showing the first trace of the day ahead. The base of every screen is Void Navy — a near-black that isn't quite neutral, carrying just enough blue to feel like night sky rather than a UI default — and the only saturated color in the system, Dawn Signal, is rationed to soft radial glows at section seams and behind the Method quote. It never appears as a solid fill, a button, or an icon: it is atmosphere, not decoration, and its scarcity is what makes it read as "something is coming" rather than "something is on sale."

Typography carries the same duality: Instrument Serif in italic for display moments feels handwritten and human, like a byline or a signed assessment, while Inter carries every operational surface — labels, body copy, forms, navigation — with the flat, replicable neutrality of a wire report. The pairing is deliberate: the serif is the analyst's voice, the sans is the system underneath it.

This system explicitly avoids reading as either a breaking-news alert (no red, no urgency chrome, no ticker motion) or a discount "student tool" (no playful color, no casual type, no bargain-bin styling) — the founding price is real, but nothing about the surface should look priced to match it. Every visual choice should already be legible to the enterprise buyer this product is built to grow into.

**Key Characteristics:**
- Near-black navy base, never pure black or warm-neutral
- Exactly one accent hue (Dawn Signal blue), used only in soft gradients and glows, never as a solid fill
- White-on-navy text expressed entirely through opacity steps, not separate gray hexes
- Glass-surface cards with cursor-reactive glow and a light 3D tilt — tactile, not static
- Instrument Serif italic for voice and emphasis; Inter for everything operational
- Pill-shaped buttons and fields throughout; no sharp corners on interactive elements

## 2. Colors

The palette is almost monochrome by design: one dark base, one white ink ladder, and a single accent held in reserve.

### Primary
- **Void Navy** (`#05070d`): the canonical background for every section — hero, beats, brief preview, method, waitlist, universities. This is the system's default surface; new sections should use it unless there's a specific reason to deepen.

### Secondary
- **Dawn Signal** (`#87c8f5`) and **Dawn Signal Pale** (`#c8e6ff`): the only saturated color in the system. Appears exclusively inside `radial-gradient(...)` glows — the hero's earth-glow echo, the Method section's horizon parallax, the ambient accents behind the university and brief-preview cards. Never used as a solid background, text color, border, or icon fill. Its entire meaning depends on staying rare.

### Neutral
- **Void Footer** (`#03050a`): a deliberately deeper variant reserved for the footer, marking it as below the main content, not part of the scrolling narrative.
- **Void Pledge** (`#010a17`): the standalone Pledge page's base — one step deeper again, appropriate for a page reached via a direct link rather than the scroll narrative.
- **Ink** (`#ffffff`): primary text and primary button fill.
- **Ink on Light** (`#000000`): text color when placed on an Ink-filled button.
- **Ink 70 / 60 / 40 / 30 / 20** (`#ffffffb3` / `#ffffff99` / `#ffffff66` / `#ffffff4d` / `#ffffff33`): the full text hierarchy is these five opacity steps over Void Navy, not five different grays. 70% for hero subcopy, 60% for section body copy, 40% for labels and captions, 30–20% for legal and fine print.
- **Glass Surface** (`#ffffff05`) and **Surface Faint** (`#ffffff0d`): the near-invisible fills behind glass cards and form fields.
- **Field Border** (`#ffffff26`): the border on inputs, selects, and glass cards at rest.

### Named Rules
**The One-Accent Rule.** Dawn Signal is the only hue in the system besides navy and white. It appears only inside soft radial gradients at low opacity (0.05–0.14) — never as a swatch, never as a solid fill, never on an interactive element. If a new component needs a second color to feel "finished," the fix is contrast in the white-opacity ladder, not a new hue.

**The Void Consolidation Rule.** Void Navy (`#05070d`) is the base for all narrative sections. Void Footer and Void Pledge are the only sanctioned deeper variants, each tied to a specific structural reason (below-the-fold footer, standalone page). Do not introduce a fourth near-black value — if a section needs to feel "deeper," reach for Void Footer, not a new custom hex.

## 3. Typography

**Display Font:** Instrument Serif (with Georgia, serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)

**Character:** Tactile and alive where it counts, quiet everywhere else — Instrument Serif's italic carries the one line per section that should feel human and considered (a headline's closing clause, a pull-quote, the founding price), while Inter runs everything else at a flat, wire-report register. The two fonts should never compete for the same line; a heading is either fully serif or fully sans, and emphasis within a serif heading is carried by italic, not by a font switch.

### Hierarchy
- **Display** (400, `clamp(2.25rem, 8vw, 6.875rem)`, line-height 0.9): the hero H1 only. Paired with `text-wrap: balance` and the text-glow treatment (see Elevation). Reserve for the single most important line on the page.
- **Headline** (400, `clamp(1.875rem, 5vw, 3rem)`, line-height 1.2): section-level H2s (Three Beats, Brief Preview, Waitlist, Institutional). Center-aligned, often with one italicized word or clause for emphasis.
- **Title** (400, `clamp(1.5rem, 3vw, 1.875rem)`, line-height 1.3): card-level H3s and the Method section's pull-quote at smaller breakpoints.
- **Body** (400, 14px base / 16px on larger breakpoints, line-height 1.6): all paragraph copy, set in Ink 60 or Ink 70 depending on prominence. Cap prose measure at ~65ch even though most body blocks here are already short by design.
- **Label** (600, 11px, letter-spacing 0.3em, uppercase): micro-labels like "Product preview," "For universities," and the Brief Preview's "What happened / Why it matters / Watch next" markers. Always Ink 40, always Inter.

### Named Rules
**The One-Voice-Per-Line Rule.** A heading is either entirely Instrument Serif or entirely Inter — never mixed within the same element. Emphasis inside a serif heading is italic, never a weight or family change.

## 4. Elevation

Windrose has no traditional drop-shadow elevation scale. Depth comes from three mechanisms instead: glass translucency (blur + hairline border) for surfaces, soft glow for interactive emphasis, and large-radius atmospheric gradients for spatial depth in the background. Nothing in the system uses a hard, dark, directional shadow — that would read as physical-world object elevation, which conflicts with the atmospheric, screen-native feel the horizon glow establishes.

### Shadow Vocabulary
- **Glass Ambient** (`box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3)`): the resting shadow under every `liquid-glass` card, barely perceptible — it separates the card from the background without implying a strong light source.
- **Button Glow** (`box-shadow: 0 0 20px rgba(255,255,255,0.2)`): every primary button carries this at rest; it intensifies implicitly on hover as the fill lightens. This is the system's substitute for a hover-elevation shadow.
- **Text Glow** (`text-shadow: 0 0 40px rgba(255,255,255,0.3)`): reserved for the hero H1 only. Not a general-purpose treatment — using it elsewhere would compete with the hero for visual weight.

### Named Rules
**The Glow-Not-Shadow Rule.** When a surface needs to feel "raised" or "important," reach for glow (soft, radial, colorless or white) before reaching for a directional shadow. Directional drop-shadows are foreign to this system.

## 5. Components

Cards, buttons, and fields are tactile and alive: they respond to the cursor before they're clicked, via glow and subtle motion, rather than sitting inert until interaction.

### Buttons
- **Shape:** fully rounded (`rounded: 9999px` / pill), `padding: 14px 32px`, `font-weight: 500`, `font-size: 14px`, `letter-spacing: 0.02em` (tracking-wide).
- **Primary:** Ink (`#ffffff`) fill, Ink-on-Light (`#000000`) text, Button Glow at rest, fill brightens to `#ffffffe6` on hover, 300ms transition. Carries a magnetic cursor-pull within a 60px radius (5px max displacement, spring-eased on release).
- **Glass / Secondary:** Glass Surface fill (`#ffffff05`), Field Border (`#ffffff26`), Ink text, hover fill steps up to `#ffffff1a`. Used for the lower-commitment path ("For universities" alongside the primary waitlist CTA).
- **Hover / Focus:** all buttons carry the same magnetic-pull behavior; color/opacity transitions run 300ms, magnetic transform runs on a spring (0.1 lerp factor per frame, ~10:1 effective smoothing), released with a 400ms `cubic-bezier(0.23, 1, 0.32, 1)` ease back to rest.

### Cards / Containers
- **Corner Style:** 16px radius (`rounded-2xl`) throughout — the only radius used for containers.
- **Background:** Glass Surface (`#ffffff05`), `backdrop-filter: blur(12px)`.
- **Border:** 1px, Field Border-adjacent (`#ffffff0d`, slightly fainter than the field border).
- **Shadow Strategy:** Glass Ambient (see Elevation).
- **Internal Padding:** 32px mobile, 40–56px desktop depending on card prominence (Institutional and Pledge cards run deepest).
- **Interaction:** a radial glow (`rgba(255,255,255,0.06)`, 300px circle) tracks the cursor across the card surface, and the card tilts up to 5° on each axis toward the cursor position (`perspective(800px)`), springing back to flat over 600ms on mouse-leave. This is the system's signature tactile behavior — it should appear on every card-like container, not selectively.

### Inputs / Fields
- **Style:** pill-shaped (`rounded-full`), Surface Faint background (`#ffffff0d`), Field Border (`#ffffff26`), Ink text, Ink 30 placeholder text.
- **Focus:** border brightens toward `#ffffff66` and a soft glow appears (`box-shadow: 0 0 20px rgba(255,255,255,0.08)`) — the same glow language as buttons, at lower intensity.

### Navigation
- Fixed top bar, transparent at rest over the hero video; on scroll past 40px, gains a Void Navy backdrop at 70% opacity with `backdrop-filter: blur`, plus a hairline bottom border (`#ffffff0d`). Nav links are Ink 80 at rest, brightening to full Ink on hover with an animated underline (scale-x 0→1, 300ms). Mobile collapses to a slide-in glass panel from the right, staggering link entrances by 75ms.

### Signature visuals
Procedural SVG imagery, all monochrome-plus-glow per the One-Accent Rule, all gated behind `prefers-reduced-motion`:
- **WindroseMark** (`visuals/WindroseMark.tsx`): the compass-rose brand mark; draws itself on first view (ring sweep, rays, north needle). Used in the nav wordmark and footer.
- **EuropeSignalMap** (`visuals/EuropeSignalMap.tsx`): dot-matrix Europe rasterized from real world-atlas geodata (`visuals/europe-dots.ts` — regenerate via script, don't hand-edit), with pulsing signal pins, crosshairs on the active event, and a satellite sweep. Powers the "See ahead" panel.
- **TriageVisual / MethodVisual**: micro-illustrations for the beat cards — the feed collapsing into the brief, and named sources converging into a scored assessment.

### Liquid-Glass (signature component)
The single component name used throughout the codebase (`liquid-glass` utility class) for every translucent surface — cards, the secondary button, the mobile nav panel. It is the system's one structural signature: `background: rgba(255,255,255,0.02); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 8px 32px rgba(0,0,0,0.3)`. Any new translucent surface should reuse this exact recipe rather than approximating it.

## 6. Do's and Don'ts

### Do:
- **Do** keep Void Navy (`#05070d`) as the default section background; reserve Void Footer and Void Pledge for their specific structural roles only.
- **Do** keep Dawn Signal confined to low-opacity radial gradients (0.05–0.14 alpha). It should never appear as a solid fill, icon color, or text color.
- **Do** build every card, secondary button, and overlay panel from the exact `liquid-glass` recipe (`rgba(255,255,255,0.02)` bg, `blur(12px)`, `rgba(255,255,255,0.05)` border, `0 8px 32px rgba(0,0,0,0.3)` shadow) rather than approximating a similar glass look per-component.
- **Do** give every glass card the cursor-glow + tilt interaction (`initCardGlow`) and every button the magnetic pull (`initMagnetic`) — the tactile-and-alive character is a system-wide rule, not a per-component choice.
- **Do** gate every non-trivial animation behind `prefers-reduced-motion`, matching the existing `mm.add("(prefers-reduced-motion: no-preference)", ...)` pattern already used throughout.
- **Do** express all secondary and tertiary text as opacity steps on Ink (`#ffffff` at 70/60/40/30/20%), not as separate gray hex values.

### Don't:
- **Don't** introduce a new near-black background hex. If a section needs to feel deeper than Void Navy, use Void Footer (`#03050a`) — don't invent a fourth variant like the Landing wrapper's now-orphaned `#0a0608`.
- **Don't** use Dawn Signal (or any new hue) as a solid button, badge, or icon fill — it is atmosphere-only by design; a second solid accent color would break the One-Accent Rule.
- **Don't** mix Instrument Serif and Inter within a single heading element. Emphasis is italic, not a font swap.
- **Don't** reach for a hard, directional `box-shadow` for elevation. This system signals depth with glow and glass, not drop-shadows.
- **Don't** load or reference Dancing Script — it's still linked in `index.html`'s Google Fonts request but isn't used anywhere in the component tree; treat it as dead weight to remove, not a font to design with.
