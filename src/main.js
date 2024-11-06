console.log('%c Created By: la6 <3 ', 'background-color: green; color: white; font-size: 21px; font-weight: bold')
console.log('https://la6.su')

import gsap from 'gsap'
import '/src/style.css'

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { renderer, scene } from './core/renderer'
import camera from './core/camera'
import { loaderGLB, loaderRGBE } from './core/loaders'
import { particleMaterial, outlineMaterial, createGlowMaterial, createBlackHoleMaterial } from './core/materials'
import { createParticleSystem } from './core/particleSystem'
import { ambientLight, pointLight, directionalLight } from './core/lights'
import { controls } from './core/orbit-control'
import Stats from 'three/examples/jsm/libs/stats.module'


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Создаем композер и пассы
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  1.5,    // strength
  0.4,    // radius
  0.85    // threshold
)

// Добавляем пассы в композер
composer.addPass(renderPass)
composer.addPass(bloomPass)

//let boxGeo, plane, material, boxMesh
let sceneOne, sceneTwo, logoMesh, hdriMap
let sceneOneAnimations, sceneTwoAnimations
let sceneOneAnimationMixer, sceneTwoAnimationMixer


// Анимация появления всех элементов
const fadeInTimeline = gsap.timeline({
  defaults: { duration: 1.2, ease: "power2.inOut" }
})

const stats = new Stats()
document.body.appendChild(stats.dom)

// Загрузка HDR текстуры
loaderRGBE.setPath('/textures/')
  .load('quarry_01_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping
    hdriMap = texture
  })


// Создаем круглую маску
function createCircularBlackHoleEffect(radius = 1) {
  // Создаем геометрию круга
  const geometry = new THREE.CircleGeometry(radius, 64)
  const material = createBlackHoleMaterial()
  const circle = new THREE.Mesh(geometry, material)
  circle.renderOrder = -1
  // Размещаем круг немного позади текста
  circle.position.set(-0.075, 1.35, -0.15)

  return circle
}

const blackHoleEffect = createCircularBlackHoleEffect(1)
// Функция для настройки эффекта
function updateBlackHoleEffect(params = {}) {
  const material = blackHoleEffect.material

  if (params.radius !== undefined) {
    material.uniforms.radius.value = params.radius
  }
  if (params.softness !== undefined) {
    material.uniforms.softness.value = params.softness
  }
  if (params.color !== undefined) {
    material.uniforms.color.value.set(params.color)
  }
  if (params.opacity !== undefined) {
    material.uniforms.opacity.value = params.opacity
  }
}



// Загрузка GLB модели

loaderGLB.load('03_Planet.glb', function (gltf) {
  sceneTwo = gltf.scene
  sceneTwo.traverse((child) => {
    if (child.isMesh) {
      // Создаем меш для свечения
      const glowMaterial = createGlowMaterial()
      child.material = glowMaterial
    }
  })

  scene.add(sceneTwo)
  sceneTwo.scale.set(0.35, 0.35, 0.35)
  sceneTwo.position.set(0, 0.75, 0)

  // Настройка анимаций
  sceneTwoAnimationMixer = new THREE.AnimationMixer(sceneTwo)
  sceneTwoAnimations = gltf.animations
  sceneTwoAnimations.forEach(clip => {
    const action = sceneTwoAnimationMixer.clipAction(clip)
    action.play()
  })
})
loaderGLB.load('04_KV.glb', function (gltf) {
  sceneOne = gltf.scene
  console.log(sceneOne)
  sceneOne.position.set(0, 0, 2)
  sceneOneAnimations = gltf.animations

  sceneOne.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      // Убедимся, что материал поддерживает прозрачность
      child.material.transparent = true
      child.material.opacity = 1 // Начинаем с полной прозрачности

      if (child.parent?.name === 'Circle-CONTROLLER') {
        child.material.envMap = hdriMap
        fadeInTimeline.to(child.material, {
          opacity: 1,
          duration: 0.6,
        }, 0)
      }
    }
  })

  logoMesh = sceneOne.getObjectByName('Logo')

  const kvBg = sceneOne.getObjectByName('KV_BG')
  if (kvBg && kvBg instanceof THREE.Mesh) {
    const originalGeometry = kvBg.geometry

    // Создаем меш с контуром
    const outlineMesh = new THREE.Mesh(originalGeometry, outlineMaterial)
    outlineMesh.position.copy(kvBg.position)
    outlineMesh.position.z += 1.8 // Смещаем контур вперед
    outlineMesh.position.y -= 1.2 // Смещаем контур вверх
    outlineMesh.rotation.copy(kvBg.rotation)
    outlineMesh.scale.copy(kvBg.scale)
    outlineMesh.material.transparent = true
    outlineMesh.material.opacity = 0
    // Создаем систему частиц
    const particleSystem = createParticleSystem(
      originalGeometry,
      new THREE.Vector3(
        kvBg.position.x,
        kvBg.position.y - 1.2, // Смещаем частицы вверх
        kvBg.position.z + 1.85, // Смещаем частицы вперед
      ),
      kvBg.rotation,
      kvBg.scale,
    )
    // Добавляем контур и частицы, скрываем оригинальный меш
    if (kvBg.parent) {
      kvBg.parent.add(outlineMesh)
      kvBg.parent.add(particleSystem)
    }

    kvBg.visible = false

    particleMaterial.opacity = 0


    // Дополнительная анимация позиции всей сцены
    // fadeInTimeline.from(sceneOne.position, {
    //   y: -2,
    //   duration: 2.5,
    //   ease: "power2.out"
    // }, 0)

  }

  scene.add(sceneOne)

  sceneOneAnimationMixer = new THREE.AnimationMixer(sceneOne)
  // Запускаем все анимации
  sceneOneAnimations.forEach(clip => {
    const action = sceneOneAnimationMixer.clipAction(clip)
    action.setLoop(THREE.LoopOnce, 1) // Проиграть только один раз
    action.clampWhenFinished = true // Оставить анимацию в последнем кадре
    action.play()
  })
})

