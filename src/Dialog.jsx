import { useEffect, useState } from 'react'
import FolderWindow from './FolderWindow.jsx'
import { SECTIONS, TERMS, VIDEOS, GLOSSARY_COLOR } from './content.js'

const Play = ({ size }) => (
  <svg className="play-ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
  </svg>
)
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
    <path fill="currentColor" fillRule="evenodd" d="M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Zm4.2 3.6v6.8a.5.5 0 0 0 .76.43l5.4-3.4a.5.5 0 0 0 0-.86l-5.4-3.4a.5.5 0 0 0-.76.43Z" />
  </svg>
)
const GridIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" /></svg>
)
const ListIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
)

// 75 → «1:15», 3725 → «1:02:05»
function fmt(sec) {
  if (!Number.isFinite(sec)) return ''
  const t = Math.round(sec)
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60
  const ss = String(s).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

function VideoView() {
  const [i, setI] = useState(0)
  const [dur, setDur] = useState({}) // src → «m:ss», читается из файла
  const [bad, setBad] = useState({}) // src → true, если файл не открылся
  useEffect(() => {
    const probes = VIDEOS.filter((x) => x.src && !x.duration).map((x) => {
      const el = document.createElement('video')
      el.preload = 'metadata'
      el.onloadedmetadata = () => setDur((d) => ({ ...d, [x.src]: fmt(el.duration) }))
      el.onerror = () => setBad((b) => ({ ...b, [x.src]: true }))
      el.src = x.src
      return el
    })
    return () => probes.forEach((el) => { el.onloadedmetadata = el.onerror = null; el.removeAttribute('src'); el.load() })
  }, [])
  const [view, setView] = useState('icons') // icons | table
  const v = VIDEOS[i]
  return (
    <div className="video-view">
      <div className="vv-main">
        <p className="now">{v.title}</p>
        <div className="player">
          {v.embed ? (
            <iframe src={v.embed} title={v.title} allow="fullscreen; picture-in-picture" allowFullScreen />
          ) : v.src && !bad[v.src] ? (
            <video key={v.src} src={v.src} poster={v.poster} controls playsInline preload="metadata" onError={() => setBad((b) => ({ ...b, [v.src]: true }))} />
          ) : (
            <div className="player-empty"><Play size={84} /><span>Видео скоро появится</span></div>
          )}
        </div>
      </div>
      <div className="vv-side">
        <div className="vv-head">
          <span>Список видео</span>
          <div className="seg" role="group" aria-label="Вид списка">
            <button type="button" aria-pressed={view === 'icons'} onClick={() => setView('icons')}><GridIcon />Значки</button>
            <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}><ListIcon />Таблица</button>
          </div>
        </div>
        <ul className={`playlist ${view}`}>
          {view === 'table' && (
            <li className="pl-head" aria-hidden="true"><span>№</span><span /><span>Название</span><span>Продолжительность</span></li>
          )}
          {VIDEOS.map((x, n) => (
            <li key={n}>
              <button type="button" aria-current={n === i} onClick={() => setI(n)}>
                {view === 'table' && <span className="pl-num">{n + 1}</span>}
                <span className="pl-ico"><VideoIcon /></span>
                <span className="pl-title">{x.title}</span>
                <span className="pl-time">{x.duration || dur[x.src] || '—'}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Dialog({ data, onClose }) {
  if (data.id === 'video') {
    return (
      <FolderWindow title={SECTIONS.video.title} color={SECTIONS.video.color} panelClass="dark" onClose={onClose}>
        <VideoView />
      </FolderWindow>
    )
  }

  const isLetter = Boolean(data.letter)
  const section = SECTIONS[data.id]
  const terms = isLetter ? TERMS[data.letter] || [] : []

  const body = isLetter ? (
    terms.length ? (
      <dl>{terms.map((t) => <div key={t.term}><dt>{t.term}</dt><dd>{t.text}</dd></div>)}</dl>
    ) : (
      <p className="soon">Термины на букву «{data.letter}» скоро появятся.</p>
    )
  ) : (
    section.text.map((p, i) => <p key={i}>{p}</p>)
  )

  return (
    <FolderWindow title={isLetter ? 'Глоссарий' : section.title} color={isLetter ? GLOSSARY_COLOR : section.color}
      panelClass={isLetter ? 'letter' : ''} onClose={onClose}>
      {isLetter ? (
        <div className="letter-view">
          <div className="letter-side"><div className="letter3d" aria-hidden="true">{data.letter}</div></div>
          <div className="content"><span className="sr">Буква {data.letter}</span>{body}</div>
        </div>
      ) : (
        <div className="content">{body}</div>
      )}
    </FolderWindow>
  )
}
