import test from 'node:test';
import assert from 'node:assert/strict';
import { dealing } from '../../src/lessons/04-dealing.js';
import { createLessonRuntime, stateAt } from '../../src/lesson-runtime.mjs';
const instant=async()=>{};
const make=options=>createLessonRuntime({lesson:dealing,playEvent:instant,wait:instant,...options});
test('lesson04 deals clockwise from BTN next seat, once per seat per round, preserving money',()=>{
 const s=dealing.scenario;
 assert.deepEqual(s.events.slice(2),[0,1].flatMap(slot=>[0,1,2,3,4,5].map(player=>({type:'deal',player,slot}))));
 for(let count=2;count<=14;count++){
  const t=stateAt(s,count),n=count-2;
  assert.deepEqual(t.seats.map((seat,i)=>seat.dealtCount),[0,1,2,3,4,5].map(i=>Math.floor(n/6)+(i<n%6?1:0)));
  assert.equal(t.potTotal,15);assert.equal(t.boardCount,0);assert.deepEqual(t.seats.map(seat=>seat.stack),[95,90,100,100,100,100]);
  assert.deepEqual(t.pendingActorIds,[2,3,4,5,0,1]);assert.ok(t.seats.every(seat=>!seat.revealed));
 }
});
test('only first recipient is asked; same-order guidance directly deals second round and completes only04',async()=>{
 const completed=[],r=make({onComplete:id=>completed.push(id)});
 r.answer(1);assert.equal(r.getState().stepId,'04-a');assert.match(r.getState().feedback,/버튼/);
 r.answer(0);r.next();await r.next();assert.equal(r.getState().stepId,'04-b-result');assert.ok(r.getState().table.seats.every(s=>s.dealtCount===1));
 assert.equal(dealing.steps.filter(step=>step.question).length,1);assert.equal(r.getState().step.playTo,14);assert.match(r.getState().step.body,/같은 순서/);
 await r.next();assert.equal(r.getState().stepId,'04-d-result');
 assert.ok(r.getState().table.seats.every(s=>!s.revealed));r.next();assert.deepEqual(r.getState().table.seats.filter(s=>s.revealed).map(s=>s.id),[0]);
 assert.deepEqual(completed,[]);r.next();assert.equal(r.getState().stepId,'04-complete');assert.deepEqual(completed,['04']);
 r.next();assert.equal(r.getState().stepId,'04-a');assert.ok(r.getState().table.seats.every(s=>s.dealtCount===0));
 const skipped=make({onComplete:id=>completed.push(id)});skipped.go('04-e');skipped.next();assert.deepEqual(completed,['04']);
});
test('deal replay stays on its part without changing answers, cards or completion; restore never auto plays',async()=>{
 for(const id of ['04-d-result']){
  const r=make({initialStepId:id});const before=r.getState();await r.replay();const after=r.getState();
  assert.equal(after.stepId,id);assert.equal(after.visit,before.visit);assert.equal(after.feedback,before.feedback);assert.deepEqual(after.table,before.table);
 }
 for(const id of ['04-a','04-b','04-b-result','04-e','04-complete']){const r=make({initialStepId:id});assert.equal(r.getState().canReplay,false);assert.equal(r.getState().busy,false);}
});
test('deal commits only after landing and cancellation ignores late cards',async()=>{
 let release;const r=make({playEvent:()=>new Promise(resolve=>release=resolve)});r.go('04-b');const play=r.next();while(!release)await new Promise(resolve=>setImmediate(resolve));
 assert.ok(r.getState().table.seats.every(s=>s.dealtCount===0));r.previous();release();await play;assert.equal(r.getState().stepId,'04-a-result');assert.ok(r.getState().table.seats.every(s=>s.dealtCount===0));
});

test('removed lesson04 steps recover to its start while preserving completion',async()=>{
 const {readProgress}=await import('../../src/progress.mjs');
 for(const stepId of ['04-c','04-c-result','04-d']){
  const progress=readProgress({getItem:()=>JSON.stringify({version:1,lessonId:'04',stepId,completedLessonIds:['03','04'],reviewLessonIds:[]})});
  assert.equal(progress.lessonId,'04');assert.equal(progress.stepId,'04-a');assert.deepEqual(progress.completedLessonIds,['03','04']);
 }
});
