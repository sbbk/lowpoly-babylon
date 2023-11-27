import { delayFunc } from "../utility/utilities";
import { Player } from "../player/Player";
import * as BABYLON from "@babylonjs/core";
import { SceneViewer } from "../babylon/sceneViewer";
import { ModelLoader } from "../media/models/modelImporter";
import { KeyboardShortcuts } from "../babylon/configs/keybindings";
import { GameObject } from "../components/GameObject";
import { PhysicsComponent } from "../components/PhysicsComponents";
import { v4 as uuidv4 } from 'uuid';
import { CollectableComponent } from "../components/CollectableComponent";
import { ConversationComponent } from "../components/ConversationComponent";

export interface iBaseWeapon {

    fire:(whoFired:Player) => void;
    stopFire:() => void;
    reload:() => Promise<void>;
    onHit:() => void;
    onUnequip:() => void;
    drop:() => void;
    name:string
    UID:string;
    projectile:BABYLON.Mesh;
    physicsAggregate: BABYLON.PhysicsAggregate;
    reloadTime:number;
    velocity:number;
    spread:number;
    chargeTime:number;
    currentAmmo:number;
    maxAmmo:number;
    canBeDropped:boolean;
    clipSize:number;
    damage:number;
    mesh:BABYLON.Mesh

}

export class BaseWeapon implements iBaseWeapon{
    UID: string;
    name: string;
    canBeDropped: boolean;
    projectile:BABYLON.Mesh;
    animations:BABYLON.AnimationGroup[];
    physicsAggregate:BABYLON.PhysicsAggregate;
    playingAnimation:BABYLON.AnimationGroup;
    reloadTime:number;
    velocity:number;
    spread:number;
    chargeTime:number;
    currentAmmo:number;
    maxAmmo:number;
    clipSize:number;
    damage:number;
    mesh:BABYLON.Mesh
    transformNode:GameObject;
    innerMesh:BABYLON.Mesh;

    constructor() {
        this.canBeDropped = true;
    }

    fire(whoFired:Player) {}
    stopFire() {

    }

    async reload() {

        // Play anim..
        await delayFunc(this.reloadTime);
        this.currentAmmo = this.clipSize;

    }
    onHit() {

    }
    onEquip() {

    }
    onUnequip() {}
    drop() {
        this.stopPlayingAnimation();
        let matrix = this.mesh.getWorldMatrix();
        var scale = new BABYLON.Vector3();
        var quatRotation = new BABYLON.Quaternion();
        var position = new BABYLON.Vector3();
        let decompose = matrix.decompose(scale,quatRotation,position);
        this.transformNode.parent = null;
        this.mesh.setAbsolutePosition(position);
        this.mesh.rotationQuaternion = quatRotation;
        this.physicsAggregate = new BABYLON.PhysicsAggregate(this.mesh,BABYLON.PhysicsShapeType.BOX,{mass:10},SceneViewer.scene);
        this.physicsAggregate.body.disablePreStep = false;
        SceneViewer.physicsViewer.showBody(this.physicsAggregate.body);
        let childMeshes = this.mesh.getChildMeshes();
        let collectable = new CollectableComponent('collect-weapon',"Collectable",this.transformNode);
        this.transformNode.addComponent(collectable);
        this.transformNode.setActiveComponent(collectable);
        collectable.canInteract = true;
        this.mesh.isPickable = true;
        childMeshes.forEach(mesh => {
            mesh.renderingGroupId = 0;
            mesh.isPickable = true;
        })
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

}

export class FlareGun extends BaseWeapon {

    declare canBeDropped: boolean;
    declare physicsAggregate: BABYLON.PhysicsAggregate;
    declare mesh:BABYLON.Mesh;
    declare animations:BABYLON.AnimationGroup[];
    constructor() {
        super()
        this.canBeDropped = true;
    }
    stopFire() {

    }
    reload:() => Promise<void>;
    onHit:() => void;
    onEquip:() => void;
    onUnequip() {

    }

    async init() {
        let container = await ModelLoader.AppendGltfContainer("FlareGun",SceneViewer.scene) as BABYLON.AssetContainer;
        this.mesh = new BABYLON.Mesh('d')
        this.transformNode = new GameObject("FlareGun","FlareGun",SceneViewer.scene,this.mesh,false,uuidv4());
        let collection = new BABYLON.Mesh('collection');
        collection.parent = this.mesh;
        let meshes = container.meshes;
        meshes.forEach(mesh => {
            collection.addChild(mesh);
        })

        let childMeshes = this.mesh.getChildMeshes();
        let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
        let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
    
        for(let i=0; i<childMeshes.length; i++){
            let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
            let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;
    
            min = BABYLON.Vector3.Minimize(min, meshMin);
            max = BABYLON.Vector3.Maximize(max, meshMax);
        }

        let width = max.subtract(min);
        this.mesh.scaling = width;
        this.mesh.setBoundingInfo(new BABYLON.BoundingInfo(min, max));
        this.animations = container.animationGroups;
        this.animations.forEach(animation => {
            animation.enableBlending = true;
            animation.stop();
        })
        this.transformNode.parent = SceneViewer.player.camera;
        this.mesh.scaling = new BABYLON.Vector3(0.005,0.005,0.005);
        this.mesh.isPickable = false;
        this.mesh.renderingGroupId = 3;
        this.mesh.checkCollisions = false;
        childMeshes.forEach(child => {
            child.renderingGroupId = 3;
            child.isPickable = false;
            child.checkCollisions = false;
        })
        this.mesh.position.z = 3;
        this.mesh.position.y = -0.5;
        this.mesh.position.x = 1;
        this.mesh.rotation.y = -Math.PI / 1.7;
        this.mesh.rotation.z = 0.09;
        // this.mesh.setEnabled(false);

    }

}

export class Hand extends BaseWeapon {
    declare name: string;
    declare canBeDropped: boolean;
    declare physicsAggregate: BABYLON.PhysicsAggregate;
    declare mesh:BABYLON.Mesh;
    declare animations:BABYLON.AnimationGroup[];
    constructor() {
        super();
        this.canBeDropped = false;
    }
    
