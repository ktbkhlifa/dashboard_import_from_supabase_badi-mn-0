import React from 'react';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  children?: React.ReactNode;
  selectedPlantName: string; // ✅ زدنا prop جديد
}

const Header: React.FC<HeaderProps> = ({ selectedDate, onDateChange, children, selectedPlantName }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md p-4 rounded-lg mb-6 flex items-center justify-between flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Agrivoltaic Monitoring Dashboard
        </h1>
        {/* ✅ هنا كنستعملو اسم النبتة */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analytics for {selectedPlantName} Cultivation
        </p>
      </div>
      <div className="flex items-center space-x-4 mt-2 sm:mt-0">
        <label htmlFor="date-picker" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Select Date:
        </label>
        <input
          id="date-picker"
          type="date"
          value={selectedDate}
          min="2022-01-01"
          max="2022-12-31"
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {children}
      </div>
    </header>
  );
};

export default Header;