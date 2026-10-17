import { Router } from 'express';
import { getSummary, getMapLayers } from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/summary', getSummary);
router.get('/map-layers', getMapLayers);

export default router;
