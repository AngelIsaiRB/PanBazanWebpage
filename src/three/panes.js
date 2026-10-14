import { CanvasTexture, Group, LatheGeometry, Mesh, MeshStandardMaterial, SplineCurve, SRGBColorSpace, Vector2 } from 'three';

/**
 * Conchas modeladas con geometría procedural (sin archivos 3D).
 * Comparten la textura de miga y el normal map de la rosca.
 */

/** Copia una textura con su propia repetición (comparte la imagen) */
export function repetir(tex, x, y) {
	const copia = tex.clone();
	copia.repeat.set(x, y);
	copia.needsUpdate = true;
	return copia;
}

/** Perfil suave para LatheGeometry a partir de unos cuantos puntos de control */
function perfil(puntos, divisiones = 48) {
	return new SplineCurve(puntos.map(([x, y]) => new Vector2(x, y))).getPoints(divisiones);
}

/* ---------- Concha ---------- */

const CONCHA_COSTRA = {
	vainilla: { base: '#e8c793', moteado: ['#f3dcb0', '#d3a96c'], grieta: '#c4823d' },
	chocolate: { base: '#55301f', moteado: ['#6c412d', '#3f2216'], grieta: '#b77a40' },
};

/** Dibuja la costra vista desde arriba: líneas curvas en abanico, como una concha marina */
function texturasCostra(sabor) {
	const size = 1024;
	const c = size / 2;
	const R = size * 0.47;
	const colores = CONCHA_COSTRA[sabor];

	const color = document.createElement('canvas');
	const relieve = document.createElement('canvas');
	color.width = color.height = relieve.width = relieve.height = size;
	const cc = color.getContext('2d');
	const rc = relieve.getContext('2d');

	cc.fillStyle = colores.base;
	cc.fillRect(0, 0, size, size);
	rc.fillStyle = '#d0d0d0';
	rc.fillRect(0, 0, size, size);

	// azúcar: puntitos de color y de relieve
	for (let i = 0; i < 14000; i++) {
		const x = Math.random() * size;
		const y = Math.random() * size;
		const r = Math.random() * 2.2 + 0.4;
		cc.fillStyle = colores.moteado[i % 2];
		cc.globalAlpha = 0.55;
		cc.beginPath();
		cc.arc(x, y, r, 0, Math.PI * 2);
		cc.fill();
		rc.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#9a9a9a';
		rc.globalAlpha = 0.6;
		rc.beginPath();
		rc.arc(x, y, r, 0, Math.PI * 2);
		rc.fill();
	}
	cc.globalAlpha = rc.globalAlpha = 1;

	// grietas: nacen cerca de un punto del borde y se abren en abanico
	const origen = { x: c, y: c + R * 0.92 };
	const lineas = 9;
	const trazos = [];
	for (let i = 0; i < lineas; i++) {
		const ang = Math.PI * (0.06 + (0.88 * i) / (lineas - 1)); // de un lado al otro por arriba
		const fin = { x: c + Math.cos(ang) * R * 1.08, y: c - Math.sin(ang) * R * 1.08 };
		const medio = { x: (origen.x + fin.x) / 2, y: (origen.y + fin.y) / 2 };
		const lado = (fin.x - c) / R; // -1..1: las líneas de los lados se curvan más
		const jitter = (Math.random() - 0.5) * R * 0.08; // a mano, ninguna línea sale igual
		trazos.push({ fin, control: { x: medio.x + lado * R * 0.42 + jitter, y: medio.y + Math.abs(lado) * R * 0.1 } });
	}
	const dibujar = (ctx, ancho, estilo) => {
		ctx.strokeStyle = estilo;
		ctx.lineWidth = ancho;
		ctx.lineCap = 'round';
		for (const { fin, control } of trazos) {
			ctx.beginPath();
			ctx.moveTo(origen.x, origen.y);
			ctx.quadraticCurveTo(control.x, control.y, fin.x, fin.y);
			ctx.stroke();
		}
	};
	cc.filter = 'blur(5px)';
	cc.globalAlpha = 0.5;
	dibujar(cc, 50, colores.grieta);
	cc.filter = 'blur(1.5px)';
	cc.globalAlpha = 1;
	dibujar(cc, 24, colores.grieta);
	cc.filter = 'none';

	rc.filter = 'blur(6px)';
	dibujar(rc, 40, '#000000');
	rc.filter = 'none';

	const map = new CanvasTexture(color);
	map.colorSpace = SRGBColorSpace;
	const bumpMap = new CanvasTexture(relieve);
	return { map, bumpMap };
}

/** Proyecta las UV desde arriba para que la textura de la costra caiga plana sobre el domo */
function uvDesdeArriba(geometry, radio) {
	const pos = geometry.attributes.position;
	const uv = geometry.attributes.uv;
	for (let i = 0; i < pos.count; i++) {
		uv.setXY(i, pos.getX(i) / (2 * radio) + 0.5, 0.5 - pos.getZ(i) / (2 * radio));
	}
	uv.needsUpdate = true;
}

function crearUnaConcha(sabor, { breadMap, breadNormal }) {
	const grupo = new Group();

	// Pan: base plana, costados redondos y domo
	const miga = new Mesh(
		new LatheGeometry(
			perfil([
				[0, 0],
				[0.86, 0],
				[0.97, 0.07],
				[1.01, 0.2],
				[0.97, 0.34],
				[0.86, 0.47],
				[0.67, 0.58],
				[0.4, 0.65],
				[0, 0.68],
			]),
			96,
		),
		new MeshStandardMaterial({
			color: 0xf2c48a,
			map: repetir(breadMap, 6, 2),
			normalMap: repetir(breadNormal, 6, 2),
			roughness: 0.7,
		}),
	);

	// Costra: un domo un poco más grande, con borde grueso
	const costraGeo = new LatheGeometry(
		perfil([
			[0.9, 0.31],
			[0.98, 0.33],
			[0.99, 0.39],
			[0.89, 0.51],
			[0.69, 0.63],
			[0.4, 0.71],
			[0, 0.74],
		]),
		128,
	);
	uvDesdeArriba(costraGeo, 1.05);
	const { map, bumpMap } = texturasCostra(sabor);
	const costra = new Mesh(costraGeo, new MeshStandardMaterial({ map, bumpMap, bumpScale: 7, roughness: 0.92 }));

	grupo.add(miga, costra);
	grupo.scale.y = 1.4; // abombada como recién salida del horno
	return grupo;
}

/** Dos conchas, de vainilla y de chocolate */
export function crearConchas(texturas) {
	const grupo = new Group();
	const vainilla = crearUnaConcha('vainilla', texturas);
	vainilla.position.set(-0.62, 0, 0.35);
	vainilla.rotation.y = 0.4;
	const chocolate = crearUnaConcha('chocolate', texturas);
	chocolate.position.set(0.78, 0, -0.45);
	chocolate.rotation.y = -1.9;
	grupo.add(vainilla, chocolate);
	return grupo;
}
