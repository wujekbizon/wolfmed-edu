'use client'

import { saveCellsAction } from "@/actions/cells"
import { EMPTY_FORM_STATE } from "@/constants/formState"
import { useActionState, useEffect } from "react"
import SaveIcon from "../icons/SaveIcon"
import { useCellsStore } from "@/store/useCellsStore"
import { useToastMessage } from "@/hooks/useToastMessage"
import LoadingIcon from "../icons/LoadingIcon"

export default function SaveCellsButton() {
    const {
        order,
        data,
        serverVersion,
        revision,
        saving,
        initialized,
        conflict,
        setSaving,
        markSaved,
        reportConflict,
    } = useCellsStore()
    const [state, action, pending] = useActionState(saveCellsAction, EMPTY_FORM_STATE)
    const noScriptFallback = useToastMessage(
        state.values?.conflict === true ? { ...state, message: '' } : state
    )

    useEffect(() => {
        if (state.status === 'UNSET') return

        if (
            state.status === 'SUCCESS' &&
            typeof state.values?.serverVersion === 'number' &&
            typeof state.values?.clientRevision === 'number'
        ) {
            markSaved(state.values.serverVersion, state.values.clientRevision)
            return
        }

        if (state.values?.conflict === true) {
            try {
                const version = state.values.serverVersion
                const server = typeof version === 'number'
                    ? {
                        version,
                        order: JSON.parse(String(state.values.serverOrder ?? '[]')),
                        cells: JSON.parse(String(state.values.serverCells ?? '{}')),
                    }
                    : null
                reportConflict(server)
                return
            } catch {
                // The action payload is internal; a malformed payload falls back to a normal error.
            }
        }

        setSaving(false)
    }, [state, markSaved, reportConflict, setSaving])

    return (
        <>
            <form action={action} onSubmit={() => setSaving(true)}>
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
                <input
                    type="hidden"
                    name="version"
                    value={serverVersion ?? ''}
                />
                <input
                    type="hidden"
                    name="clientRevision"
                    value={revision}
                />
                <button
                    type="submit"
                    aria-label="Zapisz planszę"
                    disabled={!initialized || pending || saving || Boolean(conflict)}
                    className="flex items-center justify-center bg-slate-700 hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 w-8 h-8 rounded"
                >
                    {pending ? <LoadingIcon color="#9d1c0d" /> : <SaveIcon color="#f79058" />}
                </button>
            </form>
            {noScriptFallback}
        </>
    )
}
