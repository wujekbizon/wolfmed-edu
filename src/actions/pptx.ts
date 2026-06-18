'use server'

import { auth } from '@clerk/nextjs/server'
import { UTApi } from 'uploadthing/server'
import { parsePptx } from '@/lib/parsePptx'
import { generateSlug } from '@/helpers/blogUtils'

const PPTX_MIME =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
const MAX_PPTX_SIZE = 20 * 1024 * 1024 // 20MB

export interface ImportPptxResult {
  success: boolean
  error?: string
  data?: {
    title: string
    slug: string
    excerpt: string
    content: string
  }
}

export async function importPptxAction(
  formData: FormData
): Promise<ImportPptxResult> {
  try {
    const { userId, sessionClaims } = await auth()
    const userRole = (sessionClaims?.metadata as { role?: string })?.role
    if (!userId && userRole !== 'admin') {
      return { success: false, error: 'Brak uprawnień' }
    }

    const file = formData.get('file')
    if (!(file instanceof File)) {
      return { success: false, error: 'Nie wybrano pliku' }
    }

    const isPptx =
      file.type === PPTX_MIME || file.name.toLowerCase().endsWith('.pptx')
    if (!isPptx) {
      return { success: false, error: 'Plik musi być prezentacją PowerPoint (.pptx)' }
    }

    if (file.size > MAX_PPTX_SIZE) {
      return { success: false, error: 'Plik jest zbyt duży (maks. 20MB)' }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = parsePptx(buffer)

    let content = parsed.content

    if (parsed.images.length > 0) {
      try {
        const utapi = new UTApi()
        const filesToUpload = parsed.images.map(
          (img) =>
            new File([new Uint8Array(img.buffer)], img.mediaName, {
              type: img.contentType,
            })
        )
        const uploadResults = await utapi.uploadFiles(filesToUpload)

        parsed.images.forEach((img, index) => {
          const url = uploadResults[index]?.data?.ufsUrl
          const replacement = url ? `![Slajd](${url})` : ''
          content = content.replaceAll(img.token, replacement)
        })
      } catch (uploadError) {
        console.error('Failed to upload PPTX images:', uploadError)
        // Drop image tokens so the Markdown stays valid even without images.
        for (const img of parsed.images) {
          content = content.replaceAll(img.token, '')
        }
      }
    }

    // Collapse blank lines left behind by stripped/replaced image tokens.
    content = content.replace(/\n{3,}/g, '\n\n').trim()

    return {
      success: true,
      data: {
        title: parsed.title,
        slug: generateSlug(parsed.title),
        excerpt: parsed.excerpt,
        content,
      },
    }
  } catch (error) {
    console.error('PPTX import error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się przetworzyć prezentacji',
    }
  }
}
