import React from 'react';
import { Filter, Search } from 'lucide-react';

const ResourceFilter = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end mb-8">
      <div className="flex-1 w-full space-y-1.5">
        <label className="text-[11px] font-black text-teal-900 uppercase tracking-widest ml-1">Location</label>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Search by building or room..."
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="w-full md:w-48 space-y-1.5">
        <label className="text-[11px] font-black text-teal-900 uppercase tracking-widest ml-1">Type</label>
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        >
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Laboratory</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </div>

      <div className="w-full md:w-32 space-y-1.5">
        <label className="text-[11px] font-black text-teal-900 uppercase tracking-widest ml-1">Min Capacity</label>
        <input
          type="number"
          name="minCapacity"
          min="1"
          value={filters.minCapacity}
          onChange={handleChange}
          placeholder="e.g. 50"
          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400"
        />
      </div>

      <button
        onClick={() => onFilterChange({ location: '', type: '', minCapacity: '' })}
        className="w-full md:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
      >
        <Filter size={16} />
        Clear
      </button>
    </div>
  );
};

export default ResourceFilter;
