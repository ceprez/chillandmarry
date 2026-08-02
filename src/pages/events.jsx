import React, { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import venues from '../data/venues.json'
import companies from '../data/companies.json'
import artists from '../data/artists.json'
import hotels from '../data/hotels.json'
import menuData from '../data/menu.json'
import decorations from '../data/decorations.json'
import {
  EVENT_TYPES, TYPE_CONFIG, SECTION_TITLES, FIREWORKS, AUDIO, DANCE_CLASSES, DRESS_SALONS, REGION_ACT,
} from '../data/eventTypes.js'

/* ---------------- storage ---------------- */
const load = () => JSON.parse(localStorage.getItem('cm_events') || '[]')
const persist = (list) => localStorage.setItem('cm_events', JSON.stringify(list))
const blankEvent = (type) => ({
  id: 'ev' + Date.now().toString(36),
  type, name: '', date: '', time: '18:00', status: 'draft', createdAt: Date.now(),
  venueId: '', companyIds: [], artistIds: [], activityIds: [],
  guestsCount: 50, guests: [], transfer: { enabled: false, guests: [], classId: 'economy' },
  hotel: { hotelId: '', from: '', to: '', rooms: 1 },
  cake: null, fireworksId: '', dress: { mode: '', salonId: '', ref: null, note: '', sent: false },
  schedule: [{ time: '18:00', title: 'სტუმრების მიღება' }],
  danceOpen: false, danceId: '', danceDate: '',
  menu: { items: [], tableOverrides: {} },
  seating: {}, audioId: '', invitationsSent: {},
})

function useEvent(id) {
  const [list, setList] = useState(load)
  const ev = list.find((e) => e.id === id)
  const update = (patch) => {
    setList((cur) => {
      const next = cur.map((e) => (e.id === id ? { ...e, ...patch } : e))
      persist(next)
      return next
    })
  }
  return { ev, update }
}



/* ---------------- shared UI ---------------- */
export const SECTION_META = {
  basics: { icon: '📋', acc: '#C9A24B' }, venue: { icon: '🏛', acc: '#8FA3BC' },
  companies: { icon: '🤝', acc: '#B08D6E' }, artists: { icon: '🎤', acc: '#C4527A' },
  activities: { icon: '🛥', acc: '#5A8E6E' }, guests: { icon: '👥', acc: '#4AA8E8' },
  transfer: { icon: '✈️', acc: '#3E5A9C' }, hotel: { icon: '🛏', acc: '#8A5A8E' },
  cake: { icon: '🎂', acc: '#E88AA0' }, invitations: { icon: '✉️', acc: '#D9B36A' },
  fireworks: { icon: '🎆', acc: '#E8632A' }, dress: { icon: '👗', acc: '#C3A6D8' },
  schedule: { icon: '🕐', acc: '#6E5D52' }, dance: { icon: '💃', acc: '#B85A34' },
  menu: { icon: '🍽', acc: '#5E7C50' }, audio: { icon: '🔊', acc: '#5C5248' },
  budget: { icon: '💰', acc: '#C9A24B' },
}
const hexSoft = (hex) => hex + '22'
const Sect = ({ id, title, children, note, done, delay = 0 }) => {
  const key = id.replace('s-', '')
  const m = SECTION_META[key] || { icon: '•', acc: '#C9A24B' }
  return (
    <section id={id} className="ev-sect" style={{ '--acc': m.acc, '--acc-soft': hexSoft(m.acc), animationDelay: `${delay}ms`, scrollMarginTop: 120 }}>
      <div className="ev-sect-head">
        <div className="ev-icon">{m.icon}</div>
        <div>
          <h2>{title}</h2>
          {note && <p className="muted">{note}</p>}
        </div>
        {done && <span className="ev-done">✓ შევსებულია</span>}
      </div>
      <div className="ev-body">{children}</div>
    </section>
  )
}
const Chip = ({ on, onClick, children }) => (
  <button className={`chip-btn ${on ? 'on' : ''}`} onClick={onClick}>{children}</button>
)
const Row = ({ l, r }) => <div className="obj-row"><span>{l}</span><span>{r}</span></div>

/* ---------------- design helpers: tables from 3D ---------------- */
const TABLE_CAP = { 'table-round': 8, 'table-long': 12 }
export function designTables(venueId) {
  if (!venueId) return []
  const design = JSON.parse(localStorage.getItem(`cm_design_${venueId}`) || '{}')
  const tables = (design.items || []).filter((it) => TABLE_CAP[it.type])
  return tables.map((t, i) => ({
    id: t.id, no: t.tableNo || i + 1, cap: TABLE_CAP[t.type],
    type: t.type, color: t.color || '#C9A24B',
  })).sort((a, b) => a.no - b.no)
}

/* ---------------- mini previews ---------------- */
function MiniFloorplan({ venueId, seating, guests }) {
  const design = JSON.parse(localStorage.getItem(`cm_design_${venueId}`) || '{}')
  const items = design.items || []
  const hall = design.hall || { w: 26, d: 16 }
  if (!items.length) return (
    <div style={{ border: '1.5px dashed var(--sand)', borderRadius: 12, padding: 18, textAlign: 'center', color: 'var(--umber-soft)', fontSize: 13, width: 240 }}>
      3D დიზაინი ჯერ არ შეგიქმნიათ<br />ამ დარბაზისთვის
    </div>
  )
  const W = 250, H = Math.round(W * hall.d / hall.w)
  const sx = W / hall.w, sz = H / hall.d
  let tableIdx = 0
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="250" style={{ border: '1.5px solid var(--sand)', borderRadius: 12, background: '#F6F1E8' }}>
        {items.filter((it) => !it.wall).map((it) => {
          const x = (it.x + hall.w / 2) * sx
          const y = ((it.z ?? 0) + hall.d / 2) * sz
          const isTable = TABLE_CAP[it.type]
          const no = isTable ? (it.tableNo || ++tableIdx) : null
          if (it.type === 'table-long' || it.type === 'stage' || it.type === 'bar') return (
            <g key={it.id}>
              <rect x={x - 10} y={y - 4.5} width="20" height="9" rx="2" fill={it.color || '#C9A24B'} stroke="#00000022" />
              {no && <text x={x} y={y + 2.6} textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">{no}</text>}
            </g>
          )
          return (
            <g key={it.id}>
              <circle cx={x} cy={y} r={isTable ? 7.5 : 3.2} fill={it.color || '#C9A24B'} stroke="#00000022" />
              {no && <text x={x} y={y + 2.6} textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">{no}</text>}
            </g>
          )
        })}
      </svg>
      <p className="muted" style={{ marginTop: 6 }}>განლაგება ზემოდან · მაგიდებს ნომრები აქვთ</p>
    </div>
  )
}

function MiniCake({ cake }) {
  if (!cake) return null
  const W = 150
  let y = 128
  const rects = Array.from({ length: cake.tiers }, (_, i) => {
    const w = 100 - i * 24, h = 26 - i * 3
    y -= h
    return { x: (W - w) / 2, y, w, h, c: cake.colors?.[i] || '#F7F1E4' }
  })
  return (
    <svg viewBox={`0 0 ${W} 140`} width="150" style={{ background: '#FDFBF7', borderRadius: 12, border: '1.5px solid var(--sand)' }}>
      <rect x="20" y="128" width="110" height="5" rx="2.5" fill="#D9B36A" />
      {rects.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="4" fill={r.c} stroke="#00000014" />
          <rect x={r.x} y={r.y} width={r.w} height="5" rx="2.5" fill="#FFFFFF66" />
        </g>
      ))}
      {cake.topper === 'flowers' && <circle cx="75" cy={rects[rects.length - 1].y - 7} r="6" fill="#E9A9B8" />}
      {cake.topper === 'heart' && <path d={`M 75 ${rects[rects.length - 1].y - 4} c -8 -10, -20 -2, 0 13 c 20 -15, 8 -23, 0 -13`} fill="#C05B45" />}
      {cake.topper === 'stars' && <path d={`M 75 ${rects[rects.length - 1].y - 16} l 2 5 5 0 -4 3.5 1.6 5 -4.6-3 -4.6 3 1.6-5 -4-3.5 5 0 z`} fill="#D9B36A" />}
    </svg>
  )
}

function MiniInvite({ ev }) {
  const pal = JSON.parse(localStorage.getItem('cm_inv_palette') || '[]')
  const bg = pal[0] || '#FAF7F2', acc = pal[1] || '#C9A24B'
  return (
    <svg viewBox="0 0 120 168" width="110" style={{ borderRadius: 10, border: '1.5px solid var(--sand)' }}>
      <rect width="120" height="168" fill={bg} />
      <rect x="7" y="7" width="106" height="154" fill="none" stroke={acc} strokeWidth="1.5" rx="4" />
      <circle cx="60" cy="38" r="10" fill="none" stroke={acc} strokeWidth="1.5" />
      <text x="60" y="80" textAnchor="middle" fontSize="10" fontFamily="serif" fill="#3A332C">{(ev.name || 'თქვენი ზეიმი').slice(0, 14)}</text>
      <line x1="35" y1="95" x2="85" y2="95" stroke={acc} strokeWidth="1" />
      <text x="60" y="115" textAnchor="middle" fontSize="7" fill="#8A7F72">{ev.date || 'თარიღი'}</text>
    </svg>
  )
}

