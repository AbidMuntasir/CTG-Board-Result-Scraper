interface FilterSectionProps {
  options: {
    institutions: string[];
    years: string[];
    examTypes: string[];
    groups: string[];
  };
  onFilter: (type: string, value: string) => void;
  selectedFilters: {
    examType?: string;
    year?: string;
    institution?: string;
    group?: string;
  };
}

export function FilterSection({ options, onFilter, selectedFilters }: FilterSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
      <select
        value={selectedFilters.examType || ''}
        onChange={(e) => onFilter('exam_type', e.target.value)}
        className="px-3 py-2 rounded-md border border-slate-700/50 bg-slate-800/50 text-slate-100 hover:border-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all backdrop-blur-sm shadow-lg [&>option]:bg-slate-800"
      >
        <option value="" className="text-slate-400">Select Exam Type</option>
        {options.examTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      
      <select
        value={selectedFilters.year || ''}
        onChange={(e) => onFilter('year', e.target.value)}
        className="px-3 py-2 rounded-md border border-slate-700/50 bg-slate-800/50 text-slate-100 hover:border-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all backdrop-blur-sm shadow-lg [&>option]:bg-slate-800"
      >
        <option value="" className="text-slate-400">Select Year</option>
        {options.years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      
      <select
        value={selectedFilters.institution || ''}
        onChange={(e) => onFilter('institution', e.target.value)}
        className="px-3 py-2 rounded-md border border-slate-700/50 bg-slate-800/50 text-slate-100 hover:border-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all backdrop-blur-sm shadow-lg [&>option]:bg-slate-800"
      >
        <option value="">Select Institution</option>
        {options.institutions.map(inst => (
          <option key={inst} value={inst}>{inst}</option>
        ))}
      </select>

      <select
        value={selectedFilters.group || ''}
        onChange={(e) => onFilter('group', e.target.value)}
        className="px-3 py-2 rounded-md border border-slate-700/50 bg-slate-800/50 text-slate-100 hover:border-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all backdrop-blur-sm shadow-lg [&>option]:bg-slate-800"
      >
        <option value="">Select Group</option>
        {options.groups.map(group => (
          <option key={group} value={group}>{group}</option>
        ))}
      </select>
    </div>
  );
}
