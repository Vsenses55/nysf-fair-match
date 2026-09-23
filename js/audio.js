/* ==========================================================================
   SOUND — lightweight Web Audio synth for swap feedback + an ambient
   fairground music-box loop. Everything here is synthesized (oscillators +
   gain envelopes) rather than loaded from audio files, so there's nothing
   to source, license, or fetch.
   ========================================================================== */

const Sound = (() => {
  let ctx = null;
  let masterGain = null;
  let ambientStarted = false;
  let ambientTimer = null;
  let melodyIndex = 0;

  // Simple major-scale music-box phrase, repeats and drifts in octave a bit
  // to avoid feeling too mechanical.
  const MELODY = [784, 659, 587, 523, 587, 659, 784, 880, 784, 659, 523, 440];

  function ensureContext() {
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    const c = ensureContext();
    if (c.state === "suspended") c.resume();
    return c;
  }

  function tone({ freq, start, duration, type = "sine", gain = 0.2 }) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playHover() {
    const c = resume();
    const t = c.currentTime;
    tone({ freq: 880, start: t, duration: 0.06, type: "sine", gain: 0.05 });
  }

  function playSuccess() {
    const c = resume();
    const t = c.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5 — cheerful little arpeggio
    notes.forEach((f, i) => tone({ freq: f, start: t + i * 0.06, duration: 0.16, type: "triangle", gain: 0.16 }));
  }

  function playFail() {
    const c = resume();
    const t = c.currentTime;
    tone({ freq: 165, start: t, duration: 0.14, type: "square", gain: 0.1 });
    tone({ freq: 110, start: t + 0.08, duration: 0.18, type: "square", gain: 0.09 });
  }

  function scheduleAmbientNote() {
    const t = ctx.currentTime + 0.05;
    const freq = MELODY[melodyIndex % MELODY.length];
    melodyIndex++;
    tone({ freq, start: t, duration: 0.55, type: "sine", gain: 0.03 });
    tone({ freq: freq / 2, start: t, duration: 0.9, type: "sine", gain: 0.018 }); // soft pad underneath
  }

  function startAmbient() {
    if (ambientStarted) return;
    ambientStarted = true;
    resume();
    scheduleAmbientNote();
    ambientTimer = setInterval(scheduleAmbientNote, 650);
  }

  function stopAmbient() {
    if (ambientTimer) clearInterval(ambientTimer);
    ambientTimer = null;
    ambientStarted = false;
  }

  // Plain <audio> playback for sourced sound-file tests (everything else in
  // this module is synthesized). Deliberately keeps playing across screen
  // changes — those are just show/hide of divs, not page navigation — since
  // the whole point of this test is a sound that carries into the next
  // screen rather than cutting off.
  const clips = {};
  function playClip(src, { volume = 1 } = {}) {
    let clip = clips[src];
    if (!clip) {
      clip = new Audio(src);
      clips[src] = clip;
    }
    clip.volume = volume;
    clip.currentTime = 0;
    clip.play().catch(() => {});
    return clip;
  }

  return { resume, playHover, playSuccess, playFail, startAmbient, stopAmbient, playClip };
})();
