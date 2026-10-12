const {chromium}=require('@playwright/test');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{for(const width of [1366,475,390,320]){
 const p=await b.newPage({viewport:{width,height:884},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:5188');
 for(const [lessonId,stepId] of [['prototype','first-recipient'],['01','01-d-result'],['02','02-a']]){
  await p.evaluate(({lessonId,stepId})=>localStorage.setItem('holdem-tutorial:progress:v1',JSON.stringify({version:1,lessonId,stepId,completedLessonIds:[],reviewLessonIds:[]})),{lessonId,stepId});await p.reload();
  assert.equal(await p.locator('.felt-watermark,.board-caption').count(),0);
  if(lessonId==='prototype')continue;
  const result=await p.locator('.seat-0').evaluate(seat=>{const l=seat.querySelector('.seat-label').getBoundingClientRect(),cards=[...seat.querySelectorAll('.card')].map(e=>e.getBoundingClientRect()),board=document.querySelector('.board').getBoundingClientRect();return {gap:Math.min(...cards.map(c=>c.top))-l.bottom,boardGap:l.top-board.bottom};});
  assert.ok(result.gap>=5,JSON.stringify(result));assert.ok(result.boardGap>=5,JSON.stringify(result));
  await p.screenshot({path:`test-results/table-clean-${lessonId}-${width}.png`,fullPage:true});
 }
 await p.close();console.log(`PASS ${width}px common table: no decorative text, winner label clears cards and board`);
}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
