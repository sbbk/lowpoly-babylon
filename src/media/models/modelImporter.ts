// MODEL IMPORTER HELPER
import * as BABYLON from "@babylonjs/core";
import { ShaderManager } from "../../babylon/shaders/shaderManager";

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
        GraphicsConfig.hardwareScaling = 1.5;

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
    export var LoadedModel:BABYLON.Mesh = null;

    export type models = "Scene" | "CityScene"| "CrashBandicoot" | "dva" | "CheesePlant" | "MetalCabinet" | "Maschine" | "Monitor" | "TrestleTable";

    export function generateList():models[] {
        
        let models = ["Scene", "CityScene","CrashBandicoot","dva","CheesePlant","MetalCabinet","Maschine","Monitor","TrestleTable"] as models[];
        return models;

    }

    function importModel(model:models) {
    
        switch(model) {
            case "Scene":
                return scene;
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

    export function LoadModel(model:models,scene:BABYLON.Scene):BABYLON.Scene {

        if (ModelLoader.LoadedModel) {
            ModelLoader.LoadedModel.dispose();
        }
        let path = importModel(model);
        let loadedScene;
        BABYLON.SceneLoader.Append(path, "", scene, ((node) => {
            loadedScene = node as BABYLON.Scene;
            let meshes = loadedScene.meshes;
            ModelLoader.LoadedModel = meshes[0];
            //meshes[0].normalizeToUnitCube();
            
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

        }))
        return loadedScene;

    }

}