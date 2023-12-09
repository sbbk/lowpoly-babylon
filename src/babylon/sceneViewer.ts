import * as BABYLON from "@babylonjs/core"
import { GLTFFileLoader } from "@babylonjs/loaders";
import { GraphicsConfig, ModelLoader } from "../media/models/modelImporter";
import HavokPhysics from "@babylonjs/havok";
import { QuestSystem } from "../components/Quest"
import { Prefab } from "../data/prefabs/CreatePrefab";
import { Entity, iGameComponent } from "../components/Entity";
import { pInventory } from "../components/InventoryComponent";
import { Player } from "../player/Player";
import { TagBillboard } from "../gui/TagBillboard";
import { EntityParser } from "../data/EntityParser";
import { InteractionManager } from "./InteractionManager";
import { PrefabSpawner } from "../builder/PrefabSpawner";
const items = require("../data/prefabs/prefabs.json");

export type GameMode = "Play" | "Build"

export class SceneViewer {

    static canvas:HTMLCanvasElement;
    static scene:BABYLON.Scene;

    static questManager:QuestSystem.QuestManager;
    static pointer:BABYLON.Mesh;
    static engine:BABYLON.Engine;
    static player:Player;
    fileLoader:GLTFFileLoader;
    loadedModel:BABYLON.Scene
    currentTarget:number;
    static interactionManager:InteractionManager;
    static inventory:pInventory;
    
    // PHYSICS
    static havokPlugin:BABYLON.HavokPlugin;
    static framesPerSecond:number;
    static gravity:number;
    static physicsViewer:BABYLON.PhysicsViewer

    static tagBillBoard:TagBillboard;

    // Game Objects & Components
    static gameObjects:Entity[];
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

    // Modes & Observers
    static GameMode:GameMode;

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
        SceneViewer.questManager = new QuestSystem.QuestManager();

        // Highlight Layer & Interaction.
        SceneViewer.highlightLayer = new BABYLON.HighlightLayer('hl-l',SceneViewer.scene);
        SceneViewer.highlightedMeshes = [];
        SceneViewer.highlightDistance = 15;
        SceneViewer.interactDistance = 10;
        this.initSkyBox();

        window['gameObjects'] = SceneViewer.gameObjects;
        window['scene'] = SceneViewer.scene;

        // DEBUG

        HavokPhysics().then((havokInstance) => {

            // PHYSICS
            SceneViewer.havokPlugin = new BABYLON.HavokPlugin(false, havokInstance);
            SceneViewer.scene.gravity = new BABYLON.Vector3(0,SceneViewer.gravity / SceneViewer.framesPerSecond,0)
            SceneViewer.scene.collisionsEnabled = true;
            SceneViewer.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0),SceneViewer.havokPlugin);
            SceneViewer.havokPlugin.setTimeStep(1 / SceneViewer.scene.getEngine().getFps());
            // PLAYER
            let heroMesh = BABYLON.Mesh.CreateBox('hero-mesh', 2.0, SceneViewer.scene, false, BABYLON.Mesh.FRONTSIDE);
            SceneViewer.player = new Player("Hero","Hero",SceneViewer.scene,heroMesh,false,"HERO_PLAYER");
            SceneViewer.interactionManager = new InteractionManager();

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
            SceneViewer.physicsViewer = new BABYLON.PhysicsViewer(SceneViewer.scene);
            let spawner = new PrefabSpawner();


            SceneViewer.setGameMode("Play");


            // Tag Billboard System
            SceneViewer.tagBillBoard = new TagBillboard(true);


            var myGround = BABYLON.MeshBuilder.CreateBox('ground',{width:100,depth:100,height:2});
            myGround.renderingGroupId = 0;

            myGround.position.y = -20;
            myGround.isPickable = false;
            myGround.checkCollisions= true;
            let groundMat = new BABYLON.StandardMaterial('groundmat');
            myGround.material = groundMat;
            //groundMat.alpha = 0.01;
            const groundAggregate = new BABYLON.PhysicsAggregate(myGround, BABYLON.PhysicsShapeType.BOX, { mass: 0,friction:10, restitution:0.01 }, SceneViewer.scene);
            // SceneViewer.physicsViewer.showBody(groundAggregate.body)
            //groundAggregate.body.setCollisionCallbackEnabled(true);

    
            window["camera"] = SceneViewer.camera;
            this.mainLight = new BABYLON.HemisphericLight('main-light',BABYLON.Vector3.Zero());
            let graphics = new GraphicsConfig();
    
            // HARDWARE SCALING
            // let hardwareScalingInput = document.getElementById("hardware-scaling-range") as HTMLInputElement;
            // hardwareScalingInput.value = GraphicsConfig.hardwareScaling.toString();
            // console.log(GraphicsConfig.hardwareScaling);
            // hardwareScalingInput.addEventListener('input',() =>{
            //     GraphicsConfig.setValue("hardwareScaling",parseFloat(hardwareScalingInput.value));
            //     SceneViewer.engine.setHardwareScalingLevel(GraphicsConfig.hardwareScaling);
            //     console.log(GraphicsConfig.hardwareScaling);
            // })
    
            // // JITTER
            // let jitterInput = document.getElementById("jitter-level-range") as HTMLInputElement;
            // jitterInput.value = GraphicsConfig.jitterAmplitude.toString();
            // jitterInput.addEventListener('input',() =>{
            //     GraphicsConfig.setValue("jitterAmplitude",parseFloat(jitterInput.value));
            // })
    
