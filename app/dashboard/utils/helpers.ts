// src/components/Dashboard/utils/helpers.ts
import { CourseOffering } from './types';
export const daysOfWeek = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export const formatRequirements = (req: string[] | string | undefined): string => {
  if (!req || (Array.isArray(req) && req.length === 0)) return 'ندارد';
  if (Array.isArray(req)) return req.join('، ');
  return req;
};

export const translateDay = (day: string): string => {
  const daysMap: Record<string, string> = {
    'saturday': 'شنبه',
    'sunday': 'یکشنبه',
    'monday': 'دوشنبه',
    'tuesday': 'سه‌شنبه',
    'wednesday': 'چهارشنبه',
    'thursday': 'پنجشنبه',
    'friday':'جمعه'
  };
  return daysMap[day] || day;
};

export const formatTime = (time: [number, number]): string => {
  return `${time[0]}:${time[1].toString().padStart(2, '0')}`;
};

export const groupOfferingsByDay = (offerings: CourseOffering[]) => {
  const grouped: Record<string, CourseOffering[]> = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [] ,
    friday:[]
  };

  offerings.forEach(offering => {
    offering.times.forEach(time => {
      if (grouped[time.day]) {
        grouped[time.day].push(offering);
      }
    });
  });

  return grouped;};