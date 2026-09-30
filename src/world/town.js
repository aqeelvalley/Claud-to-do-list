  /* ===================== town layout: two islands, uneven street grid, natural coasts ===================== */
  const RC = 80; // radius of the bends at the ring-road corners
  const VERGE = 18; // footway outside the ring road
  const CURB = 14; // kerb radius at junction corners
  const WALK = 9; // how far in from the kerb people walk
  const RB_R = 44;
  const UNLOCKS = {
    townhall: { name: "Town Hall", level: 3, kind: "townhall" },
    learning: { name: "Learning Centre", level: 5, kind: "library" },
    cinema: { name: "Cinema", level: 7, kind: "cinema" },
    fabyard: { name: "Fabrication Yard", level: 4, kind: "fabyard" },
  };
  const SECTION_LOTS = [["houses2", 1], ["beachHouses", 2], ["houses", 1], ["houses2", 2], ["beachHouses", 0], ["houses", 0], ["houses2", 0], ["beachHouses", 1]];

  /* ---- geometry helpers ---- */
  /* clockwise rounded rectangle in (a,b) with outward normals and a side tag */
  function rrect(a0, a1, b0, b1, r, step = 12) {
    const out = [];
    const seg = (x0, y0, x1, y1, na, nb, side) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / step)); for (let k = 0; k < n; k++) { const t = k / n; out.push({ a: lerp(x0, x1, t), b: lerp(y0, y1, t), na, nb, side, s: side === "N" || side === "S" ? lerp(x0, x1, t) : lerp(y0, y1, t) }); } };
    const arc = (ca, cb, t0, t1, s0, s1) => { const n = Math.max(2, Math.round((r * Math.PI / 2) / step)); for (let k = 0; k < n; k++) { const t = lerp(t0, t1, k / n); out.push({ a: ca + Math.cos(t) * r, b: cb + Math.sin(t) * r, na: Math.cos(t), nb: Math.sin(t), side: k / n < 0.5 ? s0 : s1, arc: [s0, s1, k / n] }); } };
    seg(a0 + r, b0, a1 - r, b0, 0, -1, "N"); arc(a1 - r, b0 + r, -Math.PI / 2, 0, "N", "E");
    seg(a1, b0 + r, a1, b1 - r, 1, 0, "E"); arc(a1 - r, b1 - r, 0, Math.PI / 2, "E", "S");
    seg(a1 - r, b1, a0 + r, b1, 0, 1, "S"); arc(a0 + r, b1 - r, Math.PI / 2, Math.PI, "S", "W");
    seg(a0, b1 - r, a0, b0 + r, -1, 0, "W"); arc(a0 + r, b0 + r, Math.PI, Math.PI * 1.5, "W", "N");
    return out;
  }
  /* rounded rect with a radius per corner: [a0b0, a1b0, a1b1, a0b1] */
  function rrect4(a0, a1, b0, b1, rs, z = 0, step = 8) {
    const pts = [];
    const corner = (ca, cb, t0, r) => { if (r <= 0.5) { pts.push([ca, cb, z]); return; } const n = Math.max(3, Math.round((r * Math.PI / 2) / step)); for (let k = 0; k <= n; k++) { const t = t0 + (Math.PI / 2) * (k / n); pts.push([ca + Math.cos(t) * r, cb + Math.sin(t) * r, z]); } };
    const [r0, r1, r2, r3] = rs;
    r1 > 0.5 ? corner(a1 - r1, b0 + r1, -Math.PI / 2, r1) : pts.push([a1, b0, z]);
    r2 > 0.5 ? corner(a1 - r2, b1 - r2, 0, r2) : pts.push([a1, b1, z]);
    r3 > 0.5 ? corner(a0 + r3, b1 - r3, Math.PI / 2, r3) : pts.push([a0, b1, z]);
    r0 > 0.5 ? corner(a0 + r0, b0 + r0, Math.PI, r0) : pts.push([a0, b0, z]);
    return pts;
  }
  const inPoly = (poly, a, b) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ai, bi] = poly[i], [aj, bj] = poly[j];
      if ((bi > b) !== (bj > b) && a < ((aj - ai) * (b - bi)) / (bj - bi) + ai) c = !c;
    }
    return c;
  };

  /* ---- raster helpers for coastlines ---- */
  // exact Euclidean distance (in pixels) from every pixel to the nearest masked pixel
  function edt(mask, w, h) {
    const INF = 1e20, n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    const g = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) g[i] = mask[i] ? 0 : INF;
    const pass = (len) => {
      let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (let q = 1; q < len; q++) {
        let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) { k--; s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s; z[k + 1] = INF;
      }
      k = 0;
      for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
    };
    for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = g[y * w + x]; pass(h); for (let y = 0; y < h; y++) g[y * w + x] = d[y]; }
    for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = g[y * w + x]; pass(w); for (let x = 0; x < w; x++) g[y * w + x] = Math.sqrt(d[x]); }
    return g;
  }
  // marching squares: closed loops where F crosses zero (F < 0 is land)
  const MS = { 1: [["L", "B"]], 2: [["B", "R"]], 3: [["L", "R"]], 4: [["T", "R"]], 5: [["T", "R"], ["L", "B"]], 6: [["T", "B"]], 7: [["L", "T"]], 8: [["L", "T"]], 9: [["T", "B"]], 10: [["L", "T"], ["B", "R"]], 11: [["T", "R"]], 12: [["L", "R"]], 13: [["B", "R"]], 14: [["L", "B"]] };
  function contour(F, w, h, x0, y0, res) {
    const ep = (xa, ya, xb, yb) => { const fa = F[ya * w + xa], fb = F[yb * w + xb], t = fa / (fa - fb); return [x0 + (xa + (xb - xa) * t) * res, y0 + (ya + (yb - ya) * t) * res]; };
    const segs = [], adj = new Map();
    const K = (p) => Math.round(p[0] * 100) + "," + Math.round(p[1] * 100);
    for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) {
      const c = (F[y * w + x] < 0 ? 8 : 0) | (F[y * w + x + 1] < 0 ? 4 : 0) | (F[(y + 1) * w + x + 1] < 0 ? 2 : 0) | (F[(y + 1) * w + x] < 0 ? 1 : 0);
      if (!c || c === 15) continue;
      const E = { T: () => ep(x, y, x + 1, y), R: () => ep(x + 1, y, x + 1, y + 1), B: () => ep(x, y + 1, x + 1, y + 1), L: () => ep(x, y, x, y + 1) };
      MS[c].forEach(([e1, e2]) => { const s = [E[e1](), E[e2]()], id = segs.length; segs.push(s); s.forEach((p) => { const k = K(p); if (!adj.has(k)) adj.set(k, []); adj.get(k).push(id); }); });
    }
    const used = new Uint8Array(segs.length), loops = [];
    for (let s0 = 0; s0 < segs.length; s0++) {
      if (used[s0]) continue;
      used[s0] = 1;
      const loop = [segs[s0][0], segs[s0][1]];
      let cur = segs[s0][1];
      for (;;) {
        const nx = (adj.get(K(cur)) || []).find((id) => !used[id]);
        if (nx == null) break;
        used[nx] = 1;
        const s = segs[nx], p = K(s[0]) === K(cur) ? s[1] : s[0];
        loop.push(p); cur = p;
      }
      loops.push(loop);
    }
    return loops;
  }
  const polyArea = (pts) => { let s = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; };
  function rasterPoly(poly, w, h, x0, y0, res) {
    const m = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      const b = y0 + y * res, xs = [];
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [ai, bi] = poly[i], [aj, bj] = poly[j]; if ((bi > b) !== (bj > b)) xs.push(ai + ((b - bi) * (aj - ai)) / (bj - bi)); }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) { const xa = Math.max(0, Math.ceil((xs[k] - x0) / res)), xb = Math.min(w - 1, Math.floor((xs[k + 1] - x0) / res)); for (let x = xa; x <= xb; x++) m[y * w + x] = 1; }
    }
    return m;
  }
  /* outline of a set of grid cells as a list of grid points, clockwise with a to the right, b down */
  function cellLoops(occ) {
    const out = new Map(), add = (p, q) => { const k = p.join(","); if (!out.has(k)) out.set(k, []); out.get(k).push(q); };
    occ.forEach((k) => {
      const [i, j] = k.split(",").map(Number), has = (x, y) => occ.has(x + "," + y);
      if (!has(i, j - 1)) add([i, j], [i + 1, j]);
      if (!has(i + 1, j)) add([i + 1, j], [i + 1, j + 1]);
      if (!has(i, j + 1)) add([i + 1, j + 1], [i, j + 1]);
      if (!has(i - 1, j)) add([i, j + 1], [i, j]);
    });
    const loops = [];
    for (;;) {
      const startK = [...out.keys()].find((k) => out.get(k).length);
      if (!startK) break;
      const loop = [];
      let cur = startK.split(",").map(Number), prevDir = null;
      for (let guard = 0; guard < 10000; guard++) {
        const k = cur.join(","), cands = out.get(k);
        if (!cands || !cands.length) break;
        // at a pinch take the convex (right-hand) turn so loops stay simple
        let pick = 0;
        if (cands.length > 1 && prevDir) pick = cands.findIndex((q) => { const d = [q[0] - cur[0], q[1] - cur[1]]; return prevDir[0] * d[1] - prevDir[1] * d[0] > 0; });
        if (pick < 0) pick = 0;
        const nx = cands.splice(pick, 1)[0];
        loop.push(cur);
        prevDir = [nx[0] - cur[0], nx[1] - cur[1]];
        cur = nx;
        if (cur.join(",") === startK) break;
      }
      // drop collinear points
      const clean = loop.filter((p, i) => { const a = loop[(i - 1 + loop.length) % loop.length], c = loop[(i + 1) % loop.length]; return (p[0] - a[0]) * (c[1] - p[1]) - (p[1] - a[1]) * (c[0] - p[0]) !== 0; });
      if (clean.length >= 4) loops.push(clean);
    }
    return loops;
  }

  function buildTown({ sections = [], islandLevel = 1, plan = null }) {
    plan = plan || classicPlan();
    const roads = [], blocks = [], objs = [], plots = {}, lamps = [], docks = { marina: [], port: [] };
    const coasts = [], piers = [], paths = [], seams = [];
    const nodes = new Map(), edges = [];
    const peds = { nodes: [], edges: [] };
    const nodeAt = (a, b) => {
      const k = a + "," + b;
      if (!nodes.has(k)) nodes.set(k, { k, a, b, edges: [], signal: false, rb: false, id: nodes.size });
      return nodes.get(k);
    };
    const addEdge = (n0, n1, w, main) => {
      const len = Math.hypot(n1.a - n0.a, n1.b - n0.b);
      const e = { id: edges.length, n0, n1, len, da: (n1.a - n0.a) / len, db: (n1.b - n0.b) / len, w, main, crossings: [], axis: n0.b === n1.b ? "a" : "b" };
      edges.push(e); n0.edges.push(e); n1.edges.push(e);
      roads.push({ a0: n0.a, b0: n0.b, a1: n1.a, b1: n1.b, w, main });
      return e;
    };
    const put = (o) => { objs.push(o); return o; };
    const ISLES = {};

    /* ---- streets for one island: a road on every grid segment between two different parcels ---- */
    const makeIsle = (id, spec, opt = {}) => {
      const { A, B } = spec;
      const cellP = new Map();
      spec.parcels.forEach((p) => { p.cells = p.at ? cellsOf(p) : p.cells; p.cells.forEach(([i, j]) => cellP.set(i + "," + j, p)); });
      const joinSet = new Set((spec.joins || []).flatMap(([x, y]) => [x + "|" + y, y + "|" + x]));
      const P = (i, j) => cellP.get(i + "," + j);
      const linked = (p, q) => !!(p && q && (p === q || joinSet.has(p.id + "|" + q.id)));
      const roadBetween = (p, q) => !!(p || q) && !linked(p, q);
      const cl = [...cellP.keys()].map((k) => k.split(",").map(Number));
      const i0 = Math.min(...cl.map((c) => c[0])), i1 = Math.max(...cl.map((c) => c[0])) + 1, j0 = Math.min(...cl.map((c) => c[1])), j1 = Math.max(...cl.map((c) => c[1])) + 1;
      const segA = new Set(), segB = new Set();
      for (let i = i0; i <= i1; i++) for (let j = j0; j < j1; j++) if (roadBetween(P(i - 1, j), P(i, j))) segA.add(i + "," + j);
      for (let j = j0; j <= j1; j++) for (let i = i0; i < i1; i++) if (roadBetween(P(i, j - 1), P(i, j))) segB.add(i + "," + j);
      const deg = (i, j) => segA.has(i + "," + (j - 1)) + segA.has(i + "," + j) + segB.has(i - 1 + "," + j) + segB.has(i + "," + j);
      const mainA = new Set((spec.main && spec.main.a) || []), mainB = new Set((spec.main && spec.main.b) || []);
      let rbPt = Array.isArray(spec.roundabout) ? spec.roundabout : null;
      if (spec.roundabout === "auto" && spec.parcels.length >= 7) {
        const ci = cl.reduce((s, c) => s + c[0] + 0.5, 0) / cl.length, cj = cl.reduce((s, c) => s + c[1] + 0.5, 0) / cl.length;
        let best = null;
        for (let i = i0 + 1; i < i1; i++) for (let j = j0 + 1; j < j1; j++) if (deg(i, j) === 4) { const d = Math.hypot(i - ci, j - cj); if (!best || d < best.d) best = { d, p: [i, j] }; }
        if (best) { rbPt = best.p; mainA.add(rbPt[0]); mainB.add(rbPt[1]); }
      }
      const forced = new Set(opt.forced || []);
      // bridge landing: the middle of the east shore road
      let bridgePt = null;
      if (opt.bridgeEast) {
        const cands = [];
        for (let j = j0; j <= j1; j++) { const up = segA.has(i1 + "," + (j - 1)), dn = segA.has(i1 + "," + j); if (up || dn) cands.push({ j, both: up && dn }); }
        const mid = (j0 + j1) / 2;
        cands.sort((x, y) => (y.both - x.both) || Math.abs(x.j - mid) - Math.abs(y.j - mid));
        if (cands.length) { bridgePt = [i1, cands[0].j]; forced.add(i1 + "," + cands[0].j); }
      }
      const nodePtA = (i, j) => segB.has(i - 1 + "," + j) || segB.has(i + "," + j) || forced.has(i + "," + j);
      const nodePtB = (i, j) => segA.has(i + "," + (j - 1)) || segA.has(i + "," + j) || forced.has(i + "," + j);
      for (let i = i0; i <= i1; i++) {
        let run = null;
        for (let j = j0; j <= j1; j++) {
          const up = segA.has(i + "," + (j - 1)), dn = segA.has(i + "," + j);
          if (up && run !== null && (nodePtA(i, j) || !dn)) { addEdge(nodeAt(A[i], B[run]), nodeAt(A[i], B[j]), mainA.has(i) ? 40 : 30, mainA.has(i)); run = dn ? j : null; }
          else if (!up && dn) run = j;
        }
      }
      for (let j = j0; j <= j1; j++) {
        let run = null;
        for (let i = i0; i <= i1; i++) {
          const lf = segB.has(i - 1 + "," + j), rt = segB.has(i + "," + j);
          if (lf && run !== null && (nodePtB(i, j) || !rt)) { addEdge(nodeAt(A[run], B[j]), nodeAt(A[i], B[j]), mainB.has(j) ? 40 : 30, mainB.has(j)); run = rt ? i : null; }
          else if (!lf && rt) run = i;
        }
      }
      if (rbPt) nodeAt(A[rbPt[0]], B[rbPt[1]]).rb = true;
      const I = { id, A, B, cellP, segA, segB, P, linked, parcels: spec.parcels, i0, i1, j0, j1, mainA, mainB, style: opt.style || "natural", seed: opt.seed || 1, bridgePt, name: opt.name, color: opt.color };
      ISLES[id] = I;
      return I;
    };

    const life = makeIsle("life", { ...plan, parcels: fillHoles(plan.parcels) }, { bridgeEast: !!plan.work, seed: hash("coast-life" + (plan.seed || "")), name: "Life Island", color: "#6DAE5B" });
    let bridgeE = null, work = null;
    if (plan.work && life.bridgePt) {
      const [bi, bj] = life.bridgePt, aw = life.A[bi] + 520, by = life.B[bj];
      const wp = [
        { id: "w:hq", type: "epcmHQ", cells: [[0, 0]] }, { id: "w:hub", type: "hub", cells: [[0, 1]] },
        { id: "w:ref", type: "refinery", cells: [[1, 0]] }, { id: "w:yard", type: "portyard", cells: [[1, 1]] },
      ];
      work = makeIsle("work", { A: [aw, aw + 330, aw + 620], B: [by - 420, by, by + 450], parcels: wp, joins: [["w:ref", "w:yard"]], main: { b: [1] } }, { style: "quay", seed: hash("coast-work"), forced: ["0,1"], name: "Work Island", color: "#3E7CB1" });
      bridgeE = addEdge(nodeAt(life.A[bi], by), nodeAt(aw, by), 40, true);
    }
    nodes.forEach((n) => {
      const d = n.edges.length;
      n.signal = !n.rb && d >= 3 && (d === 4 || n.edges.some((e) => e.main));
      n.w = Math.max(...n.edges.map((e) => e.w));
      n.wa = Math.max(0, ...n.edges.filter((e) => e.axis === "b").map((e) => e.w));
      n.wb = Math.max(0, ...n.edges.filter((e) => e.axis === "a").map((e) => e.w));
      n.bend = d === 2 && n.edges[0].axis !== n.edges[1].axis;
      n.through = d === 2 && n.edges[0].axis === n.edges[1].axis;
      if (n.bend) {
        const dd = n.edges.map((e) => { const o = e.n0 === n ? e.n1 : e.n0; return [Math.sign(o.a - n.a), Math.sign(o.b - n.b)]; });
        n.bendC = [n.a + (dd[0][0] + dd[1][0]) * RC, n.b + (dd[0][1] + dd[1][1]) * RC];
      }
    });

    /* ---- blocks: each parcel cut into rectangular pieces; pieces of one parcel meet at footpath seams ---- */
    Object.values(ISLES).forEach((I) => {
      const { A, B, segA, segB } = I;
      const pieceOf = new Map();
      const runs = (cells) => {
        const by = (ax) => {
          const m = new Map();
          cells.forEach((c) => { const k = ax === "a" ? c[1] : c[0]; if (!m.has(k)) m.set(k, []); m.get(k).push(c); });
          const out = [];
          m.forEach((row) => { row.sort((x, y) => (ax === "a" ? x[0] - y[0] : x[1] - y[1])); let cur = [row[0]]; for (let k = 1; k < row.length; k++) { const p = row[k - 1], q = row[k]; if ((ax === "a" ? q[0] - p[0] : q[1] - p[1]) === 1) cur.push(q); else { out.push(cur); cur = [q]; } } out.push(cur); });
          return out;
        };
        const ra = by("a"), rb = by("b");
        return rb.length < ra.length ? rb : ra;
      };
      I.parcels.forEach((p) => {
        const def = PARCELS[p.type];
        const groups = def && def.wing && !p.classic ? [[p.cells[0]], p.cells.slice(1)] : [p.cells];
        groups.forEach((g, gi) => {
          if (!g.length) return;
          runs(g).forEach((run, ri) => {
            const ia = Math.min(...run.map((c) => c[0])), ib = Math.max(...run.map((c) => c[0])), ja = Math.min(...run.map((c) => c[1])), jb = Math.max(...run.map((c) => c[1]));
            const lineW = (ax, idx) => ((ax === "a" ? I.mainA : I.mainB).has(idx) ? 40 : 30);
            const sideOff = (ax, idx, k0, k1) => { let road = false; for (let k = k0; k <= k1; k++) if ((ax === "a" ? segA : segB).has(ax === "a" ? idx + "," + k : k + "," + idx)) road = true; return road ? lineW(ax, idx) / 2 : 6; };
            const offL = sideOff("a", ia, ja, jb), offR = sideOff("a", ib + 1, ja, jb), offT = sideOff("b", ja, ia, ib), offB = sideOff("b", jb + 1, ia, ib);
            const k = { id: I.id + ":" + p.id + ":" + gi + ":" + ri, isle: I.id, a0: A[ia] + offL, a1: A[ib + 1] - offR, b0: B[ja] + offT, b1: B[jb + 1] - offB, kind: "block", parcel: p, role: gi === 0 && ri === 0 ? "main" : "wing", cells: run };
            k.road = { "-a": offL > 6, "+a": offR > 6, "-b": offT > 6, "+b": offB > 6 };
            k.type = p.status === "building" && p.type !== "goals" ? (k.role === "main" ? "site" : "wing:site") : p.classic ? p.type : k.role === "main" || !def || !def.wing ? FILL_OF[p.type] || p.type : "wing:" + def.wing;
            const corner = (gi2, gj2, sA, sB) => { if (!segA.has(sA) || !segB.has(sB)) return 4; const n = nodes.get(A[gi2] + "," + B[gj2]); return !n ? CURB : n.bend ? RC - 15 : n.rb ? 30 : CURB; };
            k.radii = [corner(ia, ja, ia + "," + ja, ia + "," + ja), corner(ib + 1, ja, ib + 1 + "," + ja, ib + "," + ja), corner(ib + 1, jb + 1, ib + 1 + "," + jb, ib + "," + (jb + 1)), corner(ia, jb + 1, ia + "," + jb, ia + "," + (jb + 1))];
            run.forEach((c) => pieceOf.set(c.join(","), k));
            blocks.push(k);
          });
        });
      });
      // seams: grid segments between two different pieces with no road
      const seamSegs = [];
      pieceOf.forEach((k, key) => {
        const [i, j] = key.split(",").map(Number);
        const r = pieceOf.get(i + 1 + "," + j), d = pieceOf.get(i + "," + (j + 1));
        if (r && r !== k && !segA.has(i + 1 + "," + j)) seamSegs.push({ ax: "a", line: i + 1, k0: j, p: k, q: r });
        if (d && d !== k && !segB.has(i + "," + (j + 1))) seamSegs.push({ ax: "b", line: j + 1, k0: i, p: k, q: d });
      });
      seamSegs.forEach((s) => {
        const pts = s.ax === "a" ? [[A[s.line], B[s.k0] + WALK], [A[s.line], B[s.k0 + 1] - WALK]] : [[A[s.k0] + WALK, B[s.line]], [A[s.k0 + 1] - WALK, B[s.line]]];
        seams.push({ pts, p: s.p, q: s.q });
        paths.push({ pts, kind: "inner" });
      });
    });

    /* ---- outline: the urban edge (footway base) and the outer footway, rounded to match the road bends ---- */
    const offsetLoop = (I, loop, o, rCv, rCc) => {
      const W = (g) => [I.A[g[0]], I.B[g[1]]], out = [], n = loop.length;
      for (let k = 0; k < n; k++) {
        const v = W(loop[k]), pv = W(loop[(k - 1 + n) % n]), nv = W(loop[(k + 1) % n]);
        const din = [Math.sign(v[0] - pv[0]), Math.sign(v[1] - pv[1])], dout = [Math.sign(nv[0] - v[0]), Math.sign(nv[1] - v[1])];
        const nin = [din[1], -din[0]], nout = [dout[1], -dout[0]];
        const c = [v[0] + o * (nin[0] + nout[0]), v[1] + o * (nin[1] + nout[1])];
        const convex = din[0] * dout[1] - din[1] * dout[0] > 0;
        const nd = nodes.get(v[0] + "," + v[1]), bend = nd && nd.bend;
        const r = convex ? (bend ? rCv : o + 6) : bend ? rCc : 6;
        const sg = convex ? -1 : 1, C = [c[0] + sg * r * (nin[0] + nout[0]), c[1] + sg * r * (nin[1] + nout[1])];
        const s = [c[0] - din[0] * r, c[1] - din[1] * r], e = [c[0] + dout[0] * r, c[1] + dout[1] * r];
        let t0 = Math.atan2(s[1] - C[1], s[0] - C[0]), t1 = Math.atan2(e[1] - C[1], e[0] - C[0]);
        while (t1 - t0 > Math.PI) t1 -= TAU; while (t0 - t1 > Math.PI) t1 += TAU;
        const steps = Math.max(2, Math.round((r * Math.abs(t1 - t0)) / 12));
        for (let q = 0; q <= steps; q++) { const t = lerp(t0, t1, q / steps); out.push([C[0] + Math.cos(t) * r, C[1] + Math.sin(t) * r]); }
      }
      return out;
    };
    Object.values(ISLES).forEach((I) => {
      const loops = cellLoops(new Set(I.cellP.keys()));
      const outer = loops.reduce((m, l) => (!m || Math.abs(polyArea(l)) > Math.abs(polyArea(m)) ? l : m), null);
      I.loop = outer;
      I.base = offsetLoop(I, outer, 15 + VERGE, RC + 15 + VERGE, RC - 15 - VERGE);
      I.foot = offsetLoop(I, outer, 15 + WALK, RC + 15 + WALK, RC - 15 - WALK);
      I.box = I.base.reduce((m, [a, b]) => ({ a0: Math.min(m.a0, a), a1: Math.max(m.a1, a), b0: Math.min(m.b0, b), b1: Math.max(m.b1, b) }), { a0: 1e9, a1: -1e9, b0: 1e9, b1: -1e9 });
    });

    /* ---- harbours: a marina basin or a lighthouse breakwater on a coastal parcel's open side ---- */
    let marinaWater = null;
    const harbourZones = [], carve = [];
    const pier = (r, type = "pier") => { const p = { ...r, type }; piers.push(p); return p; };
    life.parcels.filter((p) => p.harbour).forEach((p) => {
      const occ = new Map([...life.cellP.keys()].map((k) => [k, 1]));
      const side = coastSide({ ...p, side: p.harbour.side }, occ);
      if (!side) return;
      const [i, j] = p.cells[0], A = life.A, B = life.B, ca0 = A[i], ca1 = A[i + 1], cb0 = B[j], cb1 = B[j + 1];
      const L = side[1] === "b" ? ca1 - ca0 : cb1 - cb0, E = 15 + VERGE + 60;
      const at = (u, v) => (side === "+b" ? [ca0 + u, cb1 + E + v] : side === "-b" ? [ca0 + u, cb0 - E - v] : side === "+a" ? [ca1 + E + v, cb0 + u] : [ca0 - E - v, cb0 + u]);
      const R = (u0, u1, v0, v1) => { const p1 = at(u0, v0), p2 = at(u1, v1); return { a0: Math.min(p1[0], p2[0]), a1: Math.max(p1[0], p2[0]), b0: Math.min(p1[1], p2[1]), b1: Math.max(p1[1], p2[1]) }; };
      const yawU = side[1] === "b" ? 0 : Math.PI / 2;
      if (p.harbour.kind === "marina") {
        pier(R(-20, 12, -6, 222)); pier(R(L - 12, L + 20, -6, 222)); pier(R(12, L * 0.55, 190, 222));
        const water = R(12, L - 12, 0, 190);
        carve.push(water); harbourZones.push(R(-50, L + 50, -110, 10));
        if (!marinaWater) marinaWater = water;
        [0.24, 0.5, 0.76].forEach((t, n) => {
          const u = L * t;
          objs.push({ id: "pontoon" + p.id + n, kind: "ground-pontoon", ...R(u - 4, u + 4, 0, 128) });
          [30, 70, 110].forEach((dv, m) => { const [a, b] = at(u + (m % 2 ? 16 : -16), dv); docks.marina.push({ a, b, yaw: yawU + (m % 2 ? 0 : Math.PI) }); });
        });
      } else {
        pier(R(L / 2 - 16, L / 2 + 16, -6, 238));
        pier(R(L / 2 - 47, L / 2 + 47, 228, 308), "lighthousePad");
        harbourZones.push(R(L / 2 - 80, L / 2 + 80, -110, 10));
        const [a, b] = at(L / 2, 268);
        const bld = p.status === "building";
        plots.goals = put({ id: "goals", kind: "building", drawer: bld ? "construction" : "lighthouse", site: bld, name: p.name || "Lighthouse", landmark: "goals", a, b, w: bld ? 90 : 60, d: bld ? 90 : 60, H: bld ? 110 : 200, face: { "+b": "-b", "-b": "+b", "+a": "-a", "-a": "+a" }[side], noDoor: true, status: p.status });
      }
    });

    /* ---- coastlines: a noisy distance contour round the urban edge, seawalls at the harbours ---- */
    Object.values(ISLES).forEach((I) => {
      const res = 8, pad = 340, r = rng(I.seed);
      const ph = [r() * 9, r() * 9, r() * 9, r() * 9, r() * 9];
      const bx = I.box, x0 = bx.a0 - pad, y0 = bx.b0 - pad, w = Math.ceil((bx.a1 - bx.a0 + 2 * pad) / res) + 1, h = Math.ceil((bx.b1 - bx.b0 + 2 * pad) / res) + 1;
      const D = edt(rasterPoly(I.base, w, h, x0, y0, res), w, h);
      const bumps = I.base.filter((_, k) => k % Math.max(1, Math.floor(I.base.length / 5)) === 2).map((p) => ({ a: p[0], b: p[1], h: (r() < 0.5 ? -1 : 1) * (30 + r() * 45), s: 90 + r() * 90 }));
      const zoneW = (a, b) => { let m = 0; harbourZones.forEach((z) => { const dx = Math.max(z.a0 - a, 0, a - z.a1), dy = Math.max(z.b0 - b, 0, b - z.b1); m = Math.max(m, clamp(1 - Math.hypot(dx, dy) / 70, 0, 1)); }); return m; };
      const margin = (a, b) => {
        if (I.style === "quay") return 70;
        let m = 118 + 42 * (0.55 * Math.sin(a / 97 + ph[0]) + 0.3 * Math.sin(b / 61 + ph[1]) + 0.15 * Math.sin((a + b) / 37 + ph[2]));
        bumps.forEach((q) => { m += q.h * Math.exp(-(((a - q.a) ** 2 + (b - q.b) ** 2) / (q.s * q.s))); });
        return lerp(Math.max(72, m), 60, zoneW(a, b));
      };
      const F = new Float64Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const a = x0 + x * res, b = y0 + y * res;
        let f = D[y * w + x] * res - margin(a, b);
        if (carve.some((c) => a > c.a0 - 2 && a < c.a1 + 2 && b > c.b0 - 2 && b < c.b1 + 2)) f = Math.max(f, 12);
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) f = Math.max(f, 1);
        F[y * w + x] = f;
      }
      const loops = contour(F, w, h, x0, y0, res);
      let loop = loops.reduce((m, l) => (!m || Math.abs(polyArea(l)) > Math.abs(polyArea(m)) ? l : m), null) || I.base;
      loop = loop.filter((_, k) => k % 2 === 0);
      const n = loop.length, sgn = polyArea(loop) > 0 ? 1 : -1;
      const pts = loop.map((p, k) => {
        const q0 = loop[(k - 1 + n) % n], q1 = loop[(k + 1) % n];
        let na = (q1[1] - q0[1]) * sgn, nb = -(q1[0] - q0[0]) * sgn; const L2 = Math.hypot(na, nb) || 1; na /= L2; nb /= L2;
        const wall = I.style === "quay" || zoneW(p[0], p[1]) > 0.5;
        const beach = clamp((Math.sin((p[0] * 0.7 + p[1] * 0.3) / 180 + ph[3]) - 0.45) * 3, 0, 1);
        return { a: p[0], b: p[1], na, nb, wall, sand: wall ? 0 : lerp(14 + 6 * Math.sin(p[0] / 53 + ph[4]), 56, beach) };
      });
      // check the normals point out to sea
      const probe = pts[0], px = Math.round((probe.a + probe.na * 16 - x0) / res), py = Math.round((probe.b + probe.nb * 16 - y0) / res);
      if (px >= 0 && py >= 0 && px < w && py < h && F[py * w + px] < 0) pts.forEach((p) => { p.na = -p.na; p.nb = -p.nb; });
      for (let pass = 0; pass < 2; pass++) pts.forEach((p, i) => { if (p.wall) return; const q0 = pts[(i - 1 + n) % n], q1 = pts[(i + 1) % n]; p.a = (q0.a + 2 * p.a + q1.a) / 4; p.b = (q0.b + 2 * p.b + q1.b) / 4; });
      coasts.push({ isle: I.id, pts, poly: pts.map((p) => [p.a, p.b]) });
    });

    /* ---- land tests ---- */
    const landAt = (a, b) => coasts.some((c) => inPoly(c.poly, a, b)) || piers.some((p) => inRect(p, a, b));
    const inUrban = (a, b, m = 0) => Object.values(ISLES).some((I) => a > I.box.a0 - m && a < I.box.a1 + m && b > I.box.b0 - m && b < I.box.b1 + m && inPoly(I.base, a, b));
    if (bridgeE) {
      const by = bridgeE.n0.b; let a0 = bridgeE.n0.a, a1 = bridgeE.n1.a;
      while (a0 < bridgeE.n1.a && inPoly(coasts[0].poly, a0, by)) a0 += 2;
      while (a1 > bridgeE.n0.a && inPoly(coasts[1].poly, a1, by)) a1 -= 2;
      bridgeE.bridge = { a0: a0 - 6, a1: a1 + 6 };
    }
    // Tender Port jetties along the work island's quay
    const quayB = work ? work.box.b1 + 72 : 0, aw = work ? work.A[0] : 0;
    if (work) {
      [[50, 90], [410, 450]].forEach(([u0, u1]) => pier({ a0: aw + u0, a1: aw + u1, b0: quayB - 6, b1: quayB + 190 }, "jetty"));
      [18, 122, 378, 482].forEach((u) => docks.port.push({ a: aw + u, b: quayB + 104, yaw: Math.PI / 2, big: true }));
      docks.port.push({ a: aw + 250, b: quayB + 30, yaw: 0, big: true });
      docks.tugs = [{ a: aw + 70, b: quayB + 222, yaw: Math.PI / 2, kind: "launch", color: "#E0474C" }, { a: aw + 430, b: quayB + 226, yaw: Math.PI / 2 + 0.3, kind: "launch", color: "#F2C14E" }];
    }


    /* ---- lots and buildings ---- */
    const inner = (k, m = 16) => ({ a0: k.a0 + m, a1: k.a1 - m, b0: k.b0 + m, b1: k.b1 - m });
    const quads = (k) => {
      const I = inner(k), r = rng(hash("q" + k.id));
      const ma = lerp(I.a0, I.a1, 0.36 + r() * 0.28), mb = lerp(I.b0, I.b1, 0.36 + r() * 0.28);
      return [{ a0: I.a0, a1: ma - 7, b0: I.b0, b1: mb - 7 }, { a0: ma + 7, a1: I.a1, b0: I.b0, b1: mb - 7 }, { a0: I.a0, a1: ma - 7, b0: mb + 7, b1: I.b1 }, { a0: ma + 7, a1: I.a1, b0: mb + 7, b1: I.b1 }];
    };
    /* varied plots: a front row and a back row, each cut into 1-3 lots of
       random width, so every lot still touches a street */
    const rowLots = (k, minN = 3) => {
      const I = inner(k), r = rng(hash("rows" + k.id));
      const cut = lerp(I.b0, I.b1, 0.34 + r() * 0.32);
      const rows = [[I.b0, cut - 7], [cut + 7, I.b1]];
      const out = [];
      rows.forEach(([b0, b1], ri) => {
        const n = 1 + ((r() * 3) | 0) + (ri === 1 && out.length + 1 < minN ? 1 : 0);
        const cuts = [];
        for (let k2 = 0; k2 < n; k2++) cuts.push(0.75 + r() * 0.9);
        const tot = cuts.reduce((x, y) => x + y, 0);
        let a = I.a0;
        cuts.forEach((c, k2) => { const w = ((I.a1 - I.a0) - 14 * (n - 1)) * (c / tot); out.push({ a0: a, a1: a + w, b0, b1 }); a += w + 14; });
      });
      while (out.length < minN) { const big = out.reduce((x, y) => (y.a1 - y.a0 > x.a1 - x.a0 ? y : x)); const m = (big.a0 + big.a1) / 2; out.splice(out.indexOf(big), 1, { ...big, a1: m - 7 }, { ...big, a0: m + 7 }); }
      // back row first so indexes are stable: order by row then a
      return out.sort((x, y) => x.b0 - y.b0 || x.a0 - y.a0);
    };
    // face the street: a lot edge on the block's edge where a road (not a footpath seam) runs
    const face = (lot, k) => {
      const I = inner(k), rd = k.road || { "+b": 1, "+a": 1, "-b": 1, "-a": 1 };
      const on = { "+b": Math.abs(lot.b1 - I.b1) < 1, "+a": Math.abs(lot.a1 - I.a1) < 1, "-b": Math.abs(lot.b0 - I.b0) < 1, "-a": Math.abs(lot.a0 - I.a0) < 1 };
      return ["+b", "+a", "-b", "-a"].find((f) => on[f] && rd[f]) || ["+b", "+a", "-b", "-a"].find((f) => on[f]) || "+b";
    };
    const building = (k, lot, spec) => {
      const a = (lot.a0 + lot.a1) / 2, b = (lot.b0 + lot.b1) / 2;
      const w = lot.a1 - lot.a0 - (spec.pad ?? 10), d = lot.b1 - lot.b0 - (spec.pad ?? 10);
      const f = spec.face || face(lot, k);
      const o = put({ id: spec.id || k.id + ":" + objs.length, kind: "building", a, b, w, d, face: f, block: k.parent ? k.parent.id : k.id, lot, ...spec });
      const off = { "+a": [w / 2 + 6, 0], "-a": [-w / 2 - 6, 0], "+b": [0, d / 2 + 6], "-b": [0, -d / 2 - 6] }[f];
      if (!spec.noDoor) o.door = { a: a + off[0], b: b + off[1] };
      return o;
    };
    // a landmark venue (its id is what the app opens when it's tapped)
    const site = (id, k, lot, spec) => (plots[id] = building(k, lot, spec));
    const sectionBy = {};
    sections.forEach((s) => (sectionBy[s.slot] = s));
    const firstFreeSlot = () => { for (let s = 0; s < SECTION_LOTS.length; s++) if (!sectionBy[s]) return s; return -1; };
    const reservedLot = (type, q) => SECTION_LOTS.findIndex(([t, qq]) => t === type && qq === q);
    const HOUSE_COLS = ["#F6EDDF", "#F3D9C4", "#E6EEF3", "#F4E3C3", "#E3F1EE", "#F7E1E6", "#EDE7F0"];
    const ROOF_COLS = ["#D9734E", "#B85C3C", "#5F7F8C", "#6B8E5A", "#8A5A44", "#C8654A"];
    const tree = (a, b, t = "tree", s = 1, v = 0) => put({ kind: "tree", a, b, t, s, v });
    // trees in the parts of a lot the building doesn't use (behind it)
    const backTrees = (lot, f, n = 2, seed = 1) => {
      const r = rng(seed);
      const pts = { "+b": [[lot.a0 + 12, lot.b0 + 12], [lot.a1 - 12, lot.b0 + 12]], "+a": [[lot.a0 + 12, lot.b0 + 12], [lot.a0 + 12, lot.b1 - 12]], "-b": [[lot.a0 + 12, lot.b1 - 12], [lot.a1 - 12, lot.b1 - 12]], "-a": [[lot.a1 - 12, lot.b0 + 12], [lot.a1 - 12, lot.b1 - 12]] }[f] || [];
      pts.slice(0, n).forEach(([a, b], k) => { if (r() < 0.85) tree(a, b, r() < 0.25 ? "pine" : "tree", 0.75 + r() * 0.3, k + (seed % 4)); });
    };
    const filler = (k, lot, kind, qi) => {
      const slot = reservedLot(k.type, qi);
      if (slot >= 0) {
        const s = sectionBy[slot];
        if (s) { const o = building(k, lot, { id: s.id, drawer: "section", sKind: s.kind, color: s.color, name: s.name, landmark: s.id, H: 70, pad: 18 }); plots[s.id] = o; backTrees(lot, o.face, 1, slot + 3); return; }
        if (slot === firstFreeSlot()) { building(k, lot, { drawer: "forsale", H: 30, noDoor: true, plot: { free: true, slot } }); return; }
      }
      const seed = hash(k.id + qi), r = rng(seed);
      const spec = { drawer: kind, seed, wall: HOUSE_COLS[(r() * HOUSE_COLS.length) | 0], roof: ROOF_COLS[(r() * ROOF_COLS.length) | 0], floors: 1 + ((r() * 2) | 0) };
      if (kind === "apartment") { spec.floors = 3 + ((r() * 3) | 0); spec.H = spec.floors * 20 + 30; spec.pad = 34; }
      else if (kind === "shop") { spec.awn = ["#D9734E", "#2A9D8F", "#3E7CB1", "#C2577A", "#6DAE5B"][(r() * 5) | 0]; spec.label = ["Bakery", "Books", "Deli", "Florist", "Pharmacy", "Bikes", "Salon", "Grocer"][(r() * 8) | 0]; spec.H = spec.floors * 20 + 30; spec.pad = 26; }
      else spec.H = spec.floors * 20 + 34;
      const o = building(k, lot, spec);
      backTrees(lot, o.face, kind === "house" ? 2 : 1, seed);
    };
    const construction = (k, lot, key) => {
      const u = UNLOCKS[key];
      if (islandLevel >= u.level) return building(k, lot, { drawer: u.kind, name: u.name, H: 90, pad: 22 });
      return building(k, lot, { drawer: "construction", name: u.name, level: u.level, H: 110, pad: 18, noDoor: true, plot: { cs: key, level: u.level, name: u.name } });
    };
    const scatter = (I, n, avoid, kinds = ["tree", "tree", "pine"], seed = 1, minD = 22) => {
      const r = rng(seed), pts = [];
      for (let t = 0; t < n * 12 && pts.length < n; t++) {
        const a = lerp(I.a0 + 8, I.a1 - 8, r()), b = lerp(I.b0 + 8, I.b1 - 8, r());
        if (avoid && avoid(a, b)) continue;
        if (pts.some(([x, y]) => Math.hypot(x - a, y - b) < minD)) continue;
        pts.push([a, b]); tree(a, b, kinds[(r() * kinds.length) | 0], 0.8 + r() * 0.35, (r() * 4) | 0);
      }
    };

    const fillBlock = (k) => {
      const Q = quads(k), I = inner(k);
      const whole = { ...I };
      const t = k.type, ma = (I.a0 + I.a1) / 2, mb = (I.b0 + I.b1) / 2;
      if (t === "apartments") {
        filler(k, Q[1], "apartment", 1); filler(k, Q[3], "apartment", 3); filler(k, Q[2], "apartment", 2);
        put({ kind: "ground-garden", ...Q[0] });
        scatter(Q[0], 5, null, ["tree", "pine"], hash(k.id));
      } else if (t === "houses" || t === "houses2" || t === "beachHouses") {
        const lots = rowLots(k, 3);
        lots.forEach((lot, q) => { const small = lot.a1 - lot.a0 < 70 || lot.b1 - lot.b0 < 70; filler(k, lot, "house", q); if (!small && lot.a1 - lot.a0 > 130) scatter({ a0: lot.a1 - 50, a1: lot.a1, b0: lot.b0, b1: lot.b1 }, 2, null, ["tree"], hash(k.id + q)); });
      } else if (t === "shops") {
        rowLots(k, 3).forEach((lot, q) => filler(k, lot, q === 0 ? "apartment" : "shop", q));
      } else if (t === "downtown") {
        // a cluster of towers of different heights round a small plaza
        const r = rng(hash("dt" + k.id));
        put({ kind: "ground-square", ...whole });
        const lots = rowLots(k, 4);
        lots.forEach((lot, q) => {
          const floors = 7 + ((r() * 9) | 0);
          building(k, lot, { drawer: "tower", seed: hash(k.id + q), floors, H: floors * 16 + 70, pad: 20 + r() * 14, glass: ["#6D98C0", "#5E8E9C", "#7FA7B8", "#8A9BB0"][(r() * 4) | 0] });
        });
        [[I.a0 + 20, I.b1 - 20], [I.a1 - 20, I.b1 - 20]].forEach(([a, b]) => put({ kind: "prop", p: "planterTree", a, b }));
      } else if (t === "farm") {
        // fields, a barn and a farmhouse at the edge of town
        const r = rng(hash("farm" + k.id));
        const crops = ["#C9B458", "#8CBF5A", "#A87D4E", "#B7CF6A"];
        const fa = lerp(I.a0, I.a1, 0.52), fb = lerp(I.b0, I.b1, 0.5);
        [[I.a0, fa - 6, I.b0, fb - 6], [fa + 6, I.a1, I.b0, fb - 6], [I.a0, fa - 6, fb + 6, I.b1]].forEach(([a0, a1, b0, b1], n) => put({ kind: "ground-field", a0, a1, b0, b1, c: crops[(n + ((r() * 4) | 0)) % 4], dir: n % 2 ? "a" : "b" }));
        const yard = { a0: fa + 6, a1: I.a1, b0: fb + 6, b1: I.b1 };
        building(k, { a0: yard.a0, a1: yard.a1, b0: yard.b0, b1: (yard.b0 + yard.b1) / 2 + 10 }, { drawer: "barn", H: 90, pad: 14, face: "+b" });
        filler(k, { a0: yard.a0, a1: yard.a1, b0: (yard.b0 + yard.b1) / 2 + 20, b1: yard.b1 }, "house", 9);
        k.pasture = { a: (I.a0 + fa) / 2, b: (fb + I.b1) / 2, ra: (fa - I.a0) / 2 - 12, rb: (I.b1 - fb) / 2 - 12 };
        for (let n = 0; n < 5; n++) put({ kind: "prop", p: "hay", a: lerp(fa + 20, I.a1 - 20, r()), b: lerp(I.b0 + 20, fb - 20, r()) });
      } else if (t === "park" || t === "garden") {
        const pond = t === "park" ? { a: ma + 30, b: mb - 20, ra: 46, rb: 32 } : null;
        put({ kind: "ground-park", ...whole, pond, garden: t === "garden" });
        const avoid = (a, b) => (pond && ((a - pond.a) / 56) ** 2 + ((b - pond.b) / 44) ** 2 < 1) || Math.abs(a - ma) < 12 || Math.abs(b - mb) < 12;
        if (t === "garden") {
          for (let a = I.a0 + 24; a < ma - 14; a += 26) for (let b = I.b0 + 24; b < mb - 14; b += 26) tree(a, b, "tree", 0.65, 2);
          scatter({ a0: ma + 14, a1: I.a1, b0: I.b0, b1: I.b1 }, 7, avoid, ["tree", "pine"], hash(k.id));
          put({ kind: "prop", p: "stall", a: I.a0 + 60, b: I.b1 - 40, c: "#6DAE5B" });
        } else scatter(I, 20, avoid, ["tree", "tree", "pine"], hash(k.id));
        put({ kind: "prop", p: "bench", a: ma - 22, b: mb + 18, axis: "a" });
        put({ kind: "prop", p: "bench", a: ma + 18, b: mb + 22, axis: "b" });
        lamps.push({ a: ma - 14, b: mb - 14 });
        if (pond) k.pond = pond;
      } else if (t === "square") {
        put({ kind: "ground-square", ...whole });
        building(k, { a0: ma - 30, a1: ma + 30, b0: mb - 30, b1: mb + 30 }, { drawer: "fountain", H: 40, pad: 0, id: "plaza", noDoor: true });
        k.pigeons = { a: ma, b: mb + 64 };
        [[I.a0 + 22, I.b0 + 22], [I.a1 - 22, I.b0 + 22], [I.a0 + 22, I.b1 - 22], [I.a1 - 22, I.b1 - 22]].forEach(([a, b]) => put({ kind: "prop", p: "planterTree", a, b }));
        [[I.a0 + 64, I.b1 - 34], [I.a1 - 64, I.b1 - 34], [I.a1 - 34, I.b0 + 64]].forEach(([a, b], n) => put({ kind: "prop", p: "stall", a, b, c: ["#D9734E", "#2A9D8F", "#E9B949"][n] }));
        lamps.push({ a: I.a0 + 54, b: mb }, { a: I.a1 - 54, b: mb });
      } else if (t === "parking") {
        const lotR = { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b0 + 200 };
        put({ kind: "ground-parking", ...lotR });
        const r = rng(hash(k.id));
        for (let row = 0; row < 3; row++) for (let s = 0; s < 8; s++) {
          if (r() < 0.35) continue;
          put({ kind: "parked", a: lotR.a0 + 20 + s * ((lotR.a1 - lotR.a0 - 40) / 7), b: lotR.b0 + 30 + row * 70, yaw: (Math.PI / 2) * (row % 2 ? 1 : -1), vk: r() < 0.2 ? "bakkie" : r() < 0.3 ? "van" : "hatch", c: ["#D9534F", "#3E7CB1", "#F2C14E", "#2A9D8F", "#F6EDDF", "#7E6BC4", "#44545A"][(r() * 7) | 0] });
        }
        put({ kind: "ground-garden", a0: I.a0, a1: I.a1, b0: I.b0 + 214, b1: I.b1 });
        scatter({ a0: I.a0, a1: I.a1, b0: I.b0 + 220, b1: I.b1 }, 6, null, ["tree"], hash(k.id) + 1);
      } else if (t === "home") {
        const o = building(k, Q[0], { drawer: "cottage", id: "personal", landmark: "personal", H: 80, pad: 14 });
        plots.personal = o;
        put({ kind: "ground-garden", ...Q[2] }); put({ kind: "ground-garden", ...Q[3] });
        scatter(Q[2], 4, null, ["tree", "pine"], 7); scatter(Q[3], 3, null, ["tree"], 8);
        filler(k, Q[1], "house", 1);
      } else if (t === "freelance") {
        site("freelance", k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: mb + 10 }, { drawer: "drafting", id: "freelance", landmark: "freelance", H: 110, pad: 22, face: "+b" });
        filler(k, Q[2], "shop", 2); put({ kind: "ground-garden", ...Q[3] }); scatter(Q[3], 4, null, ["tree"], 11);
      } else if (t === "studio") {
        site("youtube", k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: mb + 10 }, { drawer: "film", id: "youtube", landmark: "youtube", H: 110, pad: 20, face: "+b" });
        filler(k, Q[2], "house", 2); filler(k, Q[3], "house", 3);
      } else if (t === "maker") {
        site("bynode", k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: mb + 20 }, { drawer: "maker", id: "bynode", landmark: "bynode", H: 100, pad: 22, face: "+b" });
        filler(k, Q[2], "shop", 2); put({ kind: "ground-garden", ...Q[3] }); scatter(Q[3], 3, null, ["tree", "pine"], 13);
      } else if (t === "cafe") {
        site("coffee", k, Q[3], { drawer: "cafe", id: "coffee", landmark: "coffee", H: 80, pad: 22, face: "+b" });
        [[Q[3].a0 + 14, Q[3].b1 + 2], [Q[3].a0 + 44, Q[3].b1 + 2]].forEach(([a, b]) => put({ kind: "prop", p: "umbrella", a, b, c: "#D9734E" }));
        filler(k, Q[0], "shop", 0); filler(k, Q[1], "apartment", 1); put({ kind: "ground-garden", ...Q[2] }); scatter(Q[2], 3, null, ["tree"], 17);
      } else if (t === "mill") {
        site("wood", k, { a0: I.a0, a1: I.a1, b0: mb - 20, b1: I.b1 }, { drawer: "mill", id: "wood", landmark: "wood", H: 100, pad: 16, face: "+b" });
        filler(k, Q[0], "house", 0); put({ kind: "ground-garden", ...Q[1] }); scatter(Q[1], 4, null, ["pine", "tree"], 19);
      } else if (t === "gym") {
        site("fitness", k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b0 + 90 }, { drawer: "gym", id: "fitness", landmark: "fitness", H: 80, pad: 14, face: "+b" });
        put({ kind: "ground-track", a0: I.a0, a1: I.a1, b0: I.b0 + 100, b1: I.b1 });
        k.track = { a0: I.a0, a1: I.a1, b0: I.b0 + 100, b1: I.b1 };
      } else if (t === "marina") {
        site("marina", k, Q[2], { drawer: "marinaOffice", id: "marina", landmark: "marina", H: 70, pad: 16, face: "+b" });
        filler(k, Q[0], "shop", 0); filler(k, Q[1], "shop", 1);
        put({ kind: "ground-square", ...Q[3] });
        put({ kind: "prop", p: "umbrella", a: Q[3].a0 + 30, b: Q[3].b0 + 40, c: "#2A9D8F" });
        put({ kind: "prop", p: "umbrella", a: Q[3].a1 - 30, b: Q[3].b1 - 30, c: "#E9B949" });
      } else if (t === "site") {
        // a new venture: fenced site, crane and builders until its first task is done
        const p = k.parcel, lm = p.landmark || (PARCELS[p.type] || {}).landmark || p.id;
        plots[lm] = building(k, { a0: I.a0 + 10, a1: I.a1 - 10, b0: I.b0 + 10, b1: I.b1 - 10 }, { drawer: "construction", id: lm, landmark: lm, name: p.name || (PARCELS[p.type] || {}).label || "New", H: 110, pad: 18, noDoor: true, site: true });
        k.site = { a: (I.a0 + I.a1) / 2, b: (I.b0 + I.b1) / 2, ra: (I.a1 - I.a0) / 2 - 20, rb: (I.b1 - I.b0) / 2 - 20, lm };
      } else if (t === "wing:site") {
        // the rest of the plot waits as meadow with material piles
        put({ kind: "ground-garden", ...whole });
        const r = rng(hash(k.id));
        for (let n = 0; n < 3; n++) put({ kind: "prop", p: n % 2 ? "logs" : "crate", a: lerp(I.a0 + 30, I.a1 - 30, r()), b: lerp(I.b0 + 30, I.b1 - 30, r()) });
        scatter(I, 4, null, ["tree"], hash(k.id));
      } else if (t === "lookout") {
        const lm = "goals-park";
        put({ kind: "ground-park", ...whole, pond: null });
        scatter(I, 9, (a, b) => Math.abs(a - ma) < 30 && Math.abs(b - mb) < 30, ["tree", "pine"], hash(k.id));
        put({ kind: "prop", p: "bench", a: ma - 20, b: mb + 16, axis: "a" }); put({ kind: "prop", p: "bench", a: ma + 16, b: mb - 20, axis: "b" });
        lamps.push({ a: ma, b: mb });
      } else if (t === "bank" || t === "faith" || t === "townhall" || t === "section" || t === "dealership" || t === "dreamhouse" || t === "airport") {
        const p = k.parcel, def = PARCELS[p.type] || {}, lm = p.landmark || def.landmark || p.id;
        const drawer = t === "section" ? "section" : t === "airport" ? "terminal" : t;
        const big = { a0: I.a0 + 6, a1: I.a1 - 6, b0: I.b0 + 6, b1: lerp(I.b0, I.b1, t === "faith" ? 0.78 : 0.7) };
        plots[lm] = building(k, big, { drawer, id: lm, landmark: lm, style: p.style, sKind: p.sKind || "office", color: p.color, name: p.name, H: t === "faith" ? 150 : 100, pad: 14, face: face({ ...big, b1: I.b1 }, k) });
        const front = { a0: I.a0, a1: I.a1, b0: big.b1 + 10, b1: I.b1 };
        put({ kind: "ground-garden", ...front });
        scatter(front, 3, null, ["tree"], hash(k.id));
        if (t === "bank") put({ kind: "prop", p: "planterTree", a: ma, b: front.b0 + 20 });
      } else if (t.startsWith("wing:")) {
        // the thinner/wider arm of a non-rectangular parcel
        const w = t.slice(5), p = k.parcel, lm = p.landmark || (PARCELS[p.type] || {}).landmark || p.id, r = rng(hash(k.id));
        if (w === "annex") {
          const long = I.a1 - I.a0 > I.b1 - I.b0;
          const lot = long ? { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b0 + Math.min(110, (I.b1 - I.b0) * 0.6) } : { a0: I.a0, a1: I.a0 + Math.min(110, (I.a1 - I.a0) * 0.6), b0: I.b0, b1: I.b1 };
          building(k, lot, { drawer: "annex", landmark: lm, color: p.color || "#7E6BC4", H: 44, pad: 10 });
          const rest = long ? { ...I, b0: lot.b1 + 12 } : { ...I, a0: lot.a1 + 12 };
          put({ kind: "ground-garden", ...rest }); scatter(rest, 4, null, ["tree", "pine"], hash(k.id));
        } else if (w === "backlot") {
          put({ kind: "ground-yard", ...whole });
          building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b0 + Math.min(120, (I.b1 - I.b0) * 0.55) }, { drawer: "annex", landmark: lm, color: "#44545A", H: 60, pad: 16, stage: true });
          for (let n = 0; n < 3; n++) put({ kind: "parked", a: lerp(I.a0 + 30, I.a1 - 30, (n + 0.5) / 3), b: I.b1 - 36, yaw: Math.PI / 2, vk: n === 1 ? "truck" : "van", c: ["#E0474C", "#F6EDDF", "#44545A"][n] });
        } else if (w === "yard") {
          put({ kind: "ground-yard", ...whole });
          const cols = ["#2A9D8F", "#E9B949", "#7E6BC4", "#E0474C"];
          for (let n = 0; n < 4; n++) put({ kind: "container", a: I.a0 + 30 + (n % 2) * 44, b: I.b0 + 40 + ((n / 2) | 0) * 28, h: 1 + (n % 2), c: cols[n] });
          building(k, { a0: ma, a1: I.a1, b0: I.b0, b1: I.b1 }, { drawer: "annex", landmark: lm, color: p.color || "#2A9D8F", H: 38, pad: 14 });
        } else if (w === "timber") {
          put({ kind: "ground-yard", ...whole });
          for (let n = 0; n < 6; n++) put({ kind: "prop", p: "logs", a: lerp(I.a0 + 30, I.a1 - 30, r()), b: lerp(I.b0 + 30, I.b1 - 30, r()) });
          scatter({ a0: I.a0, a1: I.a1, b0: I.b1 - 50, b1: I.b1 }, 5, null, ["pine"], hash(k.id));
        } else if (w === "field") {
          put({ kind: "ground-track", ...whole });
          k.track = whole;
        } else if (w === "courtyard") {
          put({ kind: "ground-square", ...whole });
          [[I.a0 + 24, I.b0 + 24], [I.a1 - 24, I.b0 + 24], [I.a0 + 24, I.b1 - 24], [I.a1 - 24, I.b1 - 24]].forEach(([a, b]) => put({ kind: "prop", p: "planterTree", a, b }));
          building(k, { a0: ma - 26, a1: ma + 26, b0: mb - 26, b1: mb + 26 }, { drawer: "fountain", H: 40, pad: 0, noDoor: true });
        } else {
          put({ kind: "ground-garden", ...whole }); scatter(I, 6, null, ["tree", "pine"], hash(k.id));
        }
      } else if (t.startsWith("cs:")) {
        construction(k, whole, t.slice(3));
      } else if (t === "epcmHQ") {
        site("epcm", k, { a0: I.a0, a1: I.a1 - 70, b0: I.b0, b1: I.b1 - 120 }, { drawer: "epcmHQ", id: "epcm", landmark: "epcm", H: 170, pad: 12, face: "+b" });
        put({ kind: "ground-parking", a0: I.a0, a1: I.a1, b0: I.b1 - 100, b1: I.b1 - 10 });
        for (let s = 0; s < 7; s++) put({ kind: "parked", a: I.a0 + 25 + s * 38, b: I.b1 - 55, yaw: Math.PI / 2, vk: s % 3 ? "hatch" : "bakkie", c: ["#F6EDDF", "#44545A", "#3E7CB1", "#D9534F"][s % 4] });
        scatter({ a0: I.a1 - 60, a1: I.a1, b0: I.b0, b1: I.b1 - 120 }, 4, null, ["pine"], 23);
      } else if (t === "refinery") {
        building(k, whole, { drawer: "refinery", id: "epcmPlant", landmark: "epcm", H: 190, pad: 6, noDoor: true });
      } else if (t === "hub") {
        plots.hub = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b0 + 170 }, { drawer: "hubWarehouse", id: "hub", landmark: "hub", H: 90, pad: 12, face: "+b" });
        put({ kind: "ground-yard", a0: I.a0, a1: I.a1, b0: I.b0 + 180, b1: I.b1 });
        scatter({ a0: I.a0, a1: I.a0 + 60, b0: I.b0 + 190, b1: I.b1 }, 4, null, ["tree"], 29);
      } else if (t === "portyard") {
        put({ kind: "ground-yard", ...whole });
        construction(k, { a0: I.a0, a1: I.a0 + 140, b0: I.b0, b1: I.b0 + 160 }, "fabyard");
        const cols = ["#E0474C", "#3E7CB1", "#E9B949", "#2A9D8F", "#F08A4B", "#7E6BC4"];
        for (let row = 0; row < 3; row++) for (let s = 0; s < 3; s++) put({ kind: "container", a: I.a0 + 180 + s * 40, b: I.b0 + 70 + row * 26, h: 1 + ((row + s) % 3), c: cols[(row * 3 + s) % cols.length] });
      }
    };
    blocks.forEach((k) => fillBlock(k));
    // Tender Port cranes on the quay
    if (work) plots.port = put({ id: "port", kind: "building", drawer: "portCranes", landmark: "port", a: aw + 350, b: quayB - 34, w: 300, d: 40, H: 130, face: "+b", noDoor: true });

    /* ---- street trees in the verges of every block ---- */
    blocks.forEach((k) => {
      const busy = objs.filter((o) => o.block === k.id && o.door);
      const pts = [];
      for (let a = k.a0 + 34; a < k.a1 - 24; a += 46) pts.push([a, k.b1 - 3], [a, k.b0 + 3]);
      for (let b = k.b0 + 34; b < k.b1 - 24; b += 46) pts.push([k.a1 - 3, b], [k.a0 + 3, b]);
      pts.forEach(([a, b], n) => {
        if ((n + k.id.length) % 3 === 0) return;
        if (busy.some((o) => Math.abs(o.door.a - a) < 24 && Math.abs(o.door.b - b) < 24)) return;
        put({ kind: "tree", a, b, v: n, s: 0.62, t: "tree", street: true });
      });
    });

    /* ---- coastal parkland: footpath, trees, palms, rocks ---- */
    coasts.forEach((c, ci) => {
      const I = Object.values(ISLES).find((x) => x.id === c.isle);
      const box = I.box;
      const inBox = (a, b, m = 0) => inUrban(a, b, m) || inUrban(a + m, b, 0) || inUrban(a - m, b, 0) || inUrban(a, b + m, 0) || inUrban(a, b - m, 0);
      // footpath: follow the coast inland of the sand
      const fp = c.pts.map((p) => { const d = p.sand + 22; return { a: p.a - p.na * d, b: p.b - p.nb * d, wall: p.wall }; });
      const runs = []; let cur = [];
      fp.forEach((p) => { if (!inBox(p.a, p.b, 8) && !piers.some((q) => inRect(q, p.a, p.b, 12))) cur.push(p); else { if (cur.length > 4) runs.push(cur); cur = []; } });
      if (cur.length > 4) { if (runs.length && !inBox(fp[0].a, fp[0].b, 8)) runs[0] = cur.concat(runs[0]); else runs.push(cur); }
      runs.forEach((r2) => paths.push({ pts: r2.map((p) => [p.a, p.b]), kind: "coast", isle: c.isle }));
      // trees in the coastal park
      const r = rng(hash("park" + c.isle));
      const bb = c.poly.reduce((m, [a, b]) => ({ a0: Math.min(m.a0, a), a1: Math.max(m.a1, a), b0: Math.min(m.b0, b), b1: Math.max(m.b1, b) }), { a0: 1e9, a1: -1e9, b0: 1e9, b1: -1e9 });
      const nearPath = (a, b) => paths.some((pp) => pp.isle === c.isle && pp.pts.some(([x, y]) => Math.hypot(x - a, y - b) < 14));
      const coastDist = (a, b) => Math.min(...c.pts.map((p) => Math.hypot(p.a - a, p.b - b) - p.sand));
      let placed = 0;
      for (let t = 0; t < 1400 && placed < (c.isle === "life" ? 90 : 30); t++) {
        const a = lerp(bb.a0, bb.a1, r()), b = lerp(bb.b0, bb.b1, r());
        if (!inPoly(c.poly, a, b) || inBox(a, b, 6) || nearPath(a, b)) continue;
        const cd = coastDist(a, b);
        if (cd < 12) continue;
        if (bridgeE && Math.abs(b - bridgeE.n0.b) < 40 && a > bridgeE.n0.a - 10 && a < bridgeE.n1.a + 10) continue;
        if (objs.some((o) => o.kind === "tree" && Math.hypot(o.a - a, o.b - b) < 20)) continue;
        const beachy = c.pts.some((p) => p.sand > 30 && Math.hypot(p.a - a, p.b - b) < 70);
        tree(a, b, beachy || cd < 30 ? "palm" : r() < 0.3 ? "pine" : "tree", 0.8 + r() * 0.35, (r() * 4) | 0);
        placed++;
      }
      // a few rocks where the shore is narrow
      c.pts.forEach((p, k) => { if (!p.wall && p.sand < 18 && k % 9 === 0) put({ kind: "prop", p: "rock", a: p.a + p.na * 4, b: p.b + p.nb * 4, s: 0.8 + (k % 5) / 6 }); });
    });

    /* ---- lamps ---- */
    nodes.forEach((n) => {
      if (n.rb || n.bend) return;
      const off = n.w / 2 + 7;
      lamps.push({ a: n.a + off, b: n.b + off, corner: true });
      lamps.push({ a: n.a - off, b: n.b - off, corner: true });
    });
    paths.forEach((pp) => pp.pts.forEach(([a, b], k) => { if (k % 9 === 4) lamps.push({ a, b, path: true }); }));
    piers.forEach((p) => { if (p.type === "pier" || p.type === "jetty") { const alongA = p.a1 - p.a0 > p.b1 - p.b0; for (let t = 0.2; t < 1; t += 0.3) lamps.push({ a: alongA ? lerp(p.a0, p.a1, t) : (p.a0 + p.a1) / 2, b: alongA ? (p.b0 + p.b1) / 2 : lerp(p.b0, p.b1, t), pier: true }); } });
    lamps.forEach((l, i) => put({ kind: "lamp", a: l.a, b: l.b, idx: i, pier: l.pier }));

    /* ---- traffic lights ---- */
    const signals = [];
    nodes.forEach((n) => {
      if (!n.signal) return;
      n.edges.forEach((e) => {
        const other = e.n0 === n ? e.n1 : e.n0;
        const da = Math.sign(other.a - n.a), db = Math.sign(other.b - n.b);
        const lane = e.w / 2 + 5, back = (e.axis === "a" ? n.wa : n.wb) / 2 + 14;
        signals.push(put({ kind: "signal", a: n.a + da * back - db * lane, b: n.b + db * back + da * lane, node: n, axis: e.axis, facing: da > 0 ? "R" : db > 0 ? "L" : "back" }));
      });
    });

    /* ---- pedestrian network ---- */
    const PN = peds.nodes, PE = peds.edges;
    const pnode = (a, b, tag) => { const n = { id: PN.length, a, b, adj: [], tag }; PN.push(n); return n; };
    const plink = (p, q, meta = {}) => { if (p === q) return; const Lx = Math.hypot(p.a - q.a, p.b - q.b); const e = { p, q, L: Lx || 0.1, ...meta }; PE.push(e); p.adj.push({ n: q, e }); q.adj.push({ n: p, e }); return e; };
    // walkways: block rings plus open polylines (outer footways, coast paths, piers)
    const ways = [];
    blocks.forEach((k) => {
      const a0 = k.a0 + WALK, a1 = k.a1 - WALK, b0 = k.b0 + WALK, b1 = k.b1 - WALK;
      ways.push({ k, closed: true, pts: [[a0, b0], [a1, b0], [a1, b1], [a0, b1]], rect: { a0, a1, b0, b1 }, radii: k.radii });
    });
    Object.values(ISLES).forEach((I) => {
      const o = 15 + WALK;
      const rr = I.foot.map(([a, b]) => ({ a, b }));
      ways.push({ closed: true, pts: rr.map((p) => [p.a, p.b]), outer: I.id });
    });
    paths.filter((pp) => pp.kind !== "inner").forEach((pp) => ways.push({ closed: false, pts: pp.pts, coast: true }));
    // footpaths where a street used to run through a merged block
    seams.forEach((sm) => ways.push({ closed: false, pts: sm.pts, seam: sm }));
    piers.forEach((p) => { const alongA = p.a1 - p.a0 > p.b1 - p.b0; ways.push({ closed: false, pts: alongA ? [[p.a0, (p.b0 + p.b1) / 2], [p.a1, (p.b0 + p.b1) / 2]] : [[(p.a0 + p.a1) / 2, p.b0 - 20], [(p.a0 + p.a1) / 2, p.b1]], pier: true }); });
    ways.forEach((w) => {
      w.cum = [0];
      for (let i = 1; i < w.pts.length + (w.closed ? 1 : 0); i++) { const p = w.pts[(i - 1) % w.pts.length], q = w.pts[i % w.pts.length]; w.cum.push(w.cum[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1])); }
      w.len = w.cum[w.cum.length - 1];
      w.anchors = w.pts.map((p, i) => ({ a: p[0], b: p[1], t: w.cum[i] }));
    });
    const project = (w, a, b) => {
      let best = null;
      const n = w.pts.length + (w.closed ? 0 : -1);
      for (let i = 0; i < n; i++) {
        const p = w.pts[i], q = w.pts[(i + 1) % w.pts.length];
        const da = q[0] - p[0], db = q[1] - p[1], L2 = da * da + db * db || 1;
        const u = clamp(((a - p[0]) * da + (b - p[1]) * db) / L2, 0, 1);
        const pa = p[0] + da * u, pb = p[1] + db * u, d = Math.hypot(a - pa, b - pb);
        if (!best || d < best.d) best = { d, a: pa, b: pb, t: w.cum[i] + u * Math.sqrt(L2) };
      }
      return best;
    };
    const anchor = (a, b, tag, tol = 1.6) => {
      for (const w of ways) {
        if (w.rect && !(a >= w.rect.a0 - tol && a <= w.rect.a1 + tol && b >= w.rect.b0 - tol && b <= w.rect.b1 + tol)) continue;
        const pr = project(w, a, b);
        if (pr && pr.d < tol) { const x = { a: pr.a, b: pr.b, t: pr.t, tag }; w.anchors.push(x); return x; }
      }
      return null;
    };
    const crossings = [];
    nodes.forEach((n) => {
      if (n.bend) return;
      n.edges.forEach((e) => {
        const other = e.n0 === n ? e.n1 : e.n0;
        const da = Math.sign(other.a - n.a), db = Math.sign(other.b - n.b);
        const perp = e.axis === "a" ? n.wa : n.wb;
        const cw = n.rb ? RB_R + 12 : perp / 2 + 8;
        const ca = n.a + da * cw, cb = n.b + db * cw, off = e.w / 2 + WALK;
        const p = anchor(ca + db * off, cb - da * off, "x"), q = anchor(ca - db * off, cb + da * off, "x");
        if (!p || !q) return;
        const c = { e, s: e.n0 === n ? cw : e.len - cw, node: n, p, q, peds: 0, a: ca, b: cb, id: crossings.length };
        p.cross = c.id; q.cross = c.id;
        e.crossings.push(c); crossings.push(c);
      });
    });
    // inner footpaths join the block's own ring at both ends

    // bridge footways join the two outer footways
    const bw = bridgeE ? [bridgeE.n0.b - 20 - WALK, bridgeE.n0.b + 20 + WALK].map((b) => [anchor(bridgeE.n0.a + 15 + WALK, b, "br", 3), anchor(bridgeE.n1.a - 15 - WALK, b, "br", 3)]) : [];
    // doors
    objs.filter((o) => o.kind === "building" && o.door).forEach((o) => {
      const w0 = ways.find((w2) => w2.k && o.a > w2.k.a0 && o.a < w2.k.a1 && o.b > w2.k.b0 && o.b < w2.k.b1);
      if (!w0) return;
      const cands = [w0, ...ways.filter((w2) => w2.innerOf === w0.k.id)].map((w2) => ({ w: w2, pr: project(w2, o.door.a, o.door.b) })).sort((x, y) => x.pr.d - y.pr.d);
      const w = cands[0].w, pr = cands[0].pr;
      const x = { a: pr.a, b: pr.b, t: pr.t, tag: "door", door: o };
      w.anchors.push(x); o.doorRing = x;
    });
    // build the nodes of every walkway, skipping stretches that a crossing replaces
    ways.forEach((w) => {
      w.anchors.sort((x, y) => x.t - y.t);
      const uniq = [];
      w.anchors.forEach((p) => { const prev = uniq[uniq.length - 1]; if (prev && Math.abs(prev.t - p.t) < 0.6) { p.node = prev.node; if (p.cross != null) prev.cross = prev.cross ?? p.cross; if (p.door) prev.node.door = p.door; return; } p.node = pnode(p.a, p.b, p.tag); if (p.door) p.node.door = p.door; uniq.push(p); });
      // round the ring corners of blocks at bends: pull the corner node in along the diagonal
      if (w.radii) uniq.forEach((p) => {
        const ci = w.pts.findIndex((q) => Math.abs(q[0] - p.a) < 0.5 && Math.abs(q[1] - p.b) < 0.5);
        if (ci < 0 || w.radii[ci] < 30) return;
        const sa = ci === 0 || ci === 3 ? 1 : -1, sb = ci < 2 ? 1 : -1, pull = (w.radii[ci] - WALK) * 0.29;
        p.node.a += sa * pull; p.node.b += sb * pull;
      });
      const n = uniq.length;
      for (let i = 0; i < (w.closed ? n : n - 1); i++) {
        const x = uniq[i], y = uniq[(i + 1) % n];
        if (x.cross != null && x.cross === y.cross) continue;
        plink(x.node, y.node, { way: true });
      }
      w.nodes = uniq.map((p) => p.node);
    });
    crossings.forEach((c) => { c.pe = plink(c.p.node, c.q.node, { crossing: c }); });
    // footpath seams join the walkways of the two pieces they run between
    ways.filter((w) => w.seam).forEach((w) => {
      const rings = ways.filter((w2) => w2.k === w.seam.p || w2.k === w.seam.q);
      [w.nodes[0], w.nodes[w.nodes.length - 1]].forEach((nd) => rings.forEach((rw) => {
        let best = null, bd = 60;
        rw.nodes.forEach((q) => { const d = Math.hypot(q.a - nd.a, q.b - nd.b); if (d < bd) { bd = d; best = q; } });
        if (best) plink(nd, best, { link: true });
      }));
    });
    bw.forEach(([p, q]) => p && q && plink(p.node, q.node, { bridgeWalk: true }));
    objs.filter((o) => o.doorRing).forEach((o) => { const dn = pnode(o.door.a, o.door.b, "step"); dn.door = o; plink(o.doorRing.node, dn); o.doorNode = dn; });
    // join coast paths and piers to the nearest footway
    const footNodes = ways.filter((w) => w.outer).flatMap((w) => w.nodes);
    ways.filter((w) => w.coast || w.pier).forEach((w) => {
      const ends = w.pier ? [w.nodes[0]] : w.nodes.filter((_, i) => i % 14 === 7 || i === 0 || i === w.nodes.length - 1);
      ends.forEach((nd) => {
        const pool = w.pier ? PN.filter((q) => q.tag !== "step" && !w.nodes.includes(q)) : footNodes;
        let best = null, bd = w.pier ? 90 : 150;
        pool.forEach((q) => { const d = Math.hypot(q.a - nd.a, q.b - nd.b); if (d < bd) { bd = d; best = q; } });
        if (best) { plink(nd, best, { link: true }); if (!w.pier) paths.push({ pts: [[nd.a, nd.b], [best.a, best.b]], kind: "link" }); }
      });
    });

    Object.values(plots).forEach((o) => { o.sx = o.a - o.b; o.sy = (o.a + o.b) / 2; });
    const all = coasts.flatMap((c) => c.poly).concat(piers.flatMap((p) => [[p.a0, p.b0], [p.a1, p.b1]]));
    const bbox = all.reduce((m, [a, b]) => ({ x0: Math.min(m.x0, a - b), x1: Math.max(m.x1, a - b), y0: Math.min(m.y0, (a + b) / 2), y1: Math.max(m.y1, (a + b) / 2) }), { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 });
    const abox = all.reduce((m, [a, b]) => ({ a0: Math.min(m.a0, a), a1: Math.max(m.a1, a), b0: Math.min(m.b0, b), b1: Math.max(m.b1, b) }), { a0: 1e9, a1: -1e9, b0: 1e9, b1: -1e9 });
    return { isles: ISLES, plan, coasts, piers, paths, landAt, roads, blocks, objs, plots, nodes: [...nodes.values()], edges, signals, peds, crossings, docks, marinaWater, bridgeE, bbox, abox };
  }
