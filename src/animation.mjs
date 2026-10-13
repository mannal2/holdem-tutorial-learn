// Shared learning pace for every lesson (milliseconds).
export const animationTiming = Object.freeze({
  cardFlight:360, chipFlight:450, fold:520, check:760, knockRipple:220,
  actionLead:220, actionPause:330, cardPause:200, turnPreview:450, reduced:60,
});

// Animation timing is separate from lesson state. All playback honors AbortSignal.
export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}

// Replace only this visual implementation with Motion/GSAP if desired.
// Resolve on completion, reject on cancellation; never mutate lesson state here.
export async function playCardFlight({ card, source, target, reducedMotion, signal }) {
  signal.throwIfAborted();
  if (reducedMotion) { await wait(animationTiming.reduced, signal); return; }
  const start = source.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  const origin = card.getBoundingClientRect();
  const animation = card.animate([
    { transform: `translate(${start.x-origin.x}px,${start.y-origin.y}px) rotate(-12deg)`, width: `${start.width}px`, height: `${start.height}px`, opacity: 1 },
    { transform: `translate(${end.x-origin.x}px,${end.y-origin.y}px) rotate(0deg)`, width: `${end.width}px`, height: `${end.height}px`, opacity: 1 },
  ], { duration: animationTiming.cardFlight, easing: 'ease-out' });
  const abort = () => animation.cancel();
  signal.addEventListener('abort', abort, { once: true });
  try { await animation.finished; signal.throwIfAborted(); }
  finally { signal.removeEventListener('abort', abort); animation.cancel(); }
}

// Shared bet/call/raise/check presentation. Amounts are committed by the caller
// only after this resolves; cancellation leaves the lesson's snapshot intact.
export async function playPlayerAction({ action, source, target, effect, cards, signal, reducedMotion }) {
  signal.throwIfAborted();
  if (reducedMotion) { await wait(animationTiming.reduced, signal); return; }
  const animations = [];
  let held = false;
  const abort = () => animations.forEach(animation => animation.cancel());
  const cleanup = () => { signal.removeEventListener('abort', abort); abort(); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    if (action.type === 'fold') {
      for (const card of cards) animations.push(card.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(16px) scale(.9)'}],{duration:animationTiming.fold,easing:'ease-in',fill:'forwards'}));
    } else if (action.type === 'check') {
      const hand = effect.querySelector('.check-hand');
      const ring = effect.querySelector('.knock-ring');
      // Two distinct downstrokes, synchronized with the contact ripples.
      animations.push(hand.animate([
        {opacity:0,transform:'translateY(-9px)'},
        {opacity:1,transform:'translateY(-9px)',offset:.12},
        {opacity:1,transform:'translateY(1px)',offset:.28},
        {opacity:1,transform:'translateY(-8px)',offset:.45},
        {opacity:1,transform:'translateY(1px)',offset:.66},
        {opacity:1,transform:'translateY(-6px)',offset:.82},
        {opacity:0,transform:'translateY(-6px)'},
      ], {duration:animationTiming.check,easing:'ease-in-out'}));
      for (const contact of [.28,.66]) animations.push(ring.animate([
        {opacity:.8,transform:'scale(.4)'},{opacity:0,transform:'scale(1.4)'},
      ], {duration:animationTiming.knockRipple,delay:animationTiming.check*contact,easing:'ease-out'}));
    } else {
      const chip = effect.querySelector('.action-chip');
      const origin = chip.getBoundingClientRect();
      const start = source.getBoundingClientRect();
      const end = target.getBoundingClientRect();
      const at = rect => `translate(${rect.x+rect.width/2-origin.x-origin.width/2}px,${rect.y+rect.height/2-origin.y-origin.height/2}px)`;
      animations.push(chip.animate([
        {opacity:1,transform:at(start)},{opacity:1,transform:at(end)},
      ], {duration:animationTiming.chipFlight,easing:'cubic-bezier(.2,.7,.3,1)'}));
    }
    await Promise.all(animations.map(animation => animation.finished));
    signal.throwIfAborted();
    if (action.type === 'fold') {
      // Hold the invisible cards until React commits the folded state.
      held = true;
      return cleanup;
    }
  } finally { if (!held) cleanup(); }
}

// Return and pot award share the same chip flight, with reversed endpoints.
export function playOutcomeEvent({event, source, target, effect, signal, reducedMotion}) {
  return playPlayerAction({action:{type:event.type},source,target,effect,signal,reducedMotion});
}
