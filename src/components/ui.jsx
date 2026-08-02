import React, { createContext, useContext, useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

/* One-line flower mark — the brand signature */
/* GitHub Pages-safe public asset path */
export const asset = (p) => import.meta.env.BASE_URL + String(p || '').replace(/^\//, '')

export function FlowerMark({ size = 34, color = 'var(--umber)' }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 120 150" fill="none" aria-hidden="true">
      <path
        d="M62 62 C48 46 51 22 62 12 C73 22 76 46 62 62 M62 62 C46 56 34 42 34 28 M62 62 C78 56 90 44 92 30 M62 62 C56 78 44 88 40 92 C36 96 40 100 46 97 C52 94 58 98 60 106 C63 118 62 132 58 142"
        stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="92" cy="26" r="4" fill="var(--champagne)" />
    </svg>
  )
}



const NAV_T = {
  ka: { home: 'მთავარი', venues: 'დარბაზები', companies: 'კომპანიები', artists: 'არტისტები', gallery: 'გალერეა', events: 'ჩემი ღონისძიებები', login: 'შესვლა', logout: 'გასვლა' },
  en: { home: 'Home', venues: 'Venues', companies: 'Companies', artists: 'Artists', gallery: 'Gallery', events: 'My Events', login: 'Sign in', logout: 'Sign out' },
}

export function Header() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('cm_user') || 'null')
  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand">
          <FlowerMark size={26} />
          <span className="brand-name">Chill <span className="amp">&amp;</span> Marry</span>
        </Link>
        <nav className="main-nav">
          <NavLink to="/">მთავარი</NavLink>
          <NavLink to="/venues">დარბაზები</NavLink>
          <NavLink to="/companies">კომპანიები</NavLink>
          <NavLink to="/artists">არტისტები</NavLink>
          <NavLink to="/gallery">გალერეა</NavLink>
          <NavLink to="/my-events">ჩემი ღონისძიებები</NavLink>
          {user ? (
            <button className="btn btn-ghost" onClick={() => { localStorage.removeItem('cm_user'); navigate('/') }}>
              {user.name} · გასვლა
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary">შესვლა</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div style={{ maxWidth: 280 }}>
            <div className="brand" style={{ marginBottom: 10 }}>
              <FlowerMark size={22} color="var(--linen)" />
              <span className="brand-name" style={{ color: 'var(--ivory)' }}>
                Chill <span className="amp">&amp;</span> Marry
              </span>
            </div>
            <p style={{ color: 'var(--sand)' }}>
              დაგეგმეთ, ნახეთ 3D-ში და დაჯავშნეთ თქვენი ღონისძიება — ერთ სივრცეში.
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--ivory)', marginBottom: 10 }}>ნავიგაცია</h3>
            <p><Link to="/venues">დარბაზები</Link></p>
            <p><Link to="/companies">საივენთო კომპანიები</Link></p>
            <p><Link to="/event/new">ღონისძიების შექმნა</Link></p>
            <p><Link to="/invitations">მოსაწვევები</Link></p>
          </div>
          <div>
            <h3 style={{ color: 'var(--ivory)', marginBottom: 10 }}>კონტაქტი</h3>
            <p>hello@chillandmarry.ge</p>
            <p>+995 555 00 00 00</p>
            <p>თბილისი, საქართველო</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(217,203,184,0.25)', paddingTop: 18, color: 'var(--sand)' }}>
          © 2026 Chill &amp; Marry
        </div>
      </div>
    </footer>
  )
}

export function Stepper({ active = 1 }) {
  const steps = ['დარბაზის არჩევა', '3D კონფიგურაცია', 'მოთხოვნის გაგზავნა']
  return (
    <div className="stepper" role="list" aria-label="პროცესის ნაბიჯები">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          {i > 0 && <div className="step-line" aria-hidden="true" />}
          <div role="listitem" className={`step ${i + 1 <= active ? 'active' : ''}`}>
            <span className="dot">{i + 1}</span> {label}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export function VenueCard({ venue }) {
  return (
    <article className="card">
      <div className="photo" style={{ background: `linear-gradient(135deg, ${venue.hue}, ${venue.hue}CC)`, position: 'relative', overflow: 'hidden' }}>
        {venue.photos?.[0] && <img src={asset(venue.photos[0])} alt={venue.name} loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        {venue.has3d && <span className="badge tag">3D · 360°</span>}
        <span>{venue.name}</span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <h3>{venue.name}</h3>
        <p style={{ fontSize: 13, color: 'var(--umber-soft)' }}>
          {venue.capacity} სტუმარი · {venue.district}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ color: 'var(--champagne)', fontSize: 13 }}>★ {venue.rating} · {venue.reviews}</span>
          <strong>₾{venue.price.toLocaleString()}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Link to={`/venues/${venue.id}`} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
            დეტალები
          </Link>
          {venue.has3d && (
            <Link to={`/venues/${venue.id}/3d`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              3D-ში ნახვა
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
