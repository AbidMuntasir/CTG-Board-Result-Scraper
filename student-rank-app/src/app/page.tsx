// student-rank-app/src/app/page.tsx
'use client'; // This is a Client Component

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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
  subject_marks: Record<string, { name: string; score: number; grade: string }>;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FilterOptions {
  institutions: string[];
  years: string[];
  examTypes: string[];
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 100, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ institutions: [], years: [], examTypes: [] });
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filtersError, setFiltersError] = useState<string | null>(null);


  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentLimit = parseInt(searchParams.get('limit') || '100');
  const searchTermFromURL = searchParams.get('search') || '';
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTermFromURL);

  const institutionFilter = searchParams.get('institution') || '';
  const yearFilter = searchParams.get('year') || '';
  const examTypeFilter = searchParams.get('exam_type') || '';

  // Sync local search term with URL search term when URL changes
  useEffect(() => {
    setLocalSearchTerm(searchTermFromURL);
  }, [searchTermFromURL]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', currentLimit.toString());
      if (searchTermFromURL) params.set('search', searchTermFromURL); // Use searchTermFromURL for fetching
      if (institutionFilter) params.set('institution', institutionFilter);
      if (yearFilter) params.set('year', yearFilter);
      if (examTypeFilter) params.set('exam_type', examTypeFilter);

      const response = await fetch(`/api/students?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setStudents(result.data);
      setPagination(result.pagination);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, searchTermFromURL, institutionFilter, yearFilter, examTypeFilter]);

  const fetchFilterOptions = useCallback(async () => {
    setFiltersLoading(true);
    setFiltersError(null);
    try {
      const response = await fetch('/api/filters');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setFilterOptions(result);
    } catch (e: any) {
      setFiltersError(e.message || 'An unknown error occurred fetching filters');
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchFilterOptions();
  }, [fetchData, fetchFilterOptions]);

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', newPage.toString());
    router.push(`/?${newParams.toString()}`);
  };

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (localSearchTerm) {
      newParams.set('search', localSearchTerm);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1'); // Reset to first page on new search
    router.push(`/?${newParams.toString()}`);
  };

  const handleInstitutionClick = (institutionName: string) => {
    const newParams = new URLSearchParams();
    newParams.set('institution', institutionName);
    newParams.set('page', '1'); // Reset to first page when filtering
    router.push(`/?${newParams.toString()}`);
  };

  if (loading || filtersLoading) return <div className="text-center p-8">Loading data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (filtersError) return <div className="text-center p-8 text-red-500">Error fetching filters: {filtersError}</div>;

  return (
    <div className="container mx-auto p-4 bg-background text-foreground min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">Student Rankings</h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by Name, Roll No, Institution..."
          className="p-2 border rounded w-full sm:w-1/3 bg-white dark:bg-gray-700 text-foreground"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>

        <select
          className="p-2 border rounded w-full sm:w-1/4 bg-white dark:bg-gray-700 text-foreground"
          value={institutionFilter}
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams.toString());
            if (e.target.value) {
              newParams.set('institution', e.target.value);
            } else {
              newParams.delete('institution');
            }
            newParams.set('page', '1');
            router.push(`/?${newParams.toString()}`);
          }}
        >
          <option value="">All Institutions</option>
          {filterOptions.institutions.map((inst) => (
            <option key={inst} value={inst}>
              {inst}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded w-full sm:w-1/6 bg-white dark:bg-gray-700 text-foreground"
          value={yearFilter}
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams.toString());
            if (e.target.value) {
              newParams.set('year', e.target.value);
            } else {
              newParams.delete('year');
            }
            newParams.set('page', '1');
            router.push(`/?${newParams.toString()}`);
          }}
        >
          <option value="">All Years</option>
          {filterOptions.years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded w-full sm:w-1/6 bg-white dark:bg-gray-700 text-foreground"
          value={examTypeFilter}
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams.toString());
            if (e.target.value) {
              newParams.set('exam_type', e.target.value);
            } else {
              newParams.delete('exam_type');
            }
            newParams.set('page', '1');
            router.push(`/?${newParams.toString()}`);
          }}
        >
          <option value="">All Exam Types</option>
          {filterOptions.examTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Rank</th>
              <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Name</th>
              <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Roll Number</th>
              <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Institution Name</th>
              <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">GPA</th>
              <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Total Marks</th>
              <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Year</th>
              <th className="py-2 px-4 border-b dark:border-gray-600 text-foreground">Exam Type</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <td className="py-2 px-4 border-b dark:border-gray-700 text-center">{
                  (pagination.page - 1) * pagination.limit + index + 1
                }</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">
                  <Link href={`/student/${student.roll_number}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {student.student_name}
                  </Link>
                </td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{student.roll_number}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">
                  <button
                    onClick={() => handleInstitutionClick(student.institution_name)}
                    className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                  >
                    {student.institution_name}
                  </button>
                </td>
                <td className="py-2 px-4 border-b dark:border-gray-700 text-center">{student.gpa}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700 text-center">{student.total_marks}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700 text-center">{student.year}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700 text-center">{student.exam_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-foreground">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
