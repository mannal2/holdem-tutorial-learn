import React, { useCallback, useRef, useState } from 'react';
import { useLesson } from './useLesson.js';
import { playCardFlight, playPlayerAction, playOutcomeEvent } from './animation.mjs';
import Table from './Table.jsx';
import LessonPanel from './LessonPanel.jsx';
import LessonPicker from './LessonPicker.jsx';

export default function App() {
  const elements = useRef({deck:null, flight:null, targets:[], sources:[], bets:[], effects:[], pot:null});
  const playCard = useCallback((recipient, slot, signal, reducedMotion) => playCardFlight({
    card:elements.current.flight, source:elements.current.deck,
    target:elements.current.targets[recipient * 2 + slot], signal, reducedMotion,
  }), []);
  const playAction = useCallback((action, signal, reducedMotion) => playPlayerAction({
    action, signal, reducedMotion, source: elements.current.sources[action.player],
    target: elements.current.bets[action.player], effect: elements.current.effects[action.player], cards:elements.current.targets.slice(action.player*2,action.player*2+2),
  }), []);
  const playOutcome = useCallback((event, signal, reducedMotion) => playOutcomeEvent({
    event, signal, reducedMotion, source:event.type === 'award' ? elements.current.pot : elements.current.bets[event.player],
    target:elements.current.sources[event.player], effect:elements.current.effects[event.player],
  }), []);
  const lesson = useLesson(playCard, playAction, playOutcome);
  const [pickerOpen, setPickerOpen] = useState(false);
  function openPicker() { lesson.stop(); setPickerOpen(true); }
  return <main className="learning-page">
    <div className="lesson-layout"><Table lesson={lesson} elements={elements} /><LessonPanel lesson={lesson} pickerOpen={pickerOpen} onOpenPicker={openPicker} /></div>
    {pickerOpen && <LessonPicker lesson={lesson} onClose={() => setPickerOpen(false)} />}
  </main>;
}
