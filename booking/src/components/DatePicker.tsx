import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  onClose: () => void;
  checkIn?: Date;
  checkOut?: Date;
  onDatesChange: (dates: { checkIn?: Date; checkOut?: Date }) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  onClose, 
  checkIn, 
  checkOut, 
  onDatesChange 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<{ checkIn?: Date; checkOut?: Date }>({
    checkIn,
    checkOut
  });
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);

  useEffect(() => {
    setSelectedDates({ checkIn, checkOut });
  }, [checkIn, checkOut]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getNextMonth = (date: Date) => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDates.checkIn && !selectedDates.checkOut) return false;
    
    if (selectedDates.checkIn && isSameDay(date, selectedDates.checkIn)) return true;
    if (selectedDates.checkOut && isSameDay(date, selectedDates.checkOut)) return true;
    
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    return date > selectedDates.checkIn && date < selectedDates.checkOut;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!selectedDates.checkIn || isSelectingCheckOut) {
      if (!selectedDates.checkIn) {
        // Selecting check-in date
        setSelectedDates({ checkIn: date, checkOut: undefined });
        setIsSelectingCheckOut(true);
      } else if (date >= selectedDates.checkIn) {
        // Selecting check-out date
        setSelectedDates(prev => ({ ...prev, checkOut: date }));
        setIsSelectingCheckOut(false);
      } else {
        // If selected date is before check-in, make it new check-in
        setSelectedDates({ checkIn: date, checkOut: undefined });
        setIsSelectingCheckOut(true);
      }
    } else {
      // Reset selection if both dates are already selected
      setSelectedDates({ checkIn: date, checkOut: undefined });
      setIsSelectingCheckOut(true);
    }
  };

  const handleApply = () => {
    onDatesChange(selectedDates);
    onClose();
  };

  const handleClear = () => {
    setSelectedDates({ checkIn: undefined, checkOut: undefined });
    setIsSelectingCheckOut(false);
  };

  const renderCalendar = (date: Date) => {
    const days = getDaysInMonth(date);
    
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={isSameMonth(date, new Date())}
          >
            <ChevronLeft size={16} className={isSameMonth(date, new Date()) ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <div className="font-medium text-gray-900">
            {monthNames[date.getMonth()]} {date.getFullYear()}
          </div>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-xs text-center text-gray-500 py-1 font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="py-2"></div>;
            }
            
            const isSelected = isDateSelected(day);
            const isInRange = isDateInRange(day);
            const isDisabled = isDateDisabled(day);
            const isCheckIn = selectedDates.checkIn && isSameDay(day, selectedDates.checkIn);
            const isCheckOut = selectedDates.checkOut && isSameDay(day, selectedDates.checkOut);
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={isDisabled}
                className={`
                  py-2 text-sm relative transition-colors
                  ${isDisabled 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'hover:bg-blue-50 cursor-pointer'
                  }
                  ${isSelected 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : ''
                  }
                  ${isInRange 
                    ? 'bg-blue-100 text-blue-700' 
                    : ''
                  }
                  ${isCheckIn ? 'rounded-l-md' : ''}
                  ${isCheckOut ? 'rounded-r-md' : ''}
                  ${isSelected && !isInRange ? 'rounded-md' : ''}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full max-w-[600px] md:min-w-[600px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Chọn ngày</h3>
          <p className="text-sm text-gray-600">
            {!selectedDates.checkIn 
              ? 'Chọn ngày nhận phòng' 
              : !selectedDates.checkOut 
                ? 'Chọn ngày trả phòng'
                : 'Hoàn thành'
            }
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {renderCalendar(currentMonth)}
        <div className="hidden md:block">
          {renderCalendar(getNextMonth(currentMonth))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <button 
          onClick={handleClear}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Xóa ngày
        </button>
        <div className="flex gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Hủy
          </button>
          <button 
            onClick={handleApply}
            disabled={!selectedDates.checkIn}
            className={`px-6 py-2 rounded-md text-sm font-medium ${
              selectedDates.checkIn
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
