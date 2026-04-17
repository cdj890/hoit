(function () {
  'use strict';

  var KAKAO_APP_KEY = 'c282167df2dd029a28e4d53c0cc1e017';
  var KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
  var OG_IMAGE_URL = 'https://hoit.me/og-image.png';

  // ── 페이지 메타 정보 추출 ──────────────────────────────────────────────────

  function getPageInfo() {
    var title = document.title || '';
    var descEl = document.querySelector('meta[name="description"]');
    var desc = descEl ? (descEl.getAttribute('content') || '') : '';
    var canonEl = document.querySelector('link[rel="canonical"]');
    var url = canonEl ? (canonEl.getAttribute('href') || window.location.href) : window.location.href;
    return { title: title, desc: desc, url: url };
  }

  // ── 카카오 SDK 동적 로드 및 초기화 ───────────────────────────────────────

  function ensureKakaoReady(cb) {
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_APP_KEY);
      }
      cb();
      return;
    }
    var script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.crossOrigin = 'anonymous';
    script.onload = function () {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_APP_KEY);
      }
      cb();
    };
    script.onerror = function () {
      cb(new Error('카카오 SDK 로드 실패'));
    };
    document.head.appendChild(script);
  }

  // ── 토스트 메시지 ─────────────────────────────────────────────────────────

  function showToast(message) {
    var toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    var s = toast.style;
    s.position = 'fixed';
    s.bottom = '120px';
    s.left = '50%';
    s.transform = 'translateX(-50%)';
    s.background = 'rgba(123,104,238,0.92)';
    s.color = '#fff';
    s.padding = '10px 20px';
    s.borderRadius = '20px';
    s.fontSize = '14px';
    s.fontWeight = 'bold';
    s.zIndex = '9999';
    s.pointerEvents = 'none';
    s.whiteSpace = 'nowrap';
    s.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
    s.transition = 'opacity 0.3s';
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2000);
  }

  // ── 공유 기능 ─────────────────────────────────────────────────────────────

  function copyLink(url) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () {
        showToast('링크가 복사되었습니다!');
      }).catch(function () {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(url) {
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast('링크가 복사되었습니다!');
    } catch (e) {
      showToast('복사에 실패했습니다.');
    }
    document.body.removeChild(ta);
  }

  function shareToTwitter(title, desc, url) {
    var text = title + (desc ? ' - ' + desc : '');
    window.open(
      'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
      '_blank',
      'width=600,height=400,noopener,noreferrer'
    );
  }

  function shareToKakao(title, desc, url) {
    ensureKakaoReady(function (err) {
      if (err || !window.Kakao || !window.Kakao.isInitialized()) {
        showToast('카카오 SDK를 불러오지 못했습니다.');
        return;
      }
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: title,
          description: desc,
          imageUrl: OG_IMAGE_URL,
          link: { mobileWebUrl: url, webUrl: url }
        },
        buttons: [{ title: '바로가기', link: { mobileWebUrl: url, webUrl: url } }]
      });
    });
  }

  // ── 패널 열기/닫기 ────────────────────────────────────────────────────────

  var overlay, panel;

  function openPanel() {
    if (overlay) overlay.classList.add('share-module-show');
    if (panel) panel.classList.add('share-module-show');
  }

  function closePanel() {
    if (overlay) overlay.classList.remove('share-module-show');
    if (panel) panel.classList.remove('share-module-show');
  }

  // ── DOM 생성 헬퍼 ─────────────────────────────────────────────────────────

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'textContent') {
          node.textContent = attrs[k];
        } else {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    if (children) {
      children.forEach(function (child) {
        if (child) node.appendChild(child);
      });
    }
    return node;
  }

  function makeShareOption(iconText, labelText, onClick) {
    var icon = el('span', { 'class': 'share-module-opt-icon', textContent: iconText });
    var label = el('span', { 'class': 'share-module-opt-label', textContent: labelText });
    var btn = el('button', { 'class': 'share-module-opt', type: 'button' }, [icon, label]);
    btn.addEventListener('click', function () {
      closePanel();
      onClick();
    });
    return btn;
  }

  // ── 스타일 주입 ───────────────────────────────────────────────────────────

  function injectStyles() {
    var css = [
      '.share-module-fab{position:fixed;bottom:70px;right:20px;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7B68EE,#00CED1);border:none;color:#fff;font-size:20px;cursor:pointer;z-index:1000;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(123,104,238,0.4);transition:all .2s;padding:0;}',
      '.share-module-fab:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(123,104,238,0.6);}',
      '@media(max-width:600px){.share-module-fab{bottom:62px;right:16px;width:40px;height:40px;font-size:18px;}}',
      '.share-module-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:1001;opacity:0;pointer-events:none;transition:opacity .2s;}',
      '.share-module-overlay.share-module-show{opacity:1;pointer-events:auto;}',
      '.share-module-panel{position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;border-top-left-radius:20px;border-top-right-radius:20px;padding:24px 20px 30px;z-index:1002;transform:translateY(100%);transition:transform .3s ease;border-top:1px solid #2a2a4a;}',
      '.share-module-panel.share-module-show{transform:translateY(0);}',
      '.share-module-title{text-align:center;font-size:16px;color:#fff;margin:0 0 16px;font-weight:bold;}',
      '.share-module-options{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;}',
      '.share-module-opt{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px 14px;border-radius:12px;background:#252545;border:1px solid #2a2a4a;transition:all .2s;min-width:70px;font-family:inherit;}',
      '.share-module-opt:hover{border-color:#7B68EE;transform:translateY(-2px);}',
      '.share-module-opt-icon{font-size:24px;line-height:1;}',
      '.share-module-opt-label{font-size:11px;color:#aaa;}',
      '.share-module-close{display:block;margin:16px auto 0;background:#252545;border:1px solid #2a2a4a;color:#888;padding:8px 24px;border-radius:10px;cursor:pointer;font-size:14px;font-family:inherit;}'
    ].join('');

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── 메인 초기화 ───────────────────────────────────────────────────────────

  function init() {
    injectStyles();

    var info = getPageInfo();

    // FAB 버튼
    var fab = el('button', {
      'class': 'share-module-fab',
      type: 'button',
      title: '공유하기',
      'aria-label': '공유하기'
    });
    fab.textContent = '📤';
    fab.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: info.title, text: info.desc, url: info.url }).catch(function () {
          openPanel();
        });
      } else {
        openPanel();
      }
    });

    // 오버레이
    overlay = el('div', { 'class': 'share-module-overlay', role: 'presentation' });
    overlay.addEventListener('click', closePanel);

    // 패널 내부 옵션
    var kakaoBtn = makeShareOption('💬', '카카오톡', function () {
      shareToKakao(info.title, info.desc, info.url);
    });
    var twitterBtn = makeShareOption('🐦', 'Twitter/X', function () {
      shareToTwitter(info.title, info.desc, info.url);
    });
    var copyBtn = makeShareOption('🔗', '링크 복사', function () {
      copyLink(info.url);
    });

    var optionsDiv = el('div', { 'class': 'share-module-options' }, [kakaoBtn, twitterBtn, copyBtn]);

    var heading = el('p', { 'class': 'share-module-title', textContent: '공유하기' });

    var closeBtn = el('button', {
      'class': 'share-module-close',
      type: 'button',
      textContent: '닫기'
    });
    closeBtn.addEventListener('click', closePanel);

    // 패널
    panel = el('div', {
      'class': 'share-module-panel',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': '공유하기'
    }, [heading, optionsDiv, closeBtn]);

    document.body.appendChild(fab);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // 카카오 SDK 미리 로드 (백그라운드)
    ensureKakaoReady(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
