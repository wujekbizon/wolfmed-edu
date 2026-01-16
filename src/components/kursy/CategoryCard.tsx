import Link from 'next/link'
import { hasAccessToTier } from '@/lib/accessTiers'
import type { AccessTier, CategoryMetadata } from '@/types/categoryType'
import { Clock, BookOpen, Lock } from 'lucide-react'

interface CategoryCardProps {
  category: CategoryMetadata
  userTier: string
}

export function CategoryCard({ category, userTier }: CategoryCardProps) {
  const hasTierAccess = hasAccessToTier(
    userTier as AccessTier,
    category.requiredTier
  )

  const questionRange = category.numberOfQuestions 
    ? `${category.numberOfQuestions[0]}-${category.numberOfQuestions[category.numberOfQuestions.length - 1]}`
    : '??'

    const durationRange = category.duration 
    ? `${category.duration[0]}-${category.duration[category.duration.length - 1]}`
    : '??'

  const cardContent = (
    <div className={`group relative h-full flex flex-col overflow-hidden rounded-xl border transition-all duration-500 
      ${hasTierAccess 
        ? 'bg-white/70 backdrop-blur-xl border-zinc-300/80 shadow-sm hover:shadow-md hover:border-slate-400/50' 
        : 'bg-zinc-100/50 border-zinc-200 grayscale-[0.6] cursor-not-allowed'
      }`}>
 
      <div className="relative h-56 w-full overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.title || category.category}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-zinc-200 to-zinc-300" />
        )}
        
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />
    
        <div className="absolute top-4 left-4 flex gap-2">
           <span className="bg-white/90 backdrop-blur-md text-zinc-800 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
             {category.course}
           </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-slate-700 transition-colors">
          {category.title || category.category.replace(/-/g, ' ')}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
            {category.description}
          </p>
        </div>

        <div className="mt-auto pt-4 flex items-center gap-4 border-t border-zinc-100/80">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <BookOpen size={16} className="text-amber-500" />
            <span className="text-xs font-semibold">{questionRange} pytań</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Clock size={16} className="text-rose-500" />
            <span className="text-xs font-semibold">{durationRange} min</span>
          </div>
        </div>
      </div>

      {!hasTierAccess && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start bg-zinc-600/50 transition-all duration-300">
          <div className="bg-white p-2 border border-zinc-800/60 mt-12 rounded-xl flex flex-col items-center gap-2 transition-transform">
            <Lock className="text-rose-400" size={26} />
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">
              Wymagana subskrypcja<br/>
              <span className="text-blue-600 text-xs">{category.requiredTier}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )

  if (!hasTierAccess) return <div className="aspect-4/5">{cardContent}</div>

  return (
    <Link href={`/panel/kursy/${category.category}`} className="block aspect-4/5">
      {cardContent}
    </Link>
  )
}