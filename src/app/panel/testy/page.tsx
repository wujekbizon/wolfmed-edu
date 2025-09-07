import { Metadata } from 'next'
import GenerateTests from '@/components/GenerateTests'
import { fileData } from '@/server/fetchData'

export const metadata: Metadata = {
  title: 'Testy Opiekuna Medycznego',
  description:
    'Darmowa baza testów, oparata na 2 ostatnich latach z egzaminów i kursu MED-14: "Świadczenie usług medyczno-pielęgnacyjnych i opiekuńczych osobie chorej i niesamodzielnej"',
  keywords: 'opiekun, med-14, egzamin, testy, pytania, zagadnienia, medyczno-pielęgnacyjnych, opiekuńczych, baza',
}

export const dynamic = 'force-static'

export default async function TestsPage() {
  const tests = await fileData.getAllTests()

  if (!tests || tests.length === 0) {
    return <p>Brak dostępnych testów. Proszę spróbować później.</p>
  }
  return <GenerateTests tests={tests} />
}
