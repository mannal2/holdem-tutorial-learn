const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{for(const width of [1366,468,390,320]){
 const p=await b.newPage({viewport:{width,height:884},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:5188');
 await p.evaluate(()=>localStorage.setItem('holdem-tutorial:progress:v1',JSON.stringify({version:1,lessonId:'01',stepId:'01-complete',completedLessonIds:['01'],reviewLessonIds:[]})));await p.reload();
 assert.equal(await p.locator('#replay').count(),0);assert.match(await p.locator('#next').textContent(),/다음 레슨: 이기는 두 가지 방법/);assert.equal(await p.locator('#restart-lesson').isVisible(),true);
 const gaps=await p.locator('.board .card.face,.hole-cards .card.face').evaluateAll(cards=>cards.map(card=>{
  const a=card.getBoundingClientRect(),r=card.querySelector('.card-rank').getBoundingClientRect(),s=card.querySelector('.card-suit').getBoundingClientRect();
  return {top:(r.top-a.top)/a.height,bottom:(a.bottom-s.bottom)/a.height,left:r.left-a.left,right:a.right-s.right,gap:s.top-r.bottom};
 }));for(const g of gaps){assert.ok(g.top>.06&&g.bottom>.06);assert.ok(Math.abs(g.top-g.bottom)<.035);assert.ok(g.left>1&&g.right>1&&g.gap>=0);}
 await p.screenshot({path:`test-results/navigation-cards-${width}.png`,fullPage:true});
 await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('#chapter-label').textContent==='LESSON 02');assert.equal(await p.locator('#pot').textContent(),'180');
 assert.equal(await p.locator('#replay').count(),0);
 await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('#title').textContent.includes('180칩을'));
 await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);await p.waitForFunction(()=>!document.querySelector('#replay').disabled);assert.equal(await p.locator('#pot').textContent(),'0');
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('holdem-tutorial:progress:v1')).completedLessonIds.includes('01')),true);
 await p.evaluate(()=>localStorage.setItem('holdem-tutorial:progress:v1',JSON.stringify({version:1,lessonId:'02',stepId:'02-complete',completedLessonIds:['01','02'],reviewLessonIds:[]})));await p.reload();
 assert.match(await p.locator('#next').textContent(),/이 레슨 다시 연습/);assert.equal(await p.locator('#restart-lesson,#replay').count(),0);await p.locator('#next').click();assert.equal(await p.locator('#pot').textContent(),'180');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.close();console.log(`PASS ${width}px next/restart/replay and proportional card spacing`);
}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
