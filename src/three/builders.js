import * as THREE from 'three'

export const HALL = { w: 20, d: 14, h: 5.2 }

/* ------- shared textures ------- */
let _glowTex = null
function glowTexture() {
  if (_glowTex) return _glowTex
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,235,190,0.9)')
  grad.addColorStop(0.4, 'rgba(255,220,160,0.35)')
  grad.addColorStop(1, 'rgba(255,220,160,0)')
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128)
  _glowTex = new THREE.CanvasTexture(c)
  return _glowTex
}
function glow(size = 1.4, opacity = 0.9) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending,
  }))
  s.scale.set(size, size, 1)
  return s
}

let _parquetTex = null
function parquetTexture() {
  if (_parquetTex) return _parquetTex
  const c = document.createElement('canvas'); c.width = 512; c.height = 512
  const g = c.getContext('2d')
  const base = ['#B08D5F', '#A8834F', '#B8935F', '#A07A48', '#B48B55']
  const pw = 128, ph = 32
  for (let y = 0; y < 512 / ph; y++) {
    const off = (y % 2) * pw / 2
    for (let x = -1; x < 512 / pw + 1; x++) {
      g.fillStyle = base[Math.floor(Math.random() * base.length)]
      g.fillRect(x * pw + off, y * ph, pw - 2, ph - 2)
      g.fillStyle = 'rgba(80,55,30,0.18)'
      g.fillRect(x * pw + off, y * ph + ph - 3, pw - 2, 1)
    }
  }
  _parquetTex = new THREE.CanvasTexture(c)
  _parquetTex.wrapS = _parquetTex.wrapT = THREE.RepeatWrapping
  _parquetTex.repeat.set(4, 3)
  return _parquetTex
}

let _stoneTex = null
function stoneTexture() {
  if (_stoneTex) return _stoneTex
  const c = document.createElement('canvas'); c.width = 512; c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = '#9C8B76'; g.fillRect(0, 0, 512, 512)
  const tones = ['#A89478', '#8F7C64', '#B3A184', '#7E6E5A', '#A08A6C', '#95805F']
  let y = 0
  while (y < 512) {
    const rh = 26 + Math.random() * 22
    let x = -10
    while (x < 512) {
      const rw = 34 + Math.random() * 46
      g.fillStyle = tones[Math.floor(Math.random() * tones.length)]
      g.beginPath()
      g.roundRect(x + 2, y + 2, rw - 4, rh - 4, 6)
      g.fill()
      g.fillStyle = 'rgba(255,240,210,0.08)'
      g.fillRect(x + 4, y + 4, rw - 8, 3)
      x += rw
    }
    y += rh
  }
  _stoneTex = new THREE.CanvasTexture(c)
  _stoneTex.wrapS = _stoneTex.wrapT = THREE.RepeatWrapping
  return _stoneTex
}

let _tileTex = null
function tileTexture() {
  if (_tileTex) return _tileTex
  const c = document.createElement('canvas'); c.width = 512; c.height = 512
  const g = c.getContext('2d')
  const tones = ['#B7A88E', '#AC9D82', '#C0B196', '#A2937A']
  const t = 128
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    g.fillStyle = tones[Math.floor(Math.random() * tones.length)]
    g.fillRect(x * t + 2, y * t + 2, t - 4, t - 4)
  }
  _tileTex = new THREE.CanvasTexture(c)
  _tileTex.wrapS = _tileTex.wrapT = THREE.RepeatWrapping
  _tileTex.repeat.set(5, 3.5)
  return _tileTex
}

