// Цвета папок (окно берёт цвет той папки, которую открыли)
export const COLORS = { green: '#2d4b46', cactus: '#47743a', red: '#6a1420', tiger: '#1c6b62' }
export const GLOSSARY_COLOR = COLORS.green

const SOON = 'Материалы раздела готовятся — скоро они появятся здесь.'

// Тексты окон — заполняйте здесь
export const SECTIONS = {
  diag: { title: 'Входной диагностический тест', color: COLORS.green, text: [SOON] },
  cases: { title: 'Клинические кейсы', color: COLORS.green, text: [SOON] },
  errors: { title: 'Ошибки родителя в начале обучения', color: COLORS.cactus, text: [SOON] },
  myths: { title: 'Мифы про неговорящих', color: COLORS.cactus, text: [SOON] },
  micro: { title: 'Микрошаги к самостоятельности', color: COLORS.red, text: [SOON] },
  video: { title: 'Видео', color: COLORS.red, text: ['Видеоматериалы скоро появятся здесь.'] },
}

// Термины по буквам: { Т: [{ term: 'ТМНР', text: '…' }] }
export const TERMS = {
  Т: [{ term: 'ТМНР', text: 'Тяжёлые и множественные нарушения развития.' }],
}

export const TARIFFS = {
  intro: { title: 'Знакомство', color: COLORS.green, price: 0 },
  full: { title: 'Полный ориентир', color: COLORS.tiger, price: 799 },
}

// Видео раздела. Список собирается АВТОМАТИЧЕСКИ из папки public/videos (см. vite-plugin-videos.js):
// каждый mp4/webm/mov-файл становится видео, а картинка с тем же именем — его постером.
import videoFiles from 'virtual:videos'

// Красивые названия для файлов (ключ — имя файла без расширения). Для остальных файлов название = имя файла.
const TITLES = {
  'Проба 1': 'Проба 1. Тяни-тяни',
  'Проба 2': 'Проба 2. Звони',
  'Проба 3': 'Проба 3. Движение глаз',
}

// Видео по ссылке (YouTube, RuTube, VK): { title: 'Название', embed: 'https://…' } — добавляются после файлов.
const EMBEDS = []

const fileUrl = (name) => encodeURI(`${import.meta.env.BASE_URL || '/'}videos/${name}`)

export const VIDEOS = [
  ...videoFiles.map((v) => ({ title: TITLES[v.name] || v.name, duration: '', src: fileUrl(v.file), poster: v.poster ? fileUrl(v.poster) : '', embed: '' })),
  ...EMBEDS.map((v) => ({ duration: '', src: '', poster: '', ...v })),
]

// Подпись цены: 0 показываем как «бесплатно»
export const priceText = (p) => (p === 0 ? 'бесплатно' : `${p} ₽`)
