import { useEffect, useMemo, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { BrandLogo } from '../components/BrandLogo'

const colorPalette = ['#7b61ff', '#ff6a5b', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max)
}

function calcGrowth(series) {
  if (!series || series.length < 2) return 0
  const first = series[0]
  const last = series[series.length - 1]
  return first === 0 ? 0 : (last - first) / first
}

function averageArrays(arrays) {
  if (!arrays.length) return []
  const length = arrays[0].length
  const sums = new Array(length).fill(0)
  arrays.forEach((series) => series.forEach((value, index) => {
    sums[index] += value
  }))
  return sums.map((value) => Math.round(value / arrays.length))
}

function transformExploreData(rawData) {
  if (!rawData?.categories) return { months: [], citySeries: {}, categoryNames: [] }

  const categoryNames = Object.keys(rawData.categories)
  const firstCategory = rawData.categories[categoryNames[0]]
  const months = (firstCategory?.labels || []).map((label) => {
    const date = new Date(`${label}-01`)
    return date.toLocaleDateString('en-US', { month: 'short' })
  })

  const citySeries = {}
  const cities = Object.keys(firstCategory?.cities || {})
  cities.forEach((city) => {
    citySeries[city] = {}
    categoryNames.forEach((category) => {
      citySeries[city][category] = rawData.categories[category].cities[city]
    })
  })

  return { months, citySeries, categoryNames }
}

function getCityData(citySeries, city) {
  if (city === 'all') {
    const firstCity = Object.keys(citySeries)[0]
    if (!firstCity) return {}
    const categories = Object.keys(citySeries[firstCity])
    return categories.reduce((accumulator, category) => {
      accumulator[category] = averageArrays(Object.values(citySeries).map((cityData) => cityData[category]))
      return accumulator
    }, {})
  }

  return citySeries[city] || {}
}

function cityWeight(city) {
  const weights = {
    Karachi: 0.1,
    Lahore: 0.08,
    Islamabad: 0.07,
    Rawalpindi: 0.06,
    Faisalabad: 0.05,
    Multan: 0.05,
  }
  return weights[city] || 0.05
}

function budgetWeight(budget) {
  if (budget === 'high') return 0.1
  if (budget === 'mid') return 0.05
  return -0.08
}

function advantageWeight(values) {
  let total = 0
  values.forEach((value) => {
    if (value === 'experience') total += 0.06
    if (value === 'location') total += 0.04
    if (value === 'audience') total += 0.05
  })
  return total
}

function labelForScore(score) {
  if (score >= 0.78) return { title: 'High potential', tone: 'green' }
  if (score >= 0.62) return { title: 'Promising with focus', tone: 'amber' }
  if (score >= 0.48) return { title: 'Medium — test and validate', tone: 'amber' }
  return { title: 'Caution — validate more', tone: 'red' }
}

function getTopMovers(citySeries) {
  const pakistanData = getCityData(citySeries, 'all')
  return Object.keys(pakistanData)
    .map((category) => ({
      category,
      growth: calcGrowth(pakistanData[category]),
      momentum: pakistanData[category][pakistanData[category].length - 1],
    }))
    .sort((left, right) => right.growth - left.growth)
    .slice(0, 4)
}

function getInsights(citySeries, city) {
  const data = getCityData(citySeries, city)
  const entries = Object.keys(data).map((category) => ({
    category,
    growth: calcGrowth(data[category]),
    last: data[category][data[category].length - 1],
  }))

  if (!entries.length) return []

  const hottest = [...entries].sort((left, right) => right.growth - left.growth)[0]
  const stable = [...entries].sort((left, right) => Math.abs(left.growth) - Math.abs(right.growth))[0]
  const volume = [...entries].sort((left, right) => right.last - left.last)[0]

  return [
    {
      tone: 'High momentum',
      badge: 'green',
      text: `${hottest.category} is the fastest riser here with ~${Math.round(hottest.growth * 100)}% growth over the last 6 months.`,
    },
    {
      tone: 'Steady',
      badge: 'amber',
      text: `${stable.category} is growing steadily; good for operators who prefer predictable demand.`,
    },
    {
      tone: 'High volume',
      badge: 'ghost',
      text: `${volume.category} shows the highest demand score right now—competition will be higher, so differentiate on niche and experience.`,
    },
  ]
}

function getCategoryHeat(citySeries, city, category) {
  const data = getCityData(citySeries, city)
  const series = data[category] || Object.values(data)[0] || []
  const growth = calcGrowth(series)
  const latest = series[series.length - 1] || 0
  return clamp((growth * 0.6) + ((latest / 150) * 0.4), 0, 1)
}

