<script setup lang="ts">
import { Ref, inject, ref, watch } from 'vue';
import { Observer, PointerInfo, Scene, PointerEventTypes } from "@babylonjs/core"
import { useGameManager } from '../stores/GameManagerStore';
import { Player } from '../player/Player';

const scene = inject('scene') as Ref<Scene>
const player = inject('player') as Ref<Player>

const pointerLock = ref(false);
const PointerObservableFunction = ref(null) as Ref<Observer<PointerInfo> | null>
const RegisterBeforeRenderFunction = ref(null) as Ref<Observer<Scene> | null>;
const gameMode = useGameManager().GameMode;
let activeComponent = useGameManager().activeComponent;
 
function registerPlayerPointers() {
        let playerActions = scene.value.onPointerObservable.add((pointerInfo, event) => {

            switch(pointerInfo.type) {

                case PointerEventTypes.POINTERDOWN:
                    if (player.value.currentTarget == null || !player.value.currentTarget) {
                        return;
                    }
                    // Cancel out if we already have something active.. prevent stacking.
                    if (activeComponent) return;

                    // If there's something to interact with continue..
                    if (player.value.currentTarget !== null || player.value.currentTarget !== undefined) {

                        // // Return if we can't interact right now.
                        if (!player.value.currentTarget.activeComponent.canInteract) return;
                        activeComponent = player.value.currentTarget.activeComponent;
                        player.value.weaponController.equippedWeapon.fire(player.value);
                    }

                break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    if (activeComponent) {
                        player.value.weaponController.equippedWeapon.stopFire();
                    }
                    activeComponent = null;
                break;
            }


        })
        this.PointerObservableFunction = playerActions;
    }

    function registerBuildPointers() {

        let buildActions = scene.value.onPointerObservable.add((pointerInfo, event) => {

            let bubbleParent = (mesh) => {
                while (mesh.parent !== null) {
                    mesh = mesh.parent;
                }
                return mesh;
            }

            switch(pointerInfo.type) {

                case PointerEventTypes.POINTERTAP:
                    if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
                        // TODO: Move these
                        switch(pointerInfo.event.button) {
                            case 0: // Left
                                var pickedMesh = pointerInfo.pickInfo.pickedMesh;
                                let foundParent = bubbleParent(pickedMesh) as BaseEntity;
                                SceneViewer.positionGizmo.attachedNode = null;
                                SceneViewer.scaleGizmo.attachedNode = null
                                SceneViewer.rotationGizmo.attachedNode = null
                                SceneViewer.positionGizmo.attachedNode = foundParent;
                                SceneViewer.scaleGizmo.attachedNode = foundParent;
                                SceneViewer.rotationGizmo.attachedNode = foundParent;
                                const useLevelEditor = useLevelEditorStore();
                                useLevelEditor.selectEntity(foundParent);
        
                                let gameObjectSelected = new CustomEvent("BuildMode:EntitySelected", { detail: { id:foundParent.uid } })
                                document.dispatchEvent(gameObjectSelected);
                                break;
                            case 1: // Right
                                break;
                            case 2: // Middle
                                break;
                        }
                    }
                    else {
                        SceneViewer.positionGizmo.attachedNode = null;
                        SceneViewer.scaleGizmo.attachedNode = null
                        SceneViewer.rotationGizmo.attachedNode = null
                    }
            }
        })
        
        this.PointerObservableFunction = buildActions;
    }

    function registerBuildBeforeRenderFunction() {

        let renderLoop = scene.value.onBeforeRenderObservable.add(() => {
            let bubbleParent = (mesh) => {
                while (mesh.parent !== null) {
                    mesh = mesh.parent;
                }
                return mesh;
            }
        
            // Clear highlights
            SceneViewer.highlightLayer.removeAllMeshes();

            SceneViewer.player.pointer.position = SceneViewer.camera.getTarget();
            let target = SceneViewer.camera.getTarget(); let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position,target); ray.length = 100;
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

    function registerPlayerBeforeRenderFunction() {
        let renderLoop = SceneViewer.scene.onBeforeRenderObservable.add(() => {
    
            // Clear highlights
            SceneViewer.highlightLayer.removeAllMeshes();

            SceneViewer.player.pointer.position = SceneViewer.camera.getTarget();
            let target = SceneViewer.camera.getTarget(); let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position,target); ray.length = 100;
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
                    let gameObject = foundParent as Entity;
                    if (!gameObject || !gameObject.activeComponent) return;
                    // Are we allowed to interact?
                    if (gameObject.activeComponent.canInteract == false) return;
                    // TODO: THIS ALL NEEDS TO FUCKING GO. Stop being lazy.
                    // Arbitrary for now but check against types of game objects to see if they're of an interactable type.
                    if ( gameObject.activeComponent.type == "Interactable" || 
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
                        ) 
                        {

                        if (!mesh.parent) return;
                        let meshes = mesh.parent.getChildMeshes();
                        // Highlight all the meshes in the game object.
                        // SceneViewer.highlightLayer.isEnabled = true;
                        // meshes.forEach(mesh => {
                        //     if (mesh.name == "collider") return;
                        //     SceneViewer.highlightLayer.addMesh(mesh, new BABYLON.Color3(1, 1, 0));
                        // })

                        // Add the billboard tag.
                        SceneViewer.tagBillBoard.linkWithMesh(meshes[0],gameObject.activeComponent);
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

    function disablePointerLock(value:boolean) {

        if (value == true) {
            this.pointerLock = true;
            document.exitPointerLock();
        }
        else if(value == false) {
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

</script>
<template>

</template>