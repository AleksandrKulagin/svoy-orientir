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

// Видео раздела. Файлы лежат в public/videos/ (положите туда Проба 1.mp4, Проба 2.mp4, Проба 3.mp4).
// title — название в списке; src — файл (mp4/webm); embed — ссылка для вставки (YouTube, RuTube, VK); poster — обложка (необязательно).
// duration можно не указывать: продолжительность читается из самого файла.
const videoFile = (name) => encodeURI(`${import.meta.env.BASE_URL || '/'}videos/${name}`)

export const VIDEOS = [
  { title: 'Проба 1. Тяни-тяни', duration: '', src: videoFile('Проба 1. Тяни-тяни.mp4'), embed: '', poster: videoFile('Проба 1. Тяни-тяни.jpg') },
  { title: 'Проба 2. Звони', duration: '', src: videoFile('Проба 2. Звони.mp4'), embed: '', poster: videoFile('Проба 2. Звони.jpg') },
  { title: 'Проба 3. Движение глаз', duration: '', src: videoFile('Проба 3. Движение глаз.mp4'), embed: '', poster: videoFile('Проба 3. Движение глаз.jpg') },
]

// Подпись цены: 0 показываем как «бесплатно»
export const priceText = (p) => (p === 0 ? 'бесплатно' : `${p} ₽`)
