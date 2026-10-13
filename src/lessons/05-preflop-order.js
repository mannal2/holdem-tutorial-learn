import { mainStart } from '../scenarios/main-hand.mjs';
import { stateAt } from '../lesson-runtime.mjs';

const instruction=(symbol,text)=>({kind:'instruction',symbol,lines:[[{text,strong:true}]]});
const question=(answer,hint,feedbackByAnswer)=>({kind:'seat',options:[0,1,2,3,4,5],acceptedAnswers:[answer],hint,feedbackByAnswer});
const scenario={id:'preflop-order-preview',initialState:stateAt(mainStart,mainStart.checkpoints.dealt),events:[2,3,4,5,0,1].map((player,i)=>({type:'preview-turn',player,label:(i+1)+'번째 · 순서 미리보기'}))};
const steps=[
 {id:'05-a',required:true,title:'공용카드가 나오기 전,\n프리플랍이에요.',body:'각자 개인카드 두 장을 받았고, 공용카드는 아직 없어요. 이 단계를 프리플랍이라고 해요. 이제 누가 먼저 행동하는지 알아볼까요?',mode:'프리플랍 알아보기',nextLabel:'첫 행동자 찾기 →',focus:{intro:true},visual:instruction('♧','개인카드 2장 · 공용카드 0장 · 프리플랍')},
 {id:'05-b',title:'프리플랍에서\n누가 먼저 행동할까요?',body:'프리플랍은 BB 다음 자리부터 시계 방향으로 행동해요. 카드를 먼저 받은 사람과는 달라요. 첫 행동자의 자리를 눌러보세요.',mode:'첫 행동자 찾기',nextLabel:'첫 행동자를 골라주세요',question:question(2,'BB는 플레이어 2예요. 시계 방향으로 다음 자리인 플레이어 3부터 행동해요.',{0:'SB는 첫 카드를 받았어요. 첫 행동은 BB 다음이에요.',default:'프리플랍의 첫 행동은 BB 다음 자리부터예요. BB를 찾고 시계 방향으로 한 자리 이동해보세요.'}),focus:{hintSeatIds:[2],labels:{1:'BB · 기준점'},direction:{from:1,to:2,onHint:true}},visual:instruction('↻','첫 카드: BTN 다음 / 첫 행동: BB 다음')},
 {id:'05-b-result',title:'BB 다음 자리인\n플레이어 3부터 시작해요.',body:'첫 카드는 SB인 내가 받았지만, 프리플랍의 첫 행동은 BB 다음인 플레이어 3이 해요. 여기서부터 시계 방향으로 이어져요.',mode:'첫 행동자 확인',success:true,nextLabel:'순서 미리보기 →',focus:{activeSeatIds:[2],activeLabel:'첫 행동',labels:{1:'BB · 기준점'},direction:{from:1,to:2}},visual:instruction('↻','카드 배분의 시작과 행동의 시작을 구분해요.')},
 {id:'05-c',playTo:6,title:'시계 방향으로\n행동 순서를 따라가요.',body:'플레이어 3부터 한 자리씩 강조해볼게요. 지금은 순서만 살펴보므로 누구도 베팅하거나 체크하지 않아요. 카드와 칩은 그대로예요.',mode:'행동 순서 미리보기',playingPhase:'프리플랍 · 순서 미리보기',nextLabel:'행동 순서 보기 →',visual:instruction('↻','플레이어 3 → 4 → 5 → 6 → 나 → 2')},
 {id:'05-c-result',checkpoint:6,replayFrom:'05-c',title:'플레이어 3부터\nBB까지 이어졌어요.',body:'플레이어 3 → 4 → 5 → 6 → 나 → 2 순서예요. BB도 행동할 차례가 있어요. 실제 행동은 아직 하지 않았으므로 팟은 15칩 그대로예요.',mode:'순서 관찰 완료',success:true,nextLabel:'이어지는 차례 확인 →',visual:instruction('✓','이 순서는 첫 진행 순서예요. 한 바퀴만 돌면 베팅이 끝난다는 뜻은 아니에요.')},
 {id:'05-d',checkpoint:6,replayFrom:'05-c',title:'플레이어 6 다음은\n누구 차례인가요?',body:'테이블을 시계 방향으로 따라가보세요. 버튼을 가진 플레이어 6 다음에 행동할 자리를 눌러보세요.',mode:'이어지는 차례 찾기',nextLabel:'다음 자리를 골라주세요',question:question(0,'플레이어 6 다음은 SB인 내 자리예요. 그다음에는 BB인 플레이어 2로 이어져요.',{default:'플레이어 6에서 시계 방향으로 한 자리 이동하면 SB인 내 자리예요. 버튼에서 순서가 멈추거나 처음으로 돌아가지 않아요.'}),focus:{hintSeatIds:[0],labels:{5:'이 자리 다음은?'},direction:{from:5,to:0,onHint:true}},visual:instruction('↻','플레이어 6 → ? → 플레이어 2')},
 {id:'05-d-result',checkpoint:6,title:'다음은 내 차례,\n그다음은 BB예요.',body:'플레이어 6 다음에는 SB인 내가 행동하고, 이어서 BB인 플레이어 2가 행동해요. 다음 레슨에서는 첫 행동자가 선택할 수 있는 행동을 배워요.',mode:'이어지는 순서 확인',success:true,nextLabel:'레슨 마치기 →',focus:{activeSeatIds:[0],activeLabel:'플레이어 6 다음',direction:{from:5,to:0}},visual:instruction('✓','프리플랍: BB 다음부터 시계 방향')},
 {id:'05-complete',checkpoint:6,title:'프리플랍은\nBB 다음부터 행동해요.',body:'프리플랍의 첫 행동자와 시계 방향의 진행 순서를 배웠어요. 같은 장면을 다시 연습할 수 있어요.',mode:'레슨 완료',success:true,nextLabel:'이 레슨 다시 연습 ↻',visual:{kind:'recap',items:[{title:'프리플랍',text:' · 공용카드가 나오기 전'},{title:'첫 행동자',text:' · BB 다음 자리'},{title:'진행 방향',text:' · 시계 방향, BB 차례까지 이어져요'}]}},
];
const scenes=[1,2,2,3,3,4,4,4];
export const preflopOrder={id:'05',completionStepId:'05-complete',scenario,steps:steps.map((step,i)=>({checkpoint:0,phase:'프리플랍',revealedSeatIds:[0],stepLabel:scenes[i]+' / 4',nextId:steps[(i+1)%steps.length].id,...step,focus:{activeSeatIds:[],activeLabel:'',hintSeatIds:[],labels:{},direction:null,...step.focus}}))};
