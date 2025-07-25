import React from 'react';
import { CheckCircle, Clock, X, AlertTriangle, Calendar } from 'lucide-react';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CANCELLED_BY_GUEST' | 'CANCELLED_BY_HOST' | 'COMPLETED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'REFUND_PENDING' | 'NO_PAYMENT' | 'CANCELLED';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      PENDING: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      },
      CONFIRMED: {
        label: 'Confirmed',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      CANCELLED: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: X
      },
      CANCELLED_BY_GUEST: {
        label: 'Cancelled by Guest',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: X
      },
      CANCELLED_BY_HOST: {
        label: 'Cancelled by Host',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: X
      },
      COMPLETED: {
        label: 'Completed',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle
      },
      NO_SHOW: {
        label: 'No Show',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertTriangle
      }
    };

    return configs[status] || configs.PENDING;
  };

  const getSizeClasses = (size: string) => {
    const classes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    return classes[size as keyof typeof classes] || classes.md;
  };

  const getIconSize = (size: string) => {
    const sizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return sizes[size as keyof typeof sizes] || sizes.md;
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium border ${config.className}`}>
      {showIcon && <IconComponent className={`${iconSize} mr-1`} />}
      {config.label}
    </span>
  );
};

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const getStatusConfig = (status: PaymentStatus) => {
    const configs = {
      PENDING: {
        label: 'Pending Payment',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      },
      PAID: {
        label: 'Paid',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      FAILED: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: X
      },
      REFUNDED: {
        label: 'Refunded',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Calendar
      },
      PARTIALLY_REFUNDED: {
        label: 'Partially Refunded',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Calendar
      },
      REFUND_PENDING: {
        label: 'Refund Pending',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Clock
      },
      NO_PAYMENT: {
        label: 'No Payment',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: X
      },
      CANCELLED: {
        label: 'No Refund',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: X
      }
    };

    return configs[status] || configs.PENDING;
  };

  const getSizeClasses = (size: string) => {
    const classes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    return classes[size as keyof typeof classes] || classes.md;
  };

  const getIconSize = (size: string) => {
    const sizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return sizes[size as keyof typeof sizes] || sizes.md;
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium border ${config.className}`}>
      {showIcon && <IconComponent className={`${iconSize} mr-1`} />}
      {config.label}
    </span>
  );
};

export default BookingStatusBadge; 