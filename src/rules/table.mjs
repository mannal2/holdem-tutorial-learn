// Supports only the scripted events implemented by the available lessons.
export function applyEvent(state, event) {
 const seat=state.seats.find(player=>player.id===event.player);
 if(!seat)throw new Error('Unknown player');
 const potTotal=state.seats.reduce((sum,player)=>sum+player.handCommitted,0);
 if(event.type==='deal'){
  if(event.slot!==seat.dealtCount||event.slot>=seat.hole.length)throw new Error('Invalid card slot');
  return {...state,potTotal,seats:state.seats.map(player=>player.id===seat.id?{...player,dealtCount:player.dealtCount+1}:player)};
 }
 if(event.type==='return'){
  const otherMax=Math.max(...state.seats.filter(p=>p.id!==seat.id).map(p=>p.handCommitted));
  if(state.seats.filter(p=>p.status==='active').length!==1||seat.status!=='active'||event.amount!==seat.handCommitted-otherMax||event.amount<=0||event.amount>seat.streetCommitted)throw new Error('Invalid unmatched return');
  return {...state,potTotal:potTotal-event.amount,seats:state.seats.map(p=>p.id===seat.id?{...p,stack:p.stack+event.amount,handCommitted:p.handCommitted-event.amount,streetCommitted:p.streetCommitted-event.amount}:p)};
 }
 if(event.type==='award'){
  const active=state.seats.filter(p=>p.status==='active');
  if(seat.status!=='active'||potTotal<=0||state.pendingActorIds.length||(active.length>1&&state.street!=='showdown')||Math.max(...state.seats.map(p=>p.handCommitted))>Math.max(...state.seats.filter(p=>p.id!==seat.id).map(p=>p.handCommitted)))throw new Error('Invalid pot award');
  return {...state,potTotal:0,seats:state.seats.map(p=>({...p,stack:p.stack+(p.id===seat.id?potTotal:0),handCommitted:0,streetCommitted:0}))};
 }
 if(event.type!=='act'||!['call','check','bet','fold'].includes(event.action))throw new Error('Unsupported event');
 if(state.pendingActorIds[0]!==seat.id||seat.status!=='active')throw new Error('Invalid player action');
 if(event.action==='fold')return {...state,potTotal,pendingActorIds:state.pendingActorIds.slice(1),seats:state.seats.map(p=>p.id===seat.id?{...p,status:'folded',dealtCount:0,revealed:false}:p)};
 const amount=event.to-seat.streetCommitted;
 const bet=event.action==='bet';
 if(amount<0||amount>seat.stack||(bet?(state.currentBet!==0||event.to<state.bigBlind):event.to!==state.currentBet)||(event.action==='check'?amount!==0:amount===0))throw new Error('Invalid player action');
 return {...state,potTotal:potTotal+amount,currentBet:bet?event.to:state.currentBet,pendingActorIds:state.pendingActorIds.slice(1),seats:state.seats.map(p=>p.id===seat.id?{...p,stack:p.stack-amount,streetCommitted:event.to,handCommitted:p.handCommitted+amount}:p)};
}
