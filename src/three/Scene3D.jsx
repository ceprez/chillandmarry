import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { buildItem, tileTexture, stoneTexture, foliage } from './builders.js'
import EnvironmentScene, { FLOOR_TEX } from './environments.jsx'

export const DEFAULT_HALL = { w: 26, d: 16, h: 6 }
export function wallTransform(hall, wall, u, y) {
  if (wall === 'back') return { pos: [u, y, -hall.d / 2 + 0.06], ry: 0 }
  if (wall === 'left') return { pos: [-hall.w / 2 + 0.06, y, u], ry: Math.PI / 2 }
  return { pos: [hall.w / 2 - 0.06, y, u], ry: -Math.PI / 2 }
}

const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
function wallPlane(hall, side) {
  const p = new THREE.Plane()
  if (side === 'back') p.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -hall.d / 2))
  else if (side === 'left') p.setFromNormalAndCoplanarPoint(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-hall.w / 2, 0, 0))
  else p.setFromNormalAndCoplanarPoint(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(hall.w / 2, 0, 0))
  return p
}
const clampFloor = (hall, v) => ({
  x: THREE.MathUtils.clamp(v.x, -hall.w / 2 + 1, hall.w / 2 - 1),
  z: THREE.MathUtils.clamp(v.z, -hall.d / 2 + 1, hall.d / 2 - 1),
})

/* ---------- placed / ghost item ---------- */
function PlacedItem({ item, def, hall, selected, wireframe, ghost, brushMount, onSelect, onSurfaceClick, onDragStart, onDragMove, controlsRef }) {
  const group = useMemo(() => buildItem(item, def || {}),
    // rebuild only when the look changes, not the position
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.type, item.color, item.sx])

  useEffect(() => {
    group.traverse((n) => {
      if (n.isMesh && n.material) {
        n.castShadow = !ghost
        n.receiveShadow = !ghost
        n.material.wireframe = !!wireframe
        if (ghost) {
          n.material = n.material.clone()
          n.material.transparent = true
          n.material.opacity = 0.45
          n.material.depthWrite = false
        }
        if (n.material.emissive) {
          n.material.emissive = new THREE.Color(selected && !ghost ? 0xC9A24B : 0x000000)
          n.material.emissiveIntensity = 0.3
        }
      }
      if (n.isSprite && ghost) n.material.opacity = 0.25
    })
  }, [group, selected, wireframe, ghost])

  const t = item.wall
    ? wallTransform(hall, item.wall.side, item.wall.u, item.wall.y)
    : { pos: [item.x, item.y || 0, item.z], ry: item.rot || 0 }
  const isSurface = ['table-round', 'table-long', 'bar'].includes(item.type)

  const drag = useRef(null)
  const handlers = ghost ? {} : {
    onPointerDown: (e) => {
      e.stopPropagation()
      drag.current = { moved: false, start: [e.clientX, e.clientY] }
      e.target.setPointerCapture?.(e.pointerId)
      if (controlsRef.current) controlsRef.current.enabled = false
    },
    onPointerMove: (e) => {
      const d = drag.current
      if (!d) return
      if (!d.moved && Math.hypot(e.clientX - d.start[0], e.clientY - d.start[1]) < 6) return
      if (!d.moved) { d.moved = true; onDragStart?.(item.id) }
      const hit = new THREE.Vector3()
      if (item.wall) {
        if (e.ray.intersectPlane(wallPlane(hall, item.wall.side), hit)) {
          const u = item.wall.side === 'back' ? hit.x : hit.z
          onDragMove?.(item.id, { wall: { side: item.wall.side, u: THREE.MathUtils.clamp(u, -8, 8), y: THREE.MathUtils.clamp(hit.y, 1.2, 4.4) } })
        }
      } else if (e.ray.intersectPlane(FLOOR_PLANE, hit)) {
        onDragMove?.(item.id, clampFloor(hall, hit))
      }
    },
    onPointerUp: (e) => {
      const d = drag.current
      drag.current = null
      e.target.releasePointerCapture?.(e.pointerId)
      if (controlsRef.current) controlsRef.current.enabled = true
      if (d && !d.moved) {
        e.stopPropagation()
        if (brushMount === 'table' && isSurface) {
          onSurfaceClick?.({ x: e.point.x, z: e.point.z, y: e.point.y + 0.02 })
        } else {
          onSelect?.(item.id)
        }
      }
    },
    onClick: (e) => e.stopPropagation(),
  }

  return <primitive object={group} position={t.pos} rotation-y={t.ry} {...handlers} />
}

