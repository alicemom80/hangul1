// 스티커북: 동물 6칸. 모은 동물은 그림으로, 아직 못 만난 동물은 그림자로 보인다. 누르면 이름을 말해 준다.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '../data/zoo1.js';
import { bookCount, NOT_MET } from '../audio/script.js';
import { stopVoice } from '../audio/voice.js';

export const bookScreen = {
  showBar: false,
  background: 'savanna-base',
  render(root, app, { back = { name: 'menu', params: {} } } = {}) {
    const have = new Set(app.progress.stickers);
    const slots = ANIMALS.map((a) => {
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
        mine ? h('span', { class: 'slot-letter' }, a.letter) : null,
      );
    });
    root.append(
      h('div', { class: 'glowbg', 'aria-hidden': 'true' }),
      h('div', { class: 'slots' }, ...slots),
      h('button', { class: 'bookclose press', 'aria-label': '닫기', onclick: () => { app.sfx.pop(); app.go(back.name, back.params); } },
        art('icon', 'close', { class: 'ico' })),
    );
    app.say(bookCount(have.size));
  },
  leave: stopVoice,
};
