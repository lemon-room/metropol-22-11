import {
  ShaderMaterial, Vector2, AdditiveBlending, DoubleSide
} from 'three'
import vsOne from '../shaders/one/vertex.glsl'
import fsOne from '../shaders/one/fragment.glsl'
import vsTwo from '../shaders/two/vertex.glsl'
import fsTwo from '../shaders/two/fragment.glsl'

export const particleMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uFrequency: { value: new Vector2(2.0, 1.5) },
  },
  vertexShader: vsOne,  // Was incorrectly using fsOne
  fragmentShader: fsOne,  // Was incorrectly using vsOne
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
  side: DoubleSide,
})

export const outlineMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: vsTwo,
  fragmentShader: fsTwo,
  transparent: true,
  side: DoubleSide,
  depthWrite: false,
  blending: AdditiveBlending,
})