import { useState } from 'react'
import './App.css'

const TARGET_LANGUAGES = [
  { code: 'en', name: '🇬🇧 English' },
  { code: 'fi', name: '🇫🇮 Finnish' },
  { code: 'fr', name: '🇫🇷 French' },
  { code: 'de', name: '🇩🇪 German' },
  { code: 'it', name: '🇮🇹 Italian' },
  { code: 'pt', name: '🇵🇹 Portuguese' },
  { code: 'es', name: '🇪🇸 Spanish' },
]

async function translateWithRetry(text, targetLang, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      // 🔥 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: с русского (ru) на целевой язык
      const langPair = `ru|${targetLang}`
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`

      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (data.responseStatus === 200) return data.responseData.translatedText
      if (data.responseStatus === 403 || data.responseStatus === 429) {
        throw new Error('Лимит переводов превышен. Попробуйте позже.')
      }
      throw new Error(data.responseDetails || 'Ошибка перевода')
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Сервер не отвечает. Попробуйте ещё раз.')
      }
      if (attempt === maxRetries) throw err
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}

function App() {
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const [targetLang, setTargetLang] = useState('en') // целевой язык
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTranslate = async () => {
    if (!text.trim()) return
    setIsLoading(true)
    setError(null)
    setTranslation('')

    try {
      const result = await translateWithRetry(text.trim(), targetLang)
      setTranslation(result)
    } catch (err) {
      console.error('Translation error:', err)
      setError(err.message || 'Не удалось перевести текст')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🌍 Переводчик</h1>
        <p className="subtitle">С русского → на выбранный язык</p>
      </header>
      <main className="main">
        <div className="translator-card">
          <div className="translator-controls">
            <span className="lang-source">🇷🇺 Русский</span>
            <span className="arrow">→</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {TARGET_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="translator-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст на русском..."
            rows="4"
          />
          <button
            className="btn btn-translate"
            onClick={handleTranslate}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? '⏳ Перевожу...' : '🔄 Перевести'}
          </button>

          {error && <div className="error-msg">❌ {error}</div>}

          <div className="translator-output">
            {translation ? (
              <p>{translation}</p>
            ) : (
              <p className="placeholder">Перевод появится здесь...</p>
            )}
          </div>

          <div className="api-note">
            💡 Бесплатный API. Поддерживает:{' '}
            {TARGET_LANGUAGES.map((l) => l.name.split(' ')[1]).join(', ')}.
          </div>
        </div>
      </main>
      <footer className="footer">
        <code>ПЕРЕВОДЧИК/</code> • React + Vite
      </footer>
    </div>
  )
}
export default App
