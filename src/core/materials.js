import {
  ShaderMaterial, Color, Vector2, Vector3, AdditiveBlending, DoubleSide
} from 'three'
import vsParticles from '../shaders/particles/vertex.glsl'
import fsParticles from '../shaders/particles/fragment.glsl'
import vsOutlines from '../shaders/outlines/vertex.glsl'
import fsOutlines from '../shaders/outlines/fragment.glsl'
import vsPlanets from '../shaders/planets/vertex.glsl'
import fsPlanets from '../shaders/planets/fragment.glsl'
export const particleMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uFrequency: { value: new Vector2(2.0, 1.5) },
  },
  vertexShader: vsParticles,  // Was incorrectly using fsOne
  fragmentShader: fsParticles,  // Was incorrectly using vsOne
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
  side: DoubleSide,
})

export const outlineMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: vsOutlines,
  fragmentShader: fsOutlines,
  transparent: true,
  side: DoubleSide,
  depthWrite: false,
  blending: AdditiveBlending,
})

// Функция для создания светящегося материала
export function createGlowMaterial(color = new Color(0x00ff00), intensity = 0.5) {
  return new ShaderMaterial({
    uniforms: {
      glowColor: { value: color },
      intensity: { value: intensity }
    },
    vertexShader: vsPlanets,
    fragmentShader: fsPlanets,
    transparent: true,
    blending: AdditiveBlending,
    side: DoubleSide
  })
}