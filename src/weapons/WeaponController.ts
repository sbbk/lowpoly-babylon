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

    fire:() => void;
    stopFire:() => void;
    reload:() => Promise<void>;
    onHit:() => void;
    onUnequip:() => void;
    drop:() => void;
    name:string
    UID:string;
    projectile:BABYLON.Mesh;
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

    fire() {}
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
        this.mesh.showBoundingBox = true;

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
        this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        let pb = this.physicsAggregate.transformNode.getPhysicsBody();
        console.log("PB",pb);
        console.log("Body",this.physicsAggregate.body);
        SceneViewer.physicsViewer.showBody(this.physicsAggregate.body);
        // let gameObject = new GameObject('weapon','weapon',SceneViewer.scene,this.mesh,true);
        // let physicsComponent = new PhysicsComponent("Physics",this.mesh,1);
        // physicsComponent.canInteract = true;
        // gameObject.addComponent(physicsComponent)
        // gameObject.setActiveComponent(physicsComponent);
        // gameObject.activeComponent = physicsComponent
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

        // impostor.body.setTargetTransform(SceneViewer.player.pickupZone.absolutePosition, BABYLON.Quaternion.Identity())
        //this.mesh.setAbsolutePosition(absolutePosition);
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
        this.mesh.showBoundingBox = true;
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

    
        // this.mesh.showBoundingBox = true;


        this.transformNode.parent = SceneViewer.player.pickupZone;
        this.mesh.scaling = new BABYLON.Vector3(0.005,0.005,0.005);
        this.mesh.isPickable = false;
        this.mesh.renderingGroupId = 3;
        this.mesh.checkCollisions = false;
        childMeshes.forEach(child => {
            child.renderingGroupId = 3;
            child.isPickable = false;
            child.checkCollisions = false;
        })
        this.mesh.position.z = 4;
        this.mesh.position.y = -2;
        this.mesh.position.x = 0.5;
        this.mesh.rotation.y = -Math.PI / 2;
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
        this.canBeDropped = true;
    }
    
    fire() {
        console.log("Fire",SceneViewer.activeComponent);
        if (SceneViewer.activeComponent) {
            SceneViewer.activeComponent.interact()
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
        let innerMesh = new BABYLON.Mesh('container-hands');
        this.mesh = new BABYLON.TransformNode('t-node-hands');
        innerMesh.setParent(this.mesh);
        let meshes = container.meshes;
        meshes.forEach(mesh => {
            innerMesh.addChild(mesh);
            // mesh.showBoundingBox = true;
        })
        this.physicsAggregate = new BABYLON.PhysicsAggregate(this.mesh,BABYLON.PhysicsShapeType.BOX,{mass:10},SceneViewer.scene);
        this.physicsAggregate.body.disablePreStep = false;
        this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        SceneViewer.physicsViewer.showBody(this.physicsAggregate.body);
        let pb = this.physicsAggregate.transformNode.getPhysicsBody();
        this.animations = container.animationGroups;
        this.animations.forEach(animation => {
            animation.enableBlending = true;
            animation.stop();
        })

        // this.mesh.parent = SceneViewer.camera;
        // this.playAnimation(1,true)
        this.mesh.scaling = new BABYLON.Vector3(4,4,4);
        this.mesh.renderingGroupId = 3;
        let children = this.mesh.getChildMeshes();
        children.forEach(child => {
            child.renderingGroupId = 3;
        })
        // innerMesh.position.z = 2;
        // innerMesh.position.y = -6;
        this.mesh.setEnabled(false);
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
        console.log("Available",this.availableWeapons)
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
        this.equippedWeapon.fire();

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