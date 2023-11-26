import { GameComponentType, iGameComponent } from "../GameObject";
import * as BABYLON from "@babylonjs/core";
import { EventTrigger } from "../../triggers/EventTrigger";
import { v4 as uuidv4 } from 'uuid';
import { delayFunc } from "../../utility/utilities";
import { SceneViewer } from "../../babylon/sceneViewer";

export class IntersectInOutTrigger implements iGameComponent {

    name:string = "Trigger";
    id:string;
    rootMesh:BABYLON.Mesh;
    mesh:BABYLON.Mesh;
    aggregate:BABYLON.PhysicsAggregate;
    mat:BABYLON.StandardMaterial // Debug remove later... or figure diff way
    type:GameComponentType = "IntersectInOutTrigger";
    canInteract: boolean;
    hasIntersected:boolean = false;
    trigger:EventTrigger;
    playSFX:boolean;
    disabled:boolean;
    fireSFX:BABYLON.Sound;
    disabledSFX:BABYLON.Sound;
    enabled:boolean = false;

    constructor(trigger:EventTrigger,rootMesh:BABYLON.Mesh,playSFX:boolean) {
        this.trigger = trigger;
        this.rootMesh = rootMesh
        this.playSFX = playSFX;
        this.mesh = BABYLON.MeshBuilder.CreateBox('button');
        this.mesh.scaling = new BABYLON.Vector3(3,3,3);
        this.mesh.setEnabled(false);
        this.mesh.parent = this.rootMesh;
        this.mesh.setEnabled(true);
        this.mat = new BABYLON.StandardMaterial('button-mat');
        this.mat.diffuseColor = new BABYLON.Color3(0,1,0);
        this.mesh.material = this.mat;
        this.canInteract = true;
        this.id = uuidv4();
        this.disabled = false;
        this.fireSFX = new BABYLON.Sound('collide-sfx',new URL('../../media/audio/sfx/button/button-default.wav',import.meta.url).pathname,SceneViewer.scene);
        this.disabledSFX = new BABYLON.Sound('collide-sfx',new URL('../../media/audio/sfx/button/button-fail.wav',import.meta.url).pathname,SceneViewer.scene);

        setTimeout(() => {
            this.canInteract = true;
            this.enabled = true;
            SceneViewer.scene.onBeforeRenderObservable.add(async() => {  
                
                if (this.mesh.intersectsMesh(SceneViewer.player.mesh) && this.hasIntersected == false) {
                    this.hasIntersected = true;
                    this.mat.diffuseColor = new BABYLON.Color3(1,0,0);
                    this.fire();            
                    this.disabled = true;
    
                }
                else if (!this.mesh.intersectsMesh(SceneViewer.player.mesh) && this.hasIntersected == true) {
                    this.hasIntersected = false;
                    this.disabled = false;
                    this.fire();
                    this.mat.diffuseColor = new BABYLON.Color3(0,1,0)
                }
                
            })
        }, 1000);

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
        if (this.trigger) this.trigger.fire();
        if (this.playSFX) {
            this.fireSFX.play();
        }
    }
    endInteract() {

    }
    enable() {

    }
    disable() {
        
    }

}