const KA_D = ['ორ', 'სა', 'ოთ', 'ხუ', 'პა', 'შა', 'კვ']
function MiniCal({ busy = [], month = 7, year = 2026 }) {
  const first = new Date(year, month, 1)
  const start = (first.getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const ds = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return (
    <div>
      <p className="muted" style={{ fontSize: 10.5, margin: '0 0 3px' }}>აგვისტო 2026</p>
      <div className="mini-cal">
        {KA_D.map((d) => <div key={d} className="d" style={{ background: 'none', fontWeight: 700 }}>{d}</div>)}
        {Array(start).fill(0).map((_, i) => <div key={'e' + i} />)}
        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
          <div key={d} className={`d ${busy.includes(ds(d)) ? 'busy' : 'free'}`}>{d}</div>
        ))}
      </div>
    </div>
  )
}

const DressSVG = ({ kind, color = '#F5EFE4' }) => {
  const paths = {
    aline: 'M 30 8 L 38 8 L 40 20 L 52 52 L 16 52 L 28 20 Z',
    mermaid: 'M 30 8 L 38 8 L 40 22 L 36 38 L 46 52 L 22 52 L 32 38 L 28 22 Z',
    princess: 'M 30 8 L 38 8 L 40 18 L 56 52 L 12 52 L 28 18 Z',
    rent: 'M 30 8 L 38 8 L 39 24 L 44 52 L 24 52 L 29 24 Z',
  }
  return (
    <svg viewBox="0 0 68 58" width="64">
      <circle cx="34" cy="6" r="4" fill="#E8D4C0" />
      <path d={paths[kind] || paths.aline} fill={color} stroke="#C9A24B" strokeWidth="1.2" />
    </svg>
  )
}

