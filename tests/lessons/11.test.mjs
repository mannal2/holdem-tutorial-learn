import test from 'node:test';import assert from 'node:assert/strict';
import{newStreet}from'../../src/lessons/11-new-street.js';import{mainFlop}from'../../src/scenarios/main-hand.mjs';import{createLessonRuntime,stateAt}from'../../src/lesson-runtime.mjs';
const instant=async()=>{},make=o=>createLessonRuntime({lesson:newStreet,playEvent:instant,wait:instant,...o});
test('F50 separates preflop contributions from flop payments and preserves600',()=>{
 const s=newStreet.scenarios.practice;for(let i=0;i<=3;i++){const t=stateAt(s,i);assert.equal(t.potTotal,[60,60,110,160][i]);assert.equal(t.seats.reduce((n,p)=>n+p.stack+p.handCommitted,0),600);assert.equal(t.boardCount,3);assert.equal(t.seats[0].streetCommitted,i===3?50:0);assert.equal(t.seats[0].handCommitted,i===3?60:10);assert.equal(t.seats[0].stack,i===3?40:90);}
 const bet=stateAt(s,2);assert.equal(bet.currentBet,50);assert.equal(bet.seats[1].stack,40);assert.equal(bet.seats[1].streetCommitted,50);assert.deepEqual(bet.pendingActorIds,[0]);assert.ok(bet.seats.slice(2).every(p=>p.status==='folded'&&p.stack===90&&p.handCommitted===10&&p.streetCommitted===0));assert.deepEqual(stateAt(s,3).pendingActorIds,[]);
 assert.deepEqual(newStreet.scenarios.base.initialState,stateAt(mainFlop,mainFlop.checkpoints.flopStart));
});
test('50 is newly required, wrong40 explains old chips, and main state is restored before completion',async()=>{
 const done=[],r=make({onComplete:id=>done.push(id)});r.next();await r.next();assert.equal(r.getState().stepId,'11-c');r.answer(40);assert.match(r.getState().feedback,/프리플랍/);assert.equal(r.getState().table.potTotal,110);r.answer(60);assert.match(r.getState().feedback,/50/);r.answer(50);await r.next();assert.equal(r.getState().stepId,'11-d-result');assert.equal(r.getState().table.potTotal,160);assert.equal(r.getState().table.seats[0].stack,40);r.previous();assert.equal(r.getState().table.potTotal,110);assert.equal(r.getState().table.seats[0].stack,90);await r.next();r.next();assert.equal(r.getState().stepId,'11-return');assert.deepEqual(r.getState().entryTable,stateAt(mainFlop,4));assert.deepEqual(done,[]);r.next();assert.deepEqual(done,['11']);
 const skipped=make({onComplete:id=>done.push(id)});skipped.go('11-return');skipped.next();assert.deepEqual(done,['11']);
});
test('replay keeps the question/result without paying twice; cancelled late call cannot change main',async()=>{
 for(const id of ['11-c','11-d-result']){const r=make({initialStepId:id});if(id==='11-c')r.answer(40);const before=r.getState();await r.replay();for(const k of ['stepId','visit','feedback','progress'])assert.equal(r.getState()[k],before[k]);assert.deepEqual(r.getState().table,before.table);}
 let release;const r=make({initialStepId:'11-d',playEvent:()=>new Promise(resolve=>release=resolve)});const run=r.next();while(!release)await new Promise(resolve=>setImmediate(resolve));assert.equal(r.getState().table.potTotal,110);r.go('11-return');release();await run;assert.equal(r.getState().stepId,'11-return');assert.deepEqual(r.getState().entryTable,stateAt(mainFlop,4));
});
