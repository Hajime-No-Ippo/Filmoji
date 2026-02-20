import { useEffect, useState } from 'react'

const variantStyles = {
  success: 'border-accent bg-card',
  error: 'border-red-500 bg-card',
  info: 'border-border bg-card',
}

const variantDot = {
  success: 'bg-accent',
  error: 'bg-red-500',
  info: 'bg-muted',
}

function Toast({ id, message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger slide-in on mount
    requestAnimationFrame(() => setVisible(true))

    const timer = setTimeout(() => dismiss(), 3000)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setTimeout(() => onClose(id), 300) // wait for exit animation
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg shadow-black/30 font-[Inter] text-sm text-white/90 transition-all duration-300 ${variantStyles[type]} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${variantDot[type]}`} />
      <span className="flex-1">{message}</span>
      <button
        onClick={dismiss}
        className="text-white/40 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none text-base leading-none p-0"
      >
        &times;
      </button>
    </div>
  )
}

export default Toast
