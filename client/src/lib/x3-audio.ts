/**
 * X3 AUDIO ENGINE — Sistema de sonidos Web Audio API
 * Genera sonidos sintéticos sin archivos externos.
 * Todos los sonidos son generados en tiempo real con osciladores.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gainValue = 0.12,
  fadeOut = true
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silencioso si el navegador bloquea audio
  }
}

function playSequence(notes: Array<{ freq: number; duration: number; delay: number; type?: OscillatorType; gain?: number }>) {
  notes.forEach(({ freq, duration, delay, type = "sine", gain = 0.1 }) => {
    setTimeout(() => playTone(freq, duration, type, gain), delay * 1000);
  });
}

/** Sonido de boot/activación del sistema */
export function playBootSound() {
  playSequence([
    { freq: 220, duration: 0.1, delay: 0, type: "square", gain: 0.06 },
    { freq: 440, duration: 0.1, delay: 0.08, type: "square", gain: 0.06 },
    { freq: 880, duration: 0.1, delay: 0.16, type: "square", gain: 0.06 },
    { freq: 1760, duration: 0.2, delay: 0.24, type: "sine", gain: 0.08 },
    { freq: 2200, duration: 0.3, delay: 0.38, type: "sine", gain: 0.1 },
  ]);
}

/** Sonido de mensaje enviado */
export function playSendSound() {
  playSequence([
    { freq: 880, duration: 0.08, delay: 0, type: "sine", gain: 0.08 },
    { freq: 1320, duration: 0.12, delay: 0.06, type: "sine", gain: 0.06 },
  ]);
}

/** Sonido de respuesta recibida */
export function playReceiveSound() {
  playSequence([
    { freq: 660, duration: 0.1, delay: 0, type: "sine", gain: 0.07 },
    { freq: 880, duration: 0.08, delay: 0.08, type: "sine", gain: 0.06 },
    { freq: 1100, duration: 0.15, delay: 0.14, type: "sine", gain: 0.05 },
  ]);
}

/** Sonido de alerta/error */
export function playAlertSound() {
  playSequence([
    { freq: 440, duration: 0.15, delay: 0, type: "sawtooth", gain: 0.08 },
    { freq: 330, duration: 0.15, delay: 0.18, type: "sawtooth", gain: 0.08 },
    { freq: 220, duration: 0.25, delay: 0.36, type: "sawtooth", gain: 0.1 },
  ]);
}

/** Sonido de activación de micrófono */
export function playMicOnSound() {
  playSequence([
    { freq: 1200, duration: 0.08, delay: 0, type: "sine", gain: 0.09 },
    { freq: 1600, duration: 0.12, delay: 0.07, type: "sine", gain: 0.07 },
  ]);
}

/** Sonido de desactivación de micrófono */
export function playMicOffSound() {
  playSequence([
    { freq: 1600, duration: 0.08, delay: 0, type: "sine", gain: 0.07 },
    { freq: 800, duration: 0.15, delay: 0.07, type: "sine", gain: 0.06 },
  ]);
}

/** Sonido de panel abierto */
export function playPanelOpenSound() {
  playSequence([
    { freq: 500, duration: 0.06, delay: 0, type: "sine", gain: 0.07 },
    { freq: 750, duration: 0.1, delay: 0.05, type: "sine", gain: 0.06 },
  ]);
}

/** Sonido de tab cambiado */
export function playTabSound() {
  playTone(900, 0.08, "sine", 0.06);
}

/** Sonido de radar activado */
export function playRadarSound() {
  playSequence([
    { freq: 300, duration: 0.05, delay: 0, type: "square", gain: 0.05 },
    { freq: 600, duration: 0.05, delay: 0.1, type: "square", gain: 0.04 },
    { freq: 1200, duration: 0.05, delay: 0.2, type: "square", gain: 0.03 },
  ]);
}

/** Sonido de veredicto calculado */
export function playVeredictSound() {
  playSequence([
    { freq: 440, duration: 0.1, delay: 0, type: "sine", gain: 0.08 },
    { freq: 554, duration: 0.1, delay: 0.1, type: "sine", gain: 0.08 },
    { freq: 659, duration: 0.1, delay: 0.2, type: "sine", gain: 0.08 },
    { freq: 880, duration: 0.25, delay: 0.3, type: "sine", gain: 0.1 },
  ]);
}

/** Sonido de blindaje activado */
export function playShieldSound() {
  playSequence([
    { freq: 200, duration: 0.15, delay: 0, type: "triangle", gain: 0.08 },
    { freq: 400, duration: 0.12, delay: 0.12, type: "triangle", gain: 0.07 },
    { freq: 800, duration: 0.2, delay: 0.22, type: "sine", gain: 0.09 },
    { freq: 1200, duration: 0.3, delay: 0.38, type: "sine", gain: 0.07 },
  ]);
}

/** Sonido de click genérico */
export function playClickSound() {
  playTone(1000, 0.04, "square", 0.04);
}
