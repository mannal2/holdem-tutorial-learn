import test from 'node:test';import assert from 'node:assert/strict';
import {callAndCheck} from '../../src/lessons/08-call-and-check.js';import{createLessonRuntime,stateAt}from'../../src/lesson-runtime.mjs';
const instant=async()=>{},make=options=>createLessonRuntime({lesson:callAndCheck,playEvent:instant,wait:instant,...options});
test('four calls reach55, SB adds only5 for60, and BB check completes without spending',()=>{
 const s=callAndCheck.scenario;assert.deepEqual(s.events.slice(14),[...[2,3,4,5,0].map(player=>({type:'act',player,action:'call',to:10})),{type:'act',player:1,action:'check',to:10}]);
 for(let count=14;count<=20;count++){const t=stateAt(s,count);assert.equal(t.potTotal,[15,25,35,45,55,60,60][count-14]);assert.equal(t.seats.reduce((n,p)=>n+p.stack+p.handCommitted,0),600);assert.equal(t.seats[0].stack,count<19?95:90);assert.equal(t.boardCount,0);assert.ok(t.seats.every(p=>p.status==='active'&&p.dealtCount===2));}
 assert.deepEqual(stateAt(s,18).pendingActorIds,[0,1]);assert.deepEqual(stateAt(s,19).pendingActorIds,[1]);assert.deepEqual(stateAt(s,20).pendingActorIds,[]);assert.ok(stateAt(s,20).seats.every(p=>p.streetCommitted===10&&p.stack===90));
});
test('difference and BB check questions cannot skip required calls, check, or final observation',async()=>{
 const completed=[],r=make({onComplete:id=>completed.push(id)});await r.next();assert.equal(r.getState().stepId,'08-b');r.answer(0);assert.match(r.getState().feedback,/나는 아직 5/);r.answer(10);assert.match(r.getState().feedback,/부족한/);r.answer(5);await r.next();assert.equal(r.getState().stepId,'08-c-result');r.next();r.next();assert.equal(r.getState().stepId,'08-e');r.answer('call10');assert.match(r.getState().feedback,/이미 10/);r.answer('fold');assert.equal(r.getState().stepId,'08-e');r.answer('check');await r.next();assert.equal(r.getState().stepId,'08-f');assert.deepEqual(completed,[]);r.next();assert.equal(r.getState().stepId,'08-complete');assert.deepEqual(completed,['08']);assert.equal(r.getState().table.potTotal,60);
 const skipped=make({onComplete:id=>completed.push(id)});skipped.go('08-f');skipped.next();assert.deepEqual(completed,['08']);
});
test('replay stays at caller question, SB result and check result without adding chips twice',async()=>{
 for(const id of ['08-b','08-c-result','08-f']){const r=make({initialStepId:id});if(id==='08-b')r.answer(10);const before=r.getState();for(let i=0;i<2;i++){await r.replay();const after=r.getState();for(const key of ['stepId','visit','feedback','progress'])assert.equal(after[key],before[key]);assert.deepEqual(after.table,before.table);}}
 for(const id of ['08-a','08-c','08-d','08-e','08-e-check','08-complete']){const r=make({initialStepId:id});assert.equal(r.getState().canReplay,false);}
});
test('double next, cancellation and late arrivals cannot commit an extra call or end before BB checks',async()=>{
 let release,calls=0;const r=make({playEvent:()=>{calls++;return new Promise(resolve=>release=resolve)}});r.go('08-c');const play=r.next();r.next();while(!release)await new Promise(resolve=>setImmediate(resolve));assert.equal(calls,1);assert.equal(r.getState().table.potTotal,55);r.previous();release();await play;assert.equal(r.getState().stepId,'08-b');assert.equal(r.getState().table.potTotal,55);
 release=null;const check=make({playEvent:()=>new Promise(resolve=>release=resolve)});check.go('08-e-check');const pending=check.next();while(!release)await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(check.getState().table.pendingActorIds,[1]);check.stop();release();await pending;assert.equal(check.getState().stepId,'08-e-check');assert.deepEqual(check.getState().table.pendingActorIds,[1]);assert.equal(check.getState().table.potTotal,60);
});
