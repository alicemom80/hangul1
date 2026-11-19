// 자음 6개의 획(쓰는 순서대로). 글자 하나는 가로·세로 100 안에 그린다. 화면과 상관없는 순수한 자료.
// 획은 점들을 이은 선이고, 원(ㅎ의 동그라미)은 위에서 시작해 시계 반대 방향으로 잘게 나눈 점들이다.

const CIRCLE_POINTS = 41;

/** 위에서 시작해 시계 반대 방향으로 한 바퀴 도는 원 */
function circle(cx, cy, r) {
  return Array.from({ length: CIRCLE_POINTS }, (_, i) => {
    const t = (i / (CIRCLE_POINTS - 1)) * Math.PI * 2;
    return [cx - r * Math.sin(t), cy - r * Math.cos(t)];
  });
}

export const STROKES = Object.freeze({
  'ㄱ': [[[22, 24], [78, 24], [78, 84]]],
  'ㄴ': [[[24, 16], [24, 76], [80, 76]]],
  'ㄷ': [[[22, 22], [78, 22]], [[22, 22], [22, 78], [78, 78]]],
  'ㅅ': [[[50, 18], [24, 82]], [[42, 46], [78, 82]]],
  'ㅎ': [[[40, 10], [60, 10]], [[20, 28], [80, 28]], circle(50, 62, 22)],
  'ㅋ': [[[22, 24], [78, 24], [78, 84]], [[24, 54], [78, 54]]],
});

/** 자음의 획 목록 (없는 글자면 오류) */
export function strokesOf(letter) {
  const strokes = STROKES[letter];
  if (!strokes) throw new Error(`[strokes] 획이 없는 글자입니다: ${letter}`);
  return strokes;
}
