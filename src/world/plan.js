  /* ===================== island plans: parcels of any shape on an uneven grid =====================
   * A plan is a set of parcels, each a list of grid cells. Roads run only along the
   * boundaries between different parcels, so a parcel's shape (a single cell, a long
   * strip, an L, a T...) is the shape of its land. Columns and rows have different
   * widths, so the same parcel reads thin in one spot and wide in another.
   */
  const PARCELS = {
    // ventures (landmark = the building's id in the app)
    home: { label: "Home", landmark: "personal", cells: [[0, 0]], fixed: true },
    studio: { label: "Studio", landmark: "youtube", cells: [[0, 0], [1, 0]], wing: "backlot" },
    freelance: { label: "Office", landmark: "freelance", cells: [[0, 0], [0, 1]], wing: "annex" },
    maker: { label: "Workshop", landmark: "bynode", cells: [[0, 0], [0, 1], [1, 1]], wing: "yard" },
    mill: { label: "Mill", landmark: "wood", cells: [[0, 0], [1, 0], [1, -1]], wing: "timber" },
    cafe: { label: "Café", landmark: "coffee", cells: [[0, 0]] },
    gym: { label: "Gym", landmark: "fitness", cells: [[0, 0], [1, 0]], wing: "field" },
    marina: { label: "Marina", landmark: "marina", cells: [[0, 0]], coastal: "marina" },
    goals: { label: "Lighthouse", landmark: "goals", cells: [[0, 0]], coastal: "lighthouse" },
    bank: { label: "Bank", landmark: "bank", cells: [[0, 0]] },
    faith: { label: "Faith", landmark: "faith", cells: [[0, 0], [0, 1]], wing: "courtyard" },
    townhall: { label: "Town Hall", landmark: "townhall", cells: [[0, 0]] },
    // savings goals that grow on the island
    airport: { label: "Airport", cells: [[0, 0], [1, 0], [2, 0]], wing: "runway" },
    dealership: { label: "Dealership", cells: [[0, 0]] },
    dreamhouse: { label: "Dream house", cells: [[0, 0]] },
    // scenery
    houses: { label: "Houses", cells: [[0, 0], [1, 0]], ambient: true },
    park: { label: "Park", cells: [[0, 0]], ambient: true },
    square: { label: "Town square", cells: [[0, 0]], ambient: true },
    downtown: { label: "Downtown", cells: [[0, 0]], ambient: true },
    farm: { label: "Farm", cells: [[0, 0], [0, 1]], ambient: true },
    apartments: { label: "Apartments", cells: [[0, 0]], ambient: true },
    garden: { label: "Garden", cells: [[0, 0]], ambient: true },
    section: { label: "District", cells: [[0, 0]] },
  };
  // which classic fill draws each parcel type's main cell
  const FILL_OF = { home: "home", studio: "studio", freelance: "freelance", maker: "maker", mill: "mill", cafe: "cafe", gym: "gym", marina: "marina",
    goals: "lookout", bank: "bank", faith: "faith", townhall: "townhall", airport: "airport", dealership: "dealership", dreamhouse: "dreamhouse", section: "section",
    houses: "houses", park: "park", square: "square", downtown: "downtown", farm: "farm", apartments: "apartments", garden: "garden" };

  /* grid line positions for a fresh island: uneven widths from a seed */
  const FRESH_N = 16;
  function freshLines(seed) {
    const r = rng(seed >>> 0), W = [360, 250, 320, 290, 380, 230, 340, 300];
    const line = (off) => { const out = [100]; for (let i = 0; i < FRESH_N; i++) out.push(out[i] + W[(i * 3 + off + ((r() * 3) | 0)) % W.length]); return out; };
    return { A: line(0), B: line(5) };
  }

  /* rotate a footprint a quarter-turn k times, normalised so the main cell stays at [0,0] */
  function footprint(type, rot = 0) {
    let cells = (Array.isArray(type) ? type : (PARCELS[type] || PARCELS.section).cells).map((c) => c.slice());
    for (let k = 0; k < ((rot % 4) + 4) % 4; k++) cells = cells.map(([i, j]) => [-j, i]);
    return cells;
  }
  const cellsOf = (p) => footprint(p.shape || p.type, p.rot || 0).map(([i, j]) => [p.at[0] + i, p.at[1] + j]);

  /* check a plan: no overlaps, inside the grid, every parcel touching the rest, coastal ones on the coast */
  function checkPlan(parcels, N = FRESH_N) {
    const occ = new Map();
    for (const p of parcels) for (const [i, j] of cellsOf(p)) {
      if (i < 0 || j < 0 || i >= N || j >= N) return { ok: false, why: "That's off the edge of the map." };
      const k = i + "," + j;
      if (occ.has(k)) return { ok: false, why: "That spot is already taken." };
      occ.set(k, p.id);
    }
    // connected (4-neighbour) across all cells
    const keys = [...occ.keys()];
    if (keys.length) {
      const seen = new Set([keys[0]]), q = [keys[0]];
      while (q.length) { const [i, j] = q.pop().split(",").map(Number); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([di, dj]) => { const k = i + di + "," + (j + dj); if (occ.has(k) && !seen.has(k)) { seen.add(k); q.push(k); } }); }
      if (seen.size !== keys.length) return { ok: false, why: "Every building needs to join the rest of the island." };
    }
    for (const p of parcels) if ((PARCELS[p.type] || {}).coastal && !coastSide(p, occ)) return { ok: false, why: PARCELS[p.type].label + " has to sit on the coast." };
    return { ok: true, occ };
  }
  /* the open side of a coastal parcel's main cell, preferring the sides that face the viewer */
  function coastSide(p, occ) {
    const [i, j] = cellsOf(p)[0];
    const pref = p.side ? [p.side, "+b", "+a", "-a", "-b"] : ["+b", "+a", "-a", "-b"];
    const free = (s) => { const [di, dj] = { "+a": [1, 0], "-a": [-1, 0], "+b": [0, 1], "-b": [0, -1] }[s]; for (let k = 1; k <= 3; k++) if (occ.has(i + di * k + "," + (j + dj * k))) return false; return true; };
    return pref.find(free) || null;
  }
  /* auto-place a new parcel: the free spot nearest the island's middle that keeps the plan valid */
  function placeParcel(parcels, type, extra = {}) {
    const cells = parcels.flatMap(cellsOf);
    const ci = cells.length ? cells.reduce((s, c) => s + c[0], 0) / cells.length : FRESH_N / 2, cj = cells.length ? cells.reduce((s, c) => s + c[1], 0) / cells.length : FRESH_N / 2;
    let best = null;
    for (let rot = 0; rot < 4; rot++) for (let i = 1; i < FRESH_N - 1; i++) for (let j = 1; j < FRESH_N - 1; j++) {
      const p = { id: extra.id || type + ":" + Date.now().toString(36), type, at: [i, j], rot, ...extra };
      // near the middle, but with a little seeded wobble and a liking for branching out,
      // so islands grow into irregular shapes rather than tidy rectangles
      const wob = ((Math.imul(i * 73856093 ^ j * 19349663 ^ (parcels.length + 1) * 83492791 ^ rot * 2654435761, 1) >>> 0) % 1000) / 1000;
      const pc = cellsOf(p), contacts = pc.reduce((n, [a, b]) => n + cells.filter(([x, y]) => Math.abs(x - a) + Math.abs(y - b) === 1).length, 0);
      const d = Math.hypot(i - ci, j - cj) * 0.8 + wob * 1.6 + (contacts > 2 ? 0.7 * (contacts - 2) : 0) + (PARCELS[type].coastal ? -0.5 : 0);
      if (best && d >= best.d) continue;
      if (!checkPlan([...parcels, p]).ok) continue;
      if (cells.length && !cellsOf(p).some(([a, b]) => cells.some(([x, y]) => Math.abs(x - a) + Math.abs(y - b) === 1))) continue;
      best = { p, d };
    }
    return best && best.p;
  }
  /* a fresh island from the onboarding picks: home first, then everything else packed round it */
  function freshParcels(picks) {
    let parcels = [{ id: "home", type: "home", at: [Math.floor(FRESH_N / 2) - 1, Math.floor(FRESH_N / 2) - 1], rot: 0 }];
    picks.forEach((t) => { const p = placeParcel(parcels, t, { id: PARCELS[t].landmark || t }); if (p) parcels = [...parcels, p]; });
    return parcels;
  }
  /* empty cells boxed in by the island become little parks, so there are no inland holes */
  function fillHoles(parcels) {
    const occ = new Set(parcels.flatMap(cellsOf).map((c) => c.join(",")));
    if (!occ.size) return parcels;
    const all = [...occ].map((k) => k.split(",").map(Number));
    const i0 = Math.min(...all.map((c) => c[0])) - 1, i1 = Math.max(...all.map((c) => c[0])) + 1, j0 = Math.min(...all.map((c) => c[1])) - 1, j1 = Math.max(...all.map((c) => c[1])) + 1;
    const out = new Set(), q = [[i0, j0]];
    out.add(i0 + "," + j0);
    while (q.length) { const [i, j] = q.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([di, dj]) => { const a = i + di, b = j + dj, k = a + "," + b; if (a < i0 || a > i1 || b < j0 || b > j1 || out.has(k) || occ.has(k)) return; out.add(k); q.push([a, b]); }); }
    const extra = [];
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const k = i + "," + j; if (!occ.has(k) && !out.has(k)) extra.push({ id: "hole:" + k, type: "park", at: [i, j], rot: 0, auto: true }); }
    return extra.length ? [...parcels, ...extra] : parcels;
  }

  /* the original Valley Isle as a plan: same streets, same buildings, now movable */
  function classicPlan() {
    const A = [100, 420, 720, 1010, 1380], B = [100, 400, 720, 1000, 1330, 1640];
    const T = [
      ["farm", "park", "houses", "gym", "beachHouses"],
      ["freelance", "home", "maker", "parking", "cs:learning"],
      ["studio", "square", "cafe", "garden", "marina"],
      ["houses2", "downtown", "mill", "cs:townhall", "cs:cinema"],
    ];
    const parcels = [];
    T.forEach((col, i) => col.forEach((t, j) => parcels.push({ id: "c" + i + j, type: t, at: [i, j], rot: 0, shape: [[0, 0]], classic: true })));
    parcels.find((p) => p.type === "marina").harbour = { kind: "marina", side: "+b" };
    parcels.find((p) => p.type === "cs:cinema").harbour = { kind: "lighthouse", side: "+b" };
    const joins = [["c03", "c13"], ["c20", "c21"], ["c23", "c33"], ["c30", "c31"], ["c01", "c02"]];
    return { A, B, parcels, joins, main: { a: [2], b: [2] }, roundabout: [2, 2], work: true, classic: true };
  }
  /* a stored layout (settings/island.layout) as a plan */
  function layoutPlan(layout, sections = []) {
    const { A, B } = freshLines(layout.seed || 7);
    let parcels = (layout.parcels || []).map((p) => ({ ...p, cells: undefined }));
    parcels = fillHoles(parcels);
    parcels.forEach((p) => { if (p.type === "marina") p.harbour = { kind: "marina" }; if (p.type === "goals") p.harbour = { kind: "lighthouse" }; });
    return { A, B, parcels, joins: [], main: null, roundabout: "auto", work: !!layout.work, seed: layout.seed || 7 };
  }
