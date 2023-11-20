import { GameComponentType, iGameComponent } from "./GameObject";
import * as BABYLON from "@babylonjs/core";
import { EventTrigger } from "../triggers/EventTrigger";
import { v4 as uuidv4 } from 'uuid';
import { delayFunc } from "../utility/utilities";
import { SceneViewer } from "../babylon/sceneViewer";

export class ButtonComponent implements iGameComponent {

    name:string = "Button";
    id:string;
    rootMesh:BABYLON.Mesh;
    mesh:BABYLON.Mesh;
    mat:BABYLON.StandardMaterial // Debug remove later... or figure diff way
    type:GameComponentType = "Button";
    canInteract: boolean;
    trigger:EventTrigger;
    label:string
    timeoutMS:number;
    disabled:boolean;
    fireSFX:BABYLON.Sound;
    disabledSFX:BABYLON.Sound;
    enabled:boolean = true;

    constructor(trigger:EventTrigger,rootMesh:BABYLON.Mesh,timeoutMS:number,label?:string) {
        this.id = uuidv4();
        this.trigger = trigger;
        this.rootMesh = rootMesh
        this.timeoutMS = timeoutMS
        this.mesh = BABYLON.MeshBuilder.CreateBox('button');
        this.mesh.parent = this.rootMesh;
        this.mat = new BABYLON.StandardMaterial('button-mat');
        this.mat.diffuseColor = new BABYLON.Color3(1,0,1);
        this.mesh.material = this.mat;
        this.canInteract = true;
        this.disabled = false;
        this.label = label;
        this.fireSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/button/button-default.wav',import.meta.url).pathname,SceneViewer.scene);
        this.disabledSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/button/button-fail.wav',import.meta.url).pathname,SceneViewer.scene);
    }

    init() {}
    renderToScene(position:BABYLON.Vector3) {

    }
    destroy() {

    }
    onDamage() {

    }
    onCollide() {

    }
    enable() {

    }
    disable() {
        
    }
    async interact() {

        if (this.disabled) {
            this.disabledSFX.play();
            return;
        };
        this.fire();
        this.disabled = true;
        this.mat.diffuseColor = new BABYLON.Color3(1,0,0);
        await delayFunc(this.timeoutMS);
        this.mat.diffuseColor = new BABYLON.Color3(1,0,1)
        this.disabled = false;


    }
    fire() {
        if (this.trigger) this.trigger.fire();
        this.fireSFX.play();
    }
    endInteract() {

    }

}