function foliage(scale = 1, tone = 0x4E6B45) {
  const g = new THREE.Group()
  const mats = [M.std(tone, { roughness: 0.9 }), M.std(0x5E7C50, { roughness: 0.9 }), M.std(0x42593B, { roughness: 0.9 })]
  for (let i = 0; i < 9; i++) {
    const m = mesh(g, new THREE.SphereGeometry(0.28 + Math.random() * 0.2, 8, 7),
      mats[i % 3],
      (Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.7)
    m.scale.y = 0.6 + Math.random() * 0.3
  }
  g.scale.setScalar(scale)
  return g
}

function grandPiano() {
  const g = new THREE.Group()
  const black = new THREE.MeshStandardMaterial({ color: 0x17130F, roughness: 0.2, metalness: 0.35 })
  const body = mesh(g, new THREE.BoxGeometry(1.7, 0.28, 1.05), black, 0, 0.72, 0)
  mesh(g, new THREE.CylinderGeometry(0.52, 0.52, 0.28, 20, 1, false, 0, Math.PI), black, 0.85, 0.72, 0)
  const lid = mesh(g, new THREE.BoxGeometry(1.5, 0.03, 0.95), black, -0.1, 1.02, -0.18)
  lid.rotation.x = -0.55
  mesh(g, new THREE.BoxGeometry(0.05, 0.03, 0.6), black, 0.4, 1.1, -0.35).rotation.x = -0.55
  for (const [lx, lz] of [[-0.7, -0.4], [-0.7, 0.4], [0.95, 0]])
    mesh(g, new THREE.CylinderGeometry(0.045, 0.03, 0.62, 8), black, lx, 0.31, lz)
  mesh(g, new THREE.BoxGeometry(0.75, 0.05, 0.06), M.std(0xF5EFE0, { roughness: 0.4 }), -0.55, 0.78, 0.56)
  mesh(g, new THREE.BoxGeometry(0.6, 0.09, 0.32), black, -0.55, 0.45, 0.95)
  return g
}

/* ------- small builders ------- */
const M = {
  std: (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...opts }),
  gold: () => new THREE.MeshStandardMaterial({ color: 0xC9A24B, roughness: 0.3, metalness: 0.7 }),
  glass: () => new THREE.MeshStandardMaterial({ color: 0xEAF2F5, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.4 }),
  green: () => new THREE.MeshStandardMaterial({ color: 0x5E7A52, roughness: 0.8 }),
}
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m
}

function rose(color, r = 0.11) {
  const g = new THREE.Group()
  const outer = M.std(color, { roughness: 0.55 })
  const inner = M.std(new THREE.Color(color).multiplyScalar(0.82), { roughness: 0.55 })
  mesh(g, new THREE.SphereGeometry(r, 12, 10), outer)
  mesh(g, new THREE.SphereGeometry(r * 0.62, 10, 8), inner, 0, r * 0.35, 0)
  mesh(g, new THREE.SphereGeometry(r * 0.3, 8, 8), M.std(0xF6EEDC), 0, r * 0.6, 0)
  return g
}
function bouquetCluster(color, n = 8, spread = 0.24) {
  const g = new THREE.Group()
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.6
    const rr = spread * (0.4 + Math.random() * 0.6)
    const f = rose(color, 0.09 + Math.random() * 0.045)
    f.position.set(Math.cos(a) * rr, Math.random() * 0.09, Math.sin(a) * rr)
    g.add(f)
    const leaf = mesh(g, new THREE.ConeGeometry(0.05, 0.2, 6), M.green(),
      Math.cos(a) * (rr + 0.12), -0.02, Math.sin(a) * (rr + 0.12))
    leaf.rotation.z = Math.cos(a) * 0.9
    leaf.rotation.x = Math.sin(a) * 0.9
  }
  return g
}
function placeSetting(parent, x, z, angle) {
  const plate = mesh(parent, new THREE.CylinderGeometry(0.14, 0.14, 0.015, 20), M.std(0xF7F3EA, { roughness: 0.35 }), x, 0.795, z)
  mesh(parent, new THREE.TorusGeometry(0.125, 0.006, 6, 24), M.gold(), x, 0.805, z).rotation.x = Math.PI / 2
  const gx = x + Math.cos(angle + 0.5) * 0.2, gz = z + Math.sin(angle + 0.5) * 0.2
  mesh(parent, new THREE.CylinderGeometry(0.028, 0.02, 0.1, 8), M.glass(), gx, 0.85, gz)
  mesh(parent, new THREE.SphereGeometry(0.035, 8, 8), M.glass(), gx, 0.92, gz)
  return plate
}
function chair(color) {
  const g = new THREE.Group()
  const frame = M.gold()
  for (const [lx, lz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]])
    mesh(g, new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), frame, lx, 0.225, lz)
  mesh(g, new THREE.BoxGeometry(0.36, 0.05, 0.36), M.std(color), 0, 0.47, 0)
  for (const h of [0.68, 0.82])
    mesh(g, new THREE.CylinderGeometry(0.015, 0.015, 0.34, 6), frame, 0, h, -0.17).rotation.z = Math.PI / 2
  for (const lx of [-0.15, 0.15])
    mesh(g, new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), frame, lx, 0.68, -0.17)
  return g
}
function candleSticks(color, waxColor) {
  const g = new THREE.Group()
  mesh(g, new THREE.CylinderGeometry(0.26, 0.3, 0.03, 20), M.gold(), 0, 0.015, 0)
  const heights = [0.42, 0.3, 0.22]
  const pos = [[-0.1, 0.05], [0.1, -0.06], [0.02, 0.12]]
  heights.forEach((h, i) => {
    mesh(g, new THREE.CylinderGeometry(0.035, 0.04, h, 10), M.std(waxColor, { roughness: 0.5 }), pos[i][0], h / 2 + 0.03, pos[i][1])
    const fl = mesh(g, new THREE.SphereGeometry(0.02, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xFFE0A0 }), pos[i][0], h + 0.06, pos[i][1])
    fl.material.toneMapped = false
    const gl = glow(0.45, 0.8); gl.position.set(pos[i][0], h + 0.07, pos[i][1]); g.add(gl)
  })
  return g
}

