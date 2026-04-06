import React from 'react';
import { Map as MapIcon, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center p-1 bg-surface border border-white/5 rounded-xl shadow-lg">
      <button
        onClick={() => onViewChange('map')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          view === 'map' 
            ? 'bg-accent/10 border border-accent/20 text-accent shadow-glow/5' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <MapIcon size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Map View</span>
      </button>
      <div className="w-px h-4 bg-white/5 mx-1" />
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          view === 'list' 
            ? 'bg-accent/10 border border-accent/20 text-accent shadow-glow/5' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <List size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Feed List</span>
      </button>
    </div>
  );
};

export default ViewToggle;
