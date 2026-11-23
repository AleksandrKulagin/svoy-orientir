import { useCallback, useEffect, useRef, useState } from 'react'

const FOCUSABLE = 'button, input, textarea, select, a[href]'
const CLOSE_MS = 140 // = --t-out в styles.css (.overlay)

// Окно в виде папки: заголовок во вкладке, цвет задаётся через color.
// children может быть функцией: (close) => ... — чтобы кнопка внутри окна закрывала его с анимацией.
export default function FolderWindow({ title, color, onClose, panelClass = '', variant = 'full', children }) {
  const ref = useRef(null)
  const closingRef = useRef(false)
  const [closing, setClosing] = useState(false)

  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return onClose()
    setClosing(true)
    setTimeout(onClose, CLOSE_MS)
  }, [onClose])

  useEffect(() => {
    const opener = document.activeElement
    const box = ref.current
    const onKey = (e) => {
      if (e.key === 'Escape') return close()
      if (e.key !== 'Tab') return
      const items = [...box.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled)
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    box.querySelector('input, textarea, .close')?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      opener?.focus?.({ preventScroll: true })
    }
  }, [])

  const cls = `${variant}${closing ? ' closing' : ''}`
  return (
    <div className={`overlay ${cls}`} onMouseDown={close}>
      <div ref={ref} className={`ofolder ${cls}`} role="dialog" aria-modal="true" aria-labelledby="dlg-title"
        style={{ '--fc': color }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="otab">
          <h3 id="dlg-title" className="otab-title" title={title}>{title}</h3>
          <svg className="otab-slope" viewBox="0 0 110 54" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0H18C44 0 54 12 70 28C82 41 92 54 110 54H0Z" />
          </svg>
        </div>
        <div className="obody">
          <div className={`opanel ${panelClass}`}>{typeof children === 'function' ? children(close) : children}</div>
          <button type="button" className="close" aria-label="Закрыть" onClick={close}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
