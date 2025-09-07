import AllTests from '@/components/AllTests'
import { fileData } from '@/server/fetchData'
import { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Baza pytań Opiekuna Medycznego',
  description:
    'Darmowa baza testów, oparata na 2 ostatnich latach z egzaminów i kursu MED-14: "Świadczenie usług medyczno-pielęgnacyjnych i opiekuńczych osobie chorej i niesamodzielnej"',
  keywords: 'opiekun, med-14, egzamin, testy, pytania, zagadnienia, medyczno-pielęgnacyjnych, opiekuńczych, baza',
}

export default async function NaukaPage() {
  const tests = await fileData.getAllTests()
  return <AllTests tests={tests} />
}