function GhostMarker({ pending, defs, hall }) {
  const radius = useMemo(() => {
    if (pending.wall) return 0.9
    const g = buildItem(pending, defs[pending.type] || {})
    const box = new THREE.Box3().setFromObject(g)
    return Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2 + 0.25
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.type, pending.wall ? 'w' : 'f'])

  if (pending.wall) {
    const { pos, ry } = wallTransform(hall, pending.wall.side, pending.wall.u, pending.wall.y)
    return (
      <mesh position={[pos[0] + Math.sin(ry) * 0.02, pos[1], pos[2] + Math.cos(ry) * 0.02]} rotation-y={ry}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color="#C9A24B" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    )
  }
  return (
    <group position={[pending.x, pending.y || 0, pending.z]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[radius, 40]} />
        <meshBasicMaterial color="#C9A24B" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={0.03}>
        <torusGeometry args={[radius, 0.025, 8, 48]} />
        <meshBasicMaterial color="#C9A24B" transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ---------- hall ---------- */
function FloorWalls({ hall, env, controlMode, brushMount, onFloorClick, onWallClick, onMeasurePoint }) {
  const floorType = env.floor || 'tiles'
  const floorTex = useMemo(() => {
    const fn = FLOOR_TEX[floorType]
    return fn ? fn(hall) : null
  }, [floorType, hall.w, hall.d])
  const wallsType = env.walls || 'stone'
  const stone = useMemo(() => {
    const t = stoneTexture().clone(); t.needsUpdate = true; return t
  }, [])
  const hedges = useMemo(() => wallsType === 'hedge'
    ? Array.from({ length: 3 }) : [], [wallsType])

  const clickFloor = (e) => {
    if (e.delta > 5) return
    e.stopPropagation()
    const p = clampFloor(hall, e.point)
    if (controlMode === 'measure') onMeasurePoint(p.x, p.z)
    else onFloorClick?.(p.x, p.z)
  }
  const clickWall = (side) => (e) => {
    if (e.delta > 5 || brushMount !== 'wall' || controlMode === 'measure') return
    e.stopPropagation()
    const u = side === 'back' ? e.point.x : e.point.z
    const lim = (side === 'back' ? hall.w : hall.d) / 2 - 2
    onWallClick?.({ side, u: THREE.MathUtils.clamp(u, -lim, lim), y: THREE.MathUtils.clamp(e.point.y, 1.2, hall.h - 0.8) })
  }

  const wallDefs = [
    { side: 'back', w: hall.w, pos: [0, hall.h / 2, -hall.d / 2], ry: 0 },
    { side: 'left', w: hall.d, pos: [-hall.w / 2, hall.h / 2, 0], ry: Math.PI / 2 },
    { side: 'right', w: hall.d, pos: [hall.w / 2, hall.h / 2, 0], ry: -Math.PI / 2 },
  ]
  const drapeColor = wallsType.startsWith('drape:') ? wallsType.slice(6) : null

  return (
    <group>
      <mesh key={floorType + hall.w + "_" + hall.d} rotation-x={-Math.PI / 2} receiveShadow onClick={clickFloor}>
        <planeGeometry args={[hall.w, hall.d]} />
        {floorType === 'mirror' ? (
          <MeshReflectorMaterial
            blur={[280, 80]} resolution={512} mixBlur={0.9} mixStrength={2.2}
            roughness={0.6} depthScale={0.6} color="#3A3630" metalness={0.4} />
        ) : floorType === 'dark' ? (
          <meshStandardMaterial color="#232019" roughness={0.35} metalness={0.25} />
        ) : (
          <meshStandardMaterial map={floorTex} roughness={floorType === 'checker' ? 0.3 : 0.8} />
        )}
      </mesh>
      <gridHelper args={[Math.max(hall.w, hall.d), Math.max(hall.w, hall.d), '#C9A24B', '#C9B99B']}
        position-y={0.012} material-opacity={0.1} material-transparent />
      {wallDefs.map((wd) => (
        <mesh key={wallsType + wd.side + hall.w + "_" + hall.d} position={wd.pos} rotation-y={wd.ry} receiveShadow onClick={clickWall(wd.side)}>
          <planeGeometry args={[wd.w, hall.h]} />
          {wallsType === 'stone' ? (
            <meshStandardMaterial map={stone} map-repeat={[wd.w / 5, hall.h / 5]} roughness={0.95} />
          ) : drapeColor ? (
            <meshStandardMaterial color={drapeColor} roughness={0.95} />
          ) : wallsType === 'hedge' ? (
            <meshStandardMaterial color="#3E5637" roughness={1} />
          ) : (
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          )}
        </mesh>
      ))}
      {wallsType === 'hedge' && wallDefs.map((wd) => (
        <group key={'h' + wd.side} position={[wd.pos[0], 0, wd.pos[2]]} rotation-y={wd.ry}>
          {Array.from({ length: Math.floor(wd.w / 2) }, (_, i) => {
            const f = foliage(1.2, 0x3E5637)
            f.position.set(-wd.w / 2 + 1 + i * 2, 1 + (i % 2) * 0.5, 0.3)
            return <primitive key={i} object={f} />
          })}
        </group>
      ))}
    </group>
  )
}

function Measure({ points }) {
  const lineGeo = useMemo(() => points.length === 2
    ? new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, 0.05, p.z)))
    : null, [points])
  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={[p.x, 0.05, p.z]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshBasicMaterial color="#C9A24B" />
        </mesh>
      ))}
      {lineGeo && <line geometry={lineGeo}><lineBasicMaterial color="#C9A24B" /></line>}
    </group>
  )
}

