import { useEffect, useMemo, useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { getFirebaseAuth, getGoogleProvider } from '../lib/firebase'
import { apiUrl } from '../lib/api'

export function FreelancerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState('')

  const auth = useMemo(() => getFirebaseAuth(), [])
  const googleProvider = useMemo(() => getGoogleProvider(), [])

  useEffect(() => {
    document.body.classList.add('freelancer-login-page')
    return () => document.body.classList.remove('freelancer-login-page')
  }, [])

  const showError = (message) => setErrorMessage(message)

  const verifyAndValidateFreelancer = async (user) => {
    const idToken = await user.getIdToken()

    const verifyResponse = await fetch(apiUrl('/verify-token'), {
      method: 'POST',
      credentials: 'include',                         // ← required for session cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })

    if (!verifyResponse.ok) {
      throw new Error('Session verification failed. Please try again.')
    }

    const meResponse = await fetch('/api/me', {
      credentials: 'include',                         // ← required for session cookie
    })
    const meData = await meResponse.json()

    if (!meResponse.ok) {
      throw new Error('Could not validate freelancer account.')
    }

    if (!meData.isFreelancer) {
      throw new Error('This email is not registered as a freelancer account.')
    }

    if (!meData.isApprovedFreelancer) {
      throw new Error('Your freelancer account is pending admin approval.')
    }

    window.location.href = '/freelancer-inbox'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setLoading('signin')

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password)
      await verifyAndValidateFreelancer(result.user)
    } catch (error) {
      showError(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading('')
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage('')
    setLoading('google')

    try {
      const result = await signInWithPopup(auth, googleProvider)
      await verifyAndValidateFreelancer(result.user)
    } catch (error) {
      showError(error.message || 'Google login failed.')
    } finally {
      setLoading('')
    }
  }

  return (
    <>
      <style>{`body.freelancer-login-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 430px;
  padding: 40px 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-header .logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 auto 16px;
}

.login-header h1 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.oauth-button,
.auth-button {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.oauth-button {
  border: 1px solid #e0e0e0;
  background: white;
  margin-bottom: 16px;
}

.oauth-button:hover {
  background: #f8f8f8;
}

.auth-button {
  border: none;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-top: 8px;
}

.auth-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
}

.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 7px; }
.form-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
}

.divider {
  display: flex;
  align-items: center;
  margin: 18px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider-text {
  padding: 0 10px;
  color: #999;
  font-size: 12px;
  font-weight: 600;
}

.error-message {
  display: none;
  margin-top: 12px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #f8b4b4;
  background: #fff5f5;
  color: #c53030;
  font-size: 13px;
}

.error-message.show {
  display: block;
}

.helper-links {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #666;
}

.helper-links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}
`}</style>
      <div className="login-container">
        <div className="login-header">
          <div className="logo">F</div>
          <h1>Freelancer Login</h1>
          <p>Sign in with your registered freelancer account</p>
        </div>

        <button type="button" className="oauth-button" id="googleSignIn" onClick={handleGoogleSignIn} disabled={loading === 'google'}>
          {loading === 'google' ? 'Signing in with Google...' : 'Sign in with Google'}
        </button>

        <div className="divider">
          <div className="divider-line"></div>
          <div className="divider-text">OR</div>
          <div className="divider-line"></div>
        </div>

        <form id="signInForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signinEmail">Email</label>
            <input type="email" id="signinEmail" placeholder="freelancer@email.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="signinPassword">Password</label>
            <input type="password" id="signinPassword" placeholder="Your password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>

          <button type="submit" className="auth-button" id="signinBtn" disabled={loading === 'signin'}>
            {loading === 'signin' ? 'Signing in...' : 'Sign In as Freelancer'}
          </button>
          <div className={`error-message${errorMessage ? ' show' : ''}`} id="signinError">{errorMessage}</div>
        </form>

        <div className="helper-links">
          Not registered as freelancer? <a href="/register-freelancer">Apply here</a><br />
          General user login: <a href="/login">Open login</a>
        </div>
      </div>
    </>
  )
}