import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextLesson, getLesson } from '../src/lessons/index.js';
import { createLessonRuntime } from '../src/lesson-runtime.mjs';
test('next lesson follows the curriculum and never enters unavailable lessons',()=>{
 assert.equal(getNextLesson('01').id,'02');assert.equal(getNextLesson('02').id,'03');assert.equal(getNextLesson('03').id,'04');assert.equal(getNextLesson('04').id,'05');assert.equal(getNextLesson('05'),undefined);assert.equal(getNextLesson('prototype'),undefined);
});
test('replay is available only on results and questions, never animation entries',()=>{
 const a=createLessonRuntime({lesson:getLesson('01'),playEvent:async()=>{}});
 for(const step of getLesson('01').steps){a.go(step.id);assert.equal(a.getState().canReplay,false);}
 const b=createLessonRuntime({lesson:getLesson('02'),playEvent:async()=>{}});
 for(const step of getLesson('02').steps){b.go(step.id);assert.equal(b.getState().canReplay,['02-a-result','02-b-question','02-c-question'].includes(step.id));}
});
test('replay keeps the original part, feedback, progress and final chips across repeated playback',async()=>{
 for(const id of ['02-a-result','02-b-question','02-c-question']){
  const events=[],r=createLessonRuntime({lesson:getLesson('02'),playEvent:async e=>events.push(e.type),wait:async()=>{}});
  r.go(id);if(r.getState().step.question)r.answer('wrong');const before=r.getState();
  for(let i=0;i<2;i++){await r.replay();const after=r.getState();assert.equal(after.stepId,id);assert.equal(after.visit,before.visit);assert.equal(after.feedback,before.feedback);assert.equal(after.progress,before.progress);assert.deepEqual(after.table,before.table);}
  assert.ok(events.length>0);
 }
});
test('replay cannot start twice or answer a question during playback; cancellation ignores late events',async()=>{
 let release;const events=[],r=createLessonRuntime({lesson:getLesson('02'),playEvent:async e=>{events.push(e.type);await new Promise(resolve=>release=resolve);},wait:async()=>{}});
 r.go('02-b-question');const pending=r.replay();while(!release)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(r.getState().stepId,'02-b-question');r.replay();r.answer(0);assert.equal(events.length,1);assert.equal(r.getState().stepId,'02-b-question');
 r.stop();release();await pending;assert.equal(r.getState().table.potTotal,80);assert.equal(r.getState().busy,false);
});
