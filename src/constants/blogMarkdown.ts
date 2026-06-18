import { AlertTriangle, CheckCircle2, XCircle, Wrench } from 'lucide-react'

export const EMOJI_MAP = [
  { emoji: '⚠', icon: AlertTriangle, colors: 'border-l-amber-500 bg-amber-500/[0.07] text-amber-400' },
  { emoji: '✔', icon: CheckCircle2, colors: 'border-l-emerald-500 bg-emerald-500/[0.07] text-emerald-400' },
  { emoji: '✖', icon: XCircle, colors: 'border-l-red-500 bg-red-500/[0.07] text-red-400' },
  { emoji: '🛠', icon: Wrench, colors: 'border-l-sky-500 bg-sky-500/[0.07] text-sky-400' },
] as const
