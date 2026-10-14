import gsap from 'gsap';
import { reducedMotion } from './layout.js';

/**
 * Temporada de Día de Muertos (solo en la portada): una guirnalda de papel
 * picado que se mece sobre el inicio y pétalos de cempasúchil cayendo.
 * Para quitarla al terminar la temporada, borra su import en main.js.
 */

const COLORES = ['#f26b1d', '#e2337f', '#f6b81c', '#1fa3b8', '#8b3fc0', '#2f9e5b'];

// Recortes: lo negro de la máscara se vuelve hueco en el papel, lo blanco queda papel
const ORILLA = [8, 16, 24, 32, 40, 48]
	.map((x) => `<circle cx="${x + 2}" cy="7" r="1.7"/><circle cx="${x + 2}" cy="61" r="1.7"/>`)
	.join('');
const MOTIVOS = [
	// calavera
	`<path d="M30 16c-8 0-13 5.6-13 12.6 0 4 2 7 5 8.6V43h16v-5.8c3-1.6 5-4.6 5-8.6C43 21.6 38 16 30 16z"/>
	<g fill="#fff" stroke="none"><circle cx="25" cy="29" r="3.4"/><circle cx="35" cy="29" r="3.4"/><path d="M30 33l-2.2 3.6h4.4z"/>
	<rect x="24.6" y="39" width="1.6" height="4"/><rect x="29.2" y="39" width="1.6" height="4"/><rect x="33.8" y="39" width="1.6" height="4"/></g>
	<path d="M13 50h34M18 54h24"/>`,
	// flor
	`${[0, 45, 90, 135, 180, 225, 270, 315]
		.map((g) => `<ellipse cx="30" cy="22" rx="3.6" ry="7" transform="rotate(${g} 30 32)"/>`)
		.join('')}<circle cx="30" cy="32" r="3.8" fill="#fff" stroke="none"/><circle cx="30" cy="32" r="1.6"/>`,
	// corazón y rombos
	`<path d="M30 42c-9-6-13-10-13-15a6 6 0 0 1 13-2.5A6 6 0 0 1 43 27c0 5-4 9-13 15z"/>
	<path d="M14 18l3-4 3 4-3 4zM40 18l3-4 3 4-3 4zM14 50l3-4 3 4-3 4zM40 50l3-4 3 4-3 4z"/>`,
	// rombos en retícula
	[18, 30, 42]
		.flatMap((x) => [20, 32, 44].map((y) => `<path d="M${x} ${y - 5}l4.5 5-4.5 5-4.5-5z"/>`))
		.join(''),
];
const FLECO = 'M0 0H60V66L55 76 50 66 45 76 40 66 35 76 30 66 25 76 20 66 15 76 10 66 5 76 0 66Z';

let siguienteId = 0;
function bandera(color, motivo) {
	const id = `picado-${siguienteId++}`;
	return `<svg viewBox="0 0 60 76"><defs><mask id="${id}"><rect width="60" height="76" fill="#fff"/>
		<g fill="#000" stroke="#000" stroke-width="0">${ORILLA}</g>
		<g fill="#000" stroke="#000" stroke-width="2" stroke-linecap="round">${MOTIVOS[motivo]}</g>
		</mask></defs><path d="${FLECO}" fill="${color}" mask="url(#${id})"/></svg>`;
}

const hero = document.querySelector('#inicio');

/* ---------- Guirnalda ---------- */
const guirnalda = document.createElement('div');
guirnalda.className = 'papel-picado';
guirnalda.setAttribute('aria-hidden', 'true');
hero.append(guirnalda);

function colgar() {
	const ancho = hero.clientWidth;
	const movil = ancho < 640;
	const w = movil ? 36 : 50;
	const hueco = w * 0.22;
	const n = Math.floor((ancho - hueco) / (w + hueco));
	const inicio = (ancho - (n * w + (n - 1) * hueco)) / 2 + w / 2;
	const comba = movil ? 14 : 26; // cuánto cuelga el cordel al centro
	const y = (x) => 4 + (4 * comba * x * (ancho - x)) / (ancho * ancho);
	const pendiente = (x) => (Math.atan((4 * comba * (ancho - 2 * x)) / (ancho * ancho)) * 180) / Math.PI;

	let html = `<svg class="cordel" viewBox="0 0 ${ancho} 60" preserveAspectRatio="none"><path d="M0 4Q${ancho / 2} ${4 + 2 * comba} ${ancho} 4"/></svg>`;
	for (let i = 0; i < n; i++) {
		const x = inicio + i * (w + hueco);
		const estilo = [
			`left:${x - w / 2}px`,
			`top:${y(x)}px`,
			`width:${w}px`,
			`--giro:${pendiente(x).toFixed(1)}deg`,
			`--dur:${(2.6 + Math.random() * 1.8).toFixed(2)}s`,
			`--retraso:${(-Math.random() * 3).toFixed(2)}s`,
		].join(';');
		html += `<div class="bandera" style="${estilo}">${bandera(COLORES[i % COLORES.length], i % MOTIVOS.length)}</div>`;
	}
	guirnalda.innerHTML = html;
}
colgar();

let ultimoAncho = hero.clientWidth;
new ResizeObserver(() => {
	if (hero.clientWidth === ultimoAncho) return;
	ultimoAncho = hero.clientWidth;
	colgar();
}).observe(hero);

if (!reducedMotion) {
	gsap.from(guirnalda.querySelectorAll('.bandera'), {
		y: -40,
		opacity: 0,
		duration: 0.9,
		ease: 'back.out(1.6)',
		stagger: { each: 0.035, from: 'center' },
		delay: 0.4,
	});

	/* ---------- Pétalos de cempasúchil ---------- */
	const petalos = document.createElement('div');
	petalos.className = 'petalos';
	petalos.setAttribute('aria-hidden', 'true');
	const tonos = ['#f28c13', '#f6b81c', '#e8691a', '#e2337f'];
	const cuantos = window.innerWidth < 640 ? 10 : 18;
	for (let i = 0; i < cuantos; i++) {
		const p = document.createElement('span');
		p.className = 'petalo';
		p.style.cssText = [
			`left:${(Math.random() * 100).toFixed(1)}%`,
			`background:${tonos[i % tonos.length]}`,
			`--tam:${(7 + Math.random() * 7).toFixed(1)}px`,
			`--dur:${(10 + Math.random() * 9).toFixed(1)}s`,
			`--retraso:${(-Math.random() * 18).toFixed(1)}s`,
			`--deriva:${(Math.random() * 120 - 60).toFixed(0)}px`,
			`--vuelta:${(Math.random() * 720 - 360).toFixed(0)}deg`,
		].join(';');
		petalos.append(p);
	}
	hero.append(petalos);
}
