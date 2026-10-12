import React, { useEffect, useRef } from 'react';
import { getLessonLabel, getLesson, getNextLesson } from './lessons/index.js';
import HandFocus, { HandComparison } from './HandFocus.jsx';
import Question from './Question.jsx';

function LearningVisual({ lesson }) {
  const { step, answer, entryTable } = lesson;
  const visual = step.visual;
  if (visual.kind === 'hand') return <HandFocus table={lesson.table} player={visual.player} selectedIds={visual.selectedIds} note={visual.note} />;
  if (visual.kind === 'question') return <Question key={`${lesson.lessonId}:${lesson.stepId}:${lesson.visit}`} lesson={lesson} />;
  if (visual.kind === 'compare') return <><HandComparison table={lesson.table} hands={visual.hands} />{step.question && <Question key={`${lesson.lessonId}:${lesson.stepId}:${lesson.visit}`} lesson={lesson} />}</>;
  if (visual.kind === 'math') {
    const total = entryTable.currentBet;
    const paid = entryTable.seats.find(seat => seat.id === visual.player).streetCommitted;
    return <>
      <div className="math-card"><div className="math-row"><span>맞춰야 할 총액</span><b>{total}</b></div><div className="math-row"><span>내가 이미 낸 금액</span><b>{paid}</b></div><div className="math-row"><span>추가로 낼 금액</span><b>{visual.showAnswer ? total - paid : '?'}</b></div></div>
      {step.question && <div className="amounts" aria-label="추가 콜 금액 선택">{step.question.options.map(value => <button key={value} data-amount={value} onClick={() => answer(value)} aria-label={`${value}칩 추가`}>{value}<small>칩</small></button>)}</div>}
    </>;
  }
  if (visual.kind === 'recap') return <ul className="recap">{visual.items.map(item => <li key={item.title}><strong>{item.title}</strong>{item.text}</li>)}</ul>;
  return <div className="instruction"><span className="instruction-symbol" aria-hidden="true">{visual.symbol}</span><span>{visual.lines.map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line.map((part, j) => part.strong ? <strong key={j}>{part.text}</strong> : <React.Fragment key={j}>{part.text}</React.Fragment>)}</React.Fragment>)}</span></div>;
}

export default function LessonPanel({ lesson, pickerOpen, onOpenPicker }) {
  const { stepId, step, progress, busy, feedback, answer, hint, previous, next, replay } = lesson;
  const complete = stepId === getLesson(lesson.lessonId)?.completionStepId;
  const nextLesson = complete ? getNextLesson(lesson.lessonId) : undefined;
  const cardQuestion = step.question?.kind === 'cards';
  const titleRef = useRef(null);
  const previousStep = useRef(stepId);
  useEffect(() => {
    if (previousStep.current !== stepId) titleRef.current?.focus({preventScroll:true});
    previousStep.current = stepId;
  }, [stepId]);
  return <aside className="lesson-panel" aria-label="수업 설명">
    <div className="lesson-eyebrow"><button id="lesson-select" className="lesson-selector" aria-label="레슨 선택" aria-haspopup="dialog" aria-expanded={pickerOpen} onClick={onOpenPicker}><span id="chapter-label">{getLessonLabel(lesson.lessonId)}</span><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></button><span id="step-count">{step.stepLabel}</span></div>
    <div className="panel-content">
      <span className="mode-label" id="mode-label">{step.mode}</span>
      <h1 id="title" tabIndex={-1} ref={titleRef}>{step.title}</h1>
      <p className="description" id="description">{step.body}</p>
      <div id="learning-visual"><LearningVisual lesson={lesson} /></div>
      <div id="feedback" className={`feedback ${step.success ? 'success' : ''}`} role="status" aria-live="polite">{feedback}</div>
      <button id="hint" className="text-button" onClick={hint} hidden={!step.question || busy}>힌트 보기 <span>↗</span></button>
    </div>
    <div className="panel-footer">
      <div className="progress-track"><span id="progress" style={{width:`${progress * 100}%`}} /></div>
      <div className="nav-buttons"><button id="previous" className="secondary" aria-label="이전 단계" disabled={lesson.isFirstStep} onClick={previous}>← 이전</button><button id="next" className="primary" type={cardQuestion ? 'submit' : 'button'} form={cardQuestion ? 'lesson-card-question' : undefined} disabled={busy || Boolean(step.question && !cardQuestion)} onClick={cardQuestion ? undefined : nextLesson ? () => lesson.goToLesson(nextLesson.id) : next}>{busy ? '진행 중…' : nextLesson ? `다음 레슨: ${nextLesson.title} →` : step.nextLabel}</button></div>
      {nextLesson && <button id="restart-lesson" className="replay" onClick={() => lesson.goToLesson(lesson.lessonId)}>이 레슨 다시 연습 ↻</button>}
      {lesson.canReplay && <button id="replay" className="replay" disabled={busy} onClick={replay}>{busy ? '↻ 다시 보는 중…' : '↻ 애니메이션 다시 보기'}</button>}
    </div>
  </aside>;
}
