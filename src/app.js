(() => {
  function Ks(e) {
    return new Date(e.getTime() - e.getTimezoneOffset() * 6e4)
      .toISOString()
      .slice(0, 10);
  }
  var Be = () => Ks(new Date());
  function ft(e, t) {
    let s = new Date(e + "T12:00:00");
    return (s.setDate(s.getDate() + t), Ks(s));
  }
  var Zt = (e) => (e || "").slice(0, 7),
    Ze = (e) =>
      e +
      "_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 6);
  function ct(e) {
    return e
      ? new Date(e + "T12:00:00").toLocaleDateString("en-ZA", {
          day: "numeric",
          month: "short",
        })
      : "";
  }
  function xt(e) {
    return e
      ? Math.round(
          (new Date(e + "T12:00:00") - new Date(Be() + "T12:00:00")) / 864e5,
        )
      : null;
  }
  function Le(e, t) {
    let s = Math.round(Number(e) || 0);
    return t && Math.abs(s) >= 1e3
      ? Math.abs(s) >= 1e6
        ? "R" + (s / 1e6).toFixed(s % 1e6 === 0 ? 0 : 1) + "m"
        : "R" + (s / 1e3).toFixed(s % 1e3 === 0 ? 0 : 1) + "k"
      : "R" + s.toLocaleString("en-ZA").replace(/,/g, " ");
  }
  function ms(e) {
    let t = 2166136261;
    for (let s = 0; s < e.length; s++)
      ((t ^= e.charCodeAt(s)), (t = Math.imul(t, 16777619)));
    return t >>> 0;
  }
  function Zs(e) {
    let t = e >>> 0;
    return () => {
      t = (t + 1831565813) >>> 0;
      let s = t;
      return (
        (s = Math.imul(s ^ (s >>> 15), s | 1)),
        (s ^= s + Math.imul(s ^ (s >>> 7), s | 61)),
        ((s ^ (s >>> 14)) >>> 0) / 4294967296
      );
    };
  }
  var Qs = [
      {
        id: "epcm",
        name: "EPCM",
        sub: "Day job \xB7 the refinery",
        kind: "refinery",
        color: "#3E7CB1",
        plot: { x: -430, y: -95, r: 240 },
      },
      {
        id: "freelance",
        name: "Freelance Eng",
        sub: "Drafting studio",
        kind: "drafting",
        color: "#7E6BC4",
        plot: { x: -150, y: -240, r: 200 },
      },
      {
        id: "bynode",
        name: "ByNodeCo",
        sub: "3D print workshop",
        kind: "maker",
        color: "#2A9D8F",
        plot: { x: 145, y: -240, r: 200 },
      },
      {
        id: "wood",
        name: "Woodworking",
        sub: "Timber mill",
        kind: "mill",
        color: "#B5773A",
        plot: { x: 405, y: -85, r: 210 },
      },
      {
        id: "coffee",
        name: "No Filter",
        sub: "Seaside caf\xE9",
        kind: "cafe",
        color: "#D9734E",
        plot: { x: 285, y: 120, r: 200 },
      },
      {
        id: "youtube",
        name: "YouTube",
        sub: "Film studio",
        kind: "film",
        color: "#E0474C",
        plot: { x: -395, y: 140, r: 210 },
      },
      {
        id: "personal",
        name: "Personal",
        sub: "Home cottage",
        kind: "cottage",
        color: "#6DAE5B",
        plot: { x: -105, y: 115, r: 190 },
      },
      {
        id: "fitness",
        name: "Fitness",
        sub: "Beach gym & track",
        kind: "gym",
        color: "#F08A4B",
        plot: { x: -250, y: 300, r: 205 },
        special: "fitness",
      },
      {
        id: "goals",
        name: "Goals",
        sub: "Lighthouse \xB7 treasury",
        kind: "lighthouse",
        color: "#E9B949",
        plot: { x: 615, y: 70, r: 165 },
        special: "goals",
      },
    ],
    Se = {
      plaza: { x: 20, y: -30, r: 240 },
      hub: {
        id: "hub",
        name: "Logistics Hub",
        sub: "Leads being worked",
        color: "#C9A227",
        x: 70,
        y: 295,
        r: 205,
      },
      port: {
        id: "port",
        name: "Port",
        sub: "New leads dock here",
        color: "#1F7A8C",
        x: 300,
        y: 355,
        r: 130,
      },
    },
    Vs = [
      { x: 0, y: 140, r: 240 },
      { x: -230, y: 10, r: 240 },
      { x: 215, y: -60, r: 240 },
      { x: -310, y: -200, r: 170 },
      { x: 490, y: 15, r: 160 },
      { x: 180, y: 250, r: 180 },
      { x: -470, y: 250, r: 150 },
      { x: 0, y: -300, r: 150 },
      { x: -160, y: -125, r: 225 },
      { x: -140, y: 245, r: 175 },
      { x: 395, y: 80, r: 175 },
      { x: -270, y: 190, r: 165 },
    ],
    ys = [
      { x: -690, y: 20 },
      { x: -20, y: -470 },
      { x: 560, y: -300 },
      { x: -600, y: 360 },
      { x: -420, y: -400 },
      { x: 320, y: -470 },
      { x: 650, y: 330 },
      { x: -810, y: -160 },
    ];
  /* what an island can build. type = the parcel shape in World.PARCELS; id = the venture/landmark id */
  var CATALOG = [
    { type: "studio", id: "youtube", label: "Studio", kind: "film", blurb: "Video, content and creative work", name: "Studio", sub: "Film studio", color: "#E0474C", crew: "studio", group: "work" },
    { type: "freelance", id: "freelance", label: "Office", kind: "drafting", blurb: "Freelance, consulting and services", name: "Office", sub: "Drafting studio", color: "#7E6BC4", group: "work" },
    { type: "maker", id: "bynode", label: "Workshop", kind: "maker", blurb: "Making and selling products", name: "Workshop", sub: "Maker space", color: "#2A9D8F", group: "work" },
    { type: "mill", id: "wood", label: "Mill", kind: "mill", blurb: "Crafts, trades and hands-on work", name: "Woodworking", sub: "Timber mill", color: "#B5773A", group: "work" },
    { type: "cafe", id: "coffee", label: "Caf\xE9", kind: "cafe", blurb: "A shop, caf\xE9 or retail side-business", name: "Caf\xE9", sub: "Seaside caf\xE9", color: "#D9734E", group: "work" },
    { type: "marina", id: "marina", label: "Marina", kind: "port", blurb: "Side-business leads dock here by boat", name: "Marina", sub: "Leads & orders", color: "#2A9D8F", group: "work" },
    { type: "epcm", id: "epcm", label: "Day job", kind: "refinery", blurb: "Your job, on its own work island with a logistics hub and tender port", name: "Day job", sub: "Work island", color: "#3E7CB1", group: "work", work: !0 },
    { type: "gym", id: "fitness", label: "Gym", kind: "gym", blurb: "Workouts, weights and daily habits", name: "Fitness", sub: "Gym & track", color: "#F08A4B", group: "life" },
    { type: "goals", id: "goals", label: "Lighthouse", kind: "lighthouse", blurb: "Goals and the money treasury", name: "Goals", sub: "Lighthouse \xB7 treasury", color: "#E9B949", group: "life" },
    { type: "bank", id: "bank", label: "Bank", kind: "bank", blurb: "Budget planner, spending, bills and savings goals", name: "Bank", sub: "Budget & savings", color: "#C9A227", group: "life" },
    { type: "faith", id: "faith", label: "Faith", kind: "faith", blurb: "Prayer, worship and faith goals", name: "Faith", sub: "Place of worship", color: "#8FB8B0", group: "life", styles: !0 },
    { type: "health", id: "health", label: "Health Centre", kind: "health", blurb: "Steps, calories and a private period tracker, linked to the Gym", name: "Health Centre", sub: "Clinic", color: "#5CB88A", group: "life" },
    { type: "townhall", id: "townhall", label: "Town Hall", kind: "townhall", blurb: "Your week planner: every task by day", name: "Town Hall", sub: "Week planner", color: "#9F8FC9", group: "life" },
    { type: "section", id: null, label: "Something else", blurb: "Name it and pick a building style", color: "#C2577A", group: "life" },
    { type: "houses", id: null, label: "Neighbours", blurb: "A street of houses", color: "#F3D9C4", group: "scenery" },
    { type: "park", id: null, label: "Park", blurb: "Trees, a pond and benches", color: "#9BC98A", group: "scenery" },
    { type: "square", id: null, label: "Town square", blurb: "A fountain, market stalls and pigeons", color: "#F3E7D5", group: "scenery" },
    { type: "downtown", id: null, label: "Downtown", blurb: "A cluster of towers", color: "#9EB4D8", group: "scenery" },
    { type: "farm", id: null, label: "Farm", blurb: "Fields, a barn and a few animals", color: "#C9B458", group: "scenery" },
    { type: "garden", id: null, label: "Garden", blurb: "Orchard rows and a stall", color: "#B7D8A4", group: "scenery" },
  ];
  var CLASSIC_LABEL = { farm: "Farm", park: "Park", houses: "Houses", houses2: "Houses", beachHouses: "Beach houses", parking: "Parking", square: "Town square", garden: "Garden", downtown: "Downtown", apartments: "Apartments", "cs:learning": "Learning centre", "cs:townhall": "Town hall", "cs:cinema": "Cinema", home: "Home", marina: "Marina", goals: "Lookout", section: "District" };
  var FAITH_STYLES = [
    { id: "mosque", label: "Mosque" }, { id: "church", label: "Church" }, { id: "temple", label: "Temple" },
    { id: "synagogue", label: "Synagogue" }, { id: "gurdwara", label: "Gurdwara" }, { id: "garden", label: "Prayer garden" }, { id: "chapel", label: "Chapel" },
  ];
  // venture buildings that aren't on the classic island
  var EXTRA_Q = {
    bank: { id: "bank", name: "Bank", sub: "Budget & savings", kind: "bank", color: "#C9A227" },
    faith: { id: "faith", name: "Faith", sub: "Place of worship", kind: "faith", color: "#8FB8B0" },
    townhall: { id: "townhall", name: "Town Hall", sub: "Week planner", kind: "townhall", color: "#9F8FC9" },
    health: { id: "health", name: "Health Centre", sub: "Clinic", kind: "health", color: "#5CB88A" },
  };
  var STUDIO_CREW = [
    { id: "script", name: "Scriptwriter", kind: "role", color: "#3E9B6B" },
    { id: "imagegen", name: "Image Gen", kind: "role", color: "#C04FB0" },
    { id: "voice", name: "Voiceover", kind: "role", color: "#7E6BC4" },
    { id: "editor", name: "Editor", kind: "role", color: "#E0A526" },
    { id: "thumb", name: "Thumbnail", kind: "role", color: "#1F8FA3" },
    { id: "publish", name: "Publisher", kind: "role", color: "#D9734E" },
  ];
  function Us(e) {
    if (e < ys.length) return { ...ys[e], r: 190 };
    let t = e - ys.length,
      s = 1 + Math.floor(t / 10),
      n = ((t % 10) / 10) * Math.PI * 2 + s * 0.4;
    return {
      x: Math.cos(n) * (820 + s * 160),
      y: Math.sin(n) * (500 + s * 90),
      r: 190,
    };
  }
  var Js = [
      { id: "house", name: "House" },
      { id: "shop", name: "Shop" },
      { id: "office", name: "Office" },
      { id: "farm", name: "Farm" },
      { id: "tower", name: "Tower" },
    ],
    gs = [
      "#D9734E",
      "#2A9D8F",
      "#3E7CB1",
      "#7E6BC4",
      "#E0474C",
      "#6DAE5B",
      "#E9B949",
      "#B5773A",
      "#F08A4B",
      "#C2577A",
    ],
    Qt = [
      { id: "design", name: "Design", color: "#8E6CCB" },
      { id: "eng", name: "Engineering", color: "#3E7CB1" },
      { id: "build", name: "Build / Make", color: "#C98A2E" },
      { id: "write", name: "Writing", color: "#3E9B6B" },
      { id: "strategy", name: "Strategy", color: "#C2577A" },
      { id: "marketing", name: "Marketing", color: "#1F8FA3" },
      { id: "production", name: "Production", color: "#C04FB0" },
      { id: "finance", name: "Finance", color: "#6E9A2F" },
      { id: "admin", name: "Admin / Ops", color: "#7A8591" },
      { id: "personal", name: "Personal", color: "#E07B39" },
    ],
    en = Object.fromEntries(Qt.map((e) => [e.id, e])),
    fs = [
      { id: "todo", name: "To Do" },
      { id: "doing", name: "In Progress" },
      { id: "done", name: "Done" },
    ],
    xs = [
      { id: "low", name: "Low", color: "#8FA3A6" },
      { id: "med", name: "Med", color: "#E0A526" },
      { id: "high", name: "High", color: "#D9534F" },
    ],
    Yo = Object.fromEntries(xs.map((e) => [e.id, e])),
    ks = [
      { id: "me", name: "Aqeel", kind: "human", color: "#2A9D8F" },
      { id: "script", name: "Scriptwriter", kind: "role", color: "#3E9B6B" },
      { id: "imagegen", name: "Image Gen", kind: "role", color: "#C04FB0" },
      { id: "voice", name: "Voiceover", kind: "role", color: "#7E6BC4" },
      { id: "editor", name: "Editor", kind: "role", color: "#E0A526" },
      { id: "thumb", name: "Thumbnail", kind: "role", color: "#1F8FA3" },
      { id: "publish", name: "Publisher", kind: "role", color: "#D9734E" },
    ],
    vs = [
      "#2A9D8F",
      "#3E9B6B",
      "#C04FB0",
      "#7E6BC4",
      "#E0A526",
      "#1F8FA3",
      "#D9734E",
      "#3E7CB1",
      "#C2577A",
      "#6E9A2F",
    ],
    Vt = [
      {
        id: "tender",
        name: "EPCM tender / RFQ",
        short: "Tender",
        color: "#3E7CB1",
        venture: "epcm",
        worktype: "eng",
      },
      {
        id: "freelance",
        name: "Freelance enquiry",
        short: "Freelance",
        color: "#7E6BC4",
        venture: "freelance",
        worktype: "eng",
      },
      {
        id: "order",
        name: "Business order",
        short: "Order",
        color: "#2A9D8F",
        venture: "bynode",
        worktype: "build",
      },
      {
        id: "sponsor",
        name: "YouTube sponsor / collab",
        short: "Sponsor",
        color: "#E0474C",
        venture: "youtube",
        worktype: "production",
      },
    ],
    kt = Object.fromEntries(Vt.map((e) => [e.id, e])),
    vt = [
      { id: "new", name: "New", hint: "Docked at the port" },
      { id: "qualifying", name: "Qualifying", hint: "Unpacking in the hub" },
      { id: "quoted", name: "Quoted", hint: "Quote sent, waiting" },
      { id: "won", name: "Won", hint: "Paid into the treasury" },
      { id: "lost", name: "Lost", hint: "Sailed away" },
    ],
    tn = ["Gym", "Run", "Walk", "Padel", "Swim", "Cycle", "Other"],
    wt = [
      { id: "water", name: "Water", detail: "8 glasses" },
      { id: "steps", name: "Steps", detail: "10 000 steps" },
      { id: "sleep", name: "Sleep", detail: "7+ hours" },
    ],
    WT_BASE = wt.slice(),
    uo = { low: 10, med: 20, high: 35 },
    bt = (e) => uo[e.priority] || 15;
  function ho(e, t = 20) {
    return Math.floor(Math.sqrt(Math.max(0, e) / t)) + 1;
  }
  function Ys(e, t = 20) {
    return t * (e - 1) * (e - 1);
  }
  function ws(e, t = 20) {
    let s = ho(e, t),
      n = Ys(s, t),
      o = Ys(s + 1, t);
    return {
      level: s,
      xp: e,
      into: e - n,
      need: o - n,
      pct: (e - n) / (o - n),
      tier: s >= 5 ? 3 : s >= 3 ? 2 : 1,
    };
  }
  function Ut(e) {
    return !!e.due && e.status !== "done" && e.due < Be();
  }
  function sn(e) {
    let t = e || {},
      s = Be();
    t[s] || (s = ft(s, -1));
    let n = 0;
    for (; t[s] > 0; ) (n++, (s = ft(s, -1)));
    return { streak: n, activeToday: !!t[Be()] };
  }
  // does a repeating task come round today?
  var repeatsToday = (tk, d = new Date()) => tk.repeat === "daily" || (tk.repeat === "weekdays" && d.getDay() > 0 && d.getDay() < 6) || (tk.repeat === "weekly" && d.getDay() === (tk.repeatDay != null ? tk.repeatDay : new Date(tk.createdAt || Date.now()).getDay()));
  function nn(e, t) {
    let s = t,
      rep = e.filter((i) => i.repeat && repeatsToday(i) && (i.status !== "done" || i.doneAt === s)),
      n = e.filter((i) => !i.repeat && (i.status !== "done" || (i.doneAt && i.doneAt === s))),
      o = (i) => {
        let l = 50;
        if (i.due) {
          let d = xt(i.due);
          l = d < 0 ? 0 : d === 0 ? 5 : d <= 3 ? 12 : 30;
        }
        return (
          i.priority === "high" ? (l -= 8) : i.priority === "low" && (l += 10),
          l + (ms(s + i.id) % 100) / 100
        );
      };
    return n
      .map((i) => ({ t: i, s: o(i) }))
      .sort((i, l) => i.s - l.s)
      .slice(0, 3)
      .map((i) => i.t)
      .concat(rep);
  }
  function on(e, t) {
    let s = { ...e };
    for (let n of Object.keys(t)) {
      let o = t[n];
      o &&
      typeof o == "object" &&
      !Array.isArray(o) &&
      e[n] &&
      typeof e[n] == "object" &&
      !Array.isArray(e[n])
        ? (s[n] = on(e[n], o))
        : (s[n] = o);
    }
    return s;
  }
  function an(e) {
    let t = new Map(),
      s = new Set(),
      n = (c) => c.split("/").slice(0, -1).join("/"),
      o = (c) => {
        let r = t.get(c);
        return {
          id: c.split("/").pop(),
          exists: r !== void 0,
          data: () => r,
          metadata: { fromCache: !1, hasPendingWrites: !1 },
        };
      },
      i = (c) => {
        let r = [...t.keys()]
          .filter((y) => n(y) === c)
          .sort()
          .map(o);
        return {
          docs: r,
          size: r.length,
          empty: !r.length,
          docChanges: () => [],
          metadata: { fromCache: !1, hasPendingWrites: !1 },
        };
      },
      l = (c) => {
        let r = n(c);
        s.forEach((y) => {
          (y.kind === "doc" && y.path === c && y.fn(o(c)),
            y.kind === "col" && y.path === r && y.fn(i(r)));
        });
      },
      d = (c) => JSON.parse(JSON.stringify(c)),
      p = (c) => ({
        id: c.split("/").pop(),
        path: c,
        get: async () => o(c),
        set: async (r) => {
          (t.set(c, d(r)), l(c));
        },
        update: async (r) => {
          let y = t.get(c);
          if (y === void 0)
            throw {
              code: "invalid_argument",
              message: "Document does not exist",
            };
          (t.set(c, on(y, d(r))), l(c));
        },
        delete: async () => {
          (t.delete(c), l(c));
        },
        onSnapshot: (r) => {
          let y = { kind: "doc", path: c, fn: r };
          return (s.add(y), setTimeout(() => r(o(c)), 0), () => s.delete(y));
        },
        collection: (r) => u(c + "/" + r),
      }),
      u = (c) => {
        let r = {
          path: c,
          doc: (y) => p(c + "/" + (y || Ze("d"))),
          add: async (y) => {
            let k = p(c + "/" + Ze("d"));
            return (await k.set(y), k);
          },
          onSnapshot: (y) => {
            let k = { kind: "col", path: c, fn: y };
            return (s.add(k), setTimeout(() => y(i(c)), 0), () => s.delete(k));
          },
          get: async () => i(c),
          where: () => r,
          orderBy: () => r,
          limit: () => r,
        };
        return r;
      };
    if (e)
      for (let [c, r] of Object.entries(e))
        for (let [y, k] of Object.entries(r)) t.set(c + "/" + y, d(k));
    return { doc: p, collection: u };
  }
  var tt = null,
    bs = !1;
  function Ns(e) {
    if (((bs = e), e))
      try {
        ((tt = tt || new (window.AudioContext || window.webkitAudioContext)()),
          tt.state === "suspended" && tt.resume());
      } catch {
        bs = !1;
      }
  }
  function et({
    f: e = 600,
    f2: t,
    d: s = 0.12,
    type: n = "sine",
    g: o = 0.1,
    delay: i = 0,
    lp: l,
  }) {
    if (!bs || !tt) return;
    let d = tt.currentTime + i,
      p = tt.createOscillator(),
      u = tt.createGain();
    ((p.type = n),
      p.frequency.setValueAtTime(e, d),
      t && p.frequency.exponentialRampToValueAtTime(t, d + s),
      u.gain.setValueAtTime(1e-4, d),
      u.gain.exponentialRampToValueAtTime(o, d + Math.min(0.03, s / 3)),
      u.gain.exponentialRampToValueAtTime(1e-4, d + s));
    let c = p;
    if (l) {
      let r = tt.createBiquadFilter();
      ((r.type = "lowpass"), (r.frequency.value = l), p.connect(r), (c = r));
    }
    (c.connect(u).connect(tt.destination), p.start(d), p.stop(d + s + 0.05));
  }
  var Fe = {
      tap: () => et({ f: 420, f2: 300, d: 0.06, type: "sine", g: 0.05 }),
      pop: () => et({ f: 520, f2: 900, d: 0.11, type: "triangle", g: 0.09 }),
      coin: () => {
        (et({ f: 988, d: 0.09, type: "square", g: 0.035 }),
          et({ f: 1319, d: 0.22, type: "square", g: 0.035, delay: 0.08 }));
      },
      level: () =>
        [523, 659, 784, 1047].forEach((e, t) =>
          et({ f: e, d: 0.18, type: "triangle", g: 0.07, delay: t * 0.09 }),
        ),
      horn: () => {
        (et({ f: 110, d: 0.95, type: "sawtooth", g: 0.07, lp: 700 }),
          et({ f: 165, d: 0.95, type: "sawtooth", g: 0.04, lp: 700 }));
      },
      build: () => {
        (et({ f: 200, f2: 140, d: 0.12, type: "square", g: 0.04 }),
          et({
            f: 260,
            f2: 180,
            d: 0.12,
            type: "square",
            g: 0.04,
            delay: 0.15,
          }),
          et({
            f: 660,
            f2: 990,
            d: 0.25,
            type: "triangle",
            g: 0.07,
            delay: 0.32,
          }));
      },
    },
    yo = () => {
      try {
        return matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch {
        return !1;
      }
    };
  function Jt(
    e,
    t,
    s = ["#E9B949", "#D9734E", "#2A9D8F", "#FFF8EC", "#7E6BC4"],
  ) {
    let n = document.getElementById("fx-layer");
    if (!(!n || yo()))
      for (let o = 0; o < 34; o++) {
        let i = document.createElement("i");
        i.className = "confetti";
        let l = Math.random() * Math.PI * 2,
          d = 60 + Math.random() * 110;
        ((i.style.left = e + "px"),
          (i.style.top = t + "px"),
          (i.style.background = s[o % s.length]),
          i.style.setProperty("--dx", Math.cos(l) * d + "px"),
          i.style.setProperty("--dy", Math.sin(l) * d - 70 + "px"),
          i.style.setProperty("--r", Math.random() * 720 - 360 + "deg"),
          (i.style.animationDelay = Math.random() * 0.08 + "s"),
          n.appendChild(i),
          setTimeout(() => i.remove(), 1500));
      }
  }
  function ln(e, t, s, n = "#E9B949") {
    let o = document.getElementById("fx-layer");
    if (!o) return;
    let i = document.createElement("span");
    ((i.className = "fx-float"),
      (i.textContent = s),
      (i.style.left = e + "px"),
      (i.style.top = t + "px"),
      (i.style.color = n),
      o.appendChild(i),
      setTimeout(() => i.remove(), 1600));
  }
  var ye = (e, t, s = 0) => [e - t, (e + t) / 2 - s],
    L = (e) => Math.round(e * 10) / 10,
    mo = (e, t, s = 0) => {
      let [n, o] = ye(e, t, s);
      return L(n) + "," + L(o);
    },
    J = (e) => e.map((t) => mo(t[0], t[1], t[2] || 0)).join(" "),
    D = {
      wall: "#F6EDDF",
      wall2: "#EBDDC7",
      roof: "#D9734E",
      roof2: "#B85C3C",
      wood: "#B98759",
      woodD: "#7E5337",
      steel: "#D8DEE1",
      steelD: "#9AA7AE",
      glass: "#4E7D8B",
      lit: "#FFD98A",
      dark: "#3B4A50",
      stone: "#D3C6AF",
      pave: "#E9DBC0",
      paveEdge: "#D6C29D",
      leaf: "#5E9E5A",
      stroke: "none", // flat art: no outlines
    };
  function Fs(e) {
    return (
      (e = e.replace("#", "")),
      e.length === 3 &&
        (e = e
          .split("")
          .map((t) => t + t)
          .join("")),
      [0, 2, 4].map((t) => parseInt(e.slice(t, t + 2), 16))
    );
  }
  function rn(e, t, s) {
    let n = Fs(e),
      o = Fs(t);
    return (
      "#" +
      n
        .map((i, l) =>
          Math.round(i + (o[l] - i) * s)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  }
  function T(e, t) {
    return t >= 0 ? rn(e, "#FFF8F0", t) : rn(e, "#3A3158", Math.min(1, -t * 1.25));
  }
  /* flat pastel pass (matches the world pen): cap saturation, lift lightness,
     steel blues lean periwinkle, greys and blacks go dusky violet */
  var PZ = new Map();
  function pz(c) {
    if (typeof c !== "string" || c[0] !== "#" || (c.length !== 7 && c.length !== 4)) return c;
    let v = PZ.get(c);
    if (v) return v;
    let [r, g, b2] = Fs(c).map((x) => x / 255),
      mx = Math.max(r, g, b2), mn = Math.min(r, g, b2), l = (mx + mn) / 2, d = mx - mn, h = 0, s = 0;
    if (d > 1e-6) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = 60 * (mx === r ? ((g - b2) / d + 6) % 6 : mx === g ? (b2 - r) / d + 2 : (r - g) / d + 4);
    }
    if (h > 190 && h < 240) h += (240 - h) * 0.35;
    let L2 = 0.3 + 0.62 * l, S2 = s < 0.08 ? s : Math.min(0.72, s * 0.9 + 0.1);
    if (d <= 1e-6 && l < 0.5) (h = 255), (S2 = 0.18);
    let C = (1 - Math.abs(2 * L2 - 1)) * S2, X = C * (1 - Math.abs(((h / 60) % 2) - 1)), m = L2 - C / 2,
      q = h < 60 ? [C, X, 0] : h < 120 ? [X, C, 0] : h < 180 ? [0, C, X] : h < 240 ? [0, X, C] : h < 300 ? [X, 0, C] : [C, 0, X];
    v = "#" + q.map((x) => Math.max(0, Math.min(255, Math.round((x + m) * 255))).toString(16).padStart(2, "0")).join("");
    PZ.set(c, v);
    return v;
  }
  function pt(e, t) {
    let [s, n, o] = Fs(e);
    return `rgba(${s},${n},${o},${t})`;
  }
  var es = { stroke: D.stroke, strokeWidth: 0.7, strokeLinejoin: "round" };
  function b({
    x: e = 0,
    y: t = 0,
    z: s = 0,
    w: n,
    d: o,
    h: i,
    c: l,
    top: d,
    left: p,
    right: u,
    noStroke: c,
  }) {
    let r = e - n / 2,
      y = e + n / 2,
      k = t - o / 2,
      f = t + o / 2,
      w = s + i;
    return React.createElement(
      "g",
      { ...(c ? {} : es) },
      i > 0 &&
        React.createElement("polygon", {
          points: J([
            [r, f, s],
            [y, f, s],
            [y, f, w],
            [r, f, w],
          ]),
          fill: pz(p || l),
        }),
      i > 0 &&
        React.createElement("polygon", {
          points: J([
            [y, k, s],
            [y, f, s],
            [y, f, w],
            [y, k, w],
          ]),
          fill: pz(u || T(l, -0.24)),
        }),
      React.createElement("polygon", {
        points: J([
          [r, k, w],
          [y, k, w],
          [y, f, w],
          [r, f, w],
        ]),
        fill: pz(d || T(l, 0.12)),
      }),
    );
  }
  function Te({ x: e = 0, y: t = 0, w: s, d: n, c: o, edge: i, z: l = 0.3 }) {
    let d = e - s / 2,
      p = e + s / 2,
      u = t - n / 2,
      c = t + n / 2;
    return React.createElement(
      "g",
      null,
      React.createElement("polygon", {
        points: J([
          [d, c, 0],
          [p, c, 0],
          [p, c, l + 1.6],
          [d, c, l + 1.6],
        ]),
        fill: T(o, -0.12),
      }),
      React.createElement("polygon", {
        points: J([
          [p, u, 0],
          [p, c, 0],
          [p, c, l + 1.6],
          [p, u, l + 1.6],
        ]),
        fill: T(o, -0.22),
      }),
      React.createElement("polygon", {
        points: J([
          [d, u, l + 1.6],
          [p, u, l + 1.6],
          [p, c, l + 1.6],
          [d, c, l + 1.6],
        ]),
        fill: o,
        stroke: i || T(o, -0.1),
        strokeWidth: "1.2",
      }),
    );
  }
  function Nt({
    x: e = 0,
    y: t = 0,
    z: s = 0,
    a: n,
    b: o,
    fill: i,
    stroke: l,
    sw: d = 1,
    dash: p,
    n: u = 40,
  }) {
    let c = [];
    for (let r = 0; r < u; r++) {
      let y = (r / u) * Math.PI * 2;
      c.push([e + Math.cos(y) * n, t + Math.sin(y) * o, s]);
    }
    return React.createElement("polygon", {
      points: J(c),
      fill: i || "none",
      stroke: l,
      strokeWidth: d,
      strokeDasharray: p,
      strokeLinejoin: "round",
    });
  }
  function me(e, t, s, n, o, i) {
    let l = t.x - t.w / 2,
      d = t.x + t.w / 2,
      p = t.y - t.d / 2,
      u = t.y + t.d / 2,
      c = t.z || 0,
      r =
        e === "left"
          ? (y, k) => [l + y * t.w, u, c + k * t.h]
          : (y, k) => [d, p + y * t.d, c + k * t.h];
    return J([r(s, o), r(n, o), r(n, i), r(s, i)]);
  }
  function le(e, t, s, n) {
    let o = t.x - t.w / 2,
      i = t.x + t.w / 2,
      l = t.y - t.d / 2,
      d = t.y + t.d / 2,
      p = t.z || 0;
    return e === "left"
      ? ye(o + s * t.w, d, p + n * t.h)
      : ye(i, l + s * t.d, p + n * t.h);
  }
  function oe({
    b: e,
    face: t = "left",
    cols: s = 2,
    rows: n = 1,
    u0: o = 0.14,
    u1: i = 0.86,
    v0: l = 0.32,
    v1: d = 0.82,
    gx: p = 0.1,
    gy: u = 0.14,
    c,
    lit: r,
  }) {
    let y = [],
      k = (i - o - (s - 1) * p) / s,
      f = (d - l - (n - 1) * u) / n,
      w = r ? D.lit : c || (t === "left" ? D.glass : T(D.glass, -0.15));
    for (let v = 0; v < n; v++)
      for (let $ = 0; $ < s; $++) {
        let E = o + $ * (k + p),
          M = l + v * (f + u);
        y.push(
          React.createElement("polygon", {
            key: v + "-" + $,
            points: me(t, e, E, E + k, M, M + f),
            fill: w,
            stroke: "rgba(255,248,236,0.75)",
            strokeWidth: "0.9",
          }),
        );
      }
    return React.createElement("g", null, y);
  }
  function ut({
    b: e,
    face: t = "left",
    u: s = 0.5,
    w: n = 0.16,
    h: o = 0.5,
    c: i = "#6E4A33",
  }) {
    return React.createElement("polygon", {
      points: me(t, e, s - n / 2, s + n / 2, 0, o),
      fill: i,
      stroke: D.stroke,
      strokeWidth: "0.7",
    });
  }
  function st({
    x: e = 0,
    y: t = 0,
    z: s,
    w: n,
    d: o,
    rh: i,
    c: l,
    wall: d = D.wall,
    axis: p = "x",
    o: u = 4,
  }) {
    let c = e - n / 2 - u,
      r = e + n / 2 + u,
      y = t - o / 2 - u,
      k = t + o / 2 + u,
      f = s + i,
      w = e - n / 2,
      v = e + n / 2,
      $ = t - o / 2,
      E = t + o / 2;
    return p === "x"
      ? React.createElement(
          "g",
          { ...es },
          React.createElement("polygon", {
            points: J([
              [c, y, s],
              [r, y, s],
              [r, t, f],
              [c, t, f],
            ]),
            fill: T(l, -0.12),
          }),
          React.createElement("polygon", {
            points: J([
              [v, $, s],
              [v, E, s],
              [v, t, f],
            ]),
            fill: T(d, -0.17),
          }),
          React.createElement("polygon", {
            points: J([
              [c, k, s],
              [r, k, s],
              [r, t, f],
              [c, t, f],
            ]),
            fill: l,
          }),
          React.createElement("line", {
            x1: ye(c, t, f)[0],
            y1: ye(c, t, f)[1],
            x2: ye(r, t, f)[0],
            y2: ye(r, t, f)[1],
            stroke: T(l, -0.3),
            strokeWidth: "1.2",
          }),
        )
      : React.createElement(
          "g",
          { ...es },
          React.createElement("polygon", {
            points: J([
              [c, y, s],
              [c, k, s],
              [e, k, f],
              [e, y, f],
            ]),
            fill: T(l, 0.05),
          }),
          React.createElement("polygon", {
            points: J([
              [w, E, s],
              [v, E, s],
              [e, E, f],
            ]),
            fill: d,
          }),
          React.createElement("polygon", {
            points: J([
              [r, y, s],
              [r, k, s],
              [e, k, f],
              [e, y, f],
            ]),
            fill: T(l, -0.16),
          }),
          React.createElement("line", {
            x1: ye(e, y, f)[0],
            y1: ye(e, y, f)[1],
            x2: ye(e, k, f)[0],
            y2: ye(e, k, f)[1],
            stroke: T(l, -0.3),
            strokeWidth: "1.2",
          }),
        );
  }
  function ts({ x: e = 0, y: t = 0, z: s, w: n, d: o, rh: i, c: l, o: d = 3 }) {
    let p = e - n / 2 - d,
      u = e + n / 2 + d,
      c = t - o / 2 - d,
      r = t + o / 2 + d,
      y = [e, t, s + i];
    return React.createElement(
      "g",
      { ...es },
      React.createElement("polygon", {
        points: J([[p, c, s], [u, c, s], y]),
        fill: T(l, -0.1),
      }),
      React.createElement("polygon", {
        points: J([[p, c, s], [p, r, s], y]),
        fill: T(l, 0.06),
      }),
      React.createElement("polygon", {
        points: J([[u, c, s], [u, r, s], y]),
        fill: T(l, -0.18),
      }),
      React.createElement("polygon", {
        points: J([[p, r, s], [u, r, s], y]),
        fill: l,
      }),
    );
  }
  function go(e, t, s, n, o, i) {
    let [l, d] = ye(e, t, s),
      p = d - i,
      u = n * 1.4142,
      c = n * 0.7071,
      r = o * 1.4142,
      y = o * 0.7071,
      k = `M${L(l - r)},${L(p)} L${L(l - u)},${L(d)} A${L(u)},${L(c)} 0 0 0 ${L(l + u)},${L(d)} L${L(l + r)},${L(p)} Z`;
    return { cx: l, cyb: d, cyt: p, ax: u, ay: c, bx: r, by: y, side: k };
  }
  function fo(e, t, s, n, o, i, l) {
    let d = (v) => n + (o - n) * (v / s),
      p = d(i),
      u = d(l),
      c = t - i,
      r = t - l,
      y = p * 1.4142,
      k = p * 0.7071,
      f = u * 1.4142,
      w = u * 0.7071;
    return `M${L(e - f)},${L(r)} L${L(e - y)},${L(c)} A${L(y)},${L(k)} 0 0 0 ${L(e + y)},${L(c)} L${L(e + f)},${L(r)} A${L(f)},${L(w)} 0 0 1 ${L(e - f)},${L(r)} Z`;
  }
  function re({
    x: e = 0,
    y: t = 0,
    z: s = 0,
    r: n,
    r2: o,
    h: i,
    c: l,
    top: d,
    bands: p = [],
    noTop: u,
  }) {
    let c = o == null ? n : o,
      r = go(e, t, s, n, c, i);
    return React.createElement(
      "g",
      null,
      React.createElement("path", {
        d: r.side,
        fill: pz(l),
        stroke: D.stroke,
        strokeWidth: "0.7",
      }),
      p.map((y, k) =>
        React.createElement("path", {
          key: k,
          d: fo(r.cx, r.cyb, i, n, c, y.z1, y.z2),
          fill: pz(y.c),
        }),
      ),
      React.createElement("path", { d: r.side, fill: "url(#cylShade)" }),
      !u &&
        React.createElement("ellipse", {
          cx: L(r.cx),
          cy: L(r.cyt),
          rx: L(r.bx),
          ry: L(r.by),
          fill: pz(d || T(l, 0.14)),
          stroke: D.stroke,
          strokeWidth: "0.7",
        }),
    );
  }
  function ht({ sx: e, sy: t, s = 1, v: n = 0 }) {
    let o = n % 3,
      i = ["#4C8A4E", "#5A9650", "#447D4B"][o],
      l = ["#6CAB5C", "#7BB765", "#62A15A"][o],
      d = ["#9BCB76", "#AAD47F", "#8FC271"][o];
    return React.createElement(
      "g",
      { transform: `translate(${L(e)},${L(t)}) scale(${s})` },
      React.createElement("ellipse", {
        cx: "8",
        cy: "1.5",
        rx: "15",
        ry: "5",
        fill: "rgba(46,62,28,0.22)",
      }),
      React.createElement("path", {
        d: "M-2,1 L-1.5,-15 L1.5,-15 L2,1 Z",
        fill: "#8A6040",
      }),
      React.createElement("circle", { cx: "1", cy: "-24", r: "14", fill: i }),
      React.createElement("circle", {
        cx: "-3",
        cy: "-27",
        r: "11.5",
        fill: l,
      }),
      React.createElement("circle", { cx: "5", cy: "-31", r: "8", fill: l }),
      React.createElement("circle", { cx: "-6", cy: "-31", r: "5", fill: d }),
      React.createElement("circle", { cx: "2", cy: "-35", r: "3.4", fill: d }),
    );
  }
  function Ot({ sx: e, sy: t, s = 1 }) {
    return React.createElement(
      "g",
      { transform: `translate(${L(e)},${L(t)}) scale(${s})` },
      React.createElement("ellipse", {
        cx: "7",
        cy: "1.5",
        rx: "12",
        ry: "4",
        fill: "rgba(46,62,28,0.22)",
      }),
      React.createElement("rect", {
        x: "-1.6",
        y: "-8",
        width: "3.2",
        height: "9",
        fill: "#7E5A3C",
      }),
      React.createElement("path", {
        d: "M0,-44 L12,-18 L-12,-18 Z",
        fill: "#4E8A55",
      }),
      React.createElement("path", {
        d: "M0,-34 L14,-7 L-14,-7 Z",
        fill: "#437D4B",
      }),
      React.createElement("path", {
        d: "M0,-44 L-12,-18 L-3,-18 Z",
        fill: "#6BA66B",
        opacity: "0.7",
      }),
    );
  }
  function Mt({ sx: e, sy: t, s = 1, flip: n }) {
    let o = n ? -1 : 1,
      i = 5 * o,
      l = -38,
      d = [-160, -125, -80, -40, -5, 25, 160].map((p) => {
        let u = (p * Math.PI) / 180,
          c = i + Math.cos(u) * 22 * o,
          r = l + Math.sin(u) * 9 + 8,
          y = i + Math.cos(u) * 12 * o,
          k = l + Math.sin(u) * 6 - 6;
        return `M${i},${l} Q${L(y)},${L(k)} ${L(c)},${L(r)}`;
      });
    return React.createElement(
      "g",
      { transform: `translate(${L(e)},${L(t)}) scale(${s})` },
      React.createElement("ellipse", {
        cx: 10 * o + 4,
        cy: "1.5",
        rx: "16",
        ry: "5",
        fill: "rgba(46,62,28,0.2)",
      }),
      React.createElement("path", {
        d: `M0,0 Q${7 * o},-20 ${i},${l}`,
        stroke: "#9C7248",
        strokeWidth: "4",
        fill: "none",
        strokeLinecap: "round",
      }),
      React.createElement("path", {
        d: `M0,0 Q${7 * o},-20 ${i},${l}`,
        stroke: "#B98C5E",
        strokeWidth: "1.3",
        fill: "none",
        strokeDasharray: "2 3",
      }),
      d.map((p, u) =>
        React.createElement("path", {
          key: u,
          d: p,
          stroke: u % 2 ? "#4F9150" : "#62A85A",
          strokeWidth: "4.2",
          fill: "none",
          strokeLinecap: "round",
        }),
      ),
      d.map((p, u) =>
        React.createElement("path", {
          key: "h" + u,
          d: p,
          stroke: "#8CCB6E",
          strokeWidth: "1.1",
          fill: "none",
          strokeLinecap: "round",
          opacity: "0.8",
        }),
      ),
      React.createElement("circle", {
        cx: i - 2,
        cy: l + 3,
        r: "2.2",
        fill: "#6B4A2B",
      }),
      React.createElement("circle", {
        cx: i + 2,
        cy: l + 3.5,
        r: "2.2",
        fill: "#5B3E24",
      }),
    );
  }
  function We({ sx: e, sy: t, s = 1, flower: n }) {
    return React.createElement(
      "g",
      { transform: `translate(${L(e)},${L(t)}) scale(${s})` },
      React.createElement("ellipse", {
        cx: "3",
        cy: "1",
        rx: "9",
        ry: "3",
        fill: "rgba(46,62,28,0.2)",
      }),
      React.createElement("circle", {
        cx: "-4",
        cy: "-4",
        r: "5.5",
        fill: "#5A9650",
      }),
      React.createElement("circle", {
        cx: "3",
        cy: "-5",
        r: "6.5",
        fill: "#6CAB5C",
      }),
      React.createElement("circle", {
        cx: "0",
        cy: "-8",
        r: "4",
        fill: "#8FC271",
      }),
      n &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement("circle", {
            cx: "-3",
            cy: "-7",
            r: "1.4",
            fill: n,
          }),
          React.createElement("circle", {
            cx: "4",
            cy: "-9",
            r: "1.4",
            fill: n,
          }),
          React.createElement("circle", {
            cx: "2",
            cy: "-3",
            r: "1.2",
            fill: n,
          }),
        ),
    );
  }
  function Bt({ sx: e, sy: t, s = 1 }) {
    return React.createElement(
      "g",
      { transform: `translate(${L(e)},${L(t)}) scale(${s})` },
      React.createElement("path", {
        d: "M-10,0 L-8,-7 L-2,-10 L6,-8 L10,-2 L8,1 Z",
        fill: "#B7AC9A",
        stroke: D.stroke,
        strokeWidth: "0.6",
      }),
      React.createElement("path", {
        d: "M-8,-7 L-2,-10 L6,-8 L1,-5 Z",
        fill: "#D4CBBA",
      }),
    );
  }
  function cn({
    sx: e,
    sy: t,
    shirt: s = "#2A9D8F",
    skin: n = "#B9805A",
    hair: o = "#2B1D14",
    walk: i,
    delay: l = 0,
    title: d,
  }) {
    return React.createElement(
      "g",
      { transform: `translate(${L(e)},${L(t)})` },
      d && React.createElement("title", null, d),
      React.createElement(
        "g",
        {
          className: i ? "walker " + i : "",
          style: { animationDelay: l + "s" },
        },
        React.createElement("ellipse", {
          cx: "0",
          cy: "0.5",
          rx: "4.6",
          ry: "1.8",
          fill: "rgba(0,0,0,0.22)",
        }),
        React.createElement("rect", {
          x: "-2.6",
          y: "-6",
          width: "2.1",
          height: "6.2",
          rx: "1",
          fill: "#3B4A5A",
        }),
        React.createElement("rect", {
          x: "0.5",
          y: "-6",
          width: "2.1",
          height: "6.2",
          rx: "1",
          fill: "#34424F",
        }),
        React.createElement("rect", {
          x: "-3.6",
          y: "-13.5",
          width: "7.2",
          height: "8.5",
          rx: "3",
          fill: s,
        }),
        React.createElement("circle", {
          cx: "0",
          cy: "-17",
          r: "3.5",
          fill: n,
        }),
        React.createElement("path", {
          d: "M-3.6,-17.4 a3.6,3.6 0 0 1 7.2,0 q-3.6,-1.4 -7.2,0 z",
          fill: o,
        }),
      ),
    );
  }
  function Ft({ sx: e, sy: t, h: s = 28, c: n = "#E9B949", w: o = 16 }) {
    return React.createElement(
      "g",
      null,
      React.createElement("line", {
        x1: e,
        y1: t,
        x2: e,
        y2: t - s,
        stroke: "#6F5A45",
        strokeWidth: "1.6",
        strokeLinecap: "round",
      }),
      React.createElement("circle", {
        cx: e,
        cy: t - s - 1,
        r: "1.6",
        fill: "#E9B949",
      }),
      React.createElement("path", {
        className: "flag-wave",
        d: `M${e},${t - s} q${o * 0.5},-3 ${o},1 l0,${o * 0.55} q-${o * 0.5},-3 -${o},-1 z`,
        fill: n,
      }),
    );
  }
  function ss({ sx: e, sy: t, c: s = "#F4EFE7", n = 3, s: o = 1 }) {
    return React.createElement(
      "g",
      null,
      Array.from({ length: n }).map((i, l) =>
        React.createElement("circle", {
          key: l,
          className: "smoke",
          style: { animationDelay: `${l * 1.1}s` },
          cx: e,
          cy: t,
          r: 4.2 * o,
          fill: s,
        }),
      ),
    );
  }
  function nt({ sx: e, sy: t, h: s = 22, lit: n = !0 }) {
    return React.createElement(
      "g",
      null,
      React.createElement("ellipse", {
        cx: e + 3,
        cy: t + 1,
        rx: "4",
        ry: "1.5",
        fill: "rgba(0,0,0,0.2)",
      }),
      React.createElement("line", {
        x1: e,
        y1: t,
        x2: e,
        y2: t - s,
        stroke: "#44545A",
        strokeWidth: "1.6",
      }),
      React.createElement("circle", {
        cx: e,
        cy: t - s,
        r: "7",
        fill: "#FFD98A",
        opacity: "0.28",
        className: "lamp-glow",
      }),
      React.createElement("circle", {
        cx: e,
        cy: t - s,
        r: "2.6",
        fill: n ? "#FFE6A8" : "#E7E0CF",
        stroke: "#44545A",
        strokeWidth: "0.8",
      }),
    );
  }
  function Rt({ sx: e, sy: t, c: s = "#D9734E", r: n = 13 }) {
    return React.createElement(
      "g",
      null,
      React.createElement("ellipse", {
        cx: e + 6,
        cy: t + 1,
        rx: n,
        ry: n * 0.4,
        fill: "rgba(0,0,0,0.13)",
      }),
      React.createElement("ellipse", {
        cx: e,
        cy: t - 4,
        rx: "5",
        ry: "2",
        fill: "#E9DDC8",
        stroke: D.stroke,
        strokeWidth: "0.5",
      }),
      React.createElement("line", {
        x1: e,
        y1: t - 3,
        x2: e,
        y2: t - 20,
        stroke: "#6F5A45",
        strokeWidth: "1.3",
      }),
      React.createElement("path", {
        d: `M${e - n},${t - 18} Q${e},${t - 30} ${e + n},${t - 18} Q${e},${t - 22} ${e - n},${t - 18} Z`,
        fill: s,
      }),
      React.createElement("path", {
        d: `M${e - n * 0.35},${t - 20.5} Q${e},${t - 30} ${e + n * 0.35},${t - 20.5} Q${e},${t - 21.8} ${e - n * 0.35},${t - 20.5} Z`,
        fill: "#FFF3E0",
      }),
    );
  }
  function $t({ x: e, y: t }) {
    return React.createElement(
      "g",
      null,
      React.createElement(b, {
        x: e,
        y: t,
        z: 3,
        w: 14,
        d: 4,
        h: 1.5,
        c: D.wood,
      }),
      React.createElement(b, {
        x: e - 5,
        y: t,
        w: 1.5,
        d: 3,
        h: 3,
        c: D.woodD,
      }),
      React.createElement(b, {
        x: e + 5,
        y: t,
        w: 1.5,
        d: 3,
        h: 3,
        c: D.woodD,
      }),
    );
  }
  function ns({ x: e, y: t, z: s = 0, s: n = 8, c: o = "#C8955E" }) {
    let i = { x: e, y: t, z: s, w: n, d: n, h: n };
    return React.createElement(
      "g",
      null,
      React.createElement(b, { ...i, c: o }),
      React.createElement("polygon", {
        points: me("left", i, 0.1, 0.9, 0.45, 0.55),
        fill: T(o, -0.2),
      }),
    );
  }
  function dn({ x: e, y: t, z: s = 0, len: n = 30, r: o = 3.4 }) {
    let [i, l] = ye(e - n / 2, t, s + o),
      [d, p] = ye(e + n / 2, t, s + o);
    return React.createElement(
      "g",
      null,
      React.createElement("line", {
        x1: i,
        y1: l,
        x2: d,
        y2: p,
        stroke: "#8E6240",
        strokeWidth: o * 2,
        strokeLinecap: "butt",
      }),
      React.createElement("line", {
        x1: i,
        y1: l - o * 0.55,
        x2: d,
        y2: p - o * 0.55,
        stroke: "#A9794F",
        strokeWidth: o * 0.6,
      }),
      React.createElement("ellipse", {
        cx: d,
        cy: p,
        rx: o * 0.75,
        ry: o,
        fill: "#E4C08E",
        stroke: "#8E6240",
        strokeWidth: "0.8",
      }),
      React.createElement("ellipse", {
        cx: d,
        cy: p,
        rx: o * 0.32,
        ry: o * 0.45,
        fill: "none",
        stroke: "#C49A66",
        strokeWidth: "0.6",
      }),
    );
  }
  function pn({
    x: e = 0,
    y: t = 0,
    hull: s = "#2F4E5A",
    flag: n = "#E9B949",
    cargo: o = [],
    s: i = 1,
    cls: l = "bob",
    delay: d = 0,
    title: p,
    onClick: u,
  }) {
    let k = [
        [-32, -11],
        [18, -11],
        [32, 0],
        [18, 11],
        [-32, 11],
      ],
      f = [
        [-64 / 2, 22 / 2, 7],
        [64 / 2 - 14, 22 / 2, 7],
        [64 / 2, 0, 7],
        [64 / 2 - 4, 0, 0],
        [64 / 2 - 16, 22 / 2 - 3, 0],
        [-64 / 2 + 3, 22 / 2 - 3, 0],
      ],
      w = [
        [-64 / 2, 22 / 2, 7],
        [64 / 2 - 14, 22 / 2, 7],
        [64 / 2, 0, 7],
        [64 / 2 - 0.8, 0, 5],
        [64 / 2 - 14.5, 22 / 2 - 0.6, 5],
        [-64 / 2 + 0.5, 22 / 2 - 0.6, 5],
      ],
      [v, $] = ye(e, t);
    return React.createElement(
      "g",
      {
        transform: `translate(${L(v)},${L($)}) scale(${i})`,
        onClick: u,
        style: u ? { cursor: "pointer" } : null,
      },
      p && React.createElement("title", null, p),
      React.createElement(
        "g",
        { className: l, style: { animationDelay: d + "s" } },
        React.createElement("ellipse", {
          cx: "4",
          cy: "6",
          rx: "46",
          ry: "15",
          fill: "rgba(10,50,60,0.18)",
        }),
        React.createElement("ellipse", {
          className: "ripple",
          cx: "0",
          cy: "4",
          rx: "44",
          ry: "15",
          fill: "none",
          stroke: "rgba(255,255,255,0.55)",
          strokeWidth: "1.2",
        }),
        React.createElement("polygon", {
          points: J(f),
          fill: s,
          stroke: D.stroke,
          strokeWidth: "0.7",
        }),
        React.createElement("polygon", {
          points: J(w),
          fill: "#F6EDDF",
          opacity: "0.9",
        }),
        React.createElement("polygon", {
          points: J(k.map((E) => [E[0], E[1], 7])),
          fill: "#D8B384",
          stroke: D.stroke,
          strokeWidth: "0.7",
        }),
        o
          .slice(0, 2)
          .map((E, M) =>
            React.createElement(b, {
              key: M,
              x: 4 + M * 16,
              y: 0,
              z: 7,
              w: 14,
              d: 14,
              h: 9,
              c: E,
            }),
          ),
        React.createElement(b, {
          x: -64 / 2 + 11,
          y: 0,
          z: 7,
          w: 14,
          d: 14,
          h: 12,
          c: "#F6EDDF",
        }),
        React.createElement(b, {
          x: -64 / 2 + 11,
          y: 0,
          z: 19,
          w: 16,
          d: 16,
          h: 1.6,
          c: s,
        }),
        React.createElement("polygon", {
          points: me(
            "left",
            { x: -64 / 2 + 11, y: 0, z: 7, w: 14, d: 14, h: 12 },
            0.2,
            0.8,
            0.5,
            0.8,
          ),
          fill: D.glass,
        }),
        React.createElement(Ft, {
          sx: ye(-64 / 2 + 11, 0, 21)[0],
          sy: ye(-64 / 2 + 11, 0, 21)[1],
          h: 12,
          w: 10,
          c: n,
        }),
      ),
    );
  }
  var m = (e, t, s = 0) => ye(e, t, s),
    ge = ({ a: e, b: t, c: s = D.dark, w: n = 1 }) =>
      React.createElement("line", {
        x1: e[0],
        y1: e[1],
        x2: t[0],
        y2: t[1],
        stroke: s,
        strokeWidth: n,
        strokeLinecap: "round",
      }),
    ae = ({ x: e, y: t, z: s = 0, h: n, c: o = "#44545A", s: i = 2 }) =>
      React.createElement(b, { x: e, y: t, z: s, w: i, d: i, h: n, c: o });
  function xo({ tier: e, c: t }) {
    let s = "#EDF1F2",
      n = (o) => [{ z1: o - 7, z2: o - 3.5, c: t }];
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 128, d: 104, c: "#DDD5C5" }),
      e >= 2 &&
        React.createElement(re, {
          x: -46,
          y: -40,
          r: 2.6,
          h: 58,
          c: "#C7CED2",
          bands: [
            { z1: 44, z2: 50, c: "#D9534F" },
            { z1: 32, z2: 38, c: "#F6EDDF" },
          ],
        }),
      e >= 2 &&
        React.createElement("path", {
          className: "flame",
          d: `M${m(-46, -40, 58)[0]},${m(-46, -40, 58)[1] + 1} q-5,-7 0,-15 q5,8 0,15 z`,
          fill: "#F7A441",
        }),
      e >= 3 &&
        React.createElement(re, {
          x: -28,
          y: -14,
          r: 15,
          h: 28,
          c: s,
          bands: n(28),
        }),
      React.createElement(b, {
        x: 22,
        y: -50,
        w: 70,
        d: 2,
        h: 4,
        c: "#CBBFAC",
      }),
      React.createElement(b, {
        x: -13,
        y: -26,
        w: 2,
        d: 48,
        h: 4,
        c: "#CBBFAC",
      }),
      React.createElement(re, {
        x: 4,
        y: -34,
        r: 12,
        h: 22,
        c: s,
        bands: n(22),
      }),
      React.createElement(b, { x: -36, y: 28, w: 36, d: 26, h: 18, c: D.wall }),
      React.createElement(oe, {
        b: { x: -36, y: 28, z: 0, w: 36, d: 26, h: 18 },
        face: "left",
        cols: 3,
        v0: 0.4,
        v1: 0.78,
      }),
      React.createElement(ut, {
        b: { x: -36, y: 28, z: 0, w: 36, d: 26, h: 18 },
        face: "right",
        u: 0.5,
        h: 0.6,
        c: T(t, -0.3),
      }),
      React.createElement(b, {
        x: -36,
        y: 28,
        z: 18,
        w: 38,
        d: 28,
        h: 2.6,
        c: t,
      }),
      e >= 2 &&
        React.createElement(re, {
          x: 22,
          y: -12,
          r: 10,
          h: 18,
          c: s,
          bands: n(18),
        }),
      React.createElement(re, {
        x: 36,
        y: -30,
        r: 15,
        h: 27,
        c: s,
        bands: n(27),
      }),
      e >= 3 &&
        React.createElement(re, {
          x: 60,
          y: -42,
          r: 6,
          h: 74,
          c: "#D3DADD",
          bands: [
            { z1: 20, z2: 22, c: D.dark },
            { z1: 40, z2: 42, c: D.dark },
            { z1: 60, z2: 62, c: D.dark },
          ],
        }),
      e >= 2 &&
        React.createElement(
          "g",
          null,
          [-10, 10, 30, 50].map((o) =>
            React.createElement(
              "g",
              { key: o },
              React.createElement(ae, { x: o, y: 6, h: 14 }),
              React.createElement(ae, { x: o, y: 14, h: 14 }),
            ),
          ),
          React.createElement(b, {
            x: 20,
            y: 10,
            z: 14,
            w: 66,
            d: 10,
            h: 1.6,
            c: "#A8B3B8",
          }),
          React.createElement(b, {
            x: 20,
            y: 7.5,
            z: 15.6,
            w: 66,
            d: 2.6,
            h: 2.6,
            c: "#E0B84A",
          }),
          React.createElement(b, {
            x: 20,
            y: 12.5,
            z: 15.6,
            w: 66,
            d: 2.6,
            h: 2.6,
            c: t,
          }),
        ),
      React.createElement(b, { x: 22, y: -2, w: 70, d: 2, h: 4, c: "#CBBFAC" }),
      React.createElement(b, {
        x: 57,
        y: -26,
        w: 2,
        d: 48,
        h: 4,
        c: "#CBBFAC",
      }),
      React.createElement(We, { sx: m(-60, 44)[0], sy: m(-60, 44)[1] }),
      React.createElement(nt, { sx: m(-10, 44)[0], sy: m(-10, 44)[1] }),
    );
  }
  function ko({ tier: e, c: t }) {
    let s = { x: -6, y: -4, z: 0, w: 52, d: 42, h: 38 },
      n = { x: -36, y: -34, z: 0, w: 28, d: 28, h: 64 },
      o = [0.52, 0.66, 0.8].map((i) => [
        le("left", s, 0.09, i),
        le("left", s, 0.29, i),
      ]);
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 98, d: 86, c: D.pave }),
      e >= 3 &&
        React.createElement(
          "g",
          null,
          React.createElement(b, { ...n, c: D.wall2 }),
          React.createElement(oe, {
            b: n,
            face: "left",
            cols: 2,
            rows: 4,
            v0: 0.2,
            v1: 0.9,
          }),
          React.createElement(oe, {
            b: n,
            face: "right",
            cols: 1,
            rows: 4,
            v0: 0.2,
            v1: 0.9,
            u0: 0.3,
            u1: 0.7,
          }),
          React.createElement(b, {
            x: n.x,
            y: n.y,
            z: 64,
            w: 30,
            d: 30,
            h: 3,
            c: t,
          }),
        ),
      React.createElement(ht, { sx: m(34, -40)[0], sy: m(34, -40)[1], v: 1 }),
      React.createElement(b, { ...s, c: D.wall }),
      React.createElement("polygon", {
        points: me("left", s, 0.06, 0.32, 0.34, 0.94),
        fill: "#2F5D8A",
        stroke: "#F6EDDF",
        strokeWidth: "1",
      }),
      o.map((i, l) =>
        React.createElement(ge, {
          key: l,
          a: i[0],
          b: i[1],
          c: "rgba(246,237,223,0.75)",
          w: 0.8,
        }),
      ),
      React.createElement(oe, {
        b: s,
        face: "left",
        cols: 2,
        rows: 2,
        u0: 0.42,
        u1: 0.92,
        v0: 0.38,
        v1: 0.9,
      }),
      React.createElement(oe, {
        b: s,
        face: "right",
        cols: 2,
        rows: 1,
        v0: 0.6,
        v1: 0.88,
      }),
      React.createElement(ut, {
        b: s,
        face: "right",
        u: 0.5,
        h: 0.42,
        c: T(t, -0.25),
      }),
      React.createElement(b, {
        x: s.x,
        y: s.y,
        z: 38,
        w: 54,
        d: 44,
        h: 3,
        c: T(t, 0.25),
        top: T(t, 0.45),
      }),
      e >= 2 &&
        React.createElement(
          "g",
          null,
          React.createElement(Rt, {
            sx: m(-10, -8, 41)[0],
            sy: m(-10, -8, 41)[1],
            c: t,
            r: 11,
          }),
          React.createElement(b, {
            x: 8,
            y: 8,
            z: 41,
            w: 10,
            d: 5,
            h: 4,
            c: "#8A6446",
          }),
          React.createElement(We, {
            sx: m(8, 8, 45)[0],
            sy: m(8, 8, 45)[1],
            s: 0.7,
            flower: "#F4A3B5",
          }),
          React.createElement(b, {
            x: 34,
            y: 24,
            w: 28,
            d: 24,
            h: 20,
            c: D.wall2,
          }),
          React.createElement(oe, {
            b: { x: 34, y: 24, z: 0, w: 28, d: 24, h: 20 },
            face: "left",
            cols: 1,
            u0: 0.3,
            u1: 0.7,
          }),
          React.createElement(st, {
            x: 34,
            y: 24,
            z: 20,
            w: 28,
            d: 24,
            rh: 12,
            c: t,
            wall: D.wall2,
            axis: "y",
          }),
        ),
      React.createElement($t, { x: 6, y: 36 }),
      React.createElement(We, {
        sx: m(-44, 34)[0],
        sy: m(-44, 34)[1],
        flower: "#F2C14E",
      }),
      React.createElement(nt, { sx: m(30, 42)[0], sy: m(30, 42)[1] }),
    );
  }
  function vo({ tier: e, c: t }) {
    let s = { x: -4, y: -6, z: 0, w: 66, d: 46, h: 26 },
      n = 28.6,
      o = [0.3, 0.45, 0.6].map((d) => [
        le("left", s, 0.1, d),
        le("left", s, 0.4, d),
      ]),
      i = m(16, -8, 42),
      l = m(0, -8, 34);
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 100, d: 84, c: "#E4DBCA" }),
      e >= 3 &&
        React.createElement(
          "g",
          null,
          React.createElement(b, {
            x: 44,
            y: -34,
            w: 26,
            d: 14,
            h: 12,
            c: "#F6EDDF",
          }),
          React.createElement("polygon", {
            points: me(
              "left",
              { x: 44, y: -34, z: 0, w: 26, d: 14, h: 12 },
              0,
              1,
              0.45,
              0.62,
            ),
            fill: t,
          }),
          React.createElement(b, {
            x: 60,
            y: -34,
            w: 8,
            d: 14,
            h: 9,
            c: T(t, -0.05),
          }),
        ),
      React.createElement(b, { ...s, c: "#F2E9DA" }),
      React.createElement("polygon", {
        points: me("left", s, 0.1, 0.4, 0, 0.72),
        fill: "#A3AEB4",
        stroke: D.stroke,
        strokeWidth: "0.7",
      }),
      o.map((d, p) =>
        React.createElement(ge, {
          key: p,
          a: d[0],
          b: d[1],
          c: "#7F8B91",
          w: 0.8,
        }),
      ),
      React.createElement(oe, {
        b: s,
        face: "left",
        cols: 1,
        u0: 0.52,
        u1: 0.9,
        v0: 0.42,
        v1: 0.8,
      }),
      React.createElement(oe, {
        b: s,
        face: "right",
        cols: 2,
        v0: 0.42,
        v1: 0.8,
      }),
      React.createElement(b, {
        x: s.x,
        y: s.y,
        z: 26,
        w: 68,
        d: 48,
        h: 2.6,
        c: t,
      }),
      React.createElement(ae, { x: -12, y: -20, z: n, h: 22 }),
      React.createElement(ae, { x: 12, y: -20, z: n, h: 22 }),
      React.createElement(ae, { x: -12, y: 4, z: n, h: 22 }),
      React.createElement(b, {
        x: 0,
        y: -20,
        z: n + 22,
        w: 26,
        d: 2,
        h: 2,
        c: "#44545A",
      }),
      React.createElement(b, {
        x: -12,
        y: -8,
        z: n + 22,
        w: 2,
        d: 26,
        h: 2,
        c: "#44545A",
      }),
      React.createElement(b, {
        x: 0,
        y: -8,
        z: n,
        w: 13,
        d: 13,
        h: 3.2,
        c: "#F08A4B",
      }),
      React.createElement(b, {
        x: 0,
        y: -8,
        z: n + 3.2,
        w: 9,
        d: 9,
        h: 2,
        c: "#F6A36E",
      }),
      React.createElement(
        "g",
        { className: "print-head" },
        React.createElement(b, {
          x: 0,
          y: -8,
          z: n + 17,
          w: 8,
          d: 26,
          h: 3,
          c: "#58666C",
        }),
        React.createElement(b, {
          x: 0,
          y: -8,
          z: n + 10,
          w: 8,
          d: 8,
          h: 7,
          c: t,
        }),
        React.createElement("path", {
          d: `M${l[0] - 3.5},${l[1] - 4} L${l[0] + 3.5},${l[1] - 4} L${l[0]},${l[1] + 1} Z`,
          fill: "#E9B949",
        }),
      ),
      React.createElement(ae, { x: 12, y: 4, z: n, h: 22 }),
      React.createElement(b, {
        x: 0,
        y: 4,
        z: n + 22,
        w: 26,
        d: 2,
        h: 2,
        c: "#44545A",
      }),
      React.createElement(b, {
        x: 12,
        y: -8,
        z: n + 22,
        w: 2,
        d: 26,
        h: 2,
        c: "#44545A",
      }),
      React.createElement("circle", {
        cx: i[0] + 6,
        cy: i[1],
        r: "6.5",
        fill: "#E0474C",
        stroke: D.stroke,
        strokeWidth: "0.7",
      }),
      React.createElement("circle", {
        cx: i[0] + 6,
        cy: i[1],
        r: "2.4",
        fill: "#F6EDDF",
      }),
      e >= 2 &&
        React.createElement(
          "g",
          null,
          React.createElement(b, {
            x: 38,
            y: 28,
            w: 24,
            d: 20,
            h: 16,
            c: D.wall2,
          }),
          React.createElement(oe, {
            b: { x: 38, y: 28, z: 0, w: 24, d: 20, h: 16 },
            face: "left",
            cols: 1,
            u0: 0.3,
            u1: 0.7,
          }),
          React.createElement(st, {
            x: 38,
            y: 28,
            z: 16,
            w: 24,
            d: 20,
            rh: 10,
            c: t,
            wall: D.wall2,
            axis: "x",
          }),
          React.createElement(ns, { x: -40, y: 26 }),
          React.createElement(ns, { x: -30, y: 30 }),
          React.createElement(ns, { x: -35, y: 28, z: 8, c: "#B8844F" }),
        ),
      e >= 3 &&
        React.createElement(
          "g",
          null,
          React.createElement(b, {
            x: -10,
            y: 34,
            w: 18,
            d: 12,
            h: 7,
            c: "#2E3A40",
          }),
          React.createElement(Nt, {
            x: -10,
            y: 34,
            z: 7.3,
            a: 4,
            b: 3,
            fill: t,
          }),
        ),
      React.createElement(We, { sx: m(44, -2)[0], sy: m(44, -2)[1] }),
      React.createElement(nt, { sx: m(-46, 40)[0], sy: m(-46, 40)[1] }),
    );
  }
  function wo({ tier: e, c: t }) {
    let s = { x: -12, y: -10, z: 0, w: 52, d: 40, h: 24 },
      n = "#B4613D",
      o = le("left", s, 0.36, 0),
      i = le("left", s, 0.64, 0.72),
      l = le("left", s, 0.64, 0),
      d = le("left", s, 0.36, 0.72),
      p = (u, c, r) => {
        let y = [];
        return (
          (r >= 6 ? [3, 2, 1] : [3, 2]).forEach((w, v) => {
            for (let $ = 0; $ < w; $++)
              y.push(
                React.createElement(dn, {
                  key: v + "-" + $,
                  x: u,
                  y: c + v * 3.4 + $ * 6.8,
                  z: v * 5.6,
                  len: 28,
                  r: 3.3,
                }),
              );
          }),
          y
        );
      };
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 102, d: 88, c: "#DCC59F" }),
      React.createElement(Ot, { sx: m(-58, -30)[0], sy: m(-58, -30)[1] }),
      e >= 3 &&
        React.createElement(
          "g",
          null,
          React.createElement(re, {
            x: -46,
            y: -42,
            r: 8,
            h: 38,
            c: "#A9583B",
          }),
          React.createElement(ss, {
            sx: m(-46, -42, 40)[0],
            sy: m(-46, -42, 40)[1],
          }),
        ),
      e >= 3 && p(40, -34, 3),
      React.createElement(b, { ...s, c: n }),
      React.createElement("polygon", {
        points: me("left", s, 0.36, 0.64, 0, 0.72),
        fill: "#7E3F28",
        stroke: D.stroke,
        strokeWidth: "0.7",
      }),
      React.createElement(ge, { a: o, b: i, c: "#F1D9B8", w: 1.1 }),
      React.createElement(ge, { a: l, b: d, c: "#F1D9B8", w: 1.1 }),
      React.createElement("polygon", {
        points: me("right", s, 0.4, 0.6, 0.55, 0.85),
        fill: "#F1D9B8",
      }),
      React.createElement(st, {
        x: s.x,
        y: s.y,
        z: 24,
        w: 52,
        d: 40,
        rh: 16,
        c: "#6A4934",
        wall: n,
        axis: "x",
      }),
      e >= 2 &&
        React.createElement(
          "g",
          null,
          React.createElement(ae, { x: -54, y: 18, h: 18, c: D.woodD }),
          React.createElement(ae, { x: -26, y: 18, h: 18, c: D.woodD }),
          React.createElement(b, {
            x: -40,
            y: 28,
            w: 22,
            d: 8,
            h: 6,
            c: D.wood,
          }),
          React.createElement(
            "g",
            { className: "spin-box" },
            React.createElement("circle", {
              className: "spin",
              cx: m(-40, 28, 12)[0],
              cy: m(-40, 28, 12)[1],
              r: "6.5",
              fill: "#D8DEE1",
              stroke: "#7F8B91",
              strokeWidth: "1.6",
              strokeDasharray: "2 1.6",
            }),
          ),
          React.createElement(ae, { x: -54, y: 38, h: 18, c: D.woodD }),
          React.createElement(ae, { x: -26, y: 38, h: 18, c: D.woodD }),
          React.createElement(b, {
            x: -40,
            y: 28,
            z: 18,
            w: 32,
            d: 26,
            h: 2,
            c: "#8A6446",
          }),
          [0, 2, 4].map((u) =>
            React.createElement(b, {
              key: u,
              x: 12,
              y: 36,
              z: u,
              w: 26,
              d: 10,
              h: 2,
              c: u === 4 ? "#E4C08E" : "#D9B283",
            }),
          ),
        ),
      p(28, 14, e >= 2 ? 6 : 5),
      React.createElement(We, { sx: m(-50, 44)[0], sy: m(-50, 44)[1] }),
      React.createElement(Ot, {
        sx: m(52, -48)[0],
        sy: m(52, -48)[1],
        s: 0.85,
      }),
    );
  }
  function bo({ tier: e, c: t }) {
    let s = { x: -10, y: -12, z: 0, w: 44, d: 36, h: 24 },
      n = s.x - s.w / 2,
      o = s.y + s.d / 2,
      i = Array.from({ length: 6 }).map((y, k) => {
        let f = n + (k * s.w) / 6,
          w = f + s.w / 6;
        return React.createElement("polygon", {
          key: k,
          points: J([
            [f, o, 18],
            [w, o, 18],
            [w, o + 11, 12],
            [f, o + 11, 12],
          ]),
          fill: k % 2 ? "#FFF3E0" : t,
          stroke: D.stroke,
          strokeWidth: "0.5",
        });
      }),
      l = { x: 30, y: -28, z: 0, w: 34, d: 16, h: 18 },
      d = [];
    for (let y = -38; y <= 38; y += 8)
      d.push(
        React.createElement(ge, {
          key: y,
          a: m(-46, y, 1.9),
          b: m(46, y, 1.9),
          c: "rgba(140,100,60,0.18)",
          w: 0.7,
        }),
      );
    let p = m(20, -26),
      u = (y, k, f) =>
        React.createElement(
          "g",
          { key: y + "," + k },
          React.createElement(Rt, { sx: m(y, k)[0], sy: m(y, k)[1], c: f }),
        ),
      c = m(-40, 40, 20),
      r = m(38, 32, 20);
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 94, d: 82, c: "#E8D0A8" }),
      d,
      React.createElement(b, { ...s, c: D.wall }),
      React.createElement(oe, {
        b: s,
        face: "left",
        cols: 2,
        u0: 0.08,
        u1: 0.58,
        v0: 0.36,
        v1: 0.74,
      }),
      React.createElement(ut, {
        b: s,
        face: "left",
        u: 0.76,
        h: 0.62,
        c: T(t, -0.3),
      }),
      React.createElement(oe, {
        b: s,
        face: "right",
        cols: 1,
        u0: 0.3,
        u1: 0.7,
        v0: 0.4,
        v1: 0.78,
      }),
      React.createElement(b, {
        x: -2,
        y: -24,
        z: 24,
        w: 5,
        d: 5,
        h: 15,
        c: "#A9583B",
      }),
      React.createElement(st, {
        x: s.x,
        y: s.y,
        z: 24,
        w: 44,
        d: 36,
        rh: 15,
        c: t,
        axis: "y",
      }),
      React.createElement(ss, {
        sx: m(-2, -24, 40)[0],
        sy: m(-2, -24, 40)[1],
        c: "#FFF8EC",
      }),
      i,
      React.createElement("line", {
        x1: p[0],
        y1: p[1],
        x2: p[0],
        y2: p[1] - 20,
        stroke: "#6F5A45",
        strokeWidth: "1.6",
      }),
      React.createElement("circle", {
        cx: p[0],
        cy: p[1] - 26,
        r: "8",
        fill: "#FFF3E0",
        stroke: T(t, -0.2),
        strokeWidth: "1.4",
      }),
      React.createElement("path", {
        d: `M${p[0] - 3.6},${p[1] - 28} h7 v4 a3.5,3.5 0 0 1 -7,0 z`,
        fill: "#7B4A2E",
      }),
      React.createElement("path", {
        d: `M${p[0] + 3.4},${p[1] - 27} a2,2 0 0 1 0,3.4`,
        stroke: "#7B4A2E",
        strokeWidth: "1",
        fill: "none",
      }),
      e >= 3 &&
        React.createElement(
          "g",
          null,
          React.createElement(b, { ...l, c: "#7FB069" }),
          [0.1, 0.2, 0.8, 0.9].map((y) =>
            React.createElement(ge, {
              key: y,
              a: le("left", l, y, 0.05),
              b: le("left", l, y, 0.95),
              c: "rgba(40,70,30,0.35)",
              w: 0.8,
            }),
          ),
          React.createElement("polygon", {
            points: me("left", l, 0.28, 0.72, 0.34, 0.78),
            fill: "#2F3B2A",
          }),
          React.createElement("polygon", {
            points: J([
              [l.x - 7, l.y + 8, 14],
              [l.x + 7, l.y + 8, 14],
              [l.x + 7, l.y + 15, 11],
              [l.x - 7, l.y + 15, 11],
            ]),
            fill: "#F6EDDF",
            stroke: D.stroke,
            strokeWidth: "0.5",
          }),
          React.createElement(b, {
            x: l.x,
            y: l.y,
            z: 18,
            w: 22,
            d: 3,
            h: 6,
            c: "#F6EDDF",
          }),
        ),
      u(-6, 28, t),
      u(22, 18, "#2A9D8F"),
      e >= 2 &&
        React.createElement(
          "g",
          null,
          u(-30, 34, "#2A9D8F"),
          u(36, 2, t),
          React.createElement(b, {
            x: -42,
            y: 16,
            w: 8,
            d: 8,
            h: 5,
            c: "#8A6446",
          }),
          React.createElement(We, {
            sx: m(-42, 16, 5)[0],
            sy: m(-42, 16, 5)[1],
            s: 0.7,
            flower: "#F4A3B5",
          }),
          React.createElement("line", {
            x1: c[0],
            y1: c[1] + 20,
            x2: c[0],
            y2: c[1],
            stroke: "#6F5A45",
            strokeWidth: "1.4",
          }),
          React.createElement("line", {
            x1: r[0],
            y1: r[1] + 20,
            x2: r[0],
            y2: r[1],
            stroke: "#6F5A45",
            strokeWidth: "1.4",
          }),
          React.createElement("path", {
            d: `M${c[0]},${c[1]} Q${(c[0] + r[0]) / 2},${(c[1] + r[1]) / 2 + 14} ${r[0]},${r[1]}`,
            stroke: "#5A4A3A",
            strokeWidth: "0.7",
            fill: "none",
          }),
          [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((y) => {
            let k = (c[0] + r[0]) / 2,
              f = (c[1] + r[1]) / 2 + 14,
              w = (1 - y) * (1 - y) * c[0] + 2 * (1 - y) * y * k + y * y * r[0],
              v = (1 - y) * (1 - y) * c[1] + 2 * (1 - y) * y * f + y * y * r[1];
            return React.createElement("circle", {
              key: y,
              cx: w,
              cy: v + 1.5,
              r: "1.8",
              fill: "#FFE08A",
              className: "twinkle",
              style: { animationDelay: y * 3 + "s" },
            });
          }),
        ),
      React.createElement(Mt, {
        sx: m(44, -44)[0],
        sy: m(44, -44)[1],
        flip: !0,
      }),
    );
  }
  function No({ tier: e, c: t }) {
    let s = { x: -8, y: -6, z: 0, w: 60, d: 46, h: 30 },
      n = m(38, -40, 0),
      o = m(38, -40, 86),
      i = [];
    for (let r = 0; r < 7; r++) {
      let y = r / 7,
        k = (r + 1) / 7,
        f = 9 * (1 - y) + 2,
        w = 9 * (1 - k) + 2,
        v = n[1] - 86 * y,
        $ = n[1] - 86 * k;
      (i.push(
        React.createElement(ge, {
          key: "a" + r,
          a: [n[0] - f, v],
          b: [n[0] + w, $],
          c: "#8E9BA2",
          w: 0.8,
        }),
      ),
        i.push(
          React.createElement(ge, {
            key: "b" + r,
            a: [n[0] + f, v],
            b: [n[0] - w, $],
            c: "#8E9BA2",
            w: 0.8,
          }),
        ));
    }
    let l = le("left", s, 0.84, 0.74),
      d = [
        le("right", s, 0.42, 0.44),
        le("right", s, 0.42, 0.68),
        le("right", s, 0.62, 0.56),
      ],
      p = m(42, 24),
      u = { x: -40, y: 40, z: 14, w: 36, d: 3, h: 20 },
      c = [
        le("left", u, 0.44, 0.3),
        le("left", u, 0.44, 0.72),
        le("left", u, 0.6, 0.51),
      ];
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 104, d: 88, c: "#DDD6CB" }),
      React.createElement(ge, {
        a: [n[0] - 11, n[1]],
        b: [o[0] - 2, o[1]],
        c: "#9AA7AE",
        w: 1.6,
      }),
      React.createElement(ge, {
        a: [n[0] + 11, n[1]],
        b: [o[0] + 2, o[1]],
        c: "#9AA7AE",
        w: 1.6,
      }),
      i,
      React.createElement("circle", {
        cx: o[0],
        cy: o[1] - 2,
        r: "6",
        fill: "#FF5A5A",
        opacity: "0.35",
        className: "blink",
      }),
      React.createElement("circle", {
        cx: o[0],
        cy: o[1] - 2,
        r: "2.4",
        fill: "#FF3B3B",
      }),
      React.createElement(b, { ...s, c: "#EFE8DD" }),
      React.createElement("polygon", {
        points: me("left", s, 0.08, 0.46, 0, 0.8),
        fill: "#5A6068",
        stroke: D.stroke,
        strokeWidth: "0.7",
      }),
      React.createElement(ge, {
        a: le("left", s, 0.27, 0),
        b: le("left", s, 0.27, 0.8),
        c: "#474C53",
        w: 0.8,
      }),
      React.createElement("polygon", {
        points: me("left", s, 0, 1, 0.86, 0.95),
        fill: t,
      }),
      React.createElement("circle", {
        cx: l[0],
        cy: l[1],
        r: "7",
        fill: "#FF4B4B",
        opacity: "0.35",
        className: "blink",
      }),
      React.createElement("circle", {
        cx: l[0],
        cy: l[1],
        r: "3.2",
        fill: "#E0474C",
        stroke: "#FFF",
        strokeWidth: "0.8",
      }),
      React.createElement("polygon", {
        points: me("right", s, 0.22, 0.78, 0.3, 0.8),
        fill: t,
        stroke: "#FFF8EC",
        strokeWidth: "1",
      }),
      React.createElement("polygon", {
        points: d.map((r) => r.join(",")).join(" "),
        fill: "#FFFFFF",
      }),
      React.createElement(b, {
        x: s.x,
        y: s.y,
        z: 30,
        w: 62,
        d: 48,
        h: 3,
        c: "#50555D",
      }),
      e >= 2 &&
        React.createElement(
          "g",
          null,
          React.createElement("line", {
            x1: m(-24, -20, 33)[0],
            y1: m(-24, -20, 33)[1],
            x2: m(-24, -20, 33)[0],
            y2: m(-24, -20, 33)[1] - 8,
            stroke: "#44545A",
            strokeWidth: "1.4",
          }),
          React.createElement("ellipse", {
            cx: m(-24, -20, 33)[0] + 1,
            cy: m(-24, -20, 33)[1] - 11,
            rx: "7",
            ry: "4.5",
            fill: "#E9EEF0",
            stroke: D.stroke,
            strokeWidth: "0.7",
            transform: `rotate(-24 ${m(-24, -20, 33)[0]} ${m(-24, -20, 33)[1] - 11})`,
          }),
          React.createElement("path", {
            d: `M${p[0] - 30},${p[1]} A30,28 0 0 1 ${p[0] + 30},${p[1]} A30,14 0 0 1 ${p[0] - 30},${p[1]} Z`,
            fill: "#E8E0D4",
            stroke: D.stroke,
            strokeWidth: "0.7",
          }),
          React.createElement("path", {
            d: `M${p[0] - 30},${p[1]} A30,28 0 0 1 ${p[0] + 30},${p[1]} A30,14 0 0 1 ${p[0] - 30},${p[1]} Z`,
            fill: "url(#cylShade)",
          }),
          React.createElement("path", {
            d: `M${p[0] - 27},${p[1] - 8} A28,10 0 0 0 ${p[0] + 27},${p[1] - 8}`,
            stroke: t,
            strokeWidth: "3",
            fill: "none",
          }),
        ),
      e >= 3 &&
        React.createElement(
          "g",
          null,
          React.createElement(ae, { x: -54, y: 40, h: 14 }),
          React.createElement(ae, { x: -26, y: 40, h: 14 }),
          React.createElement(b, { ...u, c: "#2F3B40" }),
          React.createElement("polygon", {
            points: me("left", u, 0.05, 0.95, 0.1, 0.9),
            fill: t,
          }),
          React.createElement("polygon", {
            points: c.map((r) => r.join(",")).join(" "),
            fill: "#FFF",
          }),
        ),
      React.createElement(We, { sx: m(34, 42)[0], sy: m(34, 42)[1] }),
      React.createElement(nt, { sx: m(-50, 20)[0], sy: m(-50, 20)[1] }),
    );
  }
  function Fo({ tier: e, c: t }) {
    let s = e >= 3 ? 34 : 22,
      n = { x: -6, y: -8, z: 0, w: 40, d: 32, h: s },
      o = [];
    for (let d = -42; d <= 42; d += 7)
      o.push(
        React.createElement(b, {
          key: "f" + d,
          x: d,
          y: 38,
          w: 1.6,
          d: 1.6,
          h: 6,
          c: "#FBF4E8",
        }),
      );
    for (let d = -38; d <= 34; d += 7)
      o.push(
        React.createElement(b, {
          key: "r" + d,
          x: 43,
          y: d,
          w: 1.6,
          d: 1.6,
          h: 6,
          c: "#FBF4E8",
        }),
      );
    let i = [];
    for (let d = -42; d <= 42; d += 7)
      i.push(
        React.createElement(b, {
          key: "b" + d,
          x: d,
          y: -38,
          w: 1.6,
          d: 1.6,
          h: 6,
          c: "#FBF4E8",
        }),
      );
    for (let d = -31; d <= 38; d += 7)
      i.push(
        React.createElement(b, {
          key: "l" + d,
          x: -43,
          y: d,
          w: 1.6,
          d: 1.6,
          h: 6,
          c: "#FBF4E8",
        }),
      );
    let l = (d, p) =>
      React.createElement(ge, { a: d, b: p, c: "#FBF4E8", w: 1.3 });
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 88, d: 78, c: "#A7D18A", edge: "#8DBE74" }),
      i,
      l(m(-43, -38, 4.5), m(43, -38, 4.5)),
      l(m(-43, -38, 4.5), m(-43, 38, 4.5)),
      e >= 3 &&
        React.createElement(ht, { sx: m(26, -26)[0], sy: m(26, -26)[1], v: 2 }),
      React.createElement(b, { ...n, c: D.wall }),
      React.createElement(oe, {
        b: n,
        face: "left",
        cols: 2,
        rows: e >= 3 ? 2 : 1,
        u0: 0.1,
        u1: 0.4,
        v0: e >= 3 ? 0.18 : 0.36,
        v1: 0.84,
        gx: 0.06,
      }),
      React.createElement(oe, {
        b: n,
        face: "left",
        cols: 1,
        rows: e >= 3 ? 2 : 1,
        u0: 0.72,
        u1: 0.9,
        v0: e >= 3 ? 0.18 : 0.36,
        v1: 0.84,
      }),
      React.createElement(ut, {
        b: n,
        face: "left",
        u: 0.56,
        h: e >= 3 ? 0.36 : 0.56,
        c: T(t, -0.25),
      }),
      React.createElement(oe, {
        b: n,
        face: "right",
        cols: 2,
        rows: e >= 3 ? 2 : 1,
        v0: e >= 3 ? 0.18 : 0.36,
        v1: 0.84,
      }),
      React.createElement(b, {
        x: 4,
        y: -16,
        z: s,
        w: 6,
        d: 6,
        h: 16,
        c: "#A9583B",
      }),
      React.createElement(st, {
        x: n.x,
        y: n.y,
        z: s,
        w: 40,
        d: 32,
        rh: 15,
        c: "#C8654A",
        axis: "x",
      }),
      React.createElement(ss, {
        sx: m(4, -16, s + 17)[0],
        sy: m(4, -16, s + 17)[1],
      }),
      e >= 2 &&
        React.createElement(
          "g",
          null,
          React.createElement(ae, {
            x: -12,
            y: 12,
            h: 13,
            c: "#FBF4E8",
            s: 1.6,
          }),
          React.createElement(ae, { x: 4, y: 12, h: 13, c: "#FBF4E8", s: 1.6 }),
          React.createElement(b, {
            x: -4,
            y: 10,
            z: 13,
            w: 20,
            d: 8,
            h: 1.6,
            c: "#C8654A",
          }),
          React.createElement($t, { x: -24, y: 16 }),
          React.createElement(ge, {
            a: m(26, -2, 14),
            b: m(26, 28, 14),
            c: "#8A7A66",
            w: 0.7,
          }),
          React.createElement("line", {
            x1: m(26, -2)[0],
            y1: m(26, -2)[1],
            x2: m(26, -2, 14)[0],
            y2: m(26, -2, 14)[1],
            stroke: "#8A6446",
            strokeWidth: "1.4",
          }),
          React.createElement("line", {
            x1: m(26, 28)[0],
            y1: m(26, 28)[1],
            x2: m(26, 28, 14)[0],
            y2: m(26, 28, 14)[1],
            stroke: "#8A6446",
            strokeWidth: "1.4",
          }),
          [
            ["#7FB3D5", 5],
            ["#F4A3B5", 13],
            ["#F2C14E", 21],
          ].map(([d, p]) => {
            let u = m(26, p, 13.4);
            return React.createElement("rect", {
              key: p,
              x: u[0] - 3,
              y: u[1],
              width: "6",
              height: "7",
              rx: "1",
              fill: d,
              className: "sway",
            });
          }),
        ),
      e >= 3 &&
        React.createElement(
          "g",
          null,
          [-30, -14].map((d) =>
            React.createElement(
              "g",
              { key: d },
              React.createElement(b, {
                x: d,
                y: 28,
                w: 12,
                d: 8,
                h: 3,
                c: "#8A6446",
              }),
              [-3, 0, 3].map((p) =>
                React.createElement("circle", {
                  key: p,
                  cx: m(d + p, 28, 3)[0],
                  cy: m(d + p, 28, 3)[1] - 2,
                  r: "1.8",
                  fill: "#5A9650",
                }),
              ),
            ),
          ),
        ),
      React.createElement(We, {
        sx: m(-34, -10)[0],
        sy: m(-34, -10)[1],
        flower: "#F4A3B5",
      }),
      o,
      l(m(-43, 38, 4.5), m(43, 38, 4.5)),
      l(m(43, -38, 4.5), m(43, 38, 4.5)),
      React.createElement(b, { x: -36, y: 44, w: 3, d: 3, h: 9, c: "#6F5A45" }),
      React.createElement(b, { x: -36, y: 44, z: 9, w: 6, d: 4, h: 4, c: t }),
    );
  }
  function Co({ tier: e, c: t, data: s }) {
    let n = Math.max(0, Math.min(1, (s == null ? void 0 : s.progress) || 0)),
      o = m(0, 0, 99),
      i = { x: -8, y: 30, z: 0, w: 12, d: 8, h: 7 },
      l =
        typeof window != "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      d = (p, u, c) =>
        Array.from({ length: c }).map((r, y) => {
          let k = m(p, u, y * 1.6);
          return React.createElement("ellipse", {
            key: y,
            cx: k[0],
            cy: k[1],
            rx: "4",
            ry: "1.8",
            fill: y % 2 ? "#F2C14E" : "#E9B949",
            stroke: "#B98A22",
            strokeWidth: "0.5",
          });
        });
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 72, d: 64, c: "#D2C4AA" }),
      React.createElement(Bt, { sx: m(34, -22)[0], sy: m(34, -22)[1], s: 1.2 }),
      React.createElement(b, { x: -24, y: 14, w: 20, d: 16, h: 12, c: D.wall }),
      React.createElement(oe, {
        b: { x: -24, y: 14, z: 0, w: 20, d: 16, h: 12 },
        face: "left",
        cols: 1,
        u0: 0.3,
        u1: 0.7,
      }),
      React.createElement(st, {
        x: -24,
        y: 14,
        z: 12,
        w: 20,
        d: 16,
        rh: 9,
        c: "#C8654A",
        axis: "y",
      }),
      React.createElement(re, {
        x: 0,
        y: 0,
        r: 14,
        r2: 9.5,
        h: 90,
        c: "#F8F3EB",
        bands: [
          { z1: 16, z2: 28, c: "#C8543C" },
          { z1: 44, z2: 56, c: "#C8543C" },
          { z1: 72, z2: 82, c: "#C8543C" },
        ],
      }),
      React.createElement("rect", {
        x: -9,
        y: -15,
        width: "6.5",
        height: "11",
        rx: "3",
        fill: "#6E4A33",
      }),
      React.createElement(re, { x: 0, y: 0, z: 90, r: 13, h: 3, c: "#3B4A50" }),
      React.createElement(re, {
        x: 0,
        y: 0,
        z: 93,
        r: 8,
        h: 11,
        c: "#FFE6A3",
        top: "#FFF1C9",
      }),
      React.createElement("circle", {
        cx: o[0],
        cy: o[1],
        r: 16 + 46 * n,
        fill: "url(#lampGlow)",
        opacity: 0.35 + 0.55 * n,
        className: "glow-pulse",
      }),
      n > 0 &&
        React.createElement(
          "g",
          { opacity: 0.2 + 0.45 * n },
          React.createElement(
            "polygon",
            {
              points: `${o[0]},${o[1]} ${o[0] + 300},${o[1] - 50} ${o[0] + 300},${o[1] + 30}`,
              fill: "url(#beamGrad)",
            },
            !l &&
              React.createElement("animateTransform", {
                attributeName: "transform",
                type: "rotate",
                values: `-28 ${o[0]} ${o[1]};24 ${o[0]} ${o[1]};-28 ${o[0]} ${o[1]}`,
                dur: "10s",
                repeatCount: "indefinite",
              }),
          ),
        ),
      React.createElement(re, {
        x: 0,
        y: 0,
        z: 104,
        r: 10,
        r2: 1.5,
        h: 10,
        c: "#C8543C",
      }),
      React.createElement(b, { ...i, c: "#8A5A34" }),
      React.createElement("polygon", {
        points: me("left", i, 0, 1, 0.45, 0.6),
        fill: t,
      }),
      React.createElement(b, {
        x: i.x,
        y: i.y,
        z: 7,
        w: 13,
        d: 9,
        h: 2.6,
        c: "#A26B3E",
      }),
      e >= 2 && d(8, 34, 4),
      e >= 3 &&
        React.createElement(
          "g",
          null,
          d(-22, 36, 5),
          d(12, 22, 3),
          React.createElement(Ft, {
            sx: m(-34, -12)[0],
            sy: m(-34, -12)[1],
            c: t,
          }),
          React.createElement(Ft, { sx: m(28, 14)[0], sy: m(28, 14)[1], c: t }),
        ),
      e >= 2 &&
        React.createElement(nt, { sx: m(-36, 32)[0], sy: m(-36, 32)[1] }),
      React.createElement(Bt, { sx: m(-30, -28)[0], sy: m(-30, -28)[1] }),
      React.createElement(Bt, { sx: m(26, 34)[0], sy: m(26, 34)[1], s: 0.8 }),
    );
  }
  function Ao({ tier: e, c: t }) {
    let s = { x: -12, y: -30, z: 0, w: 54, d: 34, h: 4 },
      n = m(-26, -40, 18),
      o = m(-26, -24, 18),
      i = [];
    for (let d = -36; d <= 12; d += 6)
      i.push(
        React.createElement(ge, {
          key: d,
          a: m(d, -47, 4.1),
          b: m(d, -13, 4.1),
          c: "rgba(120,80,40,0.25)",
          w: 0.7,
        }),
      );
    let l = { x: 40, y: -36, z: 0, w: 30, d: 26, h: 22 };
    return React.createElement(
      "g",
      null,
      e >= 3 &&
        React.createElement(
          "g",
          null,
          React.createElement(b, { ...l, c: D.wall }),
          React.createElement(oe, {
            b: l,
            face: "left",
            cols: 1,
            u0: 0.08,
            u1: 0.92,
            v0: 0.12,
            v1: 0.84,
            c: "#6FA3B0",
          }),
          React.createElement(oe, {
            b: l,
            face: "right",
            cols: 2,
            v0: 0.4,
            v1: 0.84,
          }),
          React.createElement(ts, {
            x: l.x,
            y: l.y,
            z: 22,
            w: 30,
            d: 26,
            rh: 10,
            c: t,
          }),
        ),
      React.createElement(b, { ...s, c: "#C79A68" }),
      i,
      React.createElement(ae, { x: -26, y: -40, z: 4, h: 14 }),
      React.createElement(ae, { x: -26, y: -24, z: 4, h: 14 }),
      React.createElement(ge, { a: n, b: o, c: "#2F3A40", w: 2 }),
      React.createElement("ellipse", {
        cx: n[0] - 1,
        cy: n[1],
        rx: "2.6",
        ry: "5.5",
        fill: "#2F3A40",
      }),
      React.createElement("ellipse", {
        cx: o[0] + 1,
        cy: o[1],
        rx: "2.6",
        ry: "5.5",
        fill: "#2F3A40",
      }),
      React.createElement(b, {
        x: -6,
        y: -30,
        z: 4,
        w: 14,
        d: 5,
        h: 4,
        c: "#3B4A50",
        top: t,
      }),
      [
        [6, -20],
        [12, -24],
      ].map(([d, p]) => {
        let u = m(d, p, 4);
        return React.createElement(
          "g",
          { key: d },
          React.createElement("circle", {
            cx: u[0] - 3,
            cy: u[1] - 2,
            r: "2.2",
            fill: "#2F3A40",
          }),
          React.createElement("circle", {
            cx: u[0] + 3,
            cy: u[1] - 2,
            r: "2.2",
            fill: "#2F3A40",
          }),
          React.createElement("line", {
            x1: u[0] - 3,
            y1: u[1] - 2,
            x2: u[0] + 3,
            y2: u[1] - 2,
            stroke: "#2F3A40",
            strokeWidth: "1.2",
          }),
        );
      }),
      [
        [-4, -18],
        [0, -16],
      ].map(([d, p]) => {
        let u = m(d, p, 4);
        return React.createElement("circle", {
          key: d,
          cx: u[0],
          cy: u[1] - 2.5,
          r: "2.8",
          fill: t,
          stroke: T(t, -0.3),
          strokeWidth: "0.6",
        });
      }),
      e >= 2 &&
        React.createElement(
          "g",
          null,
          React.createElement(ae, {
            x: -38,
            y: -46,
            z: 4,
            h: 22,
            c: "#6F5A45",
            s: 1.6,
          }),
          React.createElement(ae, {
            x: 12,
            y: -46,
            z: 4,
            h: 18,
            c: "#6F5A45",
            s: 1.6,
          }),
          React.createElement(ae, {
            x: -38,
            y: -14,
            z: 4,
            h: 18,
            c: "#6F5A45",
            s: 1.6,
          }),
          React.createElement("polygon", {
            points: J([
              [-38, -46, 26],
              [12, -46, 22],
              [-38, -14, 22],
            ]),
            fill: t,
            opacity: "0.92",
            stroke: T(t, -0.25),
            strokeWidth: "0.8",
          }),
          React.createElement(ae, { x: 40, y: -2, h: 20 }),
          React.createElement(ae, { x: 40, y: 14, h: 20 }),
          React.createElement(ge, {
            a: m(40, -2, 20),
            b: m(40, 14, 20),
            c: "#2F3A40",
            w: 1.8,
          }),
        ),
      React.createElement(Nt, {
        x: 6,
        y: 22,
        z: 0.5,
        a: 46,
        b: 22,
        fill: "#D46A43",
        stroke: T("#D46A43", -0.15),
        sw: 1,
      }),
      React.createElement(Nt, {
        x: 6,
        y: 22,
        z: 0.6,
        a: 42.5,
        b: 18.5,
        fill: "none",
        stroke: "rgba(255,248,236,0.8)",
        sw: 0.8,
        dash: "3 3",
      }),
      React.createElement(Nt, {
        x: 6,
        y: 22,
        z: 0.7,
        a: 39,
        b: 15,
        fill: "#9FCF87",
        stroke: "#FFF8EC",
        sw: 1,
      }),
      React.createElement(Mt, { sx: m(-48, 18)[0], sy: m(-48, 18)[1] }),
      React.createElement(Mt, {
        sx: m(58, 44)[0],
        sy: m(58, 44)[1],
        flip: !0,
        s: 0.9,
      }),
      React.createElement(Rt, {
        sx: m(-38, 48)[0],
        sy: m(-38, 48)[1],
        c: "#2A9D8F",
      }),
      e >= 3 &&
        React.createElement(Ft, {
          sx: m(56, -52)[0],
          sy: m(56, -52)[1],
          c: t,
          h: 34,
        }),
    );
  }
  function Do({ c: e, data: t }) {
    let s = { x: -14, y: -18, z: 0, w: 62, d: 38, h: 26 },
      n = ((t == null ? void 0 : t.containers) || []).slice(0, 8),
      o = [];
    [0, 1].forEach((l) =>
      [14, 26, 38].forEach((d) =>
        [12, 28].forEach((p) => {
          (l === 0 || d === 26) && o.push({ x: p, y: d, z: l * 9 });
        }),
      ),
    );
    let i = n
      .map((l, d) => ({ ...o[d % o.length], col: l, i: d }))
      .sort((l, d) => l.z - d.z || l.x + l.y - (d.x + d.y));
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 114, d: 92, c: "#D5CDBD" }),
      React.createElement(ge, {
        a: m(-54, 6, 1.95),
        b: m(54, 6, 1.95),
        c: "#E9B949",
        w: 1.2,
      }),
      React.createElement(b, { ...s, c: "#E6DECF" }),
      React.createElement("polygon", {
        points: me("left", s, 0.1, 0.34, 0, 0.62),
        fill: "#6D7880",
      }),
      React.createElement("polygon", {
        points: me("left", s, 0.46, 0.7, 0, 0.62),
        fill: "#6D7880",
      }),
      React.createElement("polygon", {
        points: me("left", s, 0, 1, 0.8, 0.9),
        fill: e,
      }),
      React.createElement(oe, {
        b: s,
        face: "right",
        cols: 3,
        v0: 0.55,
        v1: 0.8,
      }),
      React.createElement(st, {
        x: s.x,
        y: s.y,
        z: 26,
        w: 62,
        d: 38,
        rh: 12,
        c: "#8FA3AD",
        wall: "#E6DECF",
        axis: "x",
      }),
      React.createElement(ae, { x: 4, y: 6, h: 34, c: e, s: 2.4 }),
      React.createElement(ae, { x: 46, y: 6, h: 34, c: e, s: 2.4 }),
      React.createElement(b, { x: 25, y: 6, z: 34, w: 46, d: 3, h: 3, c: e }),
      i.length === 0 &&
        React.createElement(b, {
          x: 20,
          y: 26,
          w: 14,
          d: 10,
          h: 2,
          c: "#B8956A",
        }),
      i.map((l) => {
        let d = { x: l.x, y: l.y, z: l.z, w: 14, d: 9, h: 8.6 };
        return React.createElement(
          "g",
          { key: l.i },
          React.createElement(b, { ...d, c: l.col }),
          React.createElement(ge, {
            a: le("right", d, 0.35, 0.1),
            b: le("right", d, 0.35, 0.9),
            c: T(l.col, -0.35),
            w: 0.6,
          }),
          React.createElement(ge, {
            a: le("right", d, 0.65, 0.1),
            b: le("right", d, 0.65, 0.9),
            c: T(l.col, -0.35),
            w: 0.6,
          }),
        );
      }),
      React.createElement(b, {
        x: 25,
        y: 26,
        z: 37,
        w: 5,
        d: 44,
        h: 3,
        c: T(e, -0.12),
      }),
      React.createElement(ge, {
        a: m(25, 26, 37),
        b: m(25, 26, 22),
        c: "#44545A",
        w: 0.8,
      }),
      React.createElement(ae, { x: 4, y: 46, h: 34, c: e, s: 2.4 }),
      React.createElement(ae, { x: 46, y: 46, h: 34, c: e, s: 2.4 }),
      React.createElement(b, { x: 25, y: 46, z: 34, w: 46, d: 3, h: 3, c: e }),
      (t == null ? void 0 : t.won) > 0 &&
        React.createElement(
          "g",
          null,
          React.createElement(b, {
            x: -40,
            y: 32,
            w: 30,
            d: 12,
            h: 12,
            c: "#F6EDDF",
          }),
          React.createElement("polygon", {
            points: me(
              "left",
              { x: -40, y: 32, z: 0, w: 30, d: 12, h: 12 },
              0.05,
              0.95,
              0.4,
              0.62,
            ),
            fill: e,
          }),
          React.createElement(b, {
            x: -19,
            y: 32,
            w: 10,
            d: 12,
            h: 10,
            c: "#3E7CB1",
          }),
        ),
      React.createElement(nt, { sx: m(-50, -46)[0], sy: m(-50, -46)[1] }),
    );
  }
  function Eo({ c: e, data: t, onShip: s }) {
    let n = (t == null ? void 0 : t.ships) || [],
      o = [
        { x: 44, y: -27 },
        { x: 112, y: -27 },
        { x: 44, y: 27 },
        { x: 112, y: 27 },
      ],
      i = n.slice(0, 4).map((r, y) => ({ ...r, ...o[y] })),
      l = i.filter((r) => r.y < 0),
      d = i.filter((r) => r.y > 0),
      p = [];
    for (let r = -14; r <= 148; r += 7)
      p.push(
        React.createElement(ge, {
          key: r,
          a: m(r, -8, 4.05),
          b: m(r, 8, 4.05),
          c: "rgba(110,70,40,0.25)",
          w: 0.6,
        }),
      );
    let u = { x: -36, y: -30, z: 0, w: 22, d: 18, h: 16 },
      c = (r) =>
        React.createElement(pn, {
          key: r.id,
          x: r.x,
          y: r.y,
          s: 0.8,
          hull: T(r.color, -0.35),
          flag: r.color,
          cargo: [r.color, "#E9B949"],
          delay: (r.x + r.y) / 40,
          title: r.title,
          onClick: s,
        });
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 58, d: 54, x: -34, y: -24, c: D.pave }),
      React.createElement(b, { ...u, c: D.wall }),
      React.createElement(oe, {
        b: u,
        face: "left",
        cols: 2,
        u0: 0.12,
        u1: 0.88,
      }),
      React.createElement(ut, {
        b: u,
        face: "right",
        u: 0.5,
        h: 0.55,
        c: T(e, -0.2),
      }),
      React.createElement(ts, {
        x: u.x,
        y: u.y,
        z: 16,
        w: 22,
        d: 18,
        rh: 10,
        c: e,
      }),
      React.createElement(Ft, {
        sx: m(-24, -44)[0],
        sy: m(-24, -44)[1],
        c: e,
        h: 32,
      }),
      l.map(c),
      React.createElement(b, {
        x: 66,
        y: 0,
        z: 1,
        w: 168,
        d: 16,
        h: 3,
        c: "#C9A171",
      }),
      p,
      [0, 40, 80, 120, 150].map((r) =>
        React.createElement(
          "g",
          { key: r },
          React.createElement(re, {
            x: r,
            y: 8.6,
            z: -4,
            r: 1.6,
            h: 5,
            c: "#6E4A33",
            noTop: !0,
          }),
        ),
      ),
      [20, 60, 100, 140].map((r) =>
        React.createElement(
          "g",
          { key: r },
          React.createElement(re, {
            x: r,
            y: -6.5,
            z: 4,
            r: 1.7,
            h: 3,
            c: "#3B4A50",
          }),
          React.createElement(re, {
            x: r,
            y: 6.5,
            z: 4,
            r: 1.7,
            h: 3,
            c: "#3B4A50",
          }),
        ),
      ),
      React.createElement(nt, {
        sx: m(150, 0, 4)[0],
        sy: m(150, 0, 4)[1],
        h: 20,
      }),
      d.map(c),
      React.createElement(
        "g",
        { className: "bob", style: { animationDelay: "0.7s" } },
        React.createElement(re, {
          x: 176,
          y: -34,
          z: -2,
          r: 3.5,
          h: 8,
          c: "#F6EDDF",
          bands: [{ z1: 2, z2: 5, c: "#D9534F" }],
        }),
      ),
      React.createElement(We, { sx: m(-56, -6)[0], sy: m(-56, -6)[1] }),
    );
  }
  function un() {
    let e = m(0, 0, 17);
    return React.createElement(
      "g",
      null,
      React.createElement(Nt, {
        a: 52,
        b: 52,
        z: 0.5,
        fill: "#EBDCC0",
        stroke: "#D6C29D",
        sw: 3,
      }),
      React.createElement(Nt, {
        a: 36,
        b: 36,
        z: 0.6,
        fill: "none",
        stroke: "#DCC9A5",
        sw: 1.4,
        dash: "4 3",
      }),
      React.createElement(re, { r: 15, h: 5, c: D.stone, top: "#8FD9DD" }),
      React.createElement(re, { r: 3, h: 14, c: D.stone }),
      React.createElement(re, {
        z: 14,
        r: 6,
        h: 2,
        c: D.stone,
        top: "#9FE3E4",
      }),
      React.createElement("path", {
        className: "spout",
        d: `M${e[0]},${e[1]} q-10,-6 -15,11`,
        stroke: "#BDEFF0",
        strokeWidth: "1.6",
        fill: "none",
      }),
      React.createElement("path", {
        className: "spout",
        d: `M${e[0]},${e[1]} q10,-6 15,11`,
        stroke: "#BDEFF0",
        strokeWidth: "1.6",
        fill: "none",
        style: { animationDelay: "0.6s" },
      }),
      React.createElement(Ft, {
        sx: m(-24, -46)[0],
        sy: m(-24, -46)[1],
        h: 44,
        c: "#E9B949",
        w: 20,
      }),
      React.createElement($t, { x: 2, y: 38 }),
      React.createElement($t, { x: -38, y: 4 }),
      React.createElement(nt, { sx: m(-36, -36)[0], sy: m(-36, -36)[1] }),
      React.createElement(nt, { sx: m(38, 38)[0], sy: m(38, 38)[1] }),
      React.createElement(We, {
        sx: m(40, -30)[0],
        sy: m(40, -30)[1],
        flower: "#F4A3B5",
      }),
      React.createElement(We, {
        sx: m(-42, 34)[0],
        sy: m(-42, 34)[1],
        flower: "#F2C14E",
      }),
    );
  }
  function qt({ tier: e, c: t, kind: s }) {
    if (s === "shop") {
      let o = { x: -6, y: -8, z: 0, w: 44, d: 34, h: 22 },
        i = o.x - o.w / 2,
        l = o.y + o.d / 2;
      return React.createElement(
        "g",
        null,
        React.createElement(Te, { w: 84, d: 74, c: D.pave }),
        React.createElement(b, { ...o, c: D.wall }),
        React.createElement(oe, {
          b: o,
          face: "left",
          cols: 2,
          u0: 0.08,
          u1: 0.62,
          v0: 0.2,
          v1: 0.7,
        }),
        React.createElement(ut, {
          b: o,
          face: "left",
          u: 0.8,
          h: 0.62,
          c: T(t, -0.3),
        }),
        React.createElement(b, {
          x: o.x,
          y: o.y,
          z: 22,
          w: 46,
          d: 36,
          h: 3,
          c: t,
        }),
        React.createElement(b, {
          x: o.x,
          y: o.y + 18,
          z: 25,
          w: 30,
          d: 2,
          h: 8,
          c: "#FFF3E0",
        }),
        Array.from({ length: 5 }).map((d, p) => {
          let u = i + (p * o.w) / 5,
            c = u + o.w / 5;
          return React.createElement("polygon", {
            key: p,
            points: J([
              [u, l, 17],
              [c, l, 17],
              [c, l + 10, 11],
              [u, l + 10, 11],
            ]),
            fill: p % 2 ? "#FFF3E0" : t,
          });
        }),
        e >= 2 &&
          React.createElement(Rt, { sx: m(20, 22)[0], sy: m(20, 22)[1], c: t }),
        e >= 3 &&
          React.createElement(ht, { sx: m(30, -30)[0], sy: m(30, -30)[1] }),
        React.createElement(We, {
          sx: m(-36, 30)[0],
          sy: m(-36, 30)[1],
          flower: t,
        }),
      );
    }
    if (s === "office") {
      let o = e >= 3 ? 70 : e >= 2 ? 56 : 44,
        i = { x: -4, y: -6, z: 0, w: 38, d: 34, h: o };
      return React.createElement(
        "g",
        null,
        React.createElement(Te, { w: 80, d: 74, c: D.pave }),
        React.createElement(b, { ...i, c: D.wall2 }),
        React.createElement(oe, {
          b: i,
          face: "left",
          cols: 3,
          rows: Math.round(o / 12),
          v0: 0.12,
          v1: 0.94,
          gy: 0.08,
        }),
        React.createElement(oe, {
          b: i,
          face: "right",
          cols: 2,
          rows: Math.round(o / 12),
          v0: 0.12,
          v1: 0.94,
          gy: 0.08,
        }),
        React.createElement(b, {
          x: i.x,
          y: i.y,
          z: o,
          w: 40,
          d: 36,
          h: 3,
          c: t,
        }),
        React.createElement(b, {
          x: i.x,
          y: i.y + 20,
          z: 10,
          w: 16,
          d: 8,
          h: 1.6,
          c: t,
        }),
        React.createElement(ht, { sx: m(30, 26)[0], sy: m(30, 26)[1], v: 1 }),
      );
    }
    if (s === "farm") {
      let o = { x: -16, y: -18, z: 0, w: 36, d: 30, h: 18 },
        i = [];
      for (let l = 0; l < 6; l++)
        i.push(
          React.createElement("polygon", {
            key: l,
            points: J([
              [4, 2 + l * 6, 1],
              [42, 2 + l * 6, 1],
              [42, 5 + l * 6, 1],
              [4, 5 + l * 6, 1],
            ]),
            fill: l % 2 ? "#7DB35F" : "#6AA152",
          }),
        );
      return React.createElement(
        "g",
        null,
        React.createElement(Te, { w: 96, d: 84, c: "#CDB88C" }),
        React.createElement(b, { ...o, c: t }),
        React.createElement("polygon", {
          points: me("left", o, 0.35, 0.65, 0, 0.7),
          fill: T(t, -0.35),
        }),
        React.createElement(st, {
          x: o.x,
          y: o.y,
          z: 18,
          w: 36,
          d: 30,
          rh: 12,
          c: "#6A4934",
          wall: t,
          axis: "x",
        }),
        i,
        React.createElement(re, { x: -34, y: 24, r: 6, h: 9, c: "#E6C15A" }),
        e >= 2 &&
          React.createElement(re, { x: -22, y: 30, r: 5, h: 7, c: "#E6C15A" }),
        e >= 3 &&
          React.createElement(re, { x: 24, y: -30, r: 7, h: 34, c: "#D8DEE1" }),
      );
    }
    if (s === "tower")
      return React.createElement(
        "g",
        null,
        React.createElement(Te, { w: 70, d: 64, c: D.pave }),
        React.createElement(b, {
          x: -22,
          y: 14,
          w: 20,
          d: 16,
          h: 12,
          c: D.wall,
        }),
        React.createElement(ts, {
          x: -22,
          y: 14,
          z: 12,
          w: 20,
          d: 16,
          rh: 8,
          c: t,
        }),
        React.createElement(re, {
          r: 13,
          r2: 9,
          h: e >= 3 ? 84 : e >= 2 ? 70 : 56,
          c: "#F6EDDF",
          bands: [
            { z1: 20, z2: 26, c: t },
            { z1: 40, z2: 46, c: t },
          ],
        }),
        React.createElement(re, {
          z: e >= 3 ? 84 : e >= 2 ? 70 : 56,
          r: 10,
          r2: 1.5,
          h: 12,
          c: t,
        }),
      );
    let n = { x: -6, y: -8, z: 0, w: 40, d: 32, h: 22 };
    return React.createElement(
      "g",
      null,
      React.createElement(Te, { w: 82, d: 74, c: "#A7D18A", edge: "#8DBE74" }),
      React.createElement(b, { ...n, c: D.wall }),
      React.createElement(oe, {
        b: n,
        face: "left",
        cols: 2,
        u0: 0.1,
        u1: 0.42,
        gx: 0.06,
      }),
      React.createElement(ut, {
        b: n,
        face: "left",
        u: 0.62,
        h: 0.56,
        c: T(t, -0.25),
      }),
      React.createElement(oe, { b: n, face: "right", cols: 2 }),
      React.createElement(st, {
        x: n.x,
        y: n.y,
        z: 22,
        w: 40,
        d: 32,
        rh: 14,
        c: t,
        axis: "x",
      }),
      e >= 2 &&
        React.createElement(ht, { sx: m(26, -24)[0], sy: m(26, -24)[1] }),
      e >= 3 && React.createElement($t, { x: -6, y: 24 }),
      React.createElement(We, {
        sx: m(-32, 26)[0],
        sy: m(-32, 26)[1],
        flower: t,
      }),
    );
  }
  var Cs = {
      refinery: { C: xo, label: [-62, -112, -118], ring: [70, 58] },
      drafting: { C: ko, label: [-64, -66, -114], ring: [60, 52] },
      maker: { C: vo, label: [-72, -72, -72], ring: [62, 52] },
      mill: { C: wo, label: [-66, -66, -96], ring: [64, 54] },
      cafe: { C: bo, label: [-66, -66, -66], ring: [60, 52] },
      film: { C: No, label: [-104, -104, -104], ring: [64, 54] },
      cottage: { C: Fo, label: [-60, -60, -72], ring: [56, 50] },
      lighthouse: { C: Co, label: [-128, -128, -128], ring: [46, 40] },
      gym: { C: Ao, label: [-54, -58, -70], ring: [62, 52] },
      hub: { C: Do, label: [-66, -66, -66], ring: [70, 58] },
      port: { C: Eo, label: [-72, -72, -72], ring: [50, 44] },
      house: { C: qt, label: [-58, -58, -58], ring: [54, 48] },
      shop: { C: qt, label: [-56, -56, -56], ring: [54, 48] },
      office: { C: qt, label: [-80, -94, -108], ring: [52, 46] },
      farm: { C: qt, label: [-58, -58, -70], ring: [60, 52] },
      tower: { C: qt, label: [-86, -100, -114], ring: [44, 40] },
    },
    As = [
      [-14, 50],
      [8, 52],
      [28, 48],
      [-34, 46],
    ];
  var {
      useRef: ot,
      useEffect: os,
      useState: hn,
      useMemo: as,
      useCallback: yt,
      memo: Mo,
      forwardRef: Bo,
      useImperativeHandle: $o,
    } = React,
    Ct = { shallow: 0.05, sand: 0.42, grass: 0.64 };
  function Ds(e, t) {
    let s = Math.floor(e),
      n = Math.floor(t),
      o = e - s,
      i = t - n,
      l = (f, w) => {
        let v = Math.imul(f, 374761393) + Math.imul(w, 668265263);
        return (
          (v = Math.imul(v ^ (v >>> 13), 1274126177)),
          ((v ^ (v >>> 16)) >>> 0) / 4294967295
        );
      },
      d = (f) => f * f * (3 - 2 * f),
      p = l(s, n),
      u = l(s + 1, n),
      c = l(s, n + 1),
      r = l(s + 1, n + 1),
      y = d(o),
      k = d(i);
    return p + (u - p) * y + (c - p) * k + (p - u - c + r) * y * k;
  }
  function yn(e, t = 120) {
    let s = 1 / 0,
      n = 1 / 0,
      o = -1 / 0,
      i = -1 / 0;
    return (
      e.forEach((l) => {
        ((s = Math.min(s, l.x - l.r)),
          (o = Math.max(o, l.x + l.r)),
          (n = Math.min(n, l.y - l.r * 0.5)),
          (i = Math.max(i, l.y + l.r * 0.5)));
      }),
      (s -= t),
      (n -= t * 0.8),
      (o += t),
      (i += t * 0.8),
      {
        x: Math.floor(s),
        y: Math.floor(n),
        w: Math.ceil(o - s),
        h: Math.ceil(i - n),
      }
    );
  }
  function zo(e, t, s = 4) {
    let n = Math.ceil(t.w / s) + 3,
      o = Math.ceil(t.h / s) + 3,
      i = new Float32Array(n * o),
      l = new Float32Array(n * o);
    for (let d of e) {
      let p = d.k == null ? 1 : d.k;
      if (p <= 0) continue;
      let u = d.r,
        c = d.r * 0.5,
        r = Math.max(0, Math.floor((d.x - u - t.x) / s)),
        y = Math.min(n - 1, Math.ceil((d.x + u - t.x) / s)),
        k = Math.max(0, Math.floor((d.y - c - t.y) / s)),
        f = Math.min(o - 1, Math.ceil((d.y + c - t.y) / s));
      for (let w = k; w <= f; w++) {
        let v = (t.y + w * s - d.y) / c,
          $ = v * v;
        if (!($ >= 1))
          for (let E = r; E <= y; E++) {
            let M = (t.x + E * s - d.x) / u,
              N = M * M + $;
            if (N < 1) {
              let P = 1 - N;
              i[w * n + E] += P * P * p;
            }
          }
      }
    }
    for (let d = 0; d < o; d++)
      for (let p = 0; p < n; p++) {
        let u = d * n + p,
          c = t.x + p * s,
          r = t.y + d * s,
          y = i[u];
        (y > 0.01 &&
          (i[u] =
            y +
            ((Ds(c / 72, r / 44) - 0.5) * 0.12 +
              (Ds(c / 21 + 11, r / 15 - 7) - 0.5) * 0.05) *
              Math.min(1, y * 3)),
          (l[u] = Ds(c / 46 + 3, r / 30 + 5)));
      }
    return { F: i, N: l, gw: n, gh: o, step: s, bbox: t };
  }
  function Gt(e, t, s) {
    let { F: n, gw: o, gh: i, step: l, bbox: d } = e,
      p = (t - d.x) / l,
      u = (s - d.y) / l;
    if (p < 0 || u < 0 || p >= o - 1 || u >= i - 1) return 0;
    let c = p | 0,
      r = u | 0,
      y = p - c,
      k = u - r,
      f = r * o + c,
      w = n[f],
      v = n[f + 1],
      $ = n[f + o],
      E = n[f + o + 1];
    return w + (v - w) * y + ($ - w) * k + (w - v - $ + E) * y * k;
  }
  var _e = (e) => [
      parseInt(e.slice(1, 3), 16),
      parseInt(e.slice(3, 5), 16),
      parseInt(e.slice(5, 7), 16),
    ],
    O = {
      deep: _e("#3AB5BE"),
      shore: _e("#A9ECE2"),
      foamW: _e("#F4FFFB"),
      wet: _e("#E0BD86"),
      sand: _e("#F3D8A6"),
      sand2: _e("#EACB92"),
      lip: _e("#5F8F53"),
      lip2: _e("#4F7C46"),
      rim: _e("#B5DA92"),
      grassA: _e("#97C97F"),
      grassB: _e("#6CA565"),
      meadow: _e("#A9D38A"),
    };
  function Lo(e, t, s, n) {
    let { bbox: o, F: i, N: l, gw: d, step: p } = s,
      u = Math.max(1, Math.round(o.w * n)),
      c = Math.max(1, Math.round(o.h * n));
    ((e.width = u), (e.height = c), (t.width = u), (t.height = c));
    let r = e.getContext("2d"),
      y = t.getContext("2d"),
      k = r.createImageData(u, c),
      f = y.createImageData(u, c),
      w = k.data,
      v = f.data,
      $ = 1 / (p * n),
      E = 7 / p,
      { shallow: M, sand: N, grass: P } = Ct,
      he = N - 0.035;
    for (let R = 0; R < c; R++) {
      let K = R * $,
        de = K | 0,
        we = K - de,
        ee = K - E,
        ce = ee | 0,
        $e = ee - ce,
        z = 1.05 - 0.07 * (R / c);
      for (let ne = 0; ne < u; ne++) {
        let fe = ne * $,
          xe = fe | 0,
          C = fe - xe,
          G = de * d + xe,
          Ce = i[G],
          Qe = i[G + 1],
          pe = i[G + d],
          Ge = i[G + d + 1],
          te =
            Ce + (Qe - Ce) * C + (pe - Ce) * we + (Ce - Qe - pe + Ge) * C * we,
          ue = (R * u + ne) * 4;
        if (te < M) continue;
        let j,
          _,
          Z,
          Ae = 255;
        if (te >= P) {
          let De = l[G],
            h = Math.min(1, (te - P) / 0.8);
          if (
            ((j = O.grassA[0] + (O.grassB[0] - O.grassA[0]) * h),
            (_ = O.grassA[1] + (O.grassB[1] - O.grassA[1]) * h),
            (Z = O.grassA[2] + (O.grassB[2] - O.grassA[2]) * h),
            De > 0.62)
          ) {
            let A = Math.min(1, (De - 0.62) * 4) * 0.55;
            ((j += (O.meadow[0] - j) * A),
              (_ += (O.meadow[1] - _) * A),
              (Z += (O.meadow[2] - Z) * A));
          }
          te < P + 0.028 && ((j = O.rim[0]), (_ = O.rim[1]), (Z = O.rim[2]));
          let x = (((ne * 73856093) ^ (R * 19349663)) & 15) - 7;
          ((j += x * 0.6), (_ += x), (Z += x * 0.4));
        } else if (te >= N) {
          let De = !1;
          if (ee >= 0) {
            let h = ce * d + xe,
              x = i[h],
              A = i[h + 1],
              B = i[h + d],
              H = i[h + d + 1];
            De = x + (A - x) * C + (B - x) * $e + (x - A - B + H) * C * $e >= P;
          }
          if (De) {
            let h = R % 3 === 0 ? O.lip2 : O.lip;
            ((j = h[0]), (_ = h[1]), (Z = h[2]));
          } else if (te < N + 0.03)
            ((j = O.wet[0]), (_ = O.wet[1]), (Z = O.wet[2]));
          else {
            let x = l[G] > 0.55 ? 0.5 : 0;
            ((j = O.sand[0] + (O.sand2[0] - O.sand[0]) * x),
              (_ = O.sand[1] + (O.sand2[1] - O.sand[1]) * x),
              (Z = O.sand[2] + (O.sand2[2] - O.sand[2]) * x));
            let A = (((ne * 2654435761) ^ (R * 40503)) & 7) - 3;
            ((j += A), (_ += A), (Z += A));
          }
        } else if (te >= he)
          ((j = O.shore[0]),
            (_ = O.shore[1]),
            (Z = O.shore[2]),
            (Ae = 245),
            (v[ue] = 255),
            (v[ue + 1] = 255),
            (v[ue + 2] = 250),
            (v[ue + 3] = 235));
        else {
          let De = (te - M) / (he - M),
            h = Math.pow(De, 1.35);
          ((j = O.deep[0] + (O.shore[0] - O.deep[0]) * h),
            (_ = O.deep[1] + (O.shore[1] - O.deep[1]) * h),
            (Z = O.deep[2] + (O.shore[2] - O.deep[2]) * h),
            (Ae = 30 + 205 * h),
            te > 0.24 &&
              te < 0.255 &&
              ((v[ue] = 255),
              (v[ue + 1] = 255),
              (v[ue + 2] = 255),
              (v[ue + 3] = 110)));
        }
        ((w[ue] = Math.min(255, j * z)),
          (w[ue + 1] = Math.min(255, _ * z)),
          (w[ue + 2] = Math.min(255, Z * z)),
          (w[ue + 3] = Ae));
      }
    }
    (r.putImageData(k, 0, 0), y.putImageData(f, 0, 0));
  }
  function So({ y: e, name: t, level: s, color: n, open: o, alert: i, s: l }) {
    let p = t.length * 6.9 + 10 + 32 + (o > 0 ? 22 : 0);
    return React.createElement(
      "g",
      { transform: `translate(0,${e}) scale(${l})`, className: "np" },
      React.createElement("rect", {
        x: -p / 2,
        y: -11,
        width: p,
        height: 25,
        rx: 12.5,
        fill: "rgba(70,45,20,0.22)",
        transform: "translate(0,2.5)",
      }),
      React.createElement("rect", {
        x: -p / 2,
        y: -12,
        width: p,
        height: 25,
        rx: 12.5,
        fill: "#FFF8EC",
        stroke: "#E6D2AE",
        strokeWidth: "1.2",
      }),
      React.createElement("circle", {
        cx: -p / 2 + 13,
        cy: 0.5,
        r: 9,
        fill: n,
      }),
      React.createElement(
        "text",
        { x: -p / 2 + 13, y: 4.4, textAnchor: "middle", className: "np-lv" },
        s,
      ),
      React.createElement(
        "text",
        { x: -p / 2 + 27, y: 5, className: "np-name" },
        t,
      ),
      o > 0 &&
        React.createElement(
          "g",
          null,
          React.createElement("rect", {
            x: p / 2 - 27,
            y: -7.5,
            width: 20,
            height: 16,
            rx: 8,
            fill: T(n, 0.78),
          }),
          React.createElement(
            "text",
            {
              x: p / 2 - 17,
              y: 4.4,
              textAnchor: "middle",
              className: "np-count",
              fill: T(n, -0.35),
            },
            o,
          ),
        ),
      i &&
        React.createElement(
          "g",
          { className: "alert-bob" },
          React.createElement("circle", {
            cx: p / 2 - 3,
            cy: -17,
            r: 8.5,
            fill: "#D9534F",
            stroke: "#FFF8EC",
            strokeWidth: "1.8",
          }),
          React.createElement(
            "text",
            {
              x: p / 2 - 3,
              y: -12.8,
              textAnchor: "middle",
              className: "np-alert",
            },
            "!",
          ),
        ),
    );
  }
/*@@CITY@@*/
  var To = Mo(
    function ({ lm: t, ls: s, onOpen: n, onShip: o, rising: i }) {
      let l = Cs[t.kind] || Cs.house,
        d = l.C,
        p = l.label[Math.max(0, Math.min(2, t.tier - 1))],
        u = () => n(t.id);
      return React.createElement(
        "g",
        { transform: `translate(${t.x},${t.y})` },
        React.createElement(
          "g",
          {
            className: "lm" + (i ? " rising" : ""),
            onClick: u,
            tabIndex: "0",
            role: "button",
            "aria-label": `${t.name}, level ${t.level}. Open.`,
            onKeyDown: (c) => {
              (c.key === "Enter" || c.key === " ") && (c.preventDefault(), u());
            },
          },
          React.createElement("ellipse", {
            cx: 38,
            cy: 18,
            rx: l.ring[0] * 1.5,
            ry: l.ring[1] * 0.72,
            fill: "rgba(80,50,20,0.16)",
            filter: "url(#soft)",
          }),
          React.createElement(
            "g",
            { className: "lm-lift" },
            React.createElement("ellipse", {
              className: "hover-ring",
              cx: 0,
              cy: 4,
              rx: l.ring[0] * 1.42,
              ry: l.ring[1] * 0.82,
              fill: "rgba(255,248,236,0.18)",
              stroke: t.color,
              strokeWidth: "3",
              strokeDasharray: "7 5",
            }),
            React.createElement(d, {
              tier: t.tier,
              c: t.color,
              data: t.data,
              kind: t.kind,
              onShip: o,
            }),
            (t.crew || []).slice(0, 4).map((c, r) => {
              let [y, k] = ye(As[r][0], As[r][1]);
              return React.createElement(cn, {
                key: c.id + r,
                sx: y,
                sy: k,
                shirt: c.color,
                walk: r % 2 ? "walk-b" : "walk-a",
                delay: r * 0.7,
                title: c.name,
              });
            }),
            React.createElement(So, {
              y: p,
              name: t.name,
              level: t.level,
              color: t.color,
              open: t.open,
              alert: t.alert,
              s,
            }),
          ),
        ),
      );
    },
    (e, t) => e.lm.sig === t.lm.sig && e.ls === t.ls && e.rising === t.rising,
  );
  function mn({
    path: e,
    dur: t,
    flip: s,
    c: n = "#F6EDDF",
    sail2: o = "#D9734E",
    begin: i = "0s",
  }) {
    return React.createElement(
      "g",
      null,
      React.createElement(
        "g",
        { transform: s ? "scale(-1,1)" : void 0 },
        React.createElement(
          "g",
          { className: "bob" },
          React.createElement("ellipse", {
            cx: "0",
            cy: "3",
            rx: "18",
            ry: "4",
            fill: "rgba(10,50,60,0.18)",
          }),
          React.createElement("path", {
            d: "M-15,-2 L15,-2 L10,5 L-11,5 Z",
            fill: "#2F4E5A",
          }),
          React.createElement("path", {
            d: "M-15,-2 L15,-2 L14,0 L-14,0 Z",
            fill: "#F6EDDF",
          }),
          React.createElement("line", {
            x1: "0",
            y1: "-2",
            x2: "0",
            y2: "-34",
            stroke: "#6F5A45",
            strokeWidth: "1.3",
          }),
          React.createElement("path", { d: "M1,-33 L15,-5 L1,-5 Z", fill: n }),
          React.createElement("path", {
            d: "M-1,-28 L-11,-5 L-1,-5 Z",
            fill: o,
          }),
          React.createElement("path", {
            className: "ripple",
            d: "M-20,6 q10,3 20,0 q10,-3 20,0",
            stroke: "rgba(255,255,255,0.6)",
            strokeWidth: "1",
            fill: "none",
          }),
        ),
      ),
      React.createElement("animateMotion", {
        path: e,
        dur: t,
        begin: i,
        repeatCount: "indefinite",
      }),
    );
  }
  function Es({ path: e, dur: t, begin: s }) {
    return React.createElement(
      "g",
      null,
      React.createElement("path", {
        className: "flap",
        d: "M-7,0 q3.5,-4 7,0 q3.5,-4 7,0",
        stroke: "#FFFFFF",
        strokeWidth: "1.6",
        fill: "none",
        strokeLinecap: "round",
      }),
      React.createElement("animateMotion", {
        path: e,
        dur: t,
        begin: s,
        repeatCount: "indefinite",
      }),
    );
  }
  var gn = Bo(function (
    {
      blobs: t,
      landmarks: s,
      onOpen: n,
      onShip: o,
      risingId: i,
      onCam: l,
      paused: d,
      reserveRight: p = 0,
      city: city,
      onPlot: onPlot,
      onAgent: onAgent,
    },
    u,
  ) {
    let svgRef = ot(null),
      plotRef = ot(onPlot),
      agentRef = ot(onAgent);
    ((plotRef.current = onPlot), (agentRef.current = onAgent));
    let c = ot(!1),
      r = ot(null),
      y = ot(null),
      k = ot(null),
      f = ot(null),
      w = ot({ tx: 0, ty: 0, s: 0.8, fit: 0.8 }),
      [v, $] = hn(1),
      [E, M] = hn(1),
      N = ot({ pointers: new Map(), moved: !1, start: null, pinch: null }),
      P = ot(!1),
      he = ot(!1),
      R = as(
        () => yn(t.map((h) => ({ ...h, k: 1 }))),
        [JSON.stringify(t.map((h) => [h.id, h.x, h.y, h.r]))],
      ),
      K = as(
        () => zo(t, R),
        [
          JSON.stringify(
            t.map((h) => [
              h.id,
              h.x,
              h.y,
              h.r,
              h.k == null ? 1 : Math.round(h.k * 50),
            ]),
          ),
          R,
        ],
      ),
      de = t.some((h) => h.k != null && h.k < 1);
    os(() => {
      k.current && Lo(k.current, f.current, K, de ? 0.5 : E);
    }, [K, E, de]);
    let we = yt(() => {
        let h = w.current;
        y.current &&
          (y.current.style.transform = `translate3d(${h.tx}px,${h.ty}px,0) scale(${h.s})`);
      }, []),
      ee = yt(() => {
        let h = w.current,
          x = r.current;
        if (!x) return;
        let A = x.clientWidth,
          B = x.clientHeight,
          H = A * 0.2 - (R.x + R.w) * h.s,
          se = A * 0.8 - R.x * h.s,
          ke = B * 0.2 - (R.y + R.h) * h.s,
          Ee = B * 0.8 - R.y * h.s;
        ((h.tx = Math.min(se, Math.max(H, h.tx))),
          (h.ty = Math.min(Ee, Math.max(ke, h.ty))));
      }, [R]),
      ce = yt(() => {
        let h = w.current.s,
          x =
            Math.round(
              Math.min(2.4, Math.max(0.85, 1 / Math.pow(h, 0.85))) * 20,
            ) / 20;
        $(x);
        let A = window.devicePixelRatio || 1,
          B = Math.round(Math.min(1.6, Math.max(0.8, h * A)) * 4) / 4;
        (M((H) => (Math.abs(H - B) >= 0.25 ? B : H)), l && l({ ...w.current }));
      }, [l]),
      $e = yt(
        (h, x) => {
          let A = r.current;
          if (!A) return;
          let B = A.clientWidth,
            H = A.clientHeight,
            se = B < 700,
            ke = se ? 150 : 110,
            Ee = se ? 120 : 110,
            be = !se && B > 1100 ? p : 0,
            Oe = yn(
              t.map((it) => ({ ...it, k: 1 })),
              -40,
            ),
            je = Math.max(
              0.2,
              Math.min(
                1.25,
                Math.min((B - 32 - be) / Oe.w, (H - ke - Ee) / Oe.h),
              ),
            );
          w.current.fit = je;
          let Ve = je,
            Xe = Oe.x + Oe.w / 2,
            Ye = Oe.y + Oe.h / 2;
          x && se && ((Ve = Math.max(je, 0.5)), (Xe = -20), (Ye = 20));
          let Ue = {
            s: Ve,
            tx: (B - be) / 2 - Xe * Ve,
            ty: ke + (H - ke - Ee) / 2 - Ye * Ve,
          };
          h ? ne(Ue) : (Object.assign(w.current, Ue), ee(), we(), ce());
        },
        [t, we, ce, p, ee],
      ),
      z = ot(0),
      ne = yt(
        (h, x = 650) => {
          cancelAnimationFrame(z.current);
          let A = { ...w.current },
            B = performance.now(),
            H =
              window.matchMedia &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            se = (ke) => {
              let Ee = H ? 1 : Math.min(1, (ke - B) / x),
                be = 1 - Math.pow(1 - Ee, 3);
              ((w.current.tx = A.tx + (h.tx - A.tx) * be),
                (w.current.ty = A.ty + (h.ty - A.ty) * be),
                (w.current.s = A.s + (h.s - A.s) * be),
                we(),
                Ee < 1 ? (z.current = requestAnimationFrame(se)) : ce());
            };
          z.current = requestAnimationFrame(se);
        },
        [we, ce],
      ),
      fe = yt(
        (h, x, A) => {
          let B = w.current,
            H = Math.max(B.fit * 0.7, Math.min(2.6, B.s * A));
          ((B.tx = h - (h - B.tx) * (H / B.s)),
            (B.ty = x - (x - B.ty) * (H / B.s)),
            (B.s = H),
            ee(),
            we());
        },
        [we, ee],
      );
    ($o(
      u,
      () => ({
        fit: () => $e(!0),
        zoom: (h) => {
          let x = r.current;
          (fe(x.clientWidth / 2, x.clientHeight / 2, h), ce());
        },
        flyTo: (h, x, A = {}) => {
          let B = r.current;
          if (!B) return;
          let H = B.clientWidth,
            se = B.clientHeight,
            ke =
              A.s || Math.max(w.current.s, Math.min(1.15, w.current.fit * 1.5)),
            Ee = A.offsetX || 0,
            be = A.offsetY || 0;
          ne({
            s: ke,
            tx: (H - Ee) / 2 - h * ke,
            ty: (se - be) / 2 + 30 - x * ke,
          });
        },
        toScreen: (h, x) => {
          let A = w.current,
            B = r.current.getBoundingClientRect();
          return { x: B.left + A.tx + h * A.s, y: B.top + A.ty + x * A.s };
        },
      }),
      [$e, fe, ne, ce],
    ),
      os(() => {
        he.current || ($e(!1, !0), (he.current = !0));
      }, [$e]),
      os(() => {
        let h = null,
          x = () => {
            (clearTimeout(h),
              (h = setTimeout(() => {
                c.current ? (ee(), we()) : $e(!1, !0);
              }, 120)));
          };
        return (
          window.addEventListener("resize", x),
          () => window.removeEventListener("resize", x)
        );
      }, [$e]),
      os(() => {
        let h = r.current;
        if (!h) return;
        let x = (A) => {
          (A.preventDefault(), (c.current = !0));
          let B = h.getBoundingClientRect(),
            H = A.ctrlKey ? 0.012 : 0.0016;
          (fe(A.clientX - B.left, A.clientY - B.top, Math.exp(-A.deltaY * H)),
            clearTimeout(x.t),
            (x.t = setTimeout(ce, 160)));
        };
        return (
          h.addEventListener("wheel", x, { passive: !1 }),
          () => h.removeEventListener("wheel", x)
        );
      }, [fe, ce]));
    let xe = (h) => {
        if (h.button !== void 0 && h.button !== 0 && h.pointerType === "mouse")
          return;
        let x = N.current;
        if (
          (x.pointers.set(h.pointerId, { x: h.clientX, y: h.clientY }),
          cancelAnimationFrame(z.current),
          x.pointers.size === 1 &&
            ((x.moved = !1),
            (x.start = {
              x: h.clientX,
              y: h.clientY,
              tx: w.current.tx,
              ty: w.current.ty,
            })),
          x.pointers.size === 2)
        ) {
          let [A, B] = [...x.pointers.values()];
          ((x.pinch = {
            dist: Math.hypot(A.x - B.x, A.y - B.y),
            s: w.current.s,
          }),
            (x.moved = !0));
        }
      },
      C = (h) => {
        let x = N.current;
        if (x.pointers.has(h.pointerId)) {
          if (
            (x.pointers.set(h.pointerId, { x: h.clientX, y: h.clientY }),
            x.pointers.size === 1 && x.start)
          ) {
            let A = h.clientX - x.start.x,
              B = h.clientY - x.start.y;
            if (!x.moved && Math.hypot(A, B) > 5) {
              ((x.moved = !0), (c.current = !0));
              try {
                r.current.setPointerCapture(h.pointerId);
              } catch {}
              r.current.classList.add("dragging");
            }
            x.moved &&
              ((w.current.tx = x.start.tx + A),
              (w.current.ty = x.start.ty + B),
              ee(),
              we());
          } else if (x.pointers.size === 2 && x.pinch) {
            let [A, B] = [...x.pointers.values()],
              H = Math.hypot(A.x - B.x, A.y - B.y),
              se = r.current.getBoundingClientRect(),
              ke = (A.x + B.x) / 2 - se.left,
              Ee = (A.y + B.y) / 2 - se.top;
            fe(ke, Ee, (x.pinch.s * H) / x.pinch.dist / w.current.s);
          }
        }
      },
      G = (h) => {
        let x = N.current;
        if (
          (x.pointers.delete(h.pointerId),
          x.pointers.size < 2 && (x.pinch = null),
          x.pointers.size === 1)
        ) {
          let [A] = [...x.pointers.values()];
          x.start = { x: A.x, y: A.y, tx: w.current.tx, ty: w.current.ty };
        }
        x.pointers.size === 0 &&
          (r.current.classList.remove("dragging"),
          x.moved &&
            ((P.current = !0),
            setTimeout(() => {
              P.current = !1;
            }, 60),
            ce()),
          (x.start = null));
      },
      Ce = yt(
        (h) => {
          P.current || n(h);
        },
        [n],
      ),
      Qe = yt(
        (h) => {
          (h.stopPropagation(), P.current || (o && o()));
        },
        [o],
      ),
      pe = as(() => {
        let h = Zs(ms("valley-isle") + t.length),
          x = s.map((q) => ({ x: q.x, y: q.y })),
          A = t.find((q) => q.id === "plaza");
        A && x.push({ x: A.x, y: A.y });
        let B = [],
          H = [],
          se = (q, I, W = 0.18) => {
            let V = (q.x + I.x) / 2,
              Me = (q.y + I.y) / 2,
              lt = -(I.y - q.y),
              gt = I.x - q.x,
              Tt = V + lt * W * 0.5,
              It = Me + gt * W * 0.25;
            H.push(
              `M${q.x.toFixed(1)},${q.y.toFixed(1)} Q${Tt.toFixed(1)},${It.toFixed(1)} ${I.x.toFixed(1)},${I.y.toFixed(1)}`,
            );
            for (let ze = 0; ze <= 1; ze += 0.05)
              B.push({
                x:
                  (1 - ze) * (1 - ze) * q.x +
                  2 * (1 - ze) * ze * Tt +
                  ze * ze * I.x,
                y:
                  (1 - ze) * (1 - ze) * q.y +
                  2 * (1 - ze) * ze * It +
                  ze * ze * I.y,
              });
          };
        if (A) {
          let q = { x: A.x, y: A.y + 8 };
          s.forEach((V, Me) => {
            if (V.id === "port") return;
            let lt = {
              x: V.x + (V.kind === "hub" ? -10 : 0),
              y: V.y + (V.kind === "lighthouse" ? 30 : 46),
            };
            se(q, lt, Me % 2 ? 0.14 : -0.14);
          });
          let I = s.find((V) => V.id === "hub"),
            W = s.find((V) => V.id === "port");
          I &&
            W &&
            se({ x: I.x + 40, y: I.y + 30 }, { x: W.x - 40, y: W.y - 4 }, 0.1);
        }
        H.length = 0;
        let ke = (q, I, W = 118) => !City.free(city, q, I, W > 110 ? 6 : 2),
          Ee = () => !1,
          be = [],
          Oe = [],
          je = [],
          Ve = [],
          Xe = [],
          { x: Ye, y: Ue, w: it, h: Ke } = K.bbox;
        for (let q = 0; q < 9000 && be.length < 190; q++) {
          let I = Ye + h() * it,
            W = Ue + h() * Ke;
          Gt(K, I, W) > Ct.grass + 0.1 &&
            !ke(I, W) &&
            !Ee(I, W) &&
            !be.some(
              (Me) => Math.abs(Me.x - I) < 16 && Math.abs(Me.y - W) < 10,
            ) &&
            be.push({
              x: I,
              y: W,
              s: 0.75 + h() * 0.45,
              v: (h() * 3) | 0,
              pine: h() < 0.22,
            });
        }
        for (let q = 0; q < 6000 && Oe.length < 46; q++) {
          let I = Ye + h() * it,
            W = Ue + h() * Ke,
            V = Gt(K, I, W);
          V > Ct.sand + 0.05 &&
            V < Ct.grass - 0.02 &&
            !ke(I, W, 100, 60) &&
            !Ee(I, W) &&
            !Oe.some(
              (Me) => Math.abs(Me.x - I) < 30 && Math.abs(Me.y - W) < 16,
            ) &&
            Oe.push({ x: I, y: W, s: 0.8 + h() * 0.35, flip: h() < 0.5 });
        }
        for (let q = 0; q < 3000 && je.length < 26; q++) {
          let I = Ye + h() * it,
            W = Ue + h() * Ke,
            V = Gt(K, I, W);
          V > Ct.sand - 0.02 &&
            V < Ct.sand + 0.05 &&
            !ke(I, W, 100, 60) &&
            je.push({ x: I, y: W, s: 0.7 + h() * 0.7 });
        }
        for (let q = 0; q < 5000 && Ve.length < 110; q++) {
          let I = Ye + h() * it,
            W = Ue + h() * Ke;
          Gt(K, I, W) > Ct.grass + 0.05 &&
            !ke(I, W, 105, 66) &&
            !Ee(I, W, 14) &&
            Ve.push({
              x: I,
              y: W,
              c: ["#F4A3B5", "#F2C14E", "#FFFFFF", "#C9A3E6"][(h() * 4) | 0],
            });
        }
        for (let q = 0; q < 3000 && Xe.length < 160; q++) {
          let I = Ye - 200 + h() * (it + 400),
            W = Ue - 120 + h() * (Ke + 240);
          Gt(K, I, W) < 0.02 &&
            Xe.push({ x: I, y: W, w: 5 + h() * 9, d: h() * 6 });
        }
        return {
          trees: be,
          palms: Oe,
          rocks: je,
          flowers: Ve,
          sparkles: Xe,
          paths: H,
        };
      }, [
        K.bbox.x,
        K.bbox.y,
        K.bbox.w,
        K.bbox.h,
        t.length,
        s.map((h) => h.id + h.x + "," + h.y).join("|"),
        de ? 1 : 0,
      ]),
      Ge = as(() => {
        let h = [];
        return (
          pe.trees.forEach((x, A) =>
            h.push({
              y: x.y,
              el: x.pine
                ? React.createElement(Ot, {
                    key: "t" + A,
                    sx: x.x,
                    sy: x.y,
                    s: x.s,
                  })
                : React.createElement(ht, {
                    key: "t" + A,
                    sx: x.x,
                    sy: x.y,
                    s: x.s,
                    v: x.v,
                  }),
            }),
          ),
          pe.palms.forEach((x, A) =>
            h.push({
              y: x.y,
              el: React.createElement(Mt, {
                key: "p" + A,
                sx: x.x,
                sy: x.y,
                s: x.s,
                flip: x.flip,
              }),
            }),
          ),
          pe.rocks.forEach((x, A) =>
            h.push({
              y: x.y,
              el: React.createElement(Bt, {
                key: "r" + A,
                sx: x.x,
                sy: x.y,
                s: x.s,
              }),
            }),
          ),
          h
        );
      }, [pe]),
      te = city.plots.plaza,
      cityObjs = as(
        () => City.objects(city, (k) => plotRef.current && plotRef.current(k)),
        [city],
      ),
      bandStep = 14,
      bandY0 = R.y - 40,
      bandN = Math.ceil((R.h + 80) / bandStep),
      ue = [...Ge, ...cityObjs];
    for (let bi = 0; bi < bandN; bi++)
      ue.push({
        y: bandY0 + bi * bandStep + bandStep / 2,
        el: React.createElement("g", { key: "band" + bi, "data-band": bi }),
      });
    (te &&
      ue.push({
        y: te.y,
        el: React.createElement(
          "g",
          { key: "plaza", transform: `translate(${te.x},${te.y})` },
          React.createElement(un, null),
        ),
      }),
      s.forEach((h) =>
        ue.push({
          y: h.y + (h.kind === "port" ? -20 : 0),
          el: React.createElement(To, {
            key: h.id,
            lm: h,
            ls: v,
            onOpen: Ce,
            onShip: Qe,
            rising: i === h.id,
          }),
        }),
      ),
      ue.sort((h, x) => h.y - x.y));
    os(() => {
      let h = svgRef.current;
      if (!h) return;
      let x = [...h.querySelectorAll("[data-band]")].sort(
          (B, H) => +B.dataset.band - +H.dataset.band,
        ),
        A = City.startLife(
          city,
          x,
          bandY0,
          bandStep,
          (B) => P.current || (agentRef.current && agentRef.current(B)),
        );
      return () => A.stop();
    }, [city, bandY0, bandN]);
    let { x: j, y: _, w: Z, h: Ae } = R,
      De = { x0: j - 300, x1: j + Z + 300, yb: _ + Ae - 30, yt: _ + 40 };
    return React.createElement(
      "div",
      {
        ref: r,
        className: "viewport",
        onPointerDown: xe,
        onPointerMove: C,
        onPointerUp: G,
        onPointerCancel: G,
      },
      React.createElement(
        "div",
        { ref: y, className: "world" },
        React.createElement("canvas", {
          ref: k,
          className: "ground",
          style: { left: j, top: _, width: Z, height: Ae },
        }),
        React.createElement("canvas", {
          ref: f,
          className: "foam",
          style: { left: j, top: _, width: Z, height: Ae },
        }),
        React.createElement(
          "svg",
          {
            ref: svgRef,
            className: "scene",
            viewBox: `${j} ${_} ${Z} ${Ae}`,
            width: Z,
            height: Ae,
            style: { left: j, top: _ },
            overflow: "visible",
          },
          React.createElement(
            "defs",
            null,
            React.createElement(
              "linearGradient",
              { id: "cylShade", x1: "0", x2: "1", y1: "0", y2: "0" },
              React.createElement("stop", {
                offset: "0",
                stopColor: "#FFFFFF",
                stopOpacity: "0.22",
              }),
              React.createElement("stop", {
                offset: "0.42",
                stopColor: "#FFFFFF",
                stopOpacity: "0",
              }),
              React.createElement("stop", {
                offset: "1",
                stopColor: "#2A1606",
                stopOpacity: "0.30",
              }),
            ),
            React.createElement(
              "radialGradient",
              { id: "lampGlow" },
              React.createElement("stop", {
                offset: "0",
                stopColor: "#FFF4C4",
                stopOpacity: "1",
              }),
              React.createElement("stop", {
                offset: "0.4",
                stopColor: "#FFD56B",
                stopOpacity: "0.6",
              }),
              React.createElement("stop", {
                offset: "1",
                stopColor: "#FFB84D",
                stopOpacity: "0",
              }),
            ),
            React.createElement(
              "linearGradient",
              { id: "beamGrad", x1: "0", x2: "1" },
              React.createElement("stop", {
                offset: "0",
                stopColor: "#FFF1B8",
                stopOpacity: "0.9",
              }),
              React.createElement("stop", {
                offset: "1",
                stopColor: "#FFF1B8",
                stopOpacity: "0",
              }),
            ),
            React.createElement(
              "filter",
              {
                id: "soft",
                x: "-40%",
                y: "-80%",
                width: "180%",
                height: "260%",
              },
              React.createElement("feGaussianBlur", { stdDeviation: "7" }),
            ),
            React.createElement(
              "filter",
              {
                id: "cloudBlur",
                x: "-50%",
                y: "-50%",
                width: "200%",
                height: "200%",
              },
              React.createElement("feGaussianBlur", { stdDeviation: "26" }),
            ),
          ),
          pe.sparkles.map((h, x) =>
            React.createElement("line", {
              key: x,
              className: "sparkle",
              style: { animationDelay: h.d + "s" },
              x1: h.x,
              y1: h.y,
              x2: h.x + h.w,
              y2: h.y,
              stroke: "#E8FFFB",
              strokeWidth: "1.6",
              strokeLinecap: "round",
            }),
          ),
          !d &&
            React.createElement(
              React.Fragment,
              null,
              React.createElement(mn, {
                path: `M${De.x0},${De.yb} L${De.x1},${De.yb + 60}`,
                dur: "95s",
              }),
              React.createElement(mn, {
                path: `M${De.x1},${De.yt} L${De.x0},${De.yt - 50}`,
                dur: "120s",
                flip: !0,
                c: "#FFF8EC",
                sail2: "#2A9D8F",
                begin: "-40s",
              }),
            ),
          React.createElement(City.Lots, { city }),
          React.createElement(City.Ground, { city }),
          React.createElement(
            "g",
            { className: "paths" },
            pe.paths.map((h, x) =>
              React.createElement("path", {
                key: "e" + x,
                d: h,
                stroke: "#CDAF7A",
                strokeWidth: "17",
                fill: "none",
                strokeLinecap: "round",
              }),
            ),
            pe.paths.map((h, x) =>
              React.createElement("path", {
                key: "m" + x,
                d: h,
                stroke: "#EBD5A6",
                strokeWidth: "12",
                fill: "none",
                strokeLinecap: "round",
              }),
            ),
            pe.paths.map((h, x) =>
              React.createElement("path", {
                key: "s" + x,
                d: h,
                stroke: "#F6E7C6",
                strokeWidth: "3.2",
                fill: "none",
                strokeLinecap: "round",
                strokeDasharray: "1.5 10",
              }),
            ),
          ),
          pe.flowers.map((h, x) =>
            React.createElement(
              "g",
              { key: "f" + x },
              React.createElement("circle", {
                cx: h.x,
                cy: h.y,
                r: "1.7",
                fill: h.c,
              }),
              React.createElement("circle", {
                cx: h.x + 4,
                cy: h.y + 1.5,
                r: "1.4",
                fill: h.c,
              }),
              React.createElement("circle", {
                cx: h.x + 1.5,
                cy: h.y + 3,
                r: "1.2",
                fill: h.c,
              }),
            ),
          ),
          ue.map((h) => h.el),
          React.createElement(City.Signs, { city, ls: v }),
          !d &&
            React.createElement(
              "g",
              { className: "clouds", pointerEvents: "none" },
              [0, 1, 2].map((h) =>
                React.createElement(
                  "ellipse",
                  {
                    key: h,
                    rx: 170 + h * 40,
                    ry: 70 + h * 14,
                    fill: "#1E1408",
                    opacity: "0.07",
                    filter: "url(#cloudBlur)",
                  },
                  React.createElement("animateMotion", {
                    path: `M${j - 300},${_ + 120 + h * 260} L${j + Z + 300},${_ + 60 + h * 260}`,
                    dur: `${140 + h * 50}s`,
                    begin: `-${h * 55}s`,
                    repeatCount: "indefinite",
                  }),
                ),
              ),
              React.createElement(Es, {
                path: `M${j - 60},${_ + 180} Q${j + Z / 2},${_ + 40} ${j + Z + 60},${_ + 220}`,
                dur: "38s",
                begin: "0s",
              }),
              React.createElement(Es, {
                path: `M${j - 80},${_ + 205} Q${j + Z / 2},${_ + 60} ${j + Z + 40},${_ + 250}`,
                dur: "38s",
                begin: "-1.2s",
              }),
              React.createElement(Es, {
                path: `M${j + Z + 60},${_ + Ae - 160} Q${j + Z / 2},${_ + Ae - 40} ${j - 60},${_ + Ae - 220}`,
                dur: "52s",
                begin: "-20s",
              }),
            ),
        ),
      ),
    );
  });
  var { useState: ve, useEffect: fn, useMemo: ca, useRef: da } = React,
    ie = (e, t) =>
      function ({ size: n = 20, className: o = "", style: i }) {
        return React.createElement(
          "svg",
          {
            width: n,
            height: n,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            className: o,
            style: i,
            "aria-hidden": "true",
          },
          e,
          t,
        );
      },
    is = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("rect", {
          x: "3",
          y: "4",
          width: "5",
          height: "16",
          rx: "1.5",
        }),
        React.createElement("rect", {
          x: "10",
          y: "4",
          width: "5",
          height: "11",
          rx: "1.5",
        }),
        React.createElement("rect", {
          x: "17",
          y: "4",
          width: "4",
          height: "7",
          rx: "1.5",
        }),
      ),
    ),
    ls = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("circle", { cx: "12", cy: "5", r: "2" }),
        React.createElement("path", {
          d: "M12 7v14M5 13H3a9 9 0 0 0 18 0h-2M8 10h8",
        }),
      ),
    ),
    xn = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", {
          d: "M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12",
        }),
      ),
    ),
    $s = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", {
          d: "M9 21l1.5-12h3L15 21M8 21h8M10 9l.5-3h3l.5 3M12 3v1M4 6l3 1M20 6l-3 1",
        }),
      ),
    ),
    zs = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("circle", { cx: "9", cy: "8", r: "3" }),
        React.createElement("path", { d: "M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" }),
        React.createElement("circle", { cx: "17", cy: "9", r: "2.5" }),
        React.createElement("path", { d: "M16 14c2.8.2 5 2.6 5 5.5" }),
      ),
    ),
    At = ie(React.createElement("path", { d: "M12 5v14M5 12h14" })),
    Ls = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", {
          d: "M2 18c2.5 1.5 5 1.5 7.5 0s5-1.5 7.5 0 3.5 1 5 0",
        }),
        React.createElement("path", { d: "M6 15c1.5-2 4-3 6-3s4.5 1 6 3" }),
        React.createElement("path", {
          d: "M12 12V6M12 6c-2-2-4-2-5-1M12 6c2-2 4-2 5-1M12 6c0-2-1-3-2-3.5",
        }),
      ),
    ),
    kn = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", { d: "M4 9v6h4l5 4V5L8 9H4z" }),
        React.createElement("path", {
          d: "M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11",
        }),
      ),
    ),
    vn = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", { d: "M4 9v6h4l5 4V5L8 9H4z" }),
        React.createElement("path", { d: "M17 9l4 6M21 9l-4 6" }),
      ),
    ),
    wn = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("circle", { cx: "11", cy: "11", r: "7" }),
        React.createElement("path", { d: "M11 8v6M8 11h6M20 20l-4-4" }),
      ),
    ),
    bn = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("circle", { cx: "11", cy: "11", r: "7" }),
        React.createElement("path", { d: "M8 11h6M20 20l-4-4" }),
      ),
    ),
    Nn = ie(
      React.createElement("path", {
        d: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
      }),
    ),
    Fn = ie(
      React.createElement("path", {
        d: "M12 21c-3.9 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.3 2 1.3 3 2.5 3.5C10.5 8 12 5 15 3c-.3 3 1 4.5 2.3 6.2C18.4 10.7 19 12.3 19 14.5 19 18.3 15.9 21 12 21z",
      }),
    ),
    Ss = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("circle", { cx: "12", cy: "12", r: "8.5" }),
        React.createElement("path", {
          d: "M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.6 0-2.8.8-2.8 2s1.2 1.6 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2c-1.1 0-2.1-.4-2.6-1.3M12 6.5v11",
        }),
      ),
    ),
    jt = ie(React.createElement("path", { d: "M5 12.5l4.5 4.5L19 7.5" })),
    Cn = ie(React.createElement("path", { d: "M6 6l12 12M18 6L6 18" })),
    mt = ie(
      React.createElement("path", { d: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" }),
    ),
    Io = ie(React.createElement("path", { d: "M5 12h14M13 6l6 6-6 6" })),
    Wo = ie(React.createElement("path", { d: "M19 12H5M11 6l-6 6 6 6" })),
    Ts = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", {
          d: "M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8",
        }),
        React.createElement("path", {
          d: "M6 4a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2zM8 20a2 2 0 0 1-2-2V8M10 9h6M10 13h6",
        }),
      ),
    ),
    Po = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", {
          d: "M3 15l2 5h14l2-5H3zM6 15V9h9l3 6M9 9V5h4v4",
        }),
      ),
    ),
    Is = ie(React.createElement("path", { d: "M6 9l6 6 6-6" })),
    pa = ie(React.createElement("path", { d: "M7 5l12 7-12 7z" })),
    Oo = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("circle", { cx: "11", cy: "11", r: "7" }),
        React.createElement("path", { d: "M20 20l-4-4" }),
      ),
    ),
    An = ie(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", {
          d: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
        }),
      ),
    );
  function Q({ variant: e = "", className: t = "", children: s, ...n }) {
    return React.createElement(
      "button",
      { type: "button", className: `gbtn ${e} ${t}`, ...n },
      s,
    );
  }
  function Pe({ label: e, children: t, className: s = "", ...n }) {
    return React.createElement(
      "button",
      {
        type: "button",
        className: `icon-btn ${s}`,
        "aria-label": e,
        title: e,
        ...n,
      },
      t,
    );
  }
  function Ws({ w: e, size: t = 26 }) {
    let s = e || { name: "?", color: "#9AA7AE", kind: "role" },
      n = (s.name || "?")
        .split(/\s+/)
        .map((o) => o[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return React.createElement(
      "span",
      {
        title: s.name,
        className: "avatar",
        style: {
          width: t,
          height: t,
          fontSize: t * 0.4,
          background: T(s.color, 0.78),
          color: T(s.color, -0.35),
          borderColor: T(s.color, 0.25),
        },
      },
      s.kind === "role" &&
        React.createElement("span", {
          className: "avatar-role",
          style: { background: s.color },
        }),
      n,
    );
  }
  function Bs({ color: e, children: t }) {
    return React.createElement(
      "span",
      {
        className: "tag",
        style: {
          color: T(e, -0.25),
          background: pt(e, 0.13),
          borderColor: pt(e, 0.28),
        },
      },
      t,
    );
  }
  function rs({ info: e, color: t = "#E9B949", height: s = 8 }) {
    return React.createElement(
      "div",
      { className: "xpbar", style: { height: s } },
      React.createElement("div", {
        className: "xpbar-fill",
        style: {
          width: Math.max(4, e.pct * 100) + "%",
          background: `linear-gradient(90deg, ${T(t, 0.15)}, ${t})`,
        },
      }),
    );
  }
  function Y({ label: e, children: t, className: s = "" }) {
    return React.createElement(
      "label",
      { className: `block ${s}` },
      React.createElement("span", { className: "lbl" }, e),
      t,
    );
  }
  function Ms({ active: e, color: t = "#566B6E", onClick: s, children: n }) {
    return React.createElement(
      "button",
      {
        type: "button",
        onClick: s,
        className: "chip" + (e ? " on" : ""),
        style: e
          ? { background: t, borderColor: t, color: "#fff" }
          : {
              color: T(t, -0.2),
              borderColor: pt(t, 0.35),
              background: pt(t, 0.08),
            },
      },
      React.createElement("span", {
        className: "chip-dot",
        style: { background: e ? "#fff" : t },
      }),
      n,
    );
  }
  function zt({
    title: e,
    sub: t,
    color: s = "#2A9D8F",
    icon: n,
    onClose: o,
    children: i,
    wide: l,
    headerExtra: d,
  }) {
    return React.createElement(
      "aside",
      {
        className: "drawer hud-card drawer-in" + (l ? " wide" : ""),
        role: "dialog",
        "aria-label": e,
      },
      React.createElement(
        "div",
        {
          className: "drawer-head",
          style: {
            background: `linear-gradient(135deg, ${pt(s, 0.2)}, ${pt(s, 0.04)})`,
          },
        },
        React.createElement(
          "span",
          { className: "drawer-icon", style: { background: s } },
          n,
        ),
        React.createElement(
          "div",
          { className: "min-w-0 flex-1" },
          React.createElement("h2", { className: "drawer-title" }, e),
          t && React.createElement("div", { className: "drawer-sub" }, t),
        ),
        d,
        React.createElement(
          Pe,
          { label: "Close", onClick: o },
          React.createElement(Cn, null),
        ),
      ),
      React.createElement("div", { className: "drawer-body scroll-y" }, i),
    );
  }
  function cs({
    title: e,
    color: t = "#2A9D8F",
    onClose: s,
    children: n,
    footer: o,
    width: i = 520,
  }) {
    return (
      fn(() => {
        let l = (d) => {
          d.key === "Escape" && s();
        };
        return (
          window.addEventListener("keydown", l),
          () => window.removeEventListener("keydown", l)
        );
      }, [s]),
      React.createElement(
        "div",
        {
          className: "modal-back",
          onMouseDown: (l) => {
            l.target === l.currentTarget && s();
          },
        },
        React.createElement(
          "div",
          {
            className: "hud-card modal-card",
            style: { maxWidth: i },
            role: "dialog",
            "aria-label": e,
          },
          React.createElement(
            "div",
            { className: "modal-head" },
            React.createElement("span", {
              className: "modal-dot",
              style: { background: t },
            }),
            React.createElement("h2", { className: "drawer-title" }, e),
            React.createElement(
              Pe,
              { label: "Close", className: "ml-auto", onClick: s },
              React.createElement(Cn, null),
            ),
          ),
          React.createElement("div", { className: "modal-body scroll-y" }, n),
          o && React.createElement("div", { className: "modal-foot" }, o),
        ),
      )
    );
  }
  function Dn({
    text: e,
    confirmLabel: t = "Delete",
    onCancel: s,
    onConfirm: n,
  }) {
    return React.createElement(
      cs,
      {
        title: "Are you sure?",
        color: "#D9534F",
        onClose: s,
        width: 420,
        footer: React.createElement(
          React.Fragment,
          null,
          React.createElement(Q, { variant: "ghost", onClick: s }, "Cancel"),
          React.createElement(Q, { variant: "danger", onClick: n }, t),
        ),
      },
      React.createElement(
        "p",
        {
          className: "text-[15px] leading-relaxed",
          style: { color: "var(--ink2)" },
        },
        e,
      ),
    );
  }
  function En({
    t: e,
    worker: t,
    section: s,
    showSection: n,
    onToggle: o,
    onStart: i,
    onEdit: l,
    onDelete: d,
    quest: p,
  }) {
    let u = e.status === "done",
      c = e.status === "doing",
      r = en[e.worktype],
      y = Ut(e);
    return React.createElement(
      "div",
      { className: "task-row" + (u ? " is-done" : "") + (p ? " quest" : "") },
      React.createElement(
        "button",
        {
          type: "button",
          className: "status-btn s-" + e.status,
          onClick: () => o(e),
          "aria-label": u ? "Mark not done" : "Mark done",
          title: u ? "Mark not done" : `Complete \xB7 +${bt(e)} XP`,
        },
        u
          ? React.createElement(jt, { size: 14 })
          : c
            ? React.createElement("span", { className: "doing-dot" })
            : null,
      ),
      React.createElement(
        "button",
        { type: "button", className: "task-main", onClick: () => l(e) },
        React.createElement("span", { className: "task-title" }, e.title),
        React.createElement(
          "span",
          { className: "task-meta" },
          n && s && React.createElement(Bs, { color: s.color }, s.name),
          r && React.createElement(Bs, { color: r.color }, r.name),
          e.due &&
            React.createElement(
              "span",
              { className: "due" + (y ? " od" : "") },
              y ? "Overdue \xB7 " : "",
              ct(e.due),
            ),
          e.priority === "high" &&
            !u &&
            React.createElement("span", { className: "prio" }, "High"),
          !u &&
            React.createElement(
              "span",
              { className: "xp-mini" },
              "+",
              bt(e),
              " XP",
            ),
        ),
      ),
      e.status === "todo" &&
        i &&
        React.createElement(
          "button",
          {
            type: "button",
            className: "mini-btn",
            onClick: () => i(e),
            title: "Move to In Progress",
          },
          "Start",
        ),
      React.createElement(Ws, { w: t, size: 26 }),
      d &&
        React.createElement(
          Pe,
          { label: "Delete task", className: "row-del", onClick: () => d(e) },
          React.createElement(mt, { size: 16 }),
        ),
    );
  }
  function Mn({
    tasks: e,
    workersById: t,
    secById: s,
    showSection: n,
    handlers: o,
    emptyText: i = "No tasks here yet.",
  }) {
    let [l, d] = ve(!1),
      p = { doing: [], todo: [], done: [] };
    e.forEach((r) => (p[r.status] || p.todo).push(r));
    let u = (r, y) =>
      Ut(y) - Ut(r) ||
      (y.priority === "high") - (r.priority === "high") ||
      String(r.due || "9").localeCompare(String(y.due || "9"));
    (p.todo.sort(u),
      p.doing.sort(u),
      p.done.sort((r, y) => (y.updatedAt || 0) - (r.updatedAt || 0)));
    let c = (r) =>
      React.createElement(En, {
        key: r.id,
        t: r,
        worker: t[r.assignee],
        section: s[r.venture],
        showSection: n,
        ...o,
      });
    return e.length
      ? React.createElement(
          "div",
          { className: "space-y-4" },
          p.doing.length > 0 &&
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { className: "group-h" },
                React.createElement("span", {
                  className: "gdot",
                  style: { background: "#1F8FA3" },
                }),
                "In progress ",
                React.createElement(
                  "span",
                  { className: "gcount" },
                  p.doing.length,
                ),
              ),
              React.createElement(
                "div",
                { className: "space-y-2" },
                p.doing.map(c),
              ),
            ),
          p.todo.length > 0 &&
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { className: "group-h" },
                React.createElement("span", {
                  className: "gdot",
                  style: { background: "#E0A526" },
                }),
                "To do ",
                React.createElement(
                  "span",
                  { className: "gcount" },
                  p.todo.length,
                ),
              ),
              React.createElement(
                "div",
                { className: "space-y-2" },
                p.todo.map(c),
              ),
            ),
          p.done.length > 0 &&
            React.createElement(
              "div",
              null,
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "group-h group-toggle",
                  onClick: () => d((r) => !r),
                },
                React.createElement("span", {
                  className: "gdot",
                  style: { background: "#5FAF5A" },
                }),
                "Done ",
                React.createElement(
                  "span",
                  { className: "gcount" },
                  p.done.length,
                ),
                React.createElement(Is, {
                  size: 16,
                  style: {
                    transform: l ? "rotate(180deg)" : "none",
                    marginLeft: 4,
                  },
                }),
              ),
              l &&
                React.createElement(
                  "div",
                  { className: "space-y-2" },
                  p.done.slice(0, 30).map(c),
                ),
            ),
        )
      : React.createElement("div", { className: "empty" }, i);
  }
  function Bn({ init: e, sections: t, workers: s, onClose: n, onSave: o, onFocus: fz }) {
    let [i, l] = ve(() => ({
        title: "",
        notes: "",
        venture: "personal",
        worktype: "admin",
        assignee: "me",
        status: "todo",
        priority: "med",
        due: "",
        ...e,
      })),
      d = (c, r) => l((y) => ({ ...y, [c]: r })),
      p = i.title.trim().length > 0,
      u = () => p && o(i);
    return React.createElement(
      cs,
      {
        title: e != null && e.id ? "Edit task" : "New task",
        color: "#D9734E",
        onClose: n,
        footer: React.createElement(
          React.Fragment,
          null,
          e != null && e.id && fz && i.status !== "done" && React.createElement(Q, { variant: "ghost", onClick: () => fz(i) }, "\u25D4 Focus 25 min"),
          React.createElement(Q, { variant: "ghost", onClick: n }, "Cancel"),
          React.createElement(
            Q,
            { variant: "primary", disabled: !p, onClick: u },
            e != null && e.id ? "Save task" : "Add task",
          ),
        ),
      },
      React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-3" },
        React.createElement(
          Y,
          { label: "Task", className: "col-span-2" },
          React.createElement("input", {
            id: "task-title",
            autoFocus: !0,
            className: "inp",
            value: i.title,
            placeholder: "What needs doing?",
            onChange: (c) => d("title", c.target.value),
            onKeyDown: (c) => {
              c.key === "Enter" && u();
            },
          }),
        ),
        React.createElement(
          Y,
          { label: "Section" },
          React.createElement(
            "select",
            {
              id: "task-sec",
              className: "inp",
              value: i.venture,
              onChange: (c) => d("venture", c.target.value),
            },
            t.map((c) =>
              React.createElement("option", { key: c.id, value: c.id }, c.name),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Work type" },
          React.createElement(
            "select",
            {
              id: "task-wt",
              className: "inp",
              value: i.worktype,
              onChange: (c) => d("worktype", c.target.value),
            },
            Qt.map((c) =>
              React.createElement("option", { key: c.id, value: c.id }, c.name),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Assigned to" },
          React.createElement(
            "select",
            {
              id: "task-as",
              className: "inp",
              value: i.assignee,
              onChange: (c) => d("assignee", c.target.value),
            },
            s.map((c) =>
              React.createElement(
                "option",
                { key: c.id, value: c.id },
                c.name,
                c.kind === "role" ? " (crew)" : "",
              ),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Status" },
          React.createElement(
            "select",
            {
              id: "task-st",
              className: "inp",
              value: i.status,
              onChange: (c) => d("status", c.target.value),
            },
            fs.map((c) =>
              React.createElement("option", { key: c.id, value: c.id }, c.name),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Priority" },
          React.createElement(
            "select",
            {
              id: "task-pr",
              className: "inp",
              value: i.priority,
              onChange: (c) => d("priority", c.target.value),
            },
            xs.map((c) =>
              React.createElement(
                "option",
                { key: c.id, value: c.id },
                c.name,
                " \xB7 +",
                { low: 10, med: 20, high: 35 }[c.id],
                " XP",
              ),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Due date" },
          React.createElement("input", {
            id: "task-due",
            type: "date",
            className: "inp",
            value: i.due,
            onChange: (c) => d("due", c.target.value),
          }),
        ),
        React.createElement(
          Y,
          { label: "Repeat" },
          React.createElement("select", { className: "inp", value: i.repeat || "", onChange: (c) => d("repeat", c.target.value) },
            React.createElement("option", { value: "" }, "Doesn't repeat"),
            React.createElement("option", { value: "daily" }, "Every day"),
            React.createElement("option", { value: "weekdays" }, "Weekdays (Mon\u2013Fri)"),
            React.createElement("option", { value: "weekly" }, "Every week on " + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i.repeatDay != null ? i.repeatDay : new Date().getDay()])),
        ),
        React.createElement(
          Y,
          { label: "Notes", className: "col-span-2" },
          React.createElement("textarea", {
            id: "task-notes",
            rows: "3",
            className: "inp",
            value: i.notes,
            placeholder: "Optional detail",
            onChange: (c) => d("notes", c.target.value),
          }),
        ),
      ),
    );
  }
  function $n({
    section: e,
    info: t,
    tasks: s,
    crew: n,
    workersById: o,
    secById: i,
    handlers: l,
    onAdd: d,
    onClose: p,
    onDemolish: u,
    extra: ex,
  }) {
    let c = s.filter((r) => r.status !== "done").length;
    return React.createElement(
      zt,
      {
        title: e.name,
        sub: e.sub,
        color: e.color,
        icon: React.createElement("span", { className: "lv-badge" }, t.level),
        onClose: p,
      },
      e.building && React.createElement("div", { className: "site-banner" },
        React.createElement("b", null, "Under construction"),
        React.createElement("span", null, s.length ? "Finish any task below to cut the ribbon and open " + e.name + "." : "Add its first task, then finish it to cut the ribbon and open " + e.name + ".")),
      ex,
      React.createElement(
        "div",
        { className: "sec-stats" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between text-[13px] mb-1.5" },
          React.createElement(
            "span",
            { className: "font-semibold", style: { color: "var(--ink2)" } },
            "Level ",
            t.level,
            " \xB7 ",
            t.tier === 3
              ? "Full facility"
              : t.tier === 2
                ? "Upgraded"
                : "Starter",
          ),
          React.createElement(
            "span",
            { className: "tnum", style: { color: "var(--ink3)" } },
            t.into,
            " / ",
            t.need,
            " XP",
          ),
        ),
        React.createElement(rs, { info: t, color: e.color, height: 10 }),
        React.createElement(
          "div",
          { className: "flex items-center justify-between mt-3" },
          React.createElement(
            "div",
            { className: "flex items-center gap-1.5" },
            n.length
              ? n.map((r) =>
                  React.createElement(Ws, { key: r.id, w: r, size: 28 }),
                )
              : React.createElement(
                  "span",
                  { className: "text-[13px]", style: { color: "var(--ink3)" } },
                  "No one posted here right now",
                ),
          ),
          React.createElement(
            Q,
            { variant: "primary", onClick: d },
            React.createElement(At, { size: 16 }),
            "Task",
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "mt-4" },
        React.createElement(Mn, {
          tasks: s,
          workersById: o,
          secById: i,
          handlers: l,
          emptyText:
            "Nothing on the go here. Add a task to get this building busy.",
        }),
      ),
      u &&
        React.createElement(
          "div",
          {
            className: "mt-6 pt-4 border-t",
            style: { borderColor: "var(--line)" },
          },
          React.createElement(
            Q,
            { variant: "danger", onClick: u },
            React.createElement(mt, { size: 16 }),
            "Remove this section",
          ),
        ),
      React.createElement(
        "p",
        { className: "hint-note" },
        c,
        " open \xB7 finishing tasks earns XP and upgrades this building at levels 3 and 5.",
      ),
    );
  }
  function Ro({ l: e, secById: t, onMove: s, onEdit: n, onDelete: o }) {
    let i = kt[e.type] || Vt[0],
      l = t[e.venture],
      d = xt(e.deadline),
      p = vt.findIndex((c) => c.id === e.stage),
      u = ["new", "qualifying"].includes(e.stage) ? vt[p + 1] : null;
    return React.createElement(
      "div",
      { className: "lead-card" },
      React.createElement("div", {
        className: "lead-stripe",
        style: { background: i.color },
      }),
      React.createElement(
        "div",
        { className: "flex items-start gap-2" },
        React.createElement(
          "button",
          { type: "button", className: "task-main", onClick: () => n(e) },
          React.createElement("span", { className: "task-title" }, e.title),
          React.createElement(
            "span",
            { className: "task-meta" },
            React.createElement(Bs, { color: i.color }, i.short),
            e.client &&
              React.createElement("span", { className: "meta-txt" }, e.client),
            l &&
              React.createElement(
                "span",
                { className: "meta-txt" },
                "\u2192 ",
                l.name,
              ),
          ),
        ),
        React.createElement(
          "div",
          { className: "text-right shrink-0" },
          React.createElement(
            "div",
            { className: "lead-value" },
            e.value
              ? Le(e.value)
              : React.createElement(
                  "span",
                  { style: { color: "var(--ink3)", fontWeight: 600 } },
                  "Value?",
                ),
          ),
          e.deadline &&
            React.createElement(
              "div",
              {
                className:
                  "due" +
                  (d != null && d < 3 && !["won", "lost"].includes(e.stage)
                    ? " od"
                    : ""),
              },
              d < 0 ? "Closed " : "Closes ",
              ct(e.deadline),
            ),
        ),
      ),
      React.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-1.5 mt-2.5" },
        u &&
          React.createElement(
            Q,
            { className: "sm", onClick: () => s(e, u.id) },
            u.name,
            React.createElement(Io, { size: 14 }),
          ),
        !["won", "lost"].includes(e.stage) &&
          React.createElement(
            Q,
            { variant: "gold", className: "sm", onClick: () => s(e, "won") },
            React.createElement(An, { size: 14 }),
            "Won",
          ),
        !["won", "lost"].includes(e.stage) &&
          React.createElement(
            Q,
            { variant: "ghost", className: "sm", onClick: () => s(e, "lost") },
            "Lost",
          ),
        ["won", "lost"].includes(e.stage) &&
          React.createElement(
            Q,
            {
              variant: "ghost",
              className: "sm",
              onClick: () => s(e, "quoted"),
            },
            React.createElement(Wo, { size: 14 }),
            "Reopen",
          ),
        React.createElement(
          Pe,
          {
            label: "Delete lead",
            className: "ml-auto row-del",
            onClick: () => o(e),
          },
          React.createElement(mt, { size: 16 }),
        ),
      ),
    );
  }
  function zn({
    leads: e,
    secById: t,
    onClose: s,
    onNew: n,
    onMove: o,
    onEdit: i,
    onDelete: l,
    monthWon: d,
    title: zTitle = "Port & Logistics Hub",
    sub: zSub = "Leads arrive by ship and get worked in the hub",
    color: zColor = "#1F7A8C",
    initialTab: zTab = "new",
  }) {
    let [p, u] = ve(zTab),
      c = Object.fromEntries(
        vt.map((f) => [f.id, e.filter((w) => w.stage === f.id).length]),
      ),
      r = e
        .filter((f) => f.stage === p)
        .sort((f, w) =>
          String(f.deadline || "9").localeCompare(String(w.deadline || "9")),
        ),
      y = e
        .filter((f) => ["new", "qualifying", "quoted"].includes(f.stage))
        .reduce((f, w) => f + (Number(w.value) || 0), 0),
      k = c.won + c.lost;
    return React.createElement(
      zt,
      {
        title: zTitle,
        sub: zSub,
        color: zColor,
        icon: React.createElement(ls, { size: 18 }),
        onClose: s,
      },
      React.createElement(
        "div",
        { className: "grid grid-cols-3 gap-2" },
        React.createElement(
          "div",
          { className: "stat" },
          React.createElement("div", { className: "stat-v" }, Le(y, !0)),
          React.createElement(
            "div",
            { className: "stat-l" },
            "In the pipeline",
          ),
        ),
        React.createElement(
          "div",
          { className: "stat" },
          React.createElement(
            "div",
            { className: "stat-v", style: { color: "#B98A22" } },
            Le(d, !0),
          ),
          React.createElement("div", { className: "stat-l" }, "Won this month"),
        ),
        React.createElement(
          "div",
          { className: "stat" },
          React.createElement(
            "div",
            { className: "stat-v" },
            k ? Math.round((c.won / k) * 100) + "%" : "\u2014",
          ),
          React.createElement("div", { className: "stat-l" }, "Win rate"),
        ),
      ),
      React.createElement(
        "div",
        { className: "stage-tabs", role: "tablist" },
        vt.map((f) =>
          React.createElement(
            "button",
            {
              key: f.id,
              type: "button",
              role: "tab",
              "aria-selected": p === f.id,
              className: "stage-tab" + (p === f.id ? " on" : ""),
              onClick: () => u(f.id),
            },
            f.name,
            React.createElement("span", { className: "stage-n" }, c[f.id]),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "flex items-center justify-between mb-2" },
        React.createElement(
          "span",
          { className: "text-[13px]", style: { color: "var(--ink3)" } },
          vt.find((f) => f.id === p).hint,
        ),
        React.createElement(
          Q,
          { variant: "teal", className: "sm", onClick: n },
          React.createElement(Po, { size: 15 }),
          "Dock a lead",
        ),
      ),
      React.createElement(
        "div",
        { className: "space-y-2" },
        r.length
          ? r.map((f) =>
              React.createElement(Ro, {
                key: f.id,
                l: f,
                secById: t,
                onMove: o,
                onEdit: i,
                onDelete: l,
              }),
            )
          : React.createElement(
              "div",
              { className: "empty" },
              p === "new"
                ? "The harbour is quiet. Dock a new lead when one comes in."
                : "Nothing at this stage.",
            ),
      ),
      React.createElement(
        "p",
        { className: "hint-note" },
        "Winning a lead pays its value into the treasury and puts a kick-off task in its section.",
      ),
    );
  }
  function Ln({ init: e, sections: t, onClose: s, onSave: n }) {
    let [o, i] = ve(() => ({
        title: "",
        client: "",
        type: "tender",
        venture: "epcm",
        value: "",
        deadline: "",
        stage: "new",
        notes: "",
        ...e,
      })),
      l = (u, c) => i((r) => ({ ...r, [u]: c })),
      d = (u) =>
        i((c) => {
          var r;
          return {
            ...c,
            type: u,
            venture: c.id
              ? c.venture
              : ((r = kt[u]) == null ? void 0 : r.venture) || c.venture,
          };
        }),
      p = o.title.trim().length > 0;
    return React.createElement(
      cs,
      {
        title: e != null && e.id ? "Edit lead" : "Dock a new lead",
        color: "#1F7A8C",
        onClose: s,
        footer: React.createElement(
          React.Fragment,
          null,
          React.createElement(Q, { variant: "ghost", onClick: s }, "Cancel"),
          React.createElement(
            Q,
            {
              variant: "teal",
              disabled: !p,
              onClick: () =>
                p &&
                n({
                  ...o,
                  value: Number(String(o.value).replace(/[^\d.]/g, "")) || 0,
                }),
            },
            e != null && e.id ? "Save lead" : "Dock it",
          ),
        ),
      },
      React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-3" },
        React.createElement(
          Y,
          { label: "Lead", className: "col-span-2" },
          React.createElement("input", {
            id: "lead-title",
            autoFocus: !0,
            className: "inp",
            value: o.title,
            placeholder: "e.g. Tank farm RFQ, 20-unit dock order",
            onChange: (u) => l("title", u.target.value),
          }),
        ),
        React.createElement(
          Y,
          { label: "Type", className: "col-span-2" },
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-2" },
            Vt.map((u) =>
              React.createElement(
                "button",
                {
                  key: u.id,
                  type: "button",
                  onClick: () => d(u.id),
                  className: "pick" + (o.type === u.id ? " on" : ""),
                  style:
                    o.type === u.id
                      ? { borderColor: u.color, background: pt(u.color, 0.1) }
                      : null,
                },
                React.createElement("span", {
                  className: "chip-dot",
                  style: { background: u.color },
                }),
                u.name,
              ),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Client" },
          React.createElement("input", {
            id: "lead-client",
            className: "inp",
            value: o.client,
            placeholder: "Who is it for?",
            onChange: (u) => l("client", u.target.value),
          }),
        ),
        React.createElement(
          Y,
          { label: "Goes to section" },
          React.createElement(
            "select",
            {
              id: "lead-sec",
              className: "inp",
              value: o.venture,
              onChange: (u) => l("venture", u.target.value),
            },
            t.map((u) =>
              React.createElement("option", { key: u.id, value: u.id }, u.name),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Value (R)" },
          React.createElement("input", {
            id: "lead-value",
            className: "inp tnum",
            inputMode: "numeric",
            value: o.value,
            placeholder: "0",
            onChange: (u) => l("value", u.target.value),
          }),
        ),
        React.createElement(
          Y,
          { label: "Closing date" },
          React.createElement("input", {
            id: "lead-deadline",
            type: "date",
            className: "inp",
            value: o.deadline,
            onChange: (u) => l("deadline", u.target.value),
          }),
        ),
        React.createElement(
          Y,
          { label: "Stage" },
          React.createElement(
            "select",
            {
              id: "lead-stage",
              className: "inp",
              value: o.stage,
              onChange: (u) => l("stage", u.target.value),
            },
            vt.map((u) =>
              React.createElement("option", { key: u.id, value: u.id }, u.name),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Notes", className: "col-span-2" },
          React.createElement("textarea", {
            id: "lead-notes",
            rows: "2",
            className: "inp",
            value: o.notes,
            onChange: (u) => l("notes", u.target.value),
          }),
        ),
      ),
    );
  }
  function qo({ entries: e, target: t }) {
    let s = [...e].sort((N, P) => N.d.localeCompare(P.d)).slice(-60);
    if (s.length === 0)
      return React.createElement(
        "div",
        { className: "chart-empty" },
        "Log your first weigh-in to start the trend line.",
      );
    let n = 360,
      o = 150,
      i = 34,
      l = 12,
      d = 14,
      p = 22,
      u = s.map((N) => N.kg).concat(t ? [t] : []),
      c = Math.floor(Math.min(...u) - 1),
      r = Math.ceil(Math.max(...u) + 1);
    r - c < 4 && ((r += 2), (c -= 2));
    let y = new Date(s[0].d).getTime(),
      k = new Date(s[s.length - 1].d).getTime(),
      f = (N) =>
        s.length === 1
          ? (i + n - l) / 2
          : i +
            ((new Date(N).getTime() - y) / Math.max(1, k - y)) * (n - i - l),
      w = (N) => d + ((r - N) / (r - c)) * (o - d - p),
      v = s
        .map(
          (N, P) =>
            `${P ? "L" : "M"}${f(N.d).toFixed(1)},${w(N.kg).toFixed(1)}`,
        )
        .join(" "),
      $ =
        v +
        ` L${f(s[s.length - 1].d).toFixed(1)},${o - p} L${f(s[0].d).toFixed(1)},${o - p} Z`,
      E = [c, Math.round((c + r) / 2), r],
      M = s[s.length - 1];
    return React.createElement(
      "svg",
      {
        viewBox: `0 0 ${n} ${o}`,
        className: "w-full h-auto chart",
        role: "img",
        "aria-label": "Weight trend",
      },
      React.createElement(
        "defs",
        null,
        React.createElement(
          "linearGradient",
          { id: "wfill", x1: "0", x2: "0", y1: "0", y2: "1" },
          React.createElement("stop", {
            offset: "0",
            stopColor: "#F08A4B",
            stopOpacity: "0.32",
          }),
          React.createElement("stop", {
            offset: "1",
            stopColor: "#F08A4B",
            stopOpacity: "0",
          }),
        ),
      ),
      E.map((N) =>
        React.createElement(
          "g",
          { key: N },
          React.createElement("line", {
            x1: i,
            x2: n - l,
            y1: w(N),
            y2: w(N),
            stroke: "#EADBC2",
            strokeWidth: "1",
          }),
          React.createElement(
            "text",
            { x: i - 6, y: w(N) + 4, textAnchor: "end", className: "chart-t" },
            N,
          ),
        ),
      ),
      t
        ? React.createElement(
            "g",
            null,
            React.createElement("line", {
              x1: i,
              x2: n - l,
              y1: w(t),
              y2: w(t),
              stroke: "#2A9D8F",
              strokeWidth: "1.5",
              strokeDasharray: "5 4",
            }),
            React.createElement(
              "text",
              {
                x: n - l,
                y: w(t) - 5,
                textAnchor: "end",
                className: "chart-t",
                fill: "#1D7064",
              },
              "target ",
              t,
              " kg",
            ),
          )
        : null,
      React.createElement("path", { d: $, fill: "url(#wfill)" }),
      React.createElement("path", {
        d: v,
        fill: "none",
        stroke: "#E07B39",
        strokeWidth: "2.4",
        strokeLinejoin: "round",
        strokeLinecap: "round",
      }),
      s.map((N) =>
        React.createElement("circle", {
          key: N.d,
          cx: f(N.d),
          cy: w(N.kg),
          r: "2.4",
          fill: "#FFF8EC",
          stroke: "#E07B39",
          strokeWidth: "1.4",
        }),
      ),
      React.createElement("circle", {
        cx: f(M.d),
        cy: w(M.kg),
        r: "5",
        fill: "#E07B39",
        stroke: "#FFF8EC",
        strokeWidth: "2",
      }),
      React.createElement(
        "text",
        { x: i, y: o - 5, className: "chart-t" },
        ct(s[0].d),
      ),
      React.createElement(
        "text",
        { x: n - l, y: o - 5, textAnchor: "end", className: "chart-t" },
        ct(M.d),
      ),
    );
  }
  function Sn({
    initialTab: e,
    info: t,
    profile: s,
    weights: n,
    workouts: o,
    habits: i,
    onClose: l,
    onLogWeight: d,
    onDelWeight: p,
    onSetProfile: u,
    onLogWorkout: c,
    onDelWorkout: r,
    onToggleHabit: y,
    onHabitsChange: hc,
  }) {
    let [k, f] = ve(e || "weight"),
      [w, v] = ve(""),
      [$, E] = ve(Be()),
      [M, N] = ve(s.targetKg || ""),
      [P, he] = ve({ type: "Gym", mins: 45, d: Be() });
    fn(() => {
      N(s.targetKg || "");
    }, [s.targetKg]);
    let R = [...(n || [])].sort((C, G) => C.d.localeCompare(G.d)),
      K = R[0],
      de = R[R.length - 1],
      we = s.weeklyTarget || 4,
      ee = Be(),
      ce = (new Date(ee + "T12:00:00").getDay() + 6) % 7,
      $e = ft(ee, -ce),
      z = Array.from({ length: 7 }).map((C, G) => ft($e, G)),
      ne = (o || []).filter((C) => C.d >= $e && C.d <= ft($e, 6)),
      fe = (i || {})[ee] || {},
      xe = Array.from({ length: 7 }).map((C, G) => ft(ee, G - 6));
    return React.createElement(
      zt,
      {
        title: "Fitness",
        sub: "Beach gym & running track",
        color: "#F08A4B",
        icon: React.createElement("span", { className: "lv-badge" }, t.level),
        onClose: l,
      },
      React.createElement(
        "div",
        { className: "flex items-center justify-between text-[13px] mb-1.5" },
        React.createElement(
          "span",
          { className: "font-semibold", style: { color: "var(--ink2)" } },
          "Gym level ",
          t.level,
        ),
        React.createElement(
          "span",
          { className: "tnum", style: { color: "var(--ink3)" } },
          t.into,
          " / ",
          t.need,
          " XP",
        ),
      ),
      React.createElement(rs, { info: t, color: "#F08A4B", height: 10 }),
      React.createElement(
        "div",
        { className: "seg mt-4", role: "tablist" },
        [
          ["weight", "Weight"],
          ["workouts", "Workouts"],
          ["habits", "Habits"],
        ].map(([C, G]) =>
          React.createElement(
            "button",
            {
              key: C,
              type: "button",
              role: "tab",
              "aria-selected": k === C,
              className: "seg-b" + (k === C ? " on" : ""),
              onClick: () => f(C),
            },
            G,
          ),
        ),
      ),
      k === "weight" &&
        React.createElement(
          "div",
          { className: "mt-3 space-y-3" },
          React.createElement(
            "div",
            { className: "grid grid-cols-3 gap-2" },
            React.createElement(
              "div",
              { className: "stat" },
              React.createElement(
                "div",
                { className: "stat-v" },
                de ? de.kg + " kg" : "\u2014",
              ),
              React.createElement("div", { className: "stat-l" }, "Current"),
            ),
            React.createElement(
              "div",
              { className: "stat" },
              React.createElement(
                "div",
                { className: "stat-v", style: { color: "#1D7064" } },
                s.targetKg ? s.targetKg + " kg" : "\u2014",
              ),
              React.createElement("div", { className: "stat-l" }, "Target"),
            ),
            React.createElement(
              "div",
              { className: "stat" },
              React.createElement(
                "div",
                { className: "stat-v" },
                de && s.targetKg
                  ? Math.round((de.kg - s.targetKg) * 10) / 10 + " kg"
                  : K && de && R.length > 1
                    ? Math.round((de.kg - K.kg) * 10) / 10 + " kg"
                    : "\u2014",
              ),
              React.createElement(
                "div",
                { className: "stat-l" },
                s.targetKg ? "To go" : "Change",
              ),
            ),
          ),
          React.createElement(
            "div",
            { className: "chart-card" },
            React.createElement(qo, {
              entries: R,
              target: Number(s.targetKg) || null,
            }),
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-[1fr_1fr_auto] gap-2 items-end" },
            React.createElement(
              Y,
              { label: "Weight (kg)" },
              React.createElement("input", {
                id: "fit-kg",
                className: "inp tnum",
                inputMode: "decimal",
                value: w,
                placeholder: "e.g. 88.4",
                onChange: (C) => v(C.target.value),
              }),
            ),
            React.createElement(
              Y,
              { label: "Date" },
              React.createElement("input", {
                id: "fit-kg-d",
                type: "date",
                className: "inp",
                value: $,
                onChange: (C) => E(C.target.value),
              }),
            ),
            React.createElement(
              Q,
              {
                variant: "primary",
                disabled: !(Number(w) > 0),
                onClick: () => {
                  (d(Math.round(Number(w) * 10) / 10, $), v(""));
                },
              },
              "Log",
            ),
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-[1fr_auto] gap-2 items-end" },
            React.createElement(
              Y,
              { label: "Target weight (kg)" },
              React.createElement("input", {
                id: "fit-target",
                className: "inp tnum",
                inputMode: "decimal",
                value: M,
                onChange: (C) => N(C.target.value),
              }),
            ),
            React.createElement(
              Q,
              {
                disabled: !(Number(M) > 0) || Number(M) === Number(s.targetKg),
                onClick: () => u({ targetKg: Math.round(Number(M) * 10) / 10 }),
              },
              "Set target",
            ),
          ),
          R.length > 0 &&
            React.createElement(
              "div",
              { className: "mini-list" },
              [...R]
                .reverse()
                .slice(0, 6)
                .map((C) =>
                  React.createElement(
                    "div",
                    { key: C.d, className: "mini-row" },
                    React.createElement("span", null, ct(C.d)),
                    React.createElement(
                      "span",
                      { className: "tnum font-semibold" },
                      C.kg,
                      " kg",
                    ),
                    React.createElement(
                      Pe,
                      {
                        label: "Delete weigh-in",
                        className: "row-del",
                        onClick: () => p(C.d),
                      },
                      React.createElement(mt, { size: 15 }),
                    ),
                  ),
                ),
            ),
        ),
      k === "workouts" &&
        React.createElement(
          "div",
          { className: "mt-3 space-y-3" },
          React.createElement(
            "div",
            { className: "week-card" },
            React.createElement(
              "div",
              { className: "flex items-center justify-between mb-2" },
              React.createElement(
                "span",
                { className: "font-semibold text-[14px]" },
                "This week",
              ),
              React.createElement(
                "span",
                { className: "tnum text-[14px]" },
                React.createElement("b", null, ne.length),
                " / ",
                we,
                " sessions",
              ),
            ),
            React.createElement(
              "div",
              { className: "grid grid-cols-7 gap-1.5" },
              z.map((C) => {
                let G = ne.filter((Ce) => Ce.d === C).length;
                return React.createElement(
                  "div",
                  {
                    key: C,
                    className:
                      "week-day" +
                      (G ? " on" : "") +
                      (C === ee ? " today" : ""),
                  },
                  React.createElement(
                    "span",
                    null,
                    ["M", "T", "W", "T", "F", "S", "S"][z.indexOf(C)],
                  ),
                  G > 0 && React.createElement("b", null, G),
                );
              }),
            ),
            React.createElement(
              "div",
              { className: "xpbar mt-3", style: { height: 8 } },
              React.createElement("div", {
                className: "xpbar-fill",
                style: {
                  width: Math.min(100, (ne.length / we) * 100) + "%",
                  background: "linear-gradient(90deg,#F6A36E,#F08A4B)",
                },
              }),
            ),
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-3 gap-2 items-end" },
            React.createElement(
              Y,
              { label: "Type" },
              React.createElement(
                "select",
                {
                  id: "wo-type",
                  className: "inp",
                  value: P.type,
                  onChange: (C) => he({ ...P, type: C.target.value }),
                },
                tn.map((C) => React.createElement("option", { key: C }, C)),
              ),
            ),
            React.createElement(
              Y,
              { label: "Minutes" },
              React.createElement("input", {
                id: "wo-mins",
                className: "inp tnum",
                inputMode: "numeric",
                value: P.mins,
                onChange: (C) => he({ ...P, mins: C.target.value }),
              }),
            ),
            React.createElement(
              Y,
              { label: "Date" },
              React.createElement("input", {
                id: "wo-date",
                type: "date",
                className: "inp",
                value: P.d,
                onChange: (C) => he({ ...P, d: C.target.value }),
              }),
            ),
          ),
          React.createElement(
            "div",
            { className: "flex items-center justify-between gap-2" },
            React.createElement(
              "label",
              {
                className: "text-[13px] flex items-center gap-2",
                style: { color: "var(--ink2)" },
              },
              "Weekly target",
              React.createElement(
                "select",
                {
                  id: "wo-target",
                  className: "inp",
                  style: { width: 70, padding: "6px 8px" },
                  value: we,
                  onChange: (C) => u({ weeklyTarget: Number(C.target.value) }),
                },
                [1, 2, 3, 4, 5, 6, 7].map((C) =>
                  React.createElement("option", { key: C }, C),
                ),
              ),
            ),
            React.createElement(
              Q,
              {
                variant: "primary",
                onClick: () =>
                  c({ type: P.type, mins: Number(P.mins) || 0, d: P.d }),
              },
              React.createElement(At, { size: 16 }),
              "Log session \xB7 +15 XP",
            ),
          ),
          (o || []).length > 0
            ? React.createElement(
                "div",
                { className: "mini-list" },
                [...o]
                  .sort((C, G) => G.d.localeCompare(C.d))
                  .slice(0, 8)
                  .map((C) =>
                    React.createElement(
                      "div",
                      { key: C.id, className: "mini-row" },
                      React.createElement("span", null, ct(C.d)),
                      React.createElement(
                        "span",
                        { className: "font-semibold" },
                        C.type,
                      ),
                      React.createElement(
                        "span",
                        { className: "tnum", style: { color: "var(--ink3)" } },
                        C.mins,
                        " min",
                      ),
                      React.createElement(
                        Pe,
                        {
                          label: "Delete session",
                          className: "row-del",
                          onClick: () => r(C.id),
                        },
                        React.createElement(mt, { size: 15 }),
                      ),
                    ),
                  ),
              )
            : React.createElement(
                "div",
                { className: "empty" },
                "No sessions logged yet.",
              ),
        ),
      k === "habits" &&
        React.createElement(
          "div",
          { className: "mt-3 space-y-3" },
          React.createElement(
            "div",
            { className: "grid grid-cols-3 gap-2" },
            wt.map((C) => {
              let G = !!fe[C.id];
              return React.createElement(
                "button",
                {
                  key: C.id,
                  type: "button",
                  className: "habit" + (G ? " on" : ""),
                  onClick: () => y(C.id, ee, !G),
                  "aria-pressed": G,
                },
                React.createElement(
                  "span",
                  { className: "habit-check" },
                  G && React.createElement(jt, { size: 16 }),
                ),
                React.createElement("span", { className: "habit-n" }, C.name),
                React.createElement("span", { className: "habit-d" }, C.detail),
              );
            }),
          ),
          React.createElement(
            "div",
            { className: "week-card" },
            React.createElement(
              "div",
              { className: "font-semibold text-[14px] mb-2" },
              "Last 7 days",
            ),
            React.createElement(
              "div",
              { className: "habit-grid" },
              React.createElement("span", null),
              xe.map((C) =>
                React.createElement(
                  "span",
                  { key: C, className: "hg-h" },
                  ct(C).split(" ")[0],
                ),
              ),
              wt.map((C) =>
                React.createElement(
                  React.Fragment,
                  { key: C.id },
                  React.createElement("span", { className: "hg-l" }, C.name),
                  xe.map((G) => {
                    var Ce;
                    return React.createElement("span", {
                      key: G,
                      className:
                        "hg-c" +
                        ((Ce = (i || {})[G]) != null && Ce[C.id] ? " on" : ""),
                    });
                  }),
                ),
              ),
            ),
          ),
          React.createElement(
            "p",
            { className: "hint-note" },
            "Ticking every habit completes a daily quest and keeps your streak alive.",
          ),
          hc && React.createElement(HabitEditor, { onChange: hc })
        ),
    );
  }
  function Tn({
    info: e,
    treasury: t,
    month: s,
    wonThisMonth: n,
    incomeThisMonth: o,
    goals: i,
    tasks: l,
    workersById: d,
    secById: p,
    handlers: u,
    onClose: c,
    onAddIncome: r,
    onDelIncome: y,
    onSetTarget: k,
    onAddGoal: f,
    onGoal: w,
    onDelGoal: v,
    onAddTask: $,
    fields: fieldsList,
  }) {
    let E = t.target || 2e5,
      M =
        n.reduce((z, ne) => z + (Number(ne.value) || 0), 0) +
        o.reduce((z, ne) => z + (Number(ne.amount) || 0), 0),
      N = Math.min(1, M / E),
      [P, he] = ve(""),
      [R, K] = ve(""),
      [de, we] = ve(String(E)),
      [ee, ce] = ve(""),
      $e = new Date(s + "-15T12:00:00").toLocaleDateString("en-ZA", {
        month: "long",
        year: "numeric",
      });
    return React.createElement(
      zt,
      {
        title: "Goals & Treasury",
        sub: "The lighthouse glows brighter as the month's income grows",
        color: "#E9B949",
        icon: React.createElement($s, { size: 18 }),
        onClose: c,
      },
      React.createElement(
        "div",
        { className: "treasury" },
        React.createElement(
          "div",
          {
            className: "text-[12px] font-bold uppercase tracking-wider",
            style: { color: "#8A6A1E" },
          },
          $e,
        ),
        React.createElement(
          "div",
          { className: "flex items-end justify-between gap-2 mt-1" },
          React.createElement("div", { className: "treasury-v tnum" }, Le(M)),
          React.createElement(
            "div",
            { className: "text-[13px] tnum pb-1", style: { color: "#8A6A1E" } },
            "of ",
            Le(E),
            " / month",
          ),
        ),
        React.createElement(
          "div",
          {
            className: "xpbar mt-2",
            style: { height: 12, background: "rgba(185,138,34,0.18)" },
          },
          React.createElement("div", {
            className: "xpbar-fill",
            style: {
              width: Math.max(2, N * 100) + "%",
              background: "linear-gradient(90deg,#F2C14E,#E9A727)",
            },
          }),
        ),
        React.createElement(
          "div",
          { className: "text-[12.5px] mt-1.5", style: { color: "#8A6A1E" } },
          "Lamp at ",
          Math.round(N * 100),
          "% \xB7 ",
          N >= 1 ? "target reached this month" : `${Le(E - M)} to go`,
        ),
      ),
      React.createElement(
        "div",
        { className: "mt-3 grid grid-cols-[1fr_1.3fr_auto] gap-2 items-end" },
        React.createElement(
          Y,
          { label: "Income (R)" },
          React.createElement("input", {
            id: "inc-amt",
            className: "inp tnum",
            inputMode: "numeric",
            value: P,
            placeholder: "0",
            onChange: (z) => he(z.target.value),
          }),
        ),
        React.createElement(
          Y,
          { label: "From" },
          React.createElement("input", {
            id: "inc-note",
            className: "inp",
            value: R,
            placeholder: "e.g. kiosk sales",
            onChange: (z) => K(z.target.value),
          }),
        ),
        React.createElement(
          Q,
          {
            variant: "gold",
            disabled: !(Number(P) > 0),
            onClick: () => {
              (r(Number(P), R), he(""), K(""));
            },
          },
          "Add",
        ),
      ),
      (n.length > 0 || o.length > 0) &&
        React.createElement(
          "div",
          { className: "mini-list mt-3" },
          n.map((z) =>
            React.createElement(
              "div",
              { key: z.id, className: "mini-row" },
              React.createElement(
                "span",
                { className: "truncate" },
                "Won: ",
                z.title,
              ),
              React.createElement(
                "span",
                {
                  className: "tnum font-semibold",
                  style: { color: "#8A6A1E" },
                },
                Le(z.value),
              ),
            ),
          ),
          o.map((z) =>
            React.createElement(
              "div",
              { key: z.id, className: "mini-row" },
              React.createElement(
                "span",
                { className: "truncate" },
                z.note || "Income",
                " \xB7 ",
                ct(z.d),
              ),
              React.createElement(
                "span",
                {
                  className: "tnum font-semibold",
                  style: { color: "#8A6A1E" },
                },
                Le(z.amount),
              ),
              React.createElement(
                Pe,
                {
                  label: "Delete entry",
                  className: "row-del",
                  onClick: () => y(z.id),
                },
                React.createElement(mt, { size: 15 }),
              ),
            ),
          ),
        ),
      React.createElement(
        "div",
        { className: "mt-3 grid grid-cols-[1fr_auto] gap-2 items-end" },
        React.createElement(
          Y,
          { label: "Monthly target (R)" },
          React.createElement("input", {
            id: "inc-target",
            className: "inp tnum",
            inputMode: "numeric",
            value: de,
            onChange: (z) => we(z.target.value),
          }),
        ),
        React.createElement(
          Q,
          {
            disabled: !(Number(de) > 0) || Number(de) === E,
            onClick: () => k(Number(de)),
          },
          "Update",
        ),
      ),
      React.createElement(Inside.GoalTree, {
        goals: i,
        fields: fieldsList || [],
        onAdd: f,
        onGoal: w,
        onDel: v,
      }),
      React.createElement(
        "div",
        { className: "section-h mt-6" },
        React.createElement(Ts, { size: 16 }),
        "Goal tasks ",
        React.createElement(
          "span",
          { className: "ml-auto" },
          React.createElement(
            Q,
            { className: "sm", onClick: $ },
            React.createElement(At, { size: 14 }),
            "Task",
          ),
        ),
      ),
      React.createElement(Mn, {
        tasks: l,
        workersById: d,
        secById: p,
        handlers: u,
        emptyText: "No goal tasks yet.",
      }),
      React.createElement(
        "p",
        { className: "hint-note" },
        "Lamp level ",
        e.level,
        ": the lighthouse upgrades at 33% and 66% of the monthly target.",
      ),
    );
  }
  function In({
    workers: e,
    tasks: t,
    secById: s,
    onClose: n,
    onSave: o,
    onDelete: i,
  }) {
    let [l, d] = ve(""),
      [p, u] = ve("role"),
      c = (r) => {
        let y = t.filter((f) => f.assignee === r && f.status !== "done"),
          k = [
            ...new Set(
              y
                .map((f) => {
                  var w;
                  return (w = s[f.venture]) == null ? void 0 : w.name;
                })
                .filter(Boolean),
            ),
          ];
        return { n: y.length, where: k };
      };
    return React.createElement(
      zt,
      {
        title: "Crew",
        sub: "Roles run the YouTube pipeline; people help across the island",
        color: "#7E6BC4",
        icon: React.createElement(zs, { size: 18 }),
        onClose: n,
      },
      React.createElement(
        "div",
        { className: "space-y-2" },
        e.map((r) => {
          let y = c(r.id);
          return React.createElement(
            "div",
            { key: r.id, className: "crew-row" },
            React.createElement(Ws, { w: r, size: 36 }),
            React.createElement(
              "div",
              { className: "min-w-0 flex-1" },
              React.createElement("input", {
                id: "crew-" + r.id,
                className: "crew-name",
                defaultValue: r.name,
                "aria-label": "Name",
                onBlur: (k) => {
                  let f = k.target.value.trim();
                  f && f !== r.name && o({ ...r, name: f });
                },
              }),
              React.createElement(
                "div",
                {
                  className: "text-[12.5px] truncate",
                  style: { color: "var(--ink3)" },
                },
                r.kind === "role" ? "Crew role" : "Person",
                " \xB7 ",
                y.n ? `${y.n} open at ${y.where.join(", ")}` : "free",
              ),
            ),
            React.createElement(
              Q,
              {
                variant: "ghost",
                className: "sm",
                onClick: () =>
                  o({ ...r, kind: r.kind === "role" ? "human" : "role" }),
              },
              r.kind === "role" ? "Make person" : "Make role",
            ),
            r.id !== "me" &&
              React.createElement(
                Pe,
                { label: "Remove", className: "row-del", onClick: () => i(r) },
                React.createElement(mt, { size: 16 }),
              ),
          );
        }),
      ),
      React.createElement(
        "div",
        { className: "mt-3 grid grid-cols-[1fr_auto_auto] gap-2" },
        React.createElement("input", {
          id: "crew-new",
          className: "inp",
          value: l,
          placeholder: "Add a role or a person",
          onChange: (r) => d(r.target.value),
        }),
        React.createElement(
          "select",
          {
            id: "crew-kind",
            className: "inp",
            style: { width: "auto" },
            value: p,
            onChange: (r) => u(r.target.value),
          },
          React.createElement("option", { value: "role" }, "Role"),
          React.createElement("option", { value: "human" }, "Person"),
        ),
        React.createElement(
          Q,
          {
            variant: "primary",
            disabled: !l.trim(),
            onClick: () => {
              (o({ name: l.trim(), kind: p }), d(""));
            },
          },
          "Add",
        ),
      ),
    );
  }
  function Wn({
    tasks: e,
    sections: t,
    workers: s,
    workersById: n,
    secById: o,
    handlers: i,
    onClose: l,
    onAdd: d,
  }) {
    let [p, u] = ve(new Set()),
      [c, r] = ve(new Set()),
      [y, k] = ve(new Set()),
      [f, w] = ve(""),
      v = (N, P) =>
        N((he) => {
          let R = new Set(he);
          return (R.has(P) ? R.delete(P) : R.add(P), R);
        }),
      $ = e.filter(
        (N) =>
          (!p.size || p.has(N.assignee)) &&
          (!c.size || c.has(N.worktype)) &&
          (!y.size || y.has(N.venture)) &&
          (!f.trim() ||
            (N.title + " " + (N.notes || ""))
              .toLowerCase()
              .includes(f.trim().toLowerCase())),
      ),
      E = fs.map((N) => ({ s: N, items: $.filter((P) => P.status === N.id) })),
      M = p.size || c.size || y.size || f.trim();
    return React.createElement(
      zt,
      {
        wide: !0,
        title: "Island board",
        sub: "Every task on the island, filterable by person, work type and section",
        color: "#D9734E",
        icon: React.createElement(is, { size: 18 }),
        onClose: l,
        headerExtra: React.createElement(
          Q,
          { variant: "primary", className: "sm mr-1", onClick: d },
          React.createElement(At, { size: 15 }),
          "Task",
        ),
      },
      React.createElement(
        "div",
        { className: "filters" },
        React.createElement(
          "div",
          { className: "search" },
          React.createElement(Oo, { size: 16 }),
          React.createElement("input", {
            id: "board-q",
            value: f,
            placeholder: "Search tasks",
            onChange: (N) => w(N.target.value),
          }),
        ),
        React.createElement(
          "div",
          { className: "frow" },
          React.createElement("span", { className: "flabel" }, "Person"),
          React.createElement(
            "div",
            { className: "fchips" },
            s.map((N) =>
              React.createElement(
                Ms,
                {
                  key: N.id,
                  active: p.has(N.id),
                  color: N.color,
                  onClick: () => v(u, N.id),
                },
                N.name,
              ),
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "frow" },
          React.createElement("span", { className: "flabel" }, "Work type"),
          React.createElement(
            "div",
            { className: "fchips" },
            Qt.map((N) =>
              React.createElement(
                Ms,
                {
                  key: N.id,
                  active: c.has(N.id),
                  color: N.color,
                  onClick: () => v(r, N.id),
                },
                N.name,
              ),
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "frow" },
          React.createElement("span", { className: "flabel" }, "Section"),
          React.createElement(
            "div",
            { className: "fchips" },
            t.map((N) =>
              React.createElement(
                Ms,
                {
                  key: N.id,
                  active: y.has(N.id),
                  color: N.color,
                  onClick: () => v(k, N.id),
                },
                N.name,
              ),
            ),
          ),
        ),
        M
          ? React.createElement(
              "button",
              {
                type: "button",
                className: "clear-f",
                onClick: () => {
                  (u(new Set()), r(new Set()), k(new Set()), w(""));
                },
              },
              "Clear filters \xB7 ",
              $.length,
              " shown",
            )
          : null,
      ),
      React.createElement(
        "div",
        { className: "board-cols" },
        E.map(({ s: N, items: P }) =>
          React.createElement(
            "div",
            { key: N.id, className: "board-col" },
            React.createElement(
              "div",
              { className: "group-h" },
              React.createElement("span", {
                className: "gdot",
                style: {
                  background:
                    N.id === "todo"
                      ? "#E0A526"
                      : N.id === "doing"
                        ? "#1F8FA3"
                        : "#5FAF5A",
                },
              }),
              N.name,
              React.createElement("span", { className: "gcount" }, P.length),
            ),
            React.createElement(
              "div",
              { className: "space-y-2" },
              P.map((he) =>
                React.createElement(En, {
                  key: he.id,
                  t: he,
                  worker: n[he.assignee],
                  section: o[he.venture],
                  showSection: !0,
                  ...i,
                }),
              ),
              !P.length &&
                React.createElement("div", { className: "empty sm" }, "\u2014"),
            ),
          ),
        ),
      ),
    );
  }
  function Go({ kind: e, color: t }) {
    let s = t,
      n = {
        house: React.createElement(
          React.Fragment,
          null,
          React.createElement("path", {
            d: "M6 20V11l8-6 8 6v9z",
            fill: "#F6EDDF",
            stroke: "#8A6446",
          }),
          React.createElement("path", {
            d: "M4 12l10-8 10 8",
            stroke: s,
            strokeWidth: "3",
            fill: "none",
          }),
          React.createElement("rect", {
            x: "12",
            y: "14",
            width: "4",
            height: "6",
            fill: s,
          }),
        ),
        shop: React.createElement(
          React.Fragment,
          null,
          React.createElement("rect", {
            x: "5",
            y: "10",
            width: "18",
            height: "11",
            fill: "#F6EDDF",
            stroke: "#8A6446",
          }),
          React.createElement("path", { d: "M4 10h20l-2-4H6z", fill: s }),
          React.createElement("path", {
            d: "M7 10v2M11 10v2M15 10v2M19 10v2",
            stroke: "#FFF",
          }),
          React.createElement("rect", {
            x: "9",
            y: "14",
            width: "10",
            height: "5",
            fill: "#9CC9D1",
          }),
        ),
        office: React.createElement(
          React.Fragment,
          null,
          React.createElement("rect", {
            x: "8",
            y: "4",
            width: "12",
            height: "18",
            fill: "#F6EDDF",
            stroke: "#8A6446",
          }),
          React.createElement("rect", {
            x: "8",
            y: "3",
            width: "12",
            height: "2",
            fill: s,
          }),
          [7, 11, 15].map((o) =>
            React.createElement(
              "g",
              { key: o },
              React.createElement("rect", {
                x: "10",
                y: o,
                width: "3",
                height: "2.5",
                fill: "#9CC9D1",
              }),
              React.createElement("rect", {
                x: "15",
                y: o,
                width: "3",
                height: "2.5",
                fill: "#9CC9D1",
              }),
            ),
          ),
        ),
        farm: React.createElement(
          React.Fragment,
          null,
          React.createElement("path", { d: "M4 21v-8l6-5 6 5v8z", fill: s }),
          React.createElement("path", { d: "M16 21h8v-3h-8", fill: "#7DB35F" }),
          React.createElement("path", {
            d: "M16 18h8M16 15h8",
            stroke: "#6AA152",
          }),
          React.createElement("rect", {
            x: "8",
            y: "15",
            width: "4",
            height: "6",
            fill: "#6A4934",
          }),
        ),
        tower: React.createElement(
          React.Fragment,
          null,
          React.createElement("path", {
            d: "M11 22l1-15h4l1 15z",
            fill: "#F6EDDF",
            stroke: "#8A6446",
          }),
          React.createElement("path", {
            d: "M11.6 16h4.8M12 11h4",
            stroke: s,
            strokeWidth: "2",
          }),
          React.createElement("path", { d: "M11 7l3-4 3 4z", fill: s }),
        ),
      };
    return React.createElement(
      "svg",
      {
        width: "36",
        height: "36",
        viewBox: "0 0 28 26",
        "aria-hidden": "true",
      },
      n[e],
    );
  }
  function Pn({ onClose: e, onCreate: t }) {
    let [s, n] = ve({ name: "", sub: "", kind: "house", color: gs[0] }),
      o = s.name.trim().length > 0;
    return React.createElement(
      cs,
      {
        title: "Expand the island",
        color: "#E9B949",
        onClose: e,
        footer: React.createElement(
          React.Fragment,
          null,
          React.createElement(Q, { variant: "ghost", onClick: e }, "Cancel"),
          React.createElement(
            Q,
            { variant: "gold", disabled: !o, onClick: () => o && t(s) },
            React.createElement(Ls, { size: 16 }),
            "Raise new land",
          ),
        ),
      },
      React.createElement(
        "p",
        { className: "text-[14px] mb-3", style: { color: "var(--ink2)" } },
        "A fresh plot rises from the sea on the coast for this section. It levels up as you finish its tasks, just like the rest of the island.",
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-3" },
        React.createElement(
          Y,
          { label: "Section name" },
          React.createElement("input", {
            id: "sec-name",
            autoFocus: !0,
            className: "inp",
            value: s.name,
            placeholder: "e.g. Padel rackets",
            onChange: (i) => n({ ...s, name: i.target.value }),
          }),
        ),
        React.createElement(
          Y,
          { label: "Short description" },
          React.createElement("input", {
            id: "sec-sub",
            className: "inp",
            value: s.sub,
            placeholder: "e.g. Metalbone resale",
            onChange: (i) => n({ ...s, sub: i.target.value }),
          }),
        ),
        React.createElement(
          Y,
          { label: "Building", className: "col-span-2" },
          React.createElement(
            "div",
            { className: "grid grid-cols-5 gap-2" },
            Js.map((i) =>
              React.createElement(
                "button",
                {
                  key: i.id,
                  type: "button",
                  className: "kind" + (s.kind === i.id ? " on" : ""),
                  onClick: () => n({ ...s, kind: i.id }),
                  "aria-pressed": s.kind === i.id,
                },
                React.createElement(Go, { kind: i.id, color: s.color }),
                React.createElement("span", null, i.name),
              ),
            ),
          ),
        ),
        React.createElement(
          Y,
          { label: "Colour", className: "col-span-2" },
          React.createElement(
            "div",
            { className: "flex flex-wrap gap-2" },
            gs.map((i) =>
              React.createElement("button", {
                key: i,
                type: "button",
                className: "swatch" + (s.color === i ? " on" : ""),
                style: { background: i },
                onClick: () => n({ ...s, color: i }),
                "aria-label": "Colour " + i,
                "aria-pressed": s.color === i,
              }),
            ),
          ),
        ),
      ),
    );
  }
  /* ---- fresh start: welcome + build dialogs ---- */
  /* a card per catalog entry: tick to pick, or tap to choose */
  function PickCard({ c: c, on: on, onClick: f, taken: tk }) {
    return React.createElement("button", { type: "button", className: "pick-card" + (on ? " on" : "") + (tk ? " taken" : ""), "aria-pressed": !!on, disabled: !!tk, onClick: f },
      React.createElement("span", { className: "pick-dot", style: { background: c.color } }),
      React.createElement("b", null, c.label),
      React.createElement("span", null, tk ? "Already built" : c.blurb));
  }
  function FaithStyle({ value: v, onChange: f }) {
    return React.createElement(Y, { label: "Which building?" },
      React.createElement("div", { className: "flex flex-wrap gap-2" },
        FAITH_STYLES.map((st) => React.createElement("button", { key: st.id, type: "button", className: "chip-btn" + (v === st.id ? " on" : ""), "aria-pressed": v === st.id, onClick: () => f(st.id) }, st.label))));
  }
  function WelcomeDlg({ onStart: e, sandbox: sb, onExit: x }) {
    let [f, setF] = React.useState({ owner: "", islandName: "", mode: "fresh", picks: ["houses"], faith: "mosque", step: 1 }),
      ok = f.owner.trim().length > 0,
      name = () => f.islandName.trim() || f.owner.trim() + "’s Isle",
      go = () => ok && (f.mode === "fresh" && f.step === 1 ? setF({ ...f, step: 2 }) : e({ ...f, owner: f.owner.trim(), islandName: name() })),
      toggle = (t) => setF({ ...f, picks: f.picks.includes(t) ? f.picks.filter((x) => x !== t) : [...f.picks, t] }),
      opt = (id, title, text) =>
        React.createElement("button", { type: "button", className: "start-opt" + (f.mode === id ? " on" : ""), "aria-pressed": f.mode === id, onClick: () => setF({ ...f, mode: id }) },
          React.createElement("b", null, title), React.createElement("span", null, text)),
      group = (g, title) => React.createElement("div", { key: g },
        React.createElement("div", { className: "pick-group" }, title),
        React.createElement("div", { className: "pick-grid" }, CATALOG.filter((c) => c.group === g).map((c) => React.createElement(PickCard, { key: c.type, c, on: f.picks.includes(c.type), onClick: () => toggle(c.type) }))));
    return React.createElement("div", { className: "modal-back welcome-back" },
      React.createElement("div", { className: "hud-card modal-card welcome-card" + (f.step === 2 ? " wide" : ""), role: "dialog", "aria-label": "Welcome to Valley Isle" },
        f.step === 1
          ? React.createElement(React.Fragment, null,
              React.createElement("div", { className: "welcome-emblem" }, React.createElement(qn, null)),
              React.createElement("h2", { className: "welcome-title" }, "Welcome to your island"),
              React.createElement("p", { className: "welcome-sub" }, "Every part of your life gets a building. Finish tasks and the island grows with you."),
              React.createElement("div", { className: "grid gap-3" },
                React.createElement(Y, { label: "What should we call you?" },
                  React.createElement("input", { className: "inp", autoFocus: !0, value: f.owner, placeholder: "Your name", onChange: (a) => setF({ ...f, owner: a.target.value }), onKeyDown: (a) => a.key === "Enter" && go() })),
                React.createElement(Y, { label: "Name your island" },
                  React.createElement("input", { className: "inp", value: f.islandName, placeholder: f.owner.trim() ? f.owner.trim() + "’s Isle" : "e.g. Valley Isle", onChange: (a) => setF({ ...f, islandName: a.target.value }), onKeyDown: (a) => a.key === "Enter" && go() })),
                React.createElement("div", { className: "start-opts" },
                  opt("fresh", "Build my own island", "Pick the parts of your life you want. Your island takes its shape from what you choose."),
                  opt("classic", "Explore the sample island", "Everything already built: studio, workshop, caf\xE9, gym, the work island and a crew."))))
          : React.createElement(React.Fragment, null,
              React.createElement("h2", { className: "welcome-title" }, "What goes on " + name() + "?"),
              React.createElement("p", { className: "welcome-sub" }, "Your home is already there. Everything you pick starts as a building site and opens when you finish its first task. You can add more, move things around and reshape the island any time."),
              React.createElement("div", { className: "pick-scroll" },
                group("work", "Work & business"), group("life", "Life"),
                f.picks.includes("faith") && React.createElement("div", { className: "mt-2" }, React.createElement(FaithStyle, { value: f.faith, onChange: (v) => setF({ ...f, faith: v }) })),
                group("scenery", "Scenery"))),
        React.createElement("div", { className: "welcome-foot" },
          sb && React.createElement(Q, { variant: "ghost", onClick: x }, "Leave sandbox"),
          f.step === 2 && React.createElement(Q, { variant: "ghost", onClick: () => setF({ ...f, step: 1 }) }, "Back"),
          React.createElement(Q, { variant: "gold", disabled: !ok, onClick: go }, f.mode === "fresh" && f.step === 1 ? "Next" : "Raise my island"))));
  }
  function BuildDlg({ preset: e, taken: tk, onClose: t, onBuild: s }) {
    let [f, setF] = React.useState(() => {
        let c = CATALOG.find((x) => x.type === e);
        return c ? { type: c.type, name: c.name || c.label, sub: c.sub || "", color: c.color, crew: !!c.crew, faith: "mosque" } : { type: null };
      }),
      c = CATALOG.find((x) => x.type === f.type),
      choose = (x) => x.type === "section" ? s("section", {}) : setF({ type: x.type, name: x.name || x.label, sub: x.sub || "", color: x.color, crew: !!x.crew, faith: "mosque" }),
      ok = c && (c.group === "scenery" || f.name.trim().length > 0);
    return React.createElement(cs, {
        title: c ? "Build " + (/^[aeiou]/i.test(c.label) ? "an " : "a ") + c.label : "Build something new",
        color: c ? f.color : "#E9B949",
        onClose: t,
        width: c ? 520 : 640,
        footer: React.createElement(React.Fragment, null,
          c && !e && React.createElement(Q, { variant: "ghost", onClick: () => setF({ type: null }) }, "Back"),
          React.createElement(Q, { variant: "ghost", onClick: t }, "Not yet"),
          c && React.createElement(Q, { variant: "gold", disabled: !ok, onClick: () => ok && s(f.type, { ...f, name: (f.name || c.label).trim(), sub: f.sub.trim() || c.sub || "" }) }, React.createElement(Ls, { size: 16 }), c.group === "scenery" ? "Place it" : "Start building")),
      },
      !c
        ? React.createElement("div", null,
            React.createElement("p", { className: "build-hero" }, "New buildings start as a site with a crane. Finish their first task and they open. After that you can drag them anywhere in Edit layout."),
            [["work", "Work & business"], ["life", "Life"], ["scenery", "Scenery"]].map(([g, title]) => React.createElement("div", { key: g },
              React.createElement("div", { className: "pick-group" }, title),
              React.createElement("div", { className: "pick-grid" }, CATALOG.filter((x) => x.group === g).map((x) => React.createElement(PickCard, { key: x.type, c: x, taken: x.id && tk && tk.includes(x.id), onClick: () => choose(x) }))))))
        : React.createElement("div", null,
            React.createElement("p", { className: "build-hero" }, c.blurb + (c.group === "scenery" ? "." : ". It starts as a building site and opens when you finish its first task there.")),
            c.group !== "scenery" && React.createElement("div", { className: "grid grid-cols-2 gap-3" },
              React.createElement(Y, { label: "Name" }, React.createElement("input", { className: "inp", autoFocus: !0, value: f.name, onChange: (a) => setF({ ...f, name: a.target.value }) })),
              React.createElement(Y, { label: "Short description" }, React.createElement("input", { className: "inp", value: f.sub, onChange: (a) => setF({ ...f, sub: a.target.value }) })),
              c.styles && React.createElement("div", { className: "col-span-2" }, React.createElement(FaithStyle, { value: f.faith, onChange: (v) => setF({ ...f, faith: v }) })),
              React.createElement(Y, { label: "Colour", className: "col-span-2" },
                React.createElement("div", { className: "flex flex-wrap gap-2" },
                  gs.map((col) => React.createElement("button", { key: col, type: "button", className: "swatch" + (f.color === col ? " on" : ""), style: { background: col }, onClick: () => setF({ ...f, color: col }), "aria-label": "Colour " + col, "aria-pressed": f.color === col })))),
              c.crew && React.createElement("label", { className: "col-span-2 crew-opt" },
                React.createElement("input", { type: "checkbox", checked: f.crew, onChange: (a) => setF({ ...f, crew: a.target.checked }) }),
                React.createElement("span", null, React.createElement("b", null, "Hire the studio crew"), " \xB7 Scriptwriter, Image Gen, Voiceover, Editor, Thumbnail and Publisher, each with their own look.")))));
  }
  /* journal at home: a 30-second check-in, mood and one win */
  var MOODS = [{ v: 1, c: "#9FB0D9", l: "Rough" }, { v: 2, c: "#B7A6DC", l: "Meh" }, { v: 3, c: "#E9D9A6", l: "Okay" }, { v: 4, c: "#F0C06A", l: "Good" }, { v: 5, c: "#E4826A", l: "Great" }];
  function Journal({ entries: es, today: td, onSave: f }) {
    let el = React.createElement, cur = es.find((x) => x.d === td) || {}, [w, setW] = React.useState(cur.win || ""), [open, setOpen] = React.useState(!1),
      past = [...es].filter((x) => x.d !== td).sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 14);
    return el("div", { className: "chart-card space-y-2 mb-3" },
      el("div", { className: "flex items-center justify-between" }, el("b", { className: "text-[14px]" }, "Today's check-in"), past.length > 0 && el("button", { type: "button", className: "link-btn", onClick: () => setOpen(!open) }, open ? "Hide past days" : "Past days")),
      el("div", { className: "mood-row", role: "radiogroup", "aria-label": "Mood" }, MOODS.map((m) => el("button", { key: m.v, type: "button", role: "radio", "aria-checked": cur.mood === m.v, className: "mood" + (cur.mood === m.v ? " on" : ""), onClick: () => f({ mood: m.v, win: w }) }, el("span", { className: "mood-dot", style: { background: m.c } }), el("span", null, m.l)))),
      el("div", { className: "flex gap-2" }, el("input", { className: "inp", value: w, placeholder: "One win today, however small", onChange: (e) => setW(e.target.value) }), el(Q, { variant: "gold", disabled: !w.trim() || w === cur.win, onClick: () => f({ mood: cur.mood || 3, win: w.trim() }) }, "Save")),
      open && el("div", { className: "list-card" }, past.map((x) => el("div", { key: x.d, className: "row-li" }, el("span", { className: "mood-dot", style: { background: (MOODS.find((m) => m.v === x.mood) || MOODS[2]).c } }), el("span", { className: "muted", style: { minWidth: 58 } }, new Date(x.d + "T12:00").toLocaleDateString("en", { day: "numeric", month: "short" })), el("span", { className: "flex-1 min-w-0" }, x.win || "\u2014")))));
  }
  /* studio content calendar: each video moves through the crew's pipeline */
  var PIPE = [{ id: "idea", l: "Idea", role: null }, { id: "script", l: "Script", role: "script" }, { id: "voice", l: "Voiceover", role: "voice" }, { id: "images", l: "Images", role: "imagegen" }, { id: "edit", l: "Edit", role: "editor" }, { id: "thumb", l: "Thumbnail", role: "thumb" }, { id: "publish", l: "Publish", role: "publish" }, { id: "live", l: "Live", role: null }];
  function ContentCal({ videos: vs, crew: cw, onSave: f, onDelete: del }) {
    let el = React.createElement, [n, setN] = React.useState({ title: "", date: "" }),
      byRole = Object.fromEntries((cw || []).map((w) => [w.id, w]));
    return el("div", { className: "chart-card space-y-2 mb-3" },
      el("b", { className: "text-[14px]" }, "Content calendar"),
      vs.length ? el("div", { className: "list-card" }, [...vs].sort((a, b) => (a.date || "9") < (b.date || "9") ? -1 : 1).map((x) => {
        let si = Math.max(0, PIPE.findIndex((p2) => p2.id === x.stage)), st = PIPE[si], who = st.role && byRole[st.role];
        return el("div", { key: x.id, className: "row-li vid" },
          el("span", { className: "flex-1 min-w-0" }, el("b", null, x.title), el("span", { className: "muted" }, (x.date ? " \xB7 " + new Date(x.date + "T12:00").toLocaleDateString("en", { day: "numeric", month: "short" }) : "") + " \xB7 " + st.l + (who ? " with " + who.name : "")),
            el("span", { className: "pipe" }, PIPE.map((p2, k) => el("span", { key: p2.id, className: "pipe-s" + (k < si ? " done" : k === si ? " now" : ""), title: p2.l })))),
          si < PIPE.length - 1 && el(Q, { variant: "ghost", onClick: () => f({ ...x, stage: PIPE[si + 1].id }) }, PIPE[si + 1].l + " \u2192"),
          el("button", { type: "button", className: "x-btn", "aria-label": "Delete " + x.title, onClick: () => del(x.id) }, "\xD7"));
      })) : el("div", { className: "muted text-[12px]" }, "Plan videos from idea to live. Each stage belongs to one of the studio crew."),
      el("div", { className: "grid grid-cols-3 gap-2" }, el("input", { className: "inp col-span-2", value: n.title, placeholder: "Video title", onChange: (e) => setN({ ...n, title: e.target.value }) }), el("input", { className: "inp", type: "date", value: n.date, "aria-label": "Publish date", onChange: (e) => setN({ ...n, date: e.target.value }) })),
      el(Q, { variant: "gold", disabled: !n.title.trim(), onClick: () => { f({ title: n.title.trim(), date: n.date, stage: "idea" }); setN({ title: "", date: "" }); } }, "Add video"));
  }
  /* island settings: rename, back up everything to a file, restore from one */
  var BACKUP_COLS = ["tasks", "workers", "leads", "sections", "pgoals", "spend", "bills", "savings", "journal", "videos"],
    BACKUP_DOCS = ["settings/island", "budget/plan", "habits/list", "fitness/profile", "fitness/weights", "fitness/workouts", "fitness/habits", "stats/activity", "stats/treasury", "stats/focus"];
  async function exportIsland(db, hb) {
    let out = { app: "valley-isle", version: 1, exportedAt: new Date().toISOString(), collections: {}, docs: {}, health: {} };
    if (hb) {
      for (let c of ["days", "cycle"]) { let q = await db.collection(hb + "/health/" + c).get(); out.health[c] = q.docs.map((d) => ({ id: d.id, ...d.data() })); }
      let cf = await db.doc(hb + "/healthcfg").get(); cf.exists && (out.health.cfg = cf.data());
    }
    for (let c of BACKUP_COLS) { let q = await db.collection(c).get(); out.collections[c] = q.docs.map((d) => ({ id: d.id, ...d.data() })); }
    for (let d of BACKUP_DOCS) { let x = await db.doc(d).get(); x.exists && (out.docs[d] = x.data()); }
    return out;
  }
  async function saveFile(name, text) {
    let dl = null;
    try { dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch { dl = null; }
    if (dl) return dl.save({ filename: name, data: text });
    let a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  function SettingsDlg({ isl: il, onRename: rn, onExport: ex, onImport: im, onClose: close }) {
    let el = React.createElement, [nm, setNm] = React.useState((il && il.islandName) || "Valley Isle"), [busy, setBusy] = React.useState(""), fileRef = React.useRef(null);
    return el(cs, { title: "Island settings", color: "#9F8FC9", onClose: close, footer: el(Q, { variant: "ghost", onClick: close }, "Close") },
      el("div", { className: "space-y-4" },
        el(Y, { label: "Island name" }, el("div", { className: "flex gap-2" }, el("input", { className: "inp", value: nm, onChange: (e) => setNm(e.target.value) }), el(Q, { variant: "gold", disabled: !nm.trim(), onClick: () => rn(nm.trim()) }, "Rename"))),
        el("div", { className: "chart-card space-y-2" }, el("b", { className: "text-[14px]" }, "Backup"),
          el("p", { className: "muted text-[12.5px]" }, "Download everything (tasks, crew, leads, goals, fitness, budget, savings, journal and your layout) as one file. Keep it somewhere safe; you can restore from it on any device."),
          el("div", { className: "flex gap-2 flex-wrap" },
            el(Q, { variant: "gold", disabled: !!busy, onClick: async () => { setBusy("export"); try { await ex(); } finally { setBusy(""); } } }, busy === "export" ? "Preparing\u2026" : "Download backup"),
            el(Q, { variant: "ghost", disabled: !!busy, onClick: () => fileRef.current && fileRef.current.click() }, "Restore from a file\u2026"),
            el("input", { ref: fileRef, type: "file", accept: "application/json,.json", style: { display: "none" }, onChange: async (e) => { let f2 = e.target.files && e.target.files[0]; e.target.value = ""; if (!f2) return; setBusy("import"); try { await im(await f2.text()); } finally { setBusy(""); } } })))));
  }
  /* your own daily habits, alongside water, steps and sleep */
  function HabitEditor({ onChange: f }) {
    let [n, setN] = React.useState(""), el = React.createElement, custom = wt.slice(WT_BASE.length);
    return el("div", { className: "chart-card space-y-2" },
      el("b", { className: "text-[14px]" }, "Your own habits"),
      custom.length ? el("div", { className: "flex flex-wrap gap-1.5" }, custom.map((h) => el("span", { key: h.id, className: "chip-btn sm on" }, h.name, el("button", { type: "button", className: "x-btn", "aria-label": "Remove " + h.name, onClick: () => f(custom.filter((x) => x.id !== h.id)) }, "\xD7")))) : el("div", { className: "muted text-[12px]" }, "Reading, prayer, no-spend day, stretching \u2026 add anything you want to do every day."),
      el("div", { className: "flex gap-2" }, el("input", { className: "inp", value: n, placeholder: "e.g. Read 10 pages", onChange: (e) => setN(e.target.value), onKeyDown: (e) => e.key === "Enter" && n.trim() && (f([...custom, { id: "h" + Date.now().toString(36), name: n.trim(), detail: "Daily" }]), setN("")) }),
        el(Q, { variant: "gold", disabled: !n.trim(), onClick: () => (f([...custom, { id: "h" + Date.now().toString(36), name: n.trim(), detail: "Daily" }]), setN("")) }, "Add")));
  }
  /* ---------------- week planner (Town Hall): every task by day, drag to reschedule ---------------- */
  function WeekDrawer({ tasks: ts, secById: sb, onMove: mv, onOpen: op, onClose: close }) {
    let el = React.createElement, days = [], t0 = new Date();
    t0.setHours(12, 0, 0, 0);
    for (let k = 0; k < 7; k++) { let d = new Date(t0.getTime() + k * 864e5); days.push({ key: d.toISOString().slice(0, 10), d, label: k === 0 ? "Today" : k === 1 ? "Tomorrow" : d.toLocaleDateString("en", { weekday: "long" }), sub: d.toLocaleDateString("en", { day: "numeric", month: "short" }) }); }
    let [drag, setDrag] = React.useState(null), [over, setOver] = React.useState(null),
      open = ts.filter((tk) => tk.status !== "done"),
      late = open.filter((tk) => tk.due && tk.due < days[0].key && !tk.repeat),
      col = (key) => open.filter((tk) => !tk.repeat && (tk.due === key || (key === days[0].key && late.includes(tk)))),
      reps = (d) => ts.filter((tk) => tk.repeat && repeatsToday(tk, d)),
      anytime = open.filter((tk) => !tk.due && !tk.repeat),
      card = (tk, rep) => {
        let sec = sb[tk.venture] || { name: "\u2014", color: "#999" }, isLate = late.includes(tk);
        return el("div", { key: tk.id + (rep ? "r" : ""), className: "wk-task" + (rep ? " rep" : "") + (isLate ? " late" : ""), draggable: !rep, onDragStart: (e) => (setDrag(tk), e.dataTransfer.setData("text/plain", tk.id)), onDragEnd: () => (setDrag(null), setOver(null)), onClick: () => op(tk) },
          el("span", { className: "gdot", style: { background: sec.color } }),
          el("span", { className: "min-w-0 flex-1" }, el("span", { className: "wk-t" }, tk.title), el("span", { className: "wk-m" }, sec.name + (rep ? " \xB7 repeats" : isLate ? " \xB7 overdue" : ""))),
          !rep && el("select", { className: "wk-move", value: "", "aria-label": "Move " + tk.title, onClick: (e) => e.stopPropagation(), onChange: (e) => mv(tk, e.target.value === "none" ? "" : e.target.value) },
            el("option", { value: "" }, "Move\u2026"), days.map((d) => el("option", { key: d.key, value: d.key }, d.label)), el("option", { value: "none" }, "Anytime")));
      },
      zone = (key, title, sub, items) => el("div", { key, className: "wk-col" + (over === key ? " over" : ""), onDragOver: (e) => (e.preventDefault(), setOver(key)), onDragLeave: () => setOver(null), onDrop: (e) => { e.preventDefault(); drag && mv(drag, key === "any" ? "" : key); setDrag(null); setOver(null); } },
        el("div", { className: "wk-h" }, el("b", null, title), el("span", null, sub), el("span", { className: "wk-n" }, items.length || "")), items.length ? items : el("div", { className: "wk-empty" }, "Free"));
    return el(zt, { title: "Week planner", sub: "Town Hall \xB7 drag tasks between days", color: "#9F8FC9", icon: el("span", { style: { fontSize: 15, color: "#fff" } }, "7"), onClose: close, wide: !0 },
      el("div", { className: "wk-grid" },
        days.map((d) => zone(d.key, d.label, d.sub, [...col(d.key).map((tk) => card(tk)), ...reps(d.d).map((tk) => card(tk, !0))])),
        zone("any", "Anytime", "no date", anytime.map((tk) => card(tk)))));
  }
  /* ---------------- focus timer: 25 minutes on one task ---------------- */
  function FocusCard({ focus: f, venture: vn, onPause: pz, onStop: st, onDone: dn }) {
    let [, tick] = React.useState(0);
    React.useEffect(() => { let id = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(id); }, []);
    let el = React.createElement,
      used = f.paused ? f.used : f.used + (Date.now() - f.since) / 1000,
      left = Math.max(0, f.dur - used), p = 1 - left / f.dur,
      mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(Math.floor(left % 60)).padStart(2, "0");
    React.useEffect(() => { left <= 0 && dn(); }, [left <= 0]);
    let R2 = 30, C = 2 * Math.PI * R2;
    return el("div", { className: "focus-card hud-card", role: "timer", "aria-label": "Focus timer" },
      el("svg", { width: 72, height: 72, viewBox: "0 0 72 72", "aria-hidden": "true" },
        el("circle", { cx: 36, cy: 36, r: R2, fill: "none", stroke: "rgba(70,61,99,0.12)", strokeWidth: 6 }),
        el("circle", { cx: 36, cy: 36, r: R2, fill: "none", stroke: vn ? vn.color : "#E4826A", strokeWidth: 6, strokeLinecap: "round", strokeDasharray: C, strokeDashoffset: C * (1 - p), transform: "rotate(-90 36 36)" }),
        el("text", { x: 36, y: 40, textAnchor: "middle", className: "focus-t" }, mm + ":" + ss)),
      el("div", { className: "min-w-0 flex-1" },
        el("div", { className: "focus-l" }, f.paused ? "Paused" : "Focusing"),
        el("b", { className: "focus-n" }, f.task.title),
        el("div", { className: "focus-l" }, (vn ? vn.name : "") + " \xB7 +8 XP when the timer ends"),
        el("div", { className: "flex gap-1.5 mt-1.5" },
          el(Q, { variant: "ghost", onClick: pz }, f.paused ? "Resume" : "Pause"),
          el(Q, { variant: "ghost", onClick: st }, "Stop"))));
  }
  /* ---------------- Health Centre: steps, calories, cycle ---------------- */
  // where health numbers come from. In the browser that's you typing them in; the App Store /
  // Play Store build swaps this for Apple HealthKit / Android Health Connect (with permission).
  var HealthSource = { name: "manual", connected: !1, readSteps: null };
  var dayKey = (d) => { let x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
  var addDays = (k, n) => dayKey(new Date(new Date(k + "T12:00").getTime() + n * 864e5));
  var diffDays = (a, b) => Math.round((new Date(a + "T12:00") - new Date(b + "T12:00")) / 864e5);
  var MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
  function HealthDrawer({ days: ds, cycle: cy, cfg: cf, today: td, workoutsWeek: ww, building: bld, ready: rd, tab: t0, onClose: close, act: A, onGym: gym }) {
    let el = React.createElement, cfg = { calTarget: 2000, stepTarget: 10000, cycleLen: 28, periodLen: 5, ...(cf || {}) },
      byDay = Object.fromEntries((ds || []).map((x) => [x.id, x])), today = byDay[td] || { id: td },
      [tab, setTab] = React.useState(t0 || "today"),
      [st, setSt] = React.useState(""), [mOff, setMOff] = React.useState(0), [f, setF] = React.useState({ name: "", kcal: "", meal: "Breakfast" }), [tg, setTg] = React.useState(""),
      eaten = (today.kcal || []).reduce((a, x) => a + (Number(x.kcal) || 0), 0),
      steps = Number(today.steps) || 0,
      numInp = (v, fn, ph) => el("input", { className: "inp", inputMode: "numeric", value: v, placeholder: ph, onChange: (e) => fn(e.target.value.replace(/[^0-9]/g, "")) }),
      phoneH = !!(window.LLPlatform && window.LLPlatform.health), [sy, setSy] = React.useState("");
    // already connected: pull the latest from Apple Health whenever the Health Centre opens
    React.useEffect(() => { phoneH && rd && cfg.phone && A.syncPhone && A.syncPhone(!0); }, [rd]);
    if (!rd) return el(zt, { title: "Health Centre", sub: "Loading your private health space…", color: "#5CB88A", icon: el("span", { style: { color: "#fff", fontSize: 18 } }, "+"), onClose: close });
    // ---- today: steps ----
    let todayTab = el("div", { className: "space-y-3 mt-3" },
      el("div", { className: "grid grid-cols-3 gap-2" },
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, steps.toLocaleString("en-ZA").replace(/,/g, " ")), el("div", { className: "stat-l" }, "Steps")),
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, eaten), el("div", { className: "stat-l" }, "kcal eaten")),
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, ww), el("div", { className: "stat-l" }, "Workouts this week"))),
      el("div", { className: "chart-card space-y-2" },
        el("div", { className: "flex items-center justify-between" }, el("b", { className: "text-[14px]" }, "Steps today"), el("span", { className: "muted text-[12px]" }, "Goal " + cfg.stepTarget.toLocaleString("en-ZA").replace(/,/g, " "))),
        el("div", { className: "save-bar", role: "progressbar", "aria-valuenow": Math.round(Math.min(1, steps / cfg.stepTarget) * 100), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": "Steps" }, el("span", { style: { width: Math.min(100, (steps / cfg.stepTarget) * 100) + "%", background: steps >= cfg.stepTarget ? "#7CB87A" : "#5CB88A" } })),
        el("div", { className: "flex gap-2 flex-wrap" }, numInp(st, setSt, "Steps so far today"), el(Q, { variant: "gold", disabled: !st, onClick: () => { A.setSteps(Number(st), cfg.stepTarget); setSt(""); } }, "Save"),
          [1000, 2500, 5000].map((n2) => el("button", { key: n2, type: "button", className: "chip-btn sm", onClick: () => A.setSteps(steps + n2, cfg.stepTarget) }, "+" + n2 / 1000 + "k"))),
        el("div", { className: "muted text-[12px]" }, "Reach your goal and the Gym's steps habit ticks itself.")),
      phoneH ? el("div", { className: "chart-card phone-src space-y-2" },
        el("b", { className: "text-[14px]" }, "Apple Health"),
        today.phone ? el("div", { className: "muted text-[12.5px]" }, "Today from Apple Health: " + (today.phone.steps || 0).toLocaleString("en-ZA").replace(/,/g, " ") + " steps \xB7 " + (today.phone.activeKcal || 0) + " active kcal" + ((today.phone.workouts || []).length ? " \xB7 " + today.phone.workouts.map((w2) => w2.kind + " " + w2.minutes + " min").join(", ") : "")) : null,
        el("p", { className: "muted text-[12.5px]" }, "LifeList only reads steps, active calories, workouts and your cycle. It never writes anything to Apple Health, and it all stays on this iPhone." + (cfg.phone ? " If nothing comes through, allow LifeList in Settings \u203A Health \u203A Data Access." : "")),
        el(Q, { variant: cfg.phone ? "ghost" : "gold", disabled: !!sy, onClick: async () => { setSy("1"); try { await A.syncPhone(); } finally { setSy(""); } } }, sy ? "Reading Apple Health\u2026" : cfg.phone ? "Sync now" : "Connect Apple Health"))
      : el("div", { className: "chart-card phone-src" },
        el("b", { className: "text-[14px]" }, "Phone health data"),
        el("p", { className: "muted text-[12.5px]" }, "In the LifeList iPhone app, steps, workouts and cycle data can come straight from Apple Health (read-only, with your permission). In the browser, type them in here.")),
      el(Q, { variant: "ghost", onClick: gym }, "Open the Gym →"));
    // ---- calories ----
    let last7 = Array.from({ length: 7 }, (_, k) => addDays(td, k - 6)).map((k) => ({ k, v: ((byDay[k] || {}).kcal || []).reduce((a, x) => a + (Number(x.kcal) || 0), 0) })),
      mx = Math.max(cfg.calTarget * 1.2, ...last7.map((x) => x.v), 1);
    let calTab = el("div", { className: "space-y-3 mt-3" },
      el("div", { className: "chart-card space-y-2" },
        el("div", { className: "flex items-center justify-between" }, el("b", { className: "text-[14px]" }, "Today \xB7 " + eaten + " / " + cfg.calTarget + " kcal"), el("span", { className: "muted text-[12px]" }, eaten > cfg.calTarget ? "⚠ " + (eaten - cfg.calTarget) + " over" : cfg.calTarget - eaten + " left")),
        el("div", { className: "save-bar", role: "progressbar", "aria-valuenow": Math.round(Math.min(1, eaten / cfg.calTarget) * 100), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": "Calories" }, el("span", { style: { width: Math.min(100, (eaten / cfg.calTarget) * 100) + "%", background: eaten > cfg.calTarget ? "#D0705A" : "#E9B949" } })),
        el("div", { className: "flex flex-wrap gap-1.5" }, MEALS.map((m) => el("button", { key: m, type: "button", className: "chip-btn sm" + (f.meal === m ? " on" : ""), "aria-pressed": f.meal === m, onClick: () => setF({ ...f, meal: m }) }, m))),
        el("div", { className: "grid grid-cols-3 gap-2" }, el("input", { className: "inp col-span-2", value: f.name, placeholder: "What did you eat?", onChange: (e) => setF({ ...f, name: e.target.value }) }), numInp(f.kcal, (v) => setF({ ...f, kcal: v }), "kcal")),
        el(Q, { variant: "gold", disabled: !f.name.trim() || !(Number(f.kcal) > 0), onClick: () => { A.addFood({ name: f.name.trim(), kcal: Number(f.kcal), meal: f.meal }); setF({ ...f, name: "", kcal: "" }); } }, "Add")),
      el("div", { className: "list-card" }, (today.kcal || []).length ? MEALS.flatMap((m) => (today.kcal || []).filter((x) => x.meal === m).map((x) => el("div", { key: x.id, className: "row-li" }, el("span", { className: "muted", style: { minWidth: 70 } }, m), el("span", { className: "flex-1 min-w-0" }, x.name), el("span", { className: "tnum" }, x.kcal + " kcal"), el("button", { type: "button", className: "x-btn", "aria-label": "Remove " + x.name, onClick: () => A.delFood(x.id) }, "\xD7"))))
        : el("div", { className: "empty-li" }, "Nothing logged today. Add what you eat with its calories.")),
      el("div", { className: "chart-card" },
        el("b", { className: "text-[14px]" }, "Last 7 days"),
        el("div", { className: "kc-chart", role: "list" }, last7.map((x) => el("div", { key: x.k, className: "kc-col", role: "listitem", title: new Date(x.k + "T12:00").toLocaleDateString("en", { weekday: "long" }) + ": " + x.v + " kcal" },
          el("span", { className: "kc-v tnum" }, x.v || ""),
          el("span", { className: "kc-track" }, el("span", { className: "kc-bar" + (x.v > cfg.calTarget ? " over" : ""), style: { height: (x.v / mx) * 100 + "%" } }), el("span", { className: "kc-target", style: { bottom: (cfg.calTarget / mx) * 100 + "%" } })),
          el("span", { className: "kc-d" }, new Date(x.k + "T12:00").toLocaleDateString("en", { weekday: "narrow" }))))),
        el("div", { className: "bar-legend" }, el("span", { className: "lg-fill" }), "eaten", el("span", { className: "lg-plan", style: { width: 12, height: 2 } }), "daily target " + cfg.calTarget)),
      el("div", { className: "flex gap-2 items-center" }, numInp(tg, setTg, "Daily target (kcal)"), el(Q, { variant: "ghost", disabled: !(Number(tg) > 500), onClick: () => { A.setCfg({ ...cfg, calTarget: Number(tg) }); setTg(""); } }, "Set target")));
    // ---- cycle ----
    let periods = [...(cy || [])].sort((a, b) => (a.start < b.start ? -1 : 1)),
      starts = periods.map((x) => x.start),
      gaps = starts.slice(1).map((x, k) => diffDays(x, starts[k])).filter((g) => g > 15 && g < 60).slice(-6),
      avg = gaps.length ? Math.round(gaps.reduce((a, g) => a + g, 0) / gaps.length) : cfg.cycleLen,
      lens = periods.filter((x) => x.end).map((x) => diffDays(x.end, x.start) + 1).slice(-6),
      plen = lens.length ? Math.round(lens.reduce((a, g) => a + g, 0) / lens.length) : cfg.periodLen,
      last = periods[periods.length - 1], open = last && !last.end && diffDays(td, last.start) < 10,
      nextStart = last ? addDays(last.start, avg) : null, ovu = nextStart ? addDays(nextStart, -14) : null,
      cday = last ? diffDays(td, last.start) + 1 : null,
      phase = !last ? null : open || cday <= plen ? "Period" : ovu && Math.abs(diffDays(td, ovu)) <= 1 ? "Ovulation (estimated)" : ovu && diffDays(td, ovu) >= -5 && diffDays(td, ovu) < -1 ? "Fertile window (estimated)" : ovu && diffDays(td, ovu) > 1 ? "Luteal phase" : "Follicular phase",
      inPeriod = (k) => periods.some((x) => k >= x.start && k <= (x.end || (x === last && open ? td : addDays(x.start, plen - 1)))),
      predicted = (k) => nextStart && k >= nextStart && k <= addDays(nextStart, plen - 1) && !inPeriod(k),
      fertile = (k) => ovu && diffDays(k, ovu) >= -5 && diffDays(k, ovu) <= 1,
      m0 = new Date(new Date(td + "T12:00").getFullYear(), new Date(td + "T12:00").getMonth() + mOff, 15), first = new Date(m0.getFullYear(), m0.getMonth(), 1), lead = (first.getDay() + 6) % 7, mKey = dayKey(first).slice(0, 7),
      cells = Array.from({ length: 42 }, (_, k) => dayKey(new Date(first.getFullYear(), first.getMonth(), 1 - lead + k)));
    let cycTab = el("div", { className: "space-y-3 mt-3" },
      el("div", { className: "grid grid-cols-3 gap-2" },
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, cday ? "Day " + cday : "—"), el("div", { className: "stat-l" }, "Of cycle")),
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, nextStart ? (diffDays(nextStart, td) >= 0 ? "in " + diffDays(nextStart, td) + "d" : "late " + -diffDays(nextStart, td) + "d") : "—"), el("div", { className: "stat-l" }, "Next period")),
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, avg + "d"), el("div", { className: "stat-l" }, "Avg cycle"))),
      phase && el("div", { className: "bank-note" }, "Today: ", el("b", null, phase), nextStart ? " \xB7 next period around " + new Date(nextStart + "T12:00").toLocaleDateString("en", { day: "numeric", month: "long" }) : ""),
      el("div", { className: "flex gap-2 flex-wrap" },
        open ? el(Q, { variant: "gold", onClick: () => A.endPeriod(last, td) }, "Period ended today") : el(Q, { variant: "gold", onClick: () => A.startPeriod(td) }, "Period started today"),
        el("input", { className: "inp", type: "date", "aria-label": "Log a past period start", max: td, style: { maxWidth: 170 }, onChange: (e) => e.target.value && (A.startPeriod(e.target.value, !0), (e.target.value = "")) })),
      el("div", { className: "chart-card" },
        el("div", { className: "flex items-center justify-between" },
          el("button", { type: "button", className: "x-btn", "aria-label": "Previous month", onClick: () => setMOff(mOff - 1) }, "\u2039"),
          el("b", { className: "text-[14px]" }, m0.toLocaleDateString("en", { month: "long", year: "numeric" })),
          el("button", { type: "button", className: "x-btn", "aria-label": "Next month", onClick: () => setMOff(mOff + 1) }, "\u203A")),
        el("div", { className: "cal-grid", role: "grid", "aria-label": "Cycle calendar" },
          ["M", "T", "W", "T", "F", "S", "S"].map((d2, k) => el("span", { key: "h" + k, className: "cal-h" }, d2)),
          cells.map((k) => el("span", { key: k, role: "gridcell", title: k + (inPeriod(k) ? " \xB7 period" : predicted(k) ? " \xB7 predicted period" : fertile(k) ? " \xB7 fertile (estimated)" : ""), className: "cal-c" + (k.slice(0, 7) !== mKey ? " dim" : "") + (inPeriod(k) ? " per" : "") + (predicted(k) ? " pred" : "") + (!inPeriod(k) && fertile(k) ? " fert" : "") + (k === ovu ? " ovu" : "") + (k === td ? " today" : "") }, Number(k.slice(8))))),
        el("div", { className: "bar-legend" }, el("span", { className: "cal-key per" }), "period", el("span", { className: "cal-key pred" }), "predicted", el("span", { className: "cal-key fert" }), "fertile (est.)")),
      el("div", { className: "list-card" }, periods.length ? [...periods].reverse().slice(0, 6).map((x) => el("div", { key: x.id, className: "row-li" }, el("span", { className: "flex-1" }, new Date(x.start + "T12:00").toLocaleDateString("en", { day: "numeric", month: "short" }) + (x.end ? " – " + new Date(x.end + "T12:00").toLocaleDateString("en", { day: "numeric", month: "short" }) : " – ongoing")), el("span", { className: "muted" }, x.end ? diffDays(x.end, x.start) + 1 + " days" : ""), el("button", { type: "button", className: "x-btn", "aria-label": "Delete period", onClick: () => A.delPeriod(x.id) }, "\xD7")))
        : el("div", { className: "empty-li" }, "Log when your period starts and ends. Predictions get better with each cycle.")),
      el("p", { className: "muted text-[11.5px]" }, "Private to you: stored in your own space, not visible to anyone the island is shared with. Predictions are estimates from your history, not medical advice or contraception."));
    return el(zt, { title: "Health Centre", sub: "Steps, calories and cycle \xB7 private to you", color: "#5CB88A", icon: el("span", { style: { color: "#fff", fontSize: 20, fontWeight: 700 } }, "+"), onClose: close },
      bld && el("div", { className: "site-banner" }, el("b", null, "Under construction"), el("span", null, "Log your steps, a meal or your cycle to open the Health Centre.")),
      el("div", { className: "seg", role: "tablist" }, [["today", "Today"], ["calories", "Calories"], ["cycle", "Cycle"]].map(([k, lb]) => el("button", { key: k, type: "button", role: "tab", "aria-selected": tab === k, className: "seg-b" + (tab === k ? " on" : ""), onClick: () => setTab(k) }, lb))),
      tab === "today" ? todayTab : tab === "calories" ? calTab : cycTab);
  }
  /* ---------------- Bank: budget planner, spending, bills, savings goals ---------------- */
  var SAVE_KINDS = [
    { id: "holiday", label: "Holiday", icon: "✈", grows: "An airport: the plane loads up as you save" },
    { id: "house", label: "House", icon: "⌂", grows: "Your dream house rises floor by floor" },
    { id: "car", label: "Car", icon: "⛟", grows: "A dealership: your car gets built in the showroom" },
    { id: "emergency", label: "Emergency fund", icon: "☂", grows: "A vault in the bank that fills up" },
    { id: "general", label: "Something else", icon: "★", grows: "A vault in the bank that fills up" },
  ];
  var BUDGET_DEFAULT = { income: [{ id: "i1", name: "Salary", amount: 0 }], cats: [
    { id: "home", name: "Rent / bond", planned: 0 }, { id: "food", name: "Groceries", planned: 0 }, { id: "transport", name: "Transport", planned: 0 },
    { id: "bills", name: "Utilities & phone", planned: 0 }, { id: "subs", name: "Subscriptions", planned: 0 }, { id: "fun", name: "Eating out & fun", planned: 0 },
    { id: "giving", name: "Giving", planned: 0 }, { id: "other", name: "Other", planned: 0 } ] };
  var money = (v) => "R" + Math.round(Number(v) || 0).toLocaleString("en-ZA").replace(/,/g, " ");
  var monthKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  function BankDrawer({ building: bld, plan: pl, spend: sp, bills: bl, savings: sv, business: biz, tab: t0, focus: fg, onClose: close, act: A }) {
    let [tab, setTab] = React.useState(t0 || "overview"),
      plan = pl || BUDGET_DEFAULT,
      mk = monthKey(),
      mine = (sp || []).filter((x) => (x.d || "").slice(0, 7) === mk),
      spentBy = {},
      [q, setQ] = React.useState({ amount: "", cat: (plan.cats[0] || {}).id, note: "" }),
      [nb, setNb] = React.useState({ name: "", amount: "", day: "1" }),
      [ng, setNg] = React.useState({ name: "", kind: "holiday", target: "" }),
      [dep, setDep] = React.useState({}),
      [editPlan, setEditPlan] = React.useState(null);
    mine.forEach((x) => (spentBy[x.cat] = (spentBy[x.cat] || 0) + (Number(x.amount) || 0)));
    let income = plan.income.reduce((a, x) => a + (Number(x.amount) || 0), 0) + (biz || 0),
      planned = plan.cats.reduce((a, x) => a + (Number(x.planned) || 0), 0),
      spent = mine.reduce((a, x) => a + (Number(x.amount) || 0), 0),
      day = new Date().getDate(), dim = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
      pace = planned ? (spent / planned) / (day / dim) : 0,
      maxBar = Math.max(1, ...plan.cats.map((c) => Math.max(Number(c.planned) || 0, spentBy[c.id] || 0))),
      el = React.createElement,
      numInp = (v, f, ph) => el("input", { className: "inp", inputMode: "decimal", value: v, placeholder: ph || "0", onChange: (e) => f(e.target.value.replace(/[^0-9.]/g, "")) });
    let overview = el("div", { className: "space-y-3 mt-3" },
      el("div", { className: "grid grid-cols-3 gap-2" },
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, money(income)), el("div", { className: "stat-l" }, "Income")),
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, money(planned)), el("div", { className: "stat-l" }, "Planned")),
        el("div", { className: "stat" }, el("div", { className: "stat-v" }, money(spent)), el("div", { className: "stat-l" }, "Spent so far"))),
      biz > 0 && el("div", { className: "bank-note" }, "Includes ", el("b", null, money(biz)), " business income this month from won leads and the treasury."),
      planned > 0 && el("div", { className: "bank-note" + (pace > 1.05 ? " warn" : " good") },
        pace > 1.05 ? "⚠ Spending faster than planned: " + Math.round(pace * 100) + "% of the pace for day " + day + "." : "✔ On budget: you've used " + Math.round((spent / planned) * 100) + "% with " + (dim - day) + " days to go. Staying on budget earns XP.",
        income > 0 && " Left to plan: " + money(income - planned) + "."),
      el("div", { className: "chart-card" },
        el("div", { className: "flex items-center justify-between mb-2" }, el("b", { className: "text-[14px]" }, "Where the money went \xB7 " + new Date().toLocaleString("en", { month: "long" })), el("button", { type: "button", className: "link-btn", onClick: () => setEditPlan(JSON.parse(JSON.stringify(plan))) }, "Edit plan")),
        el("div", { className: "bars", role: "list" }, plan.cats.map((c) => {
          let pv = Number(c.planned) || 0, sv2 = spentBy[c.id] || 0, over = pv > 0 && sv2 > pv;
          return el("div", { key: c.id, className: "bar-row", role: "listitem", title: c.name + ": spent " + money(sv2) + (pv ? " of " + money(pv) + " planned" : " (no plan)") },
            el("span", { className: "bar-name" }, c.name),
            el("span", { className: "bar-track" },
              el("span", { className: "bar-fill" + (over ? " over" : ""), style: { width: (sv2 / maxBar) * 100 + "%" } }),
              pv > 0 && el("span", { className: "bar-plan", style: { left: (pv / maxBar) * 100 + "%" } })),
            el("span", { className: "bar-val tnum" }, over ? "⚠ " + money(sv2) : money(sv2), pv ? el("small", null, " / " + money(pv)) : null));
        })),
        el("div", { className: "bar-legend" }, el("span", { className: "lg-fill" }), "spent", el("span", { className: "lg-plan" }), "planned")),
      el("details", { className: "bank-table" }, el("summary", null, "Show as a table"),
        el("table", null, el("thead", null, el("tr", null, el("th", null, "Category"), el("th", null, "Planned"), el("th", null, "Spent"), el("th", null, "Left"))),
          el("tbody", null, plan.cats.map((c) => el("tr", { key: c.id }, el("td", null, c.name), el("td", null, money(c.planned)), el("td", null, money(spentBy[c.id] || 0)), el("td", null, money((Number(c.planned) || 0) - (spentBy[c.id] || 0)))))))));
    let spending = el("div", { className: "space-y-3 mt-3" },
      el("div", { className: "chart-card space-y-2" },
        el("b", { className: "text-[14px]" }, "Log a spend"),
        el("div", { className: "grid grid-cols-2 gap-2" }, numInp(q.amount, (v) => setQ({ ...q, amount: v }), "Amount (R)"), el("input", { className: "inp", value: q.note, placeholder: "What for? (optional)", onChange: (e) => setQ({ ...q, note: e.target.value }) })),
        el("div", { className: "flex flex-wrap gap-1.5" }, plan.cats.map((c) => el("button", { key: c.id, type: "button", className: "chip-btn sm" + (q.cat === c.id ? " on" : ""), "aria-pressed": q.cat === c.id, onClick: () => setQ({ ...q, cat: c.id }) }, c.name))),
        el(Q, { variant: "gold", disabled: !(Number(q.amount) > 0), onClick: () => { A.addSpend({ amount: Number(q.amount), cat: q.cat, note: q.note.trim() }); setQ({ ...q, amount: "", note: "" }); } }, "Add spend")),
      el("div", { className: "list-card" }, mine.length ? [...mine].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map((x) =>
        el("div", { key: x.id, className: "row-li" }, el("span", { className: "tnum", style: { minWidth: 76 } }, money(x.amount)), el("span", { className: "flex-1 min-w-0" }, ((plan.cats.find((c) => c.id === x.cat) || {}).name || "Other") + (x.note ? " \xB7 " + x.note : "")), el("span", { className: "muted" }, x.d.slice(5)), el("button", { type: "button", className: "x-btn", "aria-label": "Delete", onClick: () => A.delSpend(x.id) }, "\xD7")))
        : el("div", { className: "empty-li" }, "Nothing logged this month yet.")));
    let bills = el("div", { className: "space-y-3 mt-3" },
      el("div", { className: "list-card" }, (bl || []).length ? [...bl].sort((a, b) => a.day - b.day).map((b) => {
        let paid = b.paid && b.paid[mk], late = !paid && day > b.day, due = !paid && day === b.day;
        return el("div", { key: b.id, className: "row-li" },
          el("button", { type: "button", className: "q-check" + (paid ? " on" : ""), "aria-label": paid ? "Mark unpaid" : "Mark paid", onClick: () => A.toggleBill(b, mk) }, paid ? "✓" : ""),
          el("span", { className: "flex-1 min-w-0" }, el("b", null, b.name), el("span", { className: "muted" }, " \xB7 due on the " + b.day + ([, "st", "nd", "rd"][b.day % 10] && ![11, 12, 13].includes(b.day) ? [, "st", "nd", "rd"][b.day % 10] : "th"))),
          el("span", { className: "tnum" + (late ? " late" : due ? " due" : "") }, (late ? "⚠ late \xB7 " : due ? "today \xB7 " : "") + money(b.amount)),
          el("button", { type: "button", className: "x-btn", "aria-label": "Delete bill", onClick: () => A.delBill(b.id) }, "\xD7"));
      }) : el("div", { className: "empty-li" }, "No bills yet. Unpaid bills show up in Today's quests on their due day.")),
      el("div", { className: "chart-card space-y-2" }, el("b", { className: "text-[14px]" }, "Add a monthly bill"),
        el("div", { className: "grid grid-cols-3 gap-2" }, el("input", { className: "inp col-span-3", value: nb.name, placeholder: "e.g. Internet", onChange: (e) => setNb({ ...nb, name: e.target.value }) }), numInp(nb.amount, (v) => setNb({ ...nb, amount: v }), "Amount"),
          el("select", { className: "inp", value: nb.day, onChange: (e) => setNb({ ...nb, day: e.target.value }), "aria-label": "Due day" }, Array.from({ length: 31 }, (_, k) => el("option", { key: k, value: k + 1 }, "Day " + (k + 1)))),
          el(Q, { variant: "gold", disabled: !nb.name.trim() || !(Number(nb.amount) > 0), onClick: () => { A.addBill({ name: nb.name.trim(), amount: Number(nb.amount), day: Number(nb.day) }); setNb({ name: "", amount: "", day: "1" }); } }, "Add"))));
    let savings = el("div", { className: "space-y-3 mt-3" },
      (sv || []).map((g) => {
        let k = SAVE_KINDS.find((x) => x.id === g.kind) || SAVE_KINDS[4], pct = Math.min(1, (Number(g.saved) || 0) / (Number(g.target) || 1));
        return el("div", { key: g.id, className: "chart-card save-card" + (fg === g.id ? " focus" : "") },
          el("div", { className: "flex items-center gap-2" }, el("span", { className: "save-ico", "aria-hidden": "true" }, k.icon), el("b", { className: "flex-1 min-w-0" }, g.name), el("span", { className: "tnum muted" }, money(g.saved) + " / " + money(g.target))),
          el("div", { className: "save-bar", role: "progressbar", "aria-valuenow": Math.round(pct * 100), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": g.name }, el("span", { style: { width: pct * 100 + "%" } })),
          el("div", { className: "muted text-[12px]" }, pct >= 1 ? "🎉 Goal reached!" : Math.round(pct * 100) + "% \xB7 " + k.grows + "."),
          el("div", { className: "flex gap-2 mt-1" }, numInp(dep[g.id] || "", (v) => setDep({ ...dep, [g.id]: v }), "Add to it (R)"),
            el(Q, { variant: "gold", disabled: !(Number(dep[g.id]) > 0), onClick: () => { A.deposit(g, Number(dep[g.id])); setDep({ ...dep, [g.id]: "" }); } }, "Save"),
            el(Q, { variant: "ghost", onClick: () => A.delGoal(g) }, "Remove")));
      }),
      el("div", { className: "chart-card space-y-2" }, el("b", { className: "text-[14px]" }, "New savings goal"),
        el("div", { className: "flex flex-wrap gap-1.5" }, SAVE_KINDS.map((k) => el("button", { key: k.id, type: "button", className: "chip-btn sm" + (ng.kind === k.id ? " on" : ""), "aria-pressed": ng.kind === k.id, onClick: () => setNg({ ...ng, kind: k.id }) }, k.icon + " " + k.label))),
        el("div", { className: "muted text-[12px]" }, (SAVE_KINDS.find((k) => k.id === ng.kind) || {}).grows + "."),
        el("div", { className: "grid grid-cols-2 gap-2" }, el("input", { className: "inp", value: ng.name, placeholder: ng.kind === "holiday" ? "e.g. Bali 2027" : ng.kind === "car" ? "e.g. New bakkie" : ng.kind === "house" ? "e.g. First home deposit" : "Name", onChange: (e) => setNg({ ...ng, name: e.target.value }) }), numInp(ng.target, (v) => setNg({ ...ng, target: v }), "Target (R)")),
        el(Q, { variant: "gold", disabled: !ng.name.trim() || !(Number(ng.target) > 0), onClick: () => { A.addGoal({ name: ng.name.trim(), kind: ng.kind, target: Number(ng.target) }); setNg({ name: "", kind: "holiday", target: "" }); } }, "Create goal")));
    let planEditor = editPlan && el("div", { className: "space-y-3 mt-3" },
      el("div", { className: "chart-card space-y-2" }, el("b", { className: "text-[14px]" }, "Monthly income"),
        editPlan.income.map((x, i2) => el("div", { key: x.id, className: "grid grid-cols-2 gap-2" }, el("input", { className: "inp", value: x.name, onChange: (e) => { let n2 = { ...editPlan }; n2.income[i2].name = e.target.value; setEditPlan(n2); } }), numInp(String(x.amount || ""), (v) => { let n2 = { ...editPlan }; n2.income[i2].amount = Number(v) || 0; setEditPlan(n2); }))),
        el("button", { type: "button", className: "link-btn", onClick: () => setEditPlan({ ...editPlan, income: [...editPlan.income, { id: "i" + Date.now(), name: "Other income", amount: 0 }] }) }, "+ Add income")),
      el("div", { className: "chart-card space-y-2" }, el("b", { className: "text-[14px]" }, "Planned spending per month"),
        editPlan.cats.map((x, i2) => el("div", { key: x.id, className: "grid grid-cols-2 gap-2" }, el("input", { className: "inp", value: x.name, onChange: (e) => { let n2 = { ...editPlan }; n2.cats[i2].name = e.target.value; setEditPlan(n2); } }), numInp(String(x.planned || ""), (v) => { let n2 = { ...editPlan }; n2.cats[i2].planned = Number(v) || 0; setEditPlan(n2); }))),
        el("button", { type: "button", className: "link-btn", onClick: () => setEditPlan({ ...editPlan, cats: [...editPlan.cats, { id: "c" + Date.now(), name: "New category", planned: 0 }] }) }, "+ Add category")),
      el("div", { className: "flex gap-2 justify-end" }, el(Q, { variant: "ghost", onClick: () => setEditPlan(null) }, "Cancel"), el(Q, { variant: "gold", onClick: () => { A.savePlan(editPlan); setEditPlan(null); } }, "Save plan")));
    return el(zt, { title: "Bank", sub: "Budget planner \xB7 " + new Date().toLocaleString("en", { month: "long", year: "numeric" }), color: "#C9A227", icon: el("span", { style: { fontSize: 18, color: "#fff" } }, "R"), onClose: close },
      bld && el("div", { className: "site-banner" }, el("b", null, "Under construction"), el("span", null, "Set your monthly plan or log your first spend to open the bank.")),
      el("div", { className: "seg", role: "tablist" }, [["overview", "Budget"], ["spending", "Spending"], ["bills", "Bills"], ["savings", "Savings"]].map(([k, lb]) =>
        el("button", { key: k, type: "button", role: "tab", "aria-selected": tab === k, className: "seg-b" + (tab === k ? " on" : ""), onClick: () => (setTab(k), setEditPlan(null)) }, lb))),
      editPlan ? planEditor : tab === "overview" ? overview : tab === "spending" ? spending : tab === "bills" ? bills : savings);
  }
  var {
    useState: He,
    useEffect: at,
    useMemo: _t,
    useRef: Lt,
    useCallback: ds,
  } = React;
  // in the iPhone app the little sounds come with a tap you can feel
  window.LLPlatform && window.LLPlatform.native && ["tap", "pop", "coin", "level", "build"].forEach((k) => {
    let f = Fe[k];
    f && (Fe[k] = (...a) => { window.LLPlatform.haptic(k === "tap" ? "light" : k === "level" || k === "coin" ? "success" : "medium"); return f(...a); });
  });
  function jo() {
    let [e, t] = He({ db: void 0, live: !1 }),
      [sb, setSb] = He(null); // sandbox: an empty, unsaved island to try the new-player start
    let out = sb ? { db: sb, live: !1, sandbox: !0 } : { ...e, sandbox: !1 };
    out.setSandbox = (on) => setSb(on ? an(null) : null);
    return (
      at(() => {
        let s = !0;
        return (
          (async () => {
            let n = null;
            try {
              n =
                window.claude && window.claude.use
                  ? await window.claude.use("db")
                  : null;
            } catch {
              n = null;
            }
            s &&
              t(
                n
                  ? { db: n, live: !0 }
                  : { db: an(window.__VALLEY_SEED__), live: !1 },
              );
          })(),
          () => {
            s = !1;
          }
        );
      }, []),
      out
    );
  }
  function Ht(e, t) {
    let [s, n] = He(null);
    return (
      at(() => {
        if (e)
          return e.collection(t).onSnapshot(
            (o) => n(o.docs.map((i) => ({ ...i.data(), id: i.id }))),
            () => n((o) => o || []),
          );
      }, [e, t]),
      s
    );
  }
  function St(e, t) {
    let [s, n] = He(void 0);
    return (
      at(() => {
        if (e)
          return e.doc(t).onSnapshot(
            (o) => n(o.exists ? o.data() : null),
            () => n((o) => (o === void 0 ? null : o)),
          );
      }, [e, t]),
      s
    );
  }
  var On = (e, t) => {
      try {
        let s = localStorage.getItem(e);
        return s == null ? t : JSON.parse(s);
      } catch {
        return t;
      }
    },
    Rn = (e, t) => {
      try {
        localStorage.setItem(e, JSON.stringify(t));
      } catch {}
    };
  function qn() {
    return React.createElement(
      "svg",
      {
        width: "46",
        height: "46",
        viewBox: "0 0 46 46",
        "aria-hidden": "true",
      },
      React.createElement("circle", {
        cx: "23",
        cy: "23",
        r: "21",
        fill: "#FFE7B0",
        stroke: "#E9B949",
        strokeWidth: "2",
      }),
      React.createElement("circle", {
        cx: "29",
        cy: "16",
        r: "6",
        fill: "#F7A441",
      }),
      React.createElement("path", {
        d: "M4 30c5-2 10 2 19 0s14-2 19 0v4a19 19 0 0 1-38 0z",
        fill: "#3FB8C0",
      }),
      React.createElement("path", {
        d: "M9 30c3-6 9-8 14-8s10 2 13 8z",
        fill: "#8CC084",
      }),
      React.createElement("path", {
        d: "M17 24c0-5 1-9 3-11M20 13c-3-1-6 0-7 2M20 13c2-2 5-2 6 0M20 13c-1-2-3-3-5-3",
        stroke: "#5B7F3A",
        strokeWidth: "1.6",
        fill: "none",
        strokeLinecap: "round",
      }),
      React.createElement("path", {
        d: "M6 34c4 1 7 1 10 0s6-1 9 0 7 1 10 0",
        stroke: "#E8FFFB",
        strokeWidth: "1.3",
        fill: "none",
        strokeLinecap: "round",
      }),
    );
  }
  function Xt({ icon: e, label: t, onClick: s, active: n, badge: o }) {
    return React.createElement(
      "button",
      {
        type: "button",
        className: "dock-btn" + (n ? " on" : ""),
        onClick: s,
        "aria-pressed": !!n,
      },
      React.createElement(
        "span",
        { className: "dock-ico" },
        e,
        o > 0 && React.createElement("span", { className: "dock-badge" }, o),
      ),
      React.createElement("span", { className: "dock-l" }, t),
    );
  }
  function _o({
    open: e,
    setOpen: t,
    quests: s,
    habitsDone: n,
    secById: o,
    onToggle: i,
    onHabits: l,
    onEdit: d,
    noHabits: nh,
    extra: ex = [],
  }) {
    let p = s.filter((c) => c.status === "done").length + (n && !nh ? 1 : 0),
      u = s.length + (nh ? 0 : 1) + ex.length;
    return React.createElement(
      "section",
      {
        className: "quests hud-card" + (e ? "" : " closed"),
        "aria-label": "Today's quests",
      },
      React.createElement(
        "button",
        {
          type: "button",
          className: "quests-head",
          onClick: () => t(!e),
          "aria-expanded": e,
        },
        React.createElement(
          "span",
          { className: "q-ico" },
          React.createElement(Ts, { size: 16 }),
        ),
        React.createElement("span", { className: "q-title" }, "Today's quests"),
        React.createElement("span", { className: "q-count tnum" }, p, "/", u),
        React.createElement(Is, {
          size: 16,
          style: {
            transform: e ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          },
        }),
      ),
      e &&
        React.createElement(
          "div",
          { className: "quests-body" },
          s.map((c) => {
            let r = o[c.venture] || { name: "\u2014", color: "#999" },
              y = c.status === "done";
            return React.createElement(
              "div",
              { key: c.id, className: "quest" + (y ? " done" : "") },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "q-check",
                  onClick: () => i(c),
                  "aria-label": y ? "Undo quest" : "Complete quest",
                },
                y && React.createElement(jt, { size: 13 }),
              ),
              React.createElement(
                "button",
                { type: "button", className: "q-text", onClick: () => d(c) },
                React.createElement("span", { className: "q-name" }, c.title),
                React.createElement(
                  "span",
                  { className: "q-meta" },
                  React.createElement("span", {
                    className: "gdot",
                    style: { background: r.color },
                  }),
                  r.name,
                  " \xB7 +",
                  bt(c),
                  " XP",
                ),
              ),
            );
          }),
          ex.map((x2) => React.createElement("div", { key: x2.id, className: "quest" },
            React.createElement("button", { type: "button", className: "q-check", "aria-label": "Mark " + x2.title + " done", onClick: x2.onToggle }),
            React.createElement("div", { className: "q-text" }, React.createElement("span", { className: "q-name" }, x2.title), React.createElement("span", { className: "q-meta" }, React.createElement("span", { className: "gdot", style: { background: "#C9A227" } }), x2.meta)))),
          nh && !s.length && !ex.length && React.createElement("div", { className: "quest-empty" }, "Nothing due today. Tap an empty plot to build something new."),
          !nh && React.createElement(
            "div",
            { className: "quest" + (n ? " done" : "") },
            React.createElement(
              "button",
              {
                type: "button",
                className: "q-check",
                onClick: l,
                "aria-label": "Open habits",
              },
              n && React.createElement(jt, { size: 13 }),
            ),
            React.createElement(
              "button",
              { type: "button", className: "q-text", onClick: l },
              React.createElement(
                "span",
                { className: "q-name" },
                wt.length > 3 ? "Tick your " + wt.length + " daily habits" : "Tick water, steps and sleep",
              ),
              React.createElement(
                "span",
                { className: "q-meta" },
                React.createElement("span", {
                  className: "gdot",
                  style: { background: "#F08A4B" },
                }),
                "Fitness \xB7 keeps the streak alive",
              ),
            ),
          ),
        ),
    );
  }
  function Ho() {
    let { db: e, live: t, sandbox: sandbox, setSandbox: setSandbox } = jo(),
      isl = St(e, "settings/island"),
      // private health space: the viewer's own subtree when we know who they are
      [uid, setUid] = He(void 0),
      hBase = !t || sandbox ? "data/users/local" : uid === void 0 ? null : uid ? "data/users/" + uid : "healthdata",
      hDays = Ht(hBase ? e : null, (hBase || "x") + "/health/days"),
      hCycle = Ht(hBase ? e : null, (hBase || "x") + "/health/cycle"),
      hCfg = St(hBase ? e : null, (hBase || "x") + "/healthcfg"),
      budgetDoc = St(e, "budget/plan"),
      focusDoc = St(e, "stats/focus"),
      habitsDoc = St(e, "habits/list"),
      journalC = Ht(e, "journal"),
      videosC = Ht(e, "videos"),
      spendC = Ht(e, "spend"),
      billsC = Ht(e, "bills"),
      savingsC = Ht(e, "savings"),
      s = Ht(e, "tasks"),
      n = Ht(e, "workers"),
      o = Ht(e, "leads"),
      i = Ht(e, "sections"),
      l = Ht(e, "pgoals"),
      d = St(e, "fitness/profile"),
      p = St(e, "fitness/weights"),
      u = St(e, "fitness/workouts"),
      c = St(e, "fitness/habits"),
      r = St(e, "stats/activity"),
      y = St(e, "stats/treasury"),
      k = s !== null && n !== null && o !== null && i !== null && isl !== void 0,
      [f, w] = He(!1),
      [v, $] = He(null),
      [E, M] = He(null),
      [N, P] = He(() => On("valley-sound", !1)),
      [he, R] = He([]),
      [K, de] = He(null),
      [we, ee] = He(null),
      [ce, $e] = He(() => On("valley-quests", window.innerWidth >= 900)),
      [lightMode, setLightMode] = He(() => On("valley-light", "auto")),
      [crewCard, setCrewCard] = He(null),
      [editing, setEditing] = He(!1),
      [focus, setFocus] = He(null),
      [flyTo, setFlyTo] = He(null),
      [editSel, setEditSel] = He(null),
      [, setCrewTick] = He(0),
      [z, ne] = He(!0),
      fe = Lt(null);
    (at(() => {
      Rn("valley-quests", ce);
    }, [ce]),
      at(() => {
        Rn("valley-light", lightMode);
      }, [lightMode]),
      at(() => {
        if (!crewCard) return;
        let a = setInterval(() => setCrewTick((g) => g + 1), 1e3);
        return () => clearInterval(a);
      }, [crewCard]),
      at(() => {
        let a = setTimeout(() => ne(!1), 9e3);
        return () => clearTimeout(a);
      }, []));
    // custom habits join the built-in three wherever habits are counted
    wt.splice(WT_BASE.length, wt.length, ...((habitsDoc && habitsDoc.items) || []));
    let xe = s || [],
      // "classic": the full sample island. "fresh": only what the player has built.
      // No settings yet: an island with any data stays classic; an empty one starts onboarding.
      hasData = !!((s && s.length) || (n && n.length) || (o && o.length) || (i && i.length) || (l && l.length)),
      islMode = isl ? isl.mode : sandbox || (t && !hasData) ? "new" : "classic",
      fresh = islMode !== "classic",
      lmOf = (p) => (CATALOG.find((c) => c.type === p.type) || {}).id || (p.type === "section" ? p.id : null),
      // a venture opens once something has been finished there (its first task, or its tool's first use)
      doneBy = (() => {
        let m = {};
        (s || []).forEach((t2) => t2.status === "done" && (m[t2.venture] = (m[t2.venture] || 0) + 1));
        ((u && u.entries) || []).length && (m.fitness = (m.fitness || 0) + 1);
        (l || []).length && (m.goals = (m.goals || 0) + 1);
        ((hDays || []).length || (hCycle || []).length) && (m.health = (m.health || 0) + 1);
        (budgetDoc || (spendC || []).length || (billsC || []).length || (savingsC || []).length) && (m.bank = (m.bank || 0) + 1);
        return m;
      })(),
      // pre-layout fresh islands (a 'built' map) get packed into a layout on the fly
      baseLayout = fresh
        ? (isl && isl.layout) || (() => {
            let b2 = (isl && isl.built) || {}, types = Object.keys(b2).map((id) => (CATALOG.find((c) => c.id === id) || {}).type).filter((t2) => t2 && t2 !== "epcm");
            return { seed: 7, work: !!b2.epcm, workInfo: b2.epcm, parcels: World.freshParcels(types).map((p) => ({ ...p, ...(b2[lmOf(p)] || {}) })) };
          })()
        : (isl && isl.layout) || { classic: !0, moves: {}, extra: [] },
      extraParcels = (fresh ? baseLayout.parcels : baseLayout.extra) || [],
      ventureP = extraParcels.filter((p) => lmOf(p) && p.type !== "marina" && p.type !== "section"),
      buildingIds = new Set(extraParcels.filter((p) => p.status === "building" && lmOf(p) && !doneBy[lmOf(p)]).map(lmOf)),
      hasVenture = (id) => (fresh ? id === "personal" || extraParcels.some((p) => lmOf(p) === id) || (id === "epcm" && baseLayout.work) : !0) || extraParcels.some((p) => lmOf(p) === id),
      C = o || [],
      G = [...(l || [])].sort(
        (a, g) => (a.createdAt || 0) - (g.createdAt || 0),
      ),
      Ce = _t(
        () =>
          n && n.length
            ? [...n].sort((a, g) =>
                a.kind === g.kind ? 0 : a.kind === "human" ? -1 : 1,
              )
            : fresh
              ? [{ id: "me", name: (isl && isl.owner) || "You", kind: "human", color: "#2A9D8F" }]
              : ks,
        [n, fresh, isl && isl.owner],
      ),
      Qe = _t(() => Object.fromEntries(Ce.map((a) => [a.id, a])), [Ce]),
      pe = _t(
        () =>
          [...(i || [])]
            .sort((a, g) => a.slot - g.slot)
            .map((a) => ({ ...a })),
        [i],
      ),
      QsL = (() => {
        let fromP = (p) => { let id = lmOf(p), base = Qs.find((q) => q.id === id) || EXTRA_Q[id] || {}; return { ...base, id, name: p.name || base.name, sub: p.sub || base.sub, color: p.color || base.color, style: p.style, building: buildingIds.has(id) }; };
        return fresh
          ? [Qs.find((q) => q.id === "personal"), ...ventureP.filter((p) => lmOf(p) !== "personal").map(fromP), ...(baseLayout.work ? [{ ...Qs.find((q) => q.id === "epcm"), ...(baseLayout.workInfo || {}) }] : [])]
          : [...Qs, ...ventureP.filter((p) => !Qs.some((q) => q.id === lmOf(p))).map(fromP)];
      })(),
      planKey = JSON.stringify([fresh, baseLayout, [...buildingIds]]),
      planL = _t(() => {
        let st = (p) => ({ ...p, status: buildingIds.has(lmOf(p)) ? "building" : "open" });
        if (fresh) return World.layoutPlan({ ...baseLayout, parcels: baseLayout.parcels.map(st) });
        let cp = World.classicPlan();
        cp.parcels.forEach((p) => { let m = baseLayout.moves && baseLayout.moves[p.id]; m && m.at && ((p.at = m.at), (p.rot = m.rot || 0)); });
        cp.parcels = cp.parcels.filter((p) => !(baseLayout.moves && baseLayout.moves[p.id] && baseLayout.moves[p.id].removed));
        (baseLayout.extra || []).forEach((p) => cp.parcels.push(st(p)));
        return cp;
      }, [planKey]),
      Ge = _t(
        () => [...QsL, ...pe.map((a) => ({ ...a, plot: Us(a.slot), building: buildingIds.has(a.id) }))],
        [pe, QsL.map((a) => a.id + a.name + a.color + a.building).join("|"), [...buildingIds].join(",")],
      ),
      te = _t(() => Object.fromEntries(Ge.map((a) => [a.id, a])), [Ge]),
      ue = Be(),
      j = Zt(ue),
      _ = (p == null ? void 0 : p.entries) || [],
      Z = (u == null ? void 0 : u.entries) || [],
      Ae = (c == null ? void 0 : c.days) || {},
      De = { weeklyTarget: 4, ...(d || {}) },
      h = { target: 2e5, entries: [], ...(y || {}) },
      x = C.filter((a) => a.stage === "won" && Zt(a.wonAt || "") === j),
      A = (h.entries || []).filter((a) => Zt(a.d) === j),
      B =
        x.reduce((a, g) => a + (Number(g.value) || 0), 0) +
        A.reduce((a, g) => a + (Number(g.amount) || 0), 0),
      H = Math.min(1, B / (h.target || 2e5)),
      se = {};
    (Ge.forEach((a) => {
      se[a.id] = 0;
    }),
      xe.forEach((a) => {
        a.status === "done" &&
          se[a.venture] != null &&
          (se[a.venture] += bt(a));
      }));
    let ke = Object.values(Ae).reduce(
      (a, g) => a + wt.filter((F) => g && g[F.id]).length,
      0,
    );
    ((focusDoc && focusDoc.sessions) || []).forEach((f2) => se[f2.venture] != null && (se[f2.venture] += 8)),
    se.health != null && (se.health += (hDays || []).length * 3 + (hCycle || []).length * 5),
    (se.bank != null && (se.bank += (spendC || []).length * 2 + (billsC || []).reduce((a2, b2) => a2 + Object.keys(b2.paid || {}).length * 5, 0) + (savingsC || []).reduce((a2, g2) => a2 + ((g2.log || []).length) * 5, 0) + (budgetDoc ? 20 : 0)),
      se.fitness != null && (se.fitness += Z.length * 15 + _.length * 5 + ke * 3),
      se.goals != null && (se.goals += G.filter((a) => a.progress >= 100).length * 40));
    let Ee = C.filter((a) => a.stage === "won").length,
      be = Object.fromEntries(Object.entries(se).map(([a, g]) => [a, ws(g)])),
      Oe = H >= 0.66 ? 3 : H >= 0.33 ? 2 : 1,
      je = ws(Object.values(se).reduce((a, g) => a + g, 0) + Ee * 40, 60),
      townL = _t(
        () => World.buildTown({ sections: fresh ? [] : pe, islandLevel: je.level, plan: planL }),
        [pe.map((a) => [a.id, a.slot, a.kind, a.color, a.name].join(":")).join("|"), je.level, planKey],
      ),
      { streak: Ve, activeToday: Xe } = sn(r == null ? void 0 : r.days),
      Ye = nn(xe, ue),
      Ue = wt.every((a) => Ae[ue] && Ae[ue][a.id]),
      it = xe.filter((a) => a.status !== "done").length,
      Ke = C.filter((a) => a.stage === "new"),
      q = C.filter((a) => a.stage === "qualifying" || a.stage === "quoted"),
      I = (a) => {
        let g = xt(a);
        return g != null && g <= 1;
      },
      W = Lt(null),
      V = (a) =>
        (W.current && pe.some((g) => g.id === a) && !W.current.has(a)) ||
        (K && K.id === a),
      Me = [];
    Ge.forEach((a) => {
      if (V(a.id)) return;
      let g = xe.filter((Ne) => Ne.venture === a.id),
        F = g.filter((Ne) => Ne.status !== "done").length,
        S = g.some((Ne) => Ne.status !== "done" && Ne.due && I(Ne.due)),
        X = be[a.id],
        Je = a.id === "goals" ? Oe : X.tier,
        Pt = [
          ...new Set(
            g.filter((Ne) => Ne.status !== "done").map((Ne) => Ne.assignee),
          ),
        ]
          .map((Ne) => Qe[Ne])
          .filter(Boolean),
        Kt = a.id === "goals" ? { progress: Math.round(H * 100) / 100 } : null;
      Me.push({
        id: a.id,
        kind: a.kind,
        name: a.building ? a.name + " \xB7 building" : a.name,
        color: a.color,
        x: (townL.plots[a.id] || { sx: 0 }).sx,
        y: (townL.plots[a.id] || { sy: 0 }).sy,
        tier: Je,
        level: X.level,
        open: F,
        alert: S,
        crew: Pt,
        data: Kt,
        sig: JSON.stringify([
          a.name,
          a.color,
          a.kind,
          Je,
          X.level,
          F,
          S,
          Pt.map((Ne) => Ne.id + Ne.color),
          Kt,
        ]),
      });
    });
    let lt = {
        containers: q.map((a) => (kt[a.type] || {}).color || "#C9A227"),
        won: Ee,
      },
      gt = {
        ships: Ke.map((a) => ({
          id: a.id,
          title: a.title,
          color: (kt[a.type] || {}).color || "#1F7A8C",
        })),
      },
      Tt = q.some((a) => a.deadline && I(a.deadline) && xt(a.deadline) >= 0),
      It = Ke.some((a) => a.deadline && I(a.deadline) && xt(a.deadline) >= 0);
    (townL.plots.hub && Me.push({
      id: "hub",
      kind: "hub",
      name: Se.hub.name,
      color: Se.hub.color,
      x: townL.plots.hub.sx,
      y: townL.plots.hub.sy,
      tier: 1,
      level: q.length,
      open: 0,
      alert: Tt,
      crew: [],
      data: lt,
      sig: JSON.stringify(["hub", lt, Tt]),
    }),
      townL.plots.port && Me.push({
        id: "port",
        kind: "port",
        name: Se.port.name,
        color: Se.port.color,
        x: townL.plots.port.sx,
        y: townL.plots.port.sy,
        tier: 1,
        level: Ke.length,
        open: 0,
        alert: It,
        crew: [],
        data: gt,
        sig: JSON.stringify(["port", gt, It]),
      }),
      townL.plots.marina && Me.push({
        id: "marina",
        kind: "port",
        name: ((extraParcels.find((p) => p.type === "marina") || {}).name) || "Marina",
        color: ((extraParcels.find((p) => p.type === "marina") || {}).color) || "#2A9D8F",
        x: townL.plots.marina.sx,
        y: townL.plots.marina.sy,
        tier: 1,
        level: Ke.filter((a) => a.type !== "tender").length,
        open: 0,
        alert: !1,
        crew: [],
        data: null,
        sig: "marina",
      }),
      Me.forEach((a) => {
        a.id === "port" && (a.name = "Tender Port", a.level = Ke.filter((g) => g.type === "tender").length);
      }),
      (savingsC || []).forEach((g2) => {
        let o2 = townL.plots["sv:" + g2.id], pct = Math.min(1, (Number(g2.saved) || 0) / (Number(g2.target) || 1));
        o2 && Me.push({ id: "sv:" + g2.id, kind: "saving", name: g2.name, color: "#C9A227", x: o2.sx, y: o2.sy, tier: 1, level: Math.round(pct * 100) + "%", open: 0, alert: !1, crew: [], data: { progress: pct, bar: pct }, sig: "sv" + g2.id + pct + g2.name });
      }),
      0,
      0);
    let
      Ps = Object.fromEntries(Me.map((a) => [a.id, a])),
      Os = (a) => {
        var g;
        return (
          Ps[a] || ((g = te[a]) == null ? void 0 : g.plot) || { x: 0, y: 0 }
        );
      },
      Re = ds((a, g = "info") => {
        let F = Math.random().toString(36).slice(2);
        (R((S) => [...S.slice(-2), { id: F, text: a, tone: g }]),
          setTimeout(() => R((S) => S.filter((X) => X.id !== F)), 3600));
      }, []),
      ps = (a, g = -70) => {
        var X;
        let F = Os(a),
          S = (X = fe.current) == null ? void 0 : X.toScreen(F.x, F.y + g);
        return !S ||
          S.x < 0 ||
          S.y < 0 ||
          S.x > window.innerWidth ||
          S.y > window.innerHeight
          ? { x: window.innerWidth / 2, y: window.innerHeight * 0.4 }
          : S;
      },
      Rs = Lt({}),
      qs = ds(
        (a) => {
          let g = a && a.code;
          g === "invalid_argument"
            ? w(!0)
            : g === "quota_exceeded"
              ? Re(
                  "Storage is full. Delete a few old items and try again.",
                  "bad",
                )
              : g === "resource_exhausted"
                ? Re(
                    "Easy there. Saving is catching up, try again in a moment.",
                    "bad",
                  )
                : g && Re("That change did not save. Try again.", "bad");
        },
        [Re],
      ),
      U = ds(
        (a, g) => {
          let F = (Rs.current[a] || Promise.resolve()).then(g).catch(qs);
          return ((Rs.current[a] = F), F);
        },
        [qs],
      ),
      qe = Lt({});
    qe.current = {
      activity: r,
      weightsD: p,
      workoutsD: u,
      habitsD: c,
      treasuryD: y,
      profileD: d,
    };
    let Dt = () =>
        U("stats/activity", async () => {
          let a = qe.current.activity,
            g = Be(),
            F = ((a && a.days && a.days[g]) || 0) + 1;
          a
            ? await e.doc("stats/activity").update({ days: { [g]: F } })
            : await e.doc("stats/activity").set({ days: { [g]: F } });
        }),
      Et = (a, g, F, S) => {
        let X = ps(a);
        (ln(X.x, X.y, g, F),
          Jt(X.x, X.y + 10, S ? void 0 : [F, "#FFF8EC", "#E9B949"]));
      },
      Gs = (a) => {
        (Et(a.venture, `+${bt(a)} XP`, "#E9B949"), Fe.pop(), Dt());
      },
      Gn = (a) => {
        M(null);
        let g = a.id || Ze("t"),
          F = xe.find((X) => X.id === g),
          S = {
            id: g,
            title: a.title.trim(),
            notes: a.notes || "",
            venture: a.venture,
            worktype: a.worktype,
            assignee: a.assignee,
            status: a.status,
            priority: a.priority,
            due: a.due || "",
            repeat: a.repeat || "",
            ...(a.repeat === "weekly" ? { repeatDay: a.repeatDay != null ? a.repeatDay : new Date().getDay() } : {}),
            createdAt: a.createdAt || Date.now(),
            updatedAt: Date.now(),
            doneAt:
              a.status === "done"
                ? F && F.status === "done"
                  ? F.doneAt || Be()
                  : Be()
                : "",
          };
        (U("tasks/" + g, () => e.collection("tasks").doc(g).set(S)),
          S.status === "done" && (!F || F.status !== "done")
            ? Gs(S)
            : Fe.tap());
      },
      js = (a, g) => {
        (U("tasks/" + a.id, () =>
          e
            .collection("tasks")
            .doc(a.id)
            .update({
              status: g,
              updatedAt: Date.now(),
              doneAt: g === "done" ? Be() : "",
            }),
        ),
          g === "done" ? Gs(a) : Fe.tap());
      },
      Wt = {
        onToggle: (a) => js(a, a.status === "done" ? "todo" : "done"),
        onStart: (a) => js(a, "doing"),
        onEdit: (a) => M({ type: "task", init: a }),
        onDelete: (a) =>
          M({
            type: "confirm",
            text: `Delete \u201C${a.title}\u201D? This can't be undone.`,
            onYes: () => {
              (M(null),
                U("tasks/" + a.id, () =>
                  e.collection("tasks").doc(a.id).delete(),
                ));
            },
          }),
      },
      Yt = (a) =>
        M({
          type: "task",
          init: {
            venture: a || (v && v.type === "section" ? v.id : "personal"),
            assignee: "me",
          },
        }),
      _s = (a) => {
        (Fe.horn(),
          setTimeout(() => Fe.coin(), 350),
          Et("goals", a.value ? `+${Le(a.value, !0)}` : "Won!", "#E9A727", !0));
        let g = kt[a.type] || {},
          F = Ze("t");
        (U("tasks/" + F, () =>
          e
            .collection("tasks")
            .doc(F)
            .set({
              id: F,
              title: `Kick off: ${a.title}`,
              notes: `Won lead${a.client ? " from " + a.client : ""}${a.value ? " \xB7 " + Le(a.value) : ""}`,
              venture: a.venture || g.venture || "personal",
              worktype: g.worktype || "admin",
              assignee: "me",
              status: "todo",
              priority: "high",
              due: a.deadline && a.deadline >= Be() ? a.deadline : "",
              createdAt: Date.now(),
              updatedAt: Date.now(),
              doneAt: "",
            }),
        ),
          Re(
            `Won! ${a.title}${a.value ? " paid " + Le(a.value) + " into the treasury" : ""}`,
            "gold",
          ),
          Dt());
      },
      jn = (a) => {
        M(null);
        let g = a.id || Ze("l"),
          F = C.find((X) => X.id === g),
          S = {
            id: g,
            title: a.title.trim(),
            client: a.client || "",
            type: a.type,
            venture: a.venture,
            value: Number(a.value) || 0,
            deadline: a.deadline || "",
            stage: a.stage,
            notes: a.notes || "",
            createdAt: a.createdAt || Date.now(),
            updatedAt: Date.now(),
            wonAt: a.stage === "won" ? (F && F.wonAt ? F.wonAt : Be()) : "",
          };
        (U("leads/" + g, () => e.collection("leads").doc(g).set(S)),
          F || (Fe.horn(), Re(`A ship docked: ${S.title}`)),
          S.stage === "won" && (!F || F.stage !== "won") && _s(S));
      },
      _n = {
        onMove: (a, g) => {
          (U("leads/" + a.id, () =>
            e
              .collection("leads")
              .doc(a.id)
              .update({
                stage: g,
                updatedAt: Date.now(),
                wonAt: g === "won" ? Be() : "",
              }),
          ),
            g === "won"
              ? _s(a)
              : g === "lost"
                ? (Fe.tap(), Re("That ship sailed. On to the next one."))
                : Fe.pop());
        },
        onEdit: (a) => M({ type: "lead", init: a }),
        onDelete: (a) =>
          M({
            type: "confirm",
            text: `Delete the lead \u201C${a.title}\u201D?`,
            onYes: () => {
              (M(null),
                U("leads/" + a.id, () =>
                  e.collection("leads").doc(a.id).delete(),
                ));
            },
          }),
      },
      Hn = async (a) => {
        if (!n || !n.length)
          for (let S of fresh ? Ce.slice(0, 1) : ks)
            await U("workers/" + S.id, () =>
              e.collection("workers").doc(S.id).set(S),
            );
        let g = a.id || Ze("w"),
          F = a.color || vs[Ce.length % vs.length];
        U("workers/" + g, () =>
          e
            .collection("workers")
            .doc(g)
            .set({ id: g, name: a.name, kind: a.kind || "role", color: F }),
        );
      },
      Xn = (a) =>
        M({
          type: "confirm",
          text: `Remove ${a.name} from the crew? Their open tasks move to you.`,
          confirmLabel: "Remove",
          onYes: () => {
            (M(null),
              xe
                .filter((g) => g.assignee === a.id)
                .forEach((g) =>
                  U("tasks/" + g.id, () =>
                    e.collection("tasks").doc(g.id).update({ assignee: "me" }),
                  ),
                ),
              U("workers/" + a.id, () =>
                e.collection("workers").doc(a.id).delete(),
              ));
          },
        }),
      Yn = (a) => {
        (M(null), $(null));
        let g = new Set(pe.map((X) => X.slot)),
          F = 0;
        for (; g.has(F); ) F++;
        let S = "s_" + Date.now().toString(36);
        if (fresh) {
          let p2 = World.placeParcel(baseLayout.parcels, "section", { id: S, name: a.name.trim(), color: a.color, sKind: a.kind, status: "building" });
          p2 && (saveLayout({ ...baseLayout, parcels: [...baseLayout.parcels, { id: S, type: "section", at: p2.at, rot: p2.rot, name: a.name.trim(), color: a.color, sKind: a.kind, status: "building" }] }), setFlyTo({ parcel: S, t: performance.now() }));
        }
        U("sections/" + S, () =>
          e
            .collection("sections")
            .doc(S)
            .set({
              id: S,
              name: a.name.trim(),
              sub: a.sub.trim() || "New district",
              kind: a.kind,
              color: a.color,
              slot: F,
              createdAt: Date.now(),
            }),
        );
      },
      saveLayout = (lay) => U("settings/island", () => e.doc("settings/island").set({ ...(isl || { mode: fresh ? "fresh" : "classic" }), layout: lay })),
      onboard = (a) => {
        let me = { id: "me", name: a.owner, kind: "human", color: "#2A9D8F" },
          picks = a.mode === "fresh" ? a.picks.filter((t2) => t2 !== "epcm") : [],
          parcels = World.freshParcels(picks).map((p) => {
            let c = CATALOG.find((x) => x.type === p.type) || {};
            return c.group === "scenery" || p.type === "home" ? { ...p, id: p.type === "home" ? "home" : p.type + ":" + Math.random().toString(36).slice(2, 7) } : { ...p, name: c.name, sub: c.sub, color: c.color, status: "building", ...(p.type === "faith" ? { style: a.faith } : {}) };
          }),
          lay = a.mode === "fresh" ? { seed: (Math.random() * 1e6) | 0, parcels, work: a.picks.includes("epcm") } : null;
        U("settings/island", () => e.doc("settings/island").set({ mode: a.mode, owner: a.owner, islandName: a.islandName, createdAt: Date.now(), ...(lay ? { layout: lay } : {}) }));
        (a.mode === "classic" ? ks.map((w) => (w.id === "me" ? me : w)) : [me]).forEach((w) =>
          U("workers/" + w.id, () => e.collection("workers").doc(w.id).set(w)));
        Re(a.mode === "classic" ? "Welcome to the sample island, " + a.owner + "." : "Welcome home, " + a.owner + ". Tap a building site to give it its first task.", "gold");
      },
      buildVenture = (type, a) => {
        let c = CATALOG.find((x) => x.type === type);
        if (!c) return;
        if (type === "section") return M({ type: "section" });
        M(null); $(null);
        if (c.work) {
          saveLayout({ ...baseLayout, work: !0, workInfo: { name: a.name, sub: a.sub, color: a.color } });
          setFlyTo({ parcel: "w:hq", t: performance.now() });
          Re(a.name + " is on its own island now, over the bridge.", "gold");
          return;
        }
        let parcels = fresh ? baseLayout.parcels : [...World.classicPlan().parcels.map((p) => { let m = baseLayout.moves && baseLayout.moves[p.id]; return m ? { ...p, ...m } : p; }), ...(baseLayout.extra || [])],
          p = World.placeParcel(parcels, type, {
            id: c.id || type + ":" + Math.random().toString(36).slice(2, 7),
            ...(c.group === "scenery" ? {} : { name: a.name, sub: a.sub, color: a.color, status: "building" }),
            ...(type === "faith" ? { style: a.faith } : {}),
          });
        if (!p) return Re("There's no room left that fits it. Try moving things in Edit layout.", "bad");
        let clean = { id: p.id, type: p.type, at: p.at, rot: p.rot, ...(p.name ? { name: p.name, sub: p.sub, color: p.color, status: p.status } : {}), ...(p.style ? { style: p.style } : {}) };
        saveLayout(fresh ? { ...baseLayout, parcels: [...baseLayout.parcels, clean] } : { ...baseLayout, extra: [...(baseLayout.extra || []), clean] });
        setFlyTo({ parcel: clean.id, t: performance.now() });
        if (a.crew) {
          let have = new Set((n || []).map((w) => w.id));
          [...(have.has("me") ? [] : [Ce[0] || { id: "me", name: "You", kind: "human", color: "#2A9D8F" }]), ...STUDIO_CREW.filter((w) => !have.has(w.id))].forEach((w) =>
            U("workers/" + w.id, () => e.collection("workers").doc(w.id).set(w)));
        }
        Fe.pop && Fe.pop();
        Re(c.group === "scenery" ? c.label + " placed." : a.name + ": building site ready. Finish its first task to open it." + (a.crew ? " The studio crew is waiting on the square." : ""), "gold");
      },
      doExport = async () => {
        try {
          let data = await exportIsland(e, hBase), nm = ((isl && isl.islandName) || "valley-isle").toLowerCase().replace(/[^a-z0-9]+/g, "-");
          await saveFile(nm + "-backup-" + ue + ".json", JSON.stringify(data, null, 1));
          Re("Backup ready.", "gold");
        } catch (er) { er && er.code === "declined" ? Re("Backup not saved.") : Re("Couldn't make the backup" + (er && er.message ? ": " + er.message : "."), "bad"); }
      },
      doImport = async (txt) => {
        let data;
        try { data = JSON.parse(txt); } catch { return Re("That file isn't a Valley Isle backup.", "bad"); }
        if (!data || data.app !== "valley-isle") return Re("That file isn't a Valley Isle backup.", "bad");
        let n2 = Object.values(data.collections || {}).reduce((a2, l2) => a2 + l2.length, 0);
        M({ type: "confirm", text: "Restore " + n2 + " items from " + (data.exportedAt || "").slice(0, 10) + "? Anything with the same id is replaced; nothing else is deleted.", confirmLabel: "Restore", onYes: async () => {
          M(null);
          for (let [c2, list] of Object.entries(data.collections || {})) if (BACKUP_COLS.includes(c2)) for (let d2 of list) d2 && d2.id && (await e.collection(c2).doc(String(d2.id)).set(d2));
          for (let [p2, d2] of Object.entries(data.docs || {})) BACKUP_DOCS.includes(p2) && (await e.doc(p2).set(d2));
          if (hBase && data.health) {
            for (let c2 of ["days", "cycle"]) for (let d2 of data.health[c2] || []) d2 && d2.id && (await e.collection(hBase + "/health/" + c2).doc(String(d2.id)).set(d2));
            data.health.cfg && (await e.doc(hBase + "/healthcfg").set(data.health.cfg));
          }
          Re("Backup restored.", "gold");
        } });
      },
      startFocus = (tk) => {
        setFocus({ task: tk, dur: 25 * 60, used: 0, since: Date.now(), paused: !1 });
        fe.current && fe.current.sendCrew && fe.current.sendCrew("me", tk.venture);
        Re("Focus started: " + tk.title + ". You head to " + ((te[tk.venture] || {}).name || "work") + ".", "gold");
      },
      finishFocus = () => {
        if (!focus) return;
        let sess = [...((focusDoc && focusDoc.sessions) || []), { d: ue, venture: focus.task.venture, task: focus.task.id, min: Math.round(focus.dur / 60) }];
        U("stats/focus", () => e.doc("stats/focus").set({ sessions: sess.slice(-500) }));
        Fe.level && Fe.level();
        Re("Focus session done: +8 XP for " + ((te[focus.task.venture] || {}).name || "that building") + ".", "gold");
        setFocus(null);
      },
      healthAct = (() => {
        let day = (hDays || []).find((x) => x.id === ue) || { id: ue, d: ue },
          dref = () => e.collection(hBase + "/health/days").doc(ue);
        return {
          setSteps: (n2, target) => {
            U("health/" + ue, () => dref().set({ ...day, steps: n2 }));
            if (n2 >= target && !(Ae[ue] && Ae[ue].steps)) { eo("steps", ue, !0); Re("Step goal reached, habit ticked.", "gold"); } else Re(n2.toLocaleString("en-ZA").replace(/,/g, " ") + " steps saved.");
          },
          addFood: (x2) => U("health/" + ue, () => dref().set({ ...day, kcal: [...(day.kcal || []), { id: Ze("fd"), ...x2 }] })),
          delFood: (id) => U("health/" + ue, () => dref().set({ ...day, kcal: (day.kcal || []).filter((x) => x.id !== id) })),
          setCfg: (c2) => U("healthcfg", () => e.doc(hBase + "/healthcfg").set(c2)),
          startPeriod: (d2, past) => { let id = Ze("pd"), pl = (hCfg && hCfg.periodLen) || 5, en = past ? [addDays(d2, pl - 1), ue].sort()[0] : null; U("cycle/" + id, () => e.collection(hBase + "/health/cycle").doc(id).set({ id, start: d2, end: en })); Re(past ? "Period logged." : "Period started. Tap 'Period ended' when it's over."); },
          endPeriod: (p2, d2) => U("cycle/" + p2.id, () => e.collection(hBase + "/health/cycle").doc(p2.id).set({ ...p2, end: d2 })),
          delPeriod: (id) => U("cycle/" + id, () => e.collection(hBase + "/health/cycle").doc(id).delete()),
          // Apple Health (iPhone app only): read steps, active energy, workouts and cycle into the
          // Health Centre. Read-only - nothing is ever written back to Apple Health.
          syncPhone: async (quiet) => {
            let H = window.LLPlatform && window.LLPlatform.health;
            if (!H || !hBase) return;
            try {
              if (!(await H.available())) return quiet || Re("Apple Health isn't available on this device.", "bad");
              await H.connect();
              let dly = await H.daily(14), wos = await H.workouts(14), flow = await H.cycle(240),
                keys = new Set([...Object.keys(dly.steps || {}), ...Object.keys(dly.activeKcal || {}), ...wos.map((w2) => w2.day)]), n3 = 0;
              for (let k2 of keys) {
                let cur = (hDays || []).find((x) => x.id === k2) || { id: k2, d: k2 },
                  nx = { ...cur, phone: { steps: (dly.steps || {})[k2] || 0, activeKcal: (dly.activeKcal || {})[k2] || 0, workouts: wos.filter((w2) => w2.day === k2).map((w2) => ({ id: w2.id, kind: w2.kind, minutes: w2.minutes, kcal: w2.kcal })), at: Date.now() } };
                // Health's step count wins unless you typed in more yourself
                (dly.steps || {})[k2] != null && (nx.steps = Math.max(Number(cur.steps) || 0, dly.steps[k2]));
                JSON.stringify(nx.phone.workouts) === JSON.stringify((cur.phone || {}).workouts) && nx.steps === cur.steps && (cur.phone || {}).activeKcal === nx.phone.activeKcal || (n3++, await e.collection(hBase + "/health/days").doc(k2).set(nx));
              }
              let target = (hCfg && hCfg.stepTarget) || 1e4, st2 = (dly.steps || {})[ue] || 0;
              st2 >= target && !(Ae[ue] && Ae[ue].steps) && eo("steps", ue, !0);
              // cycle: runs of flow days become periods, skipping any you've already logged
              let fd = [...new Set(flow.map((x) => x.day))].sort(), runs = [];
              fd.forEach((k2) => { let r2 = runs[runs.length - 1]; r2 && diffDays(k2, r2.end) <= 2 ? (r2.end = k2) : runs.push({ start: k2, end: k2 }); });
              let added = 0;
              for (let r2 of runs) {
                if ((hCycle || []).some((x) => Math.abs(diffDays(x.start, r2.start)) <= 4)) continue;
                let id = "ah-" + r2.start, open2 = diffDays(ue, r2.end) <= 1;
                await e.collection(hBase + "/health/cycle").doc(id).set({ id, start: r2.start, end: open2 ? null : r2.end, src: "apple-health" }); added++;
              }
              await e.doc(hBase + "/healthcfg").set({ ...(hCfg || {}), phone: !0, phoneSyncAt: Date.now() });
              quiet || Re("Apple Health synced: " + st2.toLocaleString("en-ZA").replace(/,/g, " ") + " steps today" + (wos.length ? ", " + wos.length + " workout" + (wos.length > 1 ? "s" : "") : "") + (added ? ", " + added + " period" + (added > 1 ? "s" : "") : "") + ".", "gold");
            } catch (er) { quiet || Re(/entitlement/i.test(String(er && er.message)) ? "Apple Health isn't available in this install (it needs the TestFlight / App Store version). Type your steps in for now." : "Couldn't read Apple Health" + (er && er.message ? ": " + er.message : "."), "bad"); }
          },
        };
      })(),
      // bank: every write goes through U so failures surface like everything else
      bankAct = {
        savePlan: (pl) => U("budget/plan", () => e.doc("budget/plan").set(pl)),
        addSpend: (x2) => { let id = Ze("sp"); U("spend/" + id, () => e.collection("spend").doc(id).set({ id, ...x2, d: ue, createdAt: Date.now() })); Fe.tap(); },
        delSpend: (id) => U("spend/" + id, () => e.collection("spend").doc(id).delete()),
        addBill: (x2) => { let id = Ze("bl"); U("bills/" + id, () => e.collection("bills").doc(id).set({ id, ...x2, paid: {}, createdAt: Date.now() })); },
        toggleBill: (b2, mk) => { let paid = { ...(b2.paid || {}) }; paid[mk] ? delete paid[mk] : (paid[mk] = Date.now()); U("bills/" + b2.id, () => e.collection("bills").doc(b2.id).set({ ...b2, paid })); paid[mk] && (Fe.pop && Fe.pop(), Re(b2.name + " paid.", "gold")); },
        delBill: (id) => U("bills/" + id, () => e.collection("bills").doc(id).delete()),
        addGoal: (g2) => {
          let id = Ze("sv"), type = { holiday: "airport", house: "dreamhouse", car: "dealership" }[g2.kind];
          U("savings/" + id, () => e.collection("savings").doc(id).set({ id, ...g2, saved: 0, log: [], createdAt: Date.now() }));
          if (type) {
            let all = fresh ? baseLayout.parcels : [...World.classicPlan().parcels.map((p2) => { let m2 = baseLayout.moves && baseLayout.moves[p2.id]; return m2 && m2.at ? { ...p2, ...m2 } : p2; }), ...(baseLayout.extra || [])],
              p2 = World.placeParcel(all, type, { id: "sv:" + id });
            p2 ? (saveLayout(fresh ? { ...baseLayout, parcels: [...baseLayout.parcels, { id: p2.id, type, at: p2.at, rot: p2.rot }] } : { ...baseLayout, extra: [...(baseLayout.extra || []), { id: p2.id, type, at: p2.at, rot: p2.rot }] }), $(null), setFlyTo({ parcel: p2.id, t: performance.now() }))
              : Re("No room on the island for it right now. Try Edit layout.", "bad");
            Re(g2.name + ": " + ({ airport: "an airport", dreamhouse: "a plot for your house", dealership: "a dealership" }[type]) + " is going up on the island.", "gold");
          }
        },
        deposit: (g2, amt) => {
          let saved = (Number(g2.saved) || 0) + amt, was = (Number(g2.saved) || 0) >= g2.target;
          U("savings/" + g2.id, () => e.collection("savings").doc(g2.id).set({ ...g2, saved, log: [...(g2.log || []), { d: ue, amount: amt }] }));
          Fe.pop && Fe.pop();
          !was && saved >= g2.target ? (Fe.level && Fe.level(), Re(g2.name + ": goal reached!", "gold")) : Re(money(amt) + " saved towards " + g2.name + ".", "gold");
        },
        delGoal: (g2) => {
          U("savings/" + g2.id, () => e.collection("savings").doc(g2.id).delete());
          let pid = "sv:" + g2.id;
          fresh ? baseLayout.parcels.some((p2) => p2.id === pid) && saveLayout({ ...baseLayout, parcels: baseLayout.parcels.filter((p2) => p2.id !== pid) })
            : (baseLayout.extra || []).some((p2) => p2.id === pid) && saveLayout({ ...baseLayout, extra: baseLayout.extra.filter((p2) => p2.id !== pid) });
        },
      },
      // layout editor: move / rotate / remove parcels and save them into the island's layout
      editParcels = planL.parcels.filter((p) => !p.auto).map((p) => ({ id: p.id, type: p.type, at: p.at, rot: p.rot || 0, shape: p.shape, harbour: p.harbour })),
      editMeta = Object.fromEntries(planL.parcels.map((p) => {
        let lm = lmOf(p) || (World.PARCELS[p.type] || {}).landmark, g = lm && te[lm], c = CATALOG.find((x) => x.type === p.type);
        return [p.id, { name: g ? g.name : c ? c.label : CLASSIC_LABEL[p.type] || p.type, color: (g && g.color) || (c && c.color) || "#9F98B8", scenery: !g && !["marina", "goals", "home"].includes(p.type) && !String(p.type).startsWith("cs:") }];
      })),
      applyEdit = (id, patch) => {
        if (fresh) return saveLayout({ ...baseLayout, parcels: baseLayout.parcels.map((p) => (p.id === id ? { ...p, ...patch } : p)).filter((p) => !patch.remove || p.id !== id) });
        if ((baseLayout.extra || []).some((p) => p.id === id)) return saveLayout({ ...baseLayout, extra: baseLayout.extra.map((p) => (p.id === id ? { ...p, ...patch } : p)).filter((p) => !patch.remove || p.id !== id) });
        let mv = { ...(baseLayout.moves || {}) };
        patch.remove ? (mv[id] = { ...(mv[id] || {}), removed: !0 }) : (mv[id] = { at: patch.at, rot: patch.rot || 0 });
        saveLayout({ ...baseLayout, classic: !0, moves: mv });
      },
      onEditMove = (id, at, rot) => (applyEdit(id, { at, rot }), Fe.tap()),
      rotateSel = () => {
        let p = editParcels.find((q) => q.id === editSel);
        if (!p) return;
        let moved = { ...p, rot: ((p.rot || 0) + 1) % 4 }, chk = World.checkPlan(editParcels.map((q) => (q.id === p.id ? moved : q)));
        chk.ok ? applyEdit(p.id, { at: p.at, rot: moved.rot }) : Re(chk.why || "It doesn't fit that way round.", "bad");
      },
      removeSel = () => {
        let p = editParcels.find((q) => q.id === editSel), rest = editParcels.filter((q) => q.id !== editSel), chk = World.checkPlan(rest);
        if (!p) return;
        if (!chk.ok) return Re("Removing that would cut the island in two.", "bad");
        applyEdit(p.id, { remove: !0 });
        setEditSel(null);
      },
      Kn = (a) => {
        let g = xe.filter((F) => F.venture === a.id);
        M({
          type: "confirm",
          text: `Remove ${a.name}${g.length ? ` and its ${g.length} task${g.length === 1 ? "" : "s"}` : ""}? Its land sinks back into the sea.`,
          confirmLabel: "Remove",
          onYes: () => {
            (M(null),
              $(null),
              g.forEach((F) =>
                U("tasks/" + F.id, () =>
                  e.collection("tasks").doc(F.id).delete(),
                ),
              ),
              U("sections/" + a.id, () =>
                e.collection("sections").doc(a.id).delete(),
              ));
          },
        });
      },
      us = (a) => {
        (Et("fitness", a, "#F08A4B"), Fe.pop(), Dt());
      },
      Zn = (a, g) =>
        U("fitness/weights", async () => {
          var S;
          let F =
            ((S = qe.current.weightsD) == null ? void 0 : S.entries) || [];
          await e
            .doc("fitness/weights")
            .set({
              entries: [...F.filter((X) => X.d !== g), { d: g, kg: a }].sort(
                (X, Je) => X.d.localeCompare(Je.d),
              ),
            });
        }).then(() => us("+5 XP")),
      Qn = (a) =>
        U("fitness/weights", () => {
          var g;
          return e
            .doc("fitness/weights")
            .set({
              entries: (
                ((g = qe.current.weightsD) == null ? void 0 : g.entries) || []
              ).filter((F) => F.d !== a),
            });
        }),
      Vn = (a) =>
        U("fitness/profile", () =>
          e
            .doc("fitness/profile")
            .set({ weeklyTarget: 4, ...(qe.current.profileD || {}), ...a }),
        ),
      Un = (a) =>
        U("fitness/workouts", () => {
          var g;
          return e
            .doc("fitness/workouts")
            .set({
              entries: [
                ...(((g = qe.current.workoutsD) == null ? void 0 : g.entries) ||
                  []),
                { id: Ze("wo"), ...a },
              ],
            });
        }).then(() => us("+15 XP")),
      Jn = (a) =>
        U("fitness/workouts", () => {
          var g;
          return e
            .doc("fitness/workouts")
            .set({
              entries: (
                ((g = qe.current.workoutsD) == null ? void 0 : g.entries) || []
              ).filter((F) => F.id !== a),
            });
        }),
      eo = (a, g, F) =>
        U("fitness/habits", async () => {
          qe.current.habitsD
            ? await e
                .doc("fitness/habits")
                .update({ days: { [g]: { [a]: F } } })
            : await e.doc("fitness/habits").set({ days: { [g]: { [a]: F } } });
        }).then(() => {
          if (!F) {
            Fe.tap();
            return;
          }
          let S = { ...(Ae[g] || {}), [a]: !0 };
          wt.every((X) => S[X.id])
            ? (Et("fitness", "Quest complete!", "#F08A4B", !0),
              Fe.level(),
              Dt(),
              Re("Daily habits done. Streak protected.", "gold"))
            : us("+3 XP");
        }),
      to = (a, g) =>
        U("stats/treasury", () => {
          var F;
          return e
            .doc("stats/treasury")
            .set({
              target: 2e5,
              ...(qe.current.treasuryD || {}),
              entries: [
                ...(((F = qe.current.treasuryD) == null ? void 0 : F.entries) ||
                  []),
                { id: Ze("i"), d: Be(), amount: a, note: g || "" },
              ],
            });
        }).then(() => {
          (Et("goals", "+" + Le(a, !0), "#E9A727", !0), Fe.coin(), Dt());
        }),
      so = (a) =>
        U("stats/treasury", () => {
          var g;
          return e
            .doc("stats/treasury")
            .set({
              target: 2e5,
              ...(qe.current.treasuryD || {}),
              entries: (
                ((g = qe.current.treasuryD) == null ? void 0 : g.entries) || []
              ).filter((F) => F.id !== a),
            });
        }),
      no = (a) =>
        U("stats/treasury", () =>
          e
            .doc("stats/treasury")
            .set({ entries: [], ...(qe.current.treasuryD || {}), target: a }),
        ).then(() => Re("Monthly target updated")),
      oo = (a, F = "personal") => {
        let g = Ze("g");
        (U("pgoals/" + g, () =>
          e
            .collection("pgoals")
            .doc(g)
            .set({ id: g, title: a, field: F, progress: 0, createdAt: Date.now() }),
        ),
          Fe.pop());
      },
      ao = (a, g) => {
        g !== a.progress &&
          (U("pgoals/" + a.id, () =>
            e.collection("pgoals").doc(a.id).update({ progress: g }),
          ),
          g >= 100 &&
            a.progress < 100 &&
            (Et("goals", "Goal reached!", "#E9A727", !0),
            Fe.level(),
            Re(`Goal reached: ${a.title}`, "gold"),
            Dt()));
      },
      io = (a) =>
        M({
          type: "confirm",
          text: `Delete the goal \u201C${a.title}\u201D?`,
          onYes: () => {
            (M(null),
              U("pgoals/" + a.id, () =>
                e.collection("pgoals").doc(a.id).delete(),
              ));
          },
        }),
      Ie = (a) => {
        if (fresh) {
          let need = a.type === "fitness" && !hasVenture("fitness") ? "gym" : a.type === "goals" && !hasVenture("goals") ? "goals" : a.type === "port" && !a.via && !townL.plots.marina && !townL.plots.port ? "marina" : null;
          if (need) return (Fe.tap(), $(null), M({ type: "build", preset: need }));
        }
        ($(a), Fe.tap(), ne(!1));
        let g =
          a.type === "section"
            ? a.id
            : a.type === "port"
              ? "port"
              : a.type === "fitness"
                ? "fitness"
                : a.type === "goals"
                  ? "goals"
                  : a.type === "health"
                    ? "health"
                  : a.type === "bank"
                    ? a.focus ? "sv:" + a.focus : "bank"
                    : null;
        if (!g || !fe.current) return;
        let F = Os(g),
          S = window.innerWidth >= 768;
        fe.current.flyTo(
          F.x,
          F.y - 20,
          S ? { offsetX: 480 } : { offsetY: window.innerHeight * 0.6 },
        );
      },
      lo = ds((a) => {
        if (a === "bank") return Ie({ type: "bank" });
        if (a === "health") return Ie({ type: "health" });
        if (a === "townhall") return Ie({ type: "week" });
        if (typeof a === "string" && a.startsWith("sv:")) return Ie({ type: "bank", tab: "savings", focus: a.slice(3) });
        Ie(
          a === "port" || a === "hub" || a === "marina"
            ? { type: "port", via: a }
            : a === "fitness"
              ? { type: "fitness" }
              : a === "goals"
                ? { type: "goals" }
                : { type: "section", id: a },
        );
      });
    at(() => {
      let a = (g) => {
        g.key === "Escape" && !E && $(null);
      };
      return (
        window.addEventListener("keydown", a),
        () => window.removeEventListener("keydown", a)
      );
    }, [E]);
    let ro = pe.map((a) => a.id).join(",");
    at(() => {
      if (!k) return;
      let a = pe.map((dt) => dt.id);
      if (W.current === null) {
        W.current = new Set(a);
        return;
      }
      let g = a.filter((dt) => !W.current.has(dt));
      if (!g.length) return;
      let F = g[0],
        S = te[F] || pe.find((dt) => dt.id === F);
      (W.current.add(F),
        de({ id: F, k: 0 }),
        fe.current && townL.plots[F] && fe.current.flyTo(townL.plots[F].sx, townL.plots[F].sy),
        setTimeout(() => Fe.build(), 250));
      let X = performance.now(),
        Je = (dt) => {
          let Pt = Math.min(1, (dt - X) / 1300),
            Kt = 1 - Math.pow(1 - Pt, 3);
          Pt < 1
            ? (de({ id: F, k: Kt }), requestAnimationFrame(Je))
            : (de(null),
              ee(F),
              setTimeout(() => {
                let Ne = ps(F, -40);
                Jt(Ne.x, Ne.y);
              }, 500),
              Re(`New land raised: ${S.name}`, "gold"),
              setTimeout(() => ee(null), 1500));
        };
      requestAnimationFrame(Je);
    }, [k, ro]);
    let Hs = JSON.stringify(
        Object.fromEntries(Object.entries(be).map(([a, g]) => [a, g.level])),
      ),
      hs = Lt(null);
    at(() => {
      if (!k) return;
      let a = JSON.parse(Hs);
      if (hs.current)
        for (let [g, F] of Object.entries(a)) {
          let S = hs.current[g];
          if (S && F > S && te[g]) {
            let X = (F === 3 || F === 5) && g !== "goals";
            (Re(
              `${te[g].name} reached level ${F}${X ? " \xB7 building upgraded" : ""}`,
              "gold",
            ),
              setTimeout(() => {
                Fe.level();
                let Je = ps(g, -50);
                Jt(Je.x, Je.y);
              }, 400));
          }
        }
      hs.current = a;
    }, [k, Hs]);
    at(() => {
      if (!t || sandbox) return;
      let on = !0;
      (async () => { try { let u2 = window.claude && window.claude.use ? await window.claude.use("user") : null; let id = u2 ? await u2.id() : null; on && setUid(id || null); } catch { on && setUid(null); } })();
      return () => { on = !1; };
    }, [t, sandbox]);
    // iPhone app: reminders on the phone for bills, tasks with a due date, repeating tasks and the focus timer
    let remindKey = window.LLPlatform && window.LLPlatform.native ? JSON.stringify([(billsC || []).map((b2) => [b2.id, b2.name, b2.day, b2.amount, b2.paid]), (s || []).filter((t2) => t2.status !== "done" || t2.repeat).map((t2) => [t2.id, t2.title, t2.due, t2.repeat, t2.status]), focus && [focus.since, focus.dur, focus.used, focus.paused]]) : "";
    at(() => {
      if (!remindKey || sandbox) return;
      let tm = setTimeout(() => {
        let at9 = (d2, h = 9) => { let x = new Date(d2); x.setHours(h, 0, 0, 0); return x.getTime(); }, list = [], now = new Date();
        (billsC || []).forEach((b2) => {
          for (let m2 = 0; m2 < 2; m2++) {
            let due = new Date(now.getFullYear(), now.getMonth() + m2, Math.min(b2.day || 1, 28)), mk = due.getFullYear() + "-" + String(due.getMonth() + 1).padStart(2, "0");
            b2.paid && b2.paid[mk] || list.push({ key: "bill:" + b2.id + ":" + mk, at: at9(due), title: "Pay " + b2.name, body: money(b2.amount) + " is due today." });
          }
        });
        (s || []).forEach((t2) => { t2.due && !t2.repeat && t2.status !== "done" && list.push({ key: "due:" + t2.id, at: at9(new Date(t2.due + "T12:00")), title: "Due today: " + t2.title, body: "Tap to open your island." }); });
        let reps = (s || []).filter((t2) => t2.repeat);
        if (reps.length) for (let d3 = 1; d3 <= 3; d3++) { let day = new Date(now.getTime() + d3 * 864e5), n4 = reps.filter((t2) => repeatsToday(t2, day)).length; n4 && list.push({ key: "rep:" + dayKey(day), at: at9(day, 8), title: n4 + " repeating task" + (n4 > 1 ? "s" : "") + " today", body: "Keep the streak going on your island." }); }
        focus && !focus.paused && list.push({ key: "focus", at: focus.since + Math.max(0, focus.dur - (focus.used || 0)) * 1e3, title: "Focus session done", body: focus.task.title + ": nice work. Come back for your XP." });
        list.sort((a2, b3) => a2.at - b3.at);
        window.LLPlatform.notify.sync(list);
      }, 1500);
      return () => clearTimeout(tm);
    }, [remindKey, sandbox]);
    // repeating tasks come back: a done repeating task from an earlier day reopens on its next day
    at(() => {
      if (!k || !t && !sandbox) return;
      (s || []).forEach((tk) => {
        if (tk.repeat && tk.status === "done" && tk.doneAt && tk.doneAt !== ue && repeatsToday(tk))
          U("tasks/" + tk.id, () => e.collection("tasks").doc(tk.id).set({ ...tk, status: "todo", doneAt: "", updatedAt: Date.now() }));
      });
    }, [k, ue, (s || []).map((tk) => tk.id + tk.status + tk.doneAt).join("|")]);
    // a building site that just got its first finished task: raise the building with a little ceremony
    let prevBuilding = Lt(null),
      [opening, setOpening] = He(null);
    at(() => {
      if (!k) return;
      let now = [...buildingIds], prev = prevBuilding.current;
      prevBuilding.current = now;
      if (!prev) return;
      let opened = prev.filter((id) => !buildingIds.has(id));
      if (!opened.length) return;
      let g = te[opened[0]];
      setOpening({ id: opened[0], t: performance.now() });
      Fe.level && Fe.level();
      Re((g ? g.name : "Your new building") + " is open! Ribbon cut, doors open.", "gold");
    }, [k, [...buildingIds].join(",")]);
    let Xs = Lt(!1);
    at(() => {
      if (!k || Xs.current) return;
      Xs.current = !0;
      if (islMode === "new") return; // the welcome dialog does the greeting
      let a = Qe.me,
        g = Ye.filter((F) => F.status !== "done").length;
      setTimeout(
        () =>
          Re(
            `Welcome back${a ? ", " + a.name : ""}. ${g ? g + " quest" + (g === 1 ? "" : "s") + " waiting today." : "All quiet on the island."}`,
          ),
        700,
      );
    }, [k]);
    let co = () => {
      let a = !N;
      (Ns(a), P(a), Rn("valley-sound", a), a && setTimeout(() => Fe.pop(), 30));
    };
    if (
      (at(() => {
        N && Ns(!0);
      }, []),
      e === void 0 || !k)
    )
      return React.createElement(
        "div",
        { className: "app splash" },
        React.createElement(
          "div",
          { className: "splash-card" },
          React.createElement(
            "div",
            { className: "splash-emblem" },
            React.createElement(qn, null),
          ),
          React.createElement(
            "div",
            { className: "splash-title" },
            "Valley Isle",
          ),
          React.createElement(
            "div",
            { className: "splash-sub" },
            "Raising the island\u2026",
          ),
        ),
      );
    const assignCrew = async (id, lmId) => {
      let wk = Qe[id],
        nm = wk ? wk.name : "Crew",
        tg = lmId ? (Ps[lmId] || {}).name || lmId : null;
      (Re(tg ? `${nm} is heading to ${tg}` : `${nm} is off duty, wandering the town`), Fe.pop());
      if (!n || !n.length)
        for (let S of ks) await U("workers/" + S.id, () => e.collection("workers").doc(S.id).set(S));
      U("workers/" + id, () => e.collection("workers").doc(id).update({ base: lmId || "" }));
    };
    const LIGHTS = ["auto", "day", "golden", "night"],
      LIGHT_NAMES = { auto: "Real time", day: "Day", golden: "Golden hour", night: "Night" };
    let rt = v && v.type === "section" ? te[v.id] : null,
      po = !!v;
    return React.createElement(
      "div",
      { className: "app" },
      React.createElement(World.WorldMap, {
        ref: fe,
        town: townL,
        landmarks: Object.fromEntries(Me.map((a) => [a.id, a])),
        leads: Ke.map((a) => ({ id: a.id, type: a.type, color: (kt[a.type] || {}).color || "#1F7A8C" })),
        workers: Ce,
        lightMode: lightMode,
        opening: opening,
        focus: flyTo,
        paused: !!v || editing,
        edit: editing ? { A: planL.A, B: planL.B, parcels: editParcels, meta: editMeta, check: World.checkPlan, selected: editSel } : null,
        onEditMove: onEditMove,
        onEditSelect: (id) => setEditSel(id),
        onEditInvalid: (why) => Re(why || "That spot doesn't work.", "bad"),
        onPlot: (a) => {
          a.free
            ? M({ type: "section" })
            : (Fe.tap(),
              Re(
                `${a.name} is under construction. It opens when the island reaches level ${a.level} (now ${je.level}).`,
              ));
        },
        onAgent: (a) => {
          (Fe.tap(),
            Re(
              a.type === "car"
                ? `${a.name} \xB7 on the road. No job yet.`
                : a.type === "person"
                  ? `${a.name} \xB7 out and about. A townsperson, not on your crew.`
                  : a.type === "boat"
                    ? "A boat passing the islands"
                    : `A ${a.kind} going about its day`,
            ));
        },
        onCrew: (a) => (Fe.tap(), setCrewCard(a)),
        onAssign: assignCrew,
        onOpen: lo,
        onShip: () => Ie({ type: "port" }),
        reserveRight: ce ? 330 : 0,
      }),
      React.createElement("div", {
        className: "sunwash",
        "aria-hidden": "true",
      }),
      React.createElement("div", {
        className: "vignette",
        "aria-hidden": "true",
      }),
      React.createElement(
        "header",
        { className: "hud-top" },
        React.createElement(
          "div",
          { className: "crest hud-card", role: "button", tabIndex: 0, title: "Island settings", onClick: () => M({ type: "settings" }), onKeyDown: (a) => (a.key === "Enter" || a.key === " ") && M({ type: "settings" }) },
          React.createElement(qn, null),
          React.createElement(
            "div",
            { className: "min-w-0" },
            React.createElement(
              "div",
              { className: "crest-title" },
              (isl && isl.islandName) || "Valley Isle",
            ),
            React.createElement(
              "div",
              { className: "crest-sub" },
              "Island level ",
              je.level,
              " ",
              React.createElement(
                "span",
                { className: "tnum" },
                "\xB7 ",
                je.into,
                "/",
                je.need,
                " XP",
              ),
            ),
            React.createElement(rs, { info: je, height: 7 }),
          ),
        ),
        React.createElement(
          "div",
          { className: "res-row" },
          React.createElement(
            "button",
            {
              type: "button",
              className: "pill",
              onClick: () => Ie({ type: "goals" }),
              title: "Income this month vs your monthly target",
            },
            React.createElement(
              "span",
              {
                className: "ico",
                style: { background: "#F9E4A6", color: "#8A6A1E" },
              },
              React.createElement(Ss, { size: 16 }),
            ),
            React.createElement("span", { className: "tnum" }, Le(B, !0)),
            React.createElement(
              "span",
              { className: "pill-sub" },
              "/ ",
              Le(h.target, !0),
            ),
          ),
          React.createElement(
            "div",
            {
              className: "pill",
              title: Xe
                ? "You made progress today"
                : "Do one thing today to keep the streak",
            },
            React.createElement(
              "span",
              {
                className: "ico" + (Xe ? " lit" : ""),
                style: {
                  background: Xe ? "#FCD2B6" : "#EFE3CF",
                  color: Xe ? "#D2622B" : "#A4907A",
                },
              },
              React.createElement(Fn, { size: 16 }),
            ),
            React.createElement("span", { className: "tnum" }, Ve),
            React.createElement(
              "span",
              { className: "pill-sub" },
              "day streak",
            ),
          ),
          React.createElement(
            "button",
            {
              type: "button",
              className: "pill",
              onClick: () => Ie({ type: "port" }),
              title: "New leads docked at the port",
            },
            React.createElement(
              "span",
              {
                className: "ico",
                style: { background: "#CDE9EC", color: "#1F7A8C" },
              },
              React.createElement(ls, { size: 16 }),
            ),
            React.createElement("span", { className: "tnum" }, Ke.length),
            React.createElement("span", { className: "pill-sub" }, "docked"),
          ),
          React.createElement(
            "button",
            {
              type: "button",
              className: "pill hide-sm",
              onClick: () => Ie({ type: "board" }),
              title: "Open tasks across the island",
            },
            React.createElement(
              "span",
              {
                className: "ico",
                style: { background: "#F8D9CC", color: "#B85C3C" },
              },
              React.createElement(is, { size: 16 }),
            ),
            React.createElement("span", { className: "tnum" }, it),
            React.createElement("span", { className: "pill-sub" }, "open"),
          ),
        ),
      ),
      focus &&
        React.createElement(FocusCard, { focus, venture: te[focus.task.venture], onDone: finishFocus, onStop: () => (setFocus(null), Re("Focus stopped.")),
          onPause: () => setFocus((f2) => (f2.paused ? { ...f2, paused: !1, since: Date.now() } : { ...f2, paused: !0, used: f2.used + (Date.now() - f2.since) / 1000 })) }),
      editing &&
        React.createElement("div", { className: "edit-bar hud-card", role: "toolbar", "aria-label": "Layout editor" },
          React.createElement("div", { className: "edit-txt" },
            React.createElement("b", null, editSel && editMeta[editSel] ? editMeta[editSel].name : "Edit layout"),
            React.createElement("span", null, editSel ? "Drag it to a new spot, or rotate it." : "Drag any building to move it. Tap one to select it.")),
          editSel && React.createElement(Q, { variant: "ghost", onClick: rotateSel }, "Rotate"),
          editSel && editMeta[editSel] && editMeta[editSel].scenery && React.createElement(Q, { variant: "ghost", onClick: removeSel }, "Remove"),
          React.createElement(Q, { variant: "gold", onClick: () => (setEditing(!1), setEditSel(null)) }, "Done")),
      !t && !editing &&
        React.createElement(
          "div",
          { className: "banner" + (sandbox ? " sandbox" : "") },
          sandbox ? "Sandbox \xB7 a new player's island, nothing is saved " : "Preview mode \xB7 changes here aren't saved",
          sandbox && React.createElement("button", { type: "button", className: "banner-btn", onClick: () => (R([]), setSandbox(!1)) }, "Back to my island"),
        ),
      f &&
        React.createElement(
          "div",
          { className: "banner bad" },
          "You can view this island but not change it.",
        ),
      React.createElement(
        "div",
        { className: "quests-wrap" + (po ? " hidden-when-drawer" : "") },
        React.createElement(_o, {
          open: ce,
          setOpen: $e,
          quests: Ye,
          habitsDone: Ue,
          secById: te,
          onToggle: Wt.onToggle,
          onEdit: Wt.onEdit,
          onHabits: () => Ie({ type: "fitness", tab: "habits" }),
          noHabits: !hasVenture("fitness"),
          extra: (billsC || []).filter((b2) => !(b2.paid && b2.paid[monthKey()]) && new Date().getDate() >= b2.day).map((b2) => ({ id: "bill" + b2.id, title: "Pay " + b2.name, meta: "Bank \xB7 " + money(b2.amount) + (new Date().getDate() > b2.day ? " \xB7 late" : " \xB7 due today"), onToggle: () => bankAct.toggleBill(b2, monthKey()) })),
        }),
      ),
      React.createElement(
        "div",
        { className: "toasts", "aria-live": "polite" },
        he.map((a) =>
          React.createElement(
            "div",
            { key: a.id, className: "toast " + a.tone },
            a.tone === "gold" && React.createElement(Ss, { size: 16 }),
            a.text,
          ),
        ),
      ),
      z &&
        React.createElement(
          "div",
          { className: "hint" },
          "Tap a building to go inside \xB7 drag crew onto a building",
        ),
      React.createElement(
        "div",
        { className: "map-ctrl" },
        React.createElement(
          Pe,
          {
            label: "Zoom in",
            className: "map-btn",
            onClick: () => fe.current.zoom(1.25),
          },
          React.createElement(wn, { size: 18 }),
        ),
        React.createElement(
          Pe,
          {
            label: "Zoom out",
            className: "map-btn",
            onClick: () => fe.current.zoom(0.8),
          },
          React.createElement(bn, { size: 18 }),
        ),
        React.createElement(
          Pe,
          {
            label: "Show whole island",
            className: "map-btn",
            onClick: () => fe.current.fit(),
          },
          React.createElement(Nn, { size: 18 }),
        ),
        React.createElement(
          Pe,
          {
            label: "Lighting: " + LIGHT_NAMES[lightMode] + ". Tap to change.",
            className: "map-btn light-btn",
            onClick: () => {
              let a = LIGHTS[(LIGHTS.indexOf(lightMode) + 1) % LIGHTS.length];
              (setLightMode(a), Re("Lighting: " + LIGHT_NAMES[a]), Fe.tap());
            },
          },
          React.createElement("span", { className: "light-ico", "data-mode": lightMode }),
        ),
        React.createElement(
          Pe,
          {
            label: N ? "Mute sounds" : "Turn sounds on",
            className: "map-btn" + (N ? " on" : ""),
            onClick: co,
          },
          N
            ? React.createElement(kn, { size: 18 })
            : React.createElement(vn, { size: 18 }),
        ),
        React.createElement(
          Pe,
          {
            label: editing ? "Finish editing the layout" : "Edit layout: move and rotate buildings",
            className: "map-btn" + (editing ? " on" : ""),
            onClick: () => (Fe.tap(), $(null), setEditSel(null), setEditing(!editing)),
          },
          React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
            React.createElement("path", { d: "M12 3l9 5-9 5-9-5 9-5z" }), React.createElement("path", { d: "M3 13l9 5 9-5" }), React.createElement("path", { d: "M12 13v8" })),
        ),
        React.createElement(
          Pe,
          {
            label: sandbox ? "Leave the new-player sandbox" : "Try a new player's start (sandbox, nothing saved)",
            className: "map-btn" + (sandbox ? " on" : ""),
            onClick: () => (Fe.tap(), $(null), M(null), R([]), setSandbox(!sandbox)),
          },
          React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
            React.createElement("path", { d: "M12 21v-8" }),
            React.createElement("path", { d: "M12 13c0-4 3-6 7-6 0 4-3 6-7 6z" }),
            React.createElement("path", { d: "M12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" })),
        ),
      ),
      React.createElement(
        "nav",
        { className: "dock hud-card", "aria-label": "Island actions" },
        React.createElement(Xt, {
          icon: React.createElement(is, { size: 20 }),
          label: "Board",
          active: (v == null ? void 0 : v.type) === "board",
          onClick: () => Ie({ type: "board" }),
        }),
        React.createElement(Xt, {
          icon: React.createElement(ls, { size: 20 }),
          label: "Port",
          badge: Ke.length,
          active: (v == null ? void 0 : v.type) === "port",
          onClick: () => Ie({ type: "port" }),
        }),
        React.createElement(Xt, {
          icon: React.createElement(xn, { size: 20 }),
          label: "Fitness",
          active: (v == null ? void 0 : v.type) === "fitness",
          onClick: () => Ie({ type: "fitness" }),
        }),
        React.createElement(Xt, {
          icon: React.createElement($s, { size: 20 }),
          label: "Goals",
          active: (v == null ? void 0 : v.type) === "goals",
          onClick: () => Ie({ type: "goals" }),
        }),
        React.createElement(Xt, {
          icon: React.createElement("span", { className: "dock-glyph", "aria-hidden": "true" }, "7"),
          label: "Week",
          active: (v == null ? void 0 : v.type) === "week",
          onClick: () => Ie({ type: "week" }),
        }),
        React.createElement(Xt, {
          icon: React.createElement(zs, { size: 20 }),
          label: "Crew",
          active: (v == null ? void 0 : v.type) === "crew",
          onClick: () => Ie({ type: "crew" }),
        }),
        React.createElement("span", { className: "dock-sep" }),
        React.createElement(
          Q,
          { variant: "primary", className: "dock-main", onClick: () => Yt() },
          React.createElement(At, { size: 18 }),
          React.createElement("span", null, "Task"),
        ),
        React.createElement(
          Q,
          {
            variant: "gold",
            className: "dock-main",
            onClick: () => M({ type: "build" }),
            title: "Build something new on the island",
          },
          React.createElement(Ls, { size: 18 }),
          React.createElement("span", { className: "hide-xs" }, "Build"),
        ),
      ),
      (() => {
        if (!v) return null;
        let k = null;
        v.type === "section" && rt
          ? (k = { kind: rt.kind, color: rt.color, name: rt.name, id: rt.id })
          : v.type === "fitness"
            ? (k = { kind: "gym", color: te.fitness.color, name: te.fitness.name, id: "fitness" })
            : v.type === "goals"
              ? (k = { kind: "lighthouse", color: te.goals.color, name: te.goals.name, id: "goals" })
              : v.type === "port" &&
                (k =
                  v.via === "marina"
                    ? { kind: "marina", color: "#2A9D8F", name: "Marina", id: null, via: "marina" }
                    : v.via === "hub"
                      ? { kind: "hub", color: "#C9A227", name: "Logistics Hub", id: null, via: "hub" }
                      : { kind: "port", color: "#1F7A8C", name: "Tender Port", id: null, via: "port" });
        if (!k) return null;
        let g = k.id
            ? xe.filter((a) => a.venture === k.id)
            : C.filter((a) =>
                k.via === "hub"
                  ? a.stage === "qualifying" || a.stage === "quoted"
                  : a.stage === "new" && (k.via === "marina" ? a.type !== "tender" : a.type === "tender"),
              ).map((a) => ({
                id: a.id,
                title: a.title,
                priority: a.stage === "new" ? "high" : "med",
                status: a.stage === "quoted" ? "doing" : "todo",
                _lead: a,
              })),
          onSite = k.id ? Ce.filter((a) => a.base === k.id) : [],
          F = [...new Set(["me", ...onSite.map((a) => a.id), ...g.filter((a) => a.status !== "done").map((a) => a.assignee)])]
            .map((a) => Qe[a])
            .filter(Boolean),
          org = (() => {
            let P0 = Ps[k.id || "port"];
            return P0 && fe.current ? fe.current.toScreen(P0.x, P0.y - 30) : null;
          })();
        return React.createElement(Inside.Interior, {
          key: k.name,
          ...k,
          level: k.id && be[k.id] ? be[k.id].level : Math.max(1, Ke.length),
          tasks: g,
          crew: F,
          onTask: (a) => (a._lead ? _n.onEdit(a._lead) : Wt.onEdit(a)),
          onClose: () => $(null),
          onAdd: k.id ? () => Yt(k.id) : () => M({ type: "lead", init: {} }),
          origin: org,
          goals: G,
          treasury: { sum: B, target: h.target },
          workingIds: Object.fromEntries(onSite.map((a) => [a.id, a])),
        });
      })(),
      rt &&
        React.createElement($n, {
          key: rt.id,
          section: rt,
          info: be[rt.id],
          tasks: xe.filter((a) => a.venture === rt.id),
          crew: (Ps[rt.id] || {}).crew || [],
          workersById: Qe,
          secById: te,
          handlers: Wt,
          onAdd: () => Yt(rt.id),
          onClose: () => $(null),
          onDemolish: pe.some((a) => a.id === rt.id) ? () => Kn(rt) : null,
          extra: rt.id === "personal"
            ? React.createElement(Journal, { entries: journalC || [], today: ue, onSave: (x2) => U("journal/" + ue, () => e.collection("journal").doc(ue).set({ id: ue, d: ue, ...x2, updatedAt: Date.now() })) })
            : rt.id === "youtube"
              ? React.createElement(ContentCal, { videos: videosC || [], crew: Ce, onSave: (x2) => { let id = x2.id || Ze("vd"); U("videos/" + id, () => e.collection("videos").doc(id).set({ ...x2, id, updatedAt: Date.now(), createdAt: x2.createdAt || Date.now() })); }, onDelete: (id) => U("videos/" + id, () => e.collection("videos").doc(id).delete()) })
              : null,
        }),
      (v == null ? void 0 : v.type) === "port" &&
        React.createElement(zn, {
          key: v.via || "port",
          leads: v.via === "marina" ? C.filter((a) => a.type !== "tender") : v.via === "port" ? C.filter((a) => a.type === "tender") : C,
          title: v.via === "marina" ? "Marina" : v.via === "port" ? "Tender Port" : "Logistics Hub",
          sub: v.via === "marina" ? "Orders, sponsors and freelance work dock here" : v.via === "port" ? "EPCM tenders and RFQs arrive by ship" : "Every lead being worked, from qualifying to won",
          color: v.via === "marina" ? "#2A9D8F" : v.via === "port" ? "#1F7A8C" : "#C9A227",
          initialTab: v.via === "hub" ? "qualifying" : "new",
          secById: te,
          monthWon: x.reduce((a, g) => a + (Number(g.value) || 0), 0),
          onClose: () => $(null),
          onNew: () => M({ type: "lead", init: v.via === "marina" ? { type: "order" } : v.via === "port" ? { type: "tender" } : {} }),
          ..._n,
        }),
      (v == null ? void 0 : v.type) === "week" &&
        React.createElement(WeekDrawer, { tasks: xe, secById: te, onClose: () => $(null), onOpen: (tk) => M({ type: "task", init: tk }),
          onMove: (tk, due) => (U("tasks/" + tk.id, () => e.collection("tasks").doc(tk.id).set({ ...tk, due, updatedAt: Date.now() })), Fe.tap(), Re(tk.title + (due ? " moved to " + new Date(due + "T12:00").toLocaleDateString("en", { weekday: "long" }) : " moved to anytime") + ".")) }),
      (v == null ? void 0 : v.type) === "health" &&
        React.createElement(HealthDrawer, { key: "health" + (v.tab || ""), tab: v.tab, ready: !!hBase, building: buildingIds.has("health"), days: hDays || [], cycle: hCycle || [], cfg: hCfg, today: ue,
          workoutsWeek: Z.filter((w2) => w2.d && Math.round((new Date(ue + "T12:00") - new Date(w2.d + "T12:00")) / 864e5) < 7).length + (hDays || []).filter((x) => x.phone && diffDays(ue, x.id) < 7 && diffDays(ue, x.id) >= 0).reduce((a2, x) => a2 + (x.phone.workouts || []).length, 0),
          onClose: () => $(null), onGym: () => Ie({ type: "fitness" }), act: healthAct }),
      (v == null ? void 0 : v.type) === "bank" &&
        React.createElement(BankDrawer, { key: "bank" + (v.tab || "") + (v.focus || ""), building: buildingIds.has("bank"), plan: budgetDoc, spend: spendC, bills: billsC, savings: savingsC, business: B, tab: v.tab, focus: v.focus, onClose: () => $(null), act: bankAct }),
      (v == null ? void 0 : v.type) === "fitness" &&
        React.createElement(Sn, {
          key: v.tab || "fit",
          initialTab: v.tab,
          info: be.fitness,
          profile: De,
          weights: _,
          workouts: Z,
          habits: Ae,
          onClose: () => $(null),
          onLogWeight: Zn,
          onDelWeight: Qn,
          onSetProfile: Vn,
          onLogWorkout: Un,
          onDelWorkout: Jn,
          onToggleHabit: eo,
          onHabitsChange: (items) => U("habits/list", () => e.doc("habits/list").set({ items })),
        }),
      (v == null ? void 0 : v.type) === "goals" &&
        React.createElement(Tn, {
          info: be.goals,
          treasury: h,
          month: j,
          wonThisMonth: x,
          incomeThisMonth: A,
          goals: G,
          tasks: xe.filter((a) => a.venture === "goals"),
          workersById: Qe,
          secById: te,
          handlers: Wt,
          onClose: () => $(null),
          onAddIncome: to,
          onDelIncome: so,
          onSetTarget: no,
          onAddGoal: oo,
          fields: Ge.filter((a) => a.id !== "goals"),
          onGoal: ao,
          onDelGoal: io,
          onAddTask: () => Yt("goals"),
        }),
      (v == null ? void 0 : v.type) === "crew" &&
        React.createElement(In, {
          workers: Ce,
          tasks: xe,
          secById: te,
          onClose: () => $(null),
          onSave: Hn,
          onDelete: Xn,
        }),
      (v == null ? void 0 : v.type) === "board" &&
        React.createElement(Wn, {
          tasks: xe,
          sections: Ge,
          workers: Ce,
          workersById: Qe,
          secById: te,
          handlers: Wt,
          onClose: () => $(null),
          onAdd: () => Yt(),
        }),
      (E == null ? void 0 : E.type) === "task" &&
        React.createElement(Bn, {
          init: E.init,
          sections: Ge,
          workers: Ce,
          onClose: () => M(null),
          onSave: Gn,
          onFocus: (tk) => (M(null), startFocus(tk)),
        }),
      (E == null ? void 0 : E.type) === "lead" &&
        React.createElement(Ln, {
          init: E.init,
          sections: Ge,
          onClose: () => M(null),
          onSave: jn,
        }),
      (E == null ? void 0 : E.type) === "settings" &&
        React.createElement(SettingsDlg, { isl, onClose: () => M(null), onExport: doExport, onImport: (txt) => (M(null), doImport(txt)),
          onRename: (nm) => (U("settings/island", () => e.doc("settings/island").set({ ...(isl || { mode: fresh ? "fresh" : "classic" }), islandName: nm })), Re("Renamed to " + nm + "."), M(null)) }),
      (E == null ? void 0 : E.type) === "section" &&
        React.createElement(Pn, { onClose: () => M(null), onCreate: Yn }),
      (E == null ? void 0 : E.type) === "build" &&
        React.createElement(BuildDlg, { key: E.preset || "any", preset: E.preset, taken: Ge.map((g) => g.id).concat(townL.plots.marina ? ["marina"] : [], baseLayout.work || !fresh ? ["epcm"] : []), onClose: () => M(null), onBuild: buildVenture }),
      islMode === "new" &&
        React.createElement(WelcomeDlg, { onStart: onboard, sandbox: sandbox, onExit: () => setSandbox(!1) }),
      (E == null ? void 0 : E.type) === "confirm" &&
        React.createElement(Dn, {
          text: E.text,
          confirmLabel: E.confirmLabel,
          onCancel: () => M(null),
          onConfirm: E.onYes,
        }),
      crewCard &&
        Qe[crewCard] &&
        (() => {
          let wk = Qe[crewCard],
            info = (fe.current && fe.current.crewInfo(crewCard)) || {},
            jobs = xe.filter((a) => a.assignee === crewCard && a.status !== "done"),
            where = info.base ? (Ps[info.base] || {}).name || info.base : null,
            stat =
              info.status === "working"
                ? `Working at ${where}`
                : info.status === "walking"
                  ? `Walking to ${where}`
                  : info.status === "carried"
                    ? "Being carried"
                    : "Idle, wandering the town";
          return React.createElement(
            "div",
            { className: "crew-card hud-card", role: "dialog", "aria-label": wk.name },
            React.createElement(
              "div",
              { className: "crew-card-head" },
              React.createElement("span", { className: "crew-av", style: { background: wk.color } }, wk.name[0]),
              React.createElement(
                "div",
                { className: "min-w-0 flex-1" },
                React.createElement("div", { className: "crew-card-name" }, wk.name),
                React.createElement("div", { className: "crew-card-role" }, wk.kind === "human" ? "You \xB7 crew lead" : "Agent \xB7 " + wk.name + " role"),
              ),
              React.createElement(Pe, { label: "Close", onClick: () => setCrewCard(null) }, React.createElement(mt, { size: 16 })),
            ),
            React.createElement("div", { className: "crew-card-status" }, React.createElement("span", { className: "crew-dot " + (info.status || "idle") }), stat),
            React.createElement("div", { className: "lbl mt-2" }, "Job queue \xB7 ", jobs.length),
            jobs.length
              ? React.createElement(
                  "div",
                  { className: "crew-jobs" },
                  jobs.slice(0, 5).map((a) =>
                    React.createElement(
                      "button",
                      { key: a.id, type: "button", className: "crew-job", onClick: () => M({ type: "task", init: a }) },
                      React.createElement("span", { className: "gdot", style: { background: (te[a.venture] || {}).color || "#999" } }),
                      React.createElement("span", { className: "truncate" }, a.title),
                      info.base === a.venture && React.createElement("span", { className: "crew-working" }, "working"),
                    ),
                  ),
                )
              : React.createElement("div", { className: "empty sm" }, "No jobs yet. Assign tasks to ", wk.name, " and they'll show here."),
            React.createElement(
              "div",
              { className: "crew-card-foot" },
              React.createElement("span", { className: "meta-txt" }, "Drag them onto a building to send them to work"),
              info.base && React.createElement(Q, { className: "sm", onClick: () => (fe.current && fe.current.crewInfo && assignCrew(crewCard, null), fe.current && fe.current.sendCrew && fe.current.sendCrew(crewCard, null)) }, "Off duty"),
            ),
          );
        })(),
      React.createElement("div", { id: "fx-layer", "aria-hidden": "true" }),
    );
  }
  ReactDOM.createRoot(document.getElementById("root")).render(
    React.createElement(Ho, null),
  );
})();
