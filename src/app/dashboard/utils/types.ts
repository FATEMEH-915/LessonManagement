export interface Chart {
  id: number;
  title: string;
}

export interface Term {
  id: string;
  name: string;
  courses: Course[];
}

export interface Course {
  id: string; 
  name: string;
  code: string;
  units: number;
  prerequisites?: string[];
  corequisites?: string[];
  offering_count?: number;
}

export interface CourseDetails extends Course {
  description?: string;
  professor?: string;
  classTime?: string;
  examDate?: string;
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
  course: { 
    id: string;
    name: string;
    code: string;
  };
  examDate?: string;
}

export interface Lecturer {
  id: number;
  name: string;
  code: number;
}

export interface Classroom {
  id: number;
  title: string;
}

export interface FormData {
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
  examDate: string;
  classroom: string;
}

