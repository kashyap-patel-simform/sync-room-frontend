import { useState } from 'react'
import { cn } from '../lib/cn'
import { IconCopy, IconCheck } from './icons'

interface RoomCodeProps {
  code: string
  className?: string
}

export function RoomCode({ code, className }: Readonly<RoomCodeProps>) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Click to copy room code"
      className={cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-150 cursor-pointer',
        'bg-surface border-border hover:border-border-bright hover:bg-surface-raised',
        className,
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-fg-subtle">Room</span>
      <span className="font-mono font-bold text-sm text-fg tracking-[0.18em]">{code}</span>
      <span className={cn('transition-colors', copied ? 'text-teal' : 'text-fg-subtle group-hover:text-fg-muted')}>
        {copied ? <IconCheck /> : <IconCopy />}
      </span>
    </button>
  )
}
