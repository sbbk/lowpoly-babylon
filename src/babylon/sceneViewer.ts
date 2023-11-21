import * as BABYLON from "@babylonjs/core"
import { GLTFFileLoader } from "@babylonjs/loaders";
import { GraphicsConfig } from "../media/models/modelImporter";
import HavokPhysics from "@babylonjs/havok";
import { QuestSystem } from "../components/Quest"
import { Prefab } from "../data/prefabs/CreatePrefab";
import { GameObject, iGameComponent } from "../components/GameObject";
import { pInventory } from "../components/InventoryComponent";
import { ConversationComponent } from "../components/ConversationComponent";
import { Player } from "../player/Player";
import { HandMode } from "../player/HandController";
import { TagBillboard } from "../gui/TagBillboard";
import { GameObjectParser } from "../data/GameObjectParser";
const items = require("../data/prefabs/prefabs.json");

export type GameMode = "Play" | "Build"

export class SceneViewer {

    static canvas:HTMLCanvasElement;
    static scene:BABYLON.Scene;

    static questManager:QuestSystem.QuestManager;
    static heroMesh:BABYLON.Mesh;
    static pointer:BABYLON.Mesh;
    static engine:BABYLON.Engine;
    static player:Player;
    fileLoader:GLTFFileLoader;
    loadedModel:BABYLON.Scene
    currentTarget:number;
    static havokPlugin:BABYLON.HavokPlugin;
    static inventory:pInventory;

    static framesPerSecond:number;
    static gravity:number;

    static tagBillBoard:TagBillboard;

    // Game Objects & Components
    static gameObjects:GameObject[];
    static activeComponent:iGameComponent;
    static activeSynths:string[];

    // Rendering & Utilities
    static camera:BABYLON.FreeCamera | BABYLON.ArcRotateCamera;
    mainLight:BABYLON.HemisphericLight;
    
    // Highlight Layer.
    static highlightLayer:BABYLON.HighlightLayer
    static highlightedMeshes:BABYLON.Mesh[];
    static highlightDistance:number;
    static interactDistance:number;

    // DEBUG
    static distanceTracker:HTMLElement;

    // Modes & Observers
    static GameMode:GameMode;
    static DisablePointerLock:boolean = false;
    static PointerObservableFunction:BABYLON.Observer<BABYLON.PointerInfo>
    static RegisterBeforeRenderFunction:BABYLON.Observer<BABYLON.Scene>;

    // Build Mode
    static buildCamera:BABYLON.ArcRotateCamera;
    static UtilityLayer:BABYLON.UtilityLayerRenderer;
    static positionGizmo:BABYLON.PositionGizmo;
    static scaleGizmo:BABYLON.ScaleGizmo;
    static rotationGizmo:BABYLON.RotationGizmo;



