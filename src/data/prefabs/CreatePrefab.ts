import { ModelLoader } from "../../media/models/modelImporter";
import { SceneViewer } from "../../babylon/sceneViewer";
import * as BABYLON from "@babylonjs/core"
import { GameComponentType, GameObject } from "../../components/GameObject";
import { CollectableComponent } from "../../components/CollectableComponent";
import { OneLineConversation } from "../../components/OneLineConversationComponent";
import { ConversationComponent } from "../../components/ConversationComponent";
import { PhysicsComponent } from "../../components/PhysicsComponents";
import { SocketStringComponent } from "../../components/SocketString/SocketString";
import { DoorComponent } from "../../components/DoorComponent";
import { ButtonComponent } from "../../components/ButtonComponent";
import { EventHandler } from "../../triggers/EventTrigger";
import { TriggerVolume } from "../../components/TriggerVolume";

const items = require("../prefabs/prefabs.json");

    export class Prefab {

        static async CreatePrefab(index:number,position?:number[],rotation?:number[],scale?:number[]):Promise<GameObject> {

            let itemToBuild = items[index];
            // let mesh:BABYLON.Mesh;

            // // Setup mesh if available.. fallback.
            // if (itemToBuild.mesh) {
            // }
            // else {
            //     mesh = BABYLON.MeshBuilder.CreateBox(itemToBuild.name);
            // }
            
            let mesh : BABYLON.Mesh;
            if (itemToBuild.mesh) {
               mesh = await ModelLoader.AppendModel(itemToBuild.mesh,SceneViewer.scene) as BABYLON.Mesh
            }
            else {
                mesh = new BABYLON.Mesh('container-mesh');
            }

            // Create Game Object
            // let uid = null
            // console.warn(itemToBuild.name,itemToBuild.uid)
            // if (itemToBuild.uid) {
            //     uid = itemToBuild.uid
            // }
            let gameObject = new GameObject(itemToBuild.id,itemToBuild.name,SceneViewer.scene,mesh,itemToBuild.interactable,itemToBuild.uid);

            // Setup Icons
            if (itemToBuild.icon) {
                gameObject.icon = itemToBuild.icon;
            }
            // Iterate and add components.
            itemToBuild.components.forEach(component => {

                let gameComponent;
                // Create any triggers on the component.
                let triggerEvent = null;
                if (component.trigger) {
                    let trigger = component.trigger
                    switch(trigger.triggerType) {
                        case "Spawn":
                            triggerEvent = new EventHandler.SpawnEventTrigger(trigger.prefabIndex,trigger.position,trigger.rotation,trigger.scale,trigger.delay,trigger.amount)
                            break;
                        case "Component":
                            triggerEvent = new EventHandler.ComponentEventTrigger(trigger.eventType,trigger.targetId,trigger.timer)
                        // TODO : Implement Component Trigger
                    }
                }

                switch(component.name as GameComponentType) {
                    case "Collectable":
                        gameComponent = new CollectableComponent(itemToBuild.name,"Collectable",gameObject);
                        if (component.rotate == true) {
                            window.setInterval(() => {
                                gameObject.mesh.rotation.y += 0.01;
                            },10)
                        }
                        break;
                    case "OneLineConversation":
                        gameComponent = new OneLineConversation(component.conversation,"Talkable",gameObject.mesh);
                        break;
                    case "Talkable":
                        gameComponent = new ConversationComponent(component.conversation,"Talkable",gameObject.mesh);
                        break;
                    case "Physics":
                        gameComponent = new PhysicsComponent("Physics",mesh,1);
                        break;
                    case "SocketString":
                        gameComponent = new SocketStringComponent('SocketString',mesh);
                        break;
                    case "Door":
                        console.log("Component ID",component.id);
                        gameComponent = new DoorComponent("left","slide",mesh,component.id);
                        break;
                    case "Button":
                        gameComponent = new ButtonComponent(triggerEvent,mesh,component.timeout,component.label);
                        break;
                    case "Trigger":
                        console.log("Creating Trigger")
                        gameComponent = new TriggerVolume(triggerEvent,mesh,component.timeout,component.label);
                        break;

                }

                // Add label if there.
                if (component.label) {
                    gameComponent.label = component.label;
                }

                // Add the found component and set active
                gameObject.addComponent(gameComponent);
                if (component.active == true) {
                    gameObject.setActiveComponent(gameComponent);
                }

            })
            let pos = position? position : itemToBuild.position;
            let sca = scale? scale : itemToBuild.scale;
            let rot = rotation? rotation : itemToBuild.rotation;

            gameObject.setAbsolutePosition(new BABYLON.Vector3(pos[0],pos[1],pos[2]));
            gameObject.setScale(new BABYLON.Vector3(sca[0],sca[1],sca[2]));
            gameObject.setRotation(new BABYLON.Vector3(rot[0],rot[1],rot[2]))
            // Rotation Later..
            return gameObject;

        }

    }