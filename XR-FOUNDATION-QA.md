# Zyberlane XR — foundation PR quality gate

Date: November 15, 2026.
Repository: `diluxlane/Zyberlane-XR`.
Branch: `feat/zyberlane-xr-foundation-20261115`.
Stage: engineering review, **not** validated on physical headsets.

## Correctness changes under review

| Item | Change | Validation |
| --- | --- | --- |
| Identity | MotionVR public-facing labels → Zyberlane XR | HTML and README source review |
| Hardware concept | CTA explicitly says 3D headset concept, not manufactured headset | Source review |
| Phone normal fullscreen | Native Fullscreen API where allowed, otherwise CSS expanded view with visible exit | Regression contract and real-phone QA pending |
| In-view controls | Expanded video has play/pause, mute/unmute and exit | Static contract and mobile QA pending |
| VR box | Retains split-screen and landscape-lock request; truthful fallback messaging | Real phone testing pending |
| Screen rotation | `screen.orientation.angle === 0` stays valid | Quaternion unit test |
| Sensor interruptions | Resume after 3.5 seconds resets calibration; stale status shown | Sensor test and real-hardware test pending |
| Source frames | Absolute-to-relative transition drops incompatible calibration history | Sensor unit test |
| Invalid readings | Reject nonfinite beta/gamma | Unit test |
| Privacy | Existing local-file handling unchanged; no tracking, uploads or remote proxies introduced | Source review |

## Automated verification

The existing CI workflow executes `node --check app.js` and `node --test tests/*.test.cjs` on pull requests.
Confirm the action run on **the exact PR head commit** before approval. Automated tests simulate orientation data and inspect source contracts; they do **not** prove actual Android/iOS sensor or headset behavior.

## Manual browser/device acceptance — not yet executed in this PR

- [ ] Mobile Chrome on supported Android: sensor permission requested only from button click; alpha/beta/gamma values meaningful; clear refusal/no-sensor fallback.
- [ ] Android device without reliable gyro/heading: touch drag and recenter are usable; UI does not claim reliable 360° tracking.
- [ ] iOS Safari: test permission gesture and supported vs blocked native fullscreen; CSS expansion and exit remain accessible.
- [ ] Desktop: keyboard/play/pause/seek/mute controls, pointer drag and responsive canvas.
- [ ] Normal video: load local MP4; verify picture **and actual audio** over device speakers and connected headphones.
- [ ] Real 360°/180° footage: projection and source stereo maps correctly; no false conversion from 2D video.
- [ ] Headset mode: CSS split-screen, native fullscreen where supported, safe exit and rotation-lock degradation; stop on discomfort.
- [ ] CORS / unsupported codec: no blank misleading success and no bypass proxy.
- [ ] Fullscreen transitions: native, CSS fallback, Esc, browser back/exit, HUD controls, repeated entry/exit and orientation changes.
- [ ] WebGL context: actual shader output and device GPU performance, not merely a fallback flat player.

## Non-goals

Do not claim certified VR, eye tracking, commercially available Zyberlane-manufactured hardware, support for all phones, native headphones control, universally reliable gyro-free yaw or finished XR Worlds/Games.

Preserve pre-existing page structure, monochrome styling and original player rendering. Leave production deployment and domain changes to separately authorized release review.
