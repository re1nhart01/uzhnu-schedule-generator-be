export interface Lesson {
  subject: string;
  teacher: string;
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

export interface ScheduleData {
  schedule: ClassSchedule[];
}
