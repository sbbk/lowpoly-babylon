import { v4 as uuidv4 } from 'uuid';
const quests = require("./quests.json")
import * as BABYLON from "@babylonjs/core"
import { SceneViewer } from '../babylon/sceneViewer';
import { GameObject } from './GameObject';


export namespace Prefab {

    export class CollectableItem {

        constructor() {

        }

    }

}

export namespace QuestSystem {

    export type QuestType = "Collect" | "Defeat";

    export class QuestManager {

        assignQuest(questId:number) {
            if (SceneViewer.player.activeQuests.indexOf(questId) == -1) {
                console.log("Quest Assigned!")
                SceneViewer.player.activeQuests.push(questId);
                let quest = quests[questId];
                switch(quest.type) {

                    case "Collect":
                        let newQuest = new QuestSystem.CollectQuest(quest.name,quest.itemID,quest.total);
                        SceneViewer.scene.rootNodes.forEach(node => {
                            if (node.id) {
                                if (node.id == quest.itemID) {
                                    
                                    let gameObjectNode = node as GameObject;
                                    let UICamera = new BABYLON.FreeCamera('ui-cam',new BABYLON.Vector3(gameObjectNode.mesh.getAbsolutePosition().x -1,gameObjectNode.mesh.getAbsolutePosition().y,gameObjectNode.mesh.getAbsolutePosition().z));
                                    UICamera.target = gameObjectNode.position;
                                    UICamera.layerMask = 4;
                                    UICamera.target = gameObjectNode.mesh.position;
                                    SceneViewer.camera.setEnabled(false);
                                    UICamera.setEnabled(true);
                                    SceneViewer.scene.setActiveCameraById(UICamera.id);
                                    debugger;
                                    setTimeout(() => {
                                        SceneViewer.scene.setActiveCameraById(SceneViewer.camera.id);
                                        UICamera.dispose();
                                    }, 1000);
                                    return;
                                }
                            }
                        })
                        break;
                }
  
            }
            else {
                console.warn("Quest already added.")
            }
        }

        constructor() {
            document.addEventListener("QuestSystem:AssignCollectQuest",(e:CustomEvent) => {
                this.assignQuest(e.detail.data)
            })

        }

    }

    export class Quest {

        id:string;
        name:string;
        description:string;
        active:boolean;
        complete:boolean;

        constructor() {
            this.id = uuidv4();
        }


    }

    // export class QuestGiver implements GameObject {

    // }

    export class CollectQuest extends Quest {

        itemId:string;
        name:string;
        total:number;
        currentAmount:number; 

        constructor(name:string,itemId,total) {
            super();
            this.name = name;
            this.itemId = itemId;
            this.currentAmount = 0;
            this.total = total;
            console.log("Quest Added!, Collect Quest..",this.name)

            document.addEventListener("ItemCollected", (e:CustomEvent) => {

                let itemId = e.detail.id;
                console.log("Collected Item..",itemId);
                this.checkCollectedItem(itemId);

            });       
            // document.dispatchEvent(myEvent);

        }

        checkCollectedItem(id:string) {

            if (id == this.itemId) {
                console.log("Found quest item..");
                this.currentAmount++;
                if (this.currentAmount == this.total) {
                    console.log("Quest Complete")
                }
            }

        }

    }

    export class QuestItem {



    }

}