// vertex.glsl
varying vec3 vNormal;
varying vec3 vPositionW;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 positionW = modelMatrix * vec4(position, 1.0);
    vPositionW = positionW.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}