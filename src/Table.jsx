import React from 'react';
import ActionEffect from './ActionEffect.jsx';
import DirectionArrow from './DirectionArrow.jsx';

const suits = { s: ['♠','스페이드'], h: ['♥','하트'], d: ['♦','다이아몬드'], c: ['♣','클럽'] };
const faces = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

export function cardLabel(card) { return `${suits[card.suit][1]} ${faces[card.rank] ?? card.rank}`; }

export function PlayingCard({ dealt, revealed, card, cardRef, focused = false }) {
  if (!dealt) return <span ref={cardRef} className="card empty" aria-hidden="true" />;
  if (!revealed) return <span ref={cardRef} className="card back" aria-label="뒷면 카드" />;
  const [symbol, suitName] = suits[card.suit];
  const rank = faces[card.rank] ?? card.rank;
  return <span ref={cardRef} className={`card face${card.suit === 'h' || card.suit === 'd' ? ' red' : ''}${focused ? ' focused' : ''}`} aria-label={`${suitName} ${rank}`}><span className="card-content"><span className="card-rank">{rank}</span><span className="card-suit">{symbol}</span></span></span>;
}

function PlayerSeat({ seat, lesson, elements, preview }) {
  const { step, table, lastRecipient, hinted, busy, answer, action } = lesson;
  const i = seat.id;
  const active = action ? i === action.player : i === lastRecipient || step.focus.activeSeatIds.includes(i);
  const label = action?.player === i ? action.label : i === lastRecipient ? '카드 받는 중' : active ? step.focus.activeLabel : step.focus.labels[i] ?? (seat.status === 'folded' ? '폴드' : '');
  const hint = hinted && step.focus.hintSeatIds.includes(i);
  const badge = preview || step.tableMode === 'outcome-preview' ? null : i === table.smallBlindId ? 'SB' : i === table.bigBlindId ? 'BB' : i === table.buttonId ? 'BTN' : null;
  return <div className={`seat seat-${i} ${active ? 'active' : ''} ${seat.status === 'folded' ? 'folded' : ''} ${hint ? 'hinted' : ''} ${i === lastRecipient ? 'flash' : ''} ${preview && !step.focus.compareSeatIds.includes(i) ? 'muted' : ''}`}>
    <div className="hole-cards">
      {label && <span className="seat-label">{label}</span>}
      {[0,1].map(n => <PlayingCard key={`${i}-${n}`} card={seat.hole[n]} focused={step.focus.cardIds?.includes(seat.hole[n].id)} cardRef={node => { elements.current.targets[i * 2 + n] = node; }} dealt={n < seat.dealtCount} revealed={seat.revealed} />)}
    </div>
    <button id={`seat-${i}`} className="seat-button" data-seat={i} onClick={() => answer(i)} disabled={busy || step.question?.kind !== 'seat' || Boolean(step.question.options && !step.question.options.includes(i))} aria-label={`${seat.name}${badge ? ` ${badge === 'BTN' ? '버튼' : badge}` : ''} 선택`}>
      <strong>{seat.name}{i === table.userId ? ' · 내 자리' : ''}</strong><small hidden={preview} ref={node => { elements.current.sources[i] = node; }}>남은 칩 {seat.stack}</small>
      {badge && <span className={`position-badge ${badge === 'BB' ? 'bb' : badge === 'BTN' ? 'btn' : ''}`}>{badge}</span>}
    </button>
    <span className="bet" style={{visibility:!preview && seat.streetCommitted > 0 ? 'visible' : 'hidden'}}><i className="chip" aria-hidden="true" ref={node => { elements.current.bets[i] = node; }} />{seat.streetCommitted}</span>
    <ActionEffect index={i} elements={elements} />
  </div>;
}

export default function Table({ lesson, elements }) {
  const { step, table, hinted, busy } = lesson;
  const preview = step.tableMode === 'hand-preview';
  const outcome = step.tableMode === 'outcome-preview';
  const arrow = step.focus.direction;
  const direction = arrow && (!arrow.onHint || hinted) ? arrow : null;
  const boardCaption = table.boardCount ? `공용카드 ${table.boardCount}장` : '공용카드는 아직 없어요';
  return <section className={`table-panel${preview ? ' hand-preview' : outcome ? ' outcome-preview' : ''}`} aria-label={`${table.seats.length}인 홀덤 테이블`}>
    <div className="table-heading"><span><i className="status-dot" /> <span id="table-phase">{busy && step.playingPhase ? step.playingPhase : step.phase}</span></span><span>{preview ? '개인 2장 · 공용 5장' : outcome ? '승부와 팟 지급' : <>{`${table.seats.length}인 테이블 `}<b>·</b>{` SB ${table.smallBlind} / BB ${table.bigBlind}`}</>}</span></div>
    <div className="table-stage" id="table-stage">
      <div className="felt"><div className="felt-stitch" /></div>
      <DirectionArrow direction={direction} layoutKey={lesson.stepId} />
      <div className="table-center">{!preview && <div className={`pot${step.focus.pot ? ' focused' : ''}`} ref={node => { elements.current.pot = node; }}><span>전체 팟</span><strong id="pot">{table.potTotal}</strong><span className="pot-unit">칩</span></div>}<div className={`board${step.focus.intro ? ' intro-highlight' : ''}`} aria-label={table.boardCount ? boardCaption : '아직 공용카드가 없습니다'}>{[0,1,2,3,4].map(i => i < table.boardCount ? <PlayingCard key={i} dealt revealed card={table.board[i]} focused={step.focus.cardIds?.includes(table.board[i].id)} /> : <i key={i} />)}</div></div>
      <div id="seats">{table.seats.map(seat => <PlayerSeat key={seat.id} seat={seat} lesson={lesson} elements={elements} preview={preview} />)}</div>
      <div className="deck" hidden={preview || outcome || step.hideDeck} aria-hidden="true" ref={node => { elements.current.deck = node; }}><span>♠</span></div>
      <span className="flying-card" id="flying-card" style={{display:'block',opacity:0}} aria-hidden="true" ref={node => { elements.current.flight = node; }} />
    </div>
  </section>;
}
