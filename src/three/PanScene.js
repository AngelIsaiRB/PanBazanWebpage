import {
	ACESFilmicToneMapping,
	Box3,
	CanvasTexture,
	DirectionalLight,
	Group,
	HemisphereLight,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	PMREMGenerator,
	RepeatWrapping,
	Scene,
	Sphere,
	SRGBColorSpace,
	TextureLoader,
	Timer,
	Vector3,
	WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';

import { crearConchas } from './panes.js';
import { crearPanDeMuerto } from './panDeMuerto.js';
import roscaUrl from '../assets/Rosca.gltf?url';
import breadColorUrl from '../assets/textures/bread-color.jpg';
import breadNormalUrl from '../assets/textures/bread-normal.jpg';
import conchaVainillaUrl from '../assets/textures/concha-vainilla.jpg';
import conchaChocolateUrl from '../assets/textures/concha-chocolate.jpg';
import ateRojoUrl from '../assets/textures/ate-rojo.jpg';
import ateVerdeUrl from '../assets/textures/ate-verde.jpg';

const CAMERA_DIRECTION = new Vector3(1.5, 0.95, 1).normalize();
const AUTO_ROTATE_SPEED = 0.12; // rad/s
const TILT_STRENGTH = 0.18; // rad
// Cada pan se escala a este radio para que la cámara no tenga que moverse al cambiar
const RADIO = 1;

/**
 * Escena 3D de los panes (pan de muerto, rosca y conchas). Se monta dentro de
 * `container`, se ajusta a su tamaño y solo renderiza mientras está visible.
 */
export class PanScene {
	constructor(container, { reducedMotion = false, onLoad } = {}) {
		this.container = container;
		this.reducedMotion = reducedMotion;
		this.onLoad = onLoad;
		this.pointer = { x: 0, y: 0 };
		this.timer = new Timer();
		this.visible = true;
		this.models = {};
		this.current = null;

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(30, 1, 0.1, 200);

		this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 0.9;
		this.renderer.domElement.setAttribute('aria-hidden', 'true');
		container.appendChild(this.renderer.domElement);

		const pmrem = new PMREMGenerator(this.renderer);
		this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		this.scene.environmentIntensity = 0.3;
		pmrem.dispose();

		this.addLights();

		// pivot: inclinación por el puntero · spinner: giro continuo
		this.pivot = new Group();
		this.spinner = new Group();
		this.pivot.add(this.spinner);
		this.scene.add(this.pivot);

		// El arrastre solo en punteros finos, para no bloquear el scroll en móvil
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableZoom = false;
		this.controls.enablePan = false;
		this.controls.enableDamping = true;
		this.controls.enabled = window.matchMedia('(pointer: fine)').matches;
		this.controls.minPolarAngle = Math.PI * 0.15;
		this.controls.maxPolarAngle = Math.PI * 0.48;
		if (!this.controls.enabled) this.renderer.domElement.style.touchAction = 'pan-y';

		this.onResize = this.onResize.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);
		this.resizeObserver = new ResizeObserver(this.onResize);
		this.resizeObserver.observe(container);
		window.addEventListener('pointermove', this.onPointerMove, { passive: true });

		this.visibilityObserver = new IntersectionObserver(([entry]) => {
			this.visible = entry.isIntersecting;
		});
		this.visibilityObserver.observe(container);

		this.onResize();
		this.loadModels();
		this.renderer.setAnimationLoop((t) => this.tick(t));
	}

	addLights() {
		const hemi = new HemisphereLight(0xfff4e0, 0x5a3418, 0.45);
		const key = new DirectionalLight(0xffe8c7, 2.2);
		key.position.set(6, 10, 5);
		const rim = new DirectionalLight(0xffc98a, 1.1);
		rim.position.set(-8, 4, -6);
		this.scene.add(hemi, key, rim);
	}

	async loadModels() {
		const textures = new TextureLoader();
		const setup = (tex, { color = true } = {}) => {
			tex.flipY = false;
			tex.wrapS = tex.wrapT = RepeatWrapping;
			tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
			if (color) tex.colorSpace = SRGBColorSpace;
			return tex;
		};
		const load = (url, options) => setup(textures.load(url), options);
		// La miga se espera completa: los panes procedurales la clonan con otra repetición
		const [breadMap, breadNormal] = await Promise.all([
			textures.loadAsync(breadColorUrl).then((tex) => setup(tex)),
			textures.loadAsync(breadNormalUrl).then((tex) => setup(tex, { color: false })),
		]);

		const finishes = {
			'Material.001': { map: breadMap, normalMap: breadNormal, roughness: 0.55 },
			pasta: { map: load(conchaVainillaUrl), roughness: 0.85 },
			chocolate: { map: load(conchaChocolateUrl), roughness: 0.8 },
			tiraRed: { map: load(ateRojoUrl), roughness: 0.28 },
			tiraGreen: { map: load(ateVerdeUrl), roughness: 0.28 },
		};

		const gltf = await new GLTFLoader().loadAsync(roscaUrl);
		const rosca = gltf.scene;
		rosca.traverse((obj) => {
			if (!obj.isMesh) return;
			const finish = finishes[obj.material.name];
			obj.material.metalness = 0; // glTF trae metallicFactor = 1 por defecto
			if (finish) Object.assign(obj.material, finish);
			obj.material.needsUpdate = true;
		});

		// El pan de muerto y las conchas se modelan aquí mismo, sin archivos extra
		const breads = { breadMap, breadNormal };
		this.models = {
			muerto: this.prepare(crearPanDeMuerto(breads), 1.15),
			rosca: this.prepare(rosca),
			concha: this.prepare(crearConchas(breads), 1.2),
		};

		this.frame();
		this.current = 'muerto';
		this.spinner.add(this.models.muerto);
		this.onLoad?.();

		if (this.reducedMotion) return;
		gsap.from(this.models.muerto.scale, { x: 0, y: 0, z: 0, duration: 1.8, ease: 'expo.out' });
		gsap.from(this.spinner.rotation, { y: -Math.PI, duration: 2.2, ease: 'expo.out' });
	}

	/** Centra el pan, le pone sombra de contacto y lo escala al radio común (`zoom` lo acerca) */
	prepare(model, zoom = 1) {
		const box = new Box3().setFromObject(model);
		const center = box.getCenter(new Vector3());
		model.position.sub(center);

		const holder = new Group();
		holder.add(model, this.createContactShadow(box, center));
		holder.userData.scale = (zoom * RADIO) / box.getBoundingSphere(new Sphere()).radius;
		holder.scale.setScalar(holder.userData.scale);
		return holder;
	}

	/** Cambia el pan que se muestra: el actual se encoge y el nuevo crece girando */
	show(name) {
		const next = this.models[name];
		if (!next || name === this.current) return;
		const prev = this.models[this.current];
		this.current = name;

		gsap.killTweensOf([prev.scale, next.scale]);
		this.spinner.add(next);
		if (this.reducedMotion) {
			this.spinner.remove(prev);
			return;
		}
		gsap.to(prev.scale, {
			x: 0,
			y: 0,
			z: 0,
			duration: 0.35,
			ease: 'power2.in',
			onComplete: () => {
				this.spinner.remove(prev);
				prev.scale.setScalar(prev.userData.scale);
			},
		});
		gsap.fromTo(
			next.scale,
			{ x: 0, y: 0, z: 0 },
			{ x: next.userData.scale, y: next.userData.scale, z: next.userData.scale, duration: 1.1, delay: 0.2, ease: 'expo.out' },
		);
		gsap.fromTo(next.rotation, { y: -Math.PI * 0.6 }, { y: 0, duration: 1.4, delay: 0.2, ease: 'expo.out' });
	}

	createContactShadow(box, center) {
		const size = 256;
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = size;
		const ctx = canvas.getContext('2d');
		const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
		gradient.addColorStop(0, 'rgba(60, 30, 10, 0.55)');
		gradient.addColorStop(0.55, 'rgba(60, 30, 10, 0.2)');
		gradient.addColorStop(1, 'rgba(60, 30, 10, 0)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, size, size);

		const width = (box.max.x - box.min.x) * 1.35;
		const depth = (box.max.z - box.min.z) * 1.35;
		const shadow = new Mesh(
			new PlaneGeometry(width, depth),
			new MeshBasicMaterial({ map: new CanvasTexture(canvas), transparent: true, depthWrite: false }),
		);
		shadow.rotation.x = -Math.PI / 2;
		shadow.position.y = box.min.y - center.y - 0.02;
		shadow.renderOrder = -1;
		return shadow;
	}

	frame() {
		const { aspect } = this.camera;
		const vFov = MathUtils.degToRad(this.camera.fov);
		const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
		const fitFov = Math.min(vFov, hFov);
		const distance = RADIO / Math.sin(fitFov / 2);
		this.camera.position.copy(CAMERA_DIRECTION).multiplyScalar(distance);
		this.camera.lookAt(0, 0, 0);
		this.controls.update();
	}

	onResize() {
		const { clientWidth: w, clientHeight: h } = this.container;
		if (!w || !h) return;
		this.renderer.setSize(w, h, false);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.frame();
	}

	onPointerMove(e) {
		this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
		this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
	}

	tick(time) {
		if (!this.visible) return;
		this.timer.update(time);
		const dt = Math.min(this.timer.getDelta(), 0.1);

		if (!this.reducedMotion) {
			this.spinner.rotation.y += AUTO_ROTATE_SPEED * dt;
			const ease = 1 - Math.exp(-4 * dt);
			this.pivot.rotation.x = MathUtils.lerp(this.pivot.rotation.x, this.pointer.y * TILT_STRENGTH, ease);
			this.pivot.rotation.z = MathUtils.lerp(this.pivot.rotation.z, -this.pointer.x * TILT_STRENGTH, ease);
		}

		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}
}
