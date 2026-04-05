import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getCameras = async (req: Request, res: Response) => {
  try {
    const cameras = await prisma.camera.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cameras' });
  }
};

export const createCamera = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newCamera = await prisma.camera.create({
      data: {
        name: data.name,
        locationName: data.locationName,
        roadName: data.roadName,
        latitude: data.latitude,
        longitude: data.longitude,
        streamUrl: data.streamUrl,
      },
    });
    res.status(201).json(newCamera);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create camera' });
  }
};
