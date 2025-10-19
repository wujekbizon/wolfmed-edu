import { fileData } from '@/server/fetchData'
import { Metadata } from 'next'
import { getPopulatedCategories } from '@/helpers/populateCategories'
import LearningHubDashboard from '@/components/LearningHubDashboard'
import { getAllUserNotes, getMaterialsByUser } from '@/server/queries'
import {  currentUser } from '@clerk/nextjs/server'
import type { NotesType } from '@/types/notesTypes'
import type { MaterialsType } from '@/types/materialsTypes'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Baza pytań Nauka',
  description:
    'Baza testów z egzaminów i kursów medycznych',
  keywords: 'nauka, egzamin, testy, pytania, zagadnienia, baza',
}

export default async function NaukaPage() {
  const user = await currentUser()

  const populatedCategories = await getPopulatedCategories(fileData)
  const userAllNotes = user ? (await getAllUserNotes(user.id) as NotesType[]) : []

  const materials = user ? await getMaterialsByUser(user.id) as MaterialsType[] : []

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80'>
      <LearningHubDashboard materials={materials} categories={populatedCategories} notes={userAllNotes}/>
    </section>
  )
}
