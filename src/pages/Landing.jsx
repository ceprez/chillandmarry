import React from 'react'
import { Link } from 'react-router-dom'
import { FlowerMark } from '../components/ui.jsx'
import venues from '../data/venues.json'
import companies from '../data/companies.json'
import { VenueCard } from '../components/ui.jsx'



const REVIEWS = [
  { name: 'ნინო კ.', text: 'ქორწილამდე ორი თვით ადრე უკვე „ვნახეთ" ჩვენი დარბაზი. დეკორაცია ზუსტად ისეთი აღმოჩნდა, როგორც 3D-ში.' },
  { name: 'გიორგი მ.', text: 'ბიუჯეტის მთვლელმა გვიშველა — რეალურ დროში ვხედავდით, რაში ვიხდიდით.' },
  { name: 'თამარ ბ.', text: 'მოსაწვევები და RSVP ერთ ადგილას — სტუმრების ორგანიზება პირველად იყო მარტივი.' },
]

export default function Landing() {
  const STEPS = [
    { n: '1', t: 'აირჩიეთ დარბაზი', d: 'დაათვალიერეთ დარბაზები ფოტოებით, ტევადობითა და ფასებით.' },
    { n: '2', t: 'მოირთეთ 3D-ში', d: 'განათავსეთ დეკორაციები, შეცვალეთ ფერები და ზომები — ნახეთ შედეგი წინასწარ.' },
    { n: '3', t: 'დაგეგმეთ ყველა დეტალი აქვე', d: 'სტუმრები და დასაჯდომები, მოსაწვევები, ტორტი, მენიუ, ტრანსფერი, სასტუმრო, განრიგი და ბიუჯეტი — ღონისძიების დასაგეგმად ჩვენი პლატფორმის გარდა არაფერი დაგჭირდებათ.' },
  ]
  return (
    <main>
      {/* hero */}
      <section className="section" style={{ paddingTop: 90 }}>
        <div className="container" style={{ display: 'flex', gap: 50, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 460px' }}>
            <h1>Think your event<br />out loud</h1>
            <p style={{ margin: '18px 0 28px', maxWidth: 520, color: 'var(--umber-soft)' }}>
              ღონისძიების დაგეგმვის სრული ციკლი ერთ პლატფორმაზე: შექმენით თქვენი ზეიმის ინტერაქტიული 3D მოდელი და აქვე მართეთ ყველაფერი დანარჩენი — დარბაზი, საივენთო კომპანიები, არტისტები, სტუმრები და მოსაწვევები, ტორტი, მენიუ, განრიგი და ბიუჯეტი. ყველაფერი ერთ სივრცეში.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/my-events" className="btn btn-primary">დაიწყეთ დაგეგმვა</Link>
              <Link to="/companies" className="btn btn-ghost">საივენთო კომპანიები</Link>
            </div>
          </div>
          <div style={{ flex: '0 0 auto', margin: '0 auto' }}>
            <FlowerMark size={150} />
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="section section-alt">
        <div className="container">
          <div className="eyebrow">როგორ მუშაობს</div>
          <h2 style={{ marginBottom: 30 }}>ოთხი ნაბიჯი სრულყოფილ ღონისძიებამდე</h2>
          <div className="grid grid-4">
            {STEPS.map((s) => (
              <div key={s.n} style={{ background: '#fff', borderRadius: 14, padding: '22px 20px', border: '1px solid var(--sand)' }}>
                <div style={{ fontFamily: 'var(--latin-serif)', fontSize: 34, color: 'var(--champagne)' }}>{s.n}</div>
                <h3 style={{ margin: '6px 0 8px' }}>{s.t}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--umber-soft)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* companies */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">პარტნიორები</div>
          <h2 style={{ marginBottom: 30 }}>საივენთო კომპანიები</h2>
          <div className="grid grid-3">
            {companies.map((c) => (
              <Link key={c.id} to={`/companies/${c.id}`} className="card">
                <div className="photo" style={{ background: `linear-gradient(135deg, ${c.hue}, ${c.hue}CC)`, aspectRatio: '16/8', position: 'relative', overflow: 'hidden' }}>
                  {c.photo && <img src={c.photo} alt={c.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <h3>{c.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--umber-soft)' }}>{c.styles}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--champagne)' }}>★ {c.rating}</span>
                    <span>{c.range}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* venues preview */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="eyebrow">სივრცეები</div>
              <h2>პოპულარული დარბაზები</h2>
            </div>
            <Link to="/venues" style={{ color: 'var(--champagne)', fontWeight: 600 }}>ყველა დარბაზის ნახვა →</Link>
          </div>
          <div className="grid grid-3" style={{ marginTop: 26 }}>
            {venues.slice(0, 3).map((v) => <VenueCard key={v.id} venue={v} />)}
          </div>
        </div>
      </section>

      {/* testimonials */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">შეფასებები</div>
          <h2 style={{ marginBottom: 26 }}>რას ამბობენ წყვილები</h2>
          <div className="grid grid-3">
            {REVIEWS.map((r) => (
              <blockquote key={r.name} style={{ background: '#fff', border: '1px solid var(--linen)', borderRadius: 14, padding: 22 }}>
                <p style={{ fontSize: 14 }}>&ldquo;{r.text}&rdquo;</p>
                <footer style={{ marginTop: 12, color: 'var(--champagne)', fontWeight: 600, fontSize: 13 }}>— {r.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
