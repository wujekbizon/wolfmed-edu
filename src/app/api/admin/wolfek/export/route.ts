import { isAdmin } from '@/helpers/isAdmin'
import { requireAdmin } from '@/helpers/requireAdmin'
import { getDefaultWolfekAdminFilters } from '@/helpers/getDefaultWolfekAdminFilters'
import { checkRateLimit } from '@/lib/rateLimit'
import { WolfekAdminFiltersSchema } from '@/server/schema'
import { getWolfekExport } from '@/server/wolfek-admin/getWolfekExport'
import { WOLFEK_EXPORT_MAX_BYTES, WOLFEK_PRIVATE_HEADERS as privateHeaders } from '@/constants/wolfekAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!await isAdmin()) return Response.json({ error: 'Brak dostępu.' }, { status: 403, headers: privateHeaders })
  const { userId } = await requireAdmin()
  if (!(await checkRateLimit(userId, 'admin:wolfek:export')).success) {
    return Response.json({ error: 'Zbyt wiele eksportów. Spróbuj za chwilę.' }, { status: 429, headers: privateHeaders })
  }
  const params = new URL(request.url).searchParams
  const defaults = getDefaultWolfekAdminFilters()
  const candidate = Object.fromEntries(Object.keys(defaults).map((key) => [key, params.get(key) ?? defaults[key as keyof typeof defaults]]))
  const filters = WolfekAdminFiltersSchema.safeParse(candidate)
  const format = params.get('format')
  if (!filters.success || (format !== 'csv' && format !== 'json')) {
    return Response.json({ error: 'Nieprawidłowe filtry lub format.' }, { status: 400, headers: privateHeaders })
  }
  try {
    const content = await getWolfekExport(filters.data, format)
    if (Buffer.byteLength(content, 'utf8') > WOLFEK_EXPORT_MAX_BYTES) {
      return Response.json({ error: 'Eksport jest zbyt duży. Zawęź filtry.' }, { status: 413, headers: privateHeaders })
    }
    return new Response(content, { headers: { ...privateHeaders,
      'Content-Type': format === 'csv' ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="wolfek-${filters.data.view}-${filters.data.from}-${filters.data.to}.${format}"`,
    } })
  } catch (error) {
    const limited = error instanceof Error && error.message.startsWith('Eksport przekracza')
    return Response.json({ error: limited ? error.message : 'Nie można przygotować eksportu.' },
      { status: limited ? 413 : 503, headers: privateHeaders })
  }
}
