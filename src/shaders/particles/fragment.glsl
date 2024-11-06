// fragment.glsl
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;

void main() {
    vec2 uv = gl_PointCoord;
    float circle = 1.0 - smoothstep(0.0, 0.5, length(uv - 0.5));
    
    if (circle < 0.01) discard;
    
    // Усиливаем базовые цвета для более яркого свечения
    vec3 goldBase = vec3(1.0, 0.65, 0.0);     // Более оранжевый базовый золотой
    vec3 goldHighlight = vec3(1.0, 0.78, 0.4); // Более теплый светлый золотой
    vec3 whiteGlow = vec3(1.0, 0.75, 0.7);  // Теплое свечение с золотистым оттенком
    
    // Множественные слои мерцания
    float primaryPulse = sin(uTime * 2.0) * 0.5 + 0.5;
    float secondaryPulse = sin(uTime * 3.0 + vPosition.x) * 0.5 + 0.5;
    float tertiaryPulse = sin(uTime * 1.5 + vPosition.y) * 0.5 + 0.5;
    
    // Комбинируем пульсации для более сложного мерцания
    float combinedPulse = primaryPulse * 0.5 + secondaryPulse * 0.3 + tertiaryPulse * 0.2;
    
    // Улучшенное свечение от центра к краям
    float dist = length(uv - 0.5);
    float glow = 1.0 - dist * 2.0;
    glow = pow(glow, 1.2); // Уменьшили степень для более широкого свечения
    
    // Добавляем случайное мерцание на основе позиции
    float randomFlicker = fract(sin(dot(vPosition.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
    float flicker = mix(0.8, 1.0, randomFlicker);
    
    // Многослойное свечение
    vec3 finalColor = mix(goldBase, goldHighlight, glow * combinedPulse);
    finalColor = mix(finalColor, whiteGlow, pow(glow, 2.0) * primaryPulse * 0.6);
    
    // Усиленное центральное свечение
    float centerGlow = smoothstep(0.5, 0.0, dist);
    centerGlow = pow(centerGlow, 1.5); // Более мягкое центральное свечение
    finalColor += whiteGlow * centerGlow * combinedPulse * 0.8;
    
    // Добавляем внешнее свечение
    float outerGlow = smoothstep(1.0, 0.2, dist);
    finalColor += goldBase * outerGlow * 0.3 * (1.0 + sin(uTime * 3.0) * 0.2);
    
    // Применяем мерцание и настраиваем прозрачность
    finalColor *= flicker;
    float alpha = circle * (0.8 + combinedPulse * 0.2) * flicker;
    
    // Добавляем bloom-эффект
    float bloomStrength = 1.2 + sin(uTime) * 0.2;
    finalColor *= bloomStrength;
    
    gl_FragColor = vec4(finalColor, alpha);
}