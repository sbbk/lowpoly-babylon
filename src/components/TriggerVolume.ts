import { GameComponentType, iGameComponent } from "./GameObject";
import * as BABYLON from "@babylonjs/core";
import { EventTrigger } from "../triggers/EventTrigger";
import { v4 as uuidv4 } from 'uuid';
import { delayFunc } from "../utility/utilities";
import { SceneViewer } from "../babylon/sceneViewer";

export class TriggerVolume implements iGameComponent {

    name:string = "Button";
    id:string;
    rootMesh:BABYLON.Mesh;
    mesh:BABYLON.Mesh;
    aggregate:BABYLON.PhysicsAggregate;
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

        //this.mesh.intersectsMesh(SceneViewer.player.pickupZone)

        // this.aggregate = new BABYLON.PhysicsAggregate(this.rootMesh,BABYLON.PhysicsShapeType.BOX,{mass:0});
        // this.aggregate.body.setMotionType(0)
        // SceneViewer.havokPlugin.setCollisionCallbackEnabled(this.aggregate.body,true);
        // this.aggregate.body.getCollisionObservable().add(async(collisionEvent) => {
        //     console.log("Collision Start")
        //     if (this.canInteract == false) return;
        //     if (collisionEvent.type == "COLLISION_STARTED") {
        //         this.canInteract = false;
        //         this.mat.diffuseColor = new BABYLON.Color3(1,0,0);
        //         await delayFunc(this.timeoutMS);
        //         this.fire();
        //     }
        // })
        // this.aggregate.body.getCollisionEndedObservable().add(async(collisionEvent) => {

        //     console.log("Collision End")
        //     await delayFunc(this.timeoutMS);
        //     this.canInteract = true;
        //     this.mat.diffuseColor = new BABYLON.Color3(1,0,1)

        // })



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
        console.log("Trigger",this.trigger);
        if (this.trigger) this.trigger.fire();
    }
    endInteract() {

    }

}