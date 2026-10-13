import { mainStart } from '../scenarios/main-hand.mjs';

const instruction = (symbol, text) => ({kind:'instruction',symbol,lines:[[{text,strong:true}]]});
const seatQuestion = (answer, hint, feedback) => ({
  kind:'seat',options:[0,1,2,3,4,5],acceptedAnswers:[answer],hint,feedbackByAnswer:{default:feedback},
});
const buttonToSb = {from:5,to:0};
const sbToBb = {from:0,to:1};
const steps = [
  {
    id:'03-a',title:'순서의 기준,\n딜러 버튼을 찾아보세요.',
    body:'새로운 한 판을 시작해요. BTN이라고 적힌 딜러 버튼이 있는 자리를 눌러보세요.',
    mode:'BTN 찾기',nextLabel:'버튼 자리를 골라주세요',
    question:seatQuestion(5,'BTN 표시가 있는 플레이어 6의 자리를 찾아보세요.','블라인드 자리와 버튼 자리는 달라요. BTN이라고 적힌 동그라미를 찾아보세요.'),
    focus:{activeSeatIds:[5],activeLabel:'딜러 버튼',hintSeatIds:[5]},
    visual:instruction('◎','테이블의 BTN 표시를 찾아 자리를 눌러주세요.'),
  },
  {
    id:'03-a-result',title:'버튼은 순서를\n정하는 기준점이에요.',
    body:'이번 판의 버튼은 플레이어 6에게 있어요. 카드를 받거나 행동할 순서를 정할 때 기준으로 삼는 자리예요.',
    mode:'버튼 확인',success:true,nextLabel:'SB 자리 찾기 →',
    focus:{activeSeatIds:[5],activeLabel:'BTN · 순서의 기준'},
    visual:instruction('◎','BTN → 그다음 자리부터 살펴볼까요?'),
  },
  {
    id:'03-b-sb',title:'버튼 다음 자리,\nSB는 누구인가요?',
    body:'버튼 왼쪽, 시계 방향으로 다음 자리가 스몰 블라인드(SB)예요. 화살표를 따라 그 자리를 눌러보세요.',
    mode:'SB 찾기',nextLabel:'SB 자리를 골라주세요',
    question:seatQuestion(0,'BTN은 플레이어 6이에요. 시계 방향으로 다음 자리인 내 자리를 찾아보세요.','BTN 다음 자리가 SB예요. 버튼에서 시계 방향으로 한 자리만 이동해보세요.'),
    focus:{hintSeatIds:[0],labels:{5:'BTN · 기준점'},direction:buttonToSb},
    visual:instruction('↻','BTN 다음 → SB (스몰 블라인드)'),
  },
  {
    id:'03-b-sb-result',title:'이번 판의 SB는\n내 자리예요.',
    body:'버튼 다음 자리에 있는 내가 SB를 맡아요. 이제 시계 방향으로 한 자리 더 가서 BB를 찾아볼까요?',
    mode:'SB 확인',success:true,nextLabel:'BB 자리 찾기 →',
    focus:{activeSeatIds:[0],activeLabel:'SB · 스몰 블라인드',labels:{5:'BTN'},direction:buttonToSb},
    visual:instruction('↻','BTN → SB → 다음은 BB'),
  },
  {
    id:'03-b-bb',title:'SB 다음 자리,\nBB는 누구인가요?',
    body:'SB에서 시계 방향으로 다음 자리가 빅 블라인드(BB)예요. BB가 있는 자리를 눌러보세요.',
    mode:'BB 찾기',nextLabel:'BB 자리를 골라주세요',
    question:seatQuestion(1,'BTN → SB → BB 순서예요. SB인 내 자리 다음은 플레이어 2예요.','SB는 이미 찾았어요. 그다음 자리가 BB예요. 시계 방향으로 한 자리 더 이동해보세요.'),
    focus:{hintSeatIds:[1],labels:{0:'SB · 기준점'},direction:sbToBb},
    visual:instruction('↻','SB 다음 → BB (빅 블라인드)'),
  },
  {
    id:'03-b-bb-result',title:'플레이어 2가\nBB를 맡아요.',
    body:'이번 판은 BTN → SB → BB 순서로 이어져요. SB와 BB가 먼저 내는 칩을 블라인드라고 해요.',
    mode:'블라인드 두 자리 확인',success:true,nextLabel:'블라인드 놓아보기 →',
    focus:{activeSeatIds:[1],activeLabel:'BB · 빅 블라인드',labels:{0:'SB · 5칩',5:'BTN'},direction:sbToBb},
    visual:instruction('◎','이번 판의 블라인드 · SB 5칩 / BB 10칩'),
  },
  {
    id:'03-c',title:'카드를 받기 전에\n블라인드를 놓아요.',
    body:'블라인드는 카드를 받기 전에 내는 의무 베팅이에요. 이번 판에서는 SB인 내가 5칩, BB인 플레이어 2가 10칩을 내요.',
    mode:'의무 베팅 관찰하기',playTo:2,nextLabel:'블라인드 놓기 →',
    focus:{labels:{0:'SB · 5칩',1:'BB · 10칩'}},
    visual:instruction('◎','SB 5칩 → BB 10칩, 한 사람씩 놓아요.'),
  },
  {
    id:'03-c-result',checkpoint:2,replayFrom:'03-c',title:'카드는 아직 없고,\n팟에는 15칩이 있어요.',
    body:'SB의 5칩과 BB의 10칩이 팟에 포함됐어요. 내 남은 칩은 95, 플레이어 2는 90이 되었어요.',
    mode:'블라인드 놓기 완료',success:true,nextLabel:'언제 내는지 확인하기 →',
    focus:{labels:{0:'SB · 5칩 냄',1:'BB · 10칩 냄'},pot:true},
    visual:instruction('✓','5 + 10 = 팟 15칩'),
  },
  {
    id:'03-d',checkpoint:2,replayFrom:'03-c',title:'블라인드는\n언제 내나요?',
    body:'개인카드 슬롯은 아직 비어 있어요. 방금 본 순서를 떠올리고 블라인드를 내는 시점을 골라주세요.',
    mode:'순서 확인하기',nextLabel:'시점을 골라주세요',focus:{pot:true},visual:{kind:'question'},
    question:{kind:'choice',options:['before','after','optional'],optionLabels:{before:'카드를 받기 전',after:'카드를 받은 뒤',optional:'내고 싶을 때'},acceptedAnswers:['before'],
      hint:'개인카드가 한 장도 없는데 이미 15칩이 놓였어요.',
      feedbackByAnswer:{after:'카드가 나오기 전에 블라인드를 놓았어요. 빈 개인카드 슬롯과 팟 15칩을 함께 보세요.',optional:'블라인드는 SB와 BB가 반드시 내는 의무 베팅이에요.',default:'방금은 블라인드를 먼저 놓고, 개인카드는 아직 받지 않았어요.'}},
  },
  {
    id:'03-e',checkpoint:2,required:true,title:'블라인드가 있어\n처음부터 팟이 생겨요.',
    body:'SB와 BB가 먼저 내는 칩 덕분에 매 판 시작부터 경쟁할 팟이 생겨요. 이번 판은 이 15칩을 두고 시작해요.',
    mode:'블라인드가 필요한 이유',nextLabel:'레슨 마치기 →',focus:{pot:true},
    visual:instruction('◎','한 판의 출발점 · 팟 15칩'),
  },
  {
    id:'03-complete',checkpoint:2,title:'버튼을 기준으로,\n블라인드부터 시작해요.',
    body:'세 자리의 관계와 블라인드를 내는 시점을 배웠어요. 같은 장면을 다시 연습할 수 있어요.',
    mode:'레슨 완료',success:true,nextLabel:'이 레슨 다시 연습 ↻',focus:{pot:true},
    visual:{kind:'recap',items:[{title:'자리의 순서',text:' · BTN → SB → BB'},{title:'내는 시점',text:' · 카드를 받기 전 의무 베팅'},{title:'블라인드의 역할',text:' · 시작부터 경쟁할 팟을 만들어요'}]},
  },
];
const scenes=[1,1,2,2,2,2,3,3,4,5,5];
export const buttonBlinds = {
  id:'03',completionStepId:'03-complete',scenario:mainStart,
  steps:steps.map((step,i)=>({
    checkpoint:0,phase:'딜러 버튼과 블라인드',revealedSeatIds:[],stepLabel:`${scenes[i]} / 5`,nextId:steps[(i+1)%steps.length].id,
    ...step,focus:{activeSeatIds:[],activeLabel:'',hintSeatIds:[],labels:{},direction:null,...step.focus},
  })),
};
