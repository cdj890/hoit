#!/usr/bin/env python3
"""
hoit.me quiz patcher
- 결과 화면: 오답 목록 + 결과 공유 버튼
- 타이머 모드: 시작 화면 모드 선택 + 60초 타이머
DOM API 사용, innerHTML 금지
"""
import re, os

QUIZ_DIR = os.path.dirname(os.path.abspath(__file__))

META = {
    'animal.html':    ('quiz_animal',    '\ub3d9\ubb3c \ud034\uc988'),
    'body.html':      ('quiz_body',      '\uc778\uccb4 \ud034\uc988'),
    'capitals.html':  ('quiz_capitals',  '\uc218\ub3c4 \ub9de\ucd94\uae30'),
    'celeb.html':     ('quiz_celeb',     '\uc5f0\uc608\uc778 \ud034\uc988'),
    'chemistry.html': ('quiz_chemistry', '\ud654\ud559 \ud034\uc988'),
    'flags.html':     ('quiz_flags',     '\uad6d\uae30 \ub9de\ucd94\uae30'),
    'heritage.html':  ('quiz_heritage',  '\ubb38\ud654\uc7ac \ud034\uc988'),
    'joseon.html':    ('quiz_joseon',    '\uc870\uc120\uc2dc\ub300 \ud034\uc988'),
    'landmark.html':  ('quiz_landmark',  '\ub79c\ub4dc\ub9c8\ud06c \ud034\uc988'),
    'language.html':  ('quiz_language',  '\uc138\uacc4 \uc5b8\uc5b4 \ud034\uc988'),
    'meme.html':      ('quiz_meme',      '\ubc08 \ud034\uc988'),
    'modern.html':    ('quiz_modern',    '\uadfc\ud604\ub300\uc0ac \ud034\uc988'),
    'movie.html':     ('quiz_movie',     '\uc601\ud654 \ud034\uc988'),
    'music.html':     ('quiz_music',     '\uc74c\uc545 \ud034\uc988'),
    'person.html':    ('quiz_person',    '\uc5ed\uc0ac \uc778\ubb3c \ud034\uc988'),
    'physics.html':   ('quiz_physics',   '\ubb3c\ub9ac \ud034\uc988'),
    'slang.html':     ('quiz_slang',     '\uc2e0\uc870\uc5b4 \ud034\uc988'),
    'space.html':     ('quiz_space',     '\uc6b0\uc8fc \ud034\uc988'),
    'timeline.html':  ('quiz_timeline',  '\uc5f0\ud45c \ud034\uc988'),
    'worldfood.html': ('quiz_worldfood', '\uc138\uacc4 \uc74c\uc2dd \ud034\uc988'),
}

NEW_CSS = (
    ".mode-select{display:flex;flex-direction:column;gap:12px;margin-top:24px}"
    ".mode-btn{background:#1a1a2e;border:2px solid #333;border-radius:14px;"
    "padding:18px 20px;cursor:pointer;font-size:16px;color:#fff;transition:all .2s;"
    "text-align:left;width:100%}"
    ".mode-btn:hover{border-color:#7B68EE;background:#252545}"
    ".mode-btn .mode-title{font-weight:bold;font-size:17px;margin-bottom:4px}"
    ".mode-btn .mode-desc{color:#aaa;font-size:13px}"
    ".timer-bar{background:#1a1a2e;border-radius:10px;height:10px;margin-bottom:14px;overflow:hidden}"
    ".timer-fill{background:linear-gradient(90deg,#4CAF50,#FFD700,#FF6B6B);height:100%;border-radius:10px;transition:width .5s linear}"
    ".timer-text{text-align:right;color:#FFD700;font-size:13px;font-weight:bold;margin-bottom:8px}"
    ".wrong-list{text-align:left;margin-top:18px;background:#1a1a2e;border-radius:12px;padding:14px;"
    "max-height:320px;overflow-y:auto}"
    ".wrong-list h3{color:#FF6B6B;font-size:14px;margin-bottom:10px;border-bottom:1px solid #2a2a4a;padding-bottom:6px}"
    ".wrong-item{margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #2a2a4a;font-size:13px}"
    ".wrong-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}"
    ".wrong-q{color:#ddd;margin-bottom:4px}"
    ".wrong-my{color:#F44336;font-size:12px}"
    ".wrong-ans{color:#4CAF50;font-size:12px}"
    ".share-btn{background:#252545;border:1px solid #7B68EE;color:#7B68EE;padding:10px 20px;"
    "border-radius:10px;font-size:14px;cursor:pointer;margin-top:10px;display:block;width:100%}"
    ".share-btn:hover{background:#7B68EE;color:#fff}"
)