    constructor(canvas:HTMLCanvasElement) {
        SceneViewer.canvas = canvas;
        SceneViewer.engine = new BABYLON.Engine(SceneViewer.canvas);
        SceneViewer.engine.setHardwareScalingLevel(1.3);
        SceneViewer.scene = new BABYLON.Scene(SceneViewer.engine);
        //SceneViewer.camera = new MainCamera('main-camera',new BABYLON.Vector3(8.88988495700036,5.39056883665061,1.260390443856567));
        //SceneViewer.camera.setTarget(new BABYLON.Vector3(7.892032691165552,5.355046364537239,1.205354059244245))
        SceneViewer.inventory = new pInventory();
        SceneViewer.framesPerSecond = 60;
        SceneViewer.gravity = -30;
        SceneViewer.gameObjects = [];
        SceneViewer.activeSynths = [];
        SceneViewer.GameMode = "Play";
        SceneViewer.questManager = new QuestSystem.QuestManager();

        // Highlight Layer & Interaction.
        SceneViewer.highlightLayer = new BABYLON.HighlightLayer('hl-l',SceneViewer.scene);
        SceneViewer.highlightedMeshes = [];
        SceneViewer.highlightDistance = 15;
        SceneViewer.interactDistance = 10;
        SceneViewer.distanceTracker = document.getElementById('distance-tracker') as HTMLElement;
        this.initSkyBox();

        window['gameObjects'] = SceneViewer.gameObjects;
        window['scene'] = SceneViewer.scene;

        // DEBUG

        HavokPhysics().then((havokInstance) => {

            // PHYSICS
            SceneViewer.havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
            SceneViewer.scene.gravity = new BABYLON.Vector3(0,SceneViewer.gravity / SceneViewer.framesPerSecond,0)
            SceneViewer.scene.collisionsEnabled = true;
            SceneViewer.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0),SceneViewer.havokPlugin);
            SceneViewer.havokPlugin.setTimeStep(1 / SceneViewer.scene.getEngine().getFps());
            // PLAYER
            SceneViewer.player = new Player(SceneViewer.scene);

            // CAMERAS
            SceneViewer.camera = SceneViewer.player.camera;
            SceneViewer.buildCamera = new BABYLON.ArcRotateCamera('build-cam',0,0,10,new BABYLON.Vector3(0,0,0));
            SceneViewer.UtilityLayer = new BABYLON.UtilityLayerRenderer(SceneViewer.scene);
            SceneViewer.positionGizmo = new BABYLON.PositionGizmo(SceneViewer.UtilityLayer);
            SceneViewer.scaleGizmo = new BABYLON.ScaleGizmo(SceneViewer.UtilityLayer);
            SceneViewer.rotationGizmo = new BABYLON.RotationGizmo(SceneViewer.UtilityLayer);
            SceneViewer.positionGizmo.updateGizmoRotationToMatchAttachedMesh = false;
            SceneViewer.scaleGizmo.updateGizmoRotationToMatchAttachedMesh = false;
            SceneViewer.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = false;


            SceneViewer.setGameMode("Play");


            // Tag Billboard System
            SceneViewer.tagBillBoard = new TagBillboard(true);


            var myGround = BABYLON.MeshBuilder.CreateBox('ground',{width:100,depth:100,height:2});
            myGround.position.y = -20;
            myGround.isPickable = false;
            myGround.checkCollisions= true;
            let groundMat = new BABYLON.StandardMaterial('groundmat');
            myGround.material = groundMat;
            //groundMat.alpha = 0.01;
            const groundAggregate = new BABYLON.PhysicsAggregate(myGround, BABYLON.PhysicsShapeType.BOX, { mass: 0,friction:10, restitution:0.01 }, SceneViewer.scene);
            groundAggregate.body.setCollisionCallbackEnabled(true);

    
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

            window.addEventListener("resize", function () {
                SceneViewer.engine.resize();
            });

    
            // ModelLoader.LoadModel("hallway",SceneViewer.scene,false).then((mesh) => {
            //     mesh.scaling = new BABYLON.Vector3(1.8,1.8,1.8);
            // });
            var isLocked = false;
	
            // On click event, request pointer lock
            SceneViewer.scene.onPointerDown = function (evt) {
                
                //true/false check if we're locked, faster than checking pointerlock on each single click.
                if (!isLocked && SceneViewer.GameMode == "Play" && SceneViewer.DisablePointerLock == false) {
                    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                    if (canvas.requestPointerLock) {
                        canvas.requestPointerLock();
                    }
                }
            }

            // let synthComponent = new SynthComponent();
            // let synthObject = new GameObject("SynthPad",SceneViewer.scene,BABYLON.MeshBuilder.CreateCapsule('Synth'));
            // let synthPad = new SynthPad(synthComponent,"Synth",synthObject,1);
            // synthObject.addComponent(synthPad);
            // synthObject.setActiveComponent(synthPad)
            // synthObject.setPosition(new BABYLON.Vector3(3,0,0))

            // let collectMat = new BABYLON.StandardMaterial('myguuyMat');
            // collectMat.diffuseColor = new BABYLON.Color3(1,1,0);
            // collectableBox.mesh.material = collectMat

            Prefab.CreatePrefab(0).then((vinylObject) => {});
            Prefab.CreatePrefab(1).then((frogMan) => {});
            // Prefab.CreatePrefab(2).then((ballSocket) => {});

            // let onionLimit = 50;
            // for (let i=0; i < onionLimit;i++) {
            //     Prefab.CreatePrefab(4);
            // }
            Prefab.CreatePrefab(3).then((main_entry_door) => {});
            Prefab.CreatePrefab(5);
            Prefab.CreatePrefab(6);
            Prefab.CreatePrefab(7);
            Prefab.CreatePrefab(8);

            //let socketRope = new SocketRope();
            
            // ModelLoader.AppendModel('skull',SceneViewer.scene).then((mesh:BABYLON.Mesh) => {
            //     let skullObject = new GameObject(10,"Talk",SceneViewer.scene, mesh);

            //     let conversation = [
            //         {
            //             "id": "0",
            //             "speaker": "npc",
            //             "text": ["Hello, how are you today?","Champ?"],
            //             "target":"1"
            //         },
            //         {
            //             "id": "1",
            //             "speaker": "player",
            //             "choices": [
            //                 {
            //                     "text": "And you?",
            //                     "target": "5"
            //                 },
            //                 {
            //                     "text": "Got any quests?",
            //                     "target": "6"
            //                 },
            //                 {
            //                     "text": "Can I ask you something?",
            //                     "target": "7"
            //                 }
            //             ]
            //         },
            //         {
            //             "id": "5",
            //             "speaker": "npc",
            //             "text": ["I'm good too, thanks for asking."]
            //         },
            //         {
            //             "id": "6",
            //             "speaker": "npc",
            //             "text": ["I sure do. Can you find my records for me?"],
            //             "actionName":"QuestSystem:AssignCollectQuest",
            //             "actionData":0
            //         },
            //         {
            //             "id": "7",
            //             "speaker": "npc",
            //             "text": ["Sure, what do you want to know?"]
            //         }
            //     ]

            //     let conversationComponent = new ConversationComponent(conversation,"Talkable",skullObject.mesh);
            //     skullObject.addComponent(conversationComponent);
            //     skullObject.setActiveComponent(conversationComponent)
            //     skullObject.setPosition(new BABYLON.Vector3(5,0,5))
            //     skullObject.setScale(new BABYLON.Vector3(100,100,100));
            // })

            // let gameObj3 = new GameObject("Interactable",SceneViewer.scene,BABYLON.MeshBuilder.CreateBox('Image Component'));
            // let img = new URL('../media/images/thumb.png',import.meta.url).pathname;
            // let images = [img];
            // let imageComponent = new ImageComponent(images,"Interactable");
            // gameObj3.addComponent(imageComponent);
            // gameObj3.setActiveComponent(imageComponent)
            // gameObj.setPosition(new BABYLON.Vector3(19.738227838967664, 4.510000029802313, 40.82344504740288))
            // collectableBox.setPosition(new BABYLON.Vector3(19.738227838967664, 4.510000029802313, 38.82344504740288));
            // gameObj3.setPosition(new BABYLON.Vector3(16.738227838967664, 4.510000029802313, 40.82344504740288));
            // let mat = new BABYLON.StandardMaterial('myguuyMat');
            // mat.diffuseColor = new BABYLON.Color3(1,0,0);
            // gameObj.mesh.material = mat;
                
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
        
            var postProcess = new BABYLON.PostProcess("My custom post process", "custom", ["screenSize", "threshold"], null, 0.25, SceneViewer.player.camera);
            postProcess.onApply = function (effect) {
                effect.setFloat2("screenSize", postProcess.width, postProcess.height);
                effect.setFloat("threshold", 1.0);
            };        
            //let colorTable = new URL('./lut-posterized.png',import.meta.url).pathname;
            //let colorCorrectionProcess = new BABYLON.ColorCorrectionPostProcess("color-correction",colorTable,1.0,SceneViewer.camera);
    
    
        });

        let playToggle = document.getElementById('play-mode');
        let buildToggle = document.getElementById('build-mode');
        playToggle.addEventListener('click',() => {
            SceneViewer.setGameMode("Play");
        })
        buildToggle.addEventListener('click',() => {
            SceneViewer.setGameMode("Build");
        })

        let exportButton = document.getElementById('export-json');
        exportButton.addEventListener('click',() => {
            GameObjectParser.exportData();
        })

    }

    private initSkyBox() {
        if (!SceneViewer.scene) {
            // console.error("No Scene found to add a Skybox to!");
            return undefined;
        }
        const skyboxTex = new URL('../media/skybox/environment_gray.dds', import.meta.url).pathname;
        const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(skyboxTex, SceneViewer.scene);
        const currentSkybox = SceneViewer.scene.createDefaultSkybox(hdrTexture, true, 1000.0, 0.6, true);
    }


    static disablePointerLock(value:boolean) {

        if (value == true) {
            SceneViewer.DisablePointerLock = true;
            document.exitPointerLock();
        }
        else if(value == false) {
            SceneViewer.DisablePointerLock = false;
            //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (SceneViewer.GameMode == "Play" && SceneViewer.DisablePointerLock == false) {
                SceneViewer.canvas.requestPointerLock = SceneViewer.canvas.requestPointerLock || SceneViewer.canvas.msRequestPointerLock || SceneViewer.canvas.mozRequestPointerLock || SceneViewer.canvas.webkitRequestPointerLock;
            if (SceneViewer.canvas.requestPointerLock) {
                SceneViewer.canvas.requestPointerLock();
            }
        }
        }

    }

    static setGameMode(mode:GameMode) {

        // Remove existing game mode observers.
        if (SceneViewer.PointerObservableFunction !== null) {
            SceneViewer.scene.onPointerObservable.remove(SceneViewer.PointerObservableFunction);
        }
        if (!SceneViewer.registerPlayerBeforeRenderFunction !== null) {
            SceneViewer.scene.onBeforeRenderObservable.remove(SceneViewer.RegisterBeforeRenderFunction)
        }

        switch(mode) {
            case "Play":
                SceneViewer.UtilityLayer.shouldRender = false;
                SceneViewer.camera = SceneViewer.player.camera;
                SceneViewer.scene.activeCamera = SceneViewer.player.camera;
                SceneViewer.registerPlayerPointers();
                SceneViewer.registerPlayerBeforeRenderFunction();
                SceneViewer.player.handController.setEnabled(true);
                break;
            case "Build":
                SceneViewer.UtilityLayer.shouldRender = true;
                SceneViewer.camera = SceneViewer.buildCamera;
                SceneViewer.scene.activeCamera = SceneViewer.buildCamera;
                SceneViewer.scene.setActiveCameraById(SceneViewer.buildCamera.id);
                SceneViewer.registerBuildPointers();
                SceneViewer.registerBuildBeforeRenderFunction();
                if (SceneViewer.tagBillBoard) {
                    SceneViewer.tagBillBoard.setVisible(false);
                }
                SceneViewer.player.handController.setEnabled(false);
                break;
            }
            
        SceneViewer.GameMode = mode;
        SceneViewer.camera.attachControl(true);

    }

    static registerPlayerPointers() {
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

                        // Return if we can't interact right now.
                        if (!SceneViewer.player.currentTarget.activeComponent.canInteract) return;

                        if (SceneViewer.player.currentTarget.activeComponent.type == "Interactable" ||
                            SceneViewer.player.currentTarget.activeComponent.type == "Talkable" ||
                            SceneViewer.player.currentTarget.activeComponent.type =="OneLineConversation" ||
                            SceneViewer.player.currentTarget.activeComponent.type == "Physics" ||
                            SceneViewer.player.currentTarget.activeComponent.type == "Door" ||
                            SceneViewer.player.currentTarget.activeComponent.type == "Button"
                        ) {
                            SceneViewer.player.currentTarget.activeComponent.interact();
                            SceneViewer.activeComponent = SceneViewer.player.currentTarget.activeComponent;
                        }

                        if (SceneViewer.player.currentTarget.activeComponent.type == "Collectable") {
                            SceneViewer.player.currentTarget.activeComponent.interact();
                        }

                        if (SceneViewer.player.currentTarget.activeComponent.type == "Synth") {
                            SceneViewer.player.currentTarget.activeComponent.interact();
                            SceneViewer.activeSynths.push(SceneViewer.player.currentTarget.id);

                            console.log(SceneViewer.player.currentTarget);
                            console.log(SceneViewer.player.currentTarget.activeComponent);
                        }
                    }

                break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    // End any synths anyway..
                    for (let i=0;i<SceneViewer.activeSynths.length;i++) {

                        let foundGameObject = SceneViewer.findGameObject(SceneViewer.activeSynths[i]);
                        if (foundGameObject) {
                            foundGameObject.activeComponent.endInteract();
                            SceneViewer.activeSynths.splice(i)
                        }

                    }
                    if (SceneViewer.activeComponent) {
                        SceneViewer.activeComponent.endInteract();
                        SceneViewer.activeComponent = null;
                    }
    
                break;
            }


        })
        SceneViewer.PointerObservableFunction = playerActions;
    }

    static registerBuildPointers() {

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
        
        SceneViewer.PointerObservableFunction = buildActions;
    }

    static registerBuildBeforeRenderFunction() {

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

        SceneViewer.RegisterBeforeRenderFunction = renderLoop

    }

    static registerPlayerBeforeRenderFunction() {
        let renderLoop = SceneViewer.scene.onBeforeRenderObservable.add(() => {
    
            function findGameObjectParent(mesh: BABYLON.AbstractMesh): GameObject | null {
                // If the mesh has no parent, return null
                if (!mesh.parent) {
                  return null;
                }
                // If the parent is an instance of GameObject, return it
                if (mesh.parent instanceof GameObject) {
                return mesh.parent as GameObject;
                }
                // Otherwise, recursively call the function with the parent as the argument
                return findGameObjectParent(mesh.parent as BABYLON.AbstractMesh);
            }
        
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
                        gameObject.activeComponent.type == "Button"
                        ) 
                        {

                        if (!mesh.parent) return;
                        let meshes = mesh.parent.getChildMeshes();
                        // Highlight all the meshes in the game object.
                        SceneViewer.highlightLayer.isEnabled = true;
                        meshes.forEach(mesh => {
                            if (mesh.name == "collider") return;
                            SceneViewer.highlightLayer.addMesh(mesh, new BABYLON.Color3(1, 1, 0));
                        })

                        // Add the billboard tag.
                        SceneViewer.tagBillBoard.linkWithMesh(meshes[0],gameObject.activeComponent);
                        if (BABYLON.Vector3.Distance(SceneViewer.camera.position, hit.pickedPoint) < SceneViewer.interactDistance) {

                            switch(gameObject.activeComponent.type) {
                                case "Collectable":
                                    SceneViewer.player.handController.setHandMode(HandMode.grab,0);
                                    SceneViewer.player.currentTarget = gameObject;
                                    break;
                                case "Talkable":
                                    SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                                    SceneViewer.player.currentTarget = gameObject;
                                    break;
                                case "Synth":
                                    SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                                    SceneViewer.player.currentTarget = gameObject
                                    break;
                                case "Physics":
                                    SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                                    SceneViewer.player.currentTarget = gameObject
                                    break;
                                case "Door":
                                    SceneViewer.player.handController.setHandMode(HandMode.cash,0);
                                    SceneViewer.player.currentTarget = gameObject
                                    break;
                                default:
                                    SceneViewer.player.handController.setHandMode(HandMode.grab,0);
                                    SceneViewer.player.currentTarget = gameObject;
                                    break;

                            }
                        }
                        else {
                            SceneViewer.player.handController.setHandMode(HandMode.idle,0);
                            SceneViewer.player.currentTarget = null;
                        }


                    }
                }

            }
            if (!hit.pickedMesh) {
                
                SceneViewer.player.currentTarget = null;
                SceneViewer.tagBillBoard.setVisible(false);

                SceneViewer.player.handController.setHandMode(HandMode.idle,0,false);
                if (SceneViewer.highlightedMeshes.length > 0) {
                    SceneViewer.highlightedMeshes.forEach(mesh => {
                        SceneViewer.highlightLayer.removeMesh(mesh);
                    })
                }
                SceneViewer.highlightLayer.isEnabled = false;
            } 
        });
        SceneViewer.RegisterBeforeRenderFunction = renderLoop
    }

    static findGameObject(id:string) {

        let foundObject = SceneViewer.gameObjects.find(gameObject => gameObject.id === id);
        return foundObject;

    }
    static findGameObjectByUID(id:string) {

        let foundObject = SceneViewer.gameObjects.find(gameObject => gameObject.uid === id);
        return foundObject;

    }

}