'use client'

import { useState } from 'react'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'
import CreateLectureForm from './CreateLectureForm'

export default function CreateLectureButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { setCreateModalOpen, user } = usePlaygroundStore()

  const openModal = () => {
    setIsModalOpen(true)
    setCreateModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCreateModalOpen(false)
  }

  // Only teachers can create lectures
  if (user?.role !== 'teacher') {
    return null
  }

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2 transition-colors"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
          />
        </svg>
        Create Lecture
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md border border-zinc-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-zinc-100">Create New Lecture</h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-200">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            <CreateLectureForm />
          </div>
        </div>
      )}
    </>
  )
} 