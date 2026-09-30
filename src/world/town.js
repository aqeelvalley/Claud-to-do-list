  /* ===================== town layout: two islands, uneven street grid, natural coasts ===================== */
  const RC = 80; // radius of the bends at the ring-road corners
  const VERGE = 18; // footway outside the ring road
  const CURB = 14; // kerb radius at junction corners
  const WALK = 9; // how far in from the kerb people walk
  const ISLES = {
    life: { id: "life", name: "Life Island", color: "#6DAE5B",
      A: [100, 420, 720, 1010, 1380], B: [100, 400, 720, 1000, 1330, 1640], mainA: [720], mainB: [720],
      coast: {
        N: { m: 130, amp: 60, sand: 14 },
        E: { m: 115, amp: 40, sand: 16 },
        S: { m: 150, amp: 55, sand: 22, walls: [[610, 1300, 60]], beaches: [[60, 560, 58]] },
        W: { m: 140, amp: 65, sand: 16, beaches: [[860, 1440, 60]] },
      } },
    work: { id: "work", name: "Work Island", color: "#3E7CB1",
      A: [1900, 2230, 2520], B: [300, 720, 1170], mainA: [], mainB: [720], quay: true,
      coast: {
        N: { m: 70, amp: 0, sand: 0, walls: [[-1e9, 1e9, 70]] },
        E: { m: 70, amp: 0, sand: 0, walls: [[-1e9, 1e9, 70]] },
        S: { m: 72, amp: 0, sand: 0, walls: [[-1e9, 1e9, 72]] },
        W: { m: 105, amp: 35, sand: 10, walls: [[980, 1e9, 80]] },
      } },
  };
  const ROUNDABOUT = [720, 720];
  const RB_R = 44;
  const roadW = (isle, axis, v) => ((axis === "A" ? isle.mainA : isle.mainB).includes(v) ? 40 : 30);

  const LIFE_PLAN = [
    ["apartments", "park", "houses", "gym", "beachHouses"],
    ["freelance", "home", "maker", "parking", "cs:learning"],
    ["studio", "square", "cafe", "garden", "marina"],
    ["houses2", "shops", "mill", "cs:townhall", "cs:cinema"],
  ];
  const WORK_PLAN = [["epcmHQ", "hub"], ["refinery", "portyard"]];
  const UNLOCKS = {
    townhall: { name: "Town Hall", level: 3, kind: "townhall" },
    learning: { name: "Learning Centre", level: 5, kind: "library" },
    cinema: { name: "Cinema", level: 7, kind: "cinema" },
    fabyard: { name: "Fabrication Yard", level: 4, kind: "fabyard" },
  };
  const SECTION_LOTS = [["houses2", 1], ["beachHouses", 2], ["houses", 1], ["apartments", 3], ["shops", 2], ["beachHouses", 0], ["houses2", 2], ["houses", 0]];

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

  /* coastline: offset the urban edge outward by a margin that wanders along
     natural shores and stays constant along seawalls */
  function buildCoast(I, box, seed) {
    const r = rng(seed);
    const ph = [r() * 9, r() * 9, r() * 9, r() * 9];
    const bumps = [0, 1, 2].map(() => ({ s: r(), w: 60 + r() * 90, h: (r() < 0.5 ? -1 : 1) * (40 + r() * 50), side: "NESW"[(r() * 4) | 0] }));
    const spec = I.coast;
    const sideLen = { N: box.a1 - box.a0, S: box.a1 - box.a0, E: box.b1 - box.b0, W: box.b1 - box.b0 };
    const inRange = (ranges, s, blend = 60) => {
      let w = 0;
      (ranges || []).forEach(([x0, x1]) => { const d = s < x0 ? x0 - s : s > x1 ? s - x1 : 0; w = Math.max(w, clamp(1 - d / blend, 0, 1)); });
      return w;
    };
    const marginAt = (side, s) => {
      const c = spec[side];
      const n = 0.55 * Math.sin(s / 97 + ph[0]) + 0.3 * Math.sin(s / 43 + ph[1]) + 0.15 * Math.sin(s / 19 + ph[2]);
      let m = c.m + c.amp * n;
      bumps.forEach((bp) => { if (bp.side !== side) return; const lo = side === "N" || side === "S" ? box.a0 : box.b0; const cs = lo + bp.s * sideLen[side]; m += bp.h * Math.exp(-(((s - cs) / bp.w) ** 2)) * (c.amp ? 1 : 0); });
      const wall = inRange((c.walls || []).map((w) => [w[0], w[1]]), s);
      const wm = c.walls && c.walls.length ? c.walls.find((w) => s >= w[0] - 60 && s <= w[1] + 60) : null;
      if (wm) m = lerp(m, wm[2], wall);
      const beach = inRange(c.beaches, s, 80);
      let sand = lerp(c.sand, (c.beaches && c.beaches[0] ? c.beaches[0][2] : c.sand), beach);
      sand = lerp(sand, 0, wall);
      return { m: Math.max(40, m), wall: wall > 0.5, sand };
    };
    const base = rrect(box.a0, box.a1, box.b0, box.b1, RC + 33, 12);
    const pts = base.map((p) => {
      let mg;
      if (p.arc) {
        const [s0, s1, t] = p.arc;
        const e0 = s0 === "N" ? box.a1 : s0 === "E" ? box.b1 : s0 === "S" ? box.a0 : box.b0;
        const e1 = s1 === "E" ? box.b0 : s1 === "S" ? box.a1 : s1 === "W" ? box.b1 : box.a0;
        const m0 = marginAt(s0, e0), m1 = marginAt(s1, e1);
        mg = { m: lerp(m0.m, m1.m, t), wall: t < 0.5 ? m0.wall : m1.wall, sand: lerp(m0.sand, m1.sand, t) };
      } else mg = marginAt(p.side, p.s);
      return { a: p.a + p.na * mg.m, b: p.b + p.nb * mg.m, na: p.na, nb: p.nb, wall: mg.wall, sand: mg.sand };
    });
    // smooth the natural parts a little
    for (let pass = 0; pass < 2; pass++) pts.forEach((p, i) => { if (p.wall) return; const q0 = pts[(i - 1 + pts.length) % pts.length], q1 = pts[(i + 1) % pts.length]; p.a = (q0.a + 2 * p.a + q1.a) / 4; p.b = (q0.b + 2 * p.b + q1.b) / 4; });
    return pts;
  }

  function buildTown({ sections = [], islandLevel = 1 }) {
    const roads = [], blocks = [], objs = [], plots = {}, lamps = [], docks = { marina: [], port: [] };
    const coasts = [], piers = [], paths = [];
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

    /* ---- islands ---- */
    Object.values(ISLES).forEach((I) => {
      const { A, B } = I;
      A.forEach((a) => B.forEach((b) => nodeAt(a, b)));
      A.forEach((a) => { for (let j = 0; j < B.length - 1; j++) addEdge(nodeAt(a, B[j]), nodeAt(a, B[j + 1]), roadW(I, "A", a), I.mainA.includes(a)); });
      B.forEach((b) => { for (let i = 0; i < A.length - 1; i++) addEdge(nodeAt(A[i], b), nodeAt(A[i + 1], b), roadW(I, "B", b), I.mainB.includes(b)); });
      const ow = 15;
      I.ring = { a0: A[0], a1: A[A.length - 1], b0: B[0], b1: B[B.length - 1] };
      I.box = { a0: A[0] - ow - VERGE, a1: A[A.length - 1] + ow + VERGE, b0: B[0] - ow - VERGE, b1: B[B.length - 1] + ow + VERGE };
      const coast = buildCoast(I, I.box, hash("coast-" + I.id));
      I.coast2 = coast;
      coasts.push({ isle: I.id, pts: coast, poly: coast.map((p) => [p.a, p.b]) });
      const plan = I.id === "life" ? LIFE_PLAN : WORK_PLAN;
      for (let i = 0; i < A.length - 1; i++)
        for (let j = 0; j < B.length - 1; j++) {
          const a0 = A[i] + roadW(I, "A", A[i]) / 2, a1 = A[i + 1] - roadW(I, "A", A[i + 1]) / 2;
          const b0 = B[j] + roadW(I, "B", B[j]) / 2, b1 = B[j + 1] - roadW(I, "B", B[j + 1]) / 2;
          const corners = [[A[i], B[j]], [A[i + 1], B[j]], [A[i + 1], B[j + 1]], [A[i], B[j + 1]]];
          blocks.push({ id: I.id + ":" + i + ":" + j, isle: I.id, a0, a1, b0, b1, type: plan[i][j], kind: "block", cornerNodes: corners });
        }
    });
    const bridgeE = addEdge(nodeAt(1380, 720), nodeAt(1900, 720), 40, true);
    nodeAt(...ROUNDABOUT).rb = true;
    [[720, 400], [720, 1000], [720, 1330], [420, 720], [1010, 720], [1380, 720], [1900, 720], [2230, 720]].forEach(([a, b]) => { nodeAt(a, b).signal = true; });
    nodes.forEach((n) => {
      n.w = Math.max(...n.edges.map((e) => e.w));
      n.wa = Math.max(0, ...n.edges.filter((e) => e.axis === "b").map((e) => e.w));
      n.wb = Math.max(0, ...n.edges.filter((e) => e.axis === "a").map((e) => e.w));
      n.bend = n.edges.length === 2 && n.edges[0].axis !== n.edges[1].axis;
      if (n.bend) {
        const d = n.edges.map((e) => { const o = e.n0 === n ? e.n1 : e.n0; return [Math.sign(o.a - n.a), Math.sign(o.b - n.b)]; });
        n.bendC = [n.a + (d[0][0] + d[1][0]) * RC, n.b + (d[0][1] + d[1][1]) * RC];
      }
    });
    // block corner radii: small kerb radius, or matching the bend
    blocks.forEach((k) => {
      k.radii = k.cornerNodes.map(([a, b]) => { const n = nodeAt(a, b); return n.bend ? RC - 15 : n.rb ? 30 : CURB; });
    });

    /* ---- land tests ---- */
    const landAt = (a, b) => coasts.some((c) => inPoly(c.poly, a, b)) || piers.some((p) => inRect(p, a, b));
    // bridge deck spans the water between the two coasts
    { let a0 = 1380, a1 = 1900; while (a0 < 1900 && inPoly(coasts[0].poly, a0, 720)) a0 += 2; while (a1 > 1380 && inPoly(coasts[1].poly, a1, 720)) a1 -= 2; bridgeE.bridge = { a0: a0 - 6, a1: a1 + 6 }; }

    /* ---- marina, breakwaters and lighthouse on the Life Island's south shore ---- */
    const L = ISLES.life, sWall = L.box.b1 + 60;
    const pier = (a0, a1, b0, b1, type = "pier") => { const p = { a0, a1, b0, b1, type }; piers.push(p); return p; };
    pier(700, 732, sWall - 6, sWall + 222);
    pier(732, 1010, sWall + 190, sWall + 222);
    pier(1180, 1212, sWall - 6, sWall + 238);
    pier(1150, 1244, sWall + 228, sWall + 308, "lighthousePad");
    const marinaWater = { a0: 732, a1: 1180, b0: sWall, b1: sWall + 190 };
    [820, 910, 1000, 1090].forEach((a, k) => {
      objs.push({ id: "pontoon" + k, kind: "ground-pontoon", a0: a - 4, a1: a + 4, b0: sWall, b1: sWall + 128 });
      [30, 70, 110].forEach((db, m) => docks.marina.push({ a: a + (m % 2 ? 16 : -16), b: sWall + db, yaw: m % 2 ? 0 : Math.PI }));
    });
    const W = ISLES.work, quayB = W.box.b1 + 72;
    [1990, 2150, 2310, 2470].forEach((a, k) => docks.port.push({ a, b: quayB + 38, yaw: 0, big: k > 0 }));

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
    const face = (lot, k) => {
      const I = inner(k);
      if (Math.abs(lot.b1 - I.b1) < 1) return "+b"; if (Math.abs(lot.a1 - I.a1) < 1) return "+a";
      if (Math.abs(lot.b0 - I.b0) < 1) return "-b"; if (Math.abs(lot.a0 - I.a0) < 1) return "-a"; return "+b";
    };
    const put = (o) => { objs.push(o); return o; };
    const building = (k, lot, spec) => {
      const a = (lot.a0 + lot.a1) / 2, b = (lot.b0 + lot.b1) / 2;
      const w = lot.a1 - lot.a0 - (spec.pad ?? 10), d = lot.b1 - lot.b0 - (spec.pad ?? 10);
      const f = spec.face || face(lot, k);
      const o = put({ id: spec.id || k.id + ":" + objs.length, kind: "building", a, b, w, d, face: f, block: k.id, lot, ...spec });
      const off = { "+a": [w / 2 + 6, 0], "-a": [-w / 2 - 6, 0], "+b": [0, d / 2 + 6], "-b": [0, -d / 2 - 6] }[f];
      if (!spec.noDoor) o.door = { a: a + off[0], b: b + off[1] };
      return o;
    };
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

    blocks.forEach((k) => {
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
        plots.freelance = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: mb + 10 }, { drawer: "drafting", id: "freelance", landmark: "freelance", H: 110, pad: 22, face: "+b" });
        filler(k, Q[2], "shop", 2); put({ kind: "ground-garden", ...Q[3] }); scatter(Q[3], 4, null, ["tree"], 11);
      } else if (t === "studio") {
        plots.youtube = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: mb + 10 }, { drawer: "film", id: "youtube", landmark: "youtube", H: 110, pad: 20, face: "+b" });
        filler(k, Q[2], "house", 2); filler(k, Q[3], "house", 3);
      } else if (t === "maker") {
        plots.bynode = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: mb + 20 }, { drawer: "maker", id: "bynode", landmark: "bynode", H: 100, pad: 22, face: "+b" });
        filler(k, Q[2], "shop", 2); put({ kind: "ground-garden", ...Q[3] }); scatter(Q[3], 3, null, ["tree", "pine"], 13);
      } else if (t === "cafe") {
        plots.coffee = building(k, Q[3], { drawer: "cafe", id: "coffee", landmark: "coffee", H: 80, pad: 22, face: "+b" });
        [[Q[3].a0 + 14, Q[3].b1 + 2], [Q[3].a0 + 44, Q[3].b1 + 2]].forEach(([a, b]) => put({ kind: "prop", p: "umbrella", a, b, c: "#D9734E" }));
        filler(k, Q[0], "shop", 0); filler(k, Q[1], "apartment", 1); put({ kind: "ground-garden", ...Q[2] }); scatter(Q[2], 3, null, ["tree"], 17);
      } else if (t === "mill") {
        plots.wood = building(k, { a0: I.a0, a1: I.a1, b0: mb - 20, b1: I.b1 }, { drawer: "mill", id: "wood", landmark: "wood", H: 100, pad: 16, face: "+b" });
        filler(k, Q[0], "house", 0); put({ kind: "ground-garden", ...Q[1] }); scatter(Q[1], 4, null, ["pine", "tree"], 19);
      } else if (t === "gym") {
        plots.fitness = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b0 + 90 }, { drawer: "gym", id: "fitness", landmark: "fitness", H: 80, pad: 14, face: "+b" });
        put({ kind: "ground-track", a0: I.a0, a1: I.a1, b0: I.b0 + 100, b1: I.b1 });
        k.track = { a0: I.a0, a1: I.a1, b0: I.b0 + 100, b1: I.b1 };
      } else if (t === "marina") {
        plots.marina = building(k, Q[2], { drawer: "marinaOffice", id: "marina", landmark: "marina", H: 70, pad: 16, face: "+b" });
        filler(k, Q[0], "shop", 0); filler(k, Q[1], "shop", 1);
        put({ kind: "ground-square", ...Q[3] });
        put({ kind: "prop", p: "umbrella", a: Q[3].a0 + 30, b: Q[3].b0 + 40, c: "#2A9D8F" });
        put({ kind: "prop", p: "umbrella", a: Q[3].a1 - 30, b: Q[3].b1 - 30, c: "#E9B949" });
      } else if (t.startsWith("cs:")) {
        construction(k, whole, t.slice(3));
      } else if (t === "epcmHQ") {
        plots.epcm = building(k, { a0: I.a0, a1: I.a1 - 70, b0: I.b0, b1: I.b1 - 120 }, { drawer: "epcmHQ", id: "epcm", landmark: "epcm", H: 170, pad: 12, face: "+b" });
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
    });
    // Tender Port on the quay and the lighthouse on the breakwater tip
    plots.port = put({ id: "port", kind: "building", drawer: "portCranes", landmark: "port", a: 2250, b: quayB - 34, w: 300, d: 40, H: 130, face: "+b", noDoor: true });
    plots.goals = put({ id: "goals", kind: "building", drawer: "lighthouse", landmark: "goals", a: 1196, b: sWall + 272, w: 60, d: 60, H: 200, face: "-b", noDoor: true });

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
      const inBox = (a, b, m = 0) => a > box.a0 - m && a < box.a1 + m && b > box.b0 - m && b < box.b1 + m;
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
        if (Math.abs(b - 720) < 40 && a > box.a1 - 10 && c.isle === "life") continue;
        if (Math.abs(b - 720) < 40 && a < box.a0 + 10 && c.isle === "work") continue;
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
    piers.forEach((p) => { if (p.type === "pier") { const alongA = p.a1 - p.a0 > p.b1 - p.b0; for (let t = 0.2; t < 1; t += 0.3) lamps.push({ a: alongA ? lerp(p.a0, p.a1, t) : (p.a0 + p.a1) / 2, b: alongA ? (p.b0 + p.b1) / 2 : lerp(p.b0, p.b1, t), pier: true }); } });
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
      const rr = rrect(I.ring.a0 - o, I.ring.a1 + o, I.ring.b0 - o, I.ring.b1 + o, RC + o, 16);
      ways.push({ closed: true, pts: rr.map((p) => [p.a, p.b]), outer: I.id });
    });
    paths.forEach((pp) => ways.push({ closed: false, pts: pp.pts, coast: true }));
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
    // bridge footways join the two outer footways
    const bw = [720 - 20 - WALK, 720 + 20 + WALK].map((b) => [anchor(ISLES.life.ring.a1 + 15 + WALK, b, "br", 2.5), anchor(ISLES.work.ring.a0 - 15 - WALK, b, "br", 2.5)]);
    // doors
    objs.filter((o) => o.kind === "building" && o.door).forEach((o) => {
      const w = ways.find((w2) => w2.k && o.a > w2.k.a0 && o.a < w2.k.a1 && o.b > w2.k.b0 && o.b < w2.k.b1);
      if (!w) return;
      const pr = project(w, o.door.a, o.door.b);
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
    return { isles: ISLES, coasts, piers, paths, landAt, roads, blocks, objs, plots, nodes: [...nodes.values()], edges, signals, peds, crossings, docks, marinaWater, bridgeE, bbox, abox };
  }
