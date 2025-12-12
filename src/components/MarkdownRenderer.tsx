'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components, ExtraProps } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type MarkdownRendererProps = {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mt-12 mb-8">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mt-12 mb-6">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl sm:text-2xl font-bold text-gray-100 mt-8 mb-4">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 mb-3">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="mb-6 text-base sm:text-lg leading-relaxed text-gray-400">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-gray-400 leading-relaxed">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-400 leading-relaxed">{children}</ol>
    ),
    li: ({ children }) => <li className="text-base sm:text-lg ml-4">{children}</li>,
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-purple-400 hover:text-purple-500 underline decoration-purple-400/30 hover:decoration-purple-400 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-bold text-gray-100">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-100">{children}</em>,
    code: ({ inline, className, children, ...props }: React.ComponentProps<'code'> & { inline?: boolean } & ExtraProps) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <div className="my-6 rounded-xl overflow-hidden border border-slate-700">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: '#1e1e2e',
              fontSize: '0.875rem',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="px-2 py-1 rounded-md bg-slate-900 text-purple-400 font-mono text-sm border border-slate-700" {...props}>
          {children}
        </code>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="pl-4 my-6 border-l-4 border-purple-400 text-gray-400 italic">
        {children}
      </blockquote>
    ),
    img: ({ src, alt }) => (
      <div className="my-8 rounded-xl overflow-hidden border border-slate-700">
        <img src={src} alt={alt || ''} className="w-full h-auto" loading="lazy" />
        {alt && <p className="text-sm text-gray-400 text-center py-2 bg-slate-900">{alt}</p>}
      </div>
    ),
    table: ({ children }) => (
      <div className="my-8 overflow-x-auto rounded-xl border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-900">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-slate-700 bg-slate-800">{children}</tbody>,
    th: ({ children }) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{children}</td>
    ),
    hr: () => <hr className="my-8 border-t border-slate-700" />,
    del: ({ children }) => <del className="text-gray-400 opacity-70">{children}</del>,
  }

  return (
    <div className="prose prose-zinc prose-lg max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}