// Vite-плагин: список видео собирается из папки public/videos автоматически.
//  • любой файл mp4 / webm / mov / m4v / ogv в папке становится видео на сайте;
//  • если рядом лежит картинка с тем же именем (Проба 1.mp4 + Проба 1.jpg), она станет постером этого видео;
//  • если рядом лежит текстовый файл с тем же именем (Проба 1.mp4 + Проба 1.txt), он станет описанием видео;
//  • порядок — по имени файла, числа учитываются как числа («Проба 2» раньше «Проба 10»).
// Новый файл подхватывается сразу (в режиме разработки страница перезагрузится сама), для готовой сборки — при следующей сборке.
import fs from 'node:fs'
import path from 'node:path'

const VIDEO = /\.(mp4|webm|mov|m4v|ogv)$/i
const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i
const TEXT = /\.txt$/i
const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' })
const key = (s) => s.normalize('NFC').toLowerCase()

export function scanVideos(dir) {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir)
  const posters = new Map(files.filter((f) => IMAGE.test(f)).map((f) => [key(f.replace(IMAGE, '')), f]))
  const texts = new Map(files.filter((f) => TEXT.test(f)).map((f) => [key(f.replace(TEXT, '')), f]))
  return files
    .filter((f) => VIDEO.test(f))
    .sort(collator.compare)
    .map((file) => {
      const name = file.replace(VIDEO, '').normalize('NFC')
      return { name, file, poster: posters.get(key(name)) || null, desc: texts.get(key(name)) || null }
    })
}

export default function videosPlugin({ dir = 'public/videos' } = {}) {
  const ID = 'virtual:videos'
  const RESOLVED = '\0' + ID
  let folder
  return {
    name: 'videos-from-folder',
    configResolved(config) { folder = path.resolve(config.root, dir) },
    resolveId(id) { if (id === ID) return RESOLVED },
    load(id) { if (id === RESOLVED) return `export default ${JSON.stringify(scanVideos(folder))}` },
    configureServer(server) {
      server.watcher.add(folder)
      const onChange = (file) => {
        if (path.dirname(path.resolve(file)) !== folder) return
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', onChange).on('unlink', onChange)
    },
  }
}
