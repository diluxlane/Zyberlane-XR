# Zyberlane XR — Experimental immersive browser video player

An original, self-contained, dependency-free prototype for watching browser-supported videos in a simulated VR cinema, 180° or 360° equirectangular scene, optionally split into two eyes for a generic phone VR box.

**Status: experimental, not a production/comfort-validated Android VR app.** Its head tracking depends on *actual* browser orientation readings. **It has no real eye tracking**; the crosshair is a head-gaze reference only.

## Zyberlane XR visual-system rebuild — November 15, 2026

The frontend now follows the **current Zyberlane company website's editorial design language**, with the original XR player functions and source code preserved:

- **Brand:** the company's ZL vector mark from `diluxlane/Zyberlane-Website-New/dist/assets/zyberlane/logo-white.svg`, the Zyberlane XR wordmark, and the approved “Built Beyond Boundaries” line.
- **Color:** shared source tokens `#000`, `#060606`, `#0d0d0d`, `#141414`, off-white `#f4f4f2` and neutral translucent border grays, with no neon accent.
- **Typography:** the **actual Inter Tight WOFF2 files** from the approved website are now **self-hosted** in `assets/` (OFL license copied as `assets/Inter-Tight-OFL.txt`). Local Helvetica Neue and normal system fallbacks preserve the approved typography stack.
- **Layout:** a full editorial landing section, studio viewport, playback bar, three-step controls workspace, capability/honesty section, next-project section and restrained footer.
- **Animation:** section reveal on intersection, rolling text on hover, a muted scrolling typography strip, slow orbit decoration, softened button transitions and reduced-motion overrides. These follow the *design vocabulary* of the main website; the original TESERACT intro and page-transition engine was **not transplanted** because it belongs to a different DOM structure and could interfere with WebGL, permissions and fullscreen.
- **Actual VR engine:** `app.js` remains separate and unmodified by this visual redesign. Existing player element IDs, local/remote media, projection, stereo, gyro, drag, recenter, seek, audio, fullscreen fallback, VR mode and WebGL handling remain wired to it. `design.js` adds only presentation animations and avoids transforming/clipping the video stage during fullscreen.
- **Source provenance:** logo/vector and licensed font assets were copied from the owner's approved Zyberlane repo; the 3D logo asset is a retained optional illustration. No TESERACT client's photographs, videos, or third-party imagery were imported.

**Limitations:** This is code-level brand fidelity, not an exact duplication of the company website's distinct animations, and not independently screenshot-compared in a physical browser. Final UI testing must cover mobile, tablet and desktop, an actual WebGL video, safe fullscreen transitions, device rotation, orientation permission, connected headphones and reduced motion. The product is still experimental; no promise of universally accurate gyro-free motion, real eye tracking, calibrated headset optics or manufacturing is made.

See `DESIGN-IMPLEMENTATION.md` for the element-by-element mapping and QA acceptance criteria. All tests remain available through `node --check app.js`, `node --check design.js`, and `node --test tests/*.test.cjs`.

## Features

- Video files via device picker. The file is accessed through a temporary `blob:` URL; no upload, server backend, or analytics.
- Direct HTTPS video resource URL (MP4/WebM etc.) where the server supports cross-origin video playback for WebGL texture use. A YouTube watch URL is not a direct media URL. DRM/streaming manifests are unsupported.
- Standard flat video in an anchored virtual cinema, 360° equirectangular, 180° equirectangular; regular 2D or side-by-side/top-bottom 3D source layouts.
- Split-screen stereo view for a cardboard-style phone headset. No optics distortion profile or lens calibration yet.
- Device orientation readings (alpha/beta/gamma) via DeviceOrientationEvent; smooth recenterable relative head orientation and touch drag fallback.
- Adjustable FOV and smoothing; fullscreen and headset modes; simple video controls.
- Designed to use HTTPS without extra permissions beyond browser orientation permission. No camera/microphone/GPS/storage APIs.

## How to use on your phone

