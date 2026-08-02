import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { asset, Stepper, VenueCard, FlowerMark } from '../components/ui.jsx'
import venues from '../data/venues.json'

/* ---------- Auth ---------- */
export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const submit = (ev) => {
    ev.preventDefault()
    localStorage.setItem('cm_user', JSON.stringify({ name: email.split('@')[0] || 'სტუმარი', email }))
    navigate('/venues')
  }
  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <FlowerMark size={40} />
          <h2 style={{ marginTop: 8 }}>შესვლა</h2>
        </div>
        <div className="field">
          <label htmlFor="email">ელფოსტა</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nino@example.com" />
        </div>
        <div className="field">
          <label htmlFor="pass">პაროლი</label>
          <input id="pass" type="password" required placeholder="••••••••" />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>შესვლა</button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--umber-soft)' }}>
          არ გაქვთ ანგარიში? <Link to="/register" style={{ color: 'var(--champagne)' }}>რეგისტრაცია</Link>
        </p>
      </form>
    </div>
  )
}

export function Register() {
  const navigate = useNavigate()
  const submit = (ev) => {
    ev.preventDefault()
    const data = new FormData(ev.target)
    localStorage.setItem('cm_user', JSON.stringify({ name: data.get('name'), email: data.get('email') }))
    navigate('/venues')
  }
  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <FlowerMark size={40} />
          <h2 style={{ marginTop: 8 }}>რეგისტრაცია</h2>
        </div>
        <div className="field">
          <label htmlFor="name">სახელი</label>
          <input id="name" name="name" required placeholder="ნინო" />
        </div>
        <div className="field">
          <label htmlFor="remail">ელფოსტა</label>
          <input id="remail" name="email" type="email" required placeholder="nino@example.com" />
        </div>
        <div className="field">
          <label htmlFor="rpass">პაროლი</label>
          <input id="rpass" type="password" required placeholder="მინ. 8 სიმბოლო" />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>ანგარიშის შექმნა</button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--umber-soft)' }}>
          უკვე გაქვთ ანგარიში? <Link to="/login" style={{ color: 'var(--champagne)' }}>შესვლა</Link>
        </p>
      </form>
    </div>
  )
}

/* ---------- Venue catalog ---------- */
export function VenueCatalog() {
  const [district, setDistrict] = useState('all')
  const [maxPrice, setMaxPrice] = useState(6000)
  const [query, setQuery] = useState('')

  const districts = useMemo(() => ['all', ...new Set(venues.map((v) => v.district))], [])
  const filtered = venues.filter((v) =>
    (district === 'all' || v.district === district) &&
    v.price <= maxPrice &&
    v.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div className="eyebrow">ნაბიჯი 1 / 3</div>
      <h1>აირჩიეთ დარბაზი</h1>
      <Stepper active={1} />

      <div className="info-banner">
        აირჩიეთ დარბაზი ან დაიწყეთ ცარიელი სივრცით → მოირთეთ 3D-ში → გააგზავნეთ მოთხოვნა საივენთო კომპანიასთან.
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '18px 0 26px' }}>
        <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
          <label htmlFor="q">ძიება</label>
          <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="დარბაზის სახელი…" />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="d">უბანი</label>
          <select id="d" value={district} onChange={(e) => setDistrict(e.target.value)}>
            {districts.map((d) => <option key={d} value={d}>{d === 'all' ? 'ყველა უბანი' : d}</option>)}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0, minWidth: 220 }}>
          <label htmlFor="p">მაქს. ფასი — ₾{maxPrice.toLocaleString()}</label>
          <input id="p" type="range" min="2000" max="6000" step="200" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
        </div>
      </div>

      <div className="grid grid-3">
        {/* blank floor option */}
        <Link to="/venues/blank/3d" className="card" style={{ display: 'grid', placeItems: 'center', minHeight: 300, border: '2px dashed var(--sand)', background: 'var(--linen)', textAlign: 'center', padding: 24 }}>
          <div>
            <div style={{ fontSize: 40, color: 'var(--champagne)', fontFamily: 'var(--latin-serif)' }}>+</div>
            <h3>ცარიელი სივრცით დაწყება</h3>
            <p style={{ fontSize: 13, color: 'var(--umber-soft)', marginTop: 6 }}>
              ააწყვეთ თქვენი ღონისძიება ნულიდან — შემდეგ მოარგეთ ნებისმიერ დარბაზს
            </p>
          </div>
        </Link>
        {filtered.map((v) => <VenueCard key={v.id} venue={v} />)}
      </div>
      {filtered.length === 0 && (
        <p style={{ marginTop: 30, color: 'var(--umber-soft)' }}>
          ამ ფილტრებით დარბაზი ვერ მოიძებნა — სცადეთ ფასის გაზრდა ან სხვა უბანი.
        </p>
      )}
    </main>
  )
}

