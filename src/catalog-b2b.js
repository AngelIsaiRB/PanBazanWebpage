import gsap from 'gsap';
import { reducedMotion } from './layout.js';
import { CATEGORIAS, PANES } from './data/catalogo.js';

const precioMXN = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});
const nombreCategoria = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nombre]));
const ordenCategoria = Object.fromEntries(CATEGORIAS.map((c, i) => [c.id, i]));
const normalizar = (texto) =>
	texto
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();

const panes = PANES.map((pan, i) => ({
	...pan,
	orden: i,
	busqueda: normalizar(
		`${pan.nombre} ${pan.descripcion} ${nombreCategoria[pan.categoria]} ${pan.tamano ?? ''} ${pan.temporada ? 'temporada' : ''}`,
	),
}));

const $ = (sel) => document.querySelector(sel);
const grid = $('#grid');
const chips = $('#chips');
const buscar = $('#buscar');
const ordenar = $('#ordenar');
const resultados = $('#resultados');
const vacio = $('#vacio');

/* ---------- Estado (sincronizado con la URL para poder compartir) ---------- */
const params = new URLSearchParams(location.search);
const estado = {
	categoria: CATEGORIAS.some((c) => c.id === params.get('categoria')) ? params.get('categoria') : 'todos',
	consulta: params.get('q') ?? '',
	orden: ['precio-asc', 'precio-desc'].includes(params.get('orden')) ? params.get('orden') : 'categoria',
};
buscar.value = estado.consulta;
ordenar.value = estado.orden;

