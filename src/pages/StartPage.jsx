import { useEffect } from 'react'
import { BrandLogo } from '../components/BrandLogo'

export function StartPage() {
  useEffect(() => {
    const nav = document.querySelector('.nav')
    const body = document.body

    const onScroll = () => {
      if (!nav || !body) return
      if (window.scrollY > 0) {
        nav.classList.add('scrolled')
        body.classList.add('scrolled')
      } else {
        nav.classList.remove('scrolled')
        body.classList.remove('scrolled')
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="page-shell start-page">
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">
            <BrandLogo />
            <div className="brand-text">
              <span className="brand-name">ShurukerAi</span>
            </div>
          </div>
          <nav />
        </div>
      </header>

      <main>
        <section className="info" style={{ padding: '80px 0' }}>
          <div className="container">
            <div className="card" style={{ padding: '24px' }}>
              <h2>Welcome to ShurukerAi!</h2>
              <p>Ready to launch your business idea? Let's get started with your AI-powered business assistant.</p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexDirection: 'column', maxWidth: '420px' }}>
                <a className="btn primary" href="/login?next=/chat" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  Start Chatting Now
                </a>
                <a className="btn ghost" href="/" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">© 2025 ShurukerAi</div>
      </footer>
    </div>
  )
}