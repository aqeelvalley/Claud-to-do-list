  /* ===== World kit: iso maths, colour helpers and Canvas drawing primitives =====
   * World coords are iso units (a, b, z). Screen = (a - b, (a + b)/2 - z).
   * Light comes from the upper left: top faces brightest, +b ("L") faces
   * mid, +a ("R") faces darkest. Shadows fall towards +a.
   */
  const TAU = Math.PI * 2;
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (x, y, t) => x + (y - x) * t;
  const rgb = (hex) => {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    return [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
  };
  const hexOf = (r, g, b) => "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  const mix = (c1, c2, t) => { const p = rgb(c1), q = rgb(c2); return hexOf(lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)); };
  // flat style: shadows lean towards a dusky violet, highlights towards warm white
  const shade = (c, t) => (t >= 0 ? mix(c, "#FFF8F0", t) : mix(c, "#3A3158", -t));
  const rgba = (c, a) => { const p = rgb(c); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; };
  const hash = (s) => { let t = 2166136261; for (let k = 0; k < s.length; k++) { t ^= s.charCodeAt(k); t = Math.imul(t, 16777619); } return t >>> 0; };
  const rng = (seed) => { let t = seed >>> 0; return () => { t = (t + 0x6d2b79f5) >>> 0; let r = Math.imul(t ^ (t >>> 15), t | 1); r ^= r + Math.imul(r ^ (r >>> 7), r | 61); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
  const OUT = null; // flat art: no outlines
  /* Monument-Valley pass: every solid pen colour is softened - saturation
     capped, lightness lifted, cool darks nudged towards dusky violet. */
  const PAST = new Map();
  const pastel = (c) => {
    if (typeof c !== "string" || c[0] !== "#") return c;
    let v = PAST.get(c); if (v) return v;
    const [r, g, b] = rgb(c).map((x) => x / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d > 1e-6) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    if (h > 190 && h < 240) h += (240 - h) * 0.35; // steel blues lean periwinkle
    const L = 0.3 + 0.62 * l, S = s < 0.08 ? s : Math.min(0.72, s * 0.9 + 0.1);
    const C = (1 - Math.abs(2 * L - 1)) * S, X = C * (1 - Math.abs(((h / 60) % 2) - 1)), m = L - C / 2;
    const [r1, g1, b1] = h < 60 ? [C, X, 0] : h < 120 ? [X, C, 0] : h < 180 ? [0, C, X] : h < 240 ? [0, X, C] : h < 300 ? [X, 0, C] : [C, 0, X];
    v = hexOf((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
    if (d <= 1e-6 && l < 0.5) v = mix(v, "#5A4E7A", 0.3); // greys/blacks go violet
    PAST.set(c, v); return v;
  };

  /* A pen draws iso geometry into a 2D context around an origin (ox, oy).
     opts.emit: draw the emissive layer instead. Ordinary geometry then erases
     (so nearer parts hide lights behind them) and only lit windows, signs and
     glows paint. opts.lit(k) says whether window k is lit. */
  function pen(ctx, ox = 0, oy = 0, opts = {}) {
    const E = !!opts.emit, litFn = opts.lit || (() => false);
    let winK = 0;
    const P = (a, b, z = 0) => [ox + a - b, oy + (a + b) / 2 - z];
    const erase = () => { ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "#000"; ctx.fill(); ctx.globalCompositeOperation = "source-over"; };
    const path = (pts) => {
      ctx.beginPath();
      pts.forEach((p, k) => { const [x, y] = P(p[0], p[1], p[2] || 0); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath();
    };
    const poly = (pts, fill, stroke = OUT, lw = 0.7) => {
      path(pts);
      if (E) { if (fill) erase(); return; }
      if (fill) { ctx.fillStyle = pastel(fill); ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.stroke(); }
    };
    const line = (p0, p1, color, lw = 1, cap = "round") => {
      if (E) return;
      if (typeof color === "string" && color.startsWith("rgba")) return; // flat art: no texture lines
      const [x0, y0] = P(p0[0], p0[1], p0[2] || 0), [x1, y1] = P(p1[0], p1[1], p1[2] || 0);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
      ctx.strokeStyle = pastel(color); ctx.lineWidth = lw; ctx.lineCap = cap; ctx.stroke();
    };
    /* axis-aligned box centred on (x, y) */
    const box = (x, y, z, w, d, h, c, o = {}) => {
      const x0 = x - w / 2, x1 = x + w / 2, y0 = y - d / 2, y1 = y + d / 2, z1 = z + h;
      const st = o.stroke === undefined ? OUT : o.stroke;
      if (h > 0) {
        poly([[x0, y1, z], [x1, y1, z], [x1, y1, z1], [x0, y1, z1]], o.left || c, st);
        poly([[x1, y0, z], [x1, y1, z], [x1, y1, z1], [x1, y0, z1]], o.right || shade(c, -0.34), st);
      }
      poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], o.top || shade(c, 0.2), st);
    };
    /* quad on a face of a box: 'L' = +b face, 'R' = +a face; u across, v up (0..1) */
    const faceQ = (bx, face, u0, u1, v0, v1, inset = 0.4) => {
      const { x, y, z = 0, w, d, h } = bx;
      if (face === "L") { const yy = y + d / 2 + inset; return [[x - w / 2 + u0 * w, yy, z + v0 * h], [x - w / 2 + u1 * w, yy, z + v0 * h], [x - w / 2 + u1 * w, yy, z + v1 * h], [x - w / 2 + u0 * w, yy, z + v1 * h]]; }
      const xx = x + w / 2 + inset; return [[xx, y - d / 2 + u0 * d, z + v0 * h], [xx, y - d / 2 + u1 * d, z + v0 * h], [xx, y - d / 2 + u1 * d, z + v1 * h], [xx, y - d / 2 + u0 * d, z + v1 * h]];
    };
    const faceP = (bx, face, u, v, inset = 0.5) => {
      const { x, y, z = 0, w, d, h } = bx;
      return face === "L" ? [x - w / 2 + u * w, y + d / 2 + inset, z + v * h] : [x + w / 2 + inset, y - d / 2 + u * d, z + v * h];
    };
    /* vertical cylinder */
    const cyl = (x, y, z, r, h, c, o = {}) => {
      const [cx, cyb] = P(x, y, z), cyt = cyb - h, rx = r * 1.4142, ry = r * 0.7071;
      ctx.beginPath(); ctx.moveTo(cx - rx, cyt); ctx.lineTo(cx - rx, cyb); ctx.ellipse(cx, cyb, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, cyt); ctx.ellipse(cx, cyt, rx, ry, 0, 0, Math.PI, true); ctx.closePath();
      if (E) { erase(); return { cx, cyt, cyb, rx, ry }; }
      // flat two-tone: lit left half, shaded right half
      ctx.fillStyle = pastel(c); ctx.fill();
      const half = (col, zb, zt2) => { ctx.beginPath(); ctx.moveTo(cx, cyb - zt2 + ry); ctx.lineTo(cx, cyb - zb + ry); ctx.ellipse(cx, cyb - zb, rx, ry, 0, Math.PI / 2, 0, true); ctx.lineTo(cx + rx, cyb - zt2); ctx.ellipse(cx, cyb - zt2, rx, ry, 0, 0, Math.PI / 2, false); ctx.closePath(); ctx.fillStyle = pastel(col); ctx.fill(); };
      half(shade(c, -0.24), 0, h);
      (o.bands || []).forEach(([z0, z1, bc]) => {
        ctx.beginPath(); ctx.moveTo(cx - rx, cyb - z1); ctx.lineTo(cx - rx, cyb - z0); ctx.ellipse(cx, cyb - z0, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, cyb - z1); ctx.ellipse(cx, cyb - z1, rx, ry, 0, 0, Math.PI, false); ctx.closePath();
        ctx.fillStyle = pastel(bc); ctx.fill();
        half(shade(bc, -0.24), z0, z1);
      });
      if (!o.noTop) { ctx.beginPath(); ctx.ellipse(cx, cyt, rx, ry, 0, 0, TAU); ctx.fillStyle = pastel(o.top || shade(c, 0.22)); ctx.fill(); }
      return { cx, cyt, cyb, rx, ry };
    };
    /* gable roof over a box footprint; ridge along 'a' or 'b' */
    const gable = (x, y, z, w, d, rh, c, axis = "a", wall = "#F6EDDF", ov = 4) => {
      const x0 = x - w / 2 - ov, x1 = x + w / 2 + ov, y0 = y - d / 2 - ov, y1 = y + d / 2 + ov, zt = z + rh;
      if (axis === "a") {
        poly([[x + w / 2, y - d / 2, z], [x + w / 2, y + d / 2, z], [x + w / 2, y, zt]], shade(wall, -0.2));
        poly([[x0, y0, z], [x1, y0, z], [x1, y, zt], [x0, y, zt]], shade(c, -0.1));
        poly([[x0, y1, z], [x1, y1, z], [x1, y, zt], [x0, y, zt]], c);
        for (let k = 1; k < 5; k++) { const t = k / 5; line([x0, lerp(y1, y, t), lerp(z, zt, t)], [x1, lerp(y1, y, t), lerp(z, zt, t)], shade(c, -0.14), 0.8); }
        line([x0, y, zt], [x1, y, zt], shade(c, -0.3), 1.4);
      } else {
        poly([[x - w / 2, y + d / 2, z], [x + w / 2, y + d / 2, z], [x, y + d / 2, zt]], wall);
        poly([[x0, y0, z], [x0, y1, z], [x, y1, zt], [x, y0, zt]], shade(c, 0.05));
        poly([[x1, y0, z], [x1, y1, z], [x, y1, zt], [x, y0, zt]], shade(c, -0.16));
        for (let k = 1; k < 5; k++) { const t = k / 5; line([lerp(x1, x, t), y0, lerp(z, zt, t)], [lerp(x1, x, t), y1, lerp(z, zt, t)], shade(c, -0.28), 0.8); }
        line([x, y0, zt], [x, y1, zt], shade(c, -0.3), 1.4);
      }
    };
    const hip = (x, y, z, w, d, rh, c, ov = 4) => {
      const x0 = x - w / 2 - ov, x1 = x + w / 2 + ov, y0 = y - d / 2 - ov, y1 = y + d / 2 + ov, zt = z + rh;
      const ins = Math.min(w, d) / 2;
      const r0 = [x - w / 2 + ins * 0.6, y, zt], r1 = [x + w / 2 - ins * 0.6, y, zt];
      poly([[x0, y0, z], [x0, y1, z], r0], shade(c, 0.06));
      poly([[x0, y1, z], [x1, y1, z], r1, r0], c);
      poly([[x1, y0, z], [x1, y1, z], r1], shade(c, -0.18));
      for (let k = 1; k < 4; k++) { const t = k / 4; line([lerp(x0, r0[0], t), lerp(y1, y, t), lerp(z, zt, t)], [lerp(x1, r1[0], t), lerp(y1, y, t), lerp(z, zt, t)], shade(c, -0.14), 0.7); }
      line(r0, r1, shade(c, -0.3), 1.2);
    };
    /* window with frame, sill and glazing bars on a box face */
    const windowQ = (bx, face, u0, u1, v0, v1, _x, frame = "#FFF8EC") => {
      const k = winK++;
      if (E) {
        poly(faceQ(bx, face, u0 - 0.015, u1 + 0.015, v0 - 0.03, v1 + 0.03, 0.5), "#000", null);
        if (litFn(k)) { path(faceQ(bx, face, u0, u1, v0, v1, 0.7)); ctx.fillStyle = k % 3 ? "#FFD58A" : "#FFE9B8"; ctx.fill(); }
        return;
      }
      // flat recessed window: a deep inset with a light reveal on one side and a sill
      poly(faceQ(bx, face, u0, u1, v0, v1, 0.6), face === "L" ? "#4C5A80" : "#3D4969", null);
      poly(faceQ(bx, face, u0, lerp(u0, u1, 0.16), v0, v1, 0.7), face === "L" ? "#6A78A0" : "#56628A", null);
      poly(faceQ(bx, face, u0 - 0.02, u1 + 0.02, v0 - 0.05, v0, 1.2), shade(frame, -0.06), null);
    };
    const door = (bx, face, u, wu, hv, c = "#6E4A33") => {
      poly(faceQ(bx, face, u - wu / 2, u + wu / 2, 0, hv, 0.6), c, null);
      poly(faceQ(bx, face, u - wu / 2, u - wu / 2 + wu * 0.2, 0, hv, 0.7), shade(c, 0.18), null);
      if (!E) {
        const k = faceP(bx, face, u + wu * 0.28, hv * 0.45, 0.9);
        const [kx, ky] = P(k[0], k[1], k[2]); ctx.fillStyle = "#E9B949"; ctx.fillRect(kx - 0.7, ky - 0.7, 1.4, 1.4);
      }
      if (face === "L") box(bx.x - bx.w / 2 + u * bx.w, bx.y + bx.d / 2 + 3, 0, wu * bx.w + 6, 6, 2, "#D3C6AF");
      else box(bx.x + bx.w / 2 + 3, bx.y - bx.d / 2 + u * bx.d, 0, 6, wu * bx.d + 6, 2, "#D3C6AF");
    };
    const awning = (bx, face, u0, u1, v, c1, c2 = "#FFF8EC", depth = 10) => {
      const n = 6;
      for (let k = 0; k < n; k++) {
        const a0 = lerp(u0, u1, k / n), a1 = lerp(u0, u1, (k + 1) / n);
        const p0 = faceP(bx, face, a0, v), p1 = faceP(bx, face, a1, v);
        const off = face === "L" ? [0, depth, -7] : [depth, 0, -7];
        poly([p0, p1, [p1[0] + off[0], p1[1] + off[1], p1[2] + off[2]], [p0[0] + off[0], p0[1] + off[1], p0[2] + off[2]]], k % 2 ? c2 : c1, OUT, 0.5);
      }
    };
    /* sign board on a face; glows softly at night like neon */
    const sign = (bx, face, u, v, text, bg, fg = "#FFFFFF", size = 7, neon = true) => {
      const p = faceP(bx, face, u, v, 1.2);
      const [x, y] = P(p[0], p[1], p[2]);
      ctx.save();
      ctx.translate(x, y);
      ctx.transform(1, face === "L" ? 0.5 : -0.5, 0, 1, 0, 0);
      ctx.font = `700 ${size}px Fredoka, Nunito, sans-serif`;
      const tw = ctx.measureText(text).width + 8;
      ctx.beginPath(); ctx.rect(-tw / 2, -size * 0.8, tw, size * 1.55);
      if (E) {
        if (neon) { ctx.fillStyle = rgba(bg, 0.6); ctx.fill(); ctx.fillStyle = mix(fg, "#FFFFFF", 0.3); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, 0); }
        else erase();
        ctx.restore(); return;
      }
      ctx.fillStyle = bg; ctx.strokeStyle = OUT; ctx.lineWidth = 0.6; ctx.fill(); ctx.stroke();
      ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, 0);
      ctx.restore();
    };
    /* light source: painted only in the emissive layer */
    const glow = (a, b, z, r, color = "#FFE7A8", core = 1.6) => {
      if (!E) return;
      const [x, y] = P(a, b, z);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(color, 0.95)); g.addColorStop(0.25, rgba(color, 0.45)); g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      if (core) { ctx.fillStyle = "#FFFBEA"; ctx.beginPath(); ctx.arc(x, y, core, 0, TAU); ctx.fill(); }
    };
    /* fill the current raw path: colour mode paints, emissive mode erases */
    const fillPath = (fill) => { if (E) erase(); else { ctx.fillStyle = pastel(fill); ctx.fill(); } };
    return { P, path, poly, line, box, faceQ, faceP, cyl, gable, hip, windowQ, door, awning, sign, glow, fillPath, ctx, E, winCount: () => winK };
  }
