// 글자 쓰기: 왼쪽에 글자에 해당하는 동물, 오른쪽에 큰 흐린 글자. 손가락으로 따라 쓰면 글자를 충분히 덮었을 때 성공.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '../data/zoo1.js';
import * as S from '../audio/script.js';
import { defineGame, shuffle, el } from './kit.js';

const ROUNDS = 3;
const SIZE = 480; // 쓰는 판의 그림 크기(픽셀). 화면에 보이는 크기는 CSS가 정한다.
const PEN = 40; // 펜 굵기
const GUIDE_FONT = `${Math.round(SIZE * 0.78)}px Jua, 'Malgun Gothic', sans-serif`;
const NEED_COVER = 0.55; // 흐린 글자 중 이만큼 덮으면 성공
const HINT_AFTER_MS = 12000;
const INK = '#ff7a59';

/** 흐린 글자(guide)의 어느 부분을 ink가 덮었는지 비율 */
export function coverage(guideData, inkData) {
  let total = 0;
  let covered = 0;
  for (let i = 3; i < guideData.length; i += 4) {
    if (guideData[i] < 20) continue; // 흐린 글자(투명도 0.22)도 글자 자리로 센다
    total += 1;
    if (inkData[i] > 0) covered += 1;
  }
  return total === 0 ? 0 : covered / total;
}

export const writeScreen = defineGame({
  background: 'savanna-base',
  menuPage: 1,
  build(field, app, ctx) {
    const targets = shuffle(ANIMALS).slice(0, ROUNDS);
    let round = 0;
    let busy = true;
    let drawing = false;
    let last = null;
    let current = null;
    let hintTimer = null;

    const animalBox = el('div', 'wr-animal');
    const guide = h('canvas', { class: 'wr-guide', width: SIZE, height: SIZE });
    const ink = h('canvas', { class: 'wr-ink', width: SIZE, height: SIZE, 'aria-label': '글자를 쓰는 판' });
    const eraser = h('button', { class: 'wr-erase press', 'aria-label': '지우기', onclick: clearInk }, '↺');
    const board = el('div', 'wr-board', guide, ink, eraser);
    field.append(animalBox, board);

    const gctx = guide.getContext('2d', { willReadFrequently: true });
    const ictx = ink.getContext('2d', { willReadFrequently: true });
    ictx.lineCap = 'round';
    ictx.lineJoin = 'round';
    ictx.lineWidth = PEN;
    ictx.strokeStyle = INK;

    function clearInk() {
      ictx.clearRect(0, 0, SIZE, SIZE);
    }

    async function startRound() {
      current = targets[round];
      app.bar.setDots(round, ROUNDS);
      animalBox.replaceChildren(
        art('character', current.key, { class: 'pic' }),
        h('span', { class: 'lbl' }, current.name),
        h('span', { class: 'let' }, `${current.letter} ${current.letterName}`),
      );
      busy = true;
      clearInk();
      await document.fonts?.load(GUIDE_FONT).catch(() => {});
      gctx.clearRect(0, 0, SIZE, SIZE);
      gctx.font = GUIDE_FONT;
      gctx.textAlign = 'center';
      gctx.textBaseline = 'middle';
      gctx.fillStyle = 'rgba(58, 42, 28, 0.22)';
      gctx.fillText(current.letter, SIZE / 2, SIZE * 0.54);
      if (!(await ctx.say(S.writeAsk(current)))) return;
      busy = false;
      const mine = round;
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => ctx.alive() && round === mine && !busy && ctx.say(S.WRITE_HINT), HINT_AFTER_MS);
    }

    /** 손가락 자리를 판 안의 좌표로. offsetX/Y는 눕혀 놓은 화면에서도 판 기준이다. */
    const point = (ev) => {
      const k = SIZE / ink.offsetWidth;
      return { x: ev.offsetX * k, y: ev.offsetY * k };
    };

    ink.addEventListener('pointerdown', (ev) => {
      if (busy) return;
      ev.preventDefault();
      ink.setPointerCapture?.(ev.pointerId);
      drawing = true;
      last = point(ev);
      ictx.beginPath();
      ictx.arc(last.x, last.y, PEN / 2, 0, Math.PI * 2);
      ictx.fillStyle = INK;
      ictx.fill();
    });
    ink.addEventListener('pointermove', (ev) => {
      if (!drawing) return;
      const p = point(ev);
      ictx.beginPath();
      ictx.moveTo(last.x, last.y);
      ictx.lineTo(p.x, p.y);
      ictx.stroke();
      last = p;
    });
    const lift = () => {
      if (!drawing) return;
      drawing = false;
      check();
    };
    ink.addEventListener('pointerup', lift);
    ink.addEventListener('pointercancel', lift);

    async function check() {
      if (busy) return;
      const done = coverage(gctx.getImageData(0, 0, SIZE, SIZE).data, ictx.getImageData(0, 0, SIZE, SIZE).data);
      if (done < NEED_COVER) return;
      busy = true;
      clearTimeout(hintTimer);
      guide.classList.add('done');
      app.sfx.yes();
      round += 1;
      app.bar.setDots(round, ROUNDS);
      if (!(await ctx.say(S.writeDone(current)))) return;
      if (!(await ctx.wait(500))) return;
      guide.classList.remove('done');
      if (round >= ROUNDS) app.finish('write');
      else startRound();
    }

    startRound();
  },
});
