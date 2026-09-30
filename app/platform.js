/* LifeList on iPhone: the native side of the same web app.
 *
 * The island app talks to its host through window.claude.use(...) - on claude.ai that's the
 * artifact's shared database, user id and downloads. In the app we provide the same three
 * things backed by the phone itself:
 *   db        - a document store kept as one JSON file in the app's private Library folder
 *   user      - a random id made on first launch (never leaves the phone)
 *   downloads - backups go out through the iOS share sheet (Files, AirDrop, Mail...)
 * and window.LLPlatform adds what only a phone can do: Apple Health (read-only), local
 * notifications and haptics.
 */
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { App } from "@capacitor/app";

const native = Capacitor.isNativePlatform();
const LLHealth = registerPlugin("LLHealth");

/* ---------------- on-device document store ---------------- */
const DIR = Directory.Library;
const FILE = "lifelist/db.json", PREV = "lifelist/db.prev.json", TMP = "lifelist/db.tmp.json";

async function readJson(path) {
  try { const r = await Filesystem.readFile({ path, directory: DIR, encoding: Encoding.UTF8 }); return JSON.parse(r.data); } catch { return null; }
}
async function loadStore() {
  if (!native) { try { return JSON.parse(localStorage.getItem("lifelist-db") || "null"); } catch { return null; } }
  return (await readJson(FILE)) || (await readJson(PREV));
}
async function writeStore(obj) {
  const text = JSON.stringify(obj);
  if (!native) { try { localStorage.setItem("lifelist-db", text); } catch {} return; }
  // write a temp file, keep the last good copy, then swap in: a crash mid-write can't lose data
  await Filesystem.writeFile({ path: TMP, directory: DIR, data: text, encoding: Encoding.UTF8, recursive: true });
  try { await Filesystem.rename({ from: FILE, to: PREV, directory: DIR, toDirectory: DIR }); } catch {}
  await Filesystem.rename({ from: TMP, to: FILE, directory: DIR, toDirectory: DIR });
}

const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function merge(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = isObj(b[k]) && isObj(a[k]) ? merge(a[k], b[k]) : b[k];
  return out;
}
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

function createDb(saved) {
  const docs = new Map(Object.entries((saved && saved.docs) || {}));
  const meta = { deviceId: (saved && saved.deviceId) || "dev-" + newId(), created: (saved && saved.created) || Date.now() };
  const subs = new Set();
  let timer = 0, writing = Promise.resolve(), dirty = !saved;
  const parent = (p) => p.split("/").slice(0, -1).join("/");
  const snapDoc = (p) => { const d = docs.get(p); return { id: p.split("/").pop(), exists: d !== undefined, data: () => d, metadata: { fromCache: false, hasPendingWrites: false } }; };
  const snapCol = (c) => {
    const list = [...docs.keys()].filter((k) => parent(k) === c).sort().map(snapDoc);
    return { docs: list, size: list.length, empty: !list.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } };
  };
  const flush = () => {
    clearTimeout(timer); timer = 0;
    if (!dirty) return writing;
    dirty = false;
    const obj = { v: 1, ...meta, savedAt: Date.now(), docs: Object.fromEntries(docs) };
    writing = writing.then(() => writeStore(obj)).catch((e) => { dirty = true; console.warn("LifeList: save failed", e); });
    return writing;
  };
  const changed = (p) => {
    dirty = true;
    clearTimeout(timer); timer = setTimeout(flush, 400);
    const c = parent(p);
    subs.forEach((s) => { if (s.kind === "doc" && s.path === p) s.fn(snapDoc(p)); if (s.kind === "col" && s.path === c) s.fn(snapCol(c)); });
  };
  const doc = (p) => ({
    id: p.split("/").pop(), path: p,
    get: async () => snapDoc(p),
    set: async (v) => { docs.set(p, clone(v)); changed(p); },
    update: async (v) => {
      const cur = docs.get(p);
      if (cur === undefined) throw { code: "invalid_argument", message: "Document does not exist" };
      docs.set(p, merge(cur, clone(v))); changed(p);
    },
    delete: async () => { docs.delete(p); changed(p); },
    onSnapshot: (fn) => { const s = { kind: "doc", path: p, fn }; subs.add(s); setTimeout(() => fn(snapDoc(p)), 0); return () => subs.delete(s); },
    collection: (c) => col(p + "/" + c),
  });
  const col = (c) => {
    const q = {
      path: c,
      doc: (id) => doc(c + "/" + (id || newId())),
      add: async (v) => { const d = doc(c + "/" + newId()); await d.set(v); return d; },
      onSnapshot: (fn) => { const s = { kind: "col", path: c, fn }; subs.add(s); setTimeout(() => fn(snapCol(c)), 0); return () => subs.delete(s); },
      get: async () => snapCol(c),
      where: () => q, orderBy: () => q, limit: () => q,
    };
    return q;
  };
  if (dirty) setTimeout(flush, 0);
  return { doc, collection: col, flush, meta };
}

