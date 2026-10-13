import { useEffect, useRef, useState } from 'react';
import { createLessonRuntime } from './lesson-runtime.mjs';
import { firstLesson, getLesson } from './lessons/index.js';
import { readProgress, writeProgress } from './progress.mjs';

export function useLesson(playCard, playAction, playOutcome) {
  const [boot] = useState(() => {
    let storage = null;
    try { storage = window.localStorage; } catch { /* Learning also works without browser storage. */ }
    return { storage, progress: readProgress(storage) };
  });
  const saved = useRef(boot.progress);
  const [savedProgress, setSavedProgress] = useState(boot.progress);
  function persist(value) {
    saved.current = value;
    setSavedProgress(value);
    writeProgress(boot.storage, value);
  }
  const [runtime] = useState(() => createLessonRuntime({
    lesson: getLesson(boot.progress.lessonId), initialStepId: boot.progress.stepId, resolveLesson: getLesson,
    onChange: next => {
      setView(next);
      if (!next.busy) persist({ ...saved.current, lessonId: next.lessonId, stepId: next.stepId });
    },
    onComplete: id => persist({ ...saved.current, completedLessonIds: [...new Set([...saved.current.completedLessonIds, id])] }),
    reducedMotion: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    playEvent: (event, action, signal, reduced) => event.type === 'deal'
      ? playCard(event.player, event.slot, signal, reduced)
      : ['act','post-blind'].includes(event.type) ? playAction(action, signal, reduced) : playOutcome(event, signal, reduced),
  }));
  const [view, setView] = useState(() => runtime.getState());
  useEffect(() => {
    writeProgress(boot.storage, saved.current);
    const stopOnResize = () => runtime.stop();
    window.addEventListener('resize', stopOnResize);
    return () => {
      window.removeEventListener('resize', stopOnResize);
      runtime.dispose();
    };
  }, [runtime, boot]);
  function resetProgress() {
    persist(readProgress(null));
    runtime.goToLesson(firstLesson.id);
  }
  return { ...view, savedProgress, resetProgress, goToLesson: runtime.goToLesson, stop: runtime.stop, go: runtime.go, next: runtime.next, previous: runtime.previous, replay: runtime.replay, answer: runtime.answer, hint: runtime.hint };
}
