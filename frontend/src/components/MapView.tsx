import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Incident } from '../types';
import { getImageUrl } from '../services/apiService';
import StatusBadge from './StatusBadge';
import { Navigation } from 'lucide-react';

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CriticalIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to handle map center updates
const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface MapViewProps {
  incidents: Incident[];
  activeIncidentId?: string | null;
}

const MapView: React.FC<MapViewProps> = ({ incidents, activeIncidentId }) => {
  const defaultCenter: [number, number] = [11.0168, 76.9558]; // Default to project's static location
  
  // Find active incident location or use first incident
  const activeIncident = incidents.find(i => i.id === activeIncidentId) || incidents[0];
  const center: [number, number] = activeIncident 
    ? [activeIncident.latitude, activeIncident.longitude] 
    : defaultCenter;

  return (
    <div className="h-full w-full map-container panel-container p-1 overflow-hidden relative group">
      {/* HUD Info Overlay */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
         <div className="glass-morphism p-3 rounded-xl space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Deployment Map</h4>
            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">Active Monitoring Nodes: {incidents.length}</p>
         </div>
      </div>

      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl"
        zoomControl={false}
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.latitude, incident.longitude]}
            icon={incident.severity === 'Critical' ? CriticalIcon : DefaultIcon}
          >
            <Popup closeButton={false} minWidth={220} className="premium-popup">
              <div className="p-3 bg-[#0d0f14] text-slate-300 rounded-xl space-y-3 border border-white/5">
                <div className="flex justify-between items-start">
                   <div className="space-y-0.5">
                      <h3 className="font-bold text-sm text-white">{incident.cameraName}</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{incident.locationName}</p>
                   </div>
                   <StatusBadge status={incident.severity} />
                </div>
                
                {incident.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-white/10 h-24">
                        <img 
                            src={getImageUrl(incident.imageUrl) || ""} 
                            alt="Incident Snapshot"
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                   <div className="flex items-center space-x-1">
                      <span className="text-[9px] font-mono text-slate-500">{new Date(incident.createdAt).toLocaleTimeString()}</span>
                   </div>
                   <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-[10px] text-accent font-black tracking-widest uppercase hover:text-white transition-colors"
                  >
                    <Navigation size={10} />
                    <span>Route</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Decorative Scanline */}
      <div className="absolute inset-x-0 h-[2px] bg-accent/20 z-[400] blur-sm animate-scan pointer-events-none opacity-20" />
    </div>
  );
};

export default MapView;
