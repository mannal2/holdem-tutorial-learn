import { firstLesson, getLesson } from './lessons/index.js';

export const PROGRESS_KEY = 'holdem-tutorial:progress:v1';
const initialProgress = () => ({ version: 1, lessonId: firstLesson.id, stepId: firstLesson.steps[0].id, completedLessonIds: [], reviewLessonIds: [] });

function normalizeProgress(value) {
  if (!value || value.version !== 1 || typeof value.lessonId !== 'string') return initialProgress();
  const requestedLesson = getLesson(value.lessonId);
  const lesson = requestedLesson ?? firstLesson;
  const validIds = ids => Array.isArray(ids) ? [...new Set(ids.filter(id => typeof id === 'string' && getLesson(id)))] : [];
  return {
    version: 1, lessonId: lesson.id,
    stepId: requestedLesson && lesson.steps.some(step => step.id === value.stepId) ? value.stepId : lesson.steps[0].id,
    completedLessonIds: validIds(value.completedLessonIds),
    reviewLessonIds: validIds(value.reviewLessonIds),
  };
}
export function readProgress(storage) {
  try { return normalizeProgress(JSON.parse(storage?.getItem(PROGRESS_KEY) ?? 'null')); }
  catch { return initialProgress(); }
}
export function writeProgress(storage, value) {
  try {
    if (!storage) return false;
    storage.setItem(PROGRESS_KEY, JSON.stringify(normalizeProgress(value)));
    return true;
  } catch { return false; }
}