def make_js(hub_id, quiz_name, filename, total):
    """Generate the full replacement JS block for a quiz file."""
    lines = []
    a = lines.append

    a("let cur=0,score=0,answered=false,wrongArr=[];")
    a("let timerMode=false,timerSec=60,timerInterval=null;")
    a("var ALL_Q=Q.slice();")
    a("")
    a("function showModeSelect(){")
    a("  var app=document.getElementById('app');")
    a("  var wrap=document.createElement('div');")
    a("  var h=document.createElement('h1');")
    a("  h.style.cssText='margin:0 0 8px';")
    a("  h.textContent=" + repr(quiz_name) + ";")
    a("  wrap.appendChild(h);")
    a("  var sub=document.createElement('p');")
    a("  sub.style.cssText='color:#aaa;font-size:14px;margin-bottom:4px';")
    a("  sub.textContent='\ubaa8\ub4dc\ub97c \uc120\ud0dd\ud558\uc138\uc694';")
    a("  wrap.appendChild(sub);")
    a("  var ms=document.createElement('div');ms.className='mode-select';")
    a("  var b1=document.createElement('button');b1.className='mode-btn';")
    a("  var b1t=document.createElement('div');b1t.className='mode-title';")
    a("  b1t.textContent='\uc77c\ubc18 \ubaa8\ub4dc';")
    a("  var b1d=document.createElement('div');b1d.className='mode-desc';")
    a("  b1d.textContent='10\ubb38\uc81c \u00b7 \uc624\ub2f5 \ud574\uc124 \u00b7 \ub4f1\uae09(S~D)';")
    a("  b1.appendChild(b1t);b1.appendChild(b1d);")
    a("  b1.onclick=function(){timerMode=false;_shuf(Q);cur=0;score=0;wrongArr=[];render();};")
    a("  var b2=document.createElement('button');b2.className='mode-btn';")
    a("  var b2t=document.createElement('div');b2t.className='mode-title';")
    a("  b2t.textContent='\u23f1 \ud0c0\uc774\uba38 \ubaa8\ub4dc (60\ucd08)';")
    a("  var b2d=document.createElement('div');b2d.className='mode-desc';")
    a("  b2d.textContent='\uc804\uccb4 " + str(total) + "\ubb38\uc81c \uc21c\ucc28 \uc5ed\ucd9c \u00b7 60\ucd08 \uc81c\ud55c \u00b7 \ucd5c\ub300\ud55c \ub9ce\uc774!';")
    a("  b2.appendChild(b2t);b2.appendChild(b2d);")
    a("  b2.onclick=function(){timerMode=true;cur=0;score=0;wrongArr=[];timerSec=60;startTimer();render();};")
    a("  ms.appendChild(b1);ms.appendChild(b2);")
    a("  wrap.appendChild(ms);")
    a("  app.textContent='';")
    a("  app.appendChild(wrap);")
    a("}")
    a("")
    a("function startTimer(){")
    a("  clearInterval(timerInterval);")
    a("  timerInterval=setInterval(function(){")
    a("    timerSec--;")
    a("    var fill=document.getElementById('tmr-fill');")
    a("    var txt=document.getElementById('tmr-txt');")
    a("    if(fill)fill.style.width=(timerSec/60*100)+'%';")
    a("    if(txt)txt.textContent=timerSec+'\ucd08';")
    a("    if(timerSec<=0){clearInterval(timerInterval);showResult();}")
    a("  },1000);")
    a("}")
    a("")
    a("function showResult(){")
    a("  clearInterval(timerInterval);")
    a("  var app=document.getElementById('app');")
    a("  var g=score>=9?'S':score>=7?'A':score>=5?'B':score>=3?'C':'D';")
    a("  _hub('" + hub_id + "',score*10);")
    a("  var frag=document.createDocumentFragment();")
    a("  var scoreEl=document.createElement('h1');")
    a("  scoreEl.style.cssText='margin:10px 0';")
    a("  scoreEl.textContent=score+'/'+(timerMode?ALL_Q.length:Q.length);")
    a("  frag.appendChild(scoreEl);")
    a("  if(!timerMode){")
    a("    var gradeEl=document.createElement('div');")
    a("    gradeEl.style.cssText='font-size:40px;color:#FFD700;font-weight:bold;margin:10px 0';")
    a("    gradeEl.textContent=g;")
    a("    frag.appendChild(gradeEl);")
    a("  }else{")
    a("    var tLabel=document.createElement('p');")
    a("    tLabel.style.cssText='color:#FFD700;font-size:16px;font-weight:bold;margin:8px 0';")
    a("    tLabel.textContent='\ud0c0\uc774\uba38 \uc885\ub8cc!';")
    a("    frag.appendChild(tLabel);")
    a("  }")
    a("  var msg=document.createElement('p');")
    a("  msg.style.color='#aaa';")
    a("  msg.textContent=score>=(timerMode?20:7)?'\ub300\ub2e8\ud574\uc694!':score>=(timerMode?10:5)?'\uc798\ud588\uc5b4\uc694!':'\ub2e4\uc74c\uc5d4 \ub354!';")
    a("  frag.appendChild(msg);")
    # share button - using closure to capture share text safely
    share_txt = quiz_name + " '+score+'/'+(timerMode?ALL_Q.length:Q.length)+' \uc815\ub2f5! hoit.me/quiz/" + filename
    a("  var shareText=" + repr(quiz_name) + "+'\\u00a0'+score+'/'+(timerMode?ALL_Q.length:Q.length)+' \uc815\ub2f5! hoit.me/quiz/" + filename + "';")
    a("  var shareBtn=document.createElement('button');")
    a("  shareBtn.className='share-btn';")
    a("  shareBtn.textContent='\uacb0\uacfc \uacf5\uc720 (\ud14d\uc2a4\ud2b8 \ubcf5\uc0ac)';")
    a("  (function(btn,txt){")
    a("    btn.onclick=function(){")
    a("      if(navigator.clipboard){")
    a("        navigator.clipboard.writeText(txt).then(function(){btn.textContent='\ubcf5\uc0ac\ub428!';}).catch(function(){fallbackCopy(btn,txt);});")
    a("      }else{fallbackCopy(btn,txt);}")
    a("    };")
    a("  })(shareBtn,shareText);")
    a("  frag.appendChild(shareBtn);")
    a("  if(wrongArr.length>0){")
    a("    var wl=document.createElement('div');wl.className='wrong-list';")
    a("    var wh=document.createElement('h3');")
    a("    wh.textContent='\uc624\ub2f5 \ubcf5\uc2b5 ('+wrongArr.length+'\ubb38\uc81c)';")
    a("    wl.appendChild(wh);")
    a("    wrongArr.forEach(function(w){")
    a("      var wi=document.createElement('div');wi.className='wrong-item';")
    a("      var wq=document.createElement('div');wq.className='wrong-q';wq.textContent=w.q;")
    a("      var wm=document.createElement('div');wm.className='wrong-my';")
    a("      wm.textContent='\ub0b4 \ub2f5: '+w.myAns;")
    a("      var wa=document.createElement('div');wa.className='wrong-ans';")
    a("      wa.textContent='\uc815\ub2f5: '+w.correct;")
    a("      wi.appendChild(wq);wi.appendChild(wm);wi.appendChild(wa);")
    a("      wl.appendChild(wi);")
    a("    });")
    a("    frag.appendChild(wl);")
    a("  }")
    a("  var retryBtn=document.createElement('button');")
    a("  retryBtn.className='btn';retryBtn.style.marginTop='14px';")
    a("  retryBtn.textContent='\ub2e4\uc2dc \ud558\uae30';")
    a("  retryBtn.onclick=function(){showModeSelect();};")
    a("  frag.appendChild(retryBtn);")
    a("  app.textContent='';")
    a("  app.appendChild(frag);")
    a("}")
    a("")
    a("function fallbackCopy(btn,txt){")
    a("  var ta=document.createElement('textarea');ta.value=txt;")
    a("  ta.style.cssText='position:fixed;opacity:0';")
    a("  document.body.appendChild(ta);ta.select();")
    a("  document.execCommand('copy');document.body.removeChild(ta);")
    a("  btn.textContent='\ubcf5\uc0ac\ub428!';")
    a("}")
    a("")
    a("function render(){")
    a("  var app=document.getElementById('app');")
    a("  var qPool=timerMode?ALL_Q:Q;")
    a("  if(cur>=qPool.length||(timerMode&&timerSec<=0)){showResult();return;}")
    a("  var q=qPool[cur],pct=(cur/qPool.length*100)|0;")
    a("  var frag=document.createDocumentFragment();")
    a("  if(timerMode){")
    a("    var tbar=document.createElement('div');tbar.className='timer-bar';")
    a("    var tf=document.createElement('div');tf.className='timer-fill';")
    a("    tf.id='tmr-fill';tf.style.width=(timerSec/60*100)+'%';")
    a("    tbar.appendChild(tf);frag.appendChild(tbar);")
    a("    var tt=document.createElement('div');tt.className='timer-text';")
    a("    tt.id='tmr-txt';tt.textContent=timerSec+'\ucd08';")
    a("    frag.appendChild(tt);")
    a("  }")
    a("  var prog=document.createElement('div');prog.className='progress';")
    a("  var pf=document.createElement('div');pf.className='progress-fill';")
    a("  pf.style.width=pct+'%';")
    a("  prog.appendChild(pf);frag.appendChild(prog);")
    a("  var card=document.createElement('div');card.className='q-card';")
    a("  var num=document.createElement('div');")
    a("  num.style.cssText='color:#888;font-size:13px;margin-bottom:8px';")
    a("  num.textContent=(cur+1)+'/'+qPool.length;")
    a("  card.appendChild(num);")
    a("  var qt=document.createElement('div');qt.className='q-text';qt.textContent=q.q;")
    a("  card.appendChild(qt);")
    a("  var opts=document.createElement('div');opts.className='opts';")
    a("  q.o.forEach(function(o,i){")
    a("    var d=document.createElement('div');")
    a("    d.className='opt';d.id='opt'+i;d.textContent=o;")
    a("    (function(idx){d.onclick=function(){answer(idx);};})(i);")
    a("    opts.appendChild(d);")
    a("  });")
    a("  card.appendChild(opts);")
    a("  var exp=document.createElement('div');exp.className='explain';exp.id='explain';")
    a("  exp.textContent=q.e||'';")
    a("  card.appendChild(exp);")
    a("  frag.appendChild(card);")
    a("  app.textContent='';")
    a("  app.appendChild(frag);")
    a("  answered=false;")
    a("}")
    a("")
    a("function answer(i){")
    a("  if(answered)return;answered=true;")
    a("  var qPool=timerMode?ALL_Q:Q;")
    a("  var q=qPool[cur];")
    a("  var optEl=document.getElementById('opt'+i);")
    a("  if(optEl)optEl.classList.add(i===q.a?'correct':'wrong');")
    a("  if(i!==q.a){")
    a("    var ca=document.getElementById('opt'+q.a);")
    a("    if(ca)ca.classList.add('correct');")
    a("    wrongArr.push({q:q.q,myAns:q.o[i],correct:q.o[q.a]});")
    a("  }")
    a("  if(i===q.a)score++;")
    a("  var el=document.getElementById('explain');")
    a("  if(el&&q.e)el.style.display='block';")
    a("  setTimeout(function(){cur++;render();},timerMode?800:1500);")
    a("}")
    a("")
    a("showModeSelect();")

    return "\n".join(lines)


def patch_file(fname):
    fpath = os.path.join(QUIZ_DIR, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    hub_id, quiz_name = META[fname]
    q_count = len(re.findall(r'"q":', content))
    total = q_count if q_count > 0 else 30

    # 1. CSS 추가
    if '.mode-select' not in content:
        content = content.replace(
            '@media(max-width:600px)',
            NEW_CSS + '@media(max-width:600px)',
            1
        )

    # 2. JS 블록 교체
    new_js = make_js(hub_id, quiz_name, fname, total)

    pat = re.compile(
        r'let cur=0,score=0,answered=false;.*?render\(\);',
        re.DOTALL
    )
    m = pat.search(content)
    if m:
        content = content[:m.start()] + new_js + content[m.end():]
        print(f'  [OK] {fname} (total={total})')
    else:
        print(f'  [SKIP] {fname} - pattern not found')
        return

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)


if __name__ == '__main__':
    for fname in sorted(META.keys()):
        fpath = os.path.join(QUIZ_DIR, fname)
        if os.path.exists(fpath):
            print(f'Patching {fname}...')
            patch_file(fname)
        else:
            print(f'  [MISSING] {fname}')
    print('\nDone.')
