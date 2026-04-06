import React from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Users, 
  Car, 
  Clock, 
  Navigation, 
  BrainCircuit, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import type { Incident } from '../types';
import { getImageUrl } from '../services/apiService';
import StatusBadge from './StatusBadge';

interface IncidentCardProps {
  incident: Incident;
  isSelected?: boolean;
  onClick?: () => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, isSelected, onClick }) => {
  const confidencePercent = Math.round((incident.accidentConfidence || 0) * 100);
  
  return (
    <div 
      onClick={onClick}
      className={`group relative panel-container p-4 transition-all cursor-pointer hover:border-accent/40 ${
        isSelected ? 'border-accent ring-1 ring-accent/20 bg-accent/[0.02]' : 'bg-[#0d0f14]'
      }`}
    >
      {/* Top Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
           <div className={`p-2 rounded-xl border ${isSelected ? 'bg-accent/10 border-accent/30' : 'bg-surface border-white/5'}`}>
              <ShieldAlert className={isSelected ? 'text-accent' : 'text-slate-500'} size={20} />
           </div>
           <div className="min-w-0">
              <h3 className="text-sm font-black text-white truncate max-w-[150px] uppercase tracking-tight leading-none">{incident.cameraName}</h3>
              <div className="flex items-center space-x-1.5 mt-1 opacity-60">
                <MapPin size={10} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate max-w-[120px]">{incident.locationName}</span>
              </div>
           </div>
        </div>
        <StatusBadge status={incident.severity} />
      </div>

      {/* Main Content: Side-by-Side Flex */}
      <div className="flex items-stretch gap-4 mb-4">
          {/* Visual Snapshot */}
          <div className="w-24 h-24 flex-shrink-0 relative rounded-xl overflow-hidden border border-white/10 group-hover:border-accent/30 bg-black/40">
            {incident.imageUrl ? (
              <img 
                src={getImageUrl(incident.imageUrl) || ""} 
                alt=""
                crossOrigin="anonymous"
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-1 opacity-20">
                 <AlertCircle size={20} />
                 <span className="text-[7px] font-black uppercase">NO_SIGNAL</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* AI Metrics Column */}
          <div className="flex-1 flex flex-col justify-between py-0.5">
             {/* Confidence Bar Container */}
             <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-1.5">
                      <BrainCircuit size={12} className="text-accent" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Detection Identity</span>
                   </div>
                   <span className="text-[11px] font-mono font-black text-accent">{Math.min(confidencePercent, 100)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-accent shadow-[0_0_8px_rgba(0,242,255,0.5)] transition-all duration-1000" 
                      style={{ width: `${Math.min(confidencePercent, 100)}%` }} 
                   />
                </div>
             </div>

             {/* Impact Stats Row */}
             <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg py-2 flex flex-col items-center justify-center">
                   <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Impacted</span>
                   <span className="text-xs font-black text-white">{incident.estimatedTotalAffectedMidpoint || 0}</span>
                </div>
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg py-2 flex flex-col items-center justify-center">
                   <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Involved</span>
                   <span className="text-xs font-black text-white">{incident.involvedVehicleCount || 0}</span>
                </div>
             </div>
          </div>
      </div>

      {/* Footer Area */}
      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
           <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-1.5 opacity-60">
                 <Clock size={10} />
                 <span>{new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="opacity-20">|</span>
              <span className="text-[9px] font-black uppercase tracking-tight text-slate-500 truncate max-w-[80px]">
                {incident.confirmationRuleTriggered || 'STANDARD_SCAN'}
              </span>
           </div>

           <div className="flex items-center gap-2">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-1.5 px-3 rounded-lg flex items-center gap-2 group/btn transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Navigation size={12} className="text-accent" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Route</span>
              </a>
              <div className="p-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent">
                 <ChevronRight size={14} />
              </div>
           </div>
      </div>
    </div>
  );
};

export default IncidentCard;
