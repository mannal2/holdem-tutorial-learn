import { applyEvent } from './rules/table.mjs';
import { wait as animationWait, animationTiming } from './animation.mjs';
import { playerAction } from './player-action.mjs';

export function stateAt(scenario, eventCount) {
  if (!Number.isInteger(eventCount) || eventCount < 0 || eventCount > scenario.events.length) throw new Error('Invalid checkpoint');
  let state = structuredClone(scenario.initialState);
  for (const event of scenario.events.slice(0, eventCount)) state = applyEvent(state, event);
  return { ...state, potTotal: state.seats.reduce((sum, seat) => sum + seat.handCommitted, 0) };
}

export function getStep(lesson, stepId) {
  const step = lesson.steps.find(item => item.id === stepId);
  if (!step) throw new Error('Unknown lesson step');
  return step;
}

export function createLessonRuntime({ lesson, initialStepId, resolveLesson, playEvent, onChange = () => {}, onComplete = () => {}, wait = animationWait, reducedMotion = () => false }) {
  let stepId = initialStepId ?? lesson.steps[0].id;
  getStep(lesson, stepId);
  const fulfilled = new Set(lesson.steps.slice(0, lesson.steps.findIndex(item => item.id === stepId)).map(item => item.id));
  let completionNotified = false;
  let visit = 0;
  let playback = { busy: false, eventCount: null, lastRecipient: -1, action: null };
  let hinted = false;
  let feedback = '';
  let activeRun = null;
  const step = () => getStep(lesson, stepId);

  const scenario = () => step().scenarioId ? lesson.scenarios[step().scenarioId] : lesson.scenario;
  function getState() {
    const current = step();
    const entryTable = stateAt(scenario(), current.checkpoint);
    const table = playback.eventCount === null ? { ...entryTable } : stateAt(scenario(), playback.eventCount);
    table.seats = table.seats.map(seat => ({ ...seat, revealed: seat.revealed || (current.revealedSeatIds ?? []).includes(seat.id) }));
    const replayStep = getStep(lesson, current.replayFrom ?? current.id);
    const canReplay = current.id !== lesson.completionStepId && current.playTo === undefined && Boolean(current.replayFrom) && replayStep.playTo > replayStep.checkpoint && replayStep.playTo === current.checkpoint && replayStep.scenarioId === current.scenarioId;
    return { canReplay, lessonId: lesson.id, stepId, visit, step: current, table, entryTable, isFirstStep: current === lesson.steps[0], hinted, feedback, progress: (lesson.steps.indexOf(current) + 1) / lesson.steps.length, ...playback };
  }
  const emit = () => onChange(getState());
  function cancel() {
    activeRun?.abort();
    activeRun = null;
  }
  function notifyCompletion() {
    if (completionNotified || stepId !== lesson.completionStepId) return;
    const required = lesson.steps.filter(item => item.required || item.question || item.playTo !== undefined);
    if (required.every(item => fulfilled.has(item.id))) {
      completionNotified = true;
      onComplete(lesson.id);
    }
  }
  function go(id) {
    getStep(lesson, id);
    cancel();
    stepId = id;
    visit++;
    playback = { busy: false, eventCount: null, lastRecipient: -1, action: null };
    hinted = false;
    feedback = '';
    emit();
    notifyCompletion();
  }
  function goToLesson(id) {
    const definition = resolveLesson ? resolveLesson(id) : id === lesson.id ? lesson : null;
    if (!definition) return false;
    cancel();
    lesson = definition;
    fulfilled.clear();
    completionNotified = false;
    go(lesson.steps[0].id);
    return true;
  }
  async function play(replayStep = null) {
    if (activeRun) return;
    const current = replayStep ?? step();
    const eventScenario = scenario();
    const controller = new AbortController();
    activeRun = controller;
    const { signal } = controller;
    const reduced = reducedMotion();
    let eventCount = current.checkpoint;
    playback = { busy: true, eventCount, lastRecipient: -1, action: null };
    emit();
    try {
      while (eventCount < current.playTo) {
        const event = eventScenario.events[eventCount];
        const state = stateAt(eventScenario, eventCount);
        const action = event.type === 'post-blind' ? {...playerAction(event.player, 'blind', state.seats.find(seat=>seat.id===event.player).streetCommitted, event.to),label:`${event.blind} · ${event.to}칩`} : event.type === 'act' ? playerAction(event.player, event.action, state.seats.find(seat => seat.id === event.player).streetCommitted, event.to ?? state.seats.find(seat => seat.id === event.player).streetCommitted) : ['return','award'].includes(event.type) ? {player:event.player,type:event.type,label:event.type === 'return' ? `${event.amount}칩 돌아옴` : `팟 ${state.potTotal}칩 받음`} : null;
        if (action) {
          playback = { busy: true, eventCount, lastRecipient: -1, action };
          emit();
          await wait(reduced ? animationTiming.reduced : animationTiming.actionLead, signal);
        }
        signal.throwIfAborted();
        const cleanup = await playEvent(event, action, signal, reduced);
        try {
          signal.throwIfAborted();
          eventCount++;
          playback = { busy: true, eventCount, lastRecipient: event.type === 'deal' ? event.player : -1, action };
          emit();
          await wait(reduced ? animationTiming.reduced : action ? animationTiming.actionPause : animationTiming.cardPause, signal);
        } finally {
          if (typeof cleanup === 'function') cleanup();
        }
      }
      signal.throwIfAborted();
      if (replayStep) {
        activeRun = null;
        playback = { busy:false, eventCount:null, lastRecipient:-1, action:null };
        emit();
      } else {
        fulfilled.add(current.id);
        go(current.nextId);
      }
    } catch (error) {
      if (!signal.aborted) {
        cancel();
        playback = { busy: false, eventCount: null, lastRecipient: -1, action: null };
        feedback = '재생을 마치지 못했어요. 다시 보기를 눌러주세요.';
        emit();
        console.error(error);
      }
    }
  }
  function next() {
    if (activeRun || step().question) return;
    if (step().playTo !== undefined) return play();
    const current = step();
    if (current.id === lesson.completionStepId) { fulfilled.clear(); completionNotified = false; }
    fulfilled.add(current.id);
    go(current.nextId);
  }
  function previous() {
    const index = lesson.steps.indexOf(step());
    go(lesson.steps[Math.max(0, index - 1)].id);
  }
  function replay() {
    if (activeRun || !getState().canReplay) return;
    return play(getStep(lesson, step().replayFrom));
  }
  function answer(value) {
    const question = step().question;
    if (activeRun || !question) return;
    const accepted = question.kind === 'cards'
      ? Array.isArray(value) && new Set(value).size === value.length && question.acceptedAnswers.some(ids => ids.length === value.length && ids.every(id => value.includes(id)))
      : question.acceptedAnswers.includes(value);
    if (accepted) { fulfilled.add(stepId); go(step().nextId); return; }
    hinted = true;
    feedback = question.kind === 'cards' && Array.isArray(value) && value.length !== question.selectionSize
      ? question.incompleteFeedback
      : question.feedbackByAnswer[value] ?? question.feedbackByAnswer.default;
    emit();
  }
  function hint() {
    if (!step().question || activeRun) return;
    hinted = true;
    feedback = step().question.hint;
    emit();
  }
  function stop() { if (activeRun) go(stepId); }
  return { getState, go, goToLesson, next, previous, replay, answer, hint, stop, dispose: cancel };
}
