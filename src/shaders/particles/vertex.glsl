// vertex.glsl
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uFrequency;

void main() {
    vUv = uv;
    vPosition = position;
    
    // Более сложное волнообразное движение
    vec3 pos = position;
    
    // Основная волна
    float wave = sin(pos.x * uFrequency.x + uTime) * 
                 cos(pos.z * uFrequency.y + uTime) * 0.1;
    
    // Добавляем вторичную волну
    float secondaryWave = sin(pos.x * uFrequency.x * 0.5 + uTime * 1.5) * 
                         cos(pos.z * uFrequency.y * 0.5 + uTime * 0.75) * 0.05;
    
    // Добавляем микродвижение
    float microMovement = sin(pos.x * 20.0 + uTime * 5.0) * 0.01;
    
    pos.y += wave + secondaryWave + microMovement;
    
    // Добавляем небольшое движение по X и Z
    pos.x += sin(uTime * 2.0 + pos.y) * 0.02;
    pos.z += cos(uTime * 2.0 + pos.y) * 0.02;
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    
    // Динамический размер точек
    float sizeVariation = 1.0 + sin(uTime * 3.0 + pos.x * 10.0) * 0.2;
    gl_PointSize = (5.0 * sizeVariation) * (10.0 / -viewPosition.z);
}