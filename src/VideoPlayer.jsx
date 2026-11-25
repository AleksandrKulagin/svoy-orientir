import { useCallback, useEffect, useRef, useState } from 'react'

// 75 → «1:15», 3725 → «1:02:05»
export function fmt(sec) {
  if (!Number.isFinite(sec)) return ''
  const t = Math.round(sec)
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60
  const ss = String(s).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
const saved = { volume: 1, muted: false } // громкость сохраняется при переключении роликов

const Icon = ({ children, size = 22 }) => <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{children}</svg>
const PLAY = <path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
const PAUSE = <><rect x="6" y="5" width="4.5" height="14" rx="1.5" fill="currentColor" /><rect x="13.5" y="5" width="4.5" height="14" rx="1.5" fill="currentColor" /></>
const SPEAKER = <path fill="currentColor" d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" />
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
const VOL_LOW = <>{SPEAKER}<path d="M15.2 9.3a3.6 3.6 0 0 1 0 5.4" {...line} /></>
const VOL_HIGH = <>{SPEAKER}<path d="M15.2 9.3a3.6 3.6 0 0 1 0 5.4M17.8 6.7a7.3 7.3 0 0 1 0 10.6" {...line} /></>
const VOL_OFF = <>{SPEAKER}<path d="M16 9.5l5 5M21 9.5l-5 5" {...line} /></>
const FS_ENTER = <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" {...line} />
const FS_EXIT = <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" {...line} />

// Свой плеер: пуск/пауза, перемотка, время, громкость, полный экран; клавиши: пробел/K, ←/→ (5 с), ↑/↓ (громкость), M, F
export default function VideoPlayer({ src, poster, onError }) {
  const box = useRef(null)
  const vid = useRef(null)
  const bar = useRef(null)
  const timer = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [buf, setBuf] = useState(0)
  const [vol, setVol] = useState(saved.volume)
  const [muted, setMuted] = useState(saved.muted)
  const [full, setFull] = useState(false)
  const [idle, setIdle] = useState(false)
  const [wait, setWait] = useState(false)
  const [drag, setDrag] = useState(false)

  useEffect(() => { vid.current.volume = saved.volume; vid.current.muted = saved.muted }, [])

  // плавный ход полоски, пока видео играет
  useEffect(() => {
    if (!playing || drag) return
    let id
    const tick = () => { setTime(vid.current.currentTime); id = requestAnimationFrame(tick) }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [playing, drag])

  // панель управления прячется через 2,5 с бездействия, пока видео играет
  const poke = useCallback(() => {
    setIdle(false)
    clearTimeout(timer.current)
    if (vid.current && !vid.current.paused) timer.current = setTimeout(() => setIdle(true), 2500)
  }, [])
  useEffect(() => { poke() }, [playing, poke])
  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    const on = () => setFull((document.fullscreenElement || document.webkitFullscreenElement) === box.current)
    document.addEventListener('fullscreenchange', on)
    document.addEventListener('webkitfullscreenchange', on)
    return () => { document.removeEventListener('fullscreenchange', on); document.removeEventListener('webkitfullscreenchange', on) }
  }, [])

  const toggle = () => { const v = vid.current; if (v.paused) v.play().catch(() => {}); else v.pause() }
  const seekTo = (t) => { const v = vid.current; const x = clamp(t, 0, dur || 0); v.currentTime = x; setTime(x) }
  const setVolume = (x) => { const v = vid.current; v.volume = clamp(x, 0, 1); v.muted = v.volume === 0 }
  const toggleMute = () => {
    const v = vid.current
    if (v.muted || v.volume === 0) { v.muted = false; if (v.volume === 0) v.volume = 0.5 } else v.muted = true
  }
  const toggleFull = () => {
    const el = box.current, v = vid.current
    if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document)
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen() // iPhone
  }

  // перемотка мышью/пальцем по полоске
  const seekAt = (e) => {
    const r = bar.current.getBoundingClientRect()
    seekTo(clamp((e.clientX - r.left) / r.width, 0, 1) * dur)
  }
  const onSeekKey = (e) => {
    const step = { ArrowLeft: -5, ArrowRight: 5, PageDown: -10, PageUp: 10 }[e.key]
    if (step) seekTo(vid.current.currentTime + step)
    else if (e.key === 'Home') seekTo(0)
    else if (e.key === 'End') seekTo(dur)
    else return
    e.preventDefault(); e.stopPropagation()
  }
  const onKey = (e) => {
    if (e.target !== e.currentTarget) return // кнопки и ползунки обрабатывают свои клавиши сами
    const v = vid.current
    if (e.key === ' ' || e.key === 'k' || e.key === 'K') toggle()
    else if (e.key === 'ArrowLeft') seekTo(v.currentTime - 5)
    else if (e.key === 'ArrowRight') seekTo(v.currentTime + 5)
    else if (e.key === 'ArrowUp') setVolume(v.volume + 0.1)
    else if (e.key === 'ArrowDown') setVolume(v.volume - 0.1)
    else if (e.key === 'm' || e.key === 'M') toggleMute()
    else if (e.key === 'f' || e.key === 'F') toggleFull()
    else return
    e.preventDefault()
  }

  // сколько секунд загружено вперёд от текущего места (браузер не всегда присылает progress, поэтому считаем по нескольким событиям)
  const syncBuf = () => {
    const v = vid.current
    let end = 0
    for (let i = 0; i < v.buffered.length; i++) if (v.buffered.start(i) <= v.currentTime + 0.1 && v.currentTime <= v.buffered.end(i)) end = v.buffered.end(i)
    setBuf(end)
  }

  const pct = (x) => `${dur ? clamp(x / dur, 0, 1) * 100 : 0}%`
  const shownVol = muted ? 0 : vol
  const total = fmt(dur) || '0:00'

  return (
    <div ref={box} role="group" aria-label="Видеоплеер" tabIndex={0} onKeyDown={onKey} onPointerMove={poke} onPointerDown={poke} onFocus={poke}
      className={`vp${playing ? ' playing' : ''}${idle ? ' idle' : ''}${full ? ' full' : ''}`}>
      <video ref={vid} className="vp-video" src={poster ? src : `${src}#t=0.001`} poster={poster} preload="metadata" playsInline
        onClick={toggle} onDoubleClick={toggleFull}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} onDurationChange={(e) => setDur(e.currentTarget.duration)}
        onProgress={syncBuf} onLoadedData={syncBuf} onCanPlay={() => { setWait(false); syncBuf() }} onSeeked={syncBuf}
        onTimeUpdate={(e) => { syncBuf(); if (!playing && !drag) setTime(e.currentTarget.currentTime) }}
        onWaiting={() => setWait(true)} onPlaying={() => setWait(false)}
        onVolumeChange={(e) => { const v = e.currentTarget; setVol(v.volume); setMuted(v.muted); saved.volume = v.volume; saved.muted = v.muted }}
        onError={onError} />
      {wait && playing && <span className="vp-spin" aria-hidden="true" />}
      <button type="button" className="vp-big" aria-label="Воспроизвести" aria-hidden={playing} tabIndex={playing ? -1 : 0} onClick={toggle}><Icon size={30}>{PLAY}</Icon></button>
      <div className="vp-bar">
        <div ref={bar} className={`vp-seek${drag ? ' drag' : ''}`} role="slider" tabIndex={0} aria-label="Перемотка"
          aria-valuemin={0} aria-valuemax={Math.round(dur) || 0} aria-valuenow={Math.round(time)} aria-valuetext={`${fmt(time) || '0:00'} из ${total}`}
          onPointerDown={(e) => { if (!dur) return; e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); seekAt(e) }}
          onPointerMove={(e) => { if (drag) seekAt(e) }} onPointerUp={() => setDrag(false)} onPointerCancel={() => setDrag(false)} onKeyDown={onSeekKey}>
          <div className="vp-track">
            <div className="vp-buf" style={{ width: pct(buf) }} />
            <div className="vp-played" style={{ width: pct(time) }} />
            <div className="vp-thumb" style={{ left: pct(time) }} />
          </div>
        </div>
        <div className="vp-row">
          <button type="button" className="vp-btn" aria-label={playing ? 'Пауза' : 'Воспроизвести'} onClick={toggle}><Icon>{playing ? PAUSE : PLAY}</Icon></button>
          <span className="vp-time">{fmt(time) || '0:00'} / {total}</span>
          <span className="vp-gap" />
          <div className="vp-volbox">
            <button type="button" className="vp-btn" aria-label={shownVol === 0 ? 'Включить звук' : 'Выключить звук'} onClick={toggleMute}><Icon>{shownVol === 0 ? VOL_OFF : shownVol < 0.5 ? VOL_LOW : VOL_HIGH}</Icon></button>
            <input type="range" className="vp-vol" min="0" max="1" step="0.05" value={shownVol} aria-label="Громкость" style={{ '--v': `${shownVol * 100}%` }} onChange={(e) => setVolume(+e.target.value)} />
          </div>
          <button type="button" className="vp-btn" aria-label={full ? 'Выйти из полноэкранного режима' : 'Во весь экран'} onClick={toggleFull}><Icon>{full ? FS_EXIT : FS_ENTER}</Icon></button>
        </div>
      </div>
    </div>
  )
}
