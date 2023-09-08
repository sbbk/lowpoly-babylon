import * as BABYLON from "babylonjs"

export class MainCamera extends BABYLON.ArcRotateCamera {

    defaultSpeed:number = 1;
    defaultFrameRate:number = 1;
    defaultTarget:BABYLON.Vector3;
    currentTarget: BABYLON.Vector3 | InteractableModel;

    init() {
        this.defaultTarget = this.target;
    }

    lerpToPosition(targetPosition:BABYLON.Vector3,speed?:number,frameRate?:number,path?:BABYLON.Vector3[]) {

        if (!speed) speed = this.defaultSpeed;
        if (!frameRate) frameRate =  this.defaultFrameRate;
        this.target = targetPosition;

    }

    lerpToRotation(targetRotation:BABYLON.Vector3,speed?:number,frameRate?:number) {

        if (!speed) speed = this.defaultSpeed;
        if (!frameRate) frameRate =  this.defaultFrameRate;
        this.rotation = targetRotation;

    }

    lerpHome() {
        this.lerpToPosition(this.defaultTarget);
    }
    
}

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

        this.sceneViewer.camera.lerpToPosition(this.viewPosition);
        this.sceneViewer.camera.lerpToRotation(this.viewRotation);

    }


}

export class SceneViewer {

    canvas:HTMLCanvasElement;
    scene:BABYLON.Scene;
    engine:BABYLON.Engine;
    camera:MainCamera;
    mainLight:BABYLON.HemisphericLight;

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas);
        this.scene = new BABYLON.Scene(this.engine);
        this.camera = new MainCamera('main-camera',Math.PI / 2, Math.PI / -2, 10, BABYLON.Vector3.Zero());
        this.mainLight = new BABYLON.HemisphericLight('main-light',BABYLON.Vector3.Zero())
    }

}