let dbPromise = null;
const getDb = () => (dbPromise = dbPromise || loadStore().then(createDb));

/* ---------------- backups through the share sheet ---------------- */
async function saveViaShare({ filename, data }) {
  const text = typeof data === "string" ? data : data instanceof Blob ? await data.text() : new TextDecoder().decode(data);
  if (!native) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    return { status: "saved" };
  }
  const safe = String(filename || "lifelist-backup.json").replace(/[^\w.\-]+/g, "-");
  const w = await Filesystem.writeFile({ path: "exports/" + safe, directory: Directory.Cache, data: text, encoding: Encoding.UTF8, recursive: true });
  try { await Share.share({ title: "LifeList backup", files: [w.uri], dialogTitle: "Save your LifeList backup" }); }
  catch (e) { if (/cancel/i.test(String(e && (e.message || e)))) throw { code: "declined", message: "cancelled" }; throw e; }
  return { status: "saved" };
}

/* ---------------- the host bridge the web app already speaks ---------------- */
window.claude = {
  use: async (name) => {
    if (name === "db") return getDb();
    if (name === "user") { const db = await getDb(); return { id: async () => db.meta.deviceId }; }
    if (name === "downloads") return { save: saveViaShare };
    return null;
  },
};

/* ---------------- phone-only extras ---------------- */
const hashId = (s) => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return Math.abs(h | 0) % 2000000000 + 1; };
window.LLPlatform = {
  native, os: Capacitor.getPlatform(), app: "LifeList",
  // Apple Health: read-only. Nothing in LifeList writes to Apple Health.
  health: native && Capacitor.getPlatform() === "ios" ? {
    source: "Apple Health",
    available: async () => { try { return (await LLHealth.isAvailable()).available; } catch { return false; } },
    connect: async () => (await LLHealth.requestAuthorization()).granted,
    daily: (days = 14) => LLHealth.readDaily({ days }),
    workouts: (days = 14) => LLHealth.readWorkouts({ days }).then((r) => r.workouts || []),
    cycle: (days = 180) => LLHealth.readCycle({ days }).then((r) => r.flow || []),
  } : null,
  haptic: (kind = "light") => {
    if (!native) return;
    if (kind === "success" || kind === "warning" || kind === "error") Haptics.notification({ type: { success: NotificationType.Success, warning: NotificationType.Warning, error: NotificationType.Error }[kind] }).catch(() => {});
    else Haptics.impact({ style: kind === "heavy" ? ImpactStyle.Heavy : kind === "medium" ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
  },
  // replace every reminder LifeList has scheduled with this list: [{ key, at (ms), title, body }]
  notify: {
    sync: async (list) => {
      if (!native) return false;
      try {
        let perm = await LocalNotifications.checkPermissions();
        if (perm.display === "prompt" || perm.display === "prompt-with-rationale") perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") return false;
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
        const now = Date.now();
        const items = list.filter((n) => n && n.at > now + 5000).slice(0, 60).map((n) => ({ id: hashId(n.key), title: n.title, body: n.body || "", schedule: { at: new Date(n.at), allowWhileIdle: true }, extra: { key: n.key } }));
        if (items.length) await LocalNotifications.schedule({ notifications: items });
        return true;
      } catch (e) { console.warn("LifeList: notifications", e); return false; }
    },
  },
  flush: () => (dbPromise ? dbPromise.then((db) => db.flush()) : Promise.resolve()),
};

if (native) {
  // save straight away when the app goes to the background
  App.addListener("pause", () => window.LLPlatform.flush());
  App.addListener("appStateChange", (s) => { if (!s.isActive) window.LLPlatform.flush(); });
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  // hide the splash once the island has drawn its first frames
  const hide = () => SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {});
  let tries = 0;
  const wait = () => { if (document.querySelector(".viewport canvas") || ++tries > 60) setTimeout(hide, 250); else setTimeout(wait, 100); };
  wait();
}
