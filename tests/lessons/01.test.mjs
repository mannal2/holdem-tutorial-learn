import test from 'node:test';
import assert from 'node:assert/strict';
import { victory } from '../../src/lessons/01-victory.js';
import { createLessonRuntime } from '../../src/lesson-runtime.mjs';

const instant=async()=>{};
const make=(onComplete=()=>{})=>createLessonRuntime({lesson:victory,playEvent:instant,wait:instant,onComplete});
const five=['Qh','Qd','8s','8c','Jc'];

test('victory preview uses unique cards, shows only comparison opponents, and preserves 600 chips',()=>{
  const r=make(), table=r.getState().table;
  const cards=[...table.board,...table.seats.flatMap(s=>s.hole)];
  assert.equal(new Set(cards.map(c=>c.id)).size,17);
  assert.deepEqual(table.seats.filter(s=>s.revealed).map(s=>s.id),[0,5]);
  assert.deepEqual(table.seats[0].hole.map(c=>c.id),['8s','Qh']);
  assert.equal(table.boardCount,5);
  assert.equal(table.potTotal,180);
  assert.equal(table.seats.reduce((n,s)=>n+s.stack,0)+table.potTotal,600);
});
test('guided five-card selection accepts order-independent best five and rejects other cards',()=>{
  const r=make();r.go('01-c');
  for(const answer of [five.slice(0,4),['Qh','Qd','8s','8c','4h'],['Qh','Qd','8s','8c','As'],['Qh','Qd','8s','8s','Jc']]){
    r.answer(answer);assert.equal(r.getState().stepId,'01-c');assert.equal(r.getState().table.potTotal,180);
  }
  r.answer([...five].reverse());assert.equal(r.getState().stepId,'01-c-result');
});
test('only the two-pair winner and exactly five judgement cards advance their questions',()=>{
  const r=make();r.go('01-d');r.answer(5);assert.equal(r.getState().stepId,'01-d');
  r.answer(0);assert.equal(r.getState().stepId,'01-d-result');r.next();
  r.answer(7);assert.equal(r.getState().stepId,'01-e');r.answer(2);assert.equal(r.getState().stepId,'01-e');
  r.answer(5);assert.equal(r.getState().stepId,'01-complete');
});
test('all required guidance and questions must be finished before lesson 01 is completed',()=>{
  const completed=[],r=make(id=>completed.push(id));
  r.go('01-e');r.answer(5);assert.deepEqual(completed,[]);
  r.goToLesson('01');r.next();r.next();r.answer(five);r.next();r.answer(0);r.next();r.answer(5);
  assert.deepEqual(completed,['01']);assert.equal(r.getState().table.potTotal,180);
  r.next();assert.equal(r.getState().stepId,'01-a');
});
test('static questions have no replay and preserve their current visit',()=>{
  const r=make();r.go('01-c');const before=r.getState().visit;
  r.replay();assert.equal(r.getState().stepId,'01-c');assert.equal(r.getState().visit,before);
});
