#ifdef GL_ES
precision highp float;
#endif

// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

// Dithering pattern
const mat4 dither = mat4(
    0.0,  8.0,  2.0, 10.0,
    12.0,  4.0, 14.0,  6.0,
    3.0, 11.0,  1.0,  9.0,
    15.0,  7.0, 13.0,  5.0
);

void main(void) {
    // Get the original pixel color
    vec4 color = texture2D(textureSampler, vUV);
    gl_FragColor = color;

    // // Convert the color to grayscale
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // // Apply the dithering pattern
float threshold = dither[int(mod(gl_FragCoord.x, 4.0)), int(mod(gl_FragCoord.y, 4.0))].x / 16.0;    // 

if (gray < threshold) {
        gray = 0.0;
    } else {
        gray = 1.0;
    }

    // // Output the modified pixel color
    gl_FragColor = vec4(gray, gray, gray, color.a);
}