// fragment.glsl
uniform float uOpacity;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  // Вычисляем угол между нормалью и направлением взгляда
  vec3 viewDir = normalize(vViewPosition);
  float rim = 1.0 - abs(dot(viewDir, vNormal));
  
  // Делаем контур очень тонким
  rim = smoothstep(0.6, 0.8, rim);
  
  // Базовый цвет золота
  vec3 goldColor = vec3(1.0, 0.84, 0.0);
  
  // Добавляем пульсацию
  float pulse = sin(uTime * 2.0) * 0.15 + 0.85;
  
  // Если не край - отбрасываем фрагмент
  if (rim < 0.1) discard;
  
  // Итоговый цвет с пульсацией
  vec3 finalColor = goldColor * pulse * 1.5;
  float alpha = rim;
  
  gl_FragColor = vec4(finalColor, alpha * uOpacity);
}