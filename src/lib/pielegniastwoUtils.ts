import proceduresData from '../../data/proceduresPodstawy.json'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

const POLISH_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n', Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
}

export function slugifyProcedureName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => POLISH_MAP[char] ?? char)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const procedures = proceduresData as PielegniastwoProcedure[]

export function getAllPielegniastwoProcedures(): PielegniastwoProcedure[] {
  return procedures
}

export function getPielegniastwoProcedureBySlug(slug: string): PielegniastwoProcedure | null {
  return procedures.find((p) => slugifyProcedureName(p.name) === slug) ?? null
}

export function getPielegniastwoSlug(procedure: PielegniastwoProcedure): string {
  return slugifyProcedureName(procedure.name)
}
