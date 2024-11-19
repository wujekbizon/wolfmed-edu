import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'
import { useState } from 'react'

interface Props {
  id: string
  name: string
}

export default function EditableCategoryName({ id, name }: Props) {
  const { editCategory } = useQuestionSelectionStore()
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (e: React.FormEvent<HTMLInputElement>) => {
    const newName = e.currentTarget.value.trim()
    if (e.currentTarget.value !== name && newName) {
      editCategory(id, newName)
    }
    setIsEditing(false)
  }

  return (
    <div className="w-full">
      {isEditing ? (
        <input
          type="text"
          defaultValue={name}
          onBlur={(e) => handleEdit(e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') setIsEditing(false)
          }}
          className="w-full font-semibold text-zinc-800 bg-transparent border-b border-zinc-300 focus:border-zinc-600 outline-none px-1"
          autoFocus
          maxLength={40}
        />
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
