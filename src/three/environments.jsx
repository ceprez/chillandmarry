import React, { useMemo } from 'react'
import * as THREE from 'three'
import { MeshReflectorMaterial } from '@react-three/drei'
import { M, mesh, glow, foliage, rose } from './builders.js'

/* ---------- procedural textures ---------- */
function canvasTex(draw, w = 256, h = 256, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat) }
  return t
}
export const FLOOR_TEX = {
  tiles: (hall) => canvasTex((g) => {
    const tones = ['#B7A88E', '#AC9D82', '#C0B196', '#A2937A']
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      g.fillStyle = tones[(Math.random() * 4) | 0]; g.fillRect(x * 64 + 1, y * 64 + 1, 62, 62)
    }
  }, 256, 256, [hall.w / 4, hall.d / 4]),
  grass: (hall) => canvasTex((g) => {
    g.fillStyle = '#4E6B3E'; g.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = ['#57774A', '#446038', '#5E8050'][(Math.random() * 3) | 0]
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 3)
    }
  }, 256, 256, [hall.w / 3, hall.d / 3]),
  checker: (hall) => canvasTex((g) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      g.fillStyle = (x + y) % 2 ? '#F2EEE6' : '#211D19'; g.fillRect(x * 32, y * 32, 32, 32)
    }
  }, 256, 256, [hall.w / 4, hall.d / 4]),
  diamond: (hall) => canvasTex((g) => {
    g.fillStyle = '#E8862E'; g.fillRect(0, 0, 256, 256)
    g.fillStyle = '#F2C230'
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) {
      g.save(); g.translate(x * 32 + 16, y * 32 + 16); g.rotate(Math.PI / 4); g.fillRect(-13, -13, 26, 26); g.restore()
    }
  }, 256, 256, [hall.w / 5, hall.d / 5]),
  cobble: (hall) => canvasTex((g) => {
    g.fillStyle = '#7E7468'; g.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 120; i++) {
      g.fillStyle = ['#8A8072', '#746A5E', '#948A7C'][(Math.random() * 3) | 0]
      g.beginPath(); g.ellipse(Math.random() * 256, Math.random() * 256, 12, 9, 0, 0, 7); g.fill()
    }
  }, 256, 256, [hall.w / 3, hall.d / 3]),
  dark: () => null,
  mirror: () => null,
}

function moonTex() {
  return canvasTex((g) => {
    const grad = g.createRadialGradient(110, 110, 30, 128, 128, 128)
    grad.addColorStop(0, '#F5F1E6'); grad.addColorStop(1, '#B9B2A2')
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 40; i++) {
      g.fillStyle = 'rgba(120,112,100,0.25)'
      g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 16, 0, 7); g.fill()
    }
  })
}