function animateFade() {
  // Анимация основных мешей
  if (logoMesh) {
    fadeInTimeline.to(logoMesh.material, {
      opacity: 1,
      duration: 0.6,
    }, 2)
  }
  fadeInTimeline.to(particleMaterial.uniforms.uOpacity, {
    value: 1,
    duration: 2
  }, 1)

  fadeInTimeline.to(outlineMaterial.uniforms.uOpacity, {
    value: 1,
    duration: 2
  }, 1)


  // Анимация системы частиц
  fadeInTimeline.to(particleMaterial, {
    opacity: 1,
    duration: 1.2,
  }, 3)

}
function init() {

  scene.add(ambientLight)
  scene.add(pointLight)
  scene.add(directionalLight)

  scene.environment = hdriMap
  scene.add(blackHoleEffect)

  updateBlackHoleEffect({
    radius: 0.6,
    softness: 0.24,
    color: 0x000033,
    opacity: 0.48
  })

  animateFade()

  window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Обновляем размер композера
    composer.setSize(sizes.width, sizes.height)
  })


  // boxGeo = new THREE.BoxGeometry(1, 1, 1)

  // material = new THREE.MeshBasicMaterial({ color: 'red' })
  // boxMesh = new THREE.Mesh(boxGeo, material)
  // boxMesh.position.set(0, 0.5, 0)
  // scene.add(boxMesh)

  // Создание плоскости
  // plane = new THREE.Mesh(
  //   new THREE.PlaneGeometry(10, 10, 10, 10),
  //   new THREE.MeshToonMaterial({ color: '#444' }),
  // )
  // plane.position.set(0, 0, 0)
  // plane.rotation.set(-Math.PI / 2, 0, 0)
  // plane.receiveShadow = true
  // scene.add(plane)

}

init()


let fpsInterval, now, then, elapsed, startTime
const clock = new THREE.Clock()

function LockFrame(fps) {

  fpsInterval = 1000 / fps
  then = window.performance.now()
  startTime = then
  animate()
}
LockFrame(60)

// Обновленные настройки UnrealBloomPass для лучшего эффекта свечения
bloomPass.strength = 1.5    // Усиление свечения
bloomPass.radius = 0.4      // Радиус размытия
bloomPass.threshold = 0.85  // Порог яркости

function animate() {

  const elapsedTime = clock.getElapsedTime()
  requestAnimationFrame(animate)
  now = window.performance.now()
  elapsed = now - then

  if (elapsed >= fpsInterval) {
    then = now - (elapsed % fpsInterval)

    // Обновляем время шейдеров
    particleMaterial.uniforms.uTime.value = elapsedTime
    outlineMaterial.uniforms.uTime.value = elapsedTime
    blackHoleEffect.material.uniforms.time.value = elapsedTime

    // Обновляем анимации
    if (sceneOneAnimationMixer) {
      sceneOneAnimationMixer.update(elapsed * 0.001) // Преобразуем миллисекунды в секунды
    }
    if (sceneTwoAnimationMixer) {
      sceneTwoAnimationMixer.update(elapsed * 0.001)
    }

    stats.update()
    controls.update()
    composer.render()
  }
}