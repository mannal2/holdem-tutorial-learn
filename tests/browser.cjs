const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const title = (p, text) => p.waitForFunction(t => document.querySelector('#title').textContent.includes(t), text);
async function toCalls(p) {
  await p.locator('#seat-0').click();
  await p.locator('#next').click(); await title(p,'모두 한 장씩');
  await p.locator('#next').click(); await title(p,'내 카드 두 장');
  await p.locator('#next').click(); await p.locator('#seat-2').click();
  await p.locator('#next').click();
}
(async () => {
  fs.mkdirSync('test-results',{recursive:true});
  const browser=await chromium.launch({headless:true});
  try {
    for(const width of [1366,474,390,320]) {
      const p=await browser.newPage({viewport:{width,height:width===474?884:900},reducedMotion:'reduce'});
      const errors=[];p.on('pageerror',e=>errors.push(e.message));
      await p.goto('http://127.0.0.1:5188');
      assert.equal(await p.locator('.site-header,.chapter-nav,.page-footer,.table-caption').count(),0);
      await p.locator('#seat-1').click(); assert.match(await p.locator('#feedback').textContent(),/버튼/);
      await toCalls(p);await p.locator('#next').click();await title(p,'나는 얼마');
      assert.equal(await p.locator('#pot').textContent(),'55');
      if(width===474) assert.equal(await p.locator('#replay').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight),true);
      await p.screenshot({path:`test-results/call-${width}.png`,fullPage:true});
      await p.locator('[data-amount="10"]').click();assert.equal(await p.locator('#pot').textContent(),'55');
      await p.locator('[data-amount="5"]').click();await p.locator('#next').click();await title(p,'내 콜이 끝났어요');
      assert.equal(await p.locator('#pot').textContent(),'60');assert.equal(await p.locator('.seat-0 small').textContent(),'남은 칩 90');
      await p.locator('#previous').click();assert.equal(await p.locator('#pot').textContent(),'55');
      await p.locator('#next').click();await title(p,'내 콜이 끝났어요');
      await p.locator('#next').click();await title(p,'잘 마쳤어요');
      assert.equal(await p.locator('#replay').count(),0);
      await p.locator('#previous').click();await p.locator('#previous').click();await p.locator('#previous').click();
      await p.locator('#replay').click();await p.waitForFunction(()=>!document.querySelector('#replay').disabled);await title(p,'나는 얼마');assert.equal(await p.locator('#pot').textContent(),'55');
      await p.locator('[data-amount="5"]').click();await p.locator('#next').click();await title(p,'내 콜이 끝났어요');await p.locator('#next').click();await title(p,'잘 마쳤어요');assert.equal(await p.locator('#pot').textContent(),'60');
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.deepEqual(errors,[]);console.log(`PASS ${width}px: layout, full lesson, answers, rewind, replay, reduced motion`);await p.close();
    }
    const p=await browser.newPage({viewport:{width:474,height:884}});
    const errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto('http://127.0.0.1:5188');await toCalls(p);
    await p.locator('#next').click();
    await p.waitForFunction(()=>document.querySelector('.seat-2 .action-chip').getAnimations().length>0);
    assert.equal(await p.locator('#pot').textContent(),'15');
    assert.match(await p.locator('.seat-2.active .seat-label').textContent(),/콜/);
    await p.screenshot({path:'test-results/chip-flight.png',fullPage:true});
    await p.locator('#previous').click();await p.waitForTimeout(600);
    assert.equal(await p.locator('#pot').textContent(),'15');
    assert.equal(await p.evaluate(()=>document.querySelector('.action-chip').getAnimations().length),0);
    await p.locator('#next').click();await p.locator('#next').click();await title(p,'나는 얼마');
    assert.equal(await p.locator('#pot').textContent(),'55');
    await p.locator('[data-amount="5"]').click();await p.locator('#next').click();await title(p,'내 콜이 끝났어요');
    await p.locator('#next').click();
    await p.waitForFunction(()=>document.querySelector('.seat-1 .check-hand').getAnimations().length>0);
    assert.equal(await p.locator('#pot').textContent(),'60');
    const strokes=await p.locator('.seat-1 .check-hand').evaluate(el=>el.getAnimations()[0].effect.getKeyframes().filter(f=>f.transform==='translateY(1px)').length);
    assert.equal(strokes,2);
    await p.screenshot({path:'test-results/check-knock.png',fullPage:true});
    await p.locator('#previous').click();await p.waitForTimeout(700);
    assert.equal(await p.locator('#pot').textContent(),'55');
    assert.equal(await p.locator('.check-hand').evaluateAll(els=>els.reduce((n,el)=>n+el.getAnimations().length,0)),0);
    await p.locator('#next').click();await title(p,'내 콜이 끝났어요');
    await p.locator('#next').click();await title(p,'잘 마쳤어요');
    assert.equal(await p.locator('#pot').textContent(),'60');assert.deepEqual(errors,[]);
    console.log('PASS real chip flight, pre-action highlight, landing amounts, two check taps, cancellation, no double spending');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
