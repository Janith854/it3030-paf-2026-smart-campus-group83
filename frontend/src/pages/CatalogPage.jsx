import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School,
  Users,
  Monitor,
  X,
  Info,
  MapPin,
  Cpu,
  Printer,
  Video,
  Wifi,
  Wind,
  ShieldCheck,
  Zap,
  Mic,
  Camera,
  Layers,
  Settings2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CategoryCard from '../components/CategoryCard';
import SubCategoryCard from '../components/SubCategoryCard';

const CatalogPage = ({ setPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const categories = [
    {
      id: 'lecturer-halls',
      title: 'Lecturer Halls',
      description: 'Spacious halls equipped for large-scale academic presentations and interactive learning.',
      icon: <School size={28} />,
      subcategories: [
        { id: 1, name: 'Lecturer Hall with Multimedia Projector', icon: <Video size={18} /> },
        { id: 2, name: 'Lecturer Hall with Recording Cameras', icon: <Camera size={18} /> },
        { id: 3, name: 'Lecturer Hall with Smart Screen', icon: <Monitor size={18} /> },
        { id: 4, name: 'Lecturer Hall with All Equipment', icon: <Layers size={18} /> },
      ]
    },
    {
      id: 'meeting-rooms',
      title: 'Meeting Rooms',
      description: 'Professional spaces designed for collaborative meetings, workshops, and executive discussions.',
      icon: <Users size={28} />,
      subcategories: [
        { id: 5, name: 'Meeting Room with Projector', icon: <Zap size={18} /> },
        { id: 6, name: 'Meeting Room with Video Conferencing', icon: <Mic size={18} /> },
        { id: 7, name: 'Meeting Room with Smart Screen', icon: <Monitor size={18} /> },
        { id: 8, name: 'Meeting Room with all Equipments', icon: <Layers size={18} /> },
      ]
    },
    {
      id: 'lab-halls',
      title: 'LAB Halls',
      description: 'Specialized laboratories with cutting-edge technology for practical research and development.',
      icon: <Monitor size={28} />,
      subcategories: [
        { id: 9, name: 'LAB Room with Projector ', icon: <Cpu size={18} /> },
        { id: 10, name: 'LAB Room with Smart Screen', icon: <Wifi size={18} /> },
        { id: 11, name: 'LAB Room with Video Conferencing', icon: <Monitor size={18} /> },
        { id: 12, name: 'LAB Room with All Equipments', icon: <Zap size={18} /> },
      ]
    }
  ];

  const filteredCategories = categories.map(cat => ({
    ...cat,
    subcategories: cat.subcategories.filter(sub =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.subcategories.length > 0 || cat.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSubCategoryClick = (sub) => {
    setSelectedSubCategory(sub);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex">
      <Sidebar />

      <div className="flex-1">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="p-8 ml-64 overflow-y-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Facility Catalog</h1>
            <p className="text-gray-500">Manage and explore university halls, meeting rooms, and specialized laboratories.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isExpanded={expandedCategory === category.id}
                onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                {category.subcategories.map((sub) => (
                  <SubCategoryCard
                    key={sub.id}
                    subcategory={sub}
                    onClick={() => handleSubCategoryClick(sub)}
                  />
                ))}
              </CategoryCard>
            ))}

            {filteredCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">No facilities found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-primary font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SubCategory Detail Modal */}
      <AnimatePresence>
        {selectedSubCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSubCategory(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative overflow-hidden"
            >
              <div className="h-32 bg-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full -ml-12 -mb-12" />
                <button
                  onClick={() => setSelectedSubCategory(null)}
                  className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
                <div className="absolute -bottom-8 left-8 p-4 bg-white rounded-3xl shadow-lg border border-gray-100 flex items-center justify-center text-primary">
                  {selectedSubCategory.icon}
                </div>
              </div>

              <div className="p-8 pt-12">
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-2">
                  <Info size={14} />
                  <span>Location Details</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedSubCategory.name}</h2>
                <div className="space-y-4 mb-8">
                  <p className="text-gray-600 leading-relaxed text-sm">
                    This facility is optimized for high-performance usage and integrated with modern university infrastructure. It includes standard seating, high-speed internet, and climate control.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPage('filter')} className="flex items-center gap-3 text-gray-500 bg-gray-50 p-3 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all text-left">
                      <MapPin size={18} className="text-primary/70" />
                      <span className="text-xs font-medium">Main Building</span>
                    </button>
                    <button onClick={() => setPage('filter')} className="flex items-center gap-3 text-gray-500 bg-gray-50 p-3 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all text-left">
                      <MapPin size={18} className="text-primary/70" />
                      <span className="text-xs font-medium">New Building</span>
                    </button>
                    <button onClick={() => setPage('filter')} className="flex items-center gap-3 text-gray-500 bg-gray-50 p-3 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all text-left">
                      <MapPin size={18} className="text-primary/70" />
                      <span className="text-xs font-medium">Business Building</span>
                    </button>
                    <button onClick={() => setPage('filter')} className="flex items-center gap-3 text-gray-500 bg-gray-50 p-3 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all text-left">
                      <MapPin size={18} className="text-primary/70" />
                      <span className="text-xs font-medium">Engineering Building</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setPage('filter')}
                    className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    NEXT
                  </button>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CatalogPage;
