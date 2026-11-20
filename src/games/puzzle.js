// 그림 퍼즐: 동물 그림을 대각선 4조각으로 나눠 끌어서 제자리에. 틀려도 감점 없이 힌트만.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '@권자료';
import * as S from '../audio/script.js';
import { defineGame, enableDrag, elementAt, shuffle, el } from './kit.js';

const ROUNDS = 3;
const WEDGES = ['top', 'right', 'bottom', 'left'];
const POLY = {
  top: 'polygon(0 0,100% 0,50% 50%)',
  right: 'polygon(100% 0,100% 100%,50% 50%)',
  bottom: 'polygon(100% 100%,0 100%,50% 50%)',
  left: 'polygon(0 100%,0 0,50% 50%)',
};
const TRAY_POS = [[1, 1], [27, 1], [1, 27], [27, 27]]; // 보관함(퍼즐 판과 같은 56cqh 칸) 안 위치(cqh), 조각 한 칸 28cqh

const picture = (animal) => h('div', { class: 'pf' }, art('character', animal.key));

export const puzzleScreen = defineGame({
  background: 'puzzle-bg',
  build(field, app, ctx) {
    const order = shuffle(ANIMALS).slice(0, ROUNDS);
    let round = 0;
    let placed = 0;
    let wrong = 0;
    let busy = false;

    const slots = el('div', 'pz-slots');
    const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lines.setAttribute('class', 'pz-lines');
    lines.setAttribute('viewBox', '0 0 100 100');
    lines.setAttribute('preserveAspectRatio', 'none');
    lines.innerHTML = '<path d="M0 0L100 100M100 0L0 100"/>';
    const board = el('div', 'pz-board', slots, lines);
    const sign = el('div', 'pz-sign');
    const tray = el('div', 'pz-tray');
    field.append(board, sign, tray);

    const slotOf = (w) => slots.querySelector(`.sl[data-w="${w}"]`);
    const pieceOf = (w) => tray.querySelector(`.pc[data-w="${w}"]`);

    async function startRound() {
      const animal = order[round];
      placed = 0;
      wrong = 0;
      busy = false;
      lines.style.display = '';
      sign.textContent = animal.name; // 그림 밑에 이름을 처음부터 보여 준다
      app.bar.setDots(round, ROUNDS);
      slots.replaceChildren(...WEDGES.map((w) => h('div', { class: 'sl', 'data-w': w, style: `clip-path:${POLY[w]}` }, picture(animal))));
      const pos = shuffle(TRAY_POS);
      tray.replaceChildren(
        ...WEDGES.map((w, i) =>
          h('div', { class: 'pc', 'data-w': w, style: `left:${pos[i][0]}cqh;top:${pos[i][1]}cqh` },
            h('div', { class: 'pci', style: `clip-path:${POLY[w]}` }, picture(animal)))),
      );
      if (round === 0 && (await ctx.wait(250))) ctx.say(S.PUZZLE_ASK);
    }

    async function finishRound() {
      const animal = order[round];
      busy = true;
      lines.style.display = 'none';
      sign.textContent = animal.name;
      app.sfx.yes();
      round += 1;
      app.bar.setDots(round, ROUNDS);
      if (!(await ctx.say(S.puzzleDone(animal.name)))) return;
      if (!(await ctx.wait(500))) return;
      if (round >= ROUNDS) app.finish('puzzle');
      else startRound();
    }

    enableDrag(tray, {
      selector: '.pc',
      onStart: (piece) => busy || piece.classList.contains('done'),
      onDrop: (piece, x, y) => {
        if (busy) return;
        const slot = elementAt(x, y, '.sl');
        if (!slot || slot.classList.contains('on')) return;
        if (slot.dataset.w === piece.dataset.w) {
          slot.classList.add('on');
          slot.classList.remove('hint');
          piece.classList.add('done');
          placed += 1;
          app.sfx.place(placed);
          if (placed === WEDGES.length) finishRound();
          return;
        }
        wrong += 1; // 틀려도 감점 없음
        app.sfx.boing();
        if (wrong === 1) ctx.say(S.PUZZLE_WRONG);
        else {
          pieceOf(piece.dataset.w)?.classList.add('hint');
          slotOf(piece.dataset.w)?.classList.add('hint');
        }
      },
    });

    startRound();
  },
});
