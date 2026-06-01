import { useEffect } from 'react'
import { BrandLogo } from '../components/BrandLogo'

export function LearnPage() {
  useEffect(() => {
    const btns = document.querySelectorAll('.btn')
    btns.forEach((button) => {
      button.addEventListener('click', () => {
        button.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }], {
          duration: 220,
        })
      })
    })

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            if (entry.target.classList.contains('hero-title')) {
              const underline = entry.target.querySelector('.gradient-underline')
              if (underline) underline.style.transform = 'scaleX(1)'
            }
          }
        })
      },
      { threshold: 0.14 },
    )

    document.querySelectorAll('[data-animate]').forEach((element) => observer.observe(element))
    const heroTitle = document.querySelector('.hero-title')
    if (heroTitle) observer.observe(heroTitle)

    const learnVideo = document.querySelector('.learn-video video')
    let autoplayTimer
    if (learnVideo) {
      try {
        learnVideo.muted = true
        autoplayTimer = window.setTimeout(() => {
          const playPromise = learnVideo.play()
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {})
          }
        }, 200)
      } catch (error) {
        void error
      }
    }

    const downloadBrochure = document.getElementById('download-brochure')
    const stopDownload = (event) => event.preventDefault()
    downloadBrochure?.addEventListener('click', stopDownload)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (autoplayTimer) window.clearTimeout(autoplayTimer)
      downloadBrochure?.removeEventListener('click', stopDownload)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="page-shell learn-page">
      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="/" aria-label="ShurukerAi home">
            <BrandLogo />
            <div className="brand-text">
              <span className="brand-name">ShurukerAi</span>
            </div>
          </a>
          <nav />
        </div>
      </header>

      <main>
        <section className="learn-hero">
          <div className="container">
            <div className="learn-card">
              <h1 className="hero-title" data-animate>
                Learn More About ShuruKer<span className="gradient-underline" />
              </h1>

              <div className="lead-paragraph" data-animate>
                <h2>What is ShuruKer?</h2>
                <p>
                  ShuruKer is an AI-powered platform designed to help aspiring entrepreneurs in Pakistan turn business ideas into clear, actionable startup plans. Whether you are at the idea stage or planning your launch, ShuruKer provides structured guidance using advanced AI and local market insights.
                </p>
              </div>

              <div className="learn-video" data-animate>
                <video autoPlay muted playsInline preload="metadata" poster="/images/image1.jpg" controls>
                  <source src="/images/video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <h2 data-animate>How ShuruKer Works</h2>
              <p data-animate>
                ShuruKer uses Retrieval-Augmented Generation (RAG) to combine AI intelligence with real-world business knowledge. Instead of giving generic advice, it retrieves relevant information and generates responses that are practical, structured, and aligned with the Pakistani market.
              </p>

              <ul data-animate className="list-features">
                <li>You share your business idea</li>
                <li>ShuruKer analyzes the idea using AI models</li>
                <li>Relevant business knowledge is retrieved</li>
                <li>You receive a step-by-step, easy-to-understand plan</li>
              </ul>

              <h2>What ShuruKer Offers</h2>
              <p>
                <strong>Market Analysis (Pakistan-Focused)</strong>
                <br />
                Understand local demand, customer behavior, and city-specific opportunities.
              </p>

              <p>
                <strong>Idea Validation</strong>
                <br />
                Check whether your business idea is feasible before investing time and money.
              </p>

              <p>
                <strong>Business Model Guidance</strong>
                <br />
                Get recommendations on pricing, revenue streams, and operational setup.
              </p>

              <p>
                <strong>Target Audience Identification</strong>
                <br />
                Discover who your ideal customers are and where to find them.
              </p>

              <p>
                <strong>Marketing Strategy</strong>
                <br />
                Learn how to promote your business using platforms popular in Pakistan.
              </p>

              <p>
                <strong>Competitor Insights</strong>
                <br />
                Analyze existing businesses and identify gaps in the market.
              </p>

              <p>
                <strong>Step-by-Step Roadmap</strong>
                <br />
                Clear next steps from idea to launch, explained in simple language.
              </p>

              <h2>Why ShuruKer?</h2>
              <ul>
                <li>Built specifically for Pakistan’s startup ecosystem</li>
                <li>Beginner-friendly and easy to understand</li>
                <li>Practical, actionable, and structured responses</li>
                <li>AI-powered but human-reviewed during development</li>
                <li>Saves time, reduces risk, and improves decision-making</li>
              </ul>

              <h2>Who Is ShuruKer For?</h2>
              <p>Students exploring entrepreneurship; first-time founders; small business owners; freelancers planning to scale; anyone with a business idea but no clear starting point.</p>

              <h2 data-animate>Our Vision</h2>
              <p data-animate>
                ShuruKer aims to become Pakistan’s most trusted AI startup companion — empowering individuals to confidently start, plan, and grow successful businesses using technology and local insights.
              </p>

              <div className="learn-actions">
                <a className="btn ghost" href="/">
                  Close
                </a>
                <a className="btn primary" href="/start">
                  Get Started
                </a>
                <a className="btn ghost" href="#" id="download-brochure">
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="learn-cta" role="region" aria-label="Start CTA">
          <div className="container cta-inner">
            <div>
              <strong>Ready to get a tailored plan?</strong>
              <div className="small">Start your journey with one chat — get a 30-day roadmap and budget.</div>
            </div>
            <div>
              <a className="btn primary" href="/start">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">© 2025 ShurukerAi</div>
      </footer>
    </div>
  )
}
