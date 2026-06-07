import { useEffect, useMemo, useRef, useState } from 'react'

const pageStyles = `
.dm-shell{max-width:1100px;margin:20px auto;padding:0 16px}
.dm-grid{display:grid;grid-template-columns:320px 1fr;gap:14px;min-height:72vh}
.dm-panel{background:#fff;border:1px solid #ececec;border-radius:12px;box-shadow:0 10px 28px rgba(11,15,30,.05)}
.panel-head{padding:14px 16px;border-bottom:1px solid #efefef}.panel-head h2{margin:0;font-size:17px}
.threads{max-height:calc(72vh - 58px);overflow:auto}
.thread{padding:12px 14px;border-bottom:1px solid #f3f3f3;cursor:pointer}
.thread:hover{background:#faf9ff}.thread.active{background:rgba(123,97,255,.08)}
.thread-top{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px}
.thread-name{font-size:14px;font-weight:700;color:#111827}.thread-time{font-size:12px;color:#888}
.thread-bottom{display:flex;justify-content:space-between;align-items:center;gap:8px}
.thread-last{font-size:13px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.unread{font-size:11px;color:#fff;background:linear-gradient(135deg,#7b61ff,#ff6a5b);padding:2px 7px;border-radius:999px}
.chat{display:flex;flex-direction:column;min-height:72vh}
.chat-sub{margin-top:3px;color:#666;font-size:13px}
.msgs{flex:1;padding:14px;overflow:auto;background:#fcfcff}
.row{display:flex;margin-bottom:10px}.row.me{justify-content:flex-end}
.row.me>div.msg-wrapper{display:flex;flex-direction:column;align-items:flex-end;max-width:72%}
.row.other>div.msg-wrapper{display:flex;flex-direction:column;align-items:flex-start;max-width:72%}
.bubble{width:max-content;max-width:100%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;white-space:normal;word-break:normal;overflow-wrap:break-word}
.row.me .bubble{background:linear-gradient(135deg,#7b61ff,#ff6a5b);color:#fff;border-bottom-right-radius:4px}
.row.other .bubble{background:#fff;color:#111827;border:1px solid #ececec;border-bottom-left-radius:4px}
.msg-time{font-size:11px;color:#999;margin-top:4px}
.row.me .msg-time{text-align:right}
.composer{display:flex;gap:10px;padding:12px;border-top:1px solid #ececec;align-items:center}
.composer input{flex:1;border:1px solid #ddd;border-radius:10px;padding:11px 12px;font-family:inherit;font-size:14px}
.composer button{border:none;border-radius:10px;padding:11px 20px;height:44px;color:#fff;font-weight:700;font-size:14px;background:linear-gradient(135deg,#7b61ff,#ff6a5b);cursor:pointer;white-space:nowrap;flex-shrink:0}
.empty{display:flex;align-items:center;justify-content:center;min-height:280px;color:#666;text-align:center;padding:18px}
@media(max-width:920px){.dm-grid{grid-template-columns:1fr}.threads{max-height:260px}.chat{min-height:58vh}}
@keyframes badgePop{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
`

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text || ''
  return div.innerHTML
}

