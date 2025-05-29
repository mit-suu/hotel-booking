import React from 'react';

interface DatePickerProps {
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ onClose }) => {
  // This is a simplified date picker component
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Chọn ngày</h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-center mb-2 font-medium">Tháng 10, 2023</div>
          <div className="grid grid-cols-7 gap-1">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
              <div key={i} className="text-xs text-center text-gray-500 py-1">{day}</div>
            ))}
            {Array(31).fill(null).map((_, i) => {
              const day = i + 1;
              const isSelected = day >= 22 && day <= 25;
              const isStart = day === 22;
              const isEnd = day === 25;
              
              return (
                <button
                  key={i}
                  className={`rounded-md py-1 text-sm ${
                    isSelected 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'hover:bg-gray-100'
                  } ${isStart ? 'rounded-l-md' : ''} ${isEnd ? 'rounded-r-md' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        
        <div>
          <div className="text-center mb-2 font-medium">Tháng 11, 2023</div>
          <div className="grid grid-cols-7 gap-1">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
              <div key={i} className="text-xs text-center text-gray-500 py-1">{day}</div>
            ))}
            {Array(30).fill(null).map((_, i) => (
              <button
                key={i}
                className="rounded-md py-1 text-sm hover:bg-gray-100"
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between">
        <button 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Xóa ngày
        </button>
        <button 
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default DatePicker;
