import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { createIncident, getIncidents, getIncidentById, fetchStats } from '../controllers/incidentController';

const router = Router();

// ─── Storage ──────────────────────────────────────────────────────────────────
// Use Cloudinary when credentials are present (production / Render),
// fall back to local disk for local development.
const hasCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let storage: multer.StorageEngine;

if (hasCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
      folder: 'visionguard-incidents',
      format: 'jpg',
      public_id: `incident-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
  });
  console.log('📸 Image storage: Cloudinary (production)');
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
  console.log('📸 Image storage: local disk (development)');
}

const upload = multer({ storage });

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post('/', upload.single('image'), createIncident);
router.get('/', getIncidents);
router.get('/stats', fetchStats); // Must be before /:id
router.get('/:id', getIncidentById);

export default router;
