import * as BABYLON from "@babylonjs/core"
import { GameObject } from "../components/GameObject";
import { HandController } from "./HandController";

export class Player {

    scene:BABYLON.Scene;
    camera:BABYLON.FreeCamera;
    heroMesh:BABYLON.Mesh;
    heroPhysicsAgregate:BABYLON.PhysicsAggregate;
    pointer:BABYLON.Mesh;
    pickupZone:BABYLON.Mesh;
    currentTarget:GameObject = null;
    handController:HandController;
    activeQuests:number[] = [];
    constructor(scene:BABYLON.Scene) {
        this.scene = scene;
        this.camera = new BABYLON.FreeCamera('main',new BABYLON.Vector3(6,3,6));
        //this.camera.position = new BABYLON.Vector3(42.775998054306555,5.231532323582747, 40.643488638043486);
        this.camera.minZ = 0.45;
        this.camera.speed = 0.6;
        this.camera.angularSensibility = 9000;
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;
        this.camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
        this.camera.attachControl();

        // Debugs
        window["offset"] = this.camera.ellipsoidOffset;
        window["gravity"] = this.camera.applyGravity;
        window["collisions"] = this.camera.checkCollisions;
        window["pSpeed"] = this.camera.speed;

        // Hands
        this.handController = new HandController();

        // Define Bindings.
        this.camera.keysUp.push(87);
        this.camera.keysLeft.push(65);
        this.camera.keysDown.push(83);
        this.camera.keysRight.push(68)

        // Jump
        document.onkeydown = (e) => {

            if (e.code === "Space") this.camera.cameraDirection.y += 1;

        };

        // Hero mesh.
        // this.heroMesh = BABYLON.Mesh.CreateBox('hero', 2.0, SceneViewer.scene, false, BABYLON.Mesh.FRONTSIDE);
        // this.heroMesh.isPickable = false;
        // this.heroMesh.position.x = 0.0;
        // this.heroMesh.position.y = 1.0;
        // this.heroMesh.position.z = 0.0;
        // this.heroPhysicsAgregate = new BABYLON.PhysicsAggregate(SceneViewer.heroMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, SceneViewer.scene);
        // this.camera.parent = this.heroMesh;

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

        

    }

}