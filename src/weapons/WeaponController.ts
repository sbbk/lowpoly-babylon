import { delayFunc } from "../utility/utilities";
import { Player } from "../player/Player";
import * as BABYLON from "@babylonjs/core";
import { SceneViewer } from "../babylon/sceneViewer";
import { ModelLoader } from "../media/models/modelImporter";

export interface iBaseWeapon {

    fire:() => void;
    reload:() => Promise<void>;
    onHit:() => void;
    projectile:BABYLON.Mesh;
    reloadTime:number;
    velocity:number;
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
    async reload() {

        // Play anim..
        await delayFunc(this.reloadTime);
        this.currentAmmo = this.clipSize;

    }
    onHit:() => void;
    projectile:BABYLON.Mesh;
    reloadTime:number;
    velocity:number;
    currentAmmo:number;
    maxAmmo:number;
    clipSize:number;
    damage:number;
    mesh:BABYLON.Mesh

}

export class FlareGun implements BaseWeapon {

    fire:() => void;
    reload:() => Promise<void>;
    onHit:() => void;
    projectile:BABYLON.Mesh;
    reloadTime:number;
    velocity:number;
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
        this.mesh.renderingGroupId = 3;
        let children = this.mesh.getChildMeshes();
        children.forEach(child => {
            child.renderingGroupId = 3;
        })
        this.mesh.position.z = 4;
        this.mesh.position.y = -2;
        this.mesh.position.x = 0.5;
        this.mesh.rotation.y = -Math.PI / 2;
        this.mesh.visibility = 0;
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
        await flareGun.init();
        this.avaiableWeapons = [flareGun];
        this.equip(0);

    }

    fire() {

        this.equippedWeapon.fire();

    }
    equip(index:number) {

        if (this.equippedWeapon) {
            this.equippedWeapon.mesh.visibility = 0;
        }
        this.equippedWeapon = this.avaiableWeapons[index];
        this.equippedWeapon.mesh.visibility = 1;

    }
    reload() {

        this.equippedWeapon.reload();

    }

}