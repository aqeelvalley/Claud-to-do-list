  /* ===================== the map component ===================== */
    function staticDrawables(T) {
    const out = [];
    T.objs.forEach((o) => {
      if (o.kind === "building") out.push({ o, depth: o.a + o.b, kind: "building", w: o.w, d: o.d, H: o.H || 60, emit: true });
      else if (o.kind === "tree") out.push({ o, depth: o.a + o.b, kind: "tree", w: 20, d: 20, H: o.t === "palm" ? 44 : 34 });
      else if (o.kind === "lamp") out.push({ o, depth: o.a + o.b, kind: "lamp", w: 12, d: 12, H: 30, emit: true });
      else if (o.kind === "signal") out.push({ o, depth: o.a + o.b, kind: "signal", w: 8, d: 8, H: 30, emit: true });
      else if (o.kind === "parked") out.push({ o, depth: o.a + o.b, kind: "parked", w: 30, d: 30, H: 20 });
      else if (o.kind === "container") out.push({ o, depth: o.a + o.b, kind: "container", w: 34, d: 34, H: 12 * o.h + 10 });
      else if (o.kind === "prop") out.push({ o, depth: o.a + o.b, kind: "prop", w: 30, d: 30, H: 34, emit: o.p === "stall" });
    });
    out.forEach((d) => { d.sx = d.o.a - d.o.b; d.sy = (d.o.a + d.o.b) / 2; const bnd = spriteBounds(d); d.bnd = bnd; });
    return out.sort((x, y) => x.depth - y.depth);
  }
  function drawStatic(pn, d, st) {
    const o = d.o;
    if (d.kind === "building") { const f = B[o.drawer]; if (f) f(pn, { ...o, tier: st.tier || 1, data: st.data }); return; }
    if (d.kind === "tree") { if (o.t === "pine") pine(pn, o.s || 1); else if (o.t === "palm") palm(pn, o.s || 1, o.v % 2 ? 1 : -1); else tree(pn, o.v || 0, o.s || 1); return; }
    if (d.kind === "lamp") { lampPost(pn, !!o.pier); return; }
    if (d.kind === "signal") { trafficLight(pn, o.facing, st.light); return; }
    if (d.kind === "parked") { drawVehicle(pn, o.vk, o.c, o.yaw, 0); return; }
    if (d.kind === "container") { for (let k = 0; k < o.h; k++) container(pn, 0, 0, k * 12, k % 2 ? shade(o.c, -0.1) : o.c); return; }
    if (d.kind === "prop") {
      if (o.p === "bench") bench(pn, o.axis);
      else if (o.p === "planterTree") { pn.box(0, 0, 0, 14, 14, 5, "#C4B597"); const q = pen(pn.ctx, pn.P(0, 0, 5)[0], pn.P(0, 0, 5)[1], { emit: pn.E }); tree(q, 1, 0.8); }
      else if (o.p === "stall") { pn.box(0, 0, 0, 22, 12, 10, "#B98759"); [[-10, -5], [10, -5], [-10, 5], [10, 5]].forEach(([x, y]) => pn.line([x, y, 10], [x, y, 22], "#6F5A45", 1)); pn.box(0, 0, 22, 26, 16, 2, o.c); pn.box(-4, 2, 10, 6, 5, 3, "#E0474C"); pn.box(4, 2, 10, 6, 5, 3, "#F2C14E"); pn.glow(0, 0, 20, 10, "#FFE3A0", 1); }
      else if (o.p === "umbrella") umbrellaTable(pn, o.c);
      else if (o.p === "rock") Bt2(pn, o.s || 1);
      else if (o.p === "crate") { crate(pn, 0, 0, 0, 10); crate(pn, 8, 3, 0, 8, "#B98759"); }
      else if (o.p === "logs") { pn.box(0, 0, 0, 30, 6, 5, "#9C6B45"); pn.box(0, 7, 0, 30, 6, 5, "#8A5A3A"); pn.box(0, 3.5, 5, 30, 6, 5, "#A87B50"); }
      else if (o.p === "hay") { pn.cyl(0, 0, 0, 5, 6, "#E3C46B", { top: "#EFD68A" }); pn.cyl(9, 3, 0, 5, 6, "#D9B95C", { top: "#E8CE7E" }); }
    }
  }

  const WorldMap = React.forwardRef(function WorldMap(props, ref) {
    const { town: T, landmarks, onOpen, onShip, onPlot, onAgent, onCrew, onAssign, lightMode = "auto", leads = [], workers = [], reserveRight = 0 } = props;
    const wrap = React.useRef(null), cvs = React.useRef(null);
    const st = React.useRef(null);
    const cb = React.useRef({});
    cb.current = { onOpen, onShip, onPlot, onAgent, onCrew, onAssign, landmarks, lightMode, reserveRight, paused: props.paused, opening: props.opening, edit: props.edit, onEditMove: props.onEditMove, onEditSelect: props.onEditSelect, onEditInvalid: props.onEditInvalid };

    /* one-time engine setup per town */
    React.useEffect(() => {
      const cv = cvs.current, ctx = cv.getContext("2d");
      const emitCv = document.createElement("canvas"), ectx = emitCv.getContext("2d");
      const drawables = staticDrawables(T);
      // world bounds in screen units
      const { x0, x1, y0, y1 } = T.bbox;
      const bounds = { x0: x0 - 120, x1: x1 + 120, y0: y0 - 220, y1: y1 + 120 };
      const mob = window.innerWidth < 700, sim = createSim(T, { cars: Math.max(3, Math.min(mob ? 22 : 32, Math.round(T.edges.length * 0.9))), peds: Math.max(10, Math.min(mob ? 40 : 60, T.blocks.length * 4)) });
      const sprites = new Sprites();
      const chunks = new Map();
      const CH = 420;
      const S = window.__valleyWorld = st.current = { cam: { tx: 0, ty: 0, s: 0.5, fit: 0.3 }, bucket: 1, sim, sprites, drawables, bounds, hover: null, drag: null, lastSorted: [], dpr: 1, w: 0, h: 0, stopped: false, t0: performance.now(), plates: [] };
      const reduce = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();

      const resize = () => {
        const r = wrap.current.getBoundingClientRect();
        S.dpr = Math.min(window.devicePixelRatio || 1, r.width < 700 ? 1.5 : 2, S.dprCap || 9);
        S.w = r.width; S.h = r.height;
        cv.width = Math.round(r.width * S.dpr); cv.height = Math.round(r.height * S.dpr);
        emitCv.width = Math.ceil(cv.width / 2); emitCv.height = Math.ceil(cv.height / 2);
      };
      resize();
      const clampCam = () => {
        const c = S.cam, b = S.bounds;
        c.tx = Math.min(S.w * 0.75 - b.x0 * c.s, Math.max(S.w * 0.25 - b.x1 * c.s, c.tx));
        c.ty = Math.min(S.h * 0.75 - b.y0 * c.s, Math.max(S.h * 0.25 - b.y1 * c.s, c.ty));
      };
      const fitView = (anim) => {
        const b = S.bounds, mob = S.w < 700;
        const s = Math.max(0.12, Math.min(1.2, Math.min((S.w - 40 - (mob ? 0 : cb.current.reserveRight)) / (b.x1 - b.x0), (S.h - 200) / (b.y1 - b.y0))));
        S.cam.fit = s;
        let target = { s, tx: (S.w - (mob ? 0 : cb.current.reserveRight)) / 2 - ((b.x0 + b.x1) / 2) * s, ty: S.h / 2 + 30 - ((b.y0 + b.y1) / 2) * s };
        if (mob && !anim) { const hs = Math.max(s, 0.42); const home = T.plots.personal; target = { s: hs, tx: S.w / 2 - (home ? home.sx : 0) * hs, ty: S.h * 0.55 - (home ? home.sy : 0) * hs }; }
        anim ? fly(target) : (Object.assign(S.cam, target), clampCam());
      };
      let flyRaf = 0;
      const fly = (target, ms = 700) => {
        cancelAnimationFrame(flyRaf);
        const from = { ...S.cam }, t0 = performance.now();
        const stepF = (now) => {
          const t = reduce ? 1 : Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3);
          S.cam.tx = lerp(from.tx, target.tx, e); S.cam.ty = lerp(from.ty, target.ty, e); S.cam.s = lerp(from.s, target.s, e);
          if (t < 1) flyRaf = requestAnimationFrame(stepF);
        };
        flyRaf = requestAnimationFrame(stepF);
      };
      S.fly = fly; S.fitView = fitView; S.clampCam = clampCam;
      fitView(false);

      /* ---- sprite helpers ---- */
      const hourNow = () => { const m = cb.current.lightMode; if (m === "day") return 12.5; if (m === "golden") return 17.9; if (m === "night") return 22; const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
      const litFor = (key, q) => (k) => { const r = ((hash(key + ":" + k) % 1000) / 1000); return q > 0.2 + r * 1.3 && !(r > 0.86 && q >= 1); };
      const lmState = (d) => {
        const lm = d.o.landmark && cb.current.landmarks[d.o.landmark];
        return { tier: lm ? lm.tier : 1, data: lm ? lm.data : null, sig: lm ? lm.tier + ":" + JSON.stringify(lm.data || "") : "" };
      };
      const spriteFor = (d, sc, light) => {
        const stt = d.kind === "building" ? lmState(d) : { light };
        const key = (d.o.id || d.kind + d.o.a + "," + d.o.b) + "|" + sc + "|" + (stt.sig || "") + "|" + (light || "");
        const s = sprites.get(key, d.bnd, sc, (c, ox, oy) => { const p = pen(c, ox, oy); drawStatic(p, d, stt); return { wins: p.winCount() }; });
        s.stt = stt; s.key = key;
        return s;
      };
      const emitFor = (d, sc, q, base, light) => {
        if (!d.emit) return null;
        const key = base.key + "|E" + q;
        return sprites.get(key, d.bnd, sc, (c, ox, oy) => { drawStatic(pen(c, ox, oy, { emit: true, lit: litFor(d.o.id || d.o.a + "," + d.o.b, q) }), d, base.stt); });
      };
      const vehBnd = { hw: 34, top: 44, bot: 22 };
      const carSprite = (kind, color, yaw, wf, sc, emit) => {
        const yi = ((Math.round((yaw / TAU) * 32) % 32) + 32) % 32;
        const key = "v|" + kind + "|" + (emit ? "E" : color) + "|" + yi + "|" + (emit ? 0 : wf) + "|" + sc;
        return sprites.get(key, kind === "bus" || kind === "truck" ? { hw: 44, top: 50, bot: 28 } : vehBnd, sc, (c, ox, oy) => {
          const p = pen(c, ox, oy, { emit });
          drawVehicle(p, kind, color, (yi / 32) * TAU, wf * 1.05);
          if (emit) drawBeams(p, kind, (yi / 32) * TAU);
        });
      };
      const boatSprite = (b, sc, emit) => {
        const yi = ((Math.round(((b.yaw || 0) / TAU) * 16) % 16) + 16) % 16;
        const key = "b|" + b.kind + "|" + (emit ? "E" : b.color + (b.flag || "")) + "|" + yi + "|" + sc;
        return sprites.get(key, b.kind === "cargo" ? { hw: 70, top: 70, bot: 40 } : { hw: 36, top: 56, bot: 24 }, sc, (c, ox, oy) => drawBoat(pen(c, ox, oy, { emit }), b.kind, b.color, (yi / 16) * TAU, b.flag));
      };

      /* ---- ground chunks ---- */
      const chunk = (cx, cy, r) => {
        const key = cx + "," + cy + "," + r;
        let c = chunks.get(key);
        if (c) { c.used = S.frame; return c; }
        const cv2 = makeCanvas(CH * r, CH * r), g = cv2.getContext("2d");
        g.scale(r, r); g.translate(-cx * CH, -cy * CH);
        drawGround(g, T);
        c = { cv: cv2, used: S.frame };
        chunks.set(key, c);
        if (chunks.size > 70) { [...chunks.entries()].sort((p, q) => p[1].used - q[1].used).slice(0, 25).forEach(([k]) => chunks.delete(k)); }
        return c;
      };

      const poolSprite = makeCanvas(92, 46);
      { const g = poolSprite.getContext("2d"), gg = g.createRadialGradient(46, 23, 0, 46, 23, 46); gg.addColorStop(0, "rgba(255,214,170,0.3)"); gg.addColorStop(0.55, "rgba(255,206,160,0.1)"); gg.addColorStop(1, "rgba(255,180,90,0)"); g.setTransform(1, 0, 0, 0.5, 0, 0); g.fillStyle = gg; g.beginPath(); g.arc(46, 46, 46, 0, TAU); g.fill(); }
      /* ---- water ---- */
      const glints = [];
      { const r = rng(7); for (let k = 0; k < 260; k++) { const a = T.abox.a0 - 400 + r() * (T.abox.a1 - T.abox.a0 + 800), b = T.abox.b0 - 400 + r() * (T.abox.b1 - T.abox.b0 + 800); if (!T.landAt(a, b) && !T.landAt(a + 40, b) && !T.landAt(a, b + 40) && !T.landAt(a - 40, b - 40)) glints.push({ x: a - b, y: (a + b) / 2 + SEA_DROP, w: 5 + r() * 10, p: r() * TAU }); } }

      /* ---- frame ---- */
      let raf = 0, last = performance.now();
      S.frame = 0;
      const frame = (now) => {
        if (S.stopped) return;
        raf = requestAnimationFrame(frame);
        const rawDt = (now - last) / 1000;
        const dt = Math.min(0.08, rawDt); last = now;
        // adaptive quality: drop resolution if frames stay slow
        S.ema = S.ema == null ? rawDt : S.ema * 0.95 + rawDt * 0.05;
        if (S.frame > 90 && S.ema > 0.036 && S.dprCap !== 1 && !document.hidden) { S.dprCap = 1; resize(); }
        S.frame++;
        if (cb.current.paused && S.frame % 4) return;
        if (!reduce) sim.step(cb.current.paused ? dt * 4 : dt);
        else if (S.frame === 1) sim.step(0.016);
        render(now / 1000);
      };
      const render = (time) => {
        const { cam, dpr } = S;
        const sc = Math.min(2.8, bucketFor(cam.s * dpr));
        const L = lightAt(hourNow());
        const q = Math.round(L.night * 12) / 12;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // sea
        const g = ctx.createLinearGradient(0, 0, 0, cv.height);
        g.addColorStop(0, "#6CB8C2"); g.addColorStop(1, "#4A93A8");
        ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.setTransform(dpr * cam.s, 0, 0, dpr * cam.s, dpr * cam.tx, dpr * cam.ty);
        const vx0 = -cam.tx / cam.s, vy0 = -cam.ty / cam.s, vx1 = vx0 + S.w / cam.s, vy1 = vy0 + S.h / cam.s;
        // glints
        ctx.lineCap = "round";
        glints.forEach((w) => {
          if (w.x < vx0 - 20 || w.x > vx1 + 20 || w.y < vy0 - 20 || w.y > vy1 + 20) return;
          const a = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(time * 1.3 + w.p)), r = 1.6 + w.w * 0.12;
          ctx.fillStyle = `rgba(235,252,250,${a})`; ctx.beginPath(); ctx.moveTo(w.x, w.y - r * 0.5); ctx.lineTo(w.x + r, w.y); ctx.lineTo(w.x, w.y + r * 0.5); ctx.lineTo(w.x - r, w.y); ctx.closePath(); ctx.fill();
        });
        // ground chunks
        const r = Math.min(2, sc);
        for (let cy = Math.floor(vy0 / CH) - 1; cy <= Math.floor(vy1 / CH); cy++)
          for (let cx = Math.floor(vx0 / CH); cx <= Math.floor(vx1 / CH); cx++) {
            if ((cx + 1) * CH < S.bounds.x0 || cx * CH > S.bounds.x1 || (cy + 1) * CH < S.bounds.y0 - 100 || cy * CH > S.bounds.y1 + 100) continue;
            ctx.drawImage(chunk(cx, cy, r).cv, cx * CH, cy * CH, CH, CH);
          }
        // collect dynamic drawables
        const dyn = [];
        sim.cars.forEach((c) => dyn.push({ kind: "car", c, depth: c.a + c.b, sx: c.a - c.b, sy: (c.a + c.b) / 2 }));
        sim.peds.forEach((w) => { if (!w.hidden) dyn.push({ kind: "ped", w, depth: w.a + w.b + (w.carried ? 9999 : 0), sx: w.a - w.b, sy: (w.a + w.b) / 2 }); });
        sim.animals.forEach((m) => dyn.push({ kind: "animal", m, depth: m.a + m.b, sx: m.a - m.b, sy: (m.a + m.b) / 2 }));
        sim.boats.forEach((b) => { if (b.a != null) dyn.push({ kind: "boat", b, depth: b.a + b.b - 40, sx: b.a - b.b, sy: (b.a + b.b) / 2 + SEA_DROP }); });
        dyn.sort((x, y) => x.depth - y.depth);
        // merge with static (already sorted)
        const list = [];
        let i = 0, j = 0;
        const D = S.drawables;
        const vis = (d) => d.sx + d.bnd.hw > vx0 && d.sx - d.bnd.hw < vx1 && d.sy - d.bnd.top < vy1 && d.sy + d.bnd.bot > vy0;
        while (i < D.length || j < dyn.length) {
          if (j >= dyn.length || (i < D.length && D[i].depth <= dyn[j].depth)) { if (vis(D[i])) list.push(D[i]); i++; }
          else { const x = dyn[j++]; if (x.sx > vx0 - 60 && x.sx < vx1 + 60 && x.sy > vy0 - 40 && x.sy < vy1 + 80) list.push(x); }
        }
        S.lastSorted = list;
        const lightState = (d) => (d.kind === "signal" ? lightFor(d.o.node, d.o.axis === "a" ? "a" : "b", sim.t) : "");
        // colour pass
        list.forEach((d) => {
          if (d.bnd) {
            const s = spriteFor(d, sc, lightState(d));
            d._s = s;
            const op = cb.current.opening, age = op && d.o.landmark === op.id ? (performance.now() - op.t) / 1000 : 99;
            if (age < 3.4) {
              // just opened: the building rises out of the ground, dust at the base, confetti on top
              const p = clamp(age / 2.4, 0, 1), e = 1 - Math.pow(1 - p, 3), y0 = d.sy - s.oy;
              ctx.save(); ctx.beginPath(); ctx.rect(d.sx - s.ox - 4, y0 + s.h * (1 - e) - 2, s.w + 8, s.h * e + 4); ctx.clip();
              ctx.drawImage(s.cv, d.sx - s.ox, d.sy - s.oy, s.w, s.h); ctx.restore();
              for (let q = 0; q < 10; q++) { const th = (q / 10) * TAU + age, rr = 20 + age * 18; ctx.fillStyle = `rgba(240,232,220,${0.5 * (1 - age / 3.4)})`; ctx.beginPath(); ctx.ellipse(d.sx + Math.cos(th) * rr, d.sy + Math.sin(th) * rr * 0.5, 9, 5, 0, 0, TAU); ctx.fill(); }
              if (age > 1.8) for (let q = 0; q < 26; q++) { const h2 = (q * 97) % 100 / 100, fall = (age - 1.8) * 40; ctx.fillStyle = ["#E4826A", "#F0C06A", "#7CC2CB", "#9BC98A", "#B7A6DC"][q % 5]; ctx.fillRect(d.sx - 40 + h2 * 80 + Math.sin(age * 4 + q) * 6, y0 + 10 + fall + ((q * 37) % 30), 2.4, 3.6); }
            } else ctx.drawImage(s.cv, d.sx - s.ox, d.sy - s.oy, s.w, s.h);
            if (S.hover && d.o.landmark && S.hover === d.o.landmark) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.14; ctx.drawImage(s.cv, d.sx - s.ox, d.sy - s.oy, s.w, s.h); ctx.restore(); }
            return;
          }
          if (d.kind === "car") { const c = d.c, s = carSprite(c.kind, c.color, c.yaw, Math.floor(c.wheel) % 3, sc, false); d._s = s; ctx.drawImage(s.cv, d.sx - s.ox, d.sy - s.oy, s.w, s.h); return; }
          if (d.kind === "boat") { const b = d.b, s = boatSprite(b, sc, false); d._s = s; const bob = Math.sin(time * 1.6 + d.sx * 0.01) * 1.2; ctx.drawImage(s.cv, d.sx - s.ox, d.sy - s.oy + bob, s.w, s.h); return; }
          if (d.kind === "ped") {
            const w = d.w, dx = (w.da || 0) - (w.db || 0), dy = (w.da || 0) + (w.db || 0);
            const lift = w.carried ? -14 : 0;
            if (w.carried) { ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(d.sx, d.sy, 7, 3, 0, 0, TAU); ctx.fill(); }
            drawPerson(ctx, d.sx, d.sy + lift, w.look, dx < 0 ? -1 : 1, dy >= 0, w.phase, w.moving || w.carried, w.crew ? 1.08 : 1, w.act, time);
            if (w.bubble && !w.crew) drawBubble(ctx, d.sx + 3, d.sy + lift - 17 * w.look.h, w.bubble.ch, 1);
            // crew at work now and then show what they're making
            else if (w.crew && w.look.role && !w.moving && ((time * 0.4 + (w.phase || 0)) % 3) < 1.1) drawBubble(ctx, d.sx + 10, d.sy + lift - 13 * w.look.h, ROLE_BUBBLE[w.look.role], 1);
            if (w.crew) {
              const x = d.sx, y = d.sy + lift - 27 * w.look.h - (w.look.role === "thumb" && !w.moving ? 8 : 0);
              ctx.fillStyle = w.crew.color; ctx.strokeStyle = "#FFF8EC"; ctx.lineWidth = 1.2;
              ctx.beginPath(); ctx.arc(x, y, 4.2, 0, TAU); ctx.fill(); ctx.stroke();
              ctx.fillStyle = "#FFF"; ctx.font = "700 5px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText((w.name || "?")[0], x, y + 0.3);
              if (S.hoverCrew === w || w.carried) { ctx.font = "700 6px Fredoka, sans-serif"; const tw = ctx.measureText(w.name).width + 8; ctx.fillStyle = "rgba(255,248,236,0.95)"; ctx.fillRect(x - tw / 2, y - 14, tw, 9); ctx.fillStyle = "#24393d"; ctx.fillText(w.name, x, y - 9.3); }
            }
            if (w.dog && w.dog.trail.length > 8) {
              const [ta, tb] = w.dog.trail[0];
              const ddx = w.a - ta - (w.b - tb);
              const px = ta - tb, py = (ta + tb) / 2;
              ctx.strokeStyle = "rgba(60,40,30,0.6)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(d.sx + (dx < 0 ? -2 : 2), d.sy - 6.5); ctx.quadraticCurveTo((d.sx + px) / 2, (d.sy + py) / 2 - 1, px, py - 6); ctx.stroke();
              drawAnimal(ctx, "dog", px, py, ddx < 0 ? -1 : 1, w.phase * 1.3, w.dog.col, w.moving, time);
            }
            return;
          }
          if (d.kind === "animal" && d.m.kind === "builder") { const m = d.m; drawPerson(ctx, d.sx, d.sy, m.look, ((m.da || 1) - (m.db || 0)) < 0 ? -1 : 1, true, m.phase, m.moving, 0.95, m.moving ? null : { kind: "hammer" }, time); return; }
          if (d.kind === "animal") { const m = d.m; drawAnimal(ctx, m.kind, d.sx, d.sy, ((m.da || 1) - (m.db || 0)) < 0 ? -1 : 1, m.phase, m.col, m.moving, time); return; }
        });
        // effects: chimney smoke, flare, fountain, dolphins
        fx(time);
        // ---- lighting ----
        const tint = tintColor(L);
        if (tint !== "#FFFFFF") {
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = tint; ctx.fillRect(0, 0, cv.width, cv.height);
          // flatten: lift the darks into one soft indigo so night reads as a single calm wash
          if (L.night > 0) { ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.5 * L.night; ctx.fillStyle = "#2B2757"; ctx.fillRect(0, 0, cv.width, cv.height); }
          ctx.restore();
        }
        if (L.night > 0.04) {
          ectx.setTransform(1, 0, 0, 1, 0, 0); ectx.clearRect(0, 0, emitCv.width, emitCv.height);
          const ed = dpr / 2;
          ectx.setTransform(ed * cam.s, 0, 0, ed * cam.s, ed * cam.tx, ed * cam.ty);
          // lamp pools on the ground
          D.forEach((d) => {
            if (d.kind !== "lamp" || !(d.sx > vx0 - 60 && d.sx < vx1 + 60 && d.sy > vy0 - 60 && d.sy < vy1 + 60)) return;
            if ((hash("l" + d.o.idx) % 100) / 100 > q * 1.4) return;
            ectx.drawImage(poolSprite, d.sx + 3 - 46, d.sy + 2 - 23, 92, 46);
          });
          list.forEach((d) => {
            const s = d._s;
            if (!s) return;
            let es = null;
            if (d.bnd) { if (d.kind === "lamp" && (hash("l" + d.o.idx) % 100) / 100 > q * 1.4) es = null; else es = emitFor(d, sc, q, s, lightState(d)); }
            else if (d.kind === "car") es = carSprite(d.c.kind, d.c.color, d.c.yaw, 0, sc, true);
            else if (d.kind === "boat") es = boatSprite(d.b, sc, true);
            const bob = d.kind === "boat" ? Math.sin(time * 1.6 + d.sx * 0.01) * 1.2 : 0;
            if (d.kind === "building" || d.kind === "car" || d.kind === "boat") {
              ectx.globalCompositeOperation = "destination-out";
              ectx.drawImage(s.cv, d.sx - s.ox, d.sy - s.oy + bob, s.w, s.h);
              ectx.globalCompositeOperation = "source-over";
            }
            if (es) ectx.drawImage(es.cv, d.sx - es.ox, d.sy - es.oy + bob, es.w, es.h);
          });
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = Math.min(0.85, L.night * 0.95); // soft, un-blown lights
          ctx.drawImage(emitCv, 0, 0, cv.width, cv.height);
          ctx.restore();
          // lighthouse beam
          const lh = T.plots.goals;
          if (lh) {
            const [bx, by] = [lh.sx, lh.sy - 111];
            const ang = time * 0.9;
            const dx = Math.cos(ang), dy = Math.sin(ang) * 0.5, L2 = 520;
            const px = -dy, py = dx;
            const gb = ctx.createLinearGradient(bx, by, bx + dx * L2, by + dy * L2);
            gb.addColorStop(0, `rgba(255,240,214,${0.32 * L.night})`); gb.addColorStop(1, "rgba(255,246,200,0)");
            ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = gb;
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + dx * L2 + px * 70, by + dy * L2 + py * 70); ctx.lineTo(bx + dx * L2 - px * 70, by + dy * L2 - py * 70); ctx.closePath(); ctx.fill(); ctx.restore();
          }
        }
        // gulls above everything
        sim.gulls.forEach((gl) => { const a = gl.cx + Math.cos(gl.t) * gl.r, b = gl.cy + Math.sin(gl.t) * gl.r * 0.6; drawAnimal(ctx, "gull", a - b, (a + b) / 2 - gl.z, Math.cos(gl.t + 1.57) < 0 ? -1 : 1, time * 7 + gl.cx, null); });
        if (cb.current.edit) drawEdit(time);
        plates(time);
      };
      /* ---- layout editor overlay: the grid, every parcel's cells, and the one being dragged ---- */
      const cellOfWorld = (wx, wy) => {
        const ed = cb.current.edit; if (!ed) return null;
        const a = wy + wx / 2, b = wy - wx / 2, find = (L, v) => { for (let i = 0; i < L.length - 1; i++) if (v >= L[i] && v < L[i + 1]) return i; return -1; };
        const i = find(ed.A, a), j = find(ed.B, b);
        return i < 0 || j < 0 ? null : [i, j];
      };
      const drawEdit = (time) => {
        const ed = cb.current.edit, { A, B } = ed, cam = S.cam;
        const quad = (i, j) => [[A[i], B[j]], [A[i + 1], B[j]], [A[i + 1], B[j + 1]], [A[i], B[j + 1]]].map(([a, b]) => [a - b, (a + b) / 2]);
        const path = (pts) => { ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "rgba(248,240,236,0.42)"; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.setTransform(S.dpr * cam.s, 0, 0, S.dpr * cam.s, S.dpr * cam.tx, S.dpr * cam.ty);
        const occ = new Map(); ed.parcels.forEach((p) => cellsOf(p).forEach((c) => occ.set(c.join(","), p)));
        const all = [...occ.keys()].map((k) => k.split(",").map(Number));
        const i0 = Math.max(0, Math.min(...all.map((c) => c[0])) - 3), i1 = Math.min(A.length - 2, Math.max(...all.map((c) => c[0])) + 3), j0 = Math.max(0, Math.min(...all.map((c) => c[1])) - 3), j1 = Math.min(B.length - 2, Math.max(...all.map((c) => c[1])) + 3);
        ctx.lineWidth = 1 / cam.s; ctx.strokeStyle = "rgba(110,98,150,0.28)";
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { path(quad(i, j)); ctx.stroke(); }
        const ghost = S.ghost;
        ed.parcels.forEach((p) => {
          if (ghost && ghost.id === p.id) return;
          const meta = ed.meta[p.id] || {}, col = meta.color || "#9F98B8", sel = ed.selected === p.id;
          cellsOf(p).forEach(([i, j]) => { path(quad(i, j)); ctx.fillStyle = col + (sel ? "88" : "4A"); ctx.fill(); });
          cellsOf(p).forEach(([i, j]) => {
            const edges = [[[i, j], [i + 1, j], [i, j - 1]], [[i + 1, j], [i + 1, j + 1], [i + 1, j]], [[i + 1, j + 1], [i, j + 1], [i, j + 1]], [[i, j + 1], [i, j], [i - 1, j]]];
            edges.forEach(([g0, g1, nb]) => { if (occ.get(nb.join(",")) === p) return; const P0 = [A[g0[0]] - B[g0[1]], (A[g0[0]] + B[g0[1]]) / 2], P1 = [A[g1[0]] - B[g1[1]], (A[g1[0]] + B[g1[1]]) / 2]; ctx.beginPath(); ctx.moveTo(...P0); ctx.lineTo(...P1); ctx.strokeStyle = sel ? "#463D63" : col; ctx.lineWidth = (sel ? 3 : 2) / cam.s; ctx.stroke(); });
          });
        });
        if (ghost) {
          const bob = 0.5 + 0.5 * Math.sin(time * 6);
          ghost.cells.forEach(([i, j]) => { path(quad(i, j)); ctx.fillStyle = ghost.ok ? `rgba(120,200,150,${0.45 + 0.15 * bob})` : `rgba(228,130,106,${0.45 + 0.15 * bob})`; ctx.fill(); ctx.strokeStyle = ghost.ok ? "#4E9A6E" : "#C0604C"; ctx.lineWidth = 2.5 / cam.s; ctx.stroke(); });
        }
        // names on the parcels
        const ls = clamp(1 / cam.s, 0.5, 3);
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `600 ${12 * ls}px Fredoka, sans-serif`;
        ed.parcels.forEach((p) => {
          const cells = ghost && ghost.id === p.id ? ghost.cells : cellsOf(p), c0 = cells[0], q = quad(c0[0], c0[1]);
          const x = (q[0][0] + q[2][0]) / 2, y = (q[0][1] + q[2][1]) / 2, meta = ed.meta[p.id] || {};
          if (!meta.name) return;
          const tw = ctx.measureText(meta.name).width + 12 * ls;
          ctx.fillStyle = "rgba(255,248,240,0.94)"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - tw / 2, y - 9 * ls, tw, 18 * ls, 9 * ls) : ctx.rect(x - tw / 2, y - 9 * ls, tw, 18 * ls); ctx.fill();
          ctx.fillStyle = "#463D63"; ctx.fillText(meta.name, x, y + 0.5 * ls);
        });
        ctx.restore();
      };

      const fx = (time) => {
        const puff = (a, b, z, n = 4, col = "rgba(244,239,231,") => {
          for (let k = 0; k < n; k++) {
            const p = ((time * 0.35 + k / n) % 1);
            const x = a - b + p * 10, y = (a + b) / 2 - z - p * 34;
            ctx.fillStyle = col + (0.7 * (1 - p)) + ")"; ctx.beginPath(); ctx.arc(x, y, 3 + p * 6, 0, TAU); ctx.fill();
          }
        };
        const home = T.plots.personal; if (home) puff(home.a + 20, home.b - 2, 64);
        const wood = T.plots.wood; if (wood) puff(wood.a - 30, wood.b, 72, 3, "rgba(230,220,205,");
        const plant = T.objs.find((o) => o.drawer === "refinery");
        if (plant) {
          const fa = plant.a + plant.w / 2 - 30, fb = plant.b + plant.d / 2 - 30, x = fa - fb, y = (fa + fb) / 2 - 152;
          const fl = 1 + Math.sin(time * 9) * 0.15 + Math.sin(time * 23) * 0.08;
          ctx.fillStyle = "rgba(255,160,60,0.9)"; ctx.beginPath(); ctx.ellipse(x, y - 6 * fl, 3.4, 8 * fl, 0.12, 0, TAU); ctx.fill();
          ctx.fillStyle = "rgba(255,236,160,0.95)"; ctx.beginPath(); ctx.ellipse(x, y - 4 * fl, 1.6, 4.4 * fl, 0.1, 0, TAU); ctx.fill();
          puff(fa + 4, fb, 172, 3, "rgba(120,120,125,");
        }
        const pl = T.plots.plaza || T.objs.find((o) => o.id === "plaza");
        if (pl) {
          const x = pl.a - pl.b, y = (pl.a + pl.b) / 2 - 28;
          ctx.strokeStyle = "rgba(210,245,250,0.85)"; ctx.lineWidth = 1.3;
          for (let k = 0; k < 6; k++) { const th = (k / 6) * TAU + time * 0.4, ex = Math.cos(th) * 16, ey = Math.sin(th) * 8; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + ex * 0.5, y - 12 - Math.sin(time * 5 + k) * 1.5, x + ex, y + 14 + ey); ctx.stroke(); }
        }
        sim.dolphins.forEach((d) => { const p = (d.t % 9) / 2.2; if (p < 1) drawAnimal(ctx, "dolphin", d.a - d.b, (d.a + d.b) / 2 + SEA_DROP, d.dir, p); });
        const mw = T.marinaWater;
        if (mw) { const p = (time % 5) / 1.1; if (p < 1) { const a = lerp(mw.a0, mw.a1, 0.3 + 0.4 * ((Math.floor(time / 5) * 0.37) % 1)), b = mw.b0 + 150; drawAnimal(ctx, "fish", a - b, (a + b) / 2 + SEA_DROP, 1, p); } }
      };

      /* ---- nameplates & crew chips (screen-steady size) ---- */
      const plates = () => {
        if (cb.current.edit) return;
        const ls = clamp(1 / S.cam.s, 0.45, 3.4);
        const lms = cb.current.landmarks;
        S.plates = [];
        Object.values(lms).forEach((lm) => {
          const o = T.plots[lm.id];
          if (!o) return;
          const x = o.sx, y = o.sy - Math.min(o.H || 60, 150) * 0.78 - 10;
          ctx.save(); ctx.translate(x, y); ctx.scale(ls, ls);
          ctx.font = "600 12.5px Fredoka, Nunito, sans-serif";
          const nameW = ctx.measureText(lm.name).width;
          const wdt = nameW + 10 + 32 + (lm.open > 0 ? 22 : 0);
                    // flat tag: a cream pill with a pastel tab, no drop shadow; outline only on hover
          ctx.fillStyle = "#FFF6EC"; roundRect(ctx, -wdt / 2, -12, wdt, 25, 12.5); ctx.fill();
          if (S.hover === lm.id) { ctx.strokeStyle = lm.color; ctx.lineWidth = 1.6; ctx.stroke(); }
          ctx.fillStyle = "rgba(90,78,122,0.16)"; ctx.beginPath(); ctx.moveTo(-4, 13); ctx.lineTo(4, 13); ctx.lineTo(0, 17); ctx.closePath(); ctx.fill();
          ctx.fillStyle = lm.color; ctx.beginPath(); ctx.arc(-wdt / 2 + 13, 0.5, 9, 0, TAU); ctx.fill();
          const lvs = String(lm.level); ctx.fillStyle = "#FFF"; ctx.font = lvs.length > 2 ? "700 7px Fredoka, sans-serif" : "700 11px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(lvs, -wdt / 2 + 13, 1);
          // savings goals carry a loading bar under their name
          if (lm.data && lm.data.bar != null) { const bw = wdt - 16, f = clamp(lm.data.bar, 0, 1); ctx.fillStyle = "rgba(70,61,99,0.18)"; roundRect(ctx, -bw / 2, 15, bw, 6, 3); ctx.fill(); if (f > 0) { ctx.fillStyle = f >= 1 ? "#7CB87A" : "#E9B949"; roundRect(ctx, -bw / 2, 15, Math.max(6, bw * f), 6, 3); ctx.fill(); } }
          ctx.fillStyle = "#4A4068"; ctx.font = "600 12.5px Fredoka, Nunito, sans-serif"; ctx.textAlign = "left"; ctx.fillText(lm.name, -wdt / 2 + 27, 1);
          if (lm.open > 0) { ctx.fillStyle = shade(lm.color, 0.78); roundRect(ctx, wdt / 2 - 27, -7.5, 20, 16, 8); ctx.fill(); ctx.fillStyle = shade(lm.color, -0.35); ctx.textAlign = "center"; ctx.font = "700 11px Fredoka, sans-serif"; ctx.fillText(String(lm.open), wdt / 2 - 17, 1); }
          if (lm.alert) { const bob = Math.sin(performance.now() / 240) * 1.5; ctx.fillStyle = "#D9534F"; ctx.strokeStyle = "#FFF8EC"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(wdt / 2 - 3, -17 + bob, 8.5, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#FFF"; ctx.font = "800 12px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillText("!", wdt / 2 - 3, -16.5 + bob); }
          // crew working inside
          const inside = [...sim.crew.values()].filter((w) => w.hidden && w.crew.base === lm.id);
          inside.forEach((w, k) => {
            const cx = -wdt / 2 + 12 + k * 15, cy = -24;
            ctx.fillStyle = w.crew.color; ctx.strokeStyle = "#FFF8EC"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#FFF"; ctx.font = "700 8px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillText((w.name || "?")[0], cx, cy + 0.5);
            S.plates.push({ crew: w, x: x + cx * ls, y: y + cy * ls, r: 8 * ls });
          });
          S.plates.push({ lm: lm.id, x0: x - (wdt / 2) * ls, x1: x + (wdt / 2) * ls, y0: y - 12 * ls, y1: y + 13 * ls });
          ctx.restore();
        });
      };

      /* ---- hit testing ---- */
      const toWorld = (px, py) => ({ x: (px - S.cam.tx) / S.cam.s, y: (py - S.cam.ty) / S.cam.s });
      const alphaAt = (s, wx, wy, x, y) => {
        const px = Math.floor((wx - (x - s.ox)) * s.sc), py = Math.floor((wy - (y - s.oy)) * s.sc);
        if (px < 0 || py < 0 || px >= s.cv.width || py >= s.cv.height) return 0;
        try { return s.cv.getContext("2d").getImageData(px, py, 1, 1).data[3]; } catch { return 0; }
      };
      const hitCrew = (wx, wy) => {
        for (const p of S.plates) if (p.crew && Math.hypot(wx - p.x, wy - p.y) < p.r + 2) return p.crew;
        let best = null, bd = 12 / Math.max(0.6, S.cam.s);
        sim.crew.forEach((w) => { if (w.hidden) return; const sx = w.a - w.b, sy = (w.a + w.b) / 2 - 9; const d = Math.hypot(wx - sx, wy - sy); if (d < bd) { bd = d; best = w; } });
        return best;
      };
      const hitThing = (wx, wy) => {
        for (const p of S.plates) if (p.lm && wx >= p.x0 && wx <= p.x1 && wy >= p.y0 && wy <= p.y1) return { lm: p.lm };
        const list = S.lastSorted;
        for (let k = list.length - 1; k >= 0; k--) {
          const d = list[k];
          if (d.kind === "ped" && !d.w.crew) { if (Math.abs(wx - d.sx) < 5 && wy < d.sy + 2 && wy > d.sy - 18) return { agent: d.w, type: "person" }; continue; }
          if (d.kind === "car") { if (d._s && alphaAt(d._s, wx, wy, d.sx, d.sy) > 40) return { agent: d.c, type: "car" }; continue; }
          if (d.kind === "animal") { if (Math.abs(wx - d.sx) < 7 && wy < d.sy + 2 && wy > d.sy - 9) return { agent: d.m, type: "animal" }; continue; }
          if (d.kind === "boat") { if (d._s && alphaAt(d._s, wx, wy, d.sx, d.sy) > 40) return d.b.lead ? { ship: d.b.lead } : { agent: d.b, type: "boat" }; continue; }
          if (!d.bnd || !d._s) continue;
          if (!(d.o.landmark || d.o.plot)) continue;
          if (alphaAt(d._s, wx, wy, d.sx, d.sy) > 40) return d.o.landmark ? { lm: d.o.landmark } : { plot: d.o.plot, o: d.o };
        }
        return null;
      };
      S.hitThing = hitThing;

      /* ---- input ---- */
      const ptr = { map: new Map(), start: null, moved: false, pinch: null };
      const el = wrap.current;
      const zoomAt = (px, py, f) => {
        const c = S.cam, ns = clamp(c.s * f, Math.max(0.08, c.fit * 0.7), 3.2);
        c.tx = px - (px - c.tx) * (ns / c.s); c.ty = py - (py - c.ty) * (ns / c.s); c.s = ns; clampCam();
      };
      S.zoomAt = zoomAt;
      const local = (e) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const onDown = (e) => {
        if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
        cancelAnimationFrame(flyRaf);
        const [x, y] = local(e);
        ptr.map.set(e.pointerId, { x, y });
        if (ptr.map.size === 1) {
          ptr.moved = false; ptr.start = { x, y, tx: S.cam.tx, ty: S.cam.ty };
          const w0 = toWorld(x, y);
          ptr.parcel = null;
          if (cb.current.edit) {
            const cell = cellOfWorld(w0.x, w0.y), ed = cb.current.edit;
            const p = cell && ed.parcels.find((q) => cellsOf(q).some((c) => c[0] === cell[0] && c[1] === cell[1]));
            ptr.parcel = p && !p.locked ? { p, grab: cell } : null;
            ptr.crew = null;
          } else {
            const c = hitCrew(w0.x, w0.y);
            ptr.crew = c || null;
          }
        }
        if (ptr.map.size === 2) { const [p, q] = [...ptr.map.values()]; ptr.pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), s: S.cam.s }; ptr.moved = true; ptr.crew = null; if (S.drag) cancelDrag(); }
        try { el.setPointerCapture(e.pointerId); } catch {}
      };
      const cancelDrag = () => { if (S.drag) { S.drag.w.carried = false; S.drag = null; } };
      const onMove = (e) => {
        const [x, y] = local(e);
        if (!ptr.map.has(e.pointerId)) {
          // hover
          const w0 = toWorld(x, y);
          const cr = hitCrew(w0.x, w0.y);
          S.hoverCrew = cr;
          const h = cr ? null : hitThing(w0.x, w0.y);
          S.hover = h && h.lm ? h.lm : null;
          el.style.cursor = cr ? "grab" : h ? "pointer" : "grab";
          return;
        }
        ptr.map.set(e.pointerId, { x, y });
        if (ptr.map.size === 1 && ptr.start) {
          const dx = x - ptr.start.x, dy = y - ptr.start.y;
          if (!ptr.moved && Math.hypot(dx, dy) > 6) {
            ptr.moved = true;
            if (ptr.crew) { const w = ptr.crew; w.carried = true; w.hidden = false; if (w.onCross) { w.onCross.peds--; w.onCross = null; } S.drag = { w }; w.crew.status = "carried"; el.style.cursor = "grabbing"; }
          }
          if (ptr.parcel && ptr.moved) {
            const ed = cb.current.edit, w0 = toWorld(x, y), cell = cellOfWorld(w0.x, w0.y);
            if (cell && ed) {
              const p = ptr.parcel.p, at = [p.at[0] + cell[0] - ptr.parcel.grab[0], p.at[1] + cell[1] - ptr.parcel.grab[1]];
              if (!S.ghost || S.ghost.at[0] !== at[0] || S.ghost.at[1] !== at[1]) {
                const moved = { ...p, at };
                const chk = ed.check(ed.parcels.map((q) => (q.id === p.id ? moved : q)));
                S.ghost = { id: p.id, at, rot: p.rot || 0, cells: cellsOf(moved), ok: chk.ok, why: chk.why };
              }
            }
            if (x < 40) S.cam.tx += 6; if (x > S.w - 40) S.cam.tx -= 6; if (y < 60) S.cam.ty += 6; if (y > S.h - 90) S.cam.ty -= 6;
          } else if (S.drag) {
            const w0 = toWorld(x, y + 14);
            const a = w0.y + w0.x / 2, b = w0.y - w0.x / 2;
            S.drag.w.a = a; S.drag.w.b = b;
            const h = hitThing(toWorld(x, y).x, toWorld(x, y).y);
            S.hover = h && h.lm ? h.lm : null;
            // edge-pan while dragging
            if (x < 40) S.cam.tx += 6; if (x > S.w - 40) S.cam.tx -= 6; if (y < 60) S.cam.ty += 6; if (y > S.h - 90) S.cam.ty -= 6;
          } else if (ptr.moved) { S.cam.tx = ptr.start.tx + dx; S.cam.ty = ptr.start.ty + dy; clampCam(); }
        } else if (ptr.map.size === 2 && ptr.pinch) {
          const [p, q] = [...ptr.map.values()];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          zoomAt((p.x + q.x) / 2, (p.y + q.y) / 2, (ptr.pinch.s * d) / ptr.pinch.d / S.cam.s);
        }
      };
      const onUp = (e) => {
        const [x, y] = local(e);
        const was = ptr.map.has(e.pointerId);
        ptr.map.delete(e.pointerId);
        if (ptr.map.size < 2) ptr.pinch = null;
        if (ptr.map.size === 1) { const [p] = [...ptr.map.values()]; ptr.start = { x: p.x, y: p.y, tx: S.cam.tx, ty: S.cam.ty }; }
        if (!was || ptr.map.size > 0) return;
        if (ptr.parcel) {
          const pp = ptr.parcel, g = S.ghost;
          ptr.parcel = null; S.ghost = null;
          if (!ptr.moved) { cb.current.onEditSelect && cb.current.onEditSelect(pp.p.id); return; }
          if (g && g.ok && (g.at[0] !== pp.p.at[0] || g.at[1] !== pp.p.at[1])) cb.current.onEditMove && cb.current.onEditMove(pp.p.id, g.at, g.rot);
          else if (g && !g.ok) cb.current.onEditInvalid && cb.current.onEditInvalid(g.why);
          return;
        }
        if (cb.current.edit) { if (!ptr.moved) cb.current.onEditSelect && cb.current.onEditSelect(null); return; }
        if (S.drag) {
          const w = S.drag.w; w.carried = false; S.drag = null;
          const w0 = toWorld(x, y);
          const h = hitThing(w0.x, w0.y);
          const target = h && h.lm && !["plaza"].includes(h.lm) ? (h.lm === "epcmPlant" ? "epcm" : h.lm) : null;
          const g = toWorld(x, y + 14);
          sim.sendTo(w.crew.id, target, { a: g.y + g.x / 2, b: g.y - g.x / 2 });
          cb.current.onAssign && cb.current.onAssign(w.crew.id, target);
          el.style.cursor = "grab";
          return;
        }
        if (ptr.moved) return;
        const w0 = toWorld(x, y);
        if (ptr.crew) { cb.current.onCrew && cb.current.onCrew(ptr.crew.crew.id); return; }
        const h = hitThing(w0.x, w0.y);
        if (!h) return;
        if (h.lm) cb.current.onOpen && cb.current.onOpen(h.lm);
        else if (h.plot) cb.current.onPlot && cb.current.onPlot(h.plot);
        else if (h.ship) cb.current.onShip && cb.current.onShip(h.ship);
        else if (h.agent) cb.current.onAgent && cb.current.onAgent({ ...h.agent, type: h.type });
      };
      const onWheel = (e) => { e.preventDefault(); const [x, y] = local(e); zoomAt(x, y, Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016))); };
      el.addEventListener("pointerdown", onDown); el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp); el.addEventListener("pointercancel", onUp);
      el.addEventListener("wheel", onWheel, { passive: false });
      const onResize = () => { resize(); clampCam(); };
      window.addEventListener("resize", onResize);
      raf = requestAnimationFrame(frame);
      return () => {
        S.stopped = true; cancelAnimationFrame(raf); cancelAnimationFrame(flyRaf);
        el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp); el.removeEventListener("pointercancel", onUp);
        el.removeEventListener("wheel", onWheel); window.removeEventListener("resize", onResize);
      };
    }, [T]);

    // keep crew and ships in sync with data
    React.useEffect(() => { st.current && st.current.sim.syncCrew(workers); }, [T, JSON.stringify(workers.map((w) => [w.id, w.name, w.color, w.base || null]))]);
    React.useEffect(() => { st.current && st.current.sim.setLeads(leads); }, [T, JSON.stringify(leads.map((l) => [l.id, l.type, l.color]))]);

    React.useImperativeHandle(ref, () => ({
      fit: () => st.current && st.current.fitView(true),
      zoom: (f) => { const S = st.current; if (S) S.zoomAt(S.w / 2, S.h / 2, f); },
      flyTo: (x, y, o = {}) => {
        const S = st.current; if (!S) return;
        const s = o.s || Math.max(S.cam.s, 0.62);
        S.fly({ s, tx: (S.w - (o.offsetX || 0)) / 2 - x * s, ty: (S.h - (o.offsetY || 0)) / 2 + 40 - y * s });
      },
      toScreen: (x, y) => { const S = st.current, r = wrap.current.getBoundingClientRect(); return { x: r.left + S.cam.tx + x * S.cam.s, y: r.top + S.cam.ty + y * S.cam.s }; },
      sendCrew: (id, lm) => { const S = st.current; S && S.sim.sendTo(id, lm); },
      crewInfo: (id) => { const S = st.current; const w = S && S.sim.crew.get(id); return w ? { ...w.crew, name: w.name } : null; },
    }), []);

    return React.createElement("div", { ref: wrap, className: "viewport", role: "application", "aria-label": "Valley Isle map. Drag to explore, pinch or scroll to zoom, tap a building to go inside." },
      React.createElement("canvas", { ref: cvs, className: "world-canvas" }));
  });
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
