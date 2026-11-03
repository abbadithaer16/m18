/* Leon Vasari — shared data. Leon Vasari and every film here are fictional.
   Artwork: four MotionSites "Shelf Hero" generation sheets (transparent WebP
   via the Higgsfield image proxy). Spines and covers are crops of these. */

const PROXY = (file, w) =>
  'https://images.higgs.ai/?default=1&output=webp&url=' +
  encodeURIComponent('https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/' + file) +
  '&w=' + w + '&q=85'

// SHEET[id] = [url, W, H]
export const SHEET = {
  covers: [PROXY('hf_20261029_010644_837e04ca-2418-45c1-b8e0-0233265c4cd5.png', 1744), 1744, 2336],
  spines: [PROXY('hf_20261029_010738_a3e47ead-18f2-4974-9468-06d16a25edc5.png', 2688), 2688, 1152],
  fix: [PROXY('hf_20261029_010831_3ebb874b-93dc-433e-87ed-6299aba720f0.png', 1520), 1520, 2688],
  fix2: [PROXY('hf_20261029_092020_f96bc094-db7b-46de-9298-074a24e0a3b8.png', 1520), 1520, 2688],
}

// CROP['spine-<id>' | 'cover-<id>'] = [sheet, x, y, w, h]  (sheet pixels)
export const CROP = {
  'spine-valley': ['spines', 266, 31, 189, 1089], 'cover-valley': ['covers', 497, 72, 344, 659],
  'spine-bluehour': ['spines', 492, 31, 189, 1089], 'cover-bluehour': ['covers', 914, 72, 342, 659],
  'spine-river': ['fix', 197, 54, 324, 2566], 'cover-river': ['covers', 1332, 72, 344, 659],
  'spine-summer': ['spines', 937, 31, 188, 1089], 'cover-summer': ['covers', 74, 813, 344, 676],
  'spine-green': ['spines', 1157, 31, 185, 1090], 'cover-green': ['covers', 497, 815, 344, 674],
  'spine-noon': ['spines', 44, 32, 184, 1088], 'cover-noon': ['covers', 74, 72, 347, 659],
  'spine-observer': ['fix2', 371, 15, 349, 2655], 'cover-observer': ['covers', 915, 815, 342, 675],
  'spine-birds': ['spines', 1573, 31, 183, 1089], 'cover-birds': ['covers', 1331, 815, 345, 675],
  'spine-storm': ['fix2', 808, 15, 347, 2656], 'cover-storm': ['covers', 74, 1571, 345, 681],
  'spine-tide': ['spines', 2012, 31, 188, 1089], 'cover-tide': ['covers', 496, 1577, 343, 678],
  'spine-war': ['spines', 2236, 31, 189, 1089], 'cover-war': ['covers', 913, 1579, 343, 676],
  'spine-door': ['spines', 2462, 31, 188, 1089], 'cover-door': ['covers', 1331, 1579, 344, 677],
}

export const FILMS = [
  { id: 'valley', title: 'The Silent Valley', romaji: 'SHIZUKANA TANI', kanji: '静かな谷', year: 1958, genre: 'Drama', min: 104, synopsis: 'A schoolteacher returns to the mountain village that exiled her father, and finds the valley has kept every one of its secrets.' },
  { id: 'bluehour', title: 'The Blue Hour', romaji: 'AO NO TOKI', kanji: '青の刻', year: 1962, genre: 'Romance', min: 97, synopsis: 'Over one long evening in a harbour town, a widow and a stranger trade small lies until the light runs out.' },
  { id: 'river', title: 'River of Salt', romaji: 'SHIO NO KAWA', kanji: '塩の川', year: 1964, genre: 'Drama', min: 121, synopsis: 'Two brothers drag a salt barge downriver to a city that no longer wants anything they carry.' },
  { id: 'summer', title: 'The Last Summer', romaji: 'SAIGO NO NATSU', kanji: '最後の夏', year: 1966, genre: 'Drama', min: 109, synopsis: 'The summer before the dam floods their village, three friends set fire to everything they cannot take with them.' },
  { id: 'green', title: 'The Green Road', romaji: 'MIDORI NO MICHI', kanji: '緑の道', year: 1969, genre: 'Mystery', min: 101, synopsis: 'A surveyor mapping a forest road keeps finding the same footprints, always one day ahead of him.' },
  { id: 'noon', title: 'Noon in Ashes', romaji: 'HAI NO SHOGO', kanji: '灰の正午', year: 1971, genre: 'Western', min: 112, synopsis: 'A rider crosses a white desert to settle an old debt, and learns too late who sent him.' },
  { id: 'observer', title: 'The Observer', romaji: 'KANSATSUSHA', kanji: '観察者', year: 1973, genre: 'Thriller', min: 96, synopsis: 'A night watchman begins to suspect that the building he guards has started watching him back.' },
  { id: 'birds', title: 'The Fallen Birds', romaji: 'OCHITA TORI', kanji: '落ちた鳥', year: 1975, genre: 'Drama', min: 118, synopsis: "When the birds stop singing over a frontier town, the mayor's daughter is the only one who goes looking for the reason." },
  { id: 'storm', title: 'Light in the Storm', romaji: 'ARASHI NO HI', kanji: '嵐の灯', year: 1978, genre: 'Drama', min: 127, synopsis: 'A lighthouse keeper and his son wait out a three-day storm with a shipwrecked sailor who will not give his name.' },
  { id: 'tide', title: 'The Long Tide', romaji: 'NAGAI SHIO', kanji: '長い潮', year: 1981, genre: 'Drama', min: 99, synopsis: "A fisherman's wife counts the tides on the harbour wall while her husband's boat fails to come home." },
  { id: 'war', title: 'A Quiet War', romaji: 'SHIZUKANA SENSO', kanji: '静かな戦争', year: 1985, genre: 'Comedy', min: 103, synopsis: 'Two neighbours fight a silent war over a garden wall for thirty years, and neither will say how it began.' },
  { id: 'door', title: 'Red Door', romaji: 'AKAI TOBIRA', kanji: '赤い扉', year: 1989, genre: 'Thriller', min: 114, synopsis: 'A projectionist follows a reel of unknown film through the corridors of a cinema on its final night.' },
]

