import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BedDouble, Users, DollarSign, Eye, Edit, Trash,
  Calendar 
} from 'lucide-react';
import { RoomTypeResponse } from '../services/api';

interface RoomTypeCardProps {
  roomType: RoomTypeResponse;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  actionLoading?: string | null;
  compact?: boolean;
}

const RoomTypeCard: React.FC<RoomTypeCardProps> = ({
  roomType,
  showActions = true,
  onEdit,
  onDelete,
  actionLoading,
  compact = false
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getBedTypeText = (bedType: string) => {
    const bedTypes: Record<string, string> = {
      'Single': 'Giường đơn',
      'Double': 'Giường đôi',
      'Queen': 'Giường Queen',
      'King': 'Giường King',
      'Twin': 'Giường đôi riêng biệt',
      'Sofa Bed': 'Giường sofa'
    };
    return bedTypes[bedType] || bedType;
  };

  const handleView = () => {
    navigate(`/admin/room-types/${roomType.id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(roomType.id);
    } else {
      navigate(`/admin/room-types/edit/${roomType.id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(roomType.id, roomType.name);
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 truncate">{roomType.name}</h3>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Users size={14} className="mr-1" />
              <span>{roomType.maxOccupancy} người</span>
            </div>
            <div className="flex items-center text-gray-600">
              <BedDouble size={14} className="mr-1" />
              <span>{roomType.totalRooms} phòng</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>{roomType.availableRooms} trống</span>
            </div>
            <div className="flex items-center font-semibold text-blue-600">
              <DollarSign size={14} className="mr-1" />
              <span>{formatCurrency(roomType.pricePerNight)}</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleView}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Eye size={14} className="mr-1" />
              Xem
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center"
            >
              <Edit size={14} className="mr-1" />
              Sửa
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {roomType.imageUrl ? (
        <img
          src={roomType.imageUrl}
          alt={roomType.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <BedDouble size={48} className="text-gray-400" />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{roomType.name}</h3>
            {roomType.hotelName && (
              <p className="text-sm text-gray-600">{roomType.hotelName}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {roomType.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {roomType.description}
          </p>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Users size={16} className="mr-2" />
            <span className="text-sm">{roomType.maxOccupancy} người</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <BedDouble size={16} className="mr-2" />
            <span className="text-sm">{roomType.bedType ? getBedTypeText(roomType.bedType) : 'N/A'}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span className="text-sm">{roomType.totalRooms} phòng</span>
          </div>

          <div className="flex items-center text-green-600">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm">{roomType.availableRooms} trống</span>
          </div>
        </div>

        {/* Room Size */}
        {roomType.roomSize && (
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              Diện tích: <span className="font-medium">{roomType.roomSize} m²</span>
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Giá mỗi đêm:</span>
          <span className="text-lg font-semibold text-blue-600">
            {formatCurrency(roomType.pricePerNight)}
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={handleView}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Eye size={16} className="mr-1" />
              Xem
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center"
            >
              <Edit size={16} className="mr-1" />
              Sửa
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={actionLoading === `delete-roomtype-${roomType.id}`}
                className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomTypeCard; 