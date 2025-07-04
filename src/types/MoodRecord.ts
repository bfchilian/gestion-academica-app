
export interface MoodRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1 to 5
  notes?: string;
  userId: string;
  period?: string; // Optional field for academic period
}
