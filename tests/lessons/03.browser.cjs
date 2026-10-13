const {chromium}=require('@playwright/test');const assert=require('node:assert/strict');const fs=require('node:fs');
const key='holdem-tutorial:progress:v1';
const title=(p,t)=>p.waitForFunction(t=>document.querySelector('#title').textContent.includes(t),t);
const pot=async(p,n)=>assert.equal(await p.locator('#pot').textContent(),String(n));
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
async function enter(p){await p.goto('http://127.0.0.1:5188');await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="03"]').click();}
async function toPosting(p){await p.locator('#seat-5').click();await p.locator('#next').click();await p.locator('#seat-0').click();await p.locator('#next').click();await p.locator('#seat-1').click();await p.locator('#next').click();}
(async()=>{const b=await chromium.launch();fs.mkdirSync('test-results',{recursive:true});try{
 for(const width of [1366,475,390,320]){
  const p=await b.newPage({viewport:{width,height:884},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await enter(p);
  assert.equal(await p.locator('#chapter-label').textContent(),'LESSON 03');await pot(p,0);assert.equal(await p.locator('.card.back,.card.face').count(),0);
  const height=await p.locator('.table-panel').evaluate(e=>e.getBoundingClientRect().height);
  assert.equal(await p.locator('.seat-5 .position-badge').textContent(),'BTN');
  assert.equal(await p.locator('.seat-0 .position-badge').textContent(),'SB');assert.equal(await p.locator('.seat-1 .position-badge').textContent(),'BB');
  await p.locator('#seat-0').click();assert.match(await p.locator('#feedback').textContent(),/BTN/);await p.locator('#hint').click();assert.match(await p.locator('#feedback').textContent(),/플레이어 6/);
  await p.locator('#seat-5').focus();await p.keyboard.press('Space');await title(p,'기준점');await p.locator('#next').click();
  assert.ok(await p.locator('#direction-path').getAttribute('d'));await p.locator('#seat-5').click();assert.match(await p.locator('#feedback').textContent(),/다음 자리/);
  await p.locator('#seat-0').click();await title(p,'내 자리');await p.locator('#next').click();await p.locator('#seat-0').click();assert.match(await p.locator('#feedback').textContent(),/그다음/);
  await p.locator('#seat-1').click();await title(p,'BB를 맡아요');await p.locator('#next').click();assert.equal(await p.locator('#replay').count(),0);
  await p.locator('#next').click();await title(p,'15칩이');await pot(p,15);assert.equal(await p.locator('.seat-0 small').textContent(),'남은 칩 95');assert.equal(await p.locator('.seat-1 small').textContent(),'남은 칩 90');
  await p.screenshot({path:`test-results/lesson-03-blinds-${width}.png`,fullPage:true});
  await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);await p.waitForFunction(()=>!document.querySelector('#replay').disabled);await title(p,'15칩이');await pot(p,15);
  await p.locator('#next').click();await p.locator('[data-answer="after"]').click();assert.match(await p.locator('#feedback').textContent(),/전에/);await p.locator('[data-answer="optional"]').click();assert.match(await p.locator('#feedback').textContent(),/의무/);
  await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);assert.match(await p.locator('#title').textContent(),/언제 내나요/);await p.waitForFunction(()=>!document.querySelector('#replay').disabled);
  await p.locator('[data-answer="before"]').click();await title(p,'처음부터 팟');assert.equal(await p.locator('#replay').count(),0);assert.equal((await saved(p)).completedLessonIds.includes('03'),false);
  await p.locator('#next').click();await title(p,'버튼을 기준으로');assert.equal((await saved(p)).completedLessonIds.includes('03'),true);assert.match(await p.locator('#next').textContent(),/다음 레슨: 개인카드를 받는 순서/);assert.equal(await p.locator('#restart-lesson').isVisible(),true);assert.equal(await p.locator('#replay').count(),0);
  assert.equal(await p.locator('.felt-watermark,.board-caption,.card.back,.card.face').count(),0);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(width>800)assert.equal(await p.locator('.table-panel').evaluate(e=>e.getBoundingClientRect().height),height);
  await p.reload();await title(p,'버튼을 기준으로');await pot(p,15);await p.locator('#restart-lesson').click();await pot(p,0);assert.equal((await saved(p)).completedLessonIds.includes('03'),true);
  assert.deepEqual(errors,[]);await p.close();console.log(`PASS lesson03 ${width}px roles, wrong answers, posting, replay, purpose, completion/restore, design`);
 }
 const p=await b.newPage({viewport:{width:475,height:884}});await enter(p);await toPosting(p);await p.locator('#next').click();
 await p.waitForFunction(()=>document.querySelector('.seat-0 .action-chip').getAnimations().length>0);await pot(p,0);assert.equal(await p.locator('.seat-0 small').textContent(),'남은 칩 100');assert.equal(await p.locator('.seat-0 .action-chip').evaluate(e=>e.getAnimations()[0].effect.getTiming().duration),450);
 await p.waitForFunction(()=>document.querySelector('.seat-1 .action-chip').getAnimations().length>0);await pot(p,5);assert.equal(await p.locator('.seat-1 small').textContent(),'남은 칩 100');
 await title(p,'15칩이');await pot(p,15);await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('.seat-0 .action-chip').getAnimations().length>0);await p.setViewportSize({width:390,height:844});await p.waitForTimeout(700);await title(p,'15칩이');await pot(p,15);
 await p.locator('#previous').click();await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('.seat-0 .action-chip').getAnimations().length>0);await p.reload();await title(p,'카드를');await pot(p,0);assert.equal(await p.locator('.action-chip').evaluateAll(els=>els.some(e=>e.getAnimations().length)),false);
 await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('.seat-0 .action-chip').getAnimations().length>0);await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="02"]').click();await p.waitForTimeout(700);await pot(p,180);
 await p.close();console.log('PASS lesson03 real450ms flights, amounts after arrival, replay cancellation/resize/reload/switch');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
