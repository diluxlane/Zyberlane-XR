const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)?.[1] ?? '';
const mark = fs.readFileSync(path.join(root, 'assets/zyberlane-xr-wordmark.svg'), 'utf8');

test('header uses unchanged parent icon, wordmark and company descriptor', () => {
  assert.match(header, /class="brand__mark" src="\.\/assets\/zyberlane-mark\.svg"/);
  assert.match(header, /class="brand__wordmark" src="\.\/assets\/zyberlane-wordmark\.svg"/);
  assert.match(header, /class="brand__descriptor">CREATIVE TECHNOLOGY COMPANY<\/span>/);
  assert.match(header, /class="brand__xr" src="\.\/assets\/zyberlane-xr-wordmark\.svg"/);
  assert.match(header, /aria-label="Zyberlane XR — Creative Technology Company home"/);
  assert.doesNotMatch(header, /class="brand__division"|\/ XR<\/span>/);
  assert.equal((header.match(/class="brand__xr"/g) || []).length, 1);
});

test('XR is its own original, geometric and legible vector mark', () => {
  assert.match(mark, /viewBox="0 0 94 60"/);
  assert.match(mark, /<title id="xr-mark-title">XR<\/title>/);
  assert.match(mark, /stroke="#f4f4f2"/);
  assert.equal((mark.match(/<path /g) || []).length, 2);
  assert.doesNotMatch(mark, /<text\b|font-family|<image\b/);
});

test('XR spacing stays close without divider across breakpoints', () => {
  assert.match(css, /\.brand__xr\{height:34px;[^}]+\}/);
  assert.match(css, /\.brand__xr\{height:31px;margin-left:-2px\}/);
  assert.match(css, /\.brand__xr\{height:29px;margin-left:-1px\}/);
  assert.match(css, /\.brand__xr\{height:27px;margin-left:0\}/);
  assert.doesNotMatch(css, /\.brand__division\{/);
});

test('scope remains limited to header, preserving XR viewer and footer branding', () => {
  assert.match(html, /class="footer-brand__division">\/ XR<\/span>/);
  for (const id of ['theater','scene','sourceVideo','playPause','projection','enterVr','openSettings']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
});
