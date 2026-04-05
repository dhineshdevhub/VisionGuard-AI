import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Incident } from '../types';
import { getImageUrl } from '../services/apiService';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const IncidentIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapViewProps {
  incidents: Incident[];
  center?: [number, number];
}

const MapView: React.FC<MapViewProps> = ({ incidents, center = [11.0, 77.0] }) => {
  return (
    <div className="map-container relative z-10 glass-card p-2">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.latitude, incident.longitude]}
            icon={IncidentIcon}
          >
            <Popup className="incident-popup">
              <div className="p-1 space-y-2 min-w-[150px]">
                <h3 className="font-bold border-b border-gray-100 pb-1">{incident.cameraName}</h3>
                {incident.imageUrl && (
                    <img 
                        src={getImageUrl(incident.imageUrl) || ""} 
                        alt="Accident scene"
                        className="w-full h-24 object-cover rounded-md mb-2 shadow-sm"
                    />
                )}
                <p className="text-xs text-gray-600">Location: {incident.locationName}</p>
                <div className="flex justify-between items-center bg-gray-50 p-1 rounded">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    incident.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                    incident.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {incident.severity}
                  </span>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                    target="_blank"
                    className="text-[10px] text-blue-600 font-medium hover:underline bg-blue-50 px-2 py-0.5 rounded"
                  >
                    Navigate
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
