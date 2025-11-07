import { auth } from '@clerk/nextjs/server';
import { getUserStorageUsage } from '@/server/queries';
import { formatBytes } from '@/helpers/formatBytes';
import StorageUsage from './StorageUsage';

export default async function StorageQuotaWidget() {
  const { userId } = await auth();
  if (!userId) return null;

  const { storageUsed, storageLimit } = await getUserStorageUsage(userId);
  const percentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold text-zinc-800 mb-3">
        Miejsce na dysku
      </h3>

      <StorageUsage storageUsed={storageUsed} storageLimit={storageLimit} />

      <div className="mt-2 flex justify-between items-center text-sm">
        <span className="text-zinc-600">
          {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
        </span>
        <span className="text-zinc-700 font-semibold">
          {percentage.toFixed(1)}%
        </span>
      </div>

      {percentage > 80 && percentage < 100 && (
        <p className="mt-2 text-xs text-yellow-600">
          ⚠️ Zbliżasz się do limitu!
        </p>
      )}

      {percentage >= 100 && (
        <p className="mt-2 text-xs text-red-600 font-semibold">
          ❌ Osiągnięto limit! Usuń pliki.
        </p>
      )}
    </div>
  );
}
