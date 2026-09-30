  /* ===================== assets: vehicles, people, animals, props ===================== */

  /* ---- oriented prisms (vehicles, boats) ----
     local x = forward, y = left; yaw is the heading in the (a,b) plane */
  function orient(yaw) {
    const fa = Math.cos(yaw), fb = Math.sin(yaw);
    const la = fb, lb = -fa; // left of travel (keep-left roads use this side)
    return (x, y, z = 0) => [x * fa + y * la, x * fb + y * lb, z];
  }
  function prism(pn, W, bottom, z0, top, z1, colFn, topCol, decalsOut) {
    const B = bottom.map(([x, y]) => W(x, y, z0)), T = top.map(([x, y]) => W(x, y, z1));
    const n = B.length;
    const ca = B.reduce((s, p) => s + p[0], 0) / n, cb = B.reduce((s, p) => s + p[1], 0) / n;
    const faces = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      let na = B[j][1] - B[i][1], nb = -(B[j][0] - B[i][0]);
      const mA = (B[i][0] + B[j][0]) / 2, mB = (B[i][1] + B[j][1]) / 2;
      if (na * (mA - ca) + nb * (mB - cb) < 0) { na = -na; nb = -nb; }
      const L = Math.hypot(na, nb) || 1; na /= L; nb /= L;
      if (na + nb <= 0.02) continue;
      faces.push({ i, q: [B[i], B[j], T[j], T[i]], na, nb, dep: mA + mB });
    }
    faces.sort((p, q) => p.dep - q.dep);
    faces.forEach((f) => {
      const base = colFn(f.i, f);
      pn.poly(f.q, shade(base, 0.08 * f.nb - 0.22 * f.na), OUT, 0.6);
      if (decalsOut) decalsOut.push(f);
    });
    pn.poly(T, topCol, OUT, 0.6);
    return faces;
  }
  /* point on a face quad (u along the edge, v up) */
  const onFace = (q, u, v) => {
    const a0 = lerp(q[0][0], q[1][0], u), b0 = lerp(q[0][1], q[1][1], u), z0 = lerp(q[0][2], q[1][2], u);
    const a1 = lerp(q[3][0], q[2][0], u), b1 = lerp(q[3][1], q[2][1], u), z1 = lerp(q[3][2], q[2][2], u);
    return [lerp(a0, a1, v), lerp(b0, b1, v), lerp(z0, z1, v)];
  };
  const decal = (pn, q, u0, u1, v0, v1, c, st = null) => pn.poly([onFace(q, u0, v0), onFace(q, u1, v0), onFace(q, u1, v1), onFace(q, u0, v1)], c, st, 0.5);

  const rect = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const cham = (x0, x1, y0, y1, c) => [[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]];
  const GLASS = "#43527A";

  const VEHICLES = {
    hatch: { L: 19, W: 10 }, sedan: { L: 21, W: 10 }, bakkie: { L: 22, W: 10.5 },
    van: { L: 21, W: 10.5 }, bus: { L: 38, W: 11.5 }, truck: { L: 30, W: 11 },
  };
  function drawWheel(pn, W, x, y, r, phase) {
    const ctx = pn.ctx;
    const c = pn.P(...W(x, y, r));
    const f = W(1, 0, 0);
    const ux = f[0] - f[1], uy = (f[0] + f[1]) / 2;
    ctx.save();
    ctx.translate(c[0], c[1]);
    ctx.transform(ux * r, uy * r, 0, -r, 0, 0);
    ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU);
    if (pn.E) { pn.fillPath(); ctx.restore(); return; }
    ctx.fillStyle = "#2E2A40"; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 0.56, 0, TAU); ctx.fillStyle = "#D8D2E0"; ctx.fill();
    ctx.strokeStyle = "#8C86A0"; ctx.lineWidth = 0.14;
    for (let k = 0; k < 3; k++) { const t = phase + (k * TAU) / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t) * 0.5, Math.sin(t) * 0.5); ctx.stroke(); }
    ctx.restore();
  }
  /* draw a vehicle centred on the pen origin.
     Parts are drawn back-to-front: side-by-side parts (a van's box and
     bonnet, a truck's cargo box and cab) sort by depth, and parts that sit
     on top of another (a cabin, a load bed) are drawn right after their base. */
  function drawVehicle(pn, kind, color, yaw, wheelPhase = 0) {
    const V = VEHICLES[kind] || VEHICLES.hatch, L = V.L, Wd = V.W, hl = L / 2, hw = Wd / 2;
    const W = orient(yaw);
    const leftNear = W(0, 1)[0] + W(0, 1)[1] > 0;
    const wheels = [[hl * 0.62, hw - 0.4], [-hl * 0.62, hw - 0.4], [hl * 0.62, -hw + 0.4], [-hl * 0.62, -hw + 0.4]];
    if (kind === "bus" || kind === "truck") { wheels[0][0] = hl * 0.7; wheels[2][0] = hl * 0.7; wheels[1][0] = -hl * 0.55; wheels[3][0] = -hl * 0.55; }
    const far = wheels.filter((w) => (w[1] > 0) !== leftNear), near = wheels.filter((w) => (w[1] > 0) === leftNear);
    if (!pn.E) pn.poly([W(-hl - 1, -hw - 1), W(hl + 1, -hw - 1), W(hl + 3, hw + 2), W(-hl + 1, hw + 2)].map((p) => [p[0] + 2, p[1] + 1, 0]), "rgba(40,30,70,0.18)", null);
    far.forEach((w) => drawWheel(pn, W, w[0], w[1], 2.6, wheelPhase));
    const fr = W(1, 0);
    const lights = (fs) => fs.forEach((f) => {
      const d = f.na * fr[0] + f.nb * fr[1];
      if (Math.abs(d) < 0.8) return;
      const front = d > 0;
      [[0.08, 0.26], [0.74, 0.92]].forEach(([u0, u1]) => {
        if (pn.E) { const p = onFace(f.q, (u0 + u1) / 2, 0.58); pn.glow(p[0], p[1], p[2], front ? 7 : 5, front ? "#FFF3C4" : "#FF4A3D", 0.9); }
        else decal(pn, f.q, u0, u1, 0.45, 0.7, front ? "#FFF6D6" : "#E0474C");
      });
      if (front && !pn.E) decal(pn, f.q, 0.3, 0.7, 0.3, 0.52, shade(color, -0.35));
    });
    const P3 = (bottom, z0, top, z1, col, topCol, deco) => () => { const fs = prism(pn, W, bottom, z0, top, z1, typeof col === "function" ? col : () => col, topCol); deco && deco(fs); return fs; };
    const depth = (x) => { const p = W(x, 0); return p[0] + p[1]; };
    const parts = []; // {x, draw, kids:[]}
    const part = (x, draw, kids = []) => { const p = { x, draw, kids }; parts.push(p); return p; };
    const kid = (x, draw) => ({ x, draw, kids: [] });
    const cabin = (bx0, bx1, tx0, tx1, z0, z1, wIn = 0.6) => P3(rect(bx0, bx1, -hw + wIn, hw - wIn), z0, rect(tx0, tx1, -hw + wIn + 0.8, hw - wIn - 0.8), z1, GLASS, shade(color, 0.16));
    const bodyP = (x0, x1, z0, z1, ins = 0.4, deco = lights) => P3(cham(x0, x1, -hw, hw, 1.4), z0, cham(x0 + ins, x1 - ins, -hw + ins, hw - ins, 1.2), z1, color, shade(color, 0.16), deco);
    if (kind === "hatch" || kind === "sedan") {
      part(0, bodyP(-hl, hl, 2.2, 6.6), [kind === "hatch" ? kid(-hl * 0.3, cabin(-hl + 2, hl * 0.35, -hl + 2.6, 0.2, 6.6, 11)) : kid(0, cabin(-hl * 0.55, hl * 0.3, -hl * 0.35, -0.2, 6.6, 10.8))]);
    } else if (kind === "bakkie") {
      const wall = (x0, x1, y0, y1) => P3(rect(x0, x1, y0, y1), 6.4, rect(x0, x1, y0, y1), 9, shade(color, -0.05), shade(color, 0.12));
      part(0, bodyP(-hl, hl, 2.2, 6.4), [
        kid(hl * 0.25, cabin(-1, hl * 0.45, 0, hl * 0.2, 6.4, 11.4)),
        kid(-hl * 0.5, wall(-hl + 0.5, -1.4, hw - 1.2, hw - 0.4)),
        kid(-hl * 0.5, wall(-hl + 0.5, -1.4, -hw + 0.4, -hw + 1.2)),
        kid(-hl + 0.8, wall(-hl + 0.4, -hl + 1.2, -hw + 0.4, hw - 0.4)),
      ]);
    } else if (kind === "van") {
      part((-hl + hl - 4) / 2, P3(cham(-hl, hl - 4, -hw, hw, 1.2), 2.2, cham(-hl + 0.3, hl - 4.5, -hw + 0.3, hw - 0.3, 1), 13.5, color, shade(color, 0.16), (fs) => { lights(fs); fs.forEach((f) => { if (f.i === 0) decal(pn, f.q, 0.62, 0.92, 0.55, 0.85, GLASS); if (f.i === 4) decal(pn, f.q, 0.08, 0.38, 0.55, 0.85, GLASS); }); }));
      part(hl - 2.3, P3(cham(hl - 4.6, hl, -hw, hw, 1.4), 2.2, cham(hl - 4.6, hl - 1.2, -hw + 0.4, hw - 0.4, 1), 7.2, color, shade(color, 0.12), lights),
        [kid(hl - 3, P3(rect(hl - 4.6, hl - 1.2, -hw + 0.5, hw - 0.5), 7.2, rect(hl - 4.6, hl - 4.2, -hw + 0.9, hw - 0.9), 13.2, GLASS, shade(color, 0.14)))]);
    } else if (kind === "bus") {
      part(0, P3(cham(-hl, hl, -hw, hw, 1.6), 2.2, cham(-hl + 0.2, hl - 0.2, -hw + 0.2, hw - 0.2, 1.4), 15, color, "#F4F1EA", (fs) => {
        fs.forEach((f) => {
          const len = Math.hypot(f.q[1][0] - f.q[0][0], f.q[1][1] - f.q[0][1]);
          if (len > 20) { for (let k = 0; k < 6; k++) decal(pn, f.q, 0.05 + k * 0.155, 0.17 + k * 0.155, 0.5, 0.84, GLASS); decal(pn, f.q, 0.02, 0.98, 0.2, 0.3, "#FFF8EC"); }
          else if (len > 5) decal(pn, f.q, 0.12, 0.88, 0.45, 0.88, GLASS);
        });
        lights(fs);
      }));
    } else if (kind === "truck") {
      part((-hl + hl - 7) / 2, P3(rect(-hl, hl - 7, -hw, hw), 3.2, rect(-hl, hl - 7, -hw, hw), 17, "#F6F3EC", "#FBF8F1", (fs) => { fs.forEach((f) => { const len = Math.hypot(f.q[1][0] - f.q[0][0], f.q[1][1] - f.q[0][1]); if (len > 15) decal(pn, f.q, 0.08, 0.92, 0.35, 0.6, color); }); lights(fs); }));
      part(hl - 3.5, P3(cham(hl - 7, hl, -hw, hw, 1.2), 2.2, cham(hl - 7, hl - 1.5, -hw + 0.3, hw - 0.3, 1), 12.5, color, shade(color, 0.14), (fs) => { fs.forEach((f) => { if (f.na * fr[0] + f.nb * fr[1] > 0.6) decal(pn, f.q, 0.12, 0.88, 0.55, 0.9, GLASS); else if (Math.abs(f.na * fr[0] + f.nb * fr[1]) < 0.3) decal(pn, f.q, 0.1, 0.5, 0.55, 0.9, GLASS); }); lights(fs); }));
    }
    parts.sort((p, q) => depth(p.x) - depth(q.x)).forEach((p) => { p.draw(); p.kids.sort((x, y) => depth(x.x) - depth(y.x)).forEach((k) => k.draw()); });
    near.forEach((w) => drawWheel(pn, W, w[0], w[1], 2.6, wheelPhase));
  }
  /* headlight beams painted on the road (emissive only) */
  function drawBeams(pn, kind, yaw) {
    const V = VEHICLES[kind] || VEHICLES.hatch, hl = V.L / 2, hw = V.W / 2, W = orient(yaw), ctx = pn.ctx;
    const p0 = pn.P(...W(hl, 0, 0)), p1 = pn.P(...W(hl + 34, -hw - 7, 0)), p2 = pn.P(...W(hl + 34, hw + 7, 0));
    const g = ctx.createLinearGradient(p0[0], p0[1], (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2);
    g.addColorStop(0, "rgba(255,240,190,0.55)"); g.addColorStop(1, "rgba(255,240,190,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.closePath(); ctx.fill();
  }

  /* ---- boats ---- */
  function drawBoat(pn, kind, color, yaw, flag) {
    const W = orient(yaw);
    if (!pn.E) pn.poly([W(-14, -7), W(14, -7), W(20, 0), W(14, 7), W(-14, 7)].map((p) => [p[0] + 3, p[1] + 2, -3]), "rgba(8,50,60,0.25)", null);
    if (kind === "yacht") {
      prism(pn, W, [[-12, -5], [10, -5], [15, 0], [10, 5], [-12, 5]], -2, [[-13, -5.8], [11, -5.8], [17, 0], [11, 5.8], [-13, 5.8]], 3.5, () => "#FBF8F1", "#D8B384");
      prism(pn, W, rect(-8, 3, -3.2, 3.2), 3.5, rect(-7, 1.5, -2.8, 2.8), 8, () => GLASS, "#FBF8F1");
      const m0 = W(-1, 0, 8), m1 = W(-1, 0, 38);
      pn.line(m0, m1, "#6F5A45", 1.1);
      if (!pn.E) {
        pn.poly([W(0, 0, 36), W(12, 0, 10), W(0, 0, 10)], "#FFF8EC", "rgba(60,40,22,0.2)");
        pn.poly([W(-2, 0, 34), W(-12, 0, 10), W(-2, 0, 10)], color, "rgba(60,40,22,0.2)");
      }
      pn.glow(...W(-1, 0, 38), 6, "#FF6B5B", 1);
    } else if (kind === "cargo") {
      prism(pn, W, [[-40, -11], [30, -11], [44, 0], [30, 11], [-40, 11]], -3, [[-41, -12], [31, -12], [46, 0], [31, 12], [-41, 12]], 9, () => color, "#C9A171");
      prism(pn, W, rect(-38, -26, -8, 8), 9, rect(-38, -26, -8, 8), 26, () => "#F6EDDF", "#E9E2D2");
      const bf = [];
      prism(pn, W, rect(-38, -26, -8, 8), 26, rect(-38, -26, -8, 8), 28, () => shade(color, -0.2), shade(color, -0.1), bf);
      [["#E0474C", -18], ["#3E7CB1", -6], ["#E9B949", 6], ["#2A9D8F", 18]].forEach(([c, x], k) => {
        prism(pn, W, rect(x - 5.5, x + 5.5, -8, 8), 9, rect(x - 5.5, x + 5.5, -8, 8), 9 + (k % 2 ? 9 : 17), () => c, shade(c, 0.12));
      });
      pn.glow(...W(-32, 0, 30), 5, "#FFF3C4", 1);
      if (flag) pn.glow(...W(40, 0, 12), 5, "#7CFF9B", 0.8);
    } else {
      // small motor launch / lead boat
      prism(pn, W, [[-10, -4.5], [8, -4.5], [12, 0], [8, 4.5], [-10, 4.5]], -2, [[-11, -5.2], [9, -5.2], [14, 0], [9, 5.2], [-11, 5.2]], 3, () => color, "#EFE3CF");
      prism(pn, W, rect(-6, 2, -3, 3), 3, rect(-5, 0.5, -2.6, 2.6), 8.5, () => "#FBF8F1", shade(color, 0.2));
      if (flag) { const f0 = W(-8, 0, 3), f1 = W(-8, 0, 16); pn.line(f0, f1, "#6F5A45", 0.9); if (!pn.E) pn.poly([f1, W(-8, 0, 12), W(-8 - 0.1, -6, 14)], flag, null); }
      pn.glow(...W(-5, 0, 9), 4, "#FFE7A8", 0.8);
    }
  }

  /* ---- people: simple geometric figures with a bit of personality ---- */
  const SKINS = ["#F3D2B6", "#E8BE98", "#CF9A74", "#A9745A", "#83573F", "#654030"];
  const HAIRS = ["#3A2A26", "#5A3A2C", "#2A2530", "#9A6A3A", "#E2B870", "#7A5A4A", "#C8C0C8"];
  const COATS = ["#E4726A", "#F2A65A", "#5FA8A0", "#6C8FC8", "#9C7CC8", "#F2C45A", "#E88AA8", "#7FB07A", "#F4EDE2", "#4E5A7A", "#D95F5F"];
  const HATS = ["#E4726A", "#F2C45A", "#6C8FC8", "#4E5A7A", "#F4EDE2", "#7FB07A"];
  const TRAITS = ["wave", "phone", "sip", "stretch", "look", "hum"];
  function randomLook(r) {
    const pick = (a) => a[(r() * a.length) | 0];
    const build = pick(["slim", "slim", "round", "tall", "kid"]);
    return {
      skin: pick(SKINS), hair: pick(HAIRS), style: pick(["short", "long", "bun", "curly", "bald"]), top: pick(COATS),
      build, h: build === "kid" ? 0.74 : build === "tall" ? 1.14 : 0.95 + r() * 0.1,
      hat: r() < 0.45 ? { kind: pick(["beanie", "cap", "sun", "bowler"]), c: pick(HATS) } : null,
      acc: r() < 0.5 ? pick(["bag", "phone", "coffee", "umbrella", "balloon"]) : null, accC: pick(HATS),
      trait: pick(TRAITS), scarf: r() < 0.25 ? pick(HATS) : null,
    };
  }
  /* person at screen point (x,y) (feet). dir: +1 facing screen-right, -1 left.
     front: facing the viewer. phase: walk cycle radians. act: current idle action. */
  function drawPerson(ctx, x, y, look, dir, front, phase, moving, scale = 1, act = null, t = 0) {
    const s = look.h * scale;
    const sw = moving ? Math.sin(phase) : 0;
    const bob = moving ? Math.abs(Math.cos(phase)) * 0.7 : 0;
    const wid = look.build === "round" ? 3.4 : look.build === "tall" ? 2.5 : 2.8;
    const bodyH = look.build === "tall" ? 9.5 : 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * s, s);
    ctx.fillStyle = "rgba(40,30,70,0.18)";
    ctx.beginPath(); ctx.ellipse(0, 0.3, wid + 0.6, 1.1, 0, 0, TAU); ctx.fill();
    ctx.translate(0, -bob);
    // legs: two short pegs that step
    ["#3E3A52", "#4A4662"].forEach((c, k) => { const side = k ? 1 : -1, off = sw * side * 1.4; ctx.fillStyle = c; ctx.fillRect(side * 0.9 - 0.7 + off, -2.6, 1.4, 2.6 + (side * sw > 0 ? -0.4 : 0)); });
    // coat: a soft trapezoid, lit on the left, shaded on the right
    const top = -2 - bodyH, hem = -2;
    const coat = (x0, x1, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0 * 0.62, top); ctx.lineTo(x1 * 0.62, top); ctx.lineTo(x1, hem); ctx.lineTo(x0, hem); ctx.closePath(); ctx.fill(); };
    coat(-wid, wid, look.top);
    coat(0.2, wid, shade(look.top, -0.2));
    ctx.fillStyle = look.top; ctx.beginPath(); ctx.ellipse(0, top + 0.4, wid * 0.62, 1.2, 0, Math.PI, 0); ctx.fill();
    if (look.scarf) { ctx.fillStyle = look.scarf; ctx.fillRect(-wid * 0.62, top - 0.4, wid * 1.24, 1.6); ctx.fillRect(front ? 0.4 : -1.4, top + 1, 1, 3); }
    // arms: little nubs that swing, or do the character's thing when idle
    const act0 = act && act.kind;
    const armY = top + 2.2;
    const handAt = (side) => {
      if (!moving && side === 1 && act0 === "wave") return [wid * 0.9 + 1.2, armY - 5 + Math.sin(t * 12) * 1.2];
      if (!moving && side === 1 && (act0 === "phone" || act0 === "sip")) return [wid * 0.5 + 0.6, armY - 2.4];
      if (!moving && act0 === "stretch") return [side * (wid * 0.8 + 1), armY - 6];
      return [side * (wid * 0.9) - sw * side * 1.1, armY + 4.2];
    };
    [-1, 1].forEach((side) => {
      const [hx, hy] = handAt(side);
      ctx.strokeStyle = side > 0 ? look.top : shade(look.top, -0.2); ctx.lineWidth = 1.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(side * wid * 0.62, armY); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = look.skin; ctx.beginPath(); ctx.arc(hx, hy, 0.75, 0, TAU); ctx.fill();
      if (side > 0) {
        if ((act0 === "phone" && !moving) || (look.acc === "phone" && !moving)) { ctx.fillStyle = "#2E2A40"; ctx.fillRect(hx - 0.4, hy - 2, 1.4, 2.2); ctx.fillStyle = "#9FE3FF"; ctx.fillRect(hx - 0.2, hy - 1.8, 1, 1.6); }
        else if (look.acc === "coffee" || act0 === "sip") { ctx.fillStyle = "#F4EDE2"; ctx.fillRect(hx - 0.8, hy - 2.2, 1.8, 2.2); ctx.fillStyle = "#9A6A3A"; ctx.fillRect(hx - 0.8, hy - 1.4, 1.8, 0.7); }
        else if (look.acc === "bag") { ctx.fillStyle = look.accC; ctx.fillRect(hx - 1.2, hy, 2.6, 2.6); }
        else if (look.acc === "umbrella") { ctx.strokeStyle = "#3E3A52"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx, hy - 9); ctx.stroke(); ctx.fillStyle = look.accC; ctx.beginPath(); ctx.moveTo(hx - 5, hy - 8); ctx.quadraticCurveTo(hx, hy - 14, hx + 5, hy - 8); ctx.closePath(); ctx.fill(); }
        else if (look.acc === "balloon") { ctx.strokeStyle = "rgba(60,50,80,0.6)"; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 2, hy - 7, hx + 1, hy - 13 + Math.sin(t * 2) * 0.6); ctx.stroke(); ctx.fillStyle = look.accC; ctx.beginPath(); ctx.ellipse(hx + 1, hy - 15.5 + Math.sin(t * 2) * 0.6, 2.2, 2.7, 0, 0, TAU); ctx.fill(); }
      }
    });
    // head
    const hr = look.build === "kid" ? 2.7 : 2.3, hy = top - hr + 0.2 + (act0 === "look" && !moving ? Math.sin(t * 3) * 0.3 : 0);
    ctx.fillStyle = look.skin; ctx.beginPath(); ctx.arc(0, hy, hr, 0, TAU); ctx.fill();
    ctx.fillStyle = shade(look.skin, -0.12); ctx.beginPath(); ctx.arc(0, hy, hr, -Math.PI / 2, Math.PI / 2); ctx.fill();
    ctx.fillStyle = look.hair;
    if (look.style !== "bald") {
      ctx.beginPath(); ctx.arc(0, hy - 0.3, hr + 0.2, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
      if (!front) { ctx.beginPath(); ctx.arc(0, hy, hr + 0.1, 0, TAU); ctx.fill(); }
      if (look.style === "long") { ctx.fillRect(-hr - 0.2, hy - 0.6, 1.3, 4.6); if (!front) ctx.fillRect(-hr, hy, hr * 2, 3.6); }
      if (look.style === "bun") { ctx.beginPath(); ctx.arc(-0.6, hy - hr - 0.8, 1.3, 0, TAU); ctx.fill(); }
      if (look.style === "curly") for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(-hr + 0.4 + k * 0.95, hy - hr + 0.5 + (k % 2) * 0.4, 1.1, 0, TAU); ctx.fill(); }
    }
    if (look.hat) {
      const c = look.hat.c; ctx.fillStyle = c;
      if (look.hat.kind === "beanie") { ctx.beginPath(); ctx.arc(0, hy - 0.4, hr + 0.3, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(0, hy - hr - 0.9, 0.9, 0, TAU); ctx.fill(); }
      else if (look.hat.kind === "cap") { ctx.beginPath(); ctx.arc(0, hy - 0.4, hr + 0.25, Math.PI, 0); ctx.fill(); ctx.fillRect(front ? 0 : -hr - 1.6, hy - 0.8, hr + 1.6, 0.9); }
      else if (look.hat.kind === "sun") { ctx.beginPath(); ctx.ellipse(0, hy - 0.9, hr + 2.2, 0.9, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, hy - 1, hr * 0.8, Math.PI, 0); ctx.fill(); }
      else { ctx.fillRect(-hr * 0.8, hy - hr - 1.6, hr * 1.6, 2.4); ctx.fillRect(-hr - 0.8, hy - 0.9, hr * 2 + 1.6, 0.8); }
    }
    // faceless, Monument Valley style: personality comes from build, dress and body language.
    // crew wear a cream backpack with a pennant in their colour, so they read at a glance
    if (look.crew) {
      const bx = front ? -wid * 0.95 : -wid * 0.35, bw = wid * 1.1;
      if (!front) { ctx.fillStyle = "#F7EEDF"; ctx.fillRect(bx, top + 1, bw, bodyH * 0.62); ctx.fillStyle = "#E6D8C2"; ctx.fillRect(bx + bw * 0.55, top + 1, bw * 0.45, bodyH * 0.62); }
      else { ctx.fillStyle = "#F7EEDF"; ctx.fillRect(-wid * 0.5, top + 0.6, 0.7, bodyH * 0.55); ctx.fillRect(wid * 0.25, top + 0.6, 0.7, bodyH * 0.55); }
      const px = front ? -wid * 0.7 : -wid * 0.1, py = top + 1;
      ctx.strokeStyle = "#5A4E7A"; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 9); ctx.stroke();
      const flap = Math.sin(t * 5 + look.h * 9) * 0.5;
      ctx.fillStyle = look.crew.flag; ctx.beginPath(); ctx.moveTo(px, py - 9); ctx.lineTo(px - 3.6, py - 7.9 + flap); ctx.lineTo(px, py - 6.6); ctx.closePath(); ctx.fill();
      if (look.crew.you) { ctx.fillStyle = "#FFE7A8"; ctx.beginPath(); ctx.arc(px, py - 9.3, 0.7, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  }
  /* small thought bubble above someone's head */
  function drawBubble(ctx, x, y, ch, k = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = "rgba(255,250,244,0.95)";
    ctx.beginPath(); ctx.ellipse(0, -5, 5.2, 4.2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-1.6, 0.4, 1, 0, TAU); ctx.fill();
    ctx.fillStyle = ch === "♥" ? "#E4726A" : "#4E5A7A";
    ctx.font = "700 6px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, 0, -4.8);
    ctx.restore();
  }

  /* ---- animals ---- */
  function drawAnimal(ctx, kind, x, y, dir, phase, col, moving = true, t = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    const sw = moving ? Math.sin(phase) : 0;
    if (kind === "dog") {
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(0, 0.3, 4.4, 1.2, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = shade(col, -0.3); ctx.lineWidth = 1; ctx.lineCap = "round";
      [[-3, 1], [2.6, -1]].forEach(([lx, s]) => { ctx.beginPath(); ctx.moveTo(lx, -3.2); ctx.lineTo(lx + sw * s * 1.2, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(lx + 0.8, -3.2); ctx.lineTo(lx + 0.8 - sw * s * 1.2, 0); ctx.stroke(); });
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -4.2, 4.2, 1.9, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(4.2, -6.2, 1.9, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5.9, -5.8, 1.2, 0.8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = shade(col, -0.35); ctx.beginPath(); ctx.ellipse(3.3, -7, 0.8, 1.4, 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = "#1a1a1a"; ctx.fillRect(4.6, -6.8, 0.6, 0.6); ctx.fillRect(6.8, -6, 0.6, 0.6);
      ctx.strokeStyle = col; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-4, -4.8); ctx.quadraticCurveTo(-5.6, -6.8 + sw, -5, -8); ctx.stroke();
    } else if (kind === "cat") {
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(0, 0.3, 3.3, 1, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = col;
      if (!moving) { ctx.beginPath(); ctx.ellipse(-0.3, -2.4, 2.6, 2.4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(1.2, -5.2, 1.7, 0, TAU); ctx.fill(); }
      else {
        ctx.strokeStyle = shade(col, -0.2); ctx.lineWidth = 0.9;
        [[-2, 1], [1.8, -1]].forEach(([lx, s]) => { ctx.beginPath(); ctx.moveTo(lx, -2.4); ctx.lineTo(lx + sw * s, 0); ctx.stroke(); });
        ctx.beginPath(); ctx.ellipse(0, -3, 3, 1.4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(3, -4.2, 1.6, 0, TAU); ctx.fill();
      }
      const hx = moving ? 3 : 1.2, hy = moving ? -4.2 : -5.2;
      ctx.beginPath(); ctx.moveTo(hx - 1.3, hy - 0.8); ctx.lineTo(hx - 0.9, hy - 2.6); ctx.lineTo(hx - 0.1, hy - 1.3); ctx.moveTo(hx + 0.3, hy - 1.3); ctx.lineTo(hx + 1.1, hy - 2.6); ctx.lineTo(hx + 1.4, hy - 0.8); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-2.4, -2.2); ctx.quadraticCurveTo(-5, -3 + Math.sin(t * 2) * 1.2, -4.3, -6.5); ctx.stroke();
    } else if (kind === "duck") {
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(0, 0.4, 5 + Math.sin(t * 3), 1.5, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = col || "#FFFFFF"; ctx.beginPath(); ctx.ellipse(0, -1.3, 3.6, 1.9, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(2.6, -3.6, 1.5, 0, TAU); ctx.fill();
      ctx.fillStyle = "#F2A541"; ctx.beginPath(); ctx.moveTo(3.9, -3.7); ctx.lineTo(5.6, -3.2); ctx.lineTo(3.9, -2.9); ctx.fill();
      ctx.fillStyle = "#1a1a1a"; ctx.fillRect(2.9, -4.1, 0.5, 0.5);
    } else if (kind === "sheep" || kind === "cow") {
      const cow = kind === "cow", L = cow ? 7 : 5;
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(0, 0.3, L + 1, 1.6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = cow ? "#4A3B33" : "#3B3B3B"; ctx.lineWidth = 1.2;
      [[-L * 0.6, 1], [L * 0.5, -1]].forEach(([lx, sd]) => { ctx.beginPath(); ctx.moveTo(lx, -3.4); ctx.lineTo(lx + sw * sd, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(lx + 1.3, -3.4); ctx.lineTo(lx + 1.3 - sw * sd, 0); ctx.stroke(); });
      if (cow) { ctx.fillStyle = "#FBF8F1"; ctx.beginPath(); ctx.ellipse(0, -6, L, 3.2, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#3B302A"; ctx.beginPath(); ctx.arc(-2, -7, 1.8, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(2.6, -5.4, 1.4, 0, TAU); ctx.fill(); ctx.fillStyle = "#FBF8F1"; ctx.beginPath(); ctx.ellipse(L + 1, -7, 2.4, 2, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#F2B6B0"; ctx.fillRect(L + 1.6, -6.6, 2, 1.4); }
      else { ctx.fillStyle = "#FBF8F1"; [[-2.4, -5.2, 3.2], [1, -6, 3.4], [3.2, -4.8, 2.6]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }); ctx.fillStyle = "#3B3B3B"; ctx.beginPath(); ctx.ellipse(5.6, -5.6, 1.9, 1.6, 0, 0, TAU); ctx.fill(); }
    } else if (kind === "pigeon") {
      const hop = moving ? Math.abs(Math.sin(phase)) * 1.2 : 0;
      ctx.fillStyle = "#8C94A0"; ctx.beginPath(); ctx.ellipse(0, -1.8 - hop, 2.2, 1.3, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(1.8, -3 - hop, 0.9, 0, TAU); ctx.fill();
      ctx.fillStyle = "#5C8A7A"; ctx.fillRect(1, -2.6 - hop, 1, 0.6);
    } else if (kind === "gull") {
      const f = Math.sin(phase) * 3;
      ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(-6, -f); ctx.quadraticCurveTo(-3, -2.5, 0, 0); ctx.quadraticCurveTo(3, -2.5, 6, -f); ctx.stroke();
      ctx.strokeStyle = "rgba(60,70,80,0.5)"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-6, -f); ctx.lineTo(-4.6, -f * 0.8 - 0.5); ctx.moveTo(6, -f); ctx.lineTo(4.6, -f * 0.8 - 0.5); ctx.stroke();
    } else if (kind === "dolphin") {
      // phase 0..1 through a jump arc
      const p = phase, hgt = Math.sin(p * Math.PI) * 16, xx = (p - 0.5) * 30, ang = Math.cos(p * Math.PI) * 0.9;
      ctx.save(); ctx.translate(xx, -hgt); ctx.rotate(ang);
      ctx.fillStyle = "#5A7D93"; ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#C9D8DF"; ctx.beginPath(); ctx.ellipse(0.5, 1, 5, 1, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#5A7D93"; ctx.beginPath(); ctx.moveTo(-1, -2); ctx.lineTo(-2.6, -4.6); ctx.lineTo(1.4, -2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-6.5, 0); ctx.lineTo(-9.5, -2.4); ctx.lineTo(-9, 2.2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6.5, -0.3); ctx.lineTo(8.8, 0.2); ctx.lineTo(6.5, 0.8); ctx.fill();
      ctx.restore();
      if (p < 0.12 || p > 0.88) { ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p < 0.5 ? -14 : 14, 0, 5, 1.6, 0, 0, TAU); ctx.stroke(); }
    } else if (kind === "fish") {
      const hgt = Math.sin(phase * Math.PI) * 6;
      ctx.fillStyle = "#E9B949"; ctx.beginPath(); ctx.ellipse(0, -hgt, 2.4, 1, Math.cos(phase * Math.PI) * 0.8, 0, TAU); ctx.fill();
      if (phase > 0.85) { ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(2, 0, 3, 1, 0, 0, TAU); ctx.stroke(); }
    }
    ctx.restore();
  }

  /* ---- static props (drawn into cached sprites) ---- */
  /* cube-cluster trees, Monument Valley style */
  const LEAVES = [["#6E9E78", "#88B48A"], ["#5E8E6E", "#7AA67E"], ["#7AA66A", "#94BE80"], ["#4F7D66", "#6A9A7A"]];
  function tree(pn, v = 0, s = 1) {
    const [g1, g2] = LEAVES[(((v | 0) % 4) + 4) % 4];
    if (!pn.E) pn.poly([[-4 * s, -4 * s, 0], [10 * s, -4 * s, 0], [14 * s, 6 * s, 0], [0, 6 * s, 0]], "rgba(40,30,70,0.16)", null);
    pn.box(0, 0, 0, 2.6 * s, 2.6 * s, 9 * s, "#8A6A6A");
    pn.box(0, 0, 9 * s, 13 * s, 13 * s, 9 * s, g1);
    pn.box(-3 * s, 3 * s, 14 * s, 8 * s, 8 * s, 7 * s, g2);
    pn.box(3 * s, -2 * s, 17 * s, 7 * s, 7 * s, 6 * s, g1);
  }
  function pine(pn, s = 1) {
    const [g1, g2] = LEAVES[3];
    if (!pn.E) pn.poly([[-4 * s, -4 * s, 0], [9 * s, -4 * s, 0], [12 * s, 5 * s, 0], [0, 5 * s, 0]], "rgba(40,30,70,0.16)", null);
    pn.box(0, 0, 0, 2.4 * s, 2.4 * s, 6 * s, "#8A6A6A");
    pn.box(0, 0, 6 * s, 12 * s, 12 * s, 7 * s, g1);
    pn.box(0, 0, 13 * s, 8.5 * s, 8.5 * s, 7 * s, g2);
    pn.box(0, 0, 20 * s, 5 * s, 5 * s, 6 * s, g1);
  }
  function palm(pn, s = 1, flip = 1) {
    const ctx = pn.ctx, [x, y] = pn.P(0, 0, 0);
    if (!pn.E) { ctx.fillStyle = "rgba(30,50,20,0.2)"; ctx.beginPath(); ctx.ellipse(x + 9 * s, y + 1, 12 * s, 3.5 * s, 0, 0, TAU); ctx.fill(); }
    ctx.lineCap = "round";
    if (!pn.E) { ctx.strokeStyle = "#9C7650"; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 4 * flip * s, y - 16 * s, x + 2 * flip * s, y - 30 * s); ctx.stroke(); }
    const tx = x + 2 * flip * s, ty = y - 30 * s;
    [[-14, 4], [-8, 9], [0, 10], [9, 8], [14, 3], [3, -6], [-5, -5]].forEach(([dx, dy], k) => {
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + dx * 0.5 * s, ty - 7 * s, tx + dx * s, ty + dy * s); ctx.quadraticCurveTo(tx + dx * 0.55 * s, ty - 3 * s, tx, ty); pn.fillPath(k % 2 ? "#5E9E5A" : "#4C8A4E");
    });
  }
  function bush(pn, c = "#7AA67E", flower) {
    pn.box(0, 0, 0, 9, 9, 6, c);
    pn.box(-2, 2, 6, 5, 5, 3, shade(c, 0.1));
    if (flower && !pn.E) { const [x, y] = pn.P(1, 1, 6.5); pn.ctx.fillStyle = flower; [[-2, -1], [2, 0], [0, 1.5]].forEach(([dx, dy]) => pn.ctx.fillRect(x + dx - 0.8, y + dy - 0.8, 1.6, 1.6)); }
  }
  function lampPost(pn, dbl = false) {
    pn.box(0, 0, 0, 2.4, 2.4, 1.5, "#566469");
    pn.line([0, 0, 1], [0, 0, 24], "#44545A", 1.4);
    const heads = dbl ? [[-5, 0], [5, 0]] : [[0, 0]];
    if (dbl) pn.line([-5, 0, 24], [5, 0, 24], "#44545A", 1.2);
    heads.forEach(([hx, hy]) => {
      pn.box(hx, hy, 22.5, 3.4, 3.4, 2.4, "#3B4A50");
      pn.poly([[hx - 1.4, hy + 1.8, 22.3], [hx + 1.4, hy + 1.8, 22.3], [hx + 1.4, hy + 1.8, 21], [hx - 1.4, hy + 1.8, 21]], "#FFF1C4", null);
      pn.glow(hx, hy, 21.5, 10, "#FFE3A0", 1.4);
    });
  }
  function bench(pn, axis = "a") {
    const [w, d] = axis === "a" ? [14, 4] : [4, 14];
    pn.box(0, 0, 3, w, d, 1.2, "#B98759");
    if (axis === "a") pn.box(0, -2, 4.2, w, 1, 4, "#A9794F"); else pn.box(-2, 0, 4.2, 1, d, 4, "#A9794F");
    const legs = axis === "a" ? [[-5, 0], [5, 0]] : [[0, -5], [0, 5]];
    legs.forEach(([x, y]) => pn.box(x, y, 0, 1.2, 1.2, 3, "#44545A"));
  }
  function trafficLight(pn, axisFacing, state) {
    // state: 'g' | 'y' | 'r' for the road this head controls
    pn.line([0, 0, 0], [0, 0, 20], "#3B4A50", 1.4);
    pn.box(0, 0, 18, 2.6, 2.6, 8, "#2F3A3F");
    const cols = { r: "#E0474C", y: "#F2C14E", g: "#4CC38A" };
    ["r", "y", "g"].forEach((c, k) => {
      const z = 24.4 - k * 2.6, on = state === c;
      const pts = axisFacing === "L" ? [[-0.9, 1.4, z - 0.9], [0.9, 1.4, z - 0.9], [0.9, 1.4, z + 0.9], [-0.9, 1.4, z + 0.9]] : [[1.4, -0.9, z - 0.9], [1.4, 0.9, z - 0.9], [1.4, 0.9, z + 0.9], [1.4, -0.9, z + 0.9]];
      if (pn.E) { if (on) { const p = pts[0]; pn.glow(axisFacing === "L" ? 0 : 1.4, axisFacing === "L" ? 1.4 : 0, z, 6, cols[c], 1); } }
      else pn.poly(pts, on ? cols[c] : shade(cols[c], -0.6), null);
    });
  }
  function hydrant(pn) { pn.cyl(0, 0, 0, 1.4, 5, "#D9534F"); pn.cyl(0, 0, 5, 0.9, 1.2, "#B8433F"); }
  function bin(pn) { pn.cyl(0, 0, 0, 2, 5, "#4E7D5B"); }
  function planter(pn, c = "#9C8E7A") { pn.box(0, 0, 0, 10, 10, 4, c); bush(pen(pn.ctx, pn.P(0, 0, 4)[0], pn.P(0, 0, 4)[1], { emit: pn.E }), "#6CAB5C", "#F4A3B5"); }
  function umbrellaTable(pn, c) {
    pn.cyl(0, 0, 0, 3.5, 6, "#F6EDDF");
    pn.line([0, 0, 6], [0, 0, 16], "#6F5A45", 0.9);
    const ctx = pn.ctx, [x, y] = pn.P(0, 0, 16);
    ctx.beginPath(); ctx.moveTo(x - 11, y + 3); ctx.quadraticCurveTo(x, y - 6, x + 11, y + 3); ctx.quadraticCurveTo(x, y, x - 11, y + 3); pn.fillPath(c);
    pn.box(-6, 0, 0, 3, 3, 4, "#B98759"); pn.box(6, 0, 0, 3, 3, 4, "#B98759");
  }
  function crate(pn, x, y, z, s, c = "#C8955E") { pn.box(x, y, z, s, s, s, c); pn.line([x - s / 2, y + s / 2 + 0.3, z + s / 2], [x + s / 2, y + s / 2 + 0.3, z + s / 2], shade(c, -0.25), 0.8); }
  function container(pn, x, y, z, c, axis = "a") {
    const [w, d] = axis === "a" ? [30, 12] : [12, 30];
    pn.box(x, y, z, w, d, 12, c);
    const bx = { x, y, z, w, d, h: 12 };
    for (let k = 1; k < 8; k++) pn.line(pn.faceP(bx, "L", k / 8, 0.05), pn.faceP(bx, "L", k / 8, 0.95), shade(c, -0.18), 0.6);
    for (let k = 1; k < 4; k++) pn.line(pn.faceP(bx, "R", k / 4, 0.05), pn.faceP(bx, "R", k / 4, 0.95), shade(c, -0.25), 0.6);
  }

  function Bt2(pn, s = 1) {
    const ctx = pn.ctx, [x, y] = pn.P(0, 0, -4);
    ctx.beginPath(); ctx.moveTo(x - 10 * s, y + 2); ctx.lineTo(x - 8 * s, y - 6 * s); ctx.lineTo(x - 2 * s, y - 10 * s); ctx.lineTo(x + 7 * s, y - 8 * s); ctx.lineTo(x + 11 * s, y - 1 * s); ctx.lineTo(x + 8 * s, y + 3); ctx.closePath(); pn.fillPath("#B7AC9A");
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 6 * s); ctx.lineTo(x - 2 * s, y - 10 * s); ctx.lineTo(x + 7 * s, y - 8 * s); ctx.lineTo(x + 1 * s, y - 4 * s); ctx.closePath(); pn.fillPath("#D4CBBA");
  }
