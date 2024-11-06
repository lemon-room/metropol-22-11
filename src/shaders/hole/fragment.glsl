// fragment.glsl
uniform float time;
uniform float radius;
uniform float softness;
uniform vec3 color;
uniform float opacity;

varying vec2 vUv;

void main() {
    // Преобразуем UV координаты в диапазон от -1 до 1
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Вычисляем расстояние от центра
    float dist = length(uv);
    
    // Создаем базовый градиент
    float gradient = 1.0 - smoothstep(radius - softness, radius + softness, dist);
    
    // Добавляем пульсацию
    float pulse = sin(time * 2.0) * 0.05;
    gradient *= 1.0 + pulse;
    
    // Добавляем вихревой эффект
    float angle = atan(uv.y, uv.x);
    float spiral = sin(angle * 5.0 + time * 3.0) * 0.05;
    gradient *= 1.0 + spiral;
    
    // Применяем цвет и прозрачность
    gl_FragColor = vec4(color, opacity * gradient);
}