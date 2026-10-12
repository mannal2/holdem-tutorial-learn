import React, { useEffect, useRef, useState } from 'react';
import { lessonCatalog } from './lessons/index.js';

export default function LessonPicker({ lesson, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const resetRef = useRef(null);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    closeRef.current.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  function keepFocusInside(event) {
    if (event.key !== 'Tab') return;
    const buttons = [...dialogRef.current.querySelectorAll('button:not(:disabled)')];
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  function choose(id) {
    if (lesson.goToLesson(id)) onClose();
  }
  function cancelReset() {
    setConfirming(false);
    requestAnimationFrame(() => resetRef.current?.focus());
  }
  return <dialog className="lesson-picker" ref={dialogRef} aria-labelledby="picker-title" onKeyDown={keepFocusInside} onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="picker-header"><h2 id="picker-title">레슨 선택</h2><button ref={closeRef} className="picker-close" onClick={onClose}>닫기</button></div>
    <div className="picker-body">
      <p className="picker-intro">준비된 수업을 골라보세요.</p>
      <div className="picker-list">
        {lessonCatalog.map(item => {
          const available = Boolean(item.definition);
          const current = lesson.lessonId === item.id;
          const completed = lesson.savedProgress.completedLessonIds.includes(item.id);
          return <button key={item.id} data-lesson-id={item.id} className={`lesson-row${current ? ' current' : ''}`} disabled={!available} onClick={() => choose(item.id)}>
            <span className="picker-number">{item.id === 'prototype' ? '체험' : item.id}</span>
            <span className="picker-copy"><strong>{item.title}</strong>{item.description && <small>{item.description}</small>}{current && <small className="picker-current">현재 수업 · 처음부터 보기</small>}</span>
            <span className="picker-status">{!available ? '준비 중' : completed ? '✓ 완료' : '열기'}</span>
          </button>;
        })}
      </div>
    </div>
    <div className="picker-footer">
      {confirming ? <div className="reset-confirm" role="group" aria-label="진도 초기화 확인"><p>저장된 진도와 완료 표시를 모두 지울까요?</p><div><button className="secondary" onClick={cancelReset}>취소</button><button className="primary" autoFocus onClick={() => { lesson.resetProgress(); onClose(); }}>초기화</button></div></div>
        : <button ref={resetRef} className="reset-progress" onClick={() => setConfirming(true)}>진도 초기화</button>}
    </div>
  </dialog>;
}