function Capture({ captureRef }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (captureRef) captureRef.current = () => gl.domElement.toDataURL('image/jpeg', 0.7)
  }, [gl, captureRef])
  return null
}

/* ---------- main component (same props API as before) ---------- */
const LIGHTS = {
  day:    { amb: ['#FFF6E8', 0.55], hemi: ['#F4EEE0', '#9C8B72', 1.0], dir: ['#FFF2DC', 1.6], sky: null },
  dusk:   { amb: ['#FFE9D4', 0.4], hemi: ['#E8D4C4', '#6E5A50', 0.7], dir: ['#FFD9AE', 1.2] },
  night:  { amb: ['#8FA0C4', 0.22], hemi: ['#5A6A8E', '#2A2E3C', 0.4], dir: ['#B8C4E0', 0.35] },
  candle: { amb: ['#FFDCA8', 0.3], hemi: ['#8A7A64', '#2E2820', 0.45], dir: ['#FFD9A0', 0.3] },
  show:   { amb: ['#FFB870', 0.3], hemi: ['#C4763A', '#1E1006', 0.5], dir: ['#FFC88A', 0.5] },
  warm:   { amb: ['#FFC898', 0.35], hemi: ['#B08055', '#2A1810', 0.55], dir: ['#FFCF9A', 0.6] },
  sunset: { amb: ['#FFB088', 0.35], hemi: ['#D08A5A', '#20100A', 0.5], dir: ['#FFB878', 0.5] },
  party:  { amb: ['#C88AB8', 0.3], hemi: ['#8A5A8E', '#1A1024', 0.45], dir: ['#E8A0C8', 0.4] },
}

export default function Scene3D({
  items, defs, hall = DEFAULT_HALL, env = { sky: '#EDE6D6', floor: 'tiles', walls: 'stone', light: 'day', features: {} },
  wireframe = false, controlMode = 'orbit', brushMount = 'floor',
  selectedId = null, pending = null,
  onFloorClick, onWallClick, onSurfaceClick, onSelectItem, onDragStart, onDragMove, onMeasure, captureRef,
}) {
  const L = LIGHTS[env.light] || LIGHTS.day
  const controlsRef = useRef(null)
  const [measurePts, setMeasurePts] = useState([])

  useEffect(() => { if (controlMode !== 'measure') setMeasurePts([]) }, [controlMode])
  const addMeasurePoint = (x, z) => {
    setMeasurePts((cur) => {
      const next = cur.length >= 2 ? [{ x, z }] : [...cur, { x, z }]
      if (next.length === 2) onMeasure?.(Math.hypot(next[0].x - next[1].x, next[0].z - next[1].z))
      return next
    })
  }

  return (
    <Canvas
      shadows
      camera={{ position: [13, 10, 16], fov: 52 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={[env.sky || '#EDE6D6']} />
      <fog attach="fog" args={[env.sky || '#EDE6D6', Math.max(hall.w, hall.d) * 1.4, Math.max(hall.w, hall.d) * 3]} />
      <ambientLight color={L.amb[0]} intensity={L.amb[1]} />
      <hemisphereLight args={L.hemi} />
      <directionalLight
        color={L.dir[0]} intensity={L.dir[1]} position={[9, 15, 8]} castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}
        shadow-camera-left={-hall.w} shadow-camera-right={hall.w}
        shadow-camera-top={hall.d + 6} shadow-camera-bottom={-hall.d - 6}
      />
      <Suspense fallback={null}>
        <Environment preset="sunset" background={false} />
      </Suspense>

      <FloorWalls
        hall={hall} env={env} controlMode={controlMode} brushMount={brushMount}
        onFloorClick={onFloorClick} onWallClick={onWallClick} onMeasurePoint={addMeasurePoint}
      />
      <EnvironmentScene key={(env && env.id) || JSON.stringify(env.features || {})} env={env} hall={hall} />

      {items.map((item) => (
        <PlacedItem key={item.id} item={item} def={defs[item.type]} hall={hall}
          selected={item.id === selectedId} wireframe={wireframe} brushMount={brushMount}
          onSelect={onSelectItem} onSurfaceClick={onSurfaceClick}
          onDragStart={onDragStart} onDragMove={onDragMove}
          controlsRef={controlsRef} />
      ))}

      {pending && (
        <>
          <PlacedItem item={pending} def={defs[pending.type]} hall={hall} ghost controlsRef={controlsRef} />
          <GhostMarker pending={pending} defs={defs} hall={hall} />
        </>
      )}

      {controlMode === 'measure' && <Measure points={measurePts} />}

      <OrbitControls
        ref={controlsRef} makeDefault enableDamping
        target={[0, 1, 0]} maxPolarAngle={Math.PI / 2.06}
        minDistance={3.5} maxDistance={40}
        enableRotate={controlMode === 'orbit'}
        screenSpacePanning={false}
      />
      <EffectComposer disableNormalPass>
        <Bloom intensity={0.35} luminanceThreshold={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.5} />
      </EffectComposer>
      <Capture captureRef={captureRef} />
    </Canvas>
  )
}
