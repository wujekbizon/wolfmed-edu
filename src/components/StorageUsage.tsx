'use client'

import React from 'react';

interface StorageUsageProps {
  storageUsed: number;
  storageLimit: number;
}

const StorageUsage: React.FC<StorageUsageProps> = ({ storageUsed, storageLimit }) => {
  const usagePercentage = (storageUsed / storageLimit) * 100;

  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-600';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className={`${getColorClass(usagePercentage)} h-2.5 rounded-full transition-all duration-300`}
        style={{ width: `${usagePercentage}%` }}
      ></div>
    </div>
  );
};

export default StorageUsage;
