import gsap from 'gsap';
import { reducedMotion } from './layout.js';

const PHRASES = ['Roscas', 'Mantequilla', '¡El mejor!', 'Conchas', 'Cazuela', 'Dulce', 'Repostería', '😍🥐🍞'];
const OVEN_WORDS = ['Roscas', 'Conchas', 'Pan de cazuela', 'Pan de canela', 'Repostería'];
const OPENING_HOURS = { open: 6, close: 17 };

/* ---------- Rosca 3D (carga diferida para no bloquear el primer render) ---------- */
const stage = document.querySelector('#rosca-stage');
import('./three/RoscaScene.js')
	.then(({ RoscaScene }) => {
		new RoscaScene(stage, {
			reducedMotion,
			onLoad: () => (stage.dataset.loaded = 'true'),
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
	document.querySelector('#open-dot').className = 'size-2 rounded-full bg-barro';
}

/* ---------- Cinta de frases ---------- */
const marquee = document.querySelector('#marquee');
const strip = PHRASES.map((p) => `<span>${p}</span><span class="text-maiz not-italic">✻</span>`).join('');
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
