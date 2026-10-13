const labels = { bet: '베팅', blind: '블라인드', call: '콜', raise: '레이즈', check: '체크', fold: '폴드' };
export function playerAction(player, type, from, to) {
  const amount = to - from;
  if (!labels[type] || (['check','fold'].includes(type) ? amount !== 0 : amount <= 0)) throw new Error('Invalid player action');
  return { player, type, from, to, amount, label: ['check','fold'].includes(type) ? labels[type] : `${labels[type]} · ${amount}` };
}
