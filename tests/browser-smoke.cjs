/* Headless browser smoke tests only. Real phones/headsets still need manual QA.
 * Requires: npm install --no-save playwright@1.55.0; playwright install chromium
 * Start: python3 -m http.server 4173; fixture: /tmp/zyberlane-xr-test.webm */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const outDir = 'artifacts/browser';
fs.mkdirSync(outDir, { recursive:true });
const baseUrl = 'http://127.0.0.1:4173/';
const videoFile = '/tmp/zyberlane-xr-test.webm';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
  });
  try {
    const variants = [
      {name:'desktop',width:1440,height:900,isMobile:false},
      {name:'tablet',width:768,height:1024,isMobile:true},
      {name:'mobile',width:390,height:844,isMobile:true},
      {name:'small-mobile',width:360,height:780,isMobile:true}
    ];
    for (const v of variants) {
      const ctx = await browser.newContext({
        viewport:{width:v.width,height:v.height},
        isMobile:v.isMobile,hasTouch:v.isMobile,
        deviceScaleFactor:1,
        reducedMotion:'reduce'
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseUrl, {waitUntil:'domcontentloaded'});
      await page.waitForSelector('#theater');
      await page.screenshot({path:outDir + '/' + v.name + '-empty.png',fullPage:true});
      assert.equal(errors.length,0,v.name + ' unexpected JS exception: ' + errors.join('\n'));
      const metrics = await page.evaluate(() => {
        const selectors=['#theater','#localFile','#projection','#enterVr','#openSettings','#playPause'];
        const boxes=Object.fromEntries(selectors.map(selector=>{
          const r=document.querySelector(selector).getBoundingClientRect();
          return [selector,{top:r.top,bottom:r.bottom,width:r.width,height:r.height}];
        }));
        return {width:innerWidth,screen:innerHeight,
          documentWidth:document.documentElement.scrollWidth,
          projection:document.querySelector('#projection').value,
          boxes};
      });
      assert.equal(metrics.projection,'cinema',v.name+' must default to normal video');
      assert.ok(metrics.documentWidth<=metrics.width+2,v.name+' has horizontal overflow: '+JSON.stringify(metrics));
      if(v.isMobile && v.name!=='tablet') {
        assert.ok(metrics.boxes['#projection'].bottom<=v.height+4,v.name+' mode selector below fold');
        assert.ok(metrics.boxes['#openSettings'].bottom<=v.height+4,v.name+' settings below fold');
      }

      await page.locator('#openHelp').click();
      assert.ok(await page.locator('#helpDialog').evaluate(el=>el.open),v.name+' help did not open');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#helpDialog').evaluate(el=>el.open),false,v.name+' Escape did not close help');
      await page.locator('#openSettings').click();
      assert.ok(await page.locator('#settingsDialog').evaluate(el=>el.open),v.name+' settings did not open');
      assert.equal(await page.locator('#layout').inputValue(),'mono');
      await page.locator('[data-close-dialog="settingsDialog"]').click();
      assert.equal(await page.locator('#settingsDialog').evaluate(el=>el.open),false);

      await page.locator('#openLink').click();
      await page.locator('#videoUrl').fill('invalid');
      await page.locator('#loadUrl').click();
      assert.ok(await page.locator('#linkDialog').evaluate(el=>el.open),v.name+' invalid URL closed modal');
      assert.equal(await page.locator('#linkError').isVisible(),true,v.name+' invalid URL error missing');
      await page.locator('[data-close-dialog="linkDialog"]').click();

      if(v.name==='desktop' || v.name==='mobile') {
        await page.locator('#localFile').setInputFiles(videoFile);
        await page.waitForFunction(() => !document.querySelector('#playPause').disabled, null, {timeout:10000});
        assert.equal(await page.locator('#empty').isVisible(),false,v.name+' empty state remains after video loaded');
        await page.locator('#playPause').click();
        await page.waitForTimeout(180);
        assert.equal(await page.locator('#sourceVideo').evaluate(el=>el.paused),false,v.name+' play did not start');
        if (!(await page.locator('#projection').isDisabled())) await page.locator('#projection').selectOption('360');
        await page.screenshot({path:outDir+'/'+v.name+'-loaded.png',fullPage:true});
      }
      assert.equal(errors.length,0,v.name+' browser errors: '+errors.join('\n'));
      console.log(JSON.stringify({viewport:v.name,pass:true,initialMetrics:metrics,webglFallback:await page.locator('#theater').evaluate(el=>el.classList.contains('fallback'))}));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
}
main().catch(error => {console.error(error.stack || error);process.exitCode=1;});