// Ten real books shelved after the films on the home shelf. They are not Vasari
// films: the caption and detail show their author instead. Covers are
// straightened from the owner's photos of each book; spines are drawn in each
// cover's colours (public/vasari/assets/books/).
const FILM_ASPECT = 474 / 900 // cover width / height of a VHS box
const BOOK_ASPECT = 0.66
FILMS.forEach((f) => Object.assign(f, { kind: 'film', aspect: FILM_ASPECT }))

export const BOOKS = [
  { id: 'habits', title: 'The 7 Habits of Highly Effective People', author: 'Stephen R. Covey', year: 1989, genre: 'Self-help', synopsis: 'Covey sets out seven habits for personal and working life, arranged as a path from depending on others, to standing on your own, to working well with other people.' },
  { id: 'power', title: 'The 48 Laws of Power', author: 'Robert Greene', year: 1998, genre: 'Non-fiction', synopsis: 'Forty-eight rules about how power is won, kept and lost, each one told through episodes from history, from royal courts to swindlers.' },
  { id: 'seduction', title: 'The Art of Seduction', author: 'Robert Greene', year: 2001, genre: 'Non-fiction', synopsis: 'Greene treats seduction as a form of power, sorting famous seducers from history into types and tracing the steps of their campaigns.' },
  { id: 'innergame', title: 'The Inner Game of Tennis', author: 'W. Timothy Gallwey', year: 1974, genre: 'Sport', synopsis: 'Gallwey on the game played inside the head: quieting self-criticism and trusting the body, so that skill can come out on its own.' },
  { id: 'thinking', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', year: 2011, genre: 'Psychology', synopsis: 'Kahneman describes two ways of thinking, one fast and intuitive, one slow and deliberate, and shows how the fast one leads our judgements astray.' },
  { id: 'grit', title: 'Grit', author: 'Angela Duckworth', year: 2016, genre: 'Psychology', synopsis: 'Duckworth argues that a mix of passion and perseverance, which she calls grit, predicts achievement better than talent does.' },
  { id: 'rules', title: '12 Rules for Life', author: 'Jordan B. Peterson', year: 2018, genre: 'Self-help', synopsis: 'Peterson sets out twelve principles for living, drawing on psychology, mythology and his own experience, as an antidote to chaos.' },
  { id: 'money', title: 'The Psychology of Money', author: 'Morgan Housel', year: 2020, genre: 'Finance', synopsis: 'Short chapters on how people really behave with money, and why doing well with it depends more on behaviour than on knowledge.' },
  { id: 'mountain', title: 'The Mountain Is You', author: 'Brianna Wiest', year: 2020, genre: 'Self-help', synopsis: 'Wiest writes about self-sabotage: why people get in their own way, and how working through it can become a path to self-mastery.' },
  { id: 'thinkagain', title: 'Think Again', author: 'Adam Grant', year: 2021, genre: 'Psychology', synopsis: 'Grant makes the case for rethinking: questioning your own opinions, opening other minds, and making it normal to change your mind.' },
]
  // Shelved in publication order.
  .sort((a, b) => a.year - b.year)
  .map((b) => ({ ...b, kind: 'book', aspect: BOOK_ASPECT }))

/** Everything on the home shelf, in order: the twelve films, then the books. */
export const SHELF = [...FILMS, ...BOOKS]

const BOOK_DIR = new URL('./books/', import.meta.url).href
for (const b of BOOKS) {
  SHEET[`book-cover-${b.id}`] = [`${BOOK_DIR}cover-${b.id}.webp`, 660, 1000]
  SHEET[`book-spine-${b.id}`] = [`${BOOK_DIR}spine-${b.id}.webp`, 284, 1680]
  CROP[`cover-${b.id}`] = [`book-cover-${b.id}`, 0, 0, 660, 1000]
  CROP[`spine-${b.id}`] = [`book-spine-${b.id}`, 0, 0, 284, 1680]
}

export const DECADES = [1950, 1960, 1970, 1980]

/** Background CSS that stretches crop box `key` to fill an element exactly. */
export function cropStyle(key) {
  const [sheet, x, y, w, h] = CROP[key]
  const [url, W, H] = SHEET[sheet]
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: `${(W / w) * 100}% ${(H / h) * 100}%`,
    // A crop that is the whole image has no room to move (W === w): pin it at 0.
    backgroundPosition: `${W === w ? 0 : (x / (W - w)) * 100}% ${H === h ? 0 : (y / (H - h)) * 100}%`,
  }
}

export function applyCrop(el, key) {
  Object.assign(el.style, cropStyle(key))
}

/** Values for an SVG <image> that shows only crop `key`, stretched to vw × vh. */
export function svgCrop(key, vw = 474, vh = 900) {
  const [sheet, x, y, w, h] = CROP[key]
  const [url, W, H] = SHEET[sheet]
  return { href: url, x: (-x * vw) / w, y: (-y * vh) / h, width: (W * vw) / w, height: (H * vh) / h }
}

export function preloadSheets() {
  return Object.values(SHEET).map(([url]) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    return img
  })
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
