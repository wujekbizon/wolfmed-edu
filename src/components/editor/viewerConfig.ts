import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { CodeNode } from '@lexical/code'
import { HighlightNode } from './nodes/HighlightNode'
import { CommentNode } from './nodes/CommentNode'

// Light theme optimized for reading and studying
export const viewerConfig = {
  namespace: 'StudyViewer',
  theme: {
    text: {
      bold: 'font-bold text-zinc-900',
      italic: 'italic text-zinc-800',
      underline: 'underline decoration-[#ff9898]/40',
      strikethrough: 'line-through text-zinc-500',
      underlineStrikethrough: 'underline line-through',
    },
    heading: {
      h1: 'text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 mt-8 first:mt-0 leading-tight',
      h2: 'text-2xl sm:text-3xl font-bold text-zinc-900 mb-4 mt-6 leading-tight',
      h3: 'text-xl sm:text-2xl font-semibold text-zinc-800 mb-3 mt-5 leading-snug',
    },
    list: {
      ul: 'list-disc ml-6 space-y-2 text-zinc-700 my-4',
      ol: 'list-decimal ml-6 space-y-2 text-zinc-700 my-4',
      listitem: 'leading-relaxed',
    },
    quote: 'border-l-4 border-[#ff9898]/60 bg-rose-50/30 pl-6 pr-4 py-4 my-6 italic text-zinc-700 rounded-r-lg',
    code: 'font-mono bg-zinc-900 text-zinc-100 rounded-lg p-6 my-6 text-sm overflow-x-auto shadow-inner',
    link: 'text-[#ff9898] hover:text-[#ff7878] underline decoration-[#ff9898]/30 hover:decoration-[#ff9898] transition-all duration-200',
    paragraph: 'text-zinc-700 leading-relaxed mb-4 text-base sm:text-lg',
  },
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode, HighlightNode, CommentNode],
  onError: (error: Error) => {
    console.error('StudyViewer error:', error)
  },
  editable: false,
}
