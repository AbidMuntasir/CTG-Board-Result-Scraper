// student-rank-app/src/app/api/filters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Fetch distinct institution names
    const institutionsResult = await query('SELECT DISTINCT institution_name FROM students ORDER BY institution_name;');
    const institutions = institutionsResult.rows.map(row => row.institution_name);

    // Fetch distinct years
    const yearsResult = await query('SELECT DISTINCT year FROM students ORDER BY year DESC;');
    const years = yearsResult.rows.map(row => row.year);

    // Fetch distinct exam types
    const examTypesResult = await query('SELECT DISTINCT exam_type FROM students ORDER BY exam_type;');
    const examTypes = examTypesResult.rows.map(row => row.exam_type);

    return NextResponse.json({
      institutions,
      years,
      examTypes,
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
  }
}