/* ------- item builders (item.color = hex string) ------- */
function buildItem(item, def) {
  const g = new THREE.Group()
  const col = new THREE.Color(item.color || (def.colors?.[0]?.hex ?? '#F5EFE4'))
  const type = (def && def.builder) || item.type

  if (type === 'table-round') {
    const cloth = M.std(col, { roughness: 0.85 })
    mesh(g, new THREE.CylinderGeometry(0.8, 0.98, 0.76, 28), cloth, 0, 0.38, 0)
    mesh(g, new THREE.CylinderGeometry(0.82, 0.82, 0.05, 28), cloth, 0, 0.79, 0)
    const bq = bouquetCluster(0xE9A9B8, 6, 0.14); bq.position.y = 0.86; bq.scale.set(0.8, 0.8, 0.8); g.add(bq)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      placeSetting(g, Math.cos(a) * 0.55, Math.sin(a) * 0.55, a)
      const ch = chair(col.clone().multiplyScalar(0.96))
      ch.position.set(Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35)
      ch.rotation.y = -a - Math.PI / 2
      g.add(ch)
    }
  } else if (type === 'table-long') {
    const cloth = M.std(col, { roughness: 0.85 })
    mesh(g, new THREE.BoxGeometry(3.3, 0.76, 1.15), cloth, 0, 0.38, 0)
    mesh(g, new THREE.BoxGeometry(3.4, 0.04, 1.25), cloth, 0, 0.78, 0)
    const bq1 = bouquetCluster(0xE9A9B8, 5, 0.12); bq1.position.set(-1, 0.85, 0); bq1.scale.set(0.75, 0.75, 0.75); g.add(bq1)
    const bq2 = bouquetCluster(0xF3E4D4, 5, 0.12); bq2.position.set(1, 0.85, 0); bq2.scale.set(0.75, 0.75, 0.75); g.add(bq2)
    for (let i = 0; i < 4; i++) {
      const x = -1.2 + i * 0.8
      placeSetting(g, x, 0.42, 0); placeSetting(g, x, -0.42, Math.PI)
      const c1 = chair(col); c1.position.set(x, 0, 1.0); c1.rotation.y = Math.PI; g.add(c1)
      const c2 = chair(col); c2.position.set(x, 0, -1.0); g.add(c2)
    }
  } else if (type === 'candles') {
    g.add(candleSticks(col, col.getHex()))
  } else if (type === 'bouquet') {
    mesh(g, new THREE.CylinderGeometry(0.1, 0.14, 0.34, 14), M.glass(), 0, 0.17, 0)
    mesh(g, new THREE.CylinderGeometry(0.13, 0.1, 0.1, 14), M.glass(), 0, 0.39, 0)
    const bq = bouquetCluster(col.getHex(), 9, 0.2); bq.position.y = 0.52; g.add(bq)
  } else if (type === 'arch') {
    const arch = mesh(g, new THREE.TorusGeometry(1.7, 0.08, 10, 40, Math.PI), M.gold(), 0, 1.15, 0)
    mesh(g, new THREE.CylinderGeometry(0.08, 0.1, 1.15, 8), M.gold(), -1.7, 0.575, 0)
    mesh(g, new THREE.CylinderGeometry(0.08, 0.1, 1.15, 8), M.gold(), 1.7, 0.575, 0)
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI
      const f = rose(col.getHex(), 0.1 + Math.random() * 0.06)
      f.position.set(1.7 * Math.cos(a), 1.15 + 1.7 * Math.sin(a), 0)
      g.add(f)
      if (i % 2 === 0) {
        const leaf = mesh(g, new THREE.ConeGeometry(0.05, 0.22, 6), M.green(),
          1.78 * Math.cos(a), 1.15 + 1.78 * Math.sin(a), 0.06)
        leaf.rotation.z = a
      }
    }
    for (const s of [-1, 1]) {
      const c = bouquetCluster(col.getHex(), 6, 0.2)
      c.position.set(1.7 * s, 0.12, 0); g.add(c)
    }
  } else if (type === 'lamp') {
    mesh(g, new THREE.CylinderGeometry(0.16, 0.22, 0.04, 14), M.gold(), 0, 0.02, 0)
    mesh(g, new THREE.CylinderGeometry(0.03, 0.05, 1.9, 8), M.gold(), 0, 0.97, 0)
    mesh(g, new THREE.SphereGeometry(0.2, 14, 14), new THREE.MeshBasicMaterial({ color: col }), 0, 2.02, 0)
    const gl = glow(1.6, 0.75); gl.position.y = 2.02; g.add(gl)
    const pl = new THREE.PointLight(col, 12, 8, 1.9); pl.position.y = 2.0; g.add(pl)
  } else if (type === 'dancefloor') {
    const c = document.createElement('canvas'); c.width = c.height = 256
    const ctx = c.getContext('2d')
    const c1 = '#' + col.getHexString()
    const c2 = item.color === '#EDEDE8' ? '#2A2622' : '#B08D4A'
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      ctx.fillStyle = (x + y) % 2 ? c1 : c2
      ctx.fillRect(x * 32, y * 32, 32, 32)
    }
    const tex = new THREE.CanvasTexture(c)
    const fl = mesh(g, new THREE.CircleGeometry(2.1, 40),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.2 }), 0, 0.02, 0)
    fl.rotation.x = -Math.PI / 2
    mesh(g, new THREE.TorusGeometry(2.1, 0.03, 8, 48), M.gold(), 0, 0.03, 0).rotation.x = Math.PI / 2
} else if (type === 'stage') {
    const w = 10 * (item.sx || 1)
    const p = mesh(g, new THREE.BoxGeometry(w, 0.42, 3.2), M.std(col.getHex() || 0x2A241E, { roughness: 0.7 }), 0, 0.21, 0)
    p.castShadow = p.receiveShadow = true
    for (let i = 0; i < Math.round(w / 1.3); i++) {
      const f = foliage(0.5)
      f.position.set(-w / 2 + 0.7 + i * 1.3, 0.52, 1.55)
      g.add(f)
    }
  } else if (type === 'piano') {
    g.add(grandPiano())
  } else if (type === 'bar') {
    const w = 3.2 * (item.sx || 1)
    mesh(g, new THREE.BoxGeometry(w, 1.1, 0.8), M.std(col, { roughness: 0.5 }), 0, 0.55, 0)
    mesh(g, new THREE.BoxGeometry(w + 0.2, 0.06, 0.95), M.gold(), 0, 1.13, 0)
    mesh(g, new THREE.BoxGeometry(w, 1.5, 0.5), M.std(col.clone().multiplyScalar(0.8)), 0, 0.75, -1.1)
    for (let i = 0; i < 4; i++)
      mesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), M.glass(), -w / 2 + 0.5 + i * (w - 1) / 3, 1.6, -1.05)
    const gl = glow(1.2, 0.5); gl.position.set(0, 1.6, -1.1); g.add(gl)
    const pl = new THREE.PointLight(0xFFD9A0, 6, 5); pl.position.set(0, 1.7, -0.8); g.add(pl)
  } else if (type === 'candelabra') {
    mesh(g, new THREE.CylinderGeometry(0.05, 0.11, 0.34, 10), M.gold(), 0, 0.17, 0)
    for (const [dx, h] of [[-0.14, 0.46], [0, 0.56], [0.14, 0.46]]) {
      mesh(g, new THREE.CylinderGeometry(0.02, 0.02, h - 0.3, 6), M.gold(), dx, 0.3 + (h - 0.3) / 2, 0)
      mesh(g, new THREE.CylinderGeometry(0.026, 0.03, 0.16, 8), M.std(col, { roughness: 0.5 }), dx, h + 0.08, 0)
      const fl = mesh(g, new THREE.SphereGeometry(0.016, 6, 6), new THREE.MeshBasicMaterial({ color: 0xFFE0A0 }), dx, h + 0.19, 0)
      fl.material.toneMapped = false
      const gl2 = glow(0.32, 0.75); gl2.position.set(dx, h + 0.2, 0); g.add(gl2)
    }
  } else if (type === 'table-flowers') {
    const bq = bouquetCluster(col.getHex(), 8, 0.18)
    bq.position.y = 0.06
    bq.scale.setScalar(0.85)
    g.add(bq)
  } else if (type === 'menu') {
    const card = mesh(g, new THREE.BoxGeometry(0.14, 0.2, 0.008), M.std(0xF7F3EA, { roughness: 0.4 }), 0, 0.1, 0)
    card.rotation.x = -0.35
  } else if (type === 'flower-tree') {
    mesh(g, new THREE.CylinderGeometry(0.05, 0.07, 1.7, 8), M.gold(), 0, 0.85, 0)
    const bq = bouquetCluster(col.getHex(), 11, 0.4)
    bq.position.y = 1.85
    bq.scale.setScalar(1.5)
    g.add(bq)
  } else if (type === 'guest-chairs') {
    for (let r = 0; r < 2; r++) for (let cch = 0; cch < 4; cch++) {
      const ch = chair(col)
      ch.position.set(-1.2 + cch * 0.8, 0, r * 0.9)
      g.add(ch)
    }
  } else if (type === 'palm') {
    for (let i = 0; i < 5; i++) {
      const m = mesh(g, new THREE.CylinderGeometry(0.16 - i * 0.014, 0.2 - i * 0.014, 0.95, 8),
        M.std(0x6B5A44, { roughness: 0.9 }), Math.sin(i * 0.5) * 0.12, 0.5 + i * 0.85, 0)
      m.castShadow = true
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2
      const leaf = mesh(g, new THREE.ConeGeometry(0.28, 2.4, 4), M.std(0x3F5A38, { roughness: 0.85 }),
        Math.cos(a) * 0.9, 4.6, Math.sin(a) * 0.9)
      leaf.rotation.set(Math.sin(a) * 0.9, -a, Math.cos(a) * 0.9)
      leaf.castShadow = true
    }
    const pl = new THREE.PointLight(0xFFD9A0, 4, 5); pl.position.set(0, 1.2, 0.6); g.add(pl)
  } else if (type === 'fringe-lamp') {
    mesh(g, new THREE.CylinderGeometry(0.16, 0.24, 0.05, 12), M.gold(), 0, 0.025, 0)
    mesh(g, new THREE.CylinderGeometry(0.03, 0.04, 2.6, 8), M.gold(), 0, 1.3, 0)
    mesh(g, new THREE.ConeGeometry(0.55, 0.6, 18, 1, true), M.std(col, { roughness: 0.9, side: THREE.DoubleSide }), 0, 2.75, 0)
    mesh(g, new THREE.CylinderGeometry(0.56, 0.56, 0.16, 18, 1, true),
      M.std(col.clone().multiplyScalar(0.85), { roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }), 0, 2.38, 0)
    const b = mesh(g, new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFFE0A0 }), 0, 2.5, 0)
    b.material.toneMapped = false
    const gl = glow(0.9, 0.6); gl.position.y = 2.5; g.add(gl)
    const pl = new THREE.PointLight(0xFFD9A0, 5, 5); pl.position.y = 2.4; g.add(pl)
  } else if (type === 'chandelier') {
    mesh(g, new THREE.CylinderGeometry(0.16, 0.24, 0.05, 12), M.gold(), 0, 0.025, 0)
    mesh(g, new THREE.CylinderGeometry(0.03, 0.04, 2.9, 8), M.gold(), 0, 1.45, 0)
    ;[0.55, 0.42, 0.3].forEach((r, k) => {
      mesh(g, new THREE.CylinderGeometry(r, r, 0.26, 18, 1, true),
        M.std(0xE8C87A, { emissive: 0xFFDF9A, emissiveIntensity: 0.8, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
        0, 2.85 - k * 0.36, 0)
    })
    const pl = new THREE.PointLight(0xFFE2A8, 9, 8); pl.position.y = 2.6; g.add(pl)
  } else if (type === 'column') {
    const c = mesh(g, new THREE.CylinderGeometry(0.28, 0.32, 4.6, 14), M.std(col, { roughness: 0.45 }), 0, 2.3, 0)
    c.castShadow = true
    const f = foliage(1.0, 0x8A5A2E); f.position.y = 4.4; g.add(f)
  } else if (type === 'moon') {
    mesh(g, new THREE.CylinderGeometry(0.02, 0.02, 3.6, 6), M.std(0x2A2622), 0, 1.8, 0)
    const m = mesh(g, new THREE.SphereGeometry(0.75, 20, 20),
      M.std(0xEDE8DA, { emissive: 0xFFF6E0, emissiveIntensity: 0.85, roughness: 0.9 }), 0, 4.0, 0)
    const pl = new THREE.PointLight(0xF3ECDA, 10, 9); pl.position.y = 4.0; g.add(pl)
  } else if (type === 'cake-table') {
    mesh(g, new THREE.CylinderGeometry(0.55, 0.65, 0.76, 22), M.std(col, { roughness: 0.85 }), 0, 0.38, 0)
    ;[0.34, 0.26, 0.18].forEach((r, k) => {
      mesh(g, new THREE.CylinderGeometry(r, r, 0.2, 20), M.std(0xF7F1E4, { roughness: 0.5 }), 0, 0.87 + k * 0.2, 0)
      mesh(g, new THREE.TorusGeometry(r, 0.015, 6, 24), M.gold(), 0, 0.78 + k * 0.2 + 0.19, 0).rotation.x = Math.PI / 2
    })
    const f = rose(0xE9A9B8, 0.07); f.position.y = 1.52; g.add(f)
  } else if (type === 'dj-booth') {
    const w = 2.4 * (item.sx || 1)
    mesh(g, new THREE.BoxGeometry(w, 1.15, 0.7), M.std(0x17130F, { roughness: 0.3 }), 0, 0.575, 0)
    const face = mesh(g, new THREE.PlaneGeometry(w - 0.2, 0.8), new THREE.MeshBasicMaterial({ color: col }), 0, 0.6, 0.36)
    face.material.toneMapped = false
    mesh(g, new THREE.BoxGeometry(0.9, 0.06, 0.5), M.std(0x2A2622), 0, 1.2, 0)
    const gl = glow(1.4, 0.5); gl.position.set(0, 0.7, 0.5); g.add(gl)
  } else if (type === 'speaker') {
    const b = mesh(g, new THREE.BoxGeometry(0.55, 1.5, 0.5), M.std(0x17130F, { roughness: 0.5 }), 0, 0.75, 0)
    b.castShadow = true
    mesh(g, new THREE.CircleGeometry(0.16, 16), M.std(0x2E2A24), 0, 1.05, 0.26)
    mesh(g, new THREE.CircleGeometry(0.1, 16), M.std(0x2E2A24), 0, 0.55, 0.26)
  } else if (type === 'balloon-cluster') {
    const tones = [col, col.clone().offsetHSL(0, 0, 0.12), col.clone().offsetHSL(0.04, 0, 0.05), new THREE.Color(0xF5EFE4)]
    for (let i = 0; i < 9; i++) {
      const b = mesh(g, new THREE.SphereGeometry(0.16 + Math.random() * 0.1, 12, 12),
        M.std(tones[i % 4], { roughness: 0.25 }),
        (Math.random() - 0.5) * 0.5, 1.4 + Math.random() * 0.8, (Math.random() - 0.5) * 0.5)
      b.scale.y = 1.15
      b.castShadow = true
      mesh(g, new THREE.CylinderGeometry(0.004, 0.004, b.position.y, 4), M.std(0xB0A896), b.position.x, b.position.y / 2, b.position.z)
    }
  } else if (type === 'balloon-arch') {
    const tones = [col, col.clone().offsetHSL(0, 0, 0.14), new THREE.Color(0xF5EFE4), new THREE.Color(0xD9B36A)]
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI
      const b = mesh(g, new THREE.SphereGeometry(0.16 + Math.random() * 0.1, 10, 10),
        M.std(tones[i % 4], { roughness: 0.25 }),
        2.0 * Math.cos(a) + (Math.random() - 0.5) * 0.15, 0.4 + 2.0 * Math.sin(a), (Math.random() - 0.5) * 0.2)
      b.castShadow = true
    }
  } else if (type === 'lantern') {
    mesh(g, new THREE.BoxGeometry(0.34, 0.5, 0.34), M.glass(), 0, 0.27, 0)
    ;[[0.17, 0], [-0.17, 0], [0, 0.17], [0, -0.17]].forEach(([dx, dz]) => {
      mesh(g, new THREE.BoxGeometry(dx ? 0.03 : 0.34, 0.5, dz ? 0.03 : 0.34), M.gold(), dx, 0.27, dz)
    })
    mesh(g, new THREE.CylinderGeometry(0.05, 0.06, 0.16, 8), M.std(0xF3E9D2), 0, 0.12, 0)
    const fl = mesh(g, new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshBasicMaterial({ color: 0xFFE0A0 }), 0, 0.23, 0)
    fl.material.toneMapped = false
    const gl = glow(0.5, 0.7); gl.position.y = 0.25; g.add(gl)
  } else if (type === 'runner') {
    const L = 6 * (item.sx || 1)
    const r = mesh(g, new THREE.PlaneGeometry(1.4, L), M.std(col, { roughness: 0.7 }), 0, 0.016, 0)
    r.rotation.x = -Math.PI / 2
  } else if (type === 'pot-plant') {
    mesh(g, new THREE.CylinderGeometry(0.22, 0.16, 0.35, 12), M.std(0xB08D5F, { roughness: 0.8 }), 0, 0.175, 0)
    const f = foliage(0.75, 0x4E6B45); f.position.y = 0.65; g.add(f)
  } else if (type === 'neon-heart') {
    const shape = mesh(g, new THREE.TorusGeometry(0.45, 0.035, 10, 40), new THREE.MeshBasicMaterial({ color: col }), 0, 0, 0.06)
    shape.material.toneMapped = false
    const gl = glow(1.6, 0.7); gl.position.z = 0.08; g.add(gl)
  } else if (type === 'photo-frame') {
    mesh(g, new THREE.BoxGeometry(1.3, 1.0, 0.05), M.gold(), 0, 0, 0.05)
    mesh(g, new THREE.PlaneGeometry(1.1, 0.8), M.std(col, { roughness: 0.6 }), 0, 0, 0.09)
  } else if (type === 'garland') {
    for (let i = 0; i <= 10; i++) {
      const t = i / 10
      const x = (t - 0.5) * 3
      const y = -Math.sin(t * Math.PI) * 0.5
      const f = rose(col.getHex(), 0.08 + Math.random() * 0.04)
      f.position.set(x, y, 0.08); g.add(f)
      if (i % 2) {
        const leaf = mesh(g, new THREE.ConeGeometry(0.04, 0.16, 6), M.green(), x + 0.08, y - 0.09, 0.08)
        leaf.rotation.z = Math.PI
      }
    }
  } else if (type === 'drape') {
    for (let i = 0; i < 5; i++) {
      const fold = mesh(g, new THREE.CylinderGeometry(0.11, 0.13, 3.4, 10),
        M.std(col.clone().multiplyScalar(1 - (i % 2) * 0.08), { roughness: 0.9 }),
        -0.44 + i * 0.22, -1.7 + 3.4 / 2 - 1.7 + 1.7, 0.07)
      fold.position.y = 0
    }
    mesh(g, new THREE.CylinderGeometry(0.045, 0.045, 1.3, 8), M.gold(), 0, 1.78, 0.07).rotation.z = Math.PI / 2
  } else if (type === 'stringlights') {
    for (let i = 0; i <= 14; i++) {
      const t = i / 14
      const x = (t - 0.5) * 4
      const y = -Math.sin(t * Math.PI) * 0.6
      const b = mesh(g, new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({ color: col }), x, y, 0.06)
      b.material.toneMapped = false
      if (i % 3 === 0) { const gl = glow(0.4, 0.6); gl.position.set(x, y, 0.07); g.add(gl) }
    }
  }
  if (item.sx && type !== 'stage' && type !== 'bar' && type !== 'dj-booth' && type !== 'runner') g.scale.setScalar(item.sx)
  return g
}