            // // DITHER
            // let ditherLightnessInput = document.getElementById("dither-lightness-range") as HTMLInputElement;
            // ditherLightnessInput.value = GraphicsConfig.ditherLightenFactor.toString();
            // ditherLightnessInput.addEventListener('input',() =>{
            //     GraphicsConfig.setValue("ditcherDarkenRatio",parseFloat(ditherLightnessInput.value));
            //     SceneViewer.scene.markAllMaterialsAsDirty(BABYLON.Constants.MATERIAL_AllDirtyFlag);
            // })
            // let ditherDarknessInput = document.getElementById("dither-darkness-range") as HTMLInputElement;
            // ditherDarknessInput.value = GraphicsConfig.ditherDarkenFactor.toString();
            // ditherDarknessInput.addEventListener('input',() =>{
            //     GraphicsConfig.setValue("ditcherDarkenRatio",parseFloat(ditherDarknessInput.value));
            //     SceneViewer.scene.markAllMaterialsAsDirty(BABYLON.Constants.MATERIAL_AllDirtyFlag);
    
            // })
    
            this.fileLoader = new GLTFFileLoader();    
                
            SceneViewer.engine.runRenderLoop(() => {
                SceneViewer.scene.render();
            });

            window.addEventListener("resize", function () {
                SceneViewer.engine.resize();
            });

            // Prefab.CreatePrefab(0).then((vinylObject) => {});
            // Prefab.CreatePrefab(1).then((frogMan) => {});
            // Prefab.CreatePrefab(2).then((ballSocket) => {});
            // Prefab.CreatePrefab(9)
            // Prefab.CreatePrefab(10).then((kickButton) => {})
            // Prefab.CreatePrefab(11).then(() => {})
            // Prefab.CreatePrefab(12).then((hatsButton) => {})
            // Prefab.CreatePrefab(3).then((main_entry_door) => {
            //     Prefab.CreatePrefab(6);
            //     Prefab.CreatePrefab(7);
            // });
            // Prefab.CreatePrefab(5);
            // Prefab.CreatePrefab(8);
            // Prefab.CreatePrefab(14).then((valve) => {});
            // Prefab.CreatePrefab(13).then((valve) => {});

            // ModelLoader.AppendModel("ArcadeMachine",SceneViewer.scene);
            // ModelLoader.AppendModel("SmallCity",SceneViewer.scene);
            // ModelLoader.AppendModel("VendingMachine",SceneViewer.scene);
                
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
            EntityParser.exportData();
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

    static setGameMode(mode:GameMode) {

        // Remove existing game mode observers.
        if (SceneViewer.interactionManager.PointerObservableFunction !== null) {
            SceneViewer.scene.onPointerObservable.remove(SceneViewer.interactionManager.PointerObservableFunction);
        }
        if (!SceneViewer.interactionManager.RegisterBeforeRenderFunction !== null) {
            SceneViewer.scene.onBeforeRenderObservable.remove(SceneViewer.interactionManager.RegisterBeforeRenderFunction)
        }

        switch(mode) {
            case "Play":
                SceneViewer.UtilityLayer.shouldRender = false;
                SceneViewer.camera = SceneViewer.player.camera;
                SceneViewer.scene.activeCamera = SceneViewer.player.camera;
                SceneViewer.interactionManager.registerPlayerPointers();
                SceneViewer.interactionManager.registerPlayerBeforeRenderFunction();
                SceneViewer.player.handController.setEnabled(true);
                break;
            case "Build":
                SceneViewer.UtilityLayer.shouldRender = true;
                SceneViewer.camera = SceneViewer.buildCamera;
                SceneViewer.scene.activeCamera = SceneViewer.buildCamera;
                SceneViewer.scene.setActiveCameraById(SceneViewer.buildCamera.id);
                SceneViewer.interactionManager.registerBuildPointers();
                SceneViewer.interactionManager.registerBuildBeforeRenderFunction();
                if (SceneViewer.tagBillBoard) {
                    SceneViewer.tagBillBoard.setVisible(false);
                }
                SceneViewer.player.handController.setEnabled(false);
                break;
            }
            
        SceneViewer.GameMode = mode;
        SceneViewer.camera.attachControl(true);
        // SceneViewer.scene.onDataLoadedObservable.add(() => {
        //     var serializedScene = BABYLON.SceneSerializer.Serialize(SceneViewer.scene);
            
        //     let filename = 'scene';
        //     // here is the serialized scene
        //     let objectUrl;
        //     if (confirm('Do you want to download that scene?')) {
        //         if(objectUrl) {
        //             window.URL.revokeObjectURL(objectUrl);
        //         }
                
        //         var serializedScene = BABYLON.SceneSerializer.Serialize(SceneViewer.scene);
                    
        //         var strMesh = JSON.stringify(serializedScene);
                
        //         if (filename.toLowerCase().lastIndexOf(".babylon") !== filename.length - 8 || filename.length < 9){
        //             filename += ".babylon";
        //         }
                        
        //         var blob = new Blob ( [ strMesh ], { type : "octet/stream" } );
                   
        //         // turn blob into an object URL; saved as a member, so can be cleaned out later
        //         objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);
                
        //         var link = window.document.createElement('a');
        //         link.href = objectUrl;
        //         link.download = filename;
        //         var click = document.createEvent("MouseEvents");
        //         click.initEvent("click", true, false);
        //         link.dispatchEvent(click);              
        //     } else {
        //         // Do nothing!
        //     }
        // })

    }

}