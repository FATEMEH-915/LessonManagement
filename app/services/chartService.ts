"use client";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = "http://193.164.155.6:8000";

interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

interface Chart {
  id: number;
  title: string;
}

interface Term {
  id: string;
  name: string;
  courses: Course[];
}

interface Course {
  id: string;
  name: string;
  code: string;
  units: number;
  prerequisites?: string[];
  corequisites?: string[];
  type?: string;
  isMandatory?: boolean;
}

interface CourseDetails extends Course {
  description?: string;
  professor?: string;
  classTime?: string;
  examDate?: string;
  classLocation?: string;
}

interface WeeklySchedule {
  courseId: string;
  courseName: string;
  day: string;
  time: string;
  professor?: string;
  location?: string;
}

interface CourseOffering {
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

interface Lecturer {
  id: number;
  name: string;
  code: number;
}
interface Classroom {
  id: number;
  title: string;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Helper functions
const storeToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return {
      message: (axiosError.response?.data as any)?.message || axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    };
  }
  return { message: 'خطای ناشناخته رخ داده است' };
};

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(handleApiError(error));
  }
);

const parseRequirements = (input: string | null): string[] => {
  if (!input) return [];
  try {
    const courseName = input.split('[')[0].trim();
    return courseName ? [courseName] : [];
  } catch {
    return [input];
  }
};

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

  getAllLecturers: async (): Promise<Lecturer[]> => {
    try {
      const response = await apiClient.get<Lecturer[]>('/lecturer');
      return response.data;
    } catch (error) {
      console.error('Error loading lecturers:', error);
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
            prerequisites: parseRequirements(course.prerequisites),
            corequisites: parseRequirements(course.corequisites),
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

  getBasicCourseInfo: (courseId: string, terms: Term[]): CourseDetails | null => {
    for (const term of terms) {
      const course = term.courses.find(c => c.id === courseId);
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

  getAllClassrooms: async (): Promise<Classroom[]> => {
  try {
    const response = await apiClient.get<Classroom[]>('/classroom');
    return response.data;
  } catch (error) {
    console.error('Error loading classrooms:', error);
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
};


export const authService = {
  login: async (username: string, password: string): Promise<{ access_token: string }> => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      storeToken(response.data.access_token);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: (): void => {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getToken: (): string | null => getToken(),
  isAuthenticated: (): boolean => !!getToken(),

  validateToken: async (): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) return false;
      
      await apiClient.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      return false;
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
};