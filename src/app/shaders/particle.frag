precision highp float;
uniform sampler2D uTexture;
varying vec2 vPUv;
varying vec2 vUv;
void main() {
    vec4 color = vec4(0.0);
    vec2 uv = vUv;
    vec2 puv = vPUv;
    // pixel color
    vec4 colA = texture2D(uTexture, puv);
    // circle
    float border = 0.3;
    float radius = 0.5;
    float dist = radius - distance(uv, vec2(0.5));
    float t = smoothstep(0.0, border, dist);
    // final color
    color = colA;
    color.a = t;
    gl_FragColor = color;
}