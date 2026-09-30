# Valley Isle

A life-and-business to-do list drawn as a living island town (published as a claude.ai artifact).

- `src/app.js` – the app (React via UMD, no JSX)
- `src/world/` – the Canvas map engine: `kit` (iso drawing), `assets` (vehicles, people, animals, props), `buildings`, `town` (two-island layout, road and footpath networks), `engine` (ground, sprites, lighting), `sim` (traffic, pedestrians, crew agents), `view` (React component, input, rendering)
- `src/interior.js` – building interiors and the goal tree
- `src/styles.css`, `src/head.html` – page styles and head
- `./build.sh` – splices everything into `dist/valley-isle.html`, the file that gets published
