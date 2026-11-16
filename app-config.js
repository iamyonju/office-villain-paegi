// 앱 환경 설정. 게임 본문보다 먼저 실행된다.
// 안드로이드 앱(Capacitor) 안에서 실행 중인지 여부
window.OVP_NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

// 웹에 공개한 게임 주소. 안드로이드 앱에서 '친구 도전장' 링크를 만들 때 사용한다.
// 예: 'https://example.com/office-villain/'  (비워 두면 앱에서는 도전장 링크 기능이 숨겨진다)
window.OVP_PUBLIC_URL = 'https://iamyonju.github.io/office-villain-paegi/';

// 공유 링크의 기준 주소: 웹에서는 현재 주소, 앱에서는 위에 적은 공개 주소
window.OVP_URL = window.OVP_NATIVE ? window.OVP_PUBLIC_URL : location.origin + location.pathname;
