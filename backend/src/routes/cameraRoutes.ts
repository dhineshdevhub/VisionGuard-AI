import { Router } from 'express';
import { getCameras, createCamera } from '../controllers/cameraController';

const router = Router();

router.get('/', getCameras);
router.post('/', createCamera);

export default router;
