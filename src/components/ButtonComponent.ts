import { GameComponentType, iGameComponent } from "./Entity";
import * as BABYLON from "@babylonjs/core";
import { EventHandler } from "../triggers/EventTrigger";
import { v4 as uuidv4 } from 'uuid';
import { delayFunc } from "../utility/utilities";
import { SceneViewer } from "../babylon/sceneViewer";

export class ButtonComponent implements iGameComponent {

    name:string = "Button";
    id:string;
    mesh:BABYLON.Mesh;
    mat:BABYLON.StandardMaterial // Debug remove later... or figure diff way
    type:GameComponentType = "Button";
    canInteract: boolean;
    trigger:EventHandler.EventTrigger;
    label:string
    timeoutMS:number;
    disabled:boolean;
    fireSFX:BABYLON.Sound;
    disabledSFX:BABYLON.Sound;
    enabled:boolean = true;

    constructor(mesh:BABYLON.Mesh,timeoutMS:number,label?:string) {
        this.id = uuidv4();
        this.trigger = null;
        this.timeoutMS = timeoutMS
        this.mesh = mesh;
        this.canInteract = true;
        this.disabled = false;
        this.label = label;
        this.fireSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/button/button-default.wav',import.meta.url).pathname,SceneViewer.scene);
        this.disabledSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/button/button-fail.wav',import.meta.url).pathname,SceneViewer.scene);
    }

    init() {}
    setTrigger(trigger:EventHandler.EventTrigger) {
        this.trigger = trigger;
    }
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
        await delayFunc(this.timeoutMS);
        this.disabled = false;


    }
    fire() {
        if (this.trigger) this.trigger.fire();
        this.fireSFX.play();
    }
    endInteract() {

    }

}