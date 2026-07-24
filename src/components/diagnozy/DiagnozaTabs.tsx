'use client'

import { useState, useId } from 'react'
import { motion } from 'framer-motion'

// Receives both panels server-rendered; only the switch itself is client state.
export default function DiagnozaTabs({
  nauka,
  wypelnij,
}: {
  nauka: React.ReactNode
  wypelnij: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState<'nauka' | 'wypelnij'>('nauka')
  const baseId = useId()

  const tabs = [
    { key: 'nauka' as const, label: 'Nauka' },
    { key: 'wypelnij' as const, label: 'Wypełnij' },
  ]

  return (
    <div>
      <div
        role="tablist"
        aria-label="Tryb diagnozy"
        className="inline-flex items-center gap-1 bg-zinc-100 rounded-full p-1 mb-6"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`${baseId}-tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            aria-controls={`${baseId}-panel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer
              ${activeTab === tab.key ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            {activeTab === tab.key && (
              <motion.span
                layoutId={`${baseId}-pill`}
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`${baseId}-panel-${tab.key}`}
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={activeTab !== tab.key}
        >
          {tab.key === 'nauka' ? nauka : wypelnij}
        </div>
      ))}
    </div>
  )
}
