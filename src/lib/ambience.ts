// 国风环境音引擎 · Web Audio API 纯合成 · 无外部音频资源
// 五声音阶钟磬 + 滤波噪声拟研墨/煮茶/刻简/风炉 + 宣纸摩擦
// AudioContext 懒创建 · 首次用户手势后 resume · 规避浏览器自动播放策略
import type { Dynasty } from "@/store/themeStore";

const MUTE_KEY = "qingyan-muted";

class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = false;
  // 思考中环境音的定时器 · 停止时清除
  private thinkTimer: number | null = null;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      this.muted = false;
    }
  }

  /** 懒创建 AudioContext + 主增益 + 噪声缓冲 · 首次用户手势后调用 */
  private ensure() {
    if (this.ctx) return;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.42;
    this.master.connect(this.ctx.destination);
    this.noise = this.makeNoise();
  }

  /** 生成 2s 白噪声缓冲 · 供研墨/煮茶/纸摩擦等滤波复用 */
  private makeNoise(): AudioBuffer {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** 用户手势后唤醒 AudioContext · 由首次点击/键盘触发 */
  resume() {
    this.ensure();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  isMuted() {
    return this.muted;
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch {
      /* 隐私模式或配额已满 · 忽略 */
    }
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.42, this.ctx.currentTime, 0.08);
    }
  }

  // ─── 音色原子 ──────────────────────────────────────────

  /** 钟磬单音 · 正弦 + 谐波 · 五声音阶用 */
  private bell(freq: number, t: number, dur: number, gain = 0.18) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    o2.type = "sine";
    o2.frequency.value = freq * 2; // 八度谐音
    o2.detune.value = 4;
    const g2 = ctx.createGain();
    g2.gain.value = 0.3;
    o.connect(g);
    o2.connect(g2).connect(g);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this.master);
    o.start(t);
    o2.start(t);
    o.stop(t + dur);
    o2.stop(t + dur);
  }

  /** 滤波噪声脉冲 · 用于研墨/纸摩擦/刻简 */
  private noiseBurst(t: number, dur: number, type: BiquadFilterType, freq: number, q: number, gain = 0.15) {
    if (!this.ctx || !this.master || !this.noise) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const flt = ctx.createBiquadFilter();
    flt.type = type;
    flt.frequency.value = freq;
    flt.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(flt).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  // ─── 场景音 ────────────────────────────────────────────

  /** 朝代切换 · 两声五声音阶钟磬 · 悠远不刺耳 */
  dynastySwitch() {
    this.resume();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // 五声音阶 宫商角徵羽 · 取 C5 E5 G5 · 两声错开
    this.bell(523.25, t, 1.6, 0.16); // C5
    this.bell(659.25, t + 0.12, 1.4, 0.12); // E5
    this.bell(783.99, t + 0.24, 1.8, 0.1); // G5
  }

  /** 卷轴展开 · 宣纸摩擦 · 滤波噪声由弱渐强再收 */
  scrollOpen() {
    this.resume();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.9, "bandpass", 2400, 0.8, 0.12);
    this.noiseBurst(t + 0.3, 0.6, "bandpass", 1800, 0.6, 0.08);
  }

  /** 落笔送出 · 毛笔一拂 · 短促高频噪声 */
  brushSend() {
    this.resume();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.28, "highpass", 1500, 1, 0.1);
  }

  /** 收信 · 一声清磬 · 比 dynastySwitch 更轻更短 */
  chime() {
    this.resume();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.bell(880, t, 1.0, 0.1); // A5
  }

  // ─── 思考中环境音 · 朝代专属 · 循环至 stopThinking ──────

  /** 开始思考环境音 · 按朝代循环播放细微音效 */
  startThinking(dynasty: Dynasty) {
    this.resume();
    if (!this.ctx) return;
    this.stopThinking();
    const schedule = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      switch (dynasty) {
        case "song":
          // 研墨 · 低频闷响周期 · 模拟墨锭摩擦砚台
          this.noiseBurst(t, 0.18, "lowpass", 320, 1, 0.06);
          this.noiseBurst(t + 0.4, 0.16, "lowpass", 300, 1, 0.05);
          break;
        case "ming":
          // 煮茶 · 偶发水沸气泡 · 低频短促
          this.noiseBurst(t, 0.1, "bandpass", 500, 2, 0.04);
          this.noiseBurst(t + 0.7, 0.08, "bandpass", 600, 2, 0.03);
          break;
        case "qin":
          // 刻简 · 短促刻木声 · 高频噪声
          this.noiseBurst(t, 0.05, "highpass", 2500, 1, 0.05);
          this.noiseBurst(t + 0.6, 0.05, "highpass", 2400, 1, 0.04);
          break;
        case "tang":
          // 风炉 · 低频火声持续 + 偶发噼啪
          this.noiseBurst(t, 0.5, "lowpass", 400, 0.7, 0.04);
          this.noiseBurst(t + 0.5, 0.04, "highpass", 3000, 1, 0.05);
          break;
      }
    };
    schedule();
    // 每 1.2s 循环一轮 · 与器物动画节奏近似同步
    this.thinkTimer = window.setInterval(schedule, 1200);
  }

  /** 停止思考环境音 */
  stopThinking() {
    if (this.thinkTimer !== null) {
      clearInterval(this.thinkTimer);
      this.thinkTimer = null;
    }
  }
}

export const ambience = new Ambience();
