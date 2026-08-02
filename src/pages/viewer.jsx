import React, { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Scene3D, { DEFAULT_HALL } from '../three/Scene3D.jsx'
import { Stepper } from '../components/ui.jsx'
import decorations from '../data/decorations.json'
import venues from '../data/venues.json'
import artistsData from '../data/artists.json'
import crewsData from '../data/crews.json'
import { isFreeOn } from './directory.jsx'
import { TEMPLATES, TEMPLATE_BY_ID } from '../data/templates.js'

const byId = Object.fromEntries(decorations.map((d) => [d.id, d]))
const COMPANIES = [...new Set(decorations.map((d) => d.company))]
let nextId = 1
const uid = () => 'i' + Date.now().toString(36) + nextId++
const AVAIL = {
  available: { label: 'ხელმისაწვდომია', color: '#6F8F5E' },
  limited: { label: 'შეზღუდული რაოდენობა', color: '#C9A24B' },
  busy: { label: 'დაკავებულია 15.08-მდე', color: '#C05B45' },
}
const BLANK_ENV = TEMPLATE_BY_ID.blank.env


class SceneBoundary extends React.Component {
  constructor(p) { super(p); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#241F1A', color: '#EFE7DA', padding: 24, textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: 15, marginBottom: 8 }}>3D სცენის ჩატვირთვისას მოხდა შეცდომა.</p>
            <p style={{ fontSize: 12, color: '#C9B99B', marginBottom: 16, maxWidth: 420 }}>{String(this.state.error?.message || this.state.error)}</p>
            <button className="btn btn-primary" onClick={() => this.setState({ error: null })}>თავიდან ცდა</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function useDesign(venueId) {
  const key = `cm_design_${venueId}`
  const stored = JSON.parse(localStorage.getItem(key) || '{}')
  const [items, setItems] = useState(stored.items || [])
  const [envId, setEnvId] = useState(stored.envId || 'blank')
  const [hall, setHall] = useState(stored.hall || { ...DEFAULT_HALL })
  const history = useRef([])
  const apply = (next) => { history.current.push(items); setItems(next) }
  const undo = () => { const prev = history.current.pop(); if (prev) setItems(prev) }
  const save = () => localStorage.setItem(key, JSON.stringify({ items, envId, hall }))
  return { items, setItems, envId, setEnvId, hall, setHall, apply, undo, save, pushHistory: () => history.current.push(items) }
}

const AvailabilityDot = ({ status }) => {
  const a = AVAIL[status] || AVAIL.available
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: a.color }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.color }} />{a.label}
    </span>
  )
}

const ColorChips = ({ colors, value, onPick }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
    {colors.map((c) => (
      <button key={c.hex} title={c.name} aria-label={c.name} onClick={() => onPick(c.hex)}
        style={{ width: 22, height: 22, borderRadius: '50%', background: c.hex, cursor: 'pointer',
          border: value === c.hex ? '2.5px solid var(--champagne)' : '1.5px solid var(--sand)' }} />
    ))}
  </div>
)

