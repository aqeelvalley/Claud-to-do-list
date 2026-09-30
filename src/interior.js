  /* ===================== Valley Isle · building interiors =====================
   * Tapping a building walks you inside: an isometric room furnished for
   * that venture, the crew at their stations and open tasks pinned to the
   * wall as sticky notes (tap one to edit it).
   */
  var Inside = (() => {
    const h = React.createElement;
    let W = 230, D = 210, H = 118; // room size in iso units (set per building)
    const P = (a, b, z = 0) => ye(a, b, z);
    const pts = (arr) => J(arr);
    const R = (v) => Math.round(v * 10) / 10;
    const lerp = (x, y, t) => x + (y - x) * t;

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

    function Console({ a, b: bb, c }) {
      // curved control desk: three angled segments with screens
      return h("g", null, [[-26, 8], [0, 0], [26, 8]].map(([db, da], k) => h("g", { key: k },
        box(a + da, bb + db, 0, 18, 24, 12, "#44545A"),
        box(a + da, bb + db, 12, 20, 26, 2, "#6E797F"),
        box(a + da - 6, bb + db, 14, 3, 20, 12, "#1F2A2F"),
        h("polygon", { points: me("right", { x: a + da - 6, y: bb + db, z: 14, w: 3, d: 20, h: 12 }, 0.08, 0.92, 0.12, 0.9), fill: k === 1 ? "#4CC38A" : "#5FB7E0", className: k === 1 ? "blink-slow" : "" }))),
        box(a + 24, bb, 0, 10, 10, 8, "#3E7CB1"), box(a + 28, bb, 8, 3, 10, 10, "#3E7CB1"));
    }
    function Spools({ a, b: bb }) {
      const cols = ["#E07B39", "#2A9D8F", "#E9B949", "#7E6BC4", "#E0474C", "#F6EDDF", "#3E7CB1", "#1F2A2F"];
      return h("g", null,
        box(a, bb, 0, 12, 60, 64, "#B98759"),
        [0, 1, 2].map((r) => box(a + 1, bb, 14 + r * 18, 12, 60, 1.6, "#8A5A3A")),
        [0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => h(re, { key: r + "-" + k, x: a + 4, y: bb - 22 + k * 14.5, z: 15.6 + r * 18, r: 5, r2: 5, h: 5, c: cols[(r * 4 + k) % cols.length], top: "#F6EDDF" }))));
    }
    function TableSaw({ a, b: bb }) {
      const [x, y] = P(a, bb, 18);
      return h("g", null,
        box(a, bb, 0, 30, 30, 16, "#6E797F"), box(a, bb, 16, 36, 36, 2, "#C9CED0"),
        h("g", { className: "spin-slow", style: { transformOrigin: `${R(x)}px ${R(y)}px` } },
          h("ellipse", { cx: R(x), cy: R(y), rx: 8, ry: 8, fill: "#E9EEF0", stroke: "#8C969B", strokeWidth: 1 }),
          [0, 1, 2, 3, 4, 5].map((k) => h("line", { key: k, x1: R(x), y1: R(y), x2: R(x + Math.cos(k) * 8), y2: R(y + Math.sin(k) * 8), stroke: "#9AA7AE", strokeWidth: 0.8 }))),
        box(a + 10, bb + 10, 18, 26, 8, 3, "#D8B384"));
    }
    function TimberRack({ a, b: bb }) {
      return h("g", null,
        [-24, 0, 24].map((d, k) => box(a, bb + d, 0, 6, 4, 58, "#7E5337")),
        [0, 1, 2, 3].map((r) => box(a + 6, bb, 10 + r * 13, 12, 58, 4, ["#D8B384", "#C99D6C", "#E4C08E", "#B98759"][r])));
    }
    function EditDesk({ a, b: bb }) {
      return h("g", null,
        box(a, bb, 0, 26, 46, 13, "#2E3338"),
        [-10, 10].map((d, k) => h("g", { key: k },
          box(a - 7, bb + d, 13, 3, 18, 12, "#1F2A2F"),
          h("polygon", { points: me("right", { x: a - 7, y: bb + d, z: 13, w: 3, d: 18, h: 12 }, 0.08, 0.92, 0.12, 0.9), fill: k ? "#E0474C" : "#7E6BC4" }))),
        box(a + 4, bb, 13, 8, 12, 1, "#9AA7AE"),
        box(a + 20, bb, 0, 10, 10, 8, "#E0474C"), box(a + 24, bb, 8, 3, 10, 12, "#E0474C"));
    }
    function CoffeeMachine({ a, b: bb }) {
      const [mx, my] = P(a, bb, 40);
      return h("g", null, box(a, bb, 23, 12, 18, 16, "#C9CED0"), box(a + 4, bb, 30, 4, 8, 2, "#44545A"), h(ss, { sx: mx, sy: my, n: 3, s: 0.8 }));
    }
    function Bollard({ a, b: bb }) { return h(re, { x: a, y: bb, r: 3, h: 10, c: "#E9B949", bands: [{ z1: 6, z2: 8, c: "#1F2A2F" }] }); }

    /* per-kind room recipes: floor items (depth sorted) + wall decor */
    function recipe(kind, c) {
      switch (kind) {
        case "refinery":
          return {
            wall: "#E6EEF3", floor: "#9AA3A6", board: "screens", view: "tanks",
            items: [
              [110, 90, h(Console, { a: 110, b: 90, c })],
              [60, 160, h(Desk, { a: 60, b: 160, c: "#F6EDDF", screen: "#9FD3F0" })],
              [180, 170, h(Plant, { a: 190, b: 180, s: 1.2 })],
              [150, 160, h(Rug, { a: 150, b: 150, c: "#3E7CB1", ra: 34, rb: 24 })],
            ],
            label: "Control room",
          };
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
              [200, 30, h(Spools, { a: 200, b: 36 })],
              [190, 170, h(Crates, { a: 190, b: 170 })],
            ],
            label: "Print floor",
          };
        case "mill":
          return {
            wall: "#F1E4D0", floor: "#D8B384",
            items: [
              [120, 90, h(TableSaw, { a: 120, b: 90 })],
              [60, 160, h(Lumber, { a: 60, b: 160 })],
              [180, 150, h(Workbench, { a: 180, b: 150 })],
              [200, 30, h(TimberRack, { a: 204, b: 40 })],
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
              [41, 72, h(CoffeeMachine, { a: 40, b: 72 })],
              [120, 60, h(Table, { a: 120, b: 60 })],
              [170, 120, h(Table, { a: 170, b: 120, chairs: "#2A9D8F" })],
              [110, 160, h(Table, { a: 110, b: 160 })],
              [200, 40, h(Plant, { a: 200, b: 40, s: 1.2 })],
            ],
            label: "Espresso bar",
          };
        case "film":
          return {
            wall: "#EDE7F0", floor: "#6B5E6E", green: true, board: "white",
            items: [
              [130, 110, h(Camera, { a: 130, b: 110 })],
              [100, 170, h(RingLight, { a: 100, b: 170 })],
              [160, 60, h(RingLight, { a: 170, b: 30 })],
              [60, 40, h(EditDesk, { a: 190, b: 150 })],
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
              [40, 140, h(Weights, { a: 30, b: 140, c })],
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
            label: "Lamp room & treasury",
          };
        case "marina":
          return {
            wall: "#F4EEE3", floor: "#C49A6C", board: "cork", boardTitle: "ORDERS & SPONSORS",
            items: [
              [120, 60, h(Desk, { a: 120, b: 60, c: "#9C6B45", screen: "#7FD1DC" })],
              [60, 140, h(Rug, { a: 100, b: 130, c: "#1F7A8C" })],
              [16, 150, h(Shelf, { a: 16, b: 150, c: "#9C6B45", items: ["#1F7A8C", "#F6EDDF", "#E0474C", "#E9B949"] })],
              [180, 150, h(Plant, { a: 180, b: 150, s: 1.2 })],
              [150, 120, h(Bollard, { a: 150, b: 120 })],
            ],
            label: "Harbour office",
          };
        case "hub":
          return {
            wall: "#E3E1D8", floor: "#B7B0A2", board: "white", boardTitle: "LEADS IN PROGRESS",
            items: [
              [60, 60, h(Crates, { a: 60, b: 60 })],
              [60, 150, h(Crates, { a: 60, b: 150 })],
              [150, 60, h(Desk, { a: 150, b: 60, screen: "#7FD1DC" })],
              [200, 150, h(Crates, { a: 200, b: 160 })],
              [130, 130, h(Bollard, { a: 130, b: 130 })],
            ],
            label: "Warehouse floor",
          };
        case "port":
          return {
            wall: "#E3EEF0", floor: "#B7B0A2", board: "white", boardTitle: "TENDERS & RFQs", view: "sea",
            items: [
              [40, 50, h(Crates, { a: 40, b: 50 })],
              [40, 150, h(Crates, { a: 40, b: 150 })],
              [150, 60, h(Desk, { a: 150, b: 60, screen: "#7FD1DC" })],
              [120, 110, h(Desk, { a: 120, b: 120, c: "#F6EDDF", screen: "#9FD3F0" })],
              [200, 190, h(Bollard, { a: 200, b: 190 })],
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
              [16, 160, h(Shelf, { a: 16, b: 160 })],
              [120, 110, h(Table, { a: 120, b: 110, chairs: T(c, -0.1) })],
              [200, 165, h(Plant, { a: 200, b: 165, s: 1.2 })],
            ],
            label: kind === "cottage" ? "Living room" : "Main room",
          };
      }
    }

    /* stations where crew stand, in iso floor coords */
    const SPOTS = [[95, 70], [90, 140], [175, 95], [130, 180], [180, 150], [70, 190]];

    /* sticky note on the left wall (plane a=0). u runs along -b, v down from top */
    function Note({ task, u, v, onClick, style = "cork", working, at }) {
      const [x, y] = at || P(0, D - 16 - u, H - 22 - v);
      const col = style === "screens" ? "#15232A" : style === "white" ? "#FFFFFF" : task.priority === "high" ? "#FFB4A2" : task.priority === "low" ? "#CDEFD9" : "#FFE9A6";
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
        h("rect", { width: 34, height: 26, fill: col, stroke: style === "screens" ? "#3E5560" : "none", strokeWidth: 1 }),
        style === "white" && h("rect", { width: 34, height: 3.5, fill: task.priority === "high" ? "#E0474C" : task.priority === "low" ? "#4CC38A" : "#F2C14E" }),
        style === "cork" && h("circle", { cx: 17, cy: 2.5, r: 1.8, fill: "#D9534F" }),
        lines.slice(0, 3).map((l, n) => h("text", { key: n, x: 3, y: 9.5 + n * 6.2, className: "note-t" + (style === "screens" ? " scr" : "") }, l)),
        working && h("g", null, h("rect", { x: 1, y: 19.5, width: 22, height: 5.5, rx: 2.7, fill: working.color }), h("text", { x: 12, y: 23.6, textAnchor: "middle", className: "note-w" }, "working")),
        task.status === "doing" && h("rect", { x: 26, y: 20, width: 6, height: 3, rx: 1.5, fill: "#1f8fa3" }));
    }

    /* a big window on the right wall looking out at the tanks or the sea */
    function ViewWindow({ view, wall }) {
      const a0 = 30, a1 = 205, z0 = 36, z1 = 104;
      const q = (u0, u1, v0, v1) => pts([[lerp(a0, a1, u0), 0, lerp(z0, z1, v0)], [lerp(a0, a1, u1), 0, lerp(z0, z1, v0)], [lerp(a0, a1, u1), 0, lerp(z0, z1, v1)], [lerp(a0, a1, u0), 0, lerp(z0, z1, v1)]]);
      const tank = (u, w, hgt, c) => h("g", null, h("polygon", { points: q(u, u + w, 0.08, hgt), fill: c }), h("polygon", { points: q(u, u + w, hgt - 0.05, hgt), fill: T(c, 0.12) }));
      return h("g", null,
        h("polygon", { points: q(-0.02, 1.02, -0.05, 1.05), fill: T(wall, -0.3) }),
        h("polygon", { points: q(0, 1, 0, 1), fill: view === "tanks" ? "#F4C9A0" : "#9ED8E6" }),
        h("polygon", { points: q(0, 1, 0.55, 1), fill: view === "tanks" ? "#F6DDB8" : "#BDE8F0" }),
        view === "tanks" && h("g", null,
          tank(0.05, 0.16, 0.5, "#E9E6DE"), tank(0.25, 0.12, 0.42, "#DAD6CC"),
          h("polygon", { points: q(0.46, 0.5, 0.08, 0.95), fill: "#C9CED0" }), h("polygon", { points: q(0.56, 0.59, 0.08, 0.8), fill: "#C9CED0" }),
          h("polygon", { points: q(0.62, 0.95, 0.08, 0.28), fill: "#AEB5B8" }),
          h("polygon", { points: q(0.84, 0.855, 0.08, 1), fill: "#9AA7AE" }),
          h("circle", { cx: P(lerp(a0, a1, 0.85), 0, z1 - 2)[0], cy: P(lerp(a0, a1, 0.85), 0, z1 - 2)[1], r: 3, fill: "#FF9A3C", className: "flame-in" }),
          h("polygon", { points: q(0, 1, 0, 0.1), fill: "#A39A8A" })),
        view === "sea" && h("g", null,
          h("polygon", { points: q(0, 1, 0, 0.42), fill: "#2FA7B5" }),
          h("polygon", { points: q(0.1, 0.5, 0.1, 0.26), fill: "#2F4E5A" }), h("polygon", { points: q(0.2, 0.4, 0.26, 0.42), fill: "#E0474C" }),
          h("polygon", { points: q(0.64, 0.66, 0.1, 0.95), fill: "#E0474C" }), h("polygon", { points: q(0.55, 0.95, 0.86, 0.92), fill: "#E0474C" })),
        [0.33, 0.66].map((u, k) => h("polygon", { key: k, points: q(u, u + 0.012, 0, 1), fill: T(wall, -0.3) })),
        h("polygon", { points: q(0, 1, 0.48, 0.51), fill: T(wall, -0.3) }));
    }

    /* the lighthouse: a round room with a spiral stair up to the lamp */
    function RoundRoom({ color, level, tasks, crew, onTask, goals = [], treasury = { sum: 0, target: 200000 } }) {
      const RR = 132, cx = 0, cy = 70, HH = 150;
      const rx = RR * 1.4142, ry = RR * 0.7071;
      const at = (th, z = 0, r = RR) => [cx + Math.cos(th) * r * 1.4142, cy + Math.sin(th) * r * 0.7071 - z];
      const pct = Math.min(1, treasury.sum / (treasury.target || 200000));
      // back half of the wall: angles PI..2PI
      const wallPath = `M${cx - rx},${cy} A${rx},${ry} 0 0 1 ${cx + rx},${cy} L${cx + rx},${cy - HH} A${rx},${ry} 0 0 0 ${cx - rx},${cy - HH} Z`;
      const steps = [];
      for (let k = 0; k < 18; k++) {
        const th = k * 0.5 + 0.3, z = k * 8.2, r0 = 16, r1 = 50;
        const p0 = at(th, z, r0), p1 = at(th, z, r1), p2 = at(th + 0.38, z, r1), p3 = at(th + 0.38, z, r0);
        const behind = Math.sin(th + 0.19) < 0;
        steps.push({ behind, el: h("g", { key: k },
          h("polygon", { points: [p0, p1, p2, p3].map((p) => p.join(",")).join(" "), fill: "#B98759", stroke: "rgba(60,40,22,0.35)", strokeWidth: 0.7 }),
          h("polygon", { points: [p1, p2, [p2[0], p2[1] + 4], [p1[0], p1[1] + 4]].map((p) => p.join(",")).join(" "), fill: "#8A5A3A" })) });
      }
      const railPts = []; for (let k = 0; k <= 60; k++) { const th = 0.3 + k * 0.15, z = k * 2.46 + 16; railPts.push(at(th, z, 50)); }
      const people = crew.slice(0, 5);
      const spots = [[2.2, 95], [2.8, 100], [0.6, 96], [1.3, 104], [3.3, 90]];
      const notes = tasks.filter((t) => t.status !== "done").slice(0, 4);
      const plaques = goals.filter((g) => g.progress < 100).slice(0, 5);
      return h("svg", { className: "room", viewBox: "-250 -170 500 400", preserveAspectRatio: "xMidYMid meet", role: "img", "aria-label": "Inside the lighthouse" },
        h("defs", null,
          h("radialGradient", { id: "lampG" }, h("stop", { offset: "0", stopColor: "#FFF6CC", stopOpacity: String(0.6 + pct * 0.4) }), h("stop", { offset: "1", stopColor: "#FFD86B", stopOpacity: "0" })),
          h("linearGradient", { id: "stoneG", x1: "0", x2: "1" }, h("stop", { offset: "0", stopColor: "#EFE6D6" }), h("stop", { offset: "0.5", stopColor: "#F8F1E4" }), h("stop", { offset: "1", stopColor: "#D9CDB8" }))),
        h("ellipse", { cx, cy: cy + 16, rx: rx + 20, ry: ry + 12, fill: "rgba(0,0,0,0.2)" }),
        h("path", { d: wallPath, fill: "url(#stoneG)", stroke: "#BFB29A", strokeWidth: 1.5 }),
        [30, 60, 90, 120].map((z) => h("path", { key: z, d: `M${cx - rx},${cy - z} A${rx},${ry} 0 0 1 ${cx + rx},${cy - z}`, stroke: "rgba(150,120,80,0.2)", fill: "none" })),
        h("path", { d: `M${cx - rx},${cy - 60} A${rx},${ry} 0 0 1 ${cx + rx},${cy - 60} L${cx + rx},${cy - 75} A${rx},${ry} 0 0 0 ${cx - rx},${cy - 75} Z`, fill: "#C8543C", opacity: 0.85 }),
        // porthole windows
        [3.6, 4.7, 5.8].map((th, k) => { const [x, y] = at(th, 100); return h("g", { key: k }, h("ellipse", { cx: x, cy: y, rx: 12, ry: 15, fill: "#8A7A66" }), h("ellipse", { cx: x, cy: y, rx: 9, ry: 12, fill: "#8FD3E0" }), h("path", { d: `M${x - 9},${y + 3} q9,-4 18,0`, stroke: "#2FA7B5", strokeWidth: 3, fill: "none" })); }),
        // floor
        h("ellipse", { cx, cy, rx, ry, fill: "#D8C29A", stroke: "#B39A6E", strokeWidth: 2 }),
        [0.8, 0.55].map((f, k) => h("ellipse", { key: k, cx, cy, rx: rx * f, ry: ry * f, fill: "none", stroke: "rgba(140,100,60,0.3)", strokeDasharray: "6 5" })),
        // lamp room glowing through the ceiling opening
        h("ellipse", { cx, cy: cy - HH - 16, rx: 70, ry: 36, fill: "url(#lampG)", className: "glow-pulse" }),
        h("ellipse", { cx, cy: cy - HH, rx: 48, ry: 22, fill: "#44545A" }),
        h("ellipse", { cx, cy: cy - HH - 4, rx: 38, ry: 17, fill: "#FFF1B8" }),
        h("rect", { x: cx - 14, y: cy - HH - 34, width: 28, height: 26, rx: 5, fill: "#FFE7A0", stroke: "#B98A22", strokeWidth: 1.5 }),
        h("g", { className: "beam-spin", style: { transformOrigin: `${cx}px ${cy - HH - 22}px` } }, h("path", { d: `M${cx},${cy - HH - 22} L${cx + 120},${cy - HH - 48} L${cx + 120},${cy - HH + 4} Z`, fill: "rgba(255,244,200,0.35)" })),
        // treasury gauge on the wall
        (() => { const [x, y] = at(4.2, 130); return h("g", { transform: `translate(${x - 44},${y - 10})` },
          h("rect", { width: 88, height: 28, rx: 6, fill: "#FFF8EC", stroke: "#E9C66D", strokeWidth: 1.5 }),
          h("text", { x: 44, y: 11, textAnchor: "middle", className: "tr-t" }, "TREASURY " + Math.round(pct * 100) + "%"),
          h("rect", { x: 8, y: 16, width: 72, height: 6, rx: 3, fill: "#F2E3C0" }),
          h("rect", { x: 8, y: 16, width: Math.max(3, 72 * pct), height: 6, rx: 3, fill: "#E9A727" })); })(),
        // goal plaques around the wall
        plaques.map((g, k) => { const [x, y] = at(3.45 + k * 0.62, 40); return h("g", { key: g.id, transform: `translate(${x - 26},${y - 16})` },
          h("rect", { width: 52, height: 26, rx: 4, fill: "#6E4A33", stroke: "#E9B949", strokeWidth: 1.2 }),
          h("text", { x: 26, y: 10, textAnchor: "middle", className: "plq-t" }, g.title.length > 14 ? g.title.slice(0, 13) + "\u2026" : g.title),
          h("rect", { x: 6, y: 15, width: 40, height: 4.5, rx: 2, fill: "rgba(255,255,255,0.25)" }),
          h("rect", { x: 6, y: 15, width: Math.max(2, 40 * g.progress / 100), height: 4.5, rx: 2, fill: "#E9B949" })); }),
        // task notes pinned on the wall
        notes.map((t, k) => { const [x, y] = at(5.5 + k * 0.28, 22); return h(Note, { key: t.id, task: t, at: [x - 17, y - 26], onClick: () => onTask(t) }); }),
        // stair: steps behind the column, the column, then steps in front
        steps.filter((s2) => s2.behind).map((s2) => s2.el),
        h("rect", { x: cx - 16 * 1.41, y: cy - HH, width: 32 * 1.41, height: HH, fill: "#E4D8C0", stroke: "#BFB29A" }),
        h("ellipse", { cx, cy, rx: 16 * 1.41, ry: 16 * 0.71, fill: "#D9CDB8" }),
        steps.filter((s2) => !s2.behind).map((s2) => s2.el),
        h("polyline", { points: railPts.map((p) => p.join(",")).join(" "), fill: "none", stroke: "#6E4A33", strokeWidth: 1.6 }),
        // treasure chest + coins
        (() => { const [x, y] = at(0.9, 0, 88); return h("g", { transform: `translate(${x},${y})` },
          h("rect", { x: -16, y: -18, width: 32, height: 18, rx: 2, fill: "#8A5A3A", stroke: "#5A3A22" }),
          h("path", { d: "M-16,-18 q16,-14 32,0 z", fill: "#9C6B45", stroke: "#5A3A22" }),
          h("rect", { x: -16, y: -12, width: 32, height: 3, fill: "#E9B949" }),
          [[-22, 2], [20, 3], [-6, 6], [10, 7]].map(([dx, dy], k) => h("ellipse", { key: k, cx: dx, cy: dy, rx: 5, ry: 2.2, fill: "#F2C14E", stroke: "#B98A22", strokeWidth: 0.6 }))); })(),
        // crew
        people.map((w, n) => { const [x, y] = at(spots[n][0], 0, spots[n][1]); return h("g", { key: w.id },
          h("g", { transform: `translate(${x},${y}) scale(1.7) translate(${-x},${-y})` }, h(cn, { sx: x, sy: y, shirt: w.color, title: w.name, walk: n % 2 ? "walk-b" : "walk-a", delay: n })),
          h("g", { transform: `translate(${x},${y - 44})` },
            h("rect", { x: -w.name.length * 2.6 - 5, y: -7, width: w.name.length * 5.2 + 10, height: 12, rx: 6, fill: "rgba(255,248,236,0.92)", stroke: w.color }),
            h("text", { y: 2, textAnchor: "middle", className: "crew-t" }, w.name))); }),
        // level plaque
        h("g", { transform: `translate(${cx + rx - 60},${cy - HH + 14})` }, h("rect", { width: 40, height: 18, rx: 3, fill: color }), h("text", { x: 20, y: 12.5, textAnchor: "middle", className: "plaque-t" }, "LV " + level)),
      );
    }

    /* each building's shell: size, roof, wall finish and openings */
    const SHELLS = {
      refinery: { W: 240, D: 210, H: 118, roof: "flat", tex: "concrete" },
      drafting: { W: 236, D: 200, H: 112, roof: "flat", tex: "glass" },
      office: { W: 236, D: 200, H: 112, roof: "flat", tex: "glass" },
      maker: { W: 270, D: 200, H: 96, roof: "saw", tex: "corrugated" },
      mill: { W: 270, D: 200, H: 88, roof: "gable", rise: 70, tex: "planks", open: "barn" },
      cafe: { W: 210, D: 175, H: 100, roof: "flat", tex: "brick", open: "shopfront" },
      film: { W: 240, D: 220, H: 124, roof: "flat", tex: "acoustic" },
      gym: { W: 280, D: 180, H: 104, roof: "flat", tex: "mirror", open: "tall" },
      port: { W: 230, D: 200, H: 104, roof: "flat", tex: "corrugated" },
      hub: { W: 270, D: 210, H: 96, roof: "gable", rise: 30, tex: "corrugated", open: "roller" },
      marina: { W: 210, D: 180, H: 96, roof: "gable", rise: 44, tex: "planks", open: "porthole" },
      cottage: { W: 226, D: 196, H: 90, roof: "gable", rise: 64, tex: "timber", open: "cottage", fire: true },
      house: { W: 220, D: 190, H: 96, roof: "gable", rise: 50, tex: "plaster" },
      townhall: { W: 250, D: 210, H: 124, roof: "flat", tex: "plaster" },
    };
    SHELLS.shop = SHELLS.cafe; SHELLS.tower = SHELLS.office; SHELLS.farm = SHELLS.mill;
    const lerp2 = (x, y, t) => x + (y - x) * t;
    function Shell({ sh, wall, color }) {
      const rise = sh.rise || 0, out = [];
      const add = (el) => out.push(h("g", { key: out.length }, el));
      const poly = (p3, fill, st, sw = 1) => h("polygon", { points: pts(p3), fill, stroke: st, strokeWidth: st ? sw : 0 });
      const lineW = (p0, p1, c, w = 1) => { const [x0, y0] = P(...p0), [x1, y1] = P(...p1); return h("line", { x1: R(x0), y1: R(y0), x2: R(x1), y2: R(y1), stroke: c, strokeWidth: w }); };
      const dark = sh.tex === "acoustic", glass = sh.tex === "glass";
      const wL = dark ? "#2E3338" : glass ? "#DDE6EA" : wall, wR = dark ? "#262B30" : glass ? "#D0DADF" : T(wall, -0.06);
      // left wall (a=0); with a gable roof it is the gable end and rises to a peak
      add(poly(rise ? [[0, 0, 0], [0, D, 0], [0, D, H], [0, D / 2, H + rise], [0, 0, H]] : [[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], wL, T(wL, -0.2)));
      add(poly([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], wR, T(wR, -0.2)));
      // wall finishes
      const texL = [], texR = [];
      if (sh.tex === "planks" || sh.tex === "timber") {
        for (let z = 8; z < H; z += sh.tex === "planks" ? 8 : 200) { texR.push(lineW([0, 0.5, z], [W, 0.5, z], "rgba(90,50,20,0.25)", 0.8)); texL.push(lineW([0.5, 0, z], [0.5, D, z], "rgba(90,50,20,0.25)", 0.8)); }
        if (sh.tex === "timber") { for (let a = 30; a < W; a += 50) texR.push(lineW([a, 0.5, 0], [a, 0.5, H], "#9C6B45", 3)); for (let b = 30; b < D; b += 50) texL.push(lineW([0.5, b, 0], [0.5, b, H], "#9C6B45", 3)); texR.push(lineW([0, 0.5, H * 0.6], [W, 0.5, H * 0.6], "#9C6B45", 2.4)); }
      } else if (sh.tex === "corrugated") {
        for (let a = 4; a < W; a += 5) texR.push(lineW([a, 0.5, 0], [a, 0.5, H], "rgba(60,70,80,0.16)", 0.9));
        for (let b = 4; b < D; b += 5) texL.push(lineW([0.5, b, 0], [0.5, b, H + (rise ? rise * (1 - Math.abs(b - D / 2) / (D / 2)) : 0)], "rgba(60,70,80,0.16)", 0.9));
      } else if (sh.tex === "brick") {
        for (let z = 6, row = 0; z < H; z += 6, row++) { texR.push(lineW([0, 0.5, z], [W, 0.5, z], "rgba(140,60,40,0.18)", 0.7)); for (let a = row % 2 ? 7 : 0; a < W; a += 14) texR.push(lineW([a, 0.5, z - 6], [a, 0.5, z], "rgba(140,60,40,0.15)", 0.6)); }
        for (let z = 6; z < H; z += 6) texL.push(lineW([0.5, 0, z], [0.5, D, z], "rgba(140,60,40,0.18)", 0.7));
      } else if (sh.tex === "acoustic") {
        for (let a = 16; a < W - 20; a += 26) for (let z = 16; z < H - 10; z += 26) texR.push(poly([[a, 0.6, z], [a + 20, 0.6, z], [a + 20, 0.6, z + 20], [a, 0.6, z + 20]], "#3B4046", "#1F2226", 0.6));
        texR.push(poly([[0, 0.5, H - 8], [W, 0.5, H - 8], [W, 0.5, H], [0, 0.5, H]], "#E0474C"));
        texL.push(poly([[0.5, 0, H - 8], [0.5, D, H - 8], [0.5, D, H], [0.5, 0, H]], "#E0474C"));
      } else if (sh.tex === "concrete") {
        for (let a = 60; a < W; a += 60) texR.push(lineW([a, 0.5, 0], [a, 0.5, H], "rgba(80,90,100,0.18)", 1));
        texR.push(lineW([0, 0.5, H / 2], [W, 0.5, H / 2], "rgba(80,90,100,0.14)", 1));
      } else if (sh.tex === "glass") {
        const view = [];
        for (let a = 0; a < W; a += 34) view.push(poly([[a + 4, 0.3, 0], [a + 30, 0.3, 0], [a + 30, 0.3, 30 + ((a * 7) % 50)], [a + 4, 0.3, 30 + ((a * 7) % 50)]], "rgba(120,150,170,0.45)"));
        texR.push(poly([[0, 0.2, 8], [W, 0.2, 8], [W, 0.2, H - 6], [0, 0.2, H - 6]], "#A9D6E6"), ...view);
        for (let a = 0; a <= W; a += 34) texR.push(lineW([a, 0.8, 0], [a, 0.8, H], "#B7C4CA", 2.2));
        [H * 0.5].forEach((z) => texR.push(lineW([0, 0.8, z], [W, 0.8, z], "#B7C4CA", 2)));
      } else if (sh.tex === "mirror") {
        texL.push(poly([[0.5, 10, 8], [0.5, 60, 8], [0.5, 60, H - 14], [0.5, 10, H - 14]], "#CFE3EA", "#9AA7AE", 2));
        texL.push(poly([[0.6, 16, 30], [0.6, 30, 30], [0.6, 30, H - 30], [0.6, 16, H - 30]], "rgba(255,255,255,0.45)"));
      }
      out.push(...texL.map((e, k) => h("g", { key: "tl" + k }, e)), ...texR.map((e, k) => h("g", { key: "tr" + k }, e)));
      // openings on the right wall
      const win = (a0, a1, z0, z1, frame = T(wall, -0.25)) => [poly([[a0 - 3, 0, z0 - 3], [a1 + 3, 0, z0 - 3], [a1 + 3, 0, z1 + 3], [a0 - 3, 0, z1 + 3]], frame), poly([[a0, 0, z0], [a1, 0, z0], [a1, 0, z1], [a0, 0, z1]], "#9ED8E6"), poly([[a0, 0, (z0 + z1) / 2], [a1, 0, (z0 + z1) / 2], [a1, 0, (z0 + z1) / 2 + 1.5], [a0, 0, (z0 + z1) / 2 + 1.5]], "#FFFFFF"), poly([[(a0 + a1) / 2, 0, z0], [(a0 + a1) / 2 + 1.5, 0, z0], [(a0 + a1) / 2 + 1.5, 0, z1], [(a0 + a1) / 2, 0, z1]], "#FFFFFF")];
      const shaft = (a0, a1, z0, z1) => poly([[a0, 0, z0], [a1, 0, z0], [a1 + 40, 90, 0], [a0 + 40, 90, 0]], "url(#shaftG)");
      const o = sh.open;
      if (o === "shopfront") {
        add(h("g", null, ...win(24, W - 24, 10, 76, "#6E4A33")));
        for (let k = 0; k < 8; k++) add(poly([[24 + k * (W - 48) / 8, 0.3, 76], [24 + (k + 1) * (W - 48) / 8, 0.3, 76], [24 + (k + 1) * (W - 48) / 8, 0.3, 66], [24 + k * (W - 48) / 8, 0.3, 66]], k % 2 ? "#FFF8EC" : "#D9734E"));
        add(shaft(40, W - 40, 10, 76));
      } else if (o === "barn") {
        add(h("g", null, ...win(24, 70, 40, 76)));
        add(poly([[110, 0, 0], [200, 0, 0], [200, 0, 76], [110, 0, 76]], "#7E5337", "#5A3A22", 2));
        add(lineW([110, 0.6, 0], [200, 0.6, 76], "#E9D2A6", 2.2)); add(lineW([110, 0.6, 76], [200, 0.6, 0], "#E9D2A6", 2.2)); add(lineW([155, 0.6, 0], [155, 0.6, 76], "#5A3A22", 1.4));
        add(shaft(24, 70, 40, 76));
      } else if (o === "roller") {
        add(poly([[150, 0, 0], [230, 0, 0], [230, 0, 72], [150, 0, 72]], "#9AA7AE", "#6E777C", 2));
        for (let z = 6; z < 72; z += 6) add(lineW([150, 0.6, z], [230, 0.6, z], "#7E878C", 0.8));
        add(h("g", null, ...win(30, 110, 50, 80)));
      } else if (o === "tall") {
        for (let k = 0; k < 5; k++) { const a0 = 20 + k * 50; add(h("g", null, ...win(a0, a0 + 36, 14, 92, "#DDE3E6"))); add(shaft(a0, a0 + 36, 14, 92)); }
      } else if (o === "porthole") {
        [70, 150].forEach((a) => { const [x, y] = P(a, 0, 62); add(h("g", null, h("ellipse", { cx: R(x), cy: R(y), rx: 16, ry: 20, fill: "#B98759" }), h("ellipse", { cx: R(x), cy: R(y), rx: 12, ry: 15, fill: "#9ED8E6" }), h("path", { d: `M${R(x - 12)},${R(y + 4)} q12,-5 24,0`, stroke: "#2FA7B5", strokeWidth: 3, fill: "none" }))); });
        const [lx, ly] = P(110, 0, 70); add(h("g", null, h("circle", { cx: R(lx), cy: R(ly), r: 12, fill: "none", stroke: "#E0474C", strokeWidth: 5 }), h("circle", { cx: R(lx), cy: R(ly), r: 12, fill: "none", stroke: "#FFF8EC", strokeWidth: 5, strokeDasharray: "6 6" })));
      } else if (o === "cottage") {
        add(h("g", null, ...win(24, 64, 34, 70))); add(h("g", null, ...win(160, 200, 34, 70)));
        [24, 160].forEach((a) => { add(poly([[a - 6, 0.4, 72], [a + 8, 0.4, 72], [a + 4, 0.4, 30], [a - 6, 0.4, 30]], "#C2577A")); add(poly([[a + 32, 0.4, 72], [a + 46, 0.4, 72], [a + 46, 0.4, 30], [a + 36, 0.4, 30]], "#C2577A")); });
      } else if (!sh.noWin && sh.tex !== "glass" && sh.tex !== "acoustic" && !sh.view) {
        [[36, 86], [120, 170]].forEach(([a0, a1]) => { add(h("g", null, ...win(a0, a1, 44, 96))); add(shaft(a0, a1, 44, 96)); });
      }
      if (sh.fire) {
        add(poly([[92, 0, 0], [138, 0, 0], [138, 0, 58], [92, 0, 58]], "#B5654A", "#8A4A33", 1.5));
        add(poly([[102, 0.4, 4], [128, 0.4, 4], [128, 0.4, 34], [102, 0.4, 34]], "#2B1D14"));
        const [fx, fy] = P(115, 0.5, 8); add(h("g", { className: "flame-in" }, h("ellipse", { cx: R(fx), cy: R(fy - 6), rx: 7, ry: 10, fill: "#F08A4B" }), h("ellipse", { cx: R(fx), cy: R(fy - 4), rx: 3.5, ry: 6, fill: "#FFE3A0" })));
        add(poly([[86, 0, 58], [144, 0, 58], [144, 8, 62], [86, 8, 62]], "#9C6B45"));
      }
      // roof inside: the back slope and rafters of a gable, or sawtooth skylights
      if (sh.roof === "gable") {
        add(poly([[0, 0, H], [W, 0, H], [W, D / 2, H + rise], [0, D / 2, H + rise]], sh.tex === "corrugated" ? "#C9CED0" : "#C99D6C", "rgba(60,40,22,0.3)"));
        for (let a = 20; a < W; a += 36) add(lineW([a, 0, H], [a, D / 2, H + rise], sh.tex === "corrugated" ? "#8C969B" : "#7E5337", 3.2));
        add(lineW([0, D / 2, H + rise], [W, D / 2, H + rise], sh.tex === "corrugated" ? "#6E777C" : "#6E4A33", 4));
      } else if (sh.roof === "saw") {
        const n = 4, tw = W / n, rz = 30;
        for (let k = 0; k < n; k++) {
          const a0 = k * tw, a1 = a0 + tw;
          add(poly([[a0, 0, H], [a0, D * 0.55, H], [a0, D * 0.55, H + rz], [a0, 0, H + rz]], "rgba(158,216,230,0.85)", "#6E8184"));
          add(poly([[a0, 0, H + rz], [a1, 0, H], [a1, D * 0.55, H], [a0, D * 0.55, H + rz]], k % 2 ? "#8FB8AF" : "#9CC2B9", "rgba(40,80,70,0.3)"));
          add(poly([[a0, 0, H], [a0 + 40, 90, 0], [a0 + 70, 90, 0], [a0 + 30, 0, H]], "url(#shaftG)"));
        }
      }
      return h("g", null, out);
    }

    function Room({ kind, color, name, sub, level, tasks, crew, onTask, workingIds = {} }) {
      const rc = recipe(kind, color);
      const sh = { ...(SHELLS[kind] || SHELLS.house), ...(rc.view ? { view: true } : {}) };
      W = sh.W; D = sh.D; H = sh.H;
      const top = H + (sh.rise || 0) + (sh.roof === "saw" ? 30 : 0);
      const board = rc.board || "cork";
      const wall = rc.wall, wallR = T(wall, -0.06), floor = rc.floor;
      const open = tasks.filter((t) => t.status !== "done");
      const rows = Math.max(1, Math.min(3, Math.floor((H - 40) / 30)));
      const notes = open.slice(0, rows * 3);
      const people = crew.slice(0, SPOTS.length);
      // planks
      const planks = [];
      for (let k = 12; k < D; k += 14) {
        const p0 = P(0, k, 0), p1 = P(W, k, 0);
        planks.push(h("line", { key: k, x1: R(p0[0]), y1: R(p0[1]), x2: R(p1[0]), y2: R(p1[1]) }));
      }
      const items = [...rc.items.map(([a, bb, el], n) => ({ d: a + bb, el: h("g", { key: "i" + n }, el) })),
        ...people.map((w, n) => {
          const [a, bb] = SPOTS[n];
          const [x, y] = P(a, bb, 0);
          return { d: a + bb + 1, el: h("g", { key: "p" + w.id, className: "crew-in", style: { animationDelay: n * 0.4 + "s" } },
            h("g", { transform: `translate(${R(x)},${R(y)}) scale(1.7) translate(${R(-x)},${R(-y)})` },
              h(cn, { sx: x, sy: y, shirt: w.color, title: w.name, walk: n % 2 ? "walk-b" : "walk-a", delay: n * 0.9 })),
            h("g", { transform: `translate(${R(x)},${R(y - 44)})` },
              h("rect", { x: -w.name.length * 2.6 - 5, y: -7, width: w.name.length * 5.2 + 10, height: 12, rx: 6, fill: "rgba(255,248,236,0.92)", stroke: w.color, strokeWidth: 1 }),
              h("text", { y: 2, textAnchor: "middle", className: "crew-t" }, w.name))) };
        })].sort((x, y) => x.d - y.d);
      const plaque = P(W - 40, 0, 104);
      const vb = [-D - 30, -top - 40, W + D + 60, top + (W + D) / 2 + 80];
      return h("svg", { className: "room", viewBox: vb.join(" "), preserveAspectRatio: "xMidYMid meet", role: "img", "aria-label": `Inside ${name}` },
        h("defs", null,
          h("linearGradient", { id: "shaftG", x1: "0", y1: "0", x2: "0", y2: "1" },
            h("stop", { offset: "0", stopColor: "#FFF3C8", stopOpacity: "0.55" }),
            h("stop", { offset: "1", stopColor: "#FFF3C8", stopOpacity: "0" }))),
        h("ellipse", { cx: (W - D) / 2, cy: (W + D) / 2 + 12, rx: (W + D) / 2 + 20, ry: 22, fill: "rgba(0,0,0,0.18)" }),
        // floor slab edge
        h("polygon", { points: pts([[0, D, 0], [W, D, 0], [W, D, -10], [0, D, -10]]), fill: T(floor, -0.3) }),
        h("polygon", { points: pts([[W, 0, 0], [W, D, 0], [W, D, -10], [W, 0, -10]]), fill: T(floor, -0.4) }),
        h("polygon", { points: pts([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]]), fill: floor }),
        h("g", { stroke: T(floor, -0.12), strokeWidth: 0.8 }, planks),
        // walls, finishes, openings and roof, shaped like the building outside
        h(Shell, { sh, wall, color }),
        h("polygon", { points: pts([[0, 0, 0], [0, D, 0], [0, D, 7], [0, 0, 7]]), fill: T(color, 0.25) }),
        h("polygon", { points: pts([[0, 0, 0], [W, 0, 0], [W, 0, 7], [0, 0, 7]]), fill: T(color, 0.15) }),
        // top trim
        !sh.rise && sh.roof !== "saw" && h("polygon", { points: pts([[0, D, H], [0, 0, H], [W, 0, H], [W, -6, H], [-6, -6, H], [-6, D, H]]), fill: T(color, -0.1) }),
        rc.green && h("polygon", { points: pts([[24, 0, 0], [200, 0, 0], [200, 0, 100], [24, 0, 100]]), fill: "#56B870" }),
        rc.green && h("polygon", { points: pts([[24, 0, 0], [200, 0, 0], [200, 30, 0], [24, 30, 0]]), fill: "#4CA864" }),
        rc.view && h(ViewWindow, { view: rc.view, wall }),
        // task board: pinboard, whiteboard or wall screens
        h("polygon", { points: pts([[0, D - 10, H - 14], [0, D - 10 - 128, H - 14], [0, D - 10 - 128, Math.max(6, H - 14 - 96)], [0, D - 10, Math.max(6, H - 14 - 96)]]), fill: board === "screens" ? "#2A363C" : board === "white" ? "#F7F7F2" : "#C9A171", stroke: board === "screens" ? "#1B2428" : board === "white" ? "#9AA7AE" : "#9C6B45", strokeWidth: 2.5 }),
        rc.boardTitle && h("g", { transform: `matrix(1,-0.5,0,1,${R(P(0, D - 14, H - 4)[0])},${R(P(0, D - 14, H - 4)[1])})` }, h("text", { className: "board-t" }, rc.boardTitle)),
        board === "white" && h("polygon", { points: pts([[0, D - 30, H - 111], [0, D - 110, H - 111], [0, D - 110, H - 108], [0, D - 30, H - 108]]), fill: "#9AA7AE" }),
        notes.map((t, n) => h(Note, { key: t.id, task: t, style: board, u: (n % 3) * 40 + 4, v: Math.floor(n / 3) * 30 + 6, onClick: () => onTask(t), working: workingIds[t.assignee] })),
        !notes.length && h("g", { transform: `matrix(1,-0.5,0,1,${R(P(0, D - 30, H - 50)[0])},${R(P(0, D - 30, H - 50)[1])})` },
          h("text", { className: "note-empty" }, "No open tasks ✨")),
        // level plaque on right wall
        h("g", { transform: `matrix(1,0.5,0,1,${R(plaque[0])},${R(plaque[1])})` },
          h("rect", { x: -2, y: -2, width: 40, height: 18, rx: 3, fill: color }),
          h("text", { x: 18, y: 11, textAnchor: "middle", className: "plaque-t" }, "LV " + level)),
        // ceiling lamp
        items.map((x) => x.el),
      );
    }

    function Interior({ kind, color, name, sub, level, tasks, crew, onTask, onClose, onAdd, origin, goals, treasury, workingIds }) {
      const rc = recipe(kind, color);
      const style = origin ? { transformOrigin: `${Math.round(origin.x)}px ${Math.round(origin.y)}px` } : null;
      return h("div", { className: "interior", role: "dialog", "aria-label": `Inside ${name}`, style },
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
          kind === "lighthouse"
            ? h(RoundRoom, { color, level, tasks, crew, onTask, goals, treasury })
            : h(Room, { kind, color, name, sub, level, tasks, crew, onTask, workingIds })),
        onAdd && h("button", { type: "button", className: "gbtn primary pin-btn", onClick: onAdd }, "+ Pin a task"),
      );
    }

    /* ---------- goal tree: goals grouped by field, slots unlock ---------- */
    const MAX_SLOTS = 6;
    function slotInfo(list) {
      const done = list.filter((g) => g.progress >= 100).length;
      const active = list.length - done;
      const cap = Math.min(MAX_SLOTS, 1 + done);
      return { done, active, cap, free: cap - active };
    }
    /* the five life fields; older goals saved against a section are mapped in */
    const FIELDS = [
      { id: "income", name: "Income", color: "#E9A727" },
      { id: "fitness", name: "Fitness", color: "#F08A4B" },
      { id: "learning", name: "Learning", color: "#7E6BC4" },
      { id: "youtube", name: "YouTube", color: "#E0474C" },
      { id: "business", name: "Business", color: "#2A9D8F" },
    ];
    const FIELD_OF = { income: "income", goals: "income", fitness: "fitness", learning: "learning", personal: "learning", youtube: "youtube", business: "business", bynode: "business", wood: "business", coffee: "business", freelance: "business", epcm: "income" };
    const fieldOf = (g) => FIELD_OF[g.field] || (g.field ? "business" : "learning");
    function GoalTree({ goals, onAdd, onGoal, onDel }) {
      const fields = FIELDS;
      const [title, setTitle] = React.useState("");
      const [field, setField] = React.useState("income");
      const byField = {};
      goals.forEach((g) => (byField[fieldOf(g)] = byField[fieldOf(g)] || []).push(g));
      const fById = Object.fromEntries(fields.map((f) => [f.id, f]));
      const fOf = (id) => fById[id] || { id, name: id, color: "#9A8F7A" };
      const order = fields.map((f) => f.id);
      const sel = slotInfo(byField[field] || []);
      const totalDone = goals.filter((g) => g.progress >= 100).length;
      const add = () => { if (title.trim() && sel.free > 0) { onAdd(title.trim(), field); setTitle(""); } };
      return h("div", null,
        h("div", { className: "section-h mt-6" }, h(An, { size: 16 }), "Goal tree",
          h("span", { className: "ml-auto gcount" }, totalDone, " done")),
        h("p", { className: "gt-hint" }, "Each field starts with one goal slot. You can only add another goal in a field after you finish one in that same field (up to ", MAX_SLOTS, " at once)."),
        h("div", { className: "space-y-3" },
          order.map((fid) => {
            const f = fOf(fid), list = byField[fid] || [], si = slotInfo(list);
            const active = list.filter((g) => g.progress < 100), done = list.filter((g) => g.progress >= 100);
            return h("div", { key: fid, className: "gt-field", style: { "--fc": f.color } },
              h("div", { className: "gt-head" },
                h("span", { className: "gdot", style: { background: f.color } }),
                h("span", { className: "gt-name" }, f.name),
                h("span", { className: "gt-tier" }, "Tier ", si.done + 1),
                h("span", { className: "gt-slots tnum" }, "\u2713 ", si.done),
                h("span", { className: "gt-slots tnum" }, si.active, "/", si.cap, " slots")),
              active.map((z) => h("div", { key: z.id, className: "goal-row" },
                h("div", { className: "flex items-center gap-2" },
                  h("span", { className: "font-semibold text-[14.5px] flex-1 min-w-0" }, z.title),
                  h("span", { className: "tnum text-[13px] font-bold", style: { color: "var(--ink2)" } }, z.progress, "%"),
                  h(Pe, { label: "Delete goal", className: "row-del", onClick: () => onDel(z) }, h(mt, { size: 15 }))),
                h("input", {
                  id: "goal-" + z.id, type: "range", min: "0", max: "100", step: "5", defaultValue: z.progress,
                  className: "range mt-1.5", "aria-label": `Progress for ${z.title}`,
                  onPointerUp: (e) => onGoal(z, Number(e.target.value)), onKeyUp: (e) => onGoal(z, Number(e.target.value)),
                }))),
              si.free > 0 && si.cap > si.active && active.length > 0 && h("div", { className: "gt-open" }, "Open slot \xB7 add another ", f.name, " goal below"),
              !list.length && h("div", { className: "gt-open" }, "Open slot \xB7 set your first ", f.name, " goal"),
              si.cap < MAX_SLOTS && list.length > 0 && h("div", { className: "gt-lock" },
                h("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" },
                  h("rect", { x: 5, y: 11, width: 14, height: 10, rx: 2 }), h("path", { d: "M8 11V8a4 4 0 0 1 8 0v3" })),
                "Slot ", si.cap + 1, " unlocks when you finish ", si.active ? (/^[AEIOU]/.test(f.name) ? "an " : "a ") + f.name + " goal" : "another " + f.name + " goal"),
              done.length > 0 && h("div", { className: "gt-done" }, done.map((z) => h("span", { key: z.id, className: "gt-chip", title: z.title },
                "✓ ", z.title, h("button", { type: "button", "aria-label": "Delete goal", onClick: () => onDel(z) }, "\xD7")))));
          }),
          !goals.length && h("div", { className: "empty" }, "Pick a field and set your first goal. Finishing it unlocks the next one."),
        ),
        h("div", { className: "mt-3 gt-add" },
          h("select", { className: "inp", value: field, "aria-label": "Goal field", onChange: (e) => setField(e.target.value) },
            fields.map((f) => {
              const si = slotInfo(byField[f.id] || []);
              return h("option", { key: f.id, value: f.id }, f.name, si.free > 0 ? ` (${si.free} open)` : " (locked)");
            })),
          h("input", {
            id: "goal-new", className: "inp", value: title, disabled: sel.free <= 0,
            placeholder: sel.free > 0 ? "New goal, e.g. Read 12 books" : "Finish a goal here to unlock a slot",
            onChange: (e) => setTitle(e.target.value), onKeyDown: (e) => e.key === "Enter" && add(),
          }),
          h(Q, { disabled: !title.trim() || sel.free <= 0, onClick: add }, h(At, { size: 16 }), "Goal")),
        sel.free <= 0 && h("div", { className: "gt-full" }, "All ", fOf(field).name, " slots are in use. Finish one of those goals to unlock the next."),
      );
    }

    return { Interior, GoalTree };
  })();
