// 앱 전용 기능. 게임 본문 다음에 실행된다.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var shown = function (id) { var el = $(id); return !!el && !el.classList.contains('hide'); };

  // ---------- 웹(PWA): 오프라인 실행을 위한 서비스 워커 등록 ----------
  if (!window.OVP_NATIVE) {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
    return;
  }

  // ---------- 안드로이드 앱(Capacitor) ----------
  var P = window.Capacitor.Plugins || {};

  // 1) 안드로이드 WebView에는 Web Share API가 없으므로, 기기의 공유 창으로 연결한다.
  function toBase64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1]); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  async function nativeShare(data) {
    data = data || {};
    var opt = {};
    if (data.text) opt.text = data.text;
    if (data.title) opt.title = data.title;
    if (data.url) opt.url = data.url;
    if (data.files && data.files.length) {
      var f = data.files[0];
      var saved = await P.Filesystem.writeFile({ path: f.name || 'office-villain.png', data: await toBase64(f), directory: 'CACHE' });
      opt.files = [saved.uri];
    }
    try { await P.Share.share(opt); }
    catch (e) {
      // 공유 창을 그냥 닫은 경우는 게임 쪽에서 '취소'로 처리하도록 AbortError로 바꿔 준다.
      if (/cancel/i.test(String(e && e.message))) { var a = new Error('Share canceled'); a.name = 'AbortError'; throw a; }
      throw e;
    }
  }
  if (P.Share && P.Filesystem) {
    try {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: function () { return true; } });
      Object.defineProperty(navigator, 'share', { configurable: true, value: nativeShare });
    } catch (e) {}

    // 2) WebView에서는 파일 내려받기가 동작하지 않으므로, '저장' 버튼도 공유 창을 연다.
    var save = $('cardSave');
    if (save) save.onclick = async function () {
      var card = window.OVP_CARD ? window.OVP_CARD() : null;
      if (!card || !card.file) return;
      try { navigator.clipboard.writeText(card.text).catch(function () {}); } catch (e) {}
      try {
        await nativeShare({ files: [card.file] });
        $('cardMsg').textContent = '공유 창에서 갤러리·드라이브 등 저장할 곳을 골라 주세요. 문구도 복사해 뒀어요 👊';
      } catch (e) {
        if (!e || e.name !== 'AbortError') $('cardMsg').textContent = '저장하지 못했어요. 카드를 길게 누르거나 화면을 캡처해 주세요.';
      }
    };
  }

  // 3) 뒤로가기 버튼
  if (P.App) P.App.addListener('backButton', function () {
    if (shown('cardOv')) { $('cardOv').classList.add('hide'); return; }
    if (shown('start')) { P.App.minimizeApp(); return; }
    if (shown('end')) { $('menuBtn').click(); return; }
    if (shown('box') || shown('roster')) return;            // 선택 화면은 화면 안의 버튼으로 닫는다.
    if (shown('slapExit')) { $('slapExit').click(); return; } // 게임 중이면 일시정지
    if (shown('pad')) { $('exitBtn').click(); }
  });
})();
