import test from 'node:test';import assert from 'node:assert/strict';
import {roundEnd} from '../../src/lessons/09-round-end.js';import{createLessonRuntime,stateAt}from'../../src/lesson-runtime.mjs';import{applyEvent,isBettingRoundComplete}from'../../src/rules/table.mjs';
const instant=async()=>{},make=options=>createLessonRuntime({lesson:roundEnd,playEvent:instant,wait:instant,...options});
test('a lap does not complete the raised round; folds retain contribution and final160 preserves600',()=>{
 const s=roundEnd.scenario;for(let i=0;i<=6;i++){const t=stateAt(s,i);assert.equal(t.potTotal,[55,80,100,120,120,140,160][i]);assert.equal(isBettingRoundComplete(t),i===6);assert.equal(t.seats.reduce((n,p)=>n+p.stack+p.handCommitted,0),600);}
 assert.deepEqual(stateAt(s,0).pendingActorIds,[0,1]);assert.deepEqual(stateAt(s,1).pendingActorIds,[1,2,3,4,5]);assert.deepEqual(stateAt(s,2).pendingActorIds,[2,3,4,5]);assert.deepEqual(stateAt(s,4).pendingActorIds,[4,5]);const final=stateAt(s,6);assert.deepEqual(final.seats.map(p=>p.stack),[70,70,70,90,70,70]);assert.equal(final.seats[3].status,'folded');assert.equal(final.seats[3].handCommitted,10);assert.ok(final.seats.filter(p=>p.status==='active').every(p=>p.streetCommitted===30));assert.deepEqual(final.pendingActorIds,[]);
 const mismatch=structuredClone(final);mismatch.seats[2].streetCommitted=10;assert.equal(isBettingRoundComplete(mismatch),false);
});
test('equal zero bets require everyone to check; a further raise reopens active responses excluding the folded seat',()=>{
 const t=stateAt(roundEnd.scenarios.base,0);t.street='flop';t.currentBet=0;t.pendingActorIds=[0,1,2,3,4,5];t.seats=t.seats.map(p=>({...p,streetCommitted:0}));let current=t;for(let i=0;i<6;i++){assert.equal(isBettingRoundComplete(current),false);current=applyEvent(current,{type:'act',player:i,action:'check',to:0});}assert.equal(isBettingRoundComplete(current),true);
 const raised=applyEvent(stateAt(roundEnd.scenario,4),{type:'act',player:4,action:'raise',to:50});assert.deepEqual(raised.pendingActorIds,[5,0,1,2]);assert.equal(isBettingRoundComplete(raised),false);assert.equal(raised.lastFullRaise,20);
});
test('actual round state drives both questions and required observations gate completion and main restore',async()=>{
 const done=[],r=make({onComplete:id=>done.push(id)});await r.next();r.next();await r.next();assert.equal(r.getState().stepId,'09-b-question');r.answer('yes');assert.match(r.getState().feedback,/아직 답하지/);r.answer('no');await r.next();r.next();await r.next();assert.equal(r.getState().stepId,'09-e');r.answer('no');assert.match(r.getState().feedback,/더 맞출 필요/);r.answer('yes');r.next();assert.equal(r.getState().stepId,'09-return');assert.equal(r.getState().table.potTotal,60);assert.ok(r.getState().table.seats.every(p=>p.status==='active'&&p.stack===90&&p.dealtCount===2));assert.deepEqual(done,[]);r.next();assert.equal(r.getState().stepId,'09-complete');assert.deepEqual(done,['09']);
 const skipped=make({onComplete:id=>done.push(id)});skipped.go('09-return');skipped.next();assert.deepEqual(done,['09']);
});
test('replay stays on results/questions with same chips/feedback; cancelled late call cannot finish the round',async()=>{
 for(const id of ['09-a-result','09-b-question','09-c-result','09-e']){const r=make({initialStepId:id});if(r.getState().step.question)r.answer('wrong');const before=r.getState();await r.replay();for(const key of ['stepId','visit','feedback','progress'])assert.equal(r.getState()[key],before[key]);assert.deepEqual(r.getState().table,before.table);}
 let release;const r=make({playEvent:()=>new Promise(resolve=>release=resolve)});r.go('09-d');const pending=r.next();while(!release)await new Promise(resolve=>setImmediate(resolve));assert.equal(r.getState().table.potTotal,120);r.previous();release();await pending;assert.equal(r.getState().stepId,'09-c-result');assert.equal(r.getState().table.potTotal,120);assert.equal(isBettingRoundComplete(r.getState().table),false);
});
