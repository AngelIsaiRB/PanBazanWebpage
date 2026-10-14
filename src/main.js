import gsap from 'gsap';
import { reducedMotion } from './layout.js';
import './muertos.js'; // temporada de Día de Muertos: quitar al terminar

const PHRASES = ['Roscas', 'Mantequilla', 'Conchas', 'Cazuela', 'Pan de muerto', 'Cuernos', 'Repostería'];
const OVEN_WORDS = ['Pan de muerto', 'Conchas', 'Pan de cazuela', 'Pan de canela', 'Repostería'];
const OPENING_HOURS = { open: 6, close: 17 };

/* ---------- Panes 3D (carga diferida para no bloquear el primer render) ---------- */
const stage = document.querySelector('#rosca-stage');
const selector = document.querySelector('#pan-3d');
const NOMBRES_3D = {
	muerto: 'Pan de muerto de canela con su carita, en 3D girando',
	rosca: 'Rosca de Reyes en 3D girando',
	concha: 'Conchas de vainilla y chocolate en 3D girando',
};
import('./three/PanScene.js')
	.then(({ PanScene }) => {
		const escena = new PanScene(stage, {
			reducedMotion,
			onLoad: () => {
				stage.dataset.loaded = 'true';
				selector.dataset.ready = 'true';
			},
		});
		selector.addEventListener('click', (e) => {
			const boton = e.target.closest('[data-modelo]');
			if (!boton) return;
			for (const b of selector.querySelectorAll('[data-modelo]')) b.setAttribute('aria-pressed', String(b === boton));
			stage.setAttribute('aria-label', NOMBRES_3D[boton.dataset.modelo]);
			escena.show(boton.dataset.modelo);
		});
	})
	.catch((err) => {
		console.error('No se pudo cargar la escena 3D', err);
		stage.dataset.loaded = 'true';
	});

/* ---------- Estado de apertura (hora de Oaxaca) ---------- */
const hour = Number(
	new Intl.DateTimeFormat('es-MX', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Mexico_City' }).format(new Date()),
);
const isOpen = hour >= OPENING_HOURS.open && hour < OPENING_HOURS.close;
document.querySelector('#open-status').textContent = isOpen
	? 'Abierto ahora · hasta las 17:00'
	: 'Cerrado ahora · abrimos a las 06:00';
if (!isOpen) {
	document.querySelector('#open-dot').className = 'size-2 rounded-full bg-ate';
}

/* ---------- Cinta de frases ---------- */
const marquee = document.querySelector('#marquee');
const strip = PHRASES.map((p) => `<span>${p}</span><span class="text-kraft" aria-hidden="true">•</span>`).join('');
marquee.innerHTML = strip + strip; // duplicado para el bucle infinito

/* ---------- Palabra rotatoria ---------- */
const rotator = document.querySelector('#rotator');
if (!reducedMotion) {
	let index = 0;
	const next = () => {
		index = (index + 1) % OVEN_WORDS.length;
		gsap
			.timeline({ onComplete: () => gsap.delayedCall(1.8, next) })
			.to(rotator, { yPercent: -110, opacity: 0, duration: 0.45, ease: 'power3.in' })
			.add(() => (rotator.textContent = OVEN_WORDS[index]))
			.fromTo(rotator, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
	};
	gsap.delayedCall(2.4, next);
}
