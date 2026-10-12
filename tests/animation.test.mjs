import test from 'node:test';
import assert from 'node:assert/strict';
import { wait } from '../src/animation.mjs';

test('canceling a pending animation delay rejects instead of advancing the lesson', async () => {
  const controller = new AbortController();
  const pending = wait(100, controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});
test('already canceled playback cannot schedule another step', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(wait(0, controller.signal), { name: 'AbortError' });
});
test('normal playback delay can finish', async () => {
  await wait(1, new AbortController().signal);
});
