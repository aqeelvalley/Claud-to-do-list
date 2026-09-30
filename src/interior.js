  /* ===================== Valley Isle · building interiors =====================
   * Tapping a building walks you inside: an isometric room furnished for
   * that venture, the crew at their stations and open tasks pinned to the
   * wall as sticky notes (tap one to edit it).
   */
  var Inside = (() => {
    const h = React.createElement;
    const W = 230, D = 210, H = 118; // room size in iso units
    const P = (a, b, z = 0) => ye(a, b, z);
    const pts = (arr) => J(arr);
    const R = (v) => Math.round(v * 10) / 10;

    /* ---------- furniture primitives (anchor = floor point a,b) ---------- */
    const box = (a, b0, z, w, d, hh, c, key) => h(b, { key, x: a, y: b0, z, w, d, h: hh, c });
    function Desk({ a, b: bb, c = "#B98759", screen = "#7FD1DC", chair = "#44545A" }) {
      return h("g", null,
        box(a, bb, 0, 34, 18, 13, c),
        box(a - 12, bb - 6, 0, 3, 3, 13, T(c, -0.3)),
        box(a - 12, bb + 6, 0, 3, 3, 13, T(c, -0.3)),
        box(a - 6, bb, 13, 4, 14, 10, "#3B4A50"),
        h("polygon", { points: me("right", { x: a - 6, y: bb, z: 13, w: 4, d: 14, h: 10 }, 0.1, 0.9, 0.15, 0.9), fill: screen }),
        box(a + 6, bb + 2, 13, 8, 5, 0.8, "#E9E2D2"),
        box(a + 18, bb, 0, 10, 10, 7, chair),
        box(a + 22, bb, 7, 3, 10, 10, chair),
      );
    }
    function Shelf({ a, b: bb, c = "#B98759", items = ["#E07B39", "#2A9D8F", "#E9B949", "#7E6BC4"] }) {
      const f = { x: a, y: bb, z: 0, w: 10, d: 44, h: 56 };
      return h("g", null,
        box(a, bb, 0, 10, 44, 56, c),
        [12, 26, 40].map((z, n) => h("polygon", { key: n, points: me("right", f, 0.04, 0.96, z / 56, z / 56 + 0.03), fill: T(c, -0.35) })),
        [0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => h("polygon", { key: r + "-" + k, points: me("right", f, 0.08 + k * 0.22, 0.2 + k * 0.22, (14 + r * 14) / 56, (22 + r * 14) / 56), fill: items[(r + k) % items.length] }))),
      );
    }
    function Plant({ a, b: bb, s = 1 }) {
      const [x, y] = P(a, bb, 0);
      return h("g", null,
        h(re, { x: a, y: bb, r: 5 * s, r2: 4 * s, h: 8 * s, c: "#C8654A" }),
        h("g", { transform: `translate(${R(x)},${R(y - 8 * s)}) scale(${s * 1.3})` },
          h("circle", { cx: -4, cy: -6, r: 5.5, fill: "#5A9650" }),
          h("circle", { cx: 3, cy: -8, r: 6.5, fill: "#6CAB5C" }),
          h("circle", { cx: 0, cy: -12, r: 4.5, fill: "#8FC271" })));
    }
    function Rug({ a, b: bb, ra = 40, rb = 34, c = "#D9734E" }) {
      return h("g", null,
        h(Nt, { x: a, y: bb, z: 0.2, a: ra, b: rb, fill: c }),
        h(Nt, { x: a, y: bb, z: 0.3, a: ra - 6, b: rb - 6, fill: "none", stroke: T(c, 0.35), sw: 1.4, dash: "4 3" }));
    }
    function Printer({ a, b: bb, c }) {
      const f = { x: a, y: bb, z: 12, w: 22, d: 22, h: 24 };
      const [hx, hy] = P(a, bb, 26);
      return h("g", null,
        box(a, bb, 0, 24, 24, 12, "#E9E2D2"),
        box(a, bb, 12, 22, 22, 24, "#44545A"),
        h("polygon", { points: me("left", f, 0.08, 0.92, 0.1, 0.9), fill: "rgba(160,220,230,0.55)" }),
        h("polygon", { points: me("right", f, 0.08, 0.92, 0.1, 0.9), fill: "rgba(160,220,230,0.4)" }),
        h("g", { className: "print-head" }, h("rect", { x: hx - 5, y: hy - 2, width: 10, height: 4, rx: 1.5, fill: c })),
        h("path", { d: `M${R(hx - 6)},${R(hy + 14)} l6,-6 l6,6 z`, fill: T(c, 0.2) }),
        h("circle", { className: "blink", cx: P(a + 11, bb + 8, 30)[0], cy: P(a + 11, bb + 8, 30)[1], r: 1.4, fill: "#6DDB8A" }),
      );
    }
    function Crates({ a, b: bb }) {
      return h("g", null, h(ns, { x: a, y: bb, s: 14 }), h(ns, { x: a + 16, y: bb, s: 14, c: "#B98759" }), h(ns, { x: a + 6, y: bb, z: 14, s: 14, c: "#D8A873" }));
    }
    function Lumber({ a, b: bb }) {
      return h("g", null, [0, 1, 2, 3].map((k) => h(dn, { key: k, x: a, y: bb + (k % 2) * 7, z: Math.floor(k / 2) * 6, len: 54, r: 3.2 })));
    }
    function Counter({ a, b: bb, c }) {
      const f = { x: a, y: bb, z: 0, w: 20, d: 90, h: 20 };
      const [mx, my] = P(a - 2, bb - 26, 34);
      return h("g", null,
        box(a, bb, 0, 20, 90, 20, T(c, -0.1)),
        h("polygon", { points: me("right", f, 0.05, 0.95, 0.2, 0.5), fill: T(c, 0.3) }),
        box(a, bb, 20, 24, 94, 3, "#F6EDDF"),
        box(a - 2, bb - 26, 23, 12, 16, 12, "#9AA7AE"),
        h(ss, { sx: mx, sy: my - 2, n: 3, s: 0.8 }),
        h(re, { x: a, y: bb + 12, z: 23, r: 3, h: 5, c: "#FFF8EC" }),
        h(re, { x: a, y: bb + 22, z: 23, r: 3, h: 5, c: "#E9B949" }),
        box(a, bb + 34, 23, 12, 12, 8, "#F4E3C3"),
      );
    }
    function Table({ a, b: bb, c = "#B98759", chairs = "#D9734E" }) {
      return h("g", null,
        box(a - 12, bb, 0, 7, 7, 9, chairs),
        box(a, bb - 12, 0, 7, 7, 9, chairs),
        h(re, { x: a, y: bb, z: 0, r: 2, h: 13, c: "#44545A", noTop: !0 }),
        h(re, { x: a, y: bb, z: 13, r: 11, h: 2, c }),
        h(re, { x: a + 3, y: bb - 2, z: 15, r: 2, h: 3, c: "#FFF8EC" }),
        box(a + 12, bb, 0, 7, 7, 9, chairs),
      );
    }
    function Camera({ a, b: bb }) {
      const top = P(a, bb, 34), l0 = P(a - 8, bb - 8, 0), l1 = P(a + 8, bb - 6, 0), l2 = P(a - 4, bb + 9, 0);
      return h("g", null,
        [l0, l1, l2].map((l, n) => h("line", { key: n, x1: l[0], y1: l[1], x2: top[0], y2: top[1], stroke: "#3B4A50", strokeWidth: 1.4 })),
        box(a, bb, 34, 14, 9, 9, "#2E3A40"),
        h(re, { x: a - 10, y: bb, z: 36, r: 3.2, h: 1, c: "#1B2226" }),
        h("circle", { className: "blink", cx: P(a + 4, bb - 4, 44)[0], cy: P(a + 4, bb - 4, 44)[1], r: 1.6, fill: "#E0474C" }),
      );
    }
    function RingLight({ a, b: bb }) {
      const [x, y] = P(a, bb, 52), base = P(a, bb, 0);
      return h("g", null,
        h("line", { x1: base[0], y1: base[1], x2: x, y2: y + 12, stroke: "#3B4A50", strokeWidth: 1.5 }),
        h("circle", { cx: x, cy: y, r: 16, fill: "rgba(255,245,215,0.25)", className: "glow-pulse" }),
        h("ellipse", { cx: x, cy: y, rx: 11, ry: 12, fill: "none", stroke: "#FFF7DC", strokeWidth: 3.2 }));
    }
    function Treadmill({ a, b: bb }) {
      return h("g", null,
        box(a, bb, 0, 42, 16, 5, "#3B4A50"),
        box(a, bb, 5, 36, 12, 0.6, "#1F2A2F"),
        box(a - 19, bb, 5, 3, 16, 26, "#9AA7AE"),
        box(a - 19, bb, 28, 6, 18, 5, "#44545A"),
        h("rect", { x: P(a - 20, bb + 4, 30)[0] - 4, y: P(a - 20, bb + 4, 30)[1] - 2, width: 7, height: 3, fill: "#7FD1DC", className: "blink" }));
    }
    function Weights({ a, b: bb, c }) {
      return h("g", null,
        box(a, bb, 0, 10, 50, 22, "#9AA7AE"),
        [0, 1, 2, 3].map((k) => h(re, { key: k, x: a - 2, y: bb - 18 + k * 12, z: 22, r: 4 + k * 0.4, h: 4, c: k % 2 ? c : "#3B4A50" })),
        box(a + 30, bb + 10, 0, 44, 12, 9, "#44545A"),
        box(a + 30, bb + 10, 9, 44, 12, 3, T(c, 0.1)));
    }
    function Sofa({ a, b: bb, c }) {
      return h("g", null,
        box(a, bb, 0, 26, 64, 10, c),
        box(a - 10, bb, 10, 6, 64, 14, T(c, -0.08)),
        box(a, bb - 29, 10, 26, 6, 6, T(c, -0.12)),
        box(a, bb + 29, 10, 26, 6, 6, T(c, -0.12)),
        box(a + 2, bb - 12, 10, 12, 12, 4, "#F2C14E"),
      );
    }
    function Coins({ a, b: bb }) {
      return h("g", null, [[0, 0, 7], [12, 4, 5], [4, 14, 9], [-10, 10, 4]].map(([da, db, n], k) =>
        h("g", { key: k }, Array.from({ length: n }).map((_, z) => h(re, { key: z, x: a + da, y: bb + db, z: z * 2.2, r: 5, h: 2.2, c: z % 2 ? "#F2C14E" : "#E9B949" })))));
    }
    function Trophy({ a, b: bb }) {
      return h("g", null,
        box(a, bb, 0, 16, 16, 20, "#F6EDDF"),
        h(re, { x: a, y: bb, z: 20, r: 3.5, h: 4, c: "#B98A22" }),
        h(re, { x: a, y: bb, z: 24, r: 2, r2: 7, h: 12, c: "#E9B949" }),
        h("circle", { className: "sparkle", cx: P(a, bb, 34)[0] + 6, cy: P(a, bb, 34)[1], r: 2.2, fill: "#FFF8D0" }));
    }
    function Workbench({ a, b: bb }) {
      return h("g", null,
        box(a, bb, 0, 30, 70, 16, "#B98759"),
        box(a, bb, 16, 32, 72, 3, "#D8B384"),
        box(a - 2, bb - 18, 19, 10, 14, 6, "#E0474C"),
        h(re, { x: a + 4, y: bb + 18, z: 19, r: 8, h: 2, c: "#C8CFD2", top: "#E9EEF0" }),
        box(a - 12, bb + 20, 19, 4, 18, 2, "#6F5A45"));
    }
    function Bed({ a, b: bb, c }) {
      return h("g", null,
        box(a, bb, 0, 60, 40, 10, "#B98759"),
        box(a, bb, 10, 58, 38, 5, "#FBF8F1"),
        box(a + 8, bb, 15, 42, 38, 1.5, c),
        box(a - 22, bb, 15, 12, 30, 5, "#FFFFFF"),
        box(a - 30, bb, 0, 4, 40, 24, "#9C6B45"));
    }

    /* per-kind room recipes: floor items (depth sorted) + wall decor */
    function recipe(kind, c) {
      switch (kind) {
        case "refinery":
        case "drafting":
        case "office":
          return {
            wall: "#E6EEF3", floor: "#C9B79A",
            items: [
              [60, 60, h(Desk, { a: 60, b: 60, screen: "#9FD3F0" })],
              [60, 130, h(Desk, { a: 60, b: 130, c: "#F6EDDF", screen: "#9FD3F0" })],
              [150, 60, h(Desk, { a: 150, b: 60 })],
              [16, 175, h(Shelf, { a: 16, b: 175, c: "#9AA7AE", items: ["#3E7CB1", "#F6EDDF", "#E9B949", "#7E6BC4"] })],
              [200, 170, h(Plant, { a: 200, b: 170, s: 1.2 })],
              [150, 140, kind === "drafting" ? h(Workbench, { a: 150, b: 140 }) : h(Rug, { a: 150, b: 140, c: T(c, 0.2) })],
            ],
            label: kind === "refinery" ? "Control room" : "Drafting studio",
          };
        case "maker":
          return {
            wall: "#E3F1EE", floor: "#BFC6C8",
            items: [
              [40, 40, h(Printer, { a: 40, b: 40, c })],
              [40, 80, h(Printer, { a: 40, b: 80, c: "#E9B949" })],
              [40, 120, h(Printer, { a: 40, b: 120, c: "#E07B39" })],
              [130, 100, h(Workbench, { a: 130, b: 100 })],
              [16, 180, h(Shelf, { a: 16, b: 180, c: "#9AA7AE", items: [c, "#E9B949", "#E07B39", "#F6EDDF"] })],
              [190, 170, h(Crates, { a: 190, b: 170 })],
            ],
            label: "Print floor",
          };
        case "mill":
          return {
            wall: "#F1E4D0", floor: "#D8B384",
            items: [
              [120, 90, h(Workbench, { a: 120, b: 90 })],
              [60, 160, h(Lumber, { a: 60, b: 160 })],
              [40, 50, h(Shelf, { a: 16, b: 60, c: "#9C6B45", items: ["#B98759", "#D8B384", "#7E5337", "#E9B949"] })],
              [190, 60, h(Crates, { a: 190, b: 60 })],
              [190, 170, h(Plant, { a: 190, b: 170 })],
            ],
            label: "Workshop floor",
          };
        case "cafe":
          return {
            wall: "#FBE9DC", floor: "#C99D74",
            items: [
              [40, 100, h(Counter, { a: 40, b: 100, c })],
              [120, 60, h(Table, { a: 120, b: 60 })],
              [170, 120, h(Table, { a: 170, b: 120, chairs: "#2A9D8F" })],
              [110, 160, h(Table, { a: 110, b: 160 })],
              [200, 40, h(Plant, { a: 200, b: 40, s: 1.2 })],
            ],
            label: "Espresso bar",
          };
        case "film":
          return {
            wall: "#EDE7F0", floor: "#6B5E6E", green: true,
            items: [
              [130, 110, h(Camera, { a: 130, b: 110 })],
              [100, 170, h(RingLight, { a: 100, b: 170 })],
              [60, 40, h(Desk, { a: 170, b: 40, screen: "#F4A3B5" })],
              [70, 110, h(Rug, { a: 55, b: 110, ra: 30, rb: 50, c: "#3B4A50" })],
              [200, 180, h(Crates, { a: 196, b: 180 })],
            ],
            label: "Studio A",
          };
        case "gym":
          return {
            wall: "#FCEBDD", floor: "#8E9BA0",
            items: [
              [60, 60, h(Treadmill, { a: 60, b: 60 })],
              [60, 110, h(Treadmill, { a: 60, b: 110 })],
              [40, 175, h(Weights, { a: 30, b: 175, c })],
              [160, 80, h(Rug, { a: 160, b: 90, ra: 40, rb: 26, c: "#2A9D8F" })],
              [200, 190, h(Plant, { a: 200, b: 190 })],
            ],
            label: "Training floor",
          };
        case "lighthouse":
          return {
            wall: "#FFF4DA", floor: "#D8C29A",
            items: [
              [70, 80, h(Coins, { a: 70, b: 80 })],
              [30, 160, h(Trophy, { a: 30, b: 160 })],
              [30, 190, h(Trophy, { a: 30, b: 196 })],
              [150, 100, h(Rug, { a: 150, b: 100, c: "#C8543C" })],
              [150, 100, h(Desk, { a: 150, b: 100, c: "#9C6B45", screen: "#F2C14E" })],
              [200, 30, h(Plant, { a: 200, b: 30 })],
            ],
            label: "Treasury",
          };
        case "port":
        case "hub":
          return {
            wall: "#E3EEF0", floor: "#B7B0A2",
            items: [
              [40, 50, h(Crates, { a: 40, b: 50 })],
              [40, 150, h(Crates, { a: 40, b: 150 })],
              [150, 60, h(Desk, { a: 150, b: 60, screen: "#7FD1DC" })],
              [130, 150, h(Coins, { a: 130, b: 150 })],
              [16, 100, h(Shelf, { a: 16, b: 100, c: "#9AA7AE", items: ["#1F7A8C", "#E9B949", "#D9734E", "#F6EDDF"] })],
            ],
            label: "Dispatch office",
          };
        case "cottage":
        case "house":
        default:
          return {
            wall: "#F4EEE3", floor: "#C49A6C",
            items: [
              [110, 110, h(Rug, { a: 110, b: 110, c: T(c, 0.1) })],
              [40, 110, h(Sofa, { a: 40, b: 110, c })],
              [150, 50, h(Bed, { a: 150, b: 45, c: T(c, 0.25) })],
              [16, 185, h(Shelf, { a: 16, b: 185 })],
              [120, 110, h(Table, { a: 120, b: 110, chairs: T(c, -0.1) })],
              [200, 180, h(Plant, { a: 200, b: 180, s: 1.2 })],
            ],
            label: kind === "cottage" ? "Living room" : "Main room",
          };
      }
    }

    /* stations where crew stand, in iso floor coords */
    const SPOTS = [[95, 70], [90, 140], [175, 95], [130, 180], [180, 150], [70, 190]];

    /* sticky note on the left wall (plane a=0). u runs along -b, v down from top */
    function Note({ task, u, v, onClick }) {
      const [x, y] = P(0, D - 16 - u, H - 22 - v);
      const col = task.priority === "high" ? "#FFB4A2" : task.priority === "low" ? "#CDEFD9" : "#FFE9A6";
      const title = task.title.length > 22 ? task.title.slice(0, 21) + "…" : task.title;
      const words = title.split(" ");
      const lines = [""];
      words.forEach((w) => {
        if ((lines[lines.length - 1] + " " + w).trim().length > 11 && lines[lines.length - 1]) lines.push(w);
        else lines[lines.length - 1] = (lines[lines.length - 1] + " " + w).trim();
      });
      return h("g", {
        transform: `matrix(1,-0.5,0,1,${R(x)},${R(y)})`, className: "note", role: "button", tabIndex: 0,
        "aria-label": "Task: " + task.title + ". Edit.",
        onClick, onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onClick()),
      },
        h("title", null, task.title),
        h("rect", { x: 1.5, y: 1.5, width: 34, height: 26, fill: "rgba(60,40,20,0.18)" }),
        h("rect", { width: 34, height: 26, fill: col }),
        h("circle", { cx: 17, cy: 2.5, r: 1.8, fill: "#D9534F" }),
        lines.slice(0, 3).map((l, n) => h("text", { key: n, x: 3, y: 9.5 + n * 6.2, className: "note-t" }, l)),
        task.status === "doing" && h("rect", { x: 26, y: 20, width: 6, height: 3, rx: 1.5, fill: "#1f8fa3" }));
    }

    function Room({ kind, color, name, sub, level, tasks, crew, onTask }) {
      const rc = recipe(kind, color);
      const wall = rc.wall, wallR = T(wall, -0.06), floor = rc.floor;
      const open = tasks.filter((t) => t.status !== "done");
      const notes = open.slice(0, 9);
      const people = crew.slice(0, SPOTS.length);
      // planks
      const planks = [];
      for (let k = 12; k < D; k += 14) {
        const p0 = P(0, k, 0), p1 = P(W, k, 0);
        planks.push(h("line", { key: k, x1: R(p0[0]), y1: R(p0[1]), x2: R(p1[0]), y2: R(p1[1]) }));
      }
      // window on right wall (plane b=0)
      const win = (a0, a1) => pts([[a0, 0, 44], [a1, 0, 44], [a1, 0, 96], [a0, 0, 96]]);
      const shaft = (a0, a1) => pts([[a0, 0, 44], [a1, 0, 44], [a1 + 40, 90, 0], [a0 + 40, 90, 0]]);
      const items = [...rc.items.map(([a, bb, el], n) => ({ d: a + bb, el: h("g", { key: "i" + n }, el) })),
        ...people.map((w, n) => {
          const [a, bb] = SPOTS[n];
          const [x, y] = P(a, bb, 0);
          return { d: a + bb + 1, el: h("g", { key: "p" + w.id, className: "crew-in", style: { animationDelay: n * 0.4 + "s" } },
            h(cn, { sx: x, sy: y, shirt: w.color, title: w.name, walk: n % 2 ? "walk-b" : "walk-a", delay: n * 0.9 }),
            h("g", { transform: `translate(${R(x)},${R(y - 30)})` },
              h("rect", { x: -w.name.length * 2.6 - 5, y: -7, width: w.name.length * 5.2 + 10, height: 12, rx: 6, fill: "rgba(255,248,236,0.92)", stroke: w.color, strokeWidth: 1 }),
              h("text", { y: 2, textAnchor: "middle", className: "crew-t" }, w.name))) };
        })].sort((x, y) => x.d - y.d);
      const plaque = P(W - 40, 0, 104);
      return h("svg", { className: "room", viewBox: "-250 -150 500 380", preserveAspectRatio: "xMidYMid meet", role: "img", "aria-label": `Inside ${name}` },
        h("defs", null,
          h("linearGradient", { id: "shaftG", x1: "0", y1: "0", x2: "0", y2: "1" },
            h("stop", { offset: "0", stopColor: "#FFF3C8", stopOpacity: "0.55" }),
            h("stop", { offset: "1", stopColor: "#FFF3C8", stopOpacity: "0" }))),
        h("ellipse", { cx: 0, cy: 225, rx: 250, ry: 22, fill: "rgba(0,0,0,0.18)" }),
        // floor slab edge
        h("polygon", { points: pts([[0, D, 0], [W, D, 0], [W, D, -10], [0, D, -10]]), fill: T(floor, -0.3) }),
        h("polygon", { points: pts([[W, 0, 0], [W, D, 0], [W, D, -10], [W, 0, -10]]), fill: T(floor, -0.4) }),
        h("polygon", { points: pts([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]]), fill: floor }),
        h("g", { stroke: T(floor, -0.12), strokeWidth: 0.8 }, planks),
        // walls
        h("polygon", { points: pts([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]]), fill: wall, stroke: T(wall, -0.2), strokeWidth: 1 }),
        h("polygon", { points: pts([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]]), fill: wallR, stroke: T(wall, -0.2), strokeWidth: 1 }),
        h("polygon", { points: pts([[0, 0, 0], [0, D, 0], [0, D, 7], [0, 0, 7]]), fill: T(color, 0.25) }),
        h("polygon", { points: pts([[0, 0, 0], [W, 0, 0], [W, 0, 7], [0, 0, 7]]), fill: T(color, 0.15) }),
        // top trim
        h("polygon", { points: pts([[0, D, H], [0, 0, H], [W, 0, H], [W, -6, H], [-6, -6, H], [-6, D, H]]), fill: T(color, -0.1) }),
        rc.green && h("polygon", { points: pts([[0, 40, 0], [0, 180, 0], [0, 180, 90], [0, 40, 90]]), fill: "#56B870", opacity: 0.9 }),
        // windows + light shafts
        [[36, 86], [120, 170]].map(([a0, a1], n) => h("g", { key: "w" + n },
          h("polygon", { points: win(a0 - 3, a1 + 3), fill: T(wall, -0.25) }),
          h("polygon", { points: win(a0, a1), fill: "#9ED8E6" }),
          h("polygon", { points: pts([[a0, 0, 70], [a1, 0, 70], [a1, 0, 71.5], [a0, 0, 71.5]]), fill: "#FFFFFF" }),
          h("polygon", { points: pts([[(a0 + a1) / 2, 0, 44], [(a0 + a1) / 2 + 1.5, 0, 44], [(a0 + a1) / 2 + 1.5, 0, 96], [(a0 + a1) / 2, 0, 96]]), fill: "#FFFFFF" }),
          h("polygon", { points: shaft(a0, a1), fill: "url(#shaftG)", className: "shaft" }))),
        // cork board with task notes
        !rc.green && h("polygon", { points: pts([[0, D - 10, H - 14], [0, D - 10 - 128, H - 14], [0, D - 10 - 128, H - 14 - 96], [0, D - 10, H - 14 - 96]]), fill: "#C9A171", stroke: "#9C6B45", strokeWidth: 2 }),
        notes.map((t, n) => h(Note, { key: t.id, task: t, u: (n % 3) * 40 + 4, v: Math.floor(n / 3) * 30 + 6, onClick: () => onTask(t) })),
        !notes.length && h("g", { transform: `matrix(1,-0.5,0,1,${R(P(0, D - 30, H - 50)[0])},${R(P(0, D - 30, H - 50)[1])})` },
          h("text", { className: "note-empty" }, "No open tasks ✨")),
        // level plaque on right wall
        h("g", { transform: `matrix(1,0.5,0,1,${R(plaque[0])},${R(plaque[1])})` },
          h("rect", { x: -2, y: -2, width: 40, height: 18, rx: 3, fill: color }),
          h("text", { x: 18, y: 11, textAnchor: "middle", className: "plaque-t" }, "LV " + level)),
        // ceiling lamp
        h("line", { x1: P(120, 100, H + 30)[0], y1: -150, x2: P(120, 100, H + 30)[0], y2: P(120, 100, H + 30)[1], stroke: "#44545A", strokeWidth: 1 }),
        h("circle", { cx: P(120, 100, H + 30)[0], cy: P(120, 100, H + 30)[1] + 4, r: 40, fill: "url(#lampGlowIn)", opacity: 0.0 }),
        items.map((x) => x.el),
      );
    }

    function Interior({ kind, color, name, sub, level, tasks, crew, onTask, onClose, onAdd, entering }) {
      const rc = recipe(kind, color);
      return h("div", { className: "interior", role: "dialog", "aria-label": `Inside ${name}` },
        h("div", { className: "interior-bg", style: { "--tint": color } }),
        h("div", { className: "interior-top" },
          h("button", { type: "button", className: "gbtn exit-btn", onClick: onClose },
            h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" },
              h("path", { d: "M15 18l-6-6 6-6" })),
            "Back to the island"),
          h("div", { className: "interior-title" },
            h("span", { className: "interior-dot", style: { background: color } }),
            h("span", null, name, h("small", null, " \xB7 ", rc.label)))),
        h("div", { className: "interior-stage" },
          h(Room, { kind, color, name, sub, level, tasks, crew, onTask })),
        onAdd && h("button", { type: "button", className: "gbtn primary pin-btn", onClick: onAdd }, "+ Pin a task"),
      );
    }

    return { Interior };
  })();
