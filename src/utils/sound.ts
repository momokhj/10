// 8-bit Web Audio API synthesizer + optional Korean TTS helper
// 외부 음원 파일 없이 브라우저 내장 Web Audio API로 저작권 문제 없는 8비트 효과음을 생성합니다.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.08,
  delay = 0,
  slideToFreq?: number
) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    // 오디오 컨텍스트 제한 시 무음 처리
  }
}

export function playJumpSound(enabled: boolean) {
  if (!enabled) return;
  playTone(260, 0.14, 'square', 0.07, 0, 560);
}

export function playBlockHitSound(enabled: boolean) {
  if (!enabled) return;
  playTone(440, 0.06, 'square', 0.06, 0);
  playTone(660, 0.1, 'square', 0.07, 0.05);
}

export function playStarSound(enabled: boolean) {
  if (!enabled) return;
  playTone(587.33, 0.07, 'square', 0.07, 0);
  playTone(783.99, 0.07, 'square', 0.07, 0.07);
  playTone(1046.5, 0.16, 'square', 0.08, 0.14);
}

export function playCorrectSound(enabled: boolean) {
  if (!enabled) return;
  playTone(523.25, 0.09, 'square', 0.07, 0);
  playTone(659.25, 0.09, 'square', 0.07, 0.08);
  playTone(783.99, 0.09, 'square', 0.07, 0.16);
  playTone(1046.5, 0.22, 'square', 0.09, 0.24);
}

export function playWrongSound(enabled: boolean) {
  if (!enabled) return;
  playTone(280, 0.14, 'triangle', 0.09, 0, 210);
  playTone(200, 0.18, 'triangle', 0.09, 0.13, 150);
}

export function playPlaceItemSound(enabled: boolean) {
  if (!enabled) return;
  playTone(520, 0.06, 'triangle', 0.06, 0, 620);
}

export function playVictorySound(enabled: boolean) {
  if (!enabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  const times = [0, 0.1, 0.2, 0.3, 0.44, 0.54];
  notes.forEach((n, idx) => {
    playTone(n, idx === notes.length - 1 ? 0.35 : 0.1, 'square', 0.08, times[idx]);
  });
}

export function playGameOverSound(enabled: boolean) {
  if (!enabled) return;
  playTone(392, 0.16, 'triangle', 0.08, 0);
  playTone(349.23, 0.16, 'triangle', 0.08, 0.17);
  playTone(329.63, 0.16, 'triangle', 0.08, 0.34);
  playTone(261.63, 0.35, 'triangle', 0.08, 0.51);
}

export function speakKorean(text: string, enabled: boolean) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92; // 특수교육 학습자를 위해 약간 또박또박 느린 속도
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // SpeechSynthesis 미지원 환경 무시
  }
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}
