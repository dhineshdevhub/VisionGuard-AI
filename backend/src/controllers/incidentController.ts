import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { broadcastIncident } from '../services/socketService';
import { getStats } from '../services/statsService';

export const createIncident = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Parse JSON strings if necessary based on multer
    const parseJson = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

    let vehicleCountsByType = data.vehicleCountsByType ? parseJson(data.vehicleCountsByType) : null;
    let involvedVehicleCountsByType = data.involvedVehicleCountsByType ? parseJson(data.involvedVehicleCountsByType) : null;

    const payload = {
      eventId: data.eventId,
      cameraId: data.cameraId,
      cameraName: data.cameraName,
      locationName: data.locationName,
      roadName: data.roadName || null,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      
      accidentDetected: data.accidentDetected === 'true' || data.accidentDetected === true,
      accidentConfidence: parseFloat(data.accidentConfidence),
      
      // Legacy backwards-compatibility
      humanCount: parseInt(data.visibleHumanCount) || parseInt(data.humanCount) || 0,
      vehicleCount: parseInt(data.totalVehicleCount) || parseInt(data.vehicleCount) || 0,
    
      // Advanced Analytics: Actuals
      visibleHumanCount: parseInt(data.visibleHumanCount) || 0,
      incidentZoneHumanCount: parseInt(data.incidentZoneHumanCount) || 0,
      totalVehicleCount: parseInt(data.totalVehicleCount) || 0,
      vehicleCountsByType: vehicleCountsByType,
      involvedVehicleCount: parseInt(data.involvedVehicleCount) || 0,
      involvedVehicleCountsByType: involvedVehicleCountsByType,
      
      // Advanced Analytics: Estimates
      estimatedTotalOccupantsMin: parseInt(data.estimatedTotalOccupantsMin) || 0,
      estimatedTotalOccupantsMax: parseInt(data.estimatedTotalOccupantsMax) || 0,
      estimatedTotalOccupantsMidpoint: parseInt(data.estimatedTotalOccupantsMidpoint) || 0,
      estimatedTotalAffectedMin: parseInt(data.estimatedTotalAffectedMin) || 0,
      estimatedTotalAffectedMax: parseInt(data.estimatedTotalAffectedMax) || 0,
      estimatedTotalAffectedMidpoint: parseInt(data.estimatedTotalAffectedMidpoint) || 0,

      // Flags
      incidentScore: parseFloat(data.incidentScore) || 0.0,
      confirmationRuleTriggered: data.confirmationRuleTriggered || null,

      severity: data.severity,
      severityScore: parseFloat(data.severityScore),
      emergencyAlert: data.emergencyAlert === 'true' || data.emergencyAlert === true,
    };

    const newIncident = await prisma.incident.create({
      data: payload,
    });

    // Broadcast new incident right away
    broadcastIncident(newIncident);

    res.status(201).json({ success: true, incident: newIncident });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    res.status(500).json({ success: false, error: 'Failed to create incident', details: error.message || error });
  }
};

export const getIncidents = async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50');
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
};

export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
    });
    if (!incident) {
       return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
};

export const fetchStats = async (req: Request, res: Response) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};
