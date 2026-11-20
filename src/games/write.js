// 글자 쓰기(선 따라 그리기): 왼쪽에 글자에 해당하는 동물, 오른쪽에 큰 점선 자음. 초록 점에서 시작해 획 순서대로 따라 쓴다.
// 너그럽게 판정한다(lineTrace.js): 벗어나면 멈추고 기다릴 뿐 틀림은 없다. 가만있으면 노란 점이 지금 획을 한 번 보여 준다.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '@권자료';
import { strokesOf } from '../data/strokes.js';
import * as S from '../audio/script.js';
import { defineGame, shuffle, el } from './kit.js';
import { buildPath, pointAt, startTrace, pressTrace, moveTrace, releaseTrace, isDone } from './lineTrace.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ROUNDS = 3;
const TOLERANCE = 11;
const START_DOT = 5.5;
const ARROW_AT = 12; // 시작 화살표를 놓는 거리 (길을 따라)
const IDLE_HINT_MS = 5000;
const DEMO_MS = 2000;
const DEMO_STEP_MS = 40;
const MAX_DEMOS = 2; // 가만있기 안내는 한 글자에 이만큼만
const START_HINT_GAP_MS = 3000; // "초록 점을 눌러" 안내를 너무 자주 하지 않게
const NEXT_WAIT_MS = 500;
const VIEW_BOX = '-8 -8 116 116';

function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  node.append(...children);
  return node;
}

const dOf = (points) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const placeAt = (node, [x, y]) => node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);

/** 획 하나: 하얀 바탕길 + 점선 + 채워지는 색 선 */
function strokeLayer(path) {
  const d = dOf(path.points);
  const fill = svg('path', { class: 'lfill', d, pathLength: path.length, 'stroke-dasharray': `${path.length} ${path.length + 1}` });
  const draw = (reached) => {
    fill.setAttribute('stroke-dashoffset', String(path.length - reached));
    fill.style.visibility = reached > 0 ? '' : 'hidden';
  };
  draw(0);
  return { bed: svg('path', { class: 'lbed', d }), guide: svg('path', { class: 'lguide', d }), fill, draw };
}

/** 시작 화살표: 획이 처음 나아가는 방향을 가리킨다 */
function placeArrow(arrow, path) {
  const at = Math.min(ARROW_AT, path.length / 2);
  const [ax, ay] = pointAt(path, at - 2);
  const [bx, by] = pointAt(path, at + 2);
  const deg = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  const [x, y] = pointAt(path, at);
  arrow.setAttribute('transform', `translate(${x} ${y}) rotate(${deg})`);
}

