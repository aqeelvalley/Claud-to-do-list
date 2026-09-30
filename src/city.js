  /* ===================== Valley Isle · city layout =====================
   * Islands on an isometric macro-grid, each with a 3x3 street grid,
   * joined by bridges. Everything here is in iso units (a, b); ye()
   * projects to screen. Buildings sit in the four blocks of an island.
   */
  var City = (() => {
    const h = React.createElement;
    const P = 660, // macro pitch between island centres
      RING = 150, // outer ring road offset from island centre
      RW = 26, // road width
      SW = 40, // road + pavements
      BLK = 75; // block centre offset
    const QUAD = { N: [-1, -1], E: [1, -1], S: [1, 1], W: [-1, 1] };
    const ORDER = ["N", "E", "S", "W"];

    const CORE = [
      { id: "home", name: "Home Isle", i: 0, j: 0, color: "#6DAE5B",
        blocks: { N: "plaza", E: "park", S: "cs:Town hall", W: "personal" } },
      { id: "eng", name: "Engineering Isle", i: -1, j: 0, color: "#3E7CB1",
        blocks: { N: "epcm", E: "freelance", S: "fill:office", W: "cs:Research lab" } },
      { id: "maker", name: "Maker Isle", i: 0, j: -1, color: "#2A9D8F",
        blocks: { N: "bynode", E: "wood", S: "fill:shop", W: "cs:Robotics bay" } },
      { id: "harbour", name: "Harbour Isle", i: 1, j: 0, color: "#1F7A8C",
        blocks: { N: "coffee", E: "hub", S: "cs:Warehouse", W: "fill:house" } },
      { id: "media", name: "Media Isle", i: 0, j: 1, color: "#E0474C",
        blocks: { N: "youtube", E: "fill:tower", S: "park", W: "cs:Sound stage" } },
      { id: "well", name: "Wellness Isle", i: 1, j: 1, color: "#F08A4B",
        blocks: { N: "fitness", E: "park", S: "field", W: "fill:house" } },
    ];
    const LIGHT = { id: "light", name: "Lighthouse Point", i: 1, j: -1, small: true, color: "#E9B949" };
    const FRONTIER_CELLS = [
      [-1, -1], [-1, 1], [2, 1], [1, 2], [-2, 0], [0, -2], [-1, 2], [-2, -1],
    ];
    const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

    const frontierCell = (k) => {
      if (k < FRONTIER_CELLS.length) return FRONTIER_CELLS[k];
      const r = 3 + Math.floor((k - FRONTIER_CELLS.length) / 8),
        t = (k - FRONTIER_CELLS.length) % 8,
        ring = [[r, 0], [0, r], [-r, 0], [0, -r], [r, -1], [-1, r], [-r, 1], [1, -r]];
      return ring[t];
    };
    const centre = (isle) => ({ a: isle.i * P, b: isle.j * P });
    const scr = (a, b, z = 0) => ye(a, b, z);

    /* ---------- layout ---------- */
    function layout(nSections) {
      const nFrontier = Math.floor(nSections / 4) + 1;
      const isles = CORE.map((c) => ({ ...c, blocks: { ...c.blocks } }));
      for (let k = 0; k < nFrontier; k++) {
        const [i, j] = frontierCell(k);
        const blocks = {};
        ORDER.forEach((q, n) => {
          const slot = k * 4 + n;
          blocks[q] = slot < nSections ? "slot:" + slot : "free:" + slot;
        });
        isles.push({ id: "fr" + k, name: "Frontier Isle " + (ROMAN[k] || k + 1), i, j,
          color: "#9A8F7A", frontier: true, blocks });
      }
      const all = [...isles, LIGHT];
      const at = {};
      all.forEach((s) => (at[s.i + "," + s.j] = s));

      const plots = {}; // landmark id -> {x,y,r, isle}
      const blocks = []; // every block with its content
      const nodes = new Map(); // "a,b" -> {a,b,adj:Set}
      const roads = []; // [{a0,b0,a1,b1}]
      const bridges = [];
      const blobs = [];
      const lamps = [];
      const signs = [];
      const ponds = [];
      const pastures = [];
      const addNode = (a, b) => {
        const k = a + "," + b;
        if (!nodes.has(k)) nodes.set(k, { a, b, k, adj: new Set() });
        return nodes.get(k);
      };
      const link = (a0, b0, a1, b1, road = true) => {
        const n0 = addNode(a0, b0), n1 = addNode(a1, b1);
        n0.adj.add(n1.k); n1.adj.add(n0.k);
        if (road) roads.push({ a0, b0, a1, b1 });
      };

      all.forEach((s) => {
        const c = centre(s);
        const [sx, sy] = scr(c.a, c.b);
        s.cx = sx; s.cy = sy; s.ca = c.a; s.cb = c.b;
        if (s.small) {
          // Lighthouse islet: round rock with a single lane in
          [-45, 45].forEach((da) => [-45, 45].forEach((db) => {
            const [x, y] = scr(c.a + da, c.b + db);
            blobs.push({ id: "b" + s.id + da + db, x, y, r: 150 });
          }));
          const [lx, ly] = scr(c.a - 10, c.b - 20);
          plots.goals = { x: lx, y: ly, r: 160 };
          signs.push({ x: sx, y: sy + 130, name: s.name, color: s.color });
          return;
        }
        // Terrain: a dense grid of blobs gives a rounded-square island
        [-160, -80, 0, 80, 160].forEach((da) => [-160, -80, 0, 80, 160].forEach((db) => {
          const [x, y] = scr(c.a + da, c.b + db);
          blobs.push({ id: "b" + s.id + "_" + da + "_" + db, x, y, r: 200 });
        }));
        // Street grid
        const L = [-RING, 0, RING];
        L.forEach((la) => {
          for (let q = 0; q < 2; q++) {
            link(c.a + la, c.b + L[q], c.a + la, c.b + L[q + 1]);
            link(c.a + L[q], c.b + la, c.a + L[q + 1], c.b + la);
          }
        });
        L.forEach((la) => L.forEach((lb) => {
          if ((la === 0 && lb === 0) || (Math.abs(la) === RING && Math.abs(lb) === RING)) return;
          lamps.push({ a: c.a + la + 19, b: c.b + lb + 19 });
        }));
        signs.push({ x: sx, y: sy + 222, name: s.name, color: s.color });
        // Blocks
        ORDER.forEach((q) => {
          const [ua, ub] = QUAD[q];
          const ba = c.a + ua * BLK, bb = c.b + ub * BLK;
          const [x, y] = scr(ba, bb);
          const content = s.blocks[q];
          const blk = { id: s.id + ":" + q, isle: s, q, a: ba, b: bb, x, y, content };
          blocks.push(blk);
          if (content === "park") {
            ponds.push({ a: ba + 18, b: bb - 12, ra: 22, rb: 15 });
          }
          if (content === "field") pastures.push({ a: ba, b: bb, r: 40 });
          if (!content.includes(":") && content !== "park" && content !== "field")
            plots[content] = { x, y, r: 200 };
          if (content.startsWith("slot:")) plots[content] = { x, y, r: 200 };
        });
      });

      // Harbour quay: the port sits on the east shore, pier out to sea
      const hb = isles.find((s) => s.id === "harbour");
      {
        const qa = hb.ca + 236, qb = hb.cb + 70;
        const [x, y] = scr(qa, qb);
        plots.port = { x, y, r: 130 };
        [[200, 40], [200, 110], [250, 60]].forEach(([da, db], n) => {
          const [bx, by] = scr(hb.ca + da, hb.cb + db);
          blobs.push({ id: "quay" + n, x: bx, y: by, r: 150 });
        });
        link(hb.ca + RING, hb.cb + 70 - 70, hb.ca + RING, hb.cb + 75, false);
      }

      // Bridges between neighbouring islands
      const done = new Set();
      const bridge = (s, t) => {
        const key = [s.id, t.id].sort().join("|");
        if (done.has(key)) return;
        done.add(key);
        const alongA = s.i !== t.i;
        const [lo, hi] = (alongA ? s.i < t.i : s.j < t.j) ? [s, t] : [t, s];
        let a0, b0, a1, b1;
        const hiEnd = hi.small ? 60 : RING;
        if (alongA) {
          a0 = lo.ca + RING; a1 = hi.ca - hiEnd; b0 = b1 = lo.cb;
        } else {
          b0 = lo.cb + RING; b1 = hi.cb - hiEnd; a0 = a1 = lo.ca;
        }
        if (lo.small) {
          if (alongA) a0 = lo.ca + 60; else b0 = lo.cb + 60;
        }
        link(a0, b0, a1, b1);
        // water span (approx.) for the deck
        const w0 = lo.small ? 120 : 238, w1 = hi.small ? 120 : 238;
        bridges.push(alongA
          ? { a0: lo.ca + w0, a1: hi.ca - w1, b0: lo.cb, b1: lo.cb, axis: "a" }
          : { b0: lo.cb + w0, b1: hi.cb - w1, a0: lo.ca, a1: lo.ca, axis: "b" });
      };
      const nb = (s) => [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([di, dj]) => at[s.i + di + "," + (s.j + dj)]).filter(Boolean);
      CORE.forEach((c) => {
        const s = isles.find((x) => x.id === c.id);
        nb(s).forEach((t) => !t.frontier && !t.small && bridge(s, t));
      });
      bridge(isles.find((x) => x.id === "harbour"), LIGHT);
      isles.filter((s) => s.frontier).forEach((s) => {
        const t = nb(s).find((x) => !x.small && !x.frontier) || nb(s).find((x) => !x.small);
        t && bridge(s, t);
      });
      // Lighthouse lane
      link(LIGHT.i * P, LIGHT.j * P + 60, LIGHT.i * P, LIGHT.j * P + 20);

      return { isles, blocks, plots, nodes, roads, bridges, blobs, lamps, signs, ponds, pastures };
    }

    /* point-in-city tests used when scattering trees & flowers */
    function free(city, X, Y, pad = 10) {
      const a = Y + X / 2, b = Y - X / 2;
      for (const r of city.roads) {
        const la = Math.min(r.a0, r.a1) - SW / 2 - pad, ha = Math.max(r.a0, r.a1) + SW / 2 + pad,
          lb = Math.min(r.b0, r.b1) - SW / 2 - pad, hb = Math.max(r.b0, r.b1) + SW / 2 + pad;
        if (a > la && a < ha && b > lb && b < hb) return false;
      }
      for (const k of city.blocks) {
        if (Math.abs(a - k.a) < 62 + pad && Math.abs(b - k.b) < 62 + pad) {
          if (k.content !== "park" && k.content !== "field") return false;
          if (k.content === "field") return false;
          // inside a park: keep off the paths and pond
          const da = a - k.a, db = b - k.b;
          if (Math.abs(da) < 9 || Math.abs(db) < 9) return false;
          if (((da - 18) / 30) ** 2 + ((db + 12) / 22) ** 2 < 1) return false;
        }
      }
      const pp = city.plots.port;
      if (pp) {
        const pa = pp.y + pp.x / 2, pb = pp.y - pp.x / 2;
        if (a > pa - 80 && a < pa + 200 && b > pb - 50 && b < pb + 50) return false;
      }
      const g = city.plots.goals;
      if (g && Math.hypot(X - g.x, (Y - g.y) * 2) < 110) return false;
      return true;
    }

    /* ---------- drawing helpers ---------- */
    const quad = (a0, b0, a1, b1, w, z = 0, ext = 0) => {
      const L = Math.hypot(a1 - a0, b1 - b0) || 1,
        da = (a1 - a0) / L, db = (b1 - b0) / L,
        pa = -db * w / 2, pb = da * w / 2,
        s0a = a0 - da * ext, s0b = b0 - db * ext, s1a = a1 + da * ext, s1b = b1 + db * ext;
      return J([[s0a + pa, s0b + pb, z], [s1a + pa, s1b + pb, z], [s1a - pa, s1b - pb, z], [s0a - pa, s0b - pb, z]]);
    };
    const sq = (a, b, half, z = 0) => J([[a - half, b - half, z], [a + half, b - half, z], [a + half, b + half, z], [a - half, b + half, z]]);

    function Ground({ city }) {
      const r = city.roads;
      const walk = [], tar = [], dash = [], zebra = [];
      r.forEach((s, n) => {
        walk.push(h("polygon", { key: n, points: quad(s.a0, s.b0, s.a1, s.b1, SW, 0, SW / 2), fill: "#DCD0B8" }));
        tar.push(h("polygon", { key: n, points: quad(s.a0, s.b0, s.a1, s.b1, RW, 0.2, RW / 2), fill: "#5F6B72" }));
        const L = Math.hypot(s.a1 - s.a0, s.b1 - s.b0), da = (s.a1 - s.a0) / L, db = (s.b1 - s.b0) / L;
        if (L > 60) {
          const p0 = scr(s.a0 + da * 24, s.b0 + db * 24, 0.3), p1 = scr(s.a1 - da * 24, s.b1 - db * 24, 0.3);
          dash.push(h("line", { key: n, x1: L_(p0[0]), y1: L_(p0[1]), x2: L_(p1[0]), y2: L_(p1[1]) }));
          [[s.a0 + da * 19, s.b0 + db * 19], [s.a1 - da * 19, s.b1 - db * 19]].forEach(([za, zb], m2) => {
            [-9, -4.5, 0, 4.5, 9].forEach((o) => {
              const ca = za - db * o, cb = zb + da * o;
              zebra.push(h("polygon", { key: n + "z" + m2 + o, points: quad(ca - da * 3.5, cb - db * 3.5, ca + da * 3.5, cb + db * 3.5, 2.6, 0.3), fill: "#EFE8D8" }));
            });
          });
        }
      });
      return h("g", { className: "roads", pointerEvents: "none" },
        h("g", { stroke: "#C4B597", strokeWidth: 1.2, strokeLinejoin: "round" }, walk),
        h("g", null, tar),
        h("g", { stroke: "#F3E3B3", strokeWidth: 1.3, strokeDasharray: "7 7", strokeLinecap: "round" }, dash),
        h("g", null, zebra),
        city.bridges.map((br, n) => h(Bridge, { key: "br" + n, br })),
      );
    }
    const L_ = (v) => Math.round(v * 10) / 10;

    function Bridge({ br }) {
      const { a0, b0, a1, b1, axis } = br;
      const deck = [];
      const len = axis === "a" ? a1 - a0 : b1 - b0;
      const posts = [];
      const piers = [];
      const n = Math.max(2, Math.round(len / 34));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        const a = a0 + (a1 - a0) * t, b = b0 + (b1 - b0) * t;
        const side = axis === "a" ? [[a, b - SW / 2 + 2], [a, b + SW / 2 - 2]] : [[a - SW / 2 + 2, b], [a + SW / 2 - 2, b]];
        side.forEach(([pa, pb], m2) => {
          const q0 = scr(pa, pb, 4), q1 = scr(pa, pb, 12);
          posts.push(h("line", { key: k + "p" + m2, x1: L_(q0[0]), y1: L_(q0[1]), x2: L_(q1[0]), y2: L_(q1[1]) }));
        });
        if (k > 0 && k < n && k % 2 === 0) {
          const [px, py] = scr(a, b, 0);
          piers.push(h("g", { key: "pier" + k },
            h("rect", { x: L_(px - 7), y: L_(py - 2), width: 14, height: 12, rx: 2, fill: "#A89A84" }),
            h("ellipse", { className: "ripple", cx: L_(px), cy: L_(py + 10), rx: 12, ry: 3.2, fill: "none", stroke: "rgba(255,255,255,0.6)", strokeWidth: 1 })));
        }
      }
      const rail = (off) => {
        const p = axis === "a" ? [[a0, b0 + off], [a1, b1 + off]] : [[a0 + off, b0], [a1 + off, b1]];
        const q0 = scr(p[0][0], p[0][1], 12), q1 = scr(p[1][0], p[1][1], 12);
        return h("line", { x1: L_(q0[0]), y1: L_(q0[1]), x2: L_(q1[0]), y2: L_(q1[1]) });
      };
      return h("g", null,
        h("polygon", { points: quad(a0, b0, a1, b1, SW + 10, -6, 0), fill: "rgba(8,60,70,0.25)", transform: "translate(8,10)" }),
        piers,
        h("polygon", { points: quad(a0, b0, a1, b1, SW, 0, 0), fill: "#B9A88C" }),
        h("polygon", { points: quad(a0, b0, a1, b1, SW, 4, 0), fill: "#E3D6BD", stroke: "#B7A27E", strokeWidth: 1 }),
        h("polygon", { points: quad(a0, b0, a1, b1, RW, 4.2, 0), fill: "#6A757B" }),
        h("g", { stroke: "#8A6F4E", strokeWidth: 1.6, strokeLinecap: "round" }, posts),
        h("g", { stroke: "#F6EDDF", strokeWidth: 2.2, strokeLinecap: "round" }, rail(-SW / 2 + 2), rail(SW / 2 - 2)),
      );
    }

    /* block slabs drawn flat on the ground under everything */
    function Lots({ city }) {
      return h("g", { pointerEvents: "none" }, city.blocks.map((k) => {
        const ct = k.content;
        let fill = "#9CCB84", stroke = "#7FB06A";
        if (ct.startsWith("cs:") || ct.startsWith("free:")) { fill = "#CFAE7F"; stroke = "#B38F5E"; }
        else if (ct === "plaza") { fill = "#E7D8BC"; stroke = "#CDB892"; }
        else if (ct === "park") { fill = "#88C174"; stroke = "#6FA85C"; }
        else if (ct === "field") { fill = "#7DBA6A"; stroke = "#6AA658"; }
        return h("g", { key: k.id },
          h("polygon", { points: sq(k.a, k.b, 62, 0.1), fill, stroke, strokeWidth: 1.4 }),
          ct === "park" && h(ParkGround, { a: k.a, b: k.b }),
          ct === "field" && h(FieldGround, { a: k.a, b: k.b }),
        );
      }));
    }
    function ParkGround({ a, b }) {
      return h("g", null,
        h("polygon", { points: quad(a - 62, b, a + 62, b, 9, 0.2), fill: "#E8D9B8" }),
        h("polygon", { points: quad(a, b - 62, a, b + 62, 9, 0.2), fill: "#E8D9B8" }),
        h(Nt, { x: a, y: b, z: 0.25, a: 16, b: 16, fill: "#E8D9B8" }),
        h(Nt, { x: a + 18, y: b - 12, z: 0.3, a: 26, b: 18, fill: "#D9C9A4" }),
        h(Nt, { x: a + 18, y: b - 12, z: 0.35, a: 22, b: 15, fill: "#5CC4CC", stroke: "#8FDCE0", sw: 1.2 }),
        h(Nt, { x: a + 22, y: b - 14, z: 0.4, a: 8, b: 4, fill: "none", stroke: "rgba(255,255,255,0.7)", sw: 1 }),
      );
    }
    function FieldGround({ a, b }) {
      return h("g", null,
        h(Nt, { x: a, y: b, z: 0.2, a: 58, b: 50, fill: "#D9734E", stroke: "#B85C3C", sw: 1 }),
        h(Nt, { x: a, y: b, z: 0.25, a: 48, b: 40, fill: "#7DBA6A" }),
        h("polygon", { points: sq(a, b, 30, 0.3), fill: "#8CC878", stroke: "#F6F2E6", strokeWidth: 1.2 }),
        h("polygon", { points: quad(a, b - 30, a, b + 30, 0.01, 0.3), stroke: "#F6F2E6", strokeWidth: 1.2 }),
        h(Nt, { x: a, y: b, z: 0.3, a: 8, b: 8, stroke: "#F6F2E6", sw: 1.2 }),
      );
    }

    /* ---------- block contents (depth-sorted objects) ---------- */
    function Construction({ label, free: isFree, color }) {
      const hook = scr(-8, -34, 40), hookTop = scr(-8, -34, 96);
      const mast = { x: 30, y: -34, z: 0, w: 5, d: 5, h: 96 };
      const jib0 = scr(30 - 60, -34, 96), jib1 = scr(30 + 34, -34, 96);
      return h("g", null,
        !isFree && h("g", null,
          h(b, { x: -12, y: -4, z: 0, w: 66, d: 56, h: 3, c: "#BFC4C6" }),
          [[-42, -30], [18, -30], [-42, 22], [18, 22]].map(([x, y], n) =>
            h(b, { key: n, x: x + 1, y: y + 1, z: 3, w: 4, d: 4, h: 34, c: "#AEB5B8" })),
          h(b, { x: -12, y: -4, z: 20, w: 66, d: 56, h: 3, c: "#C9CED0" }),
          h(b, { x: -12, y: -4, z: 37, w: 66, d: 56, h: 2, c: "#C9CED0" }),
          h(b, { x: -30, y: 14, z: 3, w: 28, d: 20, h: 17, c: T(color, 0.35) }),
          h("g", { stroke: "#D9A441", strokeWidth: 1.1, fill: "none" },
            [0, 1, 2, 3].map((n) => {
              const p0 = scr(-45 + n * 22, 25, 3), p1 = scr(-45 + n * 22, 25, 40);
              return h("line", { key: n, x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1] });
            }),
            [12, 24, 36].map((z) => {
              const p0 = scr(-46, 25, z), p1 = scr(21, 25, z);
              return h("line", { key: "h" + z, x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1] });
            }),
          ),
        ),
        isFree && h("g", null,
          h(Nt, { x: -6, y: 4, z: 0.3, a: 34, b: 26, fill: "#BF9A68" }),
          [[-40, -40], [40, -40], [40, 40], [-40, 40]].map(([x, y], n) =>
            h(b, { key: n, x, y, z: 0, w: 3, d: 3, h: 9, c: "#E9DDC8" })),
          h("polygon", { points: sq(0, 0, 40, 6), fill: "none", stroke: "#E9DDC8", strokeWidth: 1, strokeDasharray: "4 3" }),
        ),
        // sand pile & cones
        h("path", { d: (() => { const [x, y] = scr(34, 30); return `M${x - 16},${y} Q${x},${y - 16} ${x + 16},${y} Z`; })(), fill: "#E3C48D", stroke: "#C7A56B", strokeWidth: 0.8 }),
        [[-50, 48], [-20, 52], [10, 54]].map(([a, bb], n) => {
          const [x, y] = scr(a, bb);
          return h("g", { key: "c" + n },
            h("path", { d: `M${x - 3},${y} L${x},${y - 8} L${x + 3},${y} Z`, fill: "#F08A4B" }),
            h("rect", { x: x - 1.8, y: y - 5, width: 3.6, height: 1.4, fill: "#FFF8EC" }));
        }),
        // tower crane
        !isFree && h("g", null,
          h(b, { ...mast, c: "#E9B949" }),
          h("line", { x1: jib0[0], y1: jib0[1], x2: jib1[0], y2: jib1[1], stroke: "#D6A437", strokeWidth: 3.2, strokeLinecap: "round" }),
          h("line", { x1: jib0[0], y1: jib0[1] + 3, x2: jib1[0], y2: jib1[1] + 3, stroke: "#E9B949", strokeWidth: 1, strokeDasharray: "3 3" }),
          h(b, { x: 52, y: -34, z: 92, w: 10, d: 8, h: 6, c: "#7A8591" }),
          h(b, { x: 30, y: -34, z: 90, w: 8, d: 8, h: 7, c: "#F6EDDF" }),
          h("g", { className: "sway" },
            h("line", { x1: hookTop[0], y1: hookTop[1] + 2, x2: hook[0], y2: hook[1], stroke: "#44545A", strokeWidth: 0.9 }),
            h("rect", { x: hook[0] - 7, y: hook[1], width: 14, height: 6, fill: "#B98759", stroke: "#7E5337", strokeWidth: 0.7 })),
        ),
        h(Sign, { label, isFree }),
      );
    }
    function Sign({ label, isFree }) {
      const [x, y] = scr(-50, 40);
      const w = Math.max(64, label.length * 5.6 + 20);
      return h("g", null,
        h("line", { x1: x - w / 2 + 8, y1: y, x2: x - w / 2 + 8, y2: y - 22, stroke: "#6F5A45", strokeWidth: 1.6 }),
        h("line", { x1: x + w / 2 - 8, y1: y, x2: x + w / 2 - 8, y2: y - 22, stroke: "#6F5A45", strokeWidth: 1.6 }),
        h("rect", { x: x - w / 2, y: y - 38, width: w, height: 20, rx: 3, fill: isFree ? "#FFF8EC" : "#F2C14E", stroke: isFree ? "#D9C4A0" : "#B98A22", strokeWidth: 1.2 }),
        !isFree && h("path", { d: `M${x - w / 2 + 2},${y - 20} l6,-16 M${x - w / 2 + 12},${y - 20} l6,-16 M${x + w / 2 - 14},${y - 20} l6,-16`, stroke: "rgba(40,30,10,0.35)", strokeWidth: 2.5 }),
        h("text", { x, y: y - 24.5, textAnchor: "middle", className: "cs-label" }, label),
      );
    }
    function ParkObjects({ seed }) {
      const rnd = Zs(ms("park" + seed));
      const trees = [[-44, -44], [-40, 30], [40, 44], [-20, -48], [48, 18], [-50, 8], [22, 50], [-10, 46]];
      return h("g", null,
        trees.map(([a, bb], n) => {
          const [x, y] = scr(a, bb);
          return rnd() < 0.3 ? h(Ot, { key: n, sx: x, sy: y, s: 0.85 }) : h(ht, { key: n, sx: x, sy: y, s: 0.8 + rnd() * 0.25, v: n });
        }),
        h($t, { x: -18, y: 18 }),
        h($t, { x: 14, y: -26 }),
        h(nt, { sx: scr(-14, -14)[0], sy: scr(-14, -14)[1], h: 18 }),
        h(We, { sx: scr(34, 18)[0], sy: scr(34, 18)[1], flower: "#F4A3B5" }),
        h(We, { sx: scr(-30, -20)[0], sy: scr(-30, -20)[1], flower: "#F2C14E" }),
      );
    }
    function FieldObjects() {
      const goal = (a) => {
        const p0 = scr(a, -8, 0), p1 = scr(a, -8, 8), p2 = scr(a, 8, 8), p3 = scr(a, 8, 0);
        return h("polyline", { points: [p0, p1, p2, p3].map((p) => p.join(",")).join(" "), fill: "none", stroke: "#FFFFFF", strokeWidth: 1.4 });
      };
      return h("g", null, goal(-28), goal(28),
        h(ht, { sx: scr(-56, -56)[0], sy: scr(-56, -56)[1], s: 0.8 }),
        h(ht, { sx: scr(56, 56)[0], sy: scr(56, 56)[1], s: 0.85, v: 1 }),
        h(Rt, { sx: scr(52, -52)[0], sy: scr(52, -52)[1], c: "#F08A4B" }));
    }

    function Lamp({ a, b: bb }) {
      const [x, y] = scr(a, bb);
      return h(nt, { sx: x, sy: y, h: 20 });
    }

    /* collect depth-sorted objects that are not landmarks */
    function objects(city, onPlot) {
      const out = [];
      city.blocks.forEach((k) => {
        const ct = k.content;
        const click = (e) => { e.stopPropagation(); onPlot && onPlot(k); };
        const wrap = (el, extra = {}) => h("g", { key: k.id, transform: `translate(${L_(k.x)},${L_(k.y)})`, ...extra }, el);
        if (ct.startsWith("cs:") || ct.startsWith("free:")) {
          const isFree = ct.startsWith("free:");
          out.push({ y: k.y, el: wrap(h(Construction, { label: isFree ? "Free plot" : ct.slice(3), free: isFree, color: k.isle.color }),
            { className: "plot", onClick: click, role: "button", tabIndex: 0, "aria-label": isFree ? "Free plot. Add a new section here." : ct.slice(3) + ", under construction" }) });
        } else if (ct.startsWith("fill:")) {
          const kind = ct.slice(5);
          out.push({ y: k.y, el: wrap(h("g", null, h(qt, { tier: 2, c: T(k.isle.color, 0.05), kind }),
            h(ht, { sx: scr(-48, 46)[0], sy: scr(-48, 46)[1], s: 0.75 }),
            h(ht, { sx: scr(46, -48)[0], sy: scr(46, -48)[1], s: 0.7, v: 2 }))) });
        } else if (ct === "park") {
          out.push({ y: k.y, el: wrap(h(ParkObjects, { seed: k.id })) });
        } else if (ct === "field") {
          out.push({ y: k.y, el: wrap(h(FieldObjects)) });
        }
      });
      city.lamps.forEach((l, n) => {
        const [, y] = scr(l.a, l.b);
        out.push({ y, el: h(Lamp, { key: "lamp" + n, a: l.a, b: l.b }) });
      });
      return out;
    }

    function Signs({ city, ls = 1 }) {
      return h("g", { className: "isle-signs", pointerEvents: "none" }, city.signs.map((s) => {
        const w = s.name.length * 7.4 + 30;
        return h("g", { key: s.name, transform: `translate(${L_(s.x)},${L_(s.y)}) scale(${L_(ls)})` },
          h("rect", { x: -w / 2, y: -11, width: w, height: 22, rx: 11, fill: "rgba(12,60,70,0.55)" }),
          h("circle", { cx: -w / 2 + 12, cy: 0, r: 4.2, fill: s.color, stroke: "#FFF8EC", strokeWidth: 1.5 }),
          h("text", { x: 6, y: 4, textAnchor: "middle", className: "isle-name" }, s.name.toUpperCase()));
      }));
    }

    /* ---------------- life: cars, people, animals ---------------- */
    const NS = "http://www.w3.org/2000/svg";
    const poly = (pts, fill, extra = "") => `<polygon points="${J(pts)}" fill="${fill}" ${extra}/>`;
    function boxS(x, y, z, w, d, hh, c) {
      const r = x - w / 2, R = x + w / 2, k = y - d / 2, f = y + d / 2, t = z + hh;
      return poly([[r, f, z], [R, f, z], [R, f, t], [r, f, t]], c) +
        poly([[R, k, z], [R, f, z], [R, f, t], [R, k, t]], T(c, -0.2)) +
        poly([[r, k, t], [R, k, t], [R, f, t], [r, f, t]], T(c, 0.14));
    }
    function carSVG(color, along, kind) {
      const L = kind === "van" ? 22 : kind === "bus" ? 34 : 18, W = kind === "bus" ? 11 : 10;
      const [w, d] = along === "a" ? [L, W] : [W, L];
      const body = kind === "bus" ? 11 : kind === "van" ? 10 : 5;
      let s = `<ellipse cx="2" cy="3" rx="${L * 0.75}" ry="${L * 0.32}" fill="rgba(0,0,0,0.2)"/>`;
      s += boxS(0, 0, 1.5, w, d, body, color);
      if (kind === "car") {
        const [cw, cd] = along === "a" ? [L * 0.5, W * 0.84] : [W * 0.84, L * 0.5];
        s += boxS(along === "a" ? -1 : 0, along === "a" ? 0 : -1, 6.5, cw, cd, 4.2, "#DDEFF3");
        s += boxS(along === "a" ? -1 : 0, along === "a" ? 0 : -1, 10.7, cw * 0.96, cd * 0.96, 0.8, T(color, 0.1));
      } else {
        // windows band
        s += along === "a"
          ? poly([[-w / 2 + 2, d / 2, body - 4], [w / 2 - 2, d / 2, body - 4], [w / 2 - 2, d / 2, body - 1], [-w / 2 + 2, d / 2, body - 1]], "#DDEFF3")
          : poly([[w / 2, -d / 2 + 2, body - 4], [w / 2, d / 2 - 2, body - 4], [w / 2, d / 2 - 2, body - 1], [w / 2, -d / 2 + 2, body - 1]], "#DDEFF3");
      }
      return s;
    }
    function personSVG(shirt, skin, hair) {
      return `<ellipse cx="0" cy="0.5" rx="3.6" ry="1.4" fill="rgba(0,0,0,0.22)"/>` +
        `<g class="ag-legs"><rect x="-2.1" y="-5" width="1.8" height="5.2" rx="0.9" fill="#3B4A5A"/><rect x="0.4" y="-5" width="1.8" height="5.2" rx="0.9" fill="#34424F"/></g>` +
        `<rect x="-3" y="-11.4" width="6" height="7.2" rx="2.6" fill="${shirt}"/>` +
        `<circle cx="0" cy="-14.3" r="2.9" fill="${skin}"/>` +
        `<path d="M-3,-14.6 a3,3 0 0 1 6,0 q-3,-1.2 -6,0 z" fill="${hair}"/>`;
    }
    const animalSVG = {
      dog: (c) => `<ellipse cx="0" cy="0.5" rx="4.5" ry="1.4" fill="rgba(0,0,0,0.2)"/><g class="ag-legs"><rect x="-3.5" y="-3" width="1.2" height="3" fill="${T(c, -0.3)}"/><rect x="2.3" y="-3" width="1.2" height="3" fill="${T(c, -0.3)}"/></g><rect x="-4.5" y="-6" width="9" height="3.6" rx="1.8" fill="${c}"/><circle cx="4.6" cy="-6.6" r="2.3" fill="${c}"/><path d="M-4.5,-5 l-2.2,-2.6" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/><circle cx="5.4" cy="-7" r="0.5" fill="#222"/>`,
      cat: (c) => `<ellipse cx="0" cy="0.5" rx="3.5" ry="1.1" fill="rgba(0,0,0,0.2)"/><ellipse cx="0" cy="-2.6" rx="3.4" ry="2.4" fill="${c}"/><circle cx="3" cy="-4.8" r="1.9" fill="${c}"/><path d="M2,-6.3 l0.5,-1.6 l0.9,1.3 M3.6,-6.4 l0.7,-1.5 l0.6,1.4" fill="${c}" stroke="${c}" stroke-width="0.6"/><path class="ag-tail" d="M-3.2,-2.6 q-3,-1 -2.2,-5" stroke="${c}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`,
      sheep: () => `<ellipse cx="0" cy="0.8" rx="6" ry="1.8" fill="rgba(0,0,0,0.18)"/><g class="ag-legs"><rect x="-3.4" y="-3" width="1.2" height="3.4" fill="#3B3B3B"/><rect x="2.2" y="-3" width="1.2" height="3.4" fill="#3B3B3B"/></g><circle cx="-2.6" cy="-5" r="3.2" fill="#FBF8F1"/><circle cx="1" cy="-5.8" r="3.4" fill="#FFFFFF"/><circle cx="3.4" cy="-4.6" r="2.6" fill="#F4EFE4"/><ellipse cx="5.6" cy="-5.4" rx="1.9" ry="1.6" fill="#3B3B3B"/>`,
      cow: () => `<ellipse cx="0" cy="0.8" rx="8" ry="2" fill="rgba(0,0,0,0.18)"/><g class="ag-legs"><rect x="-5" y="-3.4" width="1.6" height="3.8" fill="#4A3B33"/><rect x="3.4" y="-3.4" width="1.6" height="3.8" fill="#4A3B33"/></g><rect x="-6" y="-9" width="12" height="6" rx="2.6" fill="#FBF8F1"/><circle cx="-2" cy="-7" r="1.8" fill="#3B302A"/><circle cx="2.8" cy="-5.2" r="1.4" fill="#3B302A"/><rect x="5" y="-10" width="4.4" height="4" rx="1.6" fill="#FBF8F1"/><rect x="7.4" y="-7.6" width="2.4" height="1.8" rx="0.8" fill="#F2B6B0"/>`,
      duck: () => `<ellipse class="ripple" cx="0" cy="0.5" rx="6" ry="1.8" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.8"/><ellipse cx="0" cy="-1.4" rx="4" ry="2.2" fill="#FFFFFF"/><circle cx="3" cy="-4" r="1.8" fill="#FFFFFF"/><path d="M4.6,-4 l2,0.6 l-2,0.5 z" fill="#F2A541"/>`,
    };

    const FIRST = ["Sam", "Lebo", "Zara", "Theo", "Naledi", "Kai", "Amara", "Ravi", "Jess", "Sipho", "Mia", "Omar", "Lindiwe", "Ben", "Aisha", "Tumi", "Noah", "Priya", "Luca", "Thandi"];
    const CAR_COLS = ["#D9534F", "#3E7CB1", "#F2C14E", "#2A9D8F", "#F6EDDF", "#7E6BC4", "#E07B39", "#44545A", "#6DAE5B"];
    const SHIRTS = ["#2A9D8F", "#D9734E", "#3E7CB1", "#E9B949", "#C2577A", "#6DAE5B", "#7E6BC4", "#F08A4B", "#1F8FA3"];
    const SKIN = ["#F1C9A5", "#E0AC84", "#B9805A", "#8D5A3B", "#6B4128"];
    const HAIR = ["#2B1D14", "#4A2F1D", "#1A1A1A", "#8A5A2B", "#D8B26E", "#6B4A3A"];

    /* Creates the moving population and animates it. `bands` is an array of
       SVG <g> elements sorted by screen y; each agent is re-parented into the
       band matching its y so it depth-sorts against buildings. */
    function startLife(city, bands, bandY0, bandStep, onAgent) {
      const reduce = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();
      const rnd = Zs(ms("life") + city.isles.length);
      const pick = (arr) => arr[(rnd() * arr.length) | 0];
      const nodes = [...city.nodes.values()];
      const roadNodes = nodes.filter((n) => n.adj.size > 0);
      const agents = [];
      const mk = (html, extra) => {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("class", "agent");
        g.innerHTML = html;
        return g;
      };
      const place = (ag, x, y) => {
        ag.el.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)})`);
        let bi = Math.max(0, Math.min(bands.length - 1, Math.floor((y - bandY0) / bandStep)));
        if (ag.band !== bi) { bands[bi].appendChild(ag.el); ag.band = bi; }
      };
      const addRoadAgent = (type, speed, lane) => {
        const from = pick(roadNodes);
        const to = city.nodes.get(pick([...from.adj]));
        const ag = { type, speed, lane, from, to, t: rnd(), band: -1 };
        return ag;
      };
      // cars, vans and a bus
      const nCars = Math.min(34, Math.round(roadNodes.length * 0.55));
      for (let k = 0; k < nCars; k++) {
        const kind = k % 11 === 0 ? "bus" : k % 4 === 0 ? "van" : "car";
        const color = kind === "bus" ? "#E9B949" : pick(CAR_COLS);
        const ag = addRoadAgent("car", kind === "bus" ? 34 : 44 + rnd() * 18, 6.5);
        ag.kind = kind;
        ag.name = kind === "bus" ? "Island bus" : pick(FIRST) + "'s " + (kind === "van" ? "van" : "car");
        ag.el = mk(`<g data-d="a">${carSVG(color, "a", kind)}</g><g data-d="b" style="display:none">${carSVG(color, "b", kind)}</g>`);
        ag.da = ag.el.querySelector('[data-d="a"]'); ag.db = ag.el.querySelector('[data-d="b"]');
        agents.push(ag);
      }
      // pedestrians
      const nPeople = Math.min(46, Math.round(roadNodes.length * 0.8));
      for (let k = 0; k < nPeople; k++) {
        const ag = addRoadAgent("person", 11 + rnd() * 6, (rnd() < 0.5 ? -1 : 1) * 16.5);
        ag.name = pick(FIRST);
        ag.el = mk(personSVG(pick(SHIRTS), pick(SKIN), pick(HAIR)));
        agents.push(ag);
        if (k % 6 === 0) {
          // dog on a lead following its person
          const dog = { type: "follow", lead: ag, band: -1, name: ag.name + "'s dog", kind: "dog" };
          dog.el = mk(`<g class="flipper">${animalSVG.dog(pick(["#B98759", "#3B302A", "#E9D2A6", "#FFFFFF"]))}</g>`);
          dog.flip = dog.el.firstChild;
          agents.push(dog);
        }
      }
      // grazing / idle animals in parks and fields
      const idle = (kind, a, b, r, name, colour) => {
        const ag = { type: "wander", kind, home: { a, b }, r, pos: { a, b }, tgt: { a, b }, wait: rnd() * 4, speed: kind === "duck" ? 5 : kind === "cat" ? 9 : 4, band: -1, name };
        ag.el = mk(`<g class="flipper">${animalSVG[kind](colour)}</g>`);
        ag.flip = ag.el.firstChild;
        agents.push(ag);
      };
      city.ponds.forEach((p, n) => {
        idle("duck", p.a, p.b, 9, "Duck");
        if (n % 2 === 0) idle("duck", p.a + 4, p.b + 3, 9, "Duck");
      });
      city.pastures.forEach((p) => {
        idle("sheep", p.a - 15, p.b + 8, 20, "Sheep");
        idle("sheep", p.a + 10, p.b - 12, 20, "Sheep");
        idle("cow", p.a + 12, p.b + 16, 16, "Cow");
      });
      city.blocks.filter((k) => k.content === "park").forEach((k, n) => {
        idle("cat", k.a - 30, k.b + 30, 18, "Cat", pick(["#E07B39", "#3B3B3B", "#B9A58C"]));
        if (n % 2) idle("sheep", k.a - 32, k.b - 26, 12, "Sheep");
      });
      city.blocks.filter((k) => k.content.startsWith("fill:")).forEach((k, n) => {
        if (n % 2 === 0) idle("cat", k.a + 40, k.b + 44, 10, "Cat", pick(["#E07B39", "#3B3B3B", "#EDE3D1"]));
      });

      agents.forEach((ag, n) => {
        ag.id = "ag" + n;
        ag.task = null; // reserved: agents can be given jobs later
        ag.el.addEventListener("click", (e) => { e.stopPropagation(); onAgent && onAgent(ag); });
      });

      const roadPos = (ag) => {
        const { from, to } = ag;
        const L = Math.hypot(to.a - from.a, to.b - from.b) || 1;
        const da = (to.a - from.a) / L, db = (to.b - from.b) / L;
        // keep left (South African roads): left of travel is (db, -da)
        const a = from.a + (to.a - from.a) * ag.t + db * ag.lane;
        const b = from.b + (to.b - from.b) * ag.t - da * ag.lane;
        return { a, b, da, db, L };
      };
      const step = (dt) => {
        for (const ag of agents) {
          if (ag.type === "car" || ag.type === "person") {
            let p = roadPos(ag);
            ag.t += (ag.speed * dt) / p.L;
            if (ag.t >= 1) {
              const opts = [...ag.to.adj].filter((k) => k !== ag.from.k);
              const nxt = opts.length ? pick(opts) : ag.from.k;
              ag.from = ag.to; ag.to = city.nodes.get(nxt); ag.t = 0;
              p = roadPos(ag);
            }
            const [x, y] = scr(p.a, p.b);
            if (ag.type === "car") {
              const alongA = Math.abs(p.da) > Math.abs(p.db);
              if (ag.dir !== alongA) { ag.dir = alongA; ag.da.style.display = alongA ? "" : "none"; ag.db.style.display = alongA ? "none" : ""; }
            }
            ag.x = x; ag.y = y; ag.sdx = p.da - p.db;
            place(ag, x, y);
          } else if (ag.type === "follow") {
            const L0 = ag.lead;
            if (L0.x == null) continue;
            const dir = L0.sdx >= 0 ? 1 : -1;
            const x = L0.x - dir * 9, y = L0.y + 2;
            if (ag.f !== dir) { ag.f = dir; ag.flip.setAttribute("transform", dir < 0 ? "scale(-1,1)" : ""); }
            place(ag, x, y);
          } else {
            if (ag.wait > 0) { ag.wait -= dt; }
            else {
              const ea = ag.tgt.a - ag.pos.a, eb = ag.tgt.b - ag.pos.b, d = Math.hypot(ea, eb);
              if (d < 0.6) {
                ag.wait = 1.5 + rnd() * 5;
                const th = rnd() * Math.PI * 2, rr = rnd() * ag.r;
                ag.tgt = { a: ag.home.a + Math.cos(th) * rr, b: ag.home.b + Math.sin(th) * rr };
              } else {
                const s = Math.min(d, ag.speed * dt);
                ag.pos.a += (ea / d) * s; ag.pos.b += (eb / d) * s;
                const f = ea - eb >= 0 ? 1 : -1;
                if (ag.f !== f) { ag.f = f; ag.flip.setAttribute("transform", f < 0 ? "scale(-1,1)" : ""); }
              }
            }
            const [x, y] = scr(ag.pos.a, ag.pos.b);
            if (ag.x !== x || ag.y !== y) { ag.x = x; ag.y = y; place(ag, x, y); }
            ag.el.classList.toggle("still", ag.wait > 0);
          }
        }
      };
      step(0);
      let raf = 0, last = performance.now(), stopped = false;
      const loop = (now) => {
        if (stopped) return;
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        step(dt);
        raf = requestAnimationFrame(loop);
      };
      if (!reduce) raf = requestAnimationFrame(loop);
      return {
        agents,
        stop: () => { stopped = true; cancelAnimationFrame(raf); agents.forEach((a) => a.el.remove()); },
      };
    }

    return { layout, free, Ground, Lots, objects, Signs, startLife, P, RING };
  })();
