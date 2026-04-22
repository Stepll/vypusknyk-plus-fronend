import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getInfoPage, type InfoPageData } from '../../api/info-pages'
import './InfoPage.css'

export default function InfoPage() {
  const { pathname } = useLocation()
  const slug = pathname.split('/').filter(Boolean).pop() ?? ''
  const [page, setPage] = useState<InfoPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    getInfoPage(slug)
      .then(setPage)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="info-page">
        <div className="info-page__hero" />
        <div className="info-page__container">
          <div className="info-page__skeleton" />
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="info-page">
        <div className="info-page__container" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <p className="info-page__not-found">Сторінку не знайдено</p>
        </div>
      </div>
    )
  }

  return (
    <div className="info-page">
      <div className="info-page__hero">
        <div className="info-page__hero-content">
          <h1 className="info-page__title">{page.title}</h1>
          {page.updatedAt && (
            <p className="info-page__updated">
              Оновлено: {new Date(page.updatedAt).toLocaleDateString('uk-UA')}
            </p>
          )}
        </div>
      </div>

      <div className="info-page__container">
        <div className="info-page__body">
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
