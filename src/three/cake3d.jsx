import React, { useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/* ---------- decorations placeable on the cake ---------- */
function Decor({ type, pos, onRemove }) {
  const stop = (e) => { e.stopPropagation(); onRemove() }
  const P = { position: pos, onPointerDown: stop }
  switch (type) {
    case 'strawberry': return (
      <group {...P}>
        <mesh><coneGeometry args={[0.035, 0.055, 12]} /><meshStandardMaterial color="#C43B2E" roughness={0.4} /></mesh>
        <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.016, 8, 8]} /><meshStandardMaterial color="#4F6B42" /></mesh>
      </group>
    )
    case 'rose': return (
      <group {...P}>
        <mesh><sphereGeometry args={[0.032, 12, 12]} /><meshStandardMaterial color="#E9A9B8" roughness={0.6} /></mesh>
        <mesh><sphereGeometry args={[0.016, 8, 8]} /><meshStandardMaterial color="#FDFCF6" /></mesh>
      </group>
    )
    case 'macaron': return (
      <group {...P}>
        <mesh position={[0, 0.008, 0]}><cylinderGeometry args={[0.03, 0.03, 0.012, 16]} /><meshStandardMaterial color="#C3A6D8" /></mesh>
        <mesh><cylinderGeometry args={[0.026, 0.026, 0.006, 16]} /><meshStandardMaterial color="#FDFCF6" /></mesh>
        <mesh position={[0, -0.008, 0]}><cylinderGeometry args={[0.03, 0.03, 0.012, 16]} /><meshStandardMaterial color="#C3A6D8" /></mesh>
      </group>
    )
    case 'pearls': return (
      <group {...P}>
        {[[-0.02, 0], [0.02, 0.008], [0, -0.015]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]}><sphereGeometry args={[0.014, 10, 10]} /><meshStandardMaterial color="#F2ECE1" metalness={0.4} roughness={0.2} /></mesh>
        ))}
      </group>
    )
    case 'choco': return (
      <mesh {...P} rotation={[0.3, 0.6, 0.2]}>
        <boxGeometry args={[0.05, 0.012, 0.035]} />
        <meshStandardMaterial color="#5A3A22" roughness={0.5} />
      </mesh>
    )
    case 'berries': return (
      <group {...P}>
        {[[-0.018, 0], [0.018, 0.01], [0, -0.018], [0.005, 0.018]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]}><sphereGeometry args={[0.013, 8, 8]} /><meshStandardMaterial color={i % 2 ? '#3A2E5C' : '#6B2A3E'} roughness={0.5} /></mesh>
        ))}
      </group>
    )
    case 'candle': return (
      <group {...P}>
        <mesh position={[0, 0.035, 0]}><cylinderGeometry args={[0.008, 0.008, 0.07, 10]} /><meshStandardMaterial color="#F0D4DA" /></mesh>
        <mesh position={[0, 0.078, 0]}><sphereGeometry args={[0.009, 8, 8]} /><meshStandardMaterial color="#FFB347" emissive="#FF8C1A" emissiveIntensity={2} /></mesh>
        <pointLight position={[0, 0.09, 0]} intensity={0.25} distance={0.5} color="#FFB347" />
      </group>
    )
    default: return null
  }
}

