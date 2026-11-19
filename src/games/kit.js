// 놀이 화면 공통 도우미: 16:10 놀이판(.field), 화면을 떠나면 멈추는 타이머·말, 끌어다 놓기.
import { h } from '@공통/widgets/dom.js';
import { shuffle, pickOne } from '@공통/games/logic.js';
import { stopVoice } from '../audio/voice.js';
import { PRAISE } from '../audio/script.js';

export { shuffle, pickOne };
export const randomPraise = (rnd = Math.random) => pickOne(PRAISE, rnd);

/**
 * 놀이 화면 하나를 만든다. build(field, app, ctx)가 화면을 그린다.
 * ctx.wait(ms) / ctx.say(text)는 화면이 아직 떠 있으면 true, 이미 떠났으면 false로 풀린다 →
 * `if (!(await ctx.say(...))) return;` 로 떠난 화면에서 이어 달리지 않게 한다.
 */
export function defineGame({ background, build, menuPage = 0 }) {
  let stop = null;
  return {
    showBar: true,
    background,
    render(root, app) {
      stop?.();
      let alive = true;
      const pending = new Set();
      const field = h('div', { class: 'field' });
      root.append(field);
      const ctx = {
        field,
        alive: () => alive,
        wait: (ms) =>
          new Promise((resolve) => {
            const rec = { resolve };
            rec.id = setTimeout(() => {
              pending.delete(rec);
              resolve(alive);
            }, ms);
            pending.add(rec);
          }),
        say: (text) => app.say(text).then(() => alive),
      };
      stop = () => {
        alive = false;
        pending.forEach((r) => {
          clearTimeout(r.id);
          r.resolve(false);
        });
        pending.clear();
      };
      app.bar.setBack(() => app.go('menu', { page: menuPage }), '놀이 고르기');
      build(field, app, ctx);
    },
    leave() {
      stop?.();
      stop = null;
      stopVoice();
    },
  };
}

/** 세로로 든 화면은 90도 눕혀 보여 주므로, 손가락이 움직인 거리(화면 기준)를 눕힌 화면 기준으로 바꾼다 */
const toLocal = (dx, dy) => (window.matchMedia('(orientation: portrait)').matches ? [dy, -dx] : [dx, dy]);

/**
 * 끌어다 놓기. 누른 칸(selector)을 손가락을 따라 움직이고, 놓으면 onDrop(칸, x, y)을 부른다.
 * onStart가 true를 돌려주면 그 칸은 끌지 않는다.
 */
export function enableDrag(container, { selector, onStart, onDrop }) {
  let drag = null;
  container.addEventListener('pointerdown', (ev) => {
    const piece = ev.target.closest(selector);
    if (!piece || onStart?.(piece) === true) return;
    ev.preventDefault();
    try {
      piece.setPointerCapture(ev.pointerId);
    } catch {
      // 지원하지 않는 기기
    }
    drag = { piece, x: ev.clientX, y: ev.clientY, id: ev.pointerId };
    piece.classList.add('drag');
    piece.style.transition = 'none';
  });
  container.addEventListener('pointermove', (ev) => {
    if (!drag || ev.pointerId !== drag.id) return;
    const [dx, dy] = toLocal(ev.clientX - drag.x, ev.clientY - drag.y);
    drag.piece.style.transform = `translate(${dx}px,${dy}px) scale(1.1)`;
  });
  const end = (ev) => {
    if (!drag || ev.pointerId !== drag.id) return;
    const { piece } = drag;
    drag = null;
    piece.classList.remove('drag');
    piece.style.transition = '';
    piece.style.transform = '';
    onDrop(piece, ev.clientX, ev.clientY);
  };
  container.addEventListener('pointerup', end);
  container.addEventListener('pointercancel', end);
}

/** 화면 좌표(x, y)에 겹쳐 있는 요소 중 selector에 맞는 첫 번째 */
export const elementAt = (x, y, selector) => document.elementsFromPoint(x, y).find((e) => e.matches?.(selector)) ?? null;

/** class가 있는 요소 만들기 */
export const el = (tag, cls, ...children) => h(tag, { class: cls }, ...children);
