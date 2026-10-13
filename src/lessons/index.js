import { prototype } from './prototype.js';
import { victory } from './01-victory.js';
import { twoWays } from './02-two-ways.js';
import { buttonBlinds } from './03-button-blinds.js';
import { dealing } from './04-dealing.js';
import { preflopOrder } from './05-preflop-order.js';
import { firstActions } from './06-first-actions.js';
import { foldedChips } from './07-folded-chips.js';
import { callAndCheck } from './08-call-and-check.js';
import { roundEnd } from './09-round-end.js';

const titles = [
  '홀덤의 승부 원리', '이기는 두 가지 방법', '딜러 버튼과 블라인드', '개인카드를 받는 순서',
  '프리플랍의 행동 순서', '첫 선택: 폴드·콜·레이즈', '폴드하면 이미 낸 칩은 어떻게 되는가',
  '콜 금액과 BB의 체크', '베팅 라운드가 끝나는 조건', '플랍: 공용카드 3장 공개',
  '새로운 단계에서는 베팅 금액도 새로 계산', '플랍 이후의 행동 순서', '체크·베팅과 이후의 대응',
  '베팅과 레이즈의 금액', '턴: 네 번째 공용카드와 반복 연습', '리버: 마지막 공용카드와 최종 베팅',
  '쇼다운과 최고의 5장 선택', '족보의 모양과 우선순위', '같은 족보의 승부와 무승부',
  '다음 판과 토너먼트의 진행', '올인 이후의 게임 진행', '콜할 칩이 부족할 때',
  '사이드 팟 이해하기', '두 명만 남았을 때의 규칙', '도움 없이 한 판 진행하기',
];

export const lessonCatalog = [
  { id: prototype.id, title: '첫걸음 체험', description: '카드 받기 · 첫 차례 찾기 · 직접 콜하기', definition: prototype },
  ...titles.map((title, index) => ({ id: String(index + 1).padStart(2, '0'), title, ...(index === 0 ? {definition:victory} : index === 1 ? {definition:twoWays} : index === 2 ? {definition:buttonBlinds} : index === 3 ? {definition:dealing} : index === 4 ? {definition:preflopOrder} : index === 5 ? {definition:firstActions} : index === 6 ? {definition:foldedChips} : index === 7 ? {definition:callAndCheck} : index === 8 ? {definition:roundEnd} : {}) })),
];
export function getLesson(id) {
  return lessonCatalog.find(item => item.id === id)?.definition;
}
export function getLessonLabel(id) {
  const item = lessonCatalog.find(entry => entry.id === id);
  return item.id === prototype.id ? item.title : `LESSON ${item.id}`;
}
export const firstLesson = prototype;

export function getNextLesson(id) {
  if (id === prototype.id) return undefined;
  const index = lessonCatalog.findIndex(item => item.id === id);
  const next = lessonCatalog[index + 1];
  return index >= 0 && next?.definition ? next : undefined;
}
