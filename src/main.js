console.log('%c Created By: la6 <3 ', 'background-color: green; color: white; font-size: 21px; font-weight: bold')
console.log('https://la6.su')

import '/src/style.css'

import * as THREE from 'three'
import { renderer, scene } from './core/renderer'
import camera from './core/camera'
import { loaderGLB, loaderRGBE } from './core/loaders'
import { particleMaterial, outlineMaterial, createGlowMaterial } from './core/materials'
import { createParticleSystem } from './core/particleSystem'
import { ambientLight, pointLight, directionalLight } from './core/lights'
import { controls } from './core/orbit-control'
import Stats from 'three/examples/jsm/libs/stats.module'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

//let boxGeo, plane, material, boxMesh

let sceneOne, sceneTwo, hdriMap
let sceneOneAnimations, sceneTwoAnimations
let sceneOneAnimationMixer, sceneTwoAnimationMixer


const stats = new Stats()
document.body.appendChild(stats.dom)

// Загрузка HDR текстуры
loaderRGBE.setPath('/textures/')
  .load('quarry_01_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping
    hdriMap = texture
  })


// Загрузка GLB модели

loaderGLB.load('03_Planet.glb', function (gltf) {
  sceneTwo = gltf.scene
  sceneTwo.traverse((child) => {
    if (child.isMesh) {
      // Создаем копию геометрии с немного увеличенным размером для свечения
      const glowMaterial = createGlowMaterial(new THREE.Color(0x00ff00), 2.5)
      child.material = glowMaterial
    }
  })
  scene.add(sceneTwo)
  sceneTwo.scale.set(0.35, 0.35, 0.35)
  sceneTwo.position.set(0, 0.75, 0)
  sceneTwoAnimationMixer = new THREE.AnimationMixer(sceneTwo)
  sceneTwoAnimations = gltf.animations
  // Запускаем все анимации
  sceneTwoAnimations.forEach(clip => {
    const action = sceneTwoAnimationMixer.clipAction(clip)
    action.play()
  })
})

loaderGLB.load('04_KV-Blender3_241102.glb', function (gltf) {
  sceneOne = gltf.scene
  sceneOne.position.set(0, 0, 2)
  sceneOneAnimations = gltf.animations

  sceneOne.traverse(function (child) {
    if (
      child instanceof THREE.Mesh &&
      child.parent?.name === 'Circle-CONTROLLER'
    ) {
      child.material.envMap = hdriMap
    }

    if (child instanceof THREE.Mesh && child.parent?.name === 'Logo') {
      child.material.envMap = hdriMap
    }
  })

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
    if (kvBg && kvBg.parent) {
      kvBg.parent.add(outlineMesh)
      kvBg.parent.add(particleSystem)
    }

    kvBg.visible = false
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


function init() {

  scene.add(ambientLight)
  scene.add(pointLight)
  scene.add(directionalLight)

  scene.environment = hdriMap

  window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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


let delta, prevTime
let fpsInterval, now, then, elapsed, startTime
const clock = new THREE.Clock()

function LockFrame(fps) {

  fpsInterval = 1000 / fps
  then = window.performance.now()
  startTime = then
  animate()
}
LockFrame(60)


function animate() {
  const currentTime = Date.now()
  const elapsedTime = clock.getElapsedTime()
  requestAnimationFrame(animate)
  now = window.performance.now()
  elapsed = now - then

  if (elapsed >= fpsInterval) {
    then = now - (elapsed % fpsInterval)
    delta = clock.getDelta()

    // Обновляем время для шейдеров
    particleMaterial.uniforms.uTime.value = elapsedTime
    outlineMaterial.uniforms.uTime.value = elapsedTime


    if (sceneOneAnimationMixer) {
      sceneOneAnimationMixer.update((currentTime - prevTime) * 0.001)
    }
    if (sceneTwoAnimationMixer) {
      sceneTwoAnimationMixer.update((currentTime - prevTime) * 0.001)
    }
    prevTime = currentTime
    stats.update()
    controls.update()
    renderer.render(scene, camera)
  }
}
