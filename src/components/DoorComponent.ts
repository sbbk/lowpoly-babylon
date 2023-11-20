import { GameComponentType, GameObject, iGameComponent } from "./GameObject";
import * as BABYLON from "@babylonjs/core"
import { v4 as uuidv4 } from 'uuid';

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
    text:string;
    height:number;
    locked:boolean;
    width:number;
    depth:number;
    rootMesh:BABYLON.Mesh;

    constructor(openDirection:openDirection,openType:openType,rootMesh:BABYLON.Mesh,id?:string) {

        this.id = id ? id : new uuidv4();
        console.log("DOOR ID",this.id);
        this.height = 4;
        this.width = 2;
        this.depth = 0.2;
        this.openDirection = openDirection
        this.openType = openType
        this.isOpen = false;
        this.canInteract = true;
        this.rootMesh = rootMesh;
        this.mesh = BABYLON.MeshBuilder.CreateBox('door',{width:this.width,height:this.height,depth:this.depth});
        this.mesh.parent = this.rootMesh;
        
        
        // DEBUG COLOUR
        let mat = new BABYLON.StandardMaterial('doormat');
        mat.diffuseColor = new BABYLON.Color3(1,0,0);
        this.mesh.material = mat;

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
    }
    close() {

        switch(this.openType) {
            case "slide":
                this.mesh.position = new BABYLON.Vector3(0,0,0);
        }
        this.isOpen = false;
    }

    init() {

    }
    interact() {

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
    renderToScene(position?: BABYLON.Vector3) {

    };



}