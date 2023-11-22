// MODEL IMPORTER HELPER
import * as BABYLON from "@babylonjs/core";
import { ShaderManager } from "../../babylon/shaders/shaderManager";
import { SceneViewer } from "../../babylon/sceneViewer";

export type GraphicsConfigParamater = "ditherLightenRatio" | "ditcherDarkenRatio" | "jitterAmplitude" | "hardwareScaling"
export class GraphicsConfig {

    static ditherLightenFactor:number;
    static ditherDarkenFactor:number;
    static jitterAmplitude:number;
    static hardwareScaling:number;

    constructor() {

        GraphicsConfig.ditherDarkenFactor = 1.2;
        GraphicsConfig.ditherLightenFactor = 0.1;
        GraphicsConfig.jitterAmplitude = 0.0010;
        GraphicsConfig.hardwareScaling = 1;

    }

    static setValue(paramater:GraphicsConfigParamater,value:number) {

        switch(paramater) {
            case "ditcherDarkenRatio":
                GraphicsConfig.ditherDarkenFactor = value;
                break;
            case "ditherLightenRatio":
                GraphicsConfig.ditherLightenFactor = value;
                break;
            case "jitterAmplitude":
                GraphicsConfig.jitterAmplitude = value;
                break;
            case "hardwareScaling":
                GraphicsConfig.hardwareScaling = value;
                break;
        }
    }

}

export namespace ModelLoader {

    const scene = new URL ('./scene.glb',import.meta.url).pathname;
    const crash = new URL ('./crash/crash.glb',import.meta.url).pathname;
    const dva = new URL ('./characters/dva.glb',import.meta.url).pathname;
    const cheese = new URL ('./cheese/mesh.gltf',import.meta.url).pathname;
    const cabinet = new URL ('./metal_cabinet/mesh.gltf',import.meta.url).pathname;
    const maschine = new URL ('./maschine/mesh.gltf',import.meta.url).pathname;
    const monitor = new URL ('./monitor/mesh.gltf',import.meta.url).pathname;
    const trestle = new URL ('./trestle/mesh.gltf',import.meta.url).pathname;
    const cityScene = new URL ('./city_scene.glb',import.meta.url).pathname;
    const doom = new URL ('doom-entryway.glb',import.meta.url).pathname;
    const frog = new URL ('frog.glb',import.meta.url).pathname;
    const neonJoint = new URL ('neon-joint.glb',import.meta.url).pathname;
    const boxMan = new URL ('box-man.glb',import.meta.url).pathname;
    const hallWay = new URL ('hallway.glb',import.meta.url).pathname;
    const skull = new URL ('skull.glb',import.meta.url).pathname;
    const vinylSingle = new URL('./items/vinyl-single.glb',import.meta.url).pathname;
    const onion = new URL('./items/onion.glb',import.meta.url).pathname;

    // Weapons
    const flareGun = new URL('./flare_gun.glb',import.meta.url).pathname;


    export var LoadedModels:BABYLON.AbstractMesh[] = [];
    export var LoadedModel:BABYLON.AbstractMesh;

    export type models = "Scene" | "CityScene"| "CrashBandicoot" | "dva" | "CheesePlant" | "MetalCabinet" | "Maschine" |
    "Monitor" | "TrestleTable" | "doom" | "frog" | "neonJoint" | "boxMan" | "hallway" | "skull" | "VinylSingle" | "Onion" | "FlareGun";

    export function generateList():models[] {
        
        let models = ["CrashBandicoot","dva","CheesePlant","MetalCabinet","Maschine","Monitor","TrestleTable","doom"] as models[];
        return models;

    }

