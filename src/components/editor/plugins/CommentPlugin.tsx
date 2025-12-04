'use client'

import { useEffect, useState, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  createCommand,
  KEY_ESCAPE_COMMAND,
} from 'lexical'
import { $createCommentNode, $isCommentNode } from '../nodes/CommentNode'
import { X } from 'lucide-react'

export type CommentPayload = {
  commentText: string
}

export const ADD_COMMENT_COMMAND = createCommand<CommentPayload>('ADD_COMMENT_COMMAND')
export const REMOVE_COMMENT_COMMAND = createCommand<string>('REMOVE_COMMENT_COMMAND')

export default function CommentPlugin() {
  const [editor] = useLexicalComposerContext()
  const [activeComment, setActiveComment] = useState<{
    id: string
    text: string
    top: number
    left: number
    height: number
  } | null>(null)

  // Click handler for opening a comment popup
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const commentId = target.dataset.commentId
      const editorElem = editor.getRootElement()
      if (!commentId || !editorElem) return

      const commentRect = target.getBoundingClientRect()
      const editorRect = editorElem.getBoundingClientRect()

      // Convert viewport → relative coordinates
      const top = commentRect.top - editorRect.top
      const left = commentRect.left - editorRect.left

      setActiveComment({
        id: commentId,
        text: target.title,
        top,
        left,
        height: commentRect.height,
      })
    }

    const editorElement = editor.getRootElement()
    if (editorElement) {
      editorElement.addEventListener('click', handleClick)
      return () => editorElement.removeEventListener('click', handleClick)
    }
  }, [editor])

  // Close popup on ESC
  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        if (activeComment) {
          setActiveComment(null)
          return true
        }
        return false
      },
      COMMAND_PRIORITY_NORMAL,
    )
  }, [editor, activeComment])

  // Add + remove comment nodes
  useEffect(() => {
    const unregisterAdd = editor.registerCommand(
      ADD_COMMENT_COMMAND,
      (payload: CommentPayload) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        const selectedText = selection.getTextContent()
        if (!selectedText) return false

        const commentNode = $createCommentNode(selectedText, payload.commentText)
        selection.insertNodes([commentNode])

        return true
      },
      COMMAND_PRIORITY_NORMAL,
    )

    const unregisterRemove = editor.registerCommand(
      REMOVE_COMMENT_COMMAND,
      (commentId: string) => {
        editor.update(() => {
          const root = editor.getEditorState()._nodeMap
          root.forEach((node) => {
            if ($isCommentNode(node) && node.getCommentId() === commentId) {
              node.replace($createTextNode(node.getTextContent()))
            }
          })
        })

        setActiveComment(null)
        return true
      },
      COMMAND_PRIORITY_NORMAL,
    )

    return () => {
      unregisterAdd()
      unregisterRemove()
    }
  }, [editor])

  const handleRemoveComment = useCallback(() => {
    if (activeComment) {
      editor.dispatchCommand(REMOVE_COMMENT_COMMAND, activeComment.id)
    }
  }, [editor, activeComment])

  if (!activeComment) return null

  return (
    <div
      className="
        absolute z-50 bg-white rounded-lg shadow-xl 
        border border-amber-200 p-4 max-w-xs
      "
      style={{
        top: `${activeComment.top + activeComment.height + 8}px`, // below comment by 8px
        left: `${activeComment.left}px`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-xs">💬</span>
          </div>
          <span className="text-xs font-semibold text-amber-700">Comment</span>
        </div>
        <button
          onClick={() => setActiveComment(null)}
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-zinc-700 leading-relaxed mb-3">
        {activeComment.text}
      </p>

      <button
        onClick={handleRemoveComment}
        className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
      >
        Remove Comment
      </button>
    </div>
  )
}
