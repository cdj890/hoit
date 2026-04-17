/* compare.js - 친구 비교 링크 기능
 * 사용법: 각 테스트 결과 화면에서 _compareSetResult(data) 호출,
 *        페이지 로드 시 _compareCheckHash() 자동 실행
 */
(function(){
  var PARAM='compare=';

  /* base64url safe encode/decode */
  function b64enc(str){
    try{return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');}catch(e){return '';}
  }
  function b64dec(str){
    try{str=str.replace(/-/g,'+').replace(/_/g,'/');while(str.length%4)str+='=';return decodeURIComponent(escape(atob(str)));}catch(e){return null;}
  }

  /* 현재 결과 데이터를 hash에 담아 링크 복사 */
  window._compareGenLink=function(data,btn){
    var encoded=b64enc(JSON.stringify(data));
    var url=location.origin+location.pathname+'#'+PARAM+encoded;
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(function(){
        if(btn){var orig=btn.textContent;btn.textContent='복사 완료!';setTimeout(function(){btn.textContent=orig;},1500);}
      }).catch(function(){_fallbackCopy(url,btn);});
    }else{_fallbackCopy(url,btn);}
  };

  function _fallbackCopy(text,btn){
    var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px';document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');if(btn){var orig=btn.textContent;btn.textContent='복사 완료!';setTimeout(function(){btn.textContent=orig;},1500);}}catch(e){alert('복사 실패: '+text);}
    document.body.removeChild(ta);
  }

  /* 페이지 로드 시 hash에서 친구 결과 파싱 후 표시 */
  window._compareCheckHash=function(renderFriendFn){
    var hash=location.hash;
    if(!hash||hash.indexOf(PARAM)===-1)return;
    var encoded=hash.slice(hash.indexOf(PARAM)+PARAM.length);
    if(!encoded)return;
    var raw=b64dec(encoded);
    if(!raw)return;
    try{
      var data=JSON.parse(raw);
      renderFriendFn(data);
    }catch(e){}
  };
})();