    fire(whoFired:Player) {
        console.log("Fire",SceneViewer.activeComponent);
        if (SceneViewer.activeComponent) {
            SceneViewer.activeComponent.interact(whoFired)
        }
        this.playAnimation(0,false);
    }
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
    onUnequip() {
        this.stopPlayingAnimation();
    }

    async init() {
        let container = await ModelLoader.AppendGltfContainer("Knife",SceneViewer.scene) as BABYLON.AssetContainer
        this.mesh = new BABYLON.Mesh('d')
        this.transformNode = new GameObject("FlareGun","FlareGun",SceneViewer.scene,this.mesh,false,uuidv4());
        let collection = new BABYLON.Mesh('collection');
        collection.parent = this.mesh;
        let meshes = container.meshes;
        meshes.forEach(mesh => {
            collection.addChild(mesh);
        })

        let childMeshes = this.mesh.getChildMeshes();
        let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
        let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
    
        for(let i=0; i<childMeshes.length; i++){
            let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
            let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;
    
            min = BABYLON.Vector3.Minimize(min, meshMin);
            max = BABYLON.Vector3.Maximize(max, meshMax);
        }

        let width = max.subtract(min);
        this.mesh.scaling = width;
        this.mesh.setBoundingInfo(new BABYLON.BoundingInfo(min, max));
        this.animations = container.animationGroups;
        this.animations.forEach(animation => {
            animation.enableBlending = true;
            animation.stop();
        })
        this.transformNode.parent = SceneViewer.player.camera;
        this.mesh.scaling = new BABYLON.Vector3(0.005,0.005,0.005);
        this.mesh.isPickable = false;
        this.mesh.renderingGroupId = 3;
        this.mesh.checkCollisions = false;
        childMeshes.forEach(child => {
            child.renderingGroupId = 3;
            child.isPickable = false;
            child.checkCollisions = false;
        })
        this.mesh.scaling = new BABYLON.Vector3(4,4,4);
        this.mesh.renderingGroupId = 3;
        let children = this.mesh.getChildMeshes();
        children.forEach(child => {
            child.renderingGroupId = 3;
        })
        this.mesh.position.z = 1;
        this.mesh.position.y = -6;
        this.mesh.setEnabled(false);
        this.playAnimation(1,true);
    }

}

export class WeaponController {

    player:Player;
    equippedWeapon:iBaseWeapon;
    availableWeapons:iBaseWeapon[];

    constructor() {
        this.init();
    }

    async init() {
        let flareGun = new FlareGun();
        let hand = new Hand();
        this.createKeyBindings();
        await hand.init();
        await flareGun.init();
        this.availableWeapons = [hand,flareGun];
        this.availableWeapons.forEach(weapon => {
            weapon.mesh.setEnabled(false);
        })
        this.equip(0);

    }

    dropWeapon(index:number) {

        if (!this.equippedWeapon.canBeDropped) return;
        this.equippedWeapon.drop();
        this.equippedWeapon = null;
        this.availableWeapons.splice(index,1);

    }

    fire() {
        console.log("Fire weapon")
        this.equippedWeapon.fire(this.player);

    }
    equip(index:number) {

        if (!this.availableWeapons[index]) return;
        if (this.equippedWeapon) {
            this.equippedWeapon.onUnequip();
            this.equippedWeapon.mesh.setEnabled(false);
        }
        this.equippedWeapon = this.availableWeapons[index];
        this.equippedWeapon.mesh.setEnabled(true);

    }
    reload() {

        this.equippedWeapon.reload();

    }

    createKeyBindings() {
        SceneViewer.scene.onKeyboardObservable.add(async (kbInfo) => {
                
            if(kbInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN) {

                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon0) {
                    if (!this.availableWeapons[0]) return;
                    this.equip(0);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon1) {
                    if (!this.availableWeapons[0]) return;
                    this.equip(1);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon2) {
                    if (!this.availableWeapons[0]) return;
                    this.equip(2);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon3) {
                    if (!this.availableWeapons[0]) return;
                    this.equip(3);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.Weapon4) {
                    if (!this.availableWeapons[0]) return;
                    this.equip(4);
                }
                if (kbInfo.event.key == KeyboardShortcuts.Weapons.DropCurrent) {
                    this.dropWeapon(this.availableWeapons.indexOf(this.equippedWeapon));
                }
            }    
        })

    }
}