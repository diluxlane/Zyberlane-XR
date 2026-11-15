# Zyberlane XR — company-site design audit and implementation

**Source of truth:** `diluxlane/Zyberlane-Website-New/main` at the November 15, 2026 Phase 4 state, specifically `dist/styles.css`, `dist/index.html`, `dist/assets/zyberlane/logo-white.svg`, and the two licensed Inter Tight WOFF2 assets.

**Target:** `diluxlane/Zyberlane-XR`, branch `feat/zyberlane-xr-editorial-ui-20261115`.

**Owner direction:** Rebuild the XR frontend to match the new Zyberlane website's animations, logo, typography, design and neutral color palette **while preserving the existing XR functions**. This is a product-specific composition using the same source design vocabulary, not a literal copy of every TESERACT page animation.

## Verified design characteristics and mappings

| Company website | XR implementation |
| --- | --- |
| `#000` base, `#060606` secondary, `#0d0d0d` and `#141414` layered surfaces | Exact same token values in XR CSS, off-white text `#f4f4f2`, translucent neutral borders |
| `TS Sans`/Helvetica Neue and self-hosted Inter Tight, tight editorial letter spacing | Matching local Helvetica Neue preference, the **same copied Inter Tight font binaries**, `-.072em`/larger editorial hero tracking |
| Approved ZL geometric vector glyph in the header and assets | The exact ZL SVG path copied from `dist/assets/zyberlane/logo-white.svg`, used for header, video empty state, marquee and footer |
| Rounded dark/light buttons, restrained lift and rolling duplicate-text hover animation | Editorial `action` and studio controls, 16px+ rounding, hover lift and `roll` spans |
| Motion reveal choreography, scrolling text strips, soft easing and section rhythm | `design.js` intersection reveals, CSS ticker, `--ease: cubic-bezier(.22,1,.36,1)`, responsive motion, opt-out under reduced motion |
| Responsive 1344px maximum layout and 80/64px navigation dimensions | `--maxw:1344px`, 80px desktop/65px compact header, responsive section padding and breakpoints |
| The company site maintains a consistent experimental/honest technology narrative | XR described as experimental with exact capabilities/limitations; no imaginary manufactured headset or eye tracking |

## Component inventory and behavior preservation

- **Video stage**: `#theater`, `#scene`, `#sourceVideo`, `#empty`, `#reticle`, `#vrHud`, expanded controls and `#modeLabel` preserved. Existing WebGL renderer and source video logic remain in `app.js`.
- **Playback**: play/pause, seek, mute, current time, total duration, fullscreen and expanded-view controls retain original IDs.
- **Sources**: local file picker and direct HTTPS URL input remain unchanged in behavior; remote media still requires CORS/codec support.
- **Motion**: sensor permission action, alpha/beta/gamma telemetry, recenter and touch drag remain unchanged.
- **View setup**: projection (`360`, `cinema`, `180`), stereo layout (`mono`, `sbs`, `tb`), FOV, smoothing and generic VR box mode retain underlying source values and handlers.
- **Privacy**: local media never uploads. The page has no analytics/scripts that access user video. User-entered remote URL connects to its host.
- **Phone VR**: still experimental. Stereo optics are not headset-calibrated, no actual eye tracking, no guaranteed gyro-free yaw or external audio routing controls.

## Engineering boundaries

- `app.js` is **left unchanged by this design PR** to minimize regressions to motion/video/headset state.
- `design.js` is independent progressive enhancement: content remains readable without JS; it handles reveal effects and removes entrance transform/overflow clipping from the stage during fullscreen or headset viewing.
- The font binaries are vendored, not hotlinked, and the corresponding **SIL Open Font License** is preserved at `assets/Inter-Tight-OFL.txt`.
- The 3D ZL logo illustration was copied from the approved company website for possible future visual use; the current visual build uses the vector logo. No original-source photos, mock clients, videos, testimonials, or unapproved commercial materials were imported.
- The original TESERACT site JS and whole CSS bundle were **not** dropped into the XR repo; only its verified typography/colors/logo and compatible interaction patterns were applied, minimizing risks of fullscreen and permission conflicts.

## Evidence and acceptance

### Source/static checks

- Check all XR event-handler ID references resolve in the new HTML and no duplicate element IDs exist.
- Confirm the engine video and sensor functions retain their previous source.
- Confirm actual copied font/mark binaries are present and license copied.
- Run `node --check app.js`, `node --check design.js`, and `node --test tests/*.test.cjs` in CI on the exact PR head.
- Confirm native/CSS fullscreen can remove parent reveal clipping and the player exit controls are still reachable.
- Ensure reduced-motion mode disables nonessential motion, with readable content when `IntersectionObserver` is absent or JS disabled.

### Mandatory real-browser regression (not yet performed)

- [ ] Desktop at ~1440px and 1280px: typography, navigation, hero rhythm, video aspect ratio, all panel controls and footer.
- [ ] Tablet at 768px and ~1024px: two-column controls, settings overflow, readable playback bar.
- [ ] Mobile at 360px and 390px: no horizontal scrolling, visible touch targets, source picker, seek, text wrap, permissions.
- [ ] Actual local video: load, texture renders, play/pause, seek, speakers, headphones, mute and resume.
- [ ] Direct HTTPS source: successful CORS-enabled media and meaningful unsupported/CORS failure.
- [ ] Actual 180°/360° videos and SBS/TB: correct source projection and stereo eye mapping.
- [ ] Phone sensors: permission, alpha/beta/gamma, correct recenter, relative/absolute transition, touch fallback without gyro, no false yaw promises.
- [ ] Browser fullscreen and CSS fallback: stage not clipped/hidden; in-view play, mute and exit; Escape/browser Back behavior.
- [ ] Phone headset: short comfort test, landscape, HUD and safe exit, honest limitations.
- [ ] Reduced motion + keyboard + screen reader: semantic links, labels, visible focus, no hidden or inaccessible controls.
- [ ] Verify the final deployment only on an isolated XR staging project; no main-site production DNS changes.

**Status:** Implemented in a development branch. Static/CI evidence can be attached after the PR run; no fabricated mobile/browser screenshots, no unverified comfort or feature certification.
