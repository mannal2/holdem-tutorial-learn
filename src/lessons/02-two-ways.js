import { mainShowdown } from '../scenarios/main-hand.mjs';
const showdown={...mainShowdown,events:[{type:'award',player:0}]};
const fold={
 id:'fold-ending',
 initialState:{...mainShowdown.initialState,street:'flop',boardCount:3,currentBet:0,pendingActorIds:[0,2,5],
  seats:mainShowdown.initialState.seats.map(seat=>({...seat,stack:[0,2,5].includes(seat.id)?80:100,handCommitted:[0,2,5].includes(seat.id)?20:0,streetCommitted:0,dealtCount:[0,2,5].includes(seat.id)?2:0,revealed:false}))},
 events:[{type:'act',player:0,action:'bet',to:20},{type:'act',player:2,action:'fold'},{type:'act',player:5,action:'fold'},{type:'return',player:0,amount:20},{type:'award',player:0}],
};
const instruction=(symbol,text)=>({kind:'instruction',symbol,lines:[[{text,strong:true}]]});
const steps=[
 {id:'02-a',checkpoint:0,playTo:1,title:'카드로 이기면\n팟을 받아요.',body:'앞 레슨에서 투페어인 내가 이겼어요. 이번 판에 모인 칩을 ‘팟’이라고 해요. 가운데 180칩이 승자에게 이동하는 모습을 보세요.',mode:'승리 방법 1 · 카드 승부',nextLabel:'180칩 팟 받기 →',revealedSeatIds:[0,2,5],focus:{activeSeatIds:[0],activeLabel:'투페어 승리',pot:true,cardIds:['Qh','Qd','8s','8c','Jc']},visual:instruction('♠','끝까지 남아 좋은 5장으로 승부해요.')},
 {id:'02-a-result',checkpoint:1,replayFrom:'02-a',title:'이긴 내가\n180칩을 받았어요.',body:'카드로 이기는 예시는 끝났어요. 이제 다른 판에서, 카드 비교 없이 이기는 모습을 볼게요.',mode:'승리 방법 1 · 카드 승부',nextLabel:'다른 판의 승리 방법 보기 →',success:true,revealedSeatIds:[0,2,5],focus:{activeSeatIds:[0],activeLabel:'팟 180칩 받음'},visual:instruction('✓','팟 180칩 → 내 남은 칩 230')},
 {id:'02-b',scenarioId:'fold',checkpoint:0,playTo:3,title:'모두 폴드하면\n어떻게 될까요?',body:'이번에는 다른 판의 플랍이에요. 공용카드 3장과 세 사람이 20칩씩 모은 팟 60칩에서 시작해요. 내가 20칩을 베팅한 뒤, 상대 둘이 이번 판을 포기하는 ‘폴드’를 하는 모습을 보세요.',mode:'승리 방법 2 · 모두 폴드',nextLabel:'베팅과 폴드 보기 →',visual:instruction('↘','폴드한 사람은 이번 판의 승부에서 빠져요.')},
 {id:'02-b-question',scenarioId:'fold',checkpoint:3,replayFrom:'02-b',title:'끝까지 남은 사람은\n누구인가요?',body:'상대 둘은 카드를 내려놓았어요. 이번 판에 아직 남아 있는 사람을 골라주세요.',mode:'승리 방법 2 · 모두 폴드',nextLabel:'남은 사람을 골라주세요',focus:{hintSeatIds:[0]},visual:{kind:'question'},question:{kind:'seat',options:[0,2,5],optionLabels:{0:'나',2:'플레이어 3',5:'플레이어 6'},acceptedAnswers:[0],hint:'폴드하지 않은 사람은 나 한 명이에요.',feedbackByAnswer:{default:'상대 둘은 폴드했어요. 카드를 내려놓지 않은 마지막 한 사람을 찾아보세요.'}}},
 {id:'02-c',scenarioId:'fold',checkpoint:3,playTo:5,title:'카드 공개 없이\n팟을 받아요.',body:'상대가 모두 폴드해서 내가 이겼어요. 함께 모은 팟 60칩이 내 자리로 오는 모습을 보세요.',mode:'승리 방법 2 · 모두 폴드',nextLabel:'칩 받는 모습 보기 →',focus:{activeSeatIds:[0],activeLabel:'마지막 생존자'},visual:instruction('♠','카드를 비교할 상대가 없으면 바로 이겨요.')},
 {id:'02-c-question',scenarioId:'fold',checkpoint:5,replayFrom:'02-c',title:'이때 카드를 꼭\n보여줘야 할까요?',body:'공용카드를 더 펼치거나 개인카드를 공개하지 않았어요. 상대가 모두 폴드한 이 상황에서는 카드 공개가 필요할까요?',mode:'승리 방법 2 · 모두 폴드',nextLabel:'답을 골라주세요',focus:{activeSeatIds:[0],activeLabel:'팟 60칩 받음'},visual:{kind:'question'},question:{kind:'choice',options:['yes','no'],optionLabels:{yes:'네, 보여줘야 해요',no:'아니요, 필요 없어요'},acceptedAnswers:['no'],hint:'승부할 상대가 한 명도 남지 않았어요.',feedbackByAnswer:{default:'모두 폴드하면 카드의 강함을 비교할 필요가 없어요. 카드를 공개하지 않고 팟을 받아요.'}}},
 {id:'02-complete',scenarioId:'fold',checkpoint:5,title:'이기는 방법은\n두 가지예요.',body:'카드로 이기거나, 상대가 모두 폴드해서 이겨요. 상대가 한 명이라도 남아 있다면 아직 카드 승부나 행동이 남아요.',mode:'레슨 완료',nextLabel:'이 레슨 다시 연습 ↻',success:true,visual:{kind:'recap',items:[{title:'카드 승부',text:' · 끝까지 남아 좋은 5장으로 이겨요'},{title:'모두 폴드',text:' · 나만 남으면 카드 공개 없이 이겨요'},{title:'팟',text:' · 이번 판에 모인 칩을 승자가 받아요'}]}},
];
export const twoWays={id:'02',completionStepId:'02-complete',scenario:showdown,scenarios:{showdown,fold},steps:steps.map((step,i)=>({keepModeVisible:step.id!=='02-complete',phase:'이기는 두 가지 방법',tableMode:'outcome-preview',revealedSeatIds:[],stepLabel:`${[1,1,2,2,3,3,4][i]} / 4`,nextId:steps[(i+1)%steps.length].id,...step,focus:{activeSeatIds:[],activeLabel:'',hintSeatIds:[],labels:{},direction:null,...step.focus}}))};
