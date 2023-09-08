import * as BABYLON from "babylonjs"

export class SceneViewer {

    canvas:HTMLCanvasElement;
    scene:BABYLON.Scene;
    engine:BABYLON.Engine;

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas);
        this.scene = new BABYLON.Scene(this.engine);
    }

}