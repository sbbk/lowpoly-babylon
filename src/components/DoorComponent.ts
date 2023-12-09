import { GameComponentType, Entity, iGameComponent } from "./Entity";
import * as BABYLON from "@babylonjs/core"
import { v4 as uuidv4 } from 'uuid';
import { SceneViewer } from "../babylon/sceneViewer";

export type openDirection = "left" | "right" | "up" | "down";
export type openType = "slide" | "swing";

export class DoorComponent implements iGameComponent {

    name:string = "Door";
    id:string;
    type:GameComponentType = "Door";
    openDirection:openDirection;
    openType:openType;
    isOpen:boolean;
    canInteract: boolean;
    mesh:BABYLON.Mesh;
    material:BABYLON.StandardMaterial;
    text:string;
    height:number;
    enabled:boolean;
    width:number;
    depth:number;
    rootMesh:BABYLON.Mesh;
    interactSFX:BABYLON.Sound;
    disabledSFX:BABYLON.Sound;
    enableSFX:BABYLON.Sound;
    disableSFX:BABYLON.Sound;


    constructor(openDirection:openDirection,openType:openType,mesh:BABYLON.Mesh,id?:string) {

        this.id = id ? id : new uuidv4();
        console.log("DOOR ID",this.id);
        this.height = 4;
        this.width = 2;
        this.depth = 0.2;
        this.mesh = mesh;
        this.mesh.scaling = new BABYLON.Vector3(0.7,0.7,0.7)
        this.mesh.rotation.y = Math.PI / 2
        this.openDirection = openDirection
        this.openType = openType
        this.isOpen = false;
        this.canInteract = true;
        this.enabled = false;
        this.interactSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/environment/door/door-interact-1.wav',import.meta.url).pathname,SceneViewer.scene);
        this.disabledSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/environment/door/door-disabled-1.wav',import.meta.url).pathname,SceneViewer.scene);
        this.enableSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/environment/door/door-enable-1.wav',import.meta.url).pathname,SceneViewer.scene);
        this.disableSFX = new BABYLON.Sound('collide-sfx',new URL('../media/audio/sfx/environment/door/door-disable-1.wav',import.meta.url).pathname,SceneViewer.scene);

    
        let pivot:BABYLON.Vector3;
        switch(this.openDirection) {
            case "left":
                pivot = new BABYLON.Vector3(-this.width/2,0,0);
                break;
            case "right":
                pivot = new BABYLON.Vector3(this.width/2,0,0);
                break;
            case "up":
                pivot = new BABYLON.Vector3(0,this.height / 2,0);
                break;
            case "down":
                pivot = new BABYLON.Vector3(0,-this.height / 2,0);
                break;
            
        }
        
        this.mesh.setPivotPoint(pivot)
        this.mesh.checkCollisions = true;

    }

    swing() {

    }

    slide() {

    }

    open() {

        switch(this.openType) {
            case "slide":
                if (this.openDirection == "left") {
                    this.mesh.position = new BABYLON.Vector3(-this.width,0,0)
                }
                if (this.openDirection == "right") {
                    this.mesh.position = new BABYLON.Vector3(this.width,0,0)
                }
                if (this.openDirection == "up") {
                    this.mesh.position = new BABYLON.Vector3(0,this.height,0)
                }
                if (this.openDirection == "down") {
                    this.mesh.position = new BABYLON.Vector3(0,-this.height,0)
                }
                break;
            case "swing":
                break;
        }
        this.isOpen = true;
        this.interactSFX.play();
    }
    close() {

        switch(this.openType) {
            case "slide":
                this.mesh.position = new BABYLON.Vector3(0,0,0);
        }
        this.isOpen = false;
        this.interactSFX.play();
    }

    init() {

    }
    interact() {

        if (!this.enabled) {
            this.disabledSFX.play();
            return;
        }
        switch(this.isOpen) {
            case true:
                this.close();
                break;
            case false:
                this.open();
                break;
        }
    }
    endInteract() {

    }

    destroy() {

    }
    enable() {

        // this.open();
        this.enableSFX.play();
        this.enabled = true;

    }
    disable() {

        // this.close();
        this.disableSFX.play();
        this.enabled = false;
    }
    renderToScene(position?: BABYLON.Vector3) {

    };



}