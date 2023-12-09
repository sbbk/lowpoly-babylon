import { SceneViewer } from "../babylon/sceneViewer";
import * as BABYLON from "@babylonjs/core"
import { GameComponentType, Entity, iGameComponent } from "./Entity";
import { v4 as uuidv4 } from 'uuid';
import { Player } from "../player/Player";
import { WeaponType } from "../weapons/WeaponController";
export enum CollectableType {
    WEAPON = "WEAPON",
    ITEM = "ITEM"
}
export class CollectableComponent implements iGameComponent {

    name: string = "Collectable";
    uid:string;
    id: string;
    type: GameComponentType;
    canCollect: boolean = true;
    canInteract: boolean = true;
    collectableType:CollectableType
    mesh?: BABYLON.Mesh;
    gameObject: Entity;
    enabled:boolean = true;
    physicsAggregate?:BABYLON.PhysicsAggregate;

    constructor(name: string, type: GameComponentType, gameObject: Entity,collectableType:CollectableType,uid:string) {
        this.id = uuidv4()
        this.uid = uid;
        this.gameObject = gameObject
        this.collectableType = collectableType;
        this.mesh = gameObject.mesh as BABYLON.Mesh;
        this.name = name;
        this.type = type;
        this.physicsAggregate = new BABYLON.PhysicsAggregate(this.mesh,BABYLON.PhysicsShapeType.BOX,{mass:10},SceneViewer.scene);
        this.physicsAggregate.body.disablePreStep = false;
        SceneViewer.physicsViewer.showBody(this.physicsAggregate.body);
        this.mesh.isPickable = true;
        let childMeshes = this.mesh.getChildMeshes();
        childMeshes.forEach(mesh => {
            mesh.renderingGroupId = 0;
            mesh.isPickable = true;
        })
    }

    init() {

    }
    interact(whoFired?:Player) {

        if (whoFired == null) whoFired = SceneViewer.player;
        if (!this.canCollect) return;
        this.canInteract = false;
        switch (this.collectableType) {
            case CollectableType.WEAPON:
                let weaponType = this.uid as WeaponType
                let weaponController = whoFired.weaponController;
                weaponController.pickupWeapon(weaponType);
                if (this.physicsAggregate) {
                    SceneViewer.physicsViewer.hideBody(this.physicsAggregate.body);
                    this.physicsAggregate.body.dispose();
                    this.mesh.dispose();
                    break;
                }
                this.canInteract = true;
            case CollectableType.ITEM:
                SceneViewer.inventory.add(this.gameObject);
                const collectEvent = new CustomEvent("ItemCollected", { detail: { id: this.gameObject.id } })
                document.dispatchEvent(collectEvent);
                break;
        }


    }
    endInteract() { 

        console.log("End interact")

    }

    destroy() {

    }
    enable() {

    }
    disable() {
        
    }
    renderToScene(position?: BABYLON.Vector3) {

        if (this.mesh) {

            this.gameObject.getScene().addMesh(this.mesh);
            if (!position) {
                this.mesh.position = new BABYLON.Vector3(1, 2, 1)
            }
            else {
                this.mesh.position = position;
            }
            // Debugging for now we are assuming all objects are simple meshes.

        }

    }

}