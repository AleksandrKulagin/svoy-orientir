import { useState } from 'react'
import FolderWindow from './FolderWindow.jsx'
import { TARIFFS, priceText } from './content.js'
import { sendEnrollment } from './api.js'

export default function EnrollDialog({ tariff, onClose }) {
  const t = TARIFFS[tariff]
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [name, setName] = useState('')

  async function submit(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setName(data.name)
    setStatus('sending')
    try {
      await sendEnrollment({ ...data, tariff: t.title, price: t.price })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <FolderWindow variant="compact" title={`Запись: ${t.title}`} color={t.color} onClose={onClose}>
      {(close) => status === 'done' ? (
        <div className="thanks">
          <h4>Спасибо, {name}!</h4>
          <p>Заявка на тариф «{t.title}» оформлена. Мы свяжемся с вами по указанным контактам.</p>
          <button type="button" className="submit" onClick={close}>Закрыть</button>
        </div>
      ) : (
        <form className="form" onSubmit={submit}>
          <p className="tariff-line">Тариф «{t.title}» · {priceText(t.price)}</p>
          <label>Ваше имя<input name="name" required autoComplete="name" /></label>
          <label>Телефон или e-mail<input name="contact" required autoComplete="email" /></label>
          <label>Комментарий (необязательно)<textarea name="comment" rows="4" /></label>
          <label className="consent"><input type="checkbox" name="consent" required /> Согласен(на) на обработку персональных данных</label>
          {status === 'error' && <p role="alert" className="err">Не удалось отправить заявку. Попробуйте ещё раз.</p>}
          <button type="submit" className="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Отправляем…' : 'Записаться'}</button>
        </form>
      )}
    </FolderWindow>
  )
}
