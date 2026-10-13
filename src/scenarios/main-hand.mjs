import { stateAt } from '../lesson-runtime.mjs';
import { prototypeScenario } from '../lessons/prototype.js';

const card = id => ({id, rank:'23456789TJQKA'.indexOf(id[0])+2, suit:id[1]});
const contributions = [50,10,50,10,10,50];

// Read-only preview of the main hand's showdown; no chips are paid here.
export const mainShowdown = {
  id: 'main-showdown-preview',
  initialState: {
    ...prototypeScenario.initialState,
    street: 'showdown', currentBet: 0, pendingActorIds: [],
    board: ['Qd','8c','2s','4h','Jc'].map(card), boardCount: 5,
    seats: prototypeScenario.initialState.seats.map((seat,i) => ({
      ...seat, stack:100-contributions[i], handCommitted:contributions[i], streetCommitted:0,
      dealtCount:2, revealed:false, status:[1,3,4].includes(i)?'folded':'active',
    })),
  },
  events: [], checkpoints: { showdown:0 },
};

// Beginning of the main hand, shared with subsequent lessons.
export const mainStart = {
  id:'main-start',
  initialState:{
    ...prototypeScenario.initialState,currentBet:0,
    seats:prototypeScenario.initialState.seats.map(seat=>({...seat,stack:100,streetCommitted:0,handCommitted:0})),
  },
  events:[
    {type:'post-blind',blind:'SB',player:0,to:5},
    {type:'post-blind',blind:'BB',player:1,to:10},
    ...prototypeScenario.events.filter(event=>event.type==='deal'),
    ...prototypeScenario.events.filter(event=>event.type==='act'),
  ],
  checkpoints:{start:0,blinds:2,firstRound:8,dealt:14,beforeSbCall:18,beforeBbCheck:19,preflopDone:20},
};

// Main hand at the next confirmed street; future cards stay hidden by boardCount.
export const mainFlop={
 id:'main-flop',initialState:{...stateAt(mainStart,mainStart.checkpoints.preflopDone),board:['Qd','8c','2s','4h','Jc'].map(card)},
 events:[{type:'collect-bets',street:'flop'},...[0,1,2].map(slot=>({type:'reveal-board',slot}))],
 checkpoints:{preflopDone:0,collected:1,flopStart:4},
};

// The main flop betting round, preserved for subsequent lessons.
export const mainFlopBetting={id:'main-flop-betting',initialState:stateAt(mainFlop,mainFlop.checkpoints.flopStart),events:[
 {type:'act',player:0,action:'check',to:0},{type:'act',player:1,action:'check',to:0},{type:'act',player:2,action:'bet',to:20},
 {type:'act',player:3,action:'fold'},{type:'act',player:4,action:'fold'},{type:'act',player:5,action:'call',to:20},
 {type:'act',player:0,action:'call',to:20},{type:'act',player:1,action:'fold'},
],checkpoints:{flopStart:0,afterUserCheck:1,afterBet:3,beforeUserCall:6,afterUserCall:7,flopDone:8}};
