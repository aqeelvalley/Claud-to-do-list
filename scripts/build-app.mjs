// Build www/ for the LifeList iOS app from the same page the artifact uses (dist/valley-isle.html):
// React and the fonts are bundled locally so the app works fully offline, and the platform
// adapter (app/platform.js) is loaded first so the app talks to the phone instead of claude.ai.
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.join(root, "dist/valley-isle.html"), out = path.join(root, "www");
const nm = (p) => path.join(root, "node_modules", p);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "vendor"), { recursive: true });
fs.mkdirSync(path.join(out, "fonts/files"), { recursive: true });

// React 18 (same version as the artifact's CDN copy)
fs.copyFileSync(nm("react/umd/react.production.min.js"), path.join(out, "vendor/react.production.min.js"));
fs.copyFileSync(nm("react-dom/umd/react-dom.production.min.js"), path.join(out, "vendor/react-dom.production.min.js"));

// fonts: Fredoka 500-700 and Nunito 400-800, latin + latin-ext, woff2 only
let css = "";
const fonts = { fredoka: [500, 600, 700], nunito: [400, 500, 600, 700, 800] };
for (const [fam, weights] of Object.entries(fonts)) for (const w of weights) {
  const text = fs.readFileSync(nm(`@fontsource/${fam}/${w}.css`), "utf8");
  for (const block of text.split("/*").slice(1)) {
    const name = block.slice(0, block.indexOf("*/")).trim();
    if (!/-(latin|latin-ext)-\d+-normal$/.test(name)) continue;
    const face = block.slice(block.indexOf("@font-face"));
    const file = `${name}.woff2`;
    fs.copyFileSync(nm(`@fontsource/${fam}/files/${file}`), path.join(out, "fonts/files", file));
    css += face.replace(/src:[^;]+;/, `src: url(files/${file}) format('woff2');`).trim() + "\n";
  }
}
fs.writeFileSync(path.join(out, "fonts/fonts.css"), css);

// the platform adapter
await build({ entryPoints: [path.join(root, "app/platform.js")], bundle: true, minify: true, format: "iife", target: ["safari15"], outfile: path.join(out, "platform.js"), logLevel: "warning" });

// the page itself
let html = fs.readFileSync(src, "utf8");
const swap = (a, b) => { if (!html.includes(a)) throw new Error("build-app: can't find " + a.slice(0, 80)); html = html.split(a).join(b); };
html = html.replace(/<link rel="preconnect"[^>]*>\n?/g, "").replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, '<link rel="stylesheet" href="fonts/fonts.css">\n');
swap('<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>', '<script src="vendor/react.production.min.js"></script>');
swap('<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>', '<script src="vendor/react-dom.production.min.js"></script>\n<script src="platform.js"></script>');
html = html.replace(/<title>[^<]*<\/title>/, "<title>LifeList</title>");
html = html.replace('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">', '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">');
html = '<!doctype html>\n<html lang="en">\n' + html;
html = html.replace(/<meta name="description"[^>]*>/, '<meta name="description" content="LifeList: your life and work as a living island.">');
// app-facing wording
html = html.split("Welcome to Valley Isle").join("Welcome to LifeList").split("isn't a Valley Isle backup").join("isn't a LifeList backup");
if (/https?:\/\/(cdnjs|fonts\.g)/.test(html)) throw new Error("build-app: the app page still points at the network");
fs.writeFileSync(path.join(out, "index.html"), html);
const size = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? size(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
console.log("www built:", (size(out) / 1024).toFixed(0), "KB");
