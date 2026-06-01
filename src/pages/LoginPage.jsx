import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { getFirebaseAuth, getGoogleProvider } from '../lib/firebase'
import { apiUrl } from '../lib/api'

const initialState = {
  signupEmail: '',
  signupPassword: '',
  signupConfirm: '',
  signinEmail: '',
  signinPassword: '',
}

const auth = getFirebaseAuth()
const googleProvider = getGoogleProvider()

export function LoginPage() {
  const [showSignup, setShowSignup] = useState(true)
  const [values, setValues] = useState(initialState)
  const [signupError, setSignupError] = useState('')
  const [signinError, setSigninError] = useState('')
  const [successText, setSuccessText] = useState('Redirecting to chat...')
  const [successVisible, setSuccessVisible] = useState(false)
  const [loading, setLoading] = useState('')

  useEffect(() => {
    document.body.classList.add('login-page')

    // Handle redirect result after Google sign-in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await verifySession(result.user)
          showSuccess('Signed in with Google!')
          redirectAfterSuccess()
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error)
        setSigninError(error.message || 'Google sign-in failed')
      })

    return () => document.body.classList.remove('login-page')
  }, [])

  const updateField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  const getNextPath = () => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('next')
  }

  const showSuccess = (message) => {
    setSuccessText(message)
    setSuccessVisible(true)
  }

  const redirectAfterSuccess = () => {
    const redirectTo = getNextPath() || '/chat'
    window.setTimeout(() => {
      window.location.href = redirectTo
    }, 1500)
  }

  const verifySession = async (user) => {
    const idToken = await user.getIdToken()
    const response = await fetch(apiUrl('/verify-token'), {
      method: 'POST',
      credentials: 'include',                         // ← required for session cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      throw new Error('Session verification failed. Please try again.')
    }
  }

  const handleSignUp = (event) => {
    event.preventDefault()
    setSignupError('')

    if (values.signupPassword !== values.signupConfirm) {
      setSignupError('Passwords do not match')
      return
    }

    if (values.signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters')
      return
    }

    setLoading('signup')
    setSuccessVisible(false)

    createUserWithEmailAndPassword(auth, values.signupEmail.trim(), values.signupPassword)
      .then(async (result) => {
        await verifySession(result.user)
        showSuccess('Account created successfully!')
        setLoading('')
        redirectAfterSuccess()
      })
      .catch((error) => {
        setSignupError(error.message || 'Account creation failed')
        setLoading('')
      })
  }

  const handleSignIn = (event) => {
    event.preventDefault()
    setSigninError('')
    setLoading('signin')
    setSuccessVisible(false)

    signInWithEmailAndPassword(auth, values.signinEmail.trim(), values.signinPassword)
      .then(async (result) => {
        await verifySession(result.user)
        showSuccess('Signed in successfully!')
        setLoading('')
        redirectAfterSuccess()
      })
      .catch((error) => {
        setSigninError(error.message || 'Login failed. Please try again.')
        setLoading('')
      })
  }

  const handleGoogle = (target) => (event) => {
    event.preventDefault()
    setLoading(target)
    setSuccessVisible(false)
    // Use redirect instead of popup to avoid popup-blocked errors
    signInWithRedirect(auth, googleProvider)
  }

  return (
    <>
      <style>{`body.login-page {
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
  max-width: 420px;
  padding: 48px 32px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
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
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.auth-form {
  display: none;
}

.auth-form.active {
  display: block;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.auth-button {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 16px;
  font-family: 'Inter', sans-serif;
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.auth-button:active {
  transform: translateY(0);
}

.auth-button.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider-text {
  padding: 0 12px;
  color: #999;
  font-size: 12px;
  font-weight: 600;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.oauth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: white;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
}

.oauth-button:hover {
  border-color: #d0d0d0;
  background: #f8f8f8;
}

.oauth-button svg {
  width: 18px;
  height: 18px;
}

.toggle-form {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.toggle-form button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.toggle-form button:hover {
  text-decoration: underline;
}

.error-message {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
  display: none;
}

.error-message.show {
  display: block;
}

#authContainer {
  min-height: 100vh;
}

.success-message {
  display: none;
  text-align: center;
  padding: 24px;
}

.success-message.show {
  display: block;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
}

.success-message h2 {
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.success-message p {
  color: #666;
  margin: 0;
}
`}</style>
      <div id="authContainer" className="login-container">
        <form id="signUpForm" className={`auth-form${showSignup ? ' active' : ''}`} onSubmit={handleSignUp}>
          <div className="login-header">
            <div className="logo">S</div>
            <h1>Create Account</h1>
            <p>Join ShurukerAi and start your business journey</p>
          </div>

          <div className="oauth-buttons">
            <button type="button" className="oauth-button" id="googleSignUp" onClick={handleGoogle('signup-google')} disabled={loading === 'signup-google'}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading === 'signup-google' ? 'Redirecting...' : 'Sign up with Google'}
            </button>
          </div>

          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-text">OR</div>
            <div className="divider-line"></div>
          </div>

          <div className="form-group">
            <label htmlFor="signupEmail">Email</label>
            <input type="email" id="signupEmail" placeholder="you@example.com" required value={values.signupEmail} onChange={updateField('signupEmail')} />
          </div>

          <div className="form-group">
            <label htmlFor="signupPassword">Password</label>
            <input type="password" id="signupPassword" placeholder="At least 6 characters" required value={values.signupPassword} onChange={updateField('signupPassword')} />
          </div>

          <div className="form-group">
            <label htmlFor="signupConfirm">Confirm Password</label>
            <input type="password" id="signupConfirm" placeholder="Confirm your password" required value={values.signupConfirm} onChange={updateField('signupConfirm')} />
          </div>

          <div className={`error-message${signupError ? ' show' : ''}`} id="signupError">{signupError}</div>

          <button type="submit" className={`auth-button${loading === 'signup' ? ' loading' : ''}`} id="signupBtn" disabled={loading === 'signup'}>
            {loading === 'signup' ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="toggle-form">
            Already have an account? <button type="button" id="toggleToLogin" onClick={() => setShowSignup(false)}>Sign In</button>
          </div>
        </form>

        <form id="signInForm" className={`auth-form${showSignup ? '' : ' active'}`} onSubmit={handleSignIn}>
          <div className="login-header">
            <div className="logo">S</div>
            <h1>Welcome Back</h1>
            <p>Sign in to your ShurukerAi account</p>
          </div>

          <div className="oauth-buttons">
            <button type="button" className="oauth-button" id="googleSignIn" onClick={handleGoogle('signin-google')} disabled={loading === 'signin-google'}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading === 'signin-google' ? 'Redirecting...' : 'Sign in with Google'}
            </button>
          </div>

          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-text">OR</div>
            <div className="divider-line"></div>
          </div>

          <div className="form-group">
            <label htmlFor="signinEmail">Email</label>
            <input type="email" id="signinEmail" placeholder="you@example.com" required value={values.signinEmail} onChange={updateField('signinEmail')} />
          </div>

          <div className="form-group">
            <label htmlFor="signinPassword">Password</label>
            <input type="password" id="signinPassword" placeholder="Your password" required value={values.signinPassword} onChange={updateField('signinPassword')} />
          </div>

          <div className={`error-message${signinError ? ' show' : ''}`} id="signinError">{signinError}</div>

          <button type="submit" className={`auth-button${loading === 'signin' ? ' loading' : ''}`} id="signinBtn" disabled={loading === 'signin'}>
            {loading === 'signin' ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="toggle-form">
            Don't have an account? <button type="button" id="toggleToSignup" onClick={() => setShowSignup(true)}>Create Account</button>
          </div>
        </form>

        <div id="successMessage" className={`success-message${successVisible ? ' show' : ''}`}>
          <div className="success-icon">✓</div>
          <h2>Success!</h2>
          <p id="successText">{successText}</p>
        </div>
      </div>
    </>
  )
}
