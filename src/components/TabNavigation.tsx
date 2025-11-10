"use client"

import { useState, ReactNode } from "react"

interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabNavigationProps {
  tabs: Tab[]
}

export default function TabNavigation({ tabs }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "")

  return (
    <div className="w-full">
      <div className="flex whitespace-nowrap shrink-0 overflow-x-auto scrollbar-thin border-b border-zinc-200/60 mb-6 bg-white/60 backdrop-blur-sm rounded-t-xl px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 xs:px-6 py-3 font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-[#f58a8a] font-semibold"
                : "text-zinc-600 hover:text-zinc-800"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f58a8a]" />
            )}
          </button>
        ))}
      </div>
      <div className="w-full">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? "block" : "hidden"}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
