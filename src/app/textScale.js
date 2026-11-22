// 기기의 "글자 크기" 설정 되돌리기.
// 삼성 태블릿·삼성 인터넷 같은 곳은 설정한 글자 크기만큼 웹페이지의 모든 글자를 키운다(cqh 로 정한 글자도).
// 칸과 그림은 그대로인데 글자만 커지면 노래 가사·카드 이름·말풍선이 칸 밖으로 나간다.
// 그래서 같은 글꼴로 "화면에 그려진 글자 너비 ÷ 원래 너비"를 재서 --ts(= 1/배율)를 정하고, 글자 크기마다 곱해서 되돌린다.

const SAMPLE = 'MMMMMMMMMM';
const FONT = '100px sans-serif';
const IGNORE_BELOW = 0.04; // 이 정도 차이는 오차로 보고 그대로 둔다
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

/** 계산: 그려진 너비 ÷ 원래 너비 → 되돌릴 비율(--ts). 이상한 값이면 1 */
export function compensation(renderedWidth, expectedWidth) {
  const scale = renderedWidth / expectedWidth;
  if (!Number.isFinite(scale) || scale < MIN_SCALE || scale > MAX_SCALE) return 1;
  return Math.abs(scale - 1) < IGNORE_BELOW ? 1 : +(1 / scale).toFixed(3);
}

function measure() {
  const probe = document.createElement('span');
  probe.textContent = SAMPLE;
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:${FONT};`;
  document.body.append(probe);
  const rendered = probe.getBoundingClientRect().width;
  probe.remove();
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return 1;
  ctx.font = FONT;
  return compensation(rendered, ctx.measureText(SAMPLE).width);
}

/** --ts 를 정해 넣는다. 못 재면 1(그대로) */
export function applyTextScale() {
  try {
    document.documentElement.style.setProperty('--ts', String(measure()));
  } catch (error) {
    console.warn('[textScale] 글자 크기를 재지 못해 그대로 둡니다.', error);
  }
}

/** 시작할 때 한 번, 그리고 화면 크기가 바뀌거나 앱으로 돌아올 때 다시 (설정을 바꾸고 돌아온 경우) */
export function watchTextScale() {
  applyTextScale();
  addEventListener('resize', applyTextScale);
  document.addEventListener('visibilitychange', () => !document.hidden && applyTextScale());
}
