import { useEffect, useRef, useState } from 'react'
import './styles.css'
import Dialog from './Dialog.jsx'
import { COLORS, TARIFFS, priceText } from './content.js'
import EnrollDialog from './EnrollDialog.jsx'
import cursor from './assets/cursor.webp'
import logo from './assets/logo.webp'
import poster from './assets/poster.webp'
import posterWide from './assets/poster-wide.webp'
import promo1 from './assets/promo-1.webp'
import promo2 from './assets/promo-2.webp'
import folderToys from './assets/folder-toys.webp'
import folderKid from './assets/folder-kid.webp'
import kidLabel from './assets/kid-label.webp'
import folderGreen from './assets/folder-green.webp'
import folderCactus from './assets/folder-cactus.webp'
import folderVideo from './assets/folder-video.webp'
import folderTiger from './assets/folder-tiger.webp'

const LETTERS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ'.split('')
// главная страница (учитывает base из Vite)
const HOME = import.meta.env.BASE_URL || '/'

const NAV = [['parents', 'Родителям', COLORS.green], ['glossary', 'Глоссарий', COLORS.cactus], ['handy', 'Подручный', COLORS.red], ['tariffs', 'Тарифы', COLORS.tiger]]


function Folder({ img, cls = '', deco, label, aria, onClick }) {
  return (
    <button type="button" className={`folder ${cls}`} onClick={onClick} aria-label={aria}>
      {deco}
      <img className="bg" src={img} alt="" />
      {label && <span className="label">{label}</span>}
    </button>
  )
}

