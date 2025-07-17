import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onInputChange: (query: string) => void; // New prop for immediate input changes
  initialValue?: string;
  placeholder?: string;
}

export function SearchBar({ onSearch, onInputChange, initialValue = '', placeholder = 'Search...' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  // Sync internal query state with initialValue prop (from URL)
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onInputChange(newQuery); // Call the new prop on every change
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange} // Use the new handleChange
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg border border-slate-700/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all bg-slate-800/50 backdrop-blur-sm text-slate-100 placeholder-slate-400 shadow-lg"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:ring-2 focus:ring-primary-400/20 transition-all shadow-lg"
        >
          Search
        </button>
      </div>
    </form>
  );
}
