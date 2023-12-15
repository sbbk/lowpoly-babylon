import { Entity, findEntityByUID, iGameComponent } from "../components/Entity";
import { Prefab } from "../data/prefabs/CreatePrefab";
import { delayFunc } from "../utility/utilities";

export namespace EventHandler {

    export interface iComponentEventArgs {
        min:number,
        max:number,
        current:number,
        update:boolean,
    }
    
    export interface EventTrigger {
    
        type: eventType;
        fire: (args?:iComponentEventArgs) => void;
        setParentComponent: (component:iGameComponent) => iGameComponent;
    }
    
    export enum eventType{
        USE = "USE",
        SPAWN = "SPAWN",
        KILL = "KILL",
        ENABLE = "ENABLE",
        DISABLE = "DISABLE",
        TOGGLE = "TOGGLE",
        TOGGLETOFROM = "TOGGLETOFROM",
        UESWITHARGS = "USEWITHARGS" }
        export type triggerTypes = "Component" | "Spawn"
    
    export class ComponentEventTrigger implements EventTrigger {

        type: eventType;
        targetEntity:Entity
        parentComponent:iGameComponent;
        targetComponent: iGameComponent;
        timer?:number;
        enabled:boolean;


        constructor(type: eventType,timer?:number) {

            this.type = type;
            this.targetComponent = null;
            this.enabled = true;
            if (timer) this.timer = timer;
            else {this.timer = 1000}
        }

        setParentComponent(component:iGameComponent) {
            this.parentComponent = component;
            return this.parentComponent
        }
        setTargetComponent(component:iGameComponent) {
            this.targetComponent = component;
        }
        setTargetEntity(gameObjectId:string) {
            this.targetEntity = findEntityByUID(gameObjectId);
            // Set active as default.
            this.setTargetComponent(this.targetEntity.activeComponent);
        }

        async fire(args?:iComponentEventArgs) {
            if (!this.targetEntity) {
                console.warn("No Target ENTITY for Trigger");
                return;
            }
            if (!this.targetComponent) {
                console.warn("No Target COMPONENT for Trigger");
                return;
            };
            switch (this.type) {
                case eventType.USE:
                    this.targetComponent.interact();
                    break;
                case eventType.UESWITHARGS:
                    this.targetComponent.interact(args);
                    break;
                case eventType.ENABLE:
                    this.targetComponent.enable();
                    break;
                case eventType.TOGGLE:
                    switch(this.targetComponent.enabled) {
                        case true:
                            console.log("Disable")
                            this.targetComponent.disable();
                            break;
                        case false:
                            console.log("Enable")
                            this.targetComponent.enable();
                            break;
                    }
                    break;
                case eventType.TOGGLETOFROM:
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
                case eventType.DISABLE:
                    this.targetComponent.disable();
                    break;
                case eventType.KILL:
                    this.targetComponent.destroy();
                    break;
                case eventType.SPAWN:
                    this.targetComponent.renderToScene();
                    break;
            }
        }

    }
    export class SpawnEventTrigger implements EventTrigger {

        type: eventType = eventType.SPAWN;
        parentComponent:iGameComponent;
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

        setParentComponent(component:iGameComponent) {
            this.parentComponent = component;
            return this.parentComponent;
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