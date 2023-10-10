import * as BABYLON from "@babylonjs/core"
import { jsx } from "@vertx/jsx";
import { GLTFFileLoader } from "@babylonjs/loaders";
import { GraphicsConfig, ModelLoader } from "../media/models/modelImporter";
import { ShaderManager } from "./shaders/shaderManager";
import HavokPhysics from "@babylonjs/havok";
import * as GUI from "@babylonjs/gui"
import { CollectableComponent, iGameComponent, GameObject, ImageComponent, pInventory, ConversationComponent } from "../components/GameObject";


export enum HandMode {
    idle = "idle",
    grab = "grab",
    cash = "cash"
}

export interface HandSource {

    name:string;
    src:string;
    width:number;
    height:number;
    frames:number;

}

export class HandController {

    idle = {
        name:'idle',
        src:new URL('../media/models/HANDS/duke-hands.png',import.meta.url).pathname,
        width:2560,
        height:512,
        frames:4 // Starts at 0
    } as HandSource;
    
    grab = {
        name:'grab',
        src:new URL('../media/models/HANDS/duke-grab.png',import.meta.url).pathname,
        width:512,
        height:512,
        frames:0 // Starts at 0
    } as HandSource;

    cash = {
        name:'cash',
        src:new URL('../media/models/HANDS/duke-cash.png',import.meta.url).pathname,
        width:512,
        height:768,
        frames:0 // Starts at 0
    } as HandSource;

    frameRate:number = 100; // ms
    handElement = document.getElementById('duke-hands') as HTMLImageElement;
    mode:HandMode;
    animationRunning:boolean = false;

    setHandMode(mode:HandMode,frame:number,animate?:boolean) {

        if (mode == this.mode) return;
        if (!animate || animate == undefined) animate = false;
        if (animate == true && this.animationRunning == true) return;

        switch(mode) {

            case HandMode.idle:
                this.mode = mode;
                this.setImg(this.idle,frame,animate)
                break;
            case HandMode.grab:
                this.mode = mode;
                this.setImg(this.grab,frame,animate);
                break;
            case HandMode.cash:
                this.mode = mode;
                this.setImg(this.cash,frame,animate);

        }

    }
    setImg(handSource:HandSource,frame?:number,animate?:boolean) {

        this.handElement.src = handSource.src;
        this.handElement.style.height = this.handElement.height + 'ox';
        if (!animate) {
            let offset = this.handElement.width * frame + 'px'
            this.handElement.style.transform = `translateX(-${offset})`
        }
        else {
            this.runAnimation(handSource);
        }

    }

    runAnimation(handSource:HandSource) {

        if (this.animationRunning == true) return;
        this.animationRunning = true;
        let length = handSource.frames;
        for (let i=0; i <length; i++) {
            let rate = i +1;
            setTimeout(() => {
                let offset = this.handElement.height * i + 'px'
                this.handElement.style.transform = `translateX(-${offset})`
                if (i == length -1) {
                    this.animationRunning = false;
                }
            }, this.frameRate * rate);
        }

    }

    constructor() {
        // Set Default
        this.setHandMode(HandMode.idle,0)
    }

}

export class Player {

    scene:BABYLON.Scene;
    camera:BABYLON.FreeCamera;
    heroMesh:BABYLON.Mesh;
    heroPhysicsAgregate:BABYLON.PhysicsAggregate;
    pointer:BABYLON.Mesh;
    handController:HandController;
    constructor(scene:BABYLON.Scene) {
        this.scene = scene;
        this.camera = new BABYLON.FreeCamera('main',new BABYLON.Vector3(6,3,6));
        //this.camera.position = new BABYLON.Vector3(42.775998054306555,5.231532323582747, 40.643488638043486);
        this.camera.minZ = 0.45;
        this.camera.speed = 0.6;
        this.camera.angularSensibility = 7000;
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
        //this.heroPhysicsAgregate = new BABYLON.PhysicsAggregate(SceneViewer.heroMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, SceneViewer.scene);

        this.pointer = BABYLON.Mesh.CreateSphere("Sphere", 16.0, 0.01, this.scene, false, BABYLON.Mesh.DOUBLESIDE);
        // move the sphere upward 1/2 of its height
        this.pointer.position.x = 0.0;
        this.pointer.position.y = 0.0;
        this.pointer.position.z = 0.0;
        this.pointer.isPickable = false;

    }

}

export class HighlightLayer {

}

export class TagBillboard {

    enabled:boolean;
    UITexture:GUI.AdvancedDynamicTexture
    backgroundRectangle:GUI.Rectangle;
    label:GUI.TextBlock;
    meshTag:GUI.Ellipse;
    connectorLine:GUI.Line;

