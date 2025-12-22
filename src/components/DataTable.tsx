import React from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  title: string;
  onCreate?: () => void;
  keyField: keyof T; // Must specify 'id_key'
}

export function DataTable<T>({ 
    data, 
    columns, 
    onEdit, 
    onDelete, 
    title,
    onCreate,
    keyField
}: DataTableProps<T>) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {onCreate && (
            <button 
                onClick={onCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={String(item[keyField])} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof col.accessorKey === 'function' 
                        ? col.accessorKey(item)
                        : (item[col.accessorKey] as React.ReactNode)
                    }
                  </td>
                ))}
                {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(item)}
                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-md transition-colors cursor-pointer"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(item)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition-colors cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                        No data available
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
