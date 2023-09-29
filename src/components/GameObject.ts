import { SceneViewer } from "~/babylon/sceneViewer";

export type GameObjectType = "Interactable" | "Static" | "Collectable"

export class GameObject extends BABYLON.TransformNode {

    mesh:BABYLON.Mesh | BABYLON.AbstractMesh;
    physicsAggregate:SceneViewer.HavokPlugin.physicsAggregate;
    type:GameObjectType;

    constructor(name,scene) {
        super(name,scene)
    }

    loadMesh() {

    }
    destroyMesh() {

    }


}