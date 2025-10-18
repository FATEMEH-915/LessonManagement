"use client";
import { apiClient, handleApiError, Classroom, ApiError } from './apiClient';
import { Lecturer } from './lectureService';

interface Chart {
  id: number;
  title: string;
}

interface Term {
  id: string;
  name: string;
  courses: any[];
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

export const chartService = {
  getAllCharts: async (): Promise<Chart[]> => {
    try {
      const response = await apiClient.get<Chart[]>('/chart');
      return response.data.map(chart => ({
        ...chart,
        title: chart.title || `چارت ${chart.id}`
      }));
    } catch (error) {
      console.error('Error loading charts:', error);
      throw handleApiError(error);
    }
  },

  getChartDetails: async (chartId: string): Promise<{ terms: Term[] }> => {
    try {
      const response = await apiClient.get(`/chart/${chartId}/semester`);
      
      return {
        terms: response.data.map((semester: any) => ({
          id: semester.id.toString(),
          name: semester.title || `ترم ${semester.id}`,
          courses: semester.courses.map((course: any) => ({
            id: course.id.toString(),
            name: course.title || `درس ${course.course_code}`,
            code: course.course_code.toString(),
            units: course.course_unit || 0,
            prerequisites: course.prerequisites ? course.prerequisites.split('[')[0].trim() : [],
            corequisites: course.corequisites ? course.corequisites.split('[')[0].trim() : [],
            type: course.course_type,
            isMandatory: course.is_mandatory,
            offering_count: course.offering_count || 0
          }))
        }))
      };
    } catch (error) {
      console.error('Error loading chart details:', error);
      throw handleApiError(error);
    }
  },

  downloadChartPdf: async (chartId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/chart/${chartId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw handleApiError(error);
    }
  },

  getAllClassrooms: async (): Promise<Classroom[]> => {
    try {
      const response = await apiClient.get<Classroom[]>('/classroom');
      return response.data;
    } catch (error) {
      console.error('Error loading classrooms:', error);
      throw handleApiError(error);
    }
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

  
  getAllLecturers: async (): Promise<Lecturer[]> => {
    try {
      const response = await apiClient.get<Lecturer[]>('/lecturer');
      return response.data;
    } catch (error) {
      console.error('Error loading lecturers:', error);
      throw handleApiError(error);
    }
  }
};