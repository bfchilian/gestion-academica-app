export interface Course {
  id: string;
  userId: string;
  period: string;
  name: string;
  group: string; // Required field for group
  course: string; // Required field for course
  summary?: string;
  objectives?: string;
  strategies?: string;
  activities?: string;
  tasks?: string;
}