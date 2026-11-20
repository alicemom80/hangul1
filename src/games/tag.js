// 이름표 붙이기: 이름표를 끌어서 알맞은 동물 팻말에 붙인다. 이름표를 잡으면 이름을 읽어 준다.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '@권자료';
import * as S from '../audio/script.js';
import { defineGame, enableDrag, elementAt, shuffle, el } from './kit.js';

const GROUP = 3; // 한 번에 보여 주는 동물은 최대 이만큼 (6마리면 3+3, 7마리면 3+2+2)
const HINT_AFTER_WRONG = 2;
const nameOf = (key) => ANIMALS.find((a) => a.key === key).name;

/** 목록을 한 판에 max개 이하로, 판마다 개수가 비슷하게 나눈다 */
export function splitEven(list, max) {
  const count = Math.ceil(list.length / max);
  const base = Math.floor(list.length / count);
  const extra = list.length % count;
  let from = 0;
  return Array.from({ length: count }, (_, i) => {
    const size = base + (i < extra ? 1 : 0);
    const part = list.slice(from, from + size);
    from += size;
    return part;
  });
}

export const tagScreen = defineGame({
  background: 'tag-bg',
  build(field, app, ctx) {
    const all = shuffle(ANIMALS);
    const groups = splitEven(all, GROUP);
    const doneBefore = (r) => groups.slice(0, r).reduce((sum, g) => sum + g.length, 0);
    let round = 0;
    let placed = 0;
    let wrong = 0;
    let busy = false;

    const stands = el('div', 'tg-stands');
    const tray = el('div', 'tg-tray');
    field.append(stands, tray);

    const standOf = (key) => stands.querySelector(`.tg-stand[data-key="${key}"]`);
    const tagOf = (key) => tray.querySelector(`.tg-tag[data-key="${key}"]`);

    async function startRound() {
      const animals = groups[round];
      placed = 0;
      wrong = 0;
      busy = false;
      app.bar.setDots(doneBefore(round), ANIMALS.length);
      stands.replaceChildren(
        ...animals.map((a) =>
          h('div', { class: 'tg-stand', 'data-key': a.key },
            art('character', a.key, { class: 'tg-animal' }),
            h('div', { class: 'tg-sign' }, art('prop', 'sign'), el('span', 'tg-label')))),
      );
      tray.replaceChildren(
        ...shuffle(animals).map((a, i) =>
          h('div', { class: 'tg-tag', 'data-key': a.key, style: `--i:${i}` }, art('prop', 'tag'), el('span', 'tg-text', a.name))),
      );
      if (round === 0 && (await ctx.wait(250))) ctx.say(S.TAG_ASK);
    }

    async function finishRound() {
      busy = true;
      app.sfx.yes();
      round += 1;
      app.bar.setDots(doneBefore(round), ANIMALS.length);
      if (!(await ctx.wait(700))) return;
      if (round >= groups.length) app.finish('tag');
      else startRound();
    }

    function drop(tag, x, y) {
      if (busy) return;
      const stand = elementAt(x, y, '.tg-stand');
      if (!stand) return;
      const key = tag.dataset.key;
      if (stand.dataset.key === key) {
        stand.querySelector('.tg-label').textContent = nameOf(key);
        stand.classList.add('done');
        stand.classList.remove('hint');
        tag.remove();
        placed += 1;
        app.sfx.place(placed);
        if (placed === groups[round].length) finishRound();
        else ctx.say(S.tagRight(nameOf(key)));
        return;
      }
      wrong += 1; // 틀려도 감점 없음
      app.sfx.boing();
      ctx.say(S.TAG_WRONG);
      if (wrong >= HINT_AFTER_WRONG) {
        standOf(key)?.classList.add('hint');
        tagOf(key)?.classList.add('hint');
      }
    }

    enableDrag(tray, {
      selector: '.tg-tag',
      onStart: (tag) => {
        if (busy) return true;
        ctx.say(nameOf(tag.dataset.key)); // 잡으면 이름을 읽어 준다
        return false;
      },
      onDrop: drop,
    });

    startRound();
  },
});
