import { Scene, Color, DirectionalLight, HemisphereLight, TextureLoader, MeshStandardMaterial, Mesh, PointLightHelper, DirectionalLightHelper, MathUtils, AmbientLight, Group, SpotLight } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Observer, { EVENTS } from '../Observer';
import * as TWEEN from "@tweenjs/tween.js/dist/tween.amd";



class Scene1 extends Scene {
	constructor() {
		super();
		this.background = new Color('black').convertSRGBToLinear();
		this.zoomin=true;
		this.create();
		this.events();
	}
	
	create() {
		// Rosca
		const textureLoader = new TextureLoader();
		textureLoader.setPath("./assets/textures/");
		const baseColor = textureLoader.load("texturepan3.jpg"); 
		const baseNormal = textureLoader.load("texture3Spe.png"); 
		const pastaTexture = textureLoader.load("vanilla2.jpg"); 
		const pastaTexturechoco = textureLoader.load("choco2.jpg"); 			
		const tiraRoja = textureLoader.load("tira-red.jpg"); 
		const tiraVerde = textureLoader.load("tira-texture.jpg"); 
		const material_standar = new  MeshStandardMaterial({    			
			
			map:baseColor,
			
		});
		// comentario
		// 
		this.groups = new Group();
		let loader = new GLTFLoader();
		loader.load('./assets/Rosca.gltf', (gltf)=>{			
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
			roscaBottom.material.normalMap=baseNormal;									
			p1.material.map=pastaTexture;			
			p2.material.map=pastaTexturechoco;			
			// p1.material.normalMap=pastaTextureNormal;						
			
			t1.material.map= tiraRoja;
				

			t2.material.map= tiraVerde;
			// rosca.scale.set(1,1,1);
			

			this.groups.add(rosca,roscaBottom,p1,p2,p3,p4,p5,p6,t1,t2,t3,t4,t5,t6,t7,t8,t9);
			this.groups.scale.x=12;
			this.groups.scale.y=12;
			this.groups.scale.z=12;
			this.add(this.groups)
		  	// cube.position.x=100;
			// this.add(gltf.scene);
			
		  });

		

		// luces#f39f18 
		const ambientLight = new HemisphereLight( 0x0000ff, 0x00ff00, 2 ); 
		const light = new DirectionalLight( 0xf4f4f4, 6.0);		
		const ligh2 = new DirectionalLight( 0xf4f4f4, 0.5);		
		const lighL = new DirectionalLight( 0xf4f4f4, 0.3);		
		const lighR = new DirectionalLight( 0xf4f4f4, 0.3);		
		const lighF = new DirectionalLight( 0xf4f4f4, 0.3);		
		const lighFF = new DirectionalLight(0xf4f4f4, 0.3);		
		ligh2.position.set(0,-4,0)		
		lighL.position.set(-7,0,0)		
		lighR.position.set(7,0,0)		
		lighF.position.set(0,0,-8)		
		lighFF.position.set(0,0,8)		
		
		const spotLight = new SpotLight( 0xffffff,60 );
		spotLight.position.set(15, 15, 15 );

		spotLight.castShadow = true;

		spotLight.shadow.mapSize.width = 1024;
		spotLight.shadow.mapSize.height = 1024;

		spotLight.shadow.camera.near = 500;
		spotLight.shadow.camera.far = 4000;
		spotLight.shadow.camera.fov = 35;
		this.add(spotLight,ligh2, lighL,lighR,lighF,lighFF);
		
	}

	update() {
		if(this.zoomin){
			console.log(this.groups.scale)
			const camera_up = new TWEEN.Tween(this.groups.scale)
			.to({				
				x:1,
				y:1,
				z:1
			},1000)
			.easing(TWEEN.Easing.Sinusoidal.In)
			.onComplete(()=>{
				this.zoomin=false;
			});		
			camera_up.start();	
		}
		this.groups.rotateY(0.001);		
		TWEEN.update();
	}
	events(){
		
		Observer.on(EVENTS.MOVE_MOUSE,(x,y)=>{		
			const actualx=this.groups.position.x;
			const actualy=this.groups.position.y;
			// const camera_up = new TWEEN.Tween(this.groups.rotation)
			// .to({				
			// 	x:x/1000,
			// 	y:y/1000,
			// },400)
			// .easing(TWEEN.Easing.Sinusoidal.In)
			// .onComplete(()=>{
			// 	new TWEEN.Tween(this.groups.rotation)
			// 	.to({				
			// 		x:actualx,
			// 		y:actualy,
			// 	},200)
			// 	.easing(TWEEN.Easing.Quadratic.Out).start();
			// });		
			// camera_up.start();	
			this.groups.rotation.x=x/3000;
			this.groups.rotation.y=y/3000;
		});
	}
}

export default Scene1;
