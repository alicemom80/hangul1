// 짝 맞추기: 카드 6장(동물 3마리 × 2)을 뒤집어 같은 그림 짝을 찾는다. 틀려도 감점 없이 다시 뒤집힌다.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '@권자료';
import * as S from '../audio/script.js';
import { defineGame, shuffle, el } from './kit.js';

const PAIRS = 3;
const SHOW_MISS_MS = 900;

export const matchScreen = defineGame({
  background: 'match-bg',
  build(field, app, ctx) {
    const chosen = shuffle(ANIMALS).slice(0, PAIRS);
    const deck = shuffle([...chosen, ...chosen]);
    let open = []; // 지금 뒤집어 둔 카드(최대 2장)
    let found = 0;
    let busy = false;

    const grid = el('div', 'mt-grid');
    app.bar.setDots(0, PAIRS);

    deck.forEach((animal) => {
      const card = h(
        'button',
        { class: 'mcard', 'aria-label': '카드', onclick: () => flip(card, animal) },
        h('div', { class: 'inner' },
          h('div', { class: 'face back' }, art('prop', 'card-back')),
          h('div', { class: 'face front' }, art('prop', 'card-front'), art('character', animal.key, { class: 'pic' }), h('span', { class: 'lbl' }, animal.name))),
      );
      grid.append(card);
    });
    field.append(grid);
    setTimeout(() => ctx.alive() && ctx.say(S.MATCH_ASK), 300);

    async function flip(card, animal) {
      if (busy || card.classList.contains('up')) return;
      card.classList.add('up');
      app.sfx.pop();
      open = [...open, { card, animal }];
      if (open.length === 1) {
        ctx.say(animal.name);
        return;
      }
      busy = true;
      const [a, b] = open;
      open = [];
      if (a.animal.key === b.animal.key) {
        a.card.classList.add('match');
        b.card.classList.add('match');
        found += 1;
        app.bar.setDots(found, PAIRS);
        app.sfx.yes();
        if (!(await ctx.say(S.matchFound(animal.name)))) return;
        busy = false;
        if (found === PAIRS) {
          if (!(await ctx.wait(400))) return;
          app.finish('match');
        }
        return;
      }
      app.sfx.boing();
      if (!(await ctx.wait(SHOW_MISS_MS))) return;
      a.card.classList.remove('up');
      b.card.classList.remove('up');
      busy = false;
      ctx.say(S.MATCH_MISS);
    }
  },
});
