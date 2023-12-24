import { useLevelEditorStore } from "../stores/LevelEditorStore";
import { BaseEntity, Entity, findEntityParent } from "../components/Entity";
import { SceneViewer } from "./sceneViewer";
import * as BABYLON from "@babylonjs/core"

export class InteractionManager {

    pointerLock: boolean;
    PointerObservableFunction: BABYLON.Observer<BABYLON.PointerInfo>
    KeyObserverFunction: BABYLON.Observer<BABYLON.KeyboardInfo>
    RegisterBeforeRenderFunction: BABYLON.Observer<BABYLON.Scene>;
    gridSize: number = 0.5;
    selectedGridPosition: BABYLON.Vector3;
    movingEntity: BaseEntity;
    isMovingEntity: boolean;
    meshClone: BABYLON.Mesh;
    shiftHeld: boolean;
    rotationValue: number = Math.PI / 12;

    // We're doing everything in here for now until the structure is figured out.
    calculateClosestGridPosition(node: BaseEntity, pickedPoint: BABYLON.Vector3) {
        let snappedX = Math.round(pickedPoint.x / this.gridSize) * this.gridSize
        let snappedY = Math.round(pickedPoint.y / this.gridSize) * this.gridSize
        let snappedZ = Math.round(pickedPoint.z / this.gridSize) * this.gridSize
        // Use the node's Y value.
        return new BABYLON.Vector3(snappedX, node.getAbsolutePosition().y, snappedZ);
    }

    registerPlayerPointers() {
        let playerActions = SceneViewer.scene.onPointerObservable.add((pointerInfo, event) => {

            switch (pointerInfo.type) {

                case BABYLON.PointerEventTypes.POINTERDOWN:

                    // Always fire?
                    SceneViewer.player.weaponController.equippedWeapon.fire(SceneViewer.player);

                    if (SceneViewer.player.currentTarget == null || !SceneViewer.player.currentTarget) {
                        return;
                    }
                    // Cancel out if we already have something active.. prevent stacking.
                    if (SceneViewer.activeComponent) return;

                    // If there's something to interact with continue..
                    if (SceneViewer.player.currentTarget !== null || SceneViewer.player.currentTarget !== undefined) {

                        // // Return if we can't interact right now.
                        if (!SceneViewer.player.currentTarget.activeComponent.canInteract) return;
                        SceneViewer.activeComponent = SceneViewer.player.currentTarget.activeComponent;
                    }

                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    if (SceneViewer.activeComponent) {
                        SceneViewer.player.weaponController.equippedWeapon.stopFire();
                    }
                    SceneViewer.activeComponent = null;
                    break;
            }


        })
        this.PointerObservableFunction = playerActions;
    }

