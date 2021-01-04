import { PerspectiveCamera, Vector3, WebGLRenderer, sRGBEncoding, OrthographicCamera } from 'three';
import Scene1 from './scenes/Scene1';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Observer, { EVENTS } from './Observer';
import * as TWEEN from "@tweenjs/tween.js/dist/tween.amd";
export class App {
	constructor(container) {
		this.container = container;

		this.scene = new Scene1();

		// ## Camera's config
		this.camera = new OrthographicCamera(
			this.container.clientWidth/-2,
			this.container.clientWidth/2,
			this.container.clientHeight/2,
			this.container.clientHeight/-2,
			-1000,
			1000
		)
		
		this.camera.position.set(1.5, 0.4, 1);
		(this.container.clientWidth>1000) ? this.camera.zoom = 80 : this.camera.zoom =50
		this.camera.lookAt(0, 0, 0);

		this.control = new OrbitControls(this.camera, this.container);
		this.control.enableZoom=false;
		
		this.renderer = new WebGLRenderer({
			antialias: true,			
		})
		this.renderer.setPixelRatio(window.devicePixelRatio);

		
		this.renderer.outputEncoding = sRGBEncoding;

		
		this.renderer.physicallyCorrectLights = true;

		this.container.appendChild(this.renderer.domElement);

		  
		this.onResize();
		this.render();
		this.events();
	}

	events(){
		
	}

	onResize() {
		this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
		this.camera.left =this.container.clientWidth/-2;
		this.camera.right =this.container.clientWidth/2;
		this.camera.top =this.container.clientHeight/2;
		this.camera.bottom =this.container.clientHeight/-2;
		this.camera.updateProjectionMatrix();
	}

	render() {
		this.renderer.render(this.scene, this.camera);
		// Updates here
		this.scene.update();

		this.renderer.setAnimationLoop(() => this.render());
	}
}
