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

    // // Calculate the luminance value
    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

    // // Apply the dithering pattern
    float threshold = dither[int(mod(gl_FragCoord.x, 4.0)), int(mod(gl_FragCoord.y, 4.0))].x / 16.0;
    if (luminance < threshold) {
        // Darken the color by multiplying by a factor
        color.rgb *= 0.8;
    } else {
        // Brighten the color by adding a constant
        color.rgb += vec3(0.1);
    }

    // Output the modified pixel color
    gl_FragColor = vec4(color.r, color.g, color.b, color.a);
}