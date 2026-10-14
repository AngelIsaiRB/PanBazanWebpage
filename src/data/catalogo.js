/**
 * Catálogo de PanBazan. Precios en pesos mexicanos (MXN).
 * Para cambiar un precio o agregar un pan, edita este archivo.
 *
 * - `imagen`: foto real del pan (src/assets/catalogo/*.webp)
 * - si no hay foto, se usa una ilustración (src/assets/catalogo/ilustraciones/*.svg)
 * - `temporada: true`: muestra la etiqueta "Solo en temporada"
 */
import conchitasPequenas from '../assets/catalogo/conchitas-pequenas.webp';
import conchasMantequilla from '../assets/catalogo/conchas-mantequilla.webp';
import conchasCanela from '../assets/catalogo/conchas-canela.webp';
import cazuelitas from '../assets/catalogo/cazuelitas.webp';
import mantequillaGrande from '../assets/catalogo/mantequilla-grande.webp';
import cuernosPasta from '../assets/catalogo/cuernos-pasta.webp';
import cazuelaGrande from '../assets/catalogo/cazuela-grande.webp';
import panMuertoCanela from '../assets/catalogo/pan-muerto-canela.webp';
import panMuertoMantequilla from '../assets/catalogo/pan-muerto-mantequilla.webp';

import mantequillaPequeno from '../assets/catalogo/ilustraciones/mantequilla-pequeno.svg';
import cuernosNuez from '../assets/catalogo/ilustraciones/cuernos-nuez.svg';
import cuernosPina from '../assets/catalogo/ilustraciones/cuernos-pina.svg';
import cuernosZarzamora from '../assets/catalogo/ilustraciones/cuernos-zarzamora.svg';
import pelonas from '../assets/catalogo/ilustraciones/pelonas.svg';
import campechanas from '../assets/catalogo/ilustraciones/campechanas.svg';
import banderillas from '../assets/catalogo/ilustraciones/banderillas.svg';
import panques from '../assets/catalogo/ilustraciones/panques.svg';
import panqueNaranja from '../assets/catalogo/ilustraciones/panque-naranja.svg';
import panqueNuez from '../assets/catalogo/ilustraciones/panque-nuez.svg';

export const CATEGORIAS = [
	{ id: 'conchas', nombre: 'Conchas' },
	{ id: 'tradicional', nombre: 'Pan tradicional' },
	{ id: 'cuernos', nombre: 'Cuernos' },
	{ id: 'hojaldre', nombre: 'Hojaldre' },
	{ id: 'panques', nombre: 'Panqués' },
];

export const PANES = [
	// Conchas
	{
		nombre: 'Conchitas pequeñas',
		precio: 5,
		categoria: 'conchas',
		tamano: 'Pequeña',
		descripcion: 'Suaves, pequeñas y con su costra de azúcar.',
		imagen: conchitasPequenas,
	},
	{
		nombre: 'Conchas de mantequilla',
		precio: 15,
		categoria: 'conchas',
		tamano: 'Grande',
		descripcion: 'Masa de mantequilla con la clásica costra de concha.',
		imagen: conchasMantequilla,
	},
	{
		nombre: 'Conchas de canela',
		precio: 12,
		categoria: 'conchas',
		tamano: 'Grande',
		descripcion: 'Concha grande con costra de canela y azúcar.',
		imagen: conchasCanela,
	},

	// Pan tradicional
	{
		nombre: 'Cazuela grande',
		precio: 22,
		categoria: 'tradicional',
		tamano: 'Grande',
		descripcion: 'El pan de cazuela tlacolulense, en tamaño para compartir.',
		imagen: cazuelaGrande,
	},
	{
		nombre: 'Cazuelitas pequeñas',
		precio: 12,
		categoria: 'tradicional',
		tamano: 'Pequeña',
		descripcion: 'La receta del pan de cazuela en versión individual.',
		imagen: cazuelitas,
	},
	{
		nombre: 'Mantequilla grande',
		precio: 40,
		categoria: 'tradicional',
		tamano: 'Grande',
		descripcion: 'Pan de mantequilla grande, ideal para la mesa familiar.',
		imagen: mantequillaGrande,
	},
	{
		nombre: 'Mantequilla pequeño',
		precio: 12,
		categoria: 'tradicional',
		tamano: 'Pequeño',
		descripcion: 'Pan de mantequilla individual.',
		ilustracion: mantequillaPequeno,
	},
	{
		nombre: 'Pelonas',
		precio: 10,
		categoria: 'tradicional',
		tamano: 'Grande',
		descripcion: 'Pan redondo, suave y esponjoso.',
		ilustracion: pelonas,
	},
	{
		nombre: 'Pan de muerto de canela',
		precio: 25,
		categoria: 'tradicional',
		temporada: true,
		descripcion: 'Pan de muerto oaxaqueño de canela, cubierto de ajonjolí y con su carita tradicional.',
		imagen: panMuertoCanela,
	},
	{
		nombre: 'Pan de muerto de mantequilla',
		precio: 50,
		categoria: 'tradicional',
		temporada: true,
		descripcion: 'Pan de muerto oaxaqueño de mantequilla, suave y dorado, con su carita tradicional.',
		imagen: panMuertoMantequilla,
	},

	// Cuernos
	{
		nombre: 'Cuernos con nuez',
		precio: 15,
		categoria: 'cuernos',
		descripcion: 'Cuerno horneado con cubierta de nuez.',
		ilustracion: cuernosNuez,
	},
	{
		nombre: 'Cuernos con pasta',
		precio: 12,
		categoria: 'cuernos',
		descripcion: 'Cuerno con cubierta de pasta dulce.',
		imagen: cuernosPasta,
	},
	{
		nombre: 'Cuernos rellenos de piña',
		precio: 15,
		categoria: 'cuernos',
		descripcion: 'Cuerno relleno de piña.',
		ilustracion: cuernosPina,
	},
	{
		nombre: 'Cuernos rellenos de queso crema y zarzamora',
		precio: 15,
		categoria: 'cuernos',
		descripcion: 'Relleno de queso crema y zarzamora.',
		ilustracion: cuernosZarzamora,
	},

	// Hojaldre
	{
		nombre: 'Campechanas',
		precio: 10,
		categoria: 'hojaldre',
		descripcion: 'Hojaldre crujiente con azúcar caramelizada.',
		ilustracion: campechanas,
	},
	{
		nombre: 'Banderillas',
		precio: 10,
		categoria: 'hojaldre',
		descripcion: 'Tiras de hojaldre doradas y crujientes.',
		ilustracion: banderillas,
	},

	// Panqués
	{
		nombre: 'Panqués',
		precio: 10,
		categoria: 'panques',
		tamano: 'Individual',
		descripcion: 'Panqué individual, esponjoso y dorado.',
		ilustracion: panques,
	},
	{
		nombre: 'Panqué de naranja',
		precio: 200,
		categoria: 'panques',
		tamano: 'Grande',
		descripcion: 'Panqué grande con sabor a naranja, para compartir.',
		ilustracion: panqueNaranja,
	},
	{
		nombre: 'Panqué de nuez',
		precio: 200,
		categoria: 'panques',
		descripcion: 'Panqué grande con nuez.',
		ilustracion: panqueNuez,
	},
];
