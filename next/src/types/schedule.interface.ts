export interface Lesson {
  subject: string;
  teacher: string;
  dndId: string;
}

export interface EmptyLesson {
  dndId: string;
  isEmpty: boolean;
}

export interface DaySchedule {
  day: string;
  lessons: (Lesson | null)[];
}

export interface ClassSchedule {
  faculty: string;
  class_name: string;
  week: DaySchedule[];
  general_amount_of_lessons: number;
}

export type ExoticScheduleType = {
  id: number;
  created_at: string;
  json_data: ClassSchedule[];
  updated_at: string;
}

export interface ScheduleData {
  schedule: ClassSchedule[];
}


export interface Subject {
  teacher: string;
  subject: string;
}


export interface LessonSlot {
  teacher: string;
  day: number;
  lesson_number: number;
}


export type ScheduleHistory = {
  "id": number;
  "created_at": string;
  "updated_at": string;
}
