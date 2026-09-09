// A soft, cinematic three-note chime for "Welcome to Sprout" moments —
// synthesized with the Web Audio API rather than an audio file, so
// there's no asset to license or ship.
//
// Browsers only let an AudioContext start/resume during a real user
// gesture. primeAudio() is called synchronously inside the click
// handler that kicks off a screen transition (before any setTimeout or
// router navigation); playWelcomeChime() runs later, once the "Welcome"
// screen has mounted, using the already-running context.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  ctx ??= new AudioCtor();
  return ctx;
}

export function primeAudio() {
  const audioCtx = getCtx();
  if (audioCtx?.state === "suspended") void audioCtx.resume();
}

export function playWelcomeChime() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") void audioCtx.resume();

  const now = audioCtx.currentTime;
  const notes = [
    { freq: 392.0, start: 0, dur: 1.5, gain: 0.85 }, // G4
    { freq: 587.33, start: 0.14, dur: 1.4, gain: 0.7 }, // D5
    { freq: 784.0, start: 0.3, dur: 1.7, gain: 0.55 }, // G5
  ];

  const master = audioCtx.createGain();
  master.gain.value = 0.14;
  const lowpass = audioCtx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 3000;
  master.connect(lowpass);
  lowpass.connect(audioCtx.destination);

  for (const { freq, start, dur, gain } of notes) {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const env = audioCtx.createGain();
    const t0 = now + start;
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + 0.09);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(env);
    env.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
}
