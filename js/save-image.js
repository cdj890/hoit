// save-image.js — Canvas 기반 결과 이미지 저장 유틸리티
// createElement만 사용 (innerHTML 금지), offscreen Canvas

(function(){
  'use strict';

  /**
   * wrapText: Canvas ctx에서 텍스트를 maxWidth에 맞춰 줄 바꿈
   * @returns {number} 다음 y 좌표
   */
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + ' ';
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y);
    return y + lineHeight;
  }

  /**
   * saveResultImage: Canvas에 결과를 렌더링하고 PNG로 다운로드
   * @param {Object} opts
   *   - testName {string}  테스트 이름 (예: "MBTI 성격유형 테스트")
   *   - resultType {string} 결과 유형 (예: "ENFP", "고양이 타입")
   *   - emoji {string}     이모지 (예: "🎨")
   *   - desc {string}      설명 한 줄
   *   - accentColor {string} 강조 색상 (예: "#7B68EE")
   *   - filename {string}  다운로드 파일명
   */
  function saveResultImage(opts) {
    var W = 600;
    var H = 400;

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    // --- 배경 그라디언트 ---
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0f0f1e');
    grad.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // --- 테두리 (accent 컬러) ---
    var accent = opts.accentColor || '#7B68EE';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    // --- 상단: 테스트 이름 ---
    ctx.fillStyle = '#aaaacc';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.testName, W / 2, 50);

    // --- 구분선 ---
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 72);
    ctx.lineTo(W - 40, 72);
    ctx.stroke();

    // --- 중앙: 이모지 ---
    if (opts.emoji) {
      ctx.font = '60px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.emoji, W / 2, 155);
    }

    // --- 중앙: 결과 유형 ---
    ctx.fillStyle = accent;
    ctx.font = 'bold 42px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 긴 텍스트는 폰트 축소
    var typeText = opts.resultType || '';
    if (ctx.measureText(typeText).width > W - 80) {
      ctx.font = 'bold 28px "Segoe UI", sans-serif';
    }
    ctx.fillText(typeText, W / 2, 230);

    // --- 구분선 ---
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 265);
    ctx.lineTo(W - 40, 265);
    ctx.stroke();

    // --- 하단: 설명 한 줄 ---
    if (opts.desc) {
      ctx.fillStyle = '#cccccc';
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 최대 한 줄 (넘치면 말줄임)
      var descText = opts.desc;
      var maxW = W - 80;
      if (ctx.measureText(descText).width > maxW) {
        while (ctx.measureText(descText + '...').width > maxW && descText.length > 0) {
          descText = descText.slice(0, -1);
        }
        descText = descText + '...';
      }
      ctx.fillText(descText, W / 2, 305);
    }

    // --- 워터마크 ---
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('hoit.me', W - 20, H - 22);

    // --- PNG 다운로드 ---
    var filename = (opts.filename || 'result') + '.png';
    try {
      var dataURL = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = dataURL;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert('이미지 저장에 실패했습니다.');
    }
  }

  // 전역 노출
  window._saveResultImage = saveResultImage;
})();
