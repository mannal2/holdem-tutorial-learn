import test from 'node:test';
import assert from 'node:assert/strict';
import { preflopOrder } from '../../src/lessons/05-preflop-order.js';
import { createLessonRuntime,stateAt } from '../../src/lesson-runtime.mjs';
const instant=async()=>{},make=options=>createLessonRuntime({lesson:preflopOrder,playEvent:instant,wait:instant,...options});
test('preflop preview highlights BB-next clockwise without consuming actions or changing cards and money',async()=>{
 const scenario=preflopOrder.scenario,initial=stateAt(scenario,0),frames=[];
 assert.deepEqual(scenario.events.map(e=>e.player),[2,3,4,5,0,1]);assert.ok(scenario.events.every(e=>e.type==='preview-turn'));
 assert.equal(initial.potTotal,15);assert.equal(initial.boardCount,0);assert.ok(initial.seats.every(s=>s.dealtCount===2));assert.deepEqual(initial.pendingActorIds,[2,3,4,5,0,1]);
 for(let i=0;i<=6;i++)assert.deepEqual(stateAt(scenario,i),initial);
 const r=make({onChange:view=>{if(view.busy&&view.action)frames.push({player:view.action.player,type:view.action.type,table:view.table});}});r.go('05-c');await r.next();
 assert.deepEqual([...new Set(frames.map(f=>f.player))],[2,3,4,5,0,1]);assert.ok(frames.every(f=>f.type==='preview'&&f.table.potTotal===15&&f.table.seats.every(s=>s.dealtCount===2)));
 assert.equal(r.getState().stepId,'05-c-result');assert.deepEqual(r.getState().entryTable,initial);
});
test('first actor differs from first recipient, wraparound answers and observations are required',async()=>{
 const completed=[],r=make({onComplete:id=>completed.push(id)});r.next();r.answer(0);assert.equal(r.getState().stepId,'05-b');assert.match(r.getState().feedback,/SB.*첫 카드.*BB 다음/);r.answer(5);assert.equal(r.getState().stepId,'05-b');r.hint();r.answer(2);r.next();await r.next();r.next();
 assert.equal(r.getState().stepId,'05-d');r.answer(1);assert.equal(r.getState().stepId,'05-d');r.answer(0);assert.deepEqual(completed,[]);r.next();assert.equal(r.getState().stepId,'05-complete');assert.deepEqual(completed,['05']);
 r.next();assert.equal(r.getState().stepId,'05-a');const skipped=make({onComplete:id=>completed.push(id)});skipped.go('05-d');skipped.answer(0);skipped.next();assert.deepEqual(completed,['05']);
});
test('preview replay stays at result or question and preserves visit, feedback, table and progress',async()=>{
 for(const id of ['05-c-result','05-d']){const r=make({initialStepId:id});if(id==='05-d')r.answer(1);const before=r.getState();await r.replay();const after=r.getState();for(const key of ['stepId','visit','feedback','progress'])assert.equal(after[key],before[key]);assert.deepEqual(after.table,before.table);}
 for(const id of ['05-a','05-b','05-b-result','05-c','05-d-result','05-complete']){const r=make({initialStepId:id});assert.equal(r.getState().canReplay,false);}
});
test('cancelled preview cannot advance or mutate a new lesson, and restored observation is idle',async()=>{
 let release;const r=make({playEvent:()=>new Promise(resolve=>release=resolve)});r.go('05-c');const pending=r.next();while(!release)await new Promise(resolve=>setImmediate(resolve));r.previous();release();await pending;assert.equal(r.getState().stepId,'05-b-result');assert.equal(r.getState().busy,false);assert.equal(r.getState().table.potTotal,15);
 const resumed=make({initialStepId:'05-c'});assert.equal(resumed.getState().busy,false);assert.equal(resumed.getState().action,null);
});
