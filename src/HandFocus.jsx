import React from 'react';
import { PlayingCard, cardLabel } from './Table.jsx';

export default function HandFocus({ table, player, selectedIds = [], selectableIds, onToggle, note }) {
  const seat=table.seats.find(item=>item.id===player);
  const groups=[{name:'내 개인카드 2장',cards:seat.hole},{name:'공용카드 5장',cards:table.board}];
  return <div className="hand-focus">
    {groups.map(group=><div className="hand-source" key={group.name}>
      <span className="source-title">{group.name}</span>
      <div className="focus-cards">{group.cards.map(card=>{
        const selected=selectedIds.includes(card.id);
        const className=`focus-card${selected?' selected':''}`;
        return selectableIds
          ? <button key={card.id} type="button" data-card-id={card.id} className={className} aria-label={`${cardLabel(card)} 선택`} aria-pressed={selected} disabled={!selectableIds.includes(card.id)} onClick={()=>onToggle(card.id)}><PlayingCard dealt revealed card={card} />{selected&&<span className="card-check" aria-hidden="true">✓</span>}</button>
          : <span key={card.id} data-card-id={card.id} className={className}><PlayingCard dealt revealed card={card} />{selected&&<span className="card-check" aria-hidden="true">✓</span>}</span>;
      })}</div>
    </div>)}
    {note&&<p className="hand-note">{note}</p>}
  </div>;
}

export function HandComparison({ table, hands }) {
  const cards=[...table.board,...table.seats.flatMap(seat=>seat.hole)];
  return <div className="hand-comparison">{hands.map(hand=><div className="comparison-hand" key={hand.player}>
    <strong>{hand.name}</strong><span className="comparison-name">{hand.hand}</span>
    <div className="comparison-cards">{hand.cardIds.map(id=><PlayingCard key={id} dealt revealed card={cards.find(card=>card.id===id)} />)}</div>
  </div>)}</div>;
}
