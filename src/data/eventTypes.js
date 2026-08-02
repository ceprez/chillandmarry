// Event type configurations: which sections appear and with what options.
export const EVENT_TYPES = [
  { id: 'wedding', name: 'ქორწილი', icon: '💍' },
  { id: 'birthday', name: 'დაბადების დღე', icon: '🎂' },
  { id: 'gender-reveal', name: 'გენდერ რივილი', icon: '🎈' },
  { id: 'baby-shower', name: 'ბეიბი შაუერი', icon: '🍼' },
  { id: 'engagement', name: 'ნიშნობა', icon: '💐' },
  { id: 'anniversary', name: 'იუბილე', icon: '🥂' },
  { id: 'corporate', name: 'კორპორატიული', icon: '🏢' },
  { id: 'graduation', name: 'გამოსაშვები', icon: '🎓' },
  { id: 'other', name: 'სხვა', icon: '✨' },
]

const ACT = {
  yacht: { id: 'yacht', name: 'იახტით გასეირნება', desc: 'კერძო იახტა 3 საათით, კაპიტანი და შამპანური', dur: '3 სთ', price: 1200 },
  limo: { id: 'limo', name: 'ლიმუზინი / რეტრო ავტო', desc: 'რეტრო Mercedes ან ლიმუზინი ფოტოსესიით', dur: '4 სთ', price: 450 },
  photobooth: { id: 'photobooth', name: 'ფოტო-ჯიხური', desc: 'ჯიხური რეკვიზიტით, ბეჭდვა ადგილზე ულიმიტოდ', dur: 'მთელი საღამო', price: 380 },
  karaoke: { id: 'karaoke', name: 'კარაოკე კუთხე', desc: 'პროფესიონალური სისტემა 10 000+ სიმღერით', dur: 'მთელი საღამო', price: 250 },
  animators: { id: 'animators', name: 'ანიმატორები', desc: '2 ანიმატორი საბავშვო პროგრამით და თამაშებით', dur: '3 სთ', price: 300 },
  smoke: { id: 'smoke', name: 'ფერადი კვამლის შოუ', desc: 'ფერადი კვამლის ეფექტები ფოტო-მომენტებისთვის', dur: '2 გაშვება', price: 180 },
  balloonbox: { id: 'balloonbox', name: 'ბუშტების ყუთი (რივილი)', desc: 'გიგანტური ყუთი ფერადი ბუშტებით — რივილის მთავარი მომენტი', dur: '1 გახსნა', price: 150 },
  confetti: { id: 'confetti', name: 'კონფეტის ქვემეხები', desc: '2 ქვემეხი ბიო-კონფეტით', dur: '2 გასროლა', price: 120 },
  games: { id: 'games', name: 'თამაშები და კონკურსები (წამყვანით)', desc: 'წამყვანი ინტერაქტიული თამაშებით მთელი ოჯახისთვის', dur: '2 სთ', price: 280 },
  photozone: { id: 'photozone', name: 'ფოტო-ზონა დეკორით', desc: 'თემატური ფოტო-კედელი დეკორით და განათებით', dur: 'მთელი საღამო', price: 320 },
  quartet: { id: 'quartet', name: 'სიმებიანი კვარტეტი მიღებაზე', desc: 'სიმებიანი კვარტეტი კლასიკური და თანამედროვე რეპერტუარით', dur: '2 სთ', price: 600 },
  teambuilding: { id: 'teambuilding', name: 'თიმბილდინგ აქტივობები', desc: 'გუნდური აქტივობები პროფესიონალი ფასილიტატორით', dur: '3 სთ', price: 500 },
  casino: { id: 'casino', name: 'გასართობი კაზინო-კუთხე', desc: 'გასართობი კაზინო-მაგიდები კრუპიეებით (უფულო)', dur: '4 სთ', price: 700 },
}

export const FIREWORKS = [
  { id: 'fw-classic', partner: 'PyroArt Georgia', name: 'კლასიკური ცეცხლოვანი შოუ · 3 წთ', price: 800 },
  { id: 'fw-grand', partner: 'PyroArt Georgia', name: 'გრანდიოზული შოუ მუსიკით · 6 წთ', price: 1800 },
  { id: 'fw-cold', partner: 'SparkPro', name: 'ცივი ფოიერვერკი დარბაზში (უსაფრთხო)', price: 450 },
  { id: 'fw-reveal', partner: 'SparkPro', name: 'რივილ-ფოიერვერკი (ვარდისფერი/ცისფერი)', price: 550 },
]

