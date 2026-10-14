import {
	BufferAttribute,
	CanvasTexture,
	Color,
	CylinderGeometry,
	Group,
	InstancedMesh,
	Matrix4,
	Mesh,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	Quaternion,
	SphereGeometry,
	SRGBColorSpace,
	Vector2,
	Vector3,
} from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { repetir } from './panes.js';

/**
 * Pan de muerto oaxaqueño de canela: pan ovalado con forma de huevo, corteza
 * dorada con barniz de huevo, ajonjolí por todos lados salvo una franja lisa al
 * centro, y su carita de pasta con el pelo rojo asomándose por una punta.
 */

// Semiejes del óvalo (largo, alto, ancho)
const A = 1.25;
const B = 0.72;
const C = 0.92;
const PISO = -0.44; // la base se aplasta contra la charola

/* ---------- Ruido para que nada se vea perfecto ---------- */
function hash(x, y, z) {
	const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
	return s - Math.floor(s);
}
function ruido(x, y, z) {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const zi = Math.floor(z);
	const suave = (t) => t * t * (3 - 2 * t);
	const u = suave(x - xi);
	const v = suave(y - yi);
	const w = suave(z - zi);
	const mezcla = (a, b, t) => a + (b - a) * t;
	const capa = (dz) =>
		mezcla(
			mezcla(hash(xi, yi, zi + dz), hash(xi + 1, yi, zi + dz), u),
			mezcla(hash(xi, yi + 1, zi + dz), hash(xi + 1, yi + 1, zi + dz), u),
			v,
		);
	return mezcla(capa(0), capa(1), w);
}
const fbm = (p, f = 2) => ruido(p.x * f, p.y * f, p.z * f) * 0.65 + ruido(p.x * f * 2.3, p.y * f * 2.3, p.z * f * 2.3) * 0.35;
const smoothstep = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

/** Dirección unitaria → punto sobre el pan (óvalo de huevo con base plana) */
function superficie(d, out = new Vector3()) {
	const huevo = 1 + 0.1 * d.x; // más ancho del lado contrario a la carita
	out.set(A * d.x, B * d.y * huevo, C * d.z * huevo);
	if (out.y < PISO) out.y = PISO + (out.y - PISO) * 0.12;
	return out;
}
/** Normal aproximada del óvalo en un punto */
const normalOvalo = (p) => new Vector3(p.x / (A * A), p.y / (B * B), p.z / (C * C)).normalize();

