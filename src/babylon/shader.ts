var createScene = function() {
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 4, 4, BABYLON.Vector3.Zero(), scene);

    engine.setHardwareScalingLevel(4)
    camera.attachControl(canvas, true);
	
	 var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    BABYLON.Effect.ShadersStore["customVertexShader"]= "\r\n"+   
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

    BABYLON.Effect.ShadersStore["customFragmentShader"]="\r\n"+
	   "precision highp float;\r\n"+

    	"varying vec2 vUV;\r\n"+

    	"uniform sampler2D textureSampler;\r\n"+
        "uniform float noiseAmp;\r\n"+

    	"void main(void) {\r\n"+
    	"    gl_FragColor = texture2D(textureSampler, vUV);\r\n"+
    	"}\r\n";



    var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertex: "custom",
        fragment: "custom",
	    },
        {
			attributes: ["position", "normal", "uv"],
			uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "cameraForward", "noiseAmp"]
        });


    var mainTexture = new BABYLON.Texture("amiga.jpg", scene);

    shaderMaterial.setTexture("textureSampler", mainTexture);

    shaderMaterial.backFaceCulling = false;

    var box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
	box.material = shaderMaterial;

    // Define a variable to store the previous position of the camera
    var previousPosition = camera.position.clone();

    // Define a variable to store the speed of the camera
    var speed = 0;

    scene.registerBeforeRender(function () {
            // Get the camera forward vector

        var currentPosition = camera.position.clone();

        // Get the distance between the previous and current position
        var distance = BABYLON.Vector3.Distance(previousPosition, currentPosition);

        // Get the time elapsed since the last frame in seconds
        var deltaTime = scene.getEngine().getDeltaTime() / 1000;

        // Calculate the speed as distance divided by time
        speed = distance / deltaTime;

        // Update the previous position with the current position
        previousPosition.copyFrom(currentPosition);

        var noiseAmp = Math.random() * 0.02;

        var threshold = 0.05
        if (speed < threshold) {
            noiseAmp = 0.0
        }
        window["camera"] = scene.activeCamera
        var cameraForward = scene.activeCamera.getForwardRay().direction;
        // Pass it to the shader material as a uniform variable
        shaderMaterial.setVector3("cameraForward", cameraForward);
        shaderMaterial.setFloat("noiseAmp", noiseAmp);

    });

    return scene;
}