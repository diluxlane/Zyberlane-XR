const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const html = read('index.html');
const css = read('style.css');
const design = read('design.js');
const engine = read('app.js');

function idsInHtml() {
  const counts = new Map();
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    counts.set(match[1], (counts.get(match[1]) || 0) + 1);
  }
  return counts;
}
const ids = idsInHtml();

test('player event controls retain every required production ID exactly once', () => {
  const required = [
    'scene','sourceVideo','theater','empty','message','liveLabel','modeLabel',
    'expandedControls','expandedPlay','expandedMute','exitFullscreenOverlay',
    'vrHud','hudPlay','hudCenter','hudExit','reticle',
    'playPause','timeNow','seek','timeTotal','mute','fullscreen',
    'localFile','videoUrl','loadUrl','fileName','enableMotion','sensorLight',
    'sensorStatus','sensorDetail','alpha','beta','gamma','recenter','touchToggle',
    'projection','layout','fov','smooth','fovValue','smoothValue','enterVr'
  ];
  for (const id of required) {
    assert.equal(ids.get(id), 1, id + ' must exist exactly once');
  }
});
test('all statically named app.js element selectors remain present', () => {
  const found = new Set();
  for (const match of engine.matchAll(/\$\('([A-Za-z][A-Za-z0-9-]+)'\)/g)) found.add(match[1]);
  for (const id of found) assert.ok(ids.has(id), 'missing app.js element: #' + id);
});
test('projection, layouts, controls and local-file handling retain their source values', () => {
  for (const id of ['projection','layout']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  for (const value of ['cinema','180','360','mono','sbs','tb']) {
    assert.match(html, new RegExp('value="' + value + '"'));
  }
  assert.match(html, /id="localFile" type="file"/);
  assert.match(html, /id="seek"[^>]*type="range"/);
  assert.match(html, /id="enterVr"/);
  assert.match(html, /id="enableMotion"/);
  assert.match(html, /id="sourceVideo" playsinline/);
  assert.match(html, /script src="\.\/app\.js" defer/);
});
test('Zyberlane identity and local assets match approved parent website', () => {
  assert.match(html, /ZYBERLANE/);
  assert.match(html, /Built Beyond Boundaries/i);
  assert.match(html, /assets\/zyberlane-mark\.svg/);
  assert.match(html, /<title>Zyberlane XR/);
  assert.match(css, /--surface-1:#0d0d0d/);
  assert.match(css, /--ink:#f4f4f2/);
  assert.match(css, /--ease:cubic-bezier\(\.22,1,\.36,1\)/);
  assert.match(css, /assets\/inter-tight-latin\.woff2/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com|raw\.githubusercontent\.com/);
  for (const file of ['assets/zyberlane-mark.svg','assets/Inter-Tight-OFL.txt',
    'assets/inter-tight-latin.woff2','assets/inter-tight-latin-italic.woff2']) {
    assert.ok(fs.statSync(path.join(__dirname, '..', file)).size > 100, file + ' missing');
  }
});
test('motion respects reduced-motion and cannot hide content when scripting is unavailable', () => {
  assert.match(design, /IntersectionObserver/);
  assert.match(design, /prefers-reduced-motion/);
  assert.match(design, /revealEverything/);
  assert.match(css, /html\.has-js \[data-reveal\]/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(html, /class="[^"]*\bhas-js\b/);
  assert.match(css, /html\.xr-expanded \.stage-frame\{overflow:visible!important/);
});
test('stage controls and the warning language remain accessible and honest', () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /No real eye tracking/);
  assert.match(html, /not calibrated/);
  assert.match(html, /No video selected/);
  assert.match(html, /id="expandedControls"[^>]*hidden/);
  assert.match(html, /id="exitFullscreenOverlay"[^>]*aria-label/);
  assert.match(css, /\.theater\.fallback #sourceVideo/);
  assert.match(css, /\.theater\.fullscreen-simulated/);
  assert.match(css, /\.theater\.vr-active/);
  assert.doesNotMatch(html, /Explore our VR headset/);
});

test('removed 3D headset model page cannot be linked or served', () => {
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'hardware', 'index.html')), false);
  assert.doesNotMatch(html, /hardware\/index\.html|View 3D concept|headset model preview/i);
  assert.match(html, /id="enterVr"/, 'functional VR box mode must stay');
  assert.match(html, /id="theater"/, 'video theater must stay');
});
