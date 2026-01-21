import { Suspense } from 'react'
import {
  getStoreStatusAction,
  listStoreDocumentsAction,
} from '@/actions/admin-rag-actions'
import StoreStatusCard from '@/components/rag/StoreStatusCard'
import CreateStoreSection from '@/components/rag/CreateStoreSection'
import UploadDocsSection from '@/components/rag/UploadDocsSection'
import DocumentListTable from '@/components/rag/DocumentListTable'
import TestQueryForm from '@/components/rag/TestQueryForm'

export const dynamic = 'force-dynamic'

async function AsyncRagDashboard() {

  const [storeStatus, documentsResult] = await Promise.all([
    getStoreStatusAction(),
    listStoreDocumentsAction(),
  ])

  const isConfigured = !!(storeStatus.success && storeStatus.data?.isConfigured)
  const documents = documentsResult.success ? documentsResult.data || [] : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">
          RAG System Management
        </h1>
        <p className="text-zinc-600 mt-2">
          Zarządzaj File Search Store i dokumentami medycznymi
        </p>
      </div>

      <StoreStatusCard
        isConfigured={isConfigured}
        storeName={storeStatus.data?.storeName || null}
        storeDisplayName={storeStatus.data?.storeDisplayName}
        documentCount={documents.length}
      />

      {!isConfigured && <CreateStoreSection />}

      {isConfigured && (
        <>
          <UploadDocsSection storeName={storeStatus.data?.storeName || ''} />

          <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Przesłane Dokumenty ({documents.length})
            </h2>
            <DocumentListTable documents={documents} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Testuj RAG Query
            </h2>
            <p className="text-zinc-600 mb-6">
              Przetestuj system RAG z przykładowym pytaniem
            </p>
            <TestQueryForm storeName={storeStatus.data?.storeName ?? undefined} />
          </div>
        </>
      )}
    </div>
  )
}

export default async function AdminRagPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-10 bg-zinc-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-zinc-200 rounded w-1/2"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200 animate-pulse">
            <div className="h-32 bg-zinc-200 rounded"></div>
          </div>
        </div>
      }
    >
      <AsyncRagDashboard />
    </Suspense>
  )
}
