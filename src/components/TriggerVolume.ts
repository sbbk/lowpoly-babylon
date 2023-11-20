import { GameComponentType, iGameComponent } from "./GameObject";
import * as BABYLON from "@babylonjs/core";
import { EventTrigger } from "../triggers/EventTrigger";
import { v4 as uuidv4 } from 'uuid';
import { delayFunc } from "../utility/utilities";
import { SceneViewer } from "../babylon/sceneViewer";

export class TriggerVolume implements iGameComponent {

    name:string = "Trigger";
    id:string;
    rootMesh:BABYLON.Mesh;
    mesh:BABYLON.Mesh;
    aggregate:BABYLON.PhysicsAggregate;
    mat:BABYLON.StandardMaterial // Debug remove later... or figure diff way
    type:GameComponentType = "Trigger";
    canInteract: boolean;
    trigger:EventTrigger;
    label:string
    timeoutMS:number;
    disabled:boolean;
    fireSFX:BABYLON.Sound;
    disabledSFX:BABYLON.Sound;
    enabled:boolean = true;

    constructor(trigger:EventTrigger,rootMesh:BABYLON.Mesh,timeoutMS:number,label?:string) {
        this.trigger = trigger;
        this.rootMesh = rootMesh
        this.timeoutMS = timeoutMS
        this.mesh = BABYLON.MeshBuilder.CreateBox('button');
        this.mesh.parent = this.rootMesh;
        this.mat = new BABYLON.StandardMaterial('button-mat');
        this.mat.diffuseColor = new BABYLON.Color3(0,1,0);
        this.mesh.material = this.mat;
        this.canInteract = true;
        this.label = label;
        this.id = uuidv4();
        this.disabled = false;
        this.fireSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/button/button-default.wav',import.meta.url).pathname,SceneViewer.scene);
        this.disabledSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/button/button-fail.wav',import.meta.url).pathname,SceneViewer.scene);

        setTimeout(() => {
            this.canInteract = true;
        }, 1000);

        SceneViewer.scene.onBeforeRenderObservable.add(async() => {  
            
            if (this.mesh.intersectsMesh(SceneViewer.player.heroMesh)) {
                console.log("Intersect")
                if (this.disabled) {
                    return;
                }
                this.disabled = true;
                this.mat.diffuseColor = new BABYLON.Color3(1,0,0);
                this.fire();            
                await delayFunc(this.timeoutMS);
                this.disabled = false;
                this.mat.diffuseColor = new BABYLON.Color3(0,1,0)

            }
            
        })
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

    }
    fire() {
        console.log("Fire",this.trigger);
        if (this.trigger) this.trigger.fire();
        this.fireSFX.play();
    }
    endInteract() {

    }
    enable() {

    }
    disable() {
        
    }

}