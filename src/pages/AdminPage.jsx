import { useEffect, useMemo, useRef, useState } from 'react'

const pageStyles = `
/* admin page styles copied from template */
.admin-container{min-height:100vh;background:#f5f5f5}
.admin-header{background:linear-gradient(135deg,#7b61ff,#ff6a5b);color:#fff;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.admin-header-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
.admin-title h1{font-size:24px;font-weight:700;margin:0}.admin-title p{font-size:13px;opacity:.9;margin:4px 0 0}
.logout-btn{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3);padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600}
.admin-content{max-width:1200px;margin:40px auto;padding:0 20px}
.login-container{max-width:400px;margin:100px auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 4px 6px rgba(0,0,0,.07)}
.login-header{text-align:center;margin-bottom:30px}.login-header h2{font-size:24px;font-weight:700;margin-bottom:8px;color:#1a1a1a}.login-header p{color:#888;font-size:14px}
.form-group{margin-bottom:20px}.form-group label{display:block;font-weight:600;margin-bottom:8px;color:#1a1a1a;font-size:14px}
.form-group input{width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.login-btn{width:100%;padding:12px;background:linear-gradient(135deg,#7b61ff,#ff6a5b);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer}
.error-message{display:none;padding:12px;background:#fef2f2;border:1px solid #fdaba7;border-radius:6px;color:#7a2424;font-size:13px;margin-bottom:20px}
.freelancers-table{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);display:none}
.freelancers-table.active{display:block}
.table-header{background:#f9f9f9;padding:16px 20px;border-bottom:1px solid #eee;display:grid;grid-template-columns:1.2fr 1fr 1fr .8fr 1fr 1fr;gap:16px;font-size:13px;font-weight:600;color:#888}
.table-row{padding:16px 20px;border-bottom:1px solid #eee;display:grid;grid-template-columns:1.2fr 1fr 1fr .8fr 1fr 1fr;gap:16px;align-items:center}
.freelancer-name{font-weight:600;color:#1a1a1a;font-size:14px}
.freelancer-email{color:#666;font-size:13px}
.category-badge{display:inline-block;background:rgba(123,97,255,.1);color:#7b61ff;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600}
.status-badge{display:inline-block;background:#fff3cd;color:#856404;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600}
.action-buttons{display:flex;gap:8px}
.btn-action{padding:6px 12px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.btn-view{background:#fff;color:#7b61ff;border:1px solid #ddd}
.empty-state{text-align:center;padding:60px 20px;color:#888}
.spinner{display:inline-block;width:30px;height:30px;border:2px solid rgba(123,97,255,.3);border-top-color:#7b61ff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:40px}
.stat-card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.stat-label{font-size:13px;color:#888;margin-bottom:8px;font-weight:600}
.stat-value{font-size:32px;font-weight:700;color:#1a1a1a}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center}
.modal.active{display:flex}
.modal-content{background:#fff;border-radius:12px;padding:40px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto}
.modal-content{background:#fff;border-radius:12px;padding:24px;max-width:760px;width:94%;max-height:82vh;overflow-y:auto;overflow-x:hidden;box-sizing:border-box}
.modal-header{font-size:20px;font-weight:700;margin-bottom:20px;color:#1a1a1a}
.modal-actions{display:flex;gap:12px;justify-content:flex-end}
.modal-actions{display:flex;gap:12px;justify-content:flex-start;flex-wrap:wrap}
.modal-btn{padding:10px 20px;border:none;border-radius:6px;font-weight:600;cursor:pointer}
.modal-btn{padding:10px 16px;border:none;border-radius:8px;font-weight:600;cursor:pointer;min-width:110px}
.modal-btn-approve{background:#1a5a3e;color:#fff}
.modal-btn-reject{background:#7a2424;color:#fff}
.modal-btn-close{background:#fff;border:1px solid #ddd;color:#1a1a1a}
.modal-btn-remove{background:#f3f4f6;color:#111;border:1px solid #e5e7eb}
.modal-btn-restore{background:#f3f4f6;color:#111;border:1px solid #e5e7eb}
.modal-btn-delete{background:#f3f4f6;color:#111;border:1px solid #e5e7eb}

.modal-body{overflow-wrap:break-word;word-break:break-word}
.modal-field{margin-bottom:12px}
.modal-field-label{font-weight:700;color:#222;margin-bottom:6px}
.modal-field-value{color:#333}
`

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [freelancers, setFreelancers] = useState([])
  const [stats, setStats] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentFreelancer, setCurrentFreelancer] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (adminToken) loadFreelancers()
  }, [adminToken])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setModalOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const username = e.target.username.value
    const password = e.target.password.value
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token)
        setAdminToken(data.token)
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) { setError('An error occurred. Please try again.') }
  }

  async function loadFreelancers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/freelancers', { headers: { Authorization: `Bearer ${adminToken}` } })
      if (res.status === 401) { logout(); return }
      const data = await res.json()
      setFreelancers(data.freelancers || [])
      setStats(data.stats || {})
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  function logout() {
    localStorage.removeItem('adminToken')
    setAdminToken('')
    setFreelancers([])
    setStats({})
  }

  const filtered = useMemo(() => {
    return statusFilter === 'all' ? freelancers : freelancers.filter(f => (f.status || 'pending') === statusFilter)
  }, [freelancers, statusFilter])

  function openModal(f) {
    setCurrentFreelancer(f)
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setCurrentFreelancer(null) }

  async function runAction(id, actionPath = '', method = 'POST') {
    try {
      const suffix = actionPath ? `/${actionPath}` : ''
      const res = await fetch(`/api/admin/freelancers/${id}${suffix}`, { method, headers: { Authorization: `Bearer ${adminToken}` } })
      if (res.status === 401) { logout(); return }
      if (res.ok) { closeModal(); loadFreelancers() }
    } catch (err) { console.error(err) }
  }

  return (
    <div className="page-shell">
      <style>{pageStyles}</style>
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-inner">
            <div className="admin-title">
              <h1>⚙️ Admin Dashboard</h1>
              <p>Manage freelancer profiles</p>
            </div>
            <button className="logout-btn" style={{ display: adminToken ? 'inline-block' : 'none' }} onClick={logout}>Logout</button>
          </div>
        </header>

        <div className="admin-content">
          {!adminToken ? (
            <div className="login-container">
              <div className="login-header">
                <h2>Admin Login</h2>
                <p>Enter your credentials to access the dashboard</p>
              </div>
              {error ? <div className="error-message" style={{ display: 'block' }}>{error}</div> : null}
              <form id="loginForm" onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input id="username" name="username" required placeholder="Enter username" />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input id="password" name="password" type="password" required placeholder="Enter password" />
                </div>
                <button type="submit" className="login-btn">Login</button>
              </form>
            </div>
          ) : (
            <div className={`dashboard active`}>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-label">Pending Applications</div><div className="stat-value">{stats.pending || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Approved Freelancers</div><div className="stat-value">{stats.approved || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Rejected</div><div className="stat-value">{stats.rejected || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Soft Removed</div><div className="stat-value">{stats.removed || 0}</div></div>
              </div>

              <div>
                <div className="section-toolbar">
                  <h2 className="admin-section-title" style={{ marginBottom: 0 }}>Freelancer Profiles</h2>
                  <div className="filter-group">
                    <label htmlFor="statusFilter">Filter:</label>
                    <select id="statusFilter" className="status-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                </div>

                <div id="loadingState" className="loading" style={{ display: loading ? 'block' : 'none' }}>
                  <div className="spinner"></div>
                </div>

                <div id="freelancersTable" className={`freelancers-table ${filtered.length ? 'active' : ''}`}>
                  <div className="table-header">
                    <div>Name & Email</div>
                    <div>Category</div>
                    <div>Bio</div>
                    <div>Status</div>
                    <div>Portfolio</div>
                    <div>Actions</div>
                  </div>
                  <div id="tableContent">
                    {filtered.map((f, idx) => (
                      <div key={f.id} className="table-row">
                        <div>
                          <div className="freelancer-name">{f.fullName}</div>
                          <div className="freelancer-email">{f.email}</div>
                        </div>
                        <div><span className="category-badge">{f.category || 'N/A'}</span></div>
                        <div style={{ fontSize: 13, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(f.bio || '').substring(0, 50)}{(f.bio || '').length > 50 ? '...' : ''}</div>
                        <div><span className={`status-badge status-${f.status || 'pending'}`}>{(f.status || 'pending').charAt(0).toUpperCase() + (f.status || 'pending').slice(1)}</span></div>
                        <div>{f.portfolioPdfUrl ? <a href={f.portfolioPdfUrl} target="_blank" rel="noreferrer" style={{ color: '#7b61ff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>📄 PDF</a> : <span style={{ color: '#ccc', fontSize: 13 }}>N/A</span>}</div>
                        <div className="action-buttons"><button className="btn-action btn-view" onClick={() => openModal(f)}>View</button></div>
                      </div>
                    ))}
                  </div>
                </div>

                {!filtered.length && !loading ? (
                  <div id="emptyState" className="empty-state">
                    <div className="empty-state-icon">✓</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>All caught up!</div>
                    <div>No freelancer profiles to review</div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="detailsModal" className={`modal ${modalOpen ? 'active' : ''}`} ref={modalRef} onClick={(e) => { if (e.target === modalRef.current) closeModal() }}>
        <div className="modal-content">
          <div className="modal-header">Freelancer Details</div>
          <div className="modal-body">
            <div className="modal-field"><div className="modal-field-label">Full Name</div><div className="modal-field-value">{currentFreelancer?.fullName}</div></div>
            <div className="modal-field"><div className="modal-field-label">Email</div><div className="modal-field-value">{currentFreelancer?.email}</div></div>
            <div className="modal-field"><div className="modal-field-label">Category</div><div className="modal-field-value">{currentFreelancer?.category}</div></div>
            <div className="modal-field"><div className="modal-field-label">Bio</div><div className="modal-field-value">{currentFreelancer?.bio}</div></div>
            <div className="modal-field"><div className="modal-field-label">Portfolio Link</div><div className="modal-field-value">{currentFreelancer?.portfolioLink ? <a href={currentFreelancer.portfolioLink} target="_blank" rel="noreferrer">View External Portfolio</a> : <span style={{color:'#888'}}>N/A</span>}</div></div>
            <div className="modal-field"><div className="modal-field-label">Portfolio PDF</div><div className="modal-field-value">{currentFreelancer?.portfolioPdfUrl ? <a href={currentFreelancer.portfolioPdfUrl} target="_blank" rel="noreferrer">Download PDF</a> : <span style={{color:'#888'}}>N/A</span>}</div></div>
          </div>
          <div className="modal-actions">
            <button className="modal-btn modal-btn-approve" onClick={() => runAction(currentFreelancer.id, 'approve', 'POST')}>Approve</button>
            <button className="modal-btn modal-btn-reject" onClick={() => runAction(currentFreelancer.id, 'reject', 'POST')}>Reject</button>
            <button className="modal-btn modal-btn-remove" onClick={() => runAction(currentFreelancer.id, 'soft-remove', 'POST')}>Soft Remove</button>
            <button className="modal-btn modal-btn-restore" onClick={() => runAction(currentFreelancer.id, 'restore', 'POST')}>Restore</button>
            <button className="modal-btn modal-btn-delete" onClick={() => runAction(currentFreelancer.id, '', 'DELETE')}>Permanent Delete</button>
            <button className="modal-btn modal-btn-close" onClick={closeModal}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}