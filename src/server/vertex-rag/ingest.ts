import 'server-only'
import { vertexFetch, vertexUploadFetch } from './client'

// Direct synchronous upload of in-memory files to a corpus. Vertex RAG Engine's
// direct upload returns immediately (no LRO to poll), unlike batch :import.
export async function uploadFiles(
  corpusName: string,
  files: File[]
): Promise<{ success: boolean; uploaded: string[]; failed: string[] }> {
  const results = {
    success: true,
    uploaded: [] as string[],
    failed: [] as string[],
  }

  if (files.length === 0) {
    throw new Error('No files provided for upload')
  }

  for (const file of files) {
    try {
      let mimeType = file.type
      if (!mimeType) {
        if (file.name.endsWith('.md')) mimeType = 'text/markdown'
        else if (file.name.endsWith('.txt')) mimeType = 'text/plain'
        else if (file.name.endsWith('.pdf')) mimeType = 'application/pdf'
        else mimeType = 'application/octet-stream'
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadResult = await vertexUploadFetch(
        `${corpusName}/ragFiles:upload`,
        { rag_file: { display_name: file.name } },
        buffer,
        mimeType,
        file.name
      )

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message || 'Upload failed')
      }

      results.uploaded.push(file.name)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      results.failed.push(file.name)
      results.success = false
    }
  }

  return results
}

// Batch import from Google Cloud Storage for bulk backfills (the Phase 2
// re-upload of a grown document library). Async LRO, idempotent by content hash.
// Returns the operation resource name; poll it if you need completion.
export async function importFilesFromGcs(
  corpusName: string,
  gcsUris: string[]
): Promise<string> {
  const result = await vertexFetch(`${corpusName}/ragFiles:import`, {
    method: 'POST',
    body: JSON.stringify({
      import_rag_files_config: {
        gcs_source: { uris: gcsUris },
      },
    }),
  })

  const opName = result.name as string | undefined
  if (!opName) {
    throw new Error('Unexpected response shape from ragFiles:import: ' + JSON.stringify(result))
  }
  return opName
}

export async function listCorpusFiles(corpusName: string): Promise<
  Array<{
    name: string
    displayName: string
  }>
> {
  try {
    const response = await vertexFetch(`${corpusName}/ragFiles`)
    const documents: Array<Record<string, string>> = response.ragFiles || []

    return documents.map((doc) => ({
      name: doc.name || '',
      displayName: doc.displayName || doc.display_name || doc.name || 'Unknown',
    }))
  } catch (error) {
    console.error('Error listing corpus files:', error)
    throw new Error('Nie można pobrać listy dokumentów')
  }
}
