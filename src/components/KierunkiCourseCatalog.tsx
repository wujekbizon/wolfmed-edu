import { careerPaths } from '@/constants/careerPathsData'
import { KIERUNKI_CATALOG_ANCHOR } from '@/constants/kierunkiWolfek'
import PathCarousel from './PathCarousel'

export default function KierunkiCourseCatalog() {
  return <section id={KIERUNKI_CATALOG_ANCHOR} className="kierunki-catalog" aria-label="Kierunki">
    <PathCarousel paths={careerPaths} />
  </section>
}