    registerBuildPointers() {

        let buildKeys = SceneViewer.scene.onKeyboardObservable.add(async (kbInfo) => {

            if (kbInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
                switch (kbInfo.event.key) {
                    case "r":
                        if (this.movingEntity) {
                            this.movingEntity.rotate(BABYLON.Axis.Y, this.rotationValue, BABYLON.Space.WORLD);
                        };
                        break;
                    case "q":
                        if (this.movingEntity) {
                            let currentPos = this.movingEntity.getAbsolutePosition();
                            this.movingEntity.setAbsolutePosition(new BABYLON.Vector3(currentPos.x,currentPos.y - this.gridSize,currentPos.z))
                        };
                        break;
                    case "w":
                        if (this.movingEntity) {
                            let currentPos = this.movingEntity.getAbsolutePosition();
                            this.movingEntity.setAbsolutePosition(new BABYLON.Vector3(currentPos.x,currentPos.y + this.gridSize,currentPos.z))
                        };
                        break;
                }
            }
        })

        let buildActions = SceneViewer.scene.onPointerObservable.add((pointerInfo, event) => {

            let bubbleParent = (mesh) => {
                while (mesh.parent !== null) {
                    mesh = mesh.parent;
                }
                return mesh;
            }

            switch (pointerInfo.type) {

                case BABYLON.PointerEventTypes.POINTERTAP:
                    if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
                        // TODO: Move these
                        switch (pointerInfo.event.button) {
                            case 0: // Left
                                break;
                            case 1: // Middle
                                break;
                            case 2: // Right
                                console.log("Tap Right..")
                                var pickedMesh = pointerInfo.pickInfo.pickedMesh;
                                let foundParent = bubbleParent(pickedMesh) as BaseEntity;
                                if (foundParent instanceof BABYLON.Mesh) return;
                                SceneViewer.positionGizmo.attachedNode = null;
                                SceneViewer.scaleGizmo.attachedNode = null
                                SceneViewer.rotationGizmo.attachedNode = null
                                SceneViewer.positionGizmo.attachedNode = foundParent;
                                SceneViewer.scaleGizmo.attachedNode = foundParent;
                                SceneViewer.rotationGizmo.attachedNode = foundParent;
                                const useLevelEditor = useLevelEditorStore();
                                useLevelEditor.selectEntity(foundParent);
                                console.log("Hit P Tap")

                                let gameObjectSelected = new CustomEvent("BuildMode:EntitySelected", { detail: { id: foundParent.uid } })
                                document.dispatchEvent(gameObjectSelected);
                                break;
                        }
                    }
                    else {
                        SceneViewer.positionGizmo.attachedNode = null;
                        SceneViewer.scaleGizmo.attachedNode = null
                        SceneViewer.rotationGizmo.attachedNode = null
                    }
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    switch (pointerInfo.event.button) {
                        case 0: // Left
                            if (this.meshClone) {
                                this.meshClone.dispose()
                            }
                            if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
                                var pickedMesh = pointerInfo.pickInfo.pickedMesh;
                                let foundParent = bubbleParent(pickedMesh) as BaseEntity;
                                if (!foundParent) return;
                                if (foundParent instanceof BABYLON.Mesh) return;
                                this.movingEntity = foundParent;
                                let mesh = foundParent.mesh;
                                // if (mesh) {
                                //     this.meshClone = mesh.clone('picked-clone', foundParent) as BABYLON.Mesh
                                //     this.meshClone.isPickable = false;
                                //     let children = this.meshClone.getChildMeshes();
                                //     children.forEach(child => {
                                //         child.isPickable = false;
                                //     })
                                //     mesh.setEnabled(false);
                                // }
                                mesh.isPickable = false;
                                let children = mesh.getChildMeshes();
                                children.forEach(child => {
                                    child.isPickable = false;
                                })
                                this.isMovingEntity = true;
                                SceneViewer.camera.detachControl();
                                console.log("Hit P Down")
                            }
                            break;
                    }
                    break;
                case BABYLON.PointerEventTypes.POINTERMOVE:
                    if (!this.movingEntity) return;
                    if (this.isMovingEntity) {
                        var pickResult = SceneViewer.scene.pick(SceneViewer.scene.pointerX, SceneViewer.scene.pointerY);
                        let snappedPos = this.calculateClosestGridPosition(this.movingEntity, pickResult.pickedPoint);
                        this.movingEntity.setAbsolutePosition(snappedPos);
                    }
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    switch (pointerInfo.event.button) {
                        case 0: // Left

                            if (this.meshClone) {
                                this.meshClone.dispose()
                            }
                            if (this.movingEntity) {
                                let mesh = this.movingEntity.mesh;
                                mesh.isPickable = true;
                                let children = mesh.getChildMeshes();
                                children.forEach(child => {
                                    child.isPickable = true;
                                })
                            }
                            if (this.isMovingEntity) {
                                if (this.movingEntity !== null) {
                                    let closestGrid = this.calculateClosestGridPosition(this.movingEntity, pointerInfo.pickInfo.pickedPoint);
                                    this.movingEntity.setAbsolutePosition(closestGrid);
                                }
                                this.isMovingEntity = false;

                            }
                            SceneViewer.camera.attachControl()
                            break;
                    }
                    break;
            }
        })

        this.PointerObservableFunction = buildActions;
        this.KeyObserverFunction = buildKeys
    }

    registerBuildBeforeRenderFunction() {

        let renderLoop = SceneViewer.scene.onBeforeRenderObservable.add(() => {
            let bubbleParent = (mesh) => {
                while (mesh.parent !== null) {
                    mesh = mesh.parent;
                }
                return mesh;
            }

            // Clear highlights
            SceneViewer.highlightLayer.removeAllMeshes();

            SceneViewer.player.pointer.position = SceneViewer.camera.getTarget();
            let target = SceneViewer.camera.getTarget(); let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position, target); ray.length = 100;
            let hit = SceneViewer.scene.pickWithRay(ray);

            if (hit.pickedMesh) {

                let mesh = hit.pickedMesh as BABYLON.Mesh;
                let distance = BABYLON.Vector3.Distance(SceneViewer.camera.position, hit.pickedPoint);

                // We're not even within highlight distance.
                if (distance > SceneViewer.highlightDistance)
                    return;

                // Look for a parent game object.
                let foundParent = bubbleParent(mesh);
                if (foundParent) {
                    let gameObject = foundParent as Entity;
                }
            }
        })

        this.RegisterBeforeRenderFunction = renderLoop

    }

    registerPlayerBeforeRenderFunction() {
        let renderLoop = SceneViewer.scene.onBeforeRenderObservable.add(() => {

            // Clear highlights
            SceneViewer.highlightLayer.removeAllMeshes();

            SceneViewer.player.pointer.position = SceneViewer.camera.getTarget();
            let target = SceneViewer.camera.getTarget(); let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position, target); ray.length = 100;
            let hit = SceneViewer.scene.pickWithRay(ray);

            if (hit.pickedMesh) {
                let mesh = hit.pickedMesh as BABYLON.Mesh;
                let distance = BABYLON.Vector3.Distance(SceneViewer.camera.globalPosition, hit.pickedPoint);
                // We're not even within highlight distance.
                if (distance > SceneViewer.highlightDistance)
                return;
                // Look for a parent game object.
                let foundParent = findEntityParent(mesh);
                if (foundParent) {
                    console.log("Found Parent",foundParent);
                    let gameObject = foundParent as BaseEntity;
                    if (!gameObject || !gameObject.activeComponent) return;
                    // Are we allowed to interact?
                    if (gameObject.activeComponent.canInteract == false) return;
                    // TODO: THIS ALL NEEDS TO FUCKING GO. Stop being lazy.
                    // Arbitrary for now but check against types of game objects to see if they're of an interactable type.
                    if (gameObject.activeComponent.type == "Interactable" ||
                        gameObject.activeComponent.type == "Collectable" ||
                        gameObject.activeComponent.type == "Talkable" ||
                        gameObject.activeComponent.type == "Synth" ||
                        gameObject.activeComponent.type == "Physics" ||
                        gameObject.activeComponent.type == "SocketString" ||
                        gameObject.activeComponent.type == "Door" ||
                        gameObject.activeComponent.type == "Button" ||
                        gameObject.activeComponent.type == "PlayerAudioLoop" ||
                        gameObject.activeComponent.type == "Valve" ||
                        gameObject.activeComponent.type == "OneLineConversation"
                    ) {

                        if (!mesh.parent) return;
                        let meshes = mesh.parent.getChildMeshes();
                        // Highlight all the meshes in the game object.
                        // SceneViewer.highlightLayer.isEnabled = true;
                        // meshes.forEach(mesh => {
                        //     if (mesh.name == "collider") return;
                        //     SceneViewer.highlightLayer.addMesh(mesh, new BABYLON.Color3(1, 1, 0));
                        // })

                        // Add the billboard tag.
                        SceneViewer.tagBillBoard.linkWithMesh(meshes[0], gameObject.activeComponent);
                        // TODO : WORK THESE WITH NEW 3D HANDS
                        if (BABYLON.Vector3.Distance(SceneViewer.camera.position, hit.pickedPoint) < SceneViewer.interactDistance) {
                            SceneViewer.player.currentTarget = gameObject;
                            // switch(gameObject.activeComponent.type) {
                            //     case "Collectable":
                            //         // SceneViewer.player.handController.setHandMode(HandMode.grab,0);
                            //         break;
                            //     case "Talkable":
                            //         // SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                            //         SceneViewer.player.currentTarget = gameObject;
                            //         break;
                            //     case "Synth":
                            //         // SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                            //         SceneViewer.player.currentTarget = gameObject
                            //         break;
                            //     case "Physics":
                            //         // SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                            //         SceneViewer.player.currentTarget = gameObject
                            //         break;
                            //     case "Door":
                            //         // SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                            //         SceneViewer.player.currentTarget = gameObject
                            //         break;
                            //     default:
                            //         // SceneViewer.player.handController.setHandMode(HandMode.grab,0);
                            //         SceneViewer.player.currentTarget = gameObject;
                            //         break;

                            // }
                        }
                        else {
                            // SceneViewer.player.handController.setHandMode(HandMode.idle,0);
                            SceneViewer.player.currentTarget = null;
                        }


                    }
                }

            }
            if (!hit.pickedMesh) {

                SceneViewer.player.currentTarget = null;
                SceneViewer.tagBillBoard.setVisible(false);

                // SceneViewer.player.handController.setHandMode(HandMode.idle,0,false);
                if (SceneViewer.highlightedMeshes.length > 0) {
                    SceneViewer.highlightedMeshes.forEach(mesh => {
                        SceneViewer.highlightLayer.removeMesh(mesh);
                    })
                }
                SceneViewer.highlightLayer.isEnabled = false;
            }
        });
        this.RegisterBeforeRenderFunction = renderLoop
    }

    disablePointerLock(value: boolean) {

        if (value == true) {
            this.pointerLock = true;
            document.exitPointerLock();
        }
        else if (value == false) {
            this.pointerLock = false;
            //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (SceneViewer.GameMode == "Play" && this.pointerLock == false) {
                SceneViewer.canvas.requestPointerLock = SceneViewer.canvas.requestPointerLock || SceneViewer.canvas.msRequestPointerLock || SceneViewer.canvas.mozRequestPointerLock || SceneViewer.canvas.webkitRequestPointerLock;
                if (SceneViewer.canvas.requestPointerLock) {
                    SceneViewer.canvas.requestPointerLock();
                }
            }
        }
    }

    constructor() {
        var isLocked = false;
        this.pointerLock = false;
        // On click event, request pointer lock
        SceneViewer.scene.onPointerDown = async () => {
            //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (!isLocked && SceneViewer.GameMode == "Play" && this.pointerLock == false) {
                SceneViewer.canvas.requestPointerLock = SceneViewer.canvas.requestPointerLock || SceneViewer.canvas.msRequestPointerLock || SceneViewer.canvas.mozRequestPointerLock || SceneViewer.canvas.webkitRequestPointerLock;
                if (SceneViewer.canvas.requestPointerLock) {
                    SceneViewer.canvas.requestPointerLock();
                }
            }
        }
    }

}