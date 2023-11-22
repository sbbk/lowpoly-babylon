import { SceneViewer } from "../babylon/sceneViewer";
import { GameObject, iGameComponent } from "../components/GameObject";
import { Prefab } from "../data/prefabs/CreatePrefab";
import * as BABYLON from "@babylonjs/core"
import { delayFunc } from "../utility/utilities";

export type eventType = "USE" | "SPAWN" | "KILL" | "ENABLE" | "DISABLE" | "TOGGLE" | "TOGGLETOFROM"
export type triggerTypes = "Component" | "Spawn"

export interface EventTrigger {

    type: eventType;
    fire: () => void;

}

export namespace EventHandler {

    export class ComponentEventTrigger implements EventTrigger {

        type: eventType;
        targetComponent: iGameComponent;
        timer?:number;

        constructor(type: eventType,targetID:string,timer?:number) {
            this.type = type;
            let gameObject = SceneViewer.findGameObjectByUID(targetID);
            this.targetComponent = gameObject.activeComponent;
            if (timer) this.timer = timer;
            else {this.timer = 1000}
        }

        async fire() {

            switch (this.type) {
                case "USE":
                    this.targetComponent.interact();
                    break;
                case "ENABLE":
                    this.targetComponent.enable();
                    break;
                case "TOGGLE":
                    switch(this.targetComponent.enabled) {
                        case true:
                            this.targetComponent.disable();
                            break;
                        case false:
                            this.targetComponent.enable();
                            break;
                    }
                    break;
                case "TOGGLETOFROM":
                    switch(this.targetComponent.enabled) {
                    case true:
                        this.targetComponent.disable();
                        await delayFunc(this.timer);
                        this.targetComponent.enable();
                        break;
                    case false:
                        this.targetComponent.enable();
                        await delayFunc(this.timer);
                        this.targetComponent.disable();
                        break;
                }
                break;
                case "DISABLE":
                    this.targetComponent.disable();
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
        offset:number = 0.5;
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
                await this.delayFunc(3000);
                this.position[1] += this.offset
                Prefab.CreatePrefab(this.prefabID, this.position, this.rotation, this.scale);
            }
        }
    }
}