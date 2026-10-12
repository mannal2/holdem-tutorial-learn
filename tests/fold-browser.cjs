const {chromium}=require('@playwright/test');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{const p=await b.newPage();await p.goto('http://127.0.0.1:5188');const result=await p.evaluate(async()=>{
 const {playPlayerAction}=await import('/src/animation.mjs');const card=document.querySelector('.seat-0 .card');const controller=new AbortController();
 const cleanup=await playPlayerAction({action:{type:'fold'},cards:[card],signal:controller.signal,reducedMotion:false});await new Promise(requestAnimationFrame);
 const hidden=getComputedStyle(card).opacity==='0';controller.abort();if(typeof cleanup==='function')cleanup();
 return {hidden,restored:getComputedStyle(card).opacity==='1',animations:card.getAnimations().length};
});assert.equal(result.hidden,true,'finished fold must stay invisible until state handoff');assert.equal(result.restored,true);assert.equal(result.animations,0);console.log('PASS fold holds final hidden frame; cancellation cleans up');
await p.evaluate(()=>localStorage.setItem('holdem-tutorial:progress:v1',JSON.stringify({version:1,lessonId:'02',stepId:'02-b',completedLessonIds:[],reviewLessonIds:[]})));await p.reload();await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('#title').textContent.includes('누구인가요'));
assert.equal(await p.locator('.seat-2 .hole-cards .card,.seat-5 .hole-cards .card').evaluateAll(cards=>cards.every(c=>c.classList.contains('empty')&&getComputedStyle(c).visibility!=='hidden'&&getComputedStyle(c).opacity==='1')),true);
await p.locator('#replay').click();await p.waitForFunction(()=>document.querySelector('#replay').disabled);await p.waitForFunction(()=>!document.querySelector('#replay').disabled);assert.equal(await p.locator('#pot').textContent(),'80');console.log('PASS actual fold/replay: empty slot borders preserved, conserved pot');await p.close();}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
