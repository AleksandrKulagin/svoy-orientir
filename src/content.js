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

// Видео раздела. src — файл (mp4/webm), embed — ссылка для вставки (YouTube, RuTube, VK), poster — обложка (необязательно).
export const VIDEOS = [
  { title: 'Видео 1', duration: '', src: '', embed: '' },
  { title: 'Видео 2', duration: '', src: '', embed: '' },
  { title: 'Видео 3', duration: '', src: '', embed: '' },
]

// Подпись цены: 0 показываем как «бесплатно»
export const priceText = (p) => (p === 0 ? 'бесплатно' : `${p} ₽`)
