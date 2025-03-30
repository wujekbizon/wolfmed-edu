'use client'

import Link from 'next/link'

export default function TeachingPlaygroundHero() {
  return (
    <div className="h-[calc(100vh-6px)] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-zinc-900 to-zinc-800">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent leading-relaxed py-2">
          Teaching Playground
        </h1>
        <p className="text-xl text-zinc-400">
          An interactive platform for medical education where teachers and students can collaborate in real-time.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Teacher Card */}
          <div className="group relative bg-zinc-800/50 p-6 rounded-xl border border-zinc-700 hover:border-blue-500/50 transition-all">
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">For Teachers</h2>
            <p className="text-zinc-400 mb-6">
              Create and manage interactive lectures, monitor student progress, and provide real-time feedback.
            </p>
            <Link 
              href="/tp/login"
              className="inline-block px-6 py-2 bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors"
            >
              Login as Teacher
            </Link>
          </div>

          {/* Student Card */}
          <div className="group relative bg-zinc-800/50 p-6 rounded-xl border border-zinc-700 hover:border-violet-500/50 transition-all">
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">For Students</h2>
            <p className="text-zinc-400 mb-6">
              Join interactive lectures, participate in real-time exercises, and enhance your learning experience.
            </p>
            <Link 
              href="/tp/login"
              className="inline-block px-6 py-2 bg-violet-500/10 text-violet-400 rounded-md hover:bg-violet-500/20 transition-colors"
            >
              Login as Student
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-zinc-500">
          <p>Need help? Contact support at <a href="https://wolfmed-edukacja.pl/" target='_blank'>wolfmed-edukacja.pl</a></p>
        </div>
      </div>
    </div>
  )
} 