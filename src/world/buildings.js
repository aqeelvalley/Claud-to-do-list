  /* ===================== buildings (drawn into cached sprites) ===================== */
  const FACE = { "+a": "R", "+b": "L" };
  const FLOOR = 20;
  /* windows on both visible faces; the door goes on the front face */
  function facade(pn, bx, floors, o, opt = {}) {
    const front = FACE[o.face];
    ["L", "R"].forEach((f) => {
      const len = f === "L" ? bx.w : bx.d;
      const cols = Math.max(1, Math.round(len / (opt.pitch || 20)));
      for (let fl = 0; fl < floors; fl++) {
        if (fl === 0 && opt.shopfront && f === front) continue;
        for (let c = 0; c < cols; c++) {
          const u0 = (c + 0.28) / cols, u1 = (c + 0.72) / cols;
          if (fl === 0 && f === front && Math.abs((u0 + u1) / 2 - 0.5) < 0.6 / cols) continue; // door here
          const v0 = (fl + 0.3) / floors, v1 = (fl + 0.72) / floors;
          pn.windowQ(bx, f, u0, u1, v0, v1, false, opt.frame || "#FFF8EC");
        }
      }
    });
    if (front && !opt.noDoor) pn.door(bx, front, 0.5, Math.min(0.3, 12 / (front === "L" ? bx.w : bx.d)), Math.min(0.85, 15 / bx.h), opt.doorC || "#6E4A33");
  }
  const rooftopAC = (pn, x, y, z) => { pn.box(x, y, z, 9, 7, 5, "#C9CED0"); const [cx, cy] = pn.P(x, y, z + 5); if (!pn.E) { pn.ctx.fillStyle = "#8C969B"; pn.ctx.beginPath(); pn.ctx.ellipse(cx, cy, 3, 1.5, 0, 0, TAU); pn.ctx.fill(); } };
  const antenna = (pn, x, y, z, h = 16) => { pn.line([x, y, z], [x, y, z + h], "#566469", 1); pn.line([x - 3, y, z + h * 0.7], [x + 3, y, z + h * 0.7], "#566469", 0.8); pn.glow(x, y, z + h, 4, "#FF5A4A", 0.9); };
  const waterTank = (pn, x, y, z) => { [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([dx, dy]) => pn.line([x + dx, y + dy, z], [x + dx, y + dy, z + 7], "#6E4A33", 1)); pn.cyl(x, y, z + 7, 6, 10, "#A9794F", { top: "#8A5A3A" }); };
  const chimney = (pn, x, y, z, h = 14) => pn.box(x, y, z, 6, 6, h, "#B5654A");
  const parapet = (pn, bx, c) => {
    const { x, y, w, d, h } = bx, z = h;
    pn.box(x, y - d / 2 + 1.5, z, w, 3, 3, c); pn.box(x - w / 2 + 1.5, y, z, 3, d, 3, c);
    pn.box(x + w / 2 - 1.5, y, z, 3, d, 3, c); pn.box(x, y + d / 2 - 1.5, z, w, 3, 3, c);
  };
  const flatRoof = (pn, bx, c = "#B9B2A5") => { pn.poly([[bx.x - bx.w / 2 + 3, bx.y - bx.d / 2 + 3, bx.h], [bx.x + bx.w / 2 - 3, bx.y - bx.d / 2 + 3, bx.h], [bx.x + bx.w / 2 - 3, bx.y + bx.d / 2 - 3, bx.h], [bx.x - bx.w / 2 + 3, bx.y + bx.d / 2 - 3, bx.h]], c, null); };

  const B = {};
  B.house = (pn, o) => {
    const r = rng(o.seed || 1);
    const w = Math.max(30, Math.min(o.w - 22, 40 + r() * 36)), d = Math.max(28, Math.min(o.d - 22, 36 + r() * 26)), fl = o.floors || 1;
    const sb = 6 + r() * 14, side = (r() - 0.5) * Math.max(0, o.w - w - 24);
    const off = { "+a": [o.w / 2 - w / 2 - sb, (r() - 0.5) * Math.max(0, o.d - d - 24)], "+b": [side, o.d / 2 - d / 2 - sb], "-a": [-(o.w / 2 - w / 2 - sb), 0], "-b": [side, -(o.d / 2 - d / 2 - sb)] }[o.face] || [0, 0];
    const bx = { x: off[0], y: off[1], z: 0, w, d, h: fl * FLOOR + 2 };
    pn.box(bx.x, bx.y, 0, w + 3, d + 3, 3, "#C9B79A");
    pn.box(bx.x, bx.y, 0, w, d, bx.h, o.wall);
    facade(pn, bx, fl, o, { pitch: 18 });
    // flower boxes under ground floor windows on the front
    const f = FACE[o.face];
    if (f) [0.2, 0.8].forEach((u) => { const p = pn.faceP(bx, f, u, 0.24, 1.5); pn.box(p[0], p[1], p[2], f === "L" ? 8 : 3, f === "L" ? 3 : 8, 2, "#8A5A3A"); if (!pn.E) { const [x, y] = pn.P(p[0], p[1], p[2] + 3); pn.ctx.fillStyle = ["#F4A3B5", "#F2C14E", "#E0474C"][(u * 10) % 3 | 0]; [-2, 0, 2].forEach((dx) => { pn.ctx.beginPath(); pn.ctx.arc(x + dx, y, 1.2, 0, TAU); pn.ctx.fill(); }); } });
    const axis = w >= d ? "a" : "b";
    pn.gable(bx.x, bx.y, bx.h, w, d, 18 + r() * 6, o.roof, axis, o.wall);
    chimney(pn, bx.x - w * 0.25, bx.y - d * 0.15, bx.h + 4, 14);
  };
  B.shop = (pn, o) => {
    const fl = o.floors || 1, w = o.w - 14, d = o.d - 14;
    const bx = { x: 0, y: 0, z: 0, w, d, h: fl * FLOOR + 6 };
    pn.box(0, 0, 0, w, d, bx.h, o.wall);
    const f = FACE[o.face] || "L";
    // shopfront
    const sb = { ...bx, h: bx.h };
    pn.poly(pn.faceQ(sb, f, 0.06, 0.94, 0.02, (FLOOR - 4) / bx.h, 0.4), shade(o.awn, -0.3), null);
    pn.windowQ(sb, f, 0.1, 0.56, 0.08, (FLOOR - 6) / bx.h, false, "#F6EDDF");
    pn.door(sb, f, 0.76, 0.16, (FLOOR - 6) / bx.h, "#44545A");
    facade(pn, bx, fl, { ...o, face: o.face }, { shopfront: true, noDoor: true });
    pn.awning(bx, f, 0.05, 0.95, (FLOOR - 2) / bx.h, o.awn);
    pn.sign(bx, f, 0.5, (FLOOR + 3) / bx.h, o.label || "Shop", o.awn, "#FFF8EC", 6.5);
    parapet(pn, bx, shade(o.wall, -0.08));
    flatRoof(pn, bx);
    rooftopAC(pn, -w * 0.2, -d * 0.1, bx.h);
  };
  B.apartment = (pn, o) => {
    const fl = o.floors || 5, w = o.w - 12, d = o.d - 12;
    const bx = { x: 0, y: 0, z: 0, w, d, h: fl * FLOOR + 6 };
    pn.box(0, 0, 0, w, d, bx.h, o.wall);
    // base course
    pn.box(0, 0, 0, w + 1, d + 1, 8, shade(o.wall, -0.18));
    facade(pn, bx, fl, o, { pitch: 17 });
    // balconies on the front
    const f = FACE[o.face] || "L";
    for (let fl2 = 1; fl2 < fl; fl2++) [0.25, 0.75].forEach((u) => {
      const p = pn.faceP(bx, f, u, fl2 / fl + 0.01, 0);
      const [bw, bd] = f === "L" ? [22, 7] : [7, 22];
      const cx = p[0] + (f === "R" ? 3.5 : 0), cy = p[1] + (f === "L" ? 3.5 : 0);
      pn.box(cx, cy, p[2], bw, bd, 1.5, "#E9E2D2");
      pn.poly(f === "L" ? [[cx - 11, cy + 3.5, p[2] + 1.5], [cx + 11, cy + 3.5, p[2] + 1.5], [cx + 11, cy + 3.5, p[2] + 7], [cx - 11, cy + 3.5, p[2] + 7]] : [[cx + 3.5, cy - 11, p[2] + 1.5], [cx + 3.5, cy + 11, p[2] + 1.5], [cx + 3.5, cy + 11, p[2] + 7], [cx + 3.5, cy - 11, p[2] + 7]], "rgba(120,150,160,0.45)", "#F6EDDF", 0.8);
    });
    // entrance canopy
    const dp = pn.faceP(bx, f, 0.5, 18 / bx.h, 0);
    pn.box(dp[0] + (f === "R" ? 5 : 0), dp[1] + (f === "L" ? 5 : 0), dp[2], f === "L" ? 20 : 10, f === "L" ? 10 : 20, 1.6, shade(o.roof, 0));
    parapet(pn, bx, shade(o.wall, -0.1));
    flatRoof(pn, bx);
    waterTank(pn, -w * 0.22, -d * 0.2, bx.h);
    rooftopAC(pn, w * 0.2, -d * 0.2, bx.h);
    antenna(pn, w * 0.25, d * 0.2, bx.h, 18);
  };
  B.forsale = (pn, o) => {
    pn.poly([[-o.w / 2 + 6, -o.d / 2 + 6, 0.3], [o.w / 2 - 6, -o.d / 2 + 6, 0.3], [o.w / 2 - 6, o.d / 2 - 6, 0.3], [-o.w / 2 + 6, o.d / 2 - 6, 0.3]], "#CDB78F", "#B39A6E", 1);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => pn.box(sx * (o.w / 2 - 8), sy * (o.d / 2 - 8), 0, 2.5, 2.5, 8, "#F6EDDF"));
    const s = { x: 0, y: o.d / 2 - 14, z: 8, w: 30, d: 2, h: 14 };
    pn.line([-10, o.d / 2 - 14, 0], [-10, o.d / 2 - 14, 10], "#6F5A45", 1.4); pn.line([10, o.d / 2 - 14, 0], [10, o.d / 2 - 14, 10], "#6F5A45", 1.4);
    pn.box(s.x, s.y, s.z, s.w, s.d, s.h, "#FFF8EC");
    pn.sign(s, "L", 0.5, 0.5, "FOR SALE", "#2A9D8F", "#FFF", 5.5, false);
  };
  B.construction = (pn, o) => {
    const w = o.w - 30, d = o.d - 30;
    pn.poly([[-o.w / 2 + 4, -o.d / 2 + 4, 0.2], [o.w / 2 - 4, -o.d / 2 + 4, 0.2], [o.w / 2 - 4, o.d / 2 - 4, 0.2], [-o.w / 2 + 4, o.d / 2 - 4, 0.2]], "#C8A374", "#A9854F", 1);
    // hoarding on back edges
    pn.box(0, -o.d / 2 + 5, 0, o.w - 10, 2, 10, "#E9B949"); pn.box(-o.w / 2 + 5, 0, 0, 2, o.d - 10, 10, "#E9B949");
    const bx = { x: -8, y: -8, z: 0, w: w * 0.7, d: d * 0.7, h: 46 };
    pn.box(bx.x, bx.y, 0, bx.w, bx.d, 3, "#BFC4C6");
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => pn.box(bx.x + sx * (bx.w / 2 - 3), bx.y + sy * (bx.d / 2 - 3), 3, 4, 4, 42, "#AEB5B8"));
    [22, 44].forEach((z) => pn.box(bx.x, bx.y, z, bx.w, bx.d, 3, "#C9CED0"));
    pn.box(bx.x - bx.w * 0.2, bx.y + bx.d * 0.15, 3, bx.w * 0.5, bx.d * 0.5, 19, shade("#D9C4A0", 0));
    // scaffolding on the visible faces
    const sc = "#D9A441";
    for (let k = 0; k <= 5; k++) { const u = k / 5; pn.line([bx.x - bx.w / 2 + u * bx.w, bx.y + bx.d / 2 + 5, 0], [bx.x - bx.w / 2 + u * bx.w, bx.y + bx.d / 2 + 5, 50], sc, 1); pn.line([bx.x + bx.w / 2 + 5, bx.y - bx.d / 2 + u * bx.d, 0], [bx.x + bx.w / 2 + 5, bx.y - bx.d / 2 + u * bx.d, 50], sc, 1); }
    [12, 24, 36, 48].forEach((z) => { pn.line([bx.x - bx.w / 2, bx.y + bx.d / 2 + 5, z], [bx.x + bx.w / 2 + 5, bx.y + bx.d / 2 + 5, z], sc, 1.3); pn.line([bx.x + bx.w / 2 + 5, bx.y - bx.d / 2, z], [bx.x + bx.w / 2 + 5, bx.y + bx.d / 2 + 5, z], sc, 1.3); });
    // tower crane
    const mx = o.w / 2 - 24, my = -o.d / 2 + 24;
    for (let z = 0; z < 110; z += 10) { pn.box(mx, my, z, 6, 6, 10, "#E9B949", { stroke: "rgba(140,100,20,0.6)" }); }
    pn.box(mx, my, 110, 9, 9, 7, "#F6EDDF");
    pn.line([mx - 90, my, 117], [mx + 30, my, 117], "#D6A437", 3.4);
    pn.line([mx - 90, my, 121], [mx, my, 128], "#D6A437", 0.8); pn.line([mx + 30, my, 119], [mx, my, 128], "#D6A437", 0.8);
    pn.box(mx + 26, my, 112, 12, 10, 7, "#7A8591");
    pn.line([mx - 55, my, 117], [mx - 55, my, 64], "#44545A", 0.8);
    pn.box(mx - 55, my, 58, 14, 8, 6, "#B98759");
    pn.glow(mx, my, 131, 7, "#FF5A4A", 1);
    // materials and cones
    [[-o.w / 2 + 22, o.d / 2 - 20], [-o.w / 2 + 40, o.d / 2 - 16]].forEach(([x, y]) => crate(pn, x, y, 0, 9));
    [[o.w / 2 - 20, o.d / 2 - 14], [o.w / 2 - 36, o.d / 2 - 12]].forEach(([x, y]) => { const [sx, sy] = pn.P(x, y, 0); pn.ctx.beginPath(); pn.ctx.moveTo(sx - 3, sy); pn.ctx.lineTo(sx, sy - 8); pn.ctx.lineTo(sx + 3, sy); pn.fillPath("#F08A4B"); });
    const s = { x: -10, y: o.d / 2 - 8, z: 6, w: 44, d: 2, h: 16 };
    pn.line([-26, o.d / 2 - 8, 0], [-26, o.d / 2 - 8, 8], "#6F5A45", 1.4); pn.line([6, o.d / 2 - 8, 0], [6, o.d / 2 - 8, 8], "#6F5A45", 1.4);
    pn.box(s.x, s.y, s.z, s.w, s.d, s.h, "#F2C14E");
    pn.sign(s, "L", 0.5, 0.62, o.name, "#F2C14E", "#4A3A10", 5.4, false);
    pn.sign(s, "L", 0.5, 0.2, "Level " + o.level, "#44545A", "#FFF", 4.6, false);
  };
  /* user-created sections pick a building style from their kind */
  B.section = (pn, o) => {
    const k = o.sKind;
    if (k === "shop") return B.shop(pn, { ...o, awn: o.color, label: o.name.slice(0, 12), floors: 2, wall: "#F6EDDF" });
    if (k === "tower" || k === "office") return B.apartment(pn, { ...o, wall: shade(o.color, 0.72), roof: o.color, floors: k === "tower" ? 6 : 4 });
    if (k === "farm") { B.house(pn, { ...o, wall: "#F3D9C4", roof: o.color, floors: 1, seed: 3 }); return; }
    B.house(pn, { ...o, wall: shade(o.color, 0.78), roof: o.color, floors: 2, seed: 5 });
  };
  B.cottage = (pn, o) => {
    const w = 78, d = 60;
    const bx = { x: 0, y: 4, z: 0, w, d, h: 30 };
    pn.box(0, 4, 0, w + 4, d + 4, 3, "#C9B79A");
    pn.box(0, 4, 0, w, d, 30, "#F6EDDF");
    // timber frame lines
    [0.25, 0.5, 0.75].forEach((u) => pn.line(pn.faceP(bx, "L", u, 0), pn.faceP(bx, "L", u, 1), "#B98759", 1.1));
    facade(pn, { ...bx }, 1, { face: "+b" }, { pitch: 26 });
    pn.windowQ(bx, "R", 0.2, 0.42, 0.35, 0.8); pn.windowQ(bx, "R", 0.58, 0.8, 0.35, 0.8);
    pn.gable(0, 4, 30, w, d, 24, "#C8654A", "a", "#F6EDDF", 5);
    // dormer
    pn.box(-10, 22, 38, 16, 8, 10, "#F6EDDF"); pn.windowQ({ x: -10, y: 22, z: 38, w: 16, d: 8, h: 10 }, "L", 0.2, 0.8, 0.15, 0.85);
    pn.gable(-10, 22, 48, 16, 8, 7, "#B85C3C", "b", "#F6EDDF", 2);
    chimney(pn, 20, -6, 36, 22);
    // porch
    pn.box(0, 38, 0, 26, 10, 2, "#B98759");
    [[-11, 42], [11, 42]].forEach(([x, y]) => pn.box(x, y, 2, 2, 2, 16, "#F6EDDF"));
    pn.box(0, 38, 18, 30, 12, 2, "#B85C3C");
    // mailbox & sign
    pn.box(o.w / 2 - 12, o.d / 2 - 6, 0, 2, 2, 9, "#6F5A45"); pn.box(o.w / 2 - 12, o.d / 2 - 6, 9, 4, 6, 4, "#3E7CB1");
    const tier = o.tier || 1;
    if (tier >= 2) { pn.box(-o.w / 2 + 20, -6, 0, 26, 30, 20, "#F3D9C4"); pn.gable(-o.w / 2 + 20, -6, 20, 26, 30, 12, "#C8654A", "b", "#F3D9C4", 3); pn.windowQ({ x: -o.w / 2 + 20, y: -6, z: 0, w: 26, d: 30, h: 20 }, "L", 0.25, 0.75, 0.35, 0.8); }
    if (tier >= 3) { pn.poly([[o.w / 2 - 34, o.d / 2 - 38, 0.4], [o.w / 2 - 12, o.d / 2 - 38, 0.4], [o.w / 2 - 12, o.d / 2 - 18, 0.4], [o.w / 2 - 34, o.d / 2 - 18, 0.4]], "#5CC4CC", "#FFFFFF", 1.5); }
  };
  B.drafting = (pn, o) => {
    const t = o.tier || 1, fl = 2 + t;
    const w = o.w - 20, d = o.d - 16;
    const bx = { x: 0, y: 0, z: 0, w, d, h: fl * FLOOR + 4 };
    pn.box(0, 0, 0, w, d, bx.h, "#DDE6EA");
    // curtain wall grid
    ["L", "R"].forEach((f) => {
      const len = f === "L" ? w : d, cols = Math.round(len / 14);
      for (let fl2 = 0; fl2 < fl; fl2++) for (let c = 0; c < cols; c++) {
        if (fl2 === 0 && f === "L" && Math.abs(c - cols / 2) < 1) continue;
        pn.windowQ(bx, f, c / cols + 0.04, (c + 1) / cols - 0.04, fl2 / fl + 0.06, (fl2 + 1) / fl - 0.06, false, "#B7C4CA");
      }
    });
    pn.door(bx, "L", 0.5, 0.1, 15 / bx.h, "#44545A");
    pn.sign(bx, "L", 0.22, (FLOOR + 2) / bx.h, "FREELANCE ENG", "#7E6BC4", "#FFF", 6.5);
    parapet(pn, bx, "#C9D2D6"); flatRoof(pn, bx, "#AEB5B8");
    rooftopAC(pn, -w * 0.25, -d * 0.1, bx.h); rooftopAC(pn, w * 0.05, -d * 0.1, bx.h); antenna(pn, w * 0.3, 0, bx.h, 22);
  };
  B.film = (pn, o) => {
    const t = o.tier || 1, w = o.w - 20, d = o.d - 16, h = 44 + t * 8;
    const bx = { x: 0, y: 0, z: 0, w, d, h };
    pn.box(0, 0, 0, w, d, h, "#3B4046", { left: "#41474E", right: "#2E3338", top: "#50575F" });
    pn.poly(pn.faceQ(bx, "L", 0, 1, 0.9, 1, 0.3), "#E0474C", null);
    pn.poly(pn.faceQ(bx, "R", 0, 1, 0.9, 1, 0.3), "#B8393D", null);
    [0.12, 0.3].forEach((u) => pn.windowQ(bx, "L", u, u + 0.12, 0.45, 0.7, false, "#E9E2D2"));
    pn.door(bx, "L", 0.62, 0.12, 0.34, "#E0474C");
    // roller door for props
    pn.poly(pn.faceQ(bx, "L", 0.78, 0.95, 0.02, 0.45, 0.5), "#9AA7AE", "#6E777C");
    // big play-button sign on the corner
    const p = pn.faceP(bx, "L", 0.38, 0.72, 2);
    const [sx, sy] = pn.P(p[0], p[1], p[2]);
    const ctx = pn.ctx;
    ctx.save(); ctx.translate(sx, sy); ctx.transform(1, 0.5, 0, 1, 0, 0);
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-14, -9, 28, 18, 5) : ctx.rect(-14, -9, 28, 18);
    if (pn.E) { ctx.fillStyle = "rgba(255,70,70,0.8)"; ctx.fill(); } else { ctx.fillStyle = "#E0474C"; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(6, 0); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fillStyle = "#FFFFFF"; ctx.fill();
    ctx.restore();
    pn.sign(bx, "R", 0.5, 0.5, "STUDIO", "#E0474C", "#FFF", 7);
    flatRoof(pn, bx, "#50575F");
    // satellite dish + ON AIR lamp
    pn.line([w * 0.2, -d * 0.2, h], [w * 0.2, -d * 0.2, h + 8], "#9AA7AE", 1.4);
    if (!pn.E) { const [dx, dy] = pn.P(w * 0.2, -d * 0.2, h + 12); ctx.fillStyle = "#E9EEF0"; ctx.beginPath(); ctx.ellipse(dx, dy, 8, 5, -0.5, 0, TAU); ctx.fill(); ctx.strokeStyle = OUT; ctx.stroke(); }
    const onair = pn.faceP(bx, "L", 0.62, 0.52, 1);
    pn.box(onair[0], onair[1] + 1, onair[2], 12, 2, 5, "#7A1F22");
    pn.glow(onair[0], onair[1] + 2, onair[2] + 2.5, 9, "#FF4A4A", 0);
    rooftopAC(pn, -w * 0.25, -d * 0.15, h);
  };
  B.maker = (pn, o) => {
    const t = o.tier || 1, w = o.w - 18, d = o.d - 14, h = 36 + t * 4;
    const bx = { x: 0, y: 0, z: 0, w, d, h };
    pn.box(0, 0, 0, w, d, h, "#E3F1EE");
    for (let k = 1; k < 16; k++) pn.line(pn.faceP(bx, "L", k / 16, 0.02), pn.faceP(bx, "L", k / 16, 0.98), "rgba(40,90,80,0.18)", 0.8);
    pn.poly(pn.faceQ(bx, "L", 0.06, 0.34, 0.02, 0.7, 0.5), "#8FA3A6", "#5E7275");
    for (let k = 1; k < 8; k++) pn.line(pn.faceP(bx, "L", 0.06, k / 11, 0.8), pn.faceP(bx, "L", 0.34, k / 11, 0.8), "#6E8184", 0.7);
    [0.45, 0.62, 0.79].forEach((u) => pn.windowQ(bx, "L", u, u + 0.12, 0.3, 0.7, false, "#F6EDDF"));
    pn.door(bx, "L", 0.95, 0.06, 0.55, "#2A9D8F");
    [0.25, 0.5, 0.75].forEach((u) => pn.windowQ(bx, "R", u - 0.1, u + 0.1, 0.35, 0.75));
    // sawtooth roof
    const n = 4;
    for (let k = 0; k < n; k++) {
      const x0 = -w / 2 + (k * w) / n, x1 = x0 + w / n;
      pn.poly([[x0, -d / 2, h], [x0, d / 2, h], [x0, d / 2, h + 14], [x0, -d / 2, h + 14]], "#9ED8E6", OUT);
      pn.poly([[x0, -d / 2, h + 14], [x1, -d / 2, h], [x1, d / 2, h], [x0, d / 2, h + 14]], k % 2 ? "#5E9E93" : "#6BA99E");
      pn.poly([[x0, d / 2, h], [x1, d / 2, h], [x0, d / 2, h + 14]], shade("#E3F1EE", -0.05));
    }
    pn.sign(bx, "L", 0.62, 0.85, "ByNodeCo", "#2A9D8F", "#FFF", 8);
    // filament spools stack outside
    [[w / 2 + 10, d / 2 - 10], [w / 2 + 10, d / 2 - 24]].forEach(([x, y], k) => pn.cyl(x, y, 0, 5, 4, ["#E07B39", "#2A9D8F"][k], { top: "#F6EDDF" }));
    if (t >= 2) { pn.box(-w / 2 + 16, -d / 2 - 2, h, 18, 14, 10, "#C9CED0"); antenna(pn, w / 2 - 10, 0, h + 14, 12); }
  };
  B.cafe = (pn, o) => {
    const t = o.tier || 1, w = o.w - 26, d = o.d - 30;
    const bx = { x: 0, y: -6, z: 0, w, d, h: 30 + (t >= 2 ? 18 : 0) };
    pn.box(bx.x, bx.y, 0, w, d, bx.h, "#FBE9DC");
    pn.poly(pn.faceQ(bx, "L", 0, 1, 0, 18 / bx.h, 0.3), "#6E4A33", null);
    pn.windowQ(bx, "L", 0.08, 0.6, 0.08, 16 / bx.h, false, "#F6EDDF");
    pn.door(bx, "L", 0.78, 0.18, 16 / bx.h, "#2A9D8F");
    pn.windowQ(bx, "R", 0.2, 0.8, 0.12, 16 / bx.h, false, "#F6EDDF");
    if (t >= 2) facade(pn, { ...bx, z: 18, h: bx.h - 18 }, 1, { face: "none" }, { pitch: 16 });
    pn.awning(bx, "L", 0.02, 0.98, 20 / bx.h, "#D9734E", "#FFF8EC", 12);
    pn.awning(bx, "R", 0.05, 0.95, 20 / bx.h, "#D9734E", "#FFF8EC", 9);
    parapet(pn, bx, "#E9CFC0"); flatRoof(pn, bx, "#C9B7A8");
    // coffee cup sign on the roof
    const [cx, cy] = pn.P(0, bx.y, bx.h + 14), ctx = pn.ctx;
    pn.line([0, bx.y, bx.h], [0, bx.y, bx.h + 6], "#6F5A45", 1.4);
    ctx.beginPath(); ctx.moveTo(cx - 8, cy - 6); ctx.lineTo(cx + 8, cy - 6); ctx.lineTo(cx + 6, cy + 6); ctx.lineTo(cx - 6, cy + 6); ctx.closePath(); pn.fillPath("#FFF8EC");
    if (!pn.E) { ctx.strokeStyle = "#D9734E"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx + 9, cy, 3, -1.2, 1.2); ctx.stroke(); ctx.fillStyle = "#6E4A33"; ctx.fillRect(cx - 7, cy - 6, 14, 2); }
    pn.sign(bx, "L", 0.36, 25 / bx.h, "No Filter", "#D9734E", "#FFF", 8);
    pn.glow(0, bx.y, bx.h + 14, 12, "#FFB36B", 0);
  };
  B.mill = (pn, o) => {
    const t = o.tier || 1, w = o.w - 70, d = o.d - 20, h = 34;
    const bx = { x: -24, y: 0, z: 0, w, d, h };
    pn.box(bx.x, 0, 0, w, d, h, "#B5773A");
    for (let k = 1; k < 18; k++) pn.line(pn.faceP(bx, "L", k / 18, 0), pn.faceP(bx, "L", k / 18, 1), "rgba(80,40,10,0.35)", 0.8);
    for (let k = 1; k < 10; k++) pn.line(pn.faceP(bx, "R", k / 10, 0), pn.faceP(bx, "R", k / 10, 1), "rgba(80,40,10,0.35)", 0.8);
    pn.poly(pn.faceQ(bx, "L", 0.36, 0.64, 0, 0.8, 0.5), "#7E5337", "#5A3A22");
    pn.line(pn.faceP(bx, "L", 0.36, 0, 1), pn.faceP(bx, "L", 0.64, 0.8, 1), "#E9D2A6", 1.2); pn.line(pn.faceP(bx, "L", 0.64, 0, 1), pn.faceP(bx, "L", 0.36, 0.8, 1), "#E9D2A6", 1.2);
    pn.windowQ(bx, "L", 0.1, 0.24, 0.45, 0.78); pn.windowQ(bx, "L", 0.76, 0.9, 0.45, 0.78);
    pn.windowQ(bx, "R", 0.3, 0.7, 0.45, 0.8);
    pn.gable(bx.x, 0, h, w, d, 26, "#6E4A33", "a", "#B5773A", 5);
    pn.sign(bx, "L", 0.5, 0.93, "WOODWORKS", "#7E5337", "#FBE9C8", 7);
    // log pile & timber stack in the yard
    const lx = o.w / 2 - 30;
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - r; k++) {
      const y = -20 + k * 9 + r * 4.5, z = r * 7.4 + 3.8;
      const p0 = pn.P(lx - 20, y, z), p1 = pn.P(lx + 20, y, z), ctx = pn.ctx;
      ctx.lineCap = "butt"; ctx.lineWidth = 7.4;
      if (!pn.E) { ctx.strokeStyle = "#8E6240"; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); ctx.fillStyle = "#E4C08E"; ctx.beginPath(); ctx.ellipse(p1[0], p1[1], 2.8, 3.7, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = "#8E6240"; ctx.lineWidth = 0.7; ctx.stroke(); }
    }
    [0, 1, 2, 3].forEach((k) => pn.box(lx, 24, k * 3.5, 44, 16, 3.5, k % 2 ? "#D8B384" : "#C99D6C"));
    pn.box(lx - 4, 44, 0, 18, 6, 9, "#9AA7AE");
    if (t >= 2) { pn.box(bx.x - w / 2 - 10, -d / 4, 0, 18, 24, 24, "#9C6B45"); pn.gable(bx.x - w / 2 - 10, -d / 4, 24, 18, 24, 10, "#6E4A33", "b", "#9C6B45", 3); }
  };
  B.gym = (pn, o) => {
    const t = o.tier || 1, w = o.w - 20, d = o.d - 16, h = 34 + (t >= 2 ? 10 : 0);
    const bx = { x: 0, y: 0, z: 0, w, d, h };
    pn.box(0, 0, 0, w, d, h, "#F3F1EC");
    pn.poly(pn.faceQ(bx, "L", 0, 1, 0.82, 1, 0.3), "#F08A4B", null);
    for (let k = 0; k < 6; k++) pn.windowQ(bx, "L", 0.04 + k * 0.155, 0.17 + k * 0.155, 0.08, 0.72, false, "#DDE3E6");
    pn.door(bx, "L", 0.5, 0.08, 0.45, "#F08A4B");
    [0.2, 0.5, 0.8].forEach((u) => pn.windowQ(bx, "R", u - 0.12, u + 0.12, 0.2, 0.7, false, "#DDE3E6"));
    pn.sign(bx, "L", 0.5, 0.91, "BEACH GYM", "#F08A4B", "#FFF", 7.5);
    flatRoof(pn, bx, "#C9C4BA"); rooftopAC(pn, -w * 0.3, 0, h); rooftopAC(pn, -w * 0.1, 0, h);
    // dumbbell icon on the roof edge
    const [x, y] = pn.P(w * 0.3, 0, h + 10), ctx = pn.ctx;
    if (!pn.E) { ctx.fillStyle = "#44545A"; ctx.fillRect(x - 8, y - 1, 16, 2); ctx.fillRect(x - 10, y - 4, 3, 8); ctx.fillRect(x + 7, y - 4, 3, 8); }
  };
  B.marinaOffice = (pn, o) => {
    const w = o.w - 20, d = o.d - 20;
    const bx = { x: 0, y: 0, z: 0, w, d, h: 30 };
    pn.box(0, 0, 0, w, d, 30, "#E3EEF0");
    for (let k = 0; k < 3; k++) pn.windowQ(bx, "L", 0.1 + k * 0.28, 0.3 + k * 0.28, 0.3, 0.8, false, "#F6EDDF");
    pn.door(bx, "R", 0.5, 0.2, 0.55, "#1F7A8C");
    pn.hip(0, 0, 30, w, d, 16, "#1F7A8C", 5);
    pn.sign(bx, "L", 0.5, 0.15, "MARINA", "#1F7A8C", "#FFF", 6);
    const fx = w / 2 + 8, fy = d / 2 + 8;
    pn.line([fx, fy, 0], [fx, fy, 50], "#F6EDDF", 1.2);
    if (!pn.E) { const [x, y] = pn.P(fx, fy, 50); pn.ctx.fillStyle = "#2A9D8F"; pn.ctx.fillRect(x, y, 10, 6); }
  };
  B.townhall = (pn, o) => {
    const w = o.w - 50, d = o.d - 60;
    const bx = { x: 0, y: -10, z: 0, w, d, h: 50 };
    pn.box(0, -10, 0, w + 10, d + 10, 5, "#D3C6AF");
    pn.box(0, -10, 5, w, d, 45, "#F4EEE3");
    facade(pn, { ...bx, z: 5, h: 45 }, 2, { face: "+b" }, { pitch: 22 });
    // columns + pediment
    for (let k = 0; k < 6; k++) pn.cyl(-w / 2 + 12 + k * ((w - 24) / 5), d / 2 - 2, 5, 2.6, 34, "#FFFFFF");
    pn.box(0, d / 2 - 4, 39, w - 10, 10, 5, "#EDE3D1");
    pn.gable(0, -10, 50, w, d, 16, "#8A9AA0", "b", "#F4EEE3", 4);
    pn.cyl(0, -10, 62, 10, 16, "#F4EEE3"); pn.cyl(0, -10, 78, 11, 6, "#5F7F8C");
    const [x, y] = pn.P(0, -10 + 10, 70); if (!pn.E) { pn.ctx.fillStyle = "#FFF"; pn.ctx.beginPath(); pn.ctx.arc(x, y, 5, 0, TAU); pn.ctx.fill(); pn.ctx.strokeStyle = "#44545A"; pn.ctx.beginPath(); pn.ctx.moveTo(x, y); pn.ctx.lineTo(x, y - 3.5); pn.ctx.moveTo(x, y); pn.ctx.lineTo(x + 2.5, y); pn.ctx.stroke(); }
    pn.sign(bx, "L", 0.5, 0.2, "TOWN HALL", "#5F7F8C", "#FFF", 6);
  };
  B.library = (pn, o) => { B.apartment(pn, { ...o, wall: "#EDE7F0", roof: "#7E6BC4", floors: 3, face: "+b" }); pn.sign({ x: 0, y: 0, w: o.w - 12, d: o.d - 12, h: 66 }, "L", 0.5, 0.08, "LEARNING CENTRE", "#7E6BC4", "#FFF", 6); };
  B.cinema = (pn, o) => { B.film(pn, { ...o, tier: 3 }); pn.sign({ x: 0, y: 0, w: o.w - 20, d: o.d - 16, h: 68 }, "R", 0.5, 0.2, "CINEMA", "#E9B949", "#3a2a08", 7); };
  B.fabyard = (pn, o) => B.hubWarehouse(pn, { ...o, label: "FAB YARD", color: "#E9B949" });
  B.fountain = (pn) => {
    pn.cyl(0, 0, 0, 26, 5, "#D3C6AF", { top: "#7FD1DC" });
    pn.cyl(0, 0, 5, 5, 12, "#D3C6AF");
    pn.cyl(0, 0, 17, 11, 3, "#D3C6AF", { top: "#9FE3E4" });
    pn.cyl(0, 0, 20, 3, 8, "#D3C6AF");
    pn.glow(0, 0, 4, 22, "#9FE8FF", 0);
  };

  /* ---- work island ---- */
  B.epcmHQ = (pn, o) => {
    const t = o.tier || 1;
    const w = o.w - 20, d = o.d - 20, fl = 5 + t;
    const bx = { x: -8, y: -6, z: 0, w: w * 0.62, d: d * 0.7, h: fl * FLOOR + 6 };
    pn.box(bx.x, bx.y, 0, bx.w, bx.d, bx.h, "#D8DEE1");
    ["L", "R"].forEach((f) => {
      const len = f === "L" ? bx.w : bx.d, cols = Math.round(len / 13);
      for (let k = 0; k < fl; k++) for (let c = 0; c < cols; c++) {
        if (k === 0 && f === "L" && Math.abs(c + 0.5 - cols / 2) < 1.2) continue;
        pn.windowQ(bx, f, c / cols + 0.06, (c + 1) / cols - 0.06, k / fl + 0.08, (k + 1) / fl - 0.12, false, "#E9EEF0");
      }
      for (let k = 1; k < fl; k++) pn.poly(pn.faceQ(bx, f, 0, 1, k / fl - 0.02, k / fl + 0.01, 0.9), "#B8C1C6", null);
    });
    pn.door(bx, "L", 0.5, 0.1, 15 / bx.h, "#3E7CB1");
    // entrance canopy
    const cp = pn.faceP(bx, "L", 0.5, 18 / bx.h, 0);
    pn.box(cp[0], cp[1] + 7, cp[2], 30, 14, 2, "#3E7CB1");
    parapet(pn, bx, "#B8C1C6"); flatRoof(pn, bx, "#9AA7AE");
    rooftopAC(pn, bx.x - 10, bx.y - 10, bx.h); rooftopAC(pn, bx.x + 10, bx.y - 10, bx.h); antenna(pn, bx.x + bx.w * 0.3, bx.y + 8, bx.h, 30);
    pn.sign({ ...bx }, "L", 0.5, 0.94, "EPCM", "#3E7CB1", "#FFF", 11);
    pn.sign({ ...bx }, "R", 0.5, 0.94, "ENGINEERING", "#3E7CB1", "#FFF", 7);
    // control room wing
    const cw = { x: w / 2 - 34, y: d / 2 - 40, z: 0, w: 60, d: 60, h: 28 };
    pn.box(cw.x, cw.y, 0, cw.w, cw.d, cw.h, "#C9D2D6");
    pn.windowQ(cw, "L", 0.1, 0.9, 0.35, 0.8, false, "#E9EEF0"); pn.windowQ(cw, "R", 0.1, 0.9, 0.35, 0.8, false, "#E9EEF0");
    pn.sign(cw, "L", 0.5, 0.18, "CONTROL ROOM", "#44545A", "#FFF", 5);
    flatRoof(pn, cw); rooftopAC(pn, cw.x, cw.y, cw.h);
  };
  B.refinery = (pn, o) => {
    const t = o.tier || 1, w = o.w, d = o.d;
    // bund walls
    pn.poly([[-w / 2 + 8, -d / 2 + 8, 0.3], [w / 2 - 8, -d / 2 + 8, 0.3], [w / 2 - 8, d / 2 - 8, 0.3], [-w / 2 + 8, d / 2 - 8, 0.3]], "#C2BBAE", "#A39A8A", 1);
    // pipe rack along the middle
    const px = [-w / 2 + 20, w / 2 - 20];
    for (let x = px[0]; x <= px[1]; x += 30) { pn.box(x, 0, 0, 3, 3, 22, "#8C969B"); pn.box(x, 14, 0, 3, 3, 22, "#8C969B"); }
    [[18, "#D9DEE0"], [21, "#E9B949"], [15, "#6E8FA3"]].forEach(([z, c], k) => pn.box(0, 5 + k * 3, z, w - 40, 2.4, 2.4, c, { stroke: null }));
    // tanks
    const tanks = [[-w / 2 + 45, -d / 2 + 45, 30, 32], [-w / 2 + 45, d / 2 - 50, 26, 28], [-w / 2 + 110, d / 2 - 50, 24, 26]];
    tanks.forEach(([x, y, r, h]) => {
      pn.cyl(x, y, 0, r, h, "#F4F1EA", { top: "#E4E0D6", bands: [[h - 4, h, "#3E7CB1"]] });
      pn.line([x + r * 0.7, y + r * 0.7, 0], [x + r * 0.7, y + r * 0.7, h], "#9AA7AE", 1);
      pn.glow(x, y, h + 1, 5, "#FF5A4A", 0.8);
    });
    // distillation columns
    [[w / 2 - 60, -d / 2 + 50, 7, 90 + t * 15], [w / 2 - 35, -d / 2 + 70, 5, 70 + t * 10], [w / 2 - 80, -d / 2 + 90, 6, 60]].forEach(([x, y, r, h], k) => {
      pn.cyl(x, y, 0, r, h, "#D9DEE0", { bands: [[h * 0.3, h * 0.33, "#E9B949"], [h * 0.66, h * 0.69, "#E9B949"]] });
      for (let z = 12; z < h; z += 20) pn.glow(x + r * 0.8, y + r * 0.8, z, 6, "#FFE3A0", 0.9);
    });
    // flare stack
    const fx = w / 2 - 30, fy = d / 2 - 30;
    pn.cyl(fx, fy, 0, 3, 150, "#B8C1C6", { bands: [[140, 150, "#E0474C"], [120, 126, "#F6EDDF"]] });
    pn.line([fx - 6, fy, 0], [fx, fy, 150], "#8C969B", 0.6); pn.line([fx + 6, fy, 0], [fx, fy, 150], "#8C969B", 0.6);
    // process units
    pn.box(w / 2 - 70, d / 2 - 70, 0, 40, 30, 18, "#AEB5B8"); pn.box(w / 2 - 70, d / 2 - 70, 18, 20, 18, 10, "#C9CED0");
    pn.sign({ x: 0, y: 0, z: 0, w: w - 16, d: d - 16, h: 10 }, "L", 0.5, 0.5, "EPCM PROCESS PLANT", "#3E7CB1", "#FFF", 6, false);
  };
  B.hubWarehouse = (pn, o) => {
    const w = o.w - 16, d = o.d - 30, h = 38;
    const bx = { x: 0, y: -8, z: 0, w, d, h };
    pn.box(0, -8, 0, w, d, h, o.color ? shade(o.color, 0.6) : "#E3E1D8");
    for (let k = 1; k < 30; k++) pn.line(pn.faceP(bx, "L", k / 30, 0.02), pn.faceP(bx, "L", k / 30, 0.98), "rgba(60,60,60,0.12)", 0.7);
    [0.12, 0.3, 0.48, 0.66].forEach((u) => {
      pn.poly(pn.faceQ(bx, "L", u, u + 0.13, 0.02, 0.62, 0.5), "#9AA7AE", "#6E777C");
      for (let k = 1; k < 6; k++) pn.line(pn.faceP(bx, "L", u, 0.62 * k / 6, 0.8), pn.faceP(bx, "L", u + 0.13, 0.62 * k / 6, 0.8), "#7E878C", 0.6);
      pn.box(bx.x - w / 2 + (u + 0.065) * w, bx.y + d / 2 + 4, 0, w * 0.15, 8, 4, "#44545A");
    });
    pn.door(bx, "L", 0.86, 0.05, 0.4, "#C9A227");
    pn.windowQ(bx, "R", 0.2, 0.8, 0.55, 0.8);
    pn.gable(0, -8, h, w, d, 10, "#8C969B", "a", "#E3E1D8", 3);
    pn.sign(bx, "L", 0.86, 0.72, o.label || "LOGISTICS HUB", o.color || "#C9A227", "#3a2a08", 7);
    rooftopAC(pn, -w * 0.3, -8, h + 6);
  };
  B.portCranes = (pn, o) => {
    // quay edge bollards and two gantry cranes
    for (let a = -140; a <= 140; a += 28) pn.cyl(a, 22, 0, 1.8, 3, "#3B4A50");
    [-80, 60].forEach((a) => {
      const legs = [[-14, -16], [14, -16], [-14, 16], [14, 16]];
      legs.forEach(([x, y]) => pn.box(a + x, y, 0, 4, 4, 70, "#E0474C"));
      pn.box(a, -16, 66, 32, 4, 5, "#E0474C"); pn.box(a, 16, 66, 32, 4, 5, "#E0474C");
      pn.box(a, 0, 71, 12, 70, 6, "#E0474C", { top: "#E86A6E" });
      pn.box(a, 38, 71, 6, 40, 4, "#E0474C");
      pn.box(a, -4, 60, 12, 10, 8, "#F6EDDF");
      pn.line([a, 30, 70], [a, 30, 36], "#44545A", 0.8);
      pn.glow(a, 58, 77, 6, "#FF5A4A", 1);
      pn.glow(a, 0, 58, 12, "#FFE3A0", 1.2);
    });
  };
  B.lighthouse = (pn, o) => {
    pn.box(-20, 16, 0, 22, 18, 14, "#F6EDDF");
    pn.gable(-20, 16, 14, 22, 18, 8, "#C8543C", "b", "#F6EDDF", 2);
    pn.windowQ({ x: -20, y: 16, z: 0, w: 22, d: 18, h: 14 }, "L", 0.3, 0.7, 0.3, 0.75);
    pn.cyl(0, 0, 0, 14, 6, "#D3C6AF");
    pn.cyl(0, 0, 6, 11, 96, "#F8F3EB", { bands: [[20, 32, "#C8543C"], [48, 60, "#C8543C"], [76, 88, "#C8543C"]] });
    // windows up the tower
    [30, 58, 84].forEach((z) => { const [x, y] = pn.P(4, 8, z); pn.ctx.beginPath(); pn.ctx.rect(x - 1.6, y - 3, 3.2, 5); pn.fillPath("#557F8D"); });
    pn.cyl(0, 0, 102, 13, 3, "#44545A");
    pn.cyl(0, 0, 105, 8, 12, "#FFF3C4", { top: "#44545A" });
    pn.cyl(0, 0, 117, 9, 3, "#C8543C");
    pn.line([0, 0, 120], [0, 0, 128], "#44545A", 1.2);
    pn.glow(0, 0, 111, 26, "#FFF1B8", 3);
  };
