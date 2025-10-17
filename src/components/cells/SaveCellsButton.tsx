'use client'

import { saveCellsAction } from "@/actions/cells"
import { EMPTY_FORM_STATE } from "@/constants/formState"
import { useActionState } from "react"
import SaveIcon from "../icons/SaveIcon"
import { useCellsStore } from "@/store/useCellsStore"
import { useToastMessage } from "@/hooks/useToastMessage"
import LoadingIcon from "../icons/LoadingIcon"

export default function SaveCellsButton() {
    const { order, data } = useCellsStore()
    const [state, action, pending] = useActionState(saveCellsAction, EMPTY_FORM_STATE)
    const noScriptFallback = useToastMessage(state)
    return (
        <>
            <form action={action}>
                <input
                    type="hidden"
                    name="order"
                    value={JSON.stringify(order)}
                />
                <input
                    type="hidden"
                    name="cells"
                    value={JSON.stringify(data)}
                />
                <button className="flex items-center justify-center bg-slate-700 hover:bg-slate-800 transition-colors cursor-pointer w-8 h-8 rounded" >
                    {pending ? <LoadingIcon color="#9d1c0d" /> : <SaveIcon color="#f79058" />}
                </button>
            </form>
            {noScriptFallback}
        </>
    )
}