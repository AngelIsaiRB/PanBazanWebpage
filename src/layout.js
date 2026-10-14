import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Cabecera ---------- */
const header = document.querySelector('#site-header');
const updateHeader = () => (header.dataset.scrolled = String(window.scrollY > 24));
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const menuToggle = document.querySelector('#menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const setMenu = (open) => {
	menuToggle.setAttribute('aria-expanded', String(open));
	menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
	mobileMenu.classList.toggle('hidden', !open);
	menuToggle.querySelector('.menu-line-top').style.transform = open ? 'translateY(4px) rotate(45deg)' : '';
	menuToggle.querySelector('.menu-line-bottom').style.transform = open ? 'translateY(-4px) rotate(-45deg)' : '';
	if (open) header.dataset.scrolled = 'true';
	else updateHeader();
};
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));

// Página actual en la navegación
const page = document.body.dataset.page;
document.querySelectorAll(`[data-nav="${page}"]`).forEach((link) => {
	link.setAttribute('aria-current', 'page');
	link.classList.add('text-ate');
});

document.querySelector('#year').textContent = new Date().getFullYear();

/* ---------- Animaciones de entrada ---------- */
if (!reducedMotion) {
	gsap.from('[data-hero]', { y: 32, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });

	gsap.utils.toArray('[data-reveal]').forEach((el) => {
		gsap.from(el, {
			y: 48,
			opacity: 0,
			duration: 1.2,
			ease: 'expo.out',
			scrollTrigger: { trigger: el, start: 'top 85%', once: true },
		});
	});
}
