import React, { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import gallerySeed from '../data/gallery.json'
import cakeshops from '../data/cakeshops.json'

/* =============== INVITATIONS =============== */
const FONTS = [
  { id: 'serif', label: 'სერიფი', css: "'BPG Ninomtavruli', Georgia, serif" },
  { id: 'sans', label: 'სანსი', css: "'BPG Glaho', sans-serif" },
]
const dark = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
  return lum < 150
}

function makeTemplates(palette) {
  const p = palette.length ? palette : ['#C9A24B', '#F0D4DA', '#5C5248', '#EDE2CC']
  const pick = (i) => p[i % p.length]
  return [
    { id: 'tint-1', name: 'თქვენი 3D ფერები I', bg: pick(0), accent: pick(1), frame: true },
    { id: 'tint-2', name: 'თქვენი 3D ფერები II', bg: pick(1), accent: pick(0), frame: false },
    { id: 'ivory', name: 'სპილოსძვლისფერი კლასიკა', bg: '#FAF7F2', accent: '#C9A24B', frame: true },
    { id: 'umber', name: 'მუქი ელეგანტი', bg: '#5C5248', accent: '#E4CFA3', frame: true },
    { id: 'blank', name: 'სუფთა ფურცელი — ააწყვეთ თავად', bg: '#FFFFFF', accent: '#5C5248', frame: false },
  ]
}

