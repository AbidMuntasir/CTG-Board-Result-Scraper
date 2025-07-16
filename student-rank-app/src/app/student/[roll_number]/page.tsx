// student-rank-app/src/app/student/[roll_number]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SubjectMark {
  name: string;
  score: number;
  grade: string;
}

interface Student {
  id: number;
  roll_number: string;
  student_name: string;
  institution_name: string;
  gpa: string;
  total_marks: number;
  registration_id: string;
  board: string;
  father_name: string;
  science_group: string;
  mother_name: string;
  year: string;
  exam_type: string;
  student_type: string;
  date_of_birth: string;
  subject_marks: Record<string, SubjectMark>;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roll_number = params.roll_number as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roll_number) return;

    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/student/${roll_number}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Student not found.');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        const data = await response.json();
        setStudent(data);
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [roll_number]);

  if (loading) return <div className="text-center p-8">Loading student details...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!student) return <div className="text-center p-8 text-foreground">No student data available.</div>;

  return (
    <div className="container mx-auto p-4 bg-background text-foreground min-h-screen">
      <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 block">
        &larr; Back to All Students
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-center">Student Details</h1>

      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">{student.student_name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><strong>Roll Number:</strong> {student.roll_number}</p>
          <p><strong>Registration ID:</strong> {student.registration_id}</p>
          <p><strong>Institution:</strong> {student.institution_name}</p>
          <p><strong>Board:</strong> {student.board}</p>
          <p><strong>GPA:</strong> {student.gpa}</p>
          <p><strong>Total Marks:</strong> {student.total_marks}</p>
          <p><strong>Year:</strong> {student.year}</p>
          <p><strong>Exam Type:</strong> {student.exam_type}</p>
          <p><strong>Student Type:</strong> {student.student_type}</p>
          <p><strong>Date of Birth:</strong> {student.date_of_birth}</p>
          <p><strong>Father's Name:</strong> {student.father_name}</p>
          <p><strong>Mother's Name:</strong> {student.mother_name}</p>
          <p><strong>Science Group:</strong> {student.science_group}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Subject Marks</h2>
        {Object.keys(student.subject_marks).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Code</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Subject Name</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Score</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Grade</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(student.subject_marks).map(([code, details]) => (
                  <tr key={code} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 border-b dark:border-gray-700 text-center">{code}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">{details.name}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700 text-center">{details.score}</td>
                    <td className="py-2 px-4 border-b dark:border-gray-700 text-center">{details.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No subject marks available for this student.</p>
        )}
      </div>
    </div>
  );
}