function tsToDate(ts) {
  if (!ts) return null
  if (ts._seconds) return new Date(ts._seconds * 1000)
  const parsed = new Date(ts)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatTime(ts) {
  const date = tsToDate(ts)
  if (!date) return ''
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function DirectMessagesPage({ role = 'client' }) {
  const isFreelancer = role === 'freelancer'
  const pageTitle = isFreelancer ? 'Freelancer Inbox' : 'Client Messages'
  const chatHeading = isFreelancer ? 'Select a client chat' : 'Select a conversation'
  const chatSubtext = isFreelancer ? 'Inbox for approved freelancers' : 'Message freelancers directly'
  const emptyText = isFreelancer ? 'No conversation selected yet.' : 'No conversation selected yet.'
  const [currentUser, setCurrentUser] = useState(null)
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [threads, setThreads] = useState([])
  const [messages, setMessages] = useState([])
  const [messageValue, setMessageValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesRef = useRef(null)
  const composerRef = useRef(null)

  const queryFreelancerUid = useMemo(() => new URLSearchParams(window.location.search).get('freelancer'), [])

  useEffect(() => {
    document.body.classList.add('dm-page')
    return () => document.body.classList.remove('dm-page')
  }, [])

  useEffect(() => {
    document.title = isFreelancer ? 'Freelancer Inbox — ShurukerAi' : 'Client Messages — ShurukerAi'
  }, [isFreelancer])

  useEffect(() => {
    let active = true

    const loadMe = async () => {
      const response = await fetch('/api/me', { credentials: 'include' })
      if (response.status === 401) {
        window.location.replace('/login')
        return false
      }
      if (!response.ok) throw new Error('Failed to load user info')
      const data = await response.json()

      if (!active) return
      setCurrentUser(data)

      if (isFreelancer && !data.isApprovedFreelancer) {
        window.location.replace('/freelancer-login')
        return false
      }

      return true
    }

    const startThreadForClient = async () => {
      if (isFreelancer || !queryFreelancerUid) return null

      const response = await fetch('/api/dm/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerUid: queryFreelancerUid }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not start conversation.')
      }

      window.history.replaceState({}, '', '/client-messages')
      return data.threadId
    }

    const loadThreads = async () => {
      const response = await fetch('/api/dm/threads', { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          window.location.replace('/login')
          return []
        }
        throw new Error(data.error || 'Failed to load conversations')
      }

      setThreads(data.threads || [])
      return data.threads || []
    }

    const openThread = async (threadId) => {
      setActiveThreadId(threadId)
      setThreadLoading(true)

      try {
        const response = await fetch(`/api/dm/threads/${threadId}/messages`, { credentials: 'include' })
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            window.location.replace('/login')
            return
          }
          throw new Error(data.error || 'Failed to load messages')
        }

        setMessages(data.messages || [])
        await fetch(`/api/dm/threads/${threadId}/seen`, { method: 'POST', credentials: 'include' })
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
      } finally {
        setThreadLoading(false)
      }
    }

    const init = async () => {
      setLoading(true)
      setPageError('')
      try {
        const ready = await loadMe()
        if (!ready) return
        const startedThreadId = await startThreadForClient()
        const loadedThreads = await loadThreads()

        if (startedThreadId) {
          await openThread(startedThreadId)
        } else if (loadedThreads.length > 0) {
          await openThread(loadedThreads[0].id)
        }
      } catch (error) {
        setPageError(error.message || 'Could not initialize messages.')
      } finally {
        if (active) setLoading(false)
      }
    }

    init()

    return () => {
      active = false
    }
  }, [isFreelancer, queryFreelancerUid])

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Real-time polling: fetch new messages every 3 seconds when a thread is open
  useEffect(() => {
    if (!activeThreadId) return

    const poll = async () => {
      try {
        const response = await fetch(`/api/dm/threads/${activeThreadId}/messages`, { credentials: 'include' })
        if (!response.ok) return
        const data = await response.json()
        const incoming = data.messages || []
        setMessages((prev) => {
          if (incoming.length !== prev.length) return incoming
          return prev
        })
        // Also refresh thread list (unread counts, last message preview)
        const threadsRes = await fetch('/api/dm/threads', { credentials: 'include' })
        if (threadsRes.ok) {
          const threadsData = await threadsRes.json()
          setThreads(threadsData.threads || [])
        }
      } catch (_) {
        // silently ignore polling errors
      }
    }

    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [activeThreadId])

  // Recalculate unread count whenever threads update
  useEffect(() => {
    const total = threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0)
    setUnreadCount(total)
  }, [threads])

  const renderThreads = () => {
    if (!threads.length) {
      return <div className="empty">No conversations found yet.</div>
    }

    return threads.map((thread) => {
      const activeClass = thread.id === activeThreadId ? 'active' : ''
      const unread = thread.unreadCount > 0 ? <span className="unread">{thread.unreadCount}</span> : null

      return (
        <div
          key={thread.id}
          className={`thread ${activeClass}`}
          data-id={thread.id}
          onClick={() => openExistingThread(thread.id)}
        >
          <div className="thread-top">
            <div className="thread-name">{thread.otherName || 'Conversation'}</div>
            <div className="thread-time">{formatTime(thread.updatedAt || thread.lastMessageAt)}</div>
          </div>
          <div className="thread-bottom">
            <div className="thread-last">{thread.lastMessage || 'No messages yet'}</div>
            {unread}
          </div>
        </div>
      )
    })
  }

  async function openExistingThread(threadId) {
    setThreadLoading(true)
    setActiveThreadId(threadId)

    try {
      const response = await fetch(`/api/dm/threads/${threadId}/messages`, { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load messages')
      }

      setMessages(data.messages || [])
      await fetch(`/api/dm/threads/${threadId}/seen`, { method: 'POST', credentials: 'include' })

      const refreshed = await fetch('/api/dm/threads', { credentials: 'include' })
      const refreshedData = await refreshed.json()
      if (refreshed.ok) setThreads(refreshedData.threads || [])
    } catch (error) {
      setPageError(error.message || 'Failed to open conversation')
    } finally {
      setThreadLoading(false)
    }
  }

  const sendMessage = async (text) => {
    const value = text.trim()
    if (!activeThreadId || !value) return

    const response = await fetch(`/api/dm/threads/${activeThreadId}/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: value }),
    })

    const data = await response.json()
    if (!response.ok) {
      if (response.status === 401) {
        window.location.replace('/login')
        return
      }
      throw new Error(data.error || 'Failed to send message')
    }

    setMessageValue('')
    await openExistingThread(activeThreadId)
  }

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
            <a href="/chat">AI Chat</a>
            <a href="/freelancers">Find Freelancer</a>
            <a href={isFreelancer ? '/freelancer-inbox' : '/client-messages'} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {pageTitle}
              {unreadCount > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #7b61ff, #ff6a5b)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  lineHeight: 1,
                  padding: '3px 6px',
                  borderRadius: '999px',
                  minWidth: '18px',
                  height: '18px',
                  boxShadow: '0 2px 6px rgba(123,97,255,0.4)',
                  animation: 'badgePop 0.3s ease',
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </a>
            <a className="signup" href="/logout">Logout</a>
          </nav>
        </div>
      </header>

      <main className="dm-shell" data-dm-role={role}>
        <div className="dm-grid">
          <section className="dm-panel">
            <div className="panel-head"><h2>{isFreelancer ? 'Client Conversations' : 'Your Freelancer Chats'}</h2></div>
            <div id="threads" className="threads">
              {loading ? <div className="empty">Loading conversations...</div> : pageError ? <div className="empty">{pageError}</div> : renderThreads()}
            </div>
          </section>

          <section className="dm-panel chat">
            <div className="panel-head">
              <h2 id="chatTitle">{activeThreadId ? (threads.find((thread) => thread.id === activeThreadId)?.otherName || 'Conversation') : chatHeading}</h2>
              <div id="chatSub" className="chat-sub">{currentUser ? chatSubtext : 'Loading...'}</div>
            </div>
            <div id="messages" className="msgs" ref={messagesRef}>
              {threadLoading ? (
                <div className="empty">Loading messages...</div>
              ) : messages.length ? (
                messages.map((message) => {
                  const mine = message.senderId === currentUser?.uid
                  return (
                    <div key={message.id} className={`row ${mine ? 'me' : 'other'}`}>
                      <div className="msg-wrapper">
                        <div className="bubble" dangerouslySetInnerHTML={{ __html: escapeHtml(message.text).replace(/\n/g, '<br>') }} />
                        <div className="msg-time">{formatTime(message.createdAt)}</div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="empty">{emptyText}</div>
              )}
            </div>
            <form
              id="composer"
              className="composer"
              style={{ display: activeThreadId ? 'flex' : 'none' }}
              ref={composerRef}
              onSubmit={async (event) => {
                event.preventDefault()
                try {
                  await sendMessage(messageValue)
                } catch (error) {
                  setPageError(error.message || 'Failed to send message')
                }
              }}
            >
              <input
                id="messageInput"
                type="text"
                maxLength={2000}
                placeholder={isFreelancer ? 'Type your reply...' : 'Type your message...'}
                autoComplete="off"
                value={messageValue}
                onChange={(event) => setMessageValue(event.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </section>
        </div>
      </main>
    </>
  )
}

export default DirectMessagesPage
