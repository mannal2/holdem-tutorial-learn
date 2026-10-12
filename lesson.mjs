export function snapshot(stage, frame) {
  const dealt = frame !== undefined && stage <= 2 ? frame : stage >= 3 ? 12 : stage === 2 ? 6 : 0;
  const calls = stage >= 7 ? 4 : stage === 6 ? (frame ?? 0) : 0;
  const bets = [stage >= 9 || (stage === 8 && frame === 1) ? 10 : 5, 10, ...Array.from({ length: 4 }, (_, i) => i < calls ? 10 : 0)];
  return {
    cards: Array.from({ length: 6 }, (_, i) => Number(dealt > i) + Number(dealt > i + 6)),
    bets,
    stacks: bets.map(bet => 100 - bet),
    pot: bets.reduce((sum, bet) => sum + bet, 0),
    active: stage === 9 ? 1 : stage === 7 || stage === 8 ? 0 : stage === 5 ? 2 : stage === 6 && calls ? calls + 1 : -1,
  };
}

export function choose(stage, value) {
  return (stage === 0 && value === 0) || (stage === 4 && value === 2) || (stage === 7 && value === 5) ? stage + 1 : stage;
}
