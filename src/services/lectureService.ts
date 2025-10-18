"use client";
import { apiClient, handleApiError } from './apiClient';

export interface Lecturer {
  id: number;
  name: string;
  code: number;
}

export interface LectureTime {
  day: string;
  start_time: [number, number];
  end_time: [number, number];
}

export interface LectureSchedule {
  courseId: string;
  courseName: string;
  day: string;
  time: string;
  professor?: string;
  location?: string;
}

export const lectureService = {
  getAllLecturers: async (): Promise<Lecturer[]> => {
    try {
      const response = await apiClient.get<Lecturer[]>('/lecturer');
      return response.data;
    } catch (error) {
      console.error('Error loading lecturers:', error);
      throw handleApiError(error);
    }
  },
  getLecturerById: async (lecturerId: number): Promise<Lecturer> => {
    try {
      const response = await apiClient.get<Lecturer>(`/lecturer/${lecturerId}`);
      return response.data;
    } catch (error) {
      console.error('Error loading lecturer:', error);
      throw handleApiError(error);
    }
  },
  createLecturer: async (lecturerData: {
    name: string;
    code: number;
  }): Promise<Lecturer> => {
    try {
      const response = await apiClient.post<Lecturer>('/lecturer', lecturerData);
      return response.data;
    } catch (error) {
      console.error('Error creating lecturer:', error);
      throw handleApiError(error);
    }
  },
  updateLecturer: async (
    lecturerId: number,
    updateData: {
      name?: string;
      code?: number;
    }
  ): Promise<Lecturer> => {
    try {
      const response = await apiClient.patch<Lecturer>(
        `/lecturer/${lecturerId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating lecturer:', error);
      throw handleApiError(error);
    }
  },
  deleteLecturer: async (lecturerId: number): Promise<{ ok: boolean }> => {
    try {
      const response = await apiClient.delete<{ ok: boolean }>(`/lecturer/${lecturerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lecturer:', error);
      throw handleApiError(error);
    }
  },
  getLecturerSchedule: async (lecturerId: number): Promise<LectureSchedule[]> => {
    try {
      const response = await apiClient.get<LectureSchedule[]>(`/lecturer/${lecturerId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error loading lecturer schedule:', error);
      throw handleApiError(error);
    }
  },
  getLecturerCourses: async (lecturerId: number): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(`/lecturer/${lecturerId}/courses`);
      return response.data;
    } catch (error) {
      console.error('Error loading lecturer courses:', error);
      throw handleApiError(error);
    }
  }
};