import React from 'react';

interface StorageUsageProps {
  storageUsed: number;
  storageLimit: number;
}

const StorageUsage: React.FC<StorageUsageProps> = ({ storageUsed, storageLimit }) => {
  const usagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${usagePercentage}%` }}
      ></div>
    </div>
  );
};

export default StorageUsage;
