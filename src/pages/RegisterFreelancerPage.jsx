import { useEffect, useRef, useState } from 'react'

export function RegisterFreelancerPage() {
  const fileInputRef = useRef(null)
  const fileLabelRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [fileNameVisible, setFileNameVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successVisible, setSuccessVisible] = useState(false)
  const [loadingVisible, setLoadingVisible] = useState(false)
  const [emailReadOnly, setEmailReadOnly] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    category: '',
    bio: '',
    portfolioLink: '',
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'include' })
        if (response.ok) {
          const user = await response.json()
          if (user.email) {
            setEmailValue(user.email)
            setEmailReadOnly(true)
            setFormState((current) => ({ ...current, email: user.email }))
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
      }
    }

    loadUser()
  }, [])

  const showError = (message) => {
    setErrorMessage(message)
    setSuccessVisible(false)
  }

  const clearError = () => {
    setErrorMessage('')
  }

  const updateField = (field) => (event) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }))
  }

  const updateFileName = () => {
    const fileInput = fileInputRef.current
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return
    }

    const file = fileInput.files[0]
    const maxSize = 10 * 1024 * 1024

    if (file.type !== 'application/pdf') {
      showError('Please upload a PDF file')
      fileInput.value = ''
      setFileNameVisible(false)
      return
    }

    if (file.size > maxSize) {
      showError('File size must be less than 10MB')
      fileInput.value = ''
      setFileNameVisible(false)
      return
    }

    setFileName(`✓ ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
    setFileNameVisible(true)
    clearError()
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    if (fileLabelRef.current) {
      fileLabelRef.current.style.borderColor = '#7b61ff'
      fileLabelRef.current.style.background = 'rgba(123, 97, 255, 0.05)'
    }
  }

  const handleDragLeave = () => {
    if (fileLabelRef.current) {
      fileLabelRef.current.style.borderColor = '#ddd'
      fileLabelRef.current.style.background = '#fafafa'
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const files = event.dataTransfer.files

    if (files.length > 0 && fileInputRef.current) {
      fileInputRef.current.files = files
      updateFileName()
    }

    handleDragLeave()
  }

  const submitFreelancerForm = async (event) => {
    event.preventDefault()

    const fullName = formState.fullName.trim()
    const email = (emailValue || formState.email).trim()
    const category = formState.category
    const bio = formState.bio.trim()
    const portfolioLink = formState.portfolioLink.trim()
    const portfolioFile = fileInputRef.current?.files?.[0]

    if (!fullName || !email || !category || !bio) {
      showError('Please fill in all required fields')
      return
    }

    if (bio.length < 50) {
      showError('Bio must be at least 50 characters')
      return
    }

    if (!portfolioFile) {
      showError('Please upload a portfolio PDF')
      return
    }

    setLoadingVisible(true)
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('fullName', fullName)
      formData.append('email', email)
      formData.append('category', category)
      formData.append('bio', bio)
      formData.append('portfolioLink', portfolioLink)
      formData.append('portfolioFile', portfolioFile)

      const response = await fetch('/api/register-freelancer', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        clearError()
        setSuccessVisible(true)
        setFormState({
          fullName: '',
          email: emailReadOnly ? email : '',
          category: '',
          bio: '',
          portfolioLink: '',
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setFileNameVisible(false)
        window.setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        showError(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error:', error)
      showError('An error occurred. Please try again.')
    } finally {
      setLoadingVisible(false)
    }
  }

  return (
    <>
      <style>{`.freelancer-container {
  max-width: 600px;
  margin: 80px auto;
  padding: 0 20px;
}

.freelancer-form {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.form-header p {
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a1a1a;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #7b61ff;
  box-shadow: 0 0 0 3px rgba(123, 97, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: 'Inter', sans-serif;
}

.form-group small {
  display: block;
  color: #888;
  margin-top: 6px;
  font-size: 12px;
}

.file-upload {
  position: relative;
  display: inline-block;
  width: 100%;
}

.file-upload input[type='file'] {
  display: none;
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-upload label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 24px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload label:hover {
  border-color: #7b61ff;
  background: rgba(123, 97, 255, 0.05);
}

.file-upload-content {
  text-align: center;
}

.file-upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.file-upload-text {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 600;
}

.file-upload-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.file-name {
  margin-top: 12px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #1a1a1a;
  display: none;
}

.file-name.active {
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn.primary {
  background: linear-gradient(135deg, #7b61ff, #ff6a5b);
  color: white;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(123, 97, 255, 0.3);
}

.btn.secondary {
  background: white;
  border: 1px solid #ddd;
  color: #1a1a1a;
}

.btn.secondary:hover {
  background: #fafafa;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  display: none;
  padding: 16px;
  background: #ecf9f0;
  border: 1px solid #a8e6d9;
  border-radius: 8px;
  color: #1a5a3e;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.success-message.show {
  display: block;
}

.error-message {
  display: none;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fdaba7;
  border-radius: 8px;
  color: #7a2424;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.error-message.show {
  display: block;
}

.loading {
  display: none;
  text-align: center;
  padding: 20px;
}

.loading.show {
  display: block;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(123, 97, 255, 0.3);
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
  font-size: 14px;
}
`}</style>
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
            <a href="/#features">Features</a>
            <a href="/explore">Explore</a>
            <a href="/freelancer-login">Freelancer Login</a>
            <a className="signin" href="/login">Sign In</a>
          </nav>
        </div>
      </header>

      <main className="freelancer-container">
        <div className="freelancer-form">
          <div className="form-header">
            <h1>Join Our Expert Network</h1>
            <p>Share your expertise and help Pakistani entrepreneurs succeed</p>
          </div>

          <div className={`success-message${successVisible ? ' show' : ''}`} id="successMessage">
            ✓ Registration successful! Your profile will be live soon.
          </div>

          <div className={`error-message${errorMessage ? ' show' : ''}`} id="errorMessage">{errorMessage}</div>

          <form id="freelancerForm" onSubmit={submitFreelancerForm}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input type="text" id="fullName" name="fullName" required placeholder="e.g., Ahmed Khan" value={formState.fullName} onChange={updateField('fullName')} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input type="email" id="email" name="email" required placeholder="your@email.com" value={emailValue || formState.email} onChange={(event) => { setEmailValue(event.target.value); setFormState((current) => ({ ...current, email: event.target.value })) }} readOnly={emailReadOnly} />
            </div>

            <div className="form-group">
              <label htmlFor="category">Specialization *</label>
              <select id="category" name="category" required value={formState.category} onChange={updateField('category')}>
                <option value="">Select your category</option>
                <option value="Ad Manager">Ad Manager</option>
                <option value="Marketing Consultant">Marketing Consultant</option>
                <option value="Strategic Planner">Strategic Planner</option>
                <option value="Business Consultant">Business Consultant</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bio">About You / Your Experience *</label>
              <textarea id="bio" name="bio" required placeholder="Tell us about your experience, skills, and what you can help entrepreneurs with..." value={formState.bio} onChange={updateField('bio')}></textarea>
              <small>Minimum 50 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="portfolioLink">Portfolio Website / LinkedIn (Optional)</label>
              <input type="url" id="portfolioLink" name="portfolioLink" placeholder="https://yourportfolio.com" value={formState.portfolioLink} onChange={updateField('portfolioLink')} />
            </div>

            <div className="form-group">
              <label>Portfolio/Past Work (PDF) *</label>
              <div className="file-upload">
                <input ref={fileInputRef} type="file" id="portfolioFile" name="portfolioFile" accept=".pdf" onChange={updateFileName} />
                <label
                  ref={fileLabelRef}
                  htmlFor="portfolioFile"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="file-upload-content">
                    <div className="file-upload-icon">📄</div>
                    <div className="file-upload-text">Click to upload or drag and drop</div>
                    <div className="file-upload-hint">PDF up to 10MB</div>
                  </div>
                </label>
                <div className={`file-name${fileNameVisible ? ' active' : ''}`} id="fileName">{fileName}</div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => window.history.back()}>Cancel</button>
              <button type="submit" className="btn primary" disabled={loadingVisible}>Submit Application</button>
            </div>

            <div className={`loading${loadingVisible ? ' show' : ''}`} id="loading">
              <div className="spinner"></div>
              <div className="loading-text">Uploading your profile...</div>
            </div>
          </form>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">© 2025 ShurukerAi — Built for Pakistani entrepreneurs.</div>
      </footer>
    </>
  )
}