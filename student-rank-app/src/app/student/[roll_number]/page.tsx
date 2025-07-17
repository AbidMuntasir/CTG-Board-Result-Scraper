// student-rank-app/src/app/student/[roll_number]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../../../components/LoadingSpinner';

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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!student) return <div className="text-center p-8 text-foreground">No student data available.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Students
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="p-6 sm:p-8 border-b border-neutral-200 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{student.student_name}</h1>
              <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                Student ID: {student.roll_number}
              </p>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Academic Information</h3>
                  <div className="mt-2 space-y-2">
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">GPA</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.gpa}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Total Marks</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.total_marks}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Science Group</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.science_group}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Institution Details</h3>
                  <div className="mt-2 space-y-2">
                    <p className="flex justify-between">
                      
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.institution_name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Board</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.board}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Year</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.year}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Personal Information</h3>
                  <div className="mt-2 space-y-2">
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Father's Name</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.father_name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Mother's Name</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.mother_name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Date of Birth</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.date_of_birth}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Registration Details</h3>
                  <div className="mt-2 space-y-2">
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Registration ID</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.registration_id}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Student Type</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.student_type}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Exam Type</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{student.exam_type}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-neutral-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Subject Marks</h2>
            </div>

            {Object.keys(student.subject_marks).length > 0 ? (
              <div className="p-6 sm:p-8">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-gray-700/50 text-left">
                        <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-gray-700">Code</th>
                        <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-gray-700">Subject</th>
                        <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-gray-700">Score</th>
                        <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-gray-700">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(student.subject_marks).map(([code, details]) => (
                        <tr key={code} className="border-b border-neutral-200 dark:border-gray-700 last:border-0">
                          <td className="py-3 px-4 font-mono text-sm text-neutral-600 dark:text-neutral-300">{code}</td>
                          <td className="py-3 px-4 text-neutral-900 dark:text-white">{details.name}</td>
                          <td className="py-3 px-4 text-neutral-900 dark:text-white">{details.score}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {details.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-neutral-600 dark:text-neutral-400">
                No subject marks available for this student.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}