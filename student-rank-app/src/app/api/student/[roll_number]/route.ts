// student-rank-app/src/app/api/student/[roll_number]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ roll_number: string }> | { roll_number: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params); // Ensure params is resolved
    const { roll_number } = resolvedParams;

    if (!roll_number) {
      return NextResponse.json({ error: 'Roll number is required' }, { status: 400 });
    }

    // Fetch student details by roll_number
    const studentQuery = `
      SELECT
        id,
        roll_number,
        student_name,
        institution_name,
        gpa,
        total_marks,
        registration_id,
        board,
        father_name,
        science_group,
        mother_name,
        year,
        exam_type,
        student_type,
        date_of_birth,
        subject_marks
      FROM students
      WHERE roll_number = $1;
    `;

    const studentResult = await query(studentQuery, [roll_number]);
    const student = studentResult.rows[0];

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json({ error: 'Failed to fetch student details' }, { status: 500 });
  }
}