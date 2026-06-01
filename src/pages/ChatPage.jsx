import { apiUrl } from '../lib/api'
import { useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { BrandLogo } from '../components/BrandLogo'
import ServicesDropdown from '../components/ServicesDropdown'
import { getFirebaseAuth } from '../lib/firebase'

function formatTimestamp(value) {
  if (!value) return 'Just now'

  const date = value?._seconds ? new Date(value._seconds * 1000) : new Date(value)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatMessageText(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((\/[^)\s]+|https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/(^|\s)(\/(?:freelancers|register-freelancer)(?:\/[\w%\- ]+)*)/g, (match, prefix, path) => {
      if (path.startsWith('/freelancers/')) {
        const rawCategory = path.split('/').pop() || 'specialists'
        let categoryLabel = rawCategory
        try {
          categoryLabel = decodeURIComponent(rawCategory)
        } catch (error) {
          void error
        }
        return `${prefix}<a href="${path}">Click here to view ${categoryLabel} specialists</a>`
      }

      if (path === '/register-freelancer') {
        return `${prefix}<a href="${path}">Click here to register as a freelancer</a>`
      }

      return `${prefix}<a href="${path}">Click here</a>`
    })
    .replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^# (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
}

export function ChatPage() {
  const auth = useMemo(() => getFirebaseAuth(), [])
  const [ready, setReady] = useState(false)
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contextVisible, setContextVisible] = useState(false)
  const [contextCount, setContextCount] = useState('0 msgs')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const messagesEndRef = useRef(null)
  const chatMessagesRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('chat-page')
    return () => document.body.classList.remove('chat-page')
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/login'
        return
      }

      try {
        await user.getIdToken()
        setReady(true)
      } catch (error) {
        window.location.href = '/login'
      }
    })

    return () => unsubscribe()
  }, [auth])

  useEffect(() => {
    if (!ready) return
    loadConversations()
  }, [ready])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    setContextVisible(conversationHistory.length > 0)
    const exchangeCount = Math.floor(conversationHistory.length / 2)
    setContextCount(`${exchangeCount} ${exchangeCount === 1 ? 'exchange' : 'exchanges'}`)
  }, [conversationHistory])

  const loadConversations = async () => {
    setLoadingConversations(true)
    try {
      const response = await fetch(apiUrl('/api/conversations'), { credentials: 'include' })
      const data = await response.json()
      if (response.ok && data.conversations) {
        setConversations(data.conversations)
      } else {
        setConversations([])
      }
    } catch (error) {
      setConversations([])
    } finally {
      setLoadingConversations(false)
    }
  }

  const addWelcomeMessage = () => {
    setMessages([
      {
        role: 'bot',
        content: `👋 Welcome to ShurukerAi!\n\nI'm your AI-powered business assistant, specialized in helping Pakistani entrepreneurs launch and grow their businesses.\n\n💡 Idea Validation\n📊 Market Research\n🗺️ Launch Roadmap\n💰 Budget Planning\n📝 Business Plans\n⚖️ Legal Guidance\n\n💬 Try these quick questions:\n🏢 How do I register a business in Pakistan?\n📋 What licenses do I need for e-commerce?\n💰 Budget for retail shop?`,
        time: 'Just now',
      },
    ])
  }

  useEffect(() => {
    if (ready && messages.length === 0) {
      addWelcomeMessage()
    }
  }, [ready, messages.length])

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(apiUrl(`/api/conversations/${conversationId}/messages`), { credentials: 'include' })
      const data = await response.json()
      if (response.ok && data.messages) {
        setCurrentConversationId(conversationId)
        const mapped = data.messages.map((message) => ({
          role: message.role === 'user' ? 'user' : 'bot',
          content: message.content,
          time: formatTimestamp(message.timestamp),
        }))
        setMessages(mapped)
        setConversationHistory(data.messages.map((message) => ({ role: message.role, content: message.content })))
        window.setTimeout(() => {
          chatMessagesRef.current?.scrollTo({ top: chatMessagesRef.current.scrollHeight, behavior: 'smooth' })
        }, 100)
      }
    } catch (error) {
      void error
    }
  }

  const createNewConversation = async (firstMessage = null) => {
    try {
      const title = firstMessage ? firstMessage.substring(0, 50) : 'New Chat'
      const response = await fetch(apiUrl('/api/conversations/create'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      const data = await response.json()
      if (response.ok && data.conversationId) {
        setCurrentConversationId(data.conversationId)
        setConversationHistory([])
        addWelcomeMessage()
        await loadConversations()
        return data.conversationId
      }
    } catch (error) {
      void error
    }
    return null
  }

  const deleteConversation = async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return

    try {
      const response = await fetch(apiUrl(`/api/conversations/${conversationId}`), { method: 'DELETE', credentials: 'include' })
      if (response.ok) {
        if (conversationId === currentConversationId) {
          setCurrentConversationId(null)
          setConversationHistory([])
          addWelcomeMessage()
        }
        await loadConversations()
      }
    } catch (error) {
      void error
    }
  }

  const updateContext = (history) => {
    setConversationHistory(history)
    const exchangeCount = Math.floor(history.length / 2)
    setContextVisible(history.length > 0)
    setContextCount(`${exchangeCount} ${exchangeCount === 1 ? 'exchange' : 'exchanges'}`)
  }

  const addMessage = (role, content, time = 'Just now') => {
    setMessages((current) => [...current, { role, content, time }])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const query = input.trim()
    if (!query) return

    if (!currentConversationId) {
      await createNewConversation(query)
    }

    addMessage('user', query, formatTimestamp(new Date()))
    const nextHistory = [...conversationHistory, { role: 'user', content: query }]
    updateContext(nextHistory)
    setInput('')
    setTyping(true)

    try {
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          history: nextHistory,
          conversationId: currentConversationId,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          addMessage('error', 'Your session has expired. Please login again.')
          window.setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        } else {
          addMessage('error', `Error: ${data.error || 'Failed to get response'}`)
        }
      } else {
        addMessage('bot', data.answer || 'Sorry, I could not generate a response right now.')
        updateContext([...nextHistory, { role: 'assistant', content: data.answer }])
        await loadConversations()
      }
    } catch (error) {
      addMessage('error', 'Sorry, I encountered an error processing your request. Please try again.')
    } finally {
      setTyping(false)
    }
  }

  const askQuestion = (question) => {
    setInput(question)
    window.setTimeout(() => {
      const form = document.getElementById('chatForm')
      form?.requestSubmit()
    }, 300)
  }

  const renderedMessages = useMemo(() => messages, [messages])

  return (
    <div className="page-shell chat-page">
      <div className="chat-bg-decor">
        <div className="decor-blob blob-1"></div>
        <div className="decor-blob blob-2"></div>
        <div className="decor-blob blob-3"></div>
      </div>

      <header className="nav chat-nav">
        <div className="container nav-inner">
          <a className="brand" href="/" aria-label="ShurukerAi home">
            <BrandLogo />
            <div className="brand-text">
              <span className="brand-name">ShurukerAi</span>
              <small className="brand-slogan">Pakistan's Smart Business Launch Partner</small>
            </div>
          </a>
          <nav className="nav-links">
            <ServicesDropdown />
            <a id="messagesLink" href="/client-messages">Inbox</a>
            <a className="signup" href="/logout">Logout</a>
          </nav>
        </div>
      </header>

      <main className="chat-container">
        <aside className={`conversation-sidebar${sidebarCollapsed ? ' collapsed' : ''}`} id="conversationSidebar">
          <div className="sidebar-header">
            <h3>Chat History</h3>
            <button className="new-chat-btn" id="newChatBtn" title="Start New Chat" type="button" onClick={() => createNewConversation()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="conversations-list" id="conversationsList">
            {loadingConversations ? (
              <div className="loading-conversations">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="no-conversations">No conversations yet. Start a new chat!</div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item${conversation.id === currentConversationId ? ' active' : ''}`}
                  data-id={conversation.id}
                  onClick={() => loadConversation(conversation.id)}
                >
                  <div className="conversation-header">
                    <h4 className="conversation-title">{conversation.title}</h4>
                    <button
                      className="delete-conversation-btn"
                      data-id={conversation.id}
                      title="Delete"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        deleteConversation(conversation.id)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="conversation-meta">
                    <span className="message-count">{conversation.messageCount || 0} messages</span>
                    <span className="conversation-time">{formatTimestamp(conversation.updatedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="chat-wrapper">
          <div className="chat-header">
            <div className="chat-header-left">
              <button className="sidebar-toggle" id="sidebarToggle" title="Toggle Sidebar" type="button" onClick={() => setSidebarCollapsed((current) => !current)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="chat-avatar-large">
                <div className="avatar-gradient">S</div>
                <div className="status-indicator"></div>
              </div>
              <div className="chat-header-info">
                <h2>ShurukerAi Assistant</h2>
                <p className="chat-status">
                  <span className="status-dot"></span>
                  Online - Ready to help
                </p>
              </div>
            </div>
            <div className="chat-header-stats">
              <div className="stat-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" />
                </svg>
                <span>AI Powered</span>
              </div>
              <div className="stat-badge context-badge" id="contextBadge" style={{ display: contextVisible ? 'flex' : 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm1-8V7h-2v5l4 2 1-1.5-3-1.5z" fill="currentColor" />
                </svg>
                <span id="contextCount">{contextCount}</span>
              </div>
            </div>
          </div>

          <div className="chat-messages" id="chatMessages" ref={chatMessagesRef}>
            {renderedMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`message ${message.role}-message${message.role === 'bot' && index === 0 ? ' welcome-message' : ''}`}>
                {(message.role === 'bot' || message.role === 'error') && (
                  <div className="message-avatar">
                    <div className="avatar">S</div>
                  </div>
                )}
                <div className="message-content">
                  {message.role === 'bot' && index === 0 && message.content.includes('Welcome to ShurukerAi') ? (
                    <div className="message-bubble">
                      <div className="welcome-header">
                        <h3>👋 Welcome to ShurukerAi!</h3>
                      </div>
                      <p>I'm your AI-powered business assistant, specialized in helping Pakistani entrepreneurs launch and grow their businesses.</p>

                      <div className="capabilities-grid">
                        <div className="capability-item">
                          <span className="capability-icon">💡</span>
                          <span>Idea Validation</span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-icon">📊</span>
                          <span>Market Research</span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-icon">🗺️</span>
                          <span>Launch Roadmap</span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-icon">💰</span>
                          <span>Budget Planning</span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-icon">📝</span>
                          <span>Business Plans</span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-icon">⚖️</span>
                          <span>Legal Guidance</span>
                        </div>
                      </div>

                      <div className="quick-questions">
                        <p className="quick-intro">💬 Try these quick questions:</p>
                        <button className="quick-btn" type="button" onClick={() => askQuestion('How do I register a business in Pakistan?')}>
                          <span>🏢</span> How do I register a business in Pakistan?
                        </button>
                        <button className="quick-btn" type="button" onClick={() => askQuestion('What licenses do I need to start an e-commerce store?')}>
                          <span>📋</span> What licenses do I need for e-commerce?
                        </button>
                        <button className="quick-btn" type="button" onClick={() => askQuestion('How much budget do I need to start a small retail shop?')}>
                          <span>💰</span> Budget for retail shop?
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="message-bubble" dangerouslySetInnerHTML={{ __html: formatMessageText(message.content) }} />
                  )}
                  <div className="message-time">{message.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="typing-indicator" id="typingIndicator">
                <div className="typing-avatar">
                  <div className="avatar-mini">S</div>
                </div>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="typing-text">ShurukerAi is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="chat-input-area">
            <form id="chatForm" className="chat-form" onSubmit={handleSubmit}>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="userInput"
                  placeholder="Ask anything about your business idea..."
                  autoComplete="off"
                  aria-label="Type your message"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                />
                <button type="submit" className="btn-send" aria-label="Send message">
                  <span className="btn-text">Send</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.6563168,11.6889879 L4.13399899,2.89214702 C3.34915502,2.5952849 2.40734225,2.70604706 1.77946707,3.13399899 C0.994623095,3.72451077 0.837654326,4.81394249 1.15159189,5.52938778 L3.03521743,12.0703808 C3.03521743,12.2274782 3.19218622,12.3845756 3.50612381,12.3845756 L16.6915026,13.1700625 C16.6915026,13.1700625 17.1624089,13.1700625 17.1624089,12.8232004 L17.1624089,12.4744748 C17.1624089,12.1276127 16.6915026,12.4744748 16.6915026,12.4744748 Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <p className="input-hint">Press Enter to send • Pakistan-focused AI business guidance</p>
            </form>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">© 2025 ShurukerAi — Built for Pakistani entrepreneurs.</div>
      </footer>
    </div>
  )
}

export default ChatPage