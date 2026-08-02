import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header, Footer } from './components/ui.jsx'
import Landing from './pages/Landing.jsx'
import { Login, Register, VenueCatalog, VenueDetail, StubPage } from './pages/core.jsx'
import { DirectoryPage, ProfilePage, isFreeOn } from './pages/directory.jsx'
import { Invitations, Gallery, CakeBuilder } from './pages/creative.jsx'
import { MyEvents, EventPage, EventWizard } from './pages/events.jsx'
import companiesData from './data/companies.json'
import artistsData from './data/artists.json'
import crewsData from './data/crews.json'
import cakeshopsData from './data/cakeshops.json'
import { Link } from 'react-router-dom'
const Viewer3D = lazy(() => import('./pages/viewer.jsx').then((m) => ({ default: m.Viewer3D })))
const DecoratedPreview = lazy(() => import('./pages/viewer.jsx').then((m) => ({ default: m.DecoratedPreview })))
const Customize = lazy(() => import('./pages/viewer.jsx').then((m) => ({ default: m.Customize })))
const RequestForm = lazy(() => import('./pages/viewer.jsx').then((m) => ({ default: m.RequestForm })))

const Loading = () => (
  <div style={{ padding: '110px 24px', textAlign: 'center', color: 'var(--umber-soft)' }}>
    3D სივრცე იტვირთება…
  </div>
)

export default function App() {
  return (
    <>
      <Header />
      <Suspense fallback={<Loading />}>
      <Routes>
        {/* built in this round */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/venues" element={<VenueCatalog />} />
        <Route path="/venues/:id" element={<VenueDetail />} />

        {/* rounds 2–4: full spec routes wired and awaiting their builds */}
        <Route path="/venues/:id/3d" element={<Viewer3D />} />
        <Route path="/venues/:id/3d/decorated" element={<DecoratedPreview />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/request-form" element={<RequestForm />} />
        <Route path="/request" element={<StubPage title="მოთხოვნის გაგზავნა" note="პირდაპირი მოთხოვნა დარბაზთან." />} />
        <Route path="/companies" element={<DirectoryPage title="საივენთო კომპანიები" eyebrow="პარტნიორები" data={companiesData} basePath="/companies" />} />
        <Route path="/companies/:id" element={<ProfilePage data={companiesData} basePath="/companies" backLabel="ყველა კომპანია"
          extraActions={(e) => (<>
            <Link to="/customize" className="btn btn-primary">3D დეკორაციების ნახვა</Link>
            <Link to="/request-form" className="btn btn-ghost">მოთხოვნის გაგზავნა</Link>
          </>)} />} />
        <Route path="/artists" element={<DirectoryPage title="არტისტები" eyebrow="დიჯეი · ორკესტრი · მომღერალი · მოცეკვავეები" data={artistsData} basePath="/artists" />} />
        <Route path="/artists/:id" element={<ProfilePage data={artistsData} basePath="/artists" backLabel="ყველა არტისტი" />} />
        <Route path="/crews" element={<DirectoryPage title="გადამღები ჯგუფები" eyebrow="ფოტოგრაფები · ვიდეოგრაფები" data={crewsData} basePath="/crews" />} />
        <Route path="/crews/:id" element={<ProfilePage data={crewsData} basePath="/crews" backLabel="ყველა ჯგუფი" />} />
        <Route path="/cakeshops" element={<DirectoryPage title="საკონდიტროები" eyebrow="ტორტები და დესერტები" data={cakeshopsData} basePath="/cakeshops" />} />
        <Route path="/cakeshops/:id" element={<ProfilePage data={cakeshopsData} basePath="/cakeshops" backLabel="ყველა საკონდიტრო"
          extraActions={() => (<Link to="/cake-builder" className="btn btn-primary">ტორტის კონსტრუქტორი →</Link>)} />} />
        <Route path="/cake-builder" element={<CakeBuilder />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/event/new" element={<MyEvents />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/event/:id/setup" element={<EventWizard />} />
        <Route path="/budget" element={<StubPage title="ბიუჯეტის კალკულატორი" note="კატეგორიები, ჯამები, რეალურ დროში დათვლა." />} />
        <Route path="/invitations" element={<Invitations />} />
        <Route path="/guests" element={<StubPage title="სტუმრების სია" note="RSVP სტატუსები და დიეტური მოთხოვნები." />} />
        <Route path="/rsvp/:eventId" element={<StubPage title="RSVP" note="სტუმრის საჯარო გვერდი — დასწრების დადასტურება." />} />
        <Route path="/rsvp-dashboard" element={<StubPage title="RSVP დაფა" note="სტატისტიკა და დასწრების აღრიცხვა." />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/partner" element={<StubPage title="პარტნიორის დაფა" note="შემოსული მოთხოვნები 3D მოდელებით, ჯავშნები, ანალიტიკა." />} />
        <Route path="*" element={<StubPage title="გვერდი ვერ მოიძებნა" note="ბმული არასწორია ან გვერდი გადატანილია." />} />
      </Routes>
      </Suspense>
      <Footer />
    </>
  )
}
