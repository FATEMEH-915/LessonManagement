"use client";
import { apiClient, handleApiError, Classroom, ApiError } from './apiClient';
import { Lecturer } from './lectureService';

export interface Course {
  id: string;
  name: string;
  code: string;
  units: number;
  prerequisites?: string[];
  corequisites?: string[];
  type?: string;
  isMandatory?: boolean;
}

export interface CourseDetails extends Course {
  description?: string;
  professor?: string;
  classTime?: string;
  examDate?: string;
  classLocation?: string;
}

export interface CourseOffering {
  id: number;
  group_code: number;
  year: number;
  quiz_time: number;
  lecturer: {
    id: number;
    name: string;
    code: number;
  };
  classroom: {
    id: number;
    title: string;
  };
  times: {
    day: string;
    start_time: [number, number];
    end_time: [number, number];
  }[];
}

export interface WeeklySchedule {
  courseId: string;
  courseName: string;
  day: string;
  time: string;
  professor?: string;
  location?: string;
}

const parseRequirements = (input: string | null): string[] => {
  if (!input) return [];
  try {
    const courseName = input.split('[')[0].trim();
    return courseName ? [courseName] : [];
  } catch {
    return [input];
  }
};

export const courseService = {
  getBasicCourseInfo: (courseId: string, terms: any[]): CourseDetails | null => {
    for (const term of terms) {
      const course = term.courses.find((c: any) => c.id === courseId);
      if (course) {
        return {
          ...course,
          description: 'توضیحات درس در سیستم ثبت نشده است',
          professor: 'استاد این درس مشخص نشده است',
          classTime: 'زمان کلاس تعیین نشده است',
          examDate: 'تاریخ امتحان اعلام نشده است',
          classLocation: 'محل کلاس مشخص نشده است'
        };
      }
    }
    return null;
  },
  getCourseOfferings: async (courseId: string): Promise<CourseOffering[]> => {
    try {
      const response = await apiClient.get<CourseOffering[]>(`/course/${courseId}/offering`);
      return response.data;
    } catch (error) {
      console.error('Error loading course offerings:', error);
      throw handleApiError(error);
    }
  },
  addCourseOffering: async (
    courseId: string,
    offeringData: {
      group_code: number;
      year: number;
      quiz_time: number;
      lecturer_id: number;
      classroom_id: number;
      times: {
        day: string;
        start_time: [number, number];
        end_time: [number, number];
      }[];
    }
  ): Promise<{ id: number }> => {
    try {
      const response = await apiClient.post<{ id: number }>(
        `/course/${courseId}/offering`,
        offeringData
      );
      return response.data;
    } catch (error) {
      console.error('Error adding course offering:', error);
      const apiError = handleApiError(error);
      if (apiError.data && typeof apiError.data === 'object' && 'detail' in apiError.data) {
        apiError.message = apiError.data.detail as string;
      }
      throw apiError;
    }
  },
  deleteCourseOffering: async (offeringId: number): Promise<{ ok: boolean }> => {
    try {
      const response = await apiClient.delete<{ ok: boolean }>(`/course/offering/${offeringId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course offering:', error);
      throw handleApiError(error);
    }
  },
  updateCourseOffering: async (
    offeringId: number,
    updateData: {
      group_code?: number;
      year?: number;
      quiz_time?: number;
      lecturer_id?: number;
      classroom_id?: number;
      times?: {
        day: string;
        start_time: [number, number];
        end_time: [number, number];
      }[];
    }
  ): Promise<{ ok: boolean }> => {
    try {
      const response = await apiClient.patch<{ ok: boolean }>(
        `/course/offering/${offeringId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating course offering:', error);
      const apiError = handleApiError(error);
      if (apiError.data && typeof apiError.data === 'object' && 'detail' in apiError.data) {
        apiError.message = apiError.data.detail as string;
      }
      throw apiError;
    }
  },
  addToWeeklySchedule: async (scheduleData: WeeklySchedule): Promise<void> => {
    try {
      await apiClient.post('/schedule/add', scheduleData);
    } catch (error) {
      console.error('Error adding to schedule:', error);
      throw handleApiError(error);
    }
  },
  getWeeklySchedule: async (): Promise<WeeklySchedule[]> => {
    try {
      const response = await apiClient.get<WeeklySchedule[]>('/schedule');
      return response.data;
    } catch (error) {
      console.error('Error getting weekly schedule:', error);
      throw handleApiError(error);
    }
  },
  mergeSchedules: async (scheduleIds: string[]): Promise<void> => {
    try {
      await apiClient.post('/schedule/merge', { schedules: scheduleIds });
    } catch (error) {
      console.error('Error merging schedules:', error);
      throw handleApiError(error);
    }
  },
  getCourseById: async (courseId: string): Promise<CourseDetails> => {
    try {
      const response = await apiClient.get<CourseDetails>(`/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error loading course details:', error);
      throw handleApiError(error);
    }
  },
  createCourse: async (courseData: {
    name: string;
    code: string;
    units: number;
    prerequisites?: string[];
    corequisites?: string[];
    type?: string;
    isMandatory?: boolean;
  }): Promise<Course> => {
    try {
      const response = await apiClient.post<Course>('/course', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw handleApiError(error);
    }
  },
  updateCourse: async (
    courseId: string,
    updateData: {
      name?: string;
      code?: string;
      units?: number;
      prerequisites?: string[];
      corequisites?: string[];
      type?: string;
      isMandatory?: boolean;
    }
  ): Promise<Course> => {
    try {
      const response = await apiClient.patch<Course>(
        `/course/${courseId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw handleApiError(error);
    }
  },
  deleteCourse: async (courseId: string): Promise<{ ok: boolean }> => {
    try {
      const response = await apiClient.delete<{ ok: boolean }>(`/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw handleApiError(error);
    }
  }
};