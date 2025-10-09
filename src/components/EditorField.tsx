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
}: {
    formState: any
    editorKey: number
    onChange: (editorState: any) => void
    contentRef: React.RefObject<HTMLInputElement>
    plainTextRef: React.RefObject<HTMLInputElement>
    excerptRef: React.RefObject<HTMLInputElement>
}) {

    return (
        <div>
            <input type="hidden" name="content" ref={contentRef} defaultValue="" />
            <input type="hidden" name="plainText" ref={plainTextRef} defaultValue="" />
            <input type="hidden" name="excerpt" ref={excerptRef} defaultValue="" />
            <Editor key={editorKey} onChange={onChange} placeholder="Napisz swoją notatkę..." className="min-h-64 max-h-64 overflow-y-auto scrollbar-webkit"  />
            <FieldError name="content" formState={formState} />
        </div>
    )
})