export const AUDIO = [
  { id: 'audio-venue', name: 'დარბაზის საკუთარი სისტემა', price: 150, provider: 'venue', min: 0 },
  { id: 'audio-basic', name: 'საბაზისო: წყვილი დინამიკი + მიკროფონი', price: 200, provider: 'evento', min: 0 },
  { id: 'audio-pro', name: 'პრო: ხმა + სუბსიდან + 2 მიკროფონი', price: 480, provider: 'evento', min: 100 },
  { id: 'audio-show', name: 'შოუ: ხმა + განათება + ტექნიკოსი', price: 950, provider: 'grand', min: 150 },
  { id: 'audio-concert', name: 'საკონცერტო: line-array + ინჟინერი', price: 1800, provider: 'grand', min: 250 },
]

export const REGION_ACT = {
  tbilisi: [
    { id: 'r-funicular', name: 'ფუნიკულიორით აღმართი და ფოტოსესია', desc: 'დაჯავშნილი ვაგონი სტუმრებისთვის, ფოტოსესია ზედა სადგურზე', dur: '1.5 სთ', price: 180 },
    { id: 'r-oldtown', name: 'ძველი თბილისის ტური სტუმრებისთვის', desc: 'გიდი, აბანოთუბანი და მეტეხის ხედები', dur: '2 სთ', price: 260 },
    { id: 'r-rooftop', name: 'რუფთოფ-ფოტოსესია ქალაქის ხედით', desc: 'პროფესიონალი ფოტოგრაფი მზის ჩასვლისას', dur: '1.5 სთ', price: 320 },
  ],
  batumi: [
    { id: 'r-yacht', name: 'იახტით გასეირნება ზღვაზე', desc: 'კერძო იახტა ბათუმის ყურეში, კაპიტანი და ღვინო', dur: '3 სთ', price: 1200 },
    { id: 'r-beach', name: 'ზღვისპირა ფოტოსესია მზის ჩასვლისას', desc: 'ოქროს საათი სანაპიროზე, ფოტოგრაფი და რეკვიზიტი', dur: '1.5 სთ', price: 350 },
    { id: 'r-botanic', name: 'ბოტანიკური ბაღის ტური', desc: 'ბათუმის ბოტანიკური ბაღის დახურული ტური', dur: '2 სთ', price: 200 },
  ],
  kakheti: [
    { id: 'r-wine', name: 'ღვინის ტური მარანში დეგუსტაციით', desc: 'მარნის ტური, დეგუსტაცია და სუფრა ალაზნის ხედით', dur: '3 სთ', price: 450 },
    { id: 'r-horses', name: 'ცხენებით სეირნობა ალაზნის ველზე', desc: 'გამოცდილი ინსტრუქტორები, ულამაზესი მარშრუტი', dur: '2 სთ', price: 300 },
    { id: 'r-balloon', name: 'საჰაერო ბუშტით ფრენა', desc: 'ფრენა ალაზნის ველზე ამოსვლისას, შამპანური დაშვებაზე', dur: '1 სთ', price: 900 },
  ],
}

export const DANCE_CLASSES = [
  { id: 'dc-first', name: 'პირველი ცეკვის კურსი (4 გაკვეთილი)', studio: 'Vals Studio', price: 240,
    desc: 'ვალსი ან თქვენი სიმღერა — ქორეოგრაფი დაგისვამთ ინდივიდუალურ დადგმას. 4 × 1სთ გაკვეთილი.' },
  { id: 'dc-georgian', name: 'ქართული ცეკვის ექსპრეს-კურსი', studio: 'ანსამბლი „სულიკო"', price: 200,
    desc: 'ქართული საცეკვაო ელემენტები სუფრის გასახალისებლად — 3 შეხვედრა ჯგუფურად ან ინდივიდუალურად.' },
  { id: 'dc-party', name: 'წვეულების ცეკვები ჯგუფისთვის', studio: 'Modern Motion', price: 180,
    desc: 'მხიარული ჯგუფური დადგმა მეჯვარეებთან და მეგობრებთან ერთად — სიურპრიზ-ნომერი ზეიმზე.' },
]

export const DRESS_SALONS = [
  { id: 'ds-bridal', name: 'სალონი „White Silk"', range: '₾1,500 – ₾6,000' },
  { id: 'ds-atelier', name: 'ატელიე „Nino Couture" (ინდპოშივი)', range: '₾2,500 – ₾9,000' },
  { id: 'ds-rent', name: 'გაქირავება „DressRoom"', range: '₾400 – ₾1,200' },
]