/* ---------- feature components ---------- */
function StarCeiling({ hall, layers = 4 }) {
  const geo = useMemo(() => {
    const pts = []
    for (let L = 0; L < layers; L++) for (let i = 0; i < 900; i++) {
      const x = (Math.random() - 0.5) * hall.w
      const z = (Math.random() - 0.5) * hall.d
      const y = hall.h - 0.3 - L * 0.55 - Math.sin(x * 0.6 + L) * 0.4 - Math.random() * 0.25
      pts.push(x, y, z)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [hall.w, hall.d, hall.h, layers])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#FFF3D8" size={0.055} sizeAttenuation transparent opacity={0.95} toneMapped={false} />
    </points>
  )
}

function Moons({ hall }) {
  const tex = useMemo(() => moonTex(), [])
  const moons = [[0, hall.h - 2.4, -2, 2.1], [-6, hall.h - 1.6, -4, 1.0], [6, hall.h - 1.8, -3.5, 0.9], [-8.5, hall.h - 2.6, 1, 0.7], [8.5, hall.h - 2.2, 0.5, 0.8]]
  return moons.map(([x, y, z, r], i) => (
    <group key={i} position={[x, y, z]}>
      <mesh><sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFF6E0" emissiveIntensity={0.9} /></mesh>
      <pointLight color="#F3ECDA" intensity={r * 14} distance={12} decay={1.8} />
    </group>
  ))
}

function DiscoBalls({ hall, n = 22 }) {
  const balls = useMemo(() => Array.from({ length: n }, () => [
    (Math.random() - 0.5) * (hall.w - 4), hall.h - 0.8 - Math.random() * 2.6, (Math.random() - 0.5) * (hall.d - 4),
    0.18 + Math.random() * 0.28,
  ]), [n, hall])
  return balls.map(([x, y, z, r], i) => (
    <group key={i}>
      <mesh position={[x, (y + hall.h) / 2, z]}><cylinderGeometry args={[0.006, 0.006, hall.h - y, 4]} />
        <meshBasicMaterial color="#333" /></mesh>
      <mesh position={[x, y, z]}><sphereGeometry args={[r, 16, 16]} />
        <meshStandardMaterial color="#DFE6EE" metalness={1} roughness={0.12} envMapIntensity={2} /></mesh>
    </group>
  ))
}

function Palms({ hall }) {
  const palm = (x, z, s = 1) => (
    <group key={x + '_' + z} position={[x, 0, z]} scale={s}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.sin(i * 0.5) * 0.12, 0.5 + i * 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.16 - i * 0.014, 0.2 - i * 0.014, 0.95, 8]} />
          <meshStandardMaterial color="#6B5A44" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        return (
          <mesh key={'f' + i} position={[Math.cos(a) * 0.9, 4.6, Math.sin(a) * 0.9]}
            rotation={[Math.sin(a) * 0.9, -a, Math.cos(a) * 0.9]} castShadow>
            <coneGeometry args={[0.28, 2.4, 4]} />
            <meshStandardMaterial color="#3F5A38" roughness={0.85} />
          </mesh>
        )
      })}
      <pointLight position={[0, 1.2, 0.6]} color="#FFD9A0" intensity={4} distance={5} />
    </group>
  )
  const xs = [-hall.w / 2 + 3, hall.w / 2 - 3]
  const zs = [-hall.d / 2 + 3, -hall.d / 6, hall.d / 6, hall.d / 2 - 3]
  return xs.flatMap((x) => zs.map((z) => palm(x, z, 0.95 + Math.random() * 0.15)))
}

function CeilingDrapes({ hall, color = '#F2E8D8' }) {
  return Array.from({ length: 5 }, (_, i) => (
    <mesh key={i} position={[0, hall.h - 0.7 - (i % 2) * 0.5, -hall.d / 2 + 1.5 + i * (hall.d - 3) / 4]}
      rotation-x={Math.PI / 2}>
      <cylinderGeometry args={[0.9, 0.9, hall.w - 2, 24, 1, true, 0, Math.PI]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.85}
        emissive={color} emissiveIntensity={0.25} roughness={1} />
    </mesh>
  ))
}

function TulleCloud({ hall, color = '#E8452A' }) {
  const blobs = useMemo(() => Array.from({ length: 14 }, () => [
    (Math.random() - 0.5) * (hall.w - 8), hall.h - 1.4 - Math.random() * 1.2, (Math.random() - 0.5) * 5,
    1 + Math.random() * 1.4,
  ]), [hall])
  return (
    <group>
      {blobs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[r, r * 0.7, r * 0.8]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={color} transparent opacity={0.32} emissive={color}
            emissiveIntensity={0.5} depthWrite={false} roughness={1} />
        </mesh>
      ))}
      <pointLight position={[0, hall.h - 1.6, 0]} color="#FF8A50" intensity={26} distance={14} decay={1.8} />
    </group>
  )
}

