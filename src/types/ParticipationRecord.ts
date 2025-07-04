
export interface ParticipationRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  points: number;
  notes?: string;
  userId: string;
  period?: string; // Optional field for academic period
}