/* ---------- Carita de pasta ---------- */
function texturaCarita() {
	const W = 1024;
	const H = 512;
	const canvas = document.createElement('canvas');
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d');

	// piel de pasta de harina pintada
	ctx.fillStyle = '#f1dcc4';
	ctx.fillRect(0, 0, W, H);

	// el frente de la esfera cae en u = 0.25
	const cx = W * 0.25;

	// chapitas
	for (const dx of [-62, 62]) {
		const g = ctx.createRadialGradient(cx + dx, H * 0.56, 0, cx + dx, H * 0.56, 34);
		g.addColorStop(0, 'rgba(226, 120, 120, 0.45)');
		g.addColorStop(1, 'rgba(226, 120, 120, 0)');
		ctx.fillStyle = g;
		ctx.fillRect(cx + dx - 40, H * 0.56 - 40, 80, 80);
	}

	ctx.strokeStyle = '#2a1a14';
	ctx.lineCap = 'round';
	for (const lado of [-1, 1]) {
		const ox = cx + lado * 44;
		// ojos cerrados: un arco hacia abajo con pestañas
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.arc(ox, H * 0.43, 24, Math.PI * 0.15, Math.PI * 0.85);
		ctx.stroke();
		ctx.lineWidth = 3;
		for (let i = 0; i < 6; i++) {
			const a = Math.PI * (0.22 + i * 0.11);
			const x0 = ox + Math.cos(a) * 24;
			const y0 = H * 0.43 + Math.sin(a) * 24;
			ctx.beginPath();
			ctx.moveTo(x0, y0);
			ctx.lineTo(x0 + Math.cos(a) * 9, y0 + Math.sin(a) * 9);
			ctx.stroke();
		}
		// cejas finas
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.arc(ox, H * 0.42, 34, Math.PI * 1.2, Math.PI * 1.8);
		ctx.stroke();
	}

	// nariz y boca
	ctx.strokeStyle = 'rgba(150, 95, 70, 0.6)';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(cx, H * 0.48);
	ctx.quadraticCurveTo(cx + 8, H * 0.55, cx - 2, H * 0.57);
	ctx.stroke();
	ctx.fillStyle = '#c8414c';
	ctx.beginPath();
	ctx.ellipse(cx, H * 0.645, 13, 6, 0, 0, Math.PI * 2);
	ctx.fill();

	// pelo rojo: cubre la coronilla y baja por la nuca
	ctx.fillStyle = '#d6324c';
	ctx.beginPath();
	ctx.moveTo(0, 0);
	for (let x = 0; x <= W; x += 8) {
		const u = x / W;
		const atras = (1 - Math.cos(2 * Math.PI * (u - 0.25))) / 2; // 0 al frente, 1 en la nuca
		const fleco = Math.sin(x * 0.09) * 6;
		ctx.lineTo(x, H * (0.24 + 0.42 * atras) + fleco);
	}
	ctx.lineTo(W, 0);
	ctx.closePath();
	ctx.fill();
	// mechones pintados a pincel
	ctx.strokeStyle = 'rgba(255, 210, 210, 0.35)';
	ctx.lineWidth = 3;
	for (let i = 0; i < 90; i++) {
		const x = Math.random() * W;
		const y = Math.random() * H * 0.3;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.quadraticCurveTo(x + 10, y + 14, x + 4, y + 30);
		ctx.stroke();
	}

	const map = new CanvasTexture(canvas);
	map.colorSpace = SRGBColorSpace;
	return map;
}

