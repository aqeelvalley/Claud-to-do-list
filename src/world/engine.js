  /* ===================== engine: ground, sprites, lighting, frame ===================== */
  const SEA_DROP = 14; // how far the sea sits below street level (seawall height)
  const inRect = (r, a, b, m = 0) => a >= r.a0 - m && a <= r.a1 + m && b >= r.b0 - m && b <= r.b1 + m;

  /* ---------- ground (static, drawn into cached chunks) ---------- */
  function drawGround(ctx, T) {
    const pn = pen(ctx, 0, 0);
    const P = pn.P;
    const rectPts = (r, z = 0, m = 0) => [[r.a0 - m, r.b0 - m, z], [r.a1 + m, r.b0 - m, z], [r.a1 + m, r.b1 + m, z], [r.a0 - m, r.b1 + m, z]];
    const landAt = (a, b) => T.land.some((r) => inRect(r, a, b)) || T.beaches.some((r) => inRect(r, a, b));
    // shallow water halo
    ctx.save();
    ctx.globalAlpha = 0.35;
    T.land.forEach((r) => pn.poly(rectPts(r, -SEA_DROP, 26), "#8FE0DA", null));
    T.beaches.forEach((r) => pn.poly(rectPts(r, -SEA_DROP, 34), "#A9ECE2", null));
    ctx.restore();
    // beaches: sand shelving into the sea with a soft wet edge
    T.beaches.forEach((r) => {
      const wob = (t) => 10 * Math.sin(t * 0.045) + 6 * Math.sin(t * 0.11 + 1);
      const out = [];
      const horiz = r.b1 - r.b0 < r.a1 - r.a0;
      const N = 40;
      for (let k = 0; k <= N; k++) {
        const u = k / N;
        if (horiz) { const a = lerp(r.a0, r.a1, u); const edge = Math.min(1, Math.min(u, 1 - u) * 6); out.push([a, lerp(r.b0 + 30, r.b1 + wob(a), edge), -SEA_DROP * (1 - edge * 0.2)]); }
        else { const b = lerp(r.b0, r.b1, u); const edge = Math.min(1, Math.min(u, 1 - u) * 6); out.push([lerp(r.a1 - 30, r.a0 + wob(b), edge), b, -SEA_DROP * (1 - edge * 0.2)]); }
      }
      const inner = horiz ? [[r.a1, r.b0, 0], [r.a0, r.b0, 0]] : [[r.a1, r.b1, 0], [r.a1, r.b0, 0]];
      pn.poly(horiz ? [...inner, ...out] : [...inner.reverse(), ...out.reverse()], "#EBCB94", null);
      pn.poly(horiz ? [...inner, ...out.map((p) => [p[0], p[1] - 16, p[2] * 0.4])] : [...inner, ...out.map((p) => [p[0] + 16, p[1], p[2] * 0.4])], "#F3D8A6", null);
      ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 1.6; ctx.beginPath();
      out.forEach((p, k) => { const [x, y] = P(p[0], p[1] + (horiz ? 3 : 0), p[2] - 1); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    });
    // seawalls on the visible (+a / +b) sides of every land rect
    const beachAt = (a, b) => T.beaches.some((r) => inRect(r, a, b, 4));
    T.land.forEach((r) => {
      [["b", r.b1], ["a", r.a1]].forEach(([side, v]) => {
        const lo = side === "b" ? r.a0 : r.b0, hi = side === "b" ? r.a1 : r.b1;
        let run = null;
        const flush = (end) => {
          if (!run) return;
          const [s, e] = [run, end];
          const pts = side === "b" ? [[s, v, 0], [e, v, 0], [e, v, -SEA_DROP], [s, v, -SEA_DROP]] : [[v, s, 0], [v, e, 0], [v, e, -SEA_DROP], [v, s, -SEA_DROP]];
          pn.poly(pts, side === "b" ? "#B9AE9C" : "#9E937F", "rgba(60,40,22,0.35)", 0.8);
          for (let x = s + 12; x < e; x += 12) {
            const p0 = side === "b" ? [x, v + 0.3, 0] : [v + 0.3, x, 0], p1 = side === "b" ? [x, v + 0.3, -SEA_DROP] : [v + 0.3, x, -SEA_DROP];
            pn.line(p0, p1, "rgba(60,40,22,0.18)", 0.7);
          }
          pn.line(side === "b" ? [s, v + 0.3, -7] : [v + 0.3, s, -7], side === "b" ? [e, v + 0.3, -7] : [v + 0.3, e, -7], "rgba(60,40,22,0.15)", 0.7);
          pn.line(side === "b" ? [s, v + 2, -SEA_DROP] : [v + 2, s, -SEA_DROP], side === "b" ? [e, v + 2, -SEA_DROP] : [v + 2, e, -SEA_DROP], "rgba(255,255,255,0.7)", 1.6);
          run = null;
        };
        for (let t = lo; t <= hi; t += 4) {
          const oa = side === "b" ? t : v + 2, ob = side === "b" ? v + 2 : t;
          const exposed = !T.land.some((q) => q !== r && inRect(q, oa, ob)) && !beachAt(oa, ob) && !(T.marinaWater && false);
          if (exposed && run === null) run = t;
          if (!exposed && run !== null) flush(t);
        }
        flush(hi);
      });
    });
    // land tops
    T.land.forEach((r) => pn.poly(rectPts(r), r.pier ? "#BFB6A6" : "#97C97F", null));
    // blocks and strips
    T.blocks.forEach((k) => {
      if (k.kind === "strip") {
        const c = k.type === "quay" ? "#CBC7BD" : k.type === "pier" || k.type === "lighthousePad" ? "#C4BBAA" : "#E4D8C0";
        pn.poly(rectPts(k), c, null);
        if (k.type === "prom") {
          // paving pattern + sea railing
          for (let t = 0; t < 1; t += 0.04) {
            const alongA = k.a1 - k.a0 > k.b1 - k.b0;
            const a = alongA ? lerp(k.a0, k.a1, t) : k.a0, b = alongA ? k.b0 : lerp(k.b0, k.b1, t);
            pn.line(alongA ? [a, k.b0, 0] : [k.a0, b, 0], alongA ? [a, k.b1, 0] : [k.a1, b, 0], "rgba(150,120,80,0.12)", 0.7);
          }
        }
        if (k.type === "quay") pn.line([k.a0, k.b1 - 3, 0.2], [k.a1, k.b1 - 3, 0.2], "#E9B949", 2);
        if (k.type === "pier" || k.type === "lighthousePad") pn.poly(rectPts(k, 0.1, -3), null, "rgba(255,255,255,0.35)", 1);
        return;
      }
      pn.poly(rectPts(k), "#DCD0B8", null);
      pn.poly(rectPts(k), null, "#B9AA88", 1.4);
      // sidewalk slabs
      for (let a = k.a0 + 12; a < k.a1; a += 12) { pn.line([a, k.b1 - 14, 0], [a, k.b1, 0], "rgba(140,120,90,0.18)", 0.6); pn.line([a, k.b0, 0], [a, k.b0 + 14, 0], "rgba(140,120,90,0.18)", 0.6); }
      for (let b = k.b0 + 12; b < k.b1; b += 12) { pn.line([k.a1 - 14, b, 0], [k.a1, b, 0], "rgba(140,120,90,0.18)", 0.6); pn.line([k.a0, b, 0], [k.a0 + 14, b, 0], "rgba(140,120,90,0.18)", 0.6); }
      const I = { a0: k.a0 + 14, a1: k.a1 - 14, b0: k.b0 + 14, b1: k.b1 - 14 };
      const lawn = ["houses", "houses2", "beachHouses", "home", "studio", "freelance", "maker", "mill"].includes(k.type) ? "#9CCB84" : k.type === "park" ? "#8CC578" : ["refinery", "portyard", "hub"].includes(k.type) ? "#CFCBC2" : "#E7DBC3";
      pn.poly(rectPts(I), lawn, "rgba(120,100,60,0.25)", 1);
    });
    // lot grounds: gardens, paths, parking, park, square, track
    T.objs.forEach((o) => {
      if (o.kind === "building" && o.drawer === "house" || o.drawer === "cottage" || (o.drawer === "section" && o.sKind !== "shop")) {
        const r = { a0: o.a - o.w / 2, a1: o.a + o.w / 2, b0: o.b - o.d / 2, b1: o.b + o.d / 2 };
        pn.poly(rectPts(r, 0.2), "#A5D28C", null);
        // hedge along the back edges
        pn.poly([[r.a0, r.b0, 0.3], [r.a1, r.b0, 0.3], [r.a1, r.b0 + 4, 0.3], [r.a0, r.b0 + 4, 0.3]], "#5E9E5A", null);
        // path to the door
        const f = o.face, cx = o.a, cy = o.b;
        const path = f === "+b" ? [[cx - 4, cy, 0.4], [cx + 4, cy, 0.4], [cx + 4, r.b1, 0.4], [cx - 4, r.b1, 0.4]] : f === "+a" ? [[cx, cy - 4, 0.4], [r.a1, cy - 4, 0.4], [r.a1, cy + 4, 0.4], [cx, cy + 4, 0.4]] : null;
        if (path) pn.poly(path, "#E9DBC0", null);
      }
      if (o.kind === "ground-garden") pn.poly(rectPts(o, 0.2), "#A5D28C", null);
      if (o.kind === "ground-park") {
        pn.poly(rectPts(o, 0.2), "#8CC578", null);
        const ma = (o.a0 + o.a1) / 2, mb = (o.b0 + o.b1) / 2;
        pn.poly([[o.a0, mb - 5, 0.3], [o.a1, mb - 5, 0.3], [o.a1, mb + 5, 0.3], [o.a0, mb + 5, 0.3]], "#E8D9B8", null);
        pn.poly([[ma - 5, o.b0, 0.3], [ma + 5, o.b0, 0.3], [ma + 5, o.b1, 0.3], [ma - 5, o.b1, 0.3]], "#E8D9B8", null);
        const p = o.pond, ell = (ra, rb, z) => { const pts = []; for (let k = 0; k < 36; k++) { const t = (k / 36) * TAU; pts.push([p.a + Math.cos(t) * ra * (1 + 0.06 * Math.sin(3 * t)), p.b + Math.sin(t) * rb, z]); } return pts; };
        pn.poly(ell(p.ra + 5, p.rb + 5, 0.3), "#D9C9A4", null);
        pn.poly(ell(p.ra, p.rb, 0.3), "#5CC4CC", "#8FDCE0", 1.2);
        pn.poly(ell(p.ra * 0.3, p.rb * 0.2, 0.35), "rgba(255,255,255,0.3)", null);
      }
      if (o.kind === "ground-square") {
        pn.poly(rectPts(o, 0.2), "#E9DDC4", null);
        const ma = (o.a0 + o.a1) / 2, mb = (o.b0 + o.b1) / 2;
        [70, 50].forEach((rr, n) => { const pts = []; for (let k = 0; k < 40; k++) { const t = (k / 40) * TAU; pts.push([ma + Math.cos(t) * rr, mb + Math.sin(t) * rr, 0.3]); } pn.poly(pts, n ? "#E2D2B2" : null, "#CDB892", 1.4); });
        for (let a = o.a0 + 16; a < o.a1; a += 16) pn.line([a, o.b0, 0.25], [a, o.b1, 0.25], "rgba(180,150,100,0.12)", 0.6);
        for (let b = o.b0 + 16; b < o.b1; b += 16) pn.line([o.a0, b, 0.25], [o.a1, b, 0.25], "rgba(180,150,100,0.12)", 0.6);
      }
      if (o.kind === "ground-parking" || o.kind === "ground-yard") {
        pn.poly(rectPts(o, 0.2), o.kind === "ground-yard" ? "#C9C5BB" : "#7E878C", null);
        if (o.kind === "ground-parking") {
          const I = o;
          for (let row = 0; row < 3; row++) {
            const b = I.b0 + 30 + row * 70;
            if (b > I.b1 - 10) break;
            for (let a = I.a0 + 4; a < I.a1; a += (I.a1 - I.a0 - 40) / 7) pn.line([a, b - 14, 0.3], [a, b + 14, 0.3], "#F6F2E6", 1);
          }
        }
      }
      if (o.kind === "ground-track") {
        const ma = (o.a0 + o.a1) / 2, mb = (o.b0 + o.b1) / 2, ra = (o.a1 - o.a0) / 2 - 6, rb = (o.b1 - o.b0) / 2 - 6;
        const ov = (ka, kb, z) => { const pts = []; for (let k = 0; k < 48; k++) { const t = (k / 48) * TAU; pts.push([ma + Math.cos(t) * ka, mb + Math.sin(t) * kb, z]); } return pts; };
        pn.poly(ov(ra, rb, 0.2), "#D9734E", "#B85C3C", 1);
        pn.poly(ov(ra - 14, rb - 14, 0.3), "#7DBA6A", "#F6F2E6", 1.2);
        pn.poly(ov(ra - 7, rb - 7, 0.3), null, "rgba(255,255,255,0.6)", 0.8);
        pn.poly([[ma - 40, mb - 20, 0.35], [ma + 40, mb - 20, 0.35], [ma + 40, mb + 20, 0.35], [ma - 40, mb + 20, 0.35]], null, "#F6F2E6", 1.2);
      }
      if (o.kind === "ground-pontoon") {
        pn.poly([[o.a0, o.b0, -6], [o.a1, o.b0, -6], [o.a1, o.b1, -6], [o.a0, o.b1, -6]], "#B98759", "#8A6240", 0.8);
        for (let b = o.b0 + 6; b < o.b1; b += 6) pn.line([o.a0, b, -6], [o.a1, b, -6], "rgba(80,50,20,0.3)", 0.5);
        for (let b = o.b0 + 20; b < o.b1; b += 40) { pn.cyl(o.a0 - 1, b, -SEA_DROP, 1.4, 11, "#6E4A33"); pn.cyl(o.a1 + 1, b, -SEA_DROP, 1.4, 11, "#6E4A33"); }
      }
    });
    // building & tree shadows (sun from the upper left)
    ctx.fillStyle = "rgba(40,50,70,0.16)";
    T.objs.forEach((o) => {
      if (o.kind !== "building" || !o.H || o.drawer === "forsale") return;
      const hw = (o.w - 20) / 2, hd = (o.d - 20) / 2, len = Math.min(90, (o.H || 40) * 0.42);
      const pts = [[o.a - hw, o.b - hd], [o.a + hw + len, o.b - hd - len * 0.2], [o.a + hw + len, o.b + hd - len * 0.2], [o.a + hw, o.b + hd], [o.a - hw, o.b + hd]];
      pn.path(pts.map((p) => [p[0], p[1], 0.5])); ctx.fill();
    });
    // roads
    const road = "#646E74";
    T.edges.forEach((e) => {
      const hw = e.w / 2, n0 = e.n0, n1 = e.n1;
      const pts = e.axis === "a" ? [[n0.a, n0.b - hw, 0.5], [n1.a, n1.b - hw, 0.5], [n1.a, n1.b + hw, 0.5], [n0.a, n0.b + hw, 0.5]] : [[n0.a - hw, n0.b, 0.5], [n1.a - hw, n1.b, 0.5], [n1.a + hw, n1.b, 0.5], [n0.a + hw, n0.b, 0.5]];
      if (e.bridge) {
        const { a0, a1 } = e.bridge, b = n0.b, bw = hw + 22;
        // piers under the deck
        for (let a = a0 + 40; a < a1; a += 60) { pn.box(a, b, -SEA_DROP - 4, 10, bw * 2 - 10, SEA_DROP, "#A89A84"); }
        pn.poly([[a0, b + bw, 0], [a1, b + bw, 0], [a1, b + bw, -6], [a0, b + bw, -6]], "#B7A27E", "rgba(60,40,22,0.35)");
        pn.poly([[a0, b - bw, 0.4], [a1, b - bw, 0.4], [a1, b + bw, 0.4], [a0, b + bw, 0.4]], "#DCD0B8", null);
      }
      pn.poly(pts, road, null);
    });
    T.nodes.forEach((n) => {
      if (n.rb) {
        const ring = (r, z) => { const pts = []; for (let k = 0; k < 40; k++) { const t = (k / 40) * TAU; pts.push([n.a + Math.cos(t) * r, n.b + Math.sin(t) * r, z]); } return pts; };
        pn.poly(ring(RB_R + 2, 0.5), road, null);
        pn.poly(ring(20, 0.6), "#8CC578", "#DCD0B8", 3);
        pn.poly(ring(32, 0.55), null, "rgba(255,255,255,0.55)", 1);
        return;
      }
      const wa = n.wa || n.w, wb = n.wb || n.w;
      pn.poly([[n.a - wa / 2, n.b - wb / 2, 0.5], [n.a + wa / 2, n.b - wb / 2, 0.5], [n.a + wa / 2, n.b + wb / 2, 0.5], [n.a - wa / 2, n.b + wb / 2, 0.5]], road, null);
    });
    // lane markings
    T.edges.forEach((e) => {
      const n0 = e.n0, n1 = e.n1, cut0 = (n0.rb ? RB_R + 4 : (e.axis === "a" ? n0.wa : n0.wb) / 2 + 18), cut1 = (n1.rb ? RB_R + 4 : (e.axis === "a" ? n1.wa : n1.wb) / 2 + 18);
      const s0 = [n0.a + e.da * cut0, n0.b + e.db * cut0], s1 = [n1.a - e.da * cut1, n1.b - e.db * cut1];
      if (e.main) {
        [-1.3, 1.3].forEach((o) => pn.line([s0[0] - e.db * o, s0[1] + e.da * o, 0.6], [s1[0] - e.db * o, s1[1] + e.da * o, 0.6], "#F2C14E", 0.9, "butt"));
      } else {
        const L = Math.hypot(s1[0] - s0[0], s1[1] - s0[1]);
        for (let t = 0; t < L; t += 16) { const t1 = Math.min(L, t + 8); pn.line([s0[0] + e.da * t, s0[1] + e.db * t, 0.6], [s0[0] + e.da * t1, s0[1] + e.db * t1, 0.6], "#F4EEDC", 1.1, "butt"); }
      }
      // kerb lines
      [-1, 1].forEach((sd) => pn.line([n0.a - e.db * sd * (e.w / 2 - 1), n0.b + e.da * sd * (e.w / 2 - 1), 0.6], [n1.a - e.db * sd * (e.w / 2 - 1), n1.b + e.da * sd * (e.w / 2 - 1), 0.6], "rgba(255,255,255,0.18)", 0.8));
    });
    // zebra crossings and stop lines
    T.crossings.forEach((c) => {
      const e = c.e, ta = e.da, tb = e.db, la = -tb, lb = ta; // across the road
      for (let o = -e.w / 2 + 3; o < e.w / 2 - 2; o += 5) {
        const ca = c.a + la * o, cb = c.b + lb * o;
        pn.poly([[ca - ta * 5, cb - tb * 5, 0.7], [ca + ta * 5, cb + tb * 5, 0.7], [ca + ta * 5 + la * 2.4, cb + tb * 5 + lb * 2.4, 0.7], [ca - ta * 5 + la * 2.4, cb - tb * 5 + lb * 2.4, 0.7]], "#F4EEDC", null);
      }
      // stop line for cars arriving at this node (they drive on the left of their heading)
      const toNode = c.node === e.n0 ? -1 : 1; // direction of travel towards the node along e
      const hA = ta * toNode, hB = tb * toNode, lA = hB, lB = -hA;
      const sa = c.a - hA * 9, sb = c.b - hB * 9;
      pn.line([sa, sb, 0.7], [sa + lA * (e.w / 2 - 1), sb + lB * (e.w / 2 - 1), 0.7], "#F4EEDC", 1.6, "butt");
    });
    // bridge railings
    const be = T.bridgeE;
    if (be) {
      const { a0, a1 } = be.bridge, b = be.n0.b, bw = be.w / 2 + 22;
      [-bw + 1, bw - 1].forEach((o) => {
        pn.line([a0, b + o, 7], [a1, b + o, 7], "#F6EDDF", 1.6);
        for (let a = a0; a <= a1; a += 10) pn.line([a, b + o, 0.5], [a, b + o, 7], "#8A6F4E", 1);
      });
      [-be.w / 2, be.w / 2].forEach((o) => pn.line([a0, b + o, 0.6], [a1, b + o, 0.6], "#B9AA88", 1.4));
    }
  }

  /* ---------- sprite cache ---------- */
  const BUCKETS = [0.35, 0.5, 0.7, 1, 1.4, 2, 2.8];
  const bucketFor = (s) => BUCKETS.find((b) => b >= s * 0.95) || BUCKETS[BUCKETS.length - 1];
  function makeCanvas(w, h) { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function spriteBounds(o) {
    const w = o.w || 20, d = o.d || 20, H = o.H || 40;
    const hw = (w + d) / 2 + 40;
    return { hw, top: H + (w + d) / 4 + 50, bot: (w + d) / 4 + 30 };
  }
  class Sprites {
    constructor() { this.map = new Map(); this.count = 0; }
    get(key, bounds, sc, draw) {
      let s = this.map.get(key);
      if (s) { s.used = this.tick; return s; }
      const { hw, top, bot } = bounds;
      const cv = makeCanvas(hw * 2 * sc, (top + bot) * sc);
      const ctx = cv.getContext("2d");
      ctx.scale(sc, sc);
      const info = draw(ctx, hw, top) || {};
      s = { cv, ox: hw, oy: top, w: hw * 2, h: top + bot, sc, used: this.tick, ...info };
      this.map.set(key, s);
      if (this.map.size > 900) this.gc();
      return s;
    }
    gc() { const arr = [...this.map.entries()].sort((x, y) => x[1].used - y[1].used); arr.slice(0, 300).forEach(([k]) => this.map.delete(k)); }
  }

  /* ---------- time of day ---------- */
  function lightAt(hour) {
    const h = ((hour % 24) + 24) % 24;
    let night = 0;
    if (h >= 19.4 || h < 4.8) night = 1;
    else if (h >= 17.4) night = (h - 17.4) / 2;
    else if (h < 6.6) night = 1 - (h - 4.8) / 1.8;
    const golden = Math.max(0, 1 - Math.abs(h - 17.9) / 1.4, 0.7 * (1 - Math.abs(h - 6.2) / 1.1));
    return { night: clamp(night, 0, 1), golden: clamp(golden, 0, 1), hour: h };
  }
  function tintColor(L) {
    let c = "#FFFFFF";
    if (L.golden > 0) c = mix(c, "#FFC98C", L.golden * 0.5);
    if (L.night > 0) c = mix(c, "#3A4A86", L.night * 0.78);
    return c;
  }
