import Link from 'next/link';
import type { Student } from '../types/student';

interface ResultsTableProps {
  students: Student[];
  onInstitutionClick: (institutionName: string) => void;
}

export function ResultsTable({ students, onInstitutionClick }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="py-3 px-4 text-left font-semibold text-neutral-600 dark:text-neutral-200">Rank</th>
            <th className="py-3 px-4 text-left font-semibold text-neutral-600 dark:text-neutral-200">Name</th>
            <th className="py-3 px-4 text-left font-semibold text-neutral-600 dark:text-neutral-200">Roll Number</th>
            <th className="py-3 px-4 text-left font-semibold text-neutral-600 dark:text-neutral-200">Institution</th>
            <th className="py-3 px-4 text-left font-semibold text-neutral-600 dark:text-neutral-200">GPA</th>
            <th className="py-3 px-4 text-left font-semibold text-neutral-600 dark:text-neutral-200">Total Marks</th>
            <th className="py-3 px-4 text-left font-semibold text-neutral-600 dark:text-neutral-200">Year</th>
            <th className="py-3 px-4 text-left font-semibold text-neutral-600 dark:text-neutral-200">Exam Type</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr 
              key={student.id} 
              className="border-b border-neutral-200 dark:border-gray-600 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td className="py-3 px-4 text-center">{student.rank}</td>
              <td className="py-3 px-4">
                <Link
                  href={`/student/${student.roll_number}`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
                >
                  {student.student_name}
                </Link>
              </td>
              <td className="py-3 px-4 font-mono text-sm">{student.roll_number}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => onInstitutionClick(student.institution_name)}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline focus:outline-none transition-colors"
                >
                  {student.institution_name}
                </button>
              </td>
              <td className="py-3 px-4">{student.gpa}</td>
              <td className="py-3 px-4">{student.total_marks}</td>
              <td className="py-3 px-4">{student.year}</td>
              <td className="py-3 px-4">{student.exam_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
