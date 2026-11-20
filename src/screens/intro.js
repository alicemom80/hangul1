// 오프닝 영상: 시작 화면에서 ▶ 를 누르면 나온다. (처음 열 때 소리가 브라우저에 막히지 않도록, 누른 뒤에 튼다)
// 영상이 끝나거나(또는 눌러서 건너뛰면) 다음 화면(놀이 고르기)이 영상 뒤에 먼저 놓이고, 영상이 서서히 사라진다.
import { h } from '@공통/widgets/dom.js';
import { sfx } from '../audio/sfx.js';

const SRC = `${import.meta.env.BASE_URL}video/opening.mp4`;
const FADE_MS = 900; // 영상이 사라지는 시간 (play.css 의 .intro 전환 시간과 같게)
const LOAD_LIMIT_MS = 5000; // 이 안에 재생이 시작되지 않으면 영상 없이 바로 다음 화면
const PLAY_LIMIT_MS = 12000; // 영상이 끝나지 않고 멈춰도 이 시간이 지나면 다음 화면
const FADE_OUT_S = 0.8; // 영상이 끝나기 전 이만큼 동안 소리를 서서히 줄인다 (갑자기 끊기지 않게)
const CHIME_DELAY_MS = 250; // 영상이 사라지기 시작한 뒤 효과음
const SKIP_AFTER_MS = 800; // ▶ 를 연달아 눌러도 바로 건너뛰지 않게, 이 시간 뒤부터 눌러서 건너뛸 수 있다

let state = 'idle'; // idle → playing → done (앱을 연 뒤 한 번만)
let videoUrl = null; // 받아 둔 영상 (Promise)
let readyUrl = ''; // 다 받았으면 그 영상 주소

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 영상을 미리 받아 둔다 (시작 화면이 보이는 동안). ▶ 를 누르는 바로 그 순간에 재생해야 소리가 막히지 않는다. */
export function preloadIntro() {
  if (videoUrl) return;
  // 파일 전체를 받아서 재생한다: 오프라인 저장본에서도, 아이폰 사파리에서도 같은 방식으로 된다
  videoUrl = fetch(SRC)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`영상 ${res.status}`))))
    .then((blob) => {
      readyUrl = URL.createObjectURL(blob);
      return readyUrl;
    });
  videoUrl.catch(() => {}); // 못 받으면 영상 없이 넘어간다 (아래 playIntro 에서 처리)
}

/**
 * 오프닝을 보여 주고, 끝나면(영상이 없거나 안 틀려도) onEnd 를 부른다. onEnd 는 다음 화면을 띄우는 일을 한다.
 * 영상은 그 화면 위에 덮여 있다가 서서히 사라진다.
 */
export function playIntro(onEnd) {
  if (state === 'playing') return;
  if (state === 'done' || reducedMotion()) {
    state = 'done';
    onEnd();
    return;
  }
  state = 'playing';
  preloadIntro();

  const video = h('video', { class: 'intro-video', playsinline: true, preload: 'auto', 'aria-hidden': 'true' });
  const cover = h('div', { class: 'intro' }, video);
  document.getElementById('stage').append(cover);
  const shownAt = performance.now();

  let finished = false;
  let limit = setTimeout(finish, LOAD_LIMIT_MS);

  function finish() {
    if (finished) return;
    finished = true;
    state = 'done';
    clearTimeout(limit);
    video.pause();
    onEnd(); // 다음 화면을 영상 뒤에 먼저 놓는다
    cover.classList.add('gone'); // 영상이 서서히 사라진다
    setTimeout(sfx.chime, CHIME_DELAY_MS); // 소리가 끊긴 정적 대신 "띠리링"
    setTimeout(() => cover.remove(), FADE_MS + 100);
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
  cover.addEventListener('pointerdown', () => performance.now() - shownAt > SKIP_AFTER_MS && finish()); // 누르면 건너뛰기

  const begin = (url) => {
    if (finished) return;
    video.src = url;
    start().catch(finish);
  };
  // 이미 받아 뒀으면 ▶ 를 누른 바로 그 순간에 틀어야 아이폰도 소리를 허용한다 (기다렸다 틀면 막힐 수 있다)
  if (readyUrl) begin(readyUrl);
  else videoUrl.then(begin).catch(finish);
}
