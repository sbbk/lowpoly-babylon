import * as BABYLON from "@babylonjs/core"
import { jsx } from "@vertx/jsx";
import { GLTFFileLoader } from "@babylonjs/loaders";
import { GraphicsConfig, ModelLoader } from "../media/models/modelImporter";
import { ShaderManager } from "./shaders/shaderManager";
import HavokPhysics from "@babylonjs/havok";
import * as GUI from "@babylonjs/gui"

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
    scene:BABYLON.Scene;
    engine:BABYLON.Engine;
    camera:MainCamera;
    mainLight:BABYLON.HemisphericLight;
    fileLoader:GLTFFileLoader;
    loadedModel:BABYLON.Scene
    interestPoints:PointOfInterest[];
    currentTarget:number;
    static havokPlugin:BABYLON.HavokPlugin;

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas);
        window["engine"] = this.engine;
        this.engine.setHardwareScalingLevel(2);
        this.scene = new BABYLON.Scene(this.engine);
        window["scene"] = this.scene;
        this.camera = new MainCamera('main-camera',new BABYLON.Vector3(8.88988495700036,5.39056883665061,1.260390443856567));
        this.camera.setTarget(new BABYLON.Vector3(7.892032691165552,5.355046364537239,1.205354059244245))
        //this.camera.wheelDeltaPercentage = 0.1;

        HavokPhysics().then((havokInstance) => {

            SceneViewer.havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);

            this.scene.gravity = new BABYLON.Vector3(0, -.75, 0); 
            this.scene.collisionsEnabled = true;
            this.scene.enablePhysics(new BABYLON.Vector3(0, -.75, 0),SceneViewer.havokPlugin);
    
            this.camera.checkCollisions = true;
            this.camera.applyGravity = true;
            this.camera.ellipsoid = new BABYLON.Vector3(.4, .8, .4);
            this.camera.checkCollisions = true;
    
            var hero = BABYLON.Mesh.CreateBox('hero', 2.0, this.scene, false, BABYLON.Mesh.FRONTSIDE);
            hero.position.x = 0.0;
            hero.position.y = 1.0;
            hero.position.z = 0.0;
            let heroAggregate = new BABYLON.PhysicsAggregate(hero, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, this.scene);
    
            var pointer = BABYLON.Mesh.CreateSphere("Sphere", 16.0, 0.01, this.scene, false, BABYLON.Mesh.DOUBLESIDE);
            // move the sphere upward 1/2 of its height
            pointer.position.x = 0.0;
            pointer.position.y = 0.0;
            pointer.position.z = 0.0;
            pointer.isPickable = false;
    
            var moveForward = false;
            var moveBackward = false;
            var moveRight = false;
            var moveLeft = false;
            
            var onKeyDown = function (event) {
                switch (event.keyCode) {
                    case 38: // up
                    case 87: // w
                        moveForward = true;
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
                        break;
                }
            };
        
            var onKeyUp = function (event) {
                switch (event.keyCode) {
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
                }
            };
        
            document.addEventListener('keydown', onKeyDown, false);
            document.addEventListener('keyup', onKeyUp, false);
            
    
            var myGround = BABYLON.MeshBuilder.CreateGround("myGround", {width: 200, height: 200}, this.scene);
            var groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
            myGround.position.y;
            myGround.checkCollisions= true;
            const groundAggregate = new BABYLON.PhysicsAggregate(myGround, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, this.scene);
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
            //this.camera.useFramingBehavior = true;
    
            this.scene.onPointerObservable.add((pointerInfo, event) => {
    
                switch(pointerInfo.type) {
    
                    case BABYLON.PointerEventTypes.POINTERTAP:
                        if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
    
                            console.log(pointerInfo.pickInfo.pickedMesh.position);
    
                        }
    
    
                }
    
    
            })
    
            let ease = (whichprop, targetval, speed) => {
                var ease = new BABYLON.CubicEase();
                ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                BABYLON.Animation.CreateAndStartAnimation('at4', this.camera, whichprop, speed, 120, this.camera[whichprop], targetval, 0, ease);
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
    
    
            window["camera"] = this.camera;
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
                this.scene.markAllMaterialsAsDirty(BABYLON.Constants.MATERIAL_AllDirtyFlag);
            })
            let ditherDarknessInput = document.getElementById("dither-darkness-range") as HTMLInputElement;
            ditherDarknessInput.value = GraphicsConfig.ditherDarkenFactor.toString();
            ditherDarknessInput.addEventListener('input',() =>{
                GraphicsConfig.setValue("ditcherDarkenRatio",parseFloat(ditherDarknessInput.value));
                this.scene.markAllMaterialsAsDirty(BABYLON.Constants.MATERIAL_AllDirtyFlag);
    
            })
    
            let models = ModelLoader.generateList();
            let modelArea = document.getElementById("model-area") as HTMLElement;
            models.forEach(model => {
                let button = document.createElement("button") as HTMLButtonElement;
                button.innerText = model;
                button.addEventListener('click',() =>{
                    ModelLoader.LoadModel(model,this.scene,true);
                })
                modelArea.appendChild(button);
            })
    
            this.fileLoader = new GLTFFileLoader();
            this.camera.attachControl()
    
    
    
                
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        
            this.scene.onBeforeRenderObservable.add(() => {
    
    
    
            })
    
            document.addEventListener("fewfew",(e:CustomEvent) => {
    
                
    
            })
    
            //this.loadedModel = ModelLoader.LoadModel("dva",this.scene,false);
    
            let modelLoadingComplete = () => {
                let cameraTarget = loadedModels[0]
                this.camera.setTarget(cameraTarget);
    
                document.addEventListener("keydown", (e) => {
                    console.log("DOWN")
                    if (e.key === 'a') {
    
                        e.preventDefault();
                        let currentIndex = loadedModels.indexOf(cameraTarget);
                        if (currentIndex == 0) {
                            cameraTarget = loadedModels[loadedModels.length -1];
                            this.camera.setTarget(cameraTarget);
    
                        }
                        else {
                            cameraTarget = loadedModels[currentIndex +1]
                            this.camera.setTarget(cameraTarget);
                            this.camera.radius = 3;
                        }
                    }
                    if (e.key === 'd') {
    
                        e.preventDefault();
                        let currentIndex = loadedModels.indexOf(cameraTarget);
                        if (currentIndex == loadedModels.length -1) {
                            cameraTarget = loadedModels[0];
                            this.camera.setTarget(cameraTarget);
                        }
                        else {
                            cameraTarget = loadedModels[currentIndex +1]
                            this.camera.setTarget(cameraTarget);
                            this.camera.radius = 3;
                        }
                    }
                });
            }
    
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
            this.loadedModel = ModelLoader.LoadModel("Scene",this.scene,true);
            let rayHelper :BABYLON.RayHelper;
    
            let highlightLayer = new BABYLON.HighlightLayer('hl-l',this.scene);
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
    
    
            this.scene.registerBeforeRender(() => {
    
                this.camera.position.x = hero.position.x;
                this.camera.position.y = hero.position.y + 1.0;
                this.camera.position.z = hero.position.z;
                pointer.position = this.camera.getTarget();
    
                var forward = this.camera.getTarget().subtract(this.camera.position).normalize();
                forward.y = 0;
                var right = BABYLON.Vector3.Cross(forward, this.camera.upVector).normalize();
                right.y = 0;
                
                var SPEED = 20;
                let f_speed = 0;
                var s_speed = 0;
                var u_speed = 0;			
        
                if (moveForward) {
                    f_speed = SPEED;
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
                
                var move = (forward.scale(f_speed)).subtract((right.scale(s_speed))).subtract(this.camera.upVector.scale(u_speed));
       
                heroAggregate.body.setLinearVelocity(new BABYLON.Vector3(move.x,move.y,move.z))
    
                setTimeout(() => {                
                    if (rayHelper) {
                        rayHelper.dispose();
                    }
                }, 10);
                let target = this.camera.getTarget();
                let ray = BABYLON.Ray.CreateNewFromTo(this.camera.position,target);
                ray.length = 10000;
    
                let hit = this.scene.pickWithRay(ray);
                highlightLayer.removeAllMeshes();
                if (hit.pickedMesh) {
                    
                    if (dukeHands.src !== dukeGrab) {
                        dukeHands.src = dukeGrab;
                    }
                    highlightLayer.isEnabled = true;
                    let mesh = hit.pickedMesh as BABYLON.Mesh;
                    label.text = mesh.name;
                    line.linkWithMesh(mesh);
                    tag.linkWithMesh(mesh); 
                    rect1.linkWithMesh(mesh);   
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
    
    
                    let parent = mesh.parent;
                    if (!parent) return;
                    let meshes = parent.getChildMeshes();
    
                    meshes.forEach(mesh => {
                        highlightLayer.addMesh(mesh, new BABYLON.Color3(1,1,0));
                    })
                }
                if (!hit.pickedMesh) {
                    
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
        
            var postProcess = new BABYLON.PostProcess("My custom post process", "custom", ["screenSize", "threshold"], null, 0.25, this.camera);
            postProcess.onApply = function (effect) {
                effect.setFloat2("screenSize", postProcess.width, postProcess.height);
                effect.setFloat("threshold", 1.0);
            };        
            let colorTable = new URL('./lut-posterized.png',import.meta.url).pathname;
            //let colorCorrectionProcess = new BABYLON.ColorCorrectionPostProcess("color-correction",colorTable,1.0,this.camera);
    
    
        });

        
    }
}