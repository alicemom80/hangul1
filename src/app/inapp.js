// 카카오톡·인스타그램 같은 앱 안의 브라우저(인앱 브라우저)는 음성·전체 화면·설치가 안 되는 일이 많다.
// 시작 버튼을 누르면 그 휴대폰의 기본 브라우저로 다시 열어 준다. 화면을 모르는 판별 부분은 따로 두어 시험한다.

const KAKAO = /KAKAOTALK/i;
// 앱 안 브라우저의 표시: 네이버·인스타그램·페이스북·라인·다음·안드로이드 웹뷰("; wv)")
const OTHER_IN_APP = /NAVER\(inapp|Instagram|FBAN|FBAV|FB_IAB|Line\/|DaumApps|;\s*wv\)/i;

/** 사용자 에이전트로 앱 안 브라우저인지: 'kakao' | 'other' | null */
export function inAppKind(userAgent) {
  if (KAKAO.test(userAgent)) return 'kakao';
  return OTHER_IN_APP.test(userAgent) ? 'other' : null;
}

/** 지금 주소를 기본 브라우저로 여는 주소 (안드로이드: intent, 카카오톡: 전용 주소). 열 방법이 없으면 null */
export function externalUrl(kind, userAgent, location) {
  if (kind === 'kakao') return `kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}`;
  if (/Android/i.test(userAgent)) {
    // package 없이 보내면 휴대폰의 기본 브라우저로 열린다
    return `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=${location.protocol.replace(':', '')};action=android.intent.action.VIEW;end`;
  }
  return null; // 아이폰의 다른 앱 안 브라우저는 앱이 열어 줄 방법이 없다
}

/**
 * 앱 안 브라우저면 기본 브라우저로 열기를 시도한다.
 * 돌려주는 값: 'moved' (다른 브라우저로 보냈다) | 'manual' (사용자가 직접 열어야 한다) | 'normal' (이미 기본 브라우저)
 */
export function openInDefaultBrowser({ userAgent = navigator.userAgent, location: loc = window.location, go = (url) => { window.location.href = url; } } = {}) {
  const kind = inAppKind(userAgent);
  if (!kind) return 'normal';
  const url = externalUrl(kind, userAgent, loc);
  if (!url) return 'manual';
  go(url);
  return 'moved';
}
