import { lessons } from '../lesson-content.js';

const ids = ['first-recipient', 'deal-first-round', 'deal-second-round', 'dealt', 'first-actor', 'first-actor-found', 'watch-calls', 'call-amount', 'call-correct', 'called', 'complete'];
const checkpoints = [0,0,6,12,12,12,12,16,16,17,18];
const dealInstruction = { symbol: '♧', lines: [[{ text: '첫 카드의 기준은 ' }, { text: '딜러 버튼', strong: true }], [{ text: 'BTN 표시를 찾아보세요.' }]] };
const orderInstruction = { symbol: '↻', lines: [[{ text: '첫 행동의 기준은 ' }, { text: '빅 블라인드', strong: true }], [{ text: 'BB 다음 자리부터 시작해요.' }]] };
const callInstruction = { symbol: '◎', lines: [[{ text: '콜은 부족한 만큼 맞추기.', strong: true }], [{ text: '내가 이미 낸 금액을 확인해요.' }]] };
const bbInstruction = { symbol: '◎', lines: [[{ text: 'BB의 행동도 남아 있어요.', strong: true }], [{ text: '한 바퀴 돌았다고 바로 끝나지 않아요.' }]] };
const orderDirection = { desktop: 'M22 62 Q28 48 21 35', mobile: 'M25 60 Q30 45 23 35' };
const card = id => ({ id, rank: '23456789TJQKA'.indexOf(id[0]) + 2, suit: id[1] });
const holes = [['8s','Qh'],['7h','6h'],['Qs','Kd'],['9c','Tc'],['Ks','5d'],['As','Ad']];

export const prototypeScenario = {
  id: 'prototype-hand',
  initialState: {
    street: 'preflop', userId: 0, buttonId: 5, smallBlindId: 0, bigBlindId: 1,
    smallBlind: 5, bigBlind: 10, currentBet: 10, lastFullRaise: 10,
    pendingActorIds: [2,3,4,5,0,1], board: [], boardCount: 0,
    seats: holes.map((hole, id) => ({
      id, name: id === 0 ? '나' : `플레이어 ${id + 1}`,
      stack: id === 0 ? 95 : id === 1 ? 90 : 100,
      streetCommitted: id === 0 ? 5 : id === 1 ? 10 : 0,
      handCommitted: id === 0 ? 5 : id === 1 ? 10 : 0,
      status: 'active', hole: hole.map(card), dealtCount: 0, revealed: false,
    })),
  },
  events: [
    ...[0,1].flatMap(slot => [0,1,2,3,4,5].map(player => ({ type: 'deal', player, slot }))),
    ...[2,3,4,5,0].map(player => ({ type: 'act', player, action: 'call', to: 10 })),
    { type: 'act', player: 1, action: 'check', to: 10 },
  ],
  checkpoints: { blinds: 0, firstRound: 6, dealt: 12, beforeSbCall: 16, beforeBbCheck: 17, complete: 18 },
};

const questions = {
  0: { kind: 'seat', acceptedAnswers: [0], hint: 'BTN → SB → BB 순서예요. 내 자리는 SB예요.', feedbackByAnswer: { default: '버튼(BTN)을 찾아보세요. 그다음 자리가 첫 카드를 받아요.' } },
  4: { kind: 'seat', acceptedAnswers: [2], hint: 'BB는 플레이어 2예요. 시계 방향으로 다음 자리를 찾아보세요.', feedbackByAnswer: { 0: 'SB는 첫 카드를 받았어요.\n첫 행동은 BB 다음 자리에서 시작해요.', default: 'BB 자리를 먼저 찾아보세요. 그다음부터 행동해요.' } },
  7: { kind: 'choice', options: [0,5,10], acceptedAnswers: [5], hint: '맞춰야 할 10 − 이미 낸 5 = ?', feedbackByAnswer: { 0: '나는 아직 5만 냈어요. 10에 맞추려면 더 필요해요.', default: '이미 낸 5도 포함돼요. 부족한 금액만 더 내면 돼요.' } },
};
const playTo = { 1: 6, 2: 12, 6: 16, 8: 17, 9: 18 };
const replayFrom = { 2: 1, 3: 2, 7: 6, 9: 8, 10: 9 };

// Index is the legacy stage (0..10), retained only as the migration map.
export const prototype = {
  id: 'prototype', completionStepId: 'complete', scenario: prototypeScenario,
  steps: lessons.map(([title, body, mode, nextLabel], index) => ({
    id: ids[index], nextId: ids[(index + 1) % ids.length],
    checkpoint: checkpoints[index], playTo: playTo[index],
    replayFrom: replayFrom[index] === undefined ? undefined : ids[replayFrom[index]],
    title, body, mode, nextLabel, question: questions[index],
    stepLabel: index <= 3 ? `${index + 1} / 4` : index <= 5 ? `${index - 3} / 2` : `${index - 5} / 5`,
    phase: index <= 3 ? '카드 배분' : index === 10 ? '프리플랍 완료' : '프리플랍',
    playingPhase: index === 1 || index === 2 ? `카드 배분 · ${index}번째 바퀴` : undefined,
    revealedSeatIds: index >= 3 ? [0] : [], success: [1,5,8,10].includes(index),
    focus: {
      activeSeatIds: index === 1 || index === 7 || index === 8 ? [0] : index === 5 ? [2] : index === 9 ? [1] : [],
      activeLabel: index === 1 ? '첫 카드' : index === 5 ? '첫 행동' : '현재 차례',
      hintSeatIds: index === 0 ? [5] : index === 4 ? [1] : [],
      labels: index === 10 ? { 1: '체크 ✓' } : {},
      direction: index === 0 ? { desktop: 'M79 73 Q72 83 61 84', mobile: 'M79 73 Q72 83 61 84', onHint: true } : index === 4 || index === 5 ? { ...orderDirection, onHint: index === 4 } : null,
    },
    visual: index === 7 || index === 8 ? { kind: 'math', player: 0, showAnswer: index === 8 }
      : index === 10 ? { kind: 'recap', items: [
        { title: '카드 배분', text: ' · 버튼 다음부터 한 장씩 두 바퀴' },
        { title: '첫 행동', text: ' · 프리플랍은 BB 다음부터' },
        { title: 'SB의 콜', text: ' · 이미 낸 5를 빼고 5만 추가' },
      ] } : { kind: 'instruction', ...(index <= 3 ? dealInstruction : index <= 5 ? orderInstruction : index === 9 ? bbInstruction : callInstruction) },
  })),
};
