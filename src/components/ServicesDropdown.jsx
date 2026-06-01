import { useEffect, useRef, useState } from 'react'

export default function ServicesDropdown({ className = '', loginLabel = 'Freelancer Login' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  const toggle = (e) => {
    e.preventDefault()
    setOpen((s) => !s)
  }

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((s) => !s)
    }
  }

  return (
    <div ref={ref} className={`nav-dropdown${open ? ' open' : ''}${className ? ` ${className}` : ''}`}>
      <a href="/freelancers" aria-haspopup="menu" aria-expanded={open} onClick={toggle} onKeyDown={onKey}>
        Services
      </a>
      <div className="dropdown-menu" role="menu">
        <a href="/register-freelancer" role="menuitem">Register as Freelancer</a>
        <a href="/freelancer-login" role="menuitem">{loginLabel}</a>
        <a href="/freelancers" role="menuitem">Find Freelancer</a>
      </div>
    </div>
  )
}