/* ---------- Pan ---------- */
export function crearPanDeMuerto({ breadNormal }) {
	const grupo = new Group();

	// Punto por donde se asoma la carita: arriba, en la punta angosta
	const dirCarita = new Vector3(-0.74, 0.66, 0.05).normalize();
	const Q = superficie(dirCarita);
	const nQ = normalOvalo(Q);

	// Óvalo deformado: huevo, base plana, bultitos y el hueco del cuello
	const geo = new SphereGeometry(1, 192, 144);
	const pos = geo.attributes.position;
	const d = new Vector3();
	const p = new Vector3();
	for (let i = 0; i < pos.count; i++) {
		d.fromBufferAttribute(pos, i).normalize();
		superficie(d, p);
		const n = normalOvalo(p);
		// bultitos de masa y una que otra burbuja
		p.addScaledVector(n, (fbm(p, 3) - 0.5) * 0.035);
		// hueco donde se hunde el cuello de la carita
		const dist = p.distanceTo(Q);
		if (dist < 0.1) p.addScaledVector(nQ, -0.045 * (1 - (dist / 0.1) ** 2) ** 2);
		pos.setXYZ(i, p.x, p.y, p.z);
	}
	geo.computeVertexNormals();

	// Color de corteza y dónde cae el ajonjolí
	const normales = geo.attributes.normal;
	const colores = new Float32Array(pos.count * 3);
	const peso = new Float32Array(pos.count);
	const oscuro = new Color('#86421a');
	const dorado = new Color('#c27733');
	const claro = new Color('#dda262');
	const base = new Color('#e8c48e');
	const col = new Color();
	const n = new Vector3();
	for (let i = 0; i < pos.count; i++) {
		p.fromBufferAttribute(pos, i);
		n.fromBufferAttribute(normales, i);
		const arriba = Math.max(0, n.y);
		const mancha = fbm(p, 2.2);
		// franja lisa y brillante a lo largo, un poco en diagonal, sin ajonjolí
		const franja = smoothstep(0.42, 0.12, Math.abs(p.z - 0.2 * p.x + 0.05)) * smoothstep(0.15, 0.5, n.y);
		const hueco = smoothstep(0.16, 0.06, p.distanceTo(Q));

		col.copy(dorado).lerp(oscuro, Math.min(1, arriba * 0.75 + (mancha - 0.5) * 0.6));
		col.lerp(claro, franja * 0.75);
		col.lerp(base, smoothstep(-0.2, -0.75, n.y));
		col.lerp(oscuro, hueco * 0.5);
		col.toArray(colores, i * 3);

		const parches = 0.15 + 0.85 * smoothstep(0.4, 0.66, fbm(p, 3.1));
		peso[i] = smoothstep(-0.45, 0.05, n.y) * (1 - 0.95 * franja) * parches * (1 - hueco);
	}
	geo.setAttribute('color', new BufferAttribute(colores, 3));
	geo.setAttribute('peso', new BufferAttribute(peso, 1));

	const pan = new Mesh(
		geo,
		new MeshPhysicalMaterial({
			vertexColors: true,
			normalMap: repetir(breadNormal, 5, 3),
			normalScale: new Vector2(0.35, 0.35),
			roughness: 0.5,
			clearcoat: 0.45,
			clearcoatRoughness: 0.35,
		}),
	);
	grupo.add(pan);

	// Ajonjolí: semillitas de verdad, orientadas con la superficie
	const semillas = 2300;
	const ajonjoli = new InstancedMesh(
		new SphereGeometry(1, 10, 6),
		new MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }),
		semillas,
	);
	const sampler = new MeshSurfaceSampler(pan).setWeightAttribute('peso').build();
	const punto = new Vector3();
	const normal = new Vector3();
	const giro = new Quaternion();
	const alinear = new Quaternion();
	const escala = new Vector3();
	const matriz = new Matrix4();
	const tonos = [new Color('#e9d3a3'), new Color('#dcc08a'), new Color('#cfa96f'), new Color('#efdcb5')];
	const arribaY = new Vector3(0, 1, 0);
	for (let i = 0; i < semillas; i++) {
		sampler.sample(punto, normal);
		alinear.setFromUnitVectors(arribaY, normal);
		giro.setFromAxisAngle(arribaY, Math.random() * Math.PI * 2);
		alinear.multiply(giro);
		const t = 0.8 + Math.random() * 0.45;
		escala.set(0.034 * t, 0.009 * t, 0.019 * t);
		punto.addScaledVector(normal, 0.006);
		matriz.compose(punto, alinear, escala);
		ajonjoli.setMatrixAt(i, matriz);
		ajonjoli.setColorAt(i, tonos[Math.floor(Math.random() * tonos.length)]);
	}
	grupo.add(ajonjoli);

	// Carita: cabeza de pasta con pelo rojo y el cuello hundido en el pan
	// recostada a lo largo del pan, asomando por la punta
	const ejeCabeza = nQ.clone().multiplyScalar(0.3).add(new Vector3(-0.95, 0.05, 0)).normalize();
	const mira = new Vector3(0, 1, 0).addScaledVector(ejeCabeza, -ejeCabeza.y).normalize(); // la cara ve hacia arriba
	const lado = new Vector3().crossVectors(ejeCabeza, mira);
	const carita = new Group();
	carita.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(lado, ejeCabeza, mira));
	// medio hundida: la barbilla y el cuello se pierden dentro de la masa
	carita.position.copy(Q).addScaledVector(ejeCabeza, 0.05).addScaledVector(nQ, 0.06);

	const pasta = { color: 0xffffff, roughness: 0.5 };
	const cabeza = new Mesh(new SphereGeometry(1, 64, 48), new MeshStandardMaterial({ ...pasta, map: texturaCarita() }));
	cabeza.scale.set(0.132, 0.168, 0.114);
	const cuello = new Mesh(new CylinderGeometry(0.045, 0.054, 0.16, 32), new MeshStandardMaterial({ ...pasta, color: 0xf1dcc4 }));
	cuello.position.y = -0.144;
	carita.add(cabeza, cuello);
	grupo.add(carita);

	return grupo;
}
