import React from 'react';
import { AlertTriangle, Trash2, Eye } from 'lucide-react';

interface VoucherDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  onDisableInstead: () => void;
  voucherCode: string;
  hasUsageRecords: boolean;
}

const VoucherDeleteConfirmModal: React.FC<VoucherDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  onDisableInstead,
  voucherCode,
  hasUsageRecords
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              {hasUsageRecords ? (
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              ) : (
                <Trash2 className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {hasUsageRecords ? 'Cannot Delete Voucher' : 'Confirm Voucher Deletion'}
              </h3>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">
              Voucher: <span className="font-semibold text-blue-600">{voucherCode}</span>
            </p>
            
            {hasUsageRecords ? (
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    <strong>This voucher has been used in bookings!</strong>
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    To protect data integrity, you should <strong>disable the voucher</strong> instead of deleting it.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Recommendation:</strong> Disable the voucher to stop usage while preserving history.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this voucher? This action cannot be undone.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            
            {hasUsageRecords ? (
              <>
                <button
                  onClick={onDisableInstead}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Disable Voucher
                </button>
                <button
                  onClick={onConfirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Force Delete
                </button>
              </>
            ) : (
                              <button
                  onClick={onConfirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Voucher
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherDeleteConfirmModal; 