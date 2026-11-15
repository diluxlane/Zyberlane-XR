# Zyberlane XR — premium player-first redesign

**Status:** Development-only, draft PR pending QA. This document describes code changes, not evidence of physical-device validation.
**Base:** `diluxlane/Zyberlane-XR/main` with original Zyberlane umbrella identity.
**Scope:** Approved phases A–E; no merge, production promotion, DNS or original Zyberlane company-site changes.

## Product intention

A first-time visitor who has never heard of XR should open the player, choose a video, understand normal vs 180° vs 360° content and start watching without scrolling down to find a different configuration section. The interface is a private video application, not a marketing landing page.

### Phase A — Application layout

- Removed the oversized editorial hero, marquee, three promotional configuration cards, long principles and CTA sections.
- Compact Zyberlane header, concise introduction and **video player directly underneath**.
- Two entry points to the **same** local video input: player empty state and always-visible top-bar Choose video action.
- Secondary Open link button opens a focused video URL dialog rather than a permanent long input.
- All playback controls are directly below the viewer; video-type selector and headset/motion/settings buttons follow immediately.
- No artificial demo video or invented portfolio media.

### Phase B — Interaction architecture

- Default is `cinema` / Normal video, not `360` (the default now matches ordinary user content).
- Video-type selector: **Normal video / 360° video / 180° video**; users can change it at any time.
- **VR glasses** is a separate headset viewing mode; it is not confused with the video source's stereoscopic format.
- Details moved to native `<dialog>` Settings: stereo layout `mono/sbs/tb`, FOV, smoothing, touch toggle, optional sensor diagnostics `alpha/beta/gamma`.
- Help modal teaches the process in three short steps. Native dialogs support Escape and focus restoration.
- UI feedback for invalid links appears inside the link dialog; media failure also appears near the player.
- No video means headset mode is unavailable, rather than a blank split-screen. If WebGL is unavailable, the browser falls back to **flat video** with controls and explicitly disables incompatible panorama/VR actions.

### Phase C — Zyberlane visual system

- Exact approved ZL mark and original geometric Zyberlane wordmark; descriptor **CREATIVE TECHNOLOGY COMPANY** and tagline **Built Beyond Boundaries.**
- Shared monochrome `#000`, `#0d0d0d`, `#141414`, `#1c1c1c`, `#f4f4f2`, subtle borders.
- Self-hosted licensed Inter Tight font, fallback Helvetica Neue.
- `--ease: cubic-bezier(.22,1,.36,1)`, restrained intro reveal, subtle hover lift, quiet orbit decoration.
- Reduced-motion preference disables decorative animations. Nothing transforms the immersive viewport during fullscreen/VR.

### Phase D — Validation

Static/logic checks (run at PR head):
```sh
node --check app.js
node --check design.js
node --check ui.js
node --test tests/*.test.cjs
```

CI also attempts a headless Chromium smoke test, generating a local WebM fixture; verifies desktop/tablet/mobile layouts, no horizontal overflow, native help/settings/link dialogs, invalid URL feedback, local video loading and playback, and uploads screenshot artifacts for review.

**Not yet physically verified:** iOS Safari motion permission, Android phone orientation drift, actual headset comfort or optics, headphone routing, real 180°/360° projection with user-supplied footage, and remote CORS behavior. Browser tests cannot substitute for these.

### Phase E — Review / release

- Isolated GitHub feature branch and **draft** PR.
- GitHub Actions status and Vercel check must pass on exact final head.
- Review screenshot artifacts and run manual browser/phone QA before merge. QA should include 360px, 390px, 768px and 1440px widths; no horizontal clipping; essentials accessible on first mobile viewport.
- Production and DNS remain untouched. The parent Zyberlane company website is not changed.

## User flow

1. Open the XR page. All vital actions are near the viewport.
2. Choose a local supported video (the file stays in the browser) or open a direct HTTPS media URL.
3. Use playback. Default Normal video works for everyday video; choose 360°/180° only when the source was actually recorded that way.
4. Optional Move phone prompts browser sensor permission; touch remains the fallback. Recenter when needed.
5. Optional VR glasses switches to side-by-side phone viewing; no eye tracking, optics calibration, or universally reliable gyro-free yaw is claimed.
6. Optional Settings reveals stereo formats, FOV, smoothing and diagnostics; Help explains the interface in plain language.

## Non-goals

No hosted library, account, purchases, database, analytics, upload endpoint, unapproved demo footage, built-in YouTube playback, WebXR headset hardware integration, simulated eye tracking, changing external company branding or publishing the site.

## Final manual acceptance checklist

- [ ] Desktop: video, playerbar, mode and advanced buttons visible without searching for them
- [ ] Mobile: same essentials visible or directly reachable, no sideways scroll, touch areas comfortably usable
- [ ] Local WebM/MP4 with sound: play/pause, seek, mute, change video, speaker/headphones
- [ ] Real 180° and 360° sources mapped correctly; standard 2D not distorted
- [ ] Motion consent/recenter: supported devices, denied permission, and no-sensor fallback
- [ ] VR glasses: side-by-side view, fullscreen allowed/blocked, orientation lock gracefully degraded and visible exit
- [ ] Direct HTTPS URL: success, timeout, invalid input, CORS/codec errors, no false success
- [ ] Settings/Help: keyboard focus, Escape/backdrop close, all controls labelled, screen reader and reduced motion
- [ ] WebGL unavailable: normal video still playable, immersive controls clearly disabled
- [ ] Visual QA: Zyberlane logo/descriptor, premium typography, consistent 8/12/16/24px spacing, no scroll-driven app obstruction
- [ ] Evidence recorded on exact final code hash; separate owner approval before deployment/merge
