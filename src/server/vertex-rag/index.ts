import 'server-only'

// Public surface of the Vertex AI RAG Engine module. Importers use
// '@/server/vertex-rag' rather than reaching into individual files.
export {
  PROJECT_ID,
  LOCATION,
  getGoogleAI,
  vertexFetch,
  vertexUploadFetch,
  getAccessToken,
} from './client'

export { parseGoogleApiError } from './errors'

export {
  createCorpus,
  deleteCorpus,
  getCorpus,
  DEFAULT_EMBEDDING_MODEL,
} from './corpus'

export { uploadFiles, importFilesFromGcs, listCorpusFiles } from './ingest'

export { retrieveContexts, type RetrievedContext } from './retrieve'

export { retrieveCorpusContext, type CorpusContext } from './context'

export {
  generateGroundedAnswer,
  executeToolWithContent,
  answerFromMemory,
} from './generate'

export {
  getRagEngineConfig,
  patchRagEngineConfig,
  setDeploymentMode,
  setRagManagedDbTier,
  type RagManagedDbTier,
  type DeploymentMode,
} from './config'
