import test from 'node:test';
import assert from 'node:assert/strict';
import { buttonBlinds } from '../../src/lessons/03-button-blinds.js';
import { createLessonRuntime, stateAt } from '../../src/lesson-runtime.mjs';
import { applyEvent } from '../../src/rules/table.mjs';
const instant=async()=>{};
const make=options=>createLessonRuntime({lesson:buttonBlinds,playEvent:instant,wait:instant,...options});
test('main hand starts with 600 chips and no cards, posts SB5 then BB10 without consuming turns',()=>{
 const scenario=buttonBlinds.scenario;
 const before=structuredClone(scenario.initialState);
 for(const [count,pot,stacks] of [[0,0,[100,100,100,100,100,100]],[1,5,[95,100,100,100,100,100]],[2,15,[95,90,100,100,100,100]]]){
  const t=stateAt(scenario,count);assert.equal(t.potTotal,pot);assert.deepEqual(t.seats.map(s=>s.stack),stacks);
  assert.equal(t.currentBet,count===0?0:count===1?5:10);assert.ok(t.seats.every(s=>s.dealtCount===0&&!s.revealed));assert.equal(t.boardCount,0);
  assert.equal(t.seats.reduce((n,s)=>n+s.stack+s.handCommitted,0),600);assert.deepEqual(t.pendingActorIds,[2,3,4,5,0,1]);
 }
 assert.deepEqual(scenario.initialState,before);
});
test('blind posting rejects wrong roles, amounts, order, duplicate posts and posts after dealing',()=>{
 const s=buttonBlinds.scenario,first=s.events[0],second=s.events[1];
 for(const event of [second,{...first,player:2},{...first,to:10}])assert.throws(()=>applyEvent(stateAt(s,0),event));
 assert.throws(()=>applyEvent(stateAt(s,1),first));assert.throws(()=>applyEvent(stateAt(s,2),second));
 const dealt=stateAt(s,0);dealt.seats[2].dealtCount=1;assert.throws(()=>applyEvent(dealt,first));
 const moved=stateAt(s,0);moved.buttonId=2;moved.smallBlindId=3;moved.bigBlindId=4;
 const sb=applyEvent(moved,{...first,player:3});const bb=applyEvent(sb,{...second,player:4});assert.equal(bb.seats[3].stack,95);assert.equal(bb.seats[4].stack,90);
});
test('role questions and card-before-blinds misconception cannot advance without correct answers',()=>{
 const r=make();for(const [id,correct,wrong] of [['03-a',5,0],['03-b-sb',0,5],['03-b-bb',1,0],['03-d','before','after']]){
  r.go(id);const t=r.getState().table;r.answer(wrong);assert.equal(r.getState().stepId,id);assert.ok(r.getState().feedback);assert.deepEqual(r.getState().table,t);
  r.hint();assert.ok(r.getState().feedback);r.answer(correct);assert.notEqual(r.getState().stepId,id);
 }
});
test('all mandatory questions, blind observation and purpose must be completed',async()=>{
 const completed=[],r=make({onComplete:id=>completed.push(id)});r.go('03-d');r.answer('before');r.next();assert.deepEqual(completed,[]);
 r.goToLesson('03');r.answer(5);r.next();r.answer(0);r.next();r.answer(1);r.next();await r.next();r.next();r.answer('before');r.next();
 assert.equal(r.getState().stepId,'03-complete');assert.deepEqual(completed,['03']);assert.equal(r.getState().table.potTotal,15);
 r.next();assert.equal(r.getState().stepId,'03-a');assert.equal(r.getState().table.potTotal,0);
});
test('blind replay stays on results/questions; cancelled or resumed posting never duplicates chips',async()=>{
 const r=make();for(const id of ['03-c-result','03-d']){r.go(id);const t=r.getState().table;await r.replay();assert.equal(r.getState().stepId,id);assert.deepEqual(r.getState().table,t);}
 let release;const pending=make({playEvent:()=>new Promise(resolve=>release=resolve)});pending.go('03-c');const play=pending.next();while(!release)await new Promise(resolve=>setImmediate(resolve));pending.stop();release();await play;
 assert.equal(pending.getState().table.potTotal,0);assert.equal(pending.getState().stepId,'03-c');
 const resumed=make({initialStepId:'03-c-result'});await resumed.replay();assert.equal(resumed.getState().table.potTotal,15);assert.deepEqual(resumed.getState().table.seats.map(s=>s.stack),[95,90,100,100,100,100]);
});
