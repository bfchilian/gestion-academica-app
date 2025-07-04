export interface Course {
  id: string;
  userId: string;
  period: string;
  name: string;
  summary?: string;
  objectives?: string;
  strategies?: string;
  activities?: string;
  tasks?: string;
}