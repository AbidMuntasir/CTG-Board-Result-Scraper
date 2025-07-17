
// student-rank-app/src/app/page.tsx
'use client';
import LoadingSpinner from '../components/LoadingSpinner';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { SearchBar } from '@/components/SearchBar';
import { FilterSection } from '@/components/FilterSection';
import { ResultsTable } from '@/components/ResultsTable';
import { Pagination } from '@/components/Pagination';
import type { Student } from '@/types/student';

import Link from 'next/link';

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

  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(''); // New state for institution filter
  const [currentView, setCurrentView] = useState<'examTypeSelection' | 'yearSelection' | 'results'>('examTypeSelection');


  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentLimit = parseInt(searchParams.get('limit') || '100');
  const searchTermFromURL = searchParams.get('search') || '';
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTermFromURL);

  const institutionFilter = searchParams.get('institution') || '';
  const yearFilter = searchParams.get('year') || '';
  const examTypeFilter = searchParams.get('exam_type') || '';
  const sortBy = searchParams.get('sortBy') || '';

  // Sync local search term with URL search term when URL changes
  useEffect(() => {
    setLocalSearchTerm(searchTermFromURL);
  }, [searchTermFromURL]);

  // Sync local selectedInstitution with URL institution filter when URL changes
  useEffect(() => {
    setSelectedInstitution(institutionFilter);
  }, [institutionFilter]);

  const fetchData = useCallback(async () => {
    if (currentView !== 'results') return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', currentLimit.toString());
      if (searchParams.get('search')) params.set('search', searchParams.get('search') || ''); // Use searchParams directly for fetching
      if (institutionFilter) params.set('institution', institutionFilter);
      if (yearFilter) params.set('year', yearFilter);
      if (examTypeFilter) params.set('exam_type', examTypeFilter);
      if (sortBy) params.set('sortBy', sortBy);

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
  }, [currentPage, currentLimit, searchParams, institutionFilter, yearFilter, examTypeFilter, selectedInstitution, sortBy]);

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
    if (currentView === 'results') {
      fetchData();
    }
    fetchFilterOptions();
  }, [currentPage, currentLimit, searchTermFromURL, institutionFilter, yearFilter, examTypeFilter, sortBy, currentView, fetchFilterOptions]);

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
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('institution', institutionName);
    newParams.set('sortBy', 'institution');
    newParams.set('page', '1'); // Reset to first page when filtering
    router.push(`/?${newParams.toString()}`);
  };

  const clearSort = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('sortBy');
    newParams.delete('institution'); // Also clear institution filter when clearing sort
    router.push(`/?${newParams.toString()}`);
    setSelectedInstitution(''); // Clear selected institution state
  };

  const handleInstitutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInstitution = e.target.value;
    setSelectedInstitution(newInstitution);
    const newParams = new URLSearchParams(searchParams.toString());
    if (newInstitution) {
      newParams.set('institution', newInstitution);
      newParams.set('sortBy', 'institution'); // Automatically sort by institution when filtered
    } else {
      newParams.delete('institution');
      newParams.delete('sortBy'); // Clear sort if institution filter is removed
    }
    newParams.set('page', '1'); // Reset to first page on new filter
    router.push(`/?${newParams.toString()}`);
  };

  if (filtersLoading) return <LoadingSpinner />;
  if (filtersError) return <div className="text-center p-8 text-red-500">Error fetching filters: {filtersError}</div>;

  const handleExamTypeSelect = (type: string) => {
    setSelectedExamType(type);
    setCurrentView('yearSelection');
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setCurrentView('results');
    const newParams = new URLSearchParams();
    newParams.set('exam_type', selectedExamType);
    if (year !== 'ALL_YEARS') {
      newParams.set('year', year);
    }
    router.push(`/?${newParams.toString()}`);
  };

  const handleBackToHome = () => {
    setSelectedExamType('');
    setSelectedYear('');
    setCurrentView('examTypeSelection');
    router.push('/'); // Clear all URL parameters
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {currentView === 'examTypeSelection' && (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl font-bold mb-4 text-white">
              <span className="bg-clip-text  bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300">
                Board Examination Results Portal
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8">
              Access, analyze, and track academic performance across institutions and years
            </p>
            
          </div>

          <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-8">
            <h2 className="text-2xl font-semibold mb-8 text-center text-white">Select Examination Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterOptions.examTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleExamTypeSelect(type)}
                  className="group relative p-6 rounded-xl border-2 border-slate-600/50 hover:border-primary-500/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all backdrop-blur-sm shadow-lg hover:shadow-primary-500/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"/>
                  <h3 className="relative text-xl font-medium text-white group-hover:text-primary-400 transition-colors">
                    {type}
                  </h3>
                  <p className="relative mt-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                    View results and analytics
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="group relative p-8 rounded-xl border-2 border-slate-600/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all backdrop-blur-sm shadow-lg hover:shadow-primary-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"/>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary-500/20 backdrop-blur-sm flex items-center justify-center border border-primary-500/30">
                  <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary-300 group-hover:text-primary-400 transition-colors">Easy Access</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Quick and simple access to examination results</p>
              </div>
            </div>
            <div className="group relative p-8 rounded-xl border-2 border-slate-600/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all backdrop-blur-sm shadow-lg hover:shadow-primary-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"/>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary-500/20 backdrop-blur-sm flex items-center justify-center border border-primary-500/30">
                  <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary-300 group-hover:text-primary-400 transition-colors">Detailed Analytics</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Comprehensive analysis and performance tracking</p>
              </div>
            </div>
            <div className="group relative p-8 rounded-xl border-2 border-slate-600/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all backdrop-blur-sm shadow-lg hover:shadow-primary-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"/>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary-500/20 backdrop-blur-sm flex items-center justify-center border border-primary-500/30">
                  <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary-300 group-hover:text-primary-400 transition-colors">Institution Insights</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Compare and analyze institutional performance</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'yearSelection' && (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center text-white">
              Select Year for {selectedExamType}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleYearSelect('ALL_YEARS')}
                className="p-6 rounded-xl border border-primary-500/50 bg-primary-500/10 hover:bg-primary-500/20 backdrop-blur-sm transition-all"
              >
                <h3 className="text-xl font-medium text-primary-700 dark:text-primary-300">
                  All Years
                </h3>
                <p className="mt-2 text-primary-600 dark:text-primary-400">
                  View results across all years
                </p>
              </button>
              {filterOptions.years.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className="p-6 rounded-xl border-2 border-neutral-200 hover:border-primary-500 bg-white dark:bg-gray-800 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-all group"
                >
                  <h3 className="text-xl font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {year}
                  </h3>
                  <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                    View year-specific results
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={handleBackToHome}
              className="mt-8 w-full sm:w-auto px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm border border-slate-600/50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Exam Types
            </button>
          </div>
        </div>
      )}

      {currentView === 'results' && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handleBackToHome}
              className="px-6 py-3 bg-neutral-100 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <div className="flex-grow text-center">
              <h2 className="text-3xl font-bold relative right-35 text-slate-200">
                {selectedExamType} Results {selectedYear === 'ALL_YEARS' ? '(All Years)' : `(${selectedYear})`}
              </h2>
            </div>
          </div>

          <div className="mb-8 space-y-4">
            <SearchBar
              onSearch={handleSearch}
              onInputChange={setLocalSearchTerm} // Pass setLocalSearchTerm to update query state
              initialValue={localSearchTerm}
              placeholder="Search by name, roll number, or institution..."
            />

            <FilterSection
              options={filterOptions}
              onFilter={(type, value) => {
                if (type === 'institution') {
                  handleInstitutionChange({ target: { value } } as any);
                }
              }}
              selectedFilters={{
                examType: selectedExamType,
                year: selectedYear,
                institution: selectedInstitution,
              }}
            />

            {sortBy && (
              <div className="flex justify-end">
                <button
                  onClick={clearSort}
                  className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Clear Sorting
                </button>
              </div>
            )}
          </div>

          <ResultsTable
            students={students}
            onInstitutionClick={handleInstitutionClick}
          />

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