export { glowTexture, glow, parquetTexture, stoneTexture, tileTexture, foliage, grandPiano, M, mesh, rose, bouquetCluster, placeSetting, chair, candleSticks, buildItem }

export function buildHallDressing() {
  const group = new THREE.Group()
  const nicheMat = new THREE.MeshStandardMaterial({ color: 0x2E2620, roughness: 1 })
  const niche = new THREE.Group()
  mesh(niche, new THREE.PlaneGeometry(1.4, 2.2), nicheMat, 0, 1.1, 0)
  mesh(niche, new THREE.CircleGeometry(0.7, 24, 0, Math.PI), nicheMat, 0, 2.2, 0)
  niche.position.set(-5.5, 0, -HALL.d / 2 + 0.045)
  group.add(niche)

  const stage = new THREE.Group()
  const platform = mesh(stage, new THREE.BoxGeometry(11, 0.42, 3.4),
    new THREE.MeshStandardMaterial({ color: 0x2A241E, roughness: 0.7 }), 0, 0.21, 0)
  platform.castShadow = platform.receiveShadow = true
  for (let i = 0; i < 9; i++) {
    const f = foliage(0.55)
    f.position.set(-5 + i * 1.25, 0.55, 1.65)
    stage.add(f)
  }
  const piano = grandPiano()
  piano.position.set(1.6, 0.42, -0.3)
  piano.rotation.y = -0.5
  stage.add(piano)
  for (let i = 0; i < 5; i++) {
    const ch = chair(new THREE.Color(0xE8DCC4))
    ch.position.set(-4.3 + i * 0.85, 0.42, -0.6)
    stage.add(ch)
  }
  stage.position.set(0, 0, -HALL.d / 2 + 1.9)
  group.add(stage)

  const spots = [[-7, 4.8, -4], [-2.5, 5.0, -5.5], [3, 4.7, -4.5], [7.5, 4.9, -5], [-5, 4.9, 1], [5, 4.8, 1.5], [0, 5.0, 4]]
  for (const [x, y, z] of spots) {
    const f = foliage(1.15 + Math.random() * 0.5)
    f.position.set(x, y, z)
    group.add(f)
    mesh(group, new THREE.CylinderGeometry(0.012, 0.012, HALL.h + 1.2 - y, 5),
      M.std(0x5E5347), x, y + (HALL.h + 1.2 - y) / 2, z)
  }
  for (const zz of [-2.5, 2.5]) {
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      const x = (t - 0.5) * (HALL.w - 2)
      const y = 4.5 - Math.sin(t * Math.PI) * 0.5
      const b = mesh(group, new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFFE2A8 }), x, y, zz)
      b.material.toneMapped = false
      if (i % 4 === 0) { const gl = glow(0.5, 0.55); gl.position.set(x, y, zz); group.add(gl) }
    }
  }
  group.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } })
  return group
}

export function wallTransform(wall, u, y) {
  if (wall === 'back') return { pos: [u, y, -HALL.d / 2 + 0.06], ry: 0 }
  if (wall === 'left') return { pos: [-HALL.w / 2 + 0.06, y, u], ry: Math.PI / 2 }
  return { pos: [HALL.w / 2 - 0.06, y, u], ry: -Math.PI / 2 }
}
