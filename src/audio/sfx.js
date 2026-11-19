// 효과음(배경 음악은 없음): 파일 없이 브라우저에서 소리를 만들어 낸다(시제품과 같은 소리).
// 정식 효과음 파일은 public/audio/sfx에 넣고 나중에 교체한다.
import { audioContext } from './context.js';

function tone(freq, startIn, duration, type = 'sine', volume = 0.2, endFreq = 0) {
  const ctx = audioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t = ctx.currentTime + startIn;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function noise(startIn, duration, volume) {
  const ctx = audioContext();
  if (!ctx) return;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain).connect(ctx.destination);
  source.start(ctx.currentTime + startIn);
}

function safely(play) {
  return (...args) => {
    try {
      play(...args);
    } catch (error) {
      console.warn('[sfx] 소리를 낼 수 없습니다.', error);
    }
  };
}

export const sfx = Object.freeze({
  /** 누르기 "뽁" */
  pop: safely(() => tone(620, 0, 0.12, 'sine', 0.18, 980)),
  /** 정답 짧은 멜로디 */
  yes: safely(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.18))),
  /** 오답·잠김 부드러운 "뽀잉" */
  boing: safely(() => {
    tone(420, 0, 0.45, 'sine', 0.22, 140);
    tone(430, 0.02, 0.4, 'triangle', 0.08, 150);
  }),
  /** 알림 "딩" */
  ding: safely(() => tone(880, 0, 0.3, 'sine', 0.15)),
  /** 박수 "짝": 짧은 잡음 */
  clap: safely(() => noise(0, 0.09, 0.35)),
  /** 퍼즐·카드를 놓았을 때 "톡" (높이를 바꿔 가며) */
  place: safely((n = 1) => tone(440 + n * 110, 0, 0.14, 'triangle', 0.18)),
});