function SunBackdrop({ hall, drape = '#C77E4A' }) {
  const sunT = useMemo(() => canvasTex((g) => {
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128)
    grad.addColorStop(0, '#FFEAB8'); grad.addColorStop(0.7, '#F5C36A'); grad.addColorStop(1, '#E8A24A')
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256)
  }), [])
  return (
    <group position={[0, 0, -hall.d / 2 + 0.35]}>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-hall.w / 2 + 1.5 + i * (hall.w - 3) / 8, hall.h / 2, 0]}>
          <cylinderGeometry args={[0.5, 0.6, hall.h, 10, 1, true]} />
          <meshStandardMaterial color={drape} side={THREE.DoubleSide} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, hall.h * 0.55, 0.4]}>
        <circleGeometry args={[2.3, 48]} />
        <meshBasicMaterial map={sunT} toneMapped={false} />
      </mesh>
      <pointLight position={[0, hall.h * 0.55, 1.4]} color="#FFCF8A" intensity={40} distance={18} decay={1.8} />
    </group>
  )
}

function BeamLights({ hall }) {
  const beams = [[-4, -0.5], [-1.5, 0.4], [1.5, -0.4], [4, 0.5]]
  return beams.map(([x, tilt], i) => (
    <mesh key={i} position={[x, hall.h / 2, -hall.d / 2 + 2.2]} rotation-z={tilt}>
      <coneGeometry args={[1.1, hall.h, 20, 1, true]} />
      <meshBasicMaterial color={i % 2 ? '#FFD27A' : '#FFF3D0'} transparent opacity={0.13}
        side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  ))
}

function DrapeColumns({ hall, colors = ['#D98A3C'] }) {
  const cols = []
  const n = 6
  for (let i = 0; i < n; i++) {
    for (const side of [-1, 1]) {
      cols.push([side * (hall.w / 2 - 0.5), -hall.d / 2 + 1.5 + i * (hall.d - 3) / (n - 1), colors[i % colors.length]])
    }
  }
  return cols.map(([x, z, c], i) => (
    <group key={i} position={[x, 0, z]}>
      <mesh position={[0, hall.h / 2, 0]}>
        <cylinderGeometry args={[0.45, 0.55, hall.h, 10, 1, true]} />
        <meshStandardMaterial color={c} side={THREE.DoubleSide} roughness={0.95}
          emissive={c} emissiveIntensity={0.12} />
      </mesh>
      <pointLight position={[x > 0 ? -0.8 : 0.8, 0.6, 0]} color={c} intensity={6} distance={5} />
    </group>
  ))
}

function FringeLamps({ hall, colors = ['#E8632A', '#C43B2A', '#E8862E'] }) {
  const lamps = useMemo(() => Array.from({ length: 9 }, () => [
    (Math.random() - 0.5) * (hall.w - 8), hall.h - 1 - Math.random() * 1.4, (Math.random() - 0.5) * (hall.d - 8),
    0.5 + Math.random() * 0.4,
  ]), [hall])
  return lamps.map(([x, y, z, r], i) => (
    <group key={i} position={[x, y, z]}>
      <mesh><coneGeometry args={[r, r * 1.1, 18, 1, true]} />
        <meshStandardMaterial color={colors[i % 3]} side={THREE.DoubleSide} roughness={0.9} /></mesh>
      <mesh position={[0, -r * 0.62, 0]}><cylinderGeometry args={[r * 1.02, r * 1.02, r * 0.24, 18, 1, true]} />
        <meshStandardMaterial color={colors[(i + 1) % 3]} side={THREE.DoubleSide} roughness={1} transparent opacity={0.9} /></mesh>
      <pointLight color="#FFD9A0" intensity={5} distance={6} position={[0, -0.2, 0]} />
    </group>
  ))
}

function Festoon({ hall, rows = [-3, 0, 3] }) {
  return rows.map((zz, r) => (
    <group key={r}>
      {Array.from({ length: 17 }, (_, i) => {
        const t = i / 16
        const x = (t - 0.5) * (hall.w - 2)
        const y = hall.h - 1 - Math.sin(t * Math.PI) * 0.6
        return (
          <group key={i} position={[x, y, zz]}>
            <mesh><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#FFE2A8" toneMapped={false} /></mesh>
          </group>
        )
      })}
    </group>
  ))
}

