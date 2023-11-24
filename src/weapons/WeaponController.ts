import { delayFunc } from "../utility/utilities";
import { Player } from "../player/Player";
import * as BABYLON from "@babylonjs/core";
import { SceneViewer } from "../babylon/sceneViewer";
import { ModelLoader } from "../media/models/modelImporter";
import { Scene } from "babylonjs";
import { KeyboardShortcuts } from "../babylon/configs/keybindings";

export interface iBaseWeapon {

    fire:() => void;
    stopFire:() => void;
    reload:() => Promise<void>;
    onHit:() => void;
    onUnequip:() => void;
    projectile:BABYLON.Mesh;
    reloadTime:number;
    velocity:number;
    spread:number;
    chargeTime:number;
    currentAmmo:number;
    maxAmmo:number;
    clipSize:number;
    damage:number;
    mesh:BABYLON.Mesh

}

export class BaseWeapon implements iBaseWeapon {

    fire() {
        SceneViewer.camera.getTarget();
        // Create new projectile
        // Apply impulse


    }
    stopFire:() => void;

    async reload() {

        // Play anim..
        await delayFunc(this.reloadTime);
        this.currentAmmo = this.clipSize;

    }
    onHit:() => void;
    onEquip:() => void;
    onUnequip:() => void;
    projectile:BABYLON.Mesh;
    reloadTime:number;
    velocity:number;
    spread:number;
    chargeTime:number;
    currentAmmo:number;
    maxAmmo:number;
    clipSize:number;
    damage:number;
    mesh:BABYLON.Mesh

}

export class FlareGun implements BaseWeapon {

    fire() {

    }
    stopFire:() => void;
    reload:() => Promise<void>;
    onHit:() => void;
    onEquip() {

    }
    onUnequip() {
        
    };
    projectile:BABYLON.Mesh;
    reloadTime:number;
    velocity:number;
    spread:number;
    chargeTime:number;
    currentAmmo:number;
    maxAmmo:number;
    clipSize:number;
    damage:number;
    mesh:BABYLON.Mesh

    constructor() {

    }
    async init() {
        this.mesh = await ModelLoader.AppendModel("FlareGun",SceneViewer.scene) as BABYLON.Mesh;
        this.mesh.parent = SceneViewer.camera;
        this.mesh.scaling = new BABYLON.Vector3(0.005,0.005,0.005);
        this.mesh.isPickable = false;
        this.mesh.renderingGroupId = 3;
        let children = this.mesh.getChildMeshes();
        children.forEach(child => {
            child.renderingGroupId = 3;
        })
        this.mesh.position.z = 4;
        this.mesh.position.y = -2;
        this.mesh.position.x = 0.5;
        this.mesh.rotation.y = -Math.PI / 2;
        this.mesh.setEnabled(false);
    }

}

export class Hand implements BaseWeapon {

    fire() {
        console.log("Fire",SceneViewer.activeComponent);
        if (SceneViewer.activeComponent) {
            SceneViewer.activeComponent.interact()
        }
        this.playAnimation(0,false);
    };
    stopFire() {
        console.log("Stop",SceneViewer.activeComponent);
        if (SceneViewer.activeComponent) {
            SceneViewer.activeComponent.endInteract();
        }
        this.playAnimation(1,true)
        // SceneViewer.activeComponent = null;
    }
    reload:() => Promise<void>;
    onHit:() => void;
    onEquip() {
    }
    playAnimation(index:number,loop:boolean) {
        if (!this.animations[index]) return;
        this.animations[index].play(loop);
        this.playingAnimation = this.animations[index];
    }
    stopPlayingAnimation() {
        if (!this.playingAnimation) return;
        this.playingAnimation.stop();
        this.playingAnimation = null
    }
    onUnequip() {
        this.stopPlayingAnimation();
    }
    projectile:BABYLON.Mesh;
    reloadTime:number;
    velocity:number;
    spread:number;
    chargeTime:number;
    currentAmmo:number;
    maxAmmo:number;
    clipSize:number;
    damage:number;
    mesh:BABYLON.Mesh;
    animations:BABYLON.AnimationGroup[];
    playingAnimation:BABYLON.AnimationGroup;

    constructor() {

    }

    async init() {
        let container = await ModelLoader.AppendGltfContainer("Knife",SceneViewer.scene) as BABYLON.AssetContainer;
        let meshContainer = new BABYLON.Mesh("GltfContainer");
        for (let mesh of container.meshes) {
            meshContainer.addChild(mesh);
        }
        this.mesh = meshContainer;
        this.mesh.parent = SceneViewer.camera;
        this.animations = container.animationGroups;
        this.animations.forEach(animation => {
            animation.enableBlending = true;
            animation.stop();
        })
        this.playAnimation(1,true)
        this.mesh.scaling = new BABYLON.Vector3(4,4,4);
        this.mesh.renderingGroupId = 3;
        let children = this.mesh.getChildMeshes();
        children.forEach(child => {
            child.renderingGroupId = 3;
        })
        this.mesh.position.z = 2;
        this.mesh.position.y = -12;
        this.mesh.setEnabled(false);
    }

}

export class WeaponController {

    player:Player;
    equippedWeapon:iBaseWeapon;
    avaiableWeapons:iBaseWeapon[];

    constructor() {
        this.init();
    }

    async init() {
        let flareGun = new FlareGun();
        let hand = new Hand();
        this.createKeyBindings();
        await hand.init();
        await flareGun.init();
        this.avaiableWeapons = [hand,flareGun];
        this.equip(0);

    }

    fire() {
        console.log("Fire weapon")
        this.equippedWeapon.fire();

    }
    equip(index:number) {

        if (this.equippedWeapon) {
            this.equippedWeapon.onUnequip();
            this.equippedWeapon.mesh.setEnabled(false);
        }
        this.equippedWeapon = this.avaiableWeapons[index];
        this.equippedWeapon.mesh.setEnabled(true);

    }
    reload() {

        this.equippedWeapon.reload();

    }

    createKeyBindings() {
        SceneViewer.scene.onKeyboardObservable.add(async (kbInfo) => {
                
            if(kbInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN) {

                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon0) {
                    if (!this.avaiableWeapons[0]) return;
                    this.equip(0);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon1) {
                    if (!this.avaiableWeapons[0]) return;
                    this.equip(1);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon2) {
                    if (!this.avaiableWeapons[0]) return;
                    this.equip(2);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon3) {
                    if (!this.avaiableWeapons[0]) return;
                    this.equip(3);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon4) {
                    if (!this.avaiableWeapons[0]) return;
                    this.equip(4);
                }
            }    
        })

    }
}