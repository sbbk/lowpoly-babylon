import * as BABYLON from "@babylonjs/core"
import { Entity } from "../components/Entity";
import { HandController } from "./HandController";
import { WeaponController } from "../weapons/WeaponController";
import { SceneViewer } from "../babylon/sceneViewer";

export class Player extends Entity {

    scene:BABYLON.Scene;
    camera:BABYLON.FreeCamera;
    pointer:BABYLON.Mesh;
    pickupZone:BABYLON.Mesh;
    currentTarget:Entity = null;
    handController:HandController;
    activeQuests:number[] = [];
    weaponController:WeaponController;
    target:BABYLON.Vector3;
    cameraRoll: number;
    rolling:boolean;
    constructor(id,name,scene:BABYLON.Scene,mesh,interactable,uid) {
        super(id,name,scene,mesh,interactable,uid);
        this.id = id;
        this.name = name;
        this.scene = scene;
        this.mesh = mesh;
        this.interactable = interactable;
        this.uid = uid;
        this.camera = new BABYLON.FreeCamera('main',new BABYLON.Vector3(6,3,6));
        this.camera.minZ = 0.1;
        this.camera.speed = 0.6;
        this.camera.angularSensibility = 9000;
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;
        this.camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
        this.cameraRoll = 1;
        this.camera.attachControl();

        // Debugs
        window["offset"] = this.camera.ellipsoidOffset;
        window["gravity"] = this.camera.applyGravity;
        window["collisions"] = this.camera.checkCollisions;
        window["pSpeed"] = this.camera.speed;
        window["cameraRoll"] = this.cameraRoll;

        // Hands
        // this.handController = new HandController();

        // Define Bindings.
        this.camera.keysUp.push(87);
        this.camera.keysLeft.push(65);
        this.camera.keysDown.push(83);
        this.camera.keysRight.push(68)

        let rollLeftAnimation = new BABYLON.Animation("camera-roll-left", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let rollLeft = [];
        rollLeft.push({
            frame: 0,
            value: 0
        });
        rollLeft.push({
            frame: 30,
            value: this.cameraRoll
        });
        this.camera.animations.push(rollLeftAnimation);
        rollLeftAnimation.setKeys(rollLeft);

        let rollRightAnimation = new BABYLON.Animation("camera-roll-right", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let rollRight = [];
        rollRight.push({
            frame: 0,
            value: 0
        });
        rollRight.push({
            frame: 30,
            value: -this.cameraRoll
        });
        this.camera.animations.push(rollRightAnimation);
        rollRightAnimation.setKeys(rollRight);

        // Jump
        // document.onkeydown = (e) => {

        //     console.log(e.code);
        //     if (e.code === "Space") this.camera.cameraDirection.y += 1;
        //     if (e.code === "KeyA") {
        //         if (this.rolling) return;
        //         this.rolling = true;
        //         SceneViewer.scene.beginDirectAnimation(this.camera,[rollLeftAnimation],0,30,false);
        //     }
        //     if (e.code === "KeyD") {
        //         if (this.rolling) return;
        //         this.rolling = true;
        //         SceneViewer.scene.beginDirectAnimation(this.camera,[rollRightAnimation],0,30,false);
        //     }

        // };
        // document.onkeyup = (e) => {
        //     if (e.code === "KeyA") {
        //         let frame = 30;
        //         let animation = rollRightAnimation.runtimeAnimations[0];
        //         if (animation) {
        //             frame = Math.floor(animation.animation.runtimeAnimations[0].currentFrame);
        //         }
        //         SceneViewer.scene.stopAnimation(this.camera);
        //         SceneViewer.scene.beginDirectAnimation(this.camera,[rollLeftAnimation],frame,0,false);
        //         this.rolling = false;
        //     }
        //     if (e.code === "KeyD") {
        //         let frame = 30;
        //         let animation = rollRightAnimation.runtimeAnimations[0];
        //         if (animation) {
        //             frame = Math.floor(animation.animation.runtimeAnimations[0].currentFrame);
        //         }
        //         SceneViewer.scene.stopAnimation(this.camera);
        //         SceneViewer.scene.beginDirectAnimation(this.camera,[rollRightAnimation],frame,0,false);
        //         this.rolling = false;
        //     }
        // }

        // Hero mesh.
        this.mesh.isPickable = false;
        this.mesh.parent = this.camera;

        this.pickupZone = BABYLON.MeshBuilder.CreateSphere('pickup');
        let pickupmat = new BABYLON.StandardMaterial('pmat');
        pickupmat.diffuseColor = new BABYLON.Color3(1,0,0);
        this.pickupZone.material = pickupmat;
        this.pickupZone.parent = this.camera;
        this.pickupZone.position.z = 3;
        this.pickupZone.position.y = 0;
        this.pickupZone.position.x = 0;
        this.pickupZone.visibility = 0;
        this.pickupZone.isPickable = false;

        this.pointer = BABYLON.Mesh.CreateSphere("Sphere", 16.0, 0.01, this.scene, false, BABYLON.Mesh.DOUBLESIDE);
        // move the sphere upward 1/2 of its height
        this.pointer.position.x = 0.0;
        this.pointer.position.y = 0.0;
        this.pointer.position.z = 0.0;
        this.pointer.isPickable = false;
        this.weaponController = new WeaponController();
        

    }

}