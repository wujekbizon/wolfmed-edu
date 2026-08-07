import Image from 'next/image'
import type { StoryScene } from '@/types/pathStoryTypes'

// Until real photography lands, the frame keeps the scene's rhythm with a
// hatched placeholder rather than collapsing the layout.
const HATCH =
  'repeating-linear-gradient(45deg, rgba(25,26,28,.05) 0 7px, transparent 7px 15px), linear-gradient(135deg, #E4F3EE, #EAE2F8)'

export default function StorySceneCard({
  scene,
  index,
  total,
}: {
  scene: StoryScene
  index: number
  total: number
}) {
  return (
    <>
      <div className="mb-4 flex items-center gap-3 font-mono text-[11px] font-medium">
        <span className="text-[#f65555]">{scene.time}</span>
        <span className="h-px flex-1 bg-zinc-900/10" />
        <span className="text-zinc-400">
          Scena {index + 1}/{total}
        </span>
      </div>

      <div className="relative h-[300px] w-full overflow-hidden rounded-xl">
        {scene.imgSrc ? (
          <Image
            src={scene.imgSrc}
            alt={scene.title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: HATCH }} />
        )}
        <span className="absolute bottom-[18px] left-[18px] rounded-md bg-white/85 px-2.5 py-1.5 font-mono text-[11px] leading-[1.4] text-zinc-600">
          [ foto: {scene.photoHint} ]
        </span>
      </div>

      <h3 className="mt-6 text-[27px] font-semibold leading-[1.25] tracking-[-0.015em] text-slate-900">
        {scene.title}
      </h3>
      <p className="mt-3 max-w-[560px] text-base leading-[1.7] text-zinc-600 text-pretty">
        {scene.description}
      </p>
    </>
  )
}
