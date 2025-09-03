import React from 'react';
import { X } from 'lucide-react';
import { Term } from './utils/types';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: Term[];
}

const MergeModal: React.FC<MergeModalProps> = ({ isOpen, onClose, terms }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h3 className="text-xl font-bold mb-4 text-gray-800">ادغام برنامه درسی</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="course-select" className="block text-sm font-medium text-gray-900">انتخاب درس</label>
            <select
              id="course-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- لطفا یک درس را انتخاب کنید --</option>
              {terms.map(term => (
                <optgroup key={term.id} label={term.name}>
                  {term.courses.map(course => (
                    <option 
                      key={course.id} 
                      value={course.id}
                      className="px-2 py-1 hover:bg-blue-100"
                    >
                      {course.name} ({course.code})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
            >
              ادغام برنامه‌ها
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeModal;