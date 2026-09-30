#!/usr/bin/env bash
# Assemble dist/valley-isle.html from src/ (city.js is spliced into app.js).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist
node -e '
const fs=require("fs");
const app=fs.readFileSync("src/app.js","utf8");
const worldFiles=["kit","plan","assets","town","buildings","engine","sim","view"].map(f=>fs.readFileSync("src/world/"+f+".js","utf8")).join("\n");
const city="  var World = (() => {\n"+worldFiles+"\n    return { buildTown, WorldMap, lightAt, PARCELS, classicPlan, layoutPlan, placeParcel, checkPlan, freshParcels, cellsOf, freshLines, FRESH_N };\n  })();\n";
const interior=fs.existsSync("src/interior.js")?fs.readFileSync("src/interior.js","utf8"):"";
if(!app.includes("/*@@CITY@@*/")) throw new Error("missing city marker");
const js=app.replace("/*@@CITY@@*/",()=>city+"\n"+interior);
const css=fs.readFileSync("src/styles.css","utf8");
const head=fs.readFileSync("src/head.html","utf8");
const out=head+"<style>"+css+"</style>\n<div id=\"root\"></div>\n"+
 "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js\"></script>\n"+
 "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js\"></script>\n"+
 "<script>"+js+"</script>\n";
fs.writeFileSync("dist/valley-isle.html",out);
console.log("built",out.length,"bytes");
'
