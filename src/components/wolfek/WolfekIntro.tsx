import type { WolfekIntroProps } from '@/types/wolfekTypes'

export default function WolfekIntro({ description, id }: WolfekIntroProps) {
  return <div className="wolfek-intro">
    <h2 id={id}>Hej, jestem Wolfek!</h2>
    <p>{description}</p>
  </div>
}
