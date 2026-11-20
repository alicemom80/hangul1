// 시작 화면: 사바나 배경 위에 자음 글자들이 떠다니고, 코코와 제목, ▶
import { h, art, roundButton } from '@공통/widgets/dom.js';
import { ANIMALS, VOLUME } from '@권자료';
import { GREETING } from '../audio/script.js';
import { openInDefaultBrowser } from '../app/inapp.js';

const MOVE_WAIT_MS = 1500; // 기본 브라우저가 열렸다면 이 안에 이 화면은 가려진다. 그대로면 열기가 막힌 것

/**
 * ▶를 누르면 주소창 없는 전체 화면 (+ 가로 고정을 지원하는 기기는 가로로).
 * 아이폰처럼 지원하지 않거나 이미 홈 화면 앱으로 열었으면 그냥 넘어간다.
 * 전체 화면은 누르는 순간에만 요청할 수 있어서 ▶에서 한다. 컴퓨터에서도 똑같이 전체 화면이 된다.
 */
function enterFullscreen() {
  const page = document.documentElement;
  const request = page.requestFullscreen ?? page.webkitRequestFullscreen;
  if (!request || document.fullscreenElement || document.webkitFullscreenElement) return;
  if (matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches) return;
  Promise.resolve(request.call(page, { navigationUI: 'hide' }))
    .then(() => screen.orientation?.lock?.('landscape'))
    .catch(() => {}); // 막혀도 앱은 그대로 쓸 수 있다
}

// 떠다니는 자음: [몇 번째 동물의 자음, 왼쪽 %, 위 %, 크기(cqh), 색, 흔들림 시작 지연(초)]. 글자는 그 권의 동물 자음.
const FLOAT_SPOTS = [
  [0, 8, 14, 22, '#ff7a59', 0], [1, 84, 12, 20, '#3fae5e', 0.4], [2, 20, 52, 17, '#4fb3e8', 0.8],
  [3, 76, 50, 21, '#ffb21e', 1.2], [4, 5, 76, 18, '#c46bd8', 1.6], [5, 90, 76, 19, '#ff6f91', 2.0],
  [3, 36, 8, 14, '#3fae5e', 0.6], [0, 66, 10, 15, '#4fb3e8', 1.0], [5, 30, 70, 13, '#ffb21e', 1.4],
  [1, 66, 72, 14, '#ff7a59', 1.8],
];
// 동물이 7마리인 권은 마지막 자음도 하나 띄운다
const FLOATERS = FLOAT_SPOTS.map(([n, ...rest], i) => [
  ANIMALS[(i === 7 && ANIMALS.length > 6 ? 6 : n) % ANIMALS.length].letter, ...rest,
]);

export const startScreen = {
  showBar: false,
  background: 'savanna-base',
  render(root, app) {
    const begin = () => {
      enterFullscreen();
      app.startSound();
      app.go('menu');
      app.say(GREETING);
    };
    const start = () => {
      // 카카오톡 같은 앱 안 브라우저면 휴대폰의 기본 브라우저로 다시 열어 준다
      const opened = openInDefaultBrowser();
      if (opened === 'moved') {
        setTimeout(() => !document.hidden && root.isConnected && begin(), MOVE_WAIT_MS);
        return;
      }
      if (opened === 'manual') app.toast('오른쪽 아래 ⋯ 메뉴에서 "Safari로 열기"를 누르면 더 잘 돼요');
      begin();
    };
    // 링크를 열자마자는 브라우저가 막으므로, 시작 화면 어디든 처음 누르는 순간 전체 화면으로
    root.addEventListener('pointerdown', enterFullscreen, { once: true });
    root.append(
      ...FLOATERS.map(([ch, x, y, size, color, delay]) =>
        h('span', { class: 'floater', 'aria-hidden': 'true', style: `left:${x}%;top:${y}%;font-size:${size}cqh;color:${color};animation-delay:${delay}s` }, ch)),
      art('character', 'koko-wave', { class: 'hero', alt: '코코' }),
      h('h1', {}, VOLUME.title, h('small', {}, VOLUME.subtitle)),
      roundButton('play', '시작', start),
      h('div', { class: 'credit above', 'aria-hidden': 'true' }, h('i', { class: 'igicon' }), 'instagram ', h('b', {}, '@alicemom80')),
      h('div', { class: 'copyright', 'aria-hidden': 'true' }, '© 2026 alicemom80. All rights reserved.'),
    );
  },
};
