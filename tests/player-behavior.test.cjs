const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const from = app.indexOf('function qMultiply(');
const to = app.indexOf('async function enableMotion(');
assert.ok(from >= 0 && to > from, 'tracking implementation is present');

function fixture(angle = 0, legacyAngle = 90) {
  let now = 5000;
  const elements = Object.create(null);
  const state = {
    gotAbsolute: false, lastAbsoluteAt: 0,
    sensorReceived: false, sensorStale: true,
    lastSensorAt: 0, lastTelemetryAt: 0,
    lastAcceptedAlpha: null, lastAcceptedAt: 0,
    alphaSamples: [], baseQ: null, sensorQ: [0,0,0,1],
    orientationSource: null
  };
  const ctx = vm.createContext({
    Math,
    Number,
    performance: { now: () => now },
    screen: { orientation: { angle } },
    window: { orientation: legacyAngle },
    state,
    $: id => (elements[id] ??= { textContent: '', className: '' })
  });
  vm.runInContext(app.slice(from, to) +
    '\nthis.xr = {qMultiply, qFromEuler, sensorQuaternion, handleOrientation};', ctx);
  return { xr: ctx.xr, state, elements, clock: t => { now = t; } };
}
function equivalent(a,b,eps=1e-8) {
  const dot = Math.abs(a.reduce((sum,v,i) => sum+v*b[i],0));
  assert.ok(1-dot < eps, `different orientation, dot=${dot}`);
}

test('screen orientation angle zero overrides legacy window orientation', () => {
  const { xr } = fixture(0, 90);
  const rad = Math.PI / 180;
  const fixed = xr.qMultiply(xr.qFromEuler(20*rad,30*rad,-5*rad),
    [-Math.SQRT1_2,0,0,Math.SQRT1_2]);
  equivalent(xr.sensorQuaternion(30,20,5),fixed);
});

test('invalid tilt samples are ignored rather than poisoning orientation', () => {
  const f = fixture();
  f.xr.handleOrientation({alpha:0,beta:NaN,gamma:12});
  assert.equal(f.state.sensorReceived,false);
  f.xr.handleOrientation({alpha:null,beta:10,gamma:3});
  assert.equal(f.state.sensorReceived,true);
  assert.match(f.elements.sensorDetail.textContent,/No heading supplied/);
});

test('long sensor interruption rebases pose when readings resume', () => {
  const f = fixture();
  f.xr.handleOrientation({alpha:20,beta:10,gamma:3});
  const oldBase = f.state.baseQ;
  f.state.alphaSamples.push({time:5500,angle:23});
  f.clock(10000);
  f.xr.handleOrientation({alpha:50,beta:12,gamma:3});
  assert.notEqual(f.state.baseQ,oldBase);
  equivalent(f.state.baseQ,f.state.sensorQ);
  assert.equal(f.state.sensorStale,false);
  assert.equal(f.state.alphaSamples.length,1);
});

test('changing absolute to relative frame resets calibration evidence', () => {
  const f = fixture();
  f.xr.handleOrientation({alpha:180,beta:20,gamma:8,absolute:true},true);
  assert.equal(f.state.gotAbsolute,true);
  f.clock(6400);
  f.xr.handleOrientation({alpha:20,beta:21,gamma:8,absolute:false},false);
  assert.equal(f.state.gotAbsolute,false);
  assert.equal(f.state.orientationSource,'relative');
  assert.equal(f.state.alphaSamples.length,1);
  equivalent(f.state.baseQ,f.state.sensorQ);
});

test('expanded video controls and accessibility hooks remain present', () => {
  for (const id of ['expandedControls','expandedPlay','expandedMute','exitFullscreenOverlay']) {
    assert.match(html, new RegExp('id="' + id + '"'));
    assert.ok(app.includes("$('"+id+"')") || app.includes("'"+id+"'"));
  }
  assert.match(css,/\.theater\.fullscreen-simulated/);
  assert.match(app,/setSimulatedFullscreen\(true\)/);
  assert.match(app,/document\.addEventListener\('fullscreenchange'/);
  assert.match(html,/Zyberlane XR/);
  assert.doesNotMatch(html,/Explore our VR headset/);
});
