const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const html = read('index.html');
const css = read('style.css');
const app = read('app.js');
const ui = read('ui.js');

function indexOf(term) {
  const pos = html.indexOf(term);
  assert.ok(pos >= 0, term + ' not found');
  return pos;
}
test('first-time entry prioritizes working player over marketing', () => {
  assert.ok(indexOf('<section class="stage-frame"') < indexOf('<footer class="site-footer">'));
  assert.ok(indexOf('id="localFile"') < indexOf('id="theater"'));
  assert.ok(indexOf('id="projection"') < indexOf('<footer class="site-footer">'));
  assert.doesNotMatch(html, /class="marquee"|class="workspace|class="principles|id="controls"/);
  assert.match(html, /Your world\./i);
  assert.match(html, /Choose a video/);
  assert.match(html, /No account\. No upload\./);
  assert.match(css, /\.theater\{[^}]*height:clamp\(225px,45vh,520px\)/);
});
test('ordinary footage is the default; modes remain accurate', () => {
  assert.match(html, /<option value="cinema" selected>Normal video<\/option>/);
  assert.match(html, /<option value="360">360° video<\/option>/);
  assert.match(html, /<option value="180">180° video<\/option>/);
  assert.match(app, /projection: 'cinema', layout: 'mono'/);
  assert.match(ui, /video was recorded that way/);
});
test('dialog interactions are native, contextual and keyboard friendly', () => {
  for (const id of ['linkDialog','settingsDialog','helpDialog']) {
    assert.match(html, new RegExp('<dialog id="' + id + '"'));
    assert.match(html, new RegExp('data-close-dialog="' + id + '"'));
  }
  assert.match(ui, /showModal\(/);
  assert.match(ui, /event\.key === 'Enter'/);
  assert.match(ui, /event\.key !== 'Enter' && event\.key !== ' '/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /id="videoUrl" type="url"/);
  assert.match(html, /id="loadUrl"/);
});
test('advanced controls remain available without occupying main screen', () => {
  const advancedStart = indexOf('<dialog id="settingsDialog"');
  for (const id of ['layout','fov','smooth','touchToggle','alpha','beta','gamma']) {
    assert.ok(indexOf('id="' + id + '"') > advancedStart, id + ' not advanced');
  }
  for (const id of ['projection','enterVr','enableMotion','recenter']) {
    assert.ok(indexOf('id="' + id + '"') < advancedStart, id + ' must be quick-access');
  }
  assert.match(html, /Motion diagnostics/);
  assert.match(html, /No real eye tracking/);
  assert.match(html, /not calibrated/);
});
test('no silent false success on missing media, WebGL or missing gyro', () => {
  assert.match(app, /if \(on && !state\.hasVideo\)/);
  assert.match(app, /if \(on && theater\.classList\.contains\('fallback'\)\)/);
  assert.match(app, /state\.projection='cinema'/);
  assert.match(app, /\['enterVr','projection','layout','enableMotion','recenter','fov','smooth'\]/);
  assert.match(app, /video\.addEventListener\('error'/);
  assert.match(html, /Use supported phone orientation data/);
});
test('responsive, brand and reduced-motion boundaries stay explicit', () => {
  assert.match(css, /--bg:#000/);
  assert.match(css, /--ink:#f4f4f2/);
  assert.match(css, /--ease:cubic-bezier\(\.22,1,\.36,1\)/);
  assert.match(css, /@media\(max-width:470px\)/);
  assert.match(css, /@media\(max-width:360px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(html, /brand__wordmark.*zyberlane-wordmark\.svg/);
  assert.match(html, /footer-brand__wordmark.*zyberlane-wordmark\.svg/);
  assert.doesNotMatch(html, /hardware\/index\.html/);
});
