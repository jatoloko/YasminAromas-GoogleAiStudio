import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

/**
 * Componente Skeleton para loading states
 * Simula a estrutura do conteúdo enquanto carrega
 */
export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '',
  count = 1,
  height = 'h-4',
  width = 'w-full'
}) => {
  const skeletons = Array(count).fill(0);
  
  return (
    <>
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className} ${i > 0 ? 'mt-2' : ''}`}
        />
      ))}
    </>
  );
};

/**
 * Skeleton para linhas de tabela
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-gray-200">
      {Array(columns).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height="h-4" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Skeleton para cards
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <Skeleton height="h-6" width="w-3/4" className="mb-3" />
      <Skeleton height="h-4" width="w-full" className="mb-2" />
      <Skeleton height="h-4" width="w-5/6" />
    </div>
  );
};

/**
 * Skeleton para lista
 */
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {Array(items).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <Skeleton height="h-4" width="w-2/4" />
            <Skeleton height="h-4" width="w-1/4" />
          </div>
          <Skeleton height="h-3" width="w-3/4" className="mt-2" />
        </div>
      ))}
    </div>
  );
};

