import React from 'react'
import { Tag } from 'lucide-react'
import { EMOJI_MAP } from '@/constants/blogMarkdown'

export function nodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (React.isValidElement(node)) return nodeText((node.props as { children?: React.ReactNode }).children)
  return ''
}

export function resolveH3(text: string) {
  for (const { emoji, icon: Icon, colors } of EMOJI_MAP) {
    if (text.includes(emoji)) {
      return { Icon, colors, label: text.replace(emoji, '').trim() }
    }
  }
  return { Icon: Tag, colors: 'border-l-[#BB86FC] bg-[#BB86FC]/[0.07] text-[#BB86FC]', label: text }
}
