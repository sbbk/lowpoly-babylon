import * as BABYLON from "@babylonjs/core"

export namespace ShaderManager {

    export class VertexNoiseShader {

        scene:BABYLON.Scene;
        shaderMaterial:BABYLON.ShaderMaterial
        customVertexShader:string = "\r\n"+   
		"precision highp float;\r\n"+

    	"// Attributes\r\n"+
    	"attribute vec3 position;\r\n"+
    	"attribute vec2 uv;\r\n"+

    	"// Uniforms\r\n"+
    	"uniform mat4 worldViewProjection;\r\n"+
        "uniform vec3 cameraForward;\r\n"+
        "uniform float noiseAmp;\r\n"+


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

        customFragmentShader:string = "\r\n"+
        "precision highp float;\r\n"+
 
         "varying vec2 vUV;\r\n"+
 
         "uniform sampler2D textureSampler;\r\n"+
         "uniform float noiseAmp;\r\n"+
 
         "void main(void) {\r\n"+
         "    gl_FragColor = texture2D(textureSampler, vUV);\r\n"+
         "}\r\n";

         constructor(scene:BABYLON.Scene) {
            this.scene = scene;
            BABYLON.Effect.ShadersStore["customVertexShader"] = this.customVertexShader;
            BABYLON.Effect.ShadersStore["customFragmentShader"] = this.customFragmentShader;
            this.shaderMaterial = new BABYLON.ShaderMaterial("shader", this.scene, {
                vertex: "custom",
                fragment: "custom",
                },
                {
                    attributes: ["position", "normal", "uv"],
                    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "cameraForward", "noiseAmp"]
                });
            
         }


    }

}