export function Invitations() {
  const [invParams] = useSearchParams()
  const invEventId = invParams.get('event')
  const palette = JSON.parse(localStorage.getItem('cm_inv_palette') || '[]')
  const templates = useMemo(() => makeTemplates(palette), []) // eslint-disable-line
  const [tpl, setTpl] = useState(templates[0])
  const [bg, setBg] = useState(templates[0].bg)
  const [accent, setAccent] = useState(templates[0].accent)
  const [font, setFont] = useState(FONTS[0])
  const [frame, setFrame] = useState(templates[0].frame)
  const [text, setText] = useState({
    top: 'გეპატიჟებით', names: 'ნინო & გიორგი', sub: 'ჩვენი ქორწილის აღსანიშნავად',
    date: '2026 წლის 14 აგვისტო · 18:00', place: 'დარბაზი „ვერე", თბილისი',
  })
  const svgRef = useRef(null)
  const [saved, setSaved] = useState(false)
  const textColor = dark(bg) ? '#F5EFE4' : '#3A332C'

  const pickTpl = (t) => { setTpl(t); setBg(t.bg); setAccent(t.accent); setFrame(t.frame) }

  const download = () => {
    const svg = svgRef.current
    const data = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = 800; c.height = 1120
      const g = c.getContext('2d')
      g.drawImage(img, 0, 0, 800, 1120)
      const a = document.createElement('a')
      a.download = 'chill-and-marry-invitation.png'
      a.href = c.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)))
  }
  const saveToGallery = () => {
    const all = JSON.parse(localStorage.getItem('cm_gallery_mine') || '[]')
    localStorage.setItem('cm_gallery_mine', JSON.stringify([...all, {
      id: 'inv' + Date.now(), kind: 'invitation', title: text.names, author: 'თქვენ',
      hue: bg, accent, likes: 0, createdAt: Date.now(),
    }]))
    setSaved(true); setTimeout(() => setSaved(false), 1800)
  }

  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div className="eyebrow">3D დიზაინის ფერებზე მორგებული</div>
      <h1>მოსაწვევის გენერატორი</h1>
      {invEventId && (
        <Link to={`/event/${invEventId}`} className="btn btn-ghost" style={{ marginTop: 10 }}>← ღონისძიების გვერდზე დაბრუნება</Link>
      )}
      {palette.length === 0 && (
        <div className="info-banner">
          რჩევა: ჯერ შექმენით 3D დიზაინი და დააჭირეთ „მოსაწვევების დაგენერირებას" — შაბლონები ავტომატურად მოირგებს თქვენი დეკორის ფერებს.
        </div>
      )}
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 16 }}>
        {/* preview */}
        <div style={{ flex: '0 1 400px' }}>
          <svg ref={svgRef} viewBox="0 0 400 560" width="100%" style={{ borderRadius: 14, border: '1px solid var(--linen)', boxShadow: '0 14px 34px rgba(60,50,40,0.12)' }}>
            <rect width="400" height="560" fill={bg} />
            {frame && <rect x="16" y="16" width="368" height="528" fill="none" stroke={accent} strokeWidth="2" rx="8" />}
            <circle cx="200" cy="96" r="26" fill="none" stroke={accent} strokeWidth="2.5" />
            <path d="M 200 84 L 205 94 L 215 98 L 205 102 L 200 112 L 195 102 L 185 98 L 195 94 Z" fill={accent} />
            <text x="200" y="180" textAnchor="middle" fontFamily={font.css} fontSize="15" letterSpacing="6" fill={accent}>{text.top}</text>
            <text x="200" y="250" textAnchor="middle" fontFamily={font.css} fontSize="36" fontWeight="600" fill={textColor}>{text.names}</text>
            <text x="200" y="300" textAnchor="middle" fontFamily={font.css} fontSize="15" fill={textColor} opacity="0.75">{text.sub}</text>
            <line x1="140" y1="340" x2="260" y2="340" stroke={accent} strokeWidth="1.5" />
            <text x="200" y="390" textAnchor="middle" fontFamily={font.css} fontSize="17" fontWeight="600" fill={textColor}>{text.date}</text>
            <text x="200" y="425" textAnchor="middle" fontFamily={font.css} fontSize="14" fill={textColor} opacity="0.8">{text.place}</text>
            <text x="200" y="510" textAnchor="middle" fontFamily="'BPG Ninomtavruli', serif" fontSize="13" letterSpacing="2" fill={accent}>Chill &amp; Marry</text>
          </svg>
        </div>
        {/* controls */}
        <div style={{ flex: '1 1 340px', maxWidth: 460 }}>
          <h3>შაბლონები</h3>
          <div className="tool-col" style={{ marginBottom: 16 }}>
            {templates.map((t) => (
              <button key={t.id} className={`item-btn ${tpl.id === t.id ? 'gold' : ''}`} onClick={() => pickTpl(t)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: t.bg, border: '1px solid var(--sand)' }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.accent }} />
                  {t.name}
                </span>
              </button>
            ))}
          </div>
          <h3>ფერები</h3>
          <div style={{ display: 'flex', gap: 16, margin: '8px 0 16px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              ფონი <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            </label>
            <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              აქცენტი <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            </label>
            <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={frame} onChange={(e) => setFrame(e.target.checked)} /> ჩარჩო
            </label>
          </div>
          {palette.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }}>
              <span className="muted">3D პალიტრა:</span>
              {palette.map((h) => (
                <button key={h} onClick={() => setAccent(h)} title={h}
                  style={{ width: 20, height: 20, borderRadius: '50%', background: h, border: '1.5px solid var(--sand)', cursor: 'pointer' }} />
              ))}
            </div>
          )}
          <h3>შრიფტი</h3>
          <div className="tool-row" style={{ marginBottom: 16 }}>
            {FONTS.map((f) => (
              <button key={f.id} className={`chip-btn ${font.id === f.id ? 'on' : ''}`} onClick={() => setFont(f)}>{f.label}</button>
            ))}
          </div>
          <h3>ტექსტი</h3>
          {Object.entries({ top: 'ზედა წარწერა', names: 'სახელები', sub: 'ქვეწარწერა', date: 'თარიღი და დრო', place: 'ადგილი' }).map(([k, label]) => (
            <div className="field" key={k}>
              <label>{label}</label>
              <input value={text[k]} onChange={(e) => setText({ ...text, [k]: e.target.value })} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            <button className="btn btn-primary" onClick={download}>ჩამოტვირთვა (PNG)</button>
            <button className="btn btn-ghost" onClick={saveToGallery}>{saved ? 'შენახულია ✓' : 'გალერეაში შენახვა'}</button>
            <Link to="/guests" className="btn btn-ghost">სტუმრების სია →</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

/* =============== GALLERY =============== */
export function Gallery() {
  const [tab, setTab] = useState('all')
  const published = JSON.parse(localStorage.getItem('cm_gallery_public') || '[]')
  const all = [...published, ...gallerySeed]
  const list = all.filter((g) => tab === 'all' || g.kind === tab)
  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div className="eyebrow">შთაგონება</div>
      <h1>ნამუშევრების გალერეა</h1>
      <p style={{ color: 'var(--umber-soft)', margin: '8px 0 20px', maxWidth: 560 }}>
        სხვა მომხმარებლების გამოქვეყნებული დარბაზის დიზაინები და მოსაწვევები. თქვენი ნამუშევრები აქ მხოლოდ «გამოქვეყნების» ღილაკით მოხვდება.
      </p>
      <div className="tool-row" style={{ marginBottom: 24 }}>
        {[['all', 'ყველა'], ['design', 'დარბაზის დიზაინები'], ['invitation', 'მოსაწვევები']].map(([k, l]) => (
          <button key={k} className={`chip-btn ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="grid grid-3">
        {list.map((g) => (
          <div key={g.id} className="card">
            {g.thumb
              ? <img src={g.thumb} alt={g.title} style={{ aspectRatio: '16/10', objectFit: 'cover' }} />
              : (
                <div className="photo" style={{ background: `linear-gradient(135deg, ${g.hue}, ${g.accent || g.hue + 'AA'})`, aspectRatio: '16/10' }}>
                  <span>{g.kind === 'invitation' ? '✉ მოსაწვევი' : '◇ 3D დიზაინი'}</span>
                </div>
              )}
            <div style={{ padding: '12px 16px' }}>
              <h3 style={{ fontSize: 15 }}>{g.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12.5, color: 'var(--umber-soft)' }}>
                <span>{g.author}</span>
                <span style={{ color: 'var(--champagne)' }}>♥ {g.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

/* =============== CAKE BUILDER =============== */
const Cake3D = React.lazy(() => import('../three/cake3d.jsx'))
const CAKE_COLORS = ['#F7F1E4', '#F0D4DA', '#C3A6D8', '#AEC6E8', '#D9B36A', '#8E5A3C', '#3A2E24']
const TOPPERS = [['none', 'გარეშე'], ['flowers', 'ყვავილები'], ['heart', 'გული'], ['stars', 'ვარსკვლავები'], ['rings', 'ბეჭდები 💍']]
const FINISHES = [['classic', 'კლასიკური კრემი'], ['glaze', 'სარკისებრი გლაზური'], ['naked', 'ღია ბისკვიტი (naked)']]
const DECOR_PALETTE = [
  ['strawberry', '🍓 მარწყვი', 6], ['berries', '🫐 კენკრა', 6], ['rose', '🌸 ვარდი', 8],
  ['macaron', '🍬 მაკარონი', 7], ['pearls', '⚪ მარგალიტები', 5], ['choco', '🍫 შოკოლადი', 6], ['candle', '🕯 სანთელი', 4],
]

export function CakeBuilder() {
  const [params] = useSearchParams()
  const eventId = params.get('event')
  const [savedToEvent, setSavedToEvent] = useState(false)
  const [view, setView] = useState('3d')
  const [tiers, setTiers] = useState(3)
  const [colors, setColors] = useState(['#F7F1E4', '#F0D4DA', '#F7F1E4', '#F0D4DA'])
  const [topper, setTopper] = useState('flowers')
  const [finish, setFinish] = useState('classic')
  const [beads, setBeads] = useState(true)
  const [drip, setDrip] = useState(false)
  const [flakes, setFlakes] = useState(false)
  const [kg, setKg] = useState(6)
  const [dia, setDia] = useState(32)
  const [th, setTh] = useState(10)
  const [text, setText] = useState('')
  const [textColor, setTextColor] = useState('#8E5A3C')
  const [decors, setDecors] = useState([])
  const [activeDecor, setActiveDecor] = useState(null)
  const [shop, setShop] = useState(cakeshops[0].id)
  const [photo, setPhoto] = useState(null)
  const captureRef = useRef(null)
  const shopData = cakeshops.find((c) => c.id === shop)
  const pieces = Math.round(kg * 8)
  const decorCost = decors.reduce((sum, d) => sum + (DECOR_PALETTE.find(([t]) => t === d.type)?.[2] || 6), 0)
  const price = kg * shopData.priceKg + (topper !== 'none' ? 40 : 0) + tiers * 25
    + (beads ? 20 : 0) + (drip ? 25 : 0) + (flakes ? 15 : 0)
    + (finish === 'glaze' ? 30 : 0) + decorCost + (text ? 15 : 0)

  const setTierColor = (i, c) => setColors(colors.map((cc, k) => (k === i ? c : cc)))
  const cakeCfg = { tiers, colors, topper, beads, drip, flakes, finish, dia, th, text, textColor, decors }
  const placeDecor = (pos) => setDecors((d) => [...d, { id: 'dc' + Date.now().toString(36) + d.length, type: activeDecor, pos }])
  const removeDecor = (did) => setDecors((d) => d.filter((x) => x.id !== did))

  const saveToEvent = () => {
    if (!eventId) return
    const events = JSON.parse(localStorage.getItem('cm_events') || '[]')
    const next = events.map((e) => e.id === eventId
      ? { ...e, cake: { tiers, kg, dia, th, pieces, shopName: shopData.name, price, colors: colors.slice(0, tiers), topper, beads, drip, flakes, finish, text, decorCount: decors.length } }
      : e)
    localStorage.setItem('cm_events', JSON.stringify(next))
    setSavedToEvent(true); setTimeout(() => setSavedToEvent(false), 1800)
  }
  const send = () => {
    saveToEvent()
    const decorNames = decors.map((d) => DECOR_PALETTE.find(([t]) => t === d.type)?.[1]).join(', ')
    const body = encodeURIComponent(`ტორტის შეკვეთა — Chill & Marry\nსაკონდიტრო: ${shopData.name}\nიარუსები: ${tiers} · წონა: ${kg} კგ (~${pieces} ნაჭერი)\nდიამეტრი: ${dia} სმ · იარუსის სიმაღლე: ${th} სმ\nმოპირკეთება: ${finish}\nტოპერი: ${topper}${text ? `\nწარწერა: «${text}»` : ''}\nდეკორი: ${decorNames || '—'}${beads ? ' + მძივები' : ''}${drip ? ' + დრიპი' : ''}${flakes ? ' + ოქროს ფურცელი' : ''}\nფერები: ${colors.slice(0, tiers).join(', ')}\nფასი: ₾${price}\n(კუთხეების PNG მიმაგრებულია — ჩამოტვირთეთ 3D ხედიდან)`)
    window.location.href = `mailto:orders@chillandmarry.ge?subject=ტორტის შეკვეთა&body=${body}`
  }

  const W = 300
  const tierDims = Array.from({ length: tiers }, (_, i) => ({ w: 200 - i * 42, h: 58 - i * 6 }))
  let y = 320
  const rects = tierDims.map((t) => { y -= t.h; return { ...t, x: (W - t.w) / 2, y } })
  const topY = rects[rects.length - 1].y

  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div className="eyebrow">საკონდიტრო</div>
      <h1>ტორტის კონსტრუქტორი</h1>
      {eventId && (
        <Link to={`/event/${eventId}`} className="btn btn-ghost" style={{ marginTop: 10 }}>← ღონისძიების გვერდზე დაბრუნება</Link>
      )}
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 16 }}>
        <div style={{ flex: '0 1 440px', minWidth: 300 }}>
          <div className="tool-row" style={{ marginBottom: 10 }}>
            <button className={`chip-btn ${view === '3d' ? 'on' : ''}`} onClick={() => setView('3d')}>3D ხედი · მაგიდაზე</button>
            <button className={`chip-btn ${view === '2d' ? 'on' : ''}`} onClick={() => setView('2d')}>2D სქემა</button>
          </div>
          {view === '3d' ? (
            <>
              <React.Suspense fallback={<div style={{ aspectRatio: '4/3', display: 'grid', placeItems: 'center', border: '1px solid var(--linen)', borderRadius: 14 }}>იტვირთება 3D…</div>}>
                <Cake3D cfg={cakeCfg} activeDecor={activeDecor} onPlace={placeDecor} onRemoveDecor={removeDecor} captureRef={captureRef} />
              </React.Suspense>
              <p className="muted" style={{ margin: '8px 0' }}>
                {activeDecor
                  ? `✛ დააჭირეთ ტორტის ზედაპირს — დაემატება ${DECOR_PALETTE.find(([t]) => t === activeDecor)?.[1]} · დეკორზე დაჭერა შლის მას`
                  : '🖱 დაატრიალეთ მაუსით · დეკორის დასამატებლად აირჩიეთ ელემენტი ქვემოთ'}
              </p>
              <button className="btn btn-ghost" onClick={() => captureRef.current?.()}>
                📸 4 კუთხის PNG-ის ჩამოტვირთვა (საკონდიტროსთვის)
              </button>
            </>
          ) : (
            <>
              <svg viewBox={`0 0 ${W} 360`} width="100%" style={{ background: '#FDFBF7', borderRadius: 14, border: '1px solid var(--linen)' }}>
                <ellipse cx="150" cy="330" rx="120" ry="14" fill="#E8DFD0" />
                <rect x="40" y="318" width="220" height="8" rx="4" fill="#D9B36A" />
                {rects.map((r, i) => (
                  <g key={i}>
                    <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6" fill={colors[i]} stroke="#00000014" />
                    <rect x={r.x} y={r.y} width={r.w} height="8" rx="4" fill={drip ? '#8E5A3C' : '#FFFFFF66'} />
                    {beads && [...Array(Math.floor(r.w / 26))].map((_, k) => (
                      <circle key={k} cx={r.x + 14 + k * 26} cy={r.y + r.h - 7} r="3.4" fill="#D9B36A" />
                    ))}
                  </g>
                ))}
                {text && <text x="150" y={rects[0].y + rects[0].h / 2 + 5} textAnchor="middle" fontSize="15" fontFamily="serif" fill={textColor}>{text}</text>}
                {topper === 'flowers' && [-18, 0, 18].map((dx, k) => (
                  <g key={k} transform={`translate(${150 + dx} ${topY - 12 - (k === 1 ? 8 : 0)})`}>
                    <circle r="9" fill="#E9A9B8" /><circle r="4.5" fill="#FDFCF6" />
                  </g>
                ))}
                {topper === 'heart' && (
                  <path d={`M 150 ${topY - 8} c -14 -18, -34 -4, 0 22 c 34 -26, 14 -40, 0 -22`} fill="#C05B45" />
                )}
                {topper === 'stars' && [-16, 0, 16].map((dx, k) => (
                  <path key={k} transform={`translate(${150 + dx} ${topY - 16 - (k % 2) * 10})`}
                    d="M 0 -8 L 2.4 -2.4 L 8 0 L 2.4 2.4 L 0 8 L -2.4 2.4 L -8 0 L -2.4 -2.4 Z" fill="#D9B36A" />
                ))}
                {topper === 'rings' && (
                  <g transform={`translate(150 ${topY - 14})`}>
                    <circle cx="-7" cy="0" r="9" fill="none" stroke="#D9B36A" strokeWidth="3" />
                    <circle cx="7" cy="2" r="9" fill="none" stroke="#B9B4A8" strokeWidth="3" />
                  </g>
                )}
              </svg>
              {decors.length > 0 && (
                <p className="muted" style={{ marginTop: 6 }}>
                  3D დეკორი: {decors.map((d) => DECOR_PALETTE.find(([t]) => t === d.type)?.[1].split(' ')[0]).join(' ')}
                </p>
              )}
            </>
          )}
          {photo && <img src={photo} alt="რეფერენსი" style={{ marginTop: 10, borderRadius: 10, maxHeight: 120 }} />}
        </div>
        <div style={{ flex: '1 1 340px', maxWidth: 480 }}>
          <div className="field">
            <label>საკონდიტრო</label>
            <select value={shop} onChange={(e) => setShop(e.target.value)}>
              {cakeshops.map((c) => <option key={c.id} value={c.id}>{c.name} — ₾{c.priceKg}/კგ</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <div className="field">
              <label>იარუსები — {tiers}</label>
              <input type="range" min="1" max="4" value={tiers} onChange={(e) => setTiers(+e.target.value)} />
            </div>
            <div className="field">
              <label>წონა — {kg} კგ (~{pieces} ნაჭერი)</label>
              <input type="range" min="2" max="20" value={kg} onChange={(e) => setKg(+e.target.value)} />
            </div>
            <div className="field">
              <label>დიამეტრი — {dia} სმ</label>
              <input type="range" min="24" max="44" step="2" value={dia} onChange={(e) => setDia(+e.target.value)} />
            </div>
            <div className="field">
              <label>იარუსის სიმაღლე — {th} სმ</label>
              <input type="range" min="7" max="14" value={th} onChange={(e) => setTh(+e.target.value)} />
            </div>
          </div>
          <h3 style={{ margin: '4px 0 6px' }}>მოპირკეთება</h3>
          <div className="tool-row" style={{ marginBottom: 10 }}>
            {FINISHES.map(([k, l]) => (
              <button key={k} className={`chip-btn ${finish === k ? 'on' : ''}`} onClick={() => setFinish(k)}>{l}</button>
            ))}
          </div>
          <h3 style={{ margin: '10px 0 6px' }}>ფერები იარუსების მიხედვით</h3>
          {Array.from({ length: tiers }, (_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="muted" style={{ width: 70 }}>იარუსი {i + 1}</span>
              {CAKE_COLORS.map((c) => (
                <button key={c} onClick={() => setTierColor(i, c)} aria-label={c}
                  style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: colors[i] === c ? '2.5px solid var(--champagne)' : '1.5px solid var(--sand)' }} />
              ))}
            </div>
          ))}
          <h3 style={{ margin: '12px 0 6px' }}>დეკორი — აირჩიეთ და დააჭირეთ ტორტს 3D-ში</h3>
          <div className="tool-row" style={{ marginBottom: 8 }}>
            {DECOR_PALETTE.map(([k, l, p]) => (
              <button key={k} className={`chip-btn ${activeDecor === k ? 'on' : ''}`}
                onClick={() => setActiveDecor(activeDecor === k ? null : k)}>{l} · ₾{p}</button>
            ))}
          </div>
          {decors.length > 0 && (
            <p className="muted" style={{ margin: '0 0 8px' }}>
              დამატებულია {decors.length} ელემენტი (₾{decorCost}) ·{' '}
              <button className="chip-btn" onClick={() => setDecors([])}>ყველას წაშლა</button>
            </p>
          )}
          <div className="tool-row" style={{ marginBottom: 10 }}>
            <button className={`chip-btn ${beads ? 'on' : ''}`} onClick={() => setBeads(!beads)}>ოქროს მძივები · ₾20</button>
            <button className={`chip-btn ${drip ? 'on' : ''}`} onClick={() => setDrip(!drip)}>შოკოლადის დრიპი · ₾25</button>
            <button className={`chip-btn ${flakes ? 'on' : ''}`} onClick={() => setFlakes(!flakes)}>ოქროს ფურცელი · ₾15</button>
          </div>
          <h3 style={{ margin: '12px 0 6px' }}>წარწერა ტორტზე</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <input value={text} maxLength={22} onChange={(e) => setText(e.target.value)}
              placeholder="მაგ.: ნინო & გიორგი" style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--sand)' }} />
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} title="წარწერის ფერი" />
          </div>
          <h3 style={{ margin: '10px 0 6px' }}>ტოპერი</h3>
          <div className="tool-row" style={{ marginBottom: 12 }}>
            {TOPPERS.map(([k, l]) => (
              <button key={k} className={`chip-btn ${topper === k ? 'on' : ''}`} onClick={() => setTopper(k)}>{l}</button>
            ))}
          </div>
          <div className="field">
            <label>რეფერენს-ფოტოს ატვირთვა (არასავალდებულო)</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const r = new FileReader()
              r.onload = () => setPhoto(r.result)
              r.readAsDataURL(f)
            }} />
          </div>
          <div className="viewer-bottom" style={{ marginTop: 14 }}>
            <strong>ფასი: ₾{price.toLocaleString()} <span className="muted" style={{ fontWeight: 400 }}>· ~{pieces} ნაჭერი</span></strong>
            <div style={{ display: 'flex', gap: 8 }}>
              {eventId && (
                <button className="btn btn-ghost" onClick={saveToEvent}>
                  {savedToEvent ? 'შენახულია ✓' : 'ღონისძიებაში შენახვა'}
                </button>
              )}
              <button className="btn btn-primary" onClick={send}>შეკვეთის გაგზავნა</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
