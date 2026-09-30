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
  const GLASS = "#5E8E9C";

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
    ctx.fillStyle = "#2B2F33"; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 0.56, 0, TAU); ctx.fillStyle = "#B8C1C6"; ctx.fill();
    ctx.strokeStyle = "#6E777C"; ctx.lineWidth = 0.14;
    for (let k = 0; k < 3; k++) { const t = phase + (k * TAU) / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t) * 0.5, Math.sin(t) * 0.5); ctx.stroke(); }
    ctx.restore();
  }
  /* draw a vehicle centred on the pen origin */
  function drawVehicle(pn, kind, color, yaw, wheelPhase = 0) {
    const V = VEHICLES[kind] || VEHICLES.hatch, L = V.L, Wd = V.W, hl = L / 2, hw = Wd / 2;
    const W = orient(yaw);
    const leftNear = W(0, 1)[0] + W(0, 1)[1] > 0;
    const wheels = [[hl * 0.62, hw - 0.4], [-hl * 0.62, hw - 0.4], [hl * 0.62, -hw + 0.4], [-hl * 0.62, -hw + 0.4]];
    if (kind === "bus" || kind === "truck") { wheels[0][0] = hl * 0.7; wheels[2][0] = hl * 0.7; wheels[1][0] = -hl * 0.55; wheels[3][0] = -hl * 0.55; }
    const far = wheels.filter((w) => (w[1] > 0) !== leftNear), near = wheels.filter((w) => (w[1] > 0) === leftNear);
    // ground shadow
    if (!pn.E) {
      pn.poly([W(-hl - 1, -hw - 1), W(hl + 1, -hw - 1), W(hl + 3, hw + 2), W(-hl + 1, hw + 2)].map((p) => [p[0] + 2, p[1] + 1, 0]), "rgba(20,30,40,0.22)", null);
    }
    far.forEach((w) => drawWheel(pn, W, w[0], w[1], 2.6, wheelPhase));
    const faces = [];
    const body = (x0, x1, z0, z1, ins = 0.4, c = color, top) =>
      prism(pn, W, cham(x0, x1, -hw, hw, 1.4), z0, cham(x0 + ins, x1 - ins, -hw + ins, hw - ins, 1.2), z1, () => c, top || shade(c, 0.12), faces);
    const glassCab = (bx0, bx1, tx0, tx1, z0, z1, wIn = 0.6, roof = color) =>
      prism(pn, W, rect(bx0, bx1, -hw + wIn, hw - wIn), z0, rect(tx0, tx1, -hw + wIn + 0.8, hw - wIn - 0.8), z1, () => GLASS, shade(roof, 0.12), faces);
    const frontFace = (fs) => fs.find((f) => f.i === 1 && (f.q.length));
    let cabFaces = [];
    if (kind === "hatch" || kind === "sedan") {
      const bf = body(-hl, hl, 2.2, 6.6);
      cabFaces = kind === "hatch" ? glassCab(-hl + 2, hl * 0.35, -hl + 2.6, 0.2, 6.6, 11) : glassCab(-hl * 0.55, hl * 0.3, -hl * 0.35, -0.2, 6.6, 10.8);
      lights(bf, 2.2, 6.6);
    } else if (kind === "bakkie") {
      const bf = body(-hl, hl, 2.2, 6.4);
      cabFaces = glassCab(-1, hl * 0.45, 0, hl * 0.2, 6.4, 11.4);
      // load bed walls
      prism(pn, W, rect(-hl + 0.5, -1.4, hw - 1.2, hw - 0.4), 6.4, rect(-hl + 0.5, -1.4, hw - 1.2, hw - 0.4), 9, () => shade(color, -0.05), shade(color, 0.1));
      prism(pn, W, rect(-hl + 0.5, -1.4, -hw + 0.4, -hw + 1.2), 6.4, rect(-hl + 0.5, -1.4, -hw + 0.4, -hw + 1.2), 9, () => shade(color, -0.05), shade(color, 0.1));
      prism(pn, W, rect(-hl + 0.4, -hl + 1.2, -hw + 0.4, hw - 0.4), 6.4, rect(-hl + 0.4, -hl + 1.2, -hw + 0.4, hw - 0.4), 9, () => shade(color, -0.05), shade(color, 0.1));
      lights(bf, 2.2, 6.4);
    } else if (kind === "van") {
      const bf = prism(pn, W, cham(-hl, hl - 4, -hw, hw, 1.2), 2.2, cham(-hl + 0.3, hl - 4.5, -hw + 0.3, hw - 0.3, 1), 13.5, () => color, shade(color, 0.14), faces);
      prism(pn, W, cham(hl - 4.6, hl, -hw, hw, 1.4), 2.2, cham(hl - 4.6, hl - 1.2, -hw + 0.4, hw - 0.4, 1), 7.2, () => color, shade(color, 0.1), faces);
      prism(pn, W, rect(hl - 4.6, hl - 1.2, -hw + 0.5, hw - 0.5), 7.2, rect(hl - 4.6, hl - 4.2, -hw + 0.9, hw - 0.9), 13.2, () => GLASS, shade(color, 0.12));
      bf.forEach((f) => { if (Math.abs(f.i % 4) === 0 || f.i === 4) decal(pn, f.q, 0.62, 0.92, 0.55, 0.85, GLASS); });
      lights(faces, 2.2, 7);
    } else if (kind === "bus") {
      const bf = prism(pn, W, cham(-hl, hl, -hw, hw, 1.6), 2.2, cham(-hl + 0.2, hl - 0.2, -hw + 0.2, hw - 0.2, 1.4), 15, () => color, "#F4F1EA", faces);
      bf.forEach((f) => {
        const len = Math.hypot(f.q[1][0] - f.q[0][0], f.q[1][1] - f.q[0][1]);
        if (len > 20) { for (let k = 0; k < 6; k++) decal(pn, f.q, 0.05 + k * 0.155, 0.17 + k * 0.155, 0.5, 0.84, GLASS, "rgba(255,255,255,0.5)"); decal(pn, f.q, 0.02, 0.98, 0.2, 0.3, "#FFF8EC"); }
        else if (len > 5) decal(pn, f.q, 0.12, 0.88, 0.45, 0.88, GLASS);
      });
      lights(faces, 2.2, 8);
    } else if (kind === "truck") {
      prism(pn, W, rect(-hl, hl - 7, -hw, hw), 3.2, rect(-hl, hl - 7, -hw, hw), 17, () => "#F6F3EC", "#FBF8F1", faces);
      faces.forEach((f) => { const len = Math.hypot(f.q[1][0] - f.q[0][0], f.q[1][1] - f.q[0][1]); if (len > 15) decal(pn, f.q, 0.08, 0.92, 0.35, 0.6, color); });
      const cf = [];
      prism(pn, W, cham(hl - 7, hl, -hw, hw, 1.2), 2.2, cham(hl - 7, hl - 1.5, -hw + 0.3, hw - 0.3, 1), 12.5, () => color, shade(color, 0.12), cf);
      cf.forEach((f) => { const fr = W(1, 0); if (f.na * fr[0] + f.nb * fr[1] > 0.6) decal(pn, f.q, 0.12, 0.88, 0.55, 0.9, GLASS); else decal(pn, f.q, 0.1, 0.5, 0.55, 0.9, GLASS); });
      lights(cf.concat(faces), 2.2, 7);
    }
    near.forEach((w) => drawWheel(pn, W, w[0], w[1], 2.6, wheelPhase));
    // headlights / taillights on whichever end faces the viewer
    function lights(fs, z0, z1) {
      const fr = W(1, 0);
      fs.forEach((f) => {
        const d = f.na * fr[0] + f.nb * fr[1];
        if (Math.abs(d) < 0.8) return;
        const front = d > 0, v0 = 0.45, v1 = 0.7;
        const col = front ? "#FFF6D6" : "#E0474C";
        [[0.08, 0.26], [0.74, 0.92]].forEach(([u0, u1]) => {
          if (pn.E) {
            const p = onFace(f.q, (u0 + u1) / 2, (v0 + v1) / 2);
            pn.glow(p[0], p[1], p[2], front ? 7 : 5, front ? "#FFF3C4" : "#FF4A3D", 0.9);
          } else decal(pn, f.q, u0, u1, v0, v1, col, "rgba(40,30,20,0.4)");
        });
        if (front) { if (!pn.E) decal(pn, f.q, 0.3, 0.7, 0.3, 0.52, shade(color, -0.35)); }
      });
    }
    return faces;
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

  /* ---- people ---- */
  const SKINS = ["#F1C9A5", "#E6B48E", "#C98E66", "#9E6A48", "#7A4E33", "#5C3A26"];
  const HAIRS = ["#2B1D14", "#4A2F1D", "#1A1A1A", "#8A5A2B", "#D8B26E", "#6B4A3A", "#B8B2A8"];
  const TOPS = ["#2A9D8F", "#D9734E", "#3E7CB1", "#E9B949", "#C2577A", "#6DAE5B", "#7E6BC4", "#F08A4B", "#1F8FA3", "#F6EDDF", "#44545A"];
  const BOTTOMS = ["#3B4A5A", "#2F3E4C", "#5B4A3A", "#8A7A66", "#394B6E", "#2B2B2B"];
  function randomLook(r) {
    const pick = (a) => a[(r() * a.length) | 0];
    return { skin: pick(SKINS), hair: pick(HAIRS), style: pick(["short", "short", "long", "bun", "cap", "curly"]), top: pick(TOPS), bottom: pick(BOTTOMS),
      dress: r() < 0.18, h: 0.9 + r() * 0.22, bag: r() < 0.2 ? pick(["#8A5A2B", "#C2577A", "#3E7CB1"]) : null, hat: pick(["#D9534F", "#3E7CB1", "#F2C14E"]) };
  }
  /* person at screen point (x,y) (feet). dir: +1 facing screen-right, -1 left.
     front: facing the viewer. phase: walk cycle radians. */
  function drawPerson(ctx, x, y, look, dir, front, phase, moving, scale = 1) {
    const s = look.h * scale;
    const sw = moving ? Math.sin(phase) : 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * s, s);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath(); ctx.ellipse(0, 0.3, 3.4, 1.2, 0, 0, TAU); ctx.fill();
    const hipY = -5.6, shY = -10.4;
    const leg = (side, c) => {
      const fx = side * 0.9 + sw * side * 2.2, fy = -Math.abs(sw * side) * 0.5 * (side * sw > 0 ? 1 : 0);
      ctx.strokeStyle = c; ctx.lineWidth = 1.7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(side * 0.8, hipY); ctx.lineTo(fx, fy - 0.6); ctx.stroke();
      ctx.fillStyle = "#2A2420"; ctx.beginPath(); ctx.ellipse(fx + 0.5, fy - 0.3, 1.2, 0.6, 0, 0, TAU); ctx.fill();
    };
    const arm = (side, c) => {
      const hx = side * 1.9 - sw * side * 1.9, hy = shY + 4.6;
      ctx.strokeStyle = c; ctx.lineWidth = 1.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(side * 1.9, shY + 0.4); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = look.skin; ctx.beginPath(); ctx.arc(hx, hy + 0.3, 0.75, 0, TAU); ctx.fill();
    };
    // back limbs
    leg(-1, shade(look.dress ? look.skin : look.bottom, -0.15));
    arm(-1, shade(look.top, -0.2));
    // torso
    if (look.dress) {
      leg(1, look.skin);
      ctx.fillStyle = look.top; ctx.beginPath(); ctx.moveTo(-1.9, shY); ctx.lineTo(1.9, shY); ctx.lineTo(2.9, hipY + 1.8); ctx.lineTo(-2.9, hipY + 1.8); ctx.closePath(); ctx.fill();
    } else {
      leg(1, look.bottom);
      ctx.fillStyle = look.bottom; ctx.fillRect(-2, hipY - 1.2, 4, 1.8);
      ctx.fillStyle = look.top; ctx.beginPath(); ctx.moveTo(-2.1, shY); ctx.lineTo(2.1, shY); ctx.lineTo(2.2, hipY); ctx.lineTo(-2.2, hipY); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(0.6, shY, 1.5, hipY - shY);
    if (look.bag) { ctx.fillStyle = look.bag; ctx.fillRect(-3.3, hipY - 2.2, 2, 2.6); }
    arm(1, look.top);
    // head
    const hy = shY - 2.6;
    ctx.fillStyle = look.skin; ctx.fillRect(-0.6, shY - 1, 1.2, 1.1);
    ctx.beginPath(); ctx.arc(0, hy, 2.35, 0, TAU); ctx.fill();
    ctx.fillStyle = look.hair;
    if (look.style === "cap") {
      ctx.fillStyle = look.hat; ctx.beginPath(); ctx.arc(0, hy - 0.4, 2.45, Math.PI, 0); ctx.fill(); ctx.fillRect(front ? 0 : -3.6, hy - 0.6, 3.6, 0.8);
    } else {
      ctx.beginPath(); ctx.arc(0, hy - 0.2, 2.5, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
      if (!front) { ctx.beginPath(); ctx.arc(0, hy, 2.4, 0, TAU); ctx.fill(); }
      if (look.style === "long") { ctx.fillRect(-2.5, hy - 0.5, 1.2, 4.2); if (!front) ctx.fillRect(-2.4, hy, 4.8, 3.6); else ctx.fillRect(1.4, hy - 0.5, 1.1, 3.4); }
      if (look.style === "bun") { ctx.beginPath(); ctx.arc(-0.6, hy - 2.7, 1.3, 0, TAU); ctx.fill(); }
      if (look.style === "curly") { for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(-2 + k, hy - 2 + (k % 2) * 0.4, 1.1, 0, TAU); ctx.fill(); } }
    }
    if (front) { ctx.fillStyle = "#2A2420"; ctx.fillRect(0.7, hy - 0.2, 0.55, 0.7); ctx.fillRect(1.7, hy - 0.2, 0.5, 0.7); }
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
  function tree(pn, v = 0, s = 1) {
    const ctx = pn.ctx, [x, y] = pn.P(0, 0, 0);
    const greens = [["#4C8A4E", "#6CAB5C", "#9BCB76"], ["#5A9650", "#7BB765", "#AAD47F"], ["#447D4B", "#62A15A", "#8FC271"], ["#3F7A55", "#5C9E6B", "#8CC58F"]][(((v | 0) % 4) + 4) % 4];
    if (!pn.E) { ctx.fillStyle = "rgba(30,50,20,0.22)"; ctx.beginPath(); ctx.ellipse(x + 7 * s, y + 1, 13 * s, 4.5 * s, 0, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(x - 1.6 * s, y); ctx.lineTo(x - 1.2 * s, y - 12 * s); ctx.lineTo(x + 1.2 * s, y - 12 * s); ctx.lineTo(x + 1.6 * s, y); ctx.closePath(); pn.fillPath("#7A5236");
    const blobs = [[-5, -15, 7.5, 0], [5, -16, 7.5, 1], [0, -22, 8, 1], [-3, -20, 5, 2], [4, -23, 4.5, 2]];
    blobs.forEach(([bx, by, r, k]) => { ctx.beginPath(); ctx.arc(x + bx * s, y + by * s, r * s, 0, TAU); pn.fillPath(greens[k]); });
  }
  function pine(pn, s = 1) {
    const ctx = pn.ctx, [x, y] = pn.P(0, 0, 0);
    if (!pn.E) { ctx.fillStyle = "rgba(30,50,20,0.22)"; ctx.beginPath(); ctx.ellipse(x + 6 * s, y + 1, 10 * s, 3.5 * s, 0, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.rect(x - 1.2 * s, y - 6 * s, 2.4 * s, 6 * s); pn.fillPath("#6F4A30");
    [[0, 9, "#3E7A4C"], [7, 7.5, "#4C8A55"], [13, 6, "#5E9E63"]].forEach(([o, w, c]) => { ctx.beginPath(); ctx.moveTo(x - w * s, y - (5 + o) * s); ctx.lineTo(x, y - (20 + o) * s); ctx.lineTo(x + w * s, y - (5 + o) * s); ctx.closePath(); pn.fillPath(c); });
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
  function bush(pn, c = "#6CAB5C", flower) {
    const ctx = pn.ctx, [x, y] = pn.P(0, 0, 0);
    [[-3, -3, 4, 0], [3, -3.5, 4.5, 1], [0, -6, 3.5, 2]].forEach(([bx, by, r, k]) => { ctx.beginPath(); ctx.arc(x + bx, y + by, r, 0, TAU); pn.fillPath(shade(c, [-0.1, 0, 0.15][k])); });
    if (flower && !pn.E) { ctx.fillStyle = flower; [[-3, -6], [3, -6.5], [0, -8.5], [4, -3], [-4, -2.5]].forEach(([fx, fy]) => { ctx.beginPath(); ctx.arc(x + fx, y + fy, 0.9, 0, TAU); ctx.fill(); }); }
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
