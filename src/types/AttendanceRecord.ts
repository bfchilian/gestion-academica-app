
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  userId: string;
  period?: string; // Optional field for academic period
}
