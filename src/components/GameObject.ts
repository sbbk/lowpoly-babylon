import * as BABYLON from "@babylonjs/core"
export type GameObjectType = "Interactable" | "Static" | "Collectable"
export type ComponentType = ImageComponent ;
import { SceneViewer } from "../babylon/sceneViewer";

export class pInventory {

    // owner: Add Player Class Later
    max:number = 10;
    items:GameObject[] = [];

    add(item:GameObject) {

        if (this.items.length - 1 > this.max)
        return
        else {
            console.log("Adding item..",item);
            this.items.push(item);
            item.mesh.dispose();
            // Remove from scene..
            if (item.component.mesh) {
                console.log(item.component.mesh);
                item.mesh.dispose()
            }
            console.log(this.items);
        }

    }

    drop(index:number) {

        let droppedItem = this.items.splice(index,1);

    }

    use() {

    }

    init() {

    }
    update() {

    }

}

export interface iGameComponent {

    name:string;
    icon?:string;
    mesh?:BABYLON.Mesh;
    init:() => void;
    use:() => void;
    destroy:() => void;

}

export class CollectableComponent implements iGameComponent {

    name:string = "Collectable";
    canCollect:boolean = true;
    mesh?:BABYLON.Mesh;
    gameObject:GameObject;

    constructor(name:string,gameObject:GameObject) {
        this.gameObject = gameObject
        this.mesh = gameObject.mesh as BABYLON.Mesh;
        this.name = name;
    }

    init() {

    }
    use () {

        if (this.canCollect) {
            SceneViewer.inventory.add(this.gameObject)
        }

    }
    destroy() {

    }
    renderToScene() {

        if (this.mesh) {

            this.gameObject.getScene().addMesh(this.mesh);
            this.mesh.position = new BABYLON.Vector3(1,2,1)
            // Debugging for now we are assuming all objects are simple meshes.

        }

    }


}

export class ImageComponent implements iGameComponent {

    name:string = "Image";
    images:string[];
    activeUI:HTMLImageElement;

    constructor(images:string[]) {
        this.images = images;
    }

    init() {

    }

    use() {

        this.activeUI = document.createElement('img') as HTMLImageElement;
        this.activeUI.src =this.images[0];
        this.activeUI.style.position = "fixed";
        this.activeUI.style.zIndex = "100";
        this.activeUI.style.top = "0";
        this.activeUI.style.left = "0";
        this.activeUI.style.width = "300px"
        this.activeUI.addEventListener('click',() => {
            this.destroy();
        })
        document.body.prepend(this.activeUI);

    }
    destroy() {

        this.activeUI.remove();

    }

}

export class GameObject extends BABYLON.TransformNode {

    mesh: BABYLON.Mesh | BABYLON.AbstractMesh;
    icon?:string;
    physicsAggregate: BABYLON.PhysicsAggregate;
    type: GameObjectType;
    component: iGameComponent;
    use:() => void = () => {

    }

    constructor(name,scene,mesh,type:GameObjectType) {
        super(name, scene)
        this.mesh = mesh;
        this.mesh.parent = this;
        this.type = type;
    }

    loadMesh() {

    }
    destroyMesh() {

    }

    addComponent(component:iGameComponent) {

        this.component = component;
        component.init();

    }

    setPosition(position:BABYLON.Vector3) {

        this.position = position;

    }

    bubbleParent(mesh: BABYLON.Node): BABYLON.Node {

        while (mesh.parent !== null) {
            mesh = mesh.parent;
        }
        return mesh;
    }

}   