function guardarEnURL() {
	const p = new URLSearchParams();
	if (estado.categoria !== 'todos') p.set('categoria', estado.categoria);
	if (estado.consulta) p.set('q', estado.consulta);
	if (estado.orden !== 'categoria') p.set('orden', estado.orden);
	const query = p.toString();
	history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

/* ---------- Plantillas ---------- */
function tarjeta(pan) {
	const src = pan.imagen ?? pan.ilustracion;
	const alt = pan.imagen ? pan.nombre : `Ilustración de ${pan.nombre.toLowerCase()}`;
	return `
		<article class="tarjeta group">
			<div class="relative aspect-square overflow-hidden rounded-[1.75rem] bg-[#ebe6df] shadow-[0_20px_40px_-28px_rgb(42_24_16/0.5)]">
				<img src="${src}" alt="${alt}" width="900" height="900" loading="lazy" decoding="async"
					class="size-full object-cover transition-transform duration-700 ease-horno group-hover:scale-[1.06]" />
				${pan.tamano ? `<span class="absolute top-3 left-3 rounded-full bg-papel/90 px-3 py-1 text-[0.68rem] font-semibold tracking-wide text-tinta/80 uppercase backdrop-blur">${pan.tamano}</span>` : ''}
				${pan.temporada ? '<span class="absolute top-3 right-3 rounded-full bg-ate px-3 py-1 text-[0.68rem] font-semibold tracking-wide text-papel uppercase shadow-md">Solo en temporada</span>' : ''}
				${pan.ilustracion && !pan.temporada ? '<span class="absolute top-3.5 right-4 hidden text-[0.65rem] font-medium tracking-wide text-tinta/45 uppercase sm:block">Ilustración</span>' : ''}
				<p class="absolute right-3 bottom-3 flex items-baseline gap-1 rounded-full bg-cacao px-3.5 py-1.5 text-papel shadow-lg">
					<span class="font-display text-lg leading-none sm:text-xl">${precioMXN.format(pan.precio)}</span>
					<span class="text-[0.62rem] font-semibold tracking-wide text-papel/70">MXN c/u</span>
				</p>
			</div>
			<div class="mt-4 px-1">
				<p class="text-[0.68rem] font-semibold tracking-[0.18em] text-ate uppercase">${nombreCategoria[pan.categoria]}</p>
				<h3 class="mt-1.5 font-display text-lg leading-snug text-cacao sm:text-xl">${pan.nombre}</h3>
				<p class="mt-1.5 text-sm leading-relaxed text-tinta/65">${pan.descripcion}</p>
			</div>
		</article>`;
}

function chip(id, nombre, total) {
	const activo = estado.categoria === id;
	return `
		<button type="button" data-categoria="${id}" aria-pressed="${activo}"
			class="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors duration-300
			${activo ? 'border-cacao bg-cacao text-papel' : 'border-tinta/15 bg-white/50 text-tinta/80 hover:border-tinta/40 hover:text-tinta'}">
			${nombre}
			<span class="text-xs ${activo ? 'text-papel/60' : 'text-tinta/45'}">${total}</span>
		</button>`;
}

/* ---------- Render ---------- */
function renderChips() {
	chips.innerHTML =
		chip('todos', 'Todos', panes.length) +
		CATEGORIAS.map((c) => chip(c.id, c.nombre, panes.filter((p) => p.categoria === c.id).length)).join('');
}

function filtrar() {
	const consulta = normalizar(estado.consulta.trim());
	const lista = panes.filter(
		(p) => (estado.categoria === 'todos' || p.categoria === estado.categoria) && (!consulta || p.busqueda.includes(consulta)),
	);
	const criterios = {
		categoria: (a, b) => ordenCategoria[a.categoria] - ordenCategoria[b.categoria] || a.orden - b.orden,
		'precio-asc': (a, b) => a.precio - b.precio || a.orden - b.orden,
		'precio-desc': (a, b) => b.precio - a.precio || a.orden - b.orden,
	};
	return lista.sort(criterios[estado.orden]);
}

function renderGrid({ animar = true } = {}) {
	const lista = filtrar();
	grid.innerHTML = lista.map(tarjeta).join('');
	vacio.classList.toggle('hidden', lista.length > 0);
	resultados.textContent =
		lista.length === panes.length ? `${lista.length} productos` : `${lista.length} de ${panes.length} productos`;

	if (animar && !reducedMotion && lista.length) {
		gsap.killTweensOf('.tarjeta');
		gsap.from('.tarjeta', { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04 });
	}
}

// El tamaño sólo se anota si el nombre no lo dice ya ("Cazuela grande", "Conchitas pequeñas")
const tamanoExtra = (pan) => pan.tamano && !normalizar(pan.nombre).includes(normalizar(pan.tamano).slice(0, 6));

function renderPizarron() {
	$('#pizarron').innerHTML = CATEGORIAS.map((c) => {
		const items = PANES.filter((p) => p.categoria === c.id)
			.map(
				(p) => `
				<li class="flex items-baseline gap-3 py-2.5">
					<span>
						${p.nombre}${tamanoExtra(p) ? ` <span class="text-sm text-papel/50">(${p.tamano.toLowerCase()})</span>` : ''}
						${p.temporada ? '<span class="ml-1 inline-block rounded-full border border-kraft/50 px-2 py-0.5 align-middle text-[0.62rem] font-semibold tracking-wide whitespace-nowrap text-kraft uppercase">Solo en temporada</span>' : ''}
					</span>
					<span class="min-w-6 flex-1 -translate-y-1 border-b border-dotted border-papel/25" aria-hidden="true"></span>
					<span class="font-display text-xl text-kraft">${precioMXN.format(p.precio)}</span>
				</li>`,
			)
			.join('');
		return `
			<div class="mb-12 break-inside-avoid">
				<h3 class="font-display text-2xl text-kraft">${c.nombre}</h3>
				<ul class="mt-3 border-t border-papel/15">${items}</ul>
			</div>`;
	}).join('');
}

/* ---------- Eventos ---------- */
chips.addEventListener('click', (e) => {
	const boton = e.target.closest('[data-categoria]');
	if (!boton || boton.dataset.categoria === estado.categoria) return;
	estado.categoria = boton.dataset.categoria;
	renderChips();
	renderGrid();
	guardarEnURL();
});

let espera;
buscar.addEventListener('input', () => {
	clearTimeout(espera);
	espera = setTimeout(() => {
		estado.consulta = buscar.value;
		renderGrid();
		guardarEnURL();
	}, 150);
});

ordenar.addEventListener('change', () => {
	estado.orden = ordenar.value;
	renderGrid();
	guardarEnURL();
});

$('#limpiar').addEventListener('click', () => {
	Object.assign(estado, { categoria: 'todos', consulta: '' });
	buscar.value = '';
	renderChips();
	renderGrid();
	guardarEnURL();
});

/* ---------- Inicio ---------- */
const minimo = precioMXN.format(Math.min(...PANES.map((p) => p.precio)));
$('#stat-count').textContent = PANES.length;
$('#stat-min').textContent = minimo;
$('#badge-min').textContent = minimo;

renderChips();
renderGrid({ animar: false });
renderPizarron();
