  /* ===================== engine: ground, sprites, lighting, frame ===================== */
  const SEA_DROP = 26; // how far the sea sits below street level (seawall height)
  const inRect = (r, a, b, m = 0) => a >= r.a0 - m && a <= r.a1 + m && b >= r.b0 - m && b <= r.b1 + m;

  /* ---------- ground (static, drawn into cached chunks) ---------- */
  function drawGround(ctx, T) {
    const pn = pen(ctx, 0, 0);
    const P = pn.P;
    const rectPts = (r, z = 0, m = 0) => [[r.a0 - m, r.b0 - m, z], [r.a1 + m, r.b0 - m, z], [r.a1 + m, r.b1 + m, z], [r.a0 - m, r.b1 + m, z]];
    const screenPath = (pts, z = 0, close = true) => { ctx.beginPath(); pts.forEach((p, k) => { const [x, y] = P(p[0], p[1], (p[2] ?? z)); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (close) ctx.closePath(); };
    /* ---- shores ---- */
    T.coasts.forEach((c) => {
      const pts = c.pts, n = pts.length;
      // shallow water halo
      screenPath(c.poly, -SEA_DROP);
      ctx.save(); ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(150,214,210,0.30)"; ctx.lineWidth = 90; ctx.stroke(); ctx.strokeStyle = "rgba(176,226,220,0.45)"; ctx.lineWidth = 34; ctx.stroke(); ctx.restore();
      // wet sand slopes under natural shores
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        if (p.wall || q.wall) continue;
        const po = [p.a + p.na * 16, p.b + p.nb * 16, -9], qo = [q.a + q.na * 16, q.b + q.nb * 16, -9];
        pn.poly([[p.a, p.b, 0], [q.a, q.b, 0], qo, po], "#E6BE98", null);
        let na = q.b - p.b, nb = -(q.a - p.a); const L2 = Math.hypot(na, nb) || 1; na /= L2; nb /= L2; if (na * p.na + nb * p.nb < 0) { na = -na; nb = -nb; }
        if (na + nb > 0.02) pn.poly([po, qo, [qo[0], qo[1], -SEA_DROP], [po[0], po[1], -SEA_DROP]], shade("#E9B48E", 0.06 * nb - 0.2 * na), null);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        if (p.wall || q.wall) continue;
        const [x0, y0] = P(p.a + p.na * 18, p.b + p.nb * 18, -SEA_DROP), [x1, y1] = P(q.a + q.na * 18, q.b + q.nb * 18, -SEA_DROP);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      // seawalls where the shore is built up
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        if (!(p.wall && q.wall)) continue;
        let na = q.b - p.b, nb = -(q.a - p.a); const L = Math.hypot(na, nb) || 1; na /= L; nb /= L;
        if (na * p.na + nb * p.nb < 0) { na = -na; nb = -nb; }
        if (na + nb <= 0.02) continue;
        pn.poly([[p.a, p.b, 0], [q.a, q.b, 0], [q.a, q.b, -SEA_DROP], [p.a, p.b, -SEA_DROP]], shade("#E8A98E", 0.05 * nb - 0.14 * na), "rgba(60,40,22,0.25)", 0.6);
        pn.line([p.a + na * 2, p.b + nb * 2, -SEA_DROP], [q.a + na * 2, q.b + nb * 2, -SEA_DROP], "rgba(255,255,255,0.7)", 1.6);
      }
      // sand, then grass inland of the sand
      pn.poly(c.poly.map((p) => [p[0], p[1], 0]), "#F5DCBC", null);
      pn.poly(pts.map((p) => [p.a - p.na * p.sand, p.b - p.nb * p.sand, 0.2]), "#B3D39E", null);
      // paved edge along seawalls
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        if (!(p.wall && q.wall)) continue;
        pn.poly([[p.a, p.b, 0.3], [q.a, q.b, 0.3], [q.a - q.na * 12, q.b - q.nb * 12, 0.3], [p.a - p.na * 12, p.b - p.nb * 12, 0.3]], "#F0DCCB", null);
      }
      // meadow tint patches for variety
      const r = rng(hash("meadow" + c.isle));
      for (let k = 0; k < 14; k++) { const p = pts[(r() * n) | 0], d = 30 + r() * 40, [x, y] = P(p.a - p.na * d, p.b - p.nb * d, 0.25); ctx.fillStyle = "rgba(190,222,170,0.5)"; ctx.beginPath(); ctx.ellipse(x, y, 30 + r() * 30, 12 + r() * 10, 0, 0, TAU); ctx.fill(); }
    });
    // piers and breakwaters
    T.piers.forEach((p) => {
      const jetty = p.type === "jetty";
      pn.box((p.a0 + p.a1) / 2, (p.b0 + p.b1) / 2, -SEA_DROP, p.a1 - p.a0, p.b1 - p.b0, SEA_DROP, jetty ? "#BDBAB2" : "#E7B79C", jetty ? { left: "#A9A59B", right: "#8E8A80", top: "#CBC7BD" } : { left: "#DFA88C", right: "#B98AA0", top: "#F0CDB4" });
      if (jetty) {
        [p.a0 + 3, p.a1 - 3].forEach((a) => { pn.line([a, p.b0 + 8, 0.2], [a, p.b1 - 3, 0.2], "#E9B949", 1.4); for (let b = p.b0 + 24; b < p.b1; b += 34) pn.cyl(a + (a < (p.a0 + p.a1) / 2 ? -1 : 1), b, 0, 1.8, 3.4, "#3B4A50"); });
        for (let b = p.b0 + 14; b < p.b1; b += 14) pn.line([p.a0 + 6, b, 0.2], [p.a1 - 6, b, 0.2], "rgba(90,90,90,0.12)", 0.6);
        [p.a0 - 1, p.a1 + 1].forEach((a) => { for (let b = p.b0 + 30; b < p.b1; b += 50) pn.box(a + (a < p.a0 ? -2 : 2), b, -8, 3, 12, 8, "#2B2F33"); });
      }
    });
    // coastal footpaths
    T.paths.forEach((pp) => {
      screenPath(pp.pts, 0.4, false);
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.strokeStyle = "#E6D0B4"; ctx.lineWidth = pp.kind === "link" ? 8 : 11; ctx.stroke();
      ctx.strokeStyle = "#F6E6CF"; ctx.lineWidth = pp.kind === "link" ? 6 : 8.5; ctx.stroke();
    });
    /* ---- town: footway base, roads, then rounded blocks ---- */
    Object.values(T.isles).forEach((I) => {
      const r = RC + 15 + VERGE;
      pn.poly(rrect4(I.box.a0, I.box.a1, I.box.b0, I.box.b1, [r, r, r, r], 0.4), "#F2E6D6", "#E3D1BE", 1.2);
    });
    const road = "#8E8CAA";
    const arcBand = (n, r0, r1, z) => {
      const d = n.edges.map((e) => { const o = e.n0 === n ? e.n1 : e.n0; return [Math.sign(o.a - n.a), Math.sign(o.b - n.b)]; });
      const C = n.bendC;
      const p1 = [n.a + d[0][0] * RC, n.b + d[0][1] * RC], p2 = [n.a + d[1][0] * RC, n.b + d[1][1] * RC];
      let t0 = Math.atan2(p1[1] - C[1], p1[0] - C[0]), t1 = Math.atan2(p2[1] - C[1], p2[0] - C[0]);
      while (t1 - t0 > Math.PI) t1 -= TAU; while (t0 - t1 > Math.PI) t1 += TAU;
      const outer = [], inner = [];
      for (let k = 0; k <= 14; k++) { const t = lerp(t0, t1, k / 14); outer.push([C[0] + Math.cos(t) * r1, C[1] + Math.sin(t) * r1, z]); inner.push([C[0] + Math.cos(t) * r0, C[1] + Math.sin(t) * r0, z]); }
      return { outer, inner, poly: outer.concat(inner.reverse()) };
    };
    T.edges.forEach((e) => {
      const hw = e.w / 2, n0 = e.n0, n1 = e.n1;
      const c0 = n0.bend ? RC : 0, c1 = n1.bend ? RC : 0;
      const a0 = n0.a + e.da * c0, b0 = n0.b + e.db * c0, a1 = n1.a - e.da * c1, b1 = n1.b - e.db * c1;
      const pts = e.axis === "a" ? [[a0, b0 - hw, 0.5], [a1, b1 - hw, 0.5], [a1, b1 + hw, 0.5], [a0, b0 + hw, 0.5]] : [[a0 - hw, b0, 0.5], [a1 - hw, b1, 0.5], [a1 + hw, b1, 0.5], [a0 + hw, b0, 0.5]];
      if (e.bridge) {
        const { a0: ba0, a1: ba1 } = e.bridge, b = n0.b, bw = hw + 22;
        for (let a = ba0 + 40; a < ba1 - 20; a += 60) pn.box(a, b, -SEA_DROP - 4, 10, bw * 2 - 10, SEA_DROP, "#A89A84");
        pn.poly([[ba0, b + bw, 0], [ba1, b + bw, 0], [ba1, b + bw, -6], [ba0, b + bw, -6]], "#B7A27E", "rgba(60,40,22,0.35)");
        pn.poly([[ba0, b - bw, 0.4], [ba1, b - bw, 0.4], [ba1, b + bw, 0.4], [ba0, b + bw, 0.4]], "#F2E6D6", null);
      }
      pn.poly(pts, road, null);
    });
    T.nodes.forEach((n) => {
      if (n.rb) {
        const ring = (r, z) => { const pts = []; for (let k = 0; k < 40; k++) { const t = (k / 40) * TAU; pts.push([n.a + Math.cos(t) * r, n.b + Math.sin(t) * r, z]); } return pts; };
        pn.poly(ring(RB_R + 12, 0.5), road, null);
        return;
      }
      if (n.bend) { const w = n.edges[0].w; pn.poly(arcBand(n, RC - w / 2, RC + w / 2, 0.5).poly, road, null); return; }
      if (n.through) { const w = n.w; pn.poly([[n.a - w / 2, n.b - w / 2, 0.5], [n.a + w / 2, n.b - w / 2, 0.5], [n.a + w / 2, n.b + w / 2, 0.5], [n.a - w / 2, n.b + w / 2, 0.5]], road, null); return; }
      const wa = n.wa || n.w, wb = n.wb || n.w;
      pn.poly([[n.a - wa / 2 - CURB, n.b - wb / 2 - CURB, 0.5], [n.a + wa / 2 + CURB, n.b - wb / 2 - CURB, 0.5], [n.a + wa / 2 + CURB, n.b + wb / 2 + CURB, 0.5], [n.a - wa / 2 - CURB, n.b + wb / 2 + CURB, 0.5]], road, null);
    });
    // blocks with rounded kerbs
    T.blocks.forEach((k) => {
      pn.poly(rrect4(k.a0, k.a1, k.b0, k.b1, k.radii, 0.55), "#F2E6D6", "#E0CDB8", 1.4);
      const I = { a0: k.a0 + 14, a1: k.a1 - 14, b0: k.b0 + 14, b1: k.b1 - 14 };
      const lawn = ["refinery", "portyard", "hub"].includes(k.type) ? "#DDD6CE" : ["square", "marina"].includes(k.type) ? "#F3E7D5" : "#AACF9A";
      pn.poly(rrect4(I.a0, I.a1, I.b0, I.b1, k.radii.map((r) => Math.max(3, r - 14)), 0.6), lawn, "rgba(120,100,60,0.22)", 1);
    });
    T.nodes.forEach((n) => {
      if (!n.rb) return;
      const ring = (r, z) => { const pts = []; for (let k = 0; k < 40; k++) { const t = (k / 40) * TAU; pts.push([n.a + Math.cos(t) * r, n.b + Math.sin(t) * r, z]); } return pts; };
      pn.poly(ring(20, 0.7), "#A2CB90", "#F2E6D6", 3);
      pn.poly(ring(32, 0.65), null, "rgba(255,255,255,0.55)", 1);
    });
    // bends: centre line
    T.nodes.forEach((n) => {
      if (!n.bend) return;
      const c = arcBand(n, RC, RC, 0.7).outer;
      for (let k = 0; k < c.length - 1; k += 2) pn.line(c[k], c[k + 1], "#FBF4EA", 1.1, "butt");
    });
    // lot grounds: gardens, paths, parking, park, square, track
    T.objs.forEach((o) => {
      if (o.kind === "building" && o.drawer === "house" || o.drawer === "cottage" || (o.drawer === "section" && o.sKind !== "shop")) {
        const r = o.lot ? { a0: o.lot.a0 + 2, a1: o.lot.a1 - 2, b0: o.lot.b0 + 2, b1: o.lot.b1 - 2 } : { a0: o.a - o.w / 2, a1: o.a + o.w / 2, b0: o.b - o.d / 2, b1: o.b + o.d / 2 };
        const shadeL = ["#B7D8A4", "#B0D49C", "#BCDCA8", "#B4D6A0"][hash(o.id || "x") % 4];
        pn.poly(rectPts(r, 0.2), shadeL, null);
        // hedges round the plot, a picket fence along the street side
        const hedge = (p0, p1) => { pn.line(p0, p1, "#6E9E78", 4.2, "round"); pn.line([p0[0], p0[1], p0[2] + 1.5], [p1[0], p1[1], p1[2] + 1.5], "#88B48A", 2.4, "round"); };
        const front = o.face;
        const sides = { "-b": [[r.a0, r.b0, 0.4], [r.a1, r.b0, 0.4]], "+a": [[r.a1, r.b0, 0.4], [r.a1, r.b1, 0.4]], "+b": [[r.a1, r.b1, 0.4], [r.a0, r.b1, 0.4]], "-a": [[r.a0, r.b1, 0.4], [r.a0, r.b0, 0.4]] };
        Object.entries(sides).forEach(([f, [p0, p1]]) => {
          if (f === front) { pn.line([p0[0], p0[1], 3], [p1[0], p1[1], 3], "#FFF8EC", 0.9); const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); for (let t = 0; t <= L; t += 5) { const u = t / L; pn.line([lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), 0.4], [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), 4], "#F6EDDF", 0.8); } }
          else hedge(p0, p1);
        });
        // path to the door
        const f = o.face, cx = o.a, cy = o.b;
        const path = f === "+b" ? [[cx - 4, cy, 0.4], [cx + 4, cy, 0.4], [cx + 4, r.b1, 0.4], [cx - 4, r.b1, 0.4]] : f === "+a" ? [[cx, cy - 4, 0.4], [r.a1, cy - 4, 0.4], [r.a1, cy + 4, 0.4], [cx, cy + 4, 0.4]] : null;
        if (path) pn.poly(path, "#E9DBC0", null);
      }
      if (o.kind === "ground-garden") pn.poly(rectPts(o, 0.2), "#B7D8A4", null);
      if (o.kind === "ground-field") {
        pn.poly(rectPts(o, 0.2), o.c, shade(o.c, -0.2), 1);
        if (o.dir === "a") for (let b = o.b0 + 6; b < o.b1; b += 7) pn.line([o.a0 + 3, b, 0.3], [o.a1 - 3, b, 0.3], shade(o.c, -0.14), 1.4);
        else for (let a = o.a0 + 6; a < o.a1; a += 7) pn.line([a, o.b0 + 3, 0.3], [a, o.b1 - 3, 0.3], shade(o.c, -0.14), 1.4);
        [[o.a0, o.b1, o.a1, o.b1], [o.a1, o.b0, o.a1, o.b1]].forEach(([a0, b0, a1, b1]) => { pn.line([a0, b0, 3], [a1, b1, 3], "#B98759", 0.9); const L = Math.hypot(a1 - a0, b1 - b0); for (let t = 0; t <= L; t += 12) { const u = t / L; pn.line([lerp(a0, a1, u), lerp(b0, b1, u), 0.3], [lerp(a0, a1, u), lerp(b0, b1, u), 4.5], "#8A6240", 1); } });
      }
      if (o.kind === "ground-park") {
        pn.poly(rectPts(o, 0.2), "#A2CB90", null);
        const ma = (o.a0 + o.a1) / 2, mb = (o.b0 + o.b1) / 2;
        pn.poly([[o.a0, mb - 5, 0.3], [o.a1, mb - 5, 0.3], [o.a1, mb + 5, 0.3], [o.a0, mb + 5, 0.3]], "#F4E4CE", null);
        pn.poly([[ma - 5, o.b0, 0.3], [ma + 5, o.b0, 0.3], [ma + 5, o.b1, 0.3], [ma - 5, o.b1, 0.3]], "#F4E4CE", null);
        const p = o.pond || { a: -9e9, b: 0, ra: 0, rb: 0 }, ell = (ra, rb, z) => { const pts = []; for (let k = 0; k < 36; k++) { const t = (k / 36) * TAU; pts.push([p.a + Math.cos(t) * ra * (1 + 0.06 * Math.sin(3 * t)), p.b + Math.sin(t) * rb, z]); } return pts; };
        pn.poly(ell(p.ra + 5, p.rb + 5, 0.3), "#EAD6BC", null);
        pn.poly(ell(p.ra, p.rb, 0.3), "#7CC7CC", "#8FDCE0", 1.2);
        pn.poly(ell(p.ra * 0.3, p.rb * 0.2, 0.35), "rgba(255,255,255,0.3)", null);
      }
      if (o.kind === "ground-square") {
        pn.poly(rectPts(o, 0.2), "#F6EADB", null);
        const ma = (o.a0 + o.a1) / 2, mb = (o.b0 + o.b1) / 2;
        [70, 50].forEach((rr, n) => { const pts = []; for (let k = 0; k < 40; k++) { const t = (k / 40) * TAU; pts.push([ma + Math.cos(t) * rr, mb + Math.sin(t) * rr, 0.3]); } pn.poly(pts, n ? "#EFD9C4" : null, "#E6CCB2", 1.4); });
        for (let a = o.a0 + 16; a < o.a1; a += 16) pn.line([a, o.b0, 0.25], [a, o.b1, 0.25], "rgba(180,150,100,0.12)", 0.6);
        for (let b = o.b0 + 16; b < o.b1; b += 16) pn.line([o.a0, b, 0.25], [o.a1, b, 0.25], "rgba(180,150,100,0.12)", 0.6);
      }
      if (o.kind === "ground-parking" || o.kind === "ground-yard") {
        pn.poly(rectPts(o, 0.2), o.kind === "ground-yard" ? "#DCD4CC" : "#9C98B4", null);
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
    // lane markings
    T.edges.forEach((e) => {
      const cutN = (n) => (n.rb ? RB_R + 16 : n.bend ? RC : (e.axis === "a" ? n.wa : n.wb) / 2 + 18);
      const n0 = e.n0, n1 = e.n1, cut0 = cutN(n0), cut1 = cutN(n1);
      const s0 = [n0.a + e.da * cut0, n0.b + e.db * cut0], s1 = [n1.a - e.da * cut1, n1.b - e.db * cut1];
      if (e.main) {
        [-1.3, 1.3].forEach((o) => pn.line([s0[0] - e.db * o, s0[1] + e.da * o, 0.6], [s1[0] - e.db * o, s1[1] + e.da * o, 0.6], "#F2C14E", 0.9, "butt"));
      } else {
        const L = Math.hypot(s1[0] - s0[0], s1[1] - s0[1]);
        for (let t = 0; t < L; t += 16) { const t1 = Math.min(L, t + 8); pn.line([s0[0] + e.da * t, s0[1] + e.db * t, 0.6], [s0[0] + e.da * t1, s0[1] + e.db * t1, 0.6], "#FBF4EA", 1.1, "butt"); }
      }
      // kerb lines

    });
    // zebra crossings and stop lines
    T.crossings.forEach((c) => {
      const e = c.e, ta = e.da, tb = e.db, la = -tb, lb = ta; // across the road
      for (let o = -e.w / 2 + 3; o < e.w / 2 - 2; o += 5) {
        const ca = c.a + la * o, cb = c.b + lb * o;
        pn.poly([[ca - ta * 5, cb - tb * 5, 0.7], [ca + ta * 5, cb + tb * 5, 0.7], [ca + ta * 5 + la * 2.4, cb + tb * 5 + lb * 2.4, 0.7], [ca - ta * 5 + la * 2.4, cb - tb * 5 + lb * 2.4, 0.7]], "#FBF4EA", null);
      }
      // stop line for cars arriving at this node (they drive on the left of their heading)
      const toNode = c.node === e.n0 ? -1 : 1; // direction of travel towards the node along e
      const hA = ta * toNode, hB = tb * toNode, lA = hB, lB = -hA;
      const sa = c.a - hA * 9, sb = c.b - hB * 9;
      pn.line([sa, sb, 0.7], [sa + lA * (e.w / 2 - 1), sb + lB * (e.w / 2 - 1), 0.7], "#FBF4EA", 1.6, "butt");
    });
    // bridge railings
    const be = T.bridgeE;
    if (be) {
      const { a0, a1 } = be.bridge, b = be.n0.b, bw = be.w / 2 + 22;
      [-bw + 1, bw - 1].forEach((o) => {
        pn.line([a0, b + o, 7], [a1, b + o, 7], "#F6EDDF", 1.6);
        for (let a = a0; a <= a1; a += 10) pn.line([a, b + o, 0.5], [a, b + o, 7], "#8A6F4E", 1);
      });
      [-be.w / 2, be.w / 2].forEach((o) => pn.line([a0, b + o, 0.6], [a1, b + o, 0.6], "#E0CDB8", 1.4));
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
    if (L.night > 0) c = mix(c, "#5A5AA0", L.night * 0.74); // flat periwinkle-indigo night
    return c;
  }