/* ---------------- demo payment ---------------- */
export function PaymentModal({ open, onClose, purpose, amount, eventId, onPaid }) {
  const [stage, setStage] = useState('form')
  React.useEffect(() => { if (open) setStage('form') }, [open])
  if (!open) return null
  const pay = (e) => {
    e.preventDefault()
    setStage('processing')
    setTimeout(() => {
      const all = JSON.parse(localStorage.getItem('cm_payments') || '[]')
      localStorage.setItem('cm_payments', JSON.stringify([...all, {
        id: 'pay' + Date.now(), eventId, purpose, amount, status: 'paid-demo', at: Date.now(),
      }]))
      setStage('done')
      onPaid?.()
    }, 1600)
  }
  return (
    <div className="pay-overlay" onClick={(e) => e.target === e.currentTarget && stage !== 'processing' && onClose()}>
      <div className="pay-modal">
        <span className="pay-demo-badge">სადემონსტრაციო გადახდა — რეალური ინტეგრაცია დაემატება მოგვიანებით</span>
        {stage === 'form' && (
          <form onSubmit={pay}>
            <h3 style={{ marginBottom: 4 }}>{purpose}</h3>
            <p style={{ fontSize: 26, fontFamily: 'var(--serif)', margin: '4px 0 16px' }}>₾{amount.toLocaleString()}</p>
            <div className="field">
              <label>ბარათის ნომერი</label>
              <input placeholder="4111 1111 1111 1111" maxLength="19" required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="field" style={{ flex: 1 }}><label>ვადა</label><input placeholder="MM/YY" maxLength="5" required /></div>
              <div className="field" style={{ flex: 1 }}><label>CVC</label><input placeholder="123" maxLength="3" required /></div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>გადახდა</button>
            <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={onClose}>გაუქმება</button>
          </form>
        )}
        {stage === 'processing' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: 44, height: 44, border: '4px solid var(--linen)', borderTopColor: 'var(--champagne)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.9s linear infinite' }} />
            <p>მუშავდება…</p>
            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
          </div>
        )}
        {stage === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#6F8F5E', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 26, margin: '0 auto 14px' }}>✓</div>
            <h3>გადახდა წარმატებულია</h3>
            <p className="muted" style={{ margin: '6px 0 16px' }}>{purpose} · ₾{amount.toLocaleString()}</p>
            <button className="btn btn-primary" onClick={onClose}>დახურვა</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- MY EVENTS ---------------- */
export function MyEvents() {
  const [list, setList] = useState(load)
  const navigate = useNavigate()
  const M = { crumb: 'დაგეგმვა', h: 'ჩემი ღონისძიებები', new: '+ ახალი ღონისძიების შექმნა', pick: 'აირჩიეთ ღონისძიების ტიპი', yours: 'თქვენი ღონისძიებები', open: 'გახსნა', steps: 'ნაბიჯებით', empty: 'აირჩიეთ ტიპი ზემოთ — ღონისძიება მაშინვე შეიქმნება.', nodate: 'თარიღი არ არის არჩეული', draft: 'დრაფტი', planned: 'დაგეგმილი' }
  const create = (type) => {
    const ev = blankEvent(type)
    persist([ev, ...list]); setList([ev, ...list])
    navigate(`/event/${ev.id}/setup`)
  }
  const remove = (id) => {
    const next = list.filter((e) => e.id !== id)
    persist(next); setList(next)
  }
  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow">{M.crumb}</div>
          <h1>{M.h}</h1>
        </div>
        <a href="#create" className="btn btn-primary" style={{ textDecoration: 'none' }}>{M.new}</a>
      </div>

      <h3 id="create" style={{ margin: '22px 0 10px', scrollMarginTop: 80 }}>{M.pick}</h3>
      <div className="grid grid-4" style={{ marginBottom: 34 }}>
        {EVENT_TYPES.map((t) => (
          <button key={t.id} className="card" onClick={() => create(t.id)}
            style={{ padding: 18, textAlign: 'center', cursor: 'pointer', border: '1.5px solid var(--linen)', background: '#fff' }}>
            <div style={{ fontSize: 30 }}>{t.icon}</div>
            <div style={{ fontWeight: 600, marginTop: 6 }}>{t.name}</div>
          </button>
        ))}
      </div>

      {list.length > 0 && <h3 style={{ marginBottom: 10 }}>{M.yours}</h3>}
      <div className="grid grid-3">
        {list.map((e) => {
          const t = EVENT_TYPES.find((x) => x.id === e.type)
          return (
            <div key={e.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>{t?.icon}</span>
                <span className={`badge ${e.status === 'draft' ? 'badge-soft' : ''}`}>
                  {e.status === 'draft' ? M.draft : M.planned}
                </span>
              </div>
              <h3 style={{ margin: '10px 0 4px' }}>{e.name || t?.name || 'უსახელო'}</h3>
              <p className="muted">{e.date || M.nodate}{e.time ? ` · ${e.time}` : ''}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Link to={`/event/${e.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{M.open}</Link>
                <Link to={`/event/${e.id}/setup`} className="btn btn-ghost">{M.steps}</Link>
                <button className="chip-btn" onClick={() => remove(e.id)}>✕</button>
              </div>
            </div>
          )
        })}
      </div>
      {list.length === 0 && <p className="muted">{M.empty}</p>}
    </main>
  )
}

/* ---------------- done map ---------------- */
function computeDone(ev, budgetRows) {
  return {
    basics: !!(ev.name && ev.date), venue: !!ev.venueId, companies: ev.companyIds.length > 0,
    artists: ev.artistIds.length > 0, activities: ev.activityIds.length > 0, guests: ev.guests.length > 0,
    transfer: ev.transfer.enabled && ev.transfer.guests.length > 0,
    hotel: !!(ev.hotel.hotelId && ev.hotel.from && ev.hotel.to), cake: !!ev.cake,
    invitations: Object.keys(ev.invitationsSent).length > 0, fireworks: !!ev.fireworksId,
    dress: !!ev.dress.mode, schedule: ev.schedule.length > 1, dance: !!ev.danceId,
    menu: ev.menu.items.length > 0, audio: !!ev.audioId, budget: (budgetRows || []).length > 0,
  }
}

/* ---------------- budget ---------------- */
function useBudget(ev, cfg, venue) {
  return useMemo(() => {
    const rows = []
    if (venue) rows.push(['დარბაზი — ' + venue.name, venue.price])
    artists.filter((a) => ev.artistIds.includes(a.id)).forEach((a) => rows.push([a.name, a.price]))
    const acts = [...cfg.activities, ...(REGION_ACT[venue?.region] || [])]
    acts.filter((a) => ev.activityIds.includes(a.id)).forEach((a) => rows.push([a.name, a.price]))
    const fw = FIREWORKS.find((f) => f.id === ev.fireworksId)
    if (fw) rows.push(['ფოიერვერკი — ' + fw.partner, fw.price])
    if (ev.transfer.enabled && ev.transfer.guests.length) {
      const tc = TRANSFER_CLASSES.find((t) => t.id === (ev.transfer.classId || 'economy'))
      rows.push([`ტრანსფერი (${tc.name}) ×${ev.transfer.guests.length}`, ev.transfer.guests.length * tc.price])
    }
    const hotel = hotels.find((h) => h.id === ev.hotel.hotelId)
    if (hotel && ev.hotel.from && ev.hotel.to) {
      const nights = Math.max(0, Math.round((new Date(ev.hotel.to) - new Date(ev.hotel.from)) / 86400000))
      if (nights > 0) rows.push([`${hotel.name} · ${nights} ღამე × ${ev.hotel.rooms} ოთახი`, nights * ev.hotel.rooms * hotel.pricePerNight])
    }
    if (ev.cake?.price) rows.push(['ტორტი — ' + (ev.cake.shopName || ''), ev.cake.price])
    const menuAll = [...menuData.dishes, ...menuData.drinks]
    const menuSel = menuAll.filter((m) => ev.menu.items.includes(m.id))
    if (menuSel.length) {
      const per = menuSel.reduce((s, m) => s + m.price, 0)
      rows.push([`მენიუ · ${menuSel.length} პოზიცია × ${ev.guestsCount} სტუმარი`, per * ev.guestsCount])
    }
    const audio = AUDIO.find((a) => a.id === ev.audioId)
    if (audio) rows.push([audio.name, audio.price])
    const dance = DANCE_CLASSES.find((d) => d.id === ev.danceId)
    if (dance) rows.push([dance.name, dance.price])
    const total = rows.reduce((s, [, p]) => s + p, 0)
    return { rows, total }
  }, [ev, venue, cfg])
}

/* ================= SECTION RENDERERS (shared by hub & wizard) ================= */
function useEventCtx(ev, update) {
  const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.other
  const venue = venues.find((v) => v.id === ev.venueId)
  const intlGuests = ev.guests.filter((g) => g.country && g.country !== 'საქართველო')
  const budget = useBudget(ev, cfg, venue)
  const done = computeDone(ev, budget.rows)
  const toggleIn = (arrKey, idv) => update({
    [arrKey]: ev[arrKey].includes(idv) ? ev[arrKey].filter((x) => x !== idv) : [...ev[arrKey], idv],
  })
  return { cfg, venue, intlGuests, budget, done, toggleIn }
}

function renderSection(key, ev, update, ctx, delay = 0) {
  const { cfg, venue, intlGuests, budget, done, toggleIn } = ctx
  const D = { done: done[key], delay }
  switch (key) {
    case 'basics': return (
      <Sect key={key} id="s-basics" title={SECTION_TITLES.basics} {...D}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>სახელი</label>
            <input value={ev.name} onChange={(e) => update({ name: e.target.value })} placeholder="მაგ.: ნინო & გიორგი" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>თარიღი</label>
            <input type="date" value={ev.date} onChange={(e) => update({ date: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>დრო</label>
            <input type="time" value={ev.time} onChange={(e) => update({ time: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>სტუმრების რაოდენობა</label>
            <input type="number" min="1" value={ev.guestsCount} onChange={(e) => update({ guestsCount: +e.target.value || 0 })} />
          </div>
        </div>
      </Sect>
    )
    case 'venue': return <VenueSection key={key} ev={ev} update={update} venue={venue} done={done.venue} delay={delay} />
    case 'companies': return (
      <Sect key={key} id="s-companies" title={SECTION_TITLES.companies} {...D}
        note="თითოეულ კომპანიას საკუთარი სრული ინვენტარი აქვს — ყვავილები, ავეჯი, განათება — მთელი ღონისძიება ერთ სტილში აეწყობა">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
          {companies.map((c) => (
            <button key={c.id} className={`pick-card ${ev.companyIds.includes(c.id) ? 'on' : ''}`}
              onClick={() => toggleIn('companyIds', c.id)}>
              {c.photo && <img src={c.photo} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover', borderRadius: 10 }} />}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="pick-ava" style={{ background: c.hue }}>🤝</div>
                <div>
                  <strong>{c.name}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{c.styles}</div>
                </div>
              </div>
              <span className="badge" style={{ alignSelf: 'flex-start', fontSize: 10.5 }}>სრული კომპლექტაცია ✓</span>
              <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{c.desc}</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(c.services || []).map((s2) => <span key={s2} className="badge badge-soft" style={{ fontSize: 10 }}>{s2}</span>)}
              </div>
            </button>
          ))}
        </div>
        {ev.companyIds.map((cid) => <CompanyInventory key={cid} companyId={cid} />)}
      </Sect>
    )
    case 'artists': {
      const AV = { 'დიჯეი': '🎧', 'ორკესტრი': '🎻', 'მომღერალი': '🎤', 'მოცეკვავეები': '💃' }
      return (
        <Sect key={key} id="s-artists" title={SECTION_TITLES.artists} {...D}
          note={ev.date ? `თარიღი: ${ev.date} — დაკავებული არტისტების არჩევა შეზღუდულია` : 'მიუთითეთ თარიღი «ძირითად ინფორმაციაში» — ხელმისაწვდომობა ავტომატურად შემოწმდება'}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 10 }}>
            {artists.map((a) => {
              const busy = ev.date && (a.busyDates || []).includes(ev.date)
              const on = ev.artistIds.includes(a.id)
              return (
                <button key={a.id} className={`pick-card ${on ? 'on' : ''}`}
                  disabled={busy && !on}
                  style={busy && !on ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                  onClick={() => { if (!busy || on) toggleIn('artistIds', a.id) }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="pick-ava" style={{ background: a.hue }}>{AV[a.type] || '🎵'}</div>
                    <div>
                      <strong>{a.name}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>{a.type} · {a.genre}</div>
                      <div style={{ fontSize: 12, color: 'var(--champagne)' }}>★ {a.rating} ({a.reviews}) · ₾{a.price}</div>
                    </div>
                  </div>
                  {busy && <span className="badge" style={{ background: '#C05B45', alignSelf: 'flex-start' }}>დაკავებულია {ev.date}-ზე</span>}
                  {on && (
                    <div style={{ borderTop: '1px solid var(--linen)', paddingTop: 8 }}>
                      <p className="muted" style={{ fontSize: 12, lineHeight: 1.55, margin: '0 0 8px' }}>{a.desc}</p>
                      <MiniCal busy={a.busyDates || []} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Sect>
      )
    }
    case 'activities': {
      const regionActs = REGION_ACT[venue?.region] || []
      const all = [...cfg.activities, ...regionActs]
      return (
        <Sect key={key} id="s-activities" title={SECTION_TITLES.activities} {...D}
          note={venue ? `${venue.city} — ადგილობრივი აქტივობები მონიშნულია 📍` : 'აირჩიეთ დარბაზი — მდებარეობის აქტივობებიც გამოჩნდება'}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10 }}>
            {all.map((a) => (
              <button key={a.id} className={`pick-card ${ev.activityIds.includes(a.id) ? 'on' : ''}`}
                onClick={() => toggleIn('activityIds', a.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong>{regionActs.includes(a) ? '📍 ' : ''}{a.name}</strong>
                  <strong style={{ color: 'var(--champagne)', whiteSpace: 'nowrap' }}>₾{a.price}</strong>
                </div>
                {a.desc && <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{a.desc}</span>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {a.dur && <span className="badge badge-soft" style={{ fontSize: 10.5 }}>⏱ {a.dur}</span>}
                  {ev.date && <span className="badge badge-soft" style={{ fontSize: 10.5 }}>📅 {ev.date} — თავისუფალია</span>}
                </div>
              </button>
            ))}
          </div>
        </Sect>
      )
    }
    case 'guests': return <GuestsSection key={key} ev={ev} update={update} done={done.guests} delay={delay} />
    case 'transfer': return <TransferSection key={key} ev={ev} update={update} intlGuests={intlGuests} delay={delay} />
    case 'hotel': {
      const list = hotels.filter((h) => {
        if (h.inVenue) return h.inVenue === venue?.id
        if (venue?.region === 'batumi') return h.id === 'hotel-batumi'
        return h.id !== 'hotel-batumi'
      })
      const hotel = hotels.find((h) => h.id === ev.hotel.hotelId)
      const nights = ev.hotel.from && ev.hotel.to
        ? Math.max(0, Math.round((new Date(ev.hotel.to) - new Date(ev.hotel.from)) / 86400000)) : 0
      return (
        <Sect key={key} id="s-hotel" title={SECTION_TITLES.hotel} {...D}
          note={venue?.id === 'alazani' ? 'თქვენი დარბაზი სასტუმროშია — ოთახები იქვე დაჯავშნეთ' : 'პარტნიორი სასტუმროები დარბაზის მახლობლად'}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10, marginBottom: 14 }}>
            {list.map((h) => (
              <button key={h.id} className={`pick-card ${ev.hotel.hotelId === h.id ? 'on' : ''}`}
                onClick={() => update({ hotel: { ...ev.hotel, hotelId: ev.hotel.hotelId === h.id ? '' : h.id } })}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="pick-ava" style={{ background: h.hue }}>{h.emoji}</div>
                  <div>
                    <strong>{h.name}</strong>
                    <div style={{ color: 'var(--champagne)', fontSize: 12 }}>{'★'.repeat(h.stars)}</div>
                  </div>
                </div>
                <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{h.desc}</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(h.amen || []).map((a) => <span key={a} className="badge badge-soft" style={{ fontSize: 10 }}>{a}</span>)}
                </div>
                <strong style={{ color: 'var(--champagne)' }}>₾{h.pricePerNight} / ღამე</strong>
              </button>
            ))}
          </div>
          {hotel && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, borderTop: '1px solid var(--linen)', paddingTop: 14 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>შესვლა</label>
                <input type="date" value={ev.hotel.from} onChange={(e) => update({ hotel: { ...ev.hotel, from: e.target.value } })} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>გასვლა</label>
                <input type="date" value={ev.hotel.to} onChange={(e) => update({ hotel: { ...ev.hotel, to: e.target.value } })} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>ოთახები</label>
                <input type="number" min="1" value={ev.hotel.rooms} onChange={(e) => update({ hotel: { ...ev.hotel, rooms: +e.target.value || 1 } })} />
              </div>
              {nights > 0 && (
                <div style={{ alignSelf: 'end' }}>
                  <Row l={`${nights} ღამე × ${ev.hotel.rooms} ოთახი`} r={`₾${(nights * ev.hotel.rooms * hotel.pricePerNight).toLocaleString()}`} />
                </div>
              )}
            </div>
          )}
          {hotel && ev.hotel.from && ev.hotel.to && (() => {
            const bk = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' Georgia')}&checkin=${ev.hotel.from}&checkout=${ev.hotel.to}&group_adults=2&no_rooms=${ev.hotel.rooms}`
            const mail = `mailto:?subject=${encodeURIComponent('სასტუმროს ჯავშანი — ' + (ev.name || 'Chill & Marry'))}&body=${encodeURIComponent('სასტუმრო: ' + hotel.name + '\nთარიღები: ' + ev.hotel.from + ' → ' + ev.hotel.to + '\n\nდაჯავშნა Booking.com-ზე:\n' + bk)}`
            return (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
                <a href={bk} target="_blank" rel="noreferrer" className="btn btn-primary">Booking.com-ზე ნახვა ↗</a>
                <a href={mail} className="btn btn-ghost">ბმულის გაგზავნა ✉</a>
                <button className="chip-btn" onClick={() => navigator.clipboard?.writeText(bk)}>ბმულის კოპირება</button>
              </div>
            )
          })()}
        </Sect>
      )
    }
    case 'cake': return (
      <Sect key={key} id="s-cake" title={SECTION_TITLES.cake} note={cfg.cakeNote} {...D}>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {ev.cake ? <MiniCake cake={ev.cake} /> : (
            <div style={{ border: '1.5px dashed var(--sand)', borderRadius: 12, width: 150, height: 140, display: 'grid', placeItems: 'center', color: 'var(--umber-soft)', fontSize: 30 }}>🎂</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ev.cake
              ? <Row l={`${ev.cake.tiers} იარუსი · ${ev.cake.kg} კგ · ${ev.cake.shopName}`} r={`₾${ev.cake.price}`} />
              : <p className="muted">ტორტი ჯერ არ არის შექმნილი — ააწყვეთ 3D-ში, გადმოწერეთ კუთხეები PNG-ად და გაუგზავნეთ საკონდიტროს.</p>}
            <Link to={`/cake-builder?event=${ev.id}`} className="btn btn-primary">
              {ev.cake ? 'ტორტის რედაქტირება (2D + 3D) →' : 'ტორტის დიზაინი (2D + 3D) →'}
            </Link>
          </div>
        </div>
      </Sect>
    )
    case 'invitations': return <InvitationsSection key={key} ev={ev} update={update} done={done.invitations} delay={delay} />
    case 'fireworks': return (
      <Sect key={key} id="s-fireworks" title={SECTION_TITLES.fireworks} note="პარტნიორები: PyroArt Georgia · SparkPro" {...D}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FIREWORKS
            .filter((f) => ev.type === 'gender-reveal' ? true : f.id !== 'fw-reveal')
            .map((f) => (
              <Chip key={f.id} on={ev.fireworksId === f.id}
                onClick={() => update({ fireworksId: ev.fireworksId === f.id ? '' : f.id })}>
                🎆 {f.name} · ₾{f.price}
              </Chip>
            ))}
        </div>
      </Sect>
    )
    case 'dress': return <DressSection key={key} ev={ev} update={update} done={done.dress} delay={delay} />
    case 'schedule': return <ScheduleSection key={key} ev={ev} update={update} delay={delay} />
    case 'dance': return <DanceSection key={key} ev={ev} update={update} delay={delay} />
    case 'menu': return <MenuSection key={key} ev={ev} update={update} delay={delay} />
    case 'audio': {
      const opts = AUDIO.filter((a) =>
        (a.provider === 'venue' || ev.companyIds.includes(a.provider)) &&
        (!venue || (venue.capacity >= a.min)))
      const hidden = AUDIO.length - opts.length
      return (
        <Sect key={key} id="s-audio" title={SECTION_TITLES.audio} {...D}
          note="ხელმისაწვდომი სისტემები დამოკიდებულია დარბაზზე და არჩეულ საივენთო კომპანიებზე">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {opts.map((a) => (
              <Chip key={a.id} on={ev.audioId === a.id}
                onClick={() => update({ audioId: ev.audioId === a.id ? '' : a.id })}>
                🔊 {a.name} · ₾{a.price}
                {a.provider !== 'venue' && <span className="muted"> · {companies.find((c) => c.id === a.provider)?.name}</span>}
              </Chip>
            ))}
          </div>
          {hidden > 0 && (
            <p className="muted" style={{ marginTop: 10 }}>
              + {hidden} სისტემა გამოჩნდება შესაბამისი კომპანიის არჩევისას ან უფრო დიდი დარბაზისთვის
            </p>
          )}
        </Sect>
      )
    }
    case 'budget': return <BudgetSection key={key} ev={ev} budget={budget} delay={delay} />
    default: return null
  }
}

/* ---------------- venue section with details popup ---------------- */
function VenueSection({ ev, update, venue, done, delay }) {
  const [modal, setModal] = useState(null)
  return (
    <Sect id="s-venue" title={SECTION_TITLES.venue} done={done} delay={delay}
      note="აირჩიეთ დარბაზი — «დეტალები» გაჩვენებთ ფოტოებსა და სრულ აღწერას">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10, marginBottom: 14 }}>
        {venues.map((v) => (
          <div key={v.id} className={`pick-card ${ev.venueId === v.id ? 'on' : ''}`}
            onClick={() => update({ venueId: ev.venueId === v.id ? '' : v.id })} style={{ cursor: 'pointer' }}>
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', background: v.hue }}>
              {v.photos?.[0] && <img src={v.photos[0]} alt={v.name} loading="lazy"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              {ev.venueId === v.id && <span className="badge" style={{ position: 'absolute', top: 8, right: 8 }}>არჩეულია ✓</span>}
            </div>
            <strong>{v.name}</strong>
            <span className="muted" style={{ fontSize: 12 }}>{v.city} · {v.capacity} სტუმარი · {v.area} მ²</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--champagne)' }}>₾{v.price.toLocaleString()}</strong>
              <button className="chip-btn" onClick={(e) => { e.stopPropagation(); setModal(v) }}>დეტალები →</button>
            </div>
          </div>
        ))}
      </div>

      {venue && (
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start', borderTop: '1px solid var(--linen)', paddingTop: 14 }}>
          <MiniFloorplan venueId={venue.id} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 220 }}>
            <Link to={`/venues/${venue.id}/3d?event=${ev.id}`} className="btn btn-primary">3D დიზაინის შექმნა/რედაქტირება →</Link>
            <Link to={`/venues/${venue.id}`} className="btn btn-ghost">დარბაზის სრული გვერდი</Link>
          </div>
        </div>
      )}

      {modal && (
        <div className="pay-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="pay-modal" style={{ maxWidth: 620, maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 20 }}>{modal.name}</h3>
              <button className="chip-btn" onClick={() => setModal(null)} style={{ fontSize: 15, padding: '4px 12px' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {(modal.photos || []).map((p, i) => (
                <img key={i} src={p} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 10, gridColumn: i === 0 ? '1 / -1' : undefined }} />
              ))}
            </div>
            {modal.desc && <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{modal.desc}</p>}
            <div className="obj-row"><span>მდებარეობა</span><span>{modal.city}</span></div>
            <div className="obj-row"><span>ტევადობა</span><span>{modal.capacity} სტუმარი</span></div>
            <div className="obj-row"><span>ფართობი</span><span>{modal.area} მ²</span></div>
            <div className="obj-row" style={{ fontWeight: 700 }}><span>ფასი</span><span>₾{modal.price.toLocaleString()}</span></div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0 14px' }}>
              {(modal.features || []).map((f) => <span key={f} className="badge badge-soft">{f}</span>)}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { update({ venueId: modal.id }); setModal(null) }}>
              ამ დარბაზის არჩევა ✓
            </button>
          </div>
        </div>
      )}
    </Sect>
  )
}

