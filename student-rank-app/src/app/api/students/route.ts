// student-rank-app/src/app/api/students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    const searchTerm = searchParams.get('search'); // For Name, Roll Number, Institution
    const institutionFilter = searchParams.get('institution');
    const yearFilter = searchParams.get('year');
    const examTypeFilter = searchParams.get('exam_type');

    let whereClauses: string[] = [];
    let queryParams: (string | number)[] = [];
    let paramIndex = 1;

    if (searchTerm) {
      const searchLike = `%${searchTerm.toLowerCase()}%`;
      whereClauses.push(
        `(LOWER(student_name) LIKE $${paramIndex} OR LOWER(roll_number) LIKE $${paramIndex} OR LOWER(institution_name) LIKE $${paramIndex})`
      );
      queryParams.push(searchLike);
      paramIndex++;
    }

    if (institutionFilter) {
      whereClauses.push(`LOWER(institution_name) = LOWER($${paramIndex})`);
      queryParams.push(institutionFilter);
      paramIndex++;
    }

    if (yearFilter) {
      whereClauses.push(`year = $${paramIndex}`);
      queryParams.push(yearFilter);
      paramIndex++;
    }

    if (examTypeFilter) {
      whereClauses.push(`exam_type = $${paramIndex}`);
      queryParams.push(examTypeFilter);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Base query for students, ordered by total_marks for ranking
    const studentsQuery = `
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
      ${whereSql}
      ORDER BY total_marks DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    queryParams.push(limit, offset);

    const studentsResult = await query(studentsQuery, queryParams);
    const students = studentsResult.rows;

    // Get total count for pagination metadata
    const countQuery = `
      SELECT COUNT(*) FROM students ${whereSql};
    `;
    const countResult = await query(countQuery, queryParams.slice(0, queryParams.length - 2)); // Remove limit/offset params

    const totalStudents = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalStudents / limit);

    return NextResponse.json({
      data: students,
      pagination: {
        total: totalStudents,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}