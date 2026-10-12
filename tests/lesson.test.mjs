import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshot, choose } from '../lesson.mjs';

test('cards start at SB and go once around before a second card', () => {
  assert.deepEqual(snapshot(1, 1).cards, [1, 0, 0, 0, 0, 0]);
  assert.deepEqual(snapshot(2).cards, [1, 1, 1, 1, 1, 1]);
  assert.deepEqual(snapshot(2, 7).cards, [2, 1, 1, 1, 1, 1]);
  assert.deepEqual(snapshot(3).cards, [2, 2, 2, 2, 2, 2]);
});
test('wrong seats do not advance and first action differs from first recipient', () => {
  assert.equal(choose(0, 1), 0);
  assert.equal(choose(0, 0), 1);
  assert.equal(choose(4, 0), 4);
  assert.equal(choose(4, 2), 5);
});
test('SB adds only 5 and chips are conserved before and after calling', () => {
  assert.deepEqual(snapshot(7).bets, [5, 10, 10, 10, 10, 10]);
  assert.equal(snapshot(7).pot, 55);
  assert.equal(choose(7, 10), 7);
  assert.equal(choose(7, 5), 8);
  assert.deepEqual(snapshot(9).bets, [10, 10, 10, 10, 10, 10]);
  assert.equal(snapshot(9).stacks[0], 90);
  assert.equal(snapshot(9).pot, 60);
  assert.equal(snapshot(9).active, 1);
  for (let stage = 0; stage <= 10; stage++) {
    const s = snapshot(stage);
    assert.equal(s.stacks.reduce((a, b) => a + b, 0) + s.pot, 600);
  }
});
test('rewinding reconstructs the previous state without duplicate chips', () => {
  snapshot(10);
  assert.equal(snapshot(7).pot, 55);
  assert.deepEqual(snapshot(0).cards, [0, 0, 0, 0, 0, 0]);
  assert.deepEqual(snapshot(0).bets, [5, 10, 0, 0, 0, 0]);
  assert.equal(snapshot(10).pot, 60);
});