function getRecommendations(score, category, city, advantages, budget) {
  const recommendations = []
  if (score >= 0.62) {
    recommendations.push('Lock a niche within the category (audience, ticket size, or service level).')
    recommendations.push('Pilot with a 4-week budget and track CAC, repeat purchase, and payback time.')
  } else {
    recommendations.push('Run a small test (landing page + ads or WhatsApp lead form) before committing capital.')
    recommendations.push('Collect 50-100 leads to see conversion and pricing tolerance.')
  }

  if (budget === 'low') recommendations.push('Start asset-light: sublet kitchens, consignment inventory, or pre-orders to de-risk cash.')
  if (!advantages.includes('audience')) recommendations.push('Partner with micro-creators or local communities to get your first 200 customers.')
  if (!advantages.includes('location') && category === 'Cloud Kitchen') recommendations.push('Use delivery-only ghost kitchens or shared kitchens to avoid lease risk.')
  recommendations.push(`Watch competitors in ${city}: pricing, delivery time, and offers — differentiate with speed or specialization.`)

  return recommendations.slice(0, 4)
}

export function ExplorePage() {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const [months, setMonths] = useState([])
  const [citySeries, setCitySeries] = useState({})
  const [city, setCity] = useState('all')
  const [probCity, setProbCity] = useState('Karachi')
  const [category, setCategory] = useState('Cloud Kitchen')
  const [idea, setIdea] = useState('')
  const [budget, setBudget] = useState('low')
  const [advantages, setAdvantages] = useState(['experience'])
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.body.classList.add('explore-page')
    return () => document.body.classList.remove('explore-page')
  }, [])

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
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch('/data/explore_data.json')
      if (!response.ok) {
        throw new Error('Failed to load explore data')
      }
      const rawData = await response.json()
      const transformed = transformExploreData(rawData)
      setMonths(transformed.months)
      setCitySeries(transformed.citySeries)
      if (Object.keys(transformed.citySeries).length) {
        setCity('all')
      }
    }

    loadData().catch(() => {
      setMonths([])
      setCitySeries({})
    })
  }, [])

  const chartData = useMemo(() => {
    const data = getCityData(citySeries, city)
    const categories = Object.keys(data)
    return categories
      .map((name) => ({ name, growth: calcGrowth(data[name]), last: data[name][data[name].length - 1] || 0, series: data[name] }))
      .sort((left, right) => right.last - left.last)
      .slice(0, 4)
      .map((item, index) => ({
        label: item.name,
        data: item.series,
        borderColor: colorPalette[index % colorPalette.length],
        backgroundColor: colorPalette[index % colorPalette.length],
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
        borderWidth: 3,
      }))
  }, [citySeries, city])

  const topMovers = useMemo(() => getTopMovers(citySeries), [citySeries])
  const insights = useMemo(() => getInsights(citySeries, city), [citySeries, city])

  const probability = useMemo(() => {
    const effectiveCategory = category === 'Other' ? 'Cloud Kitchen' : category
    const base = 0.48
    const heat = getCategoryHeat(citySeries, probCity, effectiveCategory)
    const scoreRaw = base + heat * 0.22 + cityWeight(probCity) + budgetWeight(budget) + advantageWeight(advantages)
    const score = clamp(scoreRaw, 0.18, 0.92)
    return {
      score,
      label: labelForScore(score),
      recommendations: getRecommendations(score, category, probCity, advantages, budget),
    }
  }, [advantages, budget, category, citySeries, probCity])

  useEffect(() => {
    if (!canvasRef.current || !months.length || !chartData.length) return

    if (chartRef.current) {
      chartRef.current.data.labels = months
      chartRef.current.data.datasets = chartData
      chartRef.current.update()
      return
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: months,
        datasets: chartData,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { color: '#4b5563' },
          },
          x: {
            ticks: { color: '#4b5563' },
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.formattedValue}`,
            },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [chartData, months])

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  const toggleAdvantage = (value) => {
    setAdvantages((current) => (
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    ))
  }

  return (
    <div className="page-shell explore-page">
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
            <a href="/">Home</a>
            <a href="/explore" aria-current="page">Explore</a>
            <a href="/learn">Learn</a>
            <a className="signin" href="/login">Sign In</a>
            <a className="signup" href="/start">Sign Up</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="explore-hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">Pakistan Market Pulse</div>
              <h1>Explore trending businesses and city-by-city momentum</h1>
              <p className="lead">See where demand is rising, slice by city, and get a quick probability check for your idea before you invest.</p>
              <div className="hero-meta">
                <span className="chip">Updated weekly</span>
                <span className="chip ghost">City-level signals</span>
                <span className="chip ghost">Category trend lines</span>
              </div>
              <div className="hero-cta">
                <a className="btn primary" href="/login?next=/chat">Chat about my idea</a>
                <a className="btn ghost" href="#probability">Check probability</a>
              </div>
            </div>
            <div className="hero-panel">
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <p className="small-label">Fast view</p>
                    <h3>Top movers this week</h3>
                  </div>
                  <span className="pill pill-green">Live</span>
                </div>
                <div className="panel-list" id="topMovers">
                  {topMovers.map((item) => (
                    <div className="panel-row" key={item.category}>
                      <div>
                        <div className="label-strong">{item.category}</div>
                        <div className="muted">Pakistan · trend score {item.momentum}</div>
                      </div>
                      <span className="pill pill-green">+{Math.round(item.growth * 100)}%</span>
                    </div>
                  ))}
                </div>
                <div className="panel-foot">
                  <span className="muted">Signals from marketplace search, registrations, and delivery volume proxies.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="explore-section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="small-label">City slicer</p>
                <h2>Trend lines by city and category</h2>
              </div>
              <div className="filters">
                <label htmlFor="citySelect" className="input-label">City</label>
                <select id="citySelect" value={city} onChange={(event) => setCity(event.target.value)}>
                  <option value="all">All Pakistan</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>
            </div>

            <div className="explore-grid">
              <div className="card chart-card">
                <div className="card-head">
                  <div>
                    <p className="small-label">Momentum</p>
                    <h3>Monthly trend score</h3>
                  </div>
                  <div className="pill pill-amber" id="cityPulse">{city === 'all' ? 'Pakistan view' : `${city} view`}</div>
                </div>
                <canvas ref={canvasRef} id="trendChart" aria-label="Trend chart" role="img"></canvas>
                <div className="chart-legend" id="legend">
                  {chartData.map((dataset) => (
                    <span className="legend-item" key={dataset.label}>
                      <span className="dot" style={{ background: dataset.borderColor }}></span>{dataset.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card insights">
                <div className="card-head">
                  <p className="small-label">Highlights</p>
                  <h3>What this means</h3>
                </div>
                <div className="insight-list" id="insightList">
                  {insights.map((item) => (
                    <div className="insight" key={item.tone}>
                      <div className={`pill pill-${item.badge}`}>{item.tone}</div>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="probability" className="explore-section probability">
          <div className="container probability-grid">
            <div>
              <p className="small-label">Fast probability check</p>
              <h2>See if your business fits the city</h2>
              <p className="lead">A lightweight scoring helper using city demand, category heat, and basics like budget. Use it as a directional guide, not a guarantee.</p>
              <div className="pill pill-ghost">Human judgment still required</div>
            </div>
            <div className="card probability-card">
              <form id="probabilityForm" className="probability-form" onSubmit={handleSubmit}>
                <label className="input-label" htmlFor="ideaInput">Business idea</label>
                <input id="ideaInput" type="text" placeholder="e.g., Cloud kitchen for desi bowls" required value={idea} onChange={(event) => setIdea(event.target.value)} />

                <label className="input-label" htmlFor="categorySelect">Business type</label>
                <select id="categorySelect" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="Cloud Kitchen">Cloud Kitchen</option>
                  <option value="Boutique Fashion">Boutique Fashion</option>
                  <option value="EdTech Bootcamp">EdTech Bootcamp</option>
                  <option value="Used Cars">Used Cars</option>
                  <option value="Pharmacy Delivery">Pharmacy Delivery</option>
                  <option value="Home Bakery">Home Bakery</option>
                  <option value="Other">Other</option>
                </select>

                <label className="input-label" htmlFor="probCitySelect">City</label>
                <select id="probCitySelect" value={probCity} onChange={(event) => setProbCity(event.target.value)}>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                </select>

                <label className="input-label" htmlFor="budgetSelect">Budget runway</label>
                <select id="budgetSelect" value={budget} onChange={(event) => setBudget(event.target.value)}>
                  <option value="low">Under PKR 1.5M</option>
                  <option value="mid">PKR 1.5M – 4M</option>
                  <option value="high">Above PKR 4M</option>
                </select>

                <label className="input-label">Advantages</label>
                <div className="checkbox-group">
                  <label><input type="checkbox" value="experience" checked={advantages.includes('experience')} onChange={() => toggleAdvantage('experience')} /> You have relevant experience</label>
                  <label><input type="checkbox" value="location" checked={advantages.includes('location')} onChange={() => toggleAdvantage('location')} /> You already have a location/lease</label>
                  <label><input type="checkbox" value="audience" checked={advantages.includes('audience')} onChange={() => toggleAdvantage('audience')} /> You have an online audience</label>
                </div>

                <button type="submit" className="btn primary full">Calculate probability</button>
              </form>
              <div className="probability-result" id="probabilityResult">
                <div className="score" id="score">{Math.round(probability.score * 100)}%</div>
                <div className="score-label" id="scoreLabel">{submitted ? probability.label.title : 'Awaiting input'}</div>
                <p className="muted" id="scoreNote">{submitted ? `${idea || 'Your idea'} in ${probCity}: based on trend heat, budget, and your edges.` : 'We will use the trend signals above plus your inputs.'}</p>
                <div className="recommendations" id="recommendations">
                  {submitted && probability.recommendations.map((item) => (
                    <div className="rec-item" key={item}>{item}</div>
                  ))}
                </div>
              </div>
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