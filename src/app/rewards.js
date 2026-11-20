// 놀이를 끝냈을 때 보상 계산 (화면과 상관없음): 놀이 하나를 끝낼 때마다 스티커 한 장.
// 아직 못 모은 동물부터 주고, 6마리를 다 모으면 아무 동물이나 "또" 준다.
import { freezeProgress } from '../storage/progress.js';
import { pickOne } from '@공통/games/logic.js';
import { ANIMALS, ACTIVITY_KEYS } from '@권자료';

/**
 * @returns { progress, sticker: {key,name}, isNew }
 */
export function finishActivity(progress, activityKey, rnd = Math.random) {
  if (!ACTIVITY_KEYS.includes(activityKey)) throw new Error(`[rewards] 없는 놀이입니다: ${activityKey}`);

  const missing = ANIMALS.filter((a) => !progress.stickers.includes(a.key));
  const isNew = missing.length > 0;
  const { key, name } = pickOne(isNew ? missing : ANIMALS, rnd);

  return {
    progress: freezeProgress({
      ...progress,
      done: { ...progress.done, [activityKey]: true },
      stickers: isNew ? [...progress.stickers, key] : progress.stickers,
    }),
    sticker: { key, name },
    isNew,
  };
}
