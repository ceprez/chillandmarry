import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

/* ---------- bookings + availability helpers ---------- */
export function getBookings() {
  return JSON.parse(localStorage.getItem('cm_bookings') || '[]')
}
export function isFreeOn(entity, dateStr) {
  if (entity.busyDates?.includes(dateStr)) return false
  return !getBookings().some((b) => b.entityId === entity.id && b.date === dateStr)
}

/* ---------- month calendar ---------- */
const KA_MONTHS = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი']
const KA_DAYS = ['ორ', 'სა', 'ოთ', 'ხუ', 'პა', 'შა', 'კვ']

export function BookingCalendar({ entity, onBook }) {
  const [ym, setYm] = useState({ y: 2026, m: 7 }) // August 2026 (0-based month)
  const bookings = getBookings().filter((b) => b.entityId === entity.id)
  const first = new Date(ym.y, ym.m, 1)
  const startIdx = (first.getDay() + 6) % 7
  const daysIn = new Date(ym.y, ym.m + 1, 0).getDate()
  const cells = [...Array(startIdx).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)]
  const dateStr = (d) => `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button className="chip-btn" onClick={() => setYm((c) => c.m === 0 ? { y: c.y - 1, m: 11 } : { ...c, m: c.m - 1 })}>←</button>
        <strong>{KA_MONTHS[ym.m]} {ym.y}</strong>
        <button className="chip-btn" onClick={() => setYm((c) => c.m === 11 ? { y: c.y + 1, m: 0 } : { ...c, m: c.m + 1 })}>→</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, fontSize: 12 }}>
        {KA_DAYS.map((d) => <div key={d} style={{ textAlign: 'center', color: 'var(--umber-soft)', fontWeight: 600 }}>{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={'e' + i} />
          const ds = dateStr(d)
          const busy = entity.busyDates?.includes(ds)
          const mine = bookings.some((b) => b.date === ds)
          return (
            <button key={ds} disabled={busy || mine}
              onClick={() => onBook(ds)}
              title={busy ? 'დაკავებულია' : mine ? 'თქვენ დაჯავშნეთ' : 'დაჯავშნა'}
              style={{
                aspectRatio: '1', borderRadius: 8, border: '1px solid var(--linen)', cursor: busy || mine ? 'default' : 'pointer',
                background: busy ? '#F3D8D2' : mine ? 'var(--champagne)' : '#fff',
                color: busy ? '#C05B45' : mine ? 'var(--ivory)' : 'var(--umber)',
                fontWeight: mine ? 700 : 400, fontSize: 12,
              }}>{d}</button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11.5, color: 'var(--umber-soft)' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#F3D8D2', borderRadius: 3, marginRight: 4 }} />დაკავებული</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--champagne)', borderRadius: 3, marginRight: 4 }} />თქვენი ჯავშანი</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#fff', border: '1px solid var(--linen)', borderRadius: 3, marginRight: 4 }} />თავისუფალი</span>
      </div>
    </div>
  )
}

/* ---------- generic catalog ---------- */
export function DirectoryPage({ title, eyebrow, data, basePath, priceLabel }) {
  const types = useMemo(() => ['ყველა', ...new Set(data.map((d) => d.type))], [data])
  const [type, setType] = useState('ყველა')
  const list = data.filter((d) => type === 'ყველა' || d.type === type)
  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '18px 0 26px' }}>
        {types.map((t) => (
          <button key={t} className={`chip-btn ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>
      <div className="grid grid-3">
        {list.map((d) => (
          <Link key={d.id} to={`${basePath}/${d.id}`} className="card">
            <div className="photo" style={{ background: `linear-gradient(135deg, ${d.hue}, ${d.hue}CC)`, aspectRatio: '16/9' }}>
              <span>{d.name}</span>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <h3>{d.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--umber-soft)' }}>{d.genre || d.styles}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--champagne)' }}>★ {d.rating} · {d.reviews}</span>
                <strong>{d.range || (d.priceKg ? `₾${d.priceKg}/კგ` : `₾${d.price?.toLocaleString()}`)}</strong>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

/* ---------- generic profile with booking ---------- */
export function ProfilePage({ data, basePath, backLabel, extraActions }) {
  const { id } = useParams()
  const entity = data.find((d) => d.id === id)
  const [booked, setBooked] = useState(null)
  if (!entity) return (
    <main className="container" style={{ padding: '90px 24px', textAlign: 'center' }}>
      <h1>პროფილი ვერ მოიძებნა</h1>
      <Link to={basePath} className="btn btn-ghost" style={{ marginTop: 18 }}>{backLabel}</Link>
    </main>
  )
  const book = (date) => {
    const all = getBookings()
    localStorage.setItem('cm_bookings', JSON.stringify([...all, {
      entityId: entity.id, entityName: entity.name, date, createdAt: Date.now(),
    }]))
    setBooked(date)
  }
  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 440px' }}>
          <div className="eyebrow">{entity.type}</div>
          <h1>{entity.name}</h1>
          <p style={{ color: 'var(--champagne)', margin: '8px 0' }}>★ {entity.rating} · {entity.reviews} შეფასება</p>
          <p style={{ color: 'var(--umber-soft)', maxWidth: 560 }}>{entity.desc || entity.genre}</p>
          {entity.services && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0' }}>
              {entity.services.map((s) => <span key={s} className="badge badge-soft">{s}</span>)}
            </div>
          )}
          <p style={{ fontSize: 22, fontFamily: 'var(--serif)', margin: '12px 0' }}>
            {entity.range || (entity.priceKg ? `₾${entity.priceKg} / კგ` : `₾${entity.price?.toLocaleString()} / ღონისძიება`)}
          </p>
          <div className="photo" style={{ background: `linear-gradient(135deg, ${entity.hue}, ${entity.hue}CC)`, borderRadius: 14, aspectRatio: '16/8', margin: '14px 0' }}>
            <span>{entity.name} — პორტფოლიო</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {[0.9, 0.7, 0.5].map((a) => (
              <div key={a} className="photo" style={{ flex: 1, aspectRatio: '4/3', borderRadius: 10, background: entity.hue + Math.round(a * 255).toString(16) }} />
            ))}
          </div>
          {extraActions && <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>{extraActions(entity)}</div>}
        </div>
        <div style={{ flex: '1 1 320px', maxWidth: 420 }}>
          <h3 style={{ marginBottom: 10 }}>კალენდარი და დაჯავშნა</h3>
          {booked ? (
            <div className="card" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--champagne)', color: 'var(--ivory)', display: 'grid', placeItems: 'center', fontSize: 22, margin: '0 auto 12px' }}>✓</div>
              <h3>დაჯავშნილია — {booked}</h3>
              <p className="muted" style={{ margin: '8px 0 14px' }}>{entity.name} მიიღებს შეტყობინებას და დაგიკავშირდებათ დასადასტურებლად.</p>
              <button className="btn btn-ghost" onClick={() => setBooked(null)}>სხვა თარიღის დამატება</button>
            </div>
          ) : (
            <BookingCalendar entity={entity} onBook={book} />
          )}
          <Link to={basePath} style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--umber-soft)' }}>
            ← {backLabel}
          </Link>
        </div>
      </div>
    </main>
  )
}
