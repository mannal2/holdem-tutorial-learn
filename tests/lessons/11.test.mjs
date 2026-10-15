import {readProgress} from '../../src/progress.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import{newStreet}from'../../src/lessons/11-new-street.js';import{mainFlop}from'../../src/scenarios/main-hand.mjs';import{createLessonRuntime,stateAt}from'../../src/lesson-runtime.mjs';
const initial=stateAt(mainFlop,mainFlop.checkpoints.flopStart),make=o=>createLessonRuntime({lesson:newStreet,playEvent:async()=>{throw Error('Calculation must not animate');},wait:async()=>{},...o});
initial.seats[0].revealed=true;

test('every calculation scene retains the same main flop with no bets, folds or replay',async()=>{
 for(const step of newStreet.steps){const r=make({initialStepId:step.id});assert.deepEqual(r.getState().table,initial);assert.equal(step.playTo,undefined);assert.equal(step.replayFrom,undefined);await r.replay();assert.deepEqual(r.getState().table,initial);}
});
test('wrong40 and60 stay on question;50 explains new payment; required observations gate completion',()=>{
 const done=[],r=make({onComplete:id=>done.push(id)});r.next();r.next();assert.equal(r.getState().stepId,'11-c');
 for(const answer of [40,60]){r.answer(answer);assert.equal(r.getState().stepId,'11-c');assert.match(r.getState().feedback,answer===40?/프리플랍의 10/:/50칩/);assert.deepEqual(r.getState().table,initial);}
 r.answer(50);assert.equal(r.getState().stepId,'11-d');assert.deepEqual(done,[]);r.previous();assert.equal(r.getState().stepId,'11-c');r.answer(50);r.next();assert.deepEqual(done,['11']);assert.deepEqual(r.getState().table,initial);
 const skipped=make({onComplete:id=>done.push(id)});skipped.go('11-d');skipped.next();assert.deepEqual(done,['11']);
});
test('removed animation and return cursors recover to lesson start without mutating chips',()=>{
 for(const id of ['11-return','11-d-result']){const r=make({initialStepId:readProgress({getItem:()=>JSON.stringify({version:1,lessonId:'11',stepId:id,completedLessonIds:[]})}).stepId});assert.equal(r.getState().stepId,'11-a');assert.deepEqual(r.getState().table,initial);}
});
