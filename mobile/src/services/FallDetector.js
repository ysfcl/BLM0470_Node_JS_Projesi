// ─────────────────────────────────────────────
//  FallDetector.js
//  Saf JavaScript — hiçbir dış bağımlılık yok.
//  Backend veya UI'ya bağımlı değil, bağımsız test edilebilir.
// ─────────────────────────────────────────────

// Ayarlanabilir eşikler
const CONFIG = {
  // Düşme: anlık ivme büyüklüğü bu değerin üzerine çıkarsa şüpheli
  FALL_THRESHOLD: 2.0,          // g cinsinden (normal: ~1.0 g)
  // Düşme sonrası hareketsizlik penceresi (ms)
  FALL_STILLNESS_WINDOW: 1500,
  // Hareketsizlik: bu süre (ms) boyunca magnitude değişmezse alarm
  INACTIVITY_THRESHOLD_MS: 30000, // 30 saniye (üretimde 5+ dk olur)
  // Hareketsizlik için magnitude değişim toleransı
  INACTIVITY_DELTA: 0.05,
};

export class FallDetector {
  constructor(onFall, onInactivity) {
    this.onFall = onFall;           // callback(timestamp)
    this.onInactivity = onInactivity; // callback(durationMs)

    this._lastMagnitude = null;
    this._lastMovementTime = Date.now();
    this._fallCandidateTime = null;
    this._inactivityFired = false;
  }

  /**
   * Her sensör örneğinde çağrılır.
   * @param {{ x: number, y: number, z: number }} accel  ivmeölçer (m/s²)
   */
  process(accel) {
    const now = Date.now();

    // Vektör büyüklüğünü g'ye çevir (1g ≈ 9.81 m/s²)
    const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2) / 9.81;

    // ── Düşme tespiti ──────────────────────────
    if (magnitude > CONFIG.FALL_THRESHOLD) {
      // Ani ivme artışı — düşme adayı
      this._fallCandidateTime = now;
    }

    if (this._fallCandidateTime) {
      const elapsed = now - this._fallCandidateTime;
      if (elapsed >= CONFIG.FALL_STILLNESS_WINDOW) {
        // Büyük ivmenin ardından yeterince hareketsiz kalındı → düşme
        if (magnitude < 1.2) {
          this.onFall?.(new Date().toISOString());
        }
        this._fallCandidateTime = null;
      }
    }

    // ── Hareketsizlik tespiti ──────────────────
    const delta = this._lastMagnitude !== null
      ? Math.abs(magnitude - this._lastMagnitude)
      : 1;

    if (delta > CONFIG.INACTIVITY_DELTA) {
      // Hareket var — sayacı sıfırla
      this._lastMovementTime = now;
      this._inactivityFired = false;
    } else {
      const stillDuration = now - this._lastMovementTime;
      if (
        stillDuration >= CONFIG.INACTIVITY_THRESHOLD_MS &&
        !this._inactivityFired
      ) {
        this._inactivityFired = true;
        this.onInactivity?.(stillDuration);
      }
    }

    this._lastMagnitude = magnitude;
    return { magnitude: parseFloat(magnitude.toFixed(3)) };
  }

  reset() {
    this._lastMagnitude = null;
    this._lastMovementTime = Date.now();
    this._fallCandidateTime = null;
    this._inactivityFired = false;
  }
}
