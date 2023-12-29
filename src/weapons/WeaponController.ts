import { delayFunc } from "../utility/utilities";
import { Player } from "../player/Player";
import * as BABYLON from "@babylonjs/core";
import { SceneViewer } from "../babylon/sceneViewer";
import { ModelLoader } from "../media/models/modelImporter";
import { KeyboardShortcuts } from "../babylon/configs/keybindings";
import { BaseEntity, Entity, findEntityParent } from "../components/Entity";
import { v4 as uuidv4 } from 'uuid';
import { CollectableComponent, CollectableType } from "../components/CollectableComponent";
import { Crosshairs } from "../player/HUD";

export enum WeaponType {

    HANDS = "HANDS",
    AK47 = "AK47"

}

export interface iBaseWeapon {

    fire:(whoFired:Player) => void;
    stopFire:() => void;
    reload:() => Promise<void>;
    onHit:() => void;
    onUnequip:() => void;
    drop:(weaponType:WeaponType) => void;
    name:string
    UID:string;
    weaponType:WeaponType;
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
    mesh:BABYLON.Mesh;
    initialRotation:BABYLON.Quaternion

}

export class BaseWeapon implements iBaseWeapon{
    UID: string;
    name: string;
    canBeDropped: boolean;
    projectile:BABYLON.Mesh;
    animations:BABYLON.AnimationGroup[];
    range:number = 40;
    weaponType:WeaponType;
    physicsAggregate:BABYLON.PhysicsAggregate;
    playingAnimation:BABYLON.AnimationGroup;
    reloadTime:number;
    velocity:number;
    spread:number;
    chargeTime:number;
    currentAmmo:number;
    maxAmmo:number;
    clipSize:number;
    damage:number = 10;
    mesh:BABYLON.Mesh
    transformNode:Entity;
    innerMesh:BABYLON.Mesh;
    initialRotation:BABYLON.Quaternion;

