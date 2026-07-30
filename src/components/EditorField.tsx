import { memo } from "react"
import FieldError from "@/components/FieldError"
import Editor from "./editor/Editor"

export const EditorField = memo(function EditorField({
    formState,
    editorKey,
    onChange,
    contentRef,
    plainTextRef,
    excerptRef,
    initialContent,
}: {
    formState: any
    editorKey: number
    onChange: (editorState: any) => void
    contentRef: React.RefObject<HTMLInputElement | null>
    plainTextRef: React.RefObject<HTMLInputElement | null>
    excerptRef: React.RefObject<HTMLInputElement | null>
    initialContent?: unknown
}) {
    // The editor fills its container, so an always-present error slot would
    // read as a permanent gap under it rather than as reserved space.
    const hasError =
        formState?.status === 'ERROR' &&
        Boolean(formState.message || formState.fieldErrors?.content?.[0])

    return (
        <div className="flex h-full min-h-0 w-full flex-col">
            <input type="hidden" name="content" ref={contentRef} defaultValue="" />
            <input type="hidden" name="plainText" ref={plainTextRef} defaultValue="" />
            <input type="hidden" name="excerpt" ref={excerptRef} defaultValue="" />
            <Editor
                key={editorKey}
                onChange={onChange}
                placeholder="Napisz swoją notatkę..."
                className="min-h-40 flex-1 overflow-y-auto scrollbar-webkit"
                initialContent={typeof initialContent === 'string' ? initialContent : initialContent ? JSON.stringify(initialContent) : ''}
            />
            {hasError && (
                <div className="shrink-0">
                    <FieldError name="content" formState={formState} />
                </div>
            )}
        </div>
    )
})