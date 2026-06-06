import { useState } from 'react'
import { BrandLogo } from '../components/BrandLogo'
import ServicesDropdown from '../components/ServicesDropdown'
export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="page-shell home-page">
      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="/" aria-label="ShurukerAi home">
            <BrandLogo />
            <div className="brand-text">
              <span className="brand-name">ShurukerAi</span>
              <small className="brand-slogan">Pakistan's Smart Business Launch Partner</small>
            </div>
          </a>

          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span><span></span><span></span>
          </button>
          <nav className={`nav-links${menuOpen ? ' mobile-open' : ''}`}>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false) }}>Features</a>
            <a href="#solution" onClick={(e) => { e.preventDefault(); document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false) }}>Solution</a>
            <a href="/explore" onClick={() => setMenuOpen(false)}>Explore</a>
            <ServicesDropdown />
            <a className="signin" href="/login" onClick={() => setMenuOpen(false)}>Sign In</a>
            <a className="signup" href="/start" onClick={() => setMenuOpen(false)}>Sign Up</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1>Work Smarter With Every Chat</h1>
              <p className="lead">Our AI assistant helps you validate ideas, build launch-ready business plans, and get practical step-by-step guidance—24/7.</p>

              <div className="hero-cta">
                <a className="btn primary" href="/login?next=/chat">Get Started Free</a>
                <a className="btn ghost" href="/learn" target="_blank" rel="noopener noreferrer">Learn More</a>
              </div>

              <ul className="features-list">
                <li>Idea Validation</li>
                <li>Market Research (Pakistan-focused)</li>
                <li>30-day Launch Roadmap</li>
              </ul>

            </div>

            <div className="hero-preview">
              <div className="card">
                <div className="card-header">
                  <div className="avatar">S</div>
                  <div className="user">Shuruker</div>
                </div>
                <div className="card-body">
                  <div className="mock-chat">
                    <div className="bubble user">Hi, I want to start a clothing store in Lahore. Help me plan it.</div>
                    <div className="bubble bot">Great! Let's walk through target customers, startup budget and a 30-day roadmap.</div>
                    <div className="bubble user">How do I estimate costs?</div>
                  </div>
                </div>
                <div className="card-footer">
                  <input placeholder="Ask anything—e.g., 'Launch plan for a cafe'" aria-label="Ask anything" />
                  <button className="mini">Ask</button>
                </div>
              </div>
            </div>
          </div>

          <svg className="hero-decor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#7b61ff"/><stop offset="50%" stopColor="#ff6a5b"/><stop offset="100%" stopColor="#ffc857"/></linearGradient></defs><rect width="800" height="400" fill="url(#g)" opacity="0.08" rx="30"/></svg>
        </section>

        <section id="features" className="info">
          <div className="container">
            <h2>What ShurukerAi can do for you</h2>
            <div className="grid">
              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="url(#g1)" /><defs><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs></svg>
                  </div>
                  <div className="meta">Market Analysis</div>
                  <div className="desc">Pakistan-specific market research, competitor benchmarks, and pricing insights to validate opportunities.</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="9" r="4" fill="url(#g2)" /><path d="M11 14h2v2h-2z" fill="#fff" opacity=".9" /><defs><linearGradient id="g2" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs></svg>
                  </div>
                  <div className="meta">Idea Validation</div>
                  <div className="desc">Quickly assess whether your idea has demand, identify unique angles, and reduce risk before you invest.</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 13h6v6H4zM14 4h6v6h-6z" fill="url(#g3)" /><defs><linearGradient id="g3" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs></svg>
                  </div>
                  <div className="meta">Business Strategy</div>
                  <div className="desc">Actionable business models, pricing and positioning to make your idea competitive and scalable.</div>
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a3 3 0 100-6 3 3 0 000 6zM4 20a8 8 0 0116 0H4z" fill="url(#g4)" /><defs><linearGradient id="g4" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs></svg>
                  </div>
                  <div className="meta">Target Audience</div>
                  <div className="desc">Define customer segments, preferences, and channels to reach them effectively in Pakistan.</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    {/* Growth Roadmap: map/route icon */}
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" stroke="url(#g5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 4v13M15 7v13" stroke="url(#g5)" strokeWidth="1.5" />
                      <defs><linearGradient id="g5" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs>
                    </svg>
                  </div>
                  <div className="meta">Growth Roadmap</div>
                  <div className="desc">A 30-day rollout plan with weekly milestones, KPIs, and quick wins to gain traction fast.</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h3l4 6 5-10 6 6" stroke="url(#g6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><defs><linearGradient id="g6" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs></svg>
                  </div>
                  <div className="meta">Marketing Insights</div>
                  <div className="desc">Channel suggestions, messaging, and low-cost growth tactics tailored for your audience.</div>
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3" width="16" height="18" rx="2" fill="url(#g7)" /><defs><linearGradient id="g7" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs></svg>
                  </div>
                  <div className="meta">Startup Planning</div>
                  <div className="desc">Budget estimates, legal steps, and operations checklists to get your company set up correctly.</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    {/* Actionable Recommendations: checklist/clipboard icon */}
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="5" width="16" height="15" rx="2" stroke="url(#g8)" strokeWidth="1.5" />
                      <path d="M8 3h8v4H8z" stroke="url(#g8)" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M9 12l2 2 4-4" stroke="url(#g8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <defs><linearGradient id="g8" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs>
                    </svg>
                  </div>
                  <div className="meta">Actionable Recommendations</div>
                  <div className="desc">Clear next steps and templates you can immediately use to move from idea to execution.</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-inner">
                  <div className="icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="url(#g9)" strokeWidth="1.4" /><path d="M12 7v6l4 2" stroke="url(#g9)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><defs><linearGradient id="g9" x1="0" x2="1"><stop offset="0" stopColor="#7b61ff" /><stop offset="1" stopColor="#ff6a5b" /></linearGradient></defs></svg>
                  </div>
                  <div className="meta">24/7 Available</div>
                  <div className="desc">Ask questions whenever you need and receive clear, prioritized steps whenever for any business need.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solution" className="use-cases">
          <div className="container">
            <h2>Use Cases by Industry</h2>
            <p className="use-cases-lead">See how ShurukerAi helps different businesses plan smarter and launch faster.</p>
            <div className="use-cases-grid">
              <article className="use-case-card">
                <h3>Clothing & Fashion</h3>
                <p>Get pricing strategy, supplier planning, and launch ideas for boutiques and apparel brands.</p>
              </article>
              <article className="use-case-card">
                <h3>Food & Cafes</h3>
                <p>Plan menus, estimate startup costs, and build local marketing steps for restaurants and cafes.</p>
              </article>
              <article className="use-case-card">
                <h3>Service Businesses</h3>
                <p>Create offers, define target clients, and map practical growth actions for service providers.</p>
              </article>
              <article className="use-case-card">
                <h3>Online Stores</h3>
                <p>Validate products, select sales channels, and design a simple go-to-market roadmap for e-commerce.</p>
              </article>
              <article className="use-case-card">
                <h3>Home-Based Startups</h3>
                <p>Build low-budget launch plans, prioritize essentials, and reduce risk before expanding operations.</p>
              </article>
              <article className="use-case-card">
                <h3>Local Retail</h3>
                <p>Improve positioning, footfall strategy, and customer retention for neighborhood stores.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="services" className="services-highlight">
          <div className="container services-highlight-inner">
            <div>
              <h3>Freelancer Services</h3>
              <p>Need expert execution support? Connect with specialists or join as a freelancer.</p>
            </div>
            <div className="services-actions">
              <a className="btn ghost" href="/freelancers">Find Freelancer</a>
              <a className="btn primary" href="/register-freelancer">Register as Freelancer</a>
            </div>
          </div>
        </section>

        <section id="start" className="cta-band">
          <div className="container cta-inner">
            <div>
              <h3>Ready to launch your idea?</h3>
              <p>Get a tailored 30-day plan and budget with a single chat.</p>
            </div>
            <div>
              <a className="btn primary large" href="/login?next=/chat">Get Started</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">© 2025 ShurukerAi — Built for Pakistani entrepreneurs.</div>
      </footer>
    </div>
  )
}
