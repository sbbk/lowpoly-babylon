import { SceneViewer } from "../babylon/sceneViewer";
import { GameObject, iGameComponent } from "../components/GameObject";
import { Prefab } from "../data/prefabs/CreatePrefab";
import * as BABYLON from "@babylonjs/core"
import { delayFunc } from "../utility/utilities";

export type eventType = "USE" | "SPAWN" | "KILL" | "ENABLE" | "DISABLE"
export type triggerTypes = "Component" | "Spawn"

export interface EventTrigger {

    type: eventType;
    fire: () => void;

}

export namespace EventHandler {

    export class ComponentEventTrigger implements EventTrigger {

        type: eventType;
        targetComponent: iGameComponent;

        constructor(type: eventType,targetID:string) {
            this.type = type;
            let gameObject = SceneViewer.findGameObjectByUID(targetID);
            this.targetComponent = gameObject.activeComponent;
        }

        fire() {

            switch (this.type) {
                case "USE":
                    this.targetComponent.interact();
                    break;
                case "ENABLE":
                    this.targetComponent.canInteract = true;
                    break;
                case "DISABLE":
                    this.targetComponent.canInteract = false;
                    break;
                case "KILL":
                    this.targetComponent.destroy();
                    break;
                case "SPAWN":
                    this.targetComponent.renderToScene();
                    break;
            }
        }

    }
    export class SpawnEventTrigger implements EventTrigger {

        type: eventType = "SPAWN";
        prefabID: number;
        position: number[];
        rotation: number[];
        scale: number[];
        delay: number //
        amount: number;
        delayFunc = delayFunc

        constructor(prefabID: number,
            position: number[],
            rotation: number[],
            scale: number[],
            delay: number,
            amount: number,
            ) {
            this.prefabID = prefabID; this.position = position; this.rotation = rotation; this.scale = scale; this.delay = delay;
            this.amount = amount;
        }

        async fire() {
            for (let i=0; i < this.amount; i++) {
                Prefab.CreatePrefab(this.prefabID, this.position, this.rotation, this.scale);
                await this.delayFunc(3000);
            }
        }
    }
}