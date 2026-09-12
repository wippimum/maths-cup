/* unaided.js — take any question and remove the scaffolding.

   Every level in this app walks a child through: do this bit, now this bit, now put it
   together. That is how a method is LEARNED, but it is not how he is asked in class,
   where a question arrives on its own and the first move has to come out of his own
   head. A child can look fluent all the way down a guided ladder and still stall on a
   bare question, because choosing where to start was never his job.

   unaidedFrom() takes a finished problem and keeps only its LAST step — the one that
   asks for the answer — so the question is presented whole. It deliberately reuses that
   step's own check, options and cards rather than inventing new ones: the step already
   knows exactly what counts as right, and a second implementation of that would be a
   second thing to get wrong.

   Only the prompt is replaced, because a final prompt usually refers back to work the
   child can no longer see ("now add the 3 extra pens: 15 + 3 = ?"). The full worked
   solution is moved behind the Hint and "why" buttons: help on request, not by default. */
(function (root) {
  const PROMPTS = {
    build: 'Work it out, then build the answer. No steps this time — you decide what to do first.',
    choose: 'Work it out, then tap everything that belongs. No steps this time — you decide what to do first.',
    pick: 'Work it out, then choose the answer. No steps this time — you decide what to do first.',
  };
  const WHY = 'In class a question arrives on its own. Nobody tells you which method to use, or what to do first — working that out IS the skill, and it is the one part that being walked through a question never makes you practise.\n\nIf you are stuck, ask for the hint: the whole method is still there. Using it is not cheating. Guessing is.';

  // Everything a player reads as the worked solution, best source first.
  function workingOf(prob) {
    const last = prob.steps[prob.steps.length - 1];
    if (last.longWay) return last.longWay;
    const lines = prob.steps.map((s) => s.resultText).filter(Boolean);
    return lines.length ? lines.join('\n') : '';
  }

  // Can this step stand on its own? A step with options or cards can. A step with
  // neither is a typed LINE — the equation topics work that way, each line transforming
  // the one above it — and on its own, with the lines above it gone, there is nothing
  // for the child to transform. Those questions are left guided.
  function isSelfContained(step) {
    if (!step) return false;
    if (step.pieces && step.pieces.length) return true;
    // two options is a coin toss, not a question
    return !!(step.pool && step.pool.length >= 3);
  }

  function unaidedFrom(prob) {
    if (!prob || !prob.steps || !prob.steps.length) return prob;
    const last = prob.steps[prob.steps.length - 1];
    // Take the wording from what the step actually OFFERS, not from its declared mode:
    // some steps carry no mode at all and the app falls back to cards for those.
    const mode = (last.pieces && last.pieces.length) ? 'build' : (last.multi ? 'choose' : 'pick');
    const working = workingOf(prob);
    // Copy the step, so the original problem is untouched and the check, pool, pieces,
    // distractors and solution all come across exactly as they were.
    const only = Object.assign({}, last, {
      key: 'answer',
      prompt: PROMPTS[mode] || PROMPTS.pick,
      hint: `The answer is ${prob.answer}.` + (working ? `\n\n${working}` : ''),
      why: WHY + (working ? `\n\nHere it is worked through:\n${working}` : ''),
      longWay: working,
      isAnswer: true,
    });
    return Object.assign({}, prob, { sig: `un:${prob.sig || prob.given}`, steps: [only] });
  }

  const api = { unaidedFrom, unaidedIsSelfContained: isSelfContained };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WAC = Object.assign(root.WAC || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
