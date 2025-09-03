import React from 'react';
import { CourseOffering } from './utils/types';
import { formatTime, translateDay } from './utils/helpers';

interface CourseOfferingsTableProps {
  offerings: CourseOffering[];
  onEdit: (offering: CourseOffering, timeIndex: number) => void;
  onDelete: (offeringId: number, timeIndex: number) => void;
}

const CourseOfferingsTable: React.FC<CourseOfferingsTableProps> = ({ 
  offerings, 
  onEdit, 
  onDelete 
}) => {
  // Group offerings by group_code
  const groupOfferings = () => {
    const grouped: {[key: number]: CourseOffering[]} = {};
    
    offerings.forEach(offering => {
      if (!grouped[offering.group_code]) {
        grouped[offering.group_code] = [];
      }
      grouped[offering.group_code].push(offering);
    });
    
    return grouped;
  };

  const groupedOfferings = groupOfferings();

  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-semibold text-gray-700">برنامه‌های این درس</h4>
      </div>
      <div className="bg-gray-50 p-2 rounded-md min-h-32">
        {Object.keys(groupedOfferings).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">گروه</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">استاد</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کلاس</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">زمان‌بندی</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ آزمون</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ساعت آزمون</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(groupedOfferings).map(([groupCode, offerings]) => (
                  <tr key={groupCode}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      گروه {groupCode}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {offerings[0].lecturer.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {offerings[0].classroom.title}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900">
                      {offerings.flatMap(offering => 
                        offering.times.map((time, i) => (
                          <div key={`${offering.id}-${i}`} className="mb-1 last:mb-0">
                            {translateDay(time.day)}: {formatTime(time.start_time)}-{formatTime(time.end_time)}
                          </div>
                        ))
                      )}
                      {offerings.some(o => o.times.length === 0) && (
                        <div className="text-gray-500">ثبت نشده</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {offerings[0].examDate || 'ثبت نشده'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {offerings[0].quiz_time ? `${offerings[0].quiz_time}:00` : 'ثبت نشده'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(offerings[0], 0)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => onDelete(offerings[0].id, 0)}
                          className="text-red-500 hover:text-red-700"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-28 text-xs text-gray-500">
            هنوز برنامه‌ای برای این درس ثبت نشده است
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOfferingsTable;