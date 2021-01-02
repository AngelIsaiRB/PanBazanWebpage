import { Scene, Color, DirectionalLight, HemisphereLight, TextureLoader, MeshStandardMaterial, Mesh, PointLightHelper, DirectionalLightHelper, MathUtils } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import BoxCreator from '../objects/BoxCreator';
import { Cube } from '../objects/Cube';



class Scene1 extends Scene {
	constructor() {
		super();
		this.background = new Color('black').convertSRGBToLinear();
		this.create();
	}
	
	create() {
		// Rosca
		const textureLoader = new TextureLoader();
		textureLoader.setPath("/src/assets/textures/");
		const baseColor = textureLoader.load("texturepan - copia.jpg"); 
		const pastaTexture = textureLoader.load("pasta-texture.jpg"); 
		const tiraRoja = textureLoader.load("tira-red.jpg"); 
		const tiraVerde = textureLoader.load("tira-texture.jpg"); 
		const material_standar = new  MeshStandardMaterial({    			
			
			map:baseColor,

		});

		let loader = new GLTFLoader();
		loader.load('/src/assets/Rosca.gltf', (gltf)=>{			
			const rosca = gltf.scene.children[2];
			const roscaBottom = gltf.scene.children[3];
			const p1 = gltf.scene.children[4];
			const p2 = gltf.scene.children[5];
			const p3 = gltf.scene.children[6];
			const p4 = gltf.scene.children[7];
			const p5 = gltf.scene.children[8];
			const p6 = gltf.scene.children[9];
			const t1 = gltf.scene.children[10];
			const t2 = gltf.scene.children[11];
			const t3 = gltf.scene.children[12];
			const t4 = gltf.scene.children[13];
			const t5 = gltf.scene.children[14];
			const t6 = gltf.scene.children[15];
			const t7 = gltf.scene.children[16];
			const t8 = gltf.scene.children[17];
			const t9 = gltf.scene.children[18];
			roscaBottom.material.map=baseColor;
			p1.material.map=pastaTexture;
			rosca.material.map=baseColor;
			t1.material.map= tiraRoja;
			t2.material.map= tiraVerde;
			// rosca.scale.set(1,1,1);
			
			this.add(rosca,roscaBottom,p1,p2,p3,p4,p5,p6,t1,t2,t3,t4,t5,t6,t7,t8,t9)
		  	// cube.position.x=100;
			// this.add(gltf.scene);
			
		  });

		

		// luces
		const ambientLight = new HemisphereLight(0xffffbb, 0x080820, .5);
		const light = new DirectionalLight(0xffffff, 7.0);		
		const ligh2 = new DirectionalLight(0xffffff, 0.5);		
		const lighL = new DirectionalLight(0xffffff, 1);		
		const lighR = new DirectionalLight(0xffffff, 1);		
		const lighF = new DirectionalLight(0xffffff, 1);		
		const lighFF = new DirectionalLight(0xffffff,1);		
		ligh2.position.set(0,-2,0)		
		lighL.position.set(-5,0,0)		
		lighR.position.set(5,0,0)		
		lighF.position.set(0,0,-6)		
		lighFF.position.set(0,0,6)		
		
		
		this.add(light, ambientLight,ligh2, lighL,lighR,lighF,lighFF);
	}

	update() {

	}
}

export default Scene1;