function ItemButton({ d, active, color, onSelect, onColor }) {
  const busy = d.availability === 'busy'
  return (
    <div className={`item-btn ${active ? 'on' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch', opacity: busy ? 0.55 : 1 }}>
      <button onClick={() => !busy && onSelect(d.id)} disabled={busy}
        style={{ all: 'unset', cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span>{d.name}{d.mount === 'table' ? ' 🍽' : d.mount === 'wall' ? ' 🧱' : ''}</span>
        <span className="muted">₾{d.price}</span>
      </button>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <AvailabilityDot status={d.availability} />
      </div>
      {active && !busy && <ColorChips colors={d.colors} value={color} onPick={onColor} />}
    </div>
  )
}

function SelectedPanel({ sel, def, onRecolor, onRotate, onResize, onDelete, onUnselect, onTableNo }) {
  return (
    <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--sand)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>მონიშნული: {def.name}</h3>
        <button className="chip-btn" onClick={onUnselect}>✕ მოხსნა</button>
      </div>
      <p className="muted" style={{ marginTop: 6 }}>ფერი:</p>
      <ColorChips colors={def.colors} value={sel.color} onPick={(hex) => onRecolor(sel.id, hex)} />
      {(sel.type === 'table-round' || sel.type === 'table-long') && (
        <div className="field" style={{ marginTop: 10 }}>
          <label>მაგიდის ნომერი — გამოჩნდება ღონისძიების გვერდზე დასაჯდომებში</label>
          <input type="number" min="1" value={sel.tableNo || ''} placeholder="№"
            onChange={(e) => onTableNo(sel.id, e.target.value ? +e.target.value : undefined)} />
        </div>
      )}
      {!sel.wall && (
        <div className="field" style={{ marginTop: 10, marginBottom: 0 }}>
          <label>მოტრიალება — {Math.round(((sel.rot || 0) * 180 / Math.PI) % 360)}°</label>
          <input type="range" min="0" max="360" step="5"
            value={Math.round(((sel.rot || 0) * 180 / Math.PI) % 360)}
            onChange={(e) => onRotate(sel.id, (+e.target.value) * Math.PI / 180)} />
        </div>
      )}
      {def.resizable && (
        <div className="field" style={{ marginTop: 8, marginBottom: 0 }}>
          <label>ზომა — ×{(sel.sx || 1).toFixed(1)}</label>
          <input type="range" min="0.5" max="2.5" step="0.1" value={sel.sx || 1}
            onChange={(e) => onResize(sel.id, +e.target.value)} />
        </div>
      )}
      <button className="btn btn-ghost" style={{ marginTop: 10, width: '100%', justifyContent: 'center', borderColor: '#C05B45', color: '#C05B45' }}
        onClick={() => onDelete(sel.id)}>ობიექტის წაშლა</button>
    </div>
  )
}

function RightPanel({ items, selected, onRecolor, onTableNo, onRotate, onResize, onDelete, onUnselect, mixed }) {
  const counts = useMemo(() => {
    const m = {}
    for (const it of items) m[it.type] = (m[it.type] || 0) + 1
    return Object.entries(m)
  }, [items])
  const total = items.reduce((s, it) => s + (byId[it.type]?.price || 0), 0)
  const sel = items.find((i) => i.id === selected)
  return (
    <aside className="viewer-panel">
      {sel && byId[sel.type] && (
        <SelectedPanel sel={sel} def={byId[sel.type]} onRecolor={onRecolor} onTableNo={onTableNo}
          onRotate={onRotate} onResize={onResize} onDelete={onDelete} onUnselect={onUnselect} />
      )}
      <h3>დამატებული ობიექტები</h3>
      {counts.length === 0 && <p className="muted">აირჩიეთ შაბლონი ან დაამატეთ ობიექტები.</p>}
      {counts.map(([type, n]) => (
        <div key={type} className="obj-row">
          <span>{byId[type]?.name || type}</span>
          <span className="badge badge-soft">×{n}</span>
        </div>
      ))}
      {counts.length > 0 && (
        <div className="obj-row" style={{ borderTop: '1px solid var(--sand)', marginTop: 8, paddingTop: 10, fontWeight: 600 }}>
          <span>ჯამი</span><span>₾{total.toLocaleString()}</span>
        </div>
      )}
      {mixed && (
        <p style={{ color: '#C05B45', fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>
          თქვენ მიერ შერჩეული დეკორაცია მიეკუთვნება სხვადასხვა კომპანიას. გთხოვთ, შეარჩიოთ ერთი კომპანიის მიერ წარმოდგენილი დეკორაცია.
        </p>
      )}
    </aside>
  )
}

/* ============ MAIN EDITOR ============ */
export function Viewer3D() {
  const params = useParams()
  const [vsp] = useSearchParams()
  const backEvent = vsp.get('event')
  const id = params.id || 'custom'
  const navigate = useNavigate()
  const venue = venues.find((v) => v.id === id)
  const D = useDesign(id)
  const [brush, setBrush] = useState('table-round')
  const [brushColor, setBrushColor] = useState(byId['table-round'].colors[0].hex)
  const [selected, setSelected] = useState(null)
  const [pending, setPending] = useState(null)
  const [mode, setMode] = useState('orbit')
  const [wire, setWire] = useState(false)
  const [measured, setMeasured] = useState(null)
  const [savedNote, setSavedNote] = useState(false)
  const captureRef = useRef(null)

  const env = (TEMPLATE_BY_ID[D.envId] || TEMPLATE_BY_ID.blank).env
  const brushDef = byId[brush]
  const companiesUsed = [...new Set(D.items.map((it) => byId[it.type]?.company).filter(Boolean))]
  const mixed = companiesUsed.length > 1

  const pickBrush = (idd) => {
    if (byId[idd].mount !== brushDef.mount) setPending(null)
    setBrush(idd); setBrushColor(byId[idd].colors[0].hex); setSelected(null)
  }
  const loadTemplate = (tpl) => {
    D.apply(tpl.items.map((it) => ({ ...it, id: uid() })))
    D.setEnvId(tpl.id)
    setSelected(null); setPending(null)
  }
  const confirmAdd = () => {
    if (!pending) return
    D.apply([...D.items, { id: uid(), type: brush, rot: 0, color: brushColor, ...pending }])
    setPending(null)
  }
  const recolor = (iid, hex) => D.apply(D.items.map((it) => it.id === iid ? { ...it, color: hex } : it))
  const setTableNo = (iid, no) => D.apply(D.items.map((it) => it.id === iid ? { ...it, tableNo: no } : it))
  const rotateTo = (iid, rad) => D.apply(D.items.map((it) => it.id === iid ? { ...it, rot: rad } : it))
  const resizeTo = (iid, sx) => D.apply(D.items.map((it) => it.id === iid ? { ...it, sx } : it))
  const deleteItem = (iid) => { D.apply(D.items.filter((it) => it.id !== iid)); setSelected(null) }

  const onFloorClick = (x, z) => {
    setSelected(null)
    if (brushDef.mount === 'floor') setPending({ x, z })
    else setPending(null)
  }
  const continueOn = () => {
    D.save()
    localStorage.setItem('cm_thumb', captureRef.current ? captureRef.current() : '')
    localStorage.setItem('cm_request_ctx', JSON.stringify({ venueId: id, items: D.items }))
    navigate('/request-form')
  }
  const saveOnly = () => { D.save() }
  const [publishedNote, setPublishedNote] = React.useState(false)
  const publish = () => {
    D.save()
    const title = window.prompt('ნამუშევრის სახელი გამოსაქვეყნებლად:', TEMPLATE_BY_ID[D.envId]?.name || 'ჩემი დიზაინი')
    if (title === null) return
    const thumb = captureRef.current ? captureRef.current() : null
    const user = JSON.parse(localStorage.getItem('cm_user') || 'null')
    const all = JSON.parse(localStorage.getItem('cm_gallery_public') || '[]')
    localStorage.setItem('cm_gallery_public', JSON.stringify([{
      id: 'pub' + Date.now(), kind: 'design', title: title || 'ჩემი დიზაინი',
      author: user?.name || 'სტუმარი', thumb, likes: 0, createdAt: Date.now(),
    }, ...all].slice(0, 30)))
    setPublishedNote(true); setTimeout(() => setPublishedNote(false), 2200)
  }
  const toInvitations = () => {
    D.save()
    const palette = [...new Set(D.items.map((it) => it.color).filter(Boolean))].slice(0, 5)
    localStorage.setItem('cm_inv_palette', JSON.stringify(palette))
    navigate('/invitations')
  }

  return (
    <main className="viewer-layout">
      <div className="viewer-top container-wide">
        {backEvent && (
          <Link to={`/event/${backEvent}`} className="btn btn-ghost" style={{ padding: '6px 14px' }}>← ღონისძიებაზე დაბრუნება</Link>
        )}
        <div>
          <div className="eyebrow">ნაბიჯი 2 / 3 · {venue ? venue.name : 'ჩემი სივრცე'}</div>
          <h2>3D მოდელირება</h2>
        </div>
        <div className="toolbar">
          <button className="btn btn-ghost" onClick={() => setSelected(null)} disabled={!selected}>Unselect</button>
          <button className="btn btn-ghost" onClick={() => selected && deleteItem(selected)} disabled={!selected}>წაშლა</button>
          <button className="btn btn-ghost" onClick={D.undo}>Undo</button>
        </div>
      </div>

      <div className="viewer-grid container-wide">
        <aside className="viewer-panel" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
          <h3>შაბლონები</h3>
          <div className="tool-col" style={{ marginBottom: 14 }}>
            {TEMPLATES.map((t) => (
              <button key={t.id} className={`item-btn ${D.envId === t.id ? 'gold' : ''}`} onClick={() => loadTemplate(t)}>
                <span>{t.name}<br /><span className="muted">{t.subtitle}</span></span>
              </button>
            ))}
          </div>

          <h3>დარბაზის ზომა</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div className="field" style={{ marginBottom: 0, flex: 1 }}>
              <label>სიგანე — {D.hall.w} მ</label>
              <input type="range" min="16" max="40" step="1" value={D.hall.w}
                onChange={(e) => D.setHall({ ...D.hall, w: +e.target.value })} />
            </div>
            <div className="field" style={{ marginBottom: 0, flex: 1 }}>
              <label>სიღრმე — {D.hall.d} მ</label>
              <input type="range" min="10" max="28" step="1" value={D.hall.d}
                onChange={(e) => D.setHall({ ...D.hall, d: +e.target.value })} />
            </div>
          </div>

          <h3>ხედის მართვა</h3>
          <div className="tool-row" style={{ marginBottom: 14 }}>
            {[['orbit', 'Rotate'], ['pan', 'Pan'], ['measure', 'Measure']].map(([k, label]) => (
              <button key={k} className={`chip-btn ${mode === k ? 'on' : ''}`} onClick={() => { setMode(k); setMeasured(null) }}>{label}</button>
            ))}
            <button className={`chip-btn ${wire ? 'on' : ''}`} onClick={() => setWire(!wire)}>Wireframe</button>
          </div>
          {measured && <p className="muted">მანძილი: <strong>{measured.toFixed(1)} მ</strong></p>}

          <h3>დეკორაციები კომპანიების მიხედვით</h3>
          {COMPANIES.map((co) => (
            <details key={co} open={decorations.some((d) => d.company === co && d.id === brush)} style={{ marginBottom: 8 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13.5, padding: '6px 0' }}>{co}</summary>
              <div className="tool-col" style={{ marginTop: 6 }}>
                {decorations.filter((d) => d.company === co).map((d) => (
                  <ItemButton key={d.id} d={d} active={brush === d.id} color={brushColor}
                    onSelect={pickBrush} onColor={setBrushColor} />
                ))}
              </div>
            </details>
          ))}
        </aside>

        <div className="viewport">
          <SceneBoundary>
          <Scene3D
            items={D.items} defs={byId} hall={D.hall} env={env}
            wireframe={wire} controlMode={mode}
            brushMount={brushDef.mount} selectedId={selected}
            pending={pending ? { type: brush, color: brushColor, ...pending } : null}
            onFloorClick={onFloorClick}
            onWallClick={(wall) => { setSelected(null); setPending({ wall }) }}
            onSurfaceClick={(p) => { setSelected(null); setPending(p) }}
            onSelectItem={(sid) => { setSelected(sid); setPending(null) }}
            onDragStart={() => D.pushHistory()}
            onDragMove={(iid, data) => D.setItems((cur) => cur.map((it) => it.id === iid ? { ...it, ...data } : it))}
            onMeasure={setMeasured} captureRef={captureRef}
          />
          </SceneBoundary>
          {pending && (
            <div className="place-confirm">
              <button className="btn btn-primary" onClick={confirmAdd}>დამატება</button>
              <button className="btn btn-ghost" onClick={() => setPending(null)}>გაუქმება</button>
            </div>
          )}
          <div className="viewport-hint">
            {pending ? 'ადგილის შესაცვლელად დააკლიკეთ სხვაგან · დაადასტურეთ „დამატებით"'
              : selected ? 'გადაათრიეთ ობიექტი · მართეთ მარჯვენა პანელიდან'
              : brushDef.mount === 'wall' ? 'დააკლიკეთ კედელს — გამოჩნდება პრევიუ'
              : brushDef.mount === 'table' ? 'დააკლიკეთ მაგიდას ან ბარს — დეკორი ზედ დაიდგმება'
              : 'დააკლიკეთ იატაკს — გამოჩნდება პრევიუ და „დამატების" ღილაკი'}
          </div>
        </div>

        <RightPanel items={D.items} selected={selected} mixed={mixed}
          onRecolor={recolor} onTableNo={setTableNo} onRotate={rotateTo} onResize={resizeTo}
          onDelete={deleteItem} onUnselect={() => setSelected(null)} />
      </div>

      <div className="viewer-bottom container-wide">
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => { saveOnly(); setSavedNote(true); setTimeout(() => setSavedNote(false), 1800) }}>
            {savedNote ? 'შენახულია ✓' : 'შენახვა'}
          </button>
          <button className="btn btn-ghost" onClick={toInvitations}>მოსაწვევების დაგენერირება</button>
          <button className="btn btn-ghost" onClick={publish} title="არასავალდებულო — მხოლოდ თქვენი სურვილით">
            {publishedNote ? 'გამოქვეყნდა ✓' : 'გალერეაში გამოქვეყნება'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {mixed && <span style={{ color: '#C05B45', fontSize: 12.5 }}>შერეული კომპანიები — გაგზავნა შეზღუდულია</span>}
          <button className="btn btn-primary" onClick={continueOn} disabled={mixed}
            style={mixed ? { opacity: 0.45, cursor: 'not-allowed' } : {}}>
            გაგრძელება და გაგზავნა →
          </button>
        </div>
      </div>
    </main>
  )
}

export function Customize() { return <Viewer3D /> }

/* ============ template preview (read-only) ============ */
export function DecoratedPreview() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const tplId = params.get('theme') || 'pink-white'
  const tpl = TEMPLATE_BY_ID[tplId] || TEMPLATES[1]
  return (
    <main className="viewer-layout">
      <div className="viewer-top container-wide">
        <div>
          <div className="eyebrow">იმერსიული პრევიუ</div>
          <h2>{tpl.name}</h2>
        </div>
        <Link to={`/venues/${id}/3d`} className="btn btn-ghost">← უკან 3D რეჟიმში</Link>
      </div>
      <div className="viewer-grid container-wide" style={{ gridTemplateColumns: '270px 1fr' }}>
        <aside className="viewer-panel" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          <h3>შაბლონები</h3>
          <div className="tool-col">
            {TEMPLATES.map((t) => (
              <Link key={t.id} to={`/venues/${id}/3d/decorated?theme=${t.id}`}
                className={`item-btn ${t.id === tplId ? 'gold' : ''}`}>
                <span>{t.name}</span>
              </Link>
            ))}
          </div>
        </aside>
        <div className="viewport">
          <SceneBoundary>
            <Scene3D items={tpl.items} defs={byId} hall={DEFAULT_HALL} env={tpl.env} controlMode="orbit" />
          </SceneBoundary>
        </div>
      </div>
    </main>
  )
}

/* ============ request form (unchanged logic) ============ */
export function RequestForm() {
  const ctx = JSON.parse(localStorage.getItem('cm_request_ctx') || '{"items":[]}')
  const thumb = localStorage.getItem('cm_thumb') || ''
  const venue = venues.find((v) => v.id === ctx.venueId)
  const companiesUsed = [...new Set(ctx.items.map((it) => byId[it.type]?.company).filter(Boolean))]
  const summary = useMemo(() => {
    const g = {}
    for (const it of ctx.items) {
      const d = byId[it.type]; if (!d) continue
      g[d.company] = g[d.company] || []
      const row = g[d.company].find((r) => r.id === d.id)
      row ? row.n++ : g[d.company].push({ id: d.id, name: d.name, price: d.price, n: 1 })
    }
    return g
  }, [ctx.items])
  const total = ctx.items.reduce((s, it) => s + (byId[it.type]?.price || 0), 0)
  const [sent, setSent] = useState(false)
  const [date, setDate] = useState('')
  const freeArtists = date ? artistsData.filter((a) => isFreeOn(a, date)).slice(0, 4) : []
  const freeCrews = date ? crewsData.filter((a) => isFreeOn(a, date)).slice(0, 2) : []

  const submit = (ev) => {
    ev.preventDefault()
    const data = Object.fromEntries(new FormData(ev.target))
    const req = { ...data, venueId: ctx.venueId, items: ctx.items, total, companies: companiesUsed, createdAt: Date.now() }
    const all = JSON.parse(localStorage.getItem('cm_requests') || '[]')
    localStorage.setItem('cm_requests', JSON.stringify([...all, req]))
    const body = encodeURIComponent(
      `ღონისძიება: ${venue ? venue.name : 'ჩემი სივრცე'}\nთარიღი: ${data.date} ${data.time}\nბიუჯეტი: ₾${data.budget}\nდეკორის ჯამი: ₾${total}\n\n${data.desc || ''}`
    )
    window.location.href = `mailto:requests@chillandmarry.ge?subject=მოთხოვნა — Chill %26 Marry&body=${body}`
    setSent(true)
  }

  if (sent) return (
    <main className="container" style={{ padding: '90px 24px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--champagne)', color: 'var(--ivory)', display: 'grid', placeItems: 'center', fontSize: 28, margin: '0 auto 18px' }}>✓</div>
      <h1>მოთხოვნა გაგზავნილია</h1>
      <p style={{ color: 'var(--umber-soft)', margin: '10px 0 26px' }}>
        {companiesUsed.length ? companiesUsed.join(', ') : 'კომპანია'} მიიღებს თქვენს 3D გეგმას და დაგიკავშირდებათ 24 საათში.
      </p>
      <Link to="/" className="btn btn-primary">მთავარზე დაბრუნება</Link>
    </main>
  )

  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div className="eyebrow">ნაბიჯი 3 / 3</div>
      <h1>მოთხოვნის გაგზავნა</h1>
      <Stepper active={3} />
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 10 }}>
        <form onSubmit={submit} style={{ flex: '1 1 380px', maxWidth: 480 }}>
          <div className="field">
            <label>მიმღები კომპანია</label>
            <input readOnly value={companiesUsed.join(', ') || 'აირჩევა დეკორაციების მიხედვით'} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="date">თარიღი</label>
              <input id="date" name="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="time">დრო</label>
              <input id="time" name="time" type="time" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="budget">ბიუჯეტი (₾)</label>
            <input id="budget" name="budget" type="number" min="500" step="100" defaultValue={Math.max(total, 3000)} required />
          </div>
          <div className="field">
            <label htmlFor="desc">აღწერა</label>
            <textarea id="desc" name="desc" rows="4" placeholder="მოგვიყევით თქვენი ღონისძიების შესახებ…" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>გაგზავნა</button>
          {date && (freeArtists.length > 0 || freeCrews.length > 0) && (
            <div className="info-banner" style={{ marginTop: 18 }}>
              <strong>ამ თარიღზე ({date}) თავისუფალია:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {freeArtists.map((a) => (
                  <Link key={a.id} to={`/artists/${a.id}`} className="badge badge-soft" style={{ textDecoration: 'none' }}>
                    {a.name} · {a.type}
                  </Link>
                ))}
                {freeCrews.map((a) => (
                  <Link key={a.id} to={`/crews/${a.id}`} className="badge badge-soft" style={{ textDecoration: 'none' }}>
                    {a.name} · {a.type}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </form>
        <aside style={{ flex: '1 1 300px', maxWidth: 420 }}>
          <div className="card" style={{ padding: 16 }}>
            <h3>თქვენი 3D გეგმა</h3>
            {thumb
              ? <img src={thumb} alt="3D მოდელის პრევიუ" style={{ borderRadius: 10, margin: '10px 0' }} />
              : <p className="muted">პრევიუ არ არის — დაბრუნდით 3D რეჟიმში.</p>}
            {Object.entries(summary).map(([company, rows]) => (
              <div key={company} style={{ marginTop: 12 }}>
                <span className="badge">{company}</span>
                {rows.map((r) => (
                  <div key={r.id} className="obj-row"><span>{r.name} ×{r.n}</span><span>₾{r.price * r.n}</span></div>
                ))}
              </div>
            ))}
            <div className="obj-row" style={{ borderTop: '1px solid var(--sand)', marginTop: 10, paddingTop: 10, fontWeight: 700 }}>
              <span>დეკორის ჯამი</span><span>₾{total.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
