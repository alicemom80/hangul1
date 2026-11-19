import { describe, test, expect, vi } from 'vitest';
import { inAppKind, externalUrl, openInDefaultBrowser } from '../../src/app/inapp.js';

const KAKAO_ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S921N; wv) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 KAKAOTALK/10.4.0';
const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';
const INSTA_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 300.0';
const SAFARI_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';
const LOC = { href: 'https://alicemom80.github.io/hangul1/', host: 'alicemom80.github.io', pathname: '/hangul1/', search: '', protocol: 'https:' };

describe('앱 안 브라우저 판별', () => {
  test('카카오톡·인스타그램·웹뷰는 앱 안, 크롬·사파리는 아님', () => {
    expect(inAppKind(KAKAO_ANDROID)).toBe('kakao');
    expect(inAppKind(INSTA_IOS)).toBe('other');
    expect(inAppKind(`${CHROME_ANDROID} ; wv)`)).toBe('other');
    expect(inAppKind(CHROME_ANDROID)).toBeNull();
    expect(inAppKind(SAFARI_IOS)).toBeNull();
  });
  test('카카오톡은 전용 주소, 안드로이드는 intent, 아이폰 인스타는 열 방법 없음', () => {
    expect(externalUrl('kakao', KAKAO_ANDROID, LOC)).toBe(`kakaotalk://web/openExternal?url=${encodeURIComponent(LOC.href)}`);
    expect(externalUrl('other', `${CHROME_ANDROID}; wv)`, LOC)).toBe('intent://alicemom80.github.io/hangul1/#Intent;scheme=https;action=android.intent.action.VIEW;end');
    expect(externalUrl('other', INSTA_IOS, LOC)).toBeNull();
  });
  test('보내기: 앱 안이면 moved/manual, 기본 브라우저면 normal(아무것도 안 함)', () => {
    const go = vi.fn();
    expect(openInDefaultBrowser({ userAgent: KAKAO_ANDROID, location: LOC, go })).toBe('moved');
    expect(go).toHaveBeenCalledTimes(1);
    expect(openInDefaultBrowser({ userAgent: INSTA_IOS, location: LOC, go })).toBe('manual');
    expect(openInDefaultBrowser({ userAgent: CHROME_ANDROID, location: LOC, go })).toBe('normal');
    expect(go).toHaveBeenCalledTimes(1);
  });
});
