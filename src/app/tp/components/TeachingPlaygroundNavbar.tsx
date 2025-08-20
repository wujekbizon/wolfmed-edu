"use client";

import AuthSection from "@/components/AuthSection";

export default function TeachingPlaygroundNavbar() {
  return (
    <nav className="bg-zinc-800 border-b border-zinc-700">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Teaching Playground
          </h1>
        </div>
        <AuthSection />
      </div>
    </nav>
  );
}
