import { Vector3 } from "@babylonjs/core";
import { GameComponentType, iGameComponent } from "./GameObject";
import * as BABYLON from "@babylonjs/core";
import { EventHandler, EventTrigger } from "../triggers/EventTrigger";
import { v4 as uuidv4 } from 'uuid';
import { delayFunc } from "../utility/utilities";

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

    constructor(trigger:EventTrigger,rootMesh:BABYLON.Mesh,timeoutMS:number,label?:string) {
        this.trigger = trigger;
        this.rootMesh = rootMesh
        this.timeoutMS = timeoutMS
        this.mesh = BABYLON.MeshBuilder.CreateBox('button');
        this.mesh.parent = this.rootMesh;
        this.mat = new BABYLON.StandardMaterial('button-mat');
        this.mat.diffuseColor = new BABYLON.Color3(1,0,1);
        this.mesh.material = this.mat;
        this.canInteract = true;
        this.label = label;
        this.id = uuidv4();
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
    async interact() {

        if (!this.canInteract) return;
        this.fire();
        this.canInteract = false;
        this.mat.diffuseColor = new BABYLON.Color3(1,0,0);
        await delayFunc(this.timeoutMS);
        this.mat.diffuseColor = new BABYLON.Color3(1,0,1)
        this.canInteract = true;


    }
    fire() {
        console.log("Trigger",this.trigger);
        if (this.trigger) this.trigger.fire();
    }
    endInteract() {

    }

}