  /* ===================== Valley Isle · city layout =====================
   * Hand-placed islands of different sizes with wobbly coastlines. Each has
   * a winding loop road, a lane or cul-de-sac through the middle, and a few
   * building sites. Curved bridges join neighbours. Geometry is in iso
   * units (a, b); ye() projects to screen.
   */
  var City = (() => {
    const h = React.createElement;
    const TAU = Math.PI * 2;
    const L_ = (v) => Math.round(v * 10) / 10;
    const scr = (a, b, z = 0) => ye(a, b, z);
    const toIso = (X, Y) => [Y + X / 2, Y - X / 2];

    /* x,y are screen positions; size scales the island */
    const CORE = [
      { id: "home", name: "Home Isle", x: 0, y: 0, size: 1.12, color: "#6DAE5B",
        sites: ["plaza", "personal", "park", "cs:Town hall"] },
      { id: "eng", name: "Engineering Isle", x: -840, y: -250, size: 1.0, color: "#3E7CB1",
        sites: ["epcm", "freelance", "cs:Research lab"] },
      { id: "maker", name: "Maker Isle", x: 690, y: -410, size: 0.9, color: "#2A9D8F",
        sites: ["bynode", "wood", "cs:Robotics bay"] },
      { id: "harbour", name: "Harbour Isle", x: 860, y: 290, size: 1.05, color: "#1F7A8C",
        sites: ["coffee", "hub", "fill:house"], port: true },
      { id: "media", name: "Media Isle", x: -770, y: 430, size: 0.88, color: "#E0474C",
        sites: ["youtube", "park", "cs:Sound stage"] },
      { id: "well", name: "Wellness Isle", x: 60, y: 710, size: 0.98, color: "#F08A4B",
        sites: ["fitness", "field", "park"] },
    ];
    const LIGHT = { id: "light", name: "Lighthouse Point", x: 1470, y: -110, small: true, color: "#E9B949" };
    const LINKS = [["home", "eng"], ["home", "maker"], ["home", "harbour"], ["home", "media"], ["home", "well"],
      ["harbour", "well"], ["media", "well"], ["harbour", "light"], ["maker", "light"]];
    const FRONTIER = [[-90, -700], [-1620, 60], [-1330, -800], [-900, 1080], [1260, -980], [-1780, 760], [1420, 1060], [2100, 350]];
    const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    const frontierPos = (k) => {
      if (k < FRONTIER.length) return FRONTIER[k];
      const t = k - FRONTIER.length, r = 1900 + Math.floor(t / 8) * 700, th = (t % 8) / 8 * TAU + 0.3;
      return [Math.cos(th) * r * 1.3, Math.sin(th) * r * 0.7];
    };

    /* sample a quadratic curve between two iso points with a sideways bulge */
    const curve = (p0, p1, bulge, n = 14) => {
      const ma = (p0[0] + p1[0]) / 2, mb = (p0[1] + p1[1]) / 2;
      const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
      const ca = ma - ((p1[1] - p0[1]) / L) * bulge, cb = mb + ((p1[0] - p0[0]) / L) * bulge;
      const out = [];
      for (let k = 0; k <= n; k++) {
        const t = k / n, u = 1 - t;
        out.push([u * u * p0[0] + 2 * u * t * ca + t * t * p1[0], u * u * p0[1] + 2 * u * t * cb + t * t * p1[1]]);
      }
      out[0] = p0; out[n] = p1;
      return out;
    };

    /* ---------- layout ---------- */
    const CS_KIND = { "Town hall": "office", "Research lab": "office", "Robotics bay": "shop", "Sound stage": "tower" };
    function layout(nSections, nBuilt = 0) {
      let csIdx = 0;
      const nFrontier = Math.floor(nSections / 4) + 1;
      const isles = CORE.map((c) => ({ ...c, sites: [...c.sites] }));
      for (let k = 0; k < nFrontier; k++) {
        const [x, y] = frontierPos(k);
        const sites = [0, 1, 2, 3].map((n) => {
          const slot = k * 4 + n;
          return slot < nSections ? "slot:" + slot : "free:" + slot;
        });
        isles.push({ id: "fr" + k, name: "Frontier Isle " + (ROMAN[k] || k + 1), x, y, size: 1.04, color: "#9A8F7A", frontier: true, sites });
      }
      const all = [...isles, LIGHT];
      const byId = Object.fromEntries(all.map((s) => [s.id, s]));

      const plots = {}, blocks = [], nodes = new Map(), paths = [], bridges = [], blobs = [],
        lamps = [], signs = [], ponds = [], pastures = [], roundabouts = [];
      const key = (p) => Math.round(p[0]) + "," + Math.round(p[1]);
      const addNode = (p) => {
        const k = key(p);
        if (!nodes.has(k)) nodes.set(k, { a: p[0], b: p[1], k, adj: new Set() });
        return nodes.get(k);
      };
      // a road is a polyline; every vertex is a graph node so traffic follows curves
      const road = (pts, kind = "road") => {
        for (let n = 0; n < pts.length - 1; n++) {
          const n0 = addNode(pts[n]), n1 = addNode(pts[n + 1]);
          if (n0 === n1) continue;
          n0.adj.add(n1.k); n1.adj.add(n0.k);
        }
        paths.push({ pts, kind });
      };

      all.forEach((s) => {
        const rnd = Zs(ms("isle-" + s.id));
        const [ca, cb] = toIso(s.x, s.y);
        s.ca = ca; s.cb = cb;
        if (s.small) {
          s.landR = 125;
          [[0, 0, 190], [-40, 30, 150], [50, -20, 140], [10, 55, 120]].forEach(([da, db, r], n) => {
            const [x, y] = scr(ca + da, cb + db);
            blobs.push({ id: "b" + s.id + n, x, y, r });
          });
          const [lx, ly] = scr(ca - 5, cb - 25);
          plots.goals = { x: lx, y: ly, r: 160 };
          s.loop = [[ca + 10, cb + 55]];
          s.nodes = [[ca + 10, cb + 55]];
          road(curve([ca + 10, cb + 55], [ca + 5, cb + 22], 6, 3), "lane");
          signs.push({ x: s.x, y: s.y + 118, name: s.name, color: s.color });
          return;
        }
        const n = s.sites.length;
        const spin = rnd() * TAU;
        const sr = (n >= 4 ? 118 : 104) * s.size;
        const loopR = sr + 108 * s.size;
        s.landR = loopR + 62;
        // coastline: blobs round a wobbly ring plus a couple of headlands
        const wob = (th) => 1 + 0.07 * Math.sin(2 * th + spin * 3) + 0.05 * Math.sin(3 * th + spin);
        for (let k = 0; k < 12; k++) {
          const th = (k / 12) * TAU + rnd() * 0.35;
          const rr = loopR * (0.66 + rnd() * 0.22) * wob(th);
          const [x, y] = scr(ca + Math.cos(th) * rr, cb + Math.sin(th) * rr);
          blobs.push({ id: "b" + s.id + "o" + k, x, y, r: (165 + rnd() * 105) * s.size });
        }
        for (let k = 0; k < 5; k++) {
          const th = (k / 5) * TAU + spin;
          const [x, y] = scr(ca + Math.cos(th) * loopR * 0.35, cb + Math.sin(th) * loopR * 0.35);
          blobs.push({ id: "b" + s.id + "i" + k, x, y, r: 230 * s.size });
        }
        for (let k = 0; k < 3 + ((rnd() * 3) | 0); k++) {
          const th = rnd() * TAU;
          const rr = loopR * (1.0 + rnd() * 0.3);
          const [x, y] = scr(ca + Math.cos(th) * rr, cb + Math.sin(th) * rr);
          blobs.push({ id: "b" + s.id + "h" + k, x, y, r: 120 + rnd() * 60 });
        }
        // Ring road traced from the real coastline, inset so it stays on land
        const mine = blobs.filter((d) => d.id.startsWith("b" + s.id));
        const fieldAt = (a, b) => {
          const [X, Y] = scr(a, b);
          let f = 0;
          for (const d of mine) {
            const u = (X - d.x) / d.r, v = (Y - d.y) / (d.r * 0.5), N = u * u + v * v;
            if (N < 1) f += (1 - N) * (1 - N);
          }
          return f;
        };
        const M = 48, minR = sr + 90 * s.size;
        const angle = (k) => (k / M) * TAU + spin;
        const coastAt = (th) => {
          let r = 40;
          while (r < 700 && fieldAt(ca + Math.cos(th) * r, cb + Math.sin(th) * r) > 0.74) r += 4;
          return r;
        };
        let coast = Array.from({ length: M }, (_, k) => coastAt(angle(k)));
        // widen any narrow waist so the ring clears the buildings
        coast.forEach((r, k) => {
          if (r - 34 < minR) {
            const th = angle(k), rr = minR + 10;
            const [x, y] = scr(ca + Math.cos(th) * rr, cb + Math.sin(th) * rr);
            const d = { id: "b" + s.id + "w" + k, x, y, r: 175 };
            blobs.push(d); mine.push(d);
          }
        });
        coast = Array.from({ length: M }, (_, k) => coastAt(angle(k)));
        const raw = coast.map((r) => Math.max(minR, r - 34));
        let rad = [...raw];
        for (let pass = 0; pass < 4; pass++)
          rad = rad.map((r, k) => Math.min(raw[k], (rad[(k + M - 1) % M] + 2 * r + rad[(k + 1) % M]) / 4));
        s.landR = coast.reduce((x, y) => x + y, 0) / M;
        s.coastAt = coastAt;
        s.coastMax = Math.max(...coast.filter((_, k) => Math.sin(angle(k) + Math.PI / 4) > 0.5));
        const loop = rad.map((r, k) => [ca + Math.cos(angle(k)) * r, cb + Math.sin(angle(k)) * r]);
        s.loop = loop;
        s.nodes = [];
        for (let k = 0; k < M; k += 4) s.nodes.push(loop[k]);
        road([...loop, loop[0]]);
        // sites: one per block between the spokes
        const siteTh = [];
        for (let k = 0; k < n; k++) {
          const th = spin + (k + 0.5) * (TAU / n) + (rnd() - 0.5) * 0.14;
          siteTh.push(th);
          const rr = sr * (0.97 + rnd() * 0.06);
          const a = ca + Math.cos(th) * rr, b = cb + Math.sin(th) * rr;
          const [x, y] = scr(a, b);
          let content = s.sites[k], cs = -1;
          if (content.startsWith("cs:")) {
            cs = csIdx++;
            if (cs < nBuilt) content = "fill:" + (CS_KIND[content.slice(3)] || "house");
          }
          blocks.push({ id: s.id + ":" + k, isle: s, a, b, x, y, content, cs, wob: rnd() * TAU });
          if (content === "park") ponds.push({ a: a + 18, b: b - 12 });
          if (content === "field") pastures.push({ a, b });
          if (!content.includes(":") && content !== "park" && content !== "field") plots[content] = { x, y, r: 200 };
          if (content.startsWith("slot:")) plots[content] = { x, y, r: 200 };
        }
        // spokes from the ring to a small central roundabout: every block has road on all sides
        const RB = 26, ring = [];
        for (let k = 0; k < 12; k++) ring.push([ca + Math.cos(spin + (k / 12) * TAU) * RB, cb + Math.sin(spin + (k / 12) * TAU) * RB]);
        road([...ring, ring[0]], "lane");
        roundabouts.push([ca, cb]);
        for (let j = 0; j < n; j++) {
          road(curve(loop[(j * M) / n], ring[(j * 12) / n], (rnd() - 0.5) * 12, 8), "lane");
        }
        loop.forEach((p, k) => {
          if (k % 8 !== 2) return;
          const th = angle(k);
          lamps.push({ a: p[0] - Math.cos(th) * 25, b: p[1] - Math.sin(th) * 25 });
        });
        signs.push({ x: s.x, y: s.y + s.coastMax * 0.7 + 34, name: s.name, color: s.color });
        s.siteTh = siteTh;
      });

      // Harbour: the port sits on the east shore with a pier out to sea
      {
        const hb = isles.find((s) => s.id === "harbour");
        const th = 0.28; // mostly +a (screen down-right)
        const cr = hb.coastAt(th) + 6, qa = hb.ca + Math.cos(th) * cr, qb = hb.cb + Math.sin(th) * cr;
        const [x, y] = scr(qa, qb);
        plots.port = { x, y, r: 130 };
        [[-40, 0, 150], [-20, 50, 130], [-60, -40, 130]].forEach(([da, db, r], n) => {
          const [bx, by] = scr(qa + da, qb + db);
          blobs.push({ id: "quay" + n, x: bx, y: by, r });
        });
        const lp = hb.loop.reduce((best, p) => (Math.hypot(p[0] - qa, p[1] - qb) < Math.hypot(best[0] - qa, best[1] - qb) ? p : best));
        road(curve(lp, [qa - 70, qb - 6], 10, 5), "lane");
      }

      // Bridges: from the loop node facing the neighbour, a gentle arc across
      const facing = (s, t) => {
        const pool = s.small ? s.nodes : s.nodes;
        return pool.reduce((best, p) => (Math.hypot(p[0] - t.ca, p[1] - t.cb) < Math.hypot(best[0] - t.ca, best[1] - t.cb) ? p : best));
      };
      const bridge = (s, t, n) => {
        const p0 = facing(s, t), p1 = facing(t, s);
        const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        const pts = curve(p0, p1, (n % 2 ? 1 : -1) * L * 0.08, Math.max(12, Math.round(L / 22)));
        road(pts, "bridge");
        // water span = points outside both coastlines
        const fAll = (p) => {
          const [X, Y] = scr(p[0], p[1]);
          let f = 0;
          for (const d of blobs) {
            const u = (X - d.x) / d.r, v = (Y - d.y) / (d.r * 0.5), N = u * u + v * v;
            if (N < 1) f += (1 - N) * (1 - N);
          }
          return f;
        };
        let i0 = pts.findIndex((p) => fAll(p) < 0.6), i1 = pts.length - 1 - [...pts].reverse().findIndex((p) => fAll(p) < 0.6);
        const wet = i0 >= 0 ? pts.slice(Math.max(0, i0 - 1), Math.min(pts.length, i1 + 2)) : [];
        if (wet.length > 1) bridges.push({ pts: wet });
      };
      LINKS.forEach(([x, y], n) => bridge(byId[x], byId[y], n));
      isles.filter((s) => s.frontier).forEach((s, n) => {
        const t = [...all].filter((x) => x !== s && !x.small && (!x.frontier || x.id < s.id))
          .sort((p, q) => Math.hypot(p.ca - s.ca, p.cb - s.cb) - Math.hypot(q.ca - s.ca, q.cb - s.cb))[0];
        t && bridge(s, t, n + 1);
      });

      return { isles, blocks, plots, nodes, paths, bridges, blobs, lamps, signs, ponds, pastures, roundabouts };
    }

    /* scatter test: is a screen point clear of roads and building sites? */
    function free(city, X, Y, pad = 10) {
      const [a, b] = toIso(X, Y);
      for (const r of city.paths) {
        const lim = (r.kind === "lane" ? 15 : 20) + pad;
        const p = r.pts;
        for (let n = 0; n < p.length - 1; n++) {
          const [a0, b0] = p[n], [a1, b1] = p[n + 1];
          const da = a1 - a0, db = b1 - b0, L2 = da * da + db * db || 1;
          const t = Math.max(0, Math.min(1, ((a - a0) * da + (b - b0) * db) / L2));
          if (Math.hypot(a - a0 - da * t, b - b0 - db * t) < lim) return false;
        }
      }
      for (const c of city.roundabouts) if (Math.hypot(a - c[0], b - c[1]) < 42 + pad) return false;
      for (const k of city.blocks) {
        const da = a - k.a, db = b - k.b;
        if (Math.hypot(da, db) < 70 + pad) {
          if (k.content !== "park") return false;
          if (Math.abs(da) < 9 || Math.abs(db) < 9) return false;
          if (((da - 18) / 30) ** 2 + ((db + 12) / 22) ** 2 < 1) return false;
        }
      }
      const pp = city.plots.port;
      if (pp) {
        const [pa, pb] = toIso(pp.x, pp.y);
        if (a > pa - 80 && a < pa + 200 && b > pb - 60 && b < pb + 60) return false;
      }
      const g = city.plots.goals;
      if (g && Math.hypot(X - g.x, (Y - g.y) * 2) < 110) return false;
      return true;
    }

    /* ---------- ground drawing ---------- */
    const pathD = (pts, z = 0) => pts.map((p, n) => {
      const [x, y] = scr(p[0], p[1], z);
      return (n ? "L" : "M") + L_(x) + "," + L_(y);
    }).join("");
    // offset a screen polyline sideways (for bridge railings)
    const offsetD = (pts, off, z) => {
      const s = pts.map((p) => scr(p[0], p[1], z));
      return s.map((p, n) => {
        const q0 = s[Math.max(0, n - 1)], q1 = s[Math.min(s.length - 1, n + 1)];
        const dx = q1[0] - q0[0], dy = q1[1] - q0[1], L = Math.hypot(dx, dy) || 1;
        return (n ? "L" : "M") + L_(p[0] - (dy / L) * off) + "," + L_(p[1] + (dx / L) * off);
      }).join("");
    };
    const quad = (a0, b0, a1, b1, w, z = 0) => {
      const L = Math.hypot(a1 - a0, b1 - b0) || 1, da = (a1 - a0) / L, db = (b1 - b0) / L, pa = -db * w / 2, pb = da * w / 2;
      return J([[a0 + pa, b0 + pb, z], [a1 + pa, b1 + pb, z], [a1 - pa, b1 - pb, z], [a0 - pa, b0 - pb, z]]);
    };

    function Ground({ city }) {
      const land = city.paths;
      const d = land.map((r) => pathD(r.pts));
      const wide = land.map((r) => r.kind !== "lane");
      return h("g", { className: "roads", pointerEvents: "none", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" },
        d.map((p, n) => h("path", { key: "c" + n, d: p, stroke: "#C4B597", strokeWidth: wide[n] ? 40 : 30 })),
        d.map((p, n) => h("path", { key: "s" + n, d: p, stroke: "#DCD0B8", strokeWidth: wide[n] ? 37 : 27 })),
        d.map((p, n) => h("path", { key: "t" + n, d: p, stroke: wide[n] ? "#5F6B72" : "#6E797F", strokeWidth: wide[n] ? 25 : 17 })),
        city.roundabouts.map((c, n) => h(Nt, { key: "rbi" + n, x: c[0], y: c[1], z: 0.4, a: 14, b: 14, fill: "#8CC27A", stroke: "#DCD0B8", sw: 3 })),
        d.map((p, n) => wide[n] && h("path", { key: "m" + n, d: p, stroke: "#F3E3B3", strokeWidth: 1.3, strokeDasharray: "8 9" })),
        city.bridges.map((br, n) => h(Bridge, { key: "br" + n, br })),
      );
    }

    function Bridge({ br }) {
      const p = br.pts;
      const piers = [];
      for (let n = 2; n < p.length - 1; n += 3) {
        const [x, y] = scr(p[n][0], p[n][1], 0);
        piers.push(h("g", { key: n },
          h("rect", { x: L_(x - 7), y: L_(y + 2), width: 14, height: 12, rx: 2, fill: "#A89A84" }),
          h("ellipse", { className: "ripple", cx: L_(x), cy: L_(y + 14), rx: 12, ry: 3.2, fill: "none", stroke: "rgba(255,255,255,0.6)", strokeWidth: 1 })));
      }
      const deck = pathD(p, 4);
      return h("g", null,
        h("path", { d: pathD(p, 0), stroke: "rgba(8,60,70,0.28)", strokeWidth: 44, transform: "translate(8,12)" }),
        piers,
        h("path", { d: pathD(p, 0), stroke: "#A8977B", strokeWidth: 40 }),
        h("path", { d: deck, stroke: "#B7A27E", strokeWidth: 40 }),
        h("path", { d: deck, stroke: "#E3D6BD", strokeWidth: 37 }),
        h("path", { d: deck, stroke: "#6A757B", strokeWidth: 25 }),
        h("path", { d: deck, stroke: "#F3E3B3", strokeWidth: 1.3, strokeDasharray: "8 9" }),
        [-17, 17].map((o) => h("g", { key: o },
          h("path", { d: offsetD(p, o, 12), stroke: "#F6EDDF", strokeWidth: 2.2 }),
          h("path", { d: offsetD(p, o, 8), stroke: "#8A6F4E", strokeWidth: 8, strokeDasharray: "1.6 12", opacity: 0.8 }))),
      );
    }

    /* organic lots under each site */
    const blobPts = (a, b, r, wob, z) => {
      const out = [];
      for (let k = 0; k < 28; k++) {
        const th = (k / 28) * TAU;
        const rr = r * (1 + 0.06 * Math.sin(3 * th + wob) + 0.04 * Math.sin(5 * th + wob * 2));
        out.push([a + Math.cos(th) * rr, b + Math.sin(th) * rr, z]);
      }
      return J(out);
    };
    function Lots({ city }) {
      return h("g", { pointerEvents: "none" }, city.blocks.map((k) => {
        const ct = k.content;
        let fill = "#A3D08B", stroke = "#86BB70";
        if (ct.startsWith("cs:") || ct.startsWith("free:")) { fill = "#CFAE7F"; stroke = "#B38F5E"; }
        else if (ct === "plaza") { fill = "#E7D8BC"; stroke = "#CDB892"; }
        else if (ct === "park") { fill = "#88C174"; stroke = "#6FA85C"; }
        else if (ct === "field") { fill = "#7DBA6A"; stroke = "#6AA658"; }
        return h("g", { key: k.id },
          h("polygon", { points: blobPts(k.a, k.b, 66, k.wob, 0.1), fill, stroke, strokeWidth: 1.4 }),
          ct === "park" && h(ParkGround, { a: k.a, b: k.b }),
          ct === "field" && h(FieldGround, { a: k.a, b: k.b }),
        );
      }));
    }
    function ParkGround({ a, b }) {
      const path = (p) => h("path", { d: pathD(p), stroke: "#E8D9B8", strokeWidth: 8, fill: "none", strokeLinecap: "round" });
      return h("g", null,
        path(curve([a - 58, b + 10], [a + 50, b - 20], 22, 10)),
        path(curve([a - 10, b - 58], [a + 8, b + 56], -18, 10)),
        h(Nt, { x: a + 18, y: b - 12, z: 0.3, a: 26, b: 18, fill: "#D9C9A4" }),
        h(Nt, { x: a + 18, y: b - 12, z: 0.35, a: 22, b: 15, fill: "#5CC4CC", stroke: "#8FDCE0", sw: 1.2 }),
        h(Nt, { x: a + 22, y: b - 14, z: 0.4, a: 8, b: 4, fill: "none", stroke: "rgba(255,255,255,0.7)", sw: 1 }),
      );
    }
    function FieldGround({ a, b }) {
      return h("g", null,
        h(Nt, { x: a, y: b, z: 0.2, a: 58, b: 50, fill: "#D9734E", stroke: "#B85C3C", sw: 1 }),
        h(Nt, { x: a, y: b, z: 0.25, a: 48, b: 40, fill: "#7DBA6A" }),
        h("polygon", { points: J([[a - 30, b - 30, 0.3], [a + 30, b - 30, 0.3], [a + 30, b + 30, 0.3], [a - 30, b + 30, 0.3]]), fill: "#8CC878", stroke: "#F6F2E6", strokeWidth: 1.2 }),
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
          h("polygon", { points: blobPts(0, 0, 40, 1, 6), fill: "none", stroke: "#E9DDC8", strokeWidth: 1, strokeDasharray: "4 3" }),
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


    return { layout, free, Ground, Lots, objects, Signs, startLife };
  })();
