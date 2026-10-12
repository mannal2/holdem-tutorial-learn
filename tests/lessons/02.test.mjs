import test from 'node:test';
import assert from 'node:assert/strict';
import { twoWays } from '../../src/lessons/02-two-ways.js';
import { createLessonRuntime, stateAt } from '../../src/lesson-runtime.mjs';
const instant=async()=>{};
const make=options=>createLessonRuntime({lesson:twoWays,playEvent:instant,wait:instant,...options});
test('both outcomes preserve 600 chips and return unmatched bet before awarding only 60',()=>{
 for(const scenario of Object.values(twoWays.scenarios))for(let i=0;i<=scenario.events.length;i++){
  const t=stateAt(scenario,i);assert.equal(t.seats.reduce((n,s)=>n+s.stack,0)+t.potTotal,600);
 }
 const a=stateAt(twoWays.scenario,1);assert.equal(a.potTotal,0);assert.equal(a.seats[0].stack,230);
 const b=twoWays.scenarios.fold;
 assert.equal(stateAt(b,3).potTotal,80);assert.equal(stateAt(b,4).potTotal,60);
 const end=stateAt(b,5);assert.equal(end.seats[0].stack,140);assert.equal(end.potTotal,0);
 assert.equal(end.boardCount,3);assert.ok(end.seats.every(s=>!s.revealed));
 assert.deepEqual(end.seats.filter(s=>s.status==='active').map(s=>s.id),[0]);
});
test('required observations, last survivor and no-reveal answer complete only lesson 02',async()=>{
 const completed=[],r=make({onComplete:id=>completed.push(id)});
 await r.next();assert.equal(r.getState().table.seats[0].stack,230);
 r.next();assert.equal(r.getState().table.potTotal,60);
 await r.next();r.answer(2);assert.equal(r.getState().stepId,'02-b-question');
 r.answer(0);await r.next();assert.equal(r.getState().table.seats[0].stack,140);
 r.answer('yes');assert.equal(r.getState().stepId,'02-c-question');r.answer('no');
 assert.deepEqual(completed,['02']);r.next();assert.equal(r.getState().table.potTotal,180);
});
test('cancelled payout does not commit; replay and restored cursor never pay twice',async()=>{
 let release;const r=make({playEvent:()=>new Promise(resolve=>{release=resolve;})});
 const pending=r.next();await Promise.resolve();r.stop();release();await pending;
 assert.equal(r.getState().table.potTotal,180);assert.equal(r.getState().table.seats[0].stack,50);
 const replay=make();await replay.next();await replay.replay();assert.equal(replay.getState().table.seats[0].stack,230);
 const restored=make({initialStepId:'02-c-question'});assert.equal(restored.getState().table.seats[0].stack,140);
 restored.previous();await restored.next();assert.equal(restored.getState().table.seats[0].stack,140);
});

test('payouts reject premature, unreconciled and duplicate awards',async()=>{
 const {applyEvent}=await import('../../src/rules/table.mjs');
 const b=twoWays.scenarios.fold;
 for(const i of [0,1,2,3,5])assert.throws(()=>applyEvent(stateAt(b,i),{type:'award',player:0}));
 assert.throws(()=>applyEvent(stateAt(b,3),{type:'return',player:0,amount:80}));
 const before=stateAt(b,1),copy=structuredClone(before);applyEvent(before,b.events[1]);assert.deepEqual(before,copy);
});
test('cancelling the second payment restores the entry and ignores a late award',async()=>{
 let release;
 const r=make({playEvent:event=>event.type==='award'?new Promise(resolve=>{release=resolve;}):instant()});
 r.go('02-c');const pending=r.next();
 while(!release)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(r.getState().table.potTotal,60);
 r.previous();release();await pending;
 assert.equal(r.getState().stepId,'02-b-question');assert.equal(r.getState().table.potTotal,80);
 assert.equal(r.getState().table.seats[0].stack,60);
});
