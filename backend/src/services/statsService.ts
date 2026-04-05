import { prisma } from '../lib/prisma';

export const getStats = async () => {
  const totalIncidents = await prisma.incident.count();
  
  const activeIncidents = await prisma.incident.count({
    where: { status: 'active' }
  });

  const criticalIncidents = await prisma.incident.count({
    where: { severity: 'High' } // Or whatever string defines critical
  });

  const allIncidents = await prisma.incident.findMany({
    select: {
      humanCount: true,
      vehicleCount: true,
    }
  });

  let totalHumans = 0;
  let totalVehicles = 0;
  
  for (const inc of allIncidents) {
    totalHumans += inc.humanCount;
    totalVehicles += inc.vehicleCount;
  }

  return {
    totalIncidents,
    activeIncidents,
    criticalIncidents,
    totalHumansDetected: totalHumans,
    totalVehiclesDetected: totalVehicles
  };
};
