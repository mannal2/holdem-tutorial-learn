import test from 'node:test';import assert from 'node:assert/strict';
import { firstActions } from '../../src/lessons/06-first-actions.js';
import { createLessonRuntime,stateAt } from '../../src/lesson-runtime.mjs';import {applyEvent} from '../../src/rules/table.mjs';
const instant=async()=>{},make=options=>createLessonRuntime({lesson:firstActions,playEvent:instant,wait:instant,...options});
test('fold/call/raise previews independently start at pot15 and preserve600 chips',()=>{
 for(const [id,pot,stack,status,cards,bet]of [['fold',15,100,'folded',0,10],['call',25,90,'active',2,10],['raise',45,70,'active',2,30]]){
 const s=firstActions.scenarios[id],before=stateAt(s,0),after=stateAt(s,1),p=after.seats[2];assert.equal(before.potTotal,15);assert.equal(before.seats[2].stack,100);assert.equal(before.seats[2].status,'active');assert.equal(before.seats[2].dealtCount,2);
 assert.equal(after.potTotal,pot);assert.equal(p.stack,stack);assert.equal(p.status,status);assert.equal(p.dealtCount,cards);assert.equal(after.currentBet,bet);assert.equal(after.seats.reduce((n,s)=>n+s.stack+s.handCommitted,0),600);assert.deepEqual(stateAt(s,0),before);
 }
 const r=make();for(const id of ['06-c','06-d','06-e','06-complete']){r.go(id);assert.equal(r.getState().table.potTotal,15);assert.equal(r.getState().table.seats[2].status,'active');assert.equal(r.getState().table.seats[2].dealtCount,2);}
});
test('multi-selection requires exactly fold/call/raise in any order and completion requires all observations',async()=>{
 const completed=[],r=make({onComplete:id=>completed.push(id)});
 for(const answer of [[],['call'],['fold','call','raise','check'],['fold','call','call'],['fold','call','bogus']]){r.answer(answer);assert.equal(r.getState().stepId,'06-a');assert.ok(r.getState().feedback);}
 r.answer(['raise','fold','call']);assert.equal(r.getState().stepId,'06-a-result');r.next();await r.next();assert.equal(r.getState().stepId,'06-b-result');r.next();await r.next();assert.equal(r.getState().stepId,'06-c-result');r.next();await r.next();r.next();assert.equal(r.getState().stepId,'06-e');
 r.answer('always');assert.equal(r.getState().stepId,'06-e');r.answer('owed');assert.deepEqual(completed,[]);r.next();assert.equal(r.getState().stepId,'06-complete');assert.deepEqual(completed,['06']);
 const skipped=make({onComplete:id=>completed.push(id)});skipped.go('06-e');skipped.answer('owed');skipped.next();assert.deepEqual(completed,['06']);
});
test('basic full raises reopen responses and reject invalid order, minimum, amount and checks facing a bet',()=>{
 const before=stateAt(firstActions.scenarios.raise,0),raised=applyEvent(before,{type:'act',player:2,action:'raise',to:30});assert.equal(raised.lastFullRaise,20);assert.deepEqual(raised.pendingActorIds,[3,4,5,0,1]);assert.equal(raised.seats[2].streetCommitted,30);
 for(const event of [{type:'act',player:2,action:'raise',to:19},{type:'act',player:2,action:'raise',to:101},{type:'act',player:3,action:'raise',to:30},{type:'act',player:2,action:'check',to:10}])assert.throws(()=>applyEvent(before,event));assert.throws(()=>applyEvent(raised,{type:'act',player:3,action:'raise',to:49}));
 const next=applyEvent(raised,{type:'act',player:3,action:'raise',to:50});assert.equal(next.lastFullRaise,20);assert.deepEqual(next.pendingActorIds,[4,5,0,1,2]);assert.equal(before.currentBet,10);
});
test('replay preserves each result; cancellation and restore cannot carry action results into the next preview',async()=>{
 for(const id of ['06-b-result','06-c-result','06-d-result']){const r=make({initialStepId:id}),before=r.getState();await r.replay();assert.equal(r.getState().stepId,id);assert.deepEqual(r.getState().table,before.table);assert.equal(r.getState().visit,before.visit);r.next();assert.equal(r.getState().table.potTotal,15);}
 let release;const r=make({playEvent:()=>new Promise(resolve=>release=resolve)});r.go('06-d');const p=r.next();while(!release)await new Promise(resolve=>setImmediate(resolve));assert.equal(r.getState().table.potTotal,15);r.previous();release();await p;assert.equal(r.getState().stepId,'06-c-result');assert.equal(r.getState().table.potTotal,25);r.next();assert.equal(r.getState().table.potTotal,15);
 for(const id of ['06-a','06-b','06-c','06-d','06-e','06-complete']){const restored=make({initialStepId:id});assert.equal(restored.getState().busy,false);assert.equal(restored.getState().canReplay,false);}
});

test('a first bet establishes the full raise increment used by the next raise',()=>{
 const before=stateAt(firstActions.scenarios.raise,0);before.currentBet=0;before.pendingActorIds=[2,3,4,5,0,1];before.seats=before.seats.map(s=>({...s,streetCommitted:0}));
 const bet=applyEvent(before,{type:'act',player:2,action:'bet',to:20});assert.equal(bet.lastFullRaise,20);assert.throws(()=>applyEvent(bet,{type:'act',player:3,action:'raise',to:30}));assert.equal(applyEvent(bet,{type:'act',player:3,action:'raise',to:40}).currentBet,40);
});
