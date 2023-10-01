import * as BABYLON from "@babylonjs/core"
export type GameObjectType = "Interactable" | "Static" | "Collectable"
export type ComponentType = ImageComponent ;
import * as GUI from "@babylonjs/gui"
import { SceneViewer } from "../babylon/sceneViewer";

export class pInventorySlot {

    name:string;
    item?:GameObject;
    visual:HTMLElement;
    itemIcon:HTMLImageElement;

    constructor() {
        this.visual = document.createElement('div');
        this.visual.classList.add('pInventory-slot');
        this.itemIcon = document.createElement('img');
        this.visual.appendChild(this.itemIcon);
        this.init();
    }

    init() {
        return this.visual;
    }

    addItem(item:GameObject) {
        this.item = item;
        if (this.item.icon) {
            this.itemIcon.src = this.item.icon;
        }
        else {
            this.itemIcon.src = new URL('../media/images/thumb.png',import.meta.url).pathname
        }
    }
    removeItem() {

        this.item = null;
        this.itemIcon.src = "";

    }

}

export class pInventory {

    // owner: Add Player Class Later
    max:number = 10;
    amount:number = 0;
    inventoryVisual:HTMLElement;
    items:pInventorySlot[];

    constructor() {
        this.items = [];
        this.inventoryVisual = document.createElement('div');
        this.inventoryVisual.classList.add('pInventory');
        document.body.prepend(this.inventoryVisual)
        for (let i=0; i<this.max;i++) {

            let slot = new pInventorySlot();
            this.inventoryVisual.appendChild(slot.visual);
            this.items.push(slot);

        }
    }

    add(item:GameObject) {

        if (this.amount >= this.max)
        return
        else {
            console.log("Adding item..",item);
            let nextSlot = this.items[this.amount];
            nextSlot.addItem(item);
            this.amount += 1;
            if (item.component.mesh) {
                console.log(item.component.mesh);
                let clone = item.component.mesh.clone();
                SceneViewer.scene.addMesh(clone);
                clone.isPickable = false;
                clone.layerMask = 4;

                // Animate
                let animation = new BABYLON.Animation("rotationAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let keys = []; keys.push({ frame: 0, value: 0 }); keys.push({ frame: 30, value: Math.PI }); keys.push({ frame: 60, value: 2 * Math.PI });
                animation.setKeys(keys);
                clone.animations.push(animation);
                SceneViewer.scene.beginAnimation(clone,0,60,true);

                let UICamera = new BABYLON.FreeCamera('ui-cam',SceneViewer.camera.position);
                // var itemCamera = new BABYLON.FreeCamera("item-camera", new BABYLON.Vector3(0, 0, 0), SceneViewer.scene)

                var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, SceneViewer.scene);
                var text = new GUI.TextBlock(); 
                text.text = `Found ${item.component.mesh.name}`; advancedTexture.addControl(text);

                let colorTable = new URL('../babylon/lut-posterized.png',import.meta.url).pathname;
                let colorCorrectionProcess = new BABYLON.ColorCorrectionPostProcess("color-correction",colorTable,1.0,UICamera);

                UICamera.layerMask = 4;
                UICamera.target = SceneViewer.camera.target;
                SceneViewer.camera.setEnabled(false);
                UICamera.setEnabled(true);
                SceneViewer.scene.setActiveCameraById(UICamera.id);
                let scaling = SceneViewer.engine.getHardwareScalingLevel();
                SceneViewer.engine.setHardwareScalingLevel(4);
                clone.position = UICamera.position.add(UICamera.getForwardRay().direction.scale(5));

                setTimeout(() => {
                    clone.dispose();
                    SceneViewer.scene.setActiveCameraById(SceneViewer.camera.id);
                    UICamera.dispose();
                    advancedTexture.dispose();
                    text.dispose();
                    SceneViewer.engine.setHardwareScalingLevel(scaling);
                    colorCorrectionProcess.dispose();

                }, 1000);
                SceneViewer.scene.removeMesh(item.mesh)
            }
            console.log(this.items);
        }
    }

    remove(index:number) {

        console.log("Removing..",index);
        console.log("Item",this.items[index].item)

        if (!this.items[index].item) return;
        this.items[index].item.component.renderToScene(SceneViewer.heroMesh.position.clone());
        this.items[index].removeItem();
        this.amount -= 1;


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
    interact:() => void;
    destroy:() => void;
    renderToScene:(position?:BABYLON.Vector3) => void;

}

export class UsableItem {

    use:() => void;
    unuse:() => void;

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
    interact () {

        if (this.canCollect) {
            SceneViewer.inventory.add(this.gameObject)
        }

    }
    destroy() {

    }
    renderToScene(position?:BABYLON.Vector3) {

        if (this.mesh) {

            this.gameObject.getScene().addMesh(this.mesh);
            if (!position) {
                this.mesh.position = new BABYLON.Vector3(1,2,1)
            }
            else {
                this.mesh.position = position;
            }
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

    interact() {

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
    renderToScene() {

    }

}

export class GameObject extends BABYLON.TransformNode {

    mesh: BABYLON.Mesh | BABYLON.AbstractMesh;
    icon?:string;
    physicsAggregate: BABYLON.PhysicsAggregate;
    type: GameObjectType;
    component: iGameComponent;
    usable?:UsableItem
    interact:() => void = () => {

    }

    constructor(name,scene,mesh,type:GameObjectType) {
        super(name, scene)
        this.mesh = mesh;
        this.mesh.name = name;
        this.mesh.parent = this;
        this.type = type;
    }

    getComponent() {
        return this.component;
    }

    loadMesh() {

    }
    destroyMesh() {

    }

    makeUsable(useFunction:() => void,unUseFunction:() => void) {

        this.usable = new UsableItem();
        this.usable.use = useFunction;
        this.usable.unuse = unUseFunction;

    }

    addComponent(component:iGameComponent) {

        this.component = component;
        component.init();

    }

    setPosition(position:BABYLON.Vector3) {

        this.mesh.setAbsolutePosition(position);

    }

    bubbleParent(mesh: BABYLON.Node): BABYLON.Node {

        while (mesh.parent !== null) {
            mesh = mesh.parent;
        }
        return mesh;
    }

}   