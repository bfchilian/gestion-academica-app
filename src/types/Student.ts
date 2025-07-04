
export interface Student {
  id: string;
  name: string;
  userId: string; // To associate student with a professor
  group?: string; // Optional field for student group
  course?: string; // Optional field for student course
  email?: string; // Optional field for institutional email
  period?: string; // Optional field for academic period
  matricula?: string; // Optional field for student ID number
}
