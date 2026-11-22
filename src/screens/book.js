// 스티커북: 한 쪽에 8칸(4칸 × 2줄), 쪽을 넘겨서 본다. 모은 동물은 그림으로, 아직 못 만난 동물은 그림자로 보인다. 누르면 이름을 말해 준다.
// 첫 쪽은 이 권의 동물 친구들(자음이 붙어 있다), 그다음은 덤으로 받는 동물들.
import { h, art } from '@공통/widgets/dom.js';
import { STICKERS } from '@권자료';
import { bookCount, NOT_MET } from '../audio/script.js';
import { stopVoice } from '../audio/voice.js';

const PAGE_SIZE = 8;

export const bookScreen = {
  showBar: false,
  background: 'savanna-base',
  render(root, app, { back = { name: 'menu', params: {} } } = {}) {
    const have = new Set(app.progress.stickers);
    const pages = Math.ceil(STICKERS.length / PAGE_SIZE);
    let page = 0;

    const slotOf = (a) => {
      const mine = have.has(a.key);
      return h(
        'button',
        {
          class: `slot press ${mine ? 'has' : 'miss'}`,
          'aria-label': mine ? a.name : '아직 못 만난 친구',
          onclick: () => { app.sfx.pop(); app.say(mine ? a.name : NOT_MET); },
        },
        art('prop', 'slot', { class: 'slot-bg' }),
        art('character', a.key, { class: 'slot-pic' }),
        mine && a.letter ? h('span', { class: 'slot-letter' }, a.letter) : null,
      );
    };

    const grid = h('div', { class: 'slots many' });
    const label = h('span', { class: 'bk-page' });
    const prev = h('button', { class: 'bk-arrow press', 'aria-label': '앞 쪽', onclick: () => turn(-1) },
      art('icon', 'back', { class: 'ico' }));
    const next = h('button', { class: 'bk-arrow next press', 'aria-label': '다음 쪽', onclick: () => turn(1) },
      art('icon', 'play', { class: 'ico' }));

    function show() {
      grid.replaceChildren(...STICKERS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(slotOf));
      label.textContent = `${page + 1} / ${pages}`;
      prev.disabled = page === 0;
      next.disabled = page === pages - 1;
    }
    function turn(step) {
      app.sfx.pop();
      page = Math.min(pages - 1, Math.max(0, page + step));
      show();
    }
    show();

    root.append(
      h('div', { class: 'glowbg', 'aria-hidden': 'true' }),
      grid,
      pages > 1 ? h('div', { class: 'bk-nav' }, prev, label, next) : null,
      h('button', { class: 'bookclose press', 'aria-label': '닫기', onclick: () => { app.sfx.pop(); app.go(back.name, back.params); } },
        art('icon', 'close', { class: 'ico' })),
    );
    app.say(bookCount(have.size));
  },
  leave: stopVoice,
};
