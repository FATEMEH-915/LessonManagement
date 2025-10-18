import React, { useState, ChangeEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import Select from 'react-select';
import { CourseOffering, FormData } from './utils/types';
import { translateDay, formatTime } from './utils/helpers';

interface EditOfferingModalProps {
  isOpen: boolean;
  onClose: () => void;
  offering: CourseOffering | null;
  lecturers: any[];
  classrooms: any[];
  onSubmit: (e: React.FormEvent, formData: FormData) => void;
  loading: boolean;
  error: string;
}

const EditOfferingModal: React.FC<EditOfferingModalProps> = ({
  isOpen,
  onClose,
  offering,
  lecturers,
  classrooms,
  onSubmit,
  loading,
  error
}) => {
  const [formData, setFormData] = useState<FormData>({
    group_code: 0,
    year: new Date().getFullYear() - 621,
    quiz_time: 0,
    lecturer_id: 0,
    classroom_id: 0,
    times: [{
      day: "saturday",
      start_time: [8, 0] as [number, number],
      end_time: [10, 0] as [number, number]
    }],
    examDate: "",
    classroom: ""
  });

  const [searchClassroomInput, setSearchClassroomInput] = useState('');
  const [searchLecturerInput, setSearchLecturerInput] = useState('');

  
  useEffect(() => {
    if (offering) {
      setFormData({
        group_code: offering.group_code || 0,
        year: offering.year || new Date().getFullYear() - 621,
        quiz_time: offering.quiz_time || 0,
        lecturer_id: offering.lecturer?.id || 0,
        classroom_id: offering.classroom?.id || 0,
        times: offering.times?.map(time => ({
          day: time.day,
          start_time: time.start_time,
          end_time: time.end_time
        })) || [{
          day: "saturday",
          start_time: [8, 0] as [number, number],
          end_time: [10, 0] as [number, number]
        }],
        examDate: offering.examDate || "",
        classroom: offering.classroom?.title || ""
      });
    }
  }, [offering]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("_id") || name.includes("_code") || name === "quiz_time" 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleClassroomChange = (selectedOption: any) => {
    setFormData(prev => ({
      ...prev,
      classroom_id: selectedOption ? selectedOption.value : 0,
      classroom: selectedOption ? selectedOption.label : ""
    }));
  };

  const handleLecturerChange = (selectedOption: any) => {
    setFormData(prev => ({
      ...prev,
      lecturer_id: selectedOption ? selectedOption.value : 0
    }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [
        ...prev.times,
        {
          day: "saturday",
          start_time: [8, 0] as [number, number],
          end_time: [10, 0] as [number, number]
        }
      ]
    }));
  };

  const removeTimeSlot = (index: number) => {
    const confirmDelete = window.confirm('آیا مطمئن هستید که می‌خواهید این جلسه را حذف کنید؟');
    if (confirmDelete) {
      setFormData(prev => ({
        ...prev,
        times: prev.times.filter((_, i) => i !== index)
      }));
    }
  };

  const handleTimeChange = (
    index: number,
    field: "day" | "start_time" | "end_time",
    value: any
  ) => {
    setFormData(prev => {
      const newTimes = [...prev.times];
      if (field === "day") {
        newTimes[index] = { ...newTimes[index], day: value };
      } else {
        newTimes[index] = { ...newTimes[index], [field]: value };
      }
      return { ...prev, times: newTimes };
    });
  };

  if (!isOpen || !offering) return null;

  const lecturerOptions = lecturers.map(lecturer => ({
    value: lecturer.id,
    label: `${lecturer.name} (کد: ${lecturer.code})`
  }));

  const classroomOptions = classrooms.map(classroom => ({
    value: classroom.id,
    label: classroom.title
  }));

  const filteredClassrooms = classroomOptions.filter(option =>
    option.label.toLowerCase().includes(searchClassroomInput.toLowerCase())
  );

  const filteredLecturers = lecturerOptions.filter(option =>
    option.label.toLowerCase().includes(searchLecturerInput.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute left-2 top-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-lg font-bold mb-3 text-gray-800">
          درس: {offering.course?.name} ({offering.course?.code})
        </h3>
        
        {error && (
          <div className="mb-3 p-2 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={(e) => onSubmit(e, formData)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900">کد گروه</label>
              <input
                type="text"
                name="group_code"
                value={formData.group_code}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900">استاد</label>
              <Select
                options={filteredLecturers}
                onInputChange={(inputValue) => setSearchLecturerInput(inputValue)}
                onChange={handleLecturerChange}
                value={lecturerOptions.find(option => option.value === formData.lecturer_id)}
                placeholder="جستجو و انتخاب استاد..."
                noOptionsMessage={() => "استادی یافت نشد"}
                className="text-right text-xs text-gray-600"
                classNamePrefix="my-select"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900">سال تحصیلی</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900">ساعت آزمون</label>
              <input
                type="text"
                name="quiz_time"
                value={formData.quiz_time}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900">کلاس</label>
              <Select
                options={filteredClassrooms}
                onInputChange={(inputValue) => setSearchClassroomInput(inputValue)}
                onChange={handleClassroomChange}
                value={classroomOptions.find(option => option.value === formData.classroom_id)}
                placeholder="جستجو و انتخاب کلاس..."
                noOptionsMessage={() => "کلاسی یافت نشد"}
                className="text-right text-xs text-gray-600"
                classNamePrefix="my-select"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900">تاریخ آزمون</label>
              <input
                type="text"
                name="examDate"
                value={formData.examDate}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="1404/05/17"
                required
              />
            </div>
          </div>

          {formData.times.map((time, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-900">جلسه {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  حذف
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-900">روز</label>
                  <select
                    value={time.day}
                    onChange={(e) => handleTimeChange(index, "day", e.target.value)}
                    className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  >
                    <option value="saturday">شنبه</option>
                    <option value="sunday">یکشنبه</option>
                    <option value="monday">دوشنبه</option>
                    <option value="tuesday">سه‌شنبه</option>
                    <option value="wednesday">چهارشنبه</option>
                    <option value="thursday">پنجشنبه</option>
                    <option value="friday">جمعه</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-900">شروع</label>
                  <input
                    type="time"
                    value={`${time.start_time[0].toString().padStart(2, '0')}:${time.start_time[1].toString().padStart(2, '0')}`}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      handleTimeChange(index, "start_time", [hours, minutes]);
                    }}
                    className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-900">پایان</label>
                  <input
                    type="time"
                    value={`${time.end_time[0].toString().padStart(2, '0')}:${time.end_time[1].toString().padStart(2, '0')}`}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      handleTimeChange(index, "end_time", [hours, minutes]);
                    }}
                    className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addTimeSlot}
            className="w-full text-xs text-blue-600 hover:text-blue-800 py-1 border border-dashed border-gray-300 rounded-md"
          >
            + افزودن زمان جدید
          </button>
          
          <div className="pt-3 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-48 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'در حال ویرایش...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOfferingModal;







