import * as BABYLON from "@babylonjs/core"
import { jsx } from "@vertx/jsx";
import { GLTFFileLoader } from "@babylonjs/loaders";
import { GraphicsConfig, ModelLoader } from "../media/models/modelImporter";
import { ShaderManager } from "./shaders/shaderManager";
import HavokPhysics from "@babylonjs/havok";
import * as GUI from "@babylonjs/gui"
import { CollectableComponent, iGameComponent, GameObject, ImageComponent, pInventory } from "../components/GameObject";

export class MainCamera extends BABYLON.UniversalCamera {

    defaultSpeed:number = 1;
    defaultFrameRate:number = 1;
    defaultTarget:BABYLON.Vector3;
    currentSpeed:number;
    currentPosition:BABYLON.Vector3;
    previousPosition:BABYLON.Vector3;
    currentTarget: BABYLON.Vector3 | InteractableModel;

    init() {
        this.defaultTarget = this.target;
    }

    lerpToPosition(targetPosition:BABYLON.Vector3,speed?:number,frameRate?:number,path?:BABYLON.Vector3[]) {

        if (!speed) speed = this.defaultSpeed;
        if (!frameRate) frameRate =  this.defaultFrameRate;
        this.target = targetPosition;

    }

    lerpToRotation(targetRotation:BABYLON.Vector3,speed?:number,frameRate?:number) {

        if (!speed) speed = this.defaultSpeed;
        if (!frameRate) frameRate =  this.defaultFrameRate;
        this.rotation = targetRotation;

    }

    lerpHome() {
        this.lerpToPosition(this.defaultTarget);
    }
    
}

export class InteractableModel {

    sceneViewer:SceneViewer;
    constructor(sceneViewer:SceneViewer) {
        this.sceneViewer = sceneViewer;
    }

    id:number;
    isLoaded:boolean;
    isFocused:boolean;
    isVisible:boolean;
    transformNode:BABYLON.TransformNode;
    mesh:BABYLON.Mesh;
    viewPosition:BABYLON.Vector3;
    viewRotation:BABYLON.Vector3;
    animations:string[];

    focus() {

        this.sceneViewer.camera.lerpToPosition(this.viewPosition);
        this.sceneViewer.camera.lerpToRotation(this.viewRotation);

    }
}

export interface PointOfInterest {

    name:string,
    target:BABYLON.Vector3,
    alpha:number,
    beta:number,
    radius:number

}

export class SceneViewer {

