import test from 'node:test';
import assert from 'node:assert/strict';
import { readProgress, writeProgress, PROGRESS_KEY } from '../src/progress.mjs';

const start = { version:1, lessonId:'prototype', stepId:'first-recipient', completedLessonIds:[], reviewLessonIds:[] };
function storage(value = null) {
  return { getItem: () => value, setItem: (_, next) => { value = next; } };
}

test('progress restores a valid confirmed step and completed lesson after saving', () => {
  const store = storage();
  const value = { ...start, stepId:'call-amount', completedLessonIds:['prototype'] };
  assert.equal(writeProgress(store,value),true);
  assert.deepEqual(readProgress(store),value);
  assert.equal(PROGRESS_KEY,'holdem-tutorial:progress:v1');
});
test('missing or corrupt browser data starts the available lesson safely', () => {
  for (const raw of [null,'{broken','null','[]',JSON.stringify({version:2}),JSON.stringify({version:1,lessonId:7})]) {
    assert.deepEqual(readProgress(storage(raw)),start);
  }
});
test('a removed step falls back to that lesson start while keeping valid completion', () => {
  const store=storage(JSON.stringify({...start,stepId:'deleted-step',completedLessonIds:['prototype','14','prototype',42]}));
  assert.deepEqual(readProgress(store),{...start,completedLessonIds:['prototype']});
});
test('an unavailable lesson cannot be restored or counted as completed', () => {
  const store=storage(JSON.stringify({...start,lessonId:'14',stepId:'future-step',completedLessonIds:['14'],reviewLessonIds:['25']}));
  assert.deepEqual(readProgress(store),start);
});
test('saving persists only the cursor and valid progress, never animation frames or DOM data', () => {
  const store=storage();
  writeProgress(store,{...start,stepId:'deal-first-round',busy:true,eventCount:3,table:{potTotal:15},completedLessonIds:['prototype','prototype'],reviewLessonIds:'bad'});
  assert.deepEqual(JSON.parse(store.getItem(PROGRESS_KEY)),{...start,stepId:'deal-first-round',completedLessonIds:['prototype']});
});
test('blocked storage cannot prevent a lesson from starting or continuing', () => {
  const blocked={ getItem(){throw new Error('blocked');},setItem(){throw new Error('quota');} };
  assert.deepEqual(readProgress(blocked),start);
  assert.equal(writeProgress(blocked,start),false);
  assert.deepEqual(readProgress(null),start);
  assert.equal(writeProgress(null,start),false);
});


test('an unavailable lesson cannot reuse a coincidentally valid step from the fallback lesson', () => {
  const store=storage(JSON.stringify({...start,lessonId:'14',stepId:'called'}));
  assert.deepEqual(readProgress(store),start);
});
