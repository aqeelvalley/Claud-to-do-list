  /* ===================== WebGL renderer: the whole island in a few batched draws =====================
   * Sprites are still painted once with Canvas 2D (kit.js) and cached (Sprites). Here they are
   * packed into a handful of big atlas textures and drawn as depth-sorted quads. Ground chunks get
   * a texture each. Things that change every frame (people, animals, planes, smoke) are painted
   * into one small sheet that is uploaded once per frame. Day/night tint and the lights are done
   * in the shader, so there are no full-screen blends at all - that was most of the frame before.
   */
  const GLF = { LIT: 1, CLIP: 2, BRIGHT: 4 };
  function createGL(cv) {
    if (cv.__G) return cv.__G;
    let gl = null;
    try { gl = cv.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "high-performance" }); } catch { gl = null; }
    if (!gl) return null;
    const MAXP = 6, SHEET_W = 1024, MAXQ = 4096, FL = 10;
    const PAGE = Math.min(2048, gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048);
    const data = new Float32Array(MAXQ * 4 * FL);
    let prog, vbuf, ibuf, U = {}, pages = [], gen = 1, solo = new Map(), soloCur = null, nq = 0, frame = 0, lost = false;
    let xf = null; // optional affine (k, ox, oy) applied to queued quads, for the island rising
    // per-frame sheet for things that change every frame
    const sheet = document.createElement("canvas"); sheet.width = SHEET_W; sheet.height = 256;
    const sctx = sheet.getContext("2d");
    let sheetTex = null, sh = { x: 0, y: 0, rowH: 0, used: 0, dirty: false, want: 256 };
    const white = document.createElement("canvas"); white.width = white.height = 4;
    { const g = white.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, 4, 4); }
    const whiteS = { cv: white };

    const VS = "attribute vec2 aP;attribute vec2 aU;attribute vec4 aC;attribute vec2 aT;uniform vec4 uCam;varying vec2 vU;varying vec4 vC;varying vec2 vT;varying vec2 vW;" +
      "void main(){vU=aU;vC=aC;vT=aT;vW=aP;gl_Position=vec4(aP*uCam.xy+uCam.zw,0.,1.);}";
    const FS = "precision highp float;uniform sampler2D t0,t1,t2,t3,t4,t5,t6,t7;uniform vec3 uTint,uLift;uniform vec4 uEll;varying vec2 vU;varying vec4 vC;varying vec2 vT;varying vec2 vW;" +
      "void main(){vec4 c;float i=vT.x;" +
      "if(i<.5)c=texture2D(t0,vU);else if(i<1.5)c=texture2D(t1,vU);else if(i<2.5)c=texture2D(t2,vU);else if(i<3.5)c=texture2D(t3,vU);" +
      "else if(i<4.5)c=texture2D(t4,vU);else if(i<5.5)c=texture2D(t5,vU);else if(i<6.5)c=texture2D(t6,vU);else c=texture2D(t7,vU);" +
      "c*=vC;float f=vT.y;" +
      "if(mod(floor(f/2.),2.)>.5){vec2 d=(vW-uEll.xy)/uEll.zw;if(dot(d,d)>1.)discard;}" +
      "if(mod(floor(f/4.),2.)>.5)c.rgb*=1.14;" +
      "if(mod(f,2.)>.5){c.rgb*=uTint;c.rgb+=(c.a-c.rgb)*uLift;}" +
      "gl_FragColor=c;}";

    const mkTex = (w, h, src) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      return t;
    };
    const init = () => {
      const sh2 = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      prog = gl.createProgram();
      gl.attachShader(prog, sh2(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh2(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      ["uCam", "uTint", "uLift", "uEll"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
      for (let k = 0; k < 8; k++) gl.uniform1i(gl.getUniformLocation(prog, "t" + k), k);
      vbuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbuf); gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
      const idx = new Uint16Array(MAXQ * 6);
      for (let q = 0; q < MAXQ; q++) idx.set([q * 4, q * 4 + 1, q * 4 + 2, q * 4, q * 4 + 2, q * 4 + 3], q * 6);
      ibuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      const at = (n, size, off) => { const l = gl.getAttribLocation(prog, n); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, FL * 4, off * 4); };
      at("aP", 2, 0); at("aU", 2, 2); at("aC", 4, 4); at("aT", 2, 8);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST);
      // every unit gets something valid bound, so unused samplers are never incomplete
      const blank = mkTex(1, 1, white);
      for (let k = 0; k < 8; k++) { gl.activeTexture(gl.TEXTURE0 + k); gl.bindTexture(gl.TEXTURE_2D, blank); }
      pages = []; solo = new Map(); soloCur = null; sheetTex = null; gen++;
    };
    try { init(); } catch (e) { console.warn("WebGL off:", e); return null; }
    cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; });
    cv.addEventListener("webglcontextrestored", () => { try { init(); lost = false; } catch { } });

    /* ---- atlas: shelf-packed pages; when full, flush and start over (sprites re-upload lazily) ---- */
    const newPage = () => {
      gl.activeTexture(gl.TEXTURE0 + pages.length);
      const p = { tex: mkTex(PAGE, PAGE), shelves: [], y: 0 };
      pages.push(p);
      return p;
    };
    const alloc = (w, h) => {
      for (let pi = 0; pi < MAXP; pi++) {
        const p = pages[pi] || newPage();
        for (const s of p.shelves) if (h <= s.h && h >= s.h * 0.6 && s.x + w <= PAGE) { const r = { p: pi, x: s.x, y: s.y }; s.x += w; return r; }
        if (p.y + h <= PAGE) { p.shelves.push({ y: p.y, h, x: w }); const r = { p: pi, x: 0, y: p.y }; p.y += h; return r; }
      }
      return null;
    };
    const SOLO = { solo: true };
    const resetAtlas = () => { pages.forEach((p) => { p.shelves = []; p.y = 0; }); gen++; };
    const place = (s) => {
      if (s.solo) return SOLO;
      if (s.gl && s.gl.gen === gen) return s.gl;
      const w = s.cv.width, h = s.cv.height;
      if (w > PAGE - 8 || h > PAGE - 8) return (s.gl = { gen, solo: true });
      let r = alloc(w + 3, h + 3);
      if (!r) { flush(); resetAtlas(); r = alloc(w + 3, h + 3); if (!r) return (s.gl = { gen, solo: true }); }
      gl.activeTexture(gl.TEXTURE0 + r.p); gl.bindTexture(gl.TEXTURE_2D, pages[r.p].tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, r.x, r.y, gl.RGBA, gl.UNSIGNED_BYTE, s.cv);
      // half-texel inset so linear filtering never reaches a neighbour
      return (s.gl = { gen, t: r.p, u0: (r.x + 0.5) / PAGE, v0: (r.y + 0.5) / PAGE, u1: (r.x + w - 0.5) / PAGE, v1: (r.y + h - 0.5) / PAGE });
    };
    /* ---- one-off textures (ground chunks, very big sprites), dropped when unused for a while ---- */
    const soloTex = (c) => {
      let e = solo.get(c);
      if (soloCur !== c) {
        flush(); gl.activeTexture(gl.TEXTURE7);
        if (!e) { e = { tex: mkTex(0, 0, c) }; solo.set(c, e); } else gl.bindTexture(gl.TEXTURE_2D, e.tex);
        soloCur = c;
      }
      e.used = frame;
      return e;
    };

    /* ---- the batch ---- */
    let col = [1, 1, 1, 1];
    const push = (x0, y0, x1, y1, u0, v0, u1, v1, t, f, c = col, c2 = c) => {
      if (nq >= MAXQ) flush();
      if (xf) { x0 = x0 * xf[0] + xf[1]; x1 = x1 * xf[0] + xf[1]; y0 = y0 * xf[0] + xf[2]; y1 = y1 * xf[0] + xf[2]; }
      let o = nq * 4 * FL;
      const v = (x, y, u, w, cc) => { data[o] = x; data[o + 1] = y; data[o + 2] = u; data[o + 3] = w; data[o + 4] = cc[0]; data[o + 5] = cc[1]; data[o + 6] = cc[2]; data[o + 7] = cc[3]; data[o + 8] = t; data[o + 9] = f; o += FL; };
      v(x0, y0, u0, v0, c); v(x1, y0, u1, v0, c); v(x1, y1, u1, v1, c2); v(x0, y1, u0, v1, c2);
      nq++;
    };
    function flush() {
      if (!nq) return;
      if (sh.dirty) {
        gl.activeTexture(gl.TEXTURE6);
        if (!sheetTex || sheetTex.h !== sheet.height) { if (sheetTex) gl.deleteTexture(sheetTex.tex); sheetTex = { tex: mkTex(0, 0, sheet), h: sheet.height }; }
        else { gl.bindTexture(gl.TEXTURE_2D, sheetTex.tex); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, sheet); }
        sh.dirty = false;
      }
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, nq * 4 * FL));
      gl.drawElements(gl.TRIANGLES, nq * 6, gl.UNSIGNED_SHORT, 0);
      nq = 0;
    }
    // a sprite (anything with .cv) at world rect (x,y,w,h); cy0/cy1 crop it vertically in world units
    const sprite = (s, x, y, w, h, a = 1, f = 0, cy0 = -1e9, cy1 = 1e9) => {
      const P = place(s);
      let u0, v0, u1, v1, t;
      if (P.solo) { soloTex(s.cv); u0 = 0; v0 = 0; u1 = 1; v1 = 1; t = 7; } else ({ u0, v0, u1, v1, t } = P);
      let y0 = y, y1 = y + h;
      if (cy0 > y0) { v0 += ((cy0 - y0) / h) * (v1 - v0); y0 = cy0; }
      if (cy1 < y1) { v1 -= ((y1 - cy1) / (y1 - y0 || 1)) * (v1 - v0); y1 = cy1; }
      if (y1 <= y0) return;
      push(x, y0, x + w, y1, u0, v0, u1, v1, t, f, a === 1 ? col : [a, a, a, a]);
    };
    // a plain colour rect, optionally a vertical gradient (colours as [r,g,b,a] 0..1, not premultiplied)
    const rect = (x0, y0, x1, y1, c, c2 = c, f = 0) => {
      const P = place(whiteS), u = (P.u0 + P.u1) / 2, v = (P.v0 + P.v1) / 2;
      const pm = (q) => [q[0] * q[3], q[1] * q[3], q[2] * q[3], q[3]];
      push(x0, y0, x1, y1, u, v, u, v, P.t, f, pm(c), pm(c2));
    };
    // paint something into this frame's sheet (world box x0..x1, y0..y1 at scale sc) and queue it
    const paint = (x0, y0, x1, y1, sc, draw, a = 1, f = GLF.LIT) => {
      const w = Math.ceil((x1 - x0) * sc) + 2, h = Math.ceil((y1 - y0) * sc) + 2;
      if (w > SHEET_W || w <= 2 || h <= 2) return;
      if (sh.x + w > SHEET_W) { sh.x = 0; sh.y += sh.rowH + 2; sh.rowH = 0; }
      if (sh.y + h > sheet.height) {
        // out of room this frame: draw what we have, then reuse the sheet from the top
        sh.want = Math.min(2048, Math.max(sh.want, sheet.height * 2));
        flush(); sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, SHEET_W, sheet.height);
        sh.x = 0; sh.y = 0; sh.rowH = 0;
        if (h > sheet.height) return;
      }
      const px = sh.x, py = sh.y;
      sctx.save();
      sctx.beginPath(); sctx.rect(px, py, w, h); sctx.clip();
      sctx.setTransform(sc, 0, 0, sc, px + 1 - x0 * sc, py + 1 - y0 * sc);
      draw(sctx);
      sctx.restore();
      sh.x += w + 2; sh.rowH = Math.max(sh.rowH, h); sh.used = Math.max(sh.used, sh.y + h + 2); sh.dirty = true;
      const H = sheet.height;
      push(x0 - 1 / sc, y0 - 1 / sc, x0 - 1 / sc + w / sc, y0 - 1 / sc + h / sc, px / SHEET_W, py / H, (px + w) / SHEET_W, (py + h) / H, 6, f, a === 1 ? col : [a, a, a, a]);
    };
    const begin = (W, H, cam, dpr, tint, lift) => {
      frame++;
      if (lost) return false;
      gl.viewport(0, 0, W, H);
      gl.uniform4f(U.uCam, (2 * cam.s * dpr) / W, (-2 * cam.s * dpr) / H, (2 * cam.tx * dpr) / W - 1, 1 - (2 * cam.ty * dpr) / H);
      gl.uniform3f(U.uTint, tint[0], tint[1], tint[2]);
      gl.uniform3f(U.uLift, lift[0], lift[1], lift[2]);
      gl.uniform4f(U.uEll, 0, 0, 1, 1);
      // the sheet: grow it if last frame ran out, clear what was used
      if (sh.want > sheet.height) { sheet.height = sh.want; sh.used = 0; }
      else if (sh.used) { sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, SHEET_W, sh.used); }
      sh.x = 0; sh.y = 0; sh.rowH = 0; sh.used = 0;
      if (frame % 60 === 0) solo.forEach((e, c) => { if (frame - e.used > 90) { gl.deleteTexture(e.tex); solo.delete(c); if (soloCur === c) soloCur = null; } });
      return true;
    };
    const ellipse = (cx, cy, rx, ry) => { flush(); gl.uniform4f(U.uEll, cx, cy, Math.max(1, rx), Math.max(1, ry)); };
    const G = {
      begin, flush, sprite, rect, paint, ellipse, place,
      end: () => flush(),
      setXf: (x) => { xf = x; },
      reset: () => { flush(); resetAtlas(); },
      get lost() { return lost; },
    };
    cv.__G = G;
    return G;
  }
