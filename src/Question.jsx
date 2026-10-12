import React, { useState } from 'react';
import HandFocus from './HandFocus.jsx';

export default function Question({ lesson }) {
  const {step,table,answer,busy}=lesson;
  const question=step.question;
  const fixed=question.fixedCardIds??[];
  const [selected,setSelected]=useState(()=>[...fixed]);
  if(question.kind==='cards') {
    function toggle(id) {
      setSelected(current=>{
        if(current.includes(id))return current.filter(card=>card!==id);
        if(question.selectionSize-fixed.length===1)return [...fixed,id];
        return current.length<question.selectionSize?[...current,id]:current;
      });
    }
    return <form id="lesson-card-question" onSubmit={event=>{event.preventDefault();answer(selected);}}>
      <HandFocus table={table} player={question.player} selectedIds={selected} selectableIds={question.options} onToggle={toggle} />
      <p className="selection-count" role="status">{selected.length} / {question.selectionSize}장 선택 <span>· {selected.length === question.selectionSize ? '선택 완료를 눌러 확인하세요' : '마지막 한 장을 눌러주세요'}</span></p>
    </form>;
  }
  return <div className="answer-options" aria-label="정답 선택">{question.options.map(value=><button className="answer-option" type="button" key={value} data-answer={value} disabled={busy} onClick={()=>answer(value)}>{question.optionLabels?.[value]??`${value}${question.unit??''}`}</button>)}</div>;
}
