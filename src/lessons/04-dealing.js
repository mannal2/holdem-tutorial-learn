import { mainStart } from '../scenarios/main-hand.mjs';

const instruction=(symbol,text)=>({kind:'instruction',symbol,lines:[[{text,strong:true}]]});
const seatQuestion=feedback=>({kind:'seat',options:[0,1,2,3,4,5],acceptedAnswers:[0],hint:'BTN은 플레이어 6이에요. 시계 방향으로 다음 자리인 내가 먼저 받아요.',feedbackByAnswer:{default:feedback}});
const steps=[
 {id:'04-a',title:'첫 카드는\n누구에게 갈까요?',body:'블라인드를 놓았으니 개인카드를 나눠요. 기본 다인 테이블에서는 버튼 왼쪽부터 시계 방향으로 시작해요. 첫 카드를 받을 자리를 눌러보세요.',mode:'첫 수령자 찾기',nextLabel:'첫 카드를 받을 자리를 골라주세요',question:seatQuestion('카드 배분은 버튼 다음 자리부터예요. BTN에서 시계 방향으로 한 자리 이동해보세요.'),focus:{hintSeatIds:[0],labels:{5:'BTN · 기준점'},direction:{from:5,to:0,onHint:true}},visual:instruction('↻','카드를 받는 순서의 기준은 딜러 버튼이에요.')},
 {id:'04-a-result',title:'버튼 다음 자리인\n내가 먼저 받아요.',body:'이번 판은 내 자리부터 시작해요. 한 사람에게 두 장을 연달아 주는 대신, 한 장씩 시계 방향으로 나눠요.',mode:'첫 수령자 확인',success:true,nextLabel:'첫 번째 바퀴 보기 →',focus:{activeSeatIds:[0],activeLabel:'첫 카드',direction:{from:5,to:0}},visual:instruction('↻','나 → 플레이어 2 → 3 → 4 → 5 → 6')},
 {id:'04-b',title:'한 사람에게 한 장씩,\n첫 번째 바퀴를 돌아요.',body:'카드가 각 자리의 첫 번째 칸에 도착하는 모습을 보세요. 버튼을 가진 플레이어 6까지 받으면 잠시 멈춰요.',mode:'첫 번째 배분 관찰',playingPhase:'카드 배분 · 첫 번째 바퀴',playTo:8,nextLabel:'첫 번째 바퀴 보기 →',visual:instruction('♧','한 장씩 여섯 자리, 첫 번째 칸으로 이동해요.')},
 {id:'04-b-result',checkpoint:8,replayFrom:'04-b',title:'모두 한 장씩\n받았어요.',body:'여섯 사람 모두 첫 번째 칸에 카드가 한 장 있어요. 두 번째 칸은 아직 비어 있어요. 이제 같은 순서로 한 바퀴 더 돌아요.',mode:'첫 번째 바퀴 완료',success:true,nextLabel:'다음 수령자 맞히기 →',visual:instruction('✓','각자 1장 · 첫 번째 바퀴 완료')},
 {id:'04-c',checkpoint:8,replayFrom:'04-b',title:'다음 카드는\n누구에게 갈까요?',body:'플레이어 6이 첫 번째 바퀴의 마지막 카드를 받았어요. 두 번째 바퀴의 첫 카드를 받을 자리를 눌러보세요.',mode:'두 번째 바퀴 시작 찾기',nextLabel:'다음 카드를 받을 자리를 골라주세요',question:seatQuestion('첫 번째 바퀴가 끝나면 버튼 다음 자리부터 다시 시작해요. 한 사람에게 두 장을 연달아 주지 않아요.'),focus:{hintSeatIds:[0],labels:{5:'첫 바퀴의 마지막'}},visual:instruction('↻','한 장씩 모두 받은 뒤, 같은 순서로 한 장씩 더 받아요.')},
 {id:'04-c-result',checkpoint:8,title:'두 번째 바퀴도\n내 자리부터 시작해요.',body:'첫 번째 바퀴와 같은 순서예요. 이번에는 빈 두 번째 칸에 한 장씩 놓아요.',mode:'두 번째 수령자 확인',success:true,nextLabel:'한 장씩 더 받기 →',focus:{activeSeatIds:[0],activeLabel:'두 번째 카드'},visual:instruction('↻','나 → 플레이어 2 → 3 → 4 → 5 → 6')},
 {id:'04-d',checkpoint:8,playTo:14,title:'한 장씩 더 받아\n각자 두 장을 채워요.',body:'카드가 두 번째 칸으로 이동해요. 모든 사람이 두 번째 카드를 받을 때까지 순서대로 관찰해보세요.',mode:'두 번째 배분 관찰',playingPhase:'카드 배분 · 두 번째 바퀴',nextLabel:'한 장씩 더 받기 →',visual:instruction('♧','같은 순서로 한 바퀴 더, 두 번째 칸을 채워요.')},
 {id:'04-d-result',checkpoint:14,replayFrom:'04-d',title:'이제 모두\n두 장씩 받았어요.',body:'여섯 사람에게 총 12장의 개인카드를 나눴어요. 먼저 두 장씩 한꺼번에 준 것이 아니라, 한 장씩 두 바퀴 돌았어요.',mode:'두 번째 바퀴 완료',success:true,nextLabel:'내 카드 확인하기 →',visual:instruction('✓','6명 × 2장 = 총 12장')},
 {id:'04-e',checkpoint:14,revealedSeatIds:[0],required:true,title:'내 개인카드 두 장을\n확인해보세요.',body:'내 카드는 8♠와 Q♥예요. 다른 사람의 개인카드는 볼 수 없어요. 카드를 받는 순서와 행동하는 순서는 달라요. 행동 순서는 다음 레슨에서 배워요.',mode:'내 카드 확인',nextLabel:'레슨 마치기 →',focus:{activeSeatIds:[0],activeLabel:'내 개인카드'},visual:instruction('✓','모두 두 장 · 이제 행동할 순서를 알아봐요.')},
 {id:'04-complete',checkpoint:14,revealedSeatIds:[0],title:'한 장씩 두 바퀴,\n모두 두 장을 받았어요.',body:'버튼 다음 자리부터 시계 방향으로 나누는 과정을 배웠어요. 같은 장면을 다시 연습할 수 있어요.',mode:'레슨 완료',success:true,nextLabel:'이 레슨 다시 연습 ↻',visual:{kind:'recap',items:[{title:'시작하는 자리',text:' · 버튼 왼쪽의 다음 자리'},{title:'나누는 방법',text:' · 시계 방향으로 한 장씩 두 바퀴'},{title:'두 가지 순서',text:' · 카드 배분과 행동 순서는 달라요'}]}},
];
const scenes=[1,1,2,2,3,3,4,4,5,5];
export const dealing={id:'04',completionStepId:'04-complete',scenario:mainStart,
 steps:steps.map((step,i)=>({checkpoint:2,phase:'개인카드 배분',revealedSeatIds:[],stepLabel:scenes[i]+' / 5',nextId:steps[(i+1)%steps.length].id,...step,focus:{activeSeatIds:[],activeLabel:'',hintSeatIds:[],labels:{},direction:null,...step.focus}})),
};
