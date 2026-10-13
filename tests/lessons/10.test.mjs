import test from 'node:test';import assert from 'node:assert/strict';
import {flop} from '../../src/lessons/10-flop.js';import {mainFlop,mainStart} from '../../src/scenarios/main-hand.mjs';import {stateAt,createLessonRuntime} from '../../src/lesson-runtime.mjs';import {applyEvent} from '../../src/rules/table.mjs';
const instant=async()=>{},make=o=>createLessonRuntime({lesson:flop,playEvent:instant,wait:instant,...o});
test('flop collection resets only the street and three arrivals reveal exactly Qd8c2s',()=>{
 const original=stateAt(mainStart,20);assert.deepEqual(mainFlop.initialState.seats,original.seats);
 for(let i=0;i<=4;i++){const t=stateAt(mainFlop,i);assert.equal(t.potTotal,60);assert.equal(t.boardCount,Math.max(0,i-1));assert.ok(t.seats.every(p=>p.stack===90&&p.handCommitted===10&&p.dealtCount===2&&p.streetCommitted===(i===0?10:0)));assert.equal(t.seats.reduce((n,p)=>n+p.stack+p.handCommitted,0),600);}
 const final=stateAt(mainFlop,4);assert.equal(final.street,'flop');assert.equal(final.currentBet,0);assert.deepEqual(final.pendingActorIds,[0,1,2,3,4,5]);assert.deepEqual(final.board.slice(0,final.boardCount).map(c=>c.id),['Qd','8c','2s']);assert.equal(stateAt(mainStart,20).seats[0].streetCommitted,10);
 assert.throws(()=>applyEvent(original,{type:'reveal-board',slot:0}));assert.throws(()=>applyEvent(stateAt(mainFlop,1),{type:'reveal-board',slot:1}));assert.throws(()=>applyEvent(stateAt(mainStart,19),{type:'collect-bets',street:'flop'}));
});
test('both questions and own-card observation are required; completion retains the flop',async()=>{
 const done=[],r=make({onComplete:id=>done.push(id)});await r.next();r.next();await r.next();assert.equal(r.getState().stepId,'10-c-count');r.answer(2);assert.match(r.getState().feedback,/3장/);r.answer(3);assert.equal(r.getState().stepId,'10-c-who');r.answer('dealer');assert.match(r.getState().feedback,/모두/);r.answer('all');assert.equal(r.getState().stepId,'10-d');assert.deepEqual(done,[]);r.next();assert.equal(r.getState().stepId,'10-complete');assert.deepEqual(done,['10']);assert.equal(r.getState().table.boardCount,3);assert.equal(r.getState().table.potTotal,60);
 const skipped=make({onComplete:id=>done.push(id)});skipped.go('10-d');skipped.next();assert.deepEqual(done,['10']);
});
test('same-part replay preserves feedback and chips, cancellation rejects late board arrivals',async()=>{
 const r=make({initialStepId:'10-c-count'});r.answer(5);const before=r.getState();await r.replay();for(const k of ['stepId','visit','feedback','progress'])assert.equal(r.getState()[k],before[k]);assert.deepEqual(r.getState().table,before.table);
 let release;const slow=make({initialStepId:'10-b',playEvent:()=>new Promise(resolve=>release=resolve)});const run=slow.next();while(!release)await new Promise(resolve=>setImmediate(resolve));assert.equal(slow.getState().table.boardCount,0);slow.previous();release();await run;assert.equal(slow.getState().stepId,'10-a-result');assert.equal(slow.getState().table.boardCount,0);assert.equal(slow.getState().table.potTotal,60);
});
