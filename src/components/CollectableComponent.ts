import { SceneViewer } from "../babylon/sceneViewer";
import * as BABYLON from "@babylonjs/core"
import { GameComponentType, GameObject, iGameComponent } from "./GameObject";
import { v4 as uuidv4 } from 'uuid';

export class CollectableComponent implements iGameComponent {

    name: string = "Collectable";
    id: string;
    type: GameComponentType;
    canCollect: boolean = true;
    canInteract: boolean = true;
    mesh?: BABYLON.Mesh;
    gameObject: GameObject;
    enabled:boolean = true;

    constructor(name: string, type: GameComponentType, gameObject: GameObject) {
        this.id = uuidv4()
        this.gameObject = gameObject
        this.mesh = gameObject.mesh as BABYLON.Mesh;
        this.name = name;
        this.type = type;
    }

    init() {

    }
    interact() {

        if (this.canCollect) {
            SceneViewer.inventory.add(this.gameObject);
            const collectEvent = new CustomEvent("ItemCollected", { detail: { id: this.gameObject.id } })
            document.dispatchEvent(collectEvent);
        }

    }
    endInteract() { }

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