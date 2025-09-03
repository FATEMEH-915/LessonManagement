import { chartService } from '../../services/chartService';
import { Chart, CourseOffering } from './types';

export const loadAllCharts = async () => {
  return await chartService.getAllCharts();
};

export const loadChartDetails = async (chartId: string) => {
  return await chartService.getChartDetails(chartId);
};

export const loadCourseOfferings = async (courseId: string) => {
  return await chartService.getCourseOfferings(courseId);
};

export const loadAllLecturers = async () => {
  return await chartService.getAllLecturers();
};

export const loadAllClassrooms = async () => {
  return await chartService.getAllClassrooms();
};

export const updateOffering = async (offeringId: number, data: any) => {
  return await chartService.updateCourseOffering(offeringId, data);
};

export const addOffering = async (courseId: string, data: any) => {
  return await chartService.addCourseOffering(courseId, data);
};

export const deleteOffering = async (offeringId: number) => {
  return await chartService.deleteCourseOffering(offeringId);
};

export const loadAllOfferings = async (charts: Chart[]) => {
  let allOfferings: CourseOffering[] = [];
  
  for (const chart of charts) {
    try {
      const details = await chartService.getChartDetails(chart.id.toString());
      for (const term of details.terms) {
        for (const course of term.courses) {
          const offerings = await chartService.getCourseOfferings(course.id);
          const offeringsWithCourseInfo = offerings.map(offering => ({
            ...offering,
            course: {
              id: course.id,
              name: course.name,
              code: course.code
            }
          }));
          allOfferings = [...allOfferings, ...offeringsWithCourseInfo];
        }
      }
    } catch (err) {
      console.error(`Error loading offerings for chart ${chart.id}:`, err);
    }
  }
  
  return allOfferings;};


  