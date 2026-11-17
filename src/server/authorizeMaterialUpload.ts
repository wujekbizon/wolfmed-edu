import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { UploadThingError } from 'uploadthing/server'
import { getUserStorageUsage } from '@/server/queries'

export async function authorizeMaterialUpload() {
  const { userId } = await auth()
  if (!userId) throw new UploadThingError('Unauthorized')
  const { storageUsed, storageLimit } = await getUserStorageUsage(userId)
  if (storageUsed >= storageLimit) throw new UploadThingError('Przekroczono limit miejsca. Usuń niektóre pliki aby zwolnić miejsce.')
  return { userId }
}
