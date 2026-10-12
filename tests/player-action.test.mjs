import test from 'node:test';
import assert from 'node:assert/strict';
import { playerAction } from '../src/player-action.mjs';
test('betting animations carry only the additional amount, including raises', () => {
  assert.equal(playerAction(0, 'call', 5, 10).amount, 5);
  assert.equal(playerAction(2, 'raise', 10, 30).amount, 20);
  assert.equal(playerAction(3, 'bet', 0, 15).amount, 15);
});
test('checking does not move chips or change the wager', () => {
  const action = playerAction(1, 'check', 10, 10);
  assert.equal(action.amount, 0);
  assert.equal(action.label, '체크');
  assert.throws(() => playerAction(1, 'check', 10, 20));
});
