import React from 'react';
import { X, Edit } from 'lucide-react';
import { CourseOffering } from './utils/types';
import { translateDay, formatTime } from './utils/helpers';
import { daysOfWeek } from './utils/helpers';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerings: CourseOffering[];
  onEdit?: (offering: CourseOffering) => void; 
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  offerings,
  onEdit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-[85vw] h-[85vh] max-w-[90vw] max-h-[90vh] overflow-auto relative">
        <button 
          onClick={onClose}
          className="absolute left-2 top-2 text-gray-700 hover:text-gray-900"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          برنامه هفتگی کلی
        </h3>
        
        <div className="mb-4 h-[calc(85vh-100px)]">
          {offerings.length > 0 ? (
            <div className="overflow-auto h-full">
              <div className="grid grid-cols-1 gap-4">
                {daysOfWeek.map(day => {
                  const dayOfferings = offerings.filter(offering => 
                    offering.times.some(time => time.day === day)
                  );
                  
                  if (dayOfferings.length === 0) return null;
                  
                  return (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-bold mb-3 text-gray-800">
                        {translateDay(day)}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
                        {dayOfferings.map((offering) => (
                          <div 
                            key={`${offering.id}-${day}`} 
                            className="border border-gray-200 rounded-md p-1 shadow-xs bg-gray-50 relative"
                            style={{ minWidth: "120px" }}
                          >
                            {/* دکمه ویرایش */}
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(offering);
                                }}
                                className="absolute left-1 top-1 text-blue-500 hover:text-blue-700"
                                title="ویرایش"
                              >
                                <Edit size={14} />
                              </button>
                            )}
                            
                            <div className="flex justify-between items-start mb-0.5">
                              <div className="font-semibold text-[10px] text-gray-900 leading-tight line-clamp-2">
                                {offering.course?.name} (گروه {offering.group_code})
                              </div>
                            </div>
                            
                            <div className="space-y-0.5">
                              <div className="text-[9px] leading-tight">
                                <span className="font-semibold text-gray-900">کد:</span> 
                                <span className="text-gray-800 mr-1"> {offering.course?.code}</span>
                              </div>
                              <div className="text-[9px] leading-tight line-clamp-1">
                                <span className="font-semibold text-gray-900">استاد:</span> 
                                <span className="text-gray-800 mr-1"> {offering.lecturer.name}</span>
                              </div>
                              <div className="text-[9px] leading-tight">
                                <span className="font-semibold text-gray-900">کلاس:</span> 
                                <span className="text-gray-800 mr-1"> {offering.classroom.title}</span>
                              </div>
                              <div className="text-[9px] leading-tight">
                                <span className="font-semibold text-gray-900">زمان: </span>
                                {offering.times
                                  .filter(time => time.day === day)
                                  .map((time, index) => (
                                    <span key={index} className="text-gray-700">
                                      {formatTime(time.start_time)}-{formatTime(time.end_time)}
                                      {index < offering.times.filter(t => t.day === day).length - 1 ? '، ' : ''}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-sm font-medium text-gray-700">
              هیچ برنامه‌ای ثبت نشده است
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;