/* ---------- Venue detail ---------- */
export function VenueDetail() {
  const { id } = useParams()
  const venue = venues.find((v) => v.id === id)
  if (!venue) return <StubPage title="დარბაზი ვერ მოიძებნა" note="დაბრუნდით კატალოგში და სცადეთ თავიდან." />
  return (
    <main className="container" style={{ paddingTop: 34, paddingBottom: 60 }}>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 460px' }}>
          <div className="photo" style={{ background: `linear-gradient(135deg, ${venue.hue}, ${venue.hue}CC)`, borderRadius: 16, aspectRatio: '16/10', position: 'relative', overflow: 'hidden' }}>
            {venue.photos?.[0] && <img src={asset(venue.photos[0])} alt={venue.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            {venue.has3d && <span className="badge tag">3D · 360°</span>}
            <span>{venue.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="photo" style={{ flex: 1, aspectRatio: '4/3', borderRadius: 10, background: `${venue.hue}${['E6', 'B3', '80'][i - 1]}`, position: 'relative', overflow: 'hidden' }}>
                {venue.photos?.[i - 1] && <img src={asset(venue.photos[i - 1])} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: '1 1 320px' }}>
          <div className="eyebrow">{venue.district} · თბილისი</div>
          <h1>{venue.name}</h1>
          <p style={{ color: 'var(--champagne)', margin: '8px 0' }}>★ {venue.rating} · {venue.reviews} შეფასება</p>
          <p style={{ fontSize: 26, fontFamily: 'var(--serif)', margin: '10px 0' }}>₾{venue.price.toLocaleString()} <span style={{ fontSize: 14, color: 'var(--umber-soft)' }}>/ საღამო</span></p>
          <p style={{ color: 'var(--umber-soft)' }}>{venue.capacity} სტუმრამდე</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0 24px' }}>
            {venue.amenities.map((a) => <span key={a} className="badge badge-soft">{a}</span>)}
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {venue.has3d && <Link to={`/venues/${venue.id}/3d`} className="btn btn-primary" style={{ justifyContent: 'center' }}>3D-ში ნახვა და მორთვა</Link>}
            <Link to={`/request?venue=${venue.id}`} className="btn btn-ghost" style={{ justifyContent: 'center' }}>მოთხოვნის გაგზავნა</Link>
            <Link to="/venues" style={{ textAlign: 'center', fontSize: 13, color: 'var(--umber-soft)' }}>← უკან კატალოგში</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ---------- Stub for pages arriving in the next rounds ---------- */
export function StubPage({ title, note }) {
  return (
    <main className="stub-page">
      <div className="flower"><FlowerMark size={54} /></div>
      <h1>{title}</h1>
      <p style={{ color: 'var(--umber-soft)', maxWidth: 460, margin: '12px auto 26px' }}>
        {note || 'ეს გვერდი მშენებლობის შემდეგ ეტაპზეა — ნავიგაცია და დიზაინ-სისტემა უკვე მზადაა.'}
      </p>
      <Link to="/" className="btn btn-ghost">მთავარზე დაბრუნება</Link>
    </main>
  )
}
