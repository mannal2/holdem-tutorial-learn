import { mainShowdown } from '../scenarios/main-hand.mjs';

const pairs=['Qh','Qd','8s','8c'];
const bestFive=[...pairs,'Jc'];
const steps=[
  {
    id:'01-a', title:'내 카드 2장과\n공용카드 5장',
    body:'내 개인카드 2장과 모두 함께 쓰는 공용카드 5장을 봐요. 이 7장 중 좋은 5장으로 승부해요.',
    mode:'승부 원리 관찰하기', required:true, nextLabel:'7장을 함께 살펴보기 →',
    focus:{cardIds:['8s','Qh'],intro:true},
    visual:{kind:'instruction',symbol:'♧',lines:[[{text:'개인카드 2장 + 공용카드 5장',strong:true}],[{text:'총 7장 중에서 좋은 5장을 골라요.'}]]},
  },
  {
    id:'01-b',title:'같은 숫자 두 장이\n한 쌍이에요.',
    body:'Q 두 장이 한 쌍, 8 두 장이 또 한 쌍이에요. 두 쌍이 있는 모양을 ‘투페어’라고 해요.',
    mode:'두 쌍 찾아보기',required:true,nextLabel:'마지막 한 장 고르기 →',
    focus:{cardIds:pairs},visual:{kind:'hand',player:0,selectedIds:pairs,note:'Q 한 쌍 + 8 한 쌍'},
  },
  {
    id:'01-c',title:'네 장은 골랐어요.\n한 장을 더 고를까요?',
    body:'J는 11을 뜻해요. 남은 J·4·2 중 가장 높은 한 장을 골라 5장을 완성해보세요.',
    mode:'마지막 한 장 선택하기',nextLabel:'선택 완료',focus:{cardIds:pairs},visual:{kind:'question'},
    question:{kind:'cards',player:0,fixedCardIds:pairs,options:['Jc','4h','2s'],selectionSize:5,acceptedAnswers:[bestFive],
      incompleteFeedback:'정확히 5장을 골라야 해요. 마지막 한 장을 눌러주세요.',
      feedbackByAnswer:{default:'두 쌍은 이미 골랐어요. 남은 J·4·2 중 가장 높은 한 장을 찾아보세요.'},
      hint:'J는 11이에요. 11, 4, 2 중 가장 큰 숫자를 찾아보세요.'},
  },
  {
    id:'01-c-result',title:'좋은 5장을\n완성했어요.',
    body:'Q 한 쌍, 8 한 쌍, 그리고 J까지예요. 선택하지 않은 2와 4는 이 승부에 쓰지 않아요.',
    mode:'5장 선택 완료',success:true,nextLabel:'상대와 비교하기 →',focus:{cardIds:bestFive},
    visual:{kind:'hand',player:0,selectedIds:bestFive,note:'투페어 · Q 한 쌍 + 8 한 쌍 + J'},
  },
  {
    id:'01-d',title:'두 쌍과 한 쌍,\n누가 이길까요?',
    body:'나는 Q와 8 두 쌍인 투페어, 상대는 A 한 쌍인 원페어예요. 투페어가 원페어보다 강해요.',
    mode:'승자 찾아보기',nextLabel:'승자를 골라주세요',focus:{cardIds:bestFive},
    visual:{kind:'compare',hands:[{player:0,name:'나',hand:'투페어',cardIds:bestFive},{player:5,name:'플레이어 6',hand:'원페어',cardIds:['As','Ad','Qd','Jc','8c']}]},
    question:{kind:'seat',options:[0,5],optionLabels:{0:'나 · 투페어',5:'플레이어 6 · 원페어'},acceptedAnswers:[0],
      feedbackByAnswer:{default:'높은 숫자 한 장보다 족보 종류를 먼저 비교해요. 여기서는 투페어가 더 강해요.'},hint:'두 쌍인 투페어가 한 쌍인 원페어보다 강해요.'},
  },
  {
    id:'01-d-result',title:'투페어인\n내가 이겼어요.',
    body:'상대에게 높은 A가 있어도 두 쌍인 내 족보가 더 강해요. 족보의 자세한 순서는 나중에 따로 배워요.',
    mode:'승자 확인',success:true,nextLabel:'마지막으로 확인하기 →',focus:{activeSeatIds:[0],activeLabel:'투페어 승리',cardIds:bestFive},
    visual:{kind:'compare',hands:[{player:0,name:'나',hand:'투페어 · 승리',cardIds:bestFive},{player:5,name:'플레이어 6',hand:'원페어',cardIds:['As','Ad','Qd','Jc','8c']}]},
  },
  {
    id:'01-e',title:'승부를 판정하는\n카드는 몇 장일까요?',
    body:'개인카드 2장과 공용카드 5장 중에서 골라요. 실제로 비교하는 카드 수를 선택해보세요.',
    mode:'기억 확인하기',nextLabel:'카드 수를 골라주세요',focus:{cardIds:bestFive},visual:{kind:'question'},
    question:{kind:'choice',options:[2,5,7],unit:'장',acceptedAnswers:[5],
      feedbackByAnswer:{2:'내 개인카드만 비교하지 않아요. 공용카드와 함께 골라요.',default:'7장 중에서 고르지만, 비교하는 것은 5장이에요.'},hint:'7장 중에서 골라, 정확히 5장으로 비교해요.'},
  },
  {
    id:'01-complete',title:'7장 중 좋은 5장.\n첫 원리를 배웠어요.',
    body:'어디서 고르고, 몇 장으로 비교하는지 직접 확인했어요. 같은 장면을 다시 연습할 수 있어요.',
    mode:'레슨 완료',success:true,nextLabel:'이 레슨 다시 연습 ↻',focus:{cardIds:bestFive},
    visual:{kind:'recap',items:[{title:'고르는 카드',text:' · 내 카드 2장 + 공용카드 5장'},{title:'판정하는 카드',text:' · 가장 좋은 5장'},{title:'이번 승부',text:' · 투페어가 원페어보다 강해요'}]},
  },
];
const sceneNumbers=[1,2,3,3,4,4,5,5];
export const victory={
  id:'01',completionStepId:'01-complete',scenario:mainShowdown,
  steps:steps.map((step,i)=>({
    checkpoint:0,phase:'승부 원리 보기',tableMode:'hand-preview',revealedSeatIds:[0,5],
    stepLabel:`${sceneNumbers[i]} / 5`,nextId:steps[(i+1)%steps.length].id,
    ...step,focus:{activeSeatIds:[],activeLabel:'',hintSeatIds:[],labels:{},direction:null,compareSeatIds:[0,5],...step.focus},
  })),
};