const BASE = ['basics', 'venue', 'companies', 'artists', 'guests', 'invitations', 'schedule', 'menu', 'audio', 'budget']

export const TYPE_CONFIG = {
  wedding: {
    sections: ['basics', 'venue', 'companies', 'artists', 'activities', 'guests', 'transfer', 'hotel', 'cake', 'invitations', 'fireworks', 'dress', 'schedule', 'dance', 'menu', 'audio', 'budget'],
    activities: [ACT.yacht, ACT.limo, ACT.photobooth, ACT.quartet, ACT.photozone],
    cakeNote: 'საქორწილო ტორტი — იარუსები, ფერები, ტოპერი',
  },
  birthday: {
    sections: ['basics', 'venue', 'companies', 'artists', 'activities', 'guests', 'cake', 'invitations', 'fireworks', 'schedule', 'menu', 'audio', 'budget'],
    activities: [ACT.animators, ACT.karaoke, ACT.photobooth, ACT.games, ACT.photozone],
    cakeNote: 'დაბადების დღის ტორტი — თემატური დიზაინი',
  },
  'gender-reveal': {
    sections: ['basics', 'venue', 'companies', 'activities', 'guests', 'cake', 'invitations', 'fireworks', 'schedule', 'menu', 'budget'],
    activities: [ACT.balloonbox, ACT.smoke, ACT.confetti, ACT.photozone],
    cakeNote: 'რივილ-ტორტი — ფერადი შიგთავსით (ვარდისფერი/ცისფერი)',
  },
  'baby-shower': {
    sections: ['basics', 'venue', 'companies', 'activities', 'guests', 'cake', 'invitations', 'schedule', 'menu', 'budget'],
    activities: [ACT.games, ACT.photozone, ACT.photobooth],
    cakeNote: 'ბეიბი შაუერის ტორტი — ნაზი ფერები',
  },
  engagement: {
    sections: ['basics', 'venue', 'companies', 'artists', 'activities', 'guests', 'cake', 'invitations', 'fireworks', 'schedule', 'menu', 'audio', 'budget'],
    activities: [ACT.quartet, ACT.photozone, ACT.limo],
    cakeNote: 'სანიშნო ტორტი',
  },
  anniversary: {
    sections: ['basics', 'venue', 'companies', 'artists', 'activities', 'guests', 'cake', 'invitations', 'fireworks', 'schedule', 'menu', 'audio', 'budget'],
    activities: [ACT.quartet, ACT.photobooth, ACT.photozone],
    cakeNote: 'საიუბილეო ტორტი',
  },
  corporate: {
    sections: ['basics', 'venue', 'companies', 'artists', 'activities', 'guests', 'transfer', 'hotel', 'invitations', 'schedule', 'menu', 'audio', 'budget'],
    activities: [ACT.teambuilding, ACT.casino, ACT.photobooth, ACT.karaoke],
    cakeNote: '',
  },
  graduation: {
    sections: ['basics', 'venue', 'companies', 'artists', 'activities', 'guests', 'cake', 'invitations', 'fireworks', 'schedule', 'menu', 'audio', 'budget'],
    activities: [ACT.photobooth, ACT.karaoke, ACT.confetti, ACT.photozone],
    cakeNote: 'სადღესასწაულო ტორტი',
  },
  other: {
    sections: [...BASE, 'activities', 'cake', 'fireworks'],
    activities: Object.values(ACT).slice(0, 6),
    cakeNote: 'ტორტი თქვენი დიზაინით',
  },
}

export const SECTION_TITLES = {
  basics: 'ძირითადი ინფორმაცია', venue: 'დარბაზი და 3D დიზაინი', companies: 'საივენთო კომპანიები',
  artists: 'არტისტები', activities: 'დღის აქტივობები', guests: 'სტუმრები',
  transfer: 'აეროპორტის ტრანსფერი', hotel: 'სასტუმრო', cake: 'ტორტი',
  invitations: 'მოსაწვევები', fireworks: 'ფოიერვერკი', dress: 'კაბა',
  schedule: 'დღის განრიგი', dance: 'საცეკვაო კურსი', menu: 'მენიუ', audio: 'აუდიო სისტემა', budget: 'ბიუჯეტი',
}
