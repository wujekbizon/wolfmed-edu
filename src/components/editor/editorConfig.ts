import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { CodeNode } from '@lexical/code'

export const editorConfig = {
  namespace: 'ForumEditor',
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'line-through',
      underlineStrikethrough: 'underline line-through',
    },
    heading: {
      h1: 'text-2xl font-bold mb-4',
      h2: 'text-xl font-bold mb-3',
      h3: 'text-lg font-bold mb-2',
    },
    list: {
      ul: 'list-disc ml-6',
      ol: 'list-decimal ml-6',
    },
    quote: 'border-l-4 border-zinc-700 pl-4 my-4 italic',
    code: 'font-mono bg-zinc-800 rounded p-4',
    link: 'text-blue-400 hover:underline',
  },
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
  onError: (error: Error) => {
    console.error(error)
  },
}
