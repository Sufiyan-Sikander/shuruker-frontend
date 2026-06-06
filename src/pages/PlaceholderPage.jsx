import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'

export function PlaceholderPage({ title, description }) {
  return (
    <div className="page-shell placeholder-page">
      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="/" aria-label="ShurukerAi home">
            <BrandLogo />
            <div className="brand-text">
              <span className="brand-name">ShurukerAi</span>
              <small className="brand-slogan">Pakistan's Smart Business Launch Partner</small>
            </div>
          </a>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/learn">Learn</Link>
          </nav>
        </div>
      </header>

      <main className="placeholder-main">
        <div className="container">
          <div className="placeholder-card">
            <span className="eyebrow">React migration in progress</span>
            <h1>{title}</h1>
            <p>{description}</p>
            <Link className="btn primary" to="/">Back to Home</Link>
          </div>
        </div>
      </main>
    </div>
  )
}