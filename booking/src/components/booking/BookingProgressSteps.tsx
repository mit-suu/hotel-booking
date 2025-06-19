import React from 'react';
import { Check } from 'lucide-react';

export interface StepData {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface BookingProgressStepsProps {
  steps: StepData[];
  currentStep: number;
  className?: string;
}

const BookingProgressSteps: React.FC<BookingProgressStepsProps> = ({
  steps,
  currentStep,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.step} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  step.isCompleted
                    ? 'bg-green-500 text-white shadow-lg'
                    : step.isActive
                    ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.step
                )}
              </div>
              
              {/* Step Info */}
              <div className="mt-3 text-center max-w-24">
                <div className={`text-sm font-medium transition-colors duration-300 ${
                  step.isActive ? 'text-blue-600' : step.isCompleted ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 mb-6">
                <div className={`h-0.5 transition-all duration-500 ${
                  step.isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile Progress Bar */}
      <div className="mt-6 sm:hidden">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round((currentStep / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingProgressSteps; 