function Tariff({ name, img, color, badge, intro, items, price, onEnroll }) {
  return (
    <article className="tariff" style={{ '--tc': color }}>
      {badge && <div className="t-badge">{badge}</div>}
      <div className="t-head">
        <img className="bg" src={img} alt="" />
        <h3 className="t-name">{name}</h3>
      </div>
      <div className="t-body">
        <p className="t-intro">{intro}</p>
        <ul className="t-list">{items.map((t) => <li key={t}>{t}</li>)}</ul>
        <div className="t-foot">
          <span className="t-price">Цена: <strong>{priceText(price)}</strong></span>
          <button type="button" className="t-btn" aria-haspopup="dialog" onClick={onEnroll}>Записаться</button>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const [open, setOpen] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [promoAlt, setPromoAlt] = useState(false) // какое фото показано в блоке под главным: false — первое, true — второе
  const [activeId, setActiveId] = useState(null) // раздел, который сейчас на экране
  const trackRef = useRef(null)
  const [slide, setSlide] = useState(0)
  // слайдер тарифов (на телефоне): какая карточка сейчас ближе к левому краю
  const slideLeft = (i) => {
    const el = trackRef.current
    return el.children[i].offsetLeft - parseFloat(getComputedStyle(el).paddingLeft)
  }
  const onTrackScroll = () => {
    const el = trackRef.current
    if (!el) return
    let best = 0, dist = Infinity
    for (let i = 0; i < el.children.length; i++) {
      const d = Math.abs(slideLeft(i) - el.scrollLeft)
      if (d < dist) { dist = d; best = i }
    }
    setSlide(best)
  }
  // клик по логотипу — на главную: в начало страницы без перезагрузки, меню закрывается, #раздел убирается из адреса
  const goHome = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try { window.history.replaceState(null, '', window.location.pathname + window.location.search) } catch { /* ignore */ }
  }
  const goSlide = (i) => trackRef.current.scrollTo({ left: slideLeft(i), behavior: 'smooth' })
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [menuOpen])
  useEffect(() => { // на широком экране меню не нужно
    const mq = window.matchMedia('(min-width: 761px)')
    const on = () => mq.matches && setMenuOpen(false)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 24)
      setShowTop(window.scrollY > 700)
      const line = window.innerHeight * 0.4 // «линия чтения»: последний раздел, верх которого выше неё
      let cur = null
      for (const [id] of NAV) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) cur = id
      }
      setActiveId(cur)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const go = (id) => () => setOpen({ id })

  return (
    <div className="wrap">
      <header className={scrolled ? 'scrolled' : ''} style={activeId ? { '--accent': NAV.find(([id]) => id === activeId)[2] } : undefined}>
        <div className="hbar">
        <a className="logo-link" href={HOME} onClick={goHome} aria-label="Сезонный трек для родителей детей с ТМНР «Свой ориентир» — на главную">
            <img className="logo" src={logo} alt="" />
          </a>
        <nav>{NAV.map(([id, t]) => <a key={id} href={`#${id}`} aria-current={activeId === id ? 'true' : undefined}>{t}</a>)}</nav>
        <button type="button" className="burger" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        </div>
      </header>
      <div className="hspace" aria-hidden="true" />

      <div id="mobile-menu" className={`menu${menuOpen ? ' open' : ''}`}>
        <nav className="menu-links" aria-label="Разделы">
          {NAV.map(([id, t, c], i) => (
            <a key={id} href={`#${id}`} style={{ '--mc': c, '--i': i }} aria-current={activeId === id ? 'true' : undefined} onClick={() => setMenuOpen(false)}>{t}<span className="mt-arrow" aria-hidden="true">→</span></a>
          ))}
        </nav>
      </div>

      <section className="hero">
        <div className="cover">
          <picture>
            <source media="(max-width: 760px)" srcSet={posterWide} />
            <img src={poster} alt="Сезонный трек для родителей детей с ТМНР «Свой ориентир»" />
          </picture>
        </div>
        <div className="side">
          <div className="intro">
            <p><span className="lead">Сезонный трек «Свой ориентир» </span>— это бережное пространство и понятная опора для родителей детей с ТМНР. Мы знаем, сколько сил и времени может уходить на ежедневную заботу о ребёнке. Когда всё держится на вас, легко потерять точку опоры и остаться один на один с тревогой.</p>
            <p>Что ждёт вас внутри сезона:</p>
            <ul>
              <li>– <b>Понятные разборы без лишней информации.</b> Разбор сложных задач из жизни, чтобы Вы сразу знали, какой шаг сделать следующим.</li>
              <li>– <b>Поддержка окружающих.</b> Безопасное пространство, где можно выдохнуть, задать наболевший вопрос или просто порассуждать без страха осуждения.</li>
              <li>– <b>Проверенные ориентиры.</b> Готовые памятки, чек-листы и инструкции, которые экономят ваше время и нервы.</li>
            </ul>
            <p><span className="lead">«Свой ориентир» </span>— это Ваш личный маршрут в кругу людей, которые понимают без лишних слов. Выбирайте комфортный формат участия, выделяйте для себя важное и помните — Вы не одни.</p>
          </div>
          <div className="sand">
            <img className="kid-label" src={kidLabel} alt="" />
            <span>МОЖНО ЧТО-ТО<br />ПРО РАЗДЕЛЫ</span>
          </div>
        </div>
      </section>

      <section className="promo">
        <div className="promo-media">
          <img className={promoAlt ? '' : 'on'} src={promo1} alt="Мама сидит рядом с плачущим малышом и поддерживает его" aria-hidden={promoAlt} />
          <img className={promoAlt ? 'on' : ''} src={promo2} alt="Малыш с радостью играет с цветными сенсорными материалами" aria-hidden={!promoAlt} loading="lazy" decoding="async" />
        </div>
        <div className="promo-side">
          <button type="button" className="switch" role="switch" aria-checked={promoAlt} aria-label="Сменить изображение" onClick={() => setPromoAlt(!promoAlt)}>
            <span className="switch-knob" />
          </button>
          <p className="promo-text">С помощью трека Вы найдете инструменты к развитию коммуникативного потенциала с Вашим ребенком. <span className="lead">Довольны будут все!</span></p>
        </div>
      </section>

      <section id="parents">
        <h2>Родителям</h2>
        <div className="fgrid toy-row">
          <Folder img={folderToys} cls="toys" label="Входной диагностический тест" onClick={go('diag')} />
          <Folder img={folderGreen} label="Клинические кейсы" onClick={go('cases')} />
        </div>
      </section>

      <section id="glossary">
        <h2>
          Глоссарий{' '}
          <img className="cursor" src={cursor} alt="" />
        </h2>
        <div className="letters">
          {LETTERS.map((l) => (
            <button key={l} type="button" aria-haspopup="dialog" onClick={() => setOpen({ letter: l })}>{l}</button>
          ))}
        </div>
        <div className="fgrid">
          <Folder img={folderCactus} cls="cactus" label="Ошибки родителя в начале обучения" onClick={go('errors')} />
          <Folder img={folderCactus} cls="cactus" label="Мифы про неговорящих" onClick={go('myths')} />
        </div>
      </section>

      <section id="handy">
        <div className="fgrid toy-row">
          <Folder img={folderKid} cls="kid" label="Микрошаги к самостоятельности" onClick={go('micro')} />
          <Folder img={folderVideo} cls="vid" aria="Смотреть видео" onClick={go('video')} />
        </div>
      </section>

      <section id="tariffs">
        <h2>Тарифы</h2>
        <div className="tgrid" ref={trackRef} onScroll={onTrackScroll}>
          <Tariff name="Знакомство" img={folderGreen} color={COLORS.green} price={0} onEnroll={() => setOpen({ tariff: 'intro' })}
            intro="Идеально для того, чтобы ознакомиться с форматом и найти для себя первые ответы."
            items={['Доступ к вводному модулю и базовым памяткам платформы.', 'Участие в одной открытой встрече-знакомстве с куратором и родителями.', 'Доступ в общий чат сезона для навигации и общения.', 'Возможность перейти на основной тариф “Полный ориентир” в любой момент.']} />
          <Tariff name="Полный ориентир" img={folderTiger} color={COLORS.tiger} price={799} onEnroll={() => setOpen({ tariff: 'full' })} badge="Методический инструментарий в 🎁"
            intro="Для тех, кому нужны видеоинструкции и глубокая поддержка на протяжении всего сезона."
            items={['Короткие и содержательные уроки, которые можно смотреть в любое время (записи остаются у вас).', 'Все рабочие материалы: шаблоны заявлений, чек-листы и пошаговые алгоритмы действий.', 'Регулярные онлайн-созвоны в малых группах, где можно разобрать вашу конкретную ситуацию.', 'Возможность задать свой вопрос эксперту и получить адресный разбор.']} />
        </div>
        <div className="tdots" role="group" aria-label="Выбор тарифа">
          {Object.values(TARIFFS).map((t, i) => (
            <button key={t.title} type="button" aria-label={`Тариф «${t.title}»`} aria-current={slide === i ? 'true' : undefined} onClick={() => goSlide(i)} />
          ))}
        </div>
      </section>

      <button type="button" className={`totop${showTop ? ' show' : ''}`} aria-label="Наверх" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="totop-label" aria-hidden="true">Наверх</span>
        <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {open && (open.tariff
        ? <EnrollDialog tariff={open.tariff} onClose={() => setOpen(null)} />
        : <Dialog data={open} onClose={() => setOpen(null)} />)}
    </div>
  )
}
