const {chromium}=require('@playwright/test');const assert=require('node:assert/strict');const fs=require('node:fs');
const key='holdem-tutorial:progress:v1';
const title=(p,t)=>p.waitForFunction(t=>document.querySelector('#title').textContent.includes(t),t);
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
const count=(p,n)=>p.waitForFunction(n=>document.querySelectorAll('.hole-cards .card.back,.hole-cards .card.face').length===n,n);
async function select(p){await p.goto('http://127.0.0.1:5188');await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="04"]').click();}
async function first(p){await p.locator('#seat-0').click();await p.locator('#next').click();}
async function second(p){await p.locator('#next').click();await p.locator('#seat-0').click();await p.locator('#next').click();}
(async()=>{const b=await chromium.launch();fs.mkdirSync('test-results',{recursive:true});try{
 for(const width of [1366,474,320]){
  const p=await b.newPage({viewport:{width,height:884}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{window.landings=[];window.captureLanding=true;const original=Element.prototype.animate;Element.prototype.animate=function(...args){const animation=original.apply(this,args);if(this.id==='flying-card'&&window.captureLanding){
   const n=window.landings.length,slot=document.querySelectorAll('.seat-'+n%6+' .card')[Math.floor(n/6)];
   animation.pause();animation.currentTime=animation.effect.getTiming().duration-1;
   requestAnimationFrame(()=>{const r=this.getBoundingClientRect(),t=slot.getBoundingClientRect();window.landings.push({n,duration:animation.effect.getTiming().duration,delta:['x','y','width','height'].map(k=>Math.abs(r[k]-t[k]))});animation.play();});}return animation;};});
  await p.goto('http://127.0.0.1:5188');await p.evaluate(k=>localStorage.setItem(k,JSON.stringify({version:1,lessonId:'03',stepId:'03-complete',completedLessonIds:['03'],reviewLessonIds:[]})),key);await p.reload();
  assert.match(await p.locator('#next').textContent(),/다음 레슨: 개인카드를 받는 순서/);assert.equal(await p.locator('#restart-lesson').isVisible(),true);await p.locator('#next').click();await title(p,'첫 카드는');
  assert.equal(await p.locator('#chapter-label').textContent(),'LESSON 04');assert.equal(await p.locator('#pot').textContent(),'15');await count(p,0);
  const height=await p.locator('.table-panel').evaluate(e=>e.getBoundingClientRect().height);
  await p.locator('#seat-1').click();assert.match(await p.locator('#feedback').textContent(),/버튼 다음/);await p.locator('#hint').click();assert.ok(await p.locator('#direction-path').getAttribute('d'));
  await first(p);assert.equal(await p.locator('#replay').count(),0);await p.locator('#next').click();await title(p,'모두 한 장씩');await count(p,6);
  assert.equal(await p.locator('.card.face').count(),0);for(let i=0;i<6;i++){assert.equal(await p.locator('.seat-'+i+' .card.back').count(),1);assert.equal(await p.locator('.seat-'+i+' .card.empty').count(),1);}
  const firstLandings=await p.evaluate(()=>window.landings);assert.equal(firstLandings.length,6);
  await p.reload();await title(p,'모두 한 장씩');await count(p,6);assert.equal((await saved(p)).stepId,'04-b-result');
  // Keep actual first-round measurements across reload; second round starts at index6.
  await p.evaluate(results=>window.landings=results,firstLandings);
  await second(p);await p.locator('#next').click();await title(p,'이제 모두');await count(p,12);assert.equal(await p.locator('.card.face').count(),0);
  const landings=await p.evaluate(()=>window.landings);assert.equal(landings.length,12);for(const r of landings){assert.equal(r.duration,360);assert.ok(r.delta.every(d=>d<1),width+'px card'+r.n+' delta '+r.delta);}
  await p.evaluate(()=>window.captureLanding=false);await p.emulateMedia({reducedMotion:'reduce'});
  await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);await p.waitForFunction(()=>!document.querySelector('#replay').disabled);await title(p,'이제 모두');await count(p,12);
  await p.locator('#next').click();await title(p,'내 개인카드');assert.equal(await p.locator('.seat-0 .card.face').count(),2);assert.equal(await p.locator('.card.face').count(),2);assert.equal(await p.locator('#replay').count(),0);
  assert.equal((await saved(p)).completedLessonIds.includes('04'),false);await p.screenshot({path:'test-results/lesson-04-dealt-'+width+'.png',fullPage:true});
  await p.locator('#next').click();await title(p,'한 장씩 두 바퀴');assert.equal((await saved(p)).completedLessonIds.includes('04'),true);assert.equal((await saved(p)).completedLessonIds.includes('03'),true);
  assert.match(await p.locator('#next').textContent(),/다시 연습/);assert.equal(await p.locator('#restart-lesson,#replay').count(),0);assert.equal(await p.locator('#pot').textContent(),'15');
  if(width>800)assert.equal(await p.locator('.table-panel').evaluate(e=>e.getBoundingClientRect().height),height);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.reload();await title(p,'한 장씩 두 바퀴');await count(p,12);await p.locator('#next').click();await count(p,0);assert.equal((await saved(p)).completedLessonIds.includes('04'),true);
  assert.deepEqual(errors,[]);await p.close();console.log('PASS lesson04 '+width+'px slots, two rounds, own reveal, 03→04, replay, completion/restore and fixed height');
 }
 const p=await b.newPage({viewport:{width:474,height:884}});await select(p);await first(p);await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('#flying-card').getAnimations().length>0);await count(p,0);
 await p.locator('#previous').click();await p.waitForTimeout(650);await title(p,'버튼 다음');await count(p,0);
 await p.locator('#next').click();await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('#flying-card').getAnimations().length>0);await p.setViewportSize({width:320,height:884});await p.waitForTimeout(650);await title(p,'첫 번째 바퀴를');await count(p,0);
 await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('#flying-card').getAnimations().length>0);await p.reload();await title(p,'첫 번째 바퀴를');await count(p,0);
 await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('#flying-card').getAnimations().length>0);await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="02"]').click();await p.waitForTimeout(650);assert.equal(await p.locator('#chapter-label').textContent(),'LESSON 02');assert.equal(await p.locator('#pot').textContent(),'180');
 await p.emulateMedia({reducedMotion:'reduce'});await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="04"]').click();await first(p);await p.locator('#next').click();await title(p,'모두 한 장씩');await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);await p.waitForFunction(()=>!document.querySelector('#replay').disabled);await count(p,6);
 await p.locator('#next').click();await p.locator('#seat-1').click();assert.match(await p.locator('#feedback').textContent(),/첫 번째/);const feedback=await p.locator('#feedback').textContent();await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);await p.waitForFunction(()=>!document.querySelector('#replay').disabled);assert.equal(await p.locator('#feedback').textContent(),feedback);await title(p,'다음 카드는');await count(p,6);
 await p.close();console.log('PASS lesson04 normal motion before-arrival state, cancellation/resize/reload/switch and reduced replay');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