    constructor(weaponType:WeaponType) {
        this.canBeDropped = true;
        this.weaponType = weaponType;
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
    setInitialRotation() {
        var rotation = this.mesh.rotation.clone(); // get the mesh's rotation
        var quaternion = BABYLON.Quaternion.FromEulerAngles(rotation.x, rotation.y, rotation.z); // get the quaternion
        this.mesh.rotationQuaternion = null;
        this.mesh.rotationQuaternion = quaternion; 
        this.initialRotation = quaternion;
    }

    onUnequip() {}
    drop(weaponType:WeaponType) {
        this.stopPlayingAnimation();
        let matrix = this.mesh.getWorldMatrix();
        var scale = new BABYLON.Vector3();
        var quatRotation = new BABYLON.Quaternion();
        var position = new BABYLON.Vector3();
        let decompose = matrix.decompose(scale,quatRotation,position);
        this.transformNode.parent = null;
        this.mesh.setAbsolutePosition(position);
        this.mesh.rotationQuaternion = quatRotation;

        let collectable = new CollectableComponent('collect-weapon',"Collectable",this.transformNode,CollectableType.WEAPON,weaponType);
        collectable.canInteract = true;

        this.transformNode.addComponent(collectable);
        this.transformNode.setActiveComponent(collectable);
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

export class WeaponAK47 extends BaseWeapon {

    declare canBeDropped: boolean;
    declare physicsAggregate: BABYLON.PhysicsAggregate;
    declare mesh:BABYLON.Mesh;
    declare animations:BABYLON.AnimationGroup[];
    fireAnimation:BABYLON.Animation;
    constructor() {
        super(WeaponType.AK47)
        this.canBeDropped = true;
    }
    stopFire() {

    }
    reload:() => Promise<void>;
    onHit:() => void;
    onEquip:() => void;
    onUnequip() {

    }
    fire(whoFired:Player) {

        let target = SceneViewer.camera.getTarget(); 
        let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position, target); ray.length = 100;
        class Projectile {
            private sprite: BABYLON.Sprite;
            private hitSprite: BABYLON.Sprite;

            constructor(private startPosition: BABYLON.Vector3, private targetPosition: BABYLON.Vector3) {
                this.createSprite();
                this.createHitSprite();
                this.fire();
            }

            private createSprite() {
                // Create the sprite for the projectile
                let projectileSprite = new URL("../media/images/sprites/damage/damage-10.png",import.meta.url).pathname
                const spriteManager = new BABYLON.SpriteManager('projectileSpriteManager', projectileSprite, 1, 32, SceneViewer.scene);
                this.sprite = new BABYLON.Sprite('projectile', spriteManager);
                this.sprite.position = this.startPosition;
                this.sprite.size = 0.5;
            }

            private createHitSprite() {
                // Create the sprite for the hit effect
                let hitSprite = new URL("../media/images/sprites/damage/damage-20.png",import.meta.url).pathname
                const hitSpriteManager = new BABYLON.SpriteManager('hitSpriteManager', hitSprite, 1, 32, SceneViewer.scene);
                this.hitSprite = new BABYLON.Sprite('hitEffect', hitSpriteManager);
                this.hitSprite.isVisible = false;
                this.hitSprite.size = 1;
            }

            private fire() {
                // Get the direction from the camera's rotation
                const direction = new BABYLON.Vector3(
                    Math.sin(SceneViewer.player.camera.rotation.y) * Math.cos(SceneViewer.player.camera.rotation.x),
                    Math.sin(SceneViewer.player.camera.rotation.x),
                    Math.cos(SceneViewer.player.camera.rotation.y) * Math.cos(SceneViewer.player.camera.rotation.x)
                );
            
                // Set the speed of the projectile
                const speed = 2;
            
                // Set the distance limit
                const distanceLimit = 10;
            
                // Create a new function to move the sprite
                const moveSprite = () => {
                    // Update the sprite's position
                    this.sprite.position.addInPlace(direction.scale(speed));
                    // Check if the sprite has reached the distance limit
                    if (BABYLON.Vector3.Distance(this.startPosition, this.sprite.position) > distanceLimit) {
                        // Stop moving the sprite and destroy it
                        SceneViewer.scene.unregisterBeforeRender(moveSprite);
                        this.sprite.dispose();
                        return;
                    }
            
                    // Check if the sprite has hit something
                    let ray = new BABYLON.Ray(this.startPosition, direction, speed);
                    let hit = SceneViewer.scene.pickWithRay(ray, (mesh) => mesh.isPickable);
                    if (hit && hit.hit) {
                        // Stop moving the sprite
                        SceneViewer.scene.unregisterBeforeRender(moveSprite);
            
                        // Show the hit effect
                        this.hitSprite.position = hit.pickedPoint;
                        this.hitSprite.isVisible = true;
            
                        // Hide the projectile sprite
                        this.sprite.isVisible = false;
                    }
                };
            
                // Register the function
                SceneViewer.scene.registerBeforeRender(moveSprite);
            }

            private showHitEffect(position: BABYLON.Vector3) {
                // Set the position of the hit effect sprite
                this.hitSprite.position = position;
                this.hitSprite.isVisible = true;

                // Play the hit effect animation
                const animation = new BABYLON.Animation('hitEffectAnimation', 'size', 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                const keys = [];
                keys.push({ frame: 0, value: 1 });
                keys.push({ frame: 60, value: 0 });
                animation.setKeys(keys);
                this.hitSprite.animations = [animation];
                SceneViewer.scene.beginAnimation(this.hitSprite, 0, 60, false, 1, () => {
                    // Animation completed, hide the hit effect
                    this.hitSprite.isVisible = false;

                });
            }
        }

        // Usage:
        let hit = SceneViewer.scene.pickWithRay(ray);
        const projectile = new Projectile(this.mesh.getAbsolutePosition().clone(), hit.pickedPoint);
        // let rayHelper = new BABYLON.RayHelper(ray)
        // rayHelper.show(SceneViewer.scene, new BABYLON.Color3(0,1,0));
        // setTimeout(() => {
        //     rayHelper.dispose();
        // }, 1000);
        SceneViewer.player.target = hit.pickedPoint;
        SceneViewer.scene.beginAnimation(this.mesh,0,30);
        if (hit.pickedMesh) {
            let mesh = hit.pickedMesh as BABYLON.Mesh;
            let distance = BABYLON.Vector3.Distance(SceneViewer.camera.globalPosition, hit.pickedPoint);
            // We're not even within highlight distance.
            if (distance > this.range)
            return;
            // Look for a parent game object.
            let foundParent = findEntityParent(mesh);
            if (foundParent instanceof BaseEntity) {
                // Do Damage
                foundParent.currentHitPoints -= this.damage;
                SceneViewer.HUDManager.setVisible(Crosshairs.Hit,70);
                foundParent.takeDamage(hit.pickedPoint,this.damage);
                console.log(`Done ${this.damage} damage. Hit Points for ${foundParent.name} is now ${foundParent.currentHitPoints}`);
                if (foundParent.currentHitPoints <= 0) {
                    foundParent.destroy();
                }
            }
        }        
    }

    addEasingAnimations(mesh:BABYLON.Mesh) {
    }

    async init() {
        let container = await ModelLoader.AppendGltfContainer("AK47",SceneViewer.scene) as BABYLON.AssetContainer;
        let uuid = uuidv4();
        this.mesh = container.meshes[0] as BABYLON.Mesh;
        this.transformNode = new Entity("WeaponAK47-",`tf-flare-${uuid}`,SceneViewer.scene,this.mesh,false,uuidv4());
        this.addEasingAnimations(this.mesh);
        this.animations = container.animationGroups;
        this.animations.forEach(animation => {
            animation.enableBlending = true;
            animation.stop();
        })
        this.transformNode.parent = SceneViewer.player.camera;

        this.mesh.isPickable = false;
        this.mesh.renderingGroupId = 3;
        this.mesh.checkCollisions = false;
        let childMeshes = this.mesh.getChildMeshes();
        childMeshes.forEach(child => {
            child.renderingGroupId = 3;
            child.isPickable = false;
            child.checkCollisions = false;
        })
        this.mesh.position.x = 0.3;
        this.mesh.position.y = -0.2
        this.mesh.position.z = 2;
        // this.mesh.rotation.x = -0.2
        this.mesh.rotation.y = 1.5
        // this.mesh.rotation.z = 1.5
        this.mesh.scaling = new BABYLON.Vector3(1.2,1.2,1.2);
        window["WeaponAK47"] = this.mesh;

        let animation = new BABYLON.Animation("positionAnim", "position.z", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let easingFunction = new BABYLON.QuadraticEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

        // Apply the easing function to both animations
        animation.setEasingFunction(easingFunction);
        var keys = [];
        keys.push({
            frame: 0,
            value: this.mesh.position.z
        });
        keys.push({
            frame: 1,
            value: this.mesh.position.z + -0.2
        });
        keys.push({
            frame: 10,
            value: this.mesh.position.z
        });
        animation.setKeys(keys);
        this.mesh.animations.push(animation);

    }

}

export class Hand extends BaseWeapon {
    declare name: string;
    declare canBeDropped: boolean;
    declare physicsAggregate: BABYLON.PhysicsAggregate;
    declare mesh:BABYLON.Mesh;
    declare animations:BABYLON.AnimationGroup[];
    constructor() {
        super(WeaponType.HANDS);
        this.canBeDropped = false;
    }
    
    fire(whoFired:Player) {
        console.log("Fire",SceneViewer.activeComponent);
        if (SceneViewer.activeComponent) {
            SceneViewer.activeComponent.interact(whoFired)
        }
        // this.playAnimation(0,false);
        this.playAnimation(1,false);
    }
    stopFire() {
        console.log("Stop",SceneViewer.activeComponent);
        if (SceneViewer.activeComponent) {
            SceneViewer.activeComponent.endInteract();
        }
        this.playAnimation(0,true)
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
        let container = await ModelLoader.AppendGltfContainer("Hands",SceneViewer.scene) as BABYLON.AssetContainer
        this.mesh = container.meshes[0] as BABYLON.Mesh;
        this.transformNode = new Entity("Hands","Hands",SceneViewer.scene,this.mesh,false,uuidv4());

        this.animations = container.animationGroups;
        this.animations.forEach(animation => {
            animation.enableBlending = true;
            animation.stop();
        })
        this.animations[0].start(true);
        this.transformNode.parent = SceneViewer.player.camera;
        
        this.mesh.isPickable = false;
        this.mesh.checkCollisions = false;
        this.mesh.renderingGroupId = 3;

        let childMeshes = this.mesh.getChildMeshes();
        childMeshes.forEach(child => {
            child.isPickable = false;
            child.checkCollisions = false;
            child.renderingGroupId = 3;
        })

        this.mesh.position.z = 0.6;
        this.mesh.position.y = -0.2;
        this.mesh.scaling = new BABYLON.Vector3(3,3,3);

        this.mesh.setEnabled(false);
    }

}

export class WeaponController {

    player:Player;
    equippedWeapon:iBaseWeapon;
    availableWeapons:iBaseWeapon[];
    movementXRaw:number = 0;
    movementYRaw:number = 0;
    swayMultiplier:number;
    smooth:number;
    isSwaying:boolean;
    isReturning:boolean;
    returnSpeed:number;

    constructor() {
        this.init();
        this.isSwaying = false;
        this.isReturning = false;
        this.returnSpeed = 0;

        SceneViewer.scene.onPointerObservable.add((pointerInfo, event) => {
            if (this.isReturning) return;
            this.isSwaying = true;
            this.swayMultiplier = 2;
            
            this.smooth = 0.1;
            this.movementXRaw = pointerInfo.event.movementX;
            this.movementYRaw = pointerInfo.event.movementY
            if (!this.equippedWeapon) return;
            if (!this.equippedWeapon.mesh) return;
            let movementX = this.movementXRaw * this.swayMultiplier; // Negate the values
            let movementY = this.movementYRaw * this.swayMultiplier; // Negate the values
            movementX = BABYLON.Scalar.Clamp(movementX, -0.5, 0.5);
            movementY = BABYLON.Scalar.Clamp(movementY, -0.5, 0.5);
            let rotationZ = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, movementY); // Rotate around Z-axis based on Y movement
            let rotationY = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, movementX); // Rotate around Y-axis based on X movement
            let targetRotation;
            targetRotation = this.equippedWeapon.mesh.rotationQuaternion.multiply(rotationZ).multiply(rotationY);
            let delta = SceneViewer.engine.getDeltaTime() / 1000;
            this.equippedWeapon.mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(this.equippedWeapon.mesh.rotationQuaternion, targetRotation, this.smooth * delta);
            this.isSwaying = false;
            setTimeout(() => {
            }, 300);
        })
        
        SceneViewer.scene.onBeforeRenderObservable.add(() => {
            if (!this.equippedWeapon) return;
            if (!this.equippedWeapon.mesh) return;
            if (this.isSwaying == true) return;
            this.isReturning = true;
            let delta = SceneViewer.engine.getDeltaTime() / 1000;
            this.returnSpeed += delta;
            let lerpFactor = this.returnSpeed * 4;
            lerpFactor = BABYLON.Scalar.Clamp(lerpFactor, 0, 1);
            this.equippedWeapon.mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(this.equippedWeapon.mesh.rotationQuaternion, this.equippedWeapon.initialRotation, lerpFactor);
            if (BABYLON.Quaternion.AreClose(this.equippedWeapon.mesh.rotationQuaternion, this.equippedWeapon.initialRotation, 0.01)) {
                this.isReturning = false;
                this.returnSpeed = 0;
            }
        })

    }

    async init() {
        let ak47 = new WeaponAK47()
        let hand = new Hand();
        this.createKeyBindings();
        await hand.init();
        hand.setInitialRotation();
        await ak47.init();
        ak47.setInitialRotation()

        this.availableWeapons = [hand,ak47];
        this.availableWeapons.forEach(weapon => {
            weapon.mesh.setEnabled(false);
        })
        this.equip(0);

    }

    async pickupWeapon(weaponType:WeaponType) {

        for (let weapon of this.availableWeapons) {
            if (weapon.weaponType == weaponType) return;
        }
        let pickedUpWeapon;
        switch(weaponType) {
            case WeaponType.AK47:
                let ak47 = new WeaponAK47();
                ak47.init();
                this.availableWeapons.push(ak47);
                pickedUpWeapon = ak47;
                break;
            case WeaponType.HANDS:
                let hands = new Hand();
                hands.init();
                this.availableWeapons.push(hands);
                pickedUpWeapon = hands;
                break;
        }
        // TODO : This needs to equip the picked up weapon later. But done with messing with this for now.
        this.equip(this.availableWeapons.length -1);
    }

    dropWeapon(index:number) {

        if (!this.equippedWeapon.canBeDropped) return;
        this.equippedWeapon.drop(this.equippedWeapon.weaponType);
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
            this.equippedWeapon.mesh.setEnabled(false);
        }
        this.equippedWeapon = this.availableWeapons[index];
        // TODO : Artificial Delay.. remove this later.
        setTimeout(() => {
            this.equippedWeapon.onUnequip();
            this.equippedWeapon.mesh.setEnabled(true);

        }, 100);

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