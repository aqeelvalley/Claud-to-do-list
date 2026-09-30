  /* ===================== town layout: two islands on a street grid ===================== */
  const ISLES = {
    life: { id: "life", name: "Life Island", color: "#6DAE5B", a0: 0, a1: 1260, b0: 0, b1: 1540,
      A: [70, 350, 630, 910, 1190], B: [70, 350, 630, 910, 1190, 1470], mainA: [630], mainB: [630], exitsR: [630] },
    work: { id: "work", name: "Work Island", color: "#3E7CB1", a0: 1560, a1: 2300, b0: 150, b1: 1150,
      A: [1630, 1930, 2230], B: [220, 630, 1080], mainA: [], mainB: [630], exitsL: [630], quay: true },
  };
  const ROUNDABOUT = [630, 630];
  const RB_R = 44; // roundabout outer radius
  const roadW = (isle, axis, v) => ((axis === "A" ? isle.mainA : isle.mainB).includes(v) ? 40 : 30);

  /* life island block plan: [col][row] (col along a, row along b) */
  const LIFE_PLAN = [
    ["apartments", "park", "houses", "gym", "beachHouses"],
    ["freelance", "home", "maker", "parking", "cs:learning"],
    ["studio", "square", "cafe", "apartments2", "marina"],
    ["houses2", "shops", "mill", "cs:townhall", "cs:cinema"],
  ];
  const WORK_PLAN = [
    ["epcmHQ", "hub"],
    ["refinery", "portyard"],
  ];
  const UNLOCKS = {
    townhall: { name: "Town Hall", level: 3, kind: "townhall" },
    learning: { name: "Learning Centre", level: 5, kind: "library" },
    cinema: { name: "Cinema", level: 7, kind: "cinema" },
    fabyard: { name: "Fabrication Yard", level: 4, kind: "fabyard" },
  };
  /* lots reserved for user-created sections, in order */
  const SECTION_LOTS = [["houses2", 1], ["beachHouses", 3], ["houses", 2], ["apartments", 3], ["shops", 3], ["beachHouses", 0], ["houses2", 3], ["houses", 0]];

  function buildTown({ sections = [], islandLevel = 1 }) {
    const R = rng(hash("valley-town"));
    const land = [], beaches = [], roads = [], blocks = [], objs = [], plots = {}, lamps = [], docks = { marina: [], port: [] };
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

    /* ---- islands: land, roads, blocks ---- */
    Object.values(ISLES).forEach((I) => {
      land.push({ a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b1, isle: I.id });
      const { A, B } = I;
      A.forEach((a) => B.forEach((b) => nodeAt(a, b)));
      A.forEach((a) => { for (let j = 0; j < B.length - 1; j++) addEdge(nodeAt(a, B[j]), nodeAt(a, B[j + 1]), roadW(I, "A", a), I.mainA.includes(a)); });
      B.forEach((b) => { for (let i = 0; i < A.length - 1; i++) addEdge(nodeAt(A[i], b), nodeAt(A[i + 1], b), roadW(I, "B", b), I.mainB.includes(b)); });
      const plan = I.id === "life" ? LIFE_PLAN : WORK_PLAN;
      for (let i = 0; i < A.length - 1; i++)
        for (let j = 0; j < B.length - 1; j++) {
          const a0 = A[i] + roadW(I, "A", A[i]) / 2, a1 = A[i + 1] - roadW(I, "A", A[i + 1]) / 2;
          const b0 = B[j] + roadW(I, "B", B[j]) / 2, b1 = B[j + 1] - roadW(I, "B", B[j + 1]) / 2;
          blocks.push({ id: I.id + ":" + i + ":" + j, isle: I.id, a0, a1, b0, b1, type: plan[i][j], kind: "block" });
        }
      // promenade strips between the ring roads and the sea
      const wA0 = roadW(I, "A", A[0]) / 2, wAl = roadW(I, "A", A[A.length - 1]) / 2, wB0 = roadW(I, "B", B[0]) / 2, wBl = roadW(I, "B", B[B.length - 1]) / 2;
      const split = (lo, hi, exits, w) => {
        const out = []; let s = lo;
        (exits || []).forEach((x) => { out.push([s, x - w]); s = x + w; });
        out.push([s, hi]); return out;
      };
      split(I.b0, I.b1, I.exitsL, 20).forEach(([s, e]) => blocks.push({ id: I.id + ":L" + s, isle: I.id, a0: I.a0, a1: A[0] - wA0, b0: s, b1: e, type: "prom", kind: "strip", side: "L" }));
      split(I.b0, I.b1, I.exitsR, 20).forEach(([s, e]) => blocks.push({ id: I.id + ":R" + s, isle: I.id, a0: A[A.length - 1] + wAl, a1: I.a1, b0: s, b1: e, type: "prom", kind: "strip", side: "R" }));
      blocks.push({ id: I.id + ":T", isle: I.id, a0: A[0] - wA0, a1: A[A.length - 1] + wAl, b0: I.b0, b1: B[0] - wB0, type: "prom", kind: "strip", side: "T" });
      blocks.push({ id: I.id + ":B", isle: I.id, a0: A[0] - wA0, a1: A[A.length - 1] + wAl, b0: B[B.length - 1] + wBl, b1: I.b1, type: I.quay ? "quay" : "prom", kind: "strip", side: "B" });
    });
    // bridge between the islands
    const bridgeE = addEdge(nodeAt(1190, 630), nodeAt(1630, 630), 40, true);
    bridgeE.bridge = { a0: 1260, a1: 1560 };
    // roundabout and signals
    nodeAt(...ROUNDABOUT).rb = true;
    [[630, 350], [630, 910], [630, 1190], [350, 630], [910, 630], [1190, 630], [1630, 630], [1930, 630]].forEach(([a, b]) => { nodeAt(a, b).signal = true; });
    nodes.forEach((n) => { n.w = Math.max(...n.edges.map((e) => e.w)); n.wa = Math.max(0, ...n.edges.filter((e) => e.axis === "b").map((e) => e.w)); n.wb = Math.max(0, ...n.edges.filter((e) => e.axis === "a").map((e) => e.w)); });

    /* ---- marina, breakwaters, lighthouse, beaches ---- */
    const pier = (a0, a1, b0, b1, type = "pier") => { land.push({ a0, a1, b0, b1, isle: "life", pier: true }); blocks.push({ id: "pier" + a0 + "_" + b0, isle: "life", a0, a1, b0, b1, type, kind: "strip" }); };
    pier(700, 732, 1540, 1772);
    pier(732, 1000, 1740, 1772);
    pier(1150, 1182, 1540, 1780);
    pier(1122, 1214, 1780, 1860, "lighthousePad");
    const marinaWater = { a0: 732, a1: 1150, b0: 1540, b1: 1740 };
    [790, 880, 970, 1060].forEach((a, k) => {
      objs.push({ id: "pontoon" + k, kind: "ground-pontoon", a0: a - 4, a1: a + 4, b0: 1540, b1: 1690 });
      [1575, 1615, 1655].forEach((b, m) => { docks.marina.push({ a: a + (m % 2 ? 16 : -16), b, yaw: m % 2 ? 0 : Math.PI }); });
    });
    beaches.push({ a0: 60, a1: 600, b0: 1500, b1: 1620, isle: "life" });
    beaches.push({ a0: -70, a1: 40, b0: 880, b1: 1320, isle: "life" });
    // work island port: ships dock along the quay
    [1700, 1860, 2020, 2180].forEach((a, k) => docks.port.push({ a, b: 1196, yaw: 0, big: k > 0 }));

    /* ---- helpers for lots and objects ---- */
    const blockBy = (type) => blocks.find((k) => k.type === type);
    const inner = (k, m = 16) => ({ a0: k.a0 + m, a1: k.a1 - m, b0: k.b0 + m, b1: k.b1 - m });
    const quads = (k) => {
      const I = inner(k), ma = (I.a0 + I.a1) / 2, mb = (I.b0 + I.b1) / 2;
      return [{ a0: I.a0, a1: ma - 5, b0: I.b0, b1: mb - 5 }, { a0: ma + 5, a1: I.a1, b0: I.b0, b1: mb - 5 }, { a0: I.a0, a1: ma - 5, b0: mb + 5, b1: I.b1 }, { a0: ma + 5, a1: I.a1, b0: mb + 5, b1: I.b1 }];
    };
    // facing: the side of a lot that touches the block edge, preferring visible sides
    const face = (lot, k) => {
      const nearA1 = Math.abs(lot.a1 - (k.a1 - 16)) < 1, nearB1 = Math.abs(lot.b1 - (k.b1 - 16)) < 1;
      const nearA0 = Math.abs(lot.a0 - (k.a0 + 16)) < 1, nearB0 = Math.abs(lot.b0 - (k.b0 + 16)) < 1;
      if (nearB1) return "+b"; if (nearA1) return "+a"; if (nearB0) return "-b"; if (nearA0) return "-a"; return "+b";
    };
    const put = (o) => { objs.push(o); return o; };
    const building = (k, lot, spec) => {
      const a = (lot.a0 + lot.a1) / 2, b = (lot.b0 + lot.b1) / 2;
      const w = lot.a1 - lot.a0 - (spec.pad ?? 10), d = lot.b1 - lot.b0 - (spec.pad ?? 10);
      const f = spec.face || face(lot, k);
      const o = put({ id: spec.id || k.id + ":" + objs.length, kind: "building", a, b, w, d, face: f, block: k.id, ...spec });
      // door point just outside the front face
      const off = { "+a": [w / 2 + 6, 0], "-a": [-w / 2 - 6, 0], "+b": [0, d / 2 + 6], "-b": [0, -d / 2 - 6] }[f];
      o.door = { a: a + off[0], b: b + off[1] };
      return o;
    };
    let secIdx = 0;
    const sectionBy = {};
    sections.forEach((s) => (sectionBy[s.slot] = s));
    const reservedLot = (type, q) => SECTION_LOTS.findIndex(([t, qq]) => t === type && qq === q);
    const HOUSE_COLS = ["#F6EDDF", "#F3D9C4", "#E6EEF3", "#F4E3C3", "#E3F1EE", "#F7E1E6", "#EDE7F0"];
    const ROOF_COLS = ["#D9734E", "#B85C3C", "#5F7F8C", "#6B8E5A", "#8A5A44", "#C8654A"];
    const filler = (k, lot, kind, qi) => {
      const slot = reservedLot(k.type, qi);
      if (slot >= 0) {
        const s = sectionBy[slot];
        if (s) {
          const o = building(k, lot, { id: s.id, drawer: "section", sKind: s.kind, color: s.color, name: s.name, landmark: s.id, H: 70 });
          plots[s.id] = o; return;
        }
        if (slot === firstFreeSlot()) { building(k, lot, { drawer: "forsale", H: 30, plot: { free: true, slot } }); return; }
      }
      const seed = hash(k.id + qi);
      const r = rng(seed);
      const spec = { drawer: kind, seed, wall: HOUSE_COLS[(r() * HOUSE_COLS.length) | 0], roof: ROOF_COLS[(r() * ROOF_COLS.length) | 0], floors: 1 + ((r() * 2) | 0) };
      if (kind === "apartment") { spec.floors = 4 + ((r() * 3) | 0); spec.H = spec.floors * 20 + 30; }
      else if (kind === "shop") { spec.floors = 1 + ((r() * 2) | 0); spec.awn = ["#D9734E", "#2A9D8F", "#3E7CB1", "#C2577A", "#6DAE5B"][(r() * 5) | 0]; spec.label = ["Bakery", "Books", "Deli", "Florist", "Pharmacy", "Bikes", "Salon", "Grocer"][(r() * 8) | 0]; spec.H = spec.floors * 20 + 30; }
      else spec.H = spec.floors * 20 + 34;
      building(k, lot, spec);
    };
    const firstFreeSlot = () => { for (let s = 0; s < SECTION_LOTS.length; s++) if (!sectionBy[s]) return s; return -1; };
    const trees = (k, pts, kinds) => pts.forEach(([a, b], n) => put({ kind: "tree", a, b, v: (n + a) % 4, t: kinds ? kinds[n % kinds.length] : "tree", s: 0.9 + ((a * 7 + b) % 5) / 20 }));
    const construction = (k, lot, key) => {
      const u = UNLOCKS[key];
      if (islandLevel >= u.level) {
        const o = building(k, lot, { drawer: u.kind, name: u.name, H: 90, pad: 18 });
        return o;
      }
      return building(k, lot, { drawer: "construction", name: u.name, level: u.level, H: 110, pad: 16, plot: { cs: key, level: u.level, name: u.name } });
    };

    /* ---- fill every block ---- */
    blocks.forEach((k) => {
      const Q = quads(k), I = inner(k);
      const whole = { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b1 };
      const t = k.type;
      if (k.kind === "strip") {
        // promenade / quay furniture: lamps, benches, palms along the sea
        const alongA = k.a1 - k.a0 > k.b1 - k.b0;
        const len = alongA ? k.a1 - k.a0 : k.b1 - k.b0;
        const n = Math.floor(len / 90);
        for (let s = 0; s < n; s++) {
          const u = (s + 0.5) / n;
          const a = alongA ? lerp(k.a0, k.a1, u) : (k.a0 + k.a1) / 2, b = alongA ? (k.b0 + k.b1) / 2 : lerp(k.b0, k.b1, u);
          if (t === "pier" || t === "lighthousePad") { if (s % 2 === 0) lamps.push({ a, b, pier: true }); continue; }
          if (t === "quay") { if (s % 2 === 0) lamps.push({ a, b: b - 12 }); continue; }
          if (s % 2 === 0) lamps.push({ a: alongA ? a : k.side === "L" ? k.a0 + 12 : k.a1 - 12, b: alongA ? (k.side === "T" ? k.b0 + 12 : k.b1 - 12) : b });
          else if (k.a1 - k.a0 > 34 && k.b1 - k.b0 > 34) put({ kind: "prop", p: "bench", a, b, axis: alongA ? "a" : "b" });
          if (s % 3 === 1 && Math.min(k.a1 - k.a0, k.b1 - k.b0) > 40) put({ kind: "tree", a: a + (alongA ? 20 : 0), b: b + (alongA ? 0 : 20), t: "palm", s: 0.9, v: s });
        }
        return;
      }
      if (t === "apartments" || t === "apartments2") {
        Q.forEach((lot, q) => filler(k, lot, q === 3 && t === "apartments2" ? "shop" : "apartment", q));
        trees(k, [[k.a0 + 8, k.b1 - 8], [k.a1 - 8, k.b1 - 8], [k.a1 - 8, k.b0 + 8]]);
      } else if (t === "houses" || t === "houses2" || t === "beachHouses") {
        Q.forEach((lot, q) => filler(k, lot, "house", q));
        trees(k, [[(k.a0 + k.a1) / 2, k.b1 - 8], [k.a1 - 8, (k.b0 + k.b1) / 2]]);
      } else if (t === "shops") {
        Q.forEach((lot, q) => filler(k, lot, "shop", q));
      } else if (t === "park") {
        put({ kind: "ground-park", ...whole, pond: { a: (I.a0 + I.a1) / 2 + 30, b: (I.b0 + I.b1) / 2 - 20, ra: 42, rb: 30 } });
        const r = rng(hash(k.id));
        const pts = [];
        for (let n = 0; n < 60 && pts.length < 16; n++) {
          const a = lerp(I.a0 + 8, I.a1 - 8, r()), b = lerp(I.b0 + 8, I.b1 - 8, r());
          const pa = (I.a0 + I.a1) / 2 + 30, pb = (I.b0 + I.b1) / 2 - 20;
          if (((a - pa) / 52) ** 2 + ((b - pb) / 40) ** 2 < 1) continue;
          if (Math.abs(a - (I.a0 + I.a1) / 2) < 12 || Math.abs(b - (I.b0 + I.b1) / 2) < 12) continue;
          if (pts.some(([x, y]) => Math.hypot(x - a, y - b) < 24)) continue;
          pts.push([a, b]);
        }
        trees(k, pts, ["tree", "tree", "pine"]);
        put({ kind: "prop", p: "bench", a: (I.a0 + I.a1) / 2 - 20, b: (I.b0 + I.b1) / 2 + 18, axis: "a" });
        put({ kind: "prop", p: "bench", a: (I.a0 + I.a1) / 2 + 18, b: (I.b0 + I.b1) / 2 + 20, axis: "b" });
        lamps.push({ a: (I.a0 + I.a1) / 2 - 14, b: (I.b0 + I.b1) / 2 - 14 });
        k.pond = { a: (I.a0 + I.a1) / 2 + 30, b: (I.b0 + I.b1) / 2 - 20, ra: 42, rb: 30 };
        k.walkIn = true;
      } else if (t === "square") {
        put({ kind: "ground-square", ...whole });
        const o = building(k, { a0: (I.a0 + I.a1) / 2 - 30, a1: (I.a0 + I.a1) / 2 + 30, b0: (I.b0 + I.b1) / 2 - 30, b1: (I.b0 + I.b1) / 2 + 30 }, { drawer: "fountain", H: 40, pad: 0, id: "plaza" });
        k.pigeons = { a: (I.a0 + I.a1) / 2, b: (I.b0 + I.b1) / 2 + 60 };
        [[I.a0 + 20, I.b0 + 20], [I.a1 - 20, I.b0 + 20], [I.a0 + 20, I.b1 - 20], [I.a1 - 20, I.b1 - 20]].forEach(([a, b]) => put({ kind: "prop", p: "planterTree", a, b }));
        [[I.a0 + 60, I.b1 - 30], [I.a1 - 60, I.b1 - 30], [I.a1 - 30, I.b0 + 60]].forEach(([a, b], n) => put({ kind: "prop", p: "stall", a, b, c: ["#D9734E", "#2A9D8F", "#E9B949"][n] }));
        lamps.push({ a: I.a0 + 50, b: (I.b0 + I.b1) / 2 }, { a: I.a1 - 50, b: (I.b0 + I.b1) / 2 });
        k.walkIn = true;
      } else if (t === "parking") {
        put({ kind: "ground-parking", ...whole });
        const r = rng(hash(k.id));
        for (let row = 0; row < 3; row++)
          for (let s = 0; s < 8; s++) {
            if (r() < 0.35) continue;
            const a = I.a0 + 20 + s * ((I.a1 - I.a0 - 40) / 7), b = I.b0 + 30 + row * 70;
            put({ kind: "parked", a, b, yaw: Math.PI / 2 * (row % 2 ? 1 : -1), vk: r() < 0.2 ? "bakkie" : r() < 0.3 ? "van" : "hatch", c: ["#D9534F", "#3E7CB1", "#F2C14E", "#2A9D8F", "#F6EDDF", "#7E6BC4", "#44545A"][(r() * 7) | 0] });
          }
      } else if (t === "home") {
        const o = building(k, Q[0], { drawer: "cottage", id: "personal", landmark: "personal", H: 80, pad: 14 });
        plots.personal = o;
        put({ kind: "ground-garden", ...Q[2] }); put({ kind: "ground-garden", ...Q[3] });
        trees(k, [[Q[2].a0 + 30, Q[2].b0 + 40], [Q[3].a1 - 30, Q[3].b1 - 30], [Q[3].a0 + 40, Q[3].b0 + 30]], ["tree", "pine"]);
        filler(k, Q[1], "house", 1);
        k.garden = true;
      } else if (t === "freelance") {
        plots.freelance = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: (I.b0 + I.b1) / 2 + 10 }, { drawer: "drafting", id: "freelance", landmark: "freelance", H: 110, pad: 12, face: "+b" });
        filler(k, Q[2], "shop", 2); filler(k, Q[3], "shop", 3);
      } else if (t === "studio") {
        plots.youtube = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: (I.b0 + I.b1) / 2 + 10 }, { drawer: "film", id: "youtube", landmark: "youtube", H: 110, pad: 12, face: "+b" });
        filler(k, Q[2], "house", 2); filler(k, Q[3], "house", 3);
      } else if (t === "maker") {
        plots.bynode = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: (I.b0 + I.b1) / 2 + 20 }, { drawer: "maker", id: "bynode", landmark: "bynode", H: 100, pad: 12, face: "+b" });
        filler(k, Q[2], "shop", 2); filler(k, Q[3], "house", 3);
      } else if (t === "cafe") {
        plots.coffee = building(k, Q[3], { drawer: "cafe", id: "coffee", landmark: "coffee", H: 80, pad: 22, face: "+b" });
        [[Q[3].a0 + 14, Q[3].b1 + 2], [Q[3].a0 + 44, Q[3].b1 + 2]].forEach(([a, b]) => put({ kind: "prop", p: "umbrella", a, b, c: "#D9734E" }));
        filler(k, Q[0], "shop", 0); filler(k, Q[1], "apartment", 1); filler(k, Q[2], "shop", 2);
      } else if (t === "mill") {
        plots.wood = building(k, { a0: I.a0, a1: I.a1, b0: (I.b0 + I.b1) / 2 - 20, b1: I.b1 }, { drawer: "mill", id: "wood", landmark: "wood", H: 100, pad: 14, face: "+b" });
        filler(k, Q[0], "house", 0); filler(k, Q[1], "house", 1);
      } else if (t === "gym") {
        plots.fitness = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b0 + 90 }, { drawer: "gym", id: "fitness", landmark: "fitness", H: 80, pad: 12, face: "+b" });
        put({ kind: "ground-track", a0: I.a0, a1: I.a1, b0: I.b0 + 100, b1: I.b1 });
        k.track = { a0: I.a0, a1: I.a1, b0: I.b0 + 100, b1: I.b1 };
      } else if (t === "marina") {
        plots.marina = building(k, Q[2], { drawer: "marinaOffice", id: "marina", landmark: "marina", H: 70, pad: 14, face: "+b" });
        filler(k, Q[0], "shop", 0); filler(k, Q[1], "shop", 1);
        put({ kind: "prop", p: "umbrella", a: Q[3].a0 + 30, b: Q[3].b0 + 40, c: "#2A9D8F" });
        put({ kind: "prop", p: "umbrella", a: Q[3].a1 - 30, b: Q[3].b1 - 30, c: "#E9B949" });
        put({ kind: "ground-square", ...Q[3] });
      } else if (t.startsWith("cs:")) {
        construction(k, whole, t.slice(3));
      } else if (t === "epcmHQ") {
        plots.epcm = building(k, { a0: I.a0, a1: I.a1 - 70, b0: I.b0, b1: I.b1 - 110 }, { drawer: "epcmHQ", id: "epcm", landmark: "epcm", H: 170, pad: 10, face: "+b" });
        put({ kind: "ground-parking", a0: I.a0, a1: I.a1, b0: I.b1 - 90, b1: I.b1 });
        for (let s = 0; s < 7; s++) put({ kind: "parked", a: I.a0 + 25 + s * 36, b: I.b1 - 45, yaw: Math.PI / 2, vk: s % 3 ? "hatch" : "bakkie", c: ["#F6EDDF", "#44545A", "#3E7CB1", "#D9534F"][s % 4] });
        trees(k, [[I.a1 - 30, I.b0 + 30], [I.a1 - 30, I.b0 + 110], [I.a1 - 30, I.b0 + 190]], ["pine"]);
      } else if (t === "refinery") {
        building(k, whole, { drawer: "refinery", id: "epcmPlant", landmark: "epcm", H: 190, pad: 6 });
      } else if (t === "hub") {
        plots.hub = building(k, { a0: I.a0, a1: I.a1, b0: I.b0, b1: I.b0 + 170 }, { drawer: "hubWarehouse", id: "hub", landmark: "hub", H: 90, pad: 10, face: "+b" });
        put({ kind: "ground-yard", a0: I.a0, a1: I.a1, b0: I.b0 + 180, b1: I.b1 });
        k.containers = { a0: I.a0 + 20, a1: I.a1 - 20, b: I.b0 + 250 };
      } else if (t === "portyard") {
        put({ kind: "ground-yard", ...whole });
        construction(k, { a0: I.a0, a1: I.a0 + 130, b0: I.b0, b1: I.b0 + 150 }, "fabyard");
        const cols = ["#E0474C", "#3E7CB1", "#E9B949", "#2A9D8F", "#F08A4B", "#7E6BC4"];
        for (let row = 0; row < 3; row++) for (let s = 0; s < 3; s++) put({ kind: "container", a: I.a0 + 170 + s * 40, b: I.b0 + 60 + row * 26, h: 1 + ((row + s) % 3), c: cols[(row * 3 + s) % cols.length] });
        plots.port = put({ id: "port", kind: "building", drawer: "portCranes", landmark: "port", a: 2000, b: 1122, w: 300, d: 40, H: 130, face: "+b", door: { a: 2000, b: 1100 } });
      }
    });
    // lighthouse on the breakwater tip
    plots.goals = put({ id: "goals", kind: "building", drawer: "lighthouse", landmark: "goals", a: 1168, b: 1820, w: 60, d: 60, H: 200, face: "-b", door: { a: 1168, b: 1788 } });

    /* ---- trees along the avenues (in the sidewalk band) ---- */
    blocks.filter((k) => k.kind === "block").forEach((k) => {
      const busy = objs.filter((o) => o.block === k.id && o.kind === "building");
      const along = [];
      for (let a = k.a0 + 30; a < k.a1 - 20; a += 60) along.push([a, k.b1 - 7]);
      for (let b = k.b0 + 30; b < k.b1 - 20; b += 60) along.push([k.a1 - 7, b]);
      along.forEach(([a, b], n) => {
        if (n % 2) return;
        if (busy.some((o) => Math.abs(o.door.a - a) < 22 && Math.abs(o.door.b - b) < 22)) return;
        put({ kind: "tree", a, b, v: n, s: 0.7, t: "tree", street: true });
      });
    });

    /* ---- street lamps at corners ---- */
    nodes.forEach((n) => {
      if (n.rb) return;
      const off = n.w / 2 + 6;
      lamps.push({ a: n.a + off, b: n.b + off, corner: true });
      lamps.push({ a: n.a - off, b: n.b - off, corner: true });
    });
    lamps.forEach((l, i) => put({ kind: "lamp", a: l.a, b: l.b, idx: i, pier: l.pier }));

    /* ---- traffic lights ---- */
    const signals = [];
    nodes.forEach((n) => {
      if (!n.signal) return;
      n.edges.forEach((e) => {
        const other = e.n0 === n ? e.n1 : e.n0;
        const da = Math.sign(other.a - n.a), db = Math.sign(other.b - n.b);
        // pole on the kerb to the left of cars approaching along this edge
        const lane = e.w / 2 + 5, back = n.w / 2 + 14;
        const la = -db, lb = da; // left of travel for a car heading towards n is (-db, da) when it moves in (-da,-db)
        const s = put({ kind: "signal", a: n.a + da * back + (-db) * lane * -1, b: n.b + db * back + da * lane * -1, node: n, axis: e.axis, facing: e.axis === "a" ? "R" : "L" });
        signals.push(s);
      });
    });

    /* ---- pedestrian network ---- */
    const PN = peds.nodes, PE = peds.edges;
    const pnode = (a, b, tag) => { const n = { id: PN.length, a, b, adj: [], tag }; PN.push(n); return n; };
    const plink = (p, q, meta = {}) => { const L = Math.hypot(p.a - q.a, p.b - q.b); const e = { p, q, L, ...meta }; PE.push(e); p.adj.push({ n: q, e }); q.adj.push({ n: p, e }); return e; };
    const rings = blocks.map((k) => {
      const inset = 7, a0 = k.a0 + inset, a1 = k.a1 - inset, b0 = k.b0 + inset, b1 = k.b1 - inset;
      const per = 2 * (a1 - a0 + b1 - b0);
      const toT = (a, b) => {
        if (Math.abs(b - b0) < 2) return a - a0;
        if (Math.abs(a - a1) < 2) return a1 - a0 + (b - b0);
        if (Math.abs(b - b1) < 2) return a1 - a0 + b1 - b0 + (a1 - a);
        return 2 * (a1 - a0) + (b1 - b0) + (b1 - b);
      };
      return { k, a0, a1, b0, b1, per, toT, pts: [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([a, b]) => ({ a, b, t: toT(a, b) })) };
    });
    const onRing = (a, b) => rings.find((r) => a >= r.a0 - 1.5 && a <= r.a1 + 1.5 && b >= r.b0 - 1.5 && b <= r.b1 + 1.5 && (Math.abs(a - r.a0) < 1.5 || Math.abs(a - r.a1) < 1.5 || Math.abs(b - r.b0) < 1.5 || Math.abs(b - r.b1) < 1.5));
    const anchor = (a, b, tag) => {
      const r = onRing(a, b);
      if (!r) return null;
      const p = { a, b, t: r.toT(a, b), tag };
      r.pts.push(p);
      return p;
    };
    // crossings at each intersection
    const crossings = [];
    nodes.forEach((n) => {
      n.edges.forEach((e) => {
        const other = e.n0 === n ? e.n1 : e.n0;
        const da = Math.sign(other.a - n.a), db = Math.sign(other.b - n.b);
        const perpW = e.axis === "a" ? n.wa : n.wb;
        const cw = n.rb ? RB_R + 12 : perpW / 2 + 8;
        if (e.bridge && cw > 40) return;
        const ca = n.a + da * cw, cb = n.b + db * cw, off = e.w / 2 + 7;
        const p = anchor(ca + db * off, cb - da * off, "x"), q = anchor(ca - db * off, cb + da * off, "x");
        if (!p || !q) return;
        const s = e.n0 === n ? cw : e.len - cw;
        const c = { e, s, node: n, p, q, peds: 0, a: ca, b: cb };
        e.crossings.push(c); crossings.push(c);
      });
    });
    // bridge footways
    const bw = [[603, 603], [657, 657]].map(([b]) => [anchor(1253, b, "br"), anchor(1567, b, "br")]);
    // doors
    objs.filter((o) => o.kind === "building" && o.door).forEach((o) => {
      const r = rings.find((r) => o.a > r.k.a0 && o.a < r.k.a1 && o.b > r.k.b0 && o.b < r.k.b1);
      if (!r) return;
      const { a, b } = o.door;
      let pa = clamp(a, r.a0, r.a1), pb = clamp(b, r.b0, r.b1);
      const dists = [[Math.abs(a - r.a0), r.a0, pb], [Math.abs(a - r.a1), r.a1, pb], [Math.abs(b - r.b0), pa, r.b0], [Math.abs(b - r.b1), pa, r.b1]].sort((x, y) => x[0] - y[0]);
      const p = anchor(dists[0][1], dists[0][2], "door");
      if (p) p.door = o;
      o.doorRing = p;
    });
    // build ring nodes/edges
    rings.forEach((r) => {
      r.pts.sort((x, y) => x.t - y.t);
      const uniq = [];
      r.pts.forEach((p) => { const prev = uniq[uniq.length - 1]; if (prev && Math.abs(prev.t - p.t) < 0.5) { p.node = prev.node; if (p.door) prev.node.door = p.door; return; } p.node = pnode(p.a, p.b, p.tag); if (p.door) p.node.door = p.door; uniq.push(p); });
      for (let i = 0; i < uniq.length; i++) plink(uniq[i].node, uniq[(i + 1) % uniq.length].node, { ring: r.k.id });
      r.nodes = uniq.map((p) => p.node);
    });
    crossings.forEach((c) => { c.pe = plink(c.p.node, c.q.node, { crossing: c }); });
    bw.forEach(([p, q]) => p && q && plink(p.node, q.node, { bridgeWalk: true }));
    // doors: node sits on the ring; add the door step node
    objs.filter((o) => o.doorRing).forEach((o) => { const dn = pnode(o.door.a, o.door.b, "step"); dn.door = o; plink(o.doorRing.node, dn); o.doorNode = dn; });
    // connect touching walkways (promenade corners, piers)
    const ringNodes = rings.flatMap((r) => r.nodes.map((n) => ({ n, r })));
    for (let i = 0; i < ringNodes.length; i++)
      for (let j = i + 1; j < ringNodes.length; j++) {
        const x = ringNodes[i], y = ringNodes[j];
        if (x.r === y.r) continue;
        if (Math.hypot(x.n.a - y.n.a, x.n.b - y.n.b) < 24 && !x.n.adj.some((q) => q.n === y.n)) plink(x.n, y.n);
      }

    /* ---- landmark footprints for hit tests and labels ---- */
    Object.entries(plots).forEach(([id, o]) => { o.sx = o.a - o.b; o.sy = (o.a + o.b) / 2; });

    return { isles: ISLES, land, beaches, roads, blocks, objs, plots, nodes: [...nodes.values()], edges, signals, peds, crossings, docks, marinaWater, lamps, bridgeE, rings };
  }
