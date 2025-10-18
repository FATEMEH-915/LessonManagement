import React from 'react';
import { X } from 'lucide-react';
import { CourseDetails, CourseOffering } from './utils/types';
import CourseOfferingsTable from './CourseOfferingsTable';
import { formatRequirements } from './utils/helpers';

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseDetails | null;
  offerings: CourseOffering[];
  onEditOffering: (offering: CourseOffering, timeIndex: number) => void;
  onDeleteOffering: (offeringId: number, timeIndex: number) => void;
  onAddToSchedule: () => void;
  onMergeSchedule: () => void;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  isOpen,
  onClose,
  course,
  offerings,
  onEditOffering,
  onDeleteOffering,
  onAddToSchedule,
  onMergeSchedule
}) => {
  const calculateTotalPrograms = (): number => {
    return offerings.reduce((total, offering) => {
      return total + (offering.times?.length > 0 ? offering.times.length : 1);
    }, 0);
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={14} />
        </button>
        
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          جزئیات درس: {course.name}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700">نام درس: <span className="font-medium">{course.name}</span></p>
            </div>
            <div>
              <p className="text-gray-700">کد درس: <span className="font-medium">{course.code}</span></p>
            </div>
            <div>
              <p className="text-gray-700">واحد: <span className="font-medium">{course.units}</span></p>
            </div>
            <div>
              <p className="text-gray-700">پیشنیازها: <span className="font-medium">
                {formatRequirements(course.prerequisites)}
              </span></p>
            </div>
            <div>
              <p className="text-gray-700">همنیازها: <span className="font-medium">
                {formatRequirements(course.corequisites)}
              </span></p>
            </div>
            <div>
              <p className="text-gray-700">تعداد برنامه‌ها: <span className="font-medium">
                {calculateTotalPrograms()}
              </span></p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={onAddToSchedule}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              افزودن برنامه
            </button>
            <button
              onClick={onMergeSchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ادغام برنامه
            </button>
          </div>

          <CourseOfferingsTable 
            offerings={offerings}
            onEdit={onEditOffering}
            onDelete={onDeleteOffering}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal;






