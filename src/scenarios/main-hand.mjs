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
