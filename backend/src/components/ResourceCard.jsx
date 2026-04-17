import React from 'react';
import { MapPin, Users, Building2, Server, Armchair, PenTool, CircleAlert } from 'lucide-react';

const ResourceCard = ({ resource, userRole, onEdit, onDelete, onBook }) => {
  const { id, name, type, capacity, location, status } = resource;

  const getTypeIcon = () => {
    switch (type) {
      case 'LECTURE_HALL': return <Building2 size={16} />;
      case 'LAB': return <Server size={16} />;
      case 'MEETING_ROOM': return <Armchair size={16} />;
      case 'EQUIPMENT': return <PenTool size={16} />;
      default: return <Building2 size={16} />;
    }
  };

  const getStatusBadge = () => {
    if (status === 'ACTIVE') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-green-50 text-green-700 rounded-full border border-green-200">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          ACTIVE
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 rounded-full border border-red-200">
        <CircleAlert size={12} className="text-red-600" />
        OUT OF SERVICE
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 mb-2">
            {getTypeIcon()}
            <span className="text-xs font-bold uppercase tracking-widest">{type?.replace('_', ' ')}</span>
          </div>
          <h3 className="text-lg font-black text-gray-900 leading-tight">{name}</h3>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin size={16} className="text-gray-400" />
          <span className="text-sm font-medium">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Users size={16} className="text-gray-400" />
          <span className="text-sm font-medium">Capacity: {capacity}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
        <button
          onClick={() => onBook(id)}
          disabled={status !== 'ACTIVE'}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Book Now
        </button>
        
        {userRole === 'admin' && (
          <>
            <button
              onClick={() => onEdit(resource)}
              className="px-3 py-2.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors text-sm font-bold border border-gray-100 hover:border-teal-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(id)}
              className="px-3 py-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold border border-gray-100 hover:border-red-100"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;
