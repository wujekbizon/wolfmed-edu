'use client'

import { useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { MessageSquare, X } from 'lucide-react'
import { ADD_COMMENT_COMMAND } from './editor/plugins/CommentPlugin'
import { COMMENT_MODAL_TEXT } from '@/constants/studyViewer'

interface CommentModalProps {
  onClose: () => void
}

export default function CommentModal({ onClose }: CommentModalProps) {
  const [editor] = useLexicalComposerContext()
  const [commentText, setCommentText] = useState('')

  const handleAddComment = () => {
    if (commentText.trim()) {
      editor.dispatchCommand(ADD_COMMENT_COMMAND, { commentText: commentText.trim() })
      setCommentText('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-6 max-w-md w-full animate-[scaleIn_0.2s_ease-out_forwards]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">{COMMENT_MODAL_TEXT.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-zinc-600 mb-4">
          {COMMENT_MODAL_TEXT.description}
        </p>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={COMMENT_MODAL_TEXT.placeholder}
          className="w-full h-32 px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff9898]/30 focus:border-[#ff9898] resize-none"
          autoFocus
        />
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 font-medium transition-colors"
          >
            {COMMENT_MODAL_TEXT.cancel}
          </button>
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {COMMENT_MODAL_TEXT.submit}
          </button>
        </div>
      </div>
    </div>
  )
}