/* ---------- tier with finish, beads, drip, flakes ---------- */
function Tier({ y, r, h, color, beads, drip, flakes, finish, onSurface }) {
  const beadCount = Math.max(10, Math.round(r * 26))
  const flakeSeeds = useMemo(() => Array.from({ length: 10 }, (_, i) => {
    const a = (i * 2.399963) % (Math.PI * 2)
    const rr = r * (0.25 + ((i * 0.618) % 0.65))
    return [Math.cos(a) * rr, Math.sin(a) * rr, (i * 0.77) % 1]
  }), [r])
  const matProps = finish === 'glaze'
    ? { color, roughness: 0.12, metalness: 0.25 }
    : finish === 'naked'
      ? { color, roughness: 0.95 }
      : { color, roughness: 0.55 }
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow onPointerDown={onSurface}>
        <cylinderGeometry args={[r, r, h, 48]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {finish !== 'naked' && (
        <mesh position={[0, h / 2, 0]}>
          <torusGeometry args={[r - 0.01, 0.018, 12, 48]} />
          <meshStandardMaterial color={drip ? '#8E5A3C' : '#FFFFFF'} roughness={0.4} />
        </mesh>
      )}
      {beads && Array.from({ length: beadCount }, (_, i) => {
        const a = (i / beadCount) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * r, -h / 2 + 0.025, Math.sin(a) * r]}>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color="#D9B36A" metalness={0.7} roughness={0.25} />
          </mesh>
        )
      })}
      {flakes && flakeSeeds.map(([x, z, s], i) => (
        <mesh key={'f' + i} position={[x, h / 2 + 0.006, z]} rotation={[s * 3, s * 6, 0]}>
          <octahedronGeometry args={[0.012 + s * 0.008]} />
          <meshStandardMaterial color="#E4C36A" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
    </group>
  )
}

function Topper({ kind, y }) {
  if (kind === 'heart') return (
    <group position={[0, y + 0.09, 0]}>
      <mesh position={[-0.045, 0.03, 0]}><sphereGeometry args={[0.055, 14, 14]} /><meshStandardMaterial color="#C05B45" /></mesh>
      <mesh position={[0.045, 0.03, 0]}><sphereGeometry args={[0.055, 14, 14]} /><meshStandardMaterial color="#C05B45" /></mesh>
      <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.1, 0.1, 0.07]} /><meshStandardMaterial color="#C05B45" /></mesh>
    </group>
  )
  if (kind === 'flowers') return (
    <group position={[0, y + 0.06, 0]}>
      {[[-0.07, 0, 0], [0.07, 0.02, 0.02], [0, 0.05, -0.05]].map((p, i) => (
        <group key={i} position={p}>
          <mesh><sphereGeometry args={[0.045, 12, 12]} /><meshStandardMaterial color="#E9A9B8" /></mesh>
          <mesh><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#FDFCF6" /></mesh>
        </group>
      ))}
    </group>
  )
  if (kind === 'stars') return (
    <group position={[0, y + 0.09, 0]}>
      {[[-0.06, 0], [0.06, 0.03], [0, 0.08]].map(([x, dy], i) => (
        <mesh key={i} position={[x, dy, 0]} rotation={[0, i, 0]}>
          <octahedronGeometry args={[0.05]} />
          <meshStandardMaterial color="#D9B36A" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
  if (kind === 'rings') return (
    <group position={[0, y + 0.08, 0]}>
      <mesh position={[-0.035, 0, 0]} rotation={[Math.PI / 2.4, 0, 0.3]}>
        <torusGeometry args={[0.05, 0.011, 12, 32]} />
        <meshStandardMaterial color="#E4C36A" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0.035, 0.01, 0]} rotation={[Math.PI / 2.1, 0, -0.35]}>
        <torusGeometry args={[0.05, 0.011, 12, 32]} />
        <meshStandardMaterial color="#F2ECE1" metalness={0.85} roughness={0.15} />
      </mesh>
    </group>
  )
  return null
}

/* ---------- text banner curved onto the bottom tier ---------- */
function CakeText({ text, color, r, y, h }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024; c.height = 200
    const g = c.getContext('2d')
    g.clearRect(0, 0, c.width, c.height)
    g.fillStyle = color
    g.font = "600 92px 'BPG Ninomtavruli', Georgia, serif"
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(text, c.width / 2, c.height / 2)
    const t = new THREE.CanvasTexture(c)
    t.anisotropy = 4
    return t
  }, [text, color])
  if (!text) return null
  const len = Math.min(Math.PI * 0.9, 0.5 + text.length * 0.11)
  return (
    <mesh position={[0, y, 0]} rotation={[0, Math.PI / 2 + len / 2, 0]}>
      <cylinderGeometry args={[r + 0.006, r + 0.006, h * 0.7, 48, 1, true, 0, len]} />
      <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

function CakeModel({ cfg, activeDecor, onPlace, onRemoveDecor }) {
  const { tiers, colors, topper, beads, drip, flakes, finish, dia = 32, th = 10, text, textColor, decors = [] } = cfg
  const baseR = 0.5 * (dia / 32)
  const baseH = 0.24 * (th / 10)
  let y = 0
  const parts = []
  for (let i = 0; i < tiers; i++) {
    const r = baseR - i * baseR * 0.23
    const h = baseH - i * 0.02
    y += h / 2
    parts.push({ y, r, h, color: colors[i] || '#F7F1E4' })
    y += h / 2
  }
  const surface = (e) => {
    if (!activeDecor) return
    e.stopPropagation()
    const p = e.point
    onPlace([p.x, p.y + 0.25, p.z])
  }
  return (
    <group>
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.06, 40]} />
        <meshStandardMaterial color="#EDE2CC" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.75, 16]} />
        <meshStandardMaterial color="#B08D6E" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.31, 0]}>
        <torusGeometry args={[1.1, 0.025, 12, 48]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.28, 0]} castShadow>
        <cylinderGeometry args={[baseR + 0.14, baseR + 0.2, 0.05, 40]} />
        <meshStandardMaterial color="#D9B36A" metalness={0.55} roughness={0.3} />
      </mesh>
      <group position={[0, -0.25, 0]}>
        {parts.map((p, i) => (
          <Tier key={i} {...p} beads={beads} drip={drip} flakes={flakes} finish={finish} onSurface={surface} />
        ))}
        {parts[0] && <CakeText text={text} color={textColor || '#8E5A3C'} r={parts[0].r} y={parts[0].y} h={parts[0].h} />}
        <Topper kind={topper} y={y} />
        {decors.map((d) => (
          <Decor key={d.id} type={d.type} pos={d.pos} onRemove={() => onRemoveDecor(d.id)} />
        ))}
      </group>
    </group>
  )
}

