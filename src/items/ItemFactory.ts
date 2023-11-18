import { ModelLoader } from "../media/models/modelImporter";
import { SceneViewer } from "../babylon/sceneViewer";
import { CollectableComponent, GameObject, GameComponentType, OneLineConversation, ConversationComponent, PhysicsComponent, SocketStringComponent } from "../components/GameObject";
import * as BABYLON from "@babylonjs/core"

const items = require("../items/items.json");

export namespace ItemFactory {

    export class ItemBuilder {

        
        static async createItem(index:number):Promise<GameObject> {

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
            let gameObject = new GameObject(itemToBuild.id,itemToBuild.name,SceneViewer.scene,mesh,itemToBuild.interactable);

            // Setup Icons
            if (itemToBuild.icon) {
                gameObject.icon = itemToBuild.icon;
            }
            // Iterate and add components.
            itemToBuild.components.forEach(component => {

                let gameComponent;

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

                }

                // Add the found component and set active
                gameObject.addComponent(gameComponent);
                if (component.active == true) {
                    gameObject.setActiveComponent(gameComponent);
                }

            })

            gameObject.setPosition(new BABYLON.Vector3(itemToBuild.position[0],itemToBuild.position[1],itemToBuild.position[2]));
            gameObject.setScale(new BABYLON.Vector3(itemToBuild.scale[0],itemToBuild.scale[1],itemToBuild.scale[2]));
            gameObject.setRotation(new BABYLON.Vector3(itemToBuild.rotation[0],itemToBuild.rotation[1],itemToBuild.rotation[2]))
            // Rotation Later..
            return gameObject;

        }

    }

}