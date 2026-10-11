# Tech RT — Design System

Approved Design Read: 2026-10-10 (redesign v2). Source: client reference `brief/assets/ref-1.png` (PC Builder) + Swiss Industrial Print, filtered through Shifra house rules.

## Concept
A bold technical catalog: paper-white pages, carbon-black ink, hairline dividers, square corners, oversized wide type. Light pages with deliberate dark bands (featured build, footer) — the reference's light→dark rhythm. One accent (blue) used sparingly for prices, links, focus and active states.

## Color tokens
| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--paper` | `#F2F2EF` | page background | — |
| `--surface` | `#FFFFFF` | cards, inputs, product media | — |
| `--ink` | `#0E0E10` | text, primary buttons, dark bands | 17.2:1 on paper |
| `--ink-soft` | `#5A5A61` | secondary text | 6.1:1 on paper |
| `--line` | `#D6D6D1` | 1px dividers, borders (decorative) | — |
| `--line-strong` | `#0E0E10` | hover / active borders | — |
| `--accent` | `#1D4ED8` | prices, links, focus ring, active chips | 6.0:1 on paper |
| `--accent-on-dark` | `#7EA6FF` | accent inside dark bands | 8.1:1 on ink |
| `--on-dark-soft` | `#A1A1A8` | secondary text on ink | 7.5:1 |
| `--whatsapp` | `#25D366` | WhatsApp order button only (functional), text ink | 9.7:1 |
| `--danger` | `#B91C1C` | unavailable, errors | — |
| `--success` | `#15803D` | available | — |

Rules: one accent. No gradients, no glow, no glass except the sticky header (`backdrop-blur`). Shadows only on hover/sticky elements, soft and offset.
Exception (2026-10-11): Paper Shaders may render in ink / paper / line / accent only, in two places: the hero visual and the category hover. See Motion.

## Typography
- Arabic: **Alexandria** (variable) — headings 800, UI 500–600, body 400. Line-height body 1.8, headings 1.3.
- Latin: **Archivo** (variable, `wdth` axis) — display/headings at `wdth 125` weight 800 (`.font-display`), body at `wdth 100` 400/500.
- Scale (fluid): display `clamp(2.5rem, 7vw, 5.5rem)`, h2 `clamp(1.75rem, 4vw, 3rem)`, h3 1.25rem, body 1rem (Arabic 1.0625rem), small .875rem.
- Latin-only tracking: display `-0.03em` scoped to `:lang(en)`. Never tracking on Arabic.
- `text-wrap: balance` on headings, `tabular-nums` for prices and specs. Western digits; prices/phones in `<bdi>`.

## Shape & layout
- Radius: 0 on buttons, chips, cards, inputs (square, mechanical). Exception: none.
- Container `max-w-7xl`, gutters 16px mobile / 24px desktop.
- Blueprint grid: category grid and specs table use `gap-px` on a `--line` parent for hairline cells.
- Section rhythm: light hero → dark featured band (enters with a notch from the hero) → light categories → light products → light "how to order" → dark footer.
- No eyebrow labels above headings. No 3-equal-card feature rows.

## Components
- Button primary: ink bg, paper text, 48px min height, hover → accent bg; active scale .98.
- Button secondary: 1px ink border, transparent; hover → ink bg / paper text.
- WhatsApp button: `--whatsapp` bg, ink text, WhatsApp glyph.
- Product card: white surface, 1px line border → ink on hover, image 1:1 contain on white, name 2 lines, price in accent, availability as square tag.
- Chips (categories/sort): square, 1px line; active = ink bg.
- Breadcrumbs: small ink-soft, separators mirrored in RTL.
- Specs table: `dl` grid, label ink-soft / value ink, hairline rows.
- Sticky mobile order bar: white, top hairline, price + WhatsApp button, appears when the main CTA leaves view.

## Motion (level: rich — CSS + IntersectionObserver, no library)
| Element | Trigger | Motion | Duration / easing |
|---|---|---|---|
| Hero headline | load | per-line mask rise (no word split — keeps Arabic/bidi intact) | 700ms, 90ms stagger, `cubic-bezier(.16,1,.3,1)` |
| Hero image (fallback) | load | grayscale photo `public/hero/case.webp`, scale 1.06→1 + fade | 900ms |
| Hero image (shader) | load / hover (mouse) | Intro only: on capable devices the photo is held before paint (`lib/hero-hold.ts`), an `ImageDithering` print (ink on paper, 4×4 Bayer, 1 step) develops pixel size 16→1.5, then fades out to the clear grayscale photo, which is the resting state. Skipped (photo shown at once) on slow connections or when the shader is late. Hover replays 7→1.5 and fades. No ambient layer, no tilt | 1300ms + 450ms fade; hover 650ms |
| Featured band | in view | image rise, spec rows stagger | 500ms, 60ms |
| Category grid | in view / hover | cells stagger; hover invert to ink + icon nudge | 40ms stagger; 200ms |
| Category cell (shader) | hover / focus, fine pointer only | `Warp` (accent, accent-on-dark, ink, accent; checks/stripes per cell) fills the cell; an ink scrim (solid bottom 28% → clear by 72%) sits under the name/count only. Measured worst case: name 14.3:1, count 6.3:1. Functional scrim, the one gradient exception | fade 250ms |
| Product card | hover / press | image scale 1.04, border ink; press .98 | 200ms |
| Mobile menu | open | slide from inline-start, links stagger | 240ms |
| Sticky order bar | main CTA out of view | slide up | 250ms |
| Page navigation | route change | cross-fade (View Transitions) | 150ms |

`prefers-reduced-motion: reduce` disables all of the above.

### Shader rules (Paper Shaders, `@paper-design/shaders-react`)
- Enhancement only: every shader sits on a static fallback that already looks finished. Gate: `lib/shader-budget.ts` (no reduced motion, no Save-Data/2G, device memory ≥ 4GB, hardware WebGL; software renderers like SwiftShader are skipped).
- Loaded lazily (`next/dynamic`, `ssr: false`) after `load` + idle; never the LCP element.
- No continuous shader in the hero: the print is an intro/hover accent and the clear photo is always the resting state (owner feedback 2026-10-11: the product must stay readable). Phones get the intro only, no category Warp.
- Per-frame motion goes through `paperShaderMount.setUniforms/setSpeed`, never React state.
- Measured cost (4× CPU throttle): one ~150–180ms task when the shader starts, nothing after.
- Components live in `components/ui/` (shadcn / 21st.dev convention).

## Dashboard
Same tokens and fonts, light theme, square corners. Visual restyle only.
