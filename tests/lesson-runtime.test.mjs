import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshot } from '../lesson.mjs';
import { applyEvent } from '../src/rules/table.mjs';
import { prototype } from '../src/lessons/prototype.js';
import { createLessonRuntime, stateAt } from '../src/lesson-runtime.mjs';

const instant = async () => {};
const runtime = (playEvent = instant) => createLessonRuntime({ lesson: prototype, playEvent, wait: instant, reducedMotion: () => true });
const legacyShape = state => ({
  cards: state.seats.map(seat => seat.dealtCount),
  bets: state.seats.map(seat => seat.streetCommitted),
  stacks: state.seats.map(seat => seat.stack),
  pot: state.potTotal,
});

test('data checkpoints preserve the existing eleven stages and every playback frame', () => {
  for (const [stage, step] of prototype.steps.entries()) {
    const frames = step.playTo === undefined ? [step.checkpoint] : Array.from({ length: step.playTo - step.checkpoint + 1 }, (_, i) => step.checkpoint + i);
    for (const eventCount of frames) {
      const frame = stage === 1 || stage === 2 ? eventCount : eventCount - step.checkpoint;
      const expected = snapshot(stage, step.playTo === undefined ? undefined : frame);
      const { active, ...moneyAndCards } = expected;
      assert.deepEqual(legacyShape(stateAt(prototype.scenario, eventCount)), moneyAndCards);
    }
  }
});

test('rewinding reconstructs cards and money without mutating scenario data', () => {
  const before = structuredClone(prototype.scenario);
  const done = stateAt(prototype.scenario, 18);
  assert.equal(done.potTotal, 60);
  assert.deepEqual(done.seats.map(s => s.stack), [90,90,90,90,90,90]);
  done.seats[0].stack = 0;
  assert.equal(stateAt(prototype.scenario, 16).potTotal, 55);
  assert.equal(stateAt(prototype.scenario, 16).seats[0].stack, 95);
  assert.deepEqual(prototype.scenario, before);
});

test('a canceled animation completing late cannot advance or add chips to another step', async () => {
  let finish;
  let first = true;
  const r = runtime(() => first ? (first = false, new Promise(resolve => { finish = resolve; })) : Promise.resolve());
  r.go('watch-calls');
  const playback = r.next();
  assert.equal(r.getState().busy, true);
  assert.equal(r.getState().table.potTotal, 15);
  await Promise.resolve();
  r.previous();
  finish();
  await playback;
  assert.equal(r.getState().stepId, 'first-actor-found');
  assert.equal(r.getState().busy, false);
  assert.equal(r.getState().table.potTotal, 15);
});

test('completion ignores replay requests and preserves the final sixty-chip pot', async () => {
  const r = runtime();
  r.go('complete');
  for (let i = 0; i < 3; i++) {
    await r.replay();
    assert.equal(r.getState().stepId, 'complete');
    assert.equal(r.getState().table.potTotal, 60);
    assert.deepEqual(r.getState().table.seats.map(s => s.stack), [90,90,90,90,90,90]);
  }
});

test('two next clicks cannot run the same betting sequence twice', async () => {
  let finish;
  let first = true;
  let flights = 0;
  const r = runtime(() => {
    flights++;
    return first ? (first = false, new Promise(resolve => { finish = resolve; })) : Promise.resolve();
  });
  r.go('watch-calls');
  const a = r.next();
  const b = r.next();
  await Promise.resolve();
  finish();
  await Promise.all([a,b]);
  assert.equal(r.getState().stepId, 'call-amount');
  assert.equal(r.getState().table.potTotal, 55);
  assert.equal(flights, 4);
});

test('question answers and hints come from the selected lesson definition', () => {
  const lesson = { ...prototype, id: 'another-lesson', steps: [
    { ...prototype.steps[0], id: 'custom-question', nextId: 'custom-result', question: { kind: 'seat', acceptedAnswers: [3], feedbackByAnswer: { default: '다른 자리예요.' }, hint: '세 번째 자리를 찾아요.' } },
    { ...prototype.steps[1], id: 'custom-result', nextId: 'custom-question', playTo: undefined },
  ] };
  const r = createLessonRuntime({ lesson, playEvent: instant, wait: instant, reducedMotion: () => true });
  r.answer(0);
  assert.equal(r.getState().stepId, 'custom-question');
  assert.equal(r.getState().feedback, '다른 자리예요.');
  r.hint();
  assert.equal(r.getState().feedback, '세 번째 자리를 찾아요.');
  r.answer(3);
  assert.equal(r.getState().stepId, 'custom-result');
  assert.equal(r.getState().lessonId, 'another-lesson');
});


test('applying a call directly updates the derived pot and preserves the input state', () => {
  const before = stateAt(prototype.scenario, 12);
  const after = applyEvent(before, prototype.scenario.events[12]);
  assert.equal(after.potTotal, 25);
  assert.equal(after.seats[2].stack, 90);
  assert.equal(before.potTotal, 15);
  assert.equal(before.seats[2].stack, 100);
});


test('only finishing required questions and observations completes a lesson, replay does not duplicate it', async () => {
  const completed=[];
  const r=createLessonRuntime({lesson:prototype,playEvent:instant,wait:instant,reducedMotion:()=>true,onComplete:id=>completed.push(id)});
  r.go('called'); await r.next();
  assert.deepEqual(completed,[]);
  r.goToLesson('prototype');
  r.answer(0); await r.next(); await r.next(); r.next(); r.answer(2); r.next();
  await r.next(); r.answer(5); await r.next(); await r.next();
  assert.deepEqual(completed,['prototype']);
  await r.replay(); r.previous();
  assert.deepEqual(completed,['prototype']);
});

test('resuming a valid confirmed cursor can finish the remaining lesson without auto playback', async () => {
  const completed=[];
  const r=createLessonRuntime({lesson:prototype,initialStepId:'called',playEvent:instant,wait:instant,reducedMotion:()=>true,onComplete:id=>completed.push(id)});
  assert.equal(r.getState().stepId,'called');
  assert.equal(r.getState().busy,false);
  assert.equal(r.getState().table.potTotal,60);
  await r.next();
  assert.deepEqual(completed,['prototype']);
});

test('changing lessons cancels pending playback before it can overwrite the new lesson', async () => {
  let finish;
  let first=true;
  const other={...prototype,id:'other'};
  const r=createLessonRuntime({lesson:prototype,resolveLesson:id=>id==='other'?other:prototype,playEvent:()=>first?(first=false,new Promise(resolve=>{finish=resolve;})):Promise.resolve(),wait:instant,reducedMotion:()=>true});
  r.go('watch-calls'); const playback=r.next(); await Promise.resolve();
  r.goToLesson('other'); finish(); await playback;
  assert.equal(r.getState().lessonId,'other');
  assert.equal(r.getState().stepId,'first-recipient');
  assert.equal(r.getState().table.potTotal,15);
  assert.equal(r.getState().busy,false);
});
