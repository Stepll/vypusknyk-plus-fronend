import { Link } from 'react-router-dom'
import { Button } from 'antd'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="nf-page">
      <div className="nf-card">

        <div className="nf-ribbon-wrap">
          <svg viewBox="0 0 600 140" xmlns="http://www.w3.org/2000/svg" className="nf-ribbon-svg">
            <defs>
              <linearGradient id="nf-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="50%" stopColor="#1a56a0" />
                <stop offset="50%" stopColor="#FFD500" />
              </linearGradient>
              <linearGradient id="nf-sheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
              </linearGradient>
            </defs>
            <rect x="4" y="14" width="594" height="112" rx="8" fill="#0d3a7a" opacity="0.18" />
            <rect x="0" y="8" width="600" height="112" rx="8" fill="url(#nf-grad)" />
            <rect x="0" y="8" width="600" height="112" rx="8" fill="url(#nf-sheen)" />
            <text
              x="300" y="90"
              textAnchor="middle"
              fontSize="72"
              fontFamily="'Times New Roman', serif"
              fontStyle="italic"
              fontWeight="700"
              fill="#e8e8e8"
            >
              404
            </text>
          </svg>
        </div>

        <h1 className="nf-title">Ця сторінка пішла на випускний</h1>
        <p className="nf-subtitle">
          Схоже, ця сторінка отримала атестат і покинула школу
        </p>

        <Link to="/catalog">
          <Button type="primary" className="nf-btn">
            Повернутись до каталогу
          </Button>
        </Link>

      </div>
    </div>
  )
}
