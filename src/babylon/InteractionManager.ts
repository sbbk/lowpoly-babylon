import { GameObject, findGameObjectParent } from "../components/GameObject";
import { SceneViewer } from "./sceneViewer";
import { ConversationComponent } from "../components/ConversationComponent";
import * as BABYLON from "@babylonjs/core"

export class InteractionManager {

    pointerLock:boolean;
    PointerObservableFunction:BABYLON.Observer<BABYLON.PointerInfo>
    RegisterBeforeRenderFunction:BABYLON.Observer<BABYLON.Scene>;

    registerPlayerPointers() {
        let playerActions = SceneViewer.scene.onPointerObservable.add((pointerInfo, event) => {

            // DEBUGS.
            let activeTargetTracker = document.getElementById('active-target-tracker');
            if (SceneViewer.player.currentTarget) {
                activeTargetTracker.innerText = SceneViewer.player.currentTarget.activeComponent.type;
            }

            switch(pointerInfo.type) {

                case BABYLON.PointerEventTypes.POINTERDOWN:
                    if (SceneViewer.player.currentTarget == null || !SceneViewer.player.currentTarget) {
                        // Not sure if this does much now, check back later.
                        // if (activeComponent) {
                        //     activeComponent.destroy();
                        //     activeComponent = null;
                        // }
                        return;
                    }
                    // Cancel out if we already have something active.. prevent stacking.
                    if (SceneViewer.activeComponent) return;

                    // If there's something to interact with continue..
                    if (SceneViewer.player.currentTarget !== null || SceneViewer.player.currentTarget !== undefined) {

                        // // Return if we can't interact right now.
                        if (!SceneViewer.player.currentTarget.activeComponent.canInteract) return;
                        SceneViewer.activeComponent = SceneViewer.player.currentTarget.activeComponent;
                        SceneViewer.player.weaponController.equippedWeapon.fire(SceneViewer.player);

                        // if (SceneViewer.player.currentTarget.activeComponent.type == "Interactable" ||
                        //     SceneViewer.player.currentTarget.activeComponent.type == "Talkable" ||
                        //     SceneViewer.player.currentTarget.activeComponent.type =="OneLineConversation" ||
                        //     SceneViewer.player.currentTarget.activeComponent.type == "Physics" ||
                        //     SceneViewer.player.currentTarget.activeComponent.type == "Door" ||
                        //     SceneViewer.player.currentTarget.activeComponent.type == "Button"
                        // ) {
                        //     SceneViewer.player.currentTarget.activeComponent.interact();
                        //     SceneViewer.activeComponent = SceneViewer.player.currentTarget.activeComponent;
                        // }

                        // if (SceneViewer.player.currentTarget.activeComponent.type == "Collectable") {
                        //     SceneViewer.player.currentTarget.activeComponent.interact();
                        // }

                        // if (SceneViewer.player.currentTarget.activeComponent.type == "Synth") {
                        //     SceneViewer.player.currentTarget.activeComponent.interact();
                        //     SceneViewer.activeSynths.push(SceneViewer.player.currentTarget.id);

                        //     console.log(SceneViewer.player.currentTarget);
                        //     console.log(SceneViewer.player.currentTarget.activeComponent);
                        // }
                    }

                break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    // End any synths anyway..
                    // for (let i=0;i<SceneViewer.activeSynths.length;i++) {

                    //     let foundGameObject = SceneViewer.findGameObject(SceneViewer.activeSynths[i]);
                    //     if (foundGameObject) {
                    //         foundGameObject.activeComponent.endInteract();
                    //         SceneViewer.activeSynths.splice(i)
                    //     }

                    // }
                    if (SceneViewer.activeComponent) {
                        SceneViewer.player.weaponController.equippedWeapon.stopFire();
                    }
                    SceneViewer.activeComponent = null;
                    // if (!SceneViewer.player.currentTarget) return;
                    // if (SceneViewer.activeComponent) {
                    //     //SceneViewer.activeComponent.endInteract();
                    // }

    
                break;
            }


        })
        this.PointerObservableFunction = playerActions;
    }

