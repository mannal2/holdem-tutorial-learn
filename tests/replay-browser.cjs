const {chromium}=require('@playwright/test');const assert=require('node:assert/strict');
const key='holdem-tutorial:progress:v1';
(async()=>{const b=await chromium.launch();try{for(const width of [1366,468]){
 const p=await b.newPage({viewport:{width,height:884},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:5188');
 const definitions=await p.evaluate(async()=>{const {getLesson}=await import('/src/lessons/index.js');return ['01','02'].map(id=>({id,steps:getLesson(id).steps.map(s=>s.id)}));});
 for(const lesson of definitions)for(const stepId of lesson.steps){
  await p.evaluate(({key,id,stepId})=>localStorage.setItem(key,JSON.stringify({version:1,lessonId:id,stepId,completedLessonIds:['01'],reviewLessonIds:[]})),{key,id:lesson.id,stepId});await p.reload();
  const allowed=lesson.id==='02'&&['02-a-result','02-b-question','02-c-question'].includes(stepId);assert.equal(await p.locator('#replay').count(),allowed?1:0);
  if(!allowed)continue;
  const before=await p.locator('#title').textContent(),pot=await p.locator('#pot').textContent(),progress=await p.locator('#step-count').textContent();
  if(stepId==='02-b-question'){await p.locator('[data-answer="2"]').click();}
  const feedback=await p.locator('#feedback').textContent();
  await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);
  assert.equal(await p.locator('#title').textContent(),before);assert.equal(await p.locator('#next').isDisabled(),true);
  assert.equal(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).stepId,key),stepId);
  if(stepId.includes('question'))assert.equal(await p.locator('[data-answer]').evaluateAll(els=>els.every(e=>e.disabled)),true);
  await p.waitForFunction(()=>!document.querySelector('#replay').disabled);
  assert.equal(await p.locator('#title').textContent(),before);assert.equal(await p.locator('#pot').textContent(),pot);assert.equal(await p.locator('#step-count').textContent(),progress);assert.equal(await p.locator('#feedback').textContent(),feedback);
  await p.reload();assert.equal(await p.locator('#title').textContent(),before);
  if(stepId==='02-b-question'){await p.locator('[data-answer="0"]').click();await p.waitForFunction(()=>document.querySelector('#title').textContent.includes('카드 공개 없이'));}
 }
 assert.deepEqual(errors,[]);await p.close();console.log(`PASS ${width}px all 15 lesson parts: replay visibility, same-part replay, disabled actions, feedback, chips, cursor, answers`);
}
const p=await b.newPage({viewport:{width:468,height:884}});await p.goto('http://127.0.0.1:5188');await p.evaluate(key=>localStorage.setItem(key,JSON.stringify({version:1,lessonId:'02',stepId:'02-b-question',completedLessonIds:[],reviewLessonIds:[]})),key);await p.reload();await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('.seat-0 .action-chip').getAnimations().length>0);await p.setViewportSize({width:390,height:844});await p.waitForTimeout(700);assert.equal(await p.locator('#pot').textContent(),'80');assert.match(await p.locator('#title').textContent(),/누구인가요/);assert.equal(await p.locator('#replay').isEnabled(),true);await p.close();console.log('PASS replay resize cancellation restores the same question, no late chips');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