    constructor(enabled:boolean) {
        this.enabled = enabled;
        this.UITexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.backgroundRectangle = new GUI.Rectangle();
        this.backgroundRectangle.width = 0.3;
        this.backgroundRectangle.height = "100px";
        this.backgroundRectangle.cornerRadius = 20;
        this.backgroundRectangle.color = "Orange";
        this.backgroundRectangle.thickness = 4;
        this.backgroundRectangle.background = "green";
        this.UITexture.addControl(this.backgroundRectangle);
        this.backgroundRectangle.linkOffsetY = -150;
    
        this.label = new GUI.TextBlock();
        this.label.text = "Sphere";
        this.label.fontSize = "50px"
        this.backgroundRectangle.addControl(this.label);
    
        this.meshTag = new GUI.Ellipse();
        this.meshTag.width = "40px";
        this.meshTag.height = "40px";
        this.meshTag.color = "Orange";
        this.meshTag.thickness = 4;
        this.meshTag.background = "green";
        this.UITexture.addControl(this.meshTag);
    
        this.connectorLine =  new GUI.Line();
        this.connectorLine.lineWidth = 4;
        this.connectorLine.color = "Orange";
        this.connectorLine.y2 = 20;
        this.connectorLine.linkOffsetY = -20;
        this.UITexture.addControl(this.connectorLine);

        this.connectorLine.connectedControl = this.backgroundRectangle;  

        this.setVisible(false);

    }

    // TODO: Repeated code in conversation component, needs moving.
    calculatePixel(mesh:BABYLON.Mesh) {
        //note: "engine" is your babylonjs engine variable
        //note: "camera" is the camera variable, optionally you can pass the camera as function parameter (change this function to accept second parameter)
        const temp = new BABYLON.Vector3();
        const vertices = mesh.getBoundingInfo().boundingBox.vectorsWorld;
        const viewport = SceneViewer.camera.viewport.toGlobal(SceneViewer.engine.getRenderWidth(), SceneViewer.engine.getRenderHeight());
        let minX = 1e10, minY = 1e10, maxX = -1e10, maxY = -1e10;
        for (const vertex of vertices) {
            BABYLON.Vector3.ProjectToRef(vertex, BABYLON.Matrix.IdentityReadOnly, SceneViewer.scene.getTransformMatrix(), viewport, temp);
            if (minX > temp.x) minX = temp.x;
            if (maxX < temp.x) maxX = temp.x;
            if (minY > temp.y) minY = temp.y;
            if (maxY < temp.y) maxY = temp.y;
        }
        //console.log("maxX-minX",(maxX-minX));
        //console.log("maxY-minY",(maxY-minY));
        let x = (maxX-minX)
        let y = (maxY-minY);
        if (y >= SceneViewer.engine.getRenderHeight()) {
            y = 100;
        }

        return {"x":x, "y":y}
    }

    setVisible(value:boolean) {
        if (this.enabled == false) value = false;
        this.backgroundRectangle.isVisible = value;
        this.label.isVisible = value;
        this.meshTag.isVisible = value;
        this.connectorLine.isVisible = value
    }

    linkWithMesh(mesh:BABYLON.Mesh | BABYLON.AbstractMesh,name?:string) {

        if (this.enabled == false) return;
        if (name) {
            this.label.text = name;
        }
        else {
            this.label.text = mesh.name;
        }
        this.setVisible(true);
        this.connectorLine.linkWithMesh(mesh);
        this.meshTag.linkWithMesh(mesh);
        this.backgroundRectangle.linkWithMesh(mesh);
        let asMesh = mesh as BABYLON.Mesh
        let offset = this.calculatePixel(asMesh);   
        this.backgroundRectangle.linkOffsetY = - offset.y / 2;     
    }


}

export class SceneViewer {

    canvas:HTMLCanvasElement;
    static scene:BABYLON.Scene;
    static heroMesh:BABYLON.Mesh;
    static pointer:BABYLON.Mesh;
    static engine:BABYLON.Engine;
    static player:Player;
    static camera:BABYLON.FreeCamera;
    mainLight:BABYLON.HemisphericLight;
    fileLoader:GLTFFileLoader;
    loadedModel:BABYLON.Scene
    currentTarget:number;
    static havokPlugin:BABYLON.HavokPlugin;
    static inventory:pInventory;

    static framesPerSecond:number;
    static gravity:number;

    static tagBillBoard:TagBillboard;

    // DEBUG
    distanceTracker:HTMLElement;

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        SceneViewer.engine = new BABYLON.Engine(this.canvas);
        SceneViewer.engine.setHardwareScalingLevel(1.3);
        SceneViewer.scene = new BABYLON.Scene(SceneViewer.engine);
        //SceneViewer.camera = new MainCamera('main-camera',new BABYLON.Vector3(8.88988495700036,5.39056883665061,1.260390443856567));
        //SceneViewer.camera.setTarget(new BABYLON.Vector3(7.892032691165552,5.355046364537239,1.205354059244245))
        SceneViewer.inventory = new pInventory();
        SceneViewer.framesPerSecond = 60;
        SceneViewer.gravity = -20;

