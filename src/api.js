// Отправка заявки. Адрес обработчика задайте в файле .env:  VITE_ENROLL_URL=https://ваш-адрес
export async function sendEnrollment(data) {
  const url = import.meta.env.VITE_ENROLL_URL
  if (!url) {
    console.info('VITE_ENROLL_URL не задан, заявка никуда не отправлена:', data)
    return
  }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
