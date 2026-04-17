// js/recommend.js — 관련 콘텐츠 추천 위젯
// catalog.js가 먼저 로드되어야 함
// seo-content 영역 내 seo-nav 앞에 추천 카드 4개를 자동 주입
(function(){
  if(typeof CATALOG === 'undefined') return;

  // 현재 경로에서 카테고리 감지
  var path = location.pathname;
  var catMap = {
    '/games/':'game', '/tests/':'test', '/destiny/':'destiny',
    '/itknow/':'itknow', '/quiz/':'quiz', '/tools/':'tools',
    '/learn/':'learn', '/music/':'music', '/health/':'health',
    '/creative/':'creative', '/reading/':'reading'
  };
  var cat = null;
  var currentFile = null;
  for(var prefix in catMap){
    if(path.indexOf(prefix) !== -1){
      cat = catMap[prefix];
      currentFile = path.split('/').pop();
      break;
    }
  }
  if(!cat || !CATALOG[cat]) return;

  // 현재 페이지 제외
  var items = CATALOG[cat].filter(function(item){
    return item.path.split('/').pop() !== currentFile;
  });
  if(items.length === 0) return;

  // Fisher-Yates 셔플
  for(var i = items.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
  }
  items = items.slice(0, 4);

  // 스타일 주입
  var style = document.createElement('style');
  style.textContent = [
    '.rec-section{margin-top:24px;padding-top:20px;border-top:1px solid #2a2a4a}',
    '.rec-section h3{color:#FFD700;font-size:16px;margin-bottom:12px}',
    '.rec-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}',
    '@media(min-width:500px){.rec-grid{grid-template-columns:repeat(4,1fr)}}',
    '.rec-card{background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;',
    'padding:14px 10px;text-align:center;text-decoration:none;color:#fff;transition:all .2s;display:block}',
    '.rec-card:hover{border-color:#FFD700;transform:translateY(-2px)}',
    '.rec-emoji{font-size:28px;display:block;margin-bottom:6px}',
    '.rec-title{font-size:12px;color:#ccc;line-height:1.3;display:block}'
  ].join('');
  document.head.appendChild(style);

  // 섹션 컨테이너
  var section = document.createElement('div');
  section.className = 'rec-section';

  var heading = document.createElement('h3');
  heading.textContent = '다른 콘텐츠도 즐겨보세요';
  section.appendChild(heading);

  var grid = document.createElement('div');
  grid.className = 'rec-grid';

  items.forEach(function(item){
    var card = document.createElement('a');
    card.className = 'rec-card';
    card.href = item.path.split('/').pop();

    var emoji = document.createElement('span');
    emoji.className = 'rec-emoji';
    emoji.textContent = item.emoji;
    card.appendChild(emoji);

    var title = document.createElement('span');
    title.className = 'rec-title';
    title.textContent = item.title;
    card.appendChild(title);

    grid.appendChild(card);
  });

  section.appendChild(grid);

  // seo-content 영역 찾아서 seo-nav 앞에 삽입
  var seoNav = document.querySelector('.seo-content .seo-nav');
  if(seoNav){
    seoNav.parentNode.insertBefore(section, seoNav);
  }
})();