1. Host the **complete repository's static site** (`index.html`, `style.css`, `app.js`, `design.js`, and `assets/`) on an HTTPS static host (GitHub Pages, Cloudflare Pages, Netlify, Vercel, etc.). `localhost` is suitable for local development. Opening `index.html` directly using file:// may not enable sensors.
2. Open in Chrome for Android. Pick a local video or paste an HTTPS URL ending in a **direct video resource** with CORS enabled. Press Play.
3. Select `Virtual cinema`, `360° equirectangular`, or `180° equirectangular` to match the video **source**. Select mono, SBS, or top/bottom to match the **source stereoscopy**.
4. Press **Enable motion sensors**. Rotate the phone and inspect the alpha/beta/gamma readings. Alpha may be unavailable or unreliable without a gyroscope/magnetometer. Head tracking is not guaranteed even if beta/gamma change.
5. While looking straight ahead, press **Recenter**. Select **Enter VR mode**, rotate the phone to landscape, put it in the VR box, adjust lenses carefully. Exit if movement feels delayed or uncomfortable.
6. If sensors aren't exposed or heading does not change, use touch controls or a native Android app with `TYPE_GEOMAGNETIC_ROTATION_VECTOR` as a next step.

## Limitations and honesty

- DeviceOrientation events are browser- and device-dependent. A browser cannot manufacture compass data that is absent from hardware or withheld by the browser. **Smooth, precise head tracking without a gyroscope is not guaranteed**. Detecting changes in `alpha` is a diagnostic hint, not proof of accurate tracking.
- No physical eye tracker can be made from an accelerometer or compass. A basic phone VR box typically blocks the phone's cameras from viewing the eyes; true eye tracking needs eye-facing camera(s) or purpose-built hardware.
- Video decoding depends on the browser. MP4/H.264/AAC is generally most compatible; MKV/AVI support is not guaranteed. Remote video textures require CORS and can fail even if a URL works in a normal player.
- No YouTube page URLs, DRM, subtitle tracks, playlist support, streaming manifests, or arbitrary webpage playback.
- The headset view has **no optical distortion correction or IPD calibration**: correct stereo geometry/comfortable viewing is not verified for a particular lens/headset. Not recommended for prolonged sessions, and stop on discomfort.
- Browser motion permissions generally require HTTPS. A local file opened with file:// is not the intended deployment method.
- This project was tested in a desktop browser with simulated events, **not** on your Android handset or a physical headset; live performance, yaw tracking and comfort remain unverified.

## Architecture / privacy

Static HTML/CSS/JS. WebGL 1 shader renders video into either a screen plane or equirectangular view. No third-party JavaScript packages, web requests initiated by the app beyond the direct video URL you supply, analytics, account, or backend. For a remote URL, your browser **does** contact that host and exposes ordinary connection metadata to it. Local file object URLs are released when replaced.

## Development

Serve with `python3 -m http.server 8000` for desktop tests on `http://localhost:8000`; use an HTTPS host on mobile.

## Source

