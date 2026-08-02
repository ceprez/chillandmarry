// 14 templates — ambience env + FULLY EDITABLE items (every visible object is an item).
let n = 0
const it = (type, x, z, color, extra = {}) => ({ id: 't' + n++, type, x, z, color, ...extra })
const top = (type, x, z, y, color) => ({ id: 't' + n++, type, x, z, y, color })
const wal = (type, side, u, y, color) => ({ id: 't' + n++, type, color, wall: { side, u, y } })

const longRow = (z, count, color, x0 = null) => {
  const span = 3.4
  const start = x0 ?? -((count - 1) * span) / 2
  return Array.from({ length: count }, (_, i) => it('table-long', start + i * span, z, color))
}
const roundGrid = (positions, color) => positions.map(([x, z]) => it('table-round', x, z, color))
const SKY = { dusk: '#8FA3BC', night: '#101423', warmNight: '#241A20', day: '#BFD4E4', ivory: '#EDE6D6', amber: '#2A1408' }

export const TEMPLATES = [
  {
    id: 'blank', name: "That's What I Like", subtitle: 'ცარიელი პროექტი — ააწყვეთ ნულიდან',
    env: { id: 'blank', sky: SKY.ivory, floor: 'tiles', walls: 'stone', light: 'day', features: {} },
    items: [],
  },
  {
    id: 'pink-white', name: 'Pink + White', subtitle: 'ვარდისფერი თაღები · თეთრი გრძელი მაგიდა',
    env: { id: 'pink-white', sky: SKY.dusk, floor: 'grass', walls: 'none', light: 'dusk', features: { festoon: true } },
    items: [
      ...longRow(0, 5, '#F5EFE4'),
      it('arch-roses', 0, -5.6, '#EBAEBB'), it('arch-roses', -4.5, -5.2, '#F0D4DA', { rot: 0.2 }), it('arch-roses', 4.5, -5.2, '#EBAEBB', { rot: -0.2 }),
      it('chandelier', -4.5, -3.4, '#FFE3B0'), it('chandelier', 0, -3.6, '#FFE3B0'), it('chandelier', 4.5, -3.4, '#FFE3B0'),
      it('bouquet-peony', -8.6, 1.6, '#E9A9B8'), it('bouquet-peony', -7.4, 2.2, '#F0D4DA'), it('bouquet-peony', 8.6, 1.6, '#E9A9B8'),
      top('candelabra', -5, 0, 0.8, '#F3E9D2'), top('candelabra', 0, 0, 0.8, '#F3E9D2'), top('candelabra', 5, 0, 0.8, '#F3E9D2'),
      top('table-flowers', -2.5, 0, 0.8, '#E9A9B8'), top('table-flowers', 2.5, 0, 0.8, '#F0B8A8'),
    ],
  },
  {
    id: 'lose-yourself', name: 'Lose Yourself to Dance', subtitle: 'დიდი საცეკვაო · ბარი · ღამის ბაღი',
    env: { id: 'lose-yourself', sky: SKY.night, floor: 'grass', walls: 'hedge', light: 'night', features: { festoon: true, disco: { n: 6 } } },
    items: [
      it('dancefloor', 0, 0, '#EDEDE8', { sx: 1.9 }),
      it('bar', 0, -5.6, '#17130F', { sx: 1.3 }),
      it('dj-booth', 4.6, -5.2, '#4AA8E8', { rot: -0.4 }),
      it('speaker', 6.2, -4.6, '#17130F'), it('speaker', 3.0, -5.9, '#17130F'),
      ...roundGrid([[-7, 3.5], [-7, -0.5], [-4, 5.5], [4, 5.5], [7, 3.5], [7, -0.5], [-6.5, -4.5], [6.5, -4.5]], '#C9B394'),
      top('table-flowers', -7, 3.5, 0.8, '#7A3B45'), top('table-flowers', 7, 3.5, 0.8, '#7A3B45'),
      top('candelabra', -4, 5.5, 0.8, '#D9B36A'), top('candelabra', 4, 5.5, 0.8, '#D9B36A'),
    ],
  },
  {
    id: 'blinding-lights', name: 'Blinding Lights', subtitle: 'სცენა · სხივები · ქარვისფერი დრაპირება',
    env: { id: 'blinding-lights', sky: SKY.amber, floor: 'dark', walls: 'none', light: 'show', features: { beams: true, drapeColumns: { colors: ['#D98A3C', '#E8A24A'] } } },
    items: [
      it('stage', 0, -6.2, '#17130F', { sx: 1.2 }),
      it('piano', 0, -3.4, '#17130F', { rot: Math.PI }),
      it('speaker-tower', -6.4, -6.0, '#17130F'), it('speaker-tower', 6.4, -6.0, '#17130F'),
      ...longRow(1.2, 3, '#E8DCC4', -8.4), ...longRow(1.2, 3, '#E8DCC4', 1.6),
      top('candelabra', -5, 1.2, 0.8, '#D9B36A'), top('candelabra', 5, 1.2, 0.8, '#D9B36A'),
      top('table-flowers', -1.7, 1.2, 0.8, '#F5EBDD'), top('table-flowers', 8.4, 1.2, 0.8, '#F5EBDD'),
    ],
  },
  {
    id: 'save-your-tears', name: 'Save Your Tears', subtitle: 'ვარსკვლავებიანი ჭერი · სანთლები',
    env: { id: 'save-your-tears', sky: SKY.night, floor: 'dark', walls: 'none', light: 'candle', features: { stars: { layers: 5 } } },
    items: [
      ...longRow(-3, 4, '#B7A88E'), ...longRow(2.4, 4, '#B7A88E'),
      it('lantern', -8.8, -0.4, '#F3E9D2'), it('lantern', 8.8, -0.4, '#F3E9D2'),
      top('candelabra', -5.1, -3, 0.8, '#F3E9D2'), top('candelabra', 0, -3, 0.8, '#F3E9D2'), top('candelabra', 5.1, -3, 0.8, '#F3E9D2'),
      top('candelabra', -5.1, 2.4, 0.8, '#F3E9D2'), top('candelabra', 0, 2.4, 0.8, '#F3E9D2'), top('candelabra', 5.1, 2.4, 0.8, '#F3E9D2'),
    ],
  },
  {
    id: 'talking-moon', name: 'Talking to the Moon', subtitle: 'მთვარეები · სარკისებრი იატაკი',
    env: { id: 'talking-moon', sky: SKY.night, floor: 'mirror', walls: 'none', light: 'candle', features: { stars: { layers: 2 } } },
    items: [
      it('moon', 0, -5.8, '#EDE8DA', { sx: 1.6 }),
      it('moon', -6.5, -5.2, '#EDE8DA'), it('moon', 6.5, -5.2, '#EDE8DA'),
      it('moon', -9.5, -2, '#EDE8DA', { sx: 0.8 }), it('moon', 9.5, -2, '#EDE8DA', { sx: 0.8 }),
      ...longRow(-2.6, 4, '#D9CBB8'), ...longRow(3.2, 4, '#D9CBB8'),
      top('candelabra', -5.1, -2.6, 0.8, '#D9B36A'), top('candelabra', 0, -2.6, 0.8, '#D9B36A'), top('candelabra', 5.1, -2.6, 0.8, '#D9B36A'),
      top('candelabra', -5.1, 3.2, 0.8, '#D9B36A'), top('candelabra', 0, 3.2, 0.8, '#D9B36A'), top('candelabra', 5.1, 3.2, 0.8, '#D9B36A'),
    ],
  },
  {
    id: 'uptown-funk', name: 'Uptown Funk', subtitle: 'რეტრო · დისკო · პამპასი',
    env: { id: 'uptown-funk', sky: SKY.warmNight, floor: 'checker', walls: 'none', light: 'warm', features: { disco: { n: 10 }, festoon: true } },
    items: [
      it('guest-chairs', -3.4, 2.6, '#E8DCC4'), it('guest-chairs', 3.4, 2.6, '#E8DCC4'),
      it('guest-chairs', -3.4, 5.0, '#E8DCC4'), it('guest-chairs', 3.4, 5.0, '#E8DCC4'),
      it('arch', 0, -5.4, '#EBAEBB'),
      it('fringe-lamp', -5.4, -3.6, '#E8632A'), it('fringe-lamp', 5.4, -3.6, '#C43B2A'),
      it('fringe-lamp', -7.6, 0.5, '#E8862E'), it('fringe-lamp', 7.6, 0.5, '#D96A8A'),
      it('bouquet-wild', -2.2, -4.6, '#F3E4D4', { sx: 1.4 }), it('bouquet-wild', 2.2, -4.6, '#EFC3A4', { sx: 1.4 }),
      wal('neon-heart', 'back', 0, 3.4, '#E85A9C'),
    ],
  },
  {
    id: 'time-of-my-life', name: 'Time of My Life', subtitle: 'პალმები · მინის ჭერი · ოქროს ჭაღები',
    env: { id: 'time-of-my-life', sky: SKY.dusk, floor: 'tiles', walls: 'none', light: 'dusk', features: { glassRoof: true } },
    items: [
      it('palm', -9, 0, '#3F5A38'), it('palm', -9, -4.5, '#3F5A38'), it('palm', -9, 4.5, '#3F5A38'),
      it('palm', 9, 0, '#3F5A38'), it('palm', 9, -4.5, '#3F5A38'), it('palm', 9, 4.5, '#3F5A38'),
      it('chandelier-grand', -4.5, 0, '#FFE3B0'), it('chandelier-grand', 0, 0, '#FFE3B0'), it('chandelier-grand', 4.5, 0, '#FFE3B0'),
      ...longRow(0, 5, '#3A2E24'),
      ...longRow(-4.8, 3, '#4A3B2E'), ...longRow(4.8, 3, '#4A3B2E'),
      top('candelabra', -3.4, 0, 0.8, '#D9B36A'), top('candelabra', 3.4, 0, 0.8, '#D9B36A'),
    ],
  },
  {
    id: 'tsisper-tvaleba', name: 'ჩემო ცისფერთვალება', subtitle: 'აუზი · ჰორტენზიები · მზიანი ბაღი',
    env: { id: 'tsisper-tvaleba', sky: SKY.day, floor: 'grass', walls: 'hedge', light: 'day', features: { wisteria: true, festoon: true, pool: true } },
    items: [
      ...roundGrid([[-6, -1], [-2, -3], [2, -3], [6, -1], [-4.5, 2], [4.5, 2]], '#F5EFE4'),
      it('pot-plant', -9, -5, '#4E6B45'), it('pot-plant', 9, -5, '#4E6B45'),
      top('table-flowers', -6, -1, 0.8, '#AEC6E8'), top('table-flowers', 2, -3, 0.8, '#AEC6E8'),
      top('table-flowers', 6, -1, 0.8, '#AEC6E8'), top('table-flowers', -4.5, 2, 0.8, '#AEC6E8'),
      top('table-flowers', -2, -3, 0.8, '#FDFCF6'), top('table-flowers', 4.5, 2, 0.8, '#FDFCF6'),
    ],
  },
  {
    id: 'tetri-klavishebi', name: 'თეთრი კლავიშები', subtitle: 'თეთრი დრაპირება · სარკის ბილიკი',
    env: { id: 'tetri-klavishebi', sky: SKY.ivory, floor: 'mirror', walls: 'drape:#EFE7DA', light: 'candle', features: { ceilingDrapes: { color: '#F5EFE4' } } },
    items: [
      ...longRow(-3.4, 4, '#F5EFE4'), ...longRow(3.4, 4, '#F5EFE4'),
      it('flower-tree-white', -6.5, -5.4, '#FDFCF6'), it('flower-tree-white', 0, -5.4, '#FDFCF6'), it('flower-tree-white', 6.5, -5.4, '#FDFCF6'),
      it('runner', 0, 0, '#EDE2CC', { sx: 2.2 }),
      top('candelabra', -3.4, -3.4, 0.8, '#F3E9D2'), top('candelabra', 3.4, 3.4, 0.8, '#F3E9D2'),
      top('table-flowers', 0, -3.4, 0.8, '#FDFCF6'), top('table-flowers', 0, 3.4, 0.8, '#FDFCF6'),
    ],
  },
  {
    id: 'my-heart', name: 'My Heart Will Go On', subtitle: 'ციხე-დარბაზი · წითელი ღრუბელი',
    env: { id: 'my-heart', sky: SKY.dusk, floor: 'cobble', walls: 'stone', light: 'dusk', features: { tulle: { color: '#E8452A' }, castle: true } },
    items: [
      ...longRow(0, 4, '#8E1F2A'),
      it('lantern', -8.2, 2.4, '#B33636'), it('lantern', 8.2, 2.4, '#B33636'),
      top('candelabra', -5.1, 0, 0.8, '#B33636'), top('candelabra', 0, 0, 0.8, '#B33636'), top('candelabra', 5.1, 0, 0.8, '#B33636'),
      top('table-flowers', -2.5, 0, 0.8, '#9C1F2E'), top('table-flowers', 2.5, 0, 0.8, '#9C1F2E'),
    ],
  },
  {
    id: 'here-comes-sun', name: 'Here Comes the Sun', subtitle: 'მზის დისკო · რკალისებრი მაგიდა',
    env: { id: 'here-comes-sun', sky: SKY.warmNight, floor: 'dark', walls: 'none', light: 'sunset', features: { sun: { drape: '#C77E4A' } } },
    items: [
      it('palm', -10.5, -5.5, '#3F5A38'), it('palm', 10.5, -5.5, '#3F5A38'),
      it('table-long', -5.6, -1.4, '#D9A96A', { rot: 0.55 }), it('table-long', -2, -2.6, '#D9A96A', { rot: 0.2 }),
      it('table-long', 2, -2.6, '#D9A96A', { rot: -0.2 }), it('table-long', 5.6, -1.4, '#D9A96A', { rot: -0.55 }),
      wal('neon-heart', 'back', -7, 2.6, '#E8452A'),
      top('table-flowers', -5.6, -1.4, 0.8, '#C43B2A'), top('table-flowers', -2, -2.6, 0.8, '#E86A4A'),
      top('table-flowers', 2, -2.6, 0.8, '#C43B2A'), top('table-flowers', 5.6, -1.4, 0.8, '#E86A4A'),
      top('candelabra', 0, -2.9, 0.8, '#D9B36A'),
    ],
  },
  {
    id: 'debi-tirar', name: 'DeBÍ TiRAR MáS FOToS', subtitle: 'კარიბული ფიესტა · ნარინჯისფერი აბაჟურები',
    env: { id: 'debi-tirar', sky: SKY.day, floor: 'diamond', walls: 'none', light: 'day', features: { colonial: true } },
    items: [
      it('fringe-lamp', -4, -2, '#E8632A'), it('fringe-lamp', 0, -2.6, '#C43B2A'), it('fringe-lamp', 4, -2, '#E8862E'),
      it('fringe-lamp', -6.5, 1, '#E8632A'), it('fringe-lamp', 6.5, 1, '#C43B2A'),
      ...longRow(3.6, 3, '#F0B060'), ...longRow(5.8, 2, '#F0B060'),
      it('bar', 6.8, -4.8, '#8A4A2E', { rot: -0.5 }),
      it('balloon-cluster', -8.5, -4.5, '#E8632A'), it('balloon-cluster', -6.8, -5.2, '#F2C230'),
      top('table-flowers', -3.4, 3.6, 0.8, '#E8632A'), top('table-flowers', 0, 3.6, 0.8, '#F2C230'), top('table-flowers', 3.4, 3.6, 0.8, '#C43B2A'),
    ],
  },
  {
    id: 'lets-groove', name: "Let's Groove Tonight", subtitle: 'დისკო ბურთები · ფერადი დრაპირება',
    env: { id: 'lets-groove', sky: SKY.night, floor: 'mirror', walls: 'drape:#B85A34', light: 'party', features: { disco: { n: 26 }, drapeColumns: { colors: ['#E8862E', '#C4527A', '#3E5A9C'] } } },
    items: [
      it('column', -5, -3, '#17130F'), it('column', 5, -3, '#17130F'), it('column', -5, 3, '#17130F'), it('column', 5, 3, '#17130F'),
      it('dj-booth', 0, -6, '#E85A9C'),
      it('speaker', -1.8, -6.2, '#17130F'), it('speaker', 1.8, -6.2, '#17130F'),
      ...roundGrid([[-7.5, 3.5], [-3, 5], [3, 5], [7.5, 3.5], [-8, -1], [8, -1]], '#D97A5A'),
      top('table-flowers', -7.5, 3.5, 0.8, '#F2C230'), top('table-flowers', 7.5, 3.5, 0.8, '#F2C230'),
      top('candelabra', -3, 5, 0.8, '#D9B36A'), top('candelabra', 3, 5, 0.8, '#D9B36A'),
    ],
  },
]
export const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]))
