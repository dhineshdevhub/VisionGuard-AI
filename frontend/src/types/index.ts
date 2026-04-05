export interface Incident {
  id: string;
  eventId: string;
  cameraId: string;
  cameraName: string;
  locationName: string;
  roadName: string | null;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  accidentDetected: boolean;
  accidentConfidence: number;
  incidentScore: number;
  confirmationRuleTriggered: string | null;
  
  // Legacy / Default fields
  humanCount: number;
  vehicleCount: number;
  
  // Advanced Analytics: Actuals
  visibleHumanCount: number;
  incidentZoneHumanCount: number;
  totalVehicleCount: number;
  vehicleCountsByType: Record<string, number> | null;
  involvedVehicleCount: number;
  involvedVehicleCountsByType: Record<string, number> | null;
  
  // Advanced Analytics: Estimates
  estimatedTotalOccupantsMin: number;
  estimatedTotalOccupantsMax: number;
  estimatedTotalOccupantsMidpoint: number;
  
  estimatedTotalAffectedMin: number;
  estimatedTotalAffectedMax: number;
  estimatedTotalAffectedMidpoint: number;
  
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  severityScore: number;
  emergencyAlert: boolean;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface Stats {
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  totalHumansDetected: number;
  totalVehiclesDetected: number;
}