Inspired by the general idea of sensor-reactive visuals in [shajidhasan/mobile-fluid-sim](https://github.com/shajidhasan/mobile-fluid-sim), but uses original code and does not copy that project's fluid code. Motion controls reference the browser DeviceOrientation API; no dependency on the example project.

## License

MIT. This prototype is provided AS IS, without warranty, and is not a certified VR product.

## Deployment

**Recommended:** the existing public `diluxlane/Zyberlane-XR` repository and a separate Vercel static project. The files are at the root. Import into Vercel with framework **Other** and **no build command**, then deploy. The `vercel.json` file sets privacy-oriented headers without disabling browser motion sensors. The default `.vercel.app` domain provides HTTPS.

Do not add third-party tracking, upload endpoints, or undocumented remote proxies. Do not advertise real eye tracking or gyroscope-equivalent tracking until hardware-validated. Do not confuse the interface's head-gaze crosshair with optical eye tracking.

## Tracking improvements and camera research

The sensor-only renderer now uses `inverse(initial) × current` for recentered relative device orientation, suppresses sub-degree jitter, filters isolated implausible heading jumps, and reports a meaningful heading excursion rather than treating a tiny compass fluctuation as proof of full yaw tracking. Real-device results remain unverified.

### Camera-assisted tracking — proposed research, not implemented

A user-authorized rear-camera optical-flow experiment could estimate *relative* orientation from features tracked across consecutive low-resolution frames. Calibrated angular displacement could be combined with gravity/compass measurements and filtered according to visual-tracking confidence, but this would not provide true eye tracking, universally accurate 360° yaw, or six-degree-of-freedom positional VR. Occluded cameras, darkness, blank walls, fast turns, limited camera frame rates and accumulated drift are significant limitations. A headset may physically cover the rear camera.

If implemented, require an explicit on/off permission gesture, capture no audio, process frames entirely locally, upload or store no imagery, stop all camera tracks on disable/page hide, and clearly label tracking as experimental. The Android geomagnetic rotation-vector API remains a more direct accelerometer-plus-magnetometer option when the device exposes it.

## Full immersive 360° (no virtual cinema screen)

Zyberlane XR defaults to **Immersive 360°** instead of Virtual Cinema. Use an actual equirectangular 360° MP4/WebM (typically approximately 2:1 for monoscopic footage), and select **Video projection → Immersive 360° — inside the video**. Choose **Normal 2D (mono)** for a regular panoramic video; VR Box Mode duplicates the same surround view for both eyes. This is 3DoF rotational viewing, not stereo depth or physical movement through the filmed scene. Ordinary flat videos cannot be made genuinely 360° by changing modes: select **Virtual cinema — floating screen** for those. The VR shader and sensor tracking are unchanged by this default-mode improvement.

Official A-Frame public 360° test media: `https://cdn.aframe.io/360-video-boilerplate/video/city.mp4`. The asset project documents CORS-enabled serving, but compatibility should still be checked on each device.

## Zyberlane XR foundation update — November 15, 2026

The code now uses **Zyberlane XR** in the main page title, header and footer without changing the experimental player architecture. The standalone 3D headset concept-model page and its link have been removed. The experimental video player, including the phone VR box mode, remains available.

### Fullscreen and interaction

- The **Fullscreen** button first requests the browser's native Fullscreen API. Where that API is unavailable or rejects the request, the player offers a fixed-position **expanded view** (not genuine system fullscreen; browser bars may remain). In expanded video viewing there are in-view pause, mute and exit controls; Escape exits the CSS-expanded view.
- VR box mode still offers a side-by-side view and tries to request native fullscreen and landscape rotation. If unavailable, its CSS-expanded view remains functional; no browser can guarantee system fullscreen on all devices.
- Audio uses the browser/device's chosen output (speaker or connected headphones); the web app cannot force headphone routing or override device audio policy.
- Orientation processing now respects a valid 0° `screen.orientation.angle`, rejects nonfinite tilt samples, discards stale pose history when sensors resume after a long gap and resets calibration after absolute/relative source switching. When readings stop, the UI labels them paused; touch drag remains available.
- These changes do **not** imply accurate 360° yaw on phones without suitable sensor readings, stereo optical correction or eye tracking.

### Verification and review

The pull request includes Node.js regression tests in `tests/player-behavior.test.cjs` as well as the original quaternion tests. The CI checks source syntax and deterministic behavior only, **not** real phone hardware or physical-headset comfort. A successful static build does not prove video texture rendering, codec performance, headphone output, compass accuracy or actual fullscreen on every browser.

Run locally:
```sh
node --check app.js
node --test tests/*.test.cjs
python3 -m http.server 8000
```

Before release: test local MP4 audio through speaker/headphones, native versus CSS-expanded fullscreen, portrait/landscape orientation changes, stable recentering, gesture touch fallback, WebGL availability, remote CORS errors, and exit from both normal and headset modes on real Android/iOS devices. Confirm that expanded mode does not block browser navigation or access to exit controls. **Do not merge based on simulated tests alone** if these behaviors are considered release blockers.


## Unified Zyberlane identity (November 15, 2026)

The XR product is part of the **ZYBERLANE — CREATIVE TECHNOLOGY COMPANY** umbrella, with the exact approved brand descriptor and **Built Beyond Boundaries.** tagline. This does not assert corporate registration; Zyberlane operates as an unregistered independent business in Sri Lanka.

The header and footer both display the approved ZL icon alongside the **new original geometric vector ZYBERLANE wordmark**, not ordinary Inter Tight lettering or a copy of the TESERACT logo. The icon, wordmark and icon+descriptor lockup are self-contained files:

- `assets/zyberlane-mark.svg`
- `assets/zyberlane-wordmark.svg`
- `assets/zyberlane-lockup.svg`
- `brand/identity.json` — portable source of truth for palette, typography, easing, company descriptor and tagline.

These wordmark assets are **byte-identical** copies from `diluxlane/Zyberlane-Website-New` at the shared branding PR stage, so XR is consistent even without a network request to the main website. Continue to use the original site color palette and restrained scroll animations. Do not introduce external logo fonts or alter VR engine behavior for brand effects.

Future Creative Lab and other products should use the same vector assets and portable brand manifest; **there is currently no `diluxlane/Zyberlane-Creative-Lab` repository to update**. Brand implementation for an eventual Lab must be separately tested and approved.
