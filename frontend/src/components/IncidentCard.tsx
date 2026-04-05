import React from 'react';
import { AlertTriangle, MapPin, Users, Car, Clock, Navigation, BrainCircuit, Activity } from 'lucide-react';
import type { Incident } from '../types';
import { getImageUrl } from '../services/apiService';

// Helper function to format vehicle breakdown neatly
const renderVehicleTypes = (dict: Record<string, number> | null) => {
    if (!dict || Object.keys(dict).length === 0) return null;
    return Object.entries(dict).map(([type, count]) => `${count} ${type}`).join(", ");
};

const IncidentCard: React.FC<{ incident: Incident }> = ({ incident }) => {
  const isCritical = incident.severity === 'Critical' || incident.severity === 'High';

  // Extract variables
  const confidencePercent = Math.round((incident.accidentConfidence || 0) * 100);

  return (
    <div className={`glass-card p-5 relative overflow-hidden transition-all hover:border-slate-500/50 ${
      isCritical ? 'border-red-600/30' : 'border-border'
    }`}>
      {isCritical && (
        <div className="absolute top-0 right-0 p-3 flex space-x-1">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center space-x-1.5">
            <span>{incident.cameraName}</span>
          </h3>
          <p className="text-sm text-slate-400 flex items-center space-x-1 mt-0.5">
            <MapPin size={12} className="text-slate-500" />
            <span>{incident.locationName}</span>
          </p>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded font-bold ${
          isCritical ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'
        }`}>
          {incident.severity?.toUpperCase() || "UNKNOWN"}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5 mb-4">
        {/* Image Snapshot */}
        {incident.imageUrl ? (
          <div className="w-full xl:w-48 h-32 flex-shrink-0 group relative overflow-hidden rounded-lg shadow-inner border border-border">
            <img 
              src={getImageUrl(incident.imageUrl) || ""} 
              alt="Accident snapshot"
              className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white font-medium uppercase tracking-wider">Scene Captured</span>
            </div>
          </div>
        ) : (
           <div className="w-full xl:w-48 h-32 flex-shrink-0 bg-slate-800 rounded-lg flex items-center justify-center border border-border">
             <AlertTriangle className="text-slate-600" />
           </div>
        )}

        {/* Dynamic Analytics Area */}
        <div className="flex-1 text-sm space-y-3">
            {/* Intelligent Confidence Row */}
            <div className="flex flex-wrap items-center gap-2">
                 <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800/80 rounded border border-slate-700">
                     <BrainCircuit size={12} className="text-indigo-400"/>
                     <span className="text-slate-200 text-xs font-semibold">Incident Score: {confidencePercent}%</span>
                 </div>
                 {incident.confirmationRuleTriggered && (
                     <span className="text-[10px] text-slate-500 tracking-wide font-mono uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                         {incident.confirmationRuleTriggered.replace(/_/g, " ")}
                     </span>
                 )}
            </div>

            {/* Subgrid splits Actual vs Estimates */}
            <div className="grid grid-cols-2 gap-3 text-xs w-full">
                {/* Panel 1: Actuals */}
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-700/50 space-y-1.5">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Live Detection</h4>
                   <div className="flex items-center justify-between text-slate-300">
                       <span className="flex items-center gap-1"><Users size={12} className="text-blue-400" /> Zone Humans:</span>
                       <span className="font-bold text-slate-100">{incident.incidentZoneHumanCount || 0}</span>
                   </div>
                   <div className="flex items-center justify-between text-slate-300">
                       <span className="flex items-center gap-1"><Car size={12} className="text-emerald-400" /> Involved Veh:</span>
                       <span className="font-bold text-slate-100">{incident.involvedVehicleCount || 0}</span>
                   </div>
                   <div className="text-[10px] text-emerald-500/80 truncate pt-1 border-t border-slate-800 mt-1" title={renderVehicleTypes(incident.involvedVehicleCountsByType) || "None"}>
                       [ {renderVehicleTypes(incident.involvedVehicleCountsByType) || "None"} ]
                   </div>
                </div>

                {/* Panel 2: Estimates */}
                <div className="bg-orange-950/20 p-2.5 rounded-lg border border-orange-900/30 space-y-1.5">
                   <h4 className="text-[10px] font-bold text-orange-500/70 uppercase tracking-wider mb-2">AI Estimates</h4>
                   <div className="flex justify-between items-center text-orange-200/80">
                       <span>Occupants:</span>
                       <span className="font-mono text-[10px]">{incident.estimatedTotalOccupantsMin || 0}-{incident.estimatedTotalOccupantsMax || 0}</span>
                   </div>
                   <div className="flex justify-between items-center text-orange-200 font-bold border-t border-orange-900/40 pt-1 mt-1">
                       <span>Affected People:</span>
                       <span className="text-orange-400">~{incident.estimatedTotalAffectedMidpoint || 0}</span>
                   </div>
                   <div className="text-[9px] text-orange-500/50 pt-0.5" title="Estimation method">
                       (via vehicle heuristics)
                   </div>
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-border mt-1">
         <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-mono italic">
             <Clock size={10} />
             <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
         </div>
         <div className="flex space-x-2">
             <div className="hidden sm:flex px-2 py-1 bg-slate-800 text-slate-400 text-[10px] rounded items-center space-x-1">
                  <Activity size={10} />
                  <span>Global Scene: {incident.visibleHumanCount || incident.humanCount || 0}H, {incident.totalVehicleCount || incident.vehicleCount || 0}V</span>
             </div>
             <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold bg-blue-900/20 px-3 py-1 rounded transition duration-200"
              >
                <Navigation size={12} />
                <span>NAVIGATE</span>
              </a>
         </div>
      </div>
    </div>
  );
};

export default IncidentCard;