    function importModel(model:models) {
    
        switch(model) {
            case "FlareGun":
                return flareGun;
            case "Scene":
                return scene;
            case "skull":
                return skull;
            case "Onion":
                return onion;
            case "VinylSingle":
                return vinylSingle;
            case "hallway":
                return hallWay;
            case "boxMan":
                return boxMan;
            case "frog":
                return frog;
            case "neonJoint":
                return neonJoint;
            case "doom":
                return doom;
            case "CityScene":
                return cityScene
            case "CrashBandicoot":
                return crash;
            case "dva":
                return dva;
            case "CheesePlant":
                return cheese;
            case "MetalCabinet":
                return cabinet;
            case "Maschine":
                return maschine;
            case "Monitor":
                return monitor;
            case "TrestleTable":
                return trestle;
        }
    
    }

    export async function LoadAllModels(scene:BABYLON.Scene) {

        let radius = 10;
        let models = this.generateList();
        let startingVal = 1;

        const countTotalModels = new CustomEvent("modelLoader:TotalCount", { detail: { count: models.length  } })
        document.dispatchEvent(countTotalModels)

        for (let i=0;i < models.length; i++) {
            let path = importModel(models[i]);
            let loadedScene;
            BABYLON.SceneLoader.LoadAssetContainer(path, "", scene, ((container) => {
                container.addAllToScene();
                let meshes = container.meshes;
                meshes[0].scalingDeterminant = 2;
                meshes[0].checkCollisions = true;
                LoadedModels.push(container.meshes[0]);

                meshes.forEach(mesh => {
                    if (!mesh.material) return;
                    if (mesh.material.albedoTexture) {
    
                        BABYLON.Effect.ShadersStore["customVertexShader"]= "\r\n"+   
                        "precision highp float;\r\n"+
                
                        "// Attributes\r\n"+
                        "attribute vec3 position;\r\n"+
                        "attribute vec2 uv;\r\n"+
                
                        "// Uniforms\r\n"+
                        "uniform mat4 worldViewProjection;\r\n"+
                        "uniform vec3 cameraForward;\r\n"+
                        "uniform float noiseAmp;\r\n"+
                        "uniform float alphaCutoff;\r\n"+            
                
                        "// Varying\r\n"+
                        "varying vec2 vUV;\r\n"+
                
                        "void main(void) {\r\n"+
                        "    vec3 noise = vec3(0.0, 0.0, 0.0);\r\n"+
                        "    float noiseAmp = dot(cameraForward, position) * noiseAmp;\r\n"+
                        "    noise.x = sin(position.x + uv.y * 10.0) * noiseAmp;\r\n"+
                        "    noise.y = cos(position.y + uv.x * 10.0) * noiseAmp;\r\n"+
                        "    noise.z = sin(position.z + uv.x * uv.y * 10.0) * noiseAmp;\r\n"+
                        "    vec3 newPosition = position + noise;\r\n"+
                        "    gl_Position = worldViewProjection * vec4(newPosition, 1.0);\r\n"+
                
                        "    vUV = uv;\r\n"+
                        "}\r\n";
                
                    BABYLON.Effect.ShadersStore["customFragmentShader"]="\r\n"+
                       "precision highp float;\r\n"+
                
                        "varying vec2 vUV;\r\n"+
                
                        "uniform sampler2D textureSampler;\r\n"+
                        "uniform float noiseAmp;\r\n"+
                        "uniform float ditherLightenFactor;\r\n"+
                        "uniform float ditherDarkenFactor;\r\n"+
                        "uniform float alphaCutoff;\r\n"+
                
                        "// Dithering pattern\r\n"+
                        "const mat4 dither = mat4(\r\n"+
                        "    0.0,  8.0,  2.0, 10.0,\r\n"+
                        "    12.0,  4.0, 14.0,  6.0,\r\n"+
                        "    3.0, 11.0,  1.0,  9.0,\r\n"+
                        "    15.0,  7.0, 13.0,  5.0\r\n"+
                        ");\r\n"+
    
                        "void main(void) {\r\n"+
                        "   vec4 color = texture2D(textureSampler, vUV);\r\n"+
                        "   float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));\r\n"+
                        "   float threshold = dither[int(mod(gl_FragCoord.x, 4.0)), int(mod(gl_FragCoord.y, 4.0))].x / 16.0;\r\n"+
                        "    if (luminance < threshold) {\r\n"+
                    "        // Darken the color by multiplying by a factor\r\n"+
                    "        color.rgb *= ditherDarkenFactor;\r\n"+
                    "    } else {\r\n"+
                    "        // Brighten the color by adding a constant\r\n"+
                    "        color.rgb += vec3(ditherLightenFactor);\r\n"+
                    "    }\r\n"+
    
                        
                        "   float alpha = color.a;\r\n"+
                        "   if (alpha < alphaCutoff)\r\n"+
                        "    {\r\n"+
                        "   discard;\r\n"+
                        "    }\r\n"+
                        "    gl_FragColor = vec4(color.r, color.g, color.b, color.a);\r\n"+
                        "}\r\n";
                
                
                    let alphaCutoff = 0.5;
                    var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
                        vertex: "custom",
                        fragment: "custom",
                        },
                        {
                            attributes: ["position", "normal", "uv"],
                            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "cameraForward", "noiseAmp","alphaCutoff","ditherLightenFactor","ditherDarkenFactor"],
                            
    
                        });
                
    
                
                    shaderMaterial.setTexture("textureSampler", mesh.material.albedoTexture);
                    shaderMaterial.setFloat("alphaCutoff",alphaCutoff)
                    shaderMaterial.backFaceCulling = false;
                
                    mesh.material = shaderMaterial;
                    window["reset"] = () => {
                        shaderMaterial.forceCompilation(mesh);
                    }
    
                    scene.registerBeforeRender(function () {
                        // Get the camera forward vector
            
                    // var currentPosition = scene.activeCamera!.position.clone();
            
                    // // Get the distance between the previous and current position
                    // var distance = BABYLON.Vector3.Distance(previousPosition, currentPosition);
            
                    // // Get the time elapsed since the last frame in seconds
                    // var deltaTime = scene.getEngine().getDeltaTime() / 1000;
            
                    // // Calculate the speed as distance divided by time
                    // speed = distance / deltaTime;
            
                    // Update the previous position with the current position
                    //previousPosition.copyFrom(currentPosition);
            
                    var lighten = GraphicsConfig.ditherLightenFactor;
                    var darken = GraphicsConfig.ditherDarkenFactor;
                    var noiseAmp = Math.random() * GraphicsConfig.jitterAmplitude;
            
                    // var threshold = 0.05
                    // if (speed < threshold) {
                    //     noiseAmp = 0.0
                    // }
                    var cameraForward = scene.activeCamera!.getForwardRay().direction;
                    // Pass it to the shader material as a uniform variable
                    shaderMaterial.setVector3("cameraForward", cameraForward);
                    shaderMaterial.setFloat("noiseAmp", noiseAmp);
                    shaderMaterial.setFloat("ditherDarkenFactor",darken);
                    shaderMaterial.setFloat("ditherLightenFactor",lighten);
            
                });
    
                        // let shader = new ShaderManager.VertexNoiseShader(scene);
                        // shader.shaderMaterial.setTexture("shader-tex",mesh.material.albedoTexture);
                        // shader.shaderMaterial.backFaceCulling = false;
                        // mesh.material = shader.shaderMaterial;
                    }
                })

                meshes[0].normalizeToUnitCube();
                let rootNodes = container.rootNodes
                for (var mNode of rootNodes) {
                    var posVector = (new BABYLON.Vector3(radius * Math.sin(startingVal*2*Math.PI/models.length),0, radius * Math.cos(startingVal*2*Math.PI/models.length)));
                    mNode.position = posVector
                }
                startingVal+=1;
            }))
        }

        // let model = importModel("CrashBandicoot");
        // BABYLON.SceneLoader.LoadAssetContainer(model, "", scene, ((container) => {

        //     container.addAllToScene();
        //     let starting = 1
        //     for (let i=0; i < 10; i++) {
                
        //         let entries = container.instantiateModelsToScene();
        //         for (var node of entries.rootNodes) {
        //             console.log("X",radius * Math.sin(startingVal*2*Math.PI/models.length));
        //             console.log("Z",radius * Math.cos(startingVal*2*Math.PI/models.length))
        //             var posVector = new BABYLON.Vector3(radius * Math.sin(startingVal*2*Math.PI/models.length),0, radius * Math.cos(startingVal*2*Math.PI/models.length));
        //             //console.log(posVector);
        //             node.position = posVector;
        //             starting +=1
        //         }
        //         // let instance = mesh.createInstance("i" + i);
        //         // instance.normalizeToUnitCube();
        //         // instance.position = posVector.clone();
        //         // instance.position.x = i;
        //         // console.log(instance);

        //     }
        // }))
        return LoadedModels;

    }

    export function AppendModel(model:models,scene:BABYLON.Scene) {
        return new Promise(function(resolve, reject) {

        if (ModelLoader.LoadedModel) {
            ModelLoader.LoadedModel.dispose();
        }
        let path = importModel(model);
        let loadedScene;
        var root = new BABYLON.Mesh("root", scene);

        BABYLON.SceneLoader.ImportMesh("",path, "", scene, ((meshes) => {

        //meshes[0].normalizeToUnitCube();
        meshes.forEach(mesh => {
            if (!mesh.material) return;
            if (mesh.material.albedoTexture) {
                mesh.setParent(root);
                BABYLON.Effect.ShadersStore["customVertexShader"]= "\r\n"+   
                "precision highp float;\r\n"+

                "// Attributes\r\n"+
                "attribute vec3 position;\r\n"+
                "attribute vec2 uv;\r\n"+

                "// Uniforms\r\n"+
                "uniform mat4 worldViewProjection;\r\n"+
                "uniform vec3 cameraForward;\r\n"+
                "uniform float noiseAmp;\r\n"+
                "uniform float alphaCutoff;\r\n"+            

                "// Varying\r\n"+
                "varying vec2 vUV;\r\n"+

                "void main(void) {\r\n"+
                "    vec3 noise = vec3(0.0, 0.0, 0.0);\r\n"+
                "    float noiseAmp = dot(cameraForward, position) * noiseAmp;\r\n"+
                "    noise.x = sin(position.x + uv.y * 10.0) * noiseAmp;\r\n"+
                "    noise.y = cos(position.y + uv.x * 10.0) * noiseAmp;\r\n"+
                "    noise.z = sin(position.z + uv.x * uv.y * 10.0) * noiseAmp;\r\n"+
                "    vec3 newPosition = position + noise;\r\n"+
                "    gl_Position = worldViewProjection * vec4(newPosition, 1.0);\r\n"+

                "    vUV = uv;\r\n"+
                "}\r\n";

            BABYLON.Effect.ShadersStore["customFragmentShader"]="\r\n"+
               "precision highp float;\r\n"+

                "varying vec2 vUV;\r\n"+

                "uniform sampler2D textureSampler;\r\n"+
                "uniform float noiseAmp;\r\n"+
                "uniform float ditherLightenFactor;\r\n"+
                "uniform float ditherDarkenFactor;\r\n"+
                "uniform float alphaCutoff;\r\n"+

                "// Dithering pattern\r\n"+
                "const mat4 dither = mat4(\r\n"+
                "    0.0,  8.0,  2.0, 10.0,\r\n"+
                "    12.0,  4.0, 14.0,  6.0,\r\n"+
                "    3.0, 11.0,  1.0,  9.0,\r\n"+
                "    15.0,  7.0, 13.0,  5.0\r\n"+
                ");\r\n"+

                "void main(void) {\r\n"+
                "   vec4 color = texture2D(textureSampler, vUV);\r\n"+
                "   float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));\r\n"+
                "   float threshold = dither[int(mod(gl_FragCoord.x, 4.0)), int(mod(gl_FragCoord.y, 4.0))].x / 16.0;\r\n"+
                "    if (luminance < threshold) {\r\n"+
            "        // Darken the color by multiplying by a factor\r\n"+
            "        color.rgb *= ditherDarkenFactor;\r\n"+
            "    } else {\r\n"+
            "        // Brighten the color by adding a constant\r\n"+
            "        color.rgb += vec3(ditherLightenFactor);\r\n"+
            "    }\r\n"+


                "   float alpha = color.a;\r\n"+
                "   if (alpha < alphaCutoff)\r\n"+
                "    {\r\n"+
                "   discard;\r\n"+
                "    }\r\n"+
                "    gl_FragColor = vec4(color.r, color.g, color.b, color.a);\r\n"+
                "}\r\n";


            let alphaCutoff = 0.5;
            var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
                vertex: "custom",
                fragment: "custom",
                },
                {
                    attributes: ["position", "normal", "uv"],
                    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "cameraForward", "noiseAmp","alphaCutoff","ditherLightenFactor","ditherDarkenFactor"],


                });



            shaderMaterial.setTexture("textureSampler", mesh.material.albedoTexture);
            shaderMaterial.setFloat("alphaCutoff",alphaCutoff)
            shaderMaterial.backFaceCulling = false;

            mesh.material = shaderMaterial;
            window["reset"] = () => {
                shaderMaterial.forceCompilation(mesh);
            }

            scene.registerBeforeRender(function () {
                // Get the camera forward vector

            // var currentPosition = scene.activeCamera!.position.clone();

            // // Get the distance between the previous and current position
            // var distance = BABYLON.Vector3.Distance(previousPosition, currentPosition);

            // // Get the time elapsed since the last frame in seconds
            // var deltaTime = scene.getEngine().getDeltaTime() / 1000;

            // // Calculate the speed as distance divided by time
            // speed = distance / deltaTime;

            // Update the previous position with the current position
            //previousPosition.copyFrom(currentPosition);

            var lighten = GraphicsConfig.ditherLightenFactor;
            var darken = GraphicsConfig.ditherDarkenFactor;
            var noiseAmp = Math.random() * GraphicsConfig.jitterAmplitude;

            // var threshold = 0.05
            // if (speed < threshold) {
            //     noiseAmp = 0.0
            // }
            var cameraForward = scene.activeCamera!.getForwardRay().direction;
            // Pass it to the shader material as a uniform variable
            shaderMaterial.setVector3("cameraForward", cameraForward);
            shaderMaterial.setFloat("noiseAmp", noiseAmp);
            shaderMaterial.setFloat("ditherDarkenFactor",darken);
            shaderMaterial.setFloat("ditherLightenFactor",lighten);

        });

                // let shader = new ShaderManager.VertexNoiseShader(scene);
                // shader.shaderMaterial.setTexture("shader-tex",mesh.material.albedoTexture);
                // shader.shaderMaterial.backFaceCulling = false;
                // mesh.material = shader.shaderMaterial;
            }
        })

        let childMeshes = root.getChildMeshes();
        let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
        let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
                
        for(let i=0; i<childMeshes.length; i++){
            childMeshes[i].isPickable = false;
            let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
            let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;

            min = BABYLON.Vector3.Minimize(min, meshMin);
            max = BABYLON.Vector3.Maximize(max, meshMax);
        }

        let width = max.subtract(min);

        let scaling = new BABYLON.Vector3(width.x, width.y, width.z);
        let mat = new BABYLON.StandardMaterial('mat');
        mat.alpha = 0.0;
        mat.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
        
        let centerX = (min.x + max.x) / 2;
        let centerY = (min.y + max.y) / 2;
        let centerZ = (min.z + max.z) / 2;

        let box = BABYLON.MeshBuilder.CreateBox('collider');
        box.setParent(root);
        box.material = mat;
        box.scaling = scaling;
        box.material.backFaceCulling = true;
        box.checkCollisions = true;
        box.isPickable = true;
        box.onBeforeRenderObservable.add(() => {
            SceneViewer.engine.setStencilBuffer(false);
        });

        // Create a vector from the coordinates
        let center = new BABYLON.Vector3(centerX, centerY, centerZ);
        box.setPivotPoint(center)


        root.setBoundingInfo(new BABYLON.BoundingInfo(min, max));

        root.checkCollisions = true;
        //root.showBoundingBox = true;
        root.renderingGroupId = 0;

        resolve(root);
        return box;

    }))
})

}


    export function LoadModel(model:models,scene:BABYLON.Scene,dispose:boolean) {
        return new Promise(function(resolve, reject) {
        if (dispose == true) {

            if (ModelLoader.LoadedModel) {
                ModelLoader.LoadedModel.dispose();
            }
        }
        let path = importModel(model);
        let loadedScene : BABYLON.Scene = null;
        let rootMesh = new BABYLON.Mesh('root');
        BABYLON.SceneLoader.LoadAssetContainer(path, "", scene, ((node) => {

            node.meshes.forEach(mesh => {
                mesh.setParent(rootMesh);
                //mesh.isPickable = false;
                mesh.checkCollisions = true;
                if (!mesh.material) return;
                if (mesh.material.albedoTexture) {

                    BABYLON.Effect.ShadersStore["customVertexShader"]= "\r\n"+   
                    "precision highp float;\r\n"+
            
                    "// Attributes\r\n"+
                    "attribute vec3 position;\r\n"+
                    "attribute vec2 uv;\r\n"+
            
                    "// Uniforms\r\n"+
                    "uniform mat4 worldViewProjection;\r\n"+
                    "uniform vec3 cameraForward;\r\n"+
                    "uniform float noiseAmp;\r\n"+
                    "uniform float alphaCutoff;\r\n"+            
            
                    "// Varying\r\n"+
                    "varying vec2 vUV;\r\n"+
            
                    "void main(void) {\r\n"+
                    "    vec3 noise = vec3(0.0, 0.0, 0.0);\r\n"+
                    "    float noiseAmp = dot(cameraForward, position) * noiseAmp;\r\n"+
                    "    noise.x = sin(position.x + uv.y * 10.0) * noiseAmp;\r\n"+
                    "    noise.y = cos(position.y + uv.x * 10.0) * noiseAmp;\r\n"+
                    "    noise.z = sin(position.z + uv.x * uv.y * 10.0) * noiseAmp;\r\n"+
                    "    vec3 newPosition = position + noise;\r\n"+
                    "    gl_Position = worldViewProjection * vec4(newPosition, 1.0);\r\n"+
            
                    "    vUV = uv;\r\n"+
                    "}\r\n";
            
                BABYLON.Effect.ShadersStore["customFragmentShader"]="\r\n"+
                   "precision highp float;\r\n"+
            
                    "varying vec2 vUV;\r\n"+
            
                    "uniform sampler2D textureSampler;\r\n"+
                    "uniform float noiseAmp;\r\n"+
                    "uniform float ditherLightenFactor;\r\n"+
                    "uniform float ditherDarkenFactor;\r\n"+
                    "uniform float alphaCutoff;\r\n"+
            
                    "// Dithering pattern\r\n"+
                    "const mat4 dither = mat4(\r\n"+
                    "    0.0,  8.0,  2.0, 10.0,\r\n"+
                    "    12.0,  4.0, 14.0,  6.0,\r\n"+
                    "    3.0, 11.0,  1.0,  9.0,\r\n"+
                    "    15.0,  7.0, 13.0,  5.0\r\n"+
                    ");\r\n"+

                    "void main(void) {\r\n"+
                    "   vec4 color = texture2D(textureSampler, vUV);\r\n"+
                    "   float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));\r\n"+
                    "   float threshold = dither[int(mod(gl_FragCoord.x, 4.0)), int(mod(gl_FragCoord.y, 4.0))].x / 16.0;\r\n"+
                    "    if (luminance < threshold) {\r\n"+
                "        // Darken the color by multiplying by a factor\r\n"+
                "        color.rgb *= ditherDarkenFactor;\r\n"+
                "    } else {\r\n"+
                "        // Brighten the color by adding a constant\r\n"+
                "        color.rgb += vec3(ditherLightenFactor);\r\n"+
                "    }\r\n"+

                    
                    "   float alpha = color.a;\r\n"+
                    "   if (alpha < alphaCutoff)\r\n"+
                    "    {\r\n"+
                    "   discard;\r\n"+
                    "    }\r\n"+
                    "    gl_FragColor = vec4(color.r, color.g, color.b, color.a);\r\n"+
                    "}\r\n";
            
            
                let alphaCutoff = 0.5;
                var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
                    vertex: "custom",
                    fragment: "custom",
                    },
                    {
                        attributes: ["position", "normal", "uv"],
                        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "cameraForward", "noiseAmp","alphaCutoff","ditherLightenFactor","ditherDarkenFactor"],
                        

                    });
            

            
                shaderMaterial.setTexture("textureSampler", mesh.material.albedoTexture);
                shaderMaterial.setFloat("alphaCutoff",alphaCutoff)
                shaderMaterial.backFaceCulling = false;
            
                mesh.material = shaderMaterial;
                window["reset"] = () => {
                    shaderMaterial.forceCompilation(mesh);
                }

                scene.registerBeforeRender(function () {
                    // Get the camera forward vector
        
                // var currentPosition = scene.activeCamera!.position.clone();
        
                // // Get the distance between the previous and current position
                // var distance = BABYLON.Vector3.Distance(previousPosition, currentPosition);
        
                // // Get the time elapsed since the last frame in seconds
                // var deltaTime = scene.getEngine().getDeltaTime() / 1000;
        
                // // Calculate the speed as distance divided by time
                // speed = distance / deltaTime;
        
                // Update the previous position with the current position
                //previousPosition.copyFrom(currentPosition);
        
                var lighten = GraphicsConfig.ditherLightenFactor;
                var darken = GraphicsConfig.ditherDarkenFactor;
                var noiseAmp = Math.random() * GraphicsConfig.jitterAmplitude;
        
                // var threshold = 0.05
                // if (speed < threshold) {
                //     noiseAmp = 0.0
                // }
                var cameraForward = scene.activeCamera!.getForwardRay().direction;
                // Pass it to the shader material as a uniform variable
                shaderMaterial.setVector3("cameraForward", cameraForward);
                shaderMaterial.setFloat("noiseAmp", noiseAmp);
                shaderMaterial.setFloat("ditherDarkenFactor",darken);
                shaderMaterial.setFloat("ditherLightenFactor",lighten);
        
            });

                    // let shader = new ShaderManager.VertexNoiseShader(scene);
                    // shader.shaderMaterial.setTexture("shader-tex",mesh.material.albedoTexture);
                    // shader.shaderMaterial.backFaceCulling = false;
                    // mesh.material = shader.shaderMaterial;
                }
            })
            SceneViewer.scene.addMesh(rootMesh,true);

            const myEvent = new CustomEvent("modelLoader:Loaded", { detail: { name:model ,mesh: rootMesh } })
            document.dispatchEvent(myEvent);

            // let childMeshes = rootMesh.getChildMeshes();
            // let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
            // let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
                    
            // for(let i=0; i<childMeshes.length; i++){
            //     let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
            //     let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;

            //     min = BABYLON.Vector3.Minimize(min, meshMin);
            //     max = BABYLON.Vector3.Maximize(max, meshMax);
            // }

            // rootMesh.setBoundingInfo(new BABYLON.BoundingInfo(min, max));
            rootMesh.showBoundingBox = true;      
            //rootMesh.scaling = new BABYLON.Vector3(0.05,0.05,0.05);
            resolve(rootMesh);

            
            // let meshes = loadedScene.meshes;
            // console.log("Loaded Scene",loadedScene);
            // console.log("Meshes",meshes);
            // ModelLoader.LoadedModel = meshes[0];
            // meshes[0].scaling = new BABYLON.Vector3(3,3,-3);
            // //meshes[0].normalizeToUnitCube();
            
   

        }))

    })
    }

}