    registerBuildPointers() {

        let posX = document.getElementById("posx") as HTMLInputElement;
        let posY = document.getElementById("posy") as HTMLInputElement;
        let posZ = document.getElementById("posz") as HTMLInputElement;
        let rotX = document.getElementById("rotx") as HTMLInputElement;
        let rotY = document.getElementById("roty") as HTMLInputElement;
        let rotZ = document.getElementById("rotz") as HTMLInputElement;
        let scaX = document.getElementById("scax") as HTMLInputElement;
        let scaY = document.getElementById("scay") as HTMLInputElement;
        let scaZ = document.getElementById("scaz") as HTMLInputElement;
        
        let buildActions = SceneViewer.scene.onPointerObservable.add((pointerInfo, event) => {

            // DEBUGS.
            let activeTargetTracker = document.getElementById('active-target-tracker');
            let activeComponentTracker = document.getElementById('active-component-tracker');
            let componentDetailArea = document.getElementById('component-details-area');

            let bubbleParent = (mesh) => {
                while (mesh.parent !== null) {
                    mesh = mesh.parent;
                }
                return mesh;
            }

            switch(pointerInfo.type) {

                case BABYLON.PointerEventTypes.POINTERTAP:
                    if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {

                        var pickedMesh = pointerInfo.pickInfo.pickedMesh;
                        SceneViewer.positionGizmo.attachedNode = null;
                        SceneViewer.scaleGizmo.attachedNode = null
                        SceneViewer.rotationGizmo.attachedNode = null
                        SceneViewer.positionGizmo.attachedNode = pickedMesh;
                        SceneViewer.scaleGizmo.attachedNode = pickedMesh;
                        SceneViewer.rotationGizmo.attachedNode = pickedMesh;
                        
                        let foundParent = bubbleParent(pickedMesh) as GameObject;
                        if (foundParent) {

                            activeTargetTracker.innerText = foundParent.name;
                            activeComponentTracker.innerText = foundParent.activeComponent.type;
                            
    
                            // MOVE ALL THIS SHIT.
                            componentDetailArea.innerHTML = "";
                            switch(foundParent.activeComponent.type) {
    
                                case "Talkable":
                                    let component = foundParent.activeComponent as ConversationComponent;
                                    component.conversationLines.forEach(line => {
                                        let lineElem = document.createElement('h5');
                                        lineElem.textContent = line;
                                        componentDetailArea.appendChild(lineElem);
                                    })
                                    break;
                            }
                        }

                        posX.value = pickedMesh.position.x.toString()
                        posY.value = pickedMesh.position.y.toString()
                        posZ.value = pickedMesh.position.z.toString()
                        rotX.value = pickedMesh.rotation.x.toString()
                        rotY.value = pickedMesh.rotation.y.toString()
                        rotZ.value = pickedMesh.rotation.z.toString()
                        scaX.value = pickedMesh.scaling.x.toString()
                        scaY.value = pickedMesh.scaling.y.toString()
                        scaZ.value = pickedMesh.scaling.z.toString()

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
            let target = SceneViewer.camera.getTarget(); let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position,target); ray.length = 100;
            let hit = SceneViewer.scene.pickWithRay(ray);

            if (hit.pickedMesh) {

                let mesh = hit.pickedMesh as BABYLON.Mesh;
                let distance = BABYLON.Vector3.Distance(SceneViewer.camera.position, hit.pickedPoint);
                SceneViewer.distanceTracker.innerText = distance.toString();
                
                // We're not even within highlight distance.
                if (distance > SceneViewer.highlightDistance)
                return;

                // Look for a parent game object.
                let foundParent = bubbleParent(mesh);
                if (foundParent) {
                    let gameObject = foundParent as GameObject;
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
            let target = SceneViewer.camera.getTarget(); let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position,target); ray.length = 100;
            let hit = SceneViewer.scene.pickWithRay(ray);

            if (hit.pickedMesh) {
                let mesh = hit.pickedMesh as BABYLON.Mesh;
                let distance = BABYLON.Vector3.Distance(SceneViewer.camera.globalPosition, hit.pickedPoint);
                SceneViewer.distanceTracker.innerText = distance.toString();
                
                // We're not even within highlight distance.
                if (distance > SceneViewer.highlightDistance)
                return;

                // Look for a parent game object.
                let foundParent = findGameObjectParent(mesh);
                if (foundParent) {
                    let gameObject = foundParent as GameObject;
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

    disablePointerLock(value:boolean) {

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