/* ---------------- company inventory ---------------- */
function CompanyInventory({ companyId }) {
  const [open, setOpen] = useState(false)
  const c = companies.find((x) => x.id === companyId)
  const items = decorations.filter((d) => d.company === companyId)
  if (!c || !items.length) return null
  const cats = [...new Set(items.map((i) => i.category))].filter(Boolean)
  const shown = open ? items : items.slice(0, 6)
  return (
    <div style={{ borderTop: '1px solid var(--linen)', marginTop: 14, paddingTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <strong style={{ fontSize: 14 }}>{c.name} — ინვენტარი · {items.length} ობიექტი</strong>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cats.map((k) => <span key={k} className="badge badge-soft" style={{ fontSize: 10.5 }}>{k}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
        {shown.map((it) => (
          <span key={it.id} className="badge" style={{ background: '#fff', color: 'var(--umber)', border: '1px solid var(--linen)', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: it.colors?.[0]?.hex || c.hue, display: 'inline-block' }} />
            {it.name} · ₾{it.price}
          </span>
        ))}
        {!open && items.length > 6 && <span className="muted" style={{ alignSelf: 'center', fontSize: 12 }}>+{items.length - 6}</span>}
      </div>
      <button className="chip-btn" onClick={() => setOpen(!open)}>{open ? 'ჩაკეცვა' : 'სრული ინვენტარის ნახვა'}</button>
    </div>
  )
}

/* ---------------- transfer ---------------- */
export const TRANSFER_CLASSES = [
  { id: 'economy', name: 'ეკონომი', icon: '🚗', desc: 'სედანი · 1-3 მგზავრი', price: 60 },
  { id: 'comfort', name: 'კომფორტი', icon: '🚙', desc: 'ახალი სედანი · წყალი და Wi-Fi', price: 90 },
  { id: 'business', name: 'ბიზნესი', icon: '🚘', desc: 'Mercedes E-class · დახვედრა ტაბლოთი', price: 150 },
  { id: 'minivan', name: 'მინივენი', icon: '🚐', desc: '6-8 მგზავრი · ბარგი', price: 200 },
]
function TransferSection({ ev, update, intlGuests, delay }) {
  const [paying, setPaying] = useState(false)
  const cls = ev.transfer.classId || 'economy'
  const clsDef = TRANSFER_CLASSES.find((t) => t.id === cls)
  const total = ev.transfer.guests.length * clsDef.price
  const payments = JSON.parse(localStorage.getItem('cm_payments') || '[]')
  const paid = payments.some((p) => p.eventId === ev.id && p.purpose.startsWith('ტრანსფერი'))
  return (
    <Sect id="s-transfer" title={SECTION_TITLES.transfer} done={ev.transfer.enabled && ev.transfer.guests.length > 0} delay={delay}
      note={intlGuests.length
        ? `უცხოეთიდან ჩამოდის ${intlGuests.length} სტუმარი — აირჩიეთ კლასი და მონიშნეთ ვის სჭირდება დახვედრა`
        : 'დაამატეთ სტუმრები ქვეყნების მითითებით — უცხოელი სტუმრები აქ გამოჩნდებიან'}>
      {intlGuests.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 14 }}>
            {TRANSFER_CLASSES.map((t) => (
              <button key={t.id} className={`transfer-class ${cls === t.id ? 'on' : ''}`}
                onClick={() => update({ transfer: { ...ev.transfer, enabled: true, classId: t.id } })}>
                <span className="t-ico">{t.icon}</span>
                <strong>{t.name} · ₾{t.price}</strong>
                <span className="muted">{t.desc}</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 13.5, marginBottom: 8 }}>ვის სჭირდება ტრანსფერი:</p>
          {intlGuests.map((g) => (
            <label key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5, padding: '3px 0' }}>
              <input type="checkbox" checked={ev.transfer.guests.includes(g.id)}
                onChange={() => update({
                  transfer: {
                    ...ev.transfer, enabled: true,
                    guests: ev.transfer.guests.includes(g.id)
                      ? ev.transfer.guests.filter((x) => x !== g.id)
                      : [...ev.transfer.guests, g.id],
                  },
                })} />
              {g.name} · {g.country}
            </label>
          ))}
          {ev.transfer.guests.length > 0 && (
            <div className="viewer-bottom" style={{ marginTop: 12 }}>
              <strong>{clsDef.icon} {clsDef.name} × {ev.transfer.guests.length} = ₾{total.toLocaleString()}</strong>
              {paid
                ? <span className="badge" style={{ background: '#6F8F5E' }}>გადახდილია ✓</span>
                : <button className="btn btn-primary" onClick={() => setPaying(true)}>შეკვეთა და გადახდა</button>}
            </div>
          )}
          <PaymentModal open={paying} onClose={() => setPaying(false)} eventId={ev.id}
            purpose={`ტრანსფერი — ${clsDef.name}`} amount={total}
            onPaid={() => update({ transfer: { ...ev.transfer } })} />
        </>
      )}
    </Sect>
  )
}

