  /* ===================== simulation: traffic, pedestrians, animals, boats, crew ===================== */
  const CYCLE = 26;
  /* light state for roads along `axis` at node n */
  function lightFor(n, axis, t) {
    const p = (t + n.id * 3.7) % CYCLE;
    const ph = axis === "a" ? p : (p + 13) % CYCLE;
    return ph < 10 ? "g" : ph < 12.5 ? "y" : "r";
  }
  const perpW = (n, e) => (n.rb ? RB_R * 2 : e.axis === "a" ? n.wa : n.wb);
  const cutAt = (n, e) => (n.rb ? RB_R + 22 : n.bend ? RC : perpW(n, e) / 2 + 17);
  const bez = (p0, c, p1, n = 12) => { const out = []; for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t; out.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]); } return out; };
  const withLen = (pts) => { const cum = [0]; for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; };
  const along = (path, u) => {
    const { pts, cum } = path;
    let k = 1; while (k < cum.length - 1 && cum[k] < u) k++;
    const t = clamp((u - cum[k - 1]) / (cum[k] - cum[k - 1] || 1), 0, 1);
    const a = lerp(pts[k - 1][0], pts[k][0], t), b = lerp(pts[k - 1][1], pts[k][1], t);
    const ha = pts[k][0] - pts[k - 1][0], hb = pts[k][1] - pts[k - 1][1], L = Math.hypot(ha, hb) || 1;
    return { a, b, ha: ha / L, hb: hb / L };
  };

  function createSim(T, opts = {}) {
    const R = rng(hash("sim") + T.objs.length);
    const pick = (arr) => arr[(R() * arr.length) | 0];
    const S = { t: 0, cars: [], peds: [], animals: [], boats: [], gulls: [], dolphins: [], crew: new Map(), T };
    const laneOff = (e) => e.w / 4;
    const startNode = (c) => (c.dir > 0 ? c.e.n0 : c.e.n1);
    const endNode = (c) => (c.dir > 0 ? c.e.n1 : c.e.n0);
    const head = (c) => [c.e.da * c.dir, c.e.db * c.dir];
    const lanePos = (c, s) => {
      const n = startNode(c), [ha, hb] = head(c), lo = laneOff(c.e);
      return [n.a + ha * s + hb * lo, n.b + hb * s - ha * lo];
    };

    /* ---- cars ---- */
    const CAR_COLS = ["#D9534F", "#3E7CB1", "#F2C14E", "#2A9D8F", "#F6EDDF", "#7E6BC4", "#E07B39", "#44545A", "#6DAE5B", "#C2577A", "#1F3A5F"];
    const spawnable = T.edges.filter((e) => !e.bridge && e.len > 150);
    const nCars = opts.cars || 30;
    for (let k = 0; k < nCars; k++) {
      const kind = k === 0 || k === 13 ? "bus" : k % 9 === 4 ? "truck" : k % 5 === 1 ? "van" : k % 4 === 2 ? "bakkie" : k % 3 ? "hatch" : "sedan";
      const e = spawnable[k % spawnable.length], dir = R() < 0.5 ? 1 : -1;
      const V = VEHICLES[kind];
      const c = { id: "car" + k, kind, color: kind === "bus" ? "#F2C14E" : kind === "truck" ? pick(["#2A9D8F", "#3E7CB1", "#E0474C"]) : pick(CAR_COLS), e, dir, s: 0, v: 0, L: V.L, vmax: kind === "bus" || kind === "truck" ? 34 : 44 + R() * 12, mode: "lane", wheel: 0, name: kind === "bus" ? "Island bus" : kind === "truck" ? "Delivery truck" : "Car" };
      const cs = cutAt(startNode(c), e), ce = e.len - cutAt(endNode(c), e);
      c.s = lerp(cs, ce, (k * 0.37) % 1 * 0.8 + 0.1);
      S.cars.push(c);
    }
    const chooseNext = (c) => {
      const n = endNode(c);
      let opts2 = n.edges.filter((e) => e !== c.e);
      if (!opts2.length) opts2 = [c.e];
      const [ha, hb] = head(c);
      const straight = opts2.find((e) => { const d = e.n0 === n ? 1 : -1; return e.da * d * ha + e.db * d * hb > 0.9; });
      const e2 = straight && R() < 0.45 ? straight : pick(opts2);
      return { e: e2, dir: e2.n0 === n ? 1 : -1 };
    };
    const buildTurn = (c, nx) => {
      const n = endNode(c), e1 = c.e;
      const sEnd = e1.len - cutAt(n, e1);
      const S0 = lanePos(c, sEnd);
      const tmp = { e: nx.e, dir: nx.dir };
      const sStart = cutAt(n, nx.e);
      const X = lanePos(tmp, sStart);
      const [h1a, h1b] = head(c), [h2a, h2b] = head(tmp);
      if (n.rb) {
        const rr = RB_R;
        let t0 = Math.atan2(S0[1] - n.b, S0[0] - n.a) + 0.55, t1 = Math.atan2(X[1] - n.b, X[0] - n.a) - 0.55;
        while (t1 < t0 + 0.3) t1 += TAU;
        const pts = [S0];
        for (let k = 0; k <= 16; k++) { const t = lerp(t0, t1, k / 16); pts.push([n.a + Math.cos(t) * rr, n.b + Math.sin(t) * rr]); }
        pts.push(X);
        return { ...withLen(pts), rb: n, t0 };
      }
      const det = h1a * -h2b - h1b * -h2a;
      let C;
      if (Math.abs(det) < 1e-3) C = [(S0[0] + X[0]) / 2, (S0[1] + X[1]) / 2];
      else { const dx = X[0] - S0[0], dy = X[1] - S0[1]; const t = (dx * -h2b - dy * -h2a) / det; C = [S0[0] + h1a * t, S0[1] + h1b * t]; }
      return withLen(bez(S0, C, X, 12));
    };
    const posOf = (c) => {
      if (c.mode === "lane") { const [a, b] = lanePos(c, c.s); const [ha, hb] = head(c); return { a, b, ha, hb }; }
      return along(c.turn, c.u);
    };
    const mayEnter = (c) => {
      const n = endNode(c);
      if (n.signal) {
        const st = lightFor(n, c.e.axis, S.t);
        if (st === "r") return false;
        if (st === "y") return c.v > 20 && (c.e.len - cutAt(n, c.e) - c.s) < 10;
      }
      if (n.rb) {
        const tin = Math.atan2(lanePos(c, c.e.len - cutAt(n, c.e))[1] - n.b, lanePos(c, c.e.len - cutAt(n, c.e))[0] - n.a) + 0.55;
        for (const o of S.cars) if (o !== c && o.mode === "turn" && o.turn.rb === n) {
          const p = along(o.turn, o.u), ang = Math.atan2(p.b - n.b, p.a - n.a);
          const dth = ((tin - ang) % TAU + TAU) % TAU;
          if (dth < 1.4 || Math.hypot(p.a - n.a, p.b - n.b) > RB_R) return false;
        }
      } else if (!n.signal) {
        for (const o of S.cars) if (o !== c && (o.claim === n || (o.mode === "turn" && o.turnNode === n)) && (o.fromE || o.e) !== c.e) return false;
      }
      // don't block the box: the exit lane must have room
      const nx = c.next, sIn = cutAt(n, nx.e);
      for (const o of S.cars) if (o !== c && o.mode === "lane" && o.e === nx.e && o.dir === nx.dir && o.s < sIn + o.L / 2 + c.L + 8) return false;
      // pedestrians on the crossings we are about to pass
      const cr = [...c.e.crossings.filter((x) => x.node === n), ...c.next.e.crossings.filter((x) => x.node === n)];
      if (cr.some((x) => x.peds > 0)) return false;
      return true;
    };
    function stepCars(dt) {
      const P = S.cars.map((c) => ({ c, ...posOf(c) }));
      P.forEach((p) => { p.c.pos = p; });
      for (const p of P) {
        const c = p.c;
        let target = c.vmax * (c.e.main ? 1.1 : 1);
        if (c.mode === "turn") target = Math.min(target, c.turn.rb ? 26 : 22);
        // car ahead
        for (const q of P) {
          if (q === p) continue;
          const da = q.a - p.a, db = q.b - p.b;
          const fwd = da * p.ha + db * p.hb;
          if (fwd <= 0 || fwd > 60) continue;
          const lat = Math.abs(da * p.hb - db * p.ha);
          if (lat > 6.5) continue;
          // two cars sharing a junction: the lower id has right of way
          if (c.mode === "turn" && q.c.mode === "turn" && q.c.turnNode === c.turnNode && q.c.id > c.id) continue;
          if (c.mode === "turn" && q.c.claim === c.turnNode && q.c.mode === "lane") continue;
          const gap = fwd - (c.L + q.c.L) / 2;
          target = Math.min(target, Math.max(0, (gap - 5) * 1.6));
        }
        // pedestrians in front (crossings)
        for (const w of S.peds) {
          if (!w.onCross || w.hidden) continue;
          const da = w.a - p.a, db = w.b - p.b, fwd = da * p.ha + db * p.hb;
          if (fwd > 0 && fwd < 34 && Math.abs(da * p.hb - db * p.ha) < 14) target = Math.min(target, Math.max(0, (fwd - c.L / 2 - 6) * 1.5));
        }
        if (c.mode === "lane") {
          const n = endNode(c), sEnd = c.e.len - cutAt(n, c.e);
          if (!c.next && sEnd - c.s < 90) c.next = chooseNext(c);
          if (c.next && sEnd - c.s < 70) {
            if (!c.granted) {
              if (mayEnter(c)) { c.granted = true; c.claim = n; }
              else target = Math.min(target, Math.max(0, (sEnd - c.s - c.L / 2 - 2) * 1.6));
            }
          }
          c.v += clamp(target - c.v, -90 * dt, 28 * dt);
          c.s += c.v * dt;
          if (c.s >= sEnd && c.next && c.granted) {
            c.turn = buildTurn(c, c.next); c.u = c.s - sEnd; c.mode = "turn"; c.turnNode = n; c.fromE = c.e;
          } else if (c.s >= sEnd) c.s = sEnd;
        } else {
          c.v += clamp(target - c.v, -90 * dt, 28 * dt);
          c.u += c.v * dt;
          if (c.u >= c.turn.len) {
            const nx = c.next; c.e = nx.e; c.dir = nx.dir; c.s = cutAt(startNode(c), c.e) + (c.u - c.turn.len); c.mode = "lane"; c.next = null; c.granted = false; c.turn = null; c.turnNode = null; c.claim = null; c.fromE = null;
          }
        }
        c.wheel += (c.v * dt) / 2.6;
      }
      S.cars.forEach((c) => { const p = posOf(c); c.a = p.a; c.b = p.b; c.yaw = Math.atan2(p.hb, p.ha); });
    }

    /* ---- pedestrians ---- */
    const PN = T.peds.nodes;
    const doors = PN.filter((n) => n.door && n.tag === "step");
    const ringNodes = PN.filter((n) => n.tag !== "step");
    function route(from, to) {
      const dist = new Float64Array(PN.length).fill(Infinity), prev = new Int32Array(PN.length).fill(-1), prevE = new Array(PN.length);
      dist[from.id] = 0;
      const heap = [[0, from.id]];
      while (heap.length) {
        let bi = 0; for (let k = 1; k < heap.length; k++) if (heap[k][0] < heap[bi][0]) bi = k;
        const [d, id] = heap[bi]; heap[bi] = heap[heap.length - 1]; heap.pop();
        if (d > dist[id]) continue;
        if (id === to.id) break;
        for (const { n, e } of PN[id].adj) {
          if (n.tag === "step" && n !== to) continue; // never walk through buildings
          const nd = d + e.L + (e.crossing ? 12 : 0);
          if (nd < dist[n.id]) { dist[n.id] = nd; prev[n.id] = id; prevE[n.id] = e; heap.push([nd, n.id]); }
        }
      }
      if (prev[to.id] < 0 && from !== to) return null;
      const path = []; let id = to.id;
      while (id !== from.id && id >= 0) { path.push({ n: PN[id], e: prevE[id] }); id = prev[id]; }
      return path.reverse();
    }
    const newTrip = (w) => {
      const from = w.node;
      let to;
      if (w.crew) to = w.crew.target || pick(ringNodes);
      else to = !w.dog && R() < 0.55 ? pick(doors) : pick(ringNodes);
      const p = route(from, to);
      w.path = p && p.length ? p : null; w.i = 0; w.segT = 0;
      if (!w.path) w.wait = 1 + R() * 3;
    };
    const nPeds = opts.peds || 56;
    for (let k = 0; k < nPeds; k++) {
      const n = pick(ringNodes);
      const w = { id: "p" + k, look: randomLook(R), node: n, a: n.a, b: n.b, speed: 12 + R() * 7, phase: R() * TAU, wait: R() * 2, name: pick(["Sam", "Lebo", "Zara", "Theo", "Naledi", "Kai", "Amara", "Ravi", "Jess", "Sipho", "Mia", "Omar", "Lindiwe", "Ben", "Aisha", "Tumi", "Noah", "Priya", "Luca", "Thandi"]) };
      if (k % 7 === 0) { w.dog = { col: pick(["#B98759", "#3B302A", "#E9D2A6", "#FFFFFF", "#C8955E"]), trail: [] }; }
      S.peds.push(w);
    }
    const canCross = (w, e) => {
      const c = e.crossing;
      if (!c) return true;
      const n = c.node;
      if (n.signal) return lightFor(n, c.e.axis, S.t) === "r" && lightFor(n, c.e.axis, S.t + 4) === "r";
      for (const car of S.cars) {
        const da = c.a - car.a, db = c.b - car.b;
        if (Math.hypot(da, db) < 60 && da * Math.cos(car.yaw) + db * Math.sin(car.yaw) > -6) return false;
      }
      return true;
    };
    function stepWalker(w, dt) {
      if (w.carried) return;
      if (w.hidden) { w.wait -= dt; if (w.wait <= 0 && !w.working) { w.hidden = false; newTrip(w); } return; }
      if (w.wait > 0) { w.wait -= dt; w.moving = false; if (w.wait <= 0 && !w.path) newTrip(w); return; }
      if (!w.path) { newTrip(w); return; }
      const step = w.path[w.i];
      if (!step) { w.path = null; w.arrive && w.arrive(); return; }
      const e = step.e;
      if (w.segT === 0 && e.crossing && !w.onCross) {
        if (!canCross(w, e)) { w.moving = false; return; }
        w.onCross = e.crossing; e.crossing.peds++;
      }
      const from = w.node, to = step.n;
      const L = e.L || 1;
      w.segT += (w.speed * dt * (w.onCross ? 1.35 : 1)) / L;
      const t = Math.min(1, w.segT);
      w.a = lerp(from.a, to.a, t); w.b = lerp(from.b, to.b, t);
      w.da = to.a - from.a; w.db = to.b - from.b;
      w.moving = true; w.phase += dt * w.speed * 0.55;
      if (w.segT >= 1) {
        if (w.onCross) { w.onCross.peds--; w.onCross = null; }
        w.node = to; w.i++; w.segT = 0;
        if (w.i >= w.path.length) {
          w.path = null;
          if (to.tag === "step" && to.door) {
            if (w.crew) { w.hidden = true; w.working = w.crew.target === to; w.moving = false; w.wait = 999; w.crew.status = "working"; }
            else { w.hidden = true; w.wait = 6 + R() * 22; }
            w.at = to.door;
          } else w.wait = (w.crew ? 3 : 0.5) + R() * (w.crew ? 6 : 4);
        }
      }
      if (w.dog) { w.dog.trail.push([w.a, w.b]); if (w.dog.trail.length > 26) w.dog.trail.shift(); }
    }

    /* ---- animals ---- */
    const park = T.blocks.find((k) => k.pond);
    if (park) for (let k = 0; k < 4; k++) S.animals.push({ kind: "duck", a: park.pond.a, b: park.pond.b, home: park.pond, tgt: null, wait: R() * 3, col: k === 3 ? "#8A6A3A" : "#FFFFFF", phase: 0 });
    const sq = T.blocks.find((k) => k.pigeons);
    if (sq) for (let k = 0; k < 7; k++) S.animals.push({ kind: "pigeon", a: sq.pigeons.a + (R() - 0.5) * 60, b: sq.pigeons.b + (R() - 0.5) * 30, home: { a: sq.pigeons.a, b: sq.pigeons.b, ra: 40, rb: 22 }, wait: R() * 3, phase: 0 });
    T.blocks.filter((k) => k.kind === "block" && ["houses", "houses2", "beachHouses", "home", "park"].includes(k.type)).forEach((k, n) => {
      if (n % 2) return;
      S.animals.push({ kind: "cat", a: k.a1 - 20, b: k.b1 - 20, home: { a: k.a1 - 24, b: k.b1 - 24, ra: 14, rb: 14 }, wait: 4 + R() * 6, col: pick(["#E07B39", "#3B3B3B", "#B9A58C", "#EDE3D1"]), phase: 0 });
    });
    const AB = T.abox;
    for (let k = 0; k < 7; k++) S.gulls.push({ cx: lerp(AB.a0, AB.a1, R()), cy: lerp(AB.b0, AB.b1, R()), r: 120 + R() * 220, t: R() * TAU, sp: 0.1 + R() * 0.12, z: 80 + R() * 60 });
    for (let k = 0; S.dolphins.length < 5 && k < 400; k++) { const a = lerp(AB.a0 - 250, AB.a1 + 250, R()), b = lerp(AB.b0 - 250, AB.b1 + 250, R()); if (!T.landAt(a, b) && !T.landAt(a + 60, b) && !T.landAt(a - 60, b) && !T.landAt(a, b + 60) && !T.landAt(a, b - 60)) S.dolphins.push({ a, b, t: R() * 12, dir: R() < 0.5 ? 1 : -1 }); }
    function stepAnimals(dt) {
      S.animals.forEach((m) => {
        if (m.wait > 0) { m.wait -= dt; m.moving = false; return; }
        if (!m.tgt) {
          const h = m.home, th = R() * TAU, rr = R();
          m.tgt = { a: h.a + Math.cos(th) * (h.ra || 30) * 0.8 * rr, b: h.b + Math.sin(th) * (h.rb || 20) * 0.8 * rr };
        }
        const da = m.tgt.a - m.a, db = m.tgt.b - m.b, d = Math.hypot(da, db);
        const sp = m.kind === "duck" ? 6 : m.kind === "pigeon" ? 8 : 10;
        if (d < 1) { m.tgt = null; m.wait = m.kind === "cat" ? 5 + R() * 14 : 1 + R() * 4; m.moving = false; return; }
        const s = Math.min(d, sp * dt);
        m.a += (da / d) * s; m.b += (db / d) * s; m.da = da; m.db = db; m.moving = true; m.phase += dt * 9;
      });
      S.gulls.forEach((g) => { g.t += g.sp * dt; });
      S.dolphins.forEach((d) => { d.t += dt; });
    }

    /* ---- boats (docked leads + passing traffic) ---- */
    S.setLeads = (leads) => {
      const marina = [], port = [];
      leads.forEach((l) => (l.type === "tender" ? port : marina).push(l));
      S.boats = [
        ...marina.slice(0, T.docks.marina.length).map((l, k) => ({ lead: l, kind: "launch", ...T.docks.marina[k], color: l.color, flag: l.color, docked: true })),
        ...port.slice(0, T.docks.port.length).map((l, k) => ({ lead: l, kind: "cargo", ...T.docks.port[k], yaw: 0, color: "#2F4E5A", flag: l.color, docked: true })),
        ...S.traffic,
      ];
    };
    const ring = (m) => [[AB.a0 - m, AB.b0 - m], [(AB.a0 + AB.a1) / 2, AB.b0 - m * 1.2], [AB.a1 + m, AB.b0 - m], [AB.a1 + m * 1.2, (AB.b0 + AB.b1) / 2], [AB.a1 + m, AB.b1 + m], [(AB.a0 + AB.a1) / 2, AB.b1 + m * 1.2], [AB.a0 - m, AB.b1 + m], [AB.a0 - m * 1.2, (AB.b0 + AB.b1) / 2]];
    const mw = T.marinaWater, gapA = (ISLES.life.box.a1 + ISLES.work.box.a0) / 2;
    S.traffic = [
      { kind: "yacht", color: "#2A9D8F", route: ring(230), u: 0, speed: 18 },
      { kind: "cargo", color: "#8C3B3B", route: ring(360).reverse(), u: 0.5, speed: 14 },
      { kind: "launch", color: "#F6EDDF", route: [[(mw.a0 + mw.a1) / 2 + 60, mw.b1 + 120], [gapA, ISLES.work.box.b1 + 180], [gapA, 1000], [gapA + 20, 880], [gapA - 10, 1200]], u: 0.2, speed: 16 },
    ].map((b) => ({ ...b, path: withLen([...b.route, b.route[0]]), moving: true }));
    S.boats = [...S.traffic];
    function stepBoats(dt) {
      S.traffic.forEach((b) => {
        b.u = (b.u * b.path.len + b.speed * dt) / b.path.len; if (b.u > 1) b.u -= 1;
        const p = along(b.path, b.u * b.path.len);
        b.a = p.a; b.b = p.b; b.yaw = Math.atan2(p.hb, p.ha);
      });
    }

    /* ---- crew agents ---- */
    const squareNode = (() => { const sqb = T.blocks.find((k) => k.type === "square"); return sqb ? ringNodes.reduce((best, n) => (Math.hypot(n.a - (sqb.a0 + sqb.a1) / 2, n.b - (sqb.b0 + sqb.b1) / 2) < Math.hypot(best.a - (sqb.a0 + sqb.a1) / 2, best.b - (sqb.b0 + sqb.b1) / 2) ? n : best), ringNodes[0]) : ringNodes[0]; })();
    const doorOf = (landmark) => { const o = T.objs.find((x) => x.landmark === landmark && x.doorNode); return o ? o.doorNode : null; };
    S.syncCrew = (workers) => {
      const seen = new Set();
      workers.forEach((wk, k) => {
        seen.add(wk.id);
        let w = S.crew.get(wk.id);
        const base = wk.base || null;
        if (!w) {
          const look = randomLook(rng(hash(wk.id)));
          look.top = wk.color; look.h = 1.02;
          const tgt = base && doorOf(base);
          const start = tgt || squareNode;
          w = { id: "crew:" + wk.id, look, node: start, a: start.a, b: start.b, speed: 17, phase: 0, wait: tgt ? 0 : 1 + k, name: wk.name, crew: { id: wk.id, role: wk.kind === "human" ? "You" : wk.name, color: wk.color, base, target: tgt, status: tgt ? "working" : "idle", queue: [] } };
          if (tgt) { w.hidden = true; w.working = true; w.wait = 999; w.at = tgt.door; }
          S.crew.set(wk.id, w); S.peds.push(w);
        }
        w.name = wk.name; w.look.top = wk.color; w.crew.color = wk.color;
        if ((w.crew.base || null) !== base) S.sendTo(wk.id, base);
      });
      [...S.crew.keys()].forEach((id) => { if (!seen.has(id)) { const w = S.crew.get(id); S.peds.splice(S.peds.indexOf(w), 1); S.crew.delete(id); } });
    };
    S.sendTo = (id, landmark, dropAt) => {
      const w = S.crew.get(id);
      if (!w) return;
      w.crew.base = landmark || null;
      const tgt = landmark ? doorOf(landmark) : null;
      w.crew.target = tgt;
      if (w.hidden) { w.hidden = false; w.working = false; if (w.at && w.at.doorNode) { w.node = w.at.doorNode; w.a = w.node.a; w.b = w.node.b; } }
      if (dropAt) { const n = S.nearestNode(dropAt.a, dropAt.b); w.node = n; w.a = n.a; w.b = n.b; }
      w.crew.status = tgt ? "walking" : "idle";
      w.wait = 0; w.path = null;
      if (tgt) { const p = route(w.node, tgt); w.path = p && p.length ? p : null; w.i = 0; w.segT = 0; }
      else w.wait = 2;
    };
    S.nearestNode = (a, b) => ringNodes.reduce((best, n) => (Math.hypot(n.a - a, n.b - b) < Math.hypot(best.a - a, best.b - b) ? n : best), ringNodes[0]);

    S.step = (dt) => {
      S.t += dt;
      stepCars(dt);
      S.peds.forEach((w) => stepWalker(w, dt));
      stepAnimals(dt);
      stepBoats(dt);
    };
    return S;
  }
