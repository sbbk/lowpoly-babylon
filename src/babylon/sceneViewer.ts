import * as BABYLON from "@babylonjs/core"
import { jsx } from "@vertx/jsx";
import { GLTFFileLoader } from "@babylonjs/loaders";
import { GraphicsConfig, ModelLoader } from "../media/models/modelImporter";
import { ShaderManager } from "./shaders/shaderManager";

export class MainCamera extends BABYLON.ArcRotateCamera {

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

export class SceneViewer {

    canvas:HTMLCanvasElement;
    scene:BABYLON.Scene;
    engine:BABYLON.Engine;
    camera:MainCamera;
    mainLight:BABYLON.HemisphericLight;
    fileLoader:GLTFFileLoader;
    loadedModel:BABYLON.Scene

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas);
        window["engine"] = this.engine;
        this.engine.setHardwareScalingLevel(2);
        this.scene = new BABYLON.Scene(this.engine);
        window["scene"] = this.scene;
        this.camera = new MainCamera('main-camera',Math.PI / 2, Math.PI / -2, 10, BABYLON.Vector3.Zero());
        window["camera"] = this.camera;
        this.mainLight = new BABYLON.HemisphericLight('main-light',BABYLON.Vector3.Zero());
        let graphics = new GraphicsConfig();

        // HARDWARE SCALING
        let hardwareScalingInput = document.getElementById("hardware-scaling-range") as HTMLInputElement;
        hardwareScalingInput.value = GraphicsConfig.hardwareScaling.toString();
        hardwareScalingInput.addEventListener('input',() =>{
            GraphicsConfig.setValue("hardwareScaling",parseFloat(hardwareScalingInput.value));
            this.engine.setHardwareScalingLevel(GraphicsConfig.hardwareScaling);
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


        this.scene.registerBeforeRender(() => {
            // Get the camera forward vector
        });
            
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    
        this.scene.onBeforeRenderObservable.add(() => {

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
        ModelLoader.LoadAllModels(this.scene);
    
        

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
        //let colorTable = new URL('./lut-posterized.png',import.meta.url).pathname;
        //let colorCorrectionProcess = new BABYLON.ColorCorrectionPostProcess("color-correction",colorTable,1.0,this.camera);


        
    }
}