/**
 * SFX - Web Audio API 기반 게임 사운드 효과 모듈
 * 외부 오디오 파일 없이 합성음만 사용
 */
(function (global) {
  'use strict';

  let _ctx = null;
  let _muted = false;

  function getCtx() {
    if (!_ctx) {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
    return _ctx;
  }

  /**
   * 단일 톤 재생
   * @param {AudioContext} ctx
   * @param {number} freq - 주파수 (Hz)
   * @param {number} startTime - 시작 시각 (ctx.currentTime 기준)
   * @param {number} duration - 지속 시간 (초)
   * @param {string} type - 파형 타입 (sine|square|triangle|sawtooth)
   * @param {number} gain - 최대 음량 (0~1)
   */
  function playTone(ctx, freq, startTime, duration, type, gain) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(gain, startTime + 0.005);
    env.gain.setValueAtTime(gain, startTime + duration - 0.01);
    env.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(env);
    env.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * 아르페지오 재생 헬퍼
   * @param {AudioContext} ctx
   * @param {number[]} freqs - 주파수 배열
   * @param {number} noteDuration - 각 음표 길이 (초)
   * @param {string} type - 파형 타입
   * @param {number} gain - 음량
   */
  function playArpeggio(ctx, freqs, noteDuration, type, gain) {
    const now = ctx.currentTime;
    freqs.forEach(function (freq, i) {
      playTone(ctx, freq, now + i * noteDuration, noteDuration, type, gain);
    });
  }

  const SOUNDS = {
    /**
     * 짧은 UI 클릭음 (800Hz, 0.08초, sine)
     */
    click: function (ctx) {
      playTone(ctx, 800, ctx.currentTime, 0.08, 'sine', 0.1);
    },

    /**
     * 점수 획득 - 도-미-솔 상승 아르페지오 (각 0.1초)
     * C5=523, E5=659, G5=784
     */
    score: function (ctx) {
      playArpeggio(ctx, [523, 659, 784], 0.1, 'sine', 0.12);
    },

    /**
     * 콤보 - 도-미-솔-높은도 빠른 상승 (triangle)
     * C5=523, E5=659, G5=784, C6=1047
     */
    combo: function (ctx) {
      playArpeggio(ctx, [523, 659, 784, 1047], 0.08, 'triangle', 0.14);
    },

    /**
     * 레벨업 - 라-도#-미-높은라 fanfare (square, 작은 음량)
     * A4=440, C#5=554, E5=659, A5=880
     */
    levelup: function (ctx) {
      playArpeggio(ctx, [440, 554, 659, 880], 0.12, 'square', 0.08);
    },

    /**
     * 게임오버 - 하강 톤 400→300→200Hz (sawtooth)
     */
    gameover: function (ctx) {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var env = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.2);
      osc.frequency.linearRampToValueAtTime(200, now + 0.45);

      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.13, now + 0.01);
      env.gain.setValueAtTime(0.13, now + 0.4);
      env.gain.linearRampToValueAtTime(0, now + 0.5);

      osc.connect(env);
      env.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    },

    /**
     * 승리 - 도-미-솔-높은도-솔-높은도 축하 멜로디 (sine)
     * C5=523, E5=659, G5=784, C6=1047
     */
    win: function (ctx) {
      var notes = [523, 659, 784, 1047, 784, 1047];
      var durations = [0.1, 0.1, 0.1, 0.15, 0.08, 0.2];
      var now = ctx.currentTime;
      var t = now;

      notes.forEach(function (freq, i) {
        playTone(ctx, freq, t, durations[i], 'sine', 0.18);
        t += durations[i];
      });
    },
  };

  const SFX = {
    get muted() {
      return _muted;
    },
    set muted(val) {
      _muted = !!val;
    },

    play: function (name) {
      if (_muted) return;
      try {
        var fn = SOUNDS[name];
        if (!fn) return;
        var ctx = getCtx();
        fn(ctx);
      } catch (e) {
        // 오디오 오류는 무시
      }
    },
  };

  global.SFX = SFX;
})(typeof window !== 'undefined' ? window : this);
