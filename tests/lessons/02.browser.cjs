const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const title=(p,t)=>p.waitForFunction(t=>document.querySelector('#title').textContent.includes(t),t);
const pot=async(p,n)=>assert.equal(await p.locator('#pot').textContent(),String(n));
const open=async p=>{await p.goto('http://127.0.0.1:5188');await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="02"]').click();};
(async()=>{const b=await chromium.launch();try{
 for(const width of [1366,474,390,320]){
  const p=await b.newPage({viewport:{width,height:884},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await open(p);assert.equal(await p.locator('#chapter-label').textContent(),'LESSON 02');await pot(p,180);
  const height=await p.locator('.table-panel').evaluate(e=>e.getBoundingClientRect().height);
  await p.locator('#next').click();await title(p,'180칩을');await pot(p,0);
  assert.match(await p.locator('.seat-0 small').textContent(),/230/);
  await p.locator('#next').click();await pot(p,60);assert.equal(await p.locator('.board .card.face').count(),3);
  await p.locator('#next').click();await title(p,'누구인가요');await pot(p,80);
  assert.equal(await p.locator('.hole-cards .card.face').count(),0);
  assert.equal(await p.locator('.seat-2 .card.back,.seat-5 .card.back').count(),0);
  await p.locator('[data-answer="2"]').click();assert.match(await p.locator('#feedback').textContent(),/마지막 한 사람/);
  await p.locator('[data-answer="0"]').focus();await p.keyboard.press('Space');await p.locator('#next').click();await title(p,'보여줘야');await pot(p,0);
  assert.match(await p.locator('.seat-0 small').textContent(),/140/);assert.equal(await p.locator('.board .card.face').count(),3);
  await p.screenshot({path:`test-results/lesson-02-${width}.png`,fullPage:true});
  await p.locator('[data-answer="yes"]').click();assert.match(await p.locator('#feedback').textContent(),/공개하지 않고/);
  await p.locator('[data-answer="no"]').click();await title(p,'두 가지예요');
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('holdem-tutorial:progress:v1')).completedLessonIds.includes('02')),true);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(width>800)assert.equal(await p.locator('.table-panel').evaluate(e=>e.getBoundingClientRect().height),height);
  await p.reload();await title(p,'두 가지예요');await pot(p,0);await p.locator('#next').click();await pot(p,180);
  assert.deepEqual(errors,[]);await p.close();console.log(`PASS lesson 02 ${width}px: both wins, folds, answers, award, restore, layout`);
 }
 const p=await b.newPage({viewport:{width:1366,height:884}});await open(p);
 await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('.seat-0 .action-chip').getAnimations().length>0);await pot(p,180);
 await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="01"]').click();await p.waitForTimeout(700);assert.equal(await p.locator('#pot').count(),0);
 await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="02"]').click();await pot(p,180);
 await p.locator('#next').click();await title(p,'180칩을');await p.locator('#next').click();await p.locator('#next').click();
 await p.waitForFunction(()=>document.querySelector('.seat-2 .card.back').getAnimations().length>0);assert.equal(await p.locator('.seat-2 .card.back').count(),2);
 await title(p,'누구인가요');await p.locator('[data-answer="0"]').click();await p.locator('#next').click();
 await p.waitForFunction(()=>document.querySelector('.seat-0 .seat-label')?.textContent==='20칩 돌아옴'&&document.querySelector('.seat-0 .action-chip').getAnimations().length>0);await pot(p,80);
 await title(p,'보여줘야');await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);assert.match(await p.locator('#title').textContent(),/보여줘야/);await p.waitForFunction(()=>!document.querySelector('#replay').disabled);await pot(p,0);assert.match(await p.locator('.seat-0 small').textContent(),/140/);
 console.log('PASS real animation: delayed commits, folded cards, return, cancellation/replay, lesson switch');await p.close();
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