    canvas:HTMLCanvasElement;
    static scene:BABYLON.Scene;
    static heroMesh:BABYLON.Mesh;
    static pointer:BABYLON.Mesh;
    engine:BABYLON.Engine;
    static camera:MainCamera;
    mainLight:BABYLON.HemisphericLight;
    fileLoader:GLTFFileLoader;
    loadedModel:BABYLON.Scene
    interestPoints:PointOfInterest[];
    currentTarget:number;
    static havokPlugin:BABYLON.HavokPlugin;
    static inventory:pInventory;

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas);
        window["engine"] = this.engine;
        this.engine.setHardwareScalingLevel(2);
        SceneViewer.scene = new BABYLON.Scene(this.engine);
        window["scene"] = SceneViewer.scene;
        SceneViewer.camera = new MainCamera('main-camera',new BABYLON.Vector3(8.88988495700036,5.39056883665061,1.260390443856567));
        SceneViewer.camera.setTarget(new BABYLON.Vector3(7.892032691165552,5.355046364537239,1.205354059244245))
        //SceneViewer.camera.wheelDeltaPercentage = 0.1;

        SceneViewer.inventory = new pInventory();

        HavokPhysics().then((havokInstance) => {

            SceneViewer.havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);

            SceneViewer.scene.gravity = new BABYLON.Vector3(0, -.75, 0); 
            SceneViewer.scene.collisionsEnabled = true;
            SceneViewer.scene.enablePhysics(new BABYLON.Vector3(0, -.75, 0),SceneViewer.havokPlugin);
    
            SceneViewer.camera.checkCollisions = true;
            SceneViewer.camera.applyGravity = true;
            SceneViewer.camera.ellipsoid = new BABYLON.Vector3(.4, .8, .4);
            SceneViewer.camera.checkCollisions = true;
    
            SceneViewer.heroMesh = BABYLON.Mesh.CreateBox('hero', 2.0, SceneViewer.scene, false, BABYLON.Mesh.FRONTSIDE);
            SceneViewer.heroMesh.isPickable = false;
            SceneViewer.heroMesh.position.x = 0.0;
            SceneViewer.heroMesh.position.y = 1.0;
            SceneViewer.heroMesh.position.z = 0.0;
            let heroAggregate = new BABYLON.PhysicsAggregate(SceneViewer.heroMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, SceneViewer.scene);
    
            SceneViewer.pointer = BABYLON.Mesh.CreateSphere("Sphere", 16.0, 0.01, SceneViewer.scene, false, BABYLON.Mesh.DOUBLESIDE);
            // move the sphere upward 1/2 of its height
            SceneViewer.pointer.position.x = 0.0;
            SceneViewer.pointer.position.y = 0.0;
            SceneViewer.pointer.position.z = 0.0;
            SceneViewer.pointer.isPickable = false;
    
            var moveForward = false;
            var moveBackward = false;
            var moveRight = false;
            var moveLeft = false;
            var jump = false;
            let sprinting = false;
            
            var onKeyDown = function (event) {
                switch (event.keyCode) {
                    case 38: // up
                    case 87: // w
                        moveForward = true;
                        break;
                    case 16: // Shift
                        sprinting = true;
                        break;
                    case 37: // left
                    case 65: // a
                        moveLeft = true; break;
        
                    case 40: // down
                    case 83: // s
                        moveBackward = true;
                        break;
        
                    case 39: // right
                    case 68: // d
                        moveRight = true;
                        break;
        
                    case 32: // space
                        jump = true;
                        break;
                }
            };
        
            var onKeyUp = function (event) {
                switch (event.keyCode) {
                    case 70: //f
                        SceneViewer.inventory.remove(SceneViewer.inventory.amount -1);
                        break;
                    case 16: // Shift
                        sprinting = false;
                        break;
                    case 38: // up
                    case 87: // w
                        moveForward = false;
                        break;
        
                    case 37: // left
                    case 65: // a
                        moveLeft = false;
                        break;
        
                    case 40: // down
                    case 83: // a
                        moveBackward = false;
                        break;
        
                    case 39: // right
                    case 68: // d
                        moveRight = false;
                        break;
                    case 32:
                        jump = false;
                        break;
                }
            };
        
            document.addEventListener('keydown', onKeyDown, false);
            document.addEventListener('keyup', onKeyUp, false);
            
    
            var myGround = BABYLON.MeshBuilder.CreateGround("myGround", {width: 200, height: 200}, SceneViewer.scene);
            myGround.isPickable = false;
            var groundMaterial = new BABYLON.StandardMaterial("ground", SceneViewer.scene);
            myGround.position.y;
            myGround.checkCollisions= true;
            const groundAggregate = new BABYLON.PhysicsAggregate(myGround, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, SceneViewer.scene);
            //this.interestPoints = [new BABYLON.Vector3(1.751672367244813,1.94732104969539,0.06579143706881602),new BABYLON.Vector3(0.8125,1.125,-0.5),new BABYLON.Vector3(0,0,0.015625)];
    
            this.interestPoints = [];
            let interest1 = {
    
                name:"1",
                target:new BABYLON.Vector3(6.6991334075733375,5.844039807702413,0.526876081274739),
                alpha:12.628530071921578,
                beta:1.3971139740190135,
                radius:0.0001,
    
            } as PointOfInterest
    
            let interest2 = {
                name:"2",
                target:new BABYLON.Vector3(4.076799374956906, 5.554503166394445,1.6728648703188291),
                alpha:0.10409953845009177,
                beta:0.8381139613149221,
                radius:0.0001,
            }
    
            this.interestPoints.push(interest1);
            this.interestPoints.push(interest2);
    
            this.currentTarget = 0;
            //SceneViewer.camera.useFramingBehavior = true;
    
    
            let ease = (whichprop, targetval, speed) => {
                var ease = new BABYLON.CubicEase();
                ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                BABYLON.Animation.CreateAndStartAnimation('at4', SceneViewer.camera, whichprop, speed, 120, SceneViewer.camera[whichprop], targetval, 0, ease);
            }
    
            let idleHands = new URL('../media/models/HANDS/duke-hands.png',import.meta.url).pathname;
            let dukeGrab = new URL('../media/models/HANDS/duke-grab.png',import.meta.url).pathname;
            let dukeHands = document.getElementById('duke-hands') as HTMLImageElement;
            dukeHands.src = idleHands;
            // document.addEventListener('click',() => {
            //     setTimeout(() => {
            //         dukeHands.style.transform = "translateX(-1500px)"
            //     }, 100);
            //     setTimeout(() => {
            //         dukeHands.style.transform = "translateX(-3000px)"
            //     }, 200);
            //     setTimeout(() => {
            //         dukeHands.style.transform = "translateX(-4500px)"
            //     }, 300);
            //     setTimeout(() => {
            //         dukeHands.style.transform = "translateX(0px)"
            //     }, 400);
            // })
    
    
            window["camera"] = SceneViewer.camera;
            this.mainLight = new BABYLON.HemisphericLight('main-light',BABYLON.Vector3.Zero());
            let graphics = new GraphicsConfig();
    
            // HARDWARE SCALING
            let hardwareScalingInput = document.getElementById("hardware-scaling-range") as HTMLInputElement;
            hardwareScalingInput.value = GraphicsConfig.hardwareScaling.toString();
            console.log(GraphicsConfig.hardwareScaling);
            hardwareScalingInput.addEventListener('input',() =>{
                GraphicsConfig.setValue("hardwareScaling",parseFloat(hardwareScalingInput.value));
                this.engine.setHardwareScalingLevel(GraphicsConfig.hardwareScaling);
                console.log(GraphicsConfig.hardwareScaling);
            })
    
            // JITTER
            let jitterInput = document.getElementById("jitter-level-range") as HTMLInputElement;
            jitterInput.value = GraphicsConfig.jitterAmplitude.toString();
            jitterInput.addEventListener('input',() =>{
                GraphicsConfig.setValue("jitterAmplitude",parseFloat(jitterInput.value));
            })
    
            // DITHER
            let ditherLightnessInput = document.getElementById("dither-lightness-range") as HTMLInputElement;
            ditherLightnessInput.value = GraphicsConfig.ditherLightenFactor.toString();
            ditherLightnessInput.addEventListener('input',() =>{
                GraphicsConfig.setValue("ditcherDarkenRatio",parseFloat(ditherLightnessInput.value));
                SceneViewer.scene.markAllMaterialsAsDirty(BABYLON.Constants.MATERIAL_AllDirtyFlag);
            })
            let ditherDarknessInput = document.getElementById("dither-darkness-range") as HTMLInputElement;
            ditherDarknessInput.value = GraphicsConfig.ditherDarkenFactor.toString();
            ditherDarknessInput.addEventListener('input',() =>{
                GraphicsConfig.setValue("ditcherDarkenRatio",parseFloat(ditherDarknessInput.value));
                SceneViewer.scene.markAllMaterialsAsDirty(BABYLON.Constants.MATERIAL_AllDirtyFlag);
    
            })
    
            let models = ModelLoader.generateList();
            let modelArea = document.getElementById("model-area") as HTMLElement;
            models.forEach(model => {
                let button = document.createElement("button") as HTMLButtonElement;
                button.innerText = model;
                button.addEventListener('click',() =>{
                    ModelLoader.LoadModel(model,SceneViewer.scene,true);
                })
                modelArea.appendChild(button);
            })
    
            this.fileLoader = new GLTFFileLoader();
            SceneViewer.camera.attachControl()
    
    
    
                
            this.engine.runRenderLoop(() => {
                SceneViewer.scene.render();
            });
        
            SceneViewer.scene.onBeforeRenderObservable.add(() => {
    
    
    
            })
    
            document.addEventListener("fewfew",(e:CustomEvent) => {
    
                
    
            })
    
            this.loadedModel = ModelLoader.LoadModel("Scene",SceneViewer.scene,false);
    
            var isLocked = false;
	
            // On click event, request pointer lock
            SceneViewer.scene.onPointerDown = function (evt) {
                
                //true/false check if we're locked, faster than checking pointerlock on each single click.
                if (!isLocked) {
                    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                    if (canvas.requestPointerLock) {
                        canvas.requestPointerLock();
                    }
                }
            }

            // let modelLoadingComplete = () => {
            //     let cameraTarget = loadedModels[0]
            //     SceneViewer.camera.setTarget(cameraTarget);
    
            //     document.addEventListener("keydown", (e) => {
            //         console.log("DOWN")
            //         if (e.key === 'a') {
    
            //             e.preventDefault();
            //             let currentIndex = loadedModels.indexOf(cameraTarget);
            //             if (currentIndex == 0) {
            //                 cameraTarget = loadedModels[loadedModels.length -1];
            //                 SceneViewer.camera.setTarget(cameraTarget);
    
            //             }
            //             else {
            //                 cameraTarget = loadedModels[currentIndex +1]
            //                 SceneViewer.camera.setTarget(cameraTarget);
            //                 SceneViewer.camera.radius = 3;
            //             }
            //         }
            //         if (e.key === 'd') {
    
            //             e.preventDefault();
            //             let currentIndex = loadedModels.indexOf(cameraTarget);
            //             if (currentIndex == loadedModels.length -1) {
            //                 cameraTarget = loadedModels[0];
            //                 SceneViewer.camera.setTarget(cameraTarget);
            //             }
            //             else {
            //                 cameraTarget = loadedModels[currentIndex +1]
            //                 SceneViewer.camera.setTarget(cameraTarget);
            //                 SceneViewer.camera.radius = 3;
            //             }
            //         }
            //     });
            // }
    
            let modelCount = 0;
            let loadedCount = 0;
            let loadedModels : BABYLON.AbstractMesh[] = [];
            document.addEventListener("modelLoader:TotalCount",(e:CustomEvent) => {
                console.log("Setting count..",e.detail.count)
                modelCount = e.detail.count;
            })
    
            document.addEventListener("modelLoader:Loaded",(e:CustomEvent) => {
                let mesh = e.detail.mesh as BABYLON.AbstractMesh;
                loadedModels.push(mesh);
                loadedCount += 1;
                console.log("Loading Model..",loadedCount);
                if (loadedCount == modelCount) {
                    modelLoadingComplete();
                }
    
            })
    
            // LOAD ALL MODELS AND DISTRUBUTE
            //ModelLoader.LoadAllModels(this.scene);
            //this.loadedModel = ModelLoader.LoadModel("Scene",this.scene,true);

            let gameObj = new GameObject("Collectable",SceneViewer.scene,BABYLON.MeshBuilder.CreateBox('Collectable'),"Collectable");
            gameObj.icon = new URL('../media/images/red-box.png',import.meta.url).pathname;
            let Collectable = new CollectableComponent("Boxy",gameObj);
            gameObj.addComponent(Collectable);

            let collectableBox = new GameObject("Collectable",SceneViewer.scene,BABYLON.MeshBuilder.CreateBox('Collectable'),"Collectable");
            collectableBox.icon = new URL('../media/images/yellow-box.png',import.meta.url).pathname;
            let CollectableBoxComp = new CollectableComponent("Boxy",collectableBox);
            collectableBox.addComponent(CollectableBoxComp);
            collectableBox.setPosition(new BABYLON.Vector3(5,1,1));
            let collectMat = new BABYLON.StandardMaterial('myguuyMat');
            collectMat.diffuseColor = new BABYLON.Color3(1,1,0);
            collectableBox.mesh.material = collectMat


            let gameObj2 = new GameObject("No Interact",SceneViewer.scene,BABYLON.MeshBuilder.CreateSphere('Static'),"Static");
            let gameObj3 = new GameObject("Interactable",SceneViewer.scene,BABYLON.MeshBuilder.CreateBox('Image Component'),"Interactable");
            let img = new URL('../media/images/thumb.png',import.meta.url).pathname;
            let images = [img];
            let imageComponent = new ImageComponent(images);
            gameObj3.addComponent(imageComponent)
            gameObj.setPosition(new BABYLON.Vector3(0,1,1))
            gameObj2.setPosition(new BABYLON.Vector3(0,3,1))
            gameObj3.setPosition(new BABYLON.Vector3(3,1,1));
            let mat = new BABYLON.StandardMaterial('myguuyMat');
            mat.diffuseColor = new BABYLON.Color3(1,0,0);
            gameObj.mesh.material = mat;


            let rayHelper :BABYLON.RayHelper;
    
            let highlightLayer = new BABYLON.HighlightLayer('hl-l',SceneViewer.scene);
            let highlightedMeshes:BABYLON.Mesh[] = [];
            var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            var rect1 = new GUI.Rectangle();
            rect1.width = 0.3;
            rect1.height = "100px";
            rect1.cornerRadius = 20;
            rect1.color = "Orange";
            rect1.thickness = 4;
            rect1.background = "green";
            advancedTexture.addControl(rect1);
            rect1.linkOffsetY = -150;
        
            var label = new GUI.TextBlock();
            label.text = "Sphere";
            label.fontSize = "50px"
            rect1.addControl(label);
        
            var tag = new GUI.Ellipse();
            tag.width = "40px";
            tag.height = "40px";
            tag.color = "Orange";
            tag.thickness = 4;
            tag.background = "green";
            advancedTexture.addControl(tag);
     
      
 
        
            var line =  new GUI.Line();
            line.lineWidth = 4;
            line.color = "Orange";
            line.y2 = 20;
            line.linkOffsetY = -20;
            advancedTexture.addControl(line);
    
            line.connectedControl = rect1;  
    
            rect1.isVisible = false;
            label.isVisible = false;
            tag.isVisible = false;
            line.isVisible = false

                
            let activeTarget:GameObject = null;
            let activeComponent:iGameComponent;

            SceneViewer.scene.onPointerObservable.add((pointerInfo, event) => {

                switch(pointerInfo.type) {
    
                    case BABYLON.PointerEventTypes.POINTERTAP:
                        if (activeTarget == null || !activeTarget) {
                            if (activeComponent) {
                                activeComponent.destroy();
                                activeComponent = null;
                            }
                            return;
                        }
                        if (activeTarget !== null || activeTarget !== undefined) {
                            console.log("Target",activeTarget)

                            if (activeTarget.type == "Interactable") {

                                if (activeComponent == activeTarget.component) return;
                                let component = activeTarget.component;
                                component.interact();
                                activeComponent = activeTarget.component;

                            }

                            if (activeTarget.type == "Collectable") {

                                let component = activeTarget.component;
                                component.interact();
                                // Add to Inventory debug.

                            }

                        }
    
                }
    
    
            })
    
            SceneViewer.scene.registerBeforeRender(() => {
    
                SceneViewer.camera.position.x = SceneViewer.heroMesh.position.x;
                SceneViewer.camera.position.y = SceneViewer.heroMesh.position.y + 1.0;
                SceneViewer.camera.position.z = SceneViewer.heroMesh.position.z;
                SceneViewer.pointer.position = SceneViewer.camera.getTarget();
    
                var forward = SceneViewer.camera.getTarget().subtract(SceneViewer.camera.position).normalize();
                forward.y = 0;
                var right = BABYLON.Vector3.Cross(forward, SceneViewer.camera.upVector).normalize();
                right.y = 0;
                
                let sprintSpeed = 15;
                var SPEED = 15;
                let f_speed = 0;
                var s_speed = 0;
                var u_speed = 0;			

                if (moveForward) {
                    if (sprinting) {
                        f_speed = SPEED + sprintSpeed
                    }
                    else {
                        f_speed = SPEED;
                    }
                }
                if (moveBackward) {
                    f_speed = -SPEED;
                }
        
                if (moveRight) {
                    s_speed = SPEED;
                }
        
                if (moveLeft) {
                    s_speed = -SPEED;
                }
                


                var move = (forward.scale(f_speed)).subtract((right.scale(s_speed))).subtract(SceneViewer.camera.upVector.scale(u_speed));
       
                heroAggregate.body.setLinearVelocity(new BABYLON.Vector3(move.x,move.y,move.z))
                // if (jump) {
                //     console.log("JUMP")
                //     heroAggregate.body.applyImpulse(new BABYLON.Vector3(0,1000,0),hero.position);
                // }

                let bubbleParent = (mesh) => {
                    
                    while (mesh.parent !== null) {
                        mesh = mesh.parent;
                    }
                    return mesh;
                }
    
                setTimeout(() => {                
                    if (rayHelper) {
                        rayHelper.dispose();
                    }
                }, 10);
                let target = SceneViewer.camera.getTarget();
                let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position,target);
                ray.length = 100;

                let hit = SceneViewer.scene.pickWithRay(ray);
                highlightLayer.removeAllMeshes();
                if (hit.pickedMesh) {

                    let mesh = hit.pickedMesh as BABYLON.Mesh;
                    let foundParent = bubbleParent(mesh);
                    if (foundParent) {
                        let gameObject = foundParent as GameObject;
                        let minDistance = 6;
                        let canInteract:boolean = false;

                        if ( gameObject.type == "Interactable" || gameObject.type == "Collectable" ) {

                            activeTarget = gameObject;
                            highlightLayer.isEnabled = true;
                            let parent = mesh.parent;
                            if (!parent) return;
                            let meshes = parent.getChildMeshes();

                            meshes.forEach(mesh => {
                                highlightLayer.addMesh(mesh, new BABYLON.Color3(1, 1, 0));
                            })

                            label.text = mesh.name;
                            rect1.isVisible = true;
                            label.isVisible = true;
                            tag.isVisible = true;
                            line.isVisible = true

                            line.linkWithMesh(mesh);
                            tag.linkWithMesh(mesh);
                            rect1.linkWithMesh(mesh);

                            if (BABYLON.Vector3.Distance(SceneViewer.heroMesh.position, hit.pickedMesh.position) < minDistance) {

                                if (dukeHands.src !== dukeGrab) {
                                    dukeHands.src = dukeGrab;
                                }
                                canInteract = true;

                            }
                            else {
                                activeTarget = null;
                            }

                        }
                    }

           
  
                    // Lets try spawning random text thing.
                    //let textPlane = BABYLON.MeshBuilder.CreatePlane('text-plane',{size:2},this.scene);
                    // let cube = BABYLON.MeshBuilder.CreateBox('box');
                    // cube.isPickable = false;
      
    
                    // textPlane.material = new BABYLON.StandardMaterial('mat');
                    // let textPlaneMat = new BABYLON.BackgroundMaterial('text-mat');
                    // textPlane.material = textPlaneMat;
                    // let planeTex = new BABYLON.DynamicTexture('text-tex',this.scene);
                    // textPlaneMat.diffuseTexture = planeTex;
                    // textPlaneMat.diffuseTexture.hasAlpha = true;
                    // textPlaneMat.alphaMode = 6;
    
                    // let ctx = planeTex.getContext();
                    // ctx.font = '20px Lato';
                    // let canvas = document.createElement("canvas");
                    // let context = canvas.getContext("2d");
                    // context.font = ctx.font;
                    // let text = mesh.name;
                    // planeTex.drawText(text,0,0,ctx.font,'white',"transparent",true,true)
    
    

                }
                if (!hit.pickedMesh) {
                    
                    activeTarget = null;
                    rect1.isVisible = false;
                    label.isVisible = false;
                    tag.isVisible = false;
                    line.isVisible = false

                    if (dukeHands.src !== idleHands) {
                        dukeHands.src = idleHands;
                    }
                    if (highlightedMeshes.length > 0) {
                        highlightedMeshes.forEach(mesh => {
                            highlightLayer.removeMesh(mesh);
                        })
                    }
                    highlightLayer.isEnabled = false;
                } 
            });
    
            BABYLON.Effect.ShadersStore["customFragmentShader"] = `
            #ifdef GL_ES
                precision highp float;
            #endif
        
            // Samplers
            varying vec2 vUV;
            uniform sampler2D textureSampler;
        
            // Parameters
            uniform vec2 screenSize;
            uniform float threshold;
        
            void main(void) 
            {
                vec2 texelSize = vec2(1.0 / screenSize.x, 1.0 / screenSize.y);
                vec4 baseColor = texture2D(textureSampler, vUV);
        
        
                    gl_FragColor = baseColor;
        
            }
            `;
        
            var postProcess = new BABYLON.PostProcess("My custom post process", "custom", ["screenSize", "threshold"], null, 0.25, SceneViewer.camera);
            postProcess.onApply = function (effect) {
                effect.setFloat2("screenSize", postProcess.width, postProcess.height);
                effect.setFloat("threshold", 1.0);
            };        
            let colorTable = new URL('./lut-posterized.png',import.meta.url).pathname;
            //let colorCorrectionProcess = new BABYLON.ColorCorrectionPostProcess("color-correction",colorTable,1.0,SceneViewer.camera);
    
    
        });

        
    }
}