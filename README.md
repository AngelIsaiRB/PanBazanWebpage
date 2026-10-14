# PanBazan

Sitio de la panadería PanBazan (Tlacolula, Oaxaca) con una Rosca de Reyes en 3D.

## Stack

- [Vite 8](https://vite.dev) — dev server y build
- [Tailwind CSS 4](https://tailwindcss.com) — estilos (tokens de diseño en `src/style.css`)
- [three.js](https://threejs.org) — escena 3D de la rosca (`src/three/RoscaScene.js`, carga diferida)
- [GSAP](https://gsap.com) + ScrollTrigger — animaciones de entrada y scroll
- Fuentes autoalojadas: Fraunces e Inter (`@fontsource-variable`)

## Uso

Requiere Node 20.19+ (o 22.12+).

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # build de producción en /dist
npm run preview   # sirve /dist localmente
```

## Estructura

```
index.html              # marcado de la página
public/                 # archivos copiados tal cual (favicon, web.config para IIS)
src/main.js             # interacciones, animaciones y carga de la escena 3D
src/style.css           # Tailwind + tema
src/three/RoscaScene.js # renderer, cámara, luces y modelo
src/assets/             # modelo glTF y texturas (Vite les agrega hash)
```
