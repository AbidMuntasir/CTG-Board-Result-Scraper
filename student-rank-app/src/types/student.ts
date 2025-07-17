export interface Student {
  id: number;
  roll_number: string;
  student_name: string;
  institution_name: string;
  gpa: string;
  total_marks: number;
  rank: number;
  registration_id: string;
  board: string;
  father_name: string;
  science_group: string;
  mother_name: string;
  year: string;
  exam_type: string;
  student_type: string;
  date_of_birth: string;
  subject_marks: Record<string, { name: string; score: number; grade: string }>;
}
