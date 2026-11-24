const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const ctx=vm.createContext({Math,Number,screen:{orientation:{angle:90}},window:{}});
vm.runInContext(code.slice(code.indexOf('function qMultiply('),code.indexOf('function handleOrientation('))+'\nthis.math={qMultiply,qFromEuler,sensorQuaternion,leveledDelta,headingRoute};',ctx);
const {qMultiply,qFromEuler,sensorQuaternion,leveledDelta,headingRoute}=ctx.math;
function same(a,b){assert.ok(1-Math.abs(a.reduce((sum,v,i)=>sum+v*b[i],0))<1e-8);}
test('world yaw remains horizontal with tilted or landscape calibration',()=>{for(const [a,b,g] of [[35,25,15],[170,90,0],[315,-15,60]]){const base=sensorQuaternion(a,b,g);for(const deg of [30,90,180,270,359]){const yaw=qFromEuler(0,deg*Math.PI/180,0);same(leveledDelta(base,qMultiply(yaw,base)),yaw);}}});
test('stationary absolute heading yields to moving relative heading',()=>{const r={};assert.equal(headingRoute(r,'absolute',30,1000),true);headingRoute(r,'relative',10,1020);headingRoute(r,'absolute',30,1100);assert.equal(headingRoute(r,'relative',25,1120),true);assert.equal(headingRoute(r,'absolute',30,1140),false);});
test('relative stream without heading yields to valid absolute heading',()=>{const r={};headingRoute(r,'relative',NaN,1000);assert.equal(headingRoute(r,'absolute',20,1020),true);});
test('heading wrap remains continuous',()=>{const r={};headingRoute(r,'relative',359,1000);headingRoute(r,'relative',1,1020);assert.equal(r.streams.relative.headingAt,1020);});
