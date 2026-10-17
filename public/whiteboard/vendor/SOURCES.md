# Whiteboard gesture assets

These assets are served from this website's own origin. The gesture worker does
not load a CDN script or send camera frames to a server. It returns only the
first detected hand's normalized landmarks and the recognized gesture.

## Pinned sources

- Package: `@mediapipe/tasks-vision@0.10.32`.
- Package download: <https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-0.10.32.tgz>.
- Published npm tarball SHA-1 (verified): `9adcb290cab508e001674a8b2b9dbfd9c9e0935f`.
- Official gesture model, float16 version 1:
  <https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task>.
- Model SHA-256: `97952348cf6a6a4915c2ea1496b4b37ebabc50cbbf80571435643c455f2b0482`.
- Official implementation guide:
  <https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js>.
- Official model documentation/card:
  <https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer#models>.
- MediaPipe license, retained as `LICENSE`:
  <https://raw.githubusercontent.com/google-ai-edge/mediapipe/v0.10.32/LICENSE>.

MediaPipe is licensed under Apache-2.0. Its package's original `README.md` and
`package.json` metadata are retained. `SHA256SUMS.json` records the bytes served
for each vendored asset. The model and both SIMD/non-SIMD WASM variants are
unmodified.

## Classic-worker adapter

Release 0.10.32 ships `vision_bundle.cjs` and `vision_bundle.mjs`; it does not
ship a classic `vision_bundle.js`. Our `vision_bundle.js` contains the upstream
CJS payload inside `(function(exports) { ... })(globalThis.vision = {});`.
Only this wrapper/comment and removal of the absent source-map reference differ
from upstream. It exposes `self.vision.FilesetResolver` and
`self.vision.GestureRecognizer` for `importScripts` in a classic dedicated worker.

The runtime uses VIDEO mode, one hand, the CPU delegate, and an OffscreenCanvas.
Recognition is off the UI thread. Modern desktop Chrome/Edge are the primary
target; unsupported OffscreenCanvas/browser combinations report an error so the
ordinary mouse/pen whiteboard can continue to work. Gesture inference still
depends on camera framing, illumination, and unobstructed hands; a palm wave is
application interaction logic, not a built-in MediaPipe motion classifier.

Do not substitute an unpinned `latest` model or a remote runtime URL without
reviewing the compatibility and privacy implications.