/* ---------------- guests + seating from 3D tables ---------------- */
const COUNTRIES = ['საქართველო', 'გერმანია', 'აშშ', 'საფრანგეთი', 'იტალია', 'დიდი ბრიტანეთი', 'ისრაელი', 'რუსეთი', 'უკრაინა', 'სხვა']
function GuestsSection({ ev, update, done, delay }) {
  const [draft, setDraft] = useState({ name: '', email: '', phone: '', country: 'საქართველო' })
  const [activeTable, setActiveTable] = useState(null)
  const tables = designTables(ev.venueId)
  const seatOf = (gid) => ev.seating[gid]
  const tableGuests = (no) => ev.guests.filter((g) => seatOf(g.id)?.table === no)

  const add = () => {
    if (!draft.name.trim()) return
    update({ guests: [...ev.guests, { ...draft, id: 'g' + Date.now().toString(36) }] })
    setDraft({ name: '', email: '', phone: '', country: 'საქართველო' })
  }
  const remove = (gid) => {
    const seating = { ...ev.seating }; delete seating[gid]
    update({
      guests: ev.guests.filter((g) => g.id !== gid), seating,
      transfer: { ...ev.transfer, guests: ev.transfer.guests.filter((x) => x !== gid) },
    })
  }
  const toggleSeat = (gid) => {
    const seating = { ...ev.seating }
    if (seating[gid]) { delete seating[gid]; update({ seating }); return }
    if (activeTable == null) return
    const t = tables.find((x) => x.no === activeTable)
    const used = tableGuests(activeTable).length
    if (!t || used >= t.cap) return
    seating[gid] = { table: activeTable, seat: used + 1 }
    update({ seating })
  }
  const unseated = ev.guests.filter((g) => !seatOf(g.id))

  return (
    <Sect id="s-guests" title={SECTION_TITLES.guests} done={done} delay={delay}
      note={`დაგეგმილი: ${ev.guestsCount} · სახელობით: ${ev.guests.length}${tables.length ? ` · მაგიდები 3D დიზაინიდან: ${tables.length}` : ''}`}>

      {/* add guest card */}
      <div style={{ border: '1.5px solid var(--linen)', borderRadius: 14, padding: 14, background: '#FBF8F2', marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 10 }}>➕ სტუმრის დამატება</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ marginBottom: 0, flex: '1 1 160px' }}><label>სახელი</label>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="სახელი გვარი" /></div>
          <div className="field" style={{ marginBottom: 0, flex: '1 1 160px' }}><label>ელფოსტა</label>
            <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="mail@…" /></div>
          <div className="field" style={{ marginBottom: 0, flex: '1 1 130px' }}><label>ტელეფონი</label>
            <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+995…" /></div>
          <div className="field" style={{ marginBottom: 0, flex: '1 1 130px' }}><label>ქვეყანა</label>
            <select value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select></div>
          <button className="btn btn-primary" onClick={add}
            style={{ flex: '0 0 auto', minWidth: 120, height: 42, justifyContent: 'center' }}>+ დამატება</button>
        </div>
      </div>

      {tables.length === 0 ? (
        <p className="muted" style={{ marginBottom: 10 }}>
          🪑 დასაჯდომების გასანაწილებლად ჯერ 3D დიზაინში დაამატეთ მაგიდები — ისინი აქ ნომრებით და გეგმით გამოჩნდება.
        </p>
      ) : (
        <>
          <h3 style={{ fontSize: 15, margin: '4px 0 8px' }}>დასაჯდომების განაწილება</h3>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <MiniFloorplan venueId={ev.venueId} />
              <p className="muted" style={{ fontSize: 11.5, maxWidth: 250 }}>ნომრები გეგმაზე = მაგიდის ნომრები ქვემოთ</p>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <p className="muted" style={{ margin: '0 0 8px' }}>1) აირჩიეთ მაგიდა · 2) დააჭირეთ სტუმარს ქვემოთ — დაჯდება პირველ თავისუფალ ადგილზე</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 10 }}>
                {tables.map((t) => {
                  const g = tableGuests(t.no)
                  return (
                    <div key={t.id} className={`table-block ${activeTable === t.no ? 'active' : ''}`}
                      onClick={() => setActiveTable(activeTable === t.no ? null : t.no)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <strong>{t.type === 'table-long' ? '▭' : '●'} მაგიდა {t.no}</strong>
                        <span className="muted" style={{ fontSize: 12 }}>{g.length}/{t.cap}</span>
                      </div>
                      {/* seat layout: round = circle, long = two rows */}
                      {t.type === 'table-round' ? (
                        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
                          <div style={{ position: 'absolute', inset: 26, borderRadius: '50%', background: t.color + '33', border: `2px solid ${t.color}`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: 'var(--umber)' }}>{t.no}</div>
                          {Array.from({ length: t.cap }, (_, i) => {
                            const a = (i / t.cap) * Math.PI * 2 - Math.PI / 2
                            const gg = g[i]
                            return (
                              <div key={i} className={`seat ${gg ? 'taken' : ''}`} title={gg ? gg.name : `ადგილი ${i + 1}`}
                                style={{ position: 'absolute', left: 45 + Math.cos(a) * 45, top: 45 + Math.sin(a) * 45 }}>
                                {gg ? gg.name.slice(0, 2) : i + 1}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {Array.from({ length: Math.ceil(t.cap / 2) }, (_, i) => {
                              const gg = g[i]
                              return <div key={i} className={`seat ${gg ? 'taken' : ''}`} title={gg ? gg.name : `ადგილი ${i + 1}`}>{gg ? gg.name.slice(0, 2) : i + 1}</div>
                            })}
                          </div>
                          <div style={{ width: '92%', height: 16, borderRadius: 5, background: t.color + '33', border: `2px solid ${t.color}`, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>{t.no}</div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {Array.from({ length: Math.floor(t.cap / 2) }, (_, i) => {
                              const idx = Math.ceil(t.cap / 2) + i
                              const gg = g[idx]
                              return <div key={i} className={`seat ${gg ? 'taken' : ''}`} title={gg ? gg.name : `ადგილი ${idx + 1}`}>{gg ? gg.name.slice(0, 2) : idx + 1}</div>
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {activeTable != null && (
            <p style={{ margin: '10px 0 6px', fontSize: 13.5 }}>
              🪑 მაგიდა <strong>{activeTable}</strong> არჩეულია — დააჭირეთ სტუმარს:
            </p>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {ev.guests.map((g) => {
          const st = seatOf(g.id)
          return (
            <span key={g.id} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <button className={`guest-pill ${st ? 'seated' : ''}`} onClick={() => toggleSeat(g.id)}
                title={st ? `მაგიდა ${st.table}, ადგილი ${st.seat} — მოხსნა` : 'დასმა არჩეულ მაგიდაზე'}>
                {g.name}{g.country !== 'საქართველო' ? ' 🌍' : ''}{st ? ` · მაგ.${st.table}/ად.${st.seat}` : ''}
              </button>
              <button className="chip-btn" style={{ padding: '2px 7px' }} onClick={() => remove(g.id)}>✕</button>
            </span>
          )
        })}
      </div>
      {tables.length > 0 && unseated.length > 0 && ev.guests.length > 0 && (
        <p className="muted" style={{ marginTop: 8 }}>დასასმელია კიდევ {unseated.length} სტუმარი</p>
      )}
    </Sect>
  )
}

/* ---------------- invitations ---------------- */
function InvitationsSection({ ev, update, done, delay }) {
  const markSent = (gid, how) => update({ invitationsSent: { ...ev.invitationsSent, [gid]: how } })
  const text = encodeURIComponent(
    `მოგესალმებით! გეპატიჟებით: ${ev.name || 'ჩვენი ზეიმი'} · ${ev.date || ''} ${ev.time || ''}. დეტალები მოსაწვევში — Chill & Marry`)
  return (
    <Sect id="s-invitations" title={SECTION_TITLES.invitations} done={done} delay={delay}
      note="სტუმრები ავტომატურად ემატებიან — გააგზავნეთ ელფოსტით ან ტელეფონით (არასავალდებულო)">
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap' }}>
        <MiniInvite ev={ev} />
        <Link to={`/invitations?event=${ev.id}`} className="btn btn-ghost">მოსაწვევის დიზაინის რედაქტირება →</Link>
      </div>
      {ev.guests.length === 0 && <p className="muted">დაამატეთ სტუმრები «სტუმრების» სექციაში.</p>}
      {ev.guests.map((g) => (
        <div key={g.id} className="obj-row" style={{ borderBottom: '1px solid var(--linen)' }}>
          <span>{g.name} {ev.invitationsSent[g.id] && <span className="badge">გაგზავნილია ✓</span>}</span>
          <span style={{ display: 'flex', gap: 6 }}>
            {g.email && (
              <a className="chip-btn" style={{ textDecoration: 'none' }} onClick={() => markSent(g.id, 'email')}
                href={`mailto:${g.email}?subject=${encodeURIComponent('მოსაწვევი — ' + (ev.name || 'Chill & Marry'))}&body=${text}`}>
                ელფოსტით
              </a>
            )}
            {g.phone && (
              <a className="chip-btn" style={{ textDecoration: 'none' }} onClick={() => markSent(g.id, 'sms')}
                href={`sms:${g.phone}?body=${text}`}>
                SMS
              </a>
            )}
          </span>
        </div>
      ))}
    </Sect>
  )
}

/* ---------------- dress ---------------- */
const SALON_DRESS = { 'ds-bridal': 'aline', 'ds-atelier': 'mermaid', 'ds-rent': 'rent' }
function DressSection({ ev, update, done, delay }) {
  const setD = (patch) => update({ dress: { ...ev.dress, ...patch } })
  const upload = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setD({ ref: r.result })
    r.readAsDataURL(f)
  }
  const send = () => {
    setD({ sent: true })
    const body = encodeURIComponent(`კაბის ინდივიდუალური დიზაინი — Chill & Marry\nღონისძიება: ${ev.name} · ${ev.date}\nაღწერა: ${ev.dress.note || '—'}\n(რეფერენს-ფოტო მიმაგრებულია პლატფორმაზე)`)
    window.location.href = `mailto:designers@chillandmarry.ge?subject=კაბის დიზაინი&body=${body}`
  }
  return (
    <Sect id="s-dress" title={SECTION_TITLES.dress} done={done} delay={delay}>
      <div className="tool-row" style={{ marginBottom: 12 }}>
        <Chip on={ev.dress.mode === 'salon'} onClick={() => setD({ mode: 'salon' })}>სალონიდან არჩევა</Chip>
        <Chip on={ev.dress.mode === 'custom'} onClick={() => setD({ mode: 'custom' })}>საკუთარი დიზაინი</Chip>
      </div>
      {ev.dress.mode === 'salon' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
          {DRESS_SALONS.map((s2) => (
            <button key={s2.id} className={`pick-card ${ev.dress.salonId === s2.id ? 'on' : ''}`}
              onClick={() => setD({ salonId: s2.id })}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <DressSVG kind={SALON_DRESS[s2.id]} />
                <div>
                  <strong>{s2.name}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{s2.range}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {ev.dress.mode === 'custom' && (
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ width: 160 }}>
            {ev.dress.ref
              ? <img src={ev.dress.ref} alt="რეფერენსი" style={{ width: '100%', borderRadius: 12, border: '1.5px solid var(--sand)' }} />
              : <div style={{ border: '1.5px dashed var(--sand)', borderRadius: 12, aspectRatio: '3/4', display: 'grid', placeItems: 'center', fontSize: 30, color: 'var(--umber-soft)' }}>👗</div>}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="field">
              <label>რეფერენს-ფოტო</label>
              <input type="file" accept="image/*" onChange={upload} />
            </div>
            <div className="field">
              <label>აღწერა დიზაინერისთვის</label>
              <textarea rows="3" value={ev.dress.note} onChange={(e) => setD({ note: e.target.value })}
                placeholder="სილუეტი, ქსოვილი, მაქმანი, შლეიფი…" />
            </div>
            {ev.dress.sent
              ? <span className="badge" style={{ background: '#6F8F5E' }}>გაგზავნილია დიზაინერებთან ✓</span>
              : <button className="btn btn-primary" onClick={send} disabled={!ev.dress.ref && !ev.dress.note}>დიზაინერებთან გაგზავნა</button>}
          </div>
        </div>
      )}
    </Sect>
  )
}

/* ---------------- schedule ---------------- */
function ScheduleSection({ ev, update, delay }) {
  const [card, setCard] = useState(false)
  const svgRef = useRef(null)
  const set = (i, patch) => update({ schedule: ev.schedule.map((r, k) => (k === i ? { ...r, ...patch } : r)) })
  const move = (i, dir) => {
    const next = [...ev.schedule]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    update({ schedule: next })
  }
  const sendToGuests = () => {
    const lines = ev.schedule.map((r) => `${r.time} — ${r.title}`).join('\n')
    const emails = ev.guests.map((g) => g.email).filter(Boolean).join(',')
    window.location.href = `mailto:${emails}?subject=${encodeURIComponent('დღის განრიგი — ' + (ev.name || ''))}&body=${encodeURIComponent(lines)}`
  }
  const download = () => {
    const svg = svgRef.current
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = 800; c.height = 1120
      c.getContext('2d').drawImage(img, 0, 0, 800, 1120)
      const a = document.createElement('a')
      a.download = 'program.png'; a.href = c.toDataURL('image/png'); a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)))
  }
  const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.other
  const allActs = [...cfg.activities, ...Object.values(REGION_ACT).flat()]
  const existing = ev.schedule.map((r) => r.title)
  const sugg = []
  artists.filter((a) => ev.artistIds.includes(a.id)).forEach((a) => sugg.push(`${a.type === 'დიჯეი' ? '🎧' : '🎤'} ${a.name} — გამოსვლა`))
  allActs.filter((a) => ev.activityIds.includes(a.id)).forEach((a) => sugg.push(`🛥 ${a.name}`))
  if (ev.fireworksId) sugg.push('🎆 ფოიერვერკი')
  if (ev.cake) sugg.push('🎂 ტორტის გამოტანა')
  if (ev.type === 'wedding') sugg.push('💃 პირველი ცეკვა')
  const suggestions = sugg.filter((t) => !existing.includes(t))
  const lastTime = ev.schedule[ev.schedule.length - 1]?.time || '19:00'
  const nextTime = () => {
    const [h, m] = lastTime.split(':').map(Number)
    return `${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`
  }
  return (
    <Sect id="s-schedule" title={SECTION_TITLES.schedule} note="რა რის შემდეგ და რომელ საათზე" done={ev.schedule.length > 1} delay={delay}>
      {suggestions.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p className="muted" style={{ margin: '0 0 6px' }}>თქვენი არჩევანიდან — დააჭირეთ განრიგში დასამატებლად:</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {suggestions.map((t) => (
              <button key={t} className="chip-btn"
                onClick={() => update({ schedule: [...ev.schedule, { time: nextTime(), title: t }] })}>
                + {t}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="timeline">
        {ev.schedule.map((r, i) => (
          <div key={i} className="timeline-row">
            <input type="time" value={r.time} onChange={(e) => set(i, { time: e.target.value })} style={{ width: 110, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--sand)' }} />
            <input value={r.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="აქტივობა"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--sand)' }} />
            <button className="chip-btn" onClick={() => move(i, -1)}>↑</button>
            <button className="chip-btn" onClick={() => move(i, 1)}>↓</button>
            <button className="chip-btn" onClick={() => update({ schedule: ev.schedule.filter((_, k) => k !== i) })}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        <button className="btn btn-ghost" onClick={() => update({ schedule: [...ev.schedule, { time: '20:00', title: '' }] })}>+ პუნქტი</button>
        <button className="btn btn-ghost" onClick={() => setCard(!card)}>{card ? 'ბარათის დახურვა' : 'პროგრამის ბარათი'}</button>
        <button className="btn btn-primary" onClick={sendToGuests} disabled={!ev.guests.some((g) => g.email)}>გაგზავნა სტუმრებთან</button>
      </div>
      {card && (
        <div style={{ marginTop: 14, maxWidth: 340 }}>
          <svg ref={svgRef} viewBox="0 0 400 560" width="100%" style={{ border: '1px solid var(--linen)', borderRadius: 12 }}>
            <rect width="400" height="560" fill="#FAF7F2" />
            <rect x="16" y="16" width="368" height="528" fill="none" stroke="#C9A24B" strokeWidth="2" rx="8" />
            <text x="200" y="70" textAnchor="middle" fontFamily="'BPG Ninomtavruli', serif" fontSize="15" letterSpacing="5" fill="#C9A24B">დღის განრიგი</text>
            <text x="200" y="110" textAnchor="middle" fontFamily="'BPG Ninomtavruli', serif" fontSize="24" fontWeight="600" fill="#3A332C">{ev.name || ' '}</text>
            <text x="200" y="140" textAnchor="middle" fontFamily="'BPG Glaho', sans-serif" fontSize="13" fill="#8A7F72">{ev.date} · {ev.time}</text>
            {ev.schedule.slice(0, 11).map((r, i) => (
              <g key={i}>
                <text x="120" y={185 + i * 32} textAnchor="end" fontFamily="'BPG Glaho', sans-serif" fontSize="14" fontWeight="600" fill="#C9A24B">{r.time}</text>
                <text x="140" y={185 + i * 32} fontFamily="'BPG Glaho', sans-serif" fontSize="14" fill="#3A332C">{r.title}</text>
              </g>
            ))}
            <text x="200" y="530" textAnchor="middle" fontFamily="'BPG Ninomtavruli', serif" fontSize="12" letterSpacing="2" fill="#C9A24B">Chill &amp; Marry</text>
          </svg>
          <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={download}>ბარათის ჩამოტვირთვა (PNG)</button>
        </div>
      )}
    </Sect>
  )
}

/* ---------------- dance (optional, collapsible) ---------------- */
function DanceSection({ ev, update, delay }) {
  if (!ev.danceOpen) return (
    <div className="opt-closed" id="s-dance" style={{ scrollMarginTop: 120, animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 22 }}>💃</span>
        <div>
          <strong>საცეკვაო კურსი</strong>
          <p className="muted" style={{ margin: 0 }}>არასავალდებულო — მოემზადეთ პირველი ცეკვისთვის</p>
        </div>
      </div>
      <button className="btn btn-ghost" onClick={() => update({ danceOpen: true })}>+ დამატება</button>
    </div>
  )
  return (
    <Sect id="s-dance" title={SECTION_TITLES.dance} done={!!ev.danceId} delay={delay}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10, marginBottom: 10 }}>
        {DANCE_CLASSES.map((d) => (
          <button key={d.id} className={`pick-card ${ev.danceId === d.id ? 'on' : ''}`}
            onClick={() => update({ danceId: ev.danceId === d.id ? '' : d.id })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong>💃 {d.name}</strong>
              <strong style={{ color: 'var(--champagne)', whiteSpace: 'nowrap' }}>₾{d.price}</strong>
            </div>
            <span className="muted" style={{ fontSize: 12 }}>{d.studio}</span>
            <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{d.desc}</span>
          </button>
        ))}
      </div>
      {ev.danceId && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>პირველი გაკვეთილის თარიღი</label>
            <input type="date" value={ev.danceDate} onChange={(e) => update({ danceDate: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>დონე</label>
            <select value={ev.danceLevel || 'დამწყები'} onChange={(e) => update({ danceLevel: e.target.value })}>
              {['დამწყები', 'გვიცეკვია ცოტა', 'თავდაჯერებული'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
            <label>აღწერეთ სურვილები — სიმღერა, სტილი, სიურპრიზი…</label>
            <textarea rows="2" value={ev.danceNote || ''} onChange={(e) => update({ danceNote: e.target.value })} />
          </div>
        </div>
      )}
      <button className="chip-btn" style={{ marginTop: 8 }} onClick={() => update({ danceOpen: false, danceId: '', danceDate: '' })}>სექციის მოხსნა</button>
    </Sect>
  )
}

/* ---------------- menu (per-table from 3D) ---------------- */
function MenuSection({ ev, update, delay }) {
  const all = [...menuData.dishes, ...menuData.drinks]
  const tables = designTables(ev.venueId)
  const [ovTable, setOvTable] = useState('')
  const toggle = (mid) => update({
    menu: {
      ...ev.menu,
      items: ev.menu.items.includes(mid) ? ev.menu.items.filter((x) => x !== mid) : [...ev.menu.items, mid],
    },
  })
  const ov = ev.menu.tableOverrides[ovTable]
  const toggleOv = (mid) => {
    const cur = ev.menu.tableOverrides[ovTable] || ev.menu.items
    const next = cur.includes(mid) ? cur.filter((x) => x !== mid) : [...cur, mid]
    update({ menu: { ...ev.menu, tableOverrides: { ...ev.menu.tableOverrides, [ovTable]: next } } })
  }
  const perGuest = all.filter((m) => ev.menu.items.includes(m.id)).reduce((s, m) => s + m.price, 0)
  return (
    <Sect id="s-menu" title={SECTION_TITLES.menu} done={ev.menu.items.length > 0} delay={delay}
      note={`ერთ სტუმარზე: ₾${perGuest} · ${ev.guestsCount} სტუმარი = ₾${(perGuest * ev.guestsCount).toLocaleString()}`}>
      <h3 style={{ fontSize: 15, margin: '6px 0' }}>კერძები</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {menuData.dishes.map((m) => (
          <Chip key={m.id} on={ev.menu.items.includes(m.id)} onClick={() => toggle(m.id)}>{m.name} · ₾{m.price}</Chip>
        ))}
      </div>
      <h3 style={{ fontSize: 15, margin: '6px 0' }}>სასმელები</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {menuData.drinks.map((m) => (
          <Chip key={m.id} on={ev.menu.items.includes(m.id)} onClick={() => toggle(m.id)}>{m.name} · ₾{m.price}</Chip>
        ))}
      </div>
      {tables.length > 0 ? (
        <>
          <h3 style={{ fontSize: 15, margin: '6px 0' }}>ცალკეული მაგიდის მენიუ <span className="muted" style={{ fontWeight: 400 }}>· მაგიდები 3D დიზაინიდან</span></h3>
          <div className="tool-row" style={{ marginBottom: 8 }}>
            {tables.map((t) => (
              <Chip key={t.id} on={ovTable === String(t.no)} onClick={() => setOvTable(ovTable === String(t.no) ? '' : String(t.no))}>
                მაგიდა {t.no}{ev.menu.tableOverrides[t.no] ? ' ✎' : ''}
              </Chip>
            ))}
          </div>
          {ovTable && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {all.map((m) => (
                <Chip key={m.id} on={(ov || ev.menu.items).includes(m.id)} onClick={() => toggleOv(m.id)}>{m.name}</Chip>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="muted">🪑 მაგიდების ინდივიდუალური მენიუსთვის ჯერ 3D დიზაინში დაამატეთ მაგიდები.</p>
      )}
    </Sect>
  )
}

/* ---------------- budget ---------------- */
function BudgetSection({ ev, budget, delay }) {
  const [paying, setPaying] = useState(false)
  const [, force] = useState(0)
  const deposit = Math.round(budget.total * 0.2)
  const payments = JSON.parse(localStorage.getItem('cm_payments') || '[]').filter((p) => p.eventId === ev.id)
  const depositPaid = payments.some((p) => p.purpose.startsWith('დეპოზიტი'))
  return (
    <Sect id="s-budget" title={SECTION_TITLES.budget} note="ითვლება ავტომატურად ყველა არჩევანიდან" done={budget.rows.length > 0} delay={delay}>
      {budget.rows.length === 0 && <p className="muted">ჯერ არაფერია არჩეული.</p>}
      {budget.rows.map(([l, p], i) => <Row key={i} l={l} r={`₾${p.toLocaleString()}`} />)}
      <div className="obj-row" style={{ borderTop: '2px solid var(--champagne)', marginTop: 10, paddingTop: 10, fontWeight: 700, fontSize: 16 }}>
        <span>ჯამი</span><span>₾{budget.total.toLocaleString()}</span>
      </div>
      {payments.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {payments.map((p) => (
            <Row key={p.id} l={`✓ ${p.purpose}`} r={`₾${p.amount.toLocaleString()} · გადახდილია`} />
          ))}
        </div>
      )}
      {budget.total > 0 && !depositPaid && (
        <div className="viewer-bottom" style={{ marginTop: 14 }}>
          <span>ჯავშნის დასადასტურებლად — დეპოზიტი 20%</span>
          <button className="btn btn-primary" onClick={() => setPaying(true)}>₾{deposit.toLocaleString()} — გადახდა</button>
        </div>
      )}
      <PaymentModal open={paying} onClose={() => { setPaying(false); force((x) => x + 1) }} eventId={ev.id}
        purpose="დეპოზიტი 20%" amount={deposit} onPaid={() => force((x) => x + 1)} />
    </Sect>
  )
}

/* ================= EVENT HUB (one page) ================= */
export function EventPage() {
  const { id } = useParams()
  const { ev, update } = useEvent(id)
  if (!ev) return (
    <main className="container" style={{ padding: '90px 24px', textAlign: 'center' }}>
      <h1>ღონისძიება ვერ მოიძებნა</h1>
      <Link to="/my-events" className="btn btn-ghost" style={{ marginTop: 16 }}>ჩემი ღონისძიებები</Link>
    </main>
  )
  return <EventHub ev={ev} update={update} />
}

function EventHub({ ev, update }) {
  const ctx = useEventCtx(ev, update)
  const { cfg, budget, done } = ctx
  const typeMeta = EVENT_TYPES.find((t) => t.id === ev.type)
  const H = { draft: 'დრაფტი — ინახება ავტომატურად', planned: 'დაგეგმილი', steps: 'ნაბიჯ-ნაბიჯ რეჟიმი', budget: 'ბიუჯეტი', mark: 'დაგეგმილად მონიშვნა', back: 'დრაფტად დაბრუნება', untitled: 'ახალი ღონისძიება' }
  return (
    <main className="container" style={{ paddingTop: 30, paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <div>
          <div className="eyebrow">{typeMeta?.icon} {typeMeta?.name} · {ev.status === 'draft' ? H.draft : H.planned}</div>
          <h1>{ev.name || H.untitled}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to={`/event/${ev.id}/setup`} className="btn btn-ghost">{H.steps}</Link>
          <span className="badge">{H.budget}: ₾{budget.total.toLocaleString()}</span>
          <button className="btn btn-primary" onClick={() => update({ status: ev.status === 'draft' ? 'planned' : 'draft' })}>
            {ev.status === 'draft' ? H.mark : H.back}
          </button>
        </div>
      </div>



      {cfg.sections.map((s, i) => renderSection(s, ev, update, ctx, Math.min(i * 60, 400)))}
    </main>
  )
}

/* ================= WIZARD (step by step) ================= */
export function EventWizard() {
  const { id } = useParams()
  const { ev, update } = useEvent(id)
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [visited, setVisited] = useState({ 0: true })
  if (!ev) return (
    <main className="container" style={{ padding: '90px 24px', textAlign: 'center' }}>
      <h1>ღონისძიება ვერ მოიძებნა</h1>
      <Link to="/my-events" className="btn btn-ghost" style={{ marginTop: 16 }}>ჩემი ღონისძიებები</Link>
    </main>
  )
  return <WizardInner ev={ev} update={update} step={step} setStep={setStep}
    visited={visited} setVisited={setVisited} navigate={navigate} />
}

function WizardInner({ ev, update, step, setStep, visited, setVisited, navigate }) {
  const ctx = useEventCtx(ev, update)
  const { cfg, done } = ctx
  const W = { step: 'ნაბიჯი', back: '← უკან', full: 'სრულ გვერდზე გადასვლა', next: 'შემდეგი →', finish: 'დასრულება ✓', untitled: 'ახალი ღონისძიება' }
  const steps = cfg.sections
  const typeMeta = EVENT_TYPES.find((t) => t.id === ev.type)
  const cur = steps[step]
  const go = (i) => {
    if (i < 0) return
    if (i >= steps.length) { navigate(`/event/${ev.id}`); return }
    setVisited((v) => ({ ...v, [i]: true }))
    setStep(i)
    window.scrollTo(0, 0)
  }
  const stateOf = (i) => {
    if (i === step) return 'current'
    if (done[steps[i]]) return 'done'
    if (visited[i]) return 'draft'
    return ''
  }
  return (
    <main className="container" style={{ paddingTop: 30, paddingBottom: 80, maxWidth: 900 }}>
      <div className="eyebrow">{typeMeta?.icon} {typeMeta?.name} · {W.step} {step + 1} / {steps.length}</div>
      <h1>{ev.name || W.untitled}</h1>

      <div className="wiz-dots">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className={`wiz-line ${done[steps[i - 1]] ? 'fill' : ''}`} />}
            <button className={`wiz-step ${stateOf(i)}`} onClick={() => go(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="wiz-dot">{done[s] ? '✓' : i + 1}</div>
              <div className="wiz-label">{SECTION_TITLES[s]}</div>
            </button>
          </React.Fragment>
        ))}
      </div>

      {renderSection(cur, ev, update, ctx, 0)}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={() => go(step - 1)} disabled={step === 0}>{W.back}</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/event/${ev.id}`} className="btn btn-ghost">{W.full}</Link>
          <button className="btn btn-primary" onClick={() => go(step + 1)}>
            {step === steps.length - 1 ? W.finish : W.next}
          </button>
        </div>
      </div>
    </main>
  )
}