        // DEBUG
        this.distanceTracker = document.getElementById('distance-tracker') as HTMLElement;

        HavokPhysics().then((havokInstance) => {

            // PHYSICS
            SceneViewer.havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
            SceneViewer.scene.gravity = new BABYLON.Vector3(0,SceneViewer.gravity / SceneViewer.framesPerSecond,0)
            SceneViewer.scene.collisionsEnabled = true;
            SceneViewer.scene.enablePhysics(new BABYLON.Vector3(0, -.75, 0),SceneViewer.havokPlugin);
    
            // PLAYER
            SceneViewer.player = new Player(SceneViewer.scene);
            SceneViewer.camera = SceneViewer.player.camera;

            // Tag Billboard System
            SceneViewer.tagBillBoard = new TagBillboard(true);


            var myGround = BABYLON.MeshBuilder.CreateGround("myGround", {width: 200, height: 200}, SceneViewer.scene);
            myGround.isPickable = false;
            myGround.checkCollisions= true;
            let groundMat = new BABYLON.StandardMaterial('groundmat');
            myGround.material = groundMat;
            groundMat.alpha = 0.01;
            const groundAggregate = new BABYLON.PhysicsAggregate(myGround, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, SceneViewer.scene);
    
            window["camera"] = SceneViewer.camera;
            this.mainLight = new BABYLON.HemisphericLight('main-light',BABYLON.Vector3.Zero());
            let graphics = new GraphicsConfig();
    
            // HARDWARE SCALING
            let hardwareScalingInput = document.getElementById("hardware-scaling-range") as HTMLInputElement;
            hardwareScalingInput.value = GraphicsConfig.hardwareScaling.toString();
            console.log(GraphicsConfig.hardwareScaling);
            hardwareScalingInput.addEventListener('input',() =>{
                GraphicsConfig.setValue("hardwareScaling",parseFloat(hardwareScalingInput.value));
                SceneViewer.engine.setHardwareScalingLevel(GraphicsConfig.hardwareScaling);
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
    
            this.fileLoader = new GLTFFileLoader();    
                
            SceneViewer.engine.runRenderLoop(() => {
                SceneViewer.scene.render();
            });
        
            SceneViewer.scene.onBeforeRenderObservable.add(() => {
    
    
            })
    
            ModelLoader.LoadModel("hallway",SceneViewer.scene,false).then((mesh) => {
                mesh.scaling = new BABYLON.Vector3(1.8,1.8,1.8);
            });
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

            let gameObj = new GameObject("Collectable",SceneViewer.scene,BABYLON.MeshBuilder.CreateBox('Collectable'),"Collectable");
            gameObj.icon = new URL('../media/images/red-box.png',import.meta.url).pathname;
            let Collectable = new CollectableComponent("Boxy",gameObj);
            gameObj.addComponent(Collectable);

            let collectableBox = new GameObject("Collectable",SceneViewer.scene,BABYLON.MeshBuilder.CreateBox('Collectable'),"Collectable");
            collectableBox.icon = new URL('../media/images/yellow-box.png',import.meta.url).pathname;
            let CollectableBoxComp = new CollectableComponent("Boxy",collectableBox);
            collectableBox.addComponent(CollectableBoxComp);
            let collectablePhysics = new BABYLON.PhysicsAggregate(collectableBox.mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.1, restitution: 0.75 }, SceneViewer.scene);


            let collectMat = new BABYLON.StandardMaterial('myguuyMat');
            collectMat.diffuseColor = new BABYLON.Color3(1,1,0);
            collectableBox.mesh.material = collectMat
            
            ModelLoader.AppendModel('frog',SceneViewer.scene).then((mesh) => {
                let gameObj2 = new GameObject("Talk",SceneViewer.scene, mesh,"Talkable");
                let conversationComponent = new ConversationComponent(['Sometimes I get sad.','But you know..',"I'm just a frog."],gameObj2.mesh);
                gameObj2.addComponent(conversationComponent)
                gameObj2.setPosition(new BABYLON.Vector3(0,2,0))
                gameObj2.setScale(new BABYLON.Vector3(10,10,10))
                window.setInterval(() => {
                    gameObj2.mesh.rotation.y += 0.01;
                },10)
            })

            ModelLoader.AppendModel('skull',SceneViewer.scene).then((mesh:BABYLON.Mesh) => {
                let skullObject = new GameObject("Talk",SceneViewer.scene, mesh,"Talkable");
                let conversationComponent = new ConversationComponent(["Yo lol.","I'm literally a skull.","Why you asking me for?"],skullObject.mesh);
                skullObject.addComponent(conversationComponent)
                skullObject.setPosition(new BABYLON.Vector3(5,0,5))
                skullObject.setScale(new BABYLON.Vector3(100,100,100));
            })

            let gameObj3 = new GameObject("Interactable",SceneViewer.scene,BABYLON.MeshBuilder.CreateBox('Image Component'),"Interactable");
            let img = new URL('../media/images/thumb.png',import.meta.url).pathname;
            let images = [img];
            let imageComponent = new ImageComponent(images);
            gameObj3.addComponent(imageComponent)
            gameObj.setPosition(new BABYLON.Vector3(19.738227838967664, 4.510000029802313, 40.82344504740288))
            collectableBox.setPosition(new BABYLON.Vector3(19.738227838967664, 4.510000029802313, 38.82344504740288));
            gameObj3.setPosition(new BABYLON.Vector3(16.738227838967664, 4.510000029802313, 40.82344504740288));
            let mat = new BABYLON.StandardMaterial('myguuyMat');
            mat.diffuseColor = new BABYLON.Color3(1,0,0);
            gameObj.mesh.material = mat;
    
            let highlightLayer = new BABYLON.HighlightLayer('hl-l',SceneViewer.scene);
            let highlightedMeshes:BABYLON.Mesh[] = [];
                
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

                            if (activeTarget.type == "Interactable" || activeTarget.type == "Talkable") {

                                if (!activeTarget.component.canInteract) return;
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
    
    
                let bubbleParent = (mesh) => {
                    
                    while (mesh.parent !== null) {
                        mesh = mesh.parent;
                    }
                    return mesh;
                }
            
                SceneViewer.player.pointer.position = SceneViewer.camera.getTarget();

                let target = SceneViewer.camera.getTarget();
                let ray = BABYLON.Ray.CreateNewFromTo(SceneViewer.camera.position,target);
                ray.length = 100;

                let hit = SceneViewer.scene.pickWithRay(ray);
                highlightLayer.removeAllMeshes();
                if (hit.pickedMesh) {
                    let highlightDistance = 15;
                    // DEBUG
                    // let sphere = BABYLON.MeshBuilder.CreateSphere('sppp',{diameter:0.1});
                    // sphere.isPickable = false;
                    // sphere.position = hit.pickedPoint.clone();
                    let distance = BABYLON.Vector3.Distance(SceneViewer.camera.position, hit.pickedPoint);
                    this.distanceTracker.innerText = distance.toString();
                    if (distance > highlightDistance)
                    return;

                    let mesh = hit.pickedMesh as BABYLON.Mesh;
                    let foundParent = bubbleParent(mesh);
                    if (foundParent) {
                        let gameObject = foundParent as GameObject;
                        let minDistance = 10;
                        let canInteract:boolean = false;
                        if (!gameObject || !gameObject.component) return;
                        if (gameObject.component.canInteract == false) return;

                        if ( gameObject.type == "Interactable" || gameObject.type == "Collectable" || gameObject.type == "Talkable") {

                            highlightLayer.isEnabled = true;
                            let parent = mesh.parent;
                            if (!parent) return;
                            let meshes = parent.getChildMeshes();

                            meshes.forEach(mesh => {
                                highlightLayer.addMesh(mesh, new BABYLON.Color3(1, 1, 0));
                            })

                            // LINK WITH MESH
                            SceneViewer.tagBillBoard.linkWithMesh(meshes[0],gameObject.name);
                            if (BABYLON.Vector3.Distance(SceneViewer.camera.position, hit.pickedPoint) < minDistance) {

                                switch(gameObject.type) {
                                    case "Collectable":
                                        SceneViewer.player.handController.setHandMode(HandMode.grab,0);
                                        canInteract = true;
                                        activeTarget = gameObject;
                                        break;
                                    case "Talkable":
                                        SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                                        canInteract = true;
                                        activeTarget = gameObject;
                                        break;
                                    default:
                                        SceneViewer.player.handController.setHandMode(HandMode.grab,0);
                                        canInteract = true;
                                        activeTarget = gameObject;
                                        break;

                                }
                            }
                            else {
                                SceneViewer.player.handController.setHandMode(HandMode.idle,0);
                                canInteract = false;
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
                    SceneViewer.tagBillBoard.setVisible(false);

                    SceneViewer.player.handController.setHandMode(HandMode.idle,0,false);
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
            //let colorTable = new URL('./lut-posterized.png',import.meta.url).pathname;
            //let colorCorrectionProcess = new BABYLON.ColorCorrectionPostProcess("color-correction",colorTable,1.0,SceneViewer.camera);
    
    
        });

        
    }
}