export const writeScreen = defineGame({
  background: 'savanna-base',
  menuPage: 1,
  build(field, app, ctx) {
    const targets = shuffle(ANIMALS).slice(0, ROUNDS);
    const animalBox = el('div', 'wr-animal');
    const board = el('div', 'wr-board');
    field.append(animalBox, board);
    let round = 0;

    function startRound() {
      const animal = targets[round];
      const paths = strokesOf(animal.letter).map(buildPath);
      const layers = paths.map(strokeLayer);
      const start = svg('g', { class: 'lstart' }, svg('circle', { r: START_DOT }));
      const arrow = svg('polygon', { class: 'larrow', points: '-3.2,-3.6 3.8,0 -3.2,3.6' });
      const hintDot = svg('circle', { class: 'lhint', r: 4 });
      const canvas = svg(
        'svg',
        { class: 'lineq wr-trace', viewBox: VIEW_BOX, role: 'img', 'aria-label': `${animal.letterName} 따라 쓰기` },
        ...layers.map((l) => l.bed), ...layers.map((l) => l.guide), ...layers.map((l) => l.fill), start, arrow, hintDot,
      );

      animalBox.replaceChildren(
        art('character', animal.key, { class: 'pic' }),
        h('span', { class: 'lbl' }, animal.name),
        h('span', { class: 'let' }, `${animal.letter} ${animal.letterName}`),
      );
      board.replaceChildren(canvas);
      app.bar.setDots(round, ROUNDS);
      ctx.say(S.writeAsk(animal));

      let index = 0;
      let trace = startTrace();
      let finished = false;
      let idleTimer = null;
      let demoTimer = null;
      let demos = 0;
      let lastStartHint = 0;
      const opts = { tolerance: TOLERANCE };
      const alive = () => ctx.alive() && canvas.isConnected && !finished;

      function showStart() {
        placeAt(start, pointAt(paths[index], trace.reached));
        placeArrow(arrow, paths[index]);
        arrow.style.visibility = trace.reached > 0 ? 'hidden' : '';
      }

      function stopDemo() {
        clearInterval(demoTimer);
        demoTimer = null;
        hintDot.classList.remove('on');
      }

      function armIdle() {
        clearTimeout(idleTimer);
        if (demos >= MAX_DEMOS) return;
        idleTimer = setTimeout(() => {
          if (!alive() || trace.active) return;
          demos += 1;
          if (demos > 1) ctx.say(S.WRITE_HINT); // 첫 안내는 말 없이 점만 (방금 들은 설명과 겹치지 않게)
          const path = paths[index];
          const from = trace.reached;
          const began = Date.now();
          hintDot.classList.add('on');
          demoTimer = setInterval(() => {
            const t = Math.min((Date.now() - began) / DEMO_MS, 1);
            if (!alive()) return stopDemo();
            placeAt(hintDot, pointAt(path, from + (path.length - from) * t));
            if (t >= 1) {
              stopDemo();
              armIdle();
            }
          }, DEMO_STEP_MS);
        }, IDLE_HINT_MS);
      }

      async function finishLetter() {
        finished = true;
        clearTimeout(idleTimer);
        stopDemo();
        start.remove();
        arrow.remove();
        canvas.classList.add('done');
        app.sfx.yes();
        round += 1;
        app.bar.setDots(round, ROUNDS);
        if (!(await ctx.say(S.writeDone(animal)))) return;
        if (!(await ctx.wait(NEXT_WAIT_MS))) return;
        if (round >= ROUNDS) app.finish('write');
        else startRound();
      }

      function nextStroke() {
        layers[index].draw(paths[index].length);
        app.sfx.pop();
        index += 1;
        trace = startTrace();
        canvas.classList.remove('drawing');
        if (index < paths.length) {
          showStart();
          armIdle();
        } else finishLetter();
      }

      /** 눕혀 놓은 화면에서도 손가락 자리를 판 안의 좌표로 바꾼다 */
      const toLocal = (e) => {
        const m = canvas.getScreenCTM();
        if (!m) return null;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        return [p.x, p.y];
      };

      let activePointer = null; // 지금 긋고 있는 손가락(포인터) 번호 — 다른 손가락은 무시한다

      canvas.addEventListener('pointerdown', (e) => {
        if (finished || activePointer !== null) return;
        const p = toLocal(e);
        if (!p) return;
        e.preventDefault();
        clearTimeout(idleTimer);
        stopDemo();
        trace = pressTrace(paths[index], trace, p, opts);
        if (trace.active) {
          activePointer = e.pointerId;
          try { canvas.setPointerCapture?.(e.pointerId); } catch { /* 잡지 못해도 긋기는 계속된다 */ }
          canvas.classList.add('drawing');
          return;
        }
        start.classList.remove('hl'); // 엉뚱한 곳을 눌렀으면 이어 쓸 자리를 반짝인다
        void start.getBoundingClientRect();
        start.classList.add('hl');
        if (Date.now() - lastStartHint > START_HINT_GAP_MS) {
          lastStartHint = Date.now();
          ctx.say(S.WRITE_START_HINT);
        }
        armIdle();
      });

      canvas.addEventListener('pointermove', (e) => {
        if (!trace.active || finished || e.pointerId !== activePointer) return;
        const p = toLocal(e);
        if (!p) return;
        trace = moveTrace(paths[index], trace, p, opts);
        layers[index].draw(trace.reached);
        showStart();
        if (isDone(paths[index], trace)) nextStroke();
      });

      // 주의: lostpointercapture는 듣지 않는다. 터치는 누른 요소에 자동으로 포인터가 잡혀 있어서,
      // 위에서 다시 잡을 때 이 이벤트가 곧바로 올라와 긋기가 끊겨 버린다.
      const release = (e) => {
        if (e.pointerId !== activePointer) return;
        activePointer = null;
        if (!trace.active || finished) return;
        trace = releaseTrace(trace);
        canvas.classList.remove('drawing');
        armIdle();
      };
      ['pointerup', 'pointercancel'].forEach((ev) => canvas.addEventListener(ev, release));

      showStart();
      armIdle();
    }

    startRound();
  },
});
