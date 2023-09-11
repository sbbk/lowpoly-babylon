import * as BABYLON from "babylonjs"
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

// export class MainCamera extends THREE.PerspectiveCamera {

//     defaultSpeed:number = 1;
//     defaultFrameRate:number = 1;
//     defaultTarget:BABYLON.Vector3;
//     currentTarget: BABYLON.Vector3 | InteractableModel;

//     init() {
//         this.defaultTarget = this.target;
//     }

//     lerpToPosition(targetPosition:BABYLON.Vector3,speed?:number,frameRate?:number,path?:BABYLON.Vector3[]) {

//         if (!speed) speed = this.defaultSpeed;
//         if (!frameRate) frameRate =  this.defaultFrameRate;
//         this.target = targetPosition;

//     }

//     lerpToRotation(targetRotation:BABYLON.Vector3,speed?:number,frameRate?:number) {

//         if (!speed) speed = this.defaultSpeed;
//         if (!frameRate) frameRate =  this.defaultFrameRate;
//         this.rotation = targetRotation;

//     }

//     lerpHome() {
//         this.lerpToPosition(this.defaultTarget);
//     }

// }

export class InteractableModel {

    sceneViewer:SceneViewer;
    constructor(sceneViewer:SceneViewer) {
        this.sceneViewer = sceneViewer;
    }

    id:number;
    isLoaded:boolean;
    isFocused:boolean;
    isVisible:boolean;
    transformNode:BABYLON.TransformNode;
    mesh:BABYLON.Mesh;
    viewPosition:BABYLON.Vector3;
    viewRotation:BABYLON.Vector3;
    animations:string[];

    focus() {

        // this.sceneViewer.camera.lerpToPosition(this.viewPosition);
        // this.sceneViewer.camera.lerpToRotation(this.viewRotation);

    }


}

export class SceneViewer {

    canvas:HTMLCanvasElement;
    scene:THREE.Scene;
    renderer:THREE.WebGLRenderer;
    camera:THREE.PerspectiveCamera;
    gltfLoader:GLTFLoader

    constructor(canvas:HTMLCanvasElement) {

        this.scene = new THREE.Scene();

        // const geometry = new THREE.SphereGeometry( 3, 64, 64 );
        // const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
        // const mesh = new THREE.Mesh( geometry, material );
        // this.scene.add( mesh );

        this.camera = new THREE.PerspectiveCamera( 45, 800 / 600);
        this.camera.position.z = 20;
        this.scene.add(this.camera);

        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({canvas});

        const color = 0xFFFFFF;
        const intensity = 1;
        const ambientlight = new THREE.AmbientLight(color, intensity);
        this.scene.add(ambientlight);

        const light = new THREE.PointLight( 0xff0000, 1, 100 );
        light.position.set(0,10,10)
        this.scene.add( light );


        this.gltfLoader = new GLTFLoader();

        
        this.gltfLoader.load(new URL('../media/models/crash/crash.glb',import.meta.url).pathname, (model) => {

  this.scene.add(model.scenes[0])

        },
        undefined, function ( error ) {

            console.error( error );
        
        } );

        this.renderer.setSize(800,600);
        this.renderer.render( this.scene, this.camera )
        
    }

}