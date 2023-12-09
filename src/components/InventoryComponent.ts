import { SceneViewer } from "../babylon/sceneViewer";
import { Entity } from "./Entity";

export class pInventorySlot {

    name: string;
    item?: Entity;
    visual: HTMLElement;
    itemIcon: HTMLImageElement;

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

    addItem(item: Entity) {
        this.item = item;
        if (this.item.icon) {
            this.itemIcon.src = this.item.icon;
        }
        else {
            this.itemIcon.src = new URL('../media/images/thumb.png', import.meta.url).pathname
        }
    }
    removeItem() {

        this.item = null;
        this.itemIcon.src = "";

    }

}

export class pInventory {

    // owner: Add Player Class Later
    max: number = 10;
    amount: number = 0;
    inventoryVisual: HTMLElement;
    items: pInventorySlot[];

    constructor() {
        this.items = [];
        this.inventoryVisual = document.createElement('div');
        this.inventoryVisual.classList.add('pInventory');
        document.body.prepend(this.inventoryVisual)
        for (let i = 0; i < this.max; i++) {

            let slot = new pInventorySlot();
            this.inventoryVisual.appendChild(slot.visual);
            this.items.push(slot);

        }
    }

    add(item: Entity) {

        if (this.amount >= this.max) return
        else {
            console.log("Adding item..", item);
            let nextSlot = this.items[this.amount];
            nextSlot.addItem(item);
            this.amount += 1;
            if (item.getComponent("Collectable").mesh) {
                // console.log(item.getComponent("Collectable").mesh);
                // let clone = item.getComponent("Collectable").mesh.clone();
                // SceneViewer.scene.addMesh(clone);
                // clone.isPickable = false;
                // clone.layerMask = 4;

                // // Animate
                // let animation = new BABYLON.Animation("rotationAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                // let keys = []; keys.push({ frame: 0, value: 0 }); keys.push({ frame: 30, value: Math.PI }); keys.push({ frame: 60, value: 2 * Math.PI });
                // animation.setKeys(keys);
                // clone.animations.push(animation);
                // SceneViewer.scene.beginAnimation(clone,0,60,true);

                // let UICamera = new BABYLON.FreeCamera('ui-cam',SceneViewer.camera.position);
                // // var itemCamera = new BABYLON.FreeCamera("item-camera", new BABYLON.Vector3(0, 0, 0), SceneViewer.scene)

                // var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, SceneViewer.scene);
                // var text = new GUI.TextBlock(); 
                // text.text = `Found ${item.getComponent("Collectable").mesh.name}`; advancedTexture.addControl(text);

                // let colorTable = new URL('../babylon/lut-posterized.png',import.meta.url).pathname;
                // let colorCorrectionProcess = new BABYLON.ColorCorrectionPostProcess("color-correction",colorTable,1.0,UICamera);

                // UICamera.layerMask = 4;
                // UICamera.target = SceneViewer.camera.target;
                // SceneViewer.camera.setEnabled(false);
                // UICamera.setEnabled(true);
                // SceneViewer.scene.setActiveCameraById(UICamera.id);
                // let scaling = SceneViewer.engine.getHardwareScalingLevel();
                // SceneViewer.engine.setHardwareScalingLevel(4);
                // clone.position = UICamera.position.add(UICamera.getForwardRay().direction.scale(5));

                // setTimeout(() => {
                //     clone.dispose();
                //     SceneViewer.scene.setActiveCameraById(SceneViewer.camera.id);
                //     UICamera.dispose();
                //     advancedTexture.dispose();
                //     text.dispose();
                //     SceneViewer.engine.setHardwareScalingLevel(scaling);
                //     colorCorrectionProcess.dispose();

                // }, 1000);
                SceneViewer.scene.removeMesh(item.mesh, true)
            }
            console.log(this.items);
        }
    }

    remove(index: number) {

        console.log("Removing..", index);
        console.log("Item", this.items[index].item)


        if (!this.items[index].item) return;
        this.items[index].item.getComponent("Collectable").renderToScene(SceneViewer.player.mesh.position.clone());
        this.items[index].removeItem();
        this.amount -= 1;


    }

    use() {

    }

    init() {

    }
    enable() {

    }
    disable() {
        
    }
    update() {

    }

}
