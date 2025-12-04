'use client'

import { useActionState, useState } from 'react'
import { updateCategoryNameAction } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'

interface Props {
  id: string
  name: string
}

export default function EditableCategoryName({ id, name }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [, action] = useActionState(updateCategoryNameAction, EMPTY_FORM_STATE)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newName = formData.get('categoryName') as string

    if (newName.trim() && newName !== name) {
      action(formData)
    }
    setIsEditing(false)
  }

  return (
    <div className="w-full">
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="categoryId" value={id} />
          <input
            type="text"
            name="categoryName"
            defaultValue={name}
            onBlur={(e) => {
              const newName = e.currentTarget.value.trim()
              if (newName && newName !== name) {
                const formData = new FormData()
                formData.append('categoryId', id)
                formData.append('categoryName', newName)
                action(formData)
              }
              setIsEditing(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.form?.requestSubmit()
              }
              if (e.key === 'Escape') {
                setIsEditing(false)
              }
            }}
            className="w-full font-semibold text-zinc-800 bg-transparent border-b border-zinc-300 focus:border-zinc-600 outline-none px-1"
            autoFocus
            maxLength={100}
          />
        </form>
      ) : (
        <h3
          className="font-semibold text-zinc-800 cursor-pointer hover:text-zinc-600"
          onClick={() => setIsEditing(true)}
        >
          {name}
        </h3>
      )}
    </div>
  )
}