function CaptureRig({ captureRef }) {
  const { gl, scene, camera } = useThree()
  React.useEffect(() => {
    captureRef.current = () => {
      const angles = [
        { name: 'წინხედი', pos: [0, 0.15, 2.2] },
        { name: 'გვერდი 45°', pos: [1.6, 0.5, 1.6] },
        { name: 'ზემოდან', pos: [0, 2.4, 0.6] },
        { name: 'უკნიდან', pos: [-1.6, 0.35, -1.6] },
      ]
      const shots = []
      const oldPos = camera.position.clone()
      for (const a of angles) {
        camera.position.set(...a.pos)
        camera.lookAt(0, -0.05, 0)
        gl.render(scene, camera)
        shots.push({ name: a.name, url: gl.domElement.toDataURL('image/png') })
      }
      camera.position.copy(oldPos)
      camera.lookAt(0, -0.05, 0)
      gl.render(scene, camera)
      const size = 640
      const c = document.createElement('canvas')
      c.width = size * 2; c.height = size * 2 + 40
      const g = c.getContext('2d')
      g.fillStyle = '#FDFBF7'; g.fillRect(0, 0, c.width, c.height)
      let loaded = 0
      shots.forEach((sh, i) => {
        const img = new Image()
        img.onload = () => {
          const x = (i % 2) * size, y2 = Math.floor(i / 2) * size
          g.drawImage(img, x, y2, size, size)
          g.fillStyle = '#5C5248'; g.font = '600 20px sans-serif'
          g.fillText(sh.name, x + 16, y2 + 30)
          if (++loaded === 4) {
            g.fillStyle = '#C9A24B'; g.font = '600 22px serif'
            g.fillText('Chill & Marry — ტორტის დიზაინი', 16, c.height - 12)
            const a2 = document.createElement('a')
            a2.download = 'cake-design-angles.png'
            a2.href = c.toDataURL('image/png')
            a2.click()
          }
        }
        img.src = sh.url
      })
    }
  }, [gl, scene, camera, captureRef])
  return null
}

export default function Cake3D({ cfg, activeDecor, onPlace, onRemoveDecor, captureRef }) {
  return (
    <div style={{ aspectRatio: '4/3', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--linen)', background: '#F6F1E8', cursor: activeDecor ? 'crosshair' : 'grab' }}>
      <Canvas shadows dpr={[1, 1.5]} gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ position: [0, 0.35, 2.3], fov: 40 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-2, 1, -1]} intensity={0.4} color="#FFE3B0" />
        <CakeModel cfg={cfg} activeDecor={activeDecor} onPlace={onPlace} onRemoveDecor={onRemoveDecor} />
        <CaptureRig captureRef={captureRef} />
        <OrbitControls enablePan={false} minDistance={1.2} maxDistance={4} target={[0, -0.05, 0]} enabled={!activeDecor} enableZoom={true} />
      </Canvas>
    </div>
  )
}
