// fragment.glsl
uniform vec3 glowColor;
uniform float intensity;

varying vec3 vNormal;
varying vec3 vPositionW;

void main() {
    // Используем встроенную переменную cameraPosition
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
    float fresnel = dot(viewDirectionW, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 3.0) * intensity;
    
    gl_FragColor = vec4(glowColor, 1.0) * fresnel;
}