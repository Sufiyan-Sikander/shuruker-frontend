import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

const FEATURED_CATEGORIES = [
  { name: 'Ad Manager', icon: '📊' },
  { name: 'Marketing Consultant', icon: '📈' },
  { name: 'Strategic Planner', icon: '🎯' },
  { name: 'Business Consultant', icon: '💼' },
]

const pageStyles = `
.freelancers-category-page {
  min-height: 100vh;
}

.category-hero {
  background: linear-gradient(135deg, #7b61ff, #ff6a5b);
  color: white;
  padding: 40px 20px;
}

.category-hero-content {
  max-width: 1000px;
  margin: 0 auto;
}

.breadcrumb {
  font-size: 13px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.breadcrumb a {
  color: white;
  text-decoration: none;
  cursor: pointer;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.category-hero h1 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
}

.category-hero p {
  font-size: 16px;
  opacity: 0.95;
}

.category-content {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.filters-section {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.filter-chip:hover,
.filter-chip.active {
  border-color: #7b61ff;
  background: rgba(123, 97, 255, 0.1);
  color: #7b61ff;
}

.freelancers-page {
  min-height: 100vh;
}

.freelancers-hero {
  background: linear-gradient(135deg, #7b61ff, #ff6a5b);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.freelancers-hero h1 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
}

.freelancers-hero p {
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 24px;
}

.freelancers-page {
  min-height: 100vh;
}

.freelancers-hero {
  background: linear-gradient(135deg, #7b61ff, #ff6a5b);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.freelancers-hero h1 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
}

.freelancers-hero p {
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 24px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.category-card:hover {
  border-color: #7b61ff;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(123, 97, 255, 0.15);
}

.category-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.category-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.category-count {
  font-size: 13px;
  color: #888;
}

.freelancers-content {
  max-width: 1000px;
  margin: -40px auto 40px;
  padding: 0 20px;
}

.freelancers-list {
  display: grid;
  gap: 20px;
}

.freelancer-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.freelancer-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.freelancer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.freelancer-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.freelancer-category {
  display: inline-block;
  background: rgba(123, 97, 255, 0.1);
  color: #7b61ff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.freelancer-bio {
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.freelancer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.freelancer-links {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-small.primary {
  background: linear-gradient(135deg, #7b61ff, #ff6a5b);
  color: white;
}

.btn-small.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(123, 97, 255, 0.3);
}

.btn-small.secondary {
  background: white;
  border: 1px solid #ddd;
  color: #1a1a1a;
}

.btn-small.secondary:hover {
  background: #fafafa;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.empty-state-text {
  color: #888;
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(123, 97, 255, 0.3);
  border-top-color: #7b61ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 12px;
  color: #666;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #ffa500;
}

.results-info {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}
`

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text || ''
  return div.innerHTML
}

function formatCount(count) {
  return `${count} specialist${count === 1 ? '' : 's'}`
}

function formatRating(value) {
  const rating = Number(value || 0)
  return `${'★'.repeat(Math.floor(rating))}${'☆'.repeat(Math.max(0, 5 - Math.floor(rating)))}`
}

function categoryLabel(category) {
  return category ? category.replace(/\s+/g, ' ').trim() : ''
}

function FreelancerCard({ freelancer, categoryView }) {
  const messageHref = `/client-messages?freelancer=${encodeURIComponent(freelancer.id)}`

  return (
    <div className="freelancer-card">
      <div className="freelancer-header">
        <div className={categoryView ? 'freelancer-info' : undefined}>
          <div className={categoryView ? undefined : 'freelancer-name'}>{categoryView ? <h3>{freelancer.fullName}</h3> : freelancer.fullName}</div>
          {categoryView ? (
            <div className="freelancer-email">{freelancer.email || ''}</div>
          ) : (
            <span className="freelancer-category">{freelancer.category}</span>
          )}
        </div>
        <div className="rating">
          {formatRating(freelancer.rating)}
          <span>{freelancer.rating || 'New'}</span>
        </div>
      </div>
      <div className="freelancer-bio">{categoryView ? freelancer.bio : `${freelancer.bio?.substring?.(0, 150) || ''}${freelancer.bio?.length > 150 ? '...' : ''}`}</div>
      <div className="freelancer-footer">
        <div className="freelancer-links">
          {freelancer.portfolioPdfUrl ? (
            <a href={freelancer.portfolioPdfUrl} target="_blank" rel="noreferrer" className="btn-small secondary" title="View Portfolio">
              📄 Portfolio
            </a>
          ) : null}
          {freelancer.portfolioLink ? (
            <a href={freelancer.portfolioLink} target="_blank" rel="noreferrer" className="btn-small secondary">
              🔗 Website
            </a>
          ) : null}
        </div>
        <a href={messageHref} className="btn-small primary">
          💬 {categoryView ? 'Message Now' : 'Message'}
        </a>
      </div>
    </div>
  )
}

export function FreelancersPage() {
  const params = useParams()
  const category = useMemo(() => categoryLabel(params.category || ''), [params.category])
  const categoryView = Boolean(category)
  const [freelancers, setFreelancers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.classList.add('freelancers-page')
    return () => document.body.classList.remove('freelancers-page')
  }, [])

  useEffect(() => {
    document.title = categoryView ? `${category} — ShurukerAi Freelancers` : 'Find Expert Freelancers — ShurukerAi'
  }, [categoryView, category])

  useEffect(() => {
    let active = true

    const loadFreelancers = async () => {
      setLoading(true)
      setError('')

      try {
        const url = category ? `/api/freelancers?category=${encodeURIComponent(category)}` : '/api/freelancers'
        const response = await fetch(url)
        const data = await response.json()

        if (!active) return

        if (response.ok && Array.isArray(data.freelancers)) {
          setFreelancers(data.freelancers)
        } else {
          setFreelancers([])
          setError(data.error || 'Failed to load specialists')
        }
      } catch (loadError) {
        if (!active) return
        setFreelancers([])
        setError('Failed to load specialists')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadFreelancers()
    return () => {
      active = false
    }
  }, [category])

  const categoryCounts = useMemo(() => {
    return FEATURED_CATEGORIES.reduce((accumulator, item) => {
      accumulator[item.name] = freelancers.filter((freelancer) => freelancer.category === item.name).length
      return accumulator
    }, {})
  }, [freelancers])

  return (
    <>
      <style>{pageStyles}</style>

      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="/" aria-label="ShurukerAi home">
            <div className="logo"><img src="/images/logo2.png" alt="ShurukerAi logo" /></div>
            <div className="brand-text">
              <span className="brand-name">ShurukerAi</span>
              <small className="brand-slogan">Pakistan's Smart Business Launch Partner</small>
            </div>
          </a>

          <nav className="nav-links">
            <a href="/">Home</a>
            {categoryView ? <a href="/freelancers">All Specialists</a> : null}
            <div className="nav-dropdown">
              <a href="/freelancers" className="dropdown-toggle">Services</a>
              <div className="dropdown-menu">
                <a href="/register-freelancer">Register as Freelancer</a>
                <a href="/freelancer-login">Freelancer Login</a>
                <a href="/freelancers">Find Freelancer</a>
              </div>
            </div>
            <a className="signin" href="/login">Sign In</a>
          </nav>
        </div>
      </header>

      <main className={categoryView ? 'freelancers-category-page' : 'freelancers-page'}>
        {categoryView ? (
          <>
            <section className="category-hero">
              <div className="category-hero-content">
                <div className="breadcrumb">
                  <a href="/freelancers">All Specialists</a> / <span>{category}</span>
                </div>
                <h1>{category}</h1>
                <p>Connect with expert {category.toLowerCase()}s ready to help your business grow</p>
              </div>
            </section>

            <section className="category-content">
              <div className="results-info">
                Showing <strong id="resultCount">{freelancers.length}</strong> specialist<span id="pluralText">{freelancers.length === 1 ? '' : 's'}</span>
              </div>

              <div id="freelancersContainer">
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <div style={{ marginTop: '12px', color: '#666' }}>Loading specialists...</div>
                  </div>
                ) : error ? (
                  <p style={{ textAlign: 'center', color: '#d32f2f' }}>{error}</p>
                ) : freelancers.length > 0 ? (
                  <div className="freelancers-list">
                    {freelancers.map((freelancer) => (
                      <FreelancerCard key={freelancer.id} freelancer={freelancer} categoryView />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-title">No Specialists Found Yet</div>
                    <div className="empty-state-text">Be the first to join as a {category} and start helping entrepreneurs!</div>
                    <a href="/register-freelancer" className="btn primary">Register Now</a>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="freelancers-hero">
              <div className="container">
                <h1>Expert Freelancers Ready to Help</h1>
                <p>Connect with specialists in your industry and grow your business</p>
              </div>
            </section>

            <div className="freelancers-content">
              <div className="categories-grid" id="categoriesGrid">
                {FEATURED_CATEGORIES.map((item) => (
                  <a key={item.name} href={`/freelancers/${encodeURIComponent(item.name)}`} className="category-card">
                    <div className="category-icon">{item.icon}</div>
                    <div className="category-name">{item.name}</div>
                    <div className="category-count" id={`count-${item.name}`}>
                      {formatCount(categoryCounts[item.name] || 0)}
                    </div>
                  </a>
                ))}
              </div>

              <section style={{ marginTop: '60px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1a1a1a' }}>Featured Specialists</h2>

                <div id="freelancersContainer">
                  {loading ? (
                    <div className="loading">
                      <div className="spinner"></div>
                      <div className="loading-text">Loading specialists...</div>
                    </div>
                  ) : error ? (
                    <p style={{ textAlign: 'center', color: '#d32f2f' }}>{error}</p>
                  ) : freelancers.length > 0 ? (
                    <div className="freelancers-list">
                      {freelancers.map((freelancer) => (
                        <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div>
                      <div className="empty-state-title">No Specialists Available Yet</div>
                      <div className="empty-state-text">Check back soon or register as a freelancer to join our network.</div>
                      <a href="/register-freelancer" className="btn primary">Become a Specialist</a>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="container">© 2025 ShurukerAi — Built for Pakistani entrepreneurs.</div>
      </footer>
    </>
  )
}

export default FreelancersPage