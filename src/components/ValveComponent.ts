import * as BABYLON from "@babylonjs/core";
import { GameComponentType, iGameComponent } from "./Entity";
import { SceneViewer } from "../babylon/sceneViewer";
import { EventTrigger } from "../triggers/EventTrigger";

export class ValveComponent implements iGameComponent {
    name: string;
    id: string;
    type: GameComponentType = "Valve";
    trigger:EventTrigger;
    icon?: string;
    mesh?: BABYLON.Mesh;
    label?: string;
    canInteract: boolean;
    enabled: boolean;
    updateInterval: NodeJS.Timeout
    animation: BABYLON.Animation
    isInteracting:boolean;
    turnSpeed:number // ms
    animationFrame:number;
    enabledLimit:number;
    requiredAmount:number;
    completed:boolean;
    currentAmount:number;
    frameRate:number;
    turnSFX:BABYLON.Sound;
    completeSFX:BABYLON.Sound;
    disabledSFX:BABYLON.Sound;

    constructor(trigger:EventTrigger, mesh:BABYLON.Mesh,requiredAmount?:number,turnSpeed?:number) {

        this.trigger = trigger;
        this.currentAmount = 0;
        this.completed = false;
        this.animationFrame = 0;
        this.mesh = mesh;
        let root = BABYLON.MeshBuilder.CreateBox('valve-t');
        root.visibility = 0;
        root.parent = this.mesh.parent;
        this.mesh.parent = root;
        root.rotation.x = Math.PI / 2;
        this.canInteract = true;
        this.animationFrame = 0;
        this.turnSpeed = turnSpeed ? turnSpeed : 100;
        this.requiredAmount = requiredAmount ? requiredAmount : 50;
        this.isInteracting = false;
        this.frameRate = 30;
        this.turnSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/lever-valve/valve-turn.wav',import.meta.url).pathname,SceneViewer.scene);
        this.turnSFX.loop = true;
        this.completeSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/lever-valve/valve-stop.wav',import.meta.url).pathname,SceneViewer.scene);
        this.disabledSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/button/button-fail.wav',import.meta.url).pathname,SceneViewer.scene);


        // Create an animation object
        this.animation = new BABYLON.Animation("rotationAnimation", "rotation.y", this.frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        var keys = [];
        keys.push({
            frame: 0,
            value: 0
        });
        keys.push({
            frame: 100,
            value: 2 * Math.PI
        });
        this.animation.setKeys(keys);
        this.mesh.animations.push(this.animation);
    }

    init() {};
    interact() {

        if (this.completed) {
            this.disabledSFX.play();
        }
        if (this.currentAmount == this.requiredAmount) return;
        if (this.isInteracting == true) return;
        this.turnValve()

    };
    endInteract() {

        this.isInteracting = false;
        clearInterval(this.updateInterval);
        SceneViewer.scene.stopAnimation(this.mesh);
        if(this.trigger) this.trigger.fire({current:this.currentAmount,max:this.requiredAmount,min:0,update:false});
        this.turnSFX.stop();


    };
    turnValve() {
        this.isInteracting = true;
        SceneViewer.scene.beginAnimation(this.mesh, this.animationFrame, 100, true);
        this.turnSFX.play();
        this.updateInterval = setInterval(() => {
            if(this.trigger) this.trigger.fire({current:this.currentAmount,max:this.requiredAmount,min:0,update:true});
            this.currentAmount += 1;
            console.log(this.currentAmount + " / " + this.requiredAmount);
            if (this.currentAmount == this.requiredAmount)
                this.onCompleted();
        },this.turnSpeed)
    }
    onCompleted() {
        this.completed = true;
        this.endInteract();
        if(this.trigger) this.trigger.fire({current:this.currentAmount,max:this.requiredAmount,min:0,update:false});
        this.completeSFX.play();
    }
    destroy() {};
    enable() {};
    disable() {};
    renderToScene() {};

}