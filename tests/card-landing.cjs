const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{for(const width of [474,1366,320]){
const page=await browser.newPage({viewport:{width,height:900}});
await page.addInitScript(()=>{window.landings=[];const original=Element.prototype.animate;Element.prototype.animate=function(...args){const animation=original.apply(this,args);if(this.id==='flying-card'){
const n=window.landings.length;const slot=document.querySelectorAll(`.seat-${n%6} .card`)[Math.floor(n/6)];
animation.pause();animation.currentTime=animation.effect.getTiming().duration-1;
requestAnimationFrame(()=>{const rect=this.getBoundingClientRect(),target=slot.getBoundingClientRect();window.landings.push({n,delta:['x','y','width','height'].map(k=>Math.abs(rect[k]-target[k]))});animation.play();});}return animation;};});
await page.goto('http://127.0.0.1:5188');await page.locator('#seat-0').click();await page.locator('#next').click();await page.waitForFunction(()=>document.querySelector('#title').textContent.includes('모두 한 장씩'));await page.locator('#next').click();await page.waitForFunction(()=>document.querySelector('#title').textContent.includes('내 카드 두 장'));
const results=await page.evaluate(()=>window.landings);assert.equal(results.length,12);for(const r of results)assert.ok(r.delta.every(d=>d<1),`${width}px card ${r.n}: landing delta ${r.delta}`);
assert.equal(await page.locator('.card.back,.card.face').count(),12);console.log(`PASS ${width}px: all 12 cards land in their own slot with matching size`);await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

