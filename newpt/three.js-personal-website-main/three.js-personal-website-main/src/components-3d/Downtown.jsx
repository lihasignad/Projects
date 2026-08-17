import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useLoader, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useSmartTexture } from '../hooks/useSmartTexture.js'
import tickerVertex from '../shaders/tickerVertex.glsl?raw'
import tickerFragment from '../shaders/tickerFragment.glsl?raw'

export function Downtown(props) {
  const { nodes } = useGLTF('/models/downtown.glb')

  // Baked texture for downtown using smart texture loading
  const bakedTexture = useSmartTexture('downtown')
  bakedTexture.flipY = false

  React.useEffect(() => {
    if (nodes.downtown && nodes.downtown.geometry) {
      const geom = nodes.downtown.geometry;
      const posAttr = geom.attributes.position;
      const uvAttr = geom.attributes.uv;
      if (posAttr && uvAttr) {
        let count = 0;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        for (let i = 0; i < posAttr.count; i++) {
          const u = uvAttr.getX(i);
          const v = uvAttr.getY(i);
          if (u >= 0.0 && u <= 0.25 && v >= 0.0 && v <= 0.27) {
            count++;
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const z = posAttr.getZ(i);
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
          }
        }
        console.log(`[Downtown Inspect] Vertices in UV range: ${count}`);
        console.log(`[Downtown Inspect] Bounds: X[${minX}, ${maxX}] Y[${minY}, ${maxY}] Z[${minZ}, ${maxZ}]`);
      }
    }
  }, [nodes]);

  // Load stock slider textures
  const sliderTextures = useLoader(TextureLoader, [
    '/textures/stock-slider.webp',
    '/textures/stock-slider2.webp',
    '/textures/stock-slider3.webp',
    '/textures/stock-slider4.webp',
    '/textures/stock-slider5.webp',
  ])

  // Create shader material for the stock panel
  const tickerMaterial = useMemo(() => {
    sliderTextures.forEach((tex) => {
      tex.flipY = false
      tex.wrapS = THREE.ClampToEdgeWrapping
      tex.wrapT = THREE.ClampToEdgeWrapping
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
    })

    return new THREE.ShaderMaterial({
      vertexShader: tickerVertex,
      fragmentShader: tickerFragment,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.07 },
        uTexture1: { value: sliderTextures[0] },
        uTexture2: { value: sliderTextures[1] },
        uTexture3: { value: sliderTextures[2] },
        uTexture4: { value: sliderTextures[3] },
        uTexture5: { value: sliderTextures[4] },
      },
      transparent: false,
    })
  }, [sliderTextures])

  // Animate time for the ticker
  useFrame((state) => {
    if (tickerMaterial) {
      tickerMaterial.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <group {...props} dispose={null} scale={100}>
      {/* Stock panel with custom shader material */}
      <mesh
        geometry={nodes['stock-panel1'].geometry}
        position={[-3.58434844, 0.50036126, 1.04155684]}
        rotation={[Math.PI / 2, Math.PI / 2, 0]}
        material={tickerMaterial}
      />

      {/* Downtown with baked texture */}
      <mesh
        geometry={nodes.downtown.geometry}
        position={[-3.522, 0.186, 1.54]}
        rotation={[Math.PI / 2, 0, -3.123]}
      >
        <meshBasicMaterial map={bakedTexture} />
      </mesh>
    </group>
  )
}

useGLTF.preload('/models/downtown.glb')
