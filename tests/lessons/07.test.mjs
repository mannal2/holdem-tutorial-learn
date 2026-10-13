import test from 'node:test';import assert from 'node:assert/strict';
import { foldedChips } from '../../src/lessons/07-folded-chips.js';import {createLessonRuntime,stateAt} from '../../src/lesson-runtime.mjs';import {applyEvent} from '../../src/rules/table.mjs';
const instant=async()=>{},make=options=>createLessonRuntime({lesson:foldedChips,playEvent:instant,wait:instant,...options});
test('fold leaves the posted5 in pot55 and stack95, removes only cards and turn, never eliminates',()=>{
 const s=foldedChips.scenario,before=stateAt(s,0),after=stateAt(s,1);assert.equal(before.potTotal,55);assert.deepEqual(before.pendingActorIds,[0,1]);assert.equal(before.seats[0].dealtCount,2);assert.equal(after.potTotal,55);
 assert.equal(after.seats[0].stack,95);assert.equal(after.seats[0].streetCommitted,5);assert.equal(after.seats[0].handCommitted,5);assert.equal(after.seats[0].status,'folded');assert.equal(after.seats[0].dealtCount,0);assert.equal(after.seats[0].revealed,false);assert.deepEqual(after.pendingActorIds,[1]);assert.equal(after.seats.reduce((n,p)=>n+p.stack+p.handCommitted,0),600);assert.equal(before.seats[0].status,'active');assert.throws(()=>applyEvent({...after,pendingActorIds:[0,1]},{type:'act',player:0,action:'call',to:10}));
});
test('both money questions and fold observation are required; final table returns to active main dealt',async()=>{
 const complete=[],r=make({onComplete:id=>complete.push(id)});r.next();await r.next();assert.equal(r.getState().stepId,'07-b-result');r.next();r.answer('stack');assert.equal(r.getState().stepId,'07-c-pot');r.answer('pot');assert.equal(r.getState().stepId,'07-c-stack');
 r.answer(100);assert.match(r.getState().feedback,/돌려받지/);r.answer(90);assert.match(r.getState().feedback,/새로 5/);r.answer(95);r.next();assert.equal(r.getState().stepId,'07-d');assert.equal(r.getState().table.potTotal,15);assert.equal(r.getState().table.seats[0].status,'active');assert.equal(r.getState().table.seats[0].dealtCount,2);assert.equal(r.getState().table.seats[0].stack,95);assert.deepEqual(complete,[]);r.next();assert.equal(r.getState().stepId,'07-complete');assert.deepEqual(complete,['07']);
 r.next();assert.equal(r.getState().table.potTotal,55);const skipped=make({onComplete:id=>complete.push(id)});skipped.go('07-d');skipped.next();assert.deepEqual(complete,['07']);
});
test('fold replay keeps result/question, visit, feedback and money; restored checkpoints are idle',async()=>{
 for(const id of ['07-b-result','07-c-pot','07-c-stack']){const r=make({initialStepId:id});if(r.getState().step.question)r.answer('wrong');const before=r.getState();await r.replay();for(const key of ['stepId','visit','feedback','progress'])assert.equal(r.getState()[key],before[key]);assert.deepEqual(r.getState().table,before.table);assert.equal(r.getState().table.potTotal,55);}
 for(const id of ['07-a','07-b','07-c-result','07-d','07-complete']){const r=make({initialStepId:id});assert.equal(r.getState().canReplay,false);assert.equal(r.getState().busy,false);}
});
test('cancelled fold cannot remove cards or change money after rewinding',async()=>{
 let release;const r=make({playEvent:()=>new Promise(resolve=>release=resolve)});r.go('07-b');const pending=r.next();while(!release)await new Promise(resolve=>setImmediate(resolve));assert.equal(r.getState().table.seats[0].dealtCount,2);r.previous();release();await pending;assert.equal(r.getState().stepId,'07-a');assert.equal(r.getState().table.seats[0].status,'active');assert.equal(r.getState().table.seats[0].dealtCount,2);assert.equal(r.getState().table.potTotal,55);
});
