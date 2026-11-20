// 시작 화면 오프닝 영상: 앱을 열고 처음 한 번만 나온다.
// 영상이 끝나거나(또는 아이가 눌러서 건너뛰면) 영상이 서서히 사라지면서 시작 화면(제목·▶)이 나타난다.
import { h } from '@공통/widgets/dom.js';
import { sfx } from '../audio/sfx.js';

const SRC = `${import.meta.env.BASE_URL}video/opening.mp4`;
const FADE_MS = 900; // 영상이 사라지는 시간 (play.css 의 .intro 전환 시간과 같게)
const LOAD_LIMIT_MS = 5000; // 이 안에 재생이 시작되지 않으면 영상 없이 바로 시작 화면
const PLAY_LIMIT_MS = 12000; // 영상이 끝나지 않고 멈춰도 이 시간이 지나면 시작 화면
const FADE_OUT_S = 0.8; // 영상이 끝나기 전 이만큼 동안 소리를 서서히 줄인다 (갑자기 끊기지 않게)
const CHIME_DELAY_MS = 250; // 제목이 나타나기 시작할 때 효과음 (play.css 의 제목 지연과 같게)

let alreadyPlayed = false; // 앱을 연 뒤 한 번만 (시작 화면으로 다시 돌아와도 또 나오지 않게)

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 오프닝을 보여 준다. 영상을 못 받거나 재생이 안 돼도 앱은 막히지 않고 바로 시작 화면이 된다. */
export function playIntro(root) {
  if (alreadyPlayed || reducedMotion()) return;
  alreadyPlayed = true;

  const video = h('video', { class: 'intro-video', playsinline: true, preload: 'auto', 'aria-hidden': 'true' });
  const cover = h('div', { class: 'intro' }, video);
  root.append(cover);

  let finished = false;
  let blobUrl = '';
  let limit = setTimeout(finish, LOAD_LIMIT_MS);

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(limit);
    video.pause();
    root.classList.add('revealed'); // 제목과 ▶ 가 차례로 나타난다
    cover.classList.add('gone'); // 영상이 서서히 사라진다
    setTimeout(sfx.chime, CHIME_DELAY_MS); // 소리가 끊긴 정적 대신 "띠리링"
    setTimeout(() => {
      cover.remove();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    }, FADE_MS + 100);
  }

  /** 소리를 켠 채로 재생해 보고, 브라우저가 막으면 소리 없이 재생한다 */
  async function start() {
    video.muted = false;
    try {
      await video.play();
    } catch {
      video.muted = true;
      await video.play();
    }
  }

  /** 끝나기 전 마지막 구간에서 소리를 1 → 0 으로 줄인다 (아이폰은 영상 음량을 바꿀 수 없어 그대로 둔다) */
  function fadeOutSound() {
    if (finished) return;
    const left = video.duration - video.currentTime;
    if (Number.isFinite(left)) video.volume = Math.max(0, Math.min(1, left / FADE_OUT_S));
    requestAnimationFrame(fadeOutSound);
  }

  video.addEventListener('playing', () => {
    clearTimeout(limit);
    limit = setTimeout(finish, PLAY_LIMIT_MS);
    fadeOutSound();
  }, { once: true });
  video.addEventListener('ended', finish);
  video.addEventListener('error', finish);
  cover.addEventListener('pointerdown', finish); // 누르면 건너뛰기

  // 파일 전체를 받아서 재생한다: 오프라인 저장본에서도, 아이폰 사파리에서도 같은 방식으로 된다
  fetch(SRC)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`영상 ${res.status}`))))
    .then((blob) => {
      if (finished) return;
      blobUrl = URL.createObjectURL(blob);
      video.src = blobUrl;
      return start();
    })
    .catch(finish);
}