function FloralArchRow({ hall, color = '#EBAEBB' }) {
  const arches = [-6, -2, 2, 6]
  return arches.map((z, ai) => (
    <group key={ai} position={[0, 0, z]}>
      <mesh position={[0, 2.6, 0]} rotation-y={Math.PI / 2} castShadow>
        <torusGeometry args={[2.4, 0.16, 10, 36, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 8) * Math.PI
        const f = rose(new THREE.Color(color).getHex(), 0.13 + Math.random() * 0.07)
        f.position.set(0, 2.6 + 2.4 * Math.sin(a), 2.4 * Math.cos(a))
        return <primitive key={i} object={f} />
      })}
      {[-2.4, 2.4].map((zz) => (
        <mesh key={zz} position={[0, 1.3, zz]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 2.6, 8]} />
          <meshStandardMaterial color="#C9A24B" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <group position={[0, 3.6, 0]}>
        <mesh><coneGeometry args={[0.55, 0.9, 14, 1, true]} />
          <meshStandardMaterial color="#E8C87A" emissive="#FFDf9A" emissiveIntensity={0.7}
            transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
        <pointLight color="#FFE2A8" intensity={9} distance={7} />
      </group>
    </group>
  ))
}

function WisteriaCanopy({ hall, colors = ['#AEC6E8', '#F2F0E6'] }) {
  const seed = useMemo(() => Math.random(), [])
  void seed
  return (
    <group position={[0, hall.h - 1.1, 0]}>
      {Array.from({ length: 8 }, (_, i) => {
        const f = foliage(1.4, 0x4E6B45)
        f.position.set((Math.random() - 0.5) * (hall.w - 6), 0, (Math.random() - 0.5) * (hall.d - 6))
        return <primitive key={'f' + i} object={f} />
      })}
      {Array.from({ length: 26 }, (_, i) => (
        <mesh key={'s' + i}
          position={[(Math.random() - 0.5) * (hall.w - 6), -0.55 - Math.random() * 0.5, (Math.random() - 0.5) * (hall.d - 6)]}>
          <cylinderGeometry args={[0.05, 0.02, 0.7 + Math.random() * 0.5, 6]} />
          <meshStandardMaterial color={colors[i % 2]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function GlassRoof({ hall }) {
  const beams = []
  for (let i = 0; i <= 6; i++) beams.push([-hall.w / 2 + i * hall.w / 6, 0])
  return (
    <group position={[0, hall.h, 0]}>
      {beams.map(([x], i) => (
        <mesh key={i} position={[x, 0.4, 0]}>
          <boxGeometry args={[0.12, 0.8, hall.d]} />
          <meshStandardMaterial color="#1E1B17" roughness={0.6} />
        </mesh>
      ))}
      <mesh rotation-x={Math.PI / 2} position-y={0.82}>
        <planeGeometry args={[hall.w, hall.d]} />
        <meshStandardMaterial color="#9FB6CE" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function TieredChandeliers({ hall, zs = [-4, 0, 4] }) {
  return zs.map((z, i) => (
    <group key={i} position={[0, hall.h - 1.15, z]}>
      {[0.65, 0.5, 0.35].map((r, k) => (
        <mesh key={k} position-y={-k * 0.42}>
          <cylinderGeometry args={[r, r, 0.3, 20, 1, true]} />
          <meshStandardMaterial color="#E8C87A" emissive="#FFDF9A" emissiveIntensity={0.8}
            transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <pointLight color="#FFE2A8" intensity={14} distance={10} decay={1.8} />
    </group>
  ))
}

function LampshadeRunner({ hall, color = '#3A2E24' }) {
  return Array.from({ length: 8 }, (_, i) => (
    <group key={i} position={[-hall.w / 2 + 3 + i * (hall.w - 6) / 7, 1.5, 0]}>
      <mesh><coneGeometry args={[0.5, 0.55, 16, 1, true]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.95} /></mesh>
      <mesh position-y={-0.18}><sphereGeometry args={[0.08, 8, 8]} /><meshBasicMaterial color="#FFE2A8" toneMapped={false} /></mesh>
      <pointLight color="#FFDFA0" intensity={4} distance={4} />
    </group>
  ))
}

function Pool({ hall }) {
  return (
    <group position={[0, 0.005, hall.d / 2 - 1.4]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[hall.w, 2.8]} />
        <meshStandardMaterial color="#3FB6C9" roughness={0.1} metalness={0.3}
          emissive="#2A8FA3" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

function CastleWalls({ hall }) {
  return (
    <group>
      {[[-5, 0], [0, 0], [5, 0]].map(([x], i) => (
        <group key={i} position={[x, 0, -hall.d / 2 + 0.2]}>
          <mesh position={[0, 2.6, 0]}>
            <planeGeometry args={[1.1, 2.4]} />
            <meshStandardMaterial color="#141210" />
          </mesh>
          <mesh position={[0, 3.8, 0]}>
            <circleGeometry args={[0.55, 20, 0, Math.PI]} />
            <meshStandardMaterial color="#141210" />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const f = foliage(0.9, 0x3E5637)
        f.position.set((Math.random() - 0.5) * (hall.w - 4), 2 + Math.random() * 2.4, -hall.d / 2 + 0.5)
        return <primitive key={'ivy' + i} object={f} />
      })}
    </group>
  )
}

function ColonialBackdrop({ hall }) {
  const cols = ['#E8A9A0', '#EFC0A8', '#E8B4B8']
  return (
    <group position={[0, 0, -hall.d / 2 + 0.4]}>
      {[-7, -1, 5].map((x, i) => (
        <mesh key={i} position={[x, 1.9, 0]} castShadow>
          <boxGeometry args={[5.4, 3.8, 0.5]} />
          <meshStandardMaterial color={cols[i]} roughness={0.9} />
        </mesh>
      ))}
      {[-7, -1, 5].map((x, i) => (
        <mesh key={'r' + i} position={[x, 4.1, 0]} rotation-z={0}>
          <coneGeometry args={[3.4, 1.2, 4]} />
          <meshStandardMaterial color="#9C5A3C" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const f = foliage(2.0, 0x4E6B45)
        f.position.set((Math.random() - 0.5) * (hall.w - 4), hall.h - 1 - Math.random(), 2 + Math.random() * 3)
        return <primitive key={'tree' + i} object={f} />
      })}
    </group>
  )
}

function DarkColumns({ hall }) {
  const pts = [[-5, -3], [5, -3], [-5, 3], [5, 3]]
  return pts.map(([x, z], i) => (
    <group key={i}>
      <mesh position={[x, hall.h / 2, z]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, hall.h, 14]} />
        <meshStandardMaterial color="#17130F" roughness={0.4} />
      </mesh>
      <primitive object={(() => { const f = foliage(1.2, 0x8A5A2E); f.position.set(x, hall.h - 0.7, z); return f })()} />
    </group>
  ))
}

/* ---------- master environment component ---------- */
export default function EnvironmentScene({ env, hall }) {
  const F = env.features || {}
  return (
    <group>
      {F.stars && <StarCeiling hall={hall} layers={F.stars.layers || 4} />}

      {F.disco && <DiscoBalls hall={hall} n={F.disco.n || 20} />}

      {F.ceilingDrapes && <CeilingDrapes hall={hall} color={F.ceilingDrapes.color} />}
      {F.tulle && <TulleCloud hall={hall} color={F.tulle.color} />}
      {F.sun && <SunBackdrop hall={hall} drape={F.sun.drape} />}
      {F.beams && <BeamLights hall={hall} />}
      {F.drapeColumns && <DrapeColumns hall={hall} colors={F.drapeColumns.colors} />}

      {F.festoon && <Festoon hall={hall} />}

      {F.wisteria && <WisteriaCanopy hall={hall} />}
      {F.glassRoof && <GlassRoof hall={hall} />}


      {F.pool && <Pool hall={hall} />}
      {F.castle && <CastleWalls hall={hall} />}
      {F.colonial && <ColonialBackdrop hall={hall} />}

    </group>
  )
}
