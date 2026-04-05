import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createIncident, getIncidents, getIncidentById, fetchStats } from '../controllers/incidentController';

const router = Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), createIncident);
router.get('/', getIncidents);
router.get('/stats', fetchStats); // Need to place before /:id mapping
router.get('/:id', getIncidentById);

export default router;
