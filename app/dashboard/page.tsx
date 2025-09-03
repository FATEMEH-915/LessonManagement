"use client";
import { useEffect, useState, useMemo } from 'react';
import AuthGuard from '../components/AuthGuard';
import { showSuccessToast, showErrorToast, ToastNotifications } from '../dashboard/ToastNotifications';
import ChartList from '../dashboard/ChartList';
import CourseDetailsModal from '../dashboard/CourseDetailsModal';
import ScheduleModal from '../dashboard/ScheduleModal';
import AddOfferingModal from '../dashboard/AddOfferingModal';
import EditOfferingModal from '../dashboard/EditOfferingModal';
import MergeModal from '../dashboard/MergeModal';
import { loadAllCharts, loadChartDetails, loadCourseOfferings, loadAllLecturers, loadAllClassrooms, loadAllOfferings, updateOffering, addOffering, deleteOffering } from '../dashboard/utils/api';
import { Chart, Term, Course, CourseDetails, CourseOffering, Lecturer, Classroom } from '../dashboard/utils/types';

export default function Dashboard() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null);
  const [chartDetails, setChartDetails] = useState<{ terms: Term[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [courseOfferings, setCourseOfferings] = useState<CourseOffering[]>([]);
  const [allOfferings, setAllOfferings] = useState<CourseOffering[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [editingOffering, setEditingOffering] = useState<CourseOffering | null>(null);
  
  const [formData, setFormData] = useState({
    group_code: 0,
    year: new Date().getFullYear() - 621,
    quiz_time: 0,
    lecturer_id: 0,
    classroom_id: 0,
    times: [
      {
        day: "saturday",
        start_time: [8, 0] as [number, number],
        end_time: [10, 0] as [number, number]
      }
    ],
    examDate: "",
    classroom: ""
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [chartsData, lecturersData, classroomsData] = await Promise.all([
          loadAllCharts(),
          loadAllLecturers(),
          loadAllClassrooms()
        ]);
        
        setCharts(chartsData);
        setLecturers(lecturersData);
        setClassrooms(classroomsData);

        const offerings = await loadAllOfferings(chartsData);
        setAllOfferings(offerings);
      } catch (err) {
        setError('خطا در دریافت اطلاعات اولیه');
        console.error('Error loading initial data:', err);
        showErrorToast('خطا در دریافت اطلاعات اولیه');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleChartSelect = async (chart: Chart) => {
    try {
      setDetailsLoading(true);
      setSelectedChart(chart);
      const details = await loadChartDetails(chart.id.toString());
      setChartDetails(details);
      showSuccessToast(`چارت ${chart.title} با موفقیت بارگذاری شد`);
    } catch (err) {
      setError('خطا در دریافت جزئیات چارت');
      console.error('Error loading chart details:', err);
      showErrorToast('خطا در دریافت جزئیات چارت');
    } finally {
      setDetailsLoading(false);
    }
  };

  const calculateCourseOfferingsCount = (courseId: string) => {
    return allOfferings
      .filter(o => o.course.id === courseId)
      .reduce((total, offering) => total + (offering.times.length > 0 ? offering.times.length : 1), 0);
  };

  const handleCourseClick = async (course: Course) => {
    try {
      setCourseOfferings([]);
      setSelectedCourse({
        ...course,
        description: 'توضیحات درس در سیستم ثبت نشده است',
        professor: 'استاد این درس مشخص نشده است',
        classTime: 'زمان کلاس تعیین نشده است',
        examDate: 'تاریخ امتحان اعلام نشده است'
      });
      
      const offerings = await loadCourseOfferings(course.id);
      setCourseOfferings(offerings.map(o => ({
        ...o,
        course: {
          id: course.id,
          name: course.name,
          code: course.code
        }
      })));
      
      setIsModalOpen(true);
    } catch (err) {
      setError('خطا در دریافت جزئیات درس');
      console.error('Error loading course details:', err);
      showErrorToast('خطا در دریافت جزئیات درس');
    }
  };

  const handleShowSchedule = () => {
    setIsScheduleModalOpen(true);
  };

  const handleAddToSchedule = () => {
    setIsAddModalOpen(true);
  };

  const handleMergeSchedule = () => {
    setIsMergeModalOpen(true);
  };

  const handleEditOffering = (offering: CourseOffering, timeIndex: number) => {
    setEditingOffering(offering);
    setIsEditModalOpen(true);
    
    const times = timeIndex >= 0 ? [offering.times[timeIndex]] : offering.times;
    
    setFormData({
      group_code: offering.group_code,
      year: offering.year,
      quiz_time: offering.quiz_time,
      lecturer_id: offering.lecturer.id,
      classroom_id: offering.classroom.id,
      times: times.map(time => ({
        day: time.day,
        start_time: time.start_time,
        end_time: time.end_time
      })),
      examDate: offering.examDate || "",
      classroom: offering.classroom.title
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    if (!editingOffering) return;

    try {
      setLoading(true);
      setError('');
      
      for (const time of formData.times) {
        if (time.start_time[0] > time.end_time[0] || 
           (time.start_time[0] === time.end_time[0] && time.start_time[1] >= time.end_time[1])) {
          throw new Error('زمان شروع باید قبل از زمان پایان باشد');
        }
      }

      const updateData = {
        group_code: formData.group_code,
        year: formData.year,
        quiz_time: formData.quiz_time,
        examDate: formData.examDate,
        lecturer_id: formData.lecturer_id,
        classroom_id: formData.classroom_id,
        times: formData.times
      };

      await updateOffering(editingOffering.id, updateData);
      
      setAllOfferings(prev => prev.map(o => 
        o.id === editingOffering.id ? {
          ...o,
          ...updateData,
          examDate: formData.examDate,
          lecturer: {
            ...o.lecturer,
            id: formData.lecturer_id,
            name: lecturers.find(l => l.id === formData.lecturer_id)?.name || o.lecturer.name
          },
          classroom: {
            ...o.classroom,
            id: formData.classroom_id,
            title: classrooms.find(c => c.id === formData.classroom_id)?.title || o.classroom.title
          }
        } : o
      ));
      
      if (selectedCourse) {
        setCourseOfferings(prev => prev.map(o => 
          o.id === editingOffering.id ? {
            ...o,
            ...updateData,
            examDate: formData.examDate,
            lecturer: {
              ...o.lecturer,
              id: formData.lecturer_id,
              name: lecturers.find(l => l.id === formData.lecturer_id)?.name || o.lecturer.name
            },
            classroom: {
              ...o.classroom,
              id: formData.classroom_id,
              title: classrooms.find(c => c.id === formData.classroom_id)?.title || o.classroom.title
            }
          } : o
        ));
      }
      
      showSuccessToast('برنامه با موفقیت ویرایش شد');
      setIsEditModalOpen(false);
      
    } catch (err: any) {
      console.error('Error updating course offering:', err);
      setError(err.message || 'خطا در ویرایش برنامه. لطفاً اطلاعات را بررسی کنید.');
      showErrorToast(err.message || 'خطا در ویرایش برنامه. لطفاً اطلاعات را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      setLoading(true);
      setError('');
      
      for (const time of formData.times) {
        if (time.start_time[0] > time.end_time[0] || 
           (time.start_time[0] === time.end_time[0] && time.start_time[1] >= time.end_time[1])) {
          throw new Error('زمان شروع باید قبل از زمان پایان باشد');
        }
      }

      const offeringData = {
        group_code: formData.group_code,
        year: formData.year,
        quiz_time: formData.quiz_time,
        examDate: formData.examDate,
        lecturer_id: formData.lecturer_id,
        classroom_id: formData.classroom_id,
        times: formData.times
      };

      const response = await addOffering(selectedCourse.id, offeringData);
      
      const lecturer = lecturers.find(l => l.id === formData.lecturer_id);
      const classroom = classrooms.find(c => c.id === formData.classroom_id);
      
      const newOffering: CourseOffering = {
        id: response.id,
        group_code: formData.group_code,
        year: formData.year,
        quiz_time: formData.quiz_time,
        examDate: formData.examDate,
        lecturer: {
          id: formData.lecturer_id,
          name: lecturer?.name || `استاد ${formData.lecturer_id}`,
          code: formData.lecturer_id
        },
        classroom: {
          id: formData.classroom_id,
          title: classroom?.title || formData.classroom || `کلاس ${formData.classroom_id}`
        },
        times: formData.times,
        course: {
          id: selectedCourse.id,
          name: selectedCourse.name,
          code: selectedCourse.code
        }
      };

      setAllOfferings(prev => [...prev, newOffering]);
      setCourseOfferings(prev => [...prev, newOffering]);
      
      showSuccessToast('برنامه با موفقیت اضافه شد');
      setIsAddModalOpen(false);
      
      setFormData({
        group_code: 0,
        year: new Date().getFullYear() - 621,
        quiz_time: 0,
        lecturer_id: 0,
        classroom_id: 0,
        times: [
          {
            day: "saturday",
            start_time: [8, 0] as [number, number],
            end_time: [10, 0] as [number, number]
          }
        ],
        examDate: "",
        classroom: ""
      });

    } catch (err: any) {
      console.error('Error adding course offering:', err);
      setError(err.message || 'خطا در ثبت برنامه. لطفاً اطلاعات را بررسی کنید.');
      showErrorToast(err.message || 'خطا در ثبت برنامه. لطفاً اطلاعات را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffering = async (offeringId: number, timeIndex: number) => {
    try {
      const confirmDelete = window.confirm('آیا از حذف این برنامه مطمئن هستید؟');
      if (!confirmDelete) return;

      if (timeIndex >= 0) {
        const offering = allOfferings.find(o => o.id === offeringId);
        if (!offering) return;

        if (offering.times.length === 1) {
          await deleteOffering(offeringId);
          setAllOfferings(prev => prev.filter(o => o.id !== offeringId));
          if (selectedCourse) {
            setCourseOfferings(prev => prev.filter(o => o.id !== offeringId));
          }
        } else {
          const updatedTimes = offering.times.filter((_, i) => i !== timeIndex);
          await updateOffering(offeringId, {
            ...offering,
            times: updatedTimes
          });

          setAllOfferings(prev => prev.map(o => 
            o.id === offeringId ? {...o, times: updatedTimes} : o
          ));

          if (selectedCourse) {
            setCourseOfferings(prev => prev.map(o => 
              o.id === offeringId ? {...o, times: updatedTimes} : o
            ));
          }
        }
      } else {
        await deleteOffering(offeringId);
        setAllOfferings(prev => prev.filter(o => o.id !== offeringId));
        if (selectedCourse) {
          setCourseOfferings(prev => prev.filter(o => o.id !== offeringId));
        }
      }
      
      showSuccessToast('برنامه با موفقیت حذف شد');
    } catch (err) {
      console.error('Error deleting offering:', err);
      setError('خطا در حذف برنامه');
      showErrorToast('خطا در حذف برنامه');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="mr-2">در حال دریافت اطلاعات...</span>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <ToastNotifications />

      <div className="flex h-screen bg-gray-100" dir="rtl">
        <ChartList 
          charts={charts} 
          selectedChart={selectedChart} 
          onSelectChart={handleChartSelect} 
        />

        <div className="flex-1 p-4 overflow-auto bg-white">
          {detailsLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="mr-2 text-sm">در حال دریافت جزئیات چارت...</span>
            </div>
          ) : chartDetails ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2"> 
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedChart?.title}
                </h2>
                <div className="flex space-x-2">
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-md transition-colors"
                    onClick={handleShowSchedule}
                  >
                    برنامه هفتگی
                  </button>
                </div>
              </div>
              
              {chartDetails.terms.map((term) => (
                <div key={term.id} className="bg-white rounded-lg shadow-xs p-3 mb-2">
                  <div className="mb-1 pb-1 border-b border-gray-100">
                    <h3 className="text-md font-medium text-gray-800">{term.name}</h3>
                  </div>
                  
                  <div className="grid grid-flow-col auto-cols-fr gap-2">
                    {term.courses.map((course) => {
                      const offeringsCount = calculateCourseOfferingsCount(course.id);
                      return (
                        <div 
                          key={course.id} 
                          className="p-2 border border-gray-200 rounded-md shadow-xs hover:shadow-sm transition-shadow cursor-pointer"
                          onClick={() => handleCourseClick(course)}
                        >
                          <h4 className="font-semibold text-xs text-gray-900 mb-1">{course.name}</h4>
                          <div className="space-y-1 text-xs">
                            <p className="text-gray-400">کد: <span className="text-gray-600">{course.code}</span></p>
                             <div className="flex gap-4">
                            <p className="text-gray-400">واحد: <span className="text-gray-600">{course.units}</span></p>
                            <p className="text-gray-400">برنامه‌ها: <span className="text-gray-600">{offeringsCount}</span></p>
                          </div>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center text-sm text-gray-500">
                {selectedChart 
                  ? "در حال دریافت جزئیات..." 
                  : "لطفاً یک چارت را از لیست انتخاب کنید"}
              </div>
            </div>
          )}
        </div>

        <CourseDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setIsMergeModalOpen(false);
          }}
          course={selectedCourse}
          offerings={courseOfferings}
          onEditOffering={handleEditOffering}
          onDeleteOffering={handleDeleteOffering}
          onAddToSchedule={handleAddToSchedule}
          onMergeSchedule={handleMergeSchedule}
        />

        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          offerings={allOfferings}
          onEdit={(offering) => handleEditOffering(offering, -1)}
        />

        <AddOfferingModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          course={selectedCourse}
          lecturers={lecturers}
          classrooms={classrooms}
          onSubmit={handleSubmitAdd}
          loading={loading}
          error={error}
        />

        <EditOfferingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          offering={editingOffering}
          lecturers={lecturers}
          classrooms={classrooms}
          onSubmit={handleSubmitEdit}
          loading={loading}
          error={error}
        />

        <MergeModal
          isOpen={isMergeModalOpen}
          onClose={() => setIsMergeModalOpen(false)}
          terms={chartDetails?.terms || []}
        />
      </div>
    